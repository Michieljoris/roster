/*global define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({ 
   factory: function() {
       "use strict";
       var roster = {};
    
       
       // dbname: 'http://127.0.0.1:2020/roster'
    
    
       roster = {
           dbname: window.dbname,
           eventSnapGap: 30
       };
       
       return roster; 
   }});
