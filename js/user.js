/*global logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/


define(
    { inject: ['datasources/datasource'], 
      factory: function(ds) 
      { "use strict";
        var log = logger('user');
        
        var user;
        
        var defaultUser = {
            _id:'guest',
            name: 'guest',
            type: 'person',
            login: 'guest',
            autoLogin: true,
            password:'guest'
        };
        
        function checkCredentials(credentials, reportToLoginDialog) {
	    // log.d(credentials);
	    window.temp = credentials.username;
	    function map(doc) {
	        //this function needs a global to compare doc.login with,
	        // nothing else closes over this function apparently.. 
	        if (doc.login === window.temp) { log.d(doc.login); emit(doc, null); }
	    }
	    globals.db.query({map:map}, {reduce: false},
	                     function(err,response) {
	                         if (err) { log.d('ERROR: Could not query database to find user ' +
	        			          credentials.login, err); }
	                         else {
	                             log.d(response);
	                             if (credentials.username === 'guest'  || 
	        	                 (response.rows.length > 0 &&
	        	                  credentials.password === response.rows[0].key.password)) {
	                                 var user = response.rows[0].key;
	                                 globals.setUser(user);
	                                 reportToLoginDialog(true);
	                                 // viewTree.loginButton.setTitle(user.login);
	                                 viewTree.loginButton.action = function() {
	        	                     isc.showLoginDialog(checkCredentials,
	        			                         {username: user.login, password: user.password,
	        			                          dismissable:true});
	                                 };
	                             }
	                             else reportToLoginDialog(false);
	                         }
	                     });}
        
        function setDataSource(aDs) {
            ds = aDs; 
        }
        
        function getLogin() {
            return user.login;
        }
        
        function getPwd() {
            return user.pwd;
        }
        
        return {
            setDataSource: setDataSource,
            checkCredentials: checkCredentials,
            getLogin: getLogin,
            getPwd: getPwd
        };
        
      }});



