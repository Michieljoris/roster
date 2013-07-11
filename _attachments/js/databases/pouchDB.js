/*global PBKDF2:false Cookie:false VOW:false Pouch:false logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/

define
({inject: ['types/typesAndFields',  "authWindow"],
  factory: function(typesAndFields,  authWindow) {
      "use strict";
      
      var log = logger('pouchDB', 'debug');
      
      var pouchDbHandle;
      var pouchDS;
      var url = '';
      var newDatabase = false; 
      // var dbviews;
      // var authenticatedUser;
      // var settingsCache;
      
      
      // var defaultSettings = {
      //     type: 'settings'
      //     ,fortnightStart: true   
      //     ,dataSource: 'pouchDS'
      // };
      
      
      function getUrl() {
          return url;
      }
      
      //##init
      /** Make sure there is a handle for pouch 
       * the database */
      function init(vow, idbname) {
          Pouch(idbname, function(err, aDb) {
	      if (!err) {
                  log.d('pouchDB is ready');
                  url= idbname;
                  pouchDbHandle = aDb;
                  // guestUser(vow);
                  vow.keep(self);
              }
              else {
                  // var msg = "\nError opening database with Pouch:" + idbname +
		  //    "\nerr: "+ err.error + '\nreason:' + err.reason;
                  isc.warn('Couldn\'t open database ' + idbname + 
                           '<br>Possible causes: <ul><li>Internet not connected</li><li> CouchDB not running or configured wrong</li><li>Wrong credentials</li></ul><br>' +
                           'Loading default internal database.<br>' +
                           'Click on the left top button in the app to connect to another database.'
                          );
                  idbname = "db";
                  Pouch(idbname, function(err, aDb) {
	              if (!err) {
                          log.d('pouchDB is ready');
                          url= idbname;
                          pouchDbHandle = aDb;
                          vow.keep(self);
                          // guestUser(vow);
                      }
                      else { var msg = "\nError opening database with Pouch:" + idbname +
		             "\nerr: "+ err.error + '\nreason:' + err.reason;
                             isc.warn('Couldn\'t open database ' + idbname + '<br><br>Giving up..');
                             vow['break'](msg);
		           }
                  });
                     
                  // vow['break'](msg);
	      }
          });
      }
      
      //**********************************************************************
      //Implements direct access to the pouchdb
      
      //##getDoc
          
      //A helper function to easily extract a doc from the
      //pouchdb. This function returns a promise of
      //a doc.
      function getDoc(record) {
          // log.d('getDoc ', record);
          var vow = VOW.make();
          if (!record)  
              vow['break']('Can not get doc with undefined id');
          else if (record._id) return vow.keep(record);
          else pouchDbHandle.get(record, function(err, doc) {
              if (!err) {
                  // log.d('keeping get vow');
                  addTimezoneOffset(doc);
                  vow.keep(doc);   
              }
              else {
                  // log.d('breaking get vow');
                  err.record = record; 
                  vow['break'](err);   
              }
          });
          return vow.promise;
      }
      
      //##putDoc
      /**A helper function to easily save a doc to the database. This
       * function return a promise of a save.
       */
      function putDoc( record , user){
          // console.log('putDoc ', record);
          var vow = VOW.make();
          console.log('In PUTDOC');
          // record.lastEdited = {
          //     id: user ? user._id: undefined,
          //     time: new Date()
          // };
          if (user) record.lastEditedBy = user._id;
          record.lastEditedAt = new Date();
          subtractTimezoneOffset(record);
          pouchDbHandle.post(record, function(err, response) {
              if (!err) {
                  // log.d('keeping put vow');
                  record._id = response.id;
                  record._rev = response.rev;
                  vow.keep(record);   
              }
              else {
                  // log.d('breaking put vow');
                  err.record = record; 
                  vow['break'](err);   
              }
          });
          return vow.promise;
      }
      
      
      //**********************************************************************
      //#DataSource
      //This implements a smartclient datasource against pouchdb
      
      // dbviews = {
      //     all: {   map : function(doc) { emit(doc,null); }
      //              ,reduce: false}
      //     ,shift: { map : function(doc) {
      //         if (doc.type === 'shift') emit(doc,null);}
      //   	    ,reduce: false}
      //     ,location: { map : function(doc) {
      //         if (doc.type === 'location') emit(doc,null);}
      //   	       ,reduce: false}
          
      //     ,person: { map : function(doc) {
      //         if (doc.type === 'person') emit(doc,null);}
      //   	     ,reduce: false}
      //     ,settingsCache: { map : function(doc) {
      //         if (doc.type === 'settings') emit(doc,null);}
      //   	       ,reduce: false}
      // };
      
      var timezoneOffset = Date.today().getTimezoneOffset();
      
          function addTimezoneOffset(obj) {
              Object.keys(obj).forEach(
	          function(k) {
                      var field = typesAndFields.getField(k);
	                  if (field) {
	                      var type = field.type;
                              if (type === 'datetime' ||
                                  type === 'time' ||
                                  type === 'date') {
                                  var d = Date.parseSchemaDate(obj[k]);
                                  obj[k]= d.addMinutes(timezoneOffset);
	                      }
                          }
                  });
          } 
      
      function subtractTimezoneOffset(obj) {
          log.d('ADDING OBJECT', obj);
          Object.keys(obj).forEach(
                  function(k) {
                      var value = obj[k];
                      if (value && value.Class && value.Class === 'Date') {
                          // log.d('FOUND DATE', value.clone().addMinutes(-timezoneOffset).toSchemaDate());
                          obj[k].addMinutes(-timezoneOffset);
                      }
                  }
          );
          return obj;
      }
      
      function typefyProps(obj) {
          Object.keys(obj).forEach(
	      function(k) {
                  var field = typesAndFields.getField(k);
	          if (field) {
	              var type = field.type;
	              switch (type) {
                        case 'enum':
                          // obj[k] = JSON.parse(obj[k]);
                          break;
                        case 'time' : 
                        case 'date' :
	                case 'datetime': 
                          // log.d('DATE CONVERSION');
                          // log.d(obj[k].toString());
	                  // var d = Date.parseStandardDate(obj[k].slice(0, obj[k].length-5));
                          // // log.d('in typefy',d);
	                  // var timezoneOffset = d.getTimezoneOffset();
                          // // timezoneOffset = 0;
	                  // obj[k] = new Date(d.getTime() - (timezoneOffset * 60000));
                          obj[k]=Date.parseSchemaDate(obj[k]);
                          // log.d(obj[k])
	                  break;
	              default: 
	              }
	          }
	          else {
	              //leave it as is
	          }
	          // log.d(k, obj[k]);
	      }
          );
      }
      
      function remove (id, dsResponse, requestId) {
          doPouch(function(db) {
	      // log.d(id);
	      db.get( id,
		      function (err,doc){
			  if (err) { log.d('ERRROR: can\'t find doc ', 
					   err.error, err.reason); 
				     return; }
                          db.remove(doc, function(err) {
                              
			      if (err) {
                                  alert('Error removing record from database. Reason: ' + err.reason);
                                  log.d('ERRROR: can\'t find doc ', 
					err.error, err.reason); 
				  return; }
			      dsResponse.data = doc;
			      if (err) log.d("could not remove doc");	
			      else  pouchDS.processResponse(requestId, dsResponse);} );});});}
      function fetch(view, dsResponse, requestId ) {
          doPouch(function(db) {
              // db.query( {map:view.map},{reduce: view.reduce},
              db.allDocs({include_docs:true},
                         function (err,response){
                             if (err) {
                                 alert('Error fetching record from database. Reason: ' + err.reason);
                                 log.d("Error from pouch fetch :", err,
                                       "resp:", response); }
			     else {
			      
			         log.d('Response in fetch is: ', response);
			         dsResponse.data=[];
			         for (var i = 0; i< response.rows.size();i++) {
				     var key=response.rows[i].doc;
                                     // log.d('calling typefy');
				     typefyProps(key); 
                                     addTimezoneOffset(key);
                                     if (key.person) {
                                         // log.d('found person', key.person);
                                         key.person = JSON.parse(key.person);    
                                     }
				     // dsResponse.data.push({ _id:key._id, _rev:key._rev, text:key.text});
				     dsResponse.data.push(key);
                                 }
			         // log.d('data: ', dsResponse.data);
			         pouchDS.processResponse(requestId, dsResponse);}});});}
      function add(data, dsResponse, requestId) {
              doPouch(function(db) {
                  // delete data._id;
                  var receivedData = isc.clone(data);
                  data = subtractTimezoneOffset(data);
                  if (data.person) data.person = JSON.stringify(data.person);
                  db.post(data,
                          function (err,response){
                              if (err) {
                                  alert('Record not added to database. Reason: ' + err.reason);
                                  log.d("Error from pouch put in add:", err,
                                        "resp:", response); }
                              else {
                                  receivedData._id = response.id; 
                                  receivedData._rev = response.rev; 
                                  dsResponse.data = receivedData;
                                  pouchDS.processResponse(requestId, dsResponse);}});
	      });
      }

      function update(data, dsResponse, requestId) {
          // log.d('data', data);
          var receivedData = isc.clone(data);
          data = subtractTimezoneOffset(data);
          if (data.person) data.person = JSON.stringify(data.person);
          doPouch(function(db) {
              db.put(data,
                     function (err,response){
                         if (err) {
                             alert('Record not updated in database. Reason: ' + err.reason);
                             log.d("Error from pouch put in update:", err,
                                   "resp:", response); }
			 else {
                             receivedData._rev = response.rev; 
                             dsResponse.data = receivedData;
			     pouchDS.processResponse(requestId, dsResponse);}});});} 
      //TODO get rid of this function, it is useless and have a module wide var called db
      function doPouch(f) {
          f(pouchDbHandle);
      }			 

      
      pouchDS = isc.DataSource.create(
          {   ID : "pouchDS",
	      fields: typesAndFields.allFields,
	      autoDeriveTitles:true,
	      dataProtocol: "clientCustom",
              // autoCacheAllData: true,
	
	      transformRequest: function (dsRequest) {
	          log.d(dsRequest);
                  // log.d(dsRequest.data);
	          var dsResponse;
	          switch (dsRequest.operationType) {
	            case "fetch":
	              var fetchView = {   map : function(doc) { emit(doc,null); }
                                          ,reduce: false};
                      // log.d('about to switch......', dsRequest);
                      // if (dsRequest.componentId === 'isc_ShiftCalendar') {
                      //     fetchView = dbviews.shift;  
	              //     log.d('in shiftCalendar', fetchView); 
                      // } 
                      // if (dsRequest.view) {
                      //     fetchView = dbviews[dsRequest.view];   
                      // }
	              log.d('fetch', fetchView); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              fetch(fetchView, dsResponse, dsRequest.requestId);
                      log.d('dsResponse', dsResponse);
	              break;
	            case "update" : 
	              log.d("update", dsRequest); 
	              log.d("old values", dsRequest.oldValues); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  errors: {},
	      
	                  status: 1};
	              update(isc.addProperties({}, dsRequest.oldValues, dsRequest.data), 
		             dsResponse, dsRequest.requestId);
	              break; 
	            case "add" : 
	              log.d('add: data', dsRequest.data);
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              add(dsRequest.data, dsResponse, dsRequest.requestId);
	              break;
	            case "remove" :
	              log.d("remove"); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              remove(dsRequest.data._id, dsResponse, dsRequest.requestId); 
	              break; 
	          default: log.d("This is unknown operation on pouchdb: ", dsRequest.operationType );
	          }
	      }
          });
      
      //****************************************************************
      //Simulation of serverside logic.
      
      //All this logging in and password verification is a bit silly
      //in this local storage db adapter since anybody can in
      //principle read the code and access the database. However it
      //deters your regular luddite. If this logic was on the server
      //side however you could still mess around with the app, but not
      //with the data on the backend server, since only authenticated
      //users could do that. That is if you implement permissions
      //checking on the server end. It would read the permissions
      //section of the settings file attached to a user and act
      //accordingly. 
      
      var defaultUserId = 'guest';
      var localUser = {
          _id: defaultUserId
          ,type: 'person'
          ,status: 'permanent'
      };
      
      // var userCriteria = {
      //     _constructor:"AdvancedCriteria",
      //     operator:"and",
      //     criteria: [personCriterion, loginCriterion]
               
      // };
      
      // var personCriterion = {
      //     fieldName: 'type',
      //     operator:'equals',
      //     value: 'person'
      // };
          
      // var loginCriterion = {
      //     fieldName: '_id',
      //     operator:'equals'
      // };
        
      
      function getUser(credentials) { 
          var vow = VOW.make();
          var login = credentials.username;
          log.d('LOGIN IS' , credentials);
          getDoc(login).when(
              function(doc) {
                  var key = new PBKDF2(credentials.password, doc.iterations, doc.salt).deriveKey();
                  
                  console.log('KEY ', credentials.password, key, doc);
                  if (!doc.derived_key ||
                      doc.derived_key === key) vow.keep(doc);
                  else vow['break']('Wrong password');
                  
              },
              function() {
                  vow['break']('A person with this login does not exist in this database:' +
                               login);
              }
          ); 
          return vow.promise;
      } 
      
      function createLoginDialog(aVow, user) {
          
          var vow = aVow;
              function checkCredentials(credentials, reportToLoginDialog) {
                  getUser(credentials).when(
                      function(anAuthenticatedUser) {
                          var authenticatedUser = anAuthenticatedUser;
                          Cookie.set('lastLogin', authenticatedUser._id,
                                     Date.today().addYears(10));
                          log.i(authenticatedUser._id + ' logged in.');
                          vow.keep(authenticatedUser);
                          reportToLoginDialog(true);
                      },
                      function(err) {
                          log.w(err);
                          reportToLoginDialog(false);
                      }
                  );
              }
      
          function showLoginDialog() {
              log.d(user);
	      isc.showLoginDialog(checkCredentials,
			          {username: user._id, password: '',
			           dismissable:true});
          } 
          
          return {
              show: showLoginDialog
          };
      }
      
      function changeUserInternal(user) {
          var vow = VOW.make();
          createLoginDialog(vow, user).show();
          return vow.promise;
      }
      
      function set(vow, userId) {
          getDoc(userId).when(
              function(user) {
                  if (!user.derived_key) {
                      log.i(user._id + ' logged in (no pwd).');
                      vow.keep(user);
                  }
                  else  createLoginDialog(vow, user).show();
              },
              function() {
                  if (userId === defaultUserId) {
                      putDoc(localUser, localUser).when(
                          function() {
                              log.d('Created local guest user..');
                              newDatabase = true;
                              vow.keep(localUser);
                          },
                          vow['break']
                      );
                      
                  }
                  else createLoginDialog(vow, defaultUserId).show();
              }
          ); 
      }
      
      function autoLoginInternal() {
          //promises a user
          var vow = VOW.make();
          Cookie.get('lastLogin').when(
              function(userId) {
                  set(vow, userId);
              }
              ,function() {
                  //try to login as guest user
                  set(vow, defaultUserId);     
              }
          );
          return vow.promise;
      }
      
      function changeUser(user) {
          if (url.startsWith('http')) {
              return authWindow.show('identify');
          }
          else return changeUserInternal(user);
      }

      //returns promise of user
      function autoLogin() {
          if (url.startsWith('http')) {
              return authWindow.show('identify');
          }
          else return autoLoginInternal();
      }
      
      //##getSettings
      /**Get settings by type (look, behaviour or permissions) *
         referenced by the authenticated user. The database backend * is
         the guardian of these settings and will only hand out *
         settings belonging to an authenticated user. Once these *
         settings are handed over a clever hacker can have complete *
         freedom in how he wants the app to behave (after reverse *
         engineering the app, so going back to source state) If he * has
         permission to save data to the database will be able to *
         corrupt the database to some extent. It all depends on how *
         precise the permissions are and to what extent the backend *
         checks these permissions before altering the database. The *
         only thing that is controllable is what gets saved to and *
         retrieved from the database, and the authentication of a *
         user. How the front end responds to settings is not *
         controllable ultimately, but depends on the *
         implementation. My original source code will behave * properly,
         but the server doesn't know what frontend it is * communicating
         with. So any security measures at the front * end are best
         effort till browsers can receive and execute * key encrypted
         source code. But the server can be locked down. Couchdb
         security consists of letting people have access to databases
         based on id and role, assigned by an admin.
      */

      var descriptions = [
          {
              name: 'couchDB',
              shortDescr: 'External (CouchDB)',
              description: 'The data will be stored in a standalone database server called CouchDb. This server can run on your local machine or on the internet somewhere. <p>You will have to specify an url such as http://localhost:5984/dbname or http://yourcouch.iriscouch.com/dbname, where 5984 is the port. You can set up a local CouchDB database that syncs with a master database on the net. Your app will then work when there is no internet connectivity. Also latency will be less.<p>Clicking the OK button will refresh the page and the app will load the database selected/created.',
              // urlPrefix: 'http://',
              urlPrefix: '',
              adapter: 'pouchDB',
              promptUrl: 'http://multicapdb.iriscouch.com',
              prompt: '',
              defaultUrls: [
                  'https://multicapdb.iriscouch.com',
                  'http://localhost:5984',
                  'http://multicap.ic.ht:5984'
                  // 'http://multicapdb.iriscouch.com'
              ]
          }
          ,{
              name: 'pouchDB',
              shortDescr: 'Internal (PouchDB)',
              description: 'Select/create a database. These databases are stored locally in the browser. You can have multiple databases per browser. These are persisted across refreshes of the page, and across restarts of the browser. <p>If it is a new database you can login as guest and leave password blank, a default guest user will be created<p>If you use a standalone Chrome browser you can start this app from wherever you are storing the browser. Your could store the standalone browser on a USB stick for instance and open the app on another computer and work with the same data, even if that computer has no internet access. PouchDB is under development and not recommended for production use. Use it to experiment or to use the app as a standalone rostering system. In time this should function as a regular external CouchDB, so it will be able to sync to other CouchDB databases.<p>Clicking the OK button will refresh the page and the app will load the database selected/created.',
              urlPrefix: '',
              adapter: 'pouchDB',
              prompt: 'db'
          }
      ];
      
      var valueMap = {};
      var dbDescriptions = {};
      
      descriptions.forEach(function(d) {
          dbDescriptions[d.name] = d;
          valueMap[d.name] = d.shortDescr;
      });
      
      var self = {
          // name: 'pouchDB'
          // ,shortName: 'Browser local storage (idb)'
          // ,description: 'The data will '
          getDS: function() { return pouchDS; }
          // ,urlPrefix: 'idb://' 
          
          ,init: init
          
          ,getDoc: getDoc
          ,putDoc: putDoc
          
          ,autoLogin: autoLogin
          ,changeUser: changeUser
          ,getUrl: getUrl
          ,isNew : function() {
              return newDatabase;
          }
          ,getDbDescriptions: function() { return dbDescriptions; }
          ,getDescriptions: function() { return descriptions; }
          ,getValueMap: function() { return valueMap; }
      };
      
      return self;
  }});
