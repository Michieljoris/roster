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
        
        
        /** Pick a database */
        function pick(callback, cancellable){
            var pickDbForm = isc.DynamicForm.create({
                columns: 1
                ,fields: [
                    {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
                       valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
                       ,width: 300
                       ,change: function() {
                           var databaseName = arguments[2];
                           log.d('change', databaseName);
                           // log.d(dbDescriptions);
                           
                           helpLabel.setContents(dbDescriptions[databaseName].description);
                           pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
                           // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                           // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                           // pickDbForm.getField('dbname').redraw();
                       }
                    }
                    ,{ type: 'text', name: 'url', title: 'Url or name', 
                       titleOrientation: 'top', startRow: true, width: 300, value: 'db' }
                ]
            });
            
            var helpLabel = isc.Label.create({
                // ID:'test',
                width: 300,
                height: '100%',
                margin: 10
                ,contents: dbDescriptions.pouchDB.description
            });
            
            var editorWindow = isc.Window.create({
                title: "Select a database backend."
                // ,autoSize: true
                ,height:400
                ,width:400
                ,canDragReposition: false
                ,canDragResize: false
                ,showMinimizeButton:false
                ,showCloseButton:false
                ,autoCenter: true
                ,isModal: true
                ,showModalMask: true
                ,autoDraw: false
                ,items: [
                    pickDbForm
                    ,helpLabel
                    ,isc.HLayout.create({
                        layoutMargin: 6,
                        membersMargin: 6,
                        // border: "1px dashed blue",
                        height: 20,
                        width:'100%',
                        members: [
                            isc.LayoutSpacer.create()
                            ,isc.Button.create({
                                title: 'Cancel'
                                ,visibility: cancellable ? 'inherit' : 'hidden'
                                // ,startRow: false
                                ,click: function() {
                                    editorWindow.hide();
                                }  
                            })
                            ,isc.Button.create({
                                title: 'Ok'
                                ,startRow: false
                                ,click: function() {
                                    var databaseName = pickDbForm.getValue('databaseName'); 
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
                            
                            ,isc.LayoutSpacer.create()
                        ]
                    })
                ] 
            });
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