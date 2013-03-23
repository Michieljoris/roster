/*global $:false Pouch:false emit:false logger:false define:false  VOW:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

define
({  inject : [],
    factory: function() {
        "use strict";
        var log = logger('db_utils');
        
        function openDB(dbs) {
            var vow = VOW.make();
            var db = dbs.db;
            new Pouch(db.url, function(err, newDB) {
                if (err) {
                    var text =  err.statusText ?
                        err.statusText : err.reason ?
                        err.reason : err.status;
                    dbs.error.push("Can't open database " + db.url);
                    dbs.error.push('Reason: ' + text);
                    vow['break'](dbs);
                }
                else {
                    dbs.log.push('Loaded ' + db.url);
                    db.handle = newDB;
                    vow.keep();   
                }
            });
            return vow.promise;
        }


        var queryFun = {
            map: function(doc) {
                if (doc._conflicts && doc._conflicts.length > 0) {
                    emit(doc);
                    // emit(doc, (doc._conflicts));
                }
            }
        };
    
        function getOpenRevs(db, id) {
            var vow = VOW.make(); 
            if (db.error) {
                vow.keep(db);
            }
            else db.handle.get(id, { open_revs: "all" }, function(err, res) {
                if (err) {
                    err.error = true;
                    err.operation = 'get open_revs';
                    vow.keep(err) ;
                }
                else {
                    var result = { id:id,
                                   conflictingRevs: res.map(function(r) {
                                       return r.ok;})
                                 };
                    vow.keep(result);
                }
            }); 
            return vow.promise;
        }
    
        function getConflicts(db) {
            var vow = VOW.make();
            if (db.error) vow.keep(db);
            else {
                if (!db.docsWithConflicts) db.docsWithConflicts = [];
                var openRevs = db.docsWithConflicts.map(function(d) {
                    return getOpenRevs(db, d._id);
                });
                VOW.any(openRevs).when(
                    function(arr) {
                        vow.keep({ db: db.url, docsWithConflicts: arr});
                        // log.d(arr); 
                    }
                );
            }
            return vow.promise;
        }

        function checkConflicts(db) {
            var vow = VOW.make();
            db.handle.query(queryFun, {reduce: false, conflicts: true}, function(err, res) {
                if (err) {
                    err.operation = 'Looking for documents with conflicts';
                    err.url = db.url;
                    err.error = true;
                    vow.keep(err);
                }
            
                else {
                    if (res && res.rows.length > 0) {
                        db.docsWithConflicts = res.rows.map(
                            function(d) {
                                return d.key;
                            }
                        );
                    }
                    else db.docsWithConflicts = [];
                    vow.keep(db);
                }
            });
            return vow.promise;
        
        }
    

        function gatherConflicts(dbs) {
            dbs = dbs.map(function(db) {
                return checkConflicts(db);
            });
            return VOW.any(dbs).when(
                function(arr) {
                    // log.d(arr);
                    arr = arr.map(function(db) {
                        return getConflicts(db);
                    });
                    return VOW.any(arr);
                }
            );
            //     .when(
            //     function(arr) {
            //         console.log(arr);
            //     },
            //     function(err) {
            //         pp(err);
            //     }
            // );
        
        }
        
        function get(url) {
           var vow = VOW.make(); 
            // var url = 'idb://db';
            var dbs = {
                db: { url: url}
                ,log: []
                ,error: []
            };
            
            openDB(dbs, 'db').when(
                function() {
                    return gatherConflicts([dbs.db]);
                }
            ).when(
                function(arr) {
                    vow.keep(arr);
                    // log.d(arr);
                    // log.d(dbs.log);
                }
                ,function(err) {
                    // log.d(err);
                    // log.d('log ', dbs.log);
                    // log.d('error ', dbs.error);
                    vow['break'](err);
                }
            );
            return vow.promise;
        }
        
        function init() {
            
        }
        
        function destroy(url) {
            var vow = VOW.make();
            Pouch.destroy(url, function(err, info) {
                if (err) vow['break'](err);
                else vow.keep(info);
            });
            return vow.promise;
        }
        
        function getAllDbs(url) {
            var vow = VOW.make();
            if (url.startsWith('idb') &&
                window.webkitIndexedDB &&
                window.webkitIndexedDB.webkitGetDatabaseNames) {
                //only works in chrome ..
                var dbNames = window.webkitIndexedDB.webkitGetDatabaseNames();
                dbNames.onsuccess = function(event) {
                    var list = event.target ? event.target.result : [];
                    list = list || [];
                    var values = [];
                    var length = list.length || 0;
                    for (var i = 0; i < length; i++){
                        if (typeof list[i] === 'string' && list[i][0] !== '_')
                            values.push(list[i]);
                    }
                    vow.keep(values);
                };
            } 
            else {
                if (url.endsWith('/')) url = url.slice(0, url.length-1);
                $.ajax(url + '/_all_dbs', {
                    success: function (result) {
                        var dbNames = [];   
                        try {
                            result = JSON.parse(result);
                        } catch(e) {
                            log.e('JSON parse error ', e);
                            result = [];
                        }
                        for (var i = 0; i < result.length; i++){
                            if (typeof result[i] === 'string' && result[i][0] !== '_')
                                dbNames.push(result[i]);
                        }
                        vow.keep(dbNames);
                    } 
                    ,error: function() {
                        // var err = '';
                        // log.d(arguments);
                        // vow['break'](err.statusCode + ':' + result.statusText);
                        log.d('ERROR');
                        vow['break']();
                    }   
                });
            } 
            return vow.promise;
            
        }
        
        function convertToDate(obj) {
            if (typeof obj === 'string') return new Date(obj);
            if (typeof obj === 'object' && obj._constructor === 'RelativeDate') {
                var value = obj.value ? obj.value : '';
                if (value.startsWith('$'))
                    switch (value) {
                      case '$today':  return new Date();
                      case '$yesterday': return new Date(new Date().getTime() - 24*60*60*1000);
                      case '$tomorrow': return new Date(new Date().getTime() + 24*60*60*1000);
                      case '$weekAgo': return new Date(new Date().getTime() - 7 * 24*60*60*1000);
                      case '$weekFromNow':return new Date(new Date().getTime() + 7 * 24*60*60*1000); 
                      case '$monthAgo': 
                      case '$monthFromNow': break;
                    default: log.e('Unknown date format' , obj.value.value);
                    }
                else {
                    //parse value
                    var sign = value[0] === '-' ? -1 : 1;
                    var periodLoc = value.indexOf('d');
                    if (periodLoc === -1) periodLoc = value.indexOf('w');
                    if (periodLoc === -1) periodLoc = value.indexOf('m');
                    var periodType = value[periodLoc];
                    var number = value.slice(1, periodLoc);
                    number = Number(number);
                    return new Date()
                    
                    
                }
            }
            return undefined;
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
        
        // function parseCriteria(doc, operator, key, value) {
             
        //     if ()
        // }

        return {
            init: init
            ,getConflicts: getConflicts
            ,destroy: destroy
            ,getAllDbs: getAllDbs
        };
    
    }
});