/*global logger:false define:false isc:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
// ({  inject : ['databases/pouchDB', 'databases/couchDB'],
({  inject : [],
    factory: function() {
        "use strict";
        var log = logger('dbWindow');
        
        var cancellable;
        var callback;
        var pickDbForm = isc.DynamicForm.create({
            // autoDraw: true,
            columns: 1
            ,fields: [
                {  type: 'radioGroup', name: "databaseName",  showTitle: false, 
                   valueMap: valueMap, titleOrientation: 'top', value: 'pouchDB'
                   ,width: 300
                   ,change: function() {
                       var databaseName = arguments[2];
                       log.d('change', databaseName);
                       // log.d(dbDescriptions);
                           
                       helpLabel.setContents(dbDescriptions[databaseName].description);
                       pickDbForm.getField('url').setValue(dbDescriptions[databaseName].prompt);
                       // console.log('setting prompt', dbDescriptions[databaseName].prompt);
                       // pickDbForm.getField('dbname').title=dbDescriptions[databaseName].urlPrefix;
                       // pickDbForm.getField('dbname').redraw();
                   }
                }
                ,{ type: 'text', name: 'url', title: 'Url or name', 
                   titleOrientation: 'top', startRow: true, width: 300, value: 'db' }
            ]
        });
            
        var helpLabel = isc.Label.create({
            // ID:'test',
            width: 300,
            height: '100%',
            margin: 10
            // ,border: "1px dashed blue"
            ,contents: dbDescriptions.pouchDB.description
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
                              isc.LayoutSpacer.create()
                              ,isc.Button.create({
                                  title: 'Cancel'
                                  ,visibility: cancellable ? 'inherit' : 'hidden'
                                  // ,startRow: false
                                  ,click: function() {
                                      editorWindow.hide();
                                  }  
                              })
                              ,isc.Button.create({
                                  title: 'Open'
                                  ,startRow: false
                                  ,click: function() {
                                      var databaseName = pickDbForm.getValue('databaseName'); 
                                      var url = pickDbForm.getValue('url');
                                      var urlPrefix = dbDescriptions[databaseName].urlPrefix;
                                      if (url.startsWith(urlPrefix)) urlPrefix = '';
                                      log.d('hello',urlPrefix, databaseName);
                                      url = urlPrefix + url;
                                      set(databaseName);
                                      database = dbs[databaseName];
                                      editorWindow.hide();
                                      callback(database, databaseName, url);
                                  }  
                              })
                            
                              ,isc.LayoutSpacer.create()
                          ]
                      })

                     ]
        });
        
        
        var tabset = isc.TabSet.create({
            // ID: "topTabSet",
            tabBarPosition: "top",
            // width: 400,
            // height: 300,
            tabs: [
                {title: "Database", 
                 pane:  pickDatabaseLayout },
                {title: "Green", icon: "pieces/16/pawn_green.png", iconSize:16,
                 pane: isc.Img.create({autoDraw: false, width: 48, height: 48, src: "pieces/48/pawn_green.png"})}
            ]
        });
            
        var editorWindow = isc.Window.create({
                title: ""
            // ,autoSize: true
            ,height:500
            ,width:500
            ,canDragReposition: false
            ,canDragResize: false
            ,showMinimizeButton:false
            ,showCloseButton:false
            ,autoCenter: true
            ,isModal: true
            ,showModalMask: true
            ,autoDraw: false
            ,items: [
                tabset
                // ,helpLabel
            ] 
        });
        /** Pick a database */
        function pick(aCallback, isCancellable){
            callback = aCallback;
            cancellable = isCancellable;
            createEditorWindow();
            editorWindow.show();
        }
        
        return {
            pick: pick
            ,exists: exists
            ,get: get
            ,set: set
            // ,ls: ls
        };
    }
});