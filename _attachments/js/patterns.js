/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({ 
    inject: ['lib/utils'],
    factory: function(utils)
    { "use strict";
      
      var log = logger('patterns');
      
      
      var patternsArray;
      function init(patternsObject) {
          patternsArray = [];
          Object.keys(patternsObject).forEach(function(p){
              patternsObject[p].name = p;
              patternsArray.push(patternsObject[p]);
          });

          patternsArray = utils.sortBy(patternsArray, 'rank', 'desc');
          patternsArray.forEach(function(p) {
              if (p.pattern) {
                  p.repeat = p.pattern.reduce(function(sum, elem) {
                      return sum + elem;
                  },0);
              }
              if (p.unit && p.unit.lastIndexOf('s') !== p.unit.length-1)
                  p.unit = p.unit + 's'; //for Date.js: .add(x)[unit]()
              p.logicalDate = Date.today().set({
                  year: p.date.getYear() + 1900,
                  month: p.date.getMonth(),
                  day: p.date.getDate() });
          });
          // log.pp(patternsArray);
      }
      
      function sameDay(d1, d2) {
          return d1.getYear() === d2.getYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate();
      }

      function checkTime(shift, pattern) {
          // log.d('checkTime', pattern);
          var start1 = pattern.date.getHours() * 60 + pattern.date.getMinutes();
          var end1 = start1 + pattern.length * 60;
          var start2 = shift.startDate.getHours() * 60 + shift.startDate.getMinutes();
          var end2;
          var h = shift.endDate.getHours();
          var m = shift.endDate.getMinutes();
          
          if (h === 0 && m === 0) end2 = 24*60;
          else end2 = h * 60 + m;
          
          if (start1 >= end2 || end1 <= start2) return false;
          var start = start1 > start2 ? start1 : start2;
          var end = end1 < end2 ? end1 : end2;
          var length = end - start;
          // log.d('XXXXXXXXXXXXXXXXXXXXXXXXXXXX',pattern.type, length);
          return {
              pattern: pattern, length: length   
          };
      }

      function applyPattern(shift, pattern) {
          if (pattern.type === 'penalty')
              log.d('checking penalty pattern');
          var dayLength = 24*60*60*1000;
          var weekLength = 7*dayLength;
          var patternLength;
          var dateToCheck;
          var diff;
          if (!pattern.pattern || pattern.pattern.length === 0) {
              if (sameDay(shift.startDate, pattern.date)) return checkTime(shift, pattern);
          }  
          else {
              patternLength = dayLength * pattern.repeat; 
              switch (pattern.unit) {
                case 'weeks':
                  patternLength = weekLength * pattern.repeat; 
                  //no break; We want to fall through..
                case 'days':
                  // log.d('days', shift.startDate);
                  diff = shift.startDate.getTime() - pattern.logicalDate.getTime();
                  dateToCheck = pattern.date.getTime() + Math.floor(diff/patternLength) * patternLength;
                  dateToCheck = new Date(dateToCheck);
                  // log.d(dateToCheck);
                  break;
                case 'months':
                  diff = shift.startDate.getMonth() - pattern.date.getMonth() +
                      (shift.startDate.getYear() - pattern.date.getYear()) * 12;
                  patternLength = pattern.repeat;
                  dateToCheck = pattern.date.clone();
                  var monthToCheck = Math.floor(diff/patternLength) * patternLength;
                  dateToCheck.addMonths(monthToCheck);
                  break;
                case 'years':
                  diff = shift.startDate.getYear() - pattern.date.getYear();
                  patternLength = pattern.repeat;
                  dateToCheck = pattern.date.clone();
                  var yearToCheck = pattern.date.getYear() + Math.floor(diff/patternLength) * patternLength;
                  dateToCheck.setYear(yearToCheck + 1900);
                  break;
              default: log.e('unknown pattern unit:', pattern.unit);
              }
              var max = pattern.pattern.length;
              var counter;
              for (counter=0; counter < max; counter++) {
                  if (sameDay(shift.startDate, dateToCheck)) {
                      // log.d(pattern);
                      return checkTime(shift,pattern);
                  }
                  dateToCheck.add(pattern.pattern[counter])[pattern.unit]();
              }
          }
          return false;
      }
 
      
      function getWorkHourFields(shift) {
          // if (shift.location && shift.location.workHoursPattern)
          //     setPatternsObject(shift.location.workHoursPattern);
          // log.d('getting work hour fields');
          var qualifiers = [];
          var rank = 0;
          var l = patternsArray.length;
          for (var i = 0; i < l; i++) {
              var pattern = patternsArray[i];
              log.d('Checking pattern '+ pattern.name, pattern.type);
              var result = applyPattern(shift, pattern);
              if (result) {
                  if (pattern.rank) {
                      if (pattern.rank >= rank) {
                          qualifiers.push(result);                   
                          rank = pattern.rank;
                      } 
                      else break;
                  }
                  else qualifiers.push(result);                   
              }
          }
          
          var fields = {};
          qualifiers.forEach(function(p) {
              var h = Math.floor(p.length/60) + (p.length%60)/60;
              h = Math.floor(h*100)/100;
              fields[p.pattern.type] = h;
          });
          // if (fields.publicHoliday) {
          //     if (shift.workedOnPublicHoliday) fields.publicHolidayWorked = fields.publicHoliday;
          //     else fields.publicHolidayNotWorked = fields.publicHoliday;
          // } 
          log.pp('FIELDS', fields);
          return fields;
      }
      
      //you should have a full editor so you can make and add any
      //pattern, but this will have to do for now.
      //this assumes penalty hours start at 8pm
      function makeDayHours(startTime, dLength) {
          if (typeof startTime === 'string')
              startTime = Date.parse(startTime);
          log.d(startTime);
          var pattern = {};
          var midnightTuesday = Date.parse('2000 0am').tuesday();
          var midnightMonday =  Date.parse('2000 0am').monday();
          //Suggested day hours
          var sdHour = startTime.getHours();
          var sdMinutes = startTime.getMinutes();
          // //Day end
          // var edHour = endTime.getHours();
          // var edMinutes = endTime.getMinutes();
          
          //Ordinary hours, the real day hours
          var soHour = 6;
          var soMinutes = 0;
          var oLength = 14;
          
          //The non ordinary hours are penalty hours
          //Ordinary hours
          var oLengthAfterMidnight = soHour + (soMinutes/60) + oLength - 24;
          if (oLength > 0) {
              var soDate = midnightMonday.clone().addHours(soHour);
              soDate.addMinutes(soMinutes);
              pattern.ord1= { type: 'ord',
                              //from startTime till 8pm weekdays
                              date: soDate,
                              length: oLength - (oLengthAfterMidnight > 0 ?  oLengthAfterMidnight : 0),
                              pattern: [1,1,1,1,3],
                              unit: 'day',
                              rank: 100
                            };
             } 
          if (oLengthAfterMidnight > 0) {
              pattern.ord2 = { type: 'ord', 
                               date: midnightMonday.clone().monday(),
                               length: oLengthAfterMidnight, //in hours
                               pattern: [1,1,1,1,3],
                               unit: 'day'
                              ,rank: 100
                             };
          } 
          //Penalty hours are whatever is not ordinary
          if (oLengthAfterMidnight < 0) {
              pattern.penalty1 = { type: 'penalty', 
                                   date: midnightTuesday.clone().addHours(oLengthAfterMidnight),
                                   length: -oLengthAfterMidnight, //in hours
                                   pattern: [1,1,1,1,3],
                                   unit: 'day'
                                   ,rank: 100
                                 };
             oLengthAfterMidnight = 0; 
          } 
          //this is either just the day start time, or the starttime minus
          //how much we went past midnight with the day end time
          var pLength2 = soHour + soMinutes/60 - oLengthAfterMidnight;
          if (pLength2 > 0) {
              pattern.penalty2 = { type: 'penalty',
                                   //from 0am to 6am
                                   date: midnightMonday.clone().addHours(oLengthAfterMidnight),
                                   length: pLength2,
                                   pattern: [1,1,1,1,3],
                                   unit: 'day'
                                   ,rank: 100
                                 };
          }
              
          //Suggested night hours
          var dLengthAfterMidnight = sdHour + sdMinutes/60 + dLength -24;
          if (dLengthAfterMidnight < 0) {
              midnightTuesday = Date.parse('2000 0am').tuesday();
              pattern.night1 = { type: 'night', 
                                 date: midnightTuesday.clone().addHours(dLengthAfterMidnight),
                                 length: -dLengthAfterMidnight, //in hours
                                 pattern: [1], //repeated daily 
                                 unit: 'day'
                                 ,rank: 100
                               };
              dLengthAfterMidnight = 0;
          } 
          //this is either from just midnight, or midnight minus
          //how much we went past midnight with the day end time
          var nLength2 = sdHour + sdMinutes/60 - dLengthAfterMidnight;
          if (nLength2 > 0) {
              // var date = midnightMonday.clone();
              // date.setHours(sdHour);
              // date.setMinutes(sdMinutes);
              pattern.night2 = { type: 'night',
                                 //from 0am to 6am
                                 date: midnightMonday.clone().addHours(dLengthAfterMidnight),
                                 length: nLength2,
                                 pattern: [1],
                                 unit: 'day'
                                ,rank: 100
                               };
          }
          return pattern; 
      }
      window.md = makeDayHours;
      
      return {
          init: init,
          getWorkHourFields: getWorkHourFields,
          makeDayHours: makeDayHours
      };
      
      
    }});