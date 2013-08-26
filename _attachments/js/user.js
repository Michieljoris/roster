/*global VOW:false logger:false Cookie:false define:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/


define(
    // { inject: ['lib/cookie', 'loaders/backend'], 
    //   factory: function(cookie, backend ) 
    { inject: [ 'lib/couchapi'], 
      factory: function(couch) 
      { "use strict";
        var log = logger('user');
        
        var user;
        var backend;
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
            console.log('CREATING NEW SETTINGS');
            saveSettings().when(
                function() {
                    user.settingsId = settingsCache._id;
                    return backend.putDoc(user, user);
                }
            ).when(
                function (user) {
                    vow.keep(user); }
                ,function(err) {
                    vow['break']('Could not save new settings doc for user!!'  + err);
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
                    if (settingsCache.look)  
                        settingsCache.look = JSON.parse(settingsCache.look);
                    vow.keep(user);
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
            backend.changeUser(user).when(
                function(anAuthenticatedUser) {
                    user = anAuthenticatedUser;
                    return getSettings();
                }
            ).when(
                function() {
                    vow.keep(user);
                    notifyObservers();
                },
                function(data) {
                    // vow['break'](err);
                    alert('Cannot save user settings to the database');
                    console.log('Failed to get the settings for this user: ' + user._id + ' ', data);
                    vow.keep(user);
                    notifyObservers();
                }
            );
            return vow.promise;
            
        }
        
        
        function init(aUser) {
            var vow = VOW.make();
            // backend = backend.get();
            // log.d('BACKEND AT USER', backend);
            user = aUser; 
            getSettings(user.settingsId).when(
                function() {
                    Cookie.set('lastLogin', user._id,
                               Date.today().addYears(10));
                    vow.keep(user);
                },
                function(data) {
                    alert('Cannot save any user settings to the database');
                    console.log('Failed to get the settings for this user: ' + user._id + ' ', data);
                    Cookie.set('lastLogin', user._id,
                               Date.today().addYears(10));
                    vow.keep(user);
                    //we'll have work with the cache. Future saves might also fail.
                    // vow['break']("Error: Could not get and/or create settings doc for user ");
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
            else {
                // console.log('keeping vow!!!');
                // vow.keep();
                // settingsCache = { type: 'settings', moreinfo: 'moreinfo!!' };
                if (settingsCache.look)
                    settingsCache.look = JSON.stringify(settingsCache.look);
                backend.putDoc(settingsCache, user).when(
                    function() {
                        // user.settingsId = updatedSettings._id;
                        modified = false;
                        vow.keep();
                    },
                    function() {
                      vow.break();  
                    }
                );
            } 
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
        var help = {
            couch: "Authentication is done against a CouchDB instance on the network. As long as this instance is locked down by a server admin password security is relativily high. You will stay logged accross refreshes of the page, till you log out. <p>If you want to connect to a different database, visit the connect tab.<p>If you provide no credentials on login the app will try to log in as user: \'guest\', pwd: \'guest\'",
            pouch: "The app is working against an internal database. Authentication is done in the browser in javascript, which makes it vulnarable for attack. However if your security needs are light it is still useable. Passwords are not stored in clear text.<p>If you provide no credentials on login the app will try to log in as user guest, with an empty password"
        };
        
        function getHelpText(version) {
            return help[version];
        }
        
        function isLoggedIn() {
            return user;
        }
        function getName() {
            if (user) return user._id;
            else return null;
        }
        
        return {
            init: init
            ,isLoggedIn: isLoggedIn
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
            ,getHelpText: getHelpText
            ,getName: getName
            ,logOut: function() {
                
            }
            ,setBackend: function(aBackend) {
                backend = aBackend;
            }
        };
      }});



