/*global isc:false VOW:false logger:false isc:false define:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/


define(
    { inject: ['lib/cookie', 'databases/db'], 
      factory: function(cookie, db) 
      { "use strict";
        var log = logger('user');
        log.d('Evaluating user');
        
        var user;
        
	
        var defaultSettings = {
            type: 'settings'
            ,fortnightStart: true   
            ,dataSource: 'pouchDS'
        };
        
        var settings;
        
        function getUser(credentials) { 
            var vow = VOW.make();
            var login = credentials.login;
            db.get().getDS().fetchData(
                null,
                function (dsResponse, data) {
                    if (dsResponse.status < 0) vow['break']('Could not query database..' +
                                                            dsResponse.status);
                    else {
                        loginCriterion.value = login;
                        var resultSet = isc.ResultSet.create({
                            dataSource:"pouchDS",
                            criteria: userCriteria,
                            allRows:data
                        });
                        var rows = resultSet.getAllVisibleRows();
                        log.d('and the visible rows are:', rows);
                        if (rows.length < 1)
                            vow['break']('A person with this login does not exist in this database:' +
                                         login);
                        else {
                            if (rows.length > 1)
                                log.w('There are two persons with the same login name!!! ' +
                                      'Using the first one' , rows[0], 'from ', rows);
                            
                            if (rows[0].pwd === credentials.pwd) vow.keep(rows[0]);
                            else vow['break']('Wrong password');
                        }
                    }
                }
            );
            return vow.promise;
        } 
        
        function checkCredentials(credentials, reportToLoginDialog) {
            getUser(credentials.login).when(
                function(anAuthenticatedUser) {
                    user = anAuthenticatedUser;
                    reportToLoginDialog(true);
                    userPromise.keep(user);
                    
                },
                function(err) {
                    log.w(err);
                    reportToLoginDialog(false);
                }
                
            );
        }
        
        function showLoginDialog(aUser) {
            if (!aUser) aUser = user;
	    isc.showLoginDialog(checkCredentials,
				{username: aUser.login, password: aUser.pwd,
				 dismissable:true});
        } 
        
        var userPromise;
        function set(aUser) {
            userPromise = VOW.make();
            if (aUser && aUser.autoLogin) {
                user = aUser;
                userPromise.keep(user);
            }
            else showLoginDialog(aUser);
            return userPromise.promise;
        }
        
        window.test = function() {
            log.d('hello');
            return user;
        };
        
        //##getSettings
        /**Get settings by its id
         */
        function getSettings( aUser ){
            var vow = VOW.make();
            db.get().getDoc(aUser.settingsId).when(
                function(someSettings) {
                    settings = someSettings;
                    vow.keep(aUser);
                }
                ,function(err) {
                    log.d("Couldn't find the settings doc: ", err);
                    settings = isc.clone(defaultSettings);
                    // vow['break'](err);
                    log.d('doing putdoc');
                    db.get().putDoc(settings).when(
                        function() {
                            aUser.settingsId = settings._id;
                            log.d(settings);
                            vow.keep(aUser);}
                        ,function() { vow['break'](
                            'Could not save settings doc for user: ' + aUser);}
                    );
                }
            );
            return vow.promise;
        }
        //The two entries into this module. Either let the module find
        //out who the user is (init) or explicitly change it,
        function change(aUser) {
            // return set(aUser);
            return set(aUser).when(
                getSettings
            );
        }
        
        function init() {
            var vow = VOW.make();
            cookie.get('lastLogin').when(
                function(userId) {
                    change(vow, userId);
                }
                ,function() {
                    change(vow);     
                }
            );
            return vow.promise;
        }
        var personCriterion = {
            fieldName: 'type',
            operator:'equals',
            value: 'person'
        };
          
        var loginCriterion = {
            fieldName: 'login',
            operator:'equals'
        };
        
        var userCriteria = {
            _constructor:"AdvancedCriteria",
            operator:"and",
            criteria: [personCriterion, loginCriterion]
               
        };
        
        
        
        return {
            showLoginDialog: showLoginDialog
            ,init: init
            ,change: change
        };
        
        
      }});



