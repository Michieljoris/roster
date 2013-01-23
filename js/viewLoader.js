/*global logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

// -----@ TOP ----- */
define
// ({ inject: ['table', 'calendar', 'timesheet'],
({ inject: ['View', 'timesheet'],
  factory: function(View) {
      "use strict";
      var log = logger('viewLoader');
      
      var emptyView = View.create({
          type: 'Empty'
      });
      
      var args = Array.prototype.slice.call(arguments, 1);
      var str = '';
      args.forEach(function(a) {
          console.log(a);
          str += ' ' + a.getType();
      });
      
      log.d('Loaded views:' + str);
      
      //Add views loaded by viewLoader.
      return [ emptyView ].concat(args);
  }});