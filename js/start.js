/*global VOW:false logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

//The js file that kicks off the app. It sets up the database, decides
//on a user and finally calls draw from layout.js to show the app.


define(
    {   
        inject: ['database','viewTree', 'globals', 'layout'], 
        factory: function(dsLoader, navTree, globals, layout) 
        { "use strict";
          var log = logger('main');
          
	  var loginButton = navTree.getloginButton();
          
          var defaultUser = {
              _id:'guest',
              name: 'guest',
              type: 'person',
              login: 'guest',
              autoLogin: true,
              password:'guest'
          };
	
          var defaultSettings = {
            fortnightStart: true   
            ,datasource: 'pouchDS'
           };
          
          //##getDoc
          
          //A helper function to easily extract a doc from the
          //pouchdb. Pouchdb uses callbacks to return any data. To
          //avoid the confusing nesting of callbacks we use
          //Crockford's vow.js. So this function returns a promise of
          //a doc.
          function getDoc(record) {
              if (record._id) return VOW.kept(record);
              var vow = VOW.make();
              globals.db.get(record, function(err, doc) {
                  log.d('getting doc',doc, err);
                  if (!err) {
                      vow.keep(doc);   
                      log.d('keeping vow');
                  }
                  else {
                      err.record = record; 
                      vow['break'](err);   
                      log.d('breaking vow');
                  }
              });
              return vow.promise;
          }
              
          
          function checkCredentials(credentials, reportToLoginDialog) {
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
		                           navTree.loginButton.setTitle(user.login);
		                           navTree.loginButton.action = function() {
			                       isc.showLoginDialog(checkCredentials,
					                           {username: user.login, password: user.password,
					                            dismissable:true});
		                           };
		                       }
		                       else reportToLoginDialog(false);
		                   }
		               });}
          
          
		 
          function startApp(user) {
	      loginButton.setTitle(user.login);
	      loginButton.action = function() {
	          isc.showLoginDialog(checkCredentials, {username: user.login, dismissable:true});
	      };
              
	      if (!user.autoLogin) {
	          loginButton.action();
                  return;
	      }
	      else globals.setUser(user);
              // var settingsDocId = user.settings ? user.settings : 'settings';
              var vow = VOW.make();
              
	      globals.db.get(
                  user.settings,
	          function(err, aSettings) {
	              if (err) {log.d('No settings doc found for this user: ', user.settings);
                               }
                      settings = aSettings;
                      // var uiStateDocId = settings.uiState ? settings.uiState : 'uiState';     
	              globals.db.get(
                          settings.uiState,
	                  function(err,aUiState) {
	                      if (err) {log.d('No uiState doc found for these settings: ', settings.uiState);
                                       }
	                      layout.draw(aUiState);	
                      
                          });
                  });
          }
      
          log.d('Starting up app...');
      
          //##Startup logic.
          
          //This app is built on pouchdb.js and Smartclient.  Pouch is
          //the always present database. We use it to find whether to
          //continue with this database or another by looking for a
          //doc with id datasource. It will have the name and details
          //of the database adapter to use.
          Pouch(
              
              
              
	      globals.dbname, function(err, db) {
	          if (err) { log.d("Error opening database", globals.dbname, 
				   "err:", err.error, err.reason, " db:", db);
		             return; }
	  
	          //save db reference for global use
	          globals.setDb(db);
	          //if we stored Last user, use that otherwise user = guest
	          db.get(
	              'Last user', 
	              function(err, lastUser) {
	                  var currentUserId;
	                  if (err) {log.d('No init doc found. Setting user to guest');
			            currentUserId = 'guest';}			
	                  else currentUserId = lastUser.id;
	                  //get the current user's record from the database
	                  db.get(
		              currentUserId, 
		              function(notfound, response) {
		                  if (notfound) { //currentUser is not in the database..
		                      if (currentUserId === 'guest')  {
		                          log.d('Must be first run. Entering guest user into the database'); }
		                      else {
			                  log.d('Strange.. Could not find last user ' +
				                'in the database. \nBut he was in the last user doc!!!!');
			                  log.d('Starting as guest user.');
			                  //shouldn't happen, but in this case default to guest again
		                      }
		                      user = globals.user;
                                      log.d('User =',user);
		                      db.put( //put guest in the database
			                  user, 
			                  function(err,resp) { 
			                      if (err) log.d('ERROR: Could not save the guest user\' details to the database!!!', err);
			                      else {
			                          user._rev = resp.rev;
			                          startApp();
                                              }});}  
		                  else { //start with the user found in the database
		                      user = response;
                                      log.d('finished startup logic');
		                      startApp();
                                  }   });});});
      
        }});


