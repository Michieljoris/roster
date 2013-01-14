/*global VOW:false define:false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/


define
({ 
    
    inject: ['shiftQualifier'],
    factory: function(shiftQualifier)
    { "use strict";
      var log = logger('calculateTimesheetColumn');
      // logger.showStamp();
      // logger.setLevel('info');

      
      //-----------------------------------------------------------------------------------------------
      function overlap(shifts) {
         //TODO 
      }
      
      function addFieldValues(shifts) {
       //TODO   
      }
      
      function getFields(person, location, shifts) {
          if (overlap(shifts)) return 'Error: shifts overlap';
          var fields = addFieldvalues(shifts,
                                     ['ord', 'early', 'late', 'publicHoliday', 'night', 'weekend']);
          
          // set public holiday fields:
          var ph = fields.publicHoliday;
          if (ph) {
              if (person.status === 'casual') {
                  fields.publicHolWork2p5 =  ph;
              }
              else if (shift.isPublicHolidayWorked) {
                  var over76 = ph - 7.6;
                  ph = over76 > 0 ? 7.6 : ph;
                  fields.publicHolidayOrdinary = ph;
                  fields.publicHolWorkPerm1p5 = ph;
                  if (over76 > 0) fields.publicHolWork2p5 = over76;
              }
              else {
                  //max of 7.6 hours can be claimed
                  fields.publicHolidayOrdinary = ph > 7.6 ? 7.6 : ph;
              }
          }
          
          //overtime 
          
          
          return 'bla';
      }
      
          
      return {
          getFields: getFields
      };
      
    }});
