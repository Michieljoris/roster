/*global isc:false VOW:false logger:false isc:false define:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/


define(
    { inject: ['lib/cookie'], 
      factory: function(cookie) 
      { "use strict";
        var log = logger('user');
        
        var user;
        
        function init(aUser) {
            var vow = VOW.make();
            user = aUser; 
            vow.keep(user);
            return vow.promise;
            
        }
        
        function change() {
            
        }
        
        return {
            init: init
            ,change: change
        };
        
        
      }});



