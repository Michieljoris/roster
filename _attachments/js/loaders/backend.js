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
        var dbName;
        
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
        function set(aDbName) {
            dbName = aDbName;
            database = dbs[dbName];
            log.d('Backend set to: ' + dbName);
            return database;
        }

        function getName() {
            return dbName;
        }
        
        function exists(dbName) {
            return dbs[dbName];
        }
        
        function get() {
            //return handle to the database currently used
            return database;
        }
        
        
        
        // /** Pick a database */
        // function pick(aCallback, isCancellable){
        //     callback = aCallback;
        //     cancellable = isCancellable;
        //     var editorWindow = createEditorWindow();
        //     editorWindow.show();
        // }
        
        function getDbDescriptions() {
            return dbDescriptions;
        }
        
       function getValueMap() {
           return valueMap;
       } 
        
        return {
            // pick: pick
            exists: exists
            ,get: get
            ,getName: getName
            ,set: set
            ,getDbDescriptions: getDbDescriptions
            ,getValueMap: getValueMap
            // ,ls: ls
        };
    }
});