define(
  { inject: ['roster', 'layout', 'lib/sha1'], 
    factory: function(roster, layout, crypt) 
    {
      pouch.setdb('idb://' + roster.dbname);
      var rootUser = {
	_id:'root',
	// name: 'super-admin',
	group: 'people',
	login: 'root',
	pwd:'1511e358bea6f50b2ddb2ca19c6422e871a0086f'
      };

      // var currentUser;
      // function init() {
      Pouch(
	roster.dbname, function(err, db) {
	  if (err) { console.log("Error opening database", dbname, 
				    "err:", err.error, err.reason, " db:", db);
		     return; }
	  roster.db = db;
	  db.get(
	    'Last user', 
	    function(err, lastUser) {
	      var currentUserId = 'root';
	      if (err) {console.log('No init doc found..');}			
	      else currentUserId = lastUser.id;
	      db.get(
		currentUserId, 
		function(notfound, response) {
		  if (notfound) { //currentUser is not in the database..
		    if (currentUserId !== 'root') {
		      console.log("Strange.. Couldn't find last user " +
				  'in the database. But he was in the last user doc!!!!');}
		    else { //so has to be root, the first user
		      console.log('Making default user (root)');
		      roster.currentUser = rootUser;
		      db.put( //put root in the database
			rootUser, 
			function(err,resp) { 
			  if (err) console.log('ERROR: Could not save a user (root) to the database!!!');
			  else {
			    rootUser._rev = resp.rev;
			    // currentUser = rootUser;
			    startApp();}});}}  
		  else { roster.currentUser = response;
			 startApp();	}});});})
      
      function startApp() {
	layout.draw();	
	layout.show('datatable');
	layout.show('tabset');
      }
      
    }});


// isc.Page.setEvent("load", "module.layout.draw()");
// layout.show('datatable');
