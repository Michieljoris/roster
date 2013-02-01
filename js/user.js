/*global isc:false VOW:false logger:false isc:false define:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/


define(
    { inject: ['lib/cookie', 'loaders/backend'], 
      factory: function(cookie, backend ) 
      { "use strict";
        var log = logger('user');
        
        var user;
        var settingsCache;
        var modified;
        var observers = [];

        function notifyObservers() {
            observers.forEach(function(o) {
                o.notify();
            });
        }

        //Creates a new settings doc, saves it and when successful
        //keeps the vow it was given, else breaks it.
        function createNewSettings(vow) {
            settingsCache = { type: 'settings' };
            modified = true;
            saveSettings().when(
                function() {
                    user.settingsId = settingsCache._id;
                    return backend.putDoc(user);
                }
            ).when(
                function () {
                    vow.keep(); }
                ,function(err) {
                    vow['break']('Could not save new settings doc for user!!', err);
                }
                
            );
        }
        
        //Promises to get the settings referenced by the current user,
        //and to create the doc if it doesn't exist already
        function getSettings(){
            var vow = VOW.make();
            backend.getDoc(user.settingsId).when(
                function(someSettings) {
                    settingsCache = someSettings;
                    vow.keep();
                }
                ,function() {
                    //this user didn't have a settings file yet. The
                    //doc wasn't there, or the settingsId was
                    //undefined. Making him one. Might still be able to
                    //keep this promise if we make one, try to save,
                    //link it to the current user and then try to save
                    //the user.
                    createNewSettings(vow);
                }
            );
            return vow.promise;
        }
        
        //##change
        /** Promises to change and deliver the current user and get his
            settings file (create if necessary). 
         */
        function change() {
            var vow = VOW.make();
            backend.changeUser().when(
                function(anAuthenticatedUser) {
                    user = anAuthenticatedUser;
                    return getSettings();
                }
            ).when(
                function() {
                    vow.keep(user);
                    notifyObservers();
                },
                function(err) {
                    vow['break'](err);
                }
            );
            return vow.promise;
            
        }
        
        
        function init(aUser) {
            var vow = VOW.make();
            backend = backend.get();
            log.d('BACKEND AT USER', backend);
            user = aUser; 
            getSettings(user.settingsId).when(
                function() {
                    // notifyObservers();
                    vow.keep(user);
                }
            );
            return vow.promise;
        }
        
        //##saveSettings
        /** Returns promise of settings been saved
         */
        function saveSettings(){
            var vow = VOW.make();
            log.d('modified', modified);
            if (!modified) { log.d('Settings were not modified, so not saving..');
                             vow.keep(); }
            else backend.putDoc(settingsCache).when(
                function() {
                    // user.settingsId = updatedSettings._id;
                    modified = false;
                    vow.keep();
                }
            );
            return vow.promise;
        }
        
        function getPermission(id) {
            var permissions = settingsCache.permissions;
            if (permissions) {
                return permissions[id];
            }
            //by default lock everything down:
            else return false;
        }
        
        function setPermission(id, bool) {
            modified = true;
            if (!settingsCache.permissions) settingsCache.permissions = {};
            settingsCache.permissions[id] = bool;
        }
        
        function getLook() {
            return settingsCache.look;
        }

        function setLook(look) {
            modified = true;
            settingsCache.look = look;
        }
        
        function getBehaviour(id) {
            var behaviour = settingsCache.behaviour;
            if (behaviour) return behaviour[id];
            else return null;
        }
        
        function setBehaviour(id, setting) {
            modified = true;
            if (!settingsCache.behaviour) settingsCache.behaviour = {};
            settingsCache.behaviour[id] = setting;
        }
        
        function get() {
            return user;
        }
        
        function addObserver(observer) {
            observers.push(observer);
        }
        
        return {
            init: init
            ,get: get
            ,getPermission: getPermission
            ,setPermission: setPermission
            ,getLook: getLook
            ,setLook: setLook
            ,getBehaviour: getBehaviour
            ,setBehaviour: setBehaviour
            ,change: change
            ,saveSettings: saveSettings
            ,addObserver: addObserver
        };
      }});



