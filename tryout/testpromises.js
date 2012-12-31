/*global logger:false VOW:false when:false */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

var log = logger();

log.d('start');

function finder(records){
    "use strict";
    var vow = VOW.make();
    setTimeout(function () {
        records.push(3, 4);
        vow.keep(records);
        // vow.break('bla');
    }, 500);
    return vow.promise;
}


function processor(records){
    "use strict";
    var vow = VOW.make();
    setTimeout(function () {
        records.push(5,6);
        vow.keep(records);
    }, 500);
    return vow.promise;
}

// finder([1,2])
//     .when(processor)
//     .when(function(records) {
//         log.d('vows kept', records); },
//          function(msg) {
//              log.d('vow broken', msg);
//          });
var vow = VOW.every([finder([1,2]), processor([3,4])]);
vow.when(
    function(rec) { log.d('found every', rec);},
    
    function(msg) { log.d('failed',msg); }
                  
);

//when.js
// using promises
function finder1(records){
    var deferred = when.defer();
    setTimeout(function () {
        records.push(3, 4);
        deferred.reject('failed');
    }, 500);
    return deferred.promise;
}

function processor1(records) {
     var deferred = when.defer();
    setTimeout(function () {
        records.push(5, 6);
        deferred.resolve(records);
    }, 500);
    return deferred.promise;
}

// finder1([1,2])
//     .then(processor1)
//     .then(function(records) {
//             alert(records); },
//          function(msg) {
//              log.d(msg);
//          });
