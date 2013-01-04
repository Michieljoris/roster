/*global SwankJS:false  */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:9 maxlen:190 devel:true*/

var log = logger();


function sortBy(arr, prop) {
    return arr.sort(function(a,b) {
        return a[prop]<b[prop];
    });
}

function shift(date, sHour, sMinute, eHour, eMinute) {
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
    
    return {
        // person: values.person, //array of _id's of people doing the shift
        // location: values.location,
        startDate: startDate,
        endDate: endDate,
        date: date
        // ,startTime: values.startTime,
        // endTime: values.endTime,
        // repeats: values.repeats, //TODO not implemented yet 
    };
}


var timeQualifiers = [ 
    { name: 'early',
      date: Date.parse('2000 6am').monday(),
      length: 1.5,
      pattern: [1,1,1,1,3],
      unit: 'day',
      rank: 100
    },
    { name: 'ord',
      date: Date.parse('2000 7:30am').monday(),
      length: 12,
      pattern: [1,1,1,1,3],
      unit: 'day',
      rank: 100
    },
    { name: 'late',
      date: Date.parse('2000 7:30pm').monday(),
      length: 2.5,
      pattern: [1,1,1,1,3],
      unit: 'day',
      rank: 100
    },
    //3 ways to describe weekends:
    { name: 'weekend',
      date: Date.parse('2000 0:00am').saturday(),
      length: 24,
      pattern: [1,1,5],
      unit: 'day',
      rank: 200
    },
    //and:
    { name: 'weekend',
      date: Date.parse('2000 0:00am').saturday(),
      length: 24,
      pattern: [1],
      unit: 'week',
      rank: 200
    },
    { name: 'weekend',
      date: Date.parse('2000 0:00am').sunday(),
      length: 24,
      pattern: [1],
      unit: 'week',
      rank: 200
    },
    //and:
    { name: 'weekend',
      date: Date.parse('2000 0:00am').saturday(),
      length: 48, //48 hours
      pattern: [1],
      unit: 'week',
      rank: 200
    },
    //
    { name: 'publicHoliday', //Christmas
      date: Date.parse('25 dec 2000'),
      pattern: [1],
      unit: 'year',
      length: 24,
      rank: 300
    },
    { name: 'publicHoliday', //one off public holiday
      date: Date.parse('5 March 2000'),
      pattern: [], //doesn't pattern...
      // unit: 'year',
      length: 24,
      rank: 300
    },
    { name: 'publicHoliday', //Boxing day
      date: Date.parse('26 dec 2000'),
      pattern: [1],
      unit: 'year',
      length: 24,
      rank: 300
    }
];


timeQualifiers = sortBy(timeQualifiers, 'rank');
timeQualifiers.forEach(function(q) {
    
    log.d(q.pattern);
    var repeat = 0;
    if (q.pattern) {
        q.pattern.forEach(function(l) {
            repeat += l;  
        });
    }
    q.repeat = repeat;
    q.unit = q.unit + 's'; //for Date.js: .add(x)[unit]()
    q.logicalDate = Date.today().set({
        year: q.date.getYear() + 1900,
        month: q.date.getMonth(),
        day: q.date.getDate() });
    
});


function sameDay(d1, d2) {
    return d1.getYear() === d2.getYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

(function() {
    
var shifts = [
    shift('21 Dec', 10,30, 13,30)
    // ,shift('12 Dec', '1lim:00', '12:30')
];
    // window.sortBy = sortBy;
    
    // console.log('sorting by rank', sortBy(timeQualifiers, 'rank'));
    var dayLength = 24*60*60*1000;
    var weekLength = 7*dayLength;
    function checkTime(shift, pattern) {
        log.d('Yippie, we reached a valid day!!', shift.date, pattern.date);
    }
    

    function applyTimeQualifiers(shift, pattern) {
        log.d('shift', shift.date);
        log.d('pattern', pattern.date, pattern.pattern, pattern.unit, pattern.repeat);
        var patternLength;
        // SwankJS.output('in func \n');
        log.d('in func');
        if (!pattern || pattern.length === 0) { //one off date
            if (sameDay(shift.date, pattern.date)){
                checkTime(shift, pattern);
                return;
            } 
            else return;
        }
        else {
            if (pattern.unit === 'days') patternLength = dayLength * pattern.repeat; 
            if (pattern.unit === 'weeks') patternLength = weekLength * pattern.repeat; 
        
            if (patternLength) { //day or week
                log.d('dealing with day or week');
                var diffInMs = shift.date.getTime() - pattern.logicalDate.getTime();
                var dateToCheck = pattern.date.getTime() + Math.floor(diffInMs/patternLength) * patternLength;
                console.log(Math.floor(diffInMs/patternLength) * patternLength);
                log.d(patternLength);
                dateToCheck = new Date(dateToCheck);
                console.log(new Date(dateToCheck));
                for (var l in pattern.pattern) {
                    if (sameDay(shift.date, dateToCheck)) {
                        checkTime(shift,pattern);
                        return;
                    }
                    dateToCheck.add(l)[pattern.unit]();
                }
                return;
            
            }
            else { //month or year
                
            }
        
        
        }
        
    
    }
    log.d('***************************************');
    applyTimeQualifiers(shifts[0], timeQualifiers[6]);

}());


function test() {
    console.log('hello') ;
}



    // function test() {
    //     log.d('Starting time qualifier test', shifts);    
    //     SwankJS.output(shifts[0].date + '\n');
    //     SwankJS.output(shifts[0].startDate + '\n');
    //     SwankJS.output(shifts[0].endDate + '\n');
    //     applyTimeQualifiers(shifts[0]);
    // }
    // test();
