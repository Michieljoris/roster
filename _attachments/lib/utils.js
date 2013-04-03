/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

//----------------------------------------
//A collection of general utility functions

define
({ factory: function()
   { "use strict";
     var log = logger('utils');
     
     //##sortBy
     //Sorts an array of objects by the property, ascending unless dir
     //is equal to the string 'desc'.
     function sortBy(arr, prop, dir) {
         return arr.sort(function(a,b) {
             if (!a[prop]) return -1;
             if (!b[prop]) return 1;
             if (dir === 'desc') return a[prop]>b[prop] ? -1 : 1;
             else return a[prop]<b[prop] ? -1 : 1;
         });
     }

     //##addFieldValues

     //Returns a new object with the totals of the fields of the
     //objects. Any field with a number assigned is expected to have a
     //number assigned to it in other objects as well, if present in
     //the object. Any field with a boolean value will be taken as the
     //number 0 or 1.
     function addFieldValues(objects) {
         return objects.reduce(function(fields, object) {
             Object.keys(object).forEach(function(f) {
                 if (fields[f] && object[f]) fields[f] += object[f];
                 else if (typeof object[f] === 'number' ||
                          typeof object[f] === 'boolean')  fields[f] = object[f];
                 // else if (typeof object[f] === 'boolean') fields[f] = 1;
             });   
             return fields;
         }, Object.create(null));
     }
     
     //##pp
     //Pretty prints an object.
     function pp() {
         for (var i=0; i< arguments.length; i++) {
             
            console.log(JSON.stringify(arguments[i], null, 2));
	     // var arg= arguments[i];
	     // if (arg instanceof Date) console.log(arg); 
	     // else if (typeof  arg === "string") console.log(arg); 
	     // else if (typeof arg === 'object')
             //     for (var j in arg) console.log(" " + j + ":" + arg[j]);
	     // else console.log(arg);
         }
     }
     
     //##createCSSClass
     //Create css classes on the fly. Use like this:
     //`createCSSClass('.mycssclass', 'display:none');`
     function createCSSClass(selector, style) {
         log.d('Creating css classes!!!!!!!!!!!!!!!',  selector, style);
         if (!document.styleSheets) {
             return;
         }

         if (document.getElementsByTagName("head").length === 0) {
             return;
         }

         var styleSheet;
         var mediaType, i;
         var media;
         if (document.styleSheets.length > 0) {
             for (i = 0; i < document.styleSheets.length; i++) {
                 if (document.styleSheets[i].disabled) {
                     continue;
                 }
                 media = document.styleSheets[i].media;
                 mediaType = typeof media;

                 if (mediaType === "string") {
                     if (media === "" || (media.indexOf("screen") !== -1)) {
                         styleSheet = document.styleSheets[i];
                     }
                 } else if (mediaType === "object") {
                     if (media.mediaText === "" || (media.mediaText.indexOf("screen") !== -1)) {
                             styleSheet = document.styleSheets[i];
                     }
                 }

                 if (typeof styleSheet !== "undefined") {
                     break;
                 }
             }
         }

         if (typeof styleSheet === "undefined") {
             var styleSheetElement = document.createElement("style");
             styleSheetElement.type = "text/css";

             document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

             for (i = 0; i < document.styleSheets.length; i++) {
                 if (document.styleSheets[i].disabled) {
                     continue;
                 }
                 styleSheet = document.styleSheets[i];
             }

             media = styleSheet.media;
             mediaType = typeof media;
         }

         if (mediaType === "string") {
             for (i = 0; i < styleSheet.rules.length; i++) {
                 if (styleSheet.rules[i].selectorText.toLowerCase() === selector.toLowerCase()) {
                     styleSheet.rules[i].style.cssText = style;
                     return;
                 }
             }

             styleSheet.addRule(selector, style);
         } else if (mediaType === "object") {
             for (i = 0; i < styleSheet.cssRules.length; i++) {
                 if (styleSheet.cssRules[i].selectorText.toLowerCase() === selector.toLowerCase()) {
                     styleSheet.cssRules[i].style.cssText = style;
                     return;
                 }
             }

             styleSheet.insertRule(selector + "{" + style + "}", 0);
         }
     }
     window.createCSSClass = createCSSClass;
     
     //any objects that are not objects are ignored
      function addProperties() {
          function addProps(o1,o2) {
              o1 = typeof o1 === 'object' ? o1 : {};
              o2 = typeof o2 === 'object' ? o2 : {};
              Object.keys(o2).forEach(function(k) {
                  o1[k] = o2[k];
              });
              return o1;
          }
          var args = Array.prototype.slice.call(arguments);
          var newObject = {};
          args.forEach(function(a) {
              addProps(newObject, a);
          });
          return newObject;
      } 
      
     return {
         addProperties: addProperties,
         sortBy: sortBy,
         addFieldValues: addFieldValues,
         pp: pp,
         createCSSClass: createCSSClass
     };
   }});

