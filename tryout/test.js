/*global define: false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/

var log = logger('test');

// logger.showStamp();
// logger.setLevel('info');

define
({ 
    inject: ['shiftQualifier'],
    factory: function(shiftQualifier)
    { "use strict";
      
      console.log('hello');
    }});
