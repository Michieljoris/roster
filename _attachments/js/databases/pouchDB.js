/*global  Cookie:false VOW:false Pouch:false logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/

define
({inject: ['types/typesAndFields',  "authWindow", 'lib/couchapi', 'user'],
  factory: function(typesAndFields,  authWindow, couch, userManager) {
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
                  console.log('error getting database info', err);
                  isc.warn('Couldn\'t open database ' + idbname +  '<br><br>' +
                           'Status: ' + err.status + '<br>' +
                           (err.error ? 'Error: ' + err.error + '<br><br>':'') +
                           (err.reason ? 'Error: ' + err.reason + '<br><br>':'') +
                           (err.status === 0 ? 'CouchDB might not be running or not configured properly<br><br>' : '') +
                           (err.status === 404 ? 'Database doesn\'t exist.<br><br>': '') +
                           (err.status === 401 ? 'You are not authorized<br><br>': '') +
                           (err.status === 0 ? 'Loading default internal database.<br><br>' : '') +
                           'Click on the left top button in the app to connect to another database.'
                          );
                  if (err.status === 401) {
                      log.d('pouchDB is not ready, unauthorized');
                      url= idbname;
                      authWindow.show('authorize', self).when(
                          function() {
                              location.reload();
                          }
                      );
                      
                      return;
                      
                      // vow.keep(self);
                      // return;
                  }
                  
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
          var vow = VOW.make();
          if (!record)  
              vow['break']('Can not get doc with undefined id');
          else if (record._id) vow.keep(record);
          else pouchDbHandle.get(record, function(err, doc) {
              if (!err) {
                  addTimezoneOffset(doc);
                  vow.keep(doc);   
              }
              else {
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
          var vow = VOW.make();
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
      
      function stringifyEnums(obj) {
          Object.keys(obj).forEach(
	      function(k) {
                  var field = typesAndFields.getField(k);
	          if (field) {
	              var type = field.type;
	              switch (type) {
                        case 'enum':
                          obj[k] = JSON.stringify(obj[k]);
                          break;
                        case 'array':
                          obj[k] = JSON.stringify(obj[k]);
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
      
      function typefyProps(obj) {
          Object.keys(obj).forEach(
	      function(k) {
                  var field = typesAndFields.getField(k);
	          if (field) {
	              var type = field.type;
	              switch (type) {
                        case 'enum':
                          obj[k] = JSON.parse(obj[k]);
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
                                     // if (key.person) {
                                         // log.d('found person', key.person);
                                         // key.person = JSON.parse(key.person);    
                                     // }
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
              // if (data.person) data.person = JSON.stringify(data.person);
              stringifyEnums(data);
              console.log('saving data:', data);
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
          // if (data.person) data.person = JSON.stringify(data.person);
          stringifyEnums(data);
          
          console.log('updating data:', data);
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
      
      function saveUser(data) {
          if (!url.startsWith('http')) return;
          if (!data || data.type !== 'person' || !data.derived_key) return;
          var user = {
              _id: 'org.couchdb.user:' + data._id
              ,name: data._id
              ,type: 'user'
              ,derived_key: data.derived_key
              ,password_scheme: data.password_scheme
              ,iterations: data.iterations
              ,salt: data.salt
              ,roles:data.roles
          };
          var result;
          var vow = VOW.make();
          getDoc(user._id).when(
              function(data) {
                  user._rev = data._rev;
                  vow.keep(user);
              },
              function(error) {
                  vow.keep(user);
              }
          );
          vow.promise.when(
              function(user) {
                  return putDoc(user);
              }
          ).when(
              function(data) {
                  console.log('successfully saved user ' + user.name);
              },
              function(error) {
                  alert('failed to save couchdb user ' + user.name); 
                  console.log('failed to save user ' + user.name, error);
              }
          );
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
                      saveUser(dsRequest.data);
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
                      saveUser(dsRequest.data);
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
      
      
      //used to select out the available users
      isc.DataSource.addSearchOperator({
          condition: function (value, record, fieldName, criterion, operator) {
              var op1 = record[fieldName];
              var op2 = value;
              if (typeof op1 === 'string' || typeof op1 === 'number') op1 = [op1];
              if (!isc.isAn.Array(op1)) return false;
              if (typeof op2 === 'string' || typeof op2 === 'number') op2 = [op2];
              if (!isc.isAn.Array(op2)) return false;
              var intersect = op1.intersect(op2);
              return intersect.length > 0;
              //     return isc.isAn.Array(record[fieldName]) && record[fieldName].indexOf(value) !== -1;
          }
          ,ID: "intersect"
          ,fieldType: 'custom'
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
      
      // var defaultUserId = 'guest';
      var defaultUser = {
          _id: 'guest'
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
        
      
      // function getUser(credentials) { 
      //     var vow = VOW.make();
      //     var login = credentials.username;
      //     log.d('LOGIN IS' , credentials);
      //     getDoc(login).when(
      //         function(doc) {
      //             var key = new PBKDF2(credentials.password, doc.iterations, doc.salt).deriveKey();
                  
      //             console.log('KEY ', credentials.password, key, doc);
      //             if (!doc.derived_key ||
      //                 doc.derived_key === key) vow.keep(doc);
      //             else vow['break']('Wrong password');
                  
      //         },
      //         function() {
      //             vow['break']('A person with this login does not exist in this database:' +
      //                          login);
      //         }
      //     ); 
      //     return vow.promise;
      // } 
      
      // function createLoginDialog(aVow, user) {
          
      //     var vow = aVow;
      //         function checkCredentials(credentials, reportToLoginDialog) {
      //             getUser(credentials).when(
      //                 function(anAuthenticatedUser) {
      //                     var authenticatedUser = anAuthenticatedUser;
      //                     Cookie.set('lastLogin', authenticatedUser._id,
      //                                Date.today().addYears(10));
      //                     log.i(authenticatedUser._id + ' logged in.');
      //                     vow.keep(authenticatedUser);
      //                     reportToLoginDialog(true);
      //                 },
      //                 function(err) {
      //                     log.w(err);
      //                     reportToLoginDialog(false);
      //                 }
      //             );
      //         }
      
      //     function showLoginDialog() {
      //         log.d(user);
      //         isc.showLoginDialog(checkCredentials,
      //   		          {username: user._id, password: '',
      //   		           dismissable:true});
      //     } 
          
      //     return {
      //         show: showLoginDialog
      //     };
      // }
      // function set(vow, userId) {
      //     getDoc(userId).when(
      //         function(user) {
      //             if (!user.derived_key) {
      //                 log.i(user._id + ' logged in (no pwd).');
      //                 vow.keep(user);
      //             }
      //             // else  createLoginDialog(vow, user).show();
      //             else  authWindow.show('identify', vow, user._id).show();
      //         },
      //         function() {
      //             if (userId === defaultUser._id) {
      //                 putDoc(defaultUser, defaultUser).when(
      //                     function() {
      //                         log.d('Created default user (guest)..');
      //                         vow.keep(defaultUser);
      //                     },
      //                     vow['break']
      //                 );
                      
      //             } else authWindow.show('identify', vow,
      //             defaultUser).show(); // else
      //             createLoginDialog(vow, defaultUser).show(); } );
      //             }


      
      function changeUser() {
          return authWindow.show('identify', self);
      }
      
      function loginUser(name, pwd) {
          pwd = pwd || name;
          var vow = VOW.make();
          couch.login(name,pwd).when(
              function(data) {
                  authWindow.setAuthenticated();
                  vow.keep({ name: name });
              },
              function(err) {
                  vow.breek();
              }
          );
          return vow.promise;
      }
      
      // The proper security lies with CouchDB. By authenticating
      // against it we can get read and/or write access to its data. On
      // top of this I put a light veneer of additional security by
      // requiring the user to identify himself, so I can keep logs and
      // hand out permissions if I wanted to. But a user does not have
      // to be logged in to read/write the databases. In the case of
      // pouch really not, and in the case of couch not as far as it is
      // not locked down.  I just make it look like it is necessary in
      // both cases.

      //returns promise of user
      function autoLogin() {
          function getLastLoginVows() {
              var vows = [ Cookie.get('lastLogin'), VOW.kept(defaultUser._id)];
              if (url.startsWith('http')) {
                  var path = url.slice(0, url.lastIndexOf('/'));
                  couch.init(path);
                  vows.push(couch.session());
              }
              return vows;
          }
          var vow = VOW.make();
          console.log('autologin');
          var userName;
          VOW.any(getLastLoginVows()).when(
              function(array) {
                  console.log('ANY', array);
                  var defaultUserId = array[1];
                  var lastLogin = array[0];
                  var session = array[2];
                  if (url.startsWith('http')) {
                      if (session && session.userCtx.name) {
                          if (lastLogin !== session.userCtx.name) {
                              userName = defaultUserId;
                              //try to authenticate against couchdb
                              //with the default user and password
                              return loginUser(userName);
                          }
                          else {
                              userName = session.userCtx.name;
                              authWindow.setAuthenticated();
                          }
                      } 
                      else {
                          userName = defaultUserId;
                          //try to authenticate against couchdb
                          //with the default user and password
                          return loginUser(userName);
                      }
                  }
                  else if (lastLogin) userName =lastLogin;
                  else userName = defaultUserId;
                  return VOW.kept({ name: userName });
              }).
              when(
                  function(userMeta) {
                      return getDoc(userMeta.name);
                  }
              ).
              when(
                  function(user) {
                      console.log('Found user', user);
                      //we've been able to retrieve the user doc
                      //If our backend is couch we consider ourselves logged in
                      if (url.startsWith('http')) return userManager.init(user);
                      else {
                          //If our backend is pouch and there is no pwd, we're
                          //also logged in
                          if (!user.derived_key) return userManager.init(user);
                          //else prompt for the pwd hashed into the user doc
                          //(if only we could make the next line immutable..)
                          else  return authWindow.show('identify', self);
                      }
                      //The above 3 calls always keep the vow
                  }).
              when(
                  vow.keep,
                  function(error) {
                      console.log('Couldn\'t find user doc:' ,error);
                      //Whatever userName was used, its doc wasn't
                      //there. This could be a new database or locked
                      //down.  To give authWindow a chance we will
                      //first try to create a defaultUser
                      getDoc(defaultUser._id).when(
                          function(user) {
                              if (!user.derived_key) return userManager.init(user);
                              else return authWindow.show('identify', userName);
                          }).when(
                              vow.keep,
                              function() {
                                  putDoc(defaultUser, defaultUser).when(
                                      function() {
                                          newDatabase = true;
                                          log.d('Created default user (guest)..');
                                          userManager.init(defaultUser).when( vow.keep );
                                          // vow.keep(defaultUser);
                                      },
                                      function() {
                                          authWindow.show('authorize',self).when(
                                              function() {
                                                  location.reload();
                                              }
                                          );
                                      });
                              });
                  });
          return vow.promise;
      }
      // if (url.startsWith('http')) {
      //     // var db = url.slice(url.lastIndexOf('/') + 1);
      //     couch.session().when(
      //         function(data) {
      //             return getDoc(data.userCtx.userName);
      //         }
      //     ).when(
      //         vow.keep,
      //         function(data) {
      //             console.log('no session!', data);
      //             authWindow.show('identify', vow);
      //         }
      //     );
      // }
      // else {
      //     Cookie.get('lastLogin').when(
      //         function(userId) {
      //             set(vow, userId);
      //         }
      //         ,function() {
      //             //try to login as default user
      //             set(vow, defaultUser._id);     
      //         }
      //     );
              
      // }
      // return vow.promise;
      // }
      
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
              description: 'The data will be stored in a standalone database server called CouchDb. This server can run on your local machine or on the internet somewhere. <p>You will have to specify an url such as http://localhost:5984/dbname or http://yourcouch.iriscouch.com/dbname, where 5984 is the port. You can set up a local CouchDB database that syncs with a master database on the net. Your app will then work when there is no internet connectivity. Also latency will be less.<p>Clicking the Connect button will refresh the page and the app will load the database selected/created.',
              // urlPrefix: 'http://',
              urlPrefix: '',
              adapter: 'pouchDB',
              promptUrl: 'http://multicapdb.iriscouch.com',
              prompt: '',
              defaultUrls: [
                  'http://localhost:5984',
                  'https://multicapdb.iriscouch.com',
                  'http://multicap.ic.ht:5984'
                  // 'http://multicapdb.iriscouch.com'
              ]
          }
          ,{
              name: 'pouchDB',
              shortDescr: 'Internal (PouchDB)',
              description: 'Select/create a database. These databases are stored locally in the browser. You can have multiple databases per browser. These are persisted across refreshes of the page, and across restarts of the browser. <p>If it is a new database you can login as guest and leave password blank, a default guest user will be created<p>If you use a standalone Chrome browser you can start this app from wherever you are storing the browser. Your could store the standalone browser on a USB stick for instance and open the app on another computer and work with the same data, even if that computer has no internet access. PouchDB is under development and not recommended for production use. Use it to experiment or to use the app as a standalone rostering system. In time this should function as a regular external CouchDB, so it will be able to sync to other CouchDB databases.<p>Clicking the Connect button will refresh the page and the app will load the database selected/created.',
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
          ,changeUser: changeUser
          
          ,autoLogin: autoLogin
          // ,changeUser: changeUser
          ,getUrl: getUrl
          ,isNew : function() {
              return newDatabase;
          }
          ,getDbDescriptions: function() { return dbDescriptions; }
          ,getDescriptions: function() { return descriptions; }
          ,getValueMap: function() { return valueMap; }
      };
      window.mypouch = self;
      return self;
  }});
