
/*global VOW:false Cookie:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['View', 'loaders/backend'
            ],
   factory: function(View, backend)
    
    { "use strict";
      var log = logger('db_management');
      var dbDescriptions;
      
      var view = View.create({
          type: 'Manage databases'
          ,alwaysSet: true
          ,icon: 'database.png'
          ,defaultState: {} 
          // ,sync: function(state) {
          //     log.d('UPDATING STATE:', state);
          // } 
          ,init: function() {
             dbDescriptions = backend.getDbDescriptions(); 
          }
          ,set: function(state) {
          }
      });
      
      var callback;
            
      var pickRemoteForm = isc.DynamicForm.create({
          // autoDraw: true,
          columns: 1
          ,fields: [
              // {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
              //    valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
              //    ,width: 300
              //    ,change: function() {
              //        var databaseName = arguments[2];
              //        log.d('change', databaseName);
              //        // log.d(dbDescriptions);
                           
              //        helpLabel.setContents(dbDescriptions[databaseName].description);
              //        pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
              //        // console.log('setting prompt', dbDescriptions[databaseName].prompt);
              //        // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
              //        // pickDbForm.getField('dbname').redraw();
              //    }
              // }
              { type: 'text', name: 'url', title: 'Url of Couchdb database:', 
                titleOrientation: 'top', startRow: true, width: 300,
                value: 'http://localhost:1234/' }
          ]
      });
      
      var pickDbForm = isc.DynamicForm.create({
          // autoDraw: true,
          columns: 1
          ,fields: [
              // {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
              //    valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
              //    ,width: 300,
              //    visibility: 'hidden'
              //    ,change: function() {
              //        var databaseName = arguments[2];
              //        log.d('change', databaseName);
              //        // log.d(dbDescriptions);
                           
              //        helpLabel.setContents(dbDescriptions[databaseName].description);
              //        pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
              //        // console.log('setting prompt', dbDescriptions[databaseName].prompt);
              //        // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
              //        // pickDbForm.getField('dbname').redraw();
              //    }
              // },
              { type: 'text', name: 'url', title: 'Name:', 
                titleOrientation: 'top', startRow: true, width: 300, value: 'db' }
          ]
      });
            
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 300,
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
          width:'100%',
          members: [pickDbForm, helpLabel
                    ,isc.HLayout.create({
                        layoutMargin: 6,
                            membersMargin: 6,
                        // border: "1px dashed blue",
                        height: 20,
                        width:'100%',
                        members: [
                            // isc.LayoutSpacer.create()
                            isc.Button.create({
                                title: 'Cancel'
                                // ,visibility: cancellable ? 'inherit' : 'hidden'
                                // ,startRow: false
                                ,click: function() {
                                    // editorWindow.hide();
                                }  
                            })
                            ,isc.LayoutSpacer.create()
                            ,isc.Button.create({
                                title: 'Open'
                                ,startRow: false
                                ,click: function() {
                                    // var databaseName = pickDbForm.getValue('databaseName'); 
                                    var databaseName = 'pouchDB';
                                    var url = pickDbForm.getValue('url');
                                    var urlPrefix = dbDescriptions[databaseName].urlPrefix;
                                    if (url.startsWith(urlPrefix)) urlPrefix = '';
                                    log.d('hello',urlPrefix, databaseName);
                                    url = urlPrefix + url;
                                    backend.set(databaseName);
                                    
                                    VOW.every([
                                        Cookie.set('backendName', databaseName, Date.today().addYears(10))
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
            
      var pickRemoteLayout = isc.VLayout.create({
          layoutMargin: 6,
          membersMargin: 6,
          // border: "1px dashed blue",
          height: 20,
          width:'100%',
          members: [pickRemoteForm
                    ,isc.HLayout.create({
                        layoutMargin: 6,
                        membersMargin: 6,
                        // border: "1px dashed blue",
                        height: 20,
                        width:'100%',
                        members: [
                            // isc.LayoutSpacer.create()
                            isc.Button.create({
                                title: 'Export'
                                // ,visibility: cancellable ? 'inherit' : 'hidden'
                                // ,startRow: false
                                // ,visibility: cancellable ? 'inherit' : 'hidden'
                                ,click: function() {
                                    // editorWindow.hide();
                                    var url = pickRemoteForm.getValue('url');
                                    console.log('Replicating to ' + url);
                                    repToRemote(url);
                                }  
                            })
                            ,isc.LayoutSpacer.create()
                            ,isc.Button.create({
                                title: 'Import'
                                ,startRow: false
                                ,click: function() {
                                    // var databaseName = pickDbForm.getValue('databaseName'); 
                                    // var url = pickDbForm.getValue('url');
                                    // var urlPrefix = dbDescriptions[databaseName].urlPrefix;
                                    // if (url.startsWith(urlPrefix)) urlPrefix = '';
                                    // log.d('hello',urlPrefix, databaseName);
                                    // url = urlPrefix + url;
                                    // set(databaseName);
                                    // database = dbs[databaseName];
                                    // editorWindow.hide();
                                    // callback(database, databaseName, url);
                                }  
                            })
                            ,isc.LayoutSpacer.create()
                            ,isc.Button.create({
                                title: 'Cancel'
                                // ,visibility: cancellable ? 'inherit' : 'hidden'
                                // ,startRow: false
                                ,click: function() {
                                    // editorWindow.hide();
                                }  
                            })
                            
                        ]
                    })
                   ]
      }); 
            
        
        
      var tabset = isc.TabSet.create({
          // ID: "topTabSet",
          tabBarPosition: "top",
          selectedTab: 1,
          // width: 400,
          // height: 300,
          tabs: [
              {title: "Select/Create", 
               pane:  pickDatabaseLayout }
              ,{title: "Replicate", 
                pane: pickRemoteLayout}
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