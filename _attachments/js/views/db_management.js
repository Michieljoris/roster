
/*global VOW:false Cookie:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['View', 'loaders/backend', 'views/db_management/db_utils'
             ,'types/typesAndFields'
            ],
   factory: function(View, backend, db_utils, typesAndFields)
    
    { "use strict";
      var log = logger('db_management');
      var dbDescriptions;
      var itemViewers = {};
      var view = View.create({
          type: 'Manage databases'
          ,alwaysSet: true
          ,icon: 'database.png'
          ,defaultState: {
              tab: 0,
              repTab: 0,
              backendName: 'pouchDB' ,
              idbName: '',
              url: 'http://couch:5984/db',
              urlValuemap: [
                  'http://multicap.iriscouch.com/db',
                  'http://localhost:1234',
                  'http://localhost:8090/local',
                  
                  'http://couch:5984/db',
                  'http://w:w@couch:5984/db',
                  'http://wt:wt@couch:5984/db',
                  'http://m:m@couch:5984/db'
                  // 'https://couch:6984/db',
                  // 'https://multicap.iriscouch.com/db',
                  // 'http://localhost:8090'
              ],
              dbName: '',
              reps: [
                  {
                      operation: 'sync',
                      pickA: {
                          backendName:'pouchDB',
                          url: '',
                          dbName: '',
                          idbName: 'db'
                      },
                      pickB: {
                          backendName:'couchDB',
                          // url: 'http://w:w@couch:5984/db',
                          url: 'http://localhost:1234',
                          dbName: '',
                          idbName: ''
                      },
                      from: 'db',
                      // to: 'http://w:w@couch:5984',
                      to: 'http://localhost:1234',
                      filter: 'no',
                      filterName: ''
                      ,criteria: { _constructor: "AdvancedCriteria",
                                   operator: 'and',
                                   criteria: []}
                  }

                  
              ],
              // rowSelected: null,
              // backendNameA: 'pouchDB' ,
              // idbNameA: 'db',
              // urlA: 'http://localhost:8090/local',
              // // urlValuemapA: [],
              // dbNameA: 'roster',
              
              // backendNameB: 'pouchDB' ,
              // idbNameB: 'db',
              // urlB: 'http://localhost:8090/local',
              // // urlValuemapB: [],
              // dbNameB: 'roster',
              
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
              log.pp(dbDescriptions);
              var url = backend.get().getUrl();
              currentDbLabel.setContents('<h2>Current database name: ' + url +
                                         // (backendName === 'pouchDB' ? ' (in the browser)' : ''
                                         // ) + 
                                         '</h2>');
              
              
      
              function createItemViewer(type) {
                  return isc.DetailViewer.create({
                      emptyMessage:"Select an item to view its details"
                      ,fields: typesAndFields.getFieldsCloner(type)()
                  });
              }
      

              typesAndFields.allTypes.forEach(function(t) {
                  itemViewers[t] = createItemViewer(t);
          
              });
              
              
              
      
          }
          ,set: function(state) {
              log.d('setting reptable to', state.reps);
              repTable.setData(state.reps);
              repTable.deselectAllRecords();
              
              tabset.selectTab(state.tab);
              repEditorTabset.selectTab(state.repTab);
              setUrlAndName(state);
              hideRepEditor();   
              pickDbForm.getField('url').setValueMap(state.urlValuemap);
              pickAForm.getField('url').setValueMap(state.urlValuemap);
              pickBForm.getField('url').setValueMap(state.urlValuemap);
              Cookie.get('replResult').when(
                  function(value) {
                      Cookie.remove('replResult');
                      state.result = value;
                      showRepEditor();
                      repEditorTabset.selectTab(2);
                      replResult.setContents(state.result);
                      // isc.say(value);
                      // log.d(value);
                  }
                  ,function() {
                      replResult.setContents(state.result);
                      log.d('No replResult cookie found..'); }
              );
              // replResult.setVisibility('inherit');
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
      
      function setUrlAndNameAB(form, state) {
          // log.d(state);
          if (!state) state = {
              backendName: 'pouchDB'
          }; 
          if (state.backendName === 'pouchDB') {
              form.getField('idbName').show(); 
              form.getField('dbName').hide(); 
              form.getField('url').hide(); 
              form.getField('idbName').setValue(state.idbName);
          }
          else {
              form.getField('idbName').hide(); 
              form.getField('dbName').show(); 
              form.getField('url').show();    
              form.getField('dbName').setValue(state.dbName);
          }
          
          form.getField('url').setValue(state.url);
          form.getField('backendName').setValue(state.backendName);
          // var description = dbDescriptions[state.backendNameA];
          // description =  description || {};
          // helpLabel.setContents(description.description);
          
      }
      
      // function setUrlAndNameB(state) {
      //     if (state.backendNameB === 'pouchDB') {
      //         pickBForm.getField('idbName').show(); 
      //         pickBForm.getField('dbName').hide(); 
      //         pickBForm.getField('url').hide(); 
      //         pickBForm.getField('idbName').setValue(state.idbNameB);
      //     }
      //     else {
      //         pickBForm.getField('idbName').hide(); 
      //         pickBForm.getField('dbName').show(); 
      //         pickBForm.getField('url').show();    
      //         pickBForm.getField('dbName').setValue(state.dbNameB);
      //     }
          
      //     pickBForm.getField('url').setValue(state.url);
      //     pickBForm.getField('backendName').setValue(state.backendNameB);
      //     // var description = dbDescriptions[state.backendNameB];
      //     // description =  description || {};
      //     // helpLabel.setContents(description.description);
          
      // }
      
      function checkUrl(form, url) {
          log.d('Looking for dbs in ' + url);
          var state = view.getState();
          if (!state.urlValuemap) state.urlValuemap = [];
          var isListed;
          // var url = state.url;
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
                  // log.d(index, url, state.urlValuemap);
                  // log.d('log.d');
                  // console.log('console');
                  var index = state.urlValuemap.indexOf(url);
                  if (index === -1) state.urlValuemap.push(url);
                  // log.d(index, url, state.urlValuemap);
                  form.getField('url').setValueMap(state.urlValuemap);
                  // isc.say('Database name dropdown box set to found databases.');
              } 
              ,function() {
                  // if (!state['urlValuemap' + postFix]) state['urlValuemap' + postFix] = [];
                  // if (!state.urlValuemap) state.urlValuemap = [];
                  // var index = state.urlValuemap.indexOf(url);
                  var index = state.urlValuemap.indexOf(url);
                  if (index !== -1)
                      isc.ask('Not a valid url.<p> Do you want to remove it from the list of urls?',
                              function(yes) {
                                  if (yes) {
                                      state.urlValuemap.removeAt(index);
                                      form.getField('url').setValueMap(state.urlValuemap);
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
                     // pickDbForm.getField('dbname').myRedraw();
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
                         checkUrl(pickDbForm, url);
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
          ID: 'pickAForm',
          columns: 1
          ,fields: [
              {  type: 'radioGroup', title: 'Select storage location', name: "backendName",  showTitle: true, 
                 titleOrientation: 'top' 
                 ,width: 300
                 ,visibility: 'visible'
                 ,changed: function() {
                     var backendName = arguments[2];
                     log.d(backendName);
                     var record = repTable.getSelectedRecord();
                     record.pickA.backendName = backendName;
                     log.d(record.pickA);
                     setUrlAndNameAB(pickAForm, record.pickA);
                     record.from = getUrl(pickAForm);
                     repTable.myRedraw();
                     // log.d(arguments[2]);
                     // var state = repTable.getSelectedRecord();
                     // state.pickA.backendName = arguments[2];
                     // log.d(state);
                     // setUrlAndNameAB(pickAForm, state.pickA);
                     // var backendName = arguments[2];
                     // var state = view.getState();
                     // state.backendNameA = arguments[2];
                     // setUrlAndNameAB(pickAForm, state);
                     
                     // log.d('change', databaseName);
                     // log.d(dbDescriptions);
                           
                     // helpLabel.setContents(dbDescriptions[backendName].description);
                     // pickDbForm.getField('dbName').setValue(dbDescriptions[backendName].prompt);
                     // view.getState().backendName = backendName;
                     // view.modified();
                     // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                     // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                     // pickDbForm.getField('dbname').myRedraw();
                 }
              }
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300, //height: 30,
                 changed: function () {
                     var record = repTable.getSelectedRecord();
                     record.from = getUrl(pickAForm);
                     record.pickA.url = arguments[2];
                     // var url = pickAForm.getField('url').getValue();
                     checkUrl(pickAForm, arguments[2]);
                     repTable.myRedraw();
                 }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickAForm.getField('url').getValue();
                         checkUrl(pickAForm, url);
                     }
                 }]
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 changed: function () {
                     var record = repTable.getSelectedRecord();
                     record.from = getUrl(pickAForm);
                     record.pickA.dbName = arguments[2];
                     repTable.myRedraw();
                     // view.modified();
                     // view.getState().dbNameA = arguments[2];
                 }
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 changed: function () {
                     
                     var record = repTable.getSelectedRecord();
                     record.from = getUrl(pickAForm);
                     record.pickA.idbName = arguments[2];
                     repTable.myRedraw();
                     // view.modified();
                 }
               }
          ]
      });
      
      
      var pickBForm = isc.DynamicForm.create({
          ID: 'pickBForm',
          columns: 1
          ,fields: [
              {  type: 'radioGroup', title: 'Select storage location', name: "backendName",  showTitle: true, 
                 titleOrientation: 'top' 
                 ,width: 300
                 ,visibility: 'visible'
                 ,changed: function() {
                     var backendName = arguments[2];
                     // log.d(backendName);
                     var record = repTable.getSelectedRecord();
                     record.pickB.backendName = backendName;
                     // log.d(record.pickB);
                     setUrlAndNameAB(pickBForm, record.pickB);
                     record.to = getUrl(pickBForm);
                     repTable.myRedraw();
                     // var backendName = arguments[2];
                     // var state = view.getState();
                     // state.backendNameB = arguments[2];
                     // setUrlAndNameAB(pickAForm, state);
                     // log.d('change', databaseName);
                     // log.d(dbDescriptions);
                           
                     // helpLabel.setContents(dbDescriptions[backendName].description);
                     // pickDbForm.getField('dbName').setValue(dbDescriptions[backendName].prompt);
                     // view.getState().backendName = backendName;
                     // view.modified();
                     // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                     // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                     // pickDbForm.getField('dbname').myRedraw();
                 }
              }
              ,{ editorType: 'comboBox', name: 'url', title: 'Url',
                 titleOrientation: 'top', startRow: true, width: 300,
                 changed: function () {
                     // view.modified();
                     // view.getState().urlB = arguments[2];
                     var record = repTable.getSelectedRecord();
                     record.to = getUrl(pickBForm);
                     record.pickB.url = arguments[2];
                     checkUrl(pickBForm, arguments[2]);
                     repTable.myRedraw();
                 }
                 ,icons: [{
                     src: "checkUrl.png",
                     click: function() {
                         var url = pickBForm.getField('url').getValue();
                         // var state = view.getState();
                         // state.urlB = url;
                         checkUrl(pickBForm, url);
                     }

                 }]
               }
              ,{ editorType: 'comboBox', name: 'dbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 changed: function () {
                     // view.modified();
                     // view.getState().dbNameB = arguments[2];
                     var record = repTable.getSelectedRecord();
                     record.to = getUrl(pickBForm);
                     record.pickB.dbName = arguments[2];
                     repTable.myRedraw();
                 }
               }
              ,{ editorType: 'comboBox', name: 'idbName', title: 'Database name:',
                 titleOrientation: 'top', startRow: true, width: 300,
                 changed: function () {
                     // view.modified();
                     // view.getState().idbNameB = arguments[2];
                     var record = repTable.getSelectedRecord();
                     record.to = getUrl(pickBForm);
                     record.pickB.idbName = arguments[2];
                     repTable.myRedraw();
                 }
               }
          ]
      });
      
      var fromLabel = isc.Label.create({
          // ID:'test',
          // width: 400
          height: 10
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
          // width: 400
          height: 10
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
          // ,contents: 'hello'
      });
        
        
      var dbChangeLayout = isc.HLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
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
              ,isc.LayoutSpacer.create()
              ,isc.Button.create({
                  title: 'Wipe'
                  ,startRow: false
                  ,click: function() {
                      var url = backend.get().getUrl();
                      
                      isc.confirm('Are you sure you want to wipe this database? This is irreversible!!!',
                                  function(ok) {
                                      if (ok) {
                                          db_utils.destroy(url).when(
                                              function() {
                                                  log.d('Wiped!!');
                                                  // alert(info);
                                                  location.reload(); 
                                              }
                                              ,function(err) {
                                                  alert('Error wiping: ' + err);
                                              }
                                          );


                                      }
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
          ID: 'reptable',
          canEdit: false,
          width:'100%', height:224, alternateRecordStyles:true,
          fields:[
              {name:"operation", canEdit: true, title: 'Operation', valueMap: ['inactive', 'sync', 'replicate', 'replace']},
              {name:"from", title: 'From'},
              {name:"to", title: 'To'}
              ,{name:"filter", canEdit: true, title: 'Filter', valueMap: ['no', 'yes', 'filterName']}
              ,{name:"filterName", canEdit: true, title: '_design/filter', type: 'text'}
          ],
          // rowClick: function(record, recordNum) {
          // view.getState().rowSelected = recordNum;
          // log.d(recordNum);
          // },
          selectionUpdated: function (record, recordList) {
              // replResult.setVisibility('hidden');
              if (recordList.length !== 1) {
                  hideRepEditor();   
                  view.getState().repSelection = null;
                  return;
              }
              showRepEditor();
              setRepEditor(record);
              // view.getState().repSelection = null;
              // log.d(record, recordList);
          },
          canReorderRecords: true
          ,canSort: false
          ,canFreezeFields: false
          ,canGroupBy: false
          ,canPickFields: false
          ,myRedraw: function () {
              // log.e("REDRAW");
              this.redraw();
              view.modified();
          }
      });
      
      // repTable.setData([
      //     { from: 'from..',
      //       to: 'to..',
      //       operation: 'sync',
      //       filter: 'yes',
      //       'function':'bla'
      //     }
      //     ,{ from: 'from2.',
      //        to: 'to.2',
      //        operation: 'replicate'
      //        ,filter: 'no'
      //      }
      // ]);
      
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
              var data = repTable.getData();
              if (data.length === 0) {
                  isc.say('Add some replicate rules first..');
                  return;
              }
              var rules = [];
              var  validKeys = ['operation', 'from', 'to', 'filter', 'filterName', 'criteria'];
              // log.d(data);
              data.forEach(function(e) {
                  var rule = {};
                  // log.d(data[e]);
                  Object.keys(e).forEach(function(k) {
                      if (validKeys.contains(k)) rule[k] = e[k];
                  });
                  rules.push(rule);
                  
              });
              Cookie.set('sync', JSON.stringify(rules)).when(
                  function() {
                      //     isc.confirm('Ready to replicate. Pressing ok will reload the page and replicate the data.',
                      //                 function(ok) {
                      //                     if (ok) { location.reload(); }
                      //                 }
                      //                );
                      location.reload();
                  }
              );
          }  
      });
      var removeButton = isc.Button.create({
          title: 'Remove'
          ,startRow: false
          ,click: function() {
              repTable.removeSelectedData();
              view.modified();
              hideRepEditor();
          }  
      });
      var newButton = isc.Button.create({
              title: 'New'
          ,startRow: false
          ,click: function() {
              var rep = newRep();
              repTable.addData(rep);
              repTable.deselectAllRecords();
              repTable.selectRecord(rep);
              view.modified();
              // view.getState().reps = repTable.getData();
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
      
      
      var operationRadio = isc.DynamicForm.create({
          width: 150,
          titleWidth: 20,  
          // border: "1px dashed blue",
          fields: [
              // { name: 'active', title: 'Active', type:'checkbox'},
              { change: function() { log.d(arguments[2]);
                                     var record = repTable.getSelectedRecord();
                                     record.operation = arguments[2];
                                     repTable.myRedraw();
                                     // view.getState.reps = repTable.getData();
                                     if (record.operation === 'inactive') pickABLayout.setVisibility('hidden');
                                     else pickABLayout.setVisibility('inherit');
                                   },
                name: 'Operation',
                valueHoverHTML: function(value) { return value; },
                vertical: false,  type: 'radioGroup' , valueMap: ['inactive', 'sync', 'replicate', 'replace']}
              // ,{titleOrientation: 'top',
              //     title: '_design/filter', type: 'text'}
          ]
          
      });
      
      var pickABLayout = isc.HLayout.create({
              members: [pickALayout, pickBLayout]
      }); 
      
      var pickLayout = isc.VLayout.create({
          // layoutMargin: 6,
          // membersMargin: 6,
          members: [operationRadio,
                    pickABLayout
                    
                   ]
      });
      
      
      var filterRadio = isc.DynamicForm.create({
          width: 250,
          titleWidth: 20,  
          // border: "1px dashed blue",
          // itemChange: function() {
          //     log.d(arguments);
          // },
          fields: [
              { name: 'Filter',
                change: function() {
                    var record = repTable.getSelectedRecord();
                    record.filter = arguments[2];
                    repTable.myRedraw();
                    var name = 'hidden', filter = 'hidden';
                    if (record.filter === 'filterName') name = 'inherit';
                    else if (record.filter === 'yes') filter = 'inherit';
                    filterName.setVisibility(name);
                    filterForm.setVisibility(filter);
                    log.d(arguments[2]);
                },
                valueHoverHTML: function(value) { return value; },
                vertical: false,  type: 'radioGroup' , valueMap: {'no':'no', 'yes':'yes' , 'filterName':'function'}}
              // ,{titleOrientation: 'top',
              //     title: '_design/filter', type: 'text'}
          ]
          
      });
      
      
      var filterName = isc.DynamicForm.create({
          width: 250,
          // titleWidth: 40,  
          fields: [
              {name: 'name', titleOrientation: 'top',
               change: function() {
                   // log.d('change', arguments[2]);
                   var record = repTable.getSelectedRecord();
                   record.filterName = arguments[2];
                   repTable.myRedraw();
               },
               title: '_design/filter', type: 'text'}
          ]
      });
                                               
      var DS = isc.DataSource.create({
          ID: 'reps',
          // clientOnly:true,
          fields:[
              {
                  title:"Type",
                  valueMap:[
                      'location',
                      'person',
                      'shift',
                      'settings'
                  ],
                  name:"name",
                  type:"text"
                  ,validOperators: ['equals', 'inSet', 'notInSet']
              },
              { title: 'ID',
                name:"_id",
                type:"text",
                required:true
                ,validOperators: ['equals', 'notEqual', 'iContains' ]
              },
              { title: 'Status',
                name:"status",
                valueMap:[
                    'permanent',
                    'part time',
                    'casual'
                ],
                type:"text",
                required:true
                ,validOperators: ['equals', 'inSet', 'notInSet']
              },
              {
                  name:"date",
                  type:"date",
                  required:true
                  ,validOperators: ['iBetween', 'greaterThan', 'lessThan']
              },
              {
                  name:"availibility",
                  // valueMap:[
                  //     'Waterford-west',
                  //     'Runcorn9',
                  //     'Runcorn11',
                  //     'Carindale'
                  // ],
                  type:"text",
                  required:true
                  ,validOperators: ['equals', 'inSet', 'notInSet']
              }
          ],
          serverType:"sql"
      });
      
      var filterForm = isc.FilterBuilder.create({
          ID:"advancedFilter"
              ,dataSource: DS
          ,filterChanged: function() {
              // log.d('changed', arguments);
              var record = repTable.getSelectedRecord();
              if (filterForm)
                  record.criteria = filterForm.getCriteria();
          }
          // criteria: { _constructor: "AdvancedCriteria",
          //             operator: "and", criteria: [
          //                 {fieldName: "continent", operator: "equals", value: "Europe"},
          //                 {operator: "or", criteria: [
          //                     {fieldName: "countryName", operator: "iEndsWith", value: "land"},
          //                     {fieldName: "population", operator: "lessThan", value: 3000000}
          //                 ]}
          //             ]
          //           }
      });

      
      var filterLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // height: 20,
          width:'100%',
          members: [filterRadio, filterName, filterForm] 
          
      });
      
      function showRepEditor() {
          repEditorTabset.setVisibility('inherit');
          buttonBar.setVisibility('hidden');
      }
      
      function hideRepEditor() {
          repEditorTabset.setVisibility('hidden');
          buttonBar.setVisibility('hidden');
      }
      
      var replResult = isc.HTMLPane.
      create({
          ID: 'replresult',
	  height:'100%'
	  // contentsURL:'version.html'
	  ,overflow:"auto",
	  // styleName:"defaultBorder",
	  padding:10
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
                pane: filterLayout}
              ,{title: "Result", 
                pane: replResult }
          ]
      });
      
      var buttonBar = isc.HLayout.create({
          members: [
              isc.Button.create({
                  title: 'Save'
                  ,startRow: true
                  ,click: function() {
                      saveRep();
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
          members: [dbChangeLayout, repTableLayout, repEditorTabset, buttonBar] 
      }); 
      
      
      
      function getUrl(form) {
          var url;
          var backendName = form.getValue('backendName') || 'pouchDB';
          if (backendName === 'pouchDB') {
              url = form.getValue('idbName') || '';
          }
          else {
              url = form.getValue('url') || '';
              if (!url.endsWith('/')) url += '/';
              url += form.getValue('dbName');
          }
          
          var urlPrefix = dbDescriptions[backendName].urlPrefix;
          if (url.startsWith(urlPrefix)) urlPrefix = '';
          url = urlPrefix + url;
          // var adapter = dbDescriptions[backendName].adapter;
          return url;
          // return {
          //     adapter: adapter,
          //     url: url
          // };
      }
      
      function newRep() {
          return {
              operation: 'sync',
              pickA: {
                  backendName:'pouchDB',
                  url: '',
                  dbName: '',
                  idbName: 'db'
              },
              pickB: {
                  backendName:'couchDB',
                  url: '',
                  dbName: 'db',
                  idbName: ''
              },
              from: 'db',
              to: 'db',
              filter: 'no',
              filterName: ''
              ,criteria: { _constructor: "AdvancedCriteria",
                           operator: 'and',
                           criteria: []}
          };
      }
      
      function setRepEditor(record) {
          log.d('Setting rep editor to ', record);
          operationRadio.setValue('Operation', record.operation);
          if (record.operation === 'inactive') 
              pickABLayout.setVisibility('hidden');
          else pickABLayout.setVisibility('inherit');
          
          filterRadio.setValue('Filter', record.filter);
          // var choice = filterRadio.getValue('Filter');
          var name = 'hidden', filter = 'hidden';
          if (record.filter === 'filterName') name = 'inherit';
          else if (record.filter === 'yes') filter = 'inherit';
          filterName.setVisibility(name);
          filterForm.setVisibility(filter);
          
          filterName.setValue('name', record.filterName);
          filterForm.setCriteria(record.criteria);
          
          pickAForm.setValues(record.pickA);
          pickBForm.setValues(record.pickB);
          setUrlAndNameAB(pickAForm, record.pickA);
          setUrlAndNameAB(pickBForm, record.pickB);
      }

      
      function saveRep() {
          var rep = {
              operation: operationRadio.getValue('Operation'),
              from: getUrl(pickAForm),
              to: getUrl(pickBForm),
              filter: filterRadio.getValue('Filter'),
              filterName: filterName.getValue('name'),
              criteria: filterForm.getCriteria(),
              pickA: pickAForm.getValues(),
              pickB: pickBForm.getValues()
          };
          var record = repTable.getSelectedRecord();
          isc.addProperties(record, rep);
          repTable.myRedraw();
          log.d(rep);
      }
      
      
      function makeResolveTree(arr) {
          return isc.Tree.create({
              modelType: "children",
              nameProperty: "_id",
              childrenProperty: "conflictingRevs",
              root: { _id: 'treeroot', conflictingRevs: arr }
              // root: {EmployeeId: "1", directReports: [
              //     {EmployeeId:"4", Name:"Charles Madigen", directReports: [
              //         {EmployeeId:"188", Name:"Rogine Leger"},
              //         {EmployeeId:"189", Name:"Gene Porter", directReports: [
              //             {EmployeeId:"265", Name:"Olivier Doucet"},
              //             {EmployeeId:"264", Name:"Cheryl Pearson"}
              //         ]}
              //     ]}
              // ]}
          });
      }
      
      var resolveTreeGrid = isc.TreeGrid.create({
          ID: "resolveTree",
          // data: isc.Tree.create({
          //     modelType: "children",
          //     nameProperty: "Name",
          //     childrenProperty: "directReports",
          //     root: {EmployeeId: "1", directReports: [
          //         {EmployeeId:"4", Name:"Charles Madigen", directReports: [
          //             {EmployeeId:"188", Name:"Rogine Leger"},
          //             {EmployeeId:"189", Name:"Gene Porter", directReports: [
          //                 {EmployeeId:"265", Name:"Olivier Doucet"},
          //                 {EmployeeId:"264", Name:"Cheryl Pearson"}
          //             ]}
          //         ]}
          //     ]}
          // }),

          // customize appearance
          width: '100%',
          height: 200,
          fields: [
              {name: '_id'},
              {name: "_rev"},
              {name: "type"},
              {name: "lastEditedAt", type: 'date', title: 'Last edited at'},
              {name: "lastEditedBy", title: 'Last edited by' } 
          ]
          ,selectionUpdated: function(record) {
              log.d(record);
              if (record.type) {
                  // log.d(Object.keys(record));
                  log.d(record);
                  // itemViewer.setFields(Object.keys(record));
                  
                  itemViewers[record.type].setData(record);
                  var types = Object.keys(itemViewers);
                  types.forEach(function(t) {
                      resolveLayout.removeMember(itemViewers[t]);
                  });
                  resolveLayout.addMember(itemViewers[record.type]);
                  
              }
          }
          // nodeIcon:"icons/16/person.png",
          // folderIcon:"icons/16/person.png",
          // showOpenIcons:false,
          // showDropIcons:false,
          // closedIconSuffix:""
      });
      
      
      var resolveButton = isc.Button.create({
          title: 'Get conflicts'
          ,startRow: false
          ,click: function() {
              var url = backend.get().getUrl();
              db_utils.conflicts(url).when(
                  function(arr) {
                      log.pp(arr[0].docsWithConflicts);
                      resolveTreeGrid.setData(makeResolveTree(arr[0].docsWithConflicts));
                  },
                  function(err) {
                      log.pp(err);
                  }
              );
              // resolveTree.setData([]);
              
          }  
      });
      
      
      var resolveLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // border: "1px dashed blue",
          // height: 20,
          // width: 400,
          members: [
              resolveTreeGrid, resolveButton
              ]
          });
      
      
      // mployeeTree.getData().openAll();
            
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
                pane: resolveLayout }
          ]
      });
      
      view.setCmp(tabset);
      return view;
    }});