
/*global VOW:false Cookie:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['View', 'loaders/backend', 'views/db_management/db_utils'
            ],
   factory: function(View, backend, db_utils)
    
    { "use strict";
      var log = logger('db_management');
      var dbDescriptions;
      
      var view = View.create({
          type: 'Manage databases'
          ,alwaysSet: true
          ,icon: 'database.png'
          ,defaultState: {
              tab: 0,
              backendName: 'pouchDB' ,
              idbName: '',
              url: '',
              urlValuemap: ['http://localhost:8090/local',
                            'http://localhost:1234',
                            'http://multicap.iriscouch.com'],
              dbName: '',
              
              backendNameA: 'pouchDB' ,
              idbNameA: 'db',
              urlA: 'http://localhost:8090/local',
              // urlValuemapA: [],
              dbNameA: 'roster',
              
              backendNameB: 'pouchDB' ,
              idbNameB: 'db',
              urlB: 'http://localhost:8090/local',
              // urlValuemapB: [],
              dbNameB: 'roster',
              
              resolve: {
                  
              } 
              // ,sync: function(state) {
              //     log.d('UPDATING STATE:', state);
              // } 
             } 
              ,init: function() {
                  dbDescriptions = backend.getDbDescriptions();
              
                  var backendNames = backend.getValueMap(); 
                  pickDbForm.getField('backendName').setValueMap(backendNames);
                  pickAForm.getField('backendName').setValueMap(backendNames);
                  pickBForm.getField('backendName').setValueMap(backendNames);
              
                  setValuemaps();
              
                  var backendName = backend.getName();
                  var url = backend.get().getUrl();
                  currentDbLabel.setContents('<h2>Current database name: ' + url +
                                             (backendName === 'pouchDB' ? ' (in the browser)' : '') + 
                                             '</h2>');
                  // currentUrlLabel.setContents('<h3>At: ' + backendName + '<h3>');
              }
              ,set: function(state) {
                  tabset.selectTab(state.tab);
                  setUrlAndName(state);
                  setUrlAndNameA(state);
                  setUrlAndNameB(state);
                  pickDbForm.getField('url').setValueMap(state.urlValuemap);
                  pickAForm.getField('url').setValueMap(state.urlValuemap);
                  pickBForm.getField('url').setValueMap(state.urlValuemap);
              }
      });
      
      function setValuemaps() {
          db_utils.getAllDbs('idb').when(
              function(values) {
                  pickDbForm.getField('idbName').setValueMap(values);
                  pickAForm.getField('idbName').setValueMap(values);
                  pickBForm.getField('idbName').setValueMap(values);
              } 
          );
          // db_utils.getAllDbs('idb').when(
          //     function(values) {
          //         pickDbForm.getField('dbName').setValueMap(values);
          //     } 
          // );
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
      
      function setUrlAndNameA(state) {
          if (state.backendNameA === 'pouchDB') {
              pickAForm.getField('idbName').show(); 
              pickAForm.getField('dbName').hide(); 
              pickAForm.getField('url').hide(); 
              pickAForm.getField('idbName').setValue(state.idbNameA);
          }
          else {
              pickAForm.getField('idbName').hide(); 
              pickAForm.getField('dbName').show(); 
              pickAForm.getField('url').show();    
              pickAForm.getField('dbName').setValue(state.dbNameA);
          }
          
          pickAForm.getField('url').setValue(state.url);
          pickAForm.getField('backendName').setValue(state.backendNameA);
          // var description = dbDescriptions[state.backendNameA];
          // description =  description || {};
          // helpLabel.setContents(description.description);
          
      }
      
      function setUrlAndNameB(state) {
          if (state.backendNameB === 'pouchDB') {
              pickBForm.getField('idbName').show(); 
              pickBForm.getField('dbName').hide(); 
              pickBForm.getField('url').hide(); 
              pickBForm.getField('idbName').setValue(state.idbNameB);
          }
          else {
              pickBForm.getField('idbName').hide(); 
              pickBForm.getField('dbName').show(); 
              pickBForm.getField('url').show();    
              pickBForm.getField('dbName').setValue(state.dbNameB);
          }
          
          pickBForm.getField('url').setValue(state.url);
          pickBForm.getField('backendName').setValue(state.backendNameB);
          // var description = dbDescriptions[state.backendNameB];
          // description =  description || {};
          // helpLabel.setContents(description.description);
          
      }
      
      function checkUrl(form, url, postFix) {
          log.d('Looking for dbs in ' + url);
          var state = view.getState();
          if (!state['urlValuemap' + postFix]) state['urlValuemap' + postFix] = [];
          var index = state['urlValuemap' + postFix].indexOf(url);
          // var url = state.url;
          db_utils.getAllDbs(url).when(
              function(values) {
                  form.getField('dbName').setValueMap(values);
                  // form.getField('dbName').showPickList();
                  console.log('dbName valuemap has been set..');
                  // form.getField('url').setHint('url added');
                  form.getField('dbName').setHint('updated');
                  setTimeout(function() {
                      form.getField('dbName').setHint('');
                  }, 3000);
                  // log.d(index, url, state.urlValuemap);
                  // log.d('log.d');
                  // console.log('console');
                  if (index === -1) state.urlValuemap.push(url);
                  // log.d(index, url, state.urlValuemap);
                  form.getField('url').setValueMap(state.urlValuemap);
                  // isc.say('Database name dropdown box set to found databases.');
              } 
              ,function() {
                  // if (!state['urlValuemap' + postFix]) state['urlValuemap' + postFix] = [];
                  // if (!state.urlValuemap) state.urlValuemap = [];
                  // var index = state.urlValuemap.indexOf(url);
                  if (index !== -1)
                      isc.ask('Not a valid url.<p> Do you want to remove it from the list of urls?',
                              function(yes) {
                                  if (yes) {
                                      state['urlValuemap' + postFix].removeAt(index);
                                      form.getField('url').setValueMap(state['urlValuemap' + postFix]);
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
      
      var pickDbForm = isc.DynamicForm.create({
          ID: 'dbform',
          columns: 1
          ,fields: [
              {  type: 'radioGroup', title: 'Select storage location', name: "backendName",  showTitle: true, 
                 titleOrientation: 'top' 
                 ,width: 400
                 ,visibility: 'visible'
                 ,change: function() {
                     // var backendName = arguments[2];
                     var state = view.getState();
                     state.backendName = arguments[2];
                     setUrlAndName(state);
                     // log.d('change', databaseName);
                     // log.d(dbDescriptions);
                           
                     // helpLabel.setContents(dbDescriptions[backendName].description);
                     // pickDbForm.getField('dbName').setValue(dbDescriptions[backendName].prompt);
                     // view.getState().backendName = backendName;
                     view.modified();
                     // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                     // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                     // pickDbForm.getField('dbname').redraw();
                 }
              }
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().url = arguments[2]; }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickDbForm.getField('url').getValue();
                         var state = view.getState();
                         state.url = url;
                         checkUrl(pickDbForm, url, '');
                     }
                 }]
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().dbName = arguments[2]; }
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().idbName = arguments[2]; }
               }
          ]
      });
      
      
      var pickAForm = isc.DynamicForm.create({
          columns: 1
          ,fields: [
              {  type: 'radioGroup', title: 'Select storage location', name: "backendName",  showTitle: true, 
                 titleOrientation: 'top' 
                 ,width: 400
                 ,visibility: 'visible'
                 ,change: function() {
                     // var backendName = arguments[2];
                     var state = view.getState();
                         state.backendNameA = arguments[2];
                     setUrlAndNameA(state);
                     
                     // log.d('change', databaseName);
                     // log.d(dbDescriptions);
                           
                     // helpLabel.setContents(dbDescriptions[backendName].description);
                     // pickDbForm.getField('dbName').setValue(dbDescriptions[backendName].prompt);
                     // view.getState().backendName = backendName;
                     view.modified();
                     // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                     // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                     // pickDbForm.getField('dbname').redraw();
                 }
              }
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300, //height: 30,
                 change: function () {
                     view.modified();
                     view.getState().urlA = arguments[2]; }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickAForm.getField('url').getValue();
                         var state = view.getState();
                         state.urlA = url;
                         // var url = state.urlA || '';
                         checkUrl(pickAForm, url, 'A');
                     }
                 }]
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().dbNameA = arguments[2]; }
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().idbNameA = arguments[2]; }
               }
          ]
      });
      
      
      var pickBForm = isc.DynamicForm.create({
          columns: 1
          ,fields: [
              {  type: 'radioGroup', title: 'Select storage location', name: "backendName",  showTitle: true, 
                 titleOrientation: 'top' 
                 ,width: 400
                 ,visibility: 'visible'
                 ,change: function() {
                     // var backendName = arguments[2];
                     var state = view.getState();
                     state.backendNameB = arguments[2];
                     setUrlAndNameB(state);
                     // log.d('change', databaseName);
                     // log.d(dbDescriptions);
                           
                     // helpLabel.setContents(dbDescriptions[backendName].description);
                     // pickDbForm.getField('dbName').setValue(dbDescriptions[backendName].prompt);
                     // view.getState().backendName = backendName;
                     view.modified();
                     // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                     // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                     // pickDbForm.getField('dbname').redraw();
                 }
              }
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().urlB = arguments[2]; }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickBForm.getField('url').getValue();
                         var state = view.getState();
                         state.urlB = url;
                         checkUrl(pickBForm, url, 'B');
                     }
                 }]
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().dbNameB = arguments[2]; }
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 change: function () {
                     view.modified();
                     view.getState().idbNameB = arguments[2]; }
               }
          ]
      });
      
      var fromLabel = isc.Label.create({
          // ID:'test',
          width: 400
          ,height: 10
          // margin: 10
          // ,border: "1px dashed blue"
          ,contents: '<h2>From' 
      });
      
          var repLabel = isc.Label.create({
              // ID:'test',
              width: 400
              ,height: 10
              ,contents: 'Replications' 
              // margin: 10
              // ,border: "1px dashed blue"
          });
      
      var toLabel = isc.Label.create({
          // ID:'test',
          width: 400
          ,height: 10
          ,contents: '<h2>To' 
          // margin: 10
          // ,border: "1px dashed blue"
      });
      
            
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 400,
          height: '100%',
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      var currentDbLabel = isc.Label.create({
          // ID:'test',
          width: 400,
          height: 10
          // margin: 10
          // ,border: "1px dashed blue"
          ,contents: 'hello'
      });
        
        
      var dbChangeLayout = isc.HLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          // border: "1px dashed blue",
          height: 20,
          // width: 400,
          members: [
              currentDbLabel,
              isc.Button.create({
                  title: 'Change'
                  ,startRow: false
                  ,click: function() {
                      editorWindow.show();
                  }  
              })
              ,isc.LayoutSpacer.create()
              ,isc.Button.create({
                  title: 'Wipe'
                  ,startRow: false
                  ,click: function() {
                      var url = backend.get().getUrl();
                      db_utils.destroy(url).when(
                          function(info) {
                              alert(info);
                          }
                          ,function(err) {
                              alert(err);
                          }
                      );
                  }  
              })
              
          ]
          
      });
        
      // var pickDatabaseLayout = isc.VLayout.create({
      //     // layoutMargin: 6,
      //     // membersMargin: 6,
      //     // border: "1px dashed blue",
      //     height: 20,
      //     width: 400,
      //     members: [dbChange]
      // });
      
      var editorWindow = isc.Window.create({
          title: "Select a database backend."
          // ,autoSize: true
          ,height:400
          ,width:450
          ,canDragReposition: false
          ,canDragResize: false
          ,showMinimizeButton:false
          ,showCloseButton:false
          ,autoCenter: true
          ,isModal: true
          ,showModalMask: true
          ,autoDraw: false
          ,items: [
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
                                  Cookie.set('backendName', adapter, Date.today().addYears(10))
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
      
      
      var repTable = isc.ListGrid.create({
          width:'100%', height:224, alternateRecordStyles:true,
          fields:[
              {name:"active", title: 'Active', type: 'boolean', canEdit: true},
              {name:"from", title: 'From'},
              {name:"to", title: 'To'},
              {name:"operation", canEdit: true, title: 'Operation', valueMap: ['sync', 'replicate', 'replace']},
              {name:"filter", canEdit: true, title: 'Filter', type: 'boolean'}
          ],
          canReorderRecords: true
          ,canSort: false
          ,canFreezeFields: false
          ,canGroupBy: false
          ,canPickFields: false
      });
      
      repTable.setData([
          { from: 'from..',
            to: 'to..',
            active: true,
            operation: 'sync',
            filter: false
          }
          ,{ from: 'from2.',
             to: 'to.2',
             active: false,
             operation: 's2nc',
             filter: true
           }
      ]);
      
      var pickALayout = isc.VLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          members: [fromLabel, pickAForm]
          
          });
      
      var pickBLayout = isc.VLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          members: [toLabel, pickBForm]
          
          });
      
      var replicateButton =isc.Button.create({
          title: 'Replicate'
          ,startRow: false
          ,click: function() {
              editorWindow.show();
          }  
      });
      var removeButton = isc.Button.create({
          title: 'Remove'
          ,startRow: false
          ,click: function() {
              editorWindow.show();
          }  
      });
      var newButton = isc.Button.create({
          title: 'New'
          ,startRow: false
          ,click: function() {
              editorWindow.show();
          }  
      });
      
      var buttonLayout = isc.HLayout.create({
          // layoutMargin: 6,
          membersMargin: 6,
          members: [replicateButton,
                    isc.LayoutSpacer.create(),
                    removeButton, newButton]
      });
      
      var repTableLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          members: [repLabel, repTable, buttonLayout]
          
      });
      var pickLayout = isc.HLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          members: [pickALayout, pickBLayout]
          });
      
      var repEditorTabset = isc.TabSet.create({
          // ID: "topTabSet",
          tabBarPosition: "top",
          selectedTab: 0,
          height: '100%',
          // height: 300,
          tabSelected: function(tabno) {
              view.modified();
              view.getState().repTab = tabno;
          },
          tabs: [
              // {title: "Switch", 
              //  pane:  pickDatabaseLayout }
              {title: "From/To", 
               pane: pickLayout}
              ,{title: "Filter", 
                pane: 'hello'}
          ]
      });
      
      var buttonBar = isc.HLayout.create({
          members: [
              isc.Button.create({
                  title: 'Save'
                  ,startRow: true
                  ,click: function() {
                  }  
              })
              ,isc.LayoutSpacer.create()
              ,isc.Button.create({
                  title: 'Cancel'
                  ,startRow: false
                  ,click: function() {
                  }  
              })
          ]
      });
          
      
      var databaseLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // border: "1px dashed blue",
              // height: 20,
          width:'100%',
          members: [dbChangeLayout, repTableLayout, repEditorTabset, buttonBar ] 
      }); 
            
      var tabset = isc.TabSet.create({
          // ID: "topTabSet",
          tabBarPosition: "top",
          selectedTab: 0,
          // width: 400,
          // height: 300,
          tabSelected: function(tabno) {
              view.modified();
              view.getState().tab = tabno;
          },
          tabs: [
              // {title: "Switch", 
              //  pane:  pickDatabaseLayout }
              {title: "Database", 
               pane: databaseLayout}
              ,{title: "Resolve", 
                pane: 'hello'}
          ]
      });
      
      view.setCmp(tabset);
      return view;
    }});