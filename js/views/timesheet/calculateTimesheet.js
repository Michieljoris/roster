/*global logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:12 maxlen:190 devel:true*/

define
({ 
    inject: ['lib/utils'],
    factory: function(utils)
    { "use strict";
      var log = logger('calculateTimesheet');
      var DAY_IN_MILLISECONDS = 24*60*60*1000;
      
      // var location, person, shifts, fortnight;
      var columns = [];
      var totals;
      
      
      //-----------------------------------------------------------------------------------------------
      //Just checking here to be sure. Should actually check when
      //entering shifts as well. Though you might not have the full
      //set of data, eg from other houses. This just checks
      //overlapping shifts from one location. There should be a check
      //for all the shifts worked on this day, and then filter out the
      //ones for this location?
      function overlap(shifts) {
          shifts = utils.sortBy(shifts, 'startDate', 'asc');
          for (var i = 1; i < shifts.length; i++) {
              if (shifts[i-1].endDate > shifts[i].startDate) return true;
          }
          return false;
      }
      
      //Take away amount from the total of the value of
      //object[fields], the order in which the fields are listed
      //setting their priority. (For claiming overtime)
      function adjustFields(object, fields, amount) {
          for (var i = 0; i<fields.length; i++) {
              var f = fields[i];
              if (object[f]) {
                  amount =  - (object[f] -= amount);
                  if (amount >= 0) delete object[f]; 
                  else return object;
              }
          }
          return object;
      } 
      
      
      function calcFields(person, location, shifts) {
          if (overlap(shifts)) {
              log.d('overlapping!!');
              throw new Error("Alert:Can't calculate timesheet. Shifts overlap on " +
                              shifts[0].date.toLocaleDate());
          }
          var fields = utils.addFieldValues(shifts);
          fields.awayFromBase = fields.awayFromBase ? 1 : '';
          fields.sleepOver = fields.sleepOver ? 1 : '';
          
          log.d("FIELDS:", fields);
          // set public holiday fields:
          var ph = fields.publicHoliday;
          if (ph) {
              if (person.status === 'casual') {
               fields.publicHolidayOrdinary =  ph;   
               fields.publicHolWorkPerm1p5 =  ph;   
              }
              else {
                  var phw = fields.publicHolidayWorked;
                  if (phw) {
                      // var over76 = Math.floor((phw - 7.6) * 100)/100;
                      // phw = over76 > 0 ? 7.6 : phw;
                      fields.publicHolidayOrdinary = phw;
                      fields.publicHolWorkPerm1p5 = phw;
                      // if (over76 > 0) fields.publicHolWork2p5 = over76;
                  }
                  var phnw = fields.publicHolidayNotWorked;
                  if (phnw) {
                      // if (phnw > 7.6) { throw 'You cannot claim more than 7.6 hours for a public holiday.'; }
                      //max of 7.6 hours can be claimed
                      if (fields.publicHolidayOrdinary) fields.publicHolidayOrdinary +=  phnw;
                      else fields.publicHolidayOrdinary =  phnw;
                  }
              }
              
          }
          
          //set overtime and disturbed sleep fields:
          var over2;
          
          var disturbedSleepHours = 0;
          if (fields.night) {
              fields.disturbedSleepHoursT1 = fields.disturbedSleepHours = disturbedSleepHours = fields.night;
              over2 = fields.night -2;
              fields.disturbedSleepHoursT1p5 = over2 > 0 ? 2 : fields.night; 
              if (over2 > 0) fields.disturbedSleepHoursT2 = over2;
              
          }
          
          var dayHours = fields.day ? fields.day : 0;
          fields.totalHoursWorked = dayHours + disturbedSleepHours;
          
          var SHIFT_MAXLEN = 10;
          var overtime = 0;
          if (!ph) {
              overtime = Math.max(dayHours - SHIFT_MAXLEN, 0);
              if (overtime > 0) {
                  if (person.status !== 'casual')
                      adjustFields(fields, ['weekend', 'late', 'ord', 'early'], overtime);
                  fields.overtime = overtime;
                  over2 = overtime -2;
                  fields.overtimeT1p5 = over2 > 0 ? 2 : overtime; 
                  if (over2 > 0) fields.overtimeT2 = over2;
              }
          }
          if (person.status === 'casual') {
              if(fields.ord) {
                  fields.ord += fields.late ? fields.late: 0;
              }
              if(fields.weekend) {
                  fields.ord = fields.weekend;
              }
              
          }
          // overtime += disturbedSleepHours;
          
          //toil fields?
          
          
          
          // log.pp('fields', fields, 'person', person, 'location', location);
          
          return fields;
      }
      
      
      //date, time, text, integer, boolean
      var getColumn = function (number) { // 0<=number<14
          return columns[number] ? columns[number] : {};
      };
      
      function getTotals() {
          return totals;
      }
      
      
      function init(aFortnight, aPerson, aLocation, someShifts) {
          console.log('in calcsheet');
          var fortnight = aFortnight;
          fortnight.setHours(0);
          fortnight.setMinutes(0);
          fortnight.setSeconds(0);
          var location = aLocation;
          var person = aPerson;
          var shifts = utils.sortBy(someShifts, 'startDate', 'asc');
          columns = [];
          var startDay = fortnight.getTime();
          shifts.forEach(function(s) {
              var day = Math.floor((s.startDate.getTime() - startDay)/DAY_IN_MILLISECONDS);
              if (!columns[day]) columns[day] = [];
              columns[day].push(s);
          });
          
          columns = columns.map(function(c, i) {
              if (!c) return {};
              var fields = calcFields(
                  person, location, c);
              fields.shifts = c;
              fields.costCentre = location.costCentre ? location.costCentre : '??';
              var temp = fortnight.clone().addDays(i);
              fields.date = temp.getDate() + '/' + (temp.getMonth() + 1);
              return fields;
          });
          totals = utils.addFieldValues(columns);
      }
      return {
          init: init
          ,getColumn: getColumn
          ,getTotals: getTotals
      };
    }});