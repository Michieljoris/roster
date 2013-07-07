/*global VOW:false Cookie:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['loaders/backend', 'views/db_management/db_utils'
            ],
   factory: function(backend, db_utils)
    { "use strict";
      
      var log = logger('pickDbWindow');
      var dbDescriptions;
      var url;
      var state = {
                  backendName: 'couchDB',
                  idbName: 'db',
                  dbName: 'waterfordwest',
                  url: 'http://multicapdb.iriscouch.com'
      };
      
      var urlValuemap = [
          'https://multicapdb.iriscouch.com',
          'http://localhost:5984',
          'http://multicap.ic.ht:5984'
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
      
        
      
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 400,
          height: '100%',
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      
      function checkUrl(form, url) {
          log.d('Looking for dbs in ' + url);
          // var state = view.getState();
          if (!urlValuemap) urlValuemap = [];
          var isListed;
          // var url = url;
              db_utils.getAllDbs(url).when(
                  function(values) {
                      form.getField('dbName').setValueMap(values);
                      // form.getField('dbName').showPickList();
                      console.log('dbName valuemap has been set..');
                      // form.getField('url').setHint('url added');
                      form.getField('dbName').setHint('updated');
                      form.getField('url').setHint('');
                      setTimeout(function() {
                          form.getField('dbName').setHint('');
                      }, 3000);
                      // log.d(index, url, urlValuemap);
                      // log.d('log.d');
                      // console.log('console');
                          var index = urlValuemap.indexOf(url);
                      if (index === -1) urlValuemap.push(url);
                      // log.d(index, url, urlValuemap);
                      form.getField('url').setValueMap(urlValuemap);
                      //TODO store this urlvaluemap in a cookie
                      // isc.say('Database name dropdown box set to found databases.');
                  } 
                  ,function() {
                      //TODO give error in alert when not found.
                      // if (!state['urlValuemap' + postFix]) state['urlValuemap' + postFix] = [];
                      // if (!urlValuemap) urlValuemap = [];
                      // var index = urlValuemap.indexOf(url);
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
                          // form.getField('dbName').setHint('updated');
                      }
                  
                  }
              );
          
      }
      
      function setUrlAndName(state) {
          if (state.backendName === 'pouchDB') {
              pickDbForm.getField('idbName').show(); 
              pickDbForm.getField('dbName').hide(); 
              pickDbForm.getField('url').hide(); 
              pickDbForm.getField('idbName').setValue(state.idbName);
          }
          else {
              pickDbForm.getField('idbName').hide(); 
              pickDbForm.getField('dbName').show(); 
              pickDbForm.getField('url').show();    
              pickDbForm.getField('dbName').setValue(state.dbName);
          }
          
          pickDbForm.getField('url').setValue(state.url);
          pickDbForm.getField('backendName').setValue(state.backendName);
          var description = dbDescriptions[state.backendName];
          description =  description || {};
          helpLabel.setContents(description.description);
          
      }

      var pickDbForm = isc.DynamicForm.create({
          // ID: 'dbform',
          margin:10,
          columns: 1
          ,fields: [
              { editorType: 'TextItem', name: 'userName', title: 'User', titleOrientation: 'top', startRow: true}
              // ,{ editorType: 'PasswordItem', name: 'pwd', title: 'Password', titleOrientation: 'top', startRow: true}
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     // view.modified();
                     url = state.url = arguments[2];
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
                         url = pickDbForm.getField('url').getValue();
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
              ,{  type: 'checkbox', title: 'Internal database', name: "isInternal",
                  showTitle: true, 
                  titleOrientation: 'top' 
                  ,startRow: true
                  ,width: 300
                  ,visibility: 'visible'
                  ,change: function() {
                      state.backendName = arguments[2] ? 'pouchDB' : 'couchDB';
                      setUrlAndName(state);
                      pickDbForm.getField('backendName').setValue(state.backendName);
                  }
               }
          ]
      });
      
      
      
      var editorWindow = isc.Window.create({
          title: "Select a database backend."
          // ,autoSize: true
          ,height:470
          ,width:450
          ,canDragReposition: false
          ,canDragResize: false
          ,layoutMargin:20
          ,showMinimizeButton:false
          ,showCloseButton:false
          ,autoCenter: true
          ,isModal: true
          ,showModalMask: true
          ,autoDraw: false
          ,items: [
              currentDbLabel,
              pickDbForm
              ,helpLabel
              ,isc.HLayout.create({
                  layoutMargin: 6,
                  membersMargin: 6,
                  // border: "1px dashed blue",
                  height: 20,
                  width:'100%',
                  members: [
                      isc.LayoutSpacer.create()
                      ,isc.Button.create({
                          title: 'Cancel'
                          // ,visibility: cancellable ? 'inherit' : 'hidden'
                          // ,startRow: false
                          ,click: function() {
                              editorWindow.hide();
                          }  
                      })
                      ,isc.Button.create({
                          title: 'Ok'
                          ,startRow: false
                          ,click: function() {
                              // var databaseName = pickDbForm.getValue('databaseName'); 
                              // var databaseName = 'pouchDB';
                              var url;
                              var backendName = pickDbForm.getValue('backendName');
                              var userName = pickDbForm.getValue('userName');
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
                              // log.d('hello',urlPrefix, databaseName);
                              url = urlPrefix + url;
                              // backend.set(databaseName);
                              var adapter = dbDescriptions[backendName].adapter;
                                    
                              VOW.every([
                                  Cookie.set('backendName', adapter, Date.today().addYears(10)),
                                  Cookie.set('lastLogin', userName, Date.today().addYears(10))
                                  ,Cookie.set('backendUrl', url, Date.today().addYears(10))]
                                       ).when(
                                           function() { log.d('Saved backend cookie.');
                                                        location.reload();
                                                      }
                                           ,function() {
                                               log.e('Unable to set the backend or url cookie!!'); }
                                       );
                          }  
                      })
                            
                      ,isc.LayoutSpacer.create()
                  ]
              })
          ] 
      });
      // editorWindow.show();
      return {
          init: function() {
              dbDescriptions = backend.getDbDescriptions();
              var backendNames = backend.getValueMap(); 
              pickDbForm.getField('backendName').setValueMap(backendNames);
              //TODO get this urlValuemap from a cookie
              pickDbForm.getField('url').setValueMap(urlValuemap);
              // console.log('backendNames:',backendNames);
              
              db_utils.getAllDbs('idb').when(
                  function(values) {
                      // console.log('VALUES', values);
                      pickDbForm.getField('idbName').setValueMap(values);
                  } 
              );
              // backendName = backend.getName();
              // log.pp(dbDescriptions);
              url = backend.get().getUrl();
              // console.log("URL:", url);
              setUrlAndName(state);
              
              currentDbLabel.setContents('' + url +
                                         // (backendName === 'pouchDB' ? ' (in the browser)' : ''
                                         // ) + 
                                         '');
              currentDbLabel.setIcon('sync.png');
          },
          show: function() {
           editorWindow.show();
          }
      };
      
    }});