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

      var currentUser;
      function init() {
	pouch.get('Last user', 
		  function(err, lastUser) {
		    var currentUserId = 'root';
		    if (err) {
		      console.log('No init doc found..');
		    }			
		    else currentUserId = lastUser.id;
		    pouch.get(currentUserId, function(err, response) {
				if (err) {
				  if (currentUserId !== 'root') {
				    console.log("Strange.. Couldn't find last user " +
						'in the database. But he was in the last user doc!!!!');
				  }
				  else {
				    console.log('Making default user (root)');
				    currentUser = rootUser;
				    pouch.put(rootUser, function(err,resp) { 
						if (err) console.log('Database error. Quitting');
						else {
						  rootUser._rev = resp.rev;
						  currentUser = rootUser;
						}
					      });					       
				  }
				}  
				else currentUser = response;
				layout.draw();	
				// isc.Page.setEvent("load", "module.layout.draw()");
				layout.show('datatable');
				
			      });
		  });
      }
      init();
      
    }
  }
);
