/*global describe:false it:false expect:false define:false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:10 maxcomplexity:100 maxlen:190 devel:true*/


// logger.showStamp();
// logger.setLevel('info');

define
({ 
    inject: ['calculateTimesheet', 'shiftQualifier', 'calculateTimesheetColumn'],
    factory: function(calculateTimesheet, shiftQualifier, calculateTimesheetColumn)
    { "use strict";
      var log = logger('test');
      logger.showStamp();
      function getBool() {
          var r = Math.floor(Math.random() * 2);
          return r === 0;
      }
        
      var lmax = 20; //number of locations
      var pmax = 100; //number of people
        
      var locations = (function(n) {
          var result = [];
          for (var i = 0; i < n; i++) {
              result.push( 'loc' + i);
          } 
          return result; 
      })(lmax);
        
      var persons = (function(n) {
          var result = [];
          for (var i = 0; i < n; i++) {
              result.push( 'p' + i);
          } 
          return result; 
      })(pmax);
        
      function random(rangeStart, rangeEnd) {
          var span = rangeEnd - rangeStart + 1;
              return rangeStart +  Math.floor(Math.random() * span);
      }
        
      function makeRandomShift(period) {
          var start = new Date();
          var hour = random(0,23);
          var offset = random(0,period); 
          start.setDate(start.getDate() + offset);
          start.setHours(hour);
          start.setMinutes(0);
          start.setSeconds(0);
          var length= random(1,20)/2;
          if (hour + length > 24) length = 24 - hour;
          var end = new Date( start.getTime() + length*3600000);
	  var timezoneOffset = start.getTimezoneOffset();
          console.log(timezoneOffset);
	  start = new Date(start.getTime() + (timezoneOffset * 60000));
	  end = new Date(end.getTime() + (timezoneOffset * 60000));
          console.log(hour, length, start,end);
          return {
              group: 'shift',
              startDate: start,
              endDate: end,
              notes: 'notes',
              ad: getBool(),
              person: persons[Math.floor(Math.random() * pmax)],
              location: locations[Math.floor(Math.random() * lmax)]
          };
            
      }
        
      function bulk(args) {
          var i;
          var shiftsPerDay = args.shiftsPerDay;
          var newDocs= [];
          for (var g in args) {
                  // console.log(args[g]);
                  var amount = args[g];
              var period = Math.floor(amount/shiftsPerDay);
              switch (g) {
                case 'shift':
                  for (i = 0; i < amount; i++) {
                      newDocs.push(makeRandomShift(period));
                  }
                  break;
                case 'person': console.log('person'); break;
              default:
              }
          } 
          return newDocs;
      } 
        
      // function doBulk() {
      //     var docs =  bulk({
      //         shiftsPerDay: 2,
      //         shift: 100,
      //         location: 10,
      //         person: 10,
      //         role: 10,
      //         user:10 
      //     });
            
      //     console.log(docs);
      //     pbulk(docs, function(err, response) {
      //         console.log(err, response);
      //         // Response array:
      //         // [
      //         //   {
      //         //     "ok": true,
      //         //     "id": "828124B9-3973-4AF3-9DFD-A94CE4544005",
      //         //     "rev": "1-A8BC08745E62E58830CA066D99E5F457"
      //         //   }
      //         // ]
      //     });
      // } 
      
      // function test(n) {
      //     var shifts = [];

      //     var s;
      //     for (var i = 0; i< n; i++) {
      //         s = shiftQualifier.makeShift('1 Jan', 15,0,23,0);
      //         s.date = s.date.addDays(i);
      //         s.startDate = s.startDate.addDays(i);
      //         s.endDate = s.endDate.addDays(i);
      //         shifts.push(s);
      //     }
      //     var fields;
      //     shifts.forEach(function(s) {
      //         var str = '';
      //         fields = shiftQualifier.getWorkHourFields(s);
      //         Object.keys(fields).forEach(function(f) {
      //             str += f + ' ' + fields[f] + ' ';
      //         });
      //         log.i(s.toString() + ':' + str);
      //     });
      //     console.log('done');
      // }

      function getDate(date, hour, minute) {
          date = Date.parse(date); 
          return Date.today().set({
              hour: hour,
              minute: minute,
              second: 0,
              year: date.getYear() + 1900,
              month: date.getMonth(),
              day: date.getDate()
          });
          
      }
      
      function makeShift(date, sHour, sMinute, eHour, eMinute, phWorked) {
          date = Date.parse(date); 
    
          var startDate = Date.today().set({
              hour: sHour,
              minute: sMinute,
              second: 0,
              year: date.getYear() + 1900,
              month: date.getMonth(),
              day: date.getDate()
          });
          var endDate = Date.today().set({
              hour: eHour,
              minute: eMinute,
              second: 0,
              year: date.getYear() + 1900,
              month: date.getMonth(),
              day: date.getDate()
          });
          if (eHour === 0 && eMinute === 0) endDate.setDate(endDate.getDate() + 1);
    
          var shift = {
              // person: values.person, //array of _id's of people doing the shift
              // location: values.location,
              startDate: startDate,
              endDate: endDate,
              date: date,
              toString: function() {
                  return this.date.toDateString().slice(0,10) + ' ' +
                      this.startDate.toTimeString().slice(0,5) +
                      '- ' + this.endDate.toTimeString().slice(0,5) +
                      (phWorked ? '(w)' : '');
              }
              // ,startTime: values.startTime,
              // endTime: values.endTime,
              // repeats: values.repeats, //TODO not implemented yet 
          };
          if (phWorked) shift.workedOnPublicHoliday = true;
          
          var hourFields = shiftQualifier.getWorkHourFields(shift);
          Object.keys(hourFields).forEach(function(s) {
              shift[s] = hourFields[s];
          });
          return shift;
      }
      
      // test(1);
      function pp() {
          for (var i=0; i< arguments.length; i++) {
              var result = '';
	      var arg= arguments[i];
	      if (typeof  arg === "string") {return arg;} 
	      else if (typeof arg === 'object')
                  for (var j in arg) result += (" " + j + ":" + arg[j]);
	      else return arg;
              return result;
          }
      }
      
      function testDate(date, h, m, eh, em, phWorked, result) {
          var newShift = makeShift(date, h,m ,eh, em, phWorked);
          var fields = shiftQualifier.getWorkHourFields(newShift);
          it(newShift.toString() + ' : ' + pp(result), function() {
              expect(fields).toEqual(result);
              });
      }
      
      var personCas = {
          name: 'p1', status: 'casual'
      };
      
      var personPerm = {
          name: 'p2', status: 'permanent'
      };
      
      var personPart = {
          name: 'p3', status: 'part'
      };
      
      var location = {
          name: 'l1'
      };
      
      var testColumnCount = 1;
      function testColumn(person, location, shifts, result) {
          // var newShift = makeShift(date, h,m ,eh, em);
          it('person=>' + pp(person));
          it('location=>' + pp(location));
          var s2 = [];
          shifts.forEach(function(s) {
              var newShift = makeShift.apply(null, s);
              // var hourFields = shiftQualifier.getWorkHourFields(newShift);
              // Object.keys(hourFields).forEach(function(s) {
              //   newShift[s] = hourFields[s];
              // });
              s2.push(newShift);
              it('shift=> ' + newShift.toString());
          });
          try {
              var fields = calculateTimesheetColumn.getFields(person, location, s2);
          }
          catch(e) {
              log.d('Error in testing of column calculations:' + e);
          }
          
          // log.d(fields);
          it(testColumnCount++ +':result:'+ pp(result), function() {
              expect(fields).toEqual(result);
              // expect(1).toEqual(1);
              });
          it('-------------------------');
      }
      
      
      function makeSomeShifts() {
          var shifts = [];
          shifts.push(makeShift('7 Dec', 10,0,12,0));
          shifts.push(makeShift('7 Dec', 15,0,22,0));
          shifts.push(makeShift('8 Dec', 6,0,9,0));
          shifts.push(makeShift('10 Dec',4,0,7,0 ));
          // shifts.push(makeShift('7 Dec', ));
          // shifts.push(makeShift('7 Dec', ));
          // shifts.push(makeShift('7 Dec', ));
          // shifts.push(makeShift('7 Dec', ));
          // shifts.push(makeShift('7 Dec', ));
          // shifts.push(makeShift('7 Dec', ));
          return shifts;
      }
      
      describe("Testing the calculation of a complete timesheet",
               function() {
                   var timesheet = calculateTimesheet(getDate('7 Dec',0,0), personPart, location, makeSomeShifts());
                   it('timesheet is defined', function() {
                       expect(timesheet).toBeDefined();
                   });
                   for (var i=0; i< 14; i++)
                       log.d(timesheet.column(i));
                   log.d(timesheet.totals());
               });
      
      
      
      
      describe("Testing calculation of a timesheet column:" 
               ,function() {
                   testColumn(personPerm, location, [['25 Dec' ,12,0,17,0 ,'worked'], ['25 Dec' ,17,0,22,0, 'worked'] ],
                              { totalHoursWorked: 10, day:10, publicHoliday : 10, publicHolidayWorked : 10,
                                publicHolidayOrdinary : 7.6,
                                publicHolWorkPerm1p5 : 7.6, publicHolWork2p5 : 2.4 }
                             );
                   testColumn(personCas, location, [['25 Dec' ,12,0,17,0 ,'worked'], ['25 Dec' ,17,0,22,0, 'worked'] ],
                              { totalHoursWorked: 10, day:10, publicHoliday : 10, publicHolidayWorked : 10,
                                publicHolWork2p5 : 10 }
                             );
                   testColumn(personPerm, location, [['25 Dec' ,12,0,17,0 ], ['25 Dec' ,17,0,22,0, 'worked'] ],
                              { totalHoursWorked: 10, day:10, publicHoliday : 10, publicHolidayNotWorked : 5,
                                publicHolidayWorked : 5,
                                publicHolidayOrdinary : 10, publicHolWorkPerm1p5 : 5 });
                   testColumn(personPerm, location, [['25 Dec' ,12,0,17,0 ], ['25 Dec' ,17,0,22,0 ] ],
                              { totalHoursWorked: 10, day:10, publicHoliday : 10, publicHolidayNotWorked : 10,
                                publicHolidayOrdinary : 10 } 
                              );
                   testColumn(personPart, location, [['1 Dec' ,4,0,9,0 ]  ],
                              { day : 3, night : 2, weekend : 3, disturbedSleepHours : 2, totalHoursWorked : 5,
                                overtime : 2, overtimeT1p5 : 2 } 
                             );
                   testColumn(personPart, location, [['1 Dec' ,1,0,9,0 ]  ],
                              { day : 3, night : 5, weekend : 3, disturbedSleepHours : 5,
                                totalHoursWorked : 8, overtime : 5, overtimeT1p5 : 3, overtimeT2 : 2 }
                              );
                   testColumn(personPart, location, [['1 Dec' ,1,0,18,0 ]  ],
                              { day : 12, night : 5, weekend : 10, disturbedSleepHours : 5, totalHoursWorked : 17,
                                overtime : 7, overtimeT1p5 : 3, overtimeT2 : 4 }
                              );
                              
                   testColumn(personPart, location, [['2 Dec' ,1,0,18,0 ]  ],
                              { day : 12, night : 5, early : 1.5, ord : 8.5, disturbedSleepHours : 5,
                                totalHoursWorked : 17, overtime : 7, overtimeT1p5 : 3, overtimeT2 : 4 }
                             );
               });
      
      
      describe("Testing the calculation of late, early, weekend, ordinary," +
               " night, public holiday hours:", function() {
                   testDate('25 Dec', 15,0,22,0, 'worked', { day: 7, publicHoliday: 7, publicHolidayWorked: 7} );
                   testDate('25 Dec', 15,0,22,0, '', { day: 7, publicHoliday: 7, publicHolidayNotWorked: 7} );
                   testDate('1 Dec', 15,0,22,0, '', { day: 7, weekend: 7} );
                   testDate('2 Dec', 15,0,22,0,  '', { day: 7, late : 2.5, ord : 4.5 });
                   testDate('2 Dec', 6,0,22,0, '', { day: 16, late : 2.5, ord : 12, early : 1.5 });
                   testDate('2 Dec', 3,0,10,0, '', { day: 4, night : 3, ord : 2.5, early : 1.5 });
               });
    }});
