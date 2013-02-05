/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ load: ['loaders/editor'],
   inject: ['View', 'editorManager', 'types/Shift'],
   factory: function(View, editors, Shift) 
   { "use strict";
     var log = logger('calendar');
     
     var view = View.create({
         type: 'Calendar'
         ,icon: "calendar.png"
         ,defaultState : {
             minimumShiftLength: 10,
             maximumShiftLength: 600,
             eventSnapGap: 15, //only works with a refresh
             workdayStart: '6:00am',
             workdayEnd: '10:00pm',
             currentViewName: 'day', //day, week or month
             chosenDate: new Date()
         }
         ,init: function() {
             var dataSource = View.getBackend().getDS(); 
             calendar.setDataSource(dataSource);
         }
         ,sync: function(state) {
             state.currentViewName = calendar.getCurrentViewName();
         }
         ,set: function(state) {
             calendar.setChosenDate(new Date(state.chosenDate));
             calendar.setCurrentViewName(state.currentViewName);
             calendar.fetchData();
             // calendar.fetchData({  }, function() {
             //     calendar.setCriteria({ adminHoursUsed: 1 });
             //     log.d('in callback!!'); });
         }
     }); 
    
     function getShiftDescription(event) {
        log.d('in shiftdesc', event);
         var sDate = event.startDate.toShortDate();
         var sTime = isc.Time.toTime(event.startDate, 'toShortPaddedTime', true);
         var eTime = isc.Time.toTime(event.endDate, 'toShortPaddedTime', true);

         return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime;
     }
    
     var calendar = isc.Calendar.create(
             {   ID: "isc_ShiftCalendar" 
	         // ,dataSource: database, 
	         // autoFetchData: true
	         // ,descriptionField: 'notes'
	         // ,nameField: 'endTijd'
                 ,eventOverlapIdenticalStartTimes: true
                 ,eventOverlap:false
                 ,firstDayOfWeek: 6
                 ,disableWeekends: false
                 ,showWorkday: true
                 // ,showTimelineView:true
                 ,workdays: [0,1,2,3,4,5,6]
                 ,workdayStart: view.getState().workdayStart
                 ,workdayEnd: view.getState().workdayEnd
                 // ,workdayBaseStyle: "element.style { background-color:oldlace }"
                 ,scrollToWorkday: true
                 // ,initialCriteria: { adminHoursUsed: 1 }
                 // ,criteria: { adminHoursUsed: 1 }
                 ,eventSnapGap: view.getState().eventSnapGap
                 ,eventResized: function(newDate, event) {
                     log.d('NEWDATE', newDate);
                     // var length = event.endDate.getTime() - event.startDate.getTime();
                     // var endTime = newDate.getTime() + length;
                     // event.startDate = newDate;
                     // event.date = newDate;
                     event.endDate = newDate;
                     event.endTime = isc.Time.createLogicalTime(event.endDate.getHours(),
                                                              event.endDate.getMinutes(),0),
                     event.startTime = isc.Time.createLogicalTime(event.startDate.getHours(),
                                                                event.startDate.getMinutes(),0);
                     var resizedEvent = Shift.create(event);
                     calendar.updateEvent(resizedEvent, resizedEvent.startDate,
                                          resizedEvent.endDate,
                                          resizedEvent[calendar.nameField],
                                          resizedEvent.description);
                     return false;
                 }
                 ,eventMoved: function(newDate, event) {
                     log.d('NEWDATE', newDate);
                     var length = event.endDate.getTime() - event.startDate.getTime();
                     var endTime = newDate.getTime() + length;
                     event.startDate = newDate;
                     event.date = newDate;
                     event.endDate = Date.create(endTime);
                     event.endTime = isc.Time.createLogicalTime(event.endDate.getHours(),
                                                              event.endDate.getMinutes(),0),
                     event.startTime = isc.Time.createLogicalTime(event.startDate.getHours(),
                                                                event.startDate.getMinutes(),0);
                     log.d('EVENT',event);
                     var movedEvent = Shift.create(event);
                     log.d('moved event:', movedEvent);
                     
                     calendar.updateEvent(movedEvent, newDate,
                                          Date.create(endTime),
                                          movedEvent[calendar.nameField],
                                          movedEvent.description);
                     return false;
                     
                     
                 }
                 ,dateChanged: function() {
                     var state = view.getState();
                     log.d('change of current date', calendar.chosenDate);
                     state.chosenDate = calendar.chosenDate.toString();
                     view.modified();
                 }
                 ,getDayBodyHTML: function(date, events, calendar, rowNum, colNum) {
                     // return 'hello';
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
                             persons = evtArr[i].personString; //TODO format persons
                             // retVal += template + eTime + evtArr[i][this.nameField] + ' ' + persons + "</a><br/>";
                             retVal += template + eTime + eeTime + ' ' + persons + "</a><br/>";
                             log.d('TEMPLATE' , retVal);
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
                     // log.d(event, eventWindow);
                     var cal = this;                     // format date & times
                     // var sDate = event[cal.startDateField].toShortDate(this.dateFormatter);
                     // var sTime = isc.Time.toTime(event[cal.startDateField], this.timeFormatter, true);
                     // var eTime = isc.Time.toTime(event[cal.endDateField], this.timeFormatter, true);

                     // return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime +
                     //     "<p>" + 
                     //     // event.displayPerson + "</br></br>"  +
                     //     '<h3>' + event[cal.descriptionField] + '</h3>';       
                     return event[cal.descriptionField];

                 }
                 // ,selectTab:function(tabNum) {
                 //     // TODO   
                 //     log.d('selectTab', tabNum);
                 // }
	         ,eventClick: function(event, viewName) {
	             log.d("Update event", event, viewName);
                     var state = view.getState();
                 
                     state.title = getShiftDescription(event);
                     state.cancelButton = true;
                     state.saveButton = true;
                     state.removeButton = true;
                     state.isNewRecord = false;
                 
                     editors.show(event, state);
                 
	                 return false;
	         }
	         ,backgroundClick: function(startDate, endDate) {
	             log.d('New event',startDate, endDate);
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
                
                     var state = view.getState();
                     state.title = getShiftDescription(event);
                     state.cancelButton = true;
                     state.saveButton = true;
                     state.removeButton = false;
                     state.isNewRecord = true;
                 
                     editors.show(event, state);
                 
	             return false;
	         }
             }); 
    
     calendar.addEventButton.click = function () {
         log.d('TODO');
         //this needs to also open the shift edit window..
     };

     view.setCmp(calendar);
     return view; 
      
   }});



