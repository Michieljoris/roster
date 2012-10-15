define(
  { inject: ['viewTree', 'roster', 'layout', 'lib/sha1'], 
    factory: function(viewTree, roster, layout, crypt) 
    { var user;
      Pouch(
	roster.dbname, function(err, db) {
	  if (err) { console.log("Error opening database", dbname, 
				    "err:", err.error, err.reason, " db:", db);
		     return; }
	  
	  //save db reference for global use
	  roster.db = db;
	  //if we stored Last user, use that otherwise user = guest
	  db.get(
	    'Last user', 
	    function(err, lastUser) {
	      var currentUserId;
	      if (err) {console.log('No init doc found..');
			currentUserId = 'guest'}			
	      else currentUserId = lastUser.id;
	      //get the current user's record from the database
	      db.get(
		currentUserId, 
		function(notfound, response) {
		  if (notfound) { //currentUser is not in the database..
		    if (currentUserId === 'guest')  {
		      console.log('Must be first run. Entering guest user into the database'); }
		      else {
			console.log('Strange.. Could not find last user ' +
				    'in the database. \nBut he was in the last user doc!!!!');
			console.log('Starting as guest user.')
			//shouldn't happen, but in this case default to guest again
		      }
		      user = roster.guestUser;
		      db.put( //put guest in the database
			user, 
			function(err,resp) { 
			  if (err) console.log('ERROR: Could not save the guest user\' details to the database!!!');
			  else {
			    user._rev = resp.rev;
			    startApp();}});}  
		  else { //start with the user found in the database
		    user = response;
		    startApp();}   })})});
      
      function checkCredentials(credentials, reportToLoginDialog) {
	// console.log(credentials);
	roster.checkUser = credentials.username;
	function map(doc) {
	  if (doc.login === module.roster.checkUser) { console.log(doc.login); emit(doc, null); }
	}
	roster.db.query({map:map}, {reduce: false},
		 function(err,response) {
		   if (err) { console.log('ERROR: Could not query database to find user ' + credentials.login); }
		   else {
		     console.log(response);
		     if (response.rows.length > 0 &&
			 credentials.password === response.rows[0].key.password) {
		       var user = response.rows[0].key;
		       roster.setUser(user);
		       reportToLoginDialog(true);
		       viewTree.loginButton.setTitle(user.login);
		       viewTree.loginButton.action = function() {
			 isc.showLoginDialog(checkCredentials, {username: user.login, password: user.password, dismissable:true});
		       };
		     }
		     else reportToLoginDialog(false);
		   }
		 })};
		 
      function startApp() {
	pp(user);
	var loginButton = viewTree.loginButton;
	loginButton.setTitle('guest');
	loginButton.action = function() {
	  isc.showLoginDialog(checkCredentials, {username: user.login, password: user.password, dismissable:true});
	};
	
	if (!user.autoLogin) {
	  loginButton.action();
	}
	else roster.setUser(user);
	layout.draw();	
	
	// layout.show('datatable');
	// layout.show('tabset');
      }
      
    }});


// isc.Page.setEvent("load", "module.layout.draw()");
// layout.show('datatable');
