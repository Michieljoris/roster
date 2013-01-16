/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ 
    inject: ['lib/utils', 'calculateTimesheetColumn'],
    factory: function(utils, calculateTimesheetColumn)
    { "use strict";
      // var log = logger('calculateTimesheet');
      
      var location, person, shifts, fortnight;
      var days = [];
      
      function init(aFortnight, aPerson, aLocation, someShifts) {
          fortnight = aFortnight;
          location = aLocation;
          person = aPerson;
          shifts = utils.sortBy(someShifts, 'startDate', 'asc');
          
          var today = fortnight.clone();
          var collection = [];
          shifts.forEach(function(s) {
              while (s.startDate > today); 
                  {  days.push(collection); 
                     collection = [];
                     today.addDays(1);
                  } 
              collection.push(s);
          });
          today = fortnight.clone();
          days.map(function(c,i) {
              var fields = calculateTimesheetColumn.getFields(
                  person, location, c);
              fields.shifts = c;
              fields.date = today.clone();
              today.addDays(1);
              });
      }
   
      //date, time, text, integer, boolean
      function getDay(number) { // 0<=number<14
          
      }
      
      return {
          init: init,
          getDay: getDay
      };
   
    }});