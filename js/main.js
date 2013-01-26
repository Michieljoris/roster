/*global logger:false Pouch:false define:false VOW:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

//The js file that kicks off the app. It sets up the database, decides
//on a user and finally calls draw from layout.js to show the app.


define(
    {   
        inject: ['datasources/datasource', 'user', 'globals', 'layout'], 
        factory: function(dataSource, user, globals, layout) 
        { "use strict";
          var log = logger('main');
          log.d('Evaluating main');
          
          var idbname= 'idb://pouchdb';
          var dataSourceAdapterDocId = 'dataSource';
          var pouchHandle;
          var ds;
          
	
          var defaultSettings = {
            fortnightStart: true   
            ,dataSource: 'pouchDS'
           };
          
          //##getDoc
          
          //A helper function to easily extract a doc from the
          //pouchdb. This function returns a promise of
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
          
          
		 
          // function startApp() {
	  //     // pp(user);
          //     log.d('in startapp');
	
	  //     if (!user.autoLogin) {
	  //         loginButton.action();
	  //     }
	  //     else globals.setUser(user);
	  //     layout.draw(user.viewTreeData);	
          // }
      
          //***********************@init*******************8
          log.d('Starting up app...');
      
          //##Startup logic.
          
          //This app is built on pouchdb.js and Smartclient.  Pouch is
          //the always present database. We use it to find whether to
          //continue with this database or another by looking for a
          //doc with id datasource. It will have the name and details
          //of the database adapter to use.
          //Pouchdb uses callbacks to return any data. To
          //avoid the confusing nesting of callbacks we use
          //Crockford's vow.js.
          
          /** Get a promise of the pouchdb handle */
          function getPouchdbHandle(){
              var vow = VOW.make();
              Pouch(idbname, function(err, pouchHandle) {
	          if (!err) vow.keep(pouchHandle);
                  else { var msg = "Error opening idb database" + idbname +
			     "err: "+ err.error + ' reason:' + err.reason;
                             vow['break'](msg);
		           }
              });
              return vow.promise;
          }
          
          
	 /** Save the name of the database backend to the local pouchdb */
          function saveDsName(vow, doc){
              pouchHandle.put(doc,
                              function(err, response) {
	                          if (!err) vow.keep(response);
                                  else { var msg = 'Error saving' + doc.name + ' to ' +
                                         idbname + " err: "+ err.error + ' reason:' +
                                         err.reason;
                                         vow['break'](msg);
		                       }
                              });
          } 

          /** Promise to set the datasource, and save its name to the
           local pouchdb */
          function setDataSource(aPouchHandle) {
              pouchHandle = aPouchHandle;
              var vow = VOW.make();
              pouchHandle.get(dataSourceAdapterDocId, function(err, doc) {
                  if (!err) {
                      if (dataSource.set(doc.name)) vow.keep(doc);
                      else { log.d('Error: there is no datasource adapter ' +
                                   'for this database: ' + doc.name);
                             dataSource.pick(function(dsName) {
                                 doc.name = dsName;
                                 saveDsName(vow, doc);
                             });
                           }
                  }
                  else dataSource.pick(function(dsName) {
                          saveDsName(vow, {
                              _id: dataSourceAdapterDocId
                              ,name: dsName });
                      });
              });
              return vow.promise;
          }
          
          /** Init the datasource */
          function initDataSource(  ){
              //we have a handle for the local pouch now and a the datasource is set
              var vow = VOW.make();
              ds = dataSource.get();
              ds.init(function(err) {
                  if (!err) vow.keep() ;
                  else vow['break'](err);
              });
              return vow.promise;
          }
          
          getPouchdbHandle().when(
             setDataSource
          ).when(
            initDataSource  
          ).when(
              
          ).
          when(
              function() {
               log.d('Success!!!');
              },
              function(err) {
                  log.d(err);
              }
          );
              
          
	          //if we stored Last user, use that otherwise user = guest
	          // db.get(
	          //     'Last user', 
	          //     function(err, lastUser) {
	          //         var currentUserId;
	          //         if (err) {log.d('No init doc found. Setting user to guest');
		  //                   currentUserId = 'guest';}			
	          //         else currentUserId = lastUser.id;
	          //         //get the current user's record from the database
	          //         db.get(
		  //             currentUserId, 
		  //             function(notfound, response) {
		  //                 if (notfound) { //currentUser is not in the database..
		  //                     if (currentUserId === 'guest')  {
		  //                         log.d('Must be first run. Entering guest user into the database'); }
		  //                     else {
		  //                         log.d('Strange.. Could not find last user ' +
		  //       	                      'in the database. \nBut he was in the last user doc!!!!');
		  //                         log.d('Starting as guest user.');
		  //                         //shouldn't happen, but in this case default to guest again
		  //                     }
		  //                     user = globals.user;
                  //                     log.d('User =',user);
		  //                     db.put( //put guest in the database
		  //                         user, 
		  //                         function(err,resp) { 
		  //                             if (err) log.d('ERROR: Could not save the guest user\' details to the database!!!', err);
		  //                             else {
		  //                                 user._rev = resp.rev;
		  //                                 startApp();
                  //                             }});}  
		  //                 else { //start with the user found in the database
		  //                     user = response;
                  //                     log.d('finished startup logic');
		  //                    startApp();
                  //                 }   });});});
      
        }});


