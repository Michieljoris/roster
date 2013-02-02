/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ 
    inject: ['lib/utils', 'timesheet/calculateTimesheetColumn'],
    factory: function(utils, calculateTimesheetColumn)
    { "use strict";
      var log = logger('calculateTimesheet');
      var DAY_IN_MILLISECONDS = 24*60*60*1000;
      
      var location, person, shifts, fortnight;
      var columns = [];
      var totals;
      
      
      //date, time, text, integer, boolean
      function getColumn(number) { // 0<=number<14
          return columns[number] ? columns[number] : {};
      }
      
      function getTotals() {
          return totals;
      }
      
      
      function init(aFortnight, aPerson, aLocation, someShifts) {
          console.log('in calcsheet');
          fortnight = aFortnight;
          fortnight.setHours(0);
          fortnight.setMinutes(0);
          fortnight.setSeconds(0);
          location = aLocation;
          person = aPerson;
          shifts = utils.sortBy(someShifts, 'startDate', 'asc');
          
          var startDay = fortnight.getTime();
          shifts.forEach(function(s) {
              var day = Math.floor((s.startDate.getTime() - startDay)/DAY_IN_MILLISECONDS);
              if (!columns[day]) columns[day] = [];
              columns[day].push(s);
          });
          log.pp(columns);
          // (columns);
          columns = columns.map(function(c, i) {
              if (!c) return {};
              var fields = calculateTimesheetColumn.getFields(
                  person, location, c);
              fields.shifts = c;
              fields.costCentre = location.costCentre ? location.costCentre : '??';
              fields.date = fortnight.clone().addDays(i).toEuropeanShortDate().slice(0,5);
              return fields;
          });
          log.pp(columns);
          totals = utils.addFieldValues(columns);
          return {
              column: getColumn,
              totals: getTotals
          };
      }
      return init;
   
    }});