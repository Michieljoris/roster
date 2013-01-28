/*global logger:false define:false isc:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
// ({  inject : ['databases/pouchDB', 'databases/couchDB'],
({  inject : ['databases/pouchDB'],
    factory: function() {
        "use strict";
        var log = logger('datasource');
        log.d('Evaluating datasource..');
        
        var database;
        // var idbname= 'idb://pouchdb';
        
        var args = Array.prototype.slice.apply(arguments);
        var dbNames = [];
        var dbs = {};
        var valueMap = {};
        
        args.forEach(function(a) {
            dbNames.push(a.name);
            dbs[a.name] = a;
            valueMap[a.name] = a.shortName;
        });
        
        //return list of names of the databases available
        // function ls() {
        //     return dbNames;
        // }
        
        //set the database to be used to dbname
        function set(dbName) {
            database = dbs[dbName];
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
        function pick(callback){
            var pickDbForm = isc.DynamicForm.create({
                columns: 1
                ,fields: [
                    {  type: 'radioGroup', name: "databaseName",  showTitle: true, 
                       valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
                       ,width: 300
                       ,change: function() {
                           var databaseName = arguments[2];
                           log.d('change', databaseName);
                           helpLabel.setContents(dbs[databaseName].description);
                           pickDbForm.getField('dbname').title=dbs[databaseName].urlPrefix;
                           pickDbForm.getField('dbname').redraw();
k                           
                       }
                    }
                    ,{ type: 'text', name: 'url', title: 'Url or name', ID:'test',
                       titleOrientation: 'top', startRow: true, width: 300, value: 'pouchDB'}
                ]
            });
            
            var helpLabel = isc.Label.create({
                // ID:'test',
                width: 300,
                height: '100%',
                margin: 10
                ,contents: dbs.pouchDB.description
            });
            
            var editorWindow = isc.Window.create({
                title: "Select a database backend."
                // ,autoSize: true
                ,height:300
                ,width:320
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
                                title: 'Ok'
                                ,startRow: false
                                ,click: function() {
                                    var databaseName = pickDbForm.getValue('databaseName'); 
                                    var url = dbs[databaseName].urlPrefix +
                                        pickDbForm.getValue('url');
                                    database = dbs[databaseName];
                                    editorWindow.hide();
                                    callback(database, url);
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