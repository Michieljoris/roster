/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({ 
    inject: ['patterns', 'defaultTimePatterns', 'types/typesAndFields', 'lib/utils', 'loaders/backend'],
    factory: function(patterns, defaultTimePatterns,  typesAndFields, utils, backend)
    { "use strict";
      
      var log = logger('shift');
      
      function setWorkHourFields(shift, vow) {
          
          backend.get().getDoc(shift.location).when(
              function(location) {
                  log.d('location for shift is', location);
                  // shift.dayStart = location.dayStart;
                  // shift.dayEnd = location.dayEnd;
                  // setPatternsObject(makePartsOfDayObject(shift.dayStart, shift.dayEnd));h
                  
                  // patterns.init(location.timePatterns);
                  patterns.init(utils.addProperties(
                      defaultTimePatterns.publicHolidays,
                      defaultTimePatterns.weekend,
                      patterns.makeDayHours(location.dayStart, location.dayLength)
                      // defaultTimePatterns.partsOfTheDay
                  ));
      
                  isc.addProperties(shift, patterns.getWorkHourFields(shift));    
                  if (shift.publicHoliday) {
                      if (shift.isPublicHolidayWorked) shift.publicHolidayWorked = shift.publicHoliday;
                      else shift.publicHolidayNotWorked = shift.publicHoliday;
                      // log.d('CHECK',shift.isPublicHolidayWorked, shift.publicHolidayWorked, shift.publicHolidayNotWorked);
                  }
                  shift.description = makeDescription(shift, shift.person) + (shift.notes || '');
                  vow.keep(shift);
              },
              function(e) {
                  log.e("Couldn't get shift's location, so couldn't calculate the shift's hours");
                  log.e("Create the location or download it from a database.");
                  // isc.warn('Shift\'s location is not in the database!! Create or download it..');
                  vow['break'](e);
              }
              
          ); 
              
          
      }
    
      //returns length between 2 dates in hours
      function calculateLength(period) {
          var start = period.startDate.getTime();
          var end = period.endDate.getTime();
          var minutes = Math.floor( (end - start) / 60000 );
          return Math.floor(minutes/60) + (minutes%60)/60;
      }
      
      function makeDescription(shift, personIds) {
          // log.pp('MAKING DESCRIPTION', str);
          // var sTime = isc.Time.toTime(startDate, 'toShortPaddedTime', true);
          // var eTime = isc.Time.toTime(endDate, 'toShortPaddedTime', true);
              
          var startTime = shift.startTime;
          var endTime = shift.endTime;
              
          var startHour = startTime.getHours();
          var startMinutes = startTime.getMinutes();
          startMinutes = startMinutes ? ':' + startMinutes : '';
          var endHour = endTime.getHours();
          var endMinutes = endTime.getMinutes();
          endMinutes = endMinutes ? ':' + endMinutes : '';
          var sm = '', em = '';
          if (startHour<12 && endHour<12) em = 'am';
          else if (startHour>=12 && endHour>=12) em = 'pm';
          else {
              sm = startHour < 12 ? 'am' : 'pm';
              em = endHour < 12 ? 'am' : 'pm';
          }
          startHour = startHour === 12 ? 12 : startHour%12;
          endHour = endHour === 12 ? 12 : endHour%12;
          var sTime = startHour + startMinutes + sm + '';
          var eTime = endHour + endMinutes + em;
              
              
          var people = '';
          // if (typeof list === 'string') {
          // str = str.split(',');
          // }
          if (personIds)
              personIds.forEach(function(n) {
                  people += n + '<br>';
              });
          return "<div style= 'font-size:small;'>" +
              sTime + "&nbsp;-&nbsp;" + eTime + '</div><br>' +
              'Length: ' + shift.length + ' hours' +
              '<h3>' + people + '</h3>' +
              (shift.sleepOver ?  'Sleepover<br>' : '') +
              (shift.publicHoliday ? ('Public holiday' +
                                      (!shift.isPublicHolidayWorked ? ' claim' : '')) : '') +
              (shift.claim !== 'Normal shift' ? '<br>' + shift.claim : '') +
              (shift.night ? '<br>Night hours: ' + shift.night : '') + '<p>'
              ;
      }

      function create(values) {
          var vow = VOW.make();
          log.d('CREATING SHIFT!!!!', values);
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
              values.endTime.getMinutes() === 0) {
              endDate.setDate(startDate.getDate() + 1);   
          }
          
          var className = 'eventColor';
          
          //eventColor class is set in skin_styles.css
          if (values.person && values.person.length === 1)
              className += values.person[0];
          
          var shift = {
              type: 'shift',
              eventWindowStyle: className + ' eventWindow',
              // _id: values._id,
              _rev: values._rev,
              person: values.person, //array of _id's of people doing the shift
              location: values.location, //one single location _id
              personIdsString: values.personIdsString, //string of person ids for searching and filtering?
              startDate: startDate,
              endDate: endDate,
              date: values.date,
              startTime: values.startTime,
              endTime: values.endTime,
              sleepOver: values.sleepOver,
              claim: values.claim,
              adminHoursUsed: values.adminHoursUsed,
              isPublicHolidayWorked: values.isPublicHolidayWorked,
              adjustDisturbedHours: values.adjustDisturbedHours,
              repeats: values.repeats, //TODO not implemented yet 
              notes: values.notes || '',
              endTijd: values.location
          };
          if (values._id) shift._id = values._id;
          
          if (values.disturbedSleepHours)
              shift.disturbedSleepHours =  values.disturbedSleepHours;
          
          if (values.endTime.getHours() === 0 &&
              values.endTime.getMinutes() === 0) {
              shift.endTime.setDate(shift.startTime.getDate() + 1);   
          }
          shift.length = calculateLength(shift);
          
          switch(shift.claim) {
            case 'Away from base': shift.awayFromBase = true; 
            case 'Normal shift' : 
              setWorkHourFields(shift,vow);
              break;
          default:
              shift[typesAndFields.getFieldNameByTitle(shift.claim)] = shift.length;
              shift.description = makeDescription(shift, shift.person) + (shift.notes || '');
              vow.keep(shift);
          }
          // log.d('+++++++++++++++++++++++++++++++++++++', shift);
          //check for limits and rules and policies..  min length of
          //shift, max length of shift, max overtime, working during
          //sleepover time, but it's not disturbed sleep etc
          //if it's an error return it as such so that the editor has
          //a chance to cancel the save
          // return shift;
          return vow.promise;
          
      }
   
      // //date, time, text, integer, boolean
      // function getDay(number) { // 0<=number<14
          
      // }
      
      return {
          create: create,
          calculateLength: calculateLength
      };
   
    }});