/*global define: false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/



define
({ 
    inject: ['lib/utils'],
    factory: function(utils)
    { "use strict";
      
      var log = logger('timeQualifier');
      // logger.showStamp();
      // logger.setLevel('info');
      
      var patternsArray = [];
      //Describe a repeat pattern by setting date to an arbitrary
      //(long ago) date, and to a day of the week of your choosing,
      //and to the start time of the period that repeats. Length is
      //the length of the period in hours The pattern is an array of
      //lengths of units, describing when the period will
      //reoccur. Higher ranks take prevalence over lower ranks. 
      //Pattern with no rank property will always be applied
      var defaultPatternsObject = { 
          // night1: { type: 'night', 
          //           from: Date.parse('2000 10pm').monday(),'2000', '10pm', 'monday'
          //           to: Date.parse('2000 10pm').monday(), //undefined is indefinitely
          //           length: 2, //in hours
          //           pattern: [1], //repeate daily 
          //           unit: 'day'
          //           // rank: 100
          //         },
          day: { type: 'day', 
                    date: Date.parse('2000 6am').monday(),
                    length: 16, //in hours
                    pattern: [1], //repeated daily 
                    unit: 'day'
                    // rank: 100
                  },
          night1: { type: 'night', 
                    date: Date.parse('2000 10pm').monday(),
                    to: Date.parse('2014 10pm').monday(), //undefined is indefinitely TODO, not implemented
                    length: 2, //in hours
                    pattern: [1], //repeated daily 
                    unit: 'day'
                    // rank: 100
                  },
          night2: { type: 'night',
                    date: Date.parse('2000 0am').monday(),
                    length: 6,
                    pattern: [1],
                    unit: 'day'
                    // rank: 100
                  },
          early: { type: 'early',
                   date: Date.parse('2000 6am').monday(),
                   length: 1.5,
                   pattern: [1,1,1,1,3],
                   unit: 'day',
                   rank: 100
                 },
          ord: { type: 'ord',
                 date: Date.parse('2000 7:30am').monday(),
                 length: 12,
                 pattern: [1,1,1,1,3],
                 unit: 'day',
                 rank: 100
               },
          late: { type: 'late',
                  date: Date.parse('2000 7:30pm').monday(),
                  length: 2.5,
                  pattern: [1,1,1,1,3],
                  unit: 'day',
                  rank: 100
                },
          //3 ways to describe weekends:
          //this one finds both days in one pattern though:
          weekend: { type: 'weekend',
                     date: Date.parse('2000 6:00am').saturday(),
                     length: 16,
                     pattern: [1,6],
                     unit: 'day',
                     rank: 200
                   },
          // night3: { type: 'night', 
          //           date: Date.parse('2000 10pm').monday(),
          //           length: 2, //in hours
          //           pattern: [1], //repeate daily 
          //           unit: 'day',
          //           rank: 200
          //         },
          // night4: { type: 'night',
          //           date: Date.parse('2000 0am').monday(),
          //           length: 6,
          //           pattern: [1],
          //           unit: 'day',
          //           rank: 200
          //         },
          //and:
          // weekend2: { type: 'weekend',
          //   date: Date.parse('2000 0:00am').saturday(),
          //   length: 24,
          //   pattern: [1],
          //   unit: 'week',
          //   rank: 200
          // },
          // weekend3: { type: 'weekend',
          //   date: Date.parse('2000 0:00am').sunday(),
          //   length: 24,
          //   pattern: [1],
          //   unit: 'week',
          //   rank: 200
          // },
          //and: //this would have to be split into two patterns:
          // weekend4:{ type: 'weekend',
          //   date: Date.parse('2000 0:00am').saturday(),
          //   length: 48, //48 hours
          //   pattern: [1],
          //   unit: 'week',
          //   rank: 200
          // },
    
          christmas: { type: 'publicHoliday', //Christmas
                       date: Date.parse('25 dec 2000 6am'),
                       pattern: [1],
                       unit: 'year',
                       length: 16,
                       rank: 300
                     },
          boxing: { type: 'publicHoliday', //Boxing day
                    date: Date.parse('26 dec 2000 6am'),
                    pattern: [1],
                    unit: 'year',
                    length: 16,
                    rank: 300
                  },
          oneoff: { type: 'publicHoliday', //one off public holiday
                    date: Date.parse('5 March 2013 6am'),
                    pattern: [], //doesn't pattern...
                    // unit: 'year',
                    length: 16,
                    rank: 300
                  },
          monthly: { type: 'monthly event', 
                     date: Date.parse('5 March 2000 6am'),
                     pattern: [1],
                     unit: 'month',
                     length: 16,
                     rank:100 
                   }
      };
      
      function setPatternsObject(patternsObject) {
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
              if (p.unit && p.unit.lastIndexOf('s') !== p.unit.lenght-1)
                  p.unit = p.unit + 's'; //for Date.js: .add(x)[unit]()
              p.logicalDate = Date.today().set({
                  year: p.date.getYear() + 1900,
                  month: p.date.getMonth(),
                  day: p.date.getDate() });
          });
      }
      
      function sameDay(d1, d2) {
          return d1.getYear() === d2.getYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate();
      }

      function checkTime(shift, pattern) {
          var start1 = pattern.date.getHours() * 60 + pattern.date.getMinutes();
          var end1 = start1 + pattern.length * 60;
          var start2 = shift.startDate.getHours() * 60 + shift.startDate.getMinutes();
          var end2 = shift.endDate.getHours() * 60 + shift.endDate.getMinutes();
          if (start1 >= end2 || end1 <= start2) return false;
          var start = start1 > start2 ? start1 : start2;
          var end = end1 < end2 ? end1 : end2;
          var length = end - start;
          return {
              pattern: pattern, length: length   
          };
      }

      function applyPattern(shift, pattern) {
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
                      return checkTime(shift,pattern);
                  }
                  dateToCheck.add(pattern.pattern[counter])[pattern.unit]();
              }
          }
          return false;
      }
 
      function getWorkHourFields(shift) {
          if (shift.location && shift.location.workHoursPattern)
              setPatternsObject(shift.location.workHoursPattern);
          
          var qualifiers = [];
          var rank = 0;
          var l = patternsArray.length;
          for (var i = 0; i < l; i++) {
              var pattern = patternsArray[i];
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
          
          return fields;
      }
    
      setPatternsObject(defaultPatternsObject);
      
      // function test(n) {
      //     var shifts = [];

      //     var s;
      //     for (var i = 0; i< n; i++) {
      //         s = makeShift('1 Jan', 15,0,23,0);
      //         s.date = s.date.addDays(i);
      //         s.startDate = s.startDate.addDays(i);
      //         s.endDate = s.endDate.addDays(i);
      //         shifts.push(s);
      //     }
      //     var fields;
      //     shifts.forEach(function(s) {
      //         var str = '';
      //         fields = getWorkHourFields(s);
      //         Object.keys(fields).forEach(function(f) {
      //             str += f + ' ' + fields[f] + ' ';
      //         });
      //         log.i(s.toString() + ':' + str);
      //     });
      //     console.log('done');
      // }
      
      return {
          setPatterns: setPatternsObject,
          getWorkHourFields: getWorkHourFields
          // ,makeShift: makeShift
          // ,test: test
      };}});
