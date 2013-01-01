/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
   inject: ['globals', 'pouchDS'],
   factory: function(globals, pouchDS) 
    { "use strict";
      var person, location;
      var log = logger('timesheet');
      var observer;
      
      var currentState;
      var defaultState = { person:'guest', location:'0FD661FF-8605-4271-8CA4-61A52D3561A0', fortnight:'2013-01-01T11:00:00.000Z'};
      // var settings = {
      //     // minimumShiftLength: 10,
      //     // maximumShiftLength: 600,
      //     // eventSnapGap: 15, //only works with a refresh
      //     // workdayStart: '6:00',
      //     // workdayEnd: '22:00',
      //     // currentViewName: 'week', //day, week or month
      //     chosenDate: new Date()
      // };
      
      var shiftCriterion = {
          fieldName: 'type',
          operator:'equals',
          value:'shift'
      };  
      
       function getState() {
           var state =  isc.addProperties(currentState, {
               // grid: dataTable.getViewState(),
               // criteria : dataTable.getFilterEditorCriteria(),
              
               // //editor
               // height: (function() {
               //     if (stack.sectionIsExpanded('Editor')) 
               //         return dataTable.getHeight();
               //     else return editorHeightExpanded;
               // })(),
               // isExpanded: stack.sectionIsExpanded('Editor')
           });
           // isc.addProperties(state, tableFilter.getState());
           // log.d('getTableState', isc.clone(state));
           currentState = isc.clone(state);
           return currentState;
       } 
          
      
      function getShifts(fortnight) {
          var vow = VOW.make();
          var startDate = Date.create(fortnight);
          startDate.setHours(0);
          var endDate = Date.create(startDate);
          endDate.addWeeks(2);
          
          var fortnightCriterion = {
              _constructor:"AdvancedCriteria",
              operator:"and",
              criteria: [
                  {
                   fieldName: 'date' , operator: 'greaterOrEqual', value: startDate   
                  },
                  {
                   fieldName: 'date' , operator: 'lessThan', value: endDate   
                  }
              ]
          };

          var personCriterion = {
              fieldName: 'personstring',
              operator:'contains',
              value: person._id
          };
          
          var locationCriterion = {
              fieldName: 'location',
              operator:'equals',
              value: location._id
          };
          
          var timesheetCriteria = {
              _constructor:"AdvancedCriteria",
              operator:"and",
              criteria: [shiftCriterion,  locationCriterion, personCriterion, fortnightCriterion]
               
          };
        
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
                                    vow.keep(resultSet.getAllVisibleRows());
                                }
                            }
                           );
          return vow.promise;
      }
      
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
     
      
      
      function setState(state) {
          if (currentState !== undefined && state === currentState) return;
          
          state = isc.addProperties(defaultState, isc.clone(state));
          log.d(state);
          
          var data = VOW.every([
              getDoc(state.person),
              getDoc(state.location)
          ]);

          data.when(
              function(arr) {
                  person = arr[0];
                  location = arr[1];
                  log.d('got loc and person:', arr[0], arr[1]);
                  return getShifts(state.fortnight);
              }
          ).when(
              processData,
              function (msg) {
                  log.d('ERROR: could not get some of the data needed to build this timesheet', msg);
              }
          );
      }
      
      function processData(shifts) {
          //person, location and shifts should be set now
          log.d('-----------------');
          log.d(person, location, shifts);
          log.d('-----------------');
      }
      
      
      var timesheet = isc.ListGrid.create(
          {   
	      ID: "timesheet",
               
              width:500, height:224, alternateRecordStyles:true,
              fields:[
                  {name:"countryCode", title:"Code"},
                  {name:"countryName", title:"Country"},
                  {name:"capital", title:"Capital"}
              ],
              // data: countryData
	      // dataSource: pouchDS,
              // showEmptyMessage: true,
              // emptyMessage: "<br>Click the <b>Green plus butoon</b> to populate this grid.",    
              // gridComponents:[toolStrip,"filterEditor", "header",  "body"],
              // // titleField: 'title',
	      // // useAllDataSourceFields:true,
	      // //looks
	      // alternateRecordStyles:true, 
	      // //behaviour
	      // selectionType:"single",
	      // // headerAutoFitEvent:"doubleClick",
	      // canHover:true,
	      // canReorderRecords:true,
	      // autoFetchData: true,
	      // //editing
	      // recordClick: function (viewer, record) {
              //     var action = function() {
              //         editRecord(record); 
              //     };
              //     setEditor(action);
              // },
              
	      // cellChanged: function (record) {
              //     var action = function() {
              //         editRecord(record); 
              //     };
              //     setEditor(action);
              // },
              // // recordClick: updateEditForm,
	      // canEdit:true,
	      // modalEditing:true,
	      // // cellChanged: updateEditForm,
	      // editByCell: true,
	      // //filteringg
	      // showFilterEditor:true,
	      // filterOnKeypress: true,
	      // allowFilterExpressions: true,
              // showDetailFields: false, 
              // filterButtonPrompt: 'Clear filter',
              // filterButtonProperties: {
	      //     click : function () {
	      //         dataTable.clearCriteria();
              //         var appliedCriteria = isc.DataSource.combineCriteria(
              //             dataTable.typeFilter,state.savedAdvCriteria);
	      //         dataTable.filterData(appliedCriteria);
              //         tableViewStateChanged('clearSimpleFilter');
	      //     },
              //     icon:'clear.png',
              //     showRollOverIcon: false,
              //     showDownIcon: true
              // },
               
              // // headerContextMenu: true,
              // // FilterText: 'Clear inline filter',
	      // viewStateChanged: function() { tableViewStateChanged('viewStateChanged'); },
	      // // 	  showEmptyMessage: true,
	      // // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	      // // cellContextClick:"return itemListMenu.showContextMenu()",
	      // // Function to update details based on selection
	      // filterEditorSubmit: function() {
	      //     log.d('modified filter');
              //     tableViewStateChanged('filterEditorSubmit');
	      //     // storeTableViewState();
	      // },
              // setTypingState: setTypingState,
              // setFilterLabel: function(label) {
              //     tableFilterLabel.setContents(label);
              // },
              // setTypeLabel: function(label) {
              //     tableTypeLabel.setContents(label);
              // },
              // contextMenu: tableContextMenu
              // // bodyKeyPress : function() { 
              // //    log.d('keypress');
              // //    return true; 
              // // }
             
              notify: function(newState) {
                  log.d('timesheet is notified');
                  setState(newState);
                
              }
              ,getState: getState
              ,setObserver: function(f) {
                  observer = f;
              }
              ,name: 'Timesheet'
              // ,icon: "calendar.png"
          });
        
    
      return timesheet;
     
     
    }});