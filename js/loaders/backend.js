/*global logger:false define:false isc:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
// ({  inject : ['databases/pouchDB', 'databases/couchDB'],
({  inject : ['databases/pouchDB'],
    factory: function() {
        "use strict";
        var log = logger('backend');
        
        var database;
        
        var args = Array.prototype.slice.apply(arguments);
        // var dbNames = [];
        var dbs = {};
        var valueMap = {};
        var dbDescriptions = {};
        
        args.forEach(function(db) {
            var descriptions = db.getDbDescriptions();
            descriptions.forEach(function(d) {
                // dbNames.push(d.name);
                dbs[d.name] = db;
                dbDescriptions[d.name] = d;
                valueMap[d.name] = d.shortDescr;
            });
        });
        
        log.d('Loaded database backends: ' + Object.keys(dbDescriptions).map(function (d) {
            return d.name;
        }));
        //return list of names of the databases available
        // function ls() {
        //     return dbNames;
        // }
        
        //set the database to be used to dbname
        function set(dbName) {
            database = dbs[dbName];
            log.d('Backend set to: ' + dbName);
            return database;
        }
        
        //set the database to be used to dbname
        function exists(dbName) {
            return dbs[dbName];
        }
        
        function get() {
            //return handle to the database currently used
            return database;
        }
        
        
        var cancellable;
        var callback;
        function createEditorWindow() {
            
            var pickRemoteForm = isc.DynamicForm.create({
                // autoDraw: true,
                columns: 1
                ,fields: [
                    // {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
                    //    valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
                    //    ,width: 300
                    //    ,change: function() {
                    //        var databaseName = arguments[2];
                    //        log.d('change', databaseName);
                    //        // log.d(dbDescriptions);
                           
                    //        helpLabel.setContents(dbDescriptions[databaseName].description);
                    //        pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
                    //        // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                    //        // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                    //        // pickDbForm.getField('dbname').redraw();
                    //    }
                    // }
                    { type: 'text', name: 'url', title: 'Url of Couchdb database:', 
                       titleOrientation: 'top', startRow: true, width: 300,
                      value: 'http://localhost:8080/db/roster' }
                ]
            });
            var pickDbForm = isc.DynamicForm.create({
                // autoDraw: true,
                columns: 1
                ,fields: [
                    // {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
                    //    valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
                    //    ,width: 300,
                    //    visibility: 'hidden'
                    //    ,change: function() {
                    //        var databaseName = arguments[2];
                    //        log.d('change', databaseName);
                    //        // log.d(dbDescriptions);
                           
                    //        helpLabel.setContents(dbDescriptions[databaseName].description);
                    //        pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
                    //        // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                    //        // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                    //        // pickDbForm.getField('dbname').redraw();
                    //    }
                    // },
                    { type: 'text', name: 'url', title: 'Name:', 
                       titleOrientation: 'top', startRow: true, width: 300, value: 'db' }
                ]
            });
            
            var helpLabel = isc.Label.create({
                // ID:'test',
                width: 300,
                height: '100%',
                margin: 10
                // ,border: "1px dashed blue"
                ,contents: dbDescriptions.pouchDB.description
            });
        
        
            var pickDatabaseLayout = isc.VLayout.create({
                layoutMargin: 6,
                membersMargin: 6,
                // border: "1px dashed blue",
                height: 20,
                width:'100%',
                members: [pickDbForm, helpLabel
                          ,isc.HLayout.create({
                              layoutMargin: 6,
                              membersMargin: 6,
                              // border: "1px dashed blue",
                              height: 20,
                              width:'100%',
                              members: [
                                  // isc.LayoutSpacer.create()
                                  isc.Button.create({
                                      title: 'Cancel'
                                      ,visibility: cancellable ? 'inherit' : 'hidden'
                                      // ,startRow: false
                                      ,click: function() {
                                          editorWindow.hide();
                                      }  
                                  })
                                  ,isc.LayoutSpacer.create()
                                  ,isc.Button.create({
                                      title: 'Open'
                                      ,startRow: false
                                      ,click: function() {
                                          // var databaseName = pickDbForm.getValue('databaseName'); 
                                          var databaseName = 'pouchDB';
                                          var url = pickDbForm.getValue('url');
                                          var urlPrefix = dbDescriptions[databaseName].urlPrefix;
                                          if (url.startsWith(urlPrefix)) urlPrefix = '';
                                          log.d('hello',urlPrefix, databaseName);
                                          url = urlPrefix + url;
                                          set(databaseName);
                                          database = dbs[databaseName];
                                          editorWindow.hide();
                                          callback(database, databaseName, url);
                                      }  
                                  })
                            
                              ]
                          })

                         ]
            });
            
            var pickRemoteLayout = isc.VLayout.create({
                layoutMargin: 6,
                membersMargin: 6,
                // border: "1px dashed blue",
                height: 20,
                width:'100%',
                members: [pickRemoteForm
                          ,isc.HLayout.create({
                              layoutMargin: 6,
                              membersMargin: 6,
                              // border: "1px dashed blue",
                              height: 20,
                              width:'100%',
                              members: [
                                  // isc.LayoutSpacer.create()
                                  isc.Button.create({
                                      title: 'Export'
                                      // ,visibility: cancellable ? 'inherit' : 'hidden'
                                      // ,startRow: false
                                      ,visibility: cancellable ? 'inherit' : 'hidden'
                                      ,click: function() {
                                          editorWindow.hide();
                                          var url = pickRemoteForm.getValue('url');
                                          console.log('Replicating to ' + url);
                                          repToRemote(url);
                                      }  
                                  })
                                  ,isc.LayoutSpacer.create()
                                  ,isc.Button.create({
                                      title: 'Import'
                                      ,startRow: false
                                      ,click: function() {
                                          // var databaseName = pickDbForm.getValue('databaseName'); 
                                          // var url = pickDbForm.getValue('url');
                                          // var urlPrefix = dbDescriptions[databaseName].urlPrefix;
                                          // if (url.startsWith(urlPrefix)) urlPrefix = '';
                                          // log.d('hello',urlPrefix, databaseName);
                                          // url = urlPrefix + url;
                                          // set(databaseName);
                                          // database = dbs[databaseName];
                                          // editorWindow.hide();
                                          // callback(database, databaseName, url);
                                      }  
                                  })
                                  ,isc.LayoutSpacer.create()
                                  ,isc.Button.create({
                                      title: 'Cancel'
                                      ,visibility: cancellable ? 'inherit' : 'hidden'
                                      // ,startRow: false
                                      ,click: function() {
                                          editorWindow.hide();
                                      }  
                                  })
                            
                              ]
                          })
                         ]
            }); 
            
        
        
            var tabset = isc.TabSet.create({
                // ID: "topTabSet",
                tabBarPosition: "top",
                // width: 400,
                // height: 300,
                tabs: [
                    {title: "Select/Create", 
                      pane:  pickDatabaseLayout }
                    // ,{title: "Replicate", 
                    //  pane: pickRemoteLayout}
                ]
            });
            
            var editorWindow = isc.Window.create({
                title: "Database"
                // ,autoSize: true
                ,height:500
                ,width:500
                ,canDragReposition: false
                ,canDragResize: false
                ,showMinimizeButton:false
                ,showCloseButton:false
                ,autoCenter: true
                ,isModal: true
                ,showModalMask: true
                ,autoDraw: false
                ,items: [
                    tabset
                    // ,helpLabel
                ] 
            });
            return editorWindow;
            
        }
        /** Pick a database */
        function pick(aCallback, isCancellable){
            callback = aCallback;
            cancellable = isCancellable;
            var editorWindow = createEditorWindow();
            editorWindow.show();
        }
        
        return {
            pick: pick
            ,exists: exists
            ,get: get
            ,set: set
            // ,ls: ls
        };
    }
});