/*global Cookie:false $:false VOW:false PBKDF2:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:10 maxcomplexity:7 maxlen:130 devel:true newcap:false*/

if (!window.define) {
    window.define = function (obj) {
        window.couchapi = obj.factory();
    };
}

define(
    { inject: [], 
      factory: function() 
      { "use strict";
        // var log = logger('couchapi');
        var api = {};
        
        api.init = function(url) {
            $.couch.urlPrefix = url;
        };
        
        api.config = function(section, option, value){
            var vow = VOW.make(); 
            $.couch.config({
                success: function(data) {
                    vow.keep({ section: section, option: option, value: value, data: data });
                },
                error: function(status) {
                    vow['break'](status);
                }
            },section, option, value);
            return vow.promise;
        };
        
        //---------------------sessions
        api.login = function(name, pwd) {
            var vow = VOW.make(); 
            $.couch.login({
                name: name,
                password: pwd,
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.logout = function() {
            var vow = VOW.make(); 
            $.couch.logout({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.session = function() {
            var vow = VOW.make(); 
            $.couch.session({
                success: function(data) {
                    vow.keep(data.userCtx);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        
        //----------------------Databases
        api.dbAll = function() {
            var vow = VOW.make(); 
            $.couch.allDbs({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            
            return vow.promise;
        };
        
        var dbName;
        api.dbSet = function(name) {
            dbName = name;
        };
        
        api.dbRemove = function(name) {
            if (name) dbName = name;
            var vow = VOW.make(); 
            $.couch.db(dbName).drop({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.dbCreate = function(name) {
            if (name) dbName = name;
            var vow = VOW.make(); 
            $.couch.db(dbName).create({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        
        api.dbCompact = function(name) {
            if (name) dbName = name;
            var vow = VOW.make(); 
            $.couch.db(dbName).compact({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            
            return vow.promise;
        };
        
        api.dbChanges = function(cb, aDbName) {
            if (aDbName) dbName = aDbName;
            $.couch.db(dbName).changes().onChange(
               cb 
            );
        };
        
        api.dbInfo = function(name) {
            if (name) dbName = name;
            var vow = VOW.make(); 
            $.couch.db(dbName).info({
                success: function(data) {
                    data.uri = $.couch.db(dbName).uri;
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            
            return vow.promise;
        };
        
        api.dbSecurity = function(securityObj, aDbName) {
            var vow = VOW.make(); 
            if (typeof securityObj === 'object') {
                if (aDbName) dbName = aDbName;
                $.couch.db(dbName).setDbProperty('_security', securityObj, {
                    success: function(data) {
                        vow.keep(data);
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
                
            }
            else  {
                aDbName = securityObj;
                if (aDbName) dbName = aDbName;
                $.couch.db(dbName).getDbProperty('_security', {
                    success: function(data) {
                        vow.keep(data);
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
                
            }
            return vow.promise;
        };
        
        api.dbDesign = function(docName, group, funName, funStr, aDbName) {
            var vow = VOW.make();
            if (aDbName) dbName = aDbName;
            function save(designDoc) {
                if (group) {
                    designDoc[group] = designDoc[group] || {};
                    if(funStr) designDoc[group][funName] = funStr;
                    else delete designDoc[group][funName];
                }
                else {
                    if (funStr) designDoc[funName] = funStr;   
                    else delete designDoc[funName];
                }
                api.docSave(designDoc).when(
                    function(data) {
                        vow.keep(data);
                    },
                    function(status) {
                        vow['break'](status);
                    }
                        
                );
            }
            api.docGet('_design/' + docName).when(
                function(designDoc) {
                    save(designDoc);
                },
                function() {
                    var designDoc = {
                        _id : '_design/' + docName
                    };
                    save(designDoc);
                }
            );
            return vow.promise;
            
        };
        
        
        api.dbDesignDoc = function(group, funName, funStr, aDbName) {
            return api.dbDesign('auth', group, funName, funStr, aDbName);
        };
        
        api.dbFilter = function(filterName, funStr, aDbName) {
            return api.dbDesignDoc('filters', filterName, funStr, aDbName);
        };
        
        //---------------------------docs
        api.docGet = function(id, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).openDoc(id, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docRemove = function(doc, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).removeDoc(doc, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docBulkRemove = function(docs, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).bulkRemove({"docs": docs }, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docBulkSave = function(docs, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).bulkSave({"docs": docs }, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docAll= function(aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).allDocs({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docAllDesign= function(aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).allDesignDocs({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.docCopy = function(id, newId, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).copyDoc(id, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            }, {
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Destination", newId);
                }
            });
            return vow.promise;
        };
        
        api.docSave = function(doc, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).saveDoc(doc, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
       //-----------------misc 
        api.list = function(designDoc, listName, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).list(designDoc + '/' + listName,'all', {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                },
                reduce: false
            });
            return vow.promise;
        };
        
        api.viewCompact = function(aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = vow.make(); 
            $.couch.db(dbName).compactView({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.viewCleanup = function(aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = vow.make(); 
            $.couch.db(dbName).viewCleanup({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.view = function(designDoc, viewName, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = vow.make(); 
            $.couch.db(dbName).view(designDoc + '/' + viewName , {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                },
                reduce: false
            });
            return vow.promise;
        };
        
        api.viewTemp = function(map, aDbName) {
            if (aDbName) dbName = aDbName;
            var vow = VOW.make(); 
            $.couch.db(dbName).query(map,"_count", "javascript", {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                },
                reduce: false
            });
            return vow.promise;
        };
        
        api.activeTasks = function() {
            var vow = VOW.make(); 
            $.couch.activeTasks({
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.dbConflicts = function(aDbName) {
            if (aDbName) dbName = aDbName;
            
        };
        // api.replicate = function(db1, db2) {
        //     var vow = VOW.make(); 
        //     $.couch.replicate(db1, db2, {
        //         success: function(data) {
        //             vow.keep(data);
        //         },
        //         error: function(status) {
        //             vow['break'](status);
        //         }
        //     }, {
        //         create_target: true });
        //     return vow.promise;
        // };
        
        // "source", "target", "create_target", "continuous", "doc_ids", "filter", "query_params", "user_ctx"
        api.replicationAdd = function(id, repDoc) {
            repDoc._id = id || api.UUID();
            if (repDoc.role)
                repDoc.user_ctx = { "roles": [repDoc.role] };
            if (repDoc.filterName)
                repDoc.filter = 'auth/' + repDoc.filterName;
            return api.docSave(repDoc, '_replicator');
        };
        
        api.replicationRemove = function(id) {
            var vow = VOW.make();
            api.docGet(id, '_replicator').when(
                function(repDoc) {
                    api.docRemove(repDoc, '_replicator').when(
                        function(data) {
                            vow.keep(data);
                        },
                        function(data) {
                            vow['break'](data);
                        }
                        
                    );
                },
                function(data) {
                    vow.keep(data);
                }
            );
            return vow.promise;
        };
        
        api.UUID = function() {
            return $.couch.newUUID();
        };
        
        
        //------------------------users
        api.userAdd = function(name, pwd, roles) {
            var vow = VOW.make(); 
            var userDoc = {
                name: name
                ,roles: roles
            };
            $.couch.signup(userDoc, pwd, {
                success: function(data) {
                    vow.keep(data);
                },
                error: function(status) {
                    vow['break'](status);
                }
            });
            return vow.promise;
        };
        
        api.userRemove = function(name) {
            var vow = VOW.make(); 
            $.couch.userDb(function(data) {
                var dbName = data.name;
                $.couch.db(dbName).removeDoc(name, {
                    success: function(data) {
                        vow.keep(data);
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
            });
            return vow.promise;
        };
        
        api.userGet = function(name) {
            var vow = VOW.make(); 
            $.couch.userDb(function(data) {
                var dbName = data.name;
                $.couch.db(dbName).openDoc('org.couchdb.user:' +name, {
                    success: function(data) {
                        vow.keep(data);
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
            });
            return vow.promise;
        };
        
        
        api.userUpdate = function(name, props) {
            var vow = VOW.make(); 
            $.couch.userDb(function(data) {
                var dbName = data.name;
                $.couch.db(dbName).openDoc('org.couchdb.user:' + name, {
                    success: function(data) {
                        Object.keys(props).forEach(function(p) {
                           data[p] = props[p]; 
                        });
                        $.couch.db(dbName).saveDoc(data, {
                            success: function(data) {
                                vow.keep(data);
                            },
                            error: function(status) {
                                vow['break'](status);
                            }
                        });
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
            });
            return vow.promise;
        };
        
        api.userRoles = function(name, roles) {
            var vow = VOW.make(); 
            if (roles) {
                api.userUpdate(name, {roles:roles}).when(
                    function() {
                        vow.keep(roles);
                    },
                    function(data) {
                        vow['break'](data);
                    }
                );
            }
            else api.userGet(name).when(
                function(data) {
                    vow.keep(data.roles);
                },
                function(data) {
                    vow['break'](data);
                }
            );
            return vow.promise;
        };
        
        api.userRemoveRole = function(name, role) {
            var vow = VOW.make(); 
            $.couch.userDb(function(data) {
                var dbName = data.name;
                $.couch.db(dbName).openDoc('org.couchdb.user:' + name, {
                    success: function(data) {
                        if (data.roles.indexOf(role) !== -1) {
                            data.roles = data.filter(
                                function(e){ return e !==role; });
                            $.couch.db(dbName).saveDoc(data, {
                                success: function(data) {
                                    vow.keep(data);
                                },
                                error: function(status) {
                                    vow['break'](status);
                                }
                            });
                        }
                        else vow.keep(data);
                        
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
            });
            return vow.promise;
        }; 
        
        api.userAddRole = function(name, role) {
            var vow = VOW.make(); 
            $.couch.userDb(function(data) {
                var dbName = data.name;
                $.couch.db(dbName).openDoc('org.couchdb.user:' + name, {
                    success: function(data) {
                        if (data.roles.indexOf(role) === -1) {
                            data.roles.push(role);
                            $.couch.db(dbName).saveDoc(data, {
                                success: function(data) {
                                    vow.keep(data);
                                },
                                error: function(status) {
                                    vow['break'](status);
                                }
                            });
                        }
                        else vow.keep(data);
                        
                    },
                    error: function(status) {
                        vow['break'](status);
                    }
                });
            });
            return vow.promise;
        }; 

        return api;
      }});


