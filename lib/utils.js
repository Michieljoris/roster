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
     //objects.  Any field that is not a number is ignored. Any field
     //with a number assigned is expected to have a number assigned to
     //it in other objects as well, if present in the object.
     function addFieldValues(objects) {
         return objects.reduce(function(fields, object) {
             Object.keys(object).forEach(function(f) {
                 if (fields[f]) fields[f] += object[f];
                 else if (typeof object[f] === 'number') fields[f] = object[f];
             });   
             return fields;
         }, Object.create(null));
     }
     
     return {
         sortBy: sortBy,
         addFieldValues: addFieldValues
     };
   }});

