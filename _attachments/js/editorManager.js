/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:10 maxlen:150 devel:true*/

define
({ inject: ['loaders/backend', 'types/typesAndFields', 'user'],
   factory: function(backend, typesAndFields, user) {
       "use strict";
       var log = logger('editorManager');
       var API = {};
       var editors = {};
       
      
       var editorWindow = isc.Window.create({
           title: "TODO: Set to event date, start and end",
           // autoSize: true,
           width: 360,
           height:440,
           // height:'100%',
           canDragReposition: true,
           canDragResize: false
           ,
           showMinimizeButton:false, 
           autoCenter: true,
           isModal: true,
           showModalMask: true,
           autoDraw: false,
           getCanvas: function() {
               if (this.items) return this.items[0];
               else return null;
           },
           setCanvas: function(canvas) {
               // if (this.canvas === canvas) return;
               // this.removeCanvas();
               // this.canvas = canvas;
               this.addItem(canvas);
           }, 
           removeCanvas: function() {
               // if (this.canvas) this.removeItem(this.canvas);
               var canvas = this.getCanvas();
               log.d('canvas is:', canvas);
               if (canvas) this.removeItem(canvas);
           },
           done: function() {
               //reset the form, since hiding a window means you've navigated away
               //you don't need to check whether user wants to save changes
               this.getCanvas().rememberValues();
               //and hide the window
               editorWindow.hide();
           }
           
       });
    
       // setting up the various editForms used for different types of records     
       // var editor; //points to editCanvas currently shown in the lower section
      
       API.register = function(editor) {
           editors[editor.type] = editor;
           var fieldsCloner = typesAndFields.getFieldsCloner(editor.type, 'asObject');
           return fieldsCloner();
       };
    
       API.show = function(record, settings) {
           if (API.fill(editorWindow, record, settings)) {
               if (settings.title) editorWindow.setTitle(settings.title);
               else editorWindow.setTitle('Edit: ' + record.type);
               editorWindow.show();
           }
       };
       
       

       var containers = {};
       //the container has to have a method removeCanvas and setCanvas
       var fill = function(presentContainer, record, settings) {
           
           if (!record) {
               console.error("Null record!!");
               return false;
           }
           if (!record.type) {
               console.error("This record doesn't have a type", record);
               return false;
           }
           var editor = editors[record.type];
           if (!editor) {
               log.d("Don't have an editor for this type of record yet!!");
               return false;
           }
           
           
           // var changed = false;
           var presentCanvas = presentContainer.getCanvas();
           // if (presentCanvas && presentCanvas.valuesHaveChanged) {
           //     changed = presentCanvas.valuesHaveChanged();
               
           //     log.d(presentCanvas);
  
           // }
           var oldContainer = containers[record.type];
           // if (oldContainer) {
           //     var otherCanvas = oldContainer.getCanvas();
           //     if (otherCanvas && otherCanvas.valuesHaveChanged) {
           //         changed = changed || otherCanvas.valuesHaveChanged();
           //         log.d(otherCanvas);
  
           //     }
           // }
           function putEditorInCanvas() {
               editor.set(record, settings);
        
               if (editor.canvas !== presentCanvas) {
                   if (oldContainer) oldContainer.removeCanvas();
                   presentContainer.removeCanvas();
                   // editor.canvas.setHeight('100%');
                   editor.canvas.setWidth('100%');
                   presentContainer.setCanvas(editor.canvas); 
                   containers[record.type] = presentContainer;
               }
           }
           
           // var confirmDiscardDialog = isc.Dialog.create({
           //     message : "Values have changed. Save?",
           //     icon:"[SKIN]ask.png",
           //     buttons : [
           //         isc.Button.create({ title:"Discard" }), //0
           //         isc.Button.create({ title:"Save" })  //1
           //     ],
           //     buttonClick : function (button, index) {
           //         log.d(index);
           //         if (index === 1) {
           //             //save    
           //         }
           //         else bla();
           //         this.hide();
           //     }
           // });
           
           // if (changed) confirmDiscardDialog.show();
           // else bla();
           putEditorInCanvas();
           
           return true;  
       };
       
      
       API.fill = fill;
       API.save = function(record, updateForm) {
           var callback = function(response, record) {
               log.d('CALLBACK', response, record);
               API.done(record, 'save');
               if (updateForm) updateForm(record);
           };
           
           var dataSource = backend.get().getDS();
           // record.lastEdited = {
           //     id: user.get()._id,
           //     time: new Date()
           // };
           record.lastEditedBy = user.get()._id;
           record.lastEditedAt = new Date();
           if (record._rev) {
               dataSource.updateData(record, callback);
           }
           else dataSource.addData(record, callback);
           
           // log.d('saved record, now going to done');
       };
       
       API.done = function(record, action) {
           log.d('hiding editor');
           containers[record.type].done(record, action);
       };
       
       API.cancel = function(record) {
           API.done(record, 'cancel');
           // log.d('cancelling editor');
       };
       
       API.remove = function(record) {
           var container = containers[record.type];
           if (container.removeRecord) container.removeRecord(record);
           else {
               var dataSource = backend.get().getDS();
               log.d('removing record');
               dataSource.removeData(record);
               API.done(record, 'remove');
           }
       };
       
       API.changed = function(editor, changed) {
           log.d('changed');
           var presentContainer = containers[editor.type];
           if (presentContainer.changed) presentContainer.changed(changed);   
       };
       
       return API;
      
   }});