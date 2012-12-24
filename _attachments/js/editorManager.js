/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define
({ inject: ['pouchDS'],
   factory: function(database) {
       "use strict";
       var API = {};
       var editors = {};
      
       var editorWindow = isc.Window.create({
           title: "TODO: Set to event date, start and end",
           autoSize: true,
           width:300, height:300,
           canDragReposition: true,
           canDragResize: false,
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
               console.log('canvas is:', canvas);
               if (canvas) this.removeItem(canvas);
           },
           done: function() {
               editorWindow.hide();
           }
       });
    
       // setting up the various editForms used for different types of records     
       // var editor; //points to editCanvas currently shown in the lower section
      
       API.register = function(editor) {
           editors[editor.type] = editor;
       };
    
       API.show = function(record, settings) {
           if (API.fill(editorWindow, record, settings)) {
               if (settings.title) editorWindow.setTitle(settings.title);
               editorWindow.show();
           }
       };

       var containers = {};
       //the container has to have a method removeCanvas and setCanvas
       var fill = function(container, record, settings) {
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
               console.log("Don't have an editor for this type of record yet!!");
               return false;
           }
           editor.set(record, settings);
        
           if (editor.canvas !== container.getCanvas()) {
               if (containers[record.type])
                   containers[record.type].removeCanvas();
               container.removeCanvas();
               container.setCanvas(editor.canvas); 
               containers[record.type] = container;
           }
        
        
           return true;  
       };
       
      
       API.fill = fill;
       API.save = function(record, changed) {
           var callback = function(response, record) {
               console.log('CALLBACK', response, record);
               API.done(record, 'save');
           };
           
           if (record._rev) {
               if (changed)
                   database.updateData(record, callback);
           }
           else database.addData(record, callback);
           // console.log('saved record, now going to done');
       };
       
       API.done = function(record, action) {
           console.log('hiding editor');
           containers[record.type].done(record, action);
       };
       
       API.cancel = function(record) {
           API.done(record, 'cancel');
           // console.log('cancelling editor');
       };
       
       API.remove = function(record) {
           var container = containers[record.type];
           if (container.removeRecord) container.removeRecord(record);
           else {
               console.log('removing record');
               database.removeData(record);
               API.done(record, 'remove');
           }
       };

       
       return API;
      
   }});