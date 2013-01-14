/*global define: false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/

var log = logger('test');

// logger.showStamp();
// logger.setLevel('info');

define
({ 
    inject: ['shiftQualifier', 'shift'],
    factory: function(shiftQualifier, shift)
    { "use strict";
      var newShift = shiftQualifier.makeShift('25 Dec', 15,0,22,0);
      var values = {
          date: Date.today().set({
             year:2013, month:11, day:20 
          }),
          startTime: Date.today().set({
             year:2013, month:11, day:20,
              hour:15, minute:0
              
          }),
          endTime: Date.today().set({
             year:2013, month:11, day:20,
              hour:22, minute:0
          })
      };     
      // var myShift = shift.create(values);
      shiftQualifier.test(365);
      // var fields = shiftQualifier.getWorkHourFields(newShift);
      // console.dirxml('newShift',newShift);
      // console.dirxml(fields);
      // console.dirxml('myShift',myShift);
      // shiftQualifier.setTags(myShift);
    }});
