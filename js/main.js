/*global logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define(
    {   
        inject: ['viewTree', 'globals', 'layout'], 
        factory: function(viewTree, globals, layout) 
        { "use strict";
          var log = logger('main');
          var user;
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
		                           viewTree.loginButton.setTitle(user.login);
		                           viewTree.loginButton.action = function() {
			                       isc.showLoginDialog(checkCredentials,
					                           {username: user.login, password: user.password,
					                            dismissable:true});
		                           };
		                       }
		                       else reportToLoginDialog(false);
		                   }
		                   });}
		 
          function startApp() {
	      // pp(user);
	      var loginButton = viewTree.loginButton;
	      loginButton.setTitle('guest');
	      loginButton.action = function() {
	          isc.showLoginDialog(checkCredentials, {username: user.login, dismissable:true});
	      };
	
	      if (!user.autoLogin) {
	          loginButton.action();
	      }
	      else globals.setUser(user);
	      layout.draw(user);	
          }
      
          //***********************@init*******************8
          log.d('Starting up app...');
      
          //@startup logic 
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


