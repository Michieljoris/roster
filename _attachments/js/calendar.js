/*global module:true isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:190 devel:true*/

define
({inject: ['pouchDS', 'roster'],
  factory: function(pouchDS, roster) 
  { "use strict";
    var observer;
    var settings = {
        eventSnapGap: 30,
        workdayStart: '6:00',
        workdayEnd: '22:00',
        currentViewName: 'week', //day, week or month
        chosenDate: new Date()
        
    };
    // setChosenDate
    // setCurrentViewName
    isc.Validator.addValidator(
     'isAfter',
        function(item, validator, value, record) {
            console.log('in validator', eventForm.getValue('startTime'), value );
            // console.log( value > eventForm.getValue('startTime'));
            //TODO turn string into date if necessary
            var startDate = new Date(eventForm.getValue('startTime'));
            var endDate = value;
            startDate.setYear(0); 
            startDate.setMonth(0); 
            startDate.setDate(0); 
            endDate.setYear(0); 
            endDate.setMonth(0); 
            endDate.setDate(0); 
            console.log(startDate<endDate);
            // return (value >  eventForm.getValue('startTime'));
            return false;
        }
        
    );
    
    function addEvent() {
        console.log('addEvent',eventForm.getValues());
        eventForm.clearErrors();
        
        if (eventForm.validate()) {
            var event = eventForm.getValues();
                var startDate = new Date();
            startDate.setHours(event.startTime.getHours());
            startDate.setMinutes(event.startTime.getMinutes());
            startDate.setSeconds(0);
            startDate.setYear(event.date.getYear() + 1900);
            startDate.setMonth(event.date.getMonth());
            startDate.setDate(event.date.getDate());
            var endDate = new Date();
            endDate.setHours(event.endTime.getHours());
            endDate.setMinutes(event.endTime.getMinutes());
            endDate.setSeconds(0);
            endDate.setYear(event.date.getYear() + 1900);
            endDate.setMonth(event.date.getMonth());
            endDate.setDate(event.date.getDate());
            // if (endDate <= startDate) {
            //     console.log('ERROR');
            //     //TODO
            //     return;
            // }
            // eventForm.getField('endTime').validators = [
            //     {type:"dateRange", min: Date(0,0,0),
            //      max: new Date(30000,0, 0) ,
            //      errorMessage: 'Finish time has to be after start time'}];
        
            if (!event.notes) event.notes = '';
                console.log(startDate, endDate);
	    // calendar.addEvent(startDate, endDate,
            var otherFields = { group: 'shift',
                                claim: event.claim,
                                repeats: event.repeats,
                                sleepOver: event.sleepOver,
                                location: event.location,
                                ad: false,
                                displayPerson: []};
            // console.log('changed:', eventForm.valuesHaveChanged(), eventForm.getChangedValues());
            
            var personList = eventForm.getField('person').pickList.getSelectedRecords();
            personList.forEach(function(p) {
                otherFields.displayPerson.push(p.name);
            });
            
            console.log('***********', event.person)    ;
            if (event._rev) {
                if (eventForm.valuesHaveChanged())
                    calendar.updateEvent(event,
                                         startDate, endDate,
                                         // isc.JSON.encode(event.person),
                                         event.person,
                                         event.notes,
                                         otherFields);
            }
            else calendar.addEvent(startDate, endDate,
                                   // isc.JSON.encode(event.person),
                                   event.person,
                                   event.notes,
                                   otherFields);
            observer('calendar');
            eventEditor.hide(); 
        }
    }
    
    // function setPickList(field, values) {
    //     field.showPicker();
    //     var list = field.pickList;
    //     list.deselectAllRecords();
    //     console.log(values);
    //     list.data.localData.forEach(function(p) {
            
    //         if (values.contains(p._id))
    //             list.selectRecord(p);
    //        console.log(p.name); 
    //     });
    //     // console.log('what is this?',person);
        
    // }
    
    var personPickList = {name: "person",// type: "select",
                          // editorType: 'comboBox',
                          type: 'enum',
                          showTitle: false,
                          // required: true, 
                          startRow: true,
                          multiple: true,
                          multipleAppearance: 'picklist',
                          optionDataSource: pouchDS,
                          filterLocally: true, 
                          pickListCriteria: { group: 'person'},
                          displayField: 'name',
                          valueField: '_id',
                          width:340,
                          colSpan:2,
                          // click: function() {
                          //     setPickList(personField,
                          //                 this.form.getValues().person);
                          //     return true;},
                          icons: [{
                              src: isc.Page.getSkinDir() +"images/actions/edit.png",
                              click: "isc.say(item.helpText)"
                              //TODO: make drag drop shift worker editor
                          }]
                         };
    
    
    var eventForm = 
    isc.DynamicForm.create({
        ID: "eventForm",
        autoDraw: false,
        // height: 48,
        colWidths: ['60', '60', '20'],
        cellPadding: 4,
        numCols: 3,
        timeFormatter: 'toShort24HourTime',
        itemKeyPress: function(item,keyName) {
            if (keyName === 'Enter') addEvent();
                
        },
        // cellBorder: 1,
        fields: [
            {name: "claim", showTitle: false, type: "select", startRow: true,
             showIf: function() { return true; //return eventForm.getValue("Claim") === true;
                                }, required: true, defaultValue: 'Normal shift',
             valueMap: ['Normal shift', 'Sick leave', 'Annual leave',
                        'Long service leave', 'Other leave', 'Away from base',
                        'Admin', 'Disturbed sleep', 'Event'], colSpan:1
             //TODO: implement 'event'. Change form when this is selected to somethin
             //appropriate for an event 
            },
            {name: "location", type: "select",
             showTitle: false, 
             startRow: false,
             // required: true, 
             // multiple: true,
             // multipleAppearance: 'picklist',
             align: 'right',
             optionDataSource: pouchDS,
             filterLocally: true, 
             pickListCriteria: { group: 'location'},
             displayField: 'name', colSpan:1,
             valueField: '_id' }, 
            
            personPickList,
            
            {name: "date", required: true, showTitle: false, type: "date", startRow: true},
            {name: "sleepOver", align: 'left', showTitle: false, type: "boolean",
             startRow: false , colSpan:2},
            {name: "startTime", type: "time", editorType: 'comboBox', required: true,
             title:'From',showTitle: true,
             titleOrientation: 'top', startRow: true, valueMap:roster.getTimeList(30) },
            {name: "endTime", type: "time", editorType: 'comboBox', required: true,
             title:'To',showTitle: true, colSpan: 2,
             validators: [{ type:'isAfter', errorMessage: 'Finish time is before start time' }],
             titleOrientation: 'top', startRow: false, valueMap:roster.getTimeList(30) },
            
            {name: "repeats", type: "Select", showTitle: false, startRow: true,
             valueMap: ['Does not repeat', 'Daily', 'Every weekday (Mon-Fri)', 'Weekly',
                        'Monthly', 'Yearly'], required: true, defaultValue: 'Does not repeat',
             disabled: true
            },
            //TODO implement repeats UI, similar to Extensible calenda
            
            {name:"notes", title:'Notes', type: "textarea", height: '100', titleOrientation: 'top',
             showTitle: true, width: '340', colSpan: 3, startRow: true},
            {type: "button", title : 'Save', colSpan:1,
             click: function() { addEvent(); } , endRow: false},
             
            // {type: "button", title : 'Delete', colSpan:1, startRow: false,
            //  click: function() { addEvent(); } , endRow: false},
            {type: "button", title: "Cancel", align: 'right', startRow: false,
             click: function() { eventEditor.hide(); } , endRow: false}
        ]
    });
    
    
    // var personField = module.temp = eventForm.getField('person');
    
    var eventEditor = isc.Window.create({
        title: "TODO: Set to event date, start and end",
        autoSize: true,
        canDragReposition: true,
        canDragResize: false,
        showMinimizeButton: false, 
        autoCenter: true,
        isModal: true,
        showModalMask: true,
        autoDraw: false,
        items: [ eventForm ]
    });
      
    function getShiftDescription(event) {
        console.log('in shiftdesc', event);
        var sDate = event.startDate.toShortDate(calendar.dateFormatter);
        var sTime = isc.Time.toTime(event.startDate, calendar.timeFormatter, true);
        var eTime = isc.Time.toTime(event.endDate, calendar.timeFormatter, true);

        return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime;
    }
    
    var calendar = isc.Calendar.create(
        {   ID: "isc_ShiftCalendar", 
	    dataSource: pouchDS, 
	    autoFetchData: true,
	    descriptionField: 'notes'
	    ,nameField: 'person'
            ,eventOverlapIdenticalStartTimes: true
            ,eventOverlap:false
            ,firstDayOfWeek: 6
            ,disableWeekends: false
            ,showWorkday: true
            // ,showTimelineView:true
            ,workdays: [0,1,2,3,4,5,6]
            ,workdayStart: settings.workdayStart
            ,workdayEnd: settings.workdayEnd
	    // ,initialCriteria: { group:'shift'  } 
            ,eventSnapGap: settings.eventSnapGap
            ,dateChanged: function() {
                //TODOchange of current date
                console.log('change of current date');
            }
            ,getEventHoverHTML : function (event, eventWindow) {
                console.log(event, eventWindow);
                var cal = this;
    
                // format date & times
                var sDate = event[cal.startDateField].toShortDate(this.dateFormatter);
                var sTime = isc.Time.toTime(event[cal.startDateField], this.timeFormatter, true);
                var eTime = isc.Time.toTime(event[cal.endDateField], this.timeFormatter, true);

                return sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime +
                    "</br></br>" + 
                    event.displayPerson + "</br></br>"  +
                    event[cal.descriptionField];       

            }
            // ,getDayBodyHTML: function() {
             //TODO   
            // }
            // ,selectTab:function(tabNum) {
             //TODO   
            // }
	    ,eventClick: function(event, viewName) {
	        console.log("Update event", event, viewName);
                // event.startTime = isc.Time.toShortTime(event.startDate, 'toShort24HourTime'),
                // event.endTime = isc.Time.toShortTime(event.endDate, 'toShort24HourTime'),
                event.endTime = event.endDate;    
                event.startTime = event.startDate;    
                event.date = event.startDate;
                eventForm.setValues(event);
                
                // format date & times
                eventEditor.setTitle(getShiftDescription(event));
                eventEditor.show();
                
	        return false;
	    }
	    ,backgroundClick: function(startDate, endDate) {
	        console.log('New event',startDate, endDate);
                
                 var date =  new Date(startDate);
                // updating = false;
	        eventForm.setValues({
                    date: date,
                    // person: [],
                    // location: '',
                    // startTime : isc.Time.toShortTime(startDate, 'toShort24HourTime'),
                    // endTime : isc.Time.toShortTime(endDate, 'toShort24HourTime')
                    // startTime: startDate.getHours() + ':' + startDate.getMinutes(),
                    // endTime: endDate.getHours() + ':' + endDate.getMinutes()
                    startTime: startDate,
                    endTime: endDate
                });
                eventEditor.setTitle(
                    getShiftDescription({ startDate: startDate, endDate: endDate }));
                eventEditor.show();
	        return false;
	    }
            ,notify: function() {
                console.log('calendar is notified');
            }
            ,getState: function() {
                return {};
            }
            ,setObserver: function(f) {
                observer = f;
            }
            ,name: 'Calendar'
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



