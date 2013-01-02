/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
   inject: ['calculateTimesheet'],
   factory: function(calculateTimesheet) 
    { "use strict";
      var log = logger('timesheet');
      var observer;
      
      var currentState;
      var defaultState = { person:'guest', location:'E745F82E-1CC9-46B5-A320-38F9595C6847', fortnight:'2013-01-01T11:00:00.000Z'};
      // var settings = {
      //     // minimumShiftLength: 10,
      //     // maximumShiftLength: 600,
      //     // eventSnapGap: 15, //only works with a refresh
      //     // workdayStart: '6:00',
      //     // workdayEnd: '22:00',
      //     // currentViewName: 'week', //day, week or month
      //     chosenDate: new Date()
      // };
      
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
      
      function setState(state) {
          log.d("hello from timesheet");
          if (currentState !== undefined && state === currentState) return;
          
          state = isc.addProperties(defaultState, isc.clone(state));
          log.d(state);
          calculateTimesheet.go(state.person, state.location, state.fortnight);    
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