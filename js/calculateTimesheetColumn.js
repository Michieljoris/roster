/*global VOW:false define:false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/
// (function() {
      // function addFieldValues(shifts) {
      //     return shifts.reduce(function(fields, shift) {
      //         Object.keys(shift).forEach(function(f) {
      //             if (fields[f]) fields[f] += shift[f];
      //             else {
      //                 if (typeof shift[f] === 'number') fields[f] = shift[f];
      //             }
      //         });   
      //         return fields;
      //     }, Object.create(null));
      // }
    // function adjustFields(object, fields, amount) {
    //     for (var i = 0; i<fields.length; i++) {
    //         var f = fields[i];
    //         if (object[f]) {
    //             amount =  - (object[f] -= amount);
    //             if (amount >= 0) delete object[f]; 
    //             else return object;
    //         }
    //     }
    //     return object;
    // }
    // var obj = {a:3, b:2};
    // console.log(adjustFields(obj, ['a', 'b'], 4));
// })();    


define
({ 
    inject: ['lib/utils'],
    factory: function(utils)
    { "use strict";
      var log = logger('calculateTimesheetColumn');
      // logger.showStamp();
      // logger.setLevel('info');

      
      //-----------------------------------------------------------------------------------------------
      //just checking here to be sure. Should actually check when
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
      
      function addFieldValues(shifts) {
          return shifts.reduce(function(fields, shift) {
              Object.keys(shift).forEach(function(f) {
                  if (fields[f]) fields[f] += shift[f];
                  else if (typeof shift[f] === 'number') fields[f] = shift[f];
              });   
              return fields;
          }, Object.create(null));
      }
      
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
      
      
      function getFields(person, location, shifts) {
          if (overlap(shifts)) throw 'Error: shifts overlap';
          var fields = addFieldValues(shifts);
          
          // set public holiday fields:
          var ph = fields.publicHoliday;
          if (ph) {
              if (person.status === 'casual') fields.publicHolWork2p5 =  ph;
              else {
                  var phw = fields.publicHolidayWorked;
                  if (phw) {
                      var over76 = Math.floor((phw - 7.6) * 100)/100;
                      phw = over76 > 0 ? 7.6 : phw;
                      fields.publicHolidayOrdinary = phw;
                      fields.publicHolWorkPerm1p5 = phw;
                      if (over76 > 0) fields.publicHolWork2p5 = over76;
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
          
          //set overtime fields:
          var SHIFT_MAXLEN = 10;
          var dayHours = fields.day ? fields.day : 0;
              var disturbedSleepHours = 0;
          if (fields.night) { fields.disturbedSleepHours = disturbedSleepHours = fields.night; }
          fields.totalHoursWorked = dayHours + disturbedSleepHours;
          var overtime = 0;
          if (!ph) {
              overtime = Math.max(fields.day - SHIFT_MAXLEN, 0);
              log.d(overtime);
              adjustFields(fields, ['weekend', 'late', 'ord', 'early'], overtime);
          }
          
          overtime += disturbedSleepHours;
          if (overtime > 0) {
              fields.overtime = overtime;
              var over3 = overtime -3;
              fields.overtimeT1p5 = over3 > 0 ? 3 : overtime; 
              if (over3 > 0) fields.overtimeT2 = over3;
          }
          
          //toil fields?
          
          
          
          // log.pp('fields', fields, 'person', person, 'location', location);
          
          return fields;
      }
          
      //overtime 
          
      return {
          getFields: getFields
      };
      
    }});
