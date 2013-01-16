/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/



define
({ factory: function()
   { "use strict";
     // var log = logger('utils');
     
     //Sorts an array of objects by the property, ascending unless dir
     //is equal to desc
     function sortBy(arr, prop, dir) {
         return arr.sort(function(a,b) {
             if (!a[prop]) return -1;
             if (!b[prop]) return 1;
             if (dir === 'desc') return a[prop]>b[prop] ? -1 : 1;
             else return a[prop]<b[prop] ? -1 : 1;
         });
     }
     
     return {
         sortBy: sortBy
     };
   }});