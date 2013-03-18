
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
              idbName: 'db',
              url: 'http://localhost:8090/local',
              urlValuemap: [],
              dbName: 'roster',
              replicate: {
                  a: {
                      backendName: 'pouchDB' ,
                      idbName: 'db',
                      url: 'http://localhost:8090/local',
                      urlValuemap: [],
                      dbName: 'roster'
                  },
                  b: {
                      backendName: 'pouchDB' ,
                      idbName: 'db',
                      url: 'http://localhost:8090/local',
                      urlValuemap: [],
                      dbName: 'roster'
                  }
              },
              resolve: {
                  
              }
                           
          } 
          // ,sync: function(state) {
          //     log.d('UPDATING STATE:', state);
          // } 
          ,init: function() {
              dbDescriptions = backend.getDbDescriptions();
              
              var backendNames = backend.getValueMap(); 
              pickDbForm.getField('backendName').setValueMap(backendNames);
              
              setValuemaps();
              
              var backendName = backend.getName();
              var url = backend.get().getUrl();
              currentDbLabel.setContents('<h2>Current database: ' + url + '</h2>');
              currentUrlLabel.setContents('<h3>At: ' + backendName + '<h3>');
          }
          ,set: function(state) {
              tabset.selectTab(state.tab);
              setUrlAndName(state);
              pickDbForm.getField('url').setValueMap(state.urlValuemap);
          }
      });
      
      function setValuemaps() {
          db_utils.getAllDbs('idb').when(
              function(values) {
                  pickDbForm.getField('idbName').setValueMap(values);
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
      
      // var pickRemoteForm = isc.DynamicForm.create({
      //     // autoDraw: true,
      //     columns: 1
      //     ,fields: [
      //         { type: 'text', name: 'url', title: 'Url of Couchdb database:', 
      //           titleOrientation: 'top', startRow: true, width: 300,
      //           value: 'http://localhost:1234/' }
      //     ]
      // });
      
      function checkUrl() {
          var state = view.getState();
          var url = state.url;
          db_utils.getAllDbs(url).when(
              function(values) {
                  pickDbForm.getField('dbName').setValueMap(values);
                  console.log('set dbnName valuemap');
                  if (!state.urlValuemap) state.urlValuemap = [];
                  var index = state.urlValuemap.indexOf(url);
                  // log.d(index, url, state.urlValuemap);
                  // log.d('log.d');
                  // console.log('console');
                  if (index === -1) state.urlValuemap.push(url);
                  // log.d(index, url, state.urlValuemap);
                  pickDbForm.getField('url').setValueMap(state.urlValuemap);
                  isc.say('Database name dropdown box set to found databases.');
              } 
              ,function() {
                  if (!state.urlValuemap) state.urlValuemap = [];
                  var index = state.urlValuemap.indexOf(url);
                  if (index !== -1)
                      isc.ask('Not a valid url.<p> Do you want to remove it from the list of urls?',
                              function(yes) {
                                  if (yes) {
                                      state.urlValuemap.removeAt(index);
                                      pickDbForm.getField('url').setValueMap(state.urlValuemap);
                                  }
                              });
                  else isc.warn('Not a valid url.');
                  
              }
          );
          
      }
      
      var pickDbForm = isc.DynamicForm.create({
          ID: 'pickDB',
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
                     click: checkUrl
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
      
      var currentUrlLabel = isc.Label.create({
          // ID:'test',
          width: 400
          ,height: 10
          // margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      var currentDbLabel = isc.Label.create({
          // ID:'test',
          width: 400
          ,height: 10
          // margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
        
            
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 400,
          height: '100%',
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
        
        
      var pickDatabaseLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // border: "1px dashed blue",
          height: 20,
          width: 400,
          members: [currentDbLabel, currentUrlLabel, pickDbForm, helpLabel
                    ,isc.HLayout.create({
                        layoutMargin: 6,
                        membersMargin: 6,
                        // border: "1px dashed blue",
                        height: 20,
                        width:'100%',
                        members: [
                            // isc.LayoutSpacer.create()
                            // isc.Button.creat({
                            //     title: 'Cancel'
                            //     // ,visibility: cancellable ? 'inherit' : 'hidden'
                            //     // ,startRow: false
                            //     ,click: function() {
                            //         // editorWindow.hide();
                            //     }  
                            // })
                            // ,isc.LayoutSpacer.create()
                            isc.Button.create({
                                title: 'Switch'
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
                            
                        ]
                    })

                   ]
      });
      
      var layoutA = isc.VLayout.create({
          
      });
      
      var layoutB = isc.VLayout.create({
          
      });
      
      var replicateLayout = isc.HLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // border: "1px dashed blue",
          height: 20,
          width:'100%',
          members: [layoutA, layoutB ]
         } 
            
      // var pickRemoteLayout = isc.VLayout.create({
      //     layoutMargin: 6,
      //     membersMargin: 6,
      //     // border: "1px dashed blue",
      //     height: 20,
      //     width:'100%',
      //     members: [pickRemoteForm
      //               ,isc.HLayout.create({
      //                   layoutMargin: 6,
      //                   membersMargin: 6,
      //                   // border: "1px dashed blue",
      //                   height: 20,
      //                   width:'100%',
      //                   members: [
      //                       // isc.LayoutSpacer.create()
      //                       isc.Button.create({
      //                           title: 'Export'
      //                           // ,visibility: cancellable ? 'inherit' : 'hidden'
      //                           // ,startRow: false
      //                           // ,visibility: cancellable ? 'inherit' : 'hidden'
      //                           ,click: function() {
      //                               // editorWindow.hide();
      //                               var url = pickRemoteForm.getValue('dbName');
      //                               // console.log('Replicating to ' + url);
      //                               // repToRemote(url);
      //                               db_utils.getAllDbs(url).when(
      //                                   function(dbsList) {
      //                                       log.d(dbsList);
      //                                   }
      //                                   ,function(err) {
      //                                       log.d(err);
      //                                   }
      //                               );
      //                           }  
      //                       })
      //                       ,isc.LayoutSpacer.create()
      //                       ,isc.Button.create({
      //                           title: 'Conflicts'
      //                           ,startRow: false
      //                           ,click: function() {
      //                               var url = pickRemoteForm.getValue('dbName');
      //                               db_utils.getConflicts(url).when(
      //                                   function(arr) {
      //                                       log.d(arr);
      //                                   }
      //                                   ,function(err) {
      //                                       log.d(err);
      //                                   }
      //                               );
      //                               // var databaseName = pickDbForm.getValue('databaseName'); 
      //                               // var url = pickDbForm.getValue('url');
      //                               // var urlPrefix = dbDescriptions[databaseName].urlPrefix;
      //                               // if (url.startsWith(urlPrefix)) urlPrefix = '';
      //                               // log.d('hello',urlPrefix, databaseName);
      //                               // url = urlPrefix + url;
      //                               // set(databaseName);
      //                               // database = dbs[databaseName];
      //                               // editorWindow.hide();
      //                               // callback(database, databaseName, url);
      //                           }  
      //                       })
      //                       ,isc.LayoutSpacer.create()
      //                       ,isc.Button.create({
      //                           title: 'Cancel'
      //                           // ,visibility: cancellable ? 'inherit' : 'hidden'
      //                           // ,startRow: false
      //                           ,click: function() {
      //                               // editorWindow.hide();
      //                           }  
      //                       })
                            
      //                   ]
      //               })
      //              ]
      // }); 
            
        
        
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
              {title: "Switch", 
               pane:  pickDatabaseLayout }
              ,{title: "Replicate", 
                pane: replicateLayout}
              ,{title: "Resolve", 
                pane: 'hello'}
          ]
      });
            
            
      
      // var layout = isc.VLayout.create({
      //     members: [
      //         isc.Button.create({
      //             // width:'80px',				
      //             title: 'Database management'
      //             // ,height: '100%'
      //             // ,icon:"print.png"
      //             // ,click: function() {
      //             //     isc_timesheet.print();
      //             // }
      //         })
      //     ]
          
      // });
      
      view.setCmp(tabset);
      return view;
    }});