/*global logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define
({ inject: ['types/editors/locationEditor'
            ,'types/editors/shiftEditor'
            ,'types/editors/personEditor'
           ],
   factory: function() {
      "use strict";
      var log = logger('editorLoader');
       
      var args = Array.prototype.slice.call(arguments);
      var arr = [];
      args.forEach(function(a) {
          arr.push(a.type);
      });
      
      log.d('Loaded editors: ' + arr);
      
      return args;
   }});