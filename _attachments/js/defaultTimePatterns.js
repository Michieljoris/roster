/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({factory: 
  { 
      //Describe a repeat pattern by setting date to an arbitrary
      //(long ago) date, and to a day of the week of your choosing,
      //and to the start time of the period that repeats. Length is
      //the length of the period in hours The pattern is an array of
      //lengths of units, describing when the period will
      //reoccur. Higher ranks take prevalence over lower ranks. 
      //Pattern with no rank property will always be applied
      // partsOfTheDay : { 
      //     // night1: { type: 'night', 
      //     //           from: Date.parse('2000 10pm').monday(),'2000', '10pm', 'monday'
      //     //           to: Date.parse('2000 10pm').monday(), //undefined is indefinitely
      //     //           length: 2, //in hours
      //     //           pattern: [1], //repeate daily 
      //     //           unit: 'day'
      //     //           // rank: 100
      //     //         },
      //     day: { type: 'day', 
      //            //from 6am - 10pm daily
      //            date: Date.parse('2000 6am').monday(),
      //            length: 16, //in hours
      //            pattern: [1], //repeated daily 
      //            unit: 'day'
      //            // rank: 100
      //          },
      //     night1: { type: 'night', 
      //               //from 10pm to 0am
      //               date: Date.parse('2000 10pm').monday(),
      //               // to: Date.parse('2014 10pm').monday(), //undefined is indefinitely TODO, not implemented
      //               length: 2, //in hours
      //               pattern: [1], //repeated daily 
      //               unit: 'day'
      //               // rank: 100
      //             },
      //     night2: { type: 'night',
      //               //from 0am to 6am
      //               date: Date.parse('2000 0am').monday(),
      //               length: 6,
      //               pattern: [1],
      //               unit: 'day'
      //               // rank: 100
      //             },
      //     // early: { type: 'early',
      //     //          date: Date.parse('2000 6am').monday(),
      //     //          length: 1.5,
      //     //          pattern: [1,1,1,1,3],
      //     //          unit: 'day',
      //     //          rank: 100
      //     //        },
      //     ord: { type: 'ord',
      //            //from 6am till 8pm weekdays
      //            date: Date.parse('2000 6am').monday(),
      //            length: 14,
      //            pattern: [1,1,1,1,3],
      //            unit: 'day',
      //            rank: 100
      //          },
      //     late: { type: 'late',
      //             //from 8pm till 10pm weekdays
      //             date: Date.parse('2000 8pm').monday(),
      //             length: 2,
      //             pattern: [1,1,1,1,3],
      //             unit: 'day',
      //             rank: 100
      //           }
      //     // late2: { type: 'late',
      //     //         date: Date.parse('2000 0am').monday(),
      //     //         length: 6,
      //     //         pattern: [1,1,1,1,3],
      //     //         unit: 'day',
      //     //         rank: 100
      //     //       },
      //     //3 ways to describe weekends:
      //     //this one finds both days in one pattern though:
      // }, 
      weekend : { 
          weekend: { type: 'weekend',
                     //from 6am till 10pm Sat and Sun
                     date: Date.parse('2000 0:00am').saturday(),
                     length: 24,
                     pattern: [1,6],
                     unit: 'day',
                     rank: 100
                   }
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
      },
      publicHolidays : { 
          christmas: { type: 'publicHoliday', //Christmas
                       date: Date.parse('25 dec 2000 0:00am'),
                       pattern: [1],
                       unit: 'year',
                       length: 24,
                       rank: 300
                     },
          boxing: { type: 'publicHoliday', //Boxing day
                    date: Date.parse('26 dec 2000 0:00am'),
                    pattern: [1],
                    unit: 'year',
                    length: 24,
                    rank: 300
                  }
          ,goodFriday: { type: 'publicHoliday', //Boxing day
                         date: Date.parse('29 March 2013 0:00am'),
                         pattern: [1],
                         unit: 'year',
                         length: 24,
                         rank: 300
                       }
          ,easter1: { type: 'publicHoliday', //Boxing day
                      date: Date.parse('30 March 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    }
          ,easter2: { type: 'publicHoliday', //Boxing day
                      date: Date.parse('April 1 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    }
          ,anzac: { type: 'publicHoliday', 
                      date: Date.parse('April 25 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    }
          ,queensbirthday: { type: 'publicHoliday',
                      date: Date.parse('10 June 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    }
          ,ecca: { type: 'publicHoliday',
                      date: Date.parse('August 14 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    } 
          ,labourday: { type: 'publicHoliday',
                      date: Date.parse('7 October 2013 0:00am'),
                      pattern: [1],
                      unit: 'year',
                      length: 24,
                      rank: 300
                    }
          // ,test: { type: 'publicHoliday', //Boxing day
          //           date: Date.parse('19 feb  2000 6am'),
          //           pattern: [1],
          //           unit: 'year',
          //           length: 16,
          //           rank: 300
          //         }
          // ,oneoff: { type: 'publicHoliday', //one off public holiday
          //           date: Date.parse('5 March 2013 6am'),
          //           pattern: [], //doesn't pattern...
          //           // unit: 'year',
          //           length: 16,
          //           rank: 300
          //         },
          // monthly: { type: 'monthly event', 
          //            date: Date.parse('5 March 2000 6am'),
          //            pattern: [1],
          //            unit: 'month',
          //            length: 16,
          //            rank:100 
          //          }
      
      }
  }
 }); 