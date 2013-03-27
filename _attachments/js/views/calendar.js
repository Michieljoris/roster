/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:30 maxlen:190 devel:true*/

define
({ load: ['loaders/editor'],
   inject: ['View', 'editorManager', 'types/Shift', 'loaders/backend', 'lib/utils'],
   factory: function(View, editors, Shift, backend, utils) 
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
             chosenDate: new Date(),
             person: { ids: [], idsString: '', names: '' },
             location: { ids: [], name: ''}
         }
         ,init: function() {
             var dataSource = View.getBackend().getDS(); 
             calendar.setDataSource(dataSource);
             // setCssClasses();
             personForm.getField('person').setOptionDataSource(dataSource);
             locationForm.getField('location').setOptionDataSource(dataSource);
             
             calendar.addEventButton.hide();
         }
         ,sync: function(state) {
             state.currentViewName = calendar.getCurrentViewName();
         }
         ,set: function(state) {
             log.d('Calendar is being set!!!');
             // calendar.workdayStart = state.dayStart;
             // calendar.workdayEnd = state.dayEnd;
             var person = state.person, location = state.location;
             calendar.setChosenDate(new Date(state.chosenDate));
             calendar.setCurrentViewName(state.currentViewName);
             personForm.setValue('person', person.ids);
             locationForm.setValue('location', location.ids);
             // calendar.fetchData();
             log.d('fetching data for calendar:');
             var criteria = createCriteria(state);
             if (calendar.willFetchData(criteria)) {
                 calendar.fetchData({  }, function() {
                     calendar.setCriteria(criteria);
                     setCssClasses();
                     log.d('in callback!!');
                 });
             }
             else calendar.setCriteria(criteria);
             setDayCss(state);
             
         }
     }); 
     
     function setDayCss(state) {
         log.d('****************************', state.location.ids);
         if (state.location && state.location.ids.length === 1) {
             backend.get().getDoc('L1').when(
                 function(value) { log.d(value); }
                 ,function(value) { log.d('Error', value); }
             );
         }
         else {
             calendar.workdayStart = '0am'; 
             calendar.workdayEnd = '23:59'; 
             calendar.redraw();
         }
         
     }
     
     var personPickList = { name: "person",
                            type: 'enum',
                            // type: "select",
                            editorType: 'select',
                            required: true, 
                            change: function (form) {
                                
                                var personList = form.getField('person').
                                    pickList.getSelectedRecords();
                                // var personNames = [];
                                var personIds = [];
                                personList.forEach(function(p) {
                                    // personNames.push(p.name);
                                    personIds.push(p._id);
                                });
                                // if (personNames.length === 0) personNames = ['Nobody'];
                                // eventForm.setValue('personNames', personNames);
                                // eventForm.setValue('personNames', personNames.toString());
                                // eventForm.setValue('personIdsString', personIds.toString());
                               
                                log.d('PICKLIST', personIds);
                                var state = view.getState();
                                state.person = {
                                    ids: personIds
                                    // names: personNames.toString(),
                                    ,idsString: personIds.toString()
                                };
                                applyCriteria(state);
                                view.modified();
                                log.d('PICKLIST', state.person);
                            },
                            // ID: 'personPickList' ,
                            showTitle: false,
                            // startRow: true,
                            multiple: true,
                            multipleAppearance: 'picklist',
                            // optionDataSource: dataSource,
                            filterLocally: true, 
                            pickListCriteria: { type: 'person'},
                            displayField: '_id',
                            valueField: '_id',
                            width:180
                            ,top: 0
                            ,height: 20
                          };
 
     var locationPickList = { name: "location",
                              type: 'enum',
                              // ID:'testpick',
                              // type: "select",
                              editorType: 'select',
                              required: true, 
                              change: function (form) {
                                  
                                  var locationList = form.getField('location').
                                      pickList.getSelectedRecords();
                                  // var locationNames = [];
                                  var locationIds = [];
                                  locationList.forEach(function(p) {
                                      // locationNames.push(p.name);
                                      locationIds.push(p._id);
                                  });
                                  // if (locationNames.length === 0) locationNames = ['Nowhere'];
                               
                                  log.d('PICKLIST', locationIds);
                                  var state = view.getState();
                                  state.location = {
                                      ids: locationIds
                                      // ,nameString: locationNames[0]
                                      // ,idsString: locationIds.toString()
                                  };
                                  // if (locationNames[0]) state.location.name = locationNames[0];
                                  applyCriteria(state);
                                  setDayCss(state);
                                  view.modified();
                                  log.d('PICKLIST', state.location);
                                  
                                  // var state = view.getState();
                                  // state.location = form.getField('location')
                                  //     .pickList.getSelectedRecord();
                                  // state.location = state.location._id;
                                  // setData(state);
                                  // view.modified();
                                  // log.d('PICKLIST', state.location);
                              },
                          
                              // ID: 'locationPickList' ,
                              showTitle: false,
                              startRow: false,
                              multiple: true,
                              // multipleAppearance: 'picklist',
                              align: 'left',
                              // optionDataSource: dataSource,
                              filterLocally: true, 
                              pickListCriteria: { type: 'location'},
                              displayField: '_id',
                              valueField: '_id'
                              ,width:180
                              ,top: 0
                              ,height:20
                            };
     
     var personIcon = isc.Label.create({
         // width:buttonWidth,				
         title: '',
	 icon:"person.png",
         // top:0,
         height: 20, 
         left:170
         ,click: function() { //var f = personForm.getField('person');
             // if (f.disabled) f.enable(); else f.disable();
             // personIcon.active = !personIcon.active;
             var state = view.getState();
             state.personActive = !state.personActive;
             applyCriteria(state);
             view.modified();
         }
         
     });
     
     var personForm = isc.DynamicForm.create({numCols: 2
                                               ,fields: [
                                                   // {width: 10, showTitle: false, type:"checkbox"},
                                                        personPickList

                                               ]
                                              ,top: 0
                                              ,height: 20
                                              ,left: 190 });
      
     var locationIcon = isc.Label.create({
         // width:buttonWidth,				
         title: '',
	 icon:"home.png",
         top: 0,
         height: 20,
         left:375 
         ,click: function() {
             var state = view.getState();
             state.locationActive = !state.locationActive;
             applyCriteria(state);
             view.modified();
         }
     });
      
     var locationForm = isc.DynamicForm.create({fields: [locationPickList]
                                                ,top: 0
                                                ,height: 20
                                                ,left: 395 });
     
     function applyCriteria(state) {
         calendar.setCriteria(createCriteria(state));
     }
      
     function createOrCriteria(aFieldName, values) {
         function createPersonCriterion(aValue) {
             return { 
                 fieldName: aFieldName,
                 operator:'contains',
                 value: aValue
             };
         }
         var criteria = {
             _constructor:"AdvancedCriteria",
             operator:"or",
             criteria: []
         };
         // values.push('impossible dummy value..');
         values.forEach(function(v){
             criteria.criteria.push(createPersonCriterion(v));
         });
         criteria.criteria.push(createPersonCriterion('impossible dummy value..'));
         return criteria;
     }
     
     function createCriteria(state) {
         var person = state.person, location = state.location;
         var shiftCriterion = {
             fieldName: 'type',
             operator:'equals',
             value:'shift' };  
         var criteria = {
             _constructor:"AdvancedCriteria",
             operator:"and",
             criteria: [shiftCriterion
                       ] };
         criteria.criteria = [shiftCriterion];
         if (state.personActive) {
             personIcon.setIcon('person.png');
             criteria.criteria.push(createOrCriteria('personIdsString', person.ids));
         }
         else {
             personIcon.setIcon('personoff.png');
         } 
         
         if (state.locationActive)
         {   locationIcon.setIcon('home.png');
             // locationCriterion.value = location;
             criteria.criteria.push(createOrCriteria('location', location.ids));
         } 
         else
         {  locationIcon.setIcon('homeoff.png');
             }
         log.d('setting criteria', criteria);
         return criteria;
     }

     //Whenever the calendar is shown css classes are set that bind a
     //person to a bg and fg color (as set in person fields). Shifts
     //on the calendar are then assigned a class according to who does
     //the shift.  A property called eventWindowStyle is set in
     //Shift.js when the shift is created. It is set to a classname
     //derived from personNames
     //skin_styles.css has been edited to give shifts proper colors
     
     //TODO: maybe this should be only at startup and when a new user
     //is added
     function setCssClasses() {
         var personCriterion = {
             fieldName: 'type',
             operator:'equals',
             value:'person'
         };  
         
         // utils.createCSSClass('.eventColorMultiple',
         //                      'background-color:' + 'aliceBlue' +
         //                      '; color:' + 'black');
     
         backend.get().getDS().fetchData(null,
                                         function (dsResponse, data) {
                                             if (dsResponse.status < 0) alert("Can't get data from the database!!!");
                                             else {
                                                 // log.d('GOT a response from pouchDS', data);
                                                 var resultSet = isc.ResultSet.create({
                                                     dataSource:backend.get().getDS(),
                                                     criteria: personCriterion,
                                                     allRows:data
                                                 });
                                                 // log.d('and the result set is:', resultSet);
                                                 // log.d('and the visible rows are:', resultSet.getAllVisibleRows());
                                                 var persons = resultSet.getAllVisibleRows();
                                                 persons.forEach(function(p) {
                                                     var fg = p.colorFg ? p.colorFg : 'black';
                                                     var bg = p.colorBg ? p.colorBg : 'f0f8ff';
                                                     log.d('setting css classes' , p._id, fg, bg);
                                                     utils.createCSSClass('.eventColor' + p._id,
                                                                          'background-color:' + bg +
                                                                          '; color:' + fg);
                                                 }); 
                                                 
                                             }
                                         }
                                        );
     }
     
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
	     // ,autoFetchData: true
	     // ,descriptionField: 'notes'
	     ,nameField: 'endTijd'
             // ,showControlsBar : false
             // ,eventWindowStyle: 'eventWindow'
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
             // ,initialCriteria: { type: 'shift' }
             // ,criteria: { type: 'shift' }
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
                     var startTime = evtArr[i].startTime;
                     var endTime = evtArr[i].endTime;
                     
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
                     var eTime = startHour + startMinutes + sm + '-';
                     var eeTime = endHour + endMinutes + em;
                     // var minutes = startTime.getMinutes();
                     
                     // var eTime = startTime.getHours() + (minutes ? ':' + startTime.getMinutes() : '') + '-';
                     // minutes = endTime.getMinutes();
                     // var eeTime = endTime.getHours() + (minutes ? ':' + endTime.getMinutes() : '') ;
                     
                     // var eTime = isc.Time.toTime(startTime, this.timeFormatter, true) + "-";
                     
                     // var eeTime = isc.Time.toTime(evtArr[i][this.endDateField], this.timeFormatter, true) + " ";
                     if (this.canEditEvent(evtArr[i])) {
                         // when clicked, call the the editEvent method of this calendar, passing the
                         // row, column, and position of the event in this cell's event array
                         var template  = "<a href='javascript:" + this.ID + ".monthViewEventClick(" + 
                             rowNum + "," + colNum + "," + i + ");' class='" +
                             this.calMonthEventLinkStyle + "'>";
                         persons = evtArr[i].person; //TODO format persons
                         // retVal += template + eTime Names evtArr[i][this.nameField] + ' ' + persons + "</a><br/>";
                         retVal += template + "<b>" + persons + '</b>' +':  ' + '<i>' + eTime +
                             eeTime + "</i></a><br/>";
                         // log.d('TEMPLATE' , retVal);
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
             ,dayBodyClick: function(date) {
                 calendar.backgroundClick(date.addHours(12), date.clone().addHours(1));
             }
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
                 var person = view.getState().person;
                 var event = {
                     type: 'shift'
                     // ,location : view.getState().location.ids[0]
                     // ,locationName: view.getState().location.name
                     ,person : person.ids
                     ,personIdsString : person.idsString
                     // ,personNames: person.names
                     // ,location: location.ids[0]
                     // ,locationName: location.name
                     ,startDate: startDate,
                     endDate: endDate,
                     date: date,
                     endTime : isc.Time.createLogicalTime(endDate.getHours(),
                                                          endDate.getMinutes(),0),
                     startTime : isc.Time.createLogicalTime(startDate.getHours(),
                                                            startDate.getMinutes(),0)
                     
                 };
                 var location = view.getState().location;
                 var locationId = location.ids[0];
                 if (locationId) event.location = locationId;
                 // var locationName = location._id;
                 // if (locationName) event.locationName = locationName;
                
                 var state = view.getState();
                 state.title = getShiftDescription(event);
                 state.cancelButton = true;
                 state.saveButton = true;
                 state.removeButton = false;
                 state.isNewRecord = true;
                 log.d("NEW SHIFT", event);
                 editors.show(event, state);
                 
	         return false;
	     }
             }); 
     
     //little trick to catch the view change event:
     var setDateLabel = calendar.setDateLabel;
     calendar.setDateLabel = function() {
         view.modified();
         var viewName = this.getCurrentViewName();
         console.log(viewName);
         if (viewName === 'month') printButton.show();
         else printButton.hide();
         setDateLabel.apply(calendar); };
     
     var printButton = isc.Button.create({
         title: "Print",
         width: 70,
         click: function() {
             calendar.showPrintPreview();
         }
         ,top: 2
         ,height: 20
         ,left: 580 
     });
     
     calendar.controlsBar.addChild(locationIcon);
     calendar.controlsBar.addChild(locationForm);
     calendar.controlsBar.addChild(personIcon);
     calendar.controlsBar.addChild(personForm);
     calendar.controlsBar.addChild(printButton);

     view.setCmp(calendar);
     return view; 
      
   }});



