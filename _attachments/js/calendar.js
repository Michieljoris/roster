/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ load: ['editorLoader'],
   inject: ['pouchDS', 'editorManager'],
   factory: function(database, editors) 
   { "use strict";
     var observer;
     var settings = {
         minimumShiftLength: 10,
         maximumShiftLength: 600,
         eventSnapGap: 15, //only works with a refresh
         workdayStart: '6:00',
         workdayEnd: '22:00',
         currentViewName: 'week', //day, week or month
         chosenDate: new Date()
        
     };
    
     var currentState;
     function setState(state) {
         if (state === currentState) return;
         currentState = state;
         
         // calendar.workdayEnd = state.workdayEnd;
         // calendar.workdayStart = state.workdayStart;
         // calendar.redraw();
        
         settings = state || settings;
         console.log(state);
         settings.chosenDate = settings.chosenDate || new Date();
         calendar.setChosenDate(new Date(settings.chosenDate));
         settings.currentViewName = settings.currentViewName || 'week';
         calendar.setCurrentViewName(settings.currentViewName);
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
             ,workdayStart: settings.workdayStart
             ,workdayEnd: settings.workdayEnd
	     ,initialCriteria: { type:'shift'  } 
             ,criteria: { type: 'shift' }
             ,eventSnapGap: settings.eventSnapGap
             ,dateChanged: function() {
                 console.log('change of current date', calendar.chosenDate);
                 settings.chosenDate = calendar.chosenDate.toString();
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
                 // event.endTime = isc.Time.createLogicalTime(event.endDate.getHours(),
                 //                                            event.endDate.getMinutes(),0);
                 // event.startTime = isc.Time.createLogicalTime(event.startDate.getHours(),
                 //                                              event.startDate.getMinutes(),0);
                 // // event.moreText = event.notes;
                 // event.date = event.startDate;
                 // console.log('about to call shiftEditor');
                 // shiftEditor.init(eventEditorWindow , event, settings);
                 
                 // if (editors.init(eventEditorWindow, event, settings)) {
                 //     eventEditorWindow.setTitle(getShiftDescription(event));
                 //     eventEditorWindow.show();
                 // }
                 // eventForm.setValues(event);
                
                 // eventEditor.setTitle(getShiftDescription(event));
                 // eventForm.clearErrors();
                 // eventEditor.show();
                 
                 settings.title = getShiftDescription(event);
                 settings.cancelButton = true;
                 settings.saveButton = true;
                 settings.removeButton = true;
                 editors.show(event, settings);
	         return false;
	     }
	     ,backgroundClick: function(startDate, endDate) {
	         console.log('New event',startDate, endDate);
                 var date =  new Date(startDate);
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
                 // console.log('about to call shiftEditor', shiftEditor);
                
                 // shiftEditor.init(settings, eventEditorWindow , event);
                 settings.title = getShiftDescription(event);
                 settings.cancelButton = true;
                 settings.saveButton = true;
                 settings.removeButton = false;
                 
                 editors.show(event, settings);
                 // showEditor(event);
                 // shiftEditor.show(event, settings);
                
                 // shiftEditor.show(event, settings);
	         // eventForm.setValues({
                 // });
                 // eventEditor.setTitle(
                 //     getShiftDescription({ startDate: startDate, endDate: endDate }));
                 // eventForm.clearErrors();
                 // eventEditor.show();
	         return false;
	     }
             ,notify: function(newState) {
                 console.log('calendar is notified');
                 setState(newState);
                
             }
             ,getState: function() {
                 if (calendar)
                     settings.currentViewName = calendar.getCurrentViewName();
                 return settings;
             }
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
     // var endDate = new Date();
     // endDate.setDate( endDate.getDate() + 10);
     // calendar.setTimeLineRange(new Date(), endDate);
      
     return calendar; 
      
   }});



