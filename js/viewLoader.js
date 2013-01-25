/*global logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
({ inject: ['table', 'calendar', 'timesheet'],
// ({ inject: ['timesheet', 'calendar'],
// ({ inject: ['calendar'],
  factory: function() {
      "use strict";
      var log = logger('viewLoader');
      
      var args = Array.prototype.slice.call(arguments);
      var str = '';
      args.forEach(function(a) {
          // console.log(a);
          str += ' ' + a.getType();
      });
      
      log.d('Loaded views:' + str);
      
      return args;
  }});