/*global logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
// ({ inject: ['views/table', 'views/calendar', 'views/timesheet'],
({ inject: ['views/table', 'views/calendar', 'views/timesheet', 'views/extCalendar'],
// ({ inject: ['timesheet', 'calendar'],
// ({ inject: ['calendar'],
  factory: function() {
      "use strict";
      var log = logger('viewLoader');
      
      var args = Array.prototype.slice.call(arguments);
      var arr = [];
      args.forEach(function(a) {
          arr.push(a.getType());
      });
      
      log.d('Loaded views: ' + arr);
      
      return args;
  }});