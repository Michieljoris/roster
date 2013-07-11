/*global VOW:false Cookie:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['views/db_management/db_utils', 'user', 'lib/couchapi'
            ],
   factory: function( db_utils, user, couch)
    { "use strict";
      
      var log = logger('pickDbWindow');
      var dbDescriptions;
      // var url;
      var vow;
      var backend;
      var state = {
          backendName: 'couchDB'
          // idbName: 'db',
          // dbName: 'waterfordwest',
          // url: 'http://multicapdb.iriscouch.com'
      };
      
      var urlValuemap = [
          // 'https://multicapdb.iriscouch.com',
          // 'http://localhost:5984',
          // 'http://multicap.ic.ht:5984'
          // 'http://multicapdb.iriscouch.com'
      ];
      
      var currentDbLabel = isc.Label.create({
          // ID:'test',
          width: 400,
          height: 10
          ,margin: 10
          // ,border: "1px dashed blue"
          // ,contents: 'hello'
      });
      
      function checkCredentials() {
          var user = identifyForm.getValue('userName');
          var pwd = identifyForm.getValue('pwd');
          console.log(user, pwd);
          
          var url = backend.getUrl();
          var path = url.slice(0, url.lastIndexOf('/'));
          var db = url.slice(url.lastIndexOf('/') + 1);
          couch.init(path);
          couch.login(user, pwd).when(
              function() {
                  console.log('Authenticated!!', user, db);
                  return couch.docGet(user, db);
              }
          ).when(
              vow.keep,
              function(data) {
                  console.log(data);
              }
          );
      }
      
      
      function checkUrl(form, url) {
          log.d('Looking for dbs in ' + url);
          if (!urlValuemap) urlValuemap = [];
          db_utils.getAllDbs(url).when(
              function(values) {
                  form.getField('dbName').setValueMap(values);
                  form.getField('dbName').setHint('updated');
                  form.getField('url').setHint('');
                  setTimeout(function() {
                      form.getField('dbName').setHint('');
                  }, 3000);
                  var index = urlValuemap.indexOf(url);
                  if (index === -1) urlValuemap.push(url);
                  form.getField('url').setValueMap(urlValuemap);
                  //TODO store this urlvaluemap in a cookie
              } 
              ,function() {
                  //TODO give error in alert when not found.
                  var index = urlValuemap.indexOf(url);
                  if (index !== -1)
                      isc.ask('Not a valid url.<p> Do you want to remove it from the list of urls?',
                              function(yes) {
                                  if (yes) {
                                      urlValuemap.removeAt(index);
                                      form.getField('url').setValueMap(urlValuemap);
                                  }
                              });
                  else {
                      form.getField('url').setHint('not valid');
                      setTimeout(function() {
                          form.getField('url').setHint('');
                      }, 3000);
                  }
                  
              }
          );
          
      }
      
      function setUrlAndName(state) {
          if (state.backendName === 'pouchDB') {
              pickDbForm.getField('idbName').show(); 
              pickDbForm.getField('dbName').hide(); 
              pickDbForm.getField('url').hide(); 
              pickDbForm.getField('isInternal1').hide(); 
              pickDbForm.getField('isInternal2').show(); 
              pickDbForm.getField('isInternal1').setValue(true); 
              pickDbForm.getField('isInternal2').setValue(true); 
              pickDbForm.getField('idbName').setValue(state.idbName);
          }
          else {
              pickDbForm.getField('idbName').hide(); 
              pickDbForm.getField('dbName').show(); 
              pickDbForm.getField('url').show();    
              pickDbForm.getField('isInternal1').setValue(false); 
              pickDbForm.getField('isInternal2').setValue(false); 
              pickDbForm.getField('isInternal2').hide(); 
              pickDbForm.getField('isInternal1').show(); 
              pickDbForm.getField('dbName').setValue(state.dbName);
          }
          
          pickDbForm.getField('url').setValue(state.url);
          pickDbForm.getField('backendName').setValue(state.backendName);
          var description = dbDescriptions[state.backendName];
          description =  description || {};
          helpLabel.setContents(description.description);
          
      }

      var pickDbForm = isc.DynamicForm.create({
          // ID: 'myform',
          margin:5,
          // height: 100,
          columns: 2
          ,fields: [
              // { editorType: 'TextItem', name: 'userName', title: 'User', titleOrientation: 'top', startRow: true}
              // ,{ editorType: 'PasswordItem', name: 'pwd', title: 'Password', titleOrientation: 'top', startRow: true},
              { editorType: 'comboBox', name: 'url', title: 'Url',
                titleOrientation: 'top', startRow: true, width: 300,
                change: function () {
                    // view.modified();
                    var url = state.url = arguments[2];
                    checkUrl(pickDbForm, arguments[2]);
                }
              }
              ,{  type: 'checkbox', title: 'Use internal database', name: "isInternal1",
                  showTitle: true, 
                  titleOrientation: 'top' 
                  // ,startRow: true
                  ,width: 130 
                  ,visibility: 'visible'
                  ,change: function() {
                      state.backendName = arguments[2] ? 'pouchDB' : 'couchDB';
                      setUrlAndName(state);
                      pickDbForm.getField('backendName').setValue(state.backendName);
                  }
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     // view.modified();
                     state.dbName = arguments[2];
                 }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickDbForm.getField('url').getValue();
                         state.url = url;
                         checkUrl(pickDbForm, url);
                     }
                 }]
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     // view.modified();
                     state().idbName = arguments[2];
                 }
               }
              
              ,{  type: 'checkbox', title: 'Use internal database', name: "isInternal2",
                  showTitle: true, 
                  titleOrientation: 'top' 
                  // ,startRow: true
                  ,width: 130 
                  ,visibility: 'visible'
                  ,change: function() {
                      
                      state.backendName = arguments[2] ? 'pouchDB' : 'couchDB';
                      setUrlAndName(state);
                      pickDbForm.getField('backendName').setValue(state.backendName);
                  }
               }
              
              ,{  type: 'radioGroup', title: 'Select storage location', name: "backendName",
                  showTitle: false, 
                  titleOrientation: 'top' 
                  ,startRow: true
                  ,vertical:false
                  ,width: 300
                  ,visible: false
                  ,change: function() {
                      state.backendName = arguments[2];
                      setUrlAndName(state);
                  }
               }
          ]
      });
      
      
      var identifyForm = isc.DynamicForm.create({
          // ID: 'dbform',
          margin:5,
          // height: 100,
          columns: 1
          ,fields: [
              { editorType: 'TextItem', name: 'userName', title: 'User', titleOrientation: 'top', startRow: true}
              ,{ editorType: 'PasswordItem', name: 'pwd', title: 'Password', titleOrientation: 'top', startRow: true}
          ]
      });
      
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 460,
          height: 210,
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      
      var identifyHelp = isc.Label.create({
          // ID:'test',
          width: 460,
          height: 210,
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      function connect() {
          var url ;
          var backendName = pickDbForm.getValue('backendName');
          // var userName = pickDbForm.getValue('userName');
          if (backendName === 'pouchDB') {
              url = pickDbForm.getValue('idbName');
          }
          else {
              url = pickDbForm.getValue('url');
              if (!url.endsWith('/')) url += '/';
              url += pickDbForm.getValue('dbName');
          }
          var urlPrefix = dbDescriptions[backendName].urlPrefix;
          if (url.startsWith(urlPrefix)) urlPrefix = '';
          url = urlPrefix + url;
          var adapter = dbDescriptions[backendName].adapter;
                                    
          VOW.every([
              Cookie.set('backendName', adapter, Date.today().addYears(10))
              // Cookie.set('lastLogin', userName, Date.today().addYears(10))
              ,Cookie.set('backendUrl', url, Date.today().addYears(10))]
                   ).when(
                       function() { log.d('Saved backend cookie.');
                                    location.reload();
                                  }
                       ,function() {
                           log.e('Unable to set the backend or url cookie!!'); }
                   );
      }
      
      var connectButton = isc.Button.create({
          title: 'Connect'
          // ,visibility: cancellable ? 'inherit' : 'hidden'
          // ,startRow: false
          ,click: function() {
              connect();
          }  
      });
      
      var loginButton = isc.Button.create({
          title: 'Login'
          // ,visibility: cancellable ? 'inherit' : 'hidden'
          // ,startRow: false
          ,click: function() {
              editorWindow.hide();
              checkCredentials();
          }  
      });
      
      
      var identifyLayout =isc.VLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          // border: "1px dashed blue",
          height: 340,
          width: 470,
          // autoSize: true,
          members: [
              identifyForm
              ,loginButton
              ,identifyHelp
          ]});
      
      var connectLayout =isc.VLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          // border: "1px dashed blue",
          height: 340,
          width: 470,
          // autoSize: true,
          members: [
              pickDbForm
              ,connectButton
              ,helpLabel
          ]});
      
      var tabSet = isc.TabSet.create({
          // ID: "tabSet",
          tabBarPosition: "top",
          tabBarAlign: "right",
          width: '490',
          height: '380',
          // autoSize: true,
          tabSelected: function() {
              var tab = arguments[4];
              console.log(tab);
              if (tab === 'identify') {
                  if (user.isLoggedIn()) logoutButton.setVisibility('inherit');
              }
              else {
                  logoutButton.setVisibility('hidden');
              }
          },
          tabs: [
              {title: "Identify", icon: "person.png", iconSize:16, name: 'identify',
               pane: identifyLayout },
              {title: "Connect", icon: "sync.png", iconSize:16, name: 'connect',
               pane: connectLayout }
          ]
      });

      
      var logoutButton = isc.Button.create({
          title: 'Logout'
          // ,visibility: cancellable ? 'inherit' : 'hidden'
          // ,startRow: false
          ,click: function() {
              user.logOut();
              cancelButton.setVisibility('hidden');
              logoutButton.setVisibility('hidden');
              loginButton.setVisibility('inherit');
              identifyForm.setVisibility('inherit');
              
              var url = backend.getUrl();
              currentDbLabel.setContents('Currently <b><i>'+ 'nobody' + '</i></b> is logged in at <b><i>' + url + '</i></b>' + 
                                         (!url.startsWith('http') ? ' (internal)' : '') );
              //TODO wipe cookie
              
          }  
      });
      
      var cancelButton = isc.Button.create({
          title: 'Cancel'
          // ,visibility: cancellable ? 'inherit' : 'hidden'
              // ,startRow: false
          ,click: function() {
              editorWindow.hide();
              vow.break("No credentials provided..");
          }  
      });
      // window.cancelButton = connectButton;
      
      var editorWindow = isc.Window.create({
          title: ""
          ,autoSize: true
          // ,height: 490
          // ,width: 500
          ,headerIconDefaults: { width:16, height:16, src: 'sync.png'}
          ,canDragReposition: true
          ,canDragResize: false
          ,layoutMargin:20
          ,showMinimizeButton:false
          ,showCloseButton:false
          ,autoCenter: true
          ,isModal: true
          ,showModalMask: true
          ,autoDraw: false
          ,items: [
              tabSet
              // ,helpLabel
              ,currentDbLabel
              ,isc.HLayout.create({
                  layoutMargin: 6,
                  membersMargin: 6,
                  // border: "1px dashed blue",
                  height: 20,
                  width: 490,
                  members: [
                      logoutButton
                      ,isc.LayoutSpacer.create()
                      ,cancelButton
                      // ,isc.LayoutSpacer.create()
                  ]
              })
          ] 
      });
      
      
      
      var initialized = false; 
      function init() {
          dbDescriptions = backend.getDbDescriptions();
          var backendNames = backend.getValueMap(); 
          pickDbForm.getField('backendName').setValueMap(backendNames);
          //TODO get this urlValuemap from a cookie
          urlValuemap = dbDescriptions.couchDB.defaultUrls;
          pickDbForm.getField('url').setValueMap(urlValuemap);
          state.idbName = state.idbName || dbDescriptions.pouchDB.prompt;
          state.dbName = state.dbName || dbDescriptions.couchDB.prompt;
          state.url = state.url || dbDescriptions.couchDB.promptUrl;
              
          db_utils.getAllDbs('idb').when(
              function(values) {
                  // console.log('VALUES', values);
                  pickDbForm.getField('idbName').setValueMap(values);
              } 
          );
          var url = backend.getUrl();
          setUrlAndName(state);
          identifyHelp.setContents(user.getHelpText(url.startsWith('http') ? 'couch' : 'pouch'));
              
          currentDbLabel.setContents('Currently <b><i>'+ user.getName() + '</i></b> is logged in at <b><i>' + url + '</i></b>' + 
                                     (!url.startsWith('http') ? ' (internal)' : '') );
          initialized = true;
      }
      
      return {
          setBackend: function(aBackend) {
              backend = aBackend;
          },
          show: function(tab) {
              vow = VOW.make();
              if (!initialized) init();
              tabSet.selectTab(tab);
              editorWindow.show();
              if (user.isLoggedIn()) {
                  if (tab === 'identify')
                      logoutButton.setVisibility('inherit');   
                  loginButton.setVisibility('hidden');   
                  identifyForm.setVisibility('hidden');
                  cancelButton.setVisibility('inherit');
              }
              else {  logoutButton.setVisibility('hidden');   
                      loginButton.setVisibility('inherit');   
                      identifyForm.setVisibility('inherit');
                      cancelButton.setVisibility('hidden');
                   }
              return vow.promise;
          }
      };
      
    }});