/*global $:false Pouch:false emit:false logger:false define:false  VOW:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:16 maxlen:150 devel:true newcap:false*/ 

define
({  inject : [],
    factory: function() {
        "use strict";
        var log = logger('db_utils');
        
        
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
        // function openDB(dbs, aDB) {
        //         var vow = VOW.make();
        //     var db = dbs[aDB];
        //     new Pouch(db.url, db.adapter, function(err, newDB) {
        //         if (err) {
        //             var text =  err.statusText ?
        //                 err.statusText : err.reason ?
        //                 err.reason : err.status;
        //             dbs.error.push("Can't open database " + db.url);
        //             dbs.error.push('Reason: ' + text);
        //             vow['break'](dbs);
        //         }
        //         else {
        //             dbs.log.push('Loaded ' + db.url);
        //             db.handle = newDB;
        //             vow.keep();   
        //         }
        //     });
        //     return vow.promise;
        // }
        
        
        // function openDB(dbs) {
        //     var vow = VOW.make();
        //     var db = dbs.db;
        //     new Pouch(db.url, function(err, newDB) {
        //         if (err) {
        //             var text =  err.statusText ?
        //                 err.statusText : err.reason ?
        //                 err.reason : err.status;
        //             dbs.error.push("Can't open database " + db.url);
        //             dbs.error.push('Reason: ' + text);
        //             vow['break'](dbs);
        //         }
        //         else {
        //             dbs.log.push('Loaded ' + db.url);
        //             db.handle = newDB;
        //             vow.keep();   
        //         }
        //     });
        //     return vow.promise;
        // }


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
                    var result = { _id:id,
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
        
        function conflicts(url) {
            var vow = VOW.make(); 
            // var url = 'idb://db';
            var dbs = {
                db: { url: url}
                // ,log: []
                // ,error: []
            };
            
            var dblog = [];
            openDB(dbs, 'db', dblog).when(
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
        window.test2 = function(url) {
            conflicts(url).when(
                function(arr) {
                    log.pp(arr[0].docsWithConflicts);
                },
                function(err) {
                    log.pp(err);
                }
            );
        };
        
        
        function destroy(url) {
            var vow = VOW.make();
            Pouch.destroy(url, function(err, info) {
                log.d('Destroyed!!', arguments);
                if (err) vow['break'](err);
                else vow.keep(info);
            });
            return vow.promise;
        }
        
        function getAllDbs(url) {
            var vow = VOW.make();
            
            //but this only works with databases created with this latest pouchdb
            if (url.startsWith('idb')) {
                {
                    Pouch.allDbs(function(err, resp) {
                        vow.keep(resp);
                    });
                }
            } 
            //obsolete now
            else if (url.startsWith('idb') &&
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
                        if (typeof list[i] === 'string' && list[i].startsWith('_pouch_'))
                            values.push(list[i].slice(7));
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
        
        
        return {
            destroy: destroy
            ,getAllDbs: getAllDbs
            ,conflicts: conflicts
            // ,getConflicts: getConflicts
        };
    
    }
});