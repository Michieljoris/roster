/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ 
    inject: ['globals', 'pouchDS'],
    factory: function(globals, pouchDS)
    { "use strict";
      
      var log = logger('calculateTimesheet');
      
      // var person, location, fortnight;
      
      var shiftCriterion = {
          fieldName: 'type',
          operator:'equals',
          value:'shift'
      };  
      
      var personCriterion = {
          fieldName: 'personstring',
          operator:'contains'
          // value: person._id
      };
          
      var locationCriterion = {
          fieldName: 'location',
          operator:'equals'
          // value: location._id
      };
      
      var fortnightCriterion = {
          _constructor:"AdvancedCriteria",
          operator:"and",
          criteria: [
              {
                  fieldName: 'date' , operator: 'greaterOrEqual'//, value: startDate   
              },
              {
                  fieldName: 'date' , operator: 'lessThan'//, value: endDate   
              }
          ]
      };
          
      var timesheetCriteria = {
          _constructor:"AdvancedCriteria",
          operator:"and",
          criteria: [shiftCriterion,  locationCriterion, personCriterion, fortnightCriterion]
               
      };
      
      
      function getDoc(record) {
          if (record._id) return VOW.kept(record);
          var vow = VOW.make();
          globals.db.get(record, function(err, doc) {
              log.d('getting doc',doc, err);
              if (!err) {
                  vow.keep(doc);   
                  log.d('keeping vow');
              }
              else {
                  err.record = record; 
                  vow['break'](err);   
                  log.d('breaking vow');
              }
          });
          vow.promise.test =record;
          return vow.promise;
      }
      
      function getShifts(person, location, fortnight) {
          var vow = VOW.make();
          var startDate = Date.create(fortnight);
          startDate.setHours(0);
          var endDate = Date.create(startDate);
          endDate.addWeeks(2);
          
          personCriterion.value = person._id;
          locationCriterion.value = location._id;
          fortnightCriterion.criteria[0].value = startDate;
          fortnightCriterion.criteria[1].value = endDate;
          
          pouchDS.fetchData(null,
                            function (dsResponse, data) {
                                if (dsResponse.status < 0) vow['break'](dsResponse.status);
                                else {
                                    log.d('GOT a response from pouchDS', data);
                                    var resultSet = isc.ResultSet.create({
                                        dataSource:"pouchDS",
                                        criteria: timesheetCriteria,
                                        allRows:data
                                    });
                                    log.d('and the result set is:', resultSet);
                                    log.d('and the visible rows are:', resultSet.getAllVisibleRows());
                                    vow.keep({
                                        person: person,
                                        location: location,
                                        shifts: resultSet.getAllVisibleRows()
                                    });
                                }
                            }
                           );
          return vow.promise;
      }
      
  
      function go(person, location, fortnight) {

          VOW.every([
              getDoc(person),
              getDoc(location)
          ]).when(
              function(arr) {
                  person = arr[0];
                  location = arr[1];
                  log.d('got loc and person:', arr[0], arr[1]);
                  return getShifts(person, location, fortnight);
              }
          ).when(
              processData,
              function (msg) {
                  log.d('ERROR: could not get some of the data needed to build this timesheet', msg);
              }
          );
      }
      
      function processData(data) {
          //person, location and shifts should be set now
          log.d('-----------------');
          log.d(data.person, data.location, data.shifts);
          log.d('-----------------');
      }
   
      //date, time, text, integer, boolean
      function getDay(number) { // 0<=number<14
          
      }
      
      return {
          go: go
      };
   
    }});