/*global VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
   inject: ['globals', 'pouchDS', 'editorManager'],
   factory: function(globals, pouchDS, editorManager) 
    { "use strict";
      var person, location, shifts;
      var log = logger('timesheet');
      var observer;
      var settings = {
          // minimumShiftLength: 10,
          // maximumShiftLength: 600,
          // eventSnapGap: 15, //only works with a refresh
          // workdayStart: '6:00',
          // workdayEnd: '22:00',
          // currentViewName: 'week', //day, week or month
          chosenDate: new Date()
      };
      var shiftCriterion = {
          fieldName: 'type',
          operator:'equals',
          value:'shift'
      };  
          
      
      function getShifts(fortnight) {
          var vow = VOW.make();
          //TODO make criteria out of the args 
          var startDate = fortnight;
          var endDate = Date.create(startDate);
          
          var fortnightCriterion = {
              _constructor:"AdvancedCriteria",
              operator:"and",
              criteria: [
                  {
                   fieldName: 'date' , operator: 'bigger', value: startDate   
                  },
                  {
                   fieldName: 'date' , operator: 'smaller', value: endDate   
                  }
              ]
          };

          var personCriterion = {
              fieldName: 'person',
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
              criteria: [shiftCriterion, locationCriterion, personCriterion, fortnightCriterion]
               
          };
        
          pouchDS.fetchData(null,
                            function (dsResponse, data) {
                                if (dsResponse.status < 0) vow['break'](dsResponse.status);
                                else {
                                    var resultSet = isc.ResultSet.create({
                                        dataSource:"pouchDS",
                                        criteria: timesheetCriteria,
                                        allRows:data
                                    });
                                    vow.keep(resultSet.getAllVisibleRows());
                                }
                            }
                           );
          
      }
      
      function getDoc(doc) {
          if (doc._id) return VOW.kept(doc);
          var vow = VOW.make();
          globals.db.get(doc, function(err, doc) {
              if (!err) vow.keep(doc);
              else vow['break'](err);
              
          });
          return vow.promise;
      }
     
      var currentState;
      function setState(state) {
          if (state === currentState) return;
          currentState = state;
          
          var data = VOW.every(
              getDoc(state.person),
              getDoc(state.location)
          );

          data.when(
              function(arr) {
                  person = arr[0];
                  location = arr[1];
                  return getShifts(state.fortnight);
              })
              .when(
                  processData,
                  function (msg) {
                      log.d('ERROR: could not get some of the data needed to build this timesheet', msg);
                  }
              );
      }
      
      function processData(shifts) {
          //person, location and shifts should be set now
          log.d(shifts);
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
                  log.d('calendar is notified');
                  setState(newState);
                
              }
              ,getState: function() {
                  return settings;
              }
              ,setObserver: function(f) {
                  observer = f;
              }
              ,name: 'Timesheet'
              // ,icon: "calendar.png"
          });
        
    
      return timesheet;
     
     
    }});