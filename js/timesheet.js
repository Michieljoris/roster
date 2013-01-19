/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
   inject: ['isc_components/multicap_timesheet', 'calculateTimesheet'],
   factory: function(Timesheet, calculateTimesheet) 
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
          // calculateTimesheet.go(state.person, state.location, state.fortnight);    
      }
      
      // var timesheet = isc.ListGrid.create(
      //     {   
      //         ID: "timesheet",
               
      //         width:500, height:224, alternateRecordStyles:true,
      //         notify: function(newState) {
      //             log.d('timesheet is notified');
      //             setState(newState);
                
      //         }
      //         ,getState: getState
      //         ,setObserver: function(f) {
      //             observer = f;
      //         }
      //         ,name: 'Timesheet'
      //         // ,icon: "calendar.png"
      //     });
      
      
      var timesheet = Timesheet.create({
          ID: 'test',
          overflow:'auto',
          showResizeBar: true,
          padding: 35
          ,notify: function(newState) {
              log.d('timesheet is notified');
              setState(newState);
          }
          ,getState: getState
          ,setObserver: function(f) {
              observer = f;
          }
          ,name: 'Timesheet'
          // ,icon: "calendar.png"
          // align: "center",
          // height: "70%",
      });
        
    
      return timesheet;
     
     
    }});