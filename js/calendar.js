/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ load: ['editorLoader'],
   inject: ['pouchDS', 'editorManager'],
   factory: function(database, editors) 
   { "use strict";
     var log = logger('calendar');
     var observer;
     var defaultState = {
         minimumShiftLength: 10,
         maximumShiftLength: 600,
         eventSnapGap: 15, //only works with a refresh
         workdayStart: '6:00',
         workdayEnd: '22:00',
         currentViewName: 'week', //day, week or month
         chosenDate: new Date()
        
     };
     var state = isc.clone(defaultState);
     var currentState;
     
     function getState() {
         if (calendar)
             state.currentViewName = calendar.getCurrentViewName();
         return state;
     }
     
     function setState(someState) {
         if (currentState !== undefined && someState === currentState) {
             log.d('Same, so not setting state', state);
             return;
         }
         // if (someState === currentState) return;
         currentState = someState;
         state = isc.addProperties(defaultState, isc.clone(someState));
         // state = someState || state;
         console.log(someState);
         // state.chosenDate = state.chosenDate || new Date();
         calendar.setChosenDate(new Date(state.chosenDate));
         // state.currentViewName = state.currentViewName || 'week';
         calendar.setCurrentViewName(state.currentViewName);
     }
    
     function getShiftDescription(event) {
         console.log('in shiftdesc', event);
         var sDate = event.startDate.toShortDate();
         var sTime = isc.Time.toTime(event.startDate, 'toShortPaddedTime', true);
         var eTime = isc.Time.toTime(event.endDate, 'toShortPaddedTime', true);

         return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime;
     }
    
     var calendar = isc.Calendar.create(
             {   ID: "isc_ShiftCalendar", 
	         dataSource: database, 
	         autoFetchData: true
	         // ,descriptionField: 'notes'
	         ,nameField: 'endTijd'
                 ,eventOverlapIdenticalStartTimes: true
                 ,eventOverlap:false
                 ,firstDayOfWeek: 6
                 ,disableWeekends: false
                 ,showWorkday: true
                 // ,showTimelineView:true
                 ,workdays: [0,1,2,3,4,5,6]
                 ,workdayStart: state.workdayStart
                 ,workdayEnd: state.workdayEnd
	         ,initialCriteria: { type:'shift'  } 
                 ,criteria: { type: 'shift' }
                 ,eventSnapGap: state.eventSnapGap
                 ,dateChanged: function() {
                     console.log('change of current date', calendar.chosenDate);
                     state.chosenDate = calendar.chosenDate.toString();
                     observer();
                 }
                 ,getDayBodyHTML: function(date, events, calendar, rowNum, colNum) {
                         // var day = date.getDay();
                         var persons;  
                     var evtArr = events, lineHeight = 15,
                     record = this.monthView.data ? this.monthView.data[1] : null,
                         rHeight = this.monthView.getRowHeight(record, 1);
                     var retVal = "";
                     for (var i = 0; i < evtArr.length; i++) {
                         var eTime = isc.Time.toTime(evtArr[i][this.startDateField], this.timeFormatter, true) + " ";
                         var eeTime = isc.Time.toTime(evtArr[i][this.endDateField], this.timeFormatter, true) + " ";
                         if (this.canEditEvent(evtArr[i])) {
                             // when clicked, call the the editEvent method of this calendar, passing the
                             // row, column, and position of the event in this cell's event array
                             var template  = "<a href='javascript:" + this.ID + ".monthViewEventClick(" + 
                                 rowNum + "," + colNum + "," + i + ");' class='" +
                                 this.calMonthEventLinkStyle + "'>";
                             persons = evtArr[i].personNames; //TODO format persons
                             // retVal += template + eTime + evtArr[i][this.nameField] + ' ' + persons + "</a><br/>";
                             retVal += template + eTime + eeTime + ' ' + persons + "</a><br/>";
                         } else {
                             // retVal += eTime + evtArr[i][this.nameField] + "<br/>";      
                             retVal += eTime + eeTime + "<br/>";      
                         }
                         if ((i + 3) * lineHeight > rHeight) break; 
                     }
                     if (i < evtArr.length - 1) {
                         retVal += "+ " + (evtArr.length - 1 - i) + " more...";
                     }
                     return retVal;
                 }
                 ,getEventHoverHTML : function (event, eventWindow) {
                     console.log(event, eventWindow);
                     var cal = this;
    
                     // format date & times
                     var sDate = event[cal.startDateField].toShortDate(this.dateFormatter);
                     var sTime = isc.Time.toTime(event[cal.startDateField], this.timeFormatter, true);
                     var eTime = isc.Time.toTime(event[cal.endDateField], this.timeFormatter, true);

                     return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime +
                         "<p>" + 
                         // event.displayPerson + "</br></br>"  +
                         event[cal.descriptionField];       

                 }
                 // ,selectTab:function(tabNum) {
                 //     // TODO   
                 //     console.log('selectTab', tabNum);
                 // }
	         ,eventClick: function(event, viewName) {
	             console.log("Update event", event, viewName);
                 
                     state.title = getShiftDescription(event);
                     state.cancelButton = true;
                     state.saveButton = true;
                     state.removeButton = true;
                 
                     editors.show(event, state);
                 
	                 return false;
	         }
	         ,backgroundClick: function(startDate, endDate) {
	             console.log('New event',startDate, endDate);
                     var date =  new Date(startDate);
                     // var event = typesAndFields.newRecord('shift');
                     var event = {
                         type: 'shift',
                         startDate: startDate,
                         endDate: endDate,
                         date: date,
                         endTime : isc.Time.createLogicalTime(endDate.getHours(),
                                                              endDate.getMinutes(),0),
                         startTime : isc.Time.createLogicalTime(startDate.getHours(),
                                                                startDate.getMinutes(),0)
                     
                     };
                
                     state.title = getShiftDescription(event);
                     state.cancelButton = true;
                     state.saveButton = true;
                     state.removeButton = false;
                     state.isNewRecord = true;
                 
                     editors.show(event, state);
                 
	             return false;
	         }
                 ,notify: function(newState) {
                     console.log('calendar is notified');
                     setState(newState);
                
                 }
                 ,getState: getState
                 // ,getState: function() {
                 //     if (calendar)
                 //         state.currentViewName = calendar.getCurrentViewName();
                 //     return state;
                 // }
                 ,setObserver: function(f) {
                     observer = f;
                 }
                 ,name: 'Calendar'
                 ,icon: "calendar.png"
             }); 
    
     calendar.addEventButton.click = function () {
         console.log('TODO');
         //this needs to also open the shift edit window..
     };
      
     return calendar; 
      
   }});



