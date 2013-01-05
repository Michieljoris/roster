/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ 
    inject: ['shiftQualifier', 'typesAndFields', 'globals'],
    factory: function(shiftQualifier, typesAndFields, globals)
    { "use strict";
      
      var log = logger('shift');
      
      // var person, location, fortnight;
      
      
      // function getDoc(record) {
      //     if (record._id) return VOW.kept(record);
      //     var vow = VOW.make();
      //     globals.db.get(record, function(err, doc) {
      //         log.d('getting doc',doc, err);
      //         if (!err) {
      //             vow.keep(doc);   
      //             log.d('keeping vow');
      //         }
      //         else {
      //             err.record = record; 
      //             vow['break'](err);   
      //             log.d('breaking vow');
      //         }
      //     });
      //     vow.promise.test =record;
      //     return vow.promise;
      // }
      
      // function go(person, location, fortnight) {

      //     VOW.every([
      //         getDoc(person),
      //         getDoc(location)
      //     ]).when(
      //         processData,
      //         function (msg) {
      //             log.d('ERROR: could not get some of the data needed to create this shift', msg);
      //         }
      //     );
      // }
      
      // function processData(data) {
      //     //person, location and shifts should be set now
      //     log.d('-----------------');
      //     log.d(data.person, data.location, data.shifts);
      //     log.d('-----------------');
      // }
      
      //returns length between 2 dates in hours
      function calculateLength(period) {
          
          var start = period.startDate.getTime();
          var end = period.endDate.getTime();
          var minutes = Math.floor( (end - start) / 60000 );
          return Math.floor(minutes/60) + (minutes%60)/60;
          
      }

      function create(values) {
              var startDate = Date.today().set({
                  hour: values.startTime.getHours(),
                  minute: values.startTime.getMinutes(),
                  second: 0,
                  year: values.date.getYear() + 1900,
                  month: values.date.getMonth(),
                  day: values.date.getDate()
              });
          var endDate = Date.today().set({
              hour: values.endTime.getHours(),
              minute: values.endTime.getMinutes(),
              second: 0,
              year: values.date.getYear() + 1900,
              month: values.date.getMonth(),
              day: values.date.getDate()
          });
          if (values.endTime.getHours() === 0 &&
              values.endTime.getMinutes() === 0) endDate.setDate(endDate.getDate() + 1);
          
          
          var shift = {
              type: 'shift',
              _id: values._id,
              _rev: values._rev,
              person: values.person, //array of _id's of people doing the shift
              personstring: values.person &&
                  values.person.toString(), //for search by human names
              personNames : values.personNames &&
                  values.personNames.toString(), //for search by doc _id
              location: values.location,
              locationNames : values.locationNames &&
                  values.locationNames.toString(),
              startDate: startDate,
              endDate: endDate,
              date: values.date,
              startTime: values.startTime,
              endTime: values.endTime,
              claim: values.claim,
              repeats: values.repeats, //TODO not implemented yet 
              notes: values.notes || '',
              endTijd: '- ' + isc.Time.toTime(values.endDate, 'toShortPaddedTime', true),
              description: values.personNames && (values.personNames.toString() + '<p>' + (values.notes || ''))
          };
          shift.length = calculateLength(shift);
          
          //set claim fields TODO replace with switch
          if (shift.claim === 'Event') ;
          else if (shift.claim === 'Away from base') shift.awayFromBase = true;
          else if (shift.claim === 'Normal shift') shiftQualifier.setTags(shift);
          else shift[typesAndFields.getFieldNameByTitle(shift.claim)] = shift.length;
          
          if (shift.adminHoursUsed) shift.ord = shift.adminHoursUsed;
          
          //set public holiday fields:
          // var ph = shift.publicHoliday;
          // if (ph) {
          //     var over76 = ph - 7.6;
          //     ph = over76 > 0 ? 7.6 : ph;
          //     shift.publicHolidayOrdinary = ph;
          //     shift.publicHolWorkPerm1p5 = ph;
          //     if (over76 > 0) shift.publicHolWork2p5 = over76;
          // }
          
          //set overtime fields
          //TODO

          //check for limits and rules and policies..
          //min length of shift, max length of shift, max overtime, working during sleepover time
          return shift;
          
      }
   
      // //date, time, text, integer, boolean
      // function getDay(number) { // 0<=number<14
          
      // }
      
      return {
          create: create
      };
   
    }});