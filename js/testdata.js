/*global logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

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

function doBulk() {
    var docs =  bulk({
        shiftsPerDay: 2,
        shift: 100,
        location: 10,
            person: 10,
        role: 10,
        user:10 
    });
    
    console.log(docs);
    pbulk(docs, function(err, response) {
        console.log(err, response);
        // Response array:
        // [
        //   {
        //     "ok": true,
        //     "id": "828124B9-3973-4AF3-9DFD-A94CE4544005",
        //     "rev": "1-A8BC08745E62E58830CA066D99E5F457"
        //   }
        // ]
    });
} 