/*global logger:false $:false Pouch:false VOW:false Cookie:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:16 maxlen:150 devel:true newcap:false*/ 

(function() {
    "use strict";
    var log = logger('sync');
    
    function openDB(dbs, aDB, dblog) {
        var vow = VOW.make();
        var db = dbs[aDB];
        new Pouch(db.url, function(err, newDB) {
            if (err) {
                var text =  err.statusText ?
                    err.statusText : err.reason ?
                    err.reason : err.status;
                dblog.push("Can't open database " + db.url);
                dblog.push('Reason: ' + text);
                vow['break'](dbs);
            }
            else {
                dblog.push('Opened ' + db.url);
                db.handle = newDB;
                vow.keep();   
            }
        });
        return vow.promise;
    }
    


    function replicate(dbs, direction, filter, dblog) {
        log.d('Replicating!!!');
        var vow = VOW.make();
        var db1 = direction === 'BtoA' ? dbs.b: dbs.a;
        var db2 = direction === 'BtoA' ? dbs.a: dbs.b;
        filter = { filter: filter };
        try {
            db1.handle.replicate.to(db2.handle, filter, function(err, changes) {
                log.d('Finished replicating');
                if (err) {
                    dblog.push( ['Replicating from ' + db1.url + ' to ' +
                                 db2.url + ' produced errors: ' + err]);
                    vow['break'](dbs);
                }
                else {
                    db1.to =  db2.url;
                    db2.from =  db1.url;
                    dblog.push(['' + db1.url + ' --> ' + db2.url,
                                '\nDocs read: ' + changes.docs_read, 
                                '\n Docs written: ' + changes.docs_written]);
                    vow.keep(dbs);
                }
            
            });
        } catch(e) {
            log.d('hello', e);
        }
        
        return vow.promise;
    }
    
    function sync(dbs, filter, dblog) {
        log.d('Syncing!!!');
        var vow = VOW.make();
        replicate(dbs, 'AtoB', filter, dblog).when(
            function (dbs) {
                return replicate(dbs, 'BtoA', filter, dblog);
            }
        ).when(
            function (dbs) {
                vow.keep(dbs);
            }
            ,function(dbs) {
                vow['break'](dbs);
            }
        );
        return vow.promise;
    }
    
    
    function destroy(url) {
        var vow = VOW.make();
        Pouch.destroy(url, function(err, info) {
            log.d('DESTROY', arguments);
            if (err) vow['break'](err);
            else vow.keep(info);
        });
        return vow.promise;
    }
    
    
    function convertToDate(obj) {
        if (typeof obj === 'string') return new Date(obj);
        if (typeof obj === 'object' && obj._constructor === 'RelativeDate') {
            var value = obj.value ? obj.value : '';
            if (value.startsWith('$'))
                switch (value) {
                  case '$today':  return Date.today();
                  case '$yesterday': return Date.today().addDays(-1);
                  case '$tomorrow': return Date.today().addDays(1);
                  case '$weekAgo': return Date.today().addWeeks(-1);
                  case '$weekFromNow':return Date.today().addweeks(1);
                  case '$monthAgo': return Date.today().addMonths(-1);
                  case '$monthFromNow': return Date.today.addMonths(1);
                default: throw("Can't parse date!!!");
                    // log.e('Unknown date format' , obj.value.value);
                }
            else {
                //parse value
                var periodLoc = value.indexOf('d');
                if (periodLoc === -1) periodLoc = value.indexOf('w');
                if (periodLoc === -1) periodLoc = value.indexOf('m');
                var periodType = value[periodLoc];
                var multiplier = value.slice(0, periodLoc);
                multiplier = Number(multiplier);
                var resultDate = Date.today();
                switch (periodType)  {
                  case 'd':
                    resultDate = resultDate.addDays(multiplier);
                    break;
                  case 'w': 
                    resultDate = resultDate.addWeeks(multiplier);
                    break;
                  case 'm':
                    resultDate = resultDate.addMonths(multiplier);
                    break;
                default : throw("Can't parse date!!!");
                }
                return resultDate;
            }
        }
        throw("Can't parse date!!!");
        // return undefined;
    }
        
        
    function evaluate(doc, clause) {
        var i, date, field, startDate, endDate;
        switch(clause.operator) {
              case 'and':
                for (i = 0; i < clause.criteria.length; i++) {
                    if (!evaluate(doc, clause.criteria[i])) return false;
                }
            return true;   
          case 'or':
            for (i = 0; i < clause.criteria.length; i++) {
                if (evaluate(doc, clause.criteria[i])) return true;
            }
            return false;   
          case 'not': 
            for (i = 0; i < clause.criteria.length; i++) {
                if (evaluate(doc, clause.criteria[i])) return false;
            }
            return true;
          case 'equals':
            if (doc[clause.fieldName] === clause.value) return true;
            return false;
          case 'notEqual': 
            if (doc[clause.fieldName] !== clause.value) return true;
            return false;
          case 'inSet': 
            if (clause.value.indexOf(doc[clause.fieldName]) === -1) return false;
            return true;
          case 'notInSet': 
            if (clause.value.indexOf(doc[clause.fieldName]) === -1) return true;
            return false;
          case 'iContains': 
            if (doc[clause.fieldname] && typeof doc[clause.fieldname] === 'string' && clause.value &&
                typeof clause.value === 'string' &&
                doc[clause.fieldName].toLowerCase().contains(clause.value.toLowerCase())) {
                return true;
            }
            return false;
          case 'greaterThan':
            date = convertToDate(clause.value);
            field = doc[clause.fieldname]; //make sure it is a Date object
            if (date && field && field.getTime() >= date.getTime()) return true;
            return false;
          case 'lessThan': 
            date = convertToDate(clause.value);
            field = doc[clause.fieldname]; //make sure it is a Date object
            if (date && field && field.getTime() <= date.getTime()) return true;
            return false;
          case 'between':
            startDate = convertToDate(clause.start);
            endDate = convertToDate(clause.end);
            field = doc[clause.fieldname]; //make sure it is a Date object
            if (startDate && endDate && field &&
                field.getTime() >= startDate.getTime() &&
                field.getTime() <= endDate.getTime() 
               ) return true;
            return false;
        default: log.e('Operator not yet implemented', clause.operator);
        }
        return false;
    }
    
    
    function execute(repRule, dblog) {
        // if (repRule.operation === 'replace') {
        //     return destroy(dbs.b.url).when(
        //         function() {
        //             // log.d(info);
        //             dblog.push('Destroyed: ' + dbs.b.url);
        //             repRule.operation = 'replicate';
        //             return  execute(repRule, dblog);
        //             // return replicate(dbs, 'AtoB', filter, dblog);
        //         }
        //         ,function(err) {
        //             log.d('Failed to destroy!!', err);
        //             return VOW.broken(err);
        //         }
        //     );
            
        // }
        // else {
        var dbs = {
            // a: { url: localUrl, adapter: { adapter: 'idb'}}
            // ,b: { url: remoteUrl, adapter: { adapter: 'http'}}
            a: { url: repRule.from}
            ,b: { url: repRule.to}
        };
        // var d1 = 'January 10, 2012';
        // var d2 = 'January 10, 2014';
        
        var criteriaFilter = function (doc) {
            evaluate(doc, repRule.criteria);
            // var valid = doc.valid === true;
            // var date = Date.parse(doc.date);
            // date = new Date(date);
            // var isBetween = date.isBetween(d1, d2);
            // console.log(date, d1, d2, isBetween);
            // if (valid) console.log('Replicating: ' ,doc, req);
            // return valid;
            return true;
        };
        
        var filter;
        switch(repRule.filter) {
          case 'yes': filter = criteriaFilter; break;
          case 'function': filter = repRule.filterName; break;
        default: 
        }
        
        return VOW.every([
            openDB(dbs, 'a', dblog),
            openDB(dbs, 'b', dblog)
        ]).when(
            function() {
                log.d(dbs);
                switch (repRule.operation) {
                  case 'sync': return sync(dbs, filter, dblog);
                  case 'replicate': return replicate(dbs, 'AtoB', filter, dblog);
                    // case 'replace' : return replace(dbs, filter, dblog);
                  case 'inactive': dblog.push('Inactive operation'); return VOW.kept(); 
                default: dblog.push('Unknown operation: ' + repRule.operation);
                    return VOW.broken();
                }
            }
        );
            
        // }
    } 
    
    
    // function replace(dbs, filter, dblog) {
    //     log.d('Replacing!!!');
    //     destroy(dbs.b.url).when(
    //         function(info) {
    //             log.d(info);
    //             dblog.push('Destroyed: ' + dbs.b.url);
    //             return replicate(dbs, 'AtoB', filter, dblog);
    //         }
    //         ,function(err) {
    //             log.d('Failed to destroy!!');
    //             return VOW.broken(err);
    //         }
    //     );
    // }
    
    Cookie.get('sync').when(function(repRules) {
        repRules = JSON.parse(repRules);
        log.pp(repRules);
    
        Cookie.remove('sync');
        window.stop();
        // $.couch.urlPrefix='http://localhost:8090/local';
        
        var dblog = [];
        
        function iterate(i) {
            if (i < repRules.length)
                execute(repRules[i], dblog).when(
                    function() {
                        iterate(i+1);
                        // dblog.push(msg);
                        // $('#sync').html(dblog.join('<br>'));
                        // printConflicts(dbs);
                    },
                    function() {
                        iterate(i+1);
                        // dblog.push(msg);
                        // console.log(dblog);
                        // $('#sync').html(dblog.join('<br>'));
                        // printConflicts(dbs);
                    }
                );
            else {
                $('#sync').html(dblog.join('<br>'));               
                Cookie.set('replResult', dblog.join('<br>'));
                // location.reload();
            } 
        }
        iterate(0);
        // }
    });
    
})();
