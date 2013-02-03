/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ 
    inject: ['loaders/backend'],
    factory: function(backend) 
    { "use strict";
      
      var log = logger('fetchTimesheetShifts');
      
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
      
      function getShifts(person, location, fortnight) {
          log.d("Getting shifts..");
          var vow = VOW.make();
          var startDate = Date.create(fortnight);
          startDate.setHours(0);
          var endDate = Date.create(startDate);
          endDate.addWeeks(2);
          
          personCriterion.value = person._id;
          locationCriterion.value = location._id;
          fortnightCriterion.criteria[0].value = startDate;
          fortnightCriterion.criteria[1].value = endDate;
          
          backend.get().getDS().fetchData(null,
                            function (dsResponse, data) {
                                if (dsResponse.status < 0) vow['break'](dsResponse.status);
                                else {
                                    // log.d('GOT a response from pouchDS', data);
                                    var resultSet = isc.ResultSet.create({
                                        dataSource:backend.get().getDS(),
                                        criteria: timesheetCriteria,
                                        allRows:data
                                    });
                                    // log.d('and the result set is:', resultSet);
                                    // log.d('and the visible rows are:', resultSet.getAllVisibleRows());
                                    var shifts = resultSet.getAllVisibleRows();
                                    // log.pp('SSSSSSSSSSSSSSSSSSSSSSSSHIFTS', shifts);
                                    // shifts = shifts ? shifts : [];
                                    vow.keep({
                                        person: person,
                                        location: location,
                                        shifts: shifts,
                                        fortnight: fortnight
                                    });
                                }
                            }
                           );
          return vow.promise;
      }
      
  
      function fetch(person, location, fortnight, callback) {
          var db = backend.get();
          
          VOW.every([
              db.getDoc(person),
              db.getDoc(location)
          ]).when(
              function(arr) {
                  person = arr[0];
                  location = arr[1];
                  log.d('got loc and person:', arr[0], arr[1]);
                  return getShifts(person, location, fortnight);
              }
          ).when(
              function() {
              // try { callback.apply(null, arguments); } catch (e) { log.d(e, e.stack); }
              callback.apply(null, arguments);
                  
              },
              // callback,
              function (msg) {
                  log.e('ERROR: could not get some of the data needed to build this timesheet', msg);
              }
          );
      }
      
      return fetch;   
      // return {
      //     fetch: fetch
      // };
   
    }});