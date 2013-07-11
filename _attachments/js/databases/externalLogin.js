
/*global Cookie:false VOW:false  logger:false PBKDF2:false define:false isc:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/

define
({inject: ["lib/couchapi"],
  factory: function(couch) {
      "use strict";
      
      var log = logger('externalLogin', 'debug');
      var vow;
      var db;
      var url;
      
      function checkCredentials() {
          var user = form.getValue('userName');
          var pwd = form.getValue('pwd');
          console.log(user, pwd);
          couch.init(url);
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
      
      var form = isc.DynamicForm.create({
          // ID: 'dbform',
          margin:10,
          columns: 1
          ,fields: [
              { editorType: 'TextItem', name: 'userName', title: 'User', titleOrientation: 'top', startRow: true}
              ,{ editorType: 'PasswordItem', name: 'pwd', title: 'Password', titleOrientation: 'top', startRow: true}
          ]
      });
      
      var helpLabel = isc.Label.create({
          // ID:'test',
          width: 480,
          height: '100%',
          margin: 10
          // ,border: "1px dashed blue"
          // ,contents: dbDescriptions.pouchDB.description
      });
      
      
      var loginWindow = isc.Window.create({
          title: "Provide credentials for CouchDB"
          // ,autoSize: true
          ,height:430
          ,width: 500
          ,headerIconDefaults: { width:16, height:16, src: 'sync.png'}
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
              form
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
                              loginWindow.hide();
                              vow.break("No credentials provided..");
                          }  
                      })
                      ,isc.Button.create({
                          title: 'Ok'
                          ,startRow: false
                          ,click: checkCredentials
                      })
                            
                      ,isc.LayoutSpacer.create()
                  ]
              })
          ] 
      });
      
      var initialized = false; 
      function init() {
          initialized = true;
      }
      
      return {
          show: function(someUrl) {
              vow = VOW.make();
              if (!initialized) init();
              loginWindow.show();
              url = someUrl.slice(0, someUrl.lastIndexOf('/'));
              db = someUrl.slice(someUrl.lastIndexOf('/') + 1);
              return vow.promise;
          }
      }; 
  }})
;