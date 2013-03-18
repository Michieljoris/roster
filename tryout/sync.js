/*global emit:false logger:false $:false Pouch:false VOW:false Cookie:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

(function() {
    "use strict";
    var log = logger('sync');
    var testing = true;
    // var data;
    var localUrl, remoteUrl;
    
    function openDB(dbs, aDB) {
        var vow = VOW.make();
        var db = dbs[aDB];
        new Pouch(db.url, db.adapter, function(err, newDB) {
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


    function replicate(data, reverse, filter) {
        var vow = VOW.make();
        var db1 = reverse ? data.b: data.a;
        var db2 = reverse ? data.a: data.b;
        filter = { filter: filter };
        db1.handle.replicate.to(db2.handle, filter, function(err, changes) {
            if (err) {
                data.error = ['Replicating from ' + db1.url + ' to ' +
                              db2.url + ' produced errors: ' + err];
                vow['break'](data);
            }
            else {
                db1.to =  db2.url;
                db2.from =  db1.url;
                data.log = data.log.concat(['' + db1.url + ' --> ' + db2.url,
                                            '\nDocs read: ' + changes.docs_read, 
                                            '\n Docs written: ' + changes.docs_written]);
                vow.keep(data);
            }
            
        });
        return vow.promise;
    }
    
    function sync(dbs) {
        var d1 = 'January 10, 2012';
        var d2 = 'January 10, 2014';
        
        var filter = function (doc, req) {
            // var valid = doc.valid === true;
            // var date = Date.parse(doc.date);
            // date = new Date(date);
            // var isBetween = date.isBetween(d1, d2);
            // console.log(date, d1, d2, isBetween);
            // if (valid) console.log('Replicating: ' ,doc, req);
            // return valid;
            return true;
        };
        var vow = VOW.make();
        replicate(dbs, false, filter).when(
            function (dbs) {
                return replicate(dbs, 'reverse', filter);
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

    
    function printConflicts(dbs) {
        gatherConflicts([dbs.a, dbs.b]).when(
            function(arr) {
                console.log(arr);
            }
        );
        
    }
    
    
    function startSyncing() {
    var dbs = {
        a: { url: localUrl, adapter: { adapter: 'idb'}}
        ,b: { url: remoteUrl, adapter: { adapter: 'http'}}
        ,log: []
        ,error: []
    };
        VOW.every([
            openDB(dbs, 'a'),
            openDB(dbs, 'b')
        ]).when(
            function() {
                return sync(dbs);
            }
        ).when(
            function(dbs) {
                $('#sync').html(dbs.log.join('<br>'));
                printConflicts(dbs);
            },
            function(dbs) {
                console.log(dbs.error);
                $('#sync').html(dbs.error.join('<br>'));
                printConflicts(dbs);
            }
        );
    } 
    
    
    function parseCookie(cookie) {
        localUrl = 'idb://db';
        remoteUrl = 'http://p1:p1@localhost:8090/local/people';
    }
    
    var cookie = Cookie.get('sync');
    parseCookie(cookie);
    
    if (cookie || testing) {
        Cookie.remove('sync');
        window.stop();
        $.couch.urlPrefix='http://localhost:8090/local';
        startSyncing();
    }
    
    
    var reps = {
        rep: [
            { from: localUrl
              ,filter: function() {}
              ,to: remoteUrl
            } 
            ,{ from: remoteUrl
               ,filter: null
               ,to: localUrl }
        ] 
        ,log: []
        ,error: []
    };
    
})();
