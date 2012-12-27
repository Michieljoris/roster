/*global  logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/



//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['editorUtils', 'pouchDS', 'editorManager', 'typesAndFields'],
  factory: function(editorUtils, datasource, editorManager) 
  { "use strict";
    var log = logger('shiftEditor');

    var editor = { type: 'shift' };
    var fields = editorManager.register(editor);   
    var buttonBar = editorUtils.buttonBar;
    
    var event;   
    var settings = {}; 
    
    var defaultSettings = {
        minimumShiftLength: 10,
        maximumShiftLength: 600,
        eventSnapGap: 60, //only works with a refresh
        workdayStart: '6:00',
        workdayEnd: '22:00',
        currentViewName: 'week', //day, week or month
        chosenDate: new Date()
        
    };
    
    function formChanged() {
        log.d('ITEMCHANGED', eventForm.valuesHaveChanged());
        var changed = eventForm.valuesHaveChanged();
        allButtons.Save.setDisabled(!changed);
        editorManager.changed(editor, changed);
    }

    // var fieldsCloner = typesAndFields.getFieldsCloner('shift', 'asObject');
    // var fields = fieldsCloner();
    // log.d('fields:', fields);
    // var fields;
    
    var timeLists = {};
        function formatTime(hour, minute) {
            // var hourPrefix = hour<10 ? '0' : '';
            var hourPrefix = hour<10 ? '' : '';
            var minutePrefix = minute<10 ? '0' : '';
            return hourPrefix + hour + ':' + minutePrefix + minute;
        }
         
    function getTimeList(step, startTime, endTime, endHour, endMinute) {
        step = step || 30;
        startTime = startTime || 0;
        endTime = endTime || 0;
        endMinute = endMinute || 0;
             
            var hour, minute;
        if (typeof startTime === 'object') {
            if (startTime) {
                hour = startTime.getHours();
                minute = startTime.getMinutes();
            } else { hour = 0; minute = 0; }
            if (endTime) {
                endHour = endTime.getHours();
                endMinute = endTime.getMinutes();
            } else { endHour = 24; endMinute = 0; }
        }
        else {
            hour = startTime, minute = endTime;  
                
        } 
        endHour = endHour || 24;
        // log.d(hour, minute, endHour, endMinute);
        if (endHour > 24) endHour = 24;
        var uniqueList = formatTime(hour,minute) + '-' + 
            formatTime(endHour, endMinute) + step;
        if (timeLists[uniqueList]) return timeLists[uniqueList] ;
        var list = [];
        while (hour < endHour || (hour === endHour && minute <= endMinute)) {
            // list.push(formatTime(hour,minute));
            list.push(isc.Time.createLogicalTime(hour, minute, 0));
            minute+=step; 
            // log.d(minute,hour);
            if ((minute/60) >= 1) hour++;
            minute %= 60;
        }
        if (list.last() === '24:00') list[list.length-1] = '0.00';
        timeLists[uniqueList] = list;

        return list;
    }
    
    
    
    isc.Validator.addValidator(
        'isAfter',
        function(item, validator, endTime, record) {
            log.d('validator',validator);
            var startTime = eventForm.getValue('startTime');
            log.d(startTime<endTime);
                var errorMessage;
            
            if (endTime.getHours() === 0 &&
                endTime.getMinutes() === 0) endTime.setDate(endTime.getDate() + 1);
            var length = endTime.getTime() - startTime.getTime();
            if (startTime >= endTime) 
                errorMessage = 'Finish time should be after start time';
            //TODO should this be enforced or reminded?
            //TODO should we check shifts are in worktime?
            //TODO should we add extra shifts when somebody does a sleepover?
            else if (length < settings.minimumShiftLength * 60000) 
                errorMessage = 'Too small';
            else if (length > settings.maximumShiftLength * 60000) 
                errorMessage = 'Too big';
            log.d(validator.errorMessage);
            validator.errorMessage = errorMessage;
            return !errorMessage;
            // if (errorMessage) return false;
            // else return true;
            // return validator.errorMessage;
        }
        
    );
    
    
    function addEvent() {
        log.d('addEvent',eventForm.getValues());
        
        if (eventForm.valuesHaveChanged() && eventForm.validate()) {
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
            if (event.endTime.getHours() === 0 &&
                event.endTime.getMinutes() === 0) endDate.setDate(endDate.getDate() + 1);
        
            if (!event.notes) event.notes = '';
            log.d(startDate, endDate);
            
            event.type = 'shift';
            event.startDate = startDate;
            event.endDate = endDate;
            event.name = '-' + isc.Time.toTime(event.endDate, 'toShortPaddedTime', true);
            event.description = personNames.toString() + '<p>' + event.notes;
            event.personNames = personNames.toString();
            event.locationNames = locationNames.toString();
            // event.notes = event.moreText;
            // event.description = event.notes;
            // log.d('XXXXnotes',event.notes);
            // log.d('XXXXperson', event.person);
            // log.d('XXXXlocation', event.location);
            // log.d('XXXXname', event.name);
            // isc.addProperties(event, otherFields);
            
            editorManager.save(event, updateForm);
            // editorManager.hide('shift');
        }
    }
    
    function updateForm(record) {
        eventForm.setValues(record);
       
    } 
    
    // function setPickList(field, values) {
    //     field.showPicker();
    //     var list = field.pickList;
    //     list.deselectAllRecords();
    //     log.d(values);
    //     list.data.localData.forEach(function(p) {
            
    //         if (values.contains(p._id))
    //             list.selectRecord(p);
    //        log.d(p.name); 
    //     });
    //     // log.d('what is this?',person);
        
        // }
    
    var personNames = [];
    var personPickList = { name: "person",
                           type: 'enum',
                           // type: "select",
                           // editorType: 'comboBox',
                           required: true, 
                          
                           change: function (form, item, value) {
                               var personList = eventForm.getField('person').pickList.getSelectedRecords();
                               personNames = [];
                               personList.forEach(function(p) {
                                   personNames.push(p.name);
                               });
                               if (personNames.length === 0) personNames = ['Nobody'];
                               log.d('PICKLIST', personNames);
                           },
                          
                           showTitle: false,
                           startRow: true,
                           multiple: true,
                           multipleAppearance: 'picklist',
                           optionDataSource: datasource,
                           filterLocally: true, 
                           pickListCriteria: { type: 'person'},
                           displayField: 'name',
                           valueField: '_id',
                           width:340,
                           colSpan:2,
                           icons: [{
                               src: isc.Page.getSkinDir() +"images/actions/edit.png",
                               click: "isc.say(item.helpText)"
                               //TODO: make drag drop shift worker editor
                           }]
                             };
    
    var locationNames = [];
    var locationPickList = { name: "location",
                             type: 'enum',
                             // type: "select",
                             // editorType: 'comboBox',
                             required: true, 
                          
                             change: function (form, item, value) {
                                 var locationList = eventForm.getField('location').pickList.getSelectedRecords();
                                 locationNames = [];
                                 locationList.forEach(function(p) {
                                     locationNames.push(p.name);
                                 });
                                 if (locationNames.length === 0) locationNames = ['Nobody'];
                                 log.d('PICKLIST', locationNames);
                             },
                          
                             showTitle: false,
                             startRow: false,
                             // multiple: true,
                             // multipleAppearance: 'picklist',
                             align: 'left',
                             optionDataSource: datasource,
                             filterLocally: true, 
                             pickListCriteria: { type: 'location'},
                             displayField: 'name',
                             valueField: '_id',
                             // width:340,
                             colSpan:1
                             // icons: [{
                             //     src: isc.Page.getSkinDir() +"images/actions/edit.png",
                             //     click: "isc.say(item.helpText)"
                             //     //TODO: make drag drop shift worker editor
                             // }]
                           };
    
    // var locationPickList = { name: "location",
    //                          type: "enum",
    //                          showTitle: false, 
    //                          startRow: false,
    //                          // required: true, 
    //                          // multiple: true,
    //                          // multipleAppearance: 'locationPicklist',
    //                          align: 'left',
    //                          optionDataSource: datasource,
    //                          filterLocally: true, 
    //                          pickListCriteria: { type: 'location'},
    //                          displayField: 'name',
    //                          colSpan:1,
    //                          valueField: '_id' }; 


    // var saveButton = isc.Button.create({
    //     left: 200,
    //     title: "CSS Button",
    //     icon: "icons/16/icon_add_files.png",
    //     click: function() { addEvent(); } 
    // });
    var allButtons = {};
    
    function action(e) {
        switch (e) {
          case 'Save': addEvent(); break; 
          case 'Cancel': editorManager.cancel(event); break; 
          case 'Delete': editorManager.remove(event); break;
        default: alert('unknown action in function action!!');
        }
        log.d(e);
    }
    
    
    var eventFormData = {
        ID: "eventForm",
        autoDraw: false,
        width:250,
        // dataSource: datasource,
        // height: 400,
        colWidths: ['60', '60', '*'],
        cellPadding: 4,
        numCols: 3,
        timeFormatter: 'toShort24HourTime',
        
        itemChanged: formChanged,
        // itemKeyPress: function(item,keyName) {
        //     if (keyName === 'Enter') addEvent();
                
        // },
        // cellBorder: 1,
        fields: [
            // { name: 'removeButton',
            //   type: "button",
            //   title : 'Delete',
            //   startRow: true,
            //   width: 50,
            //   // // endRow: true,
            //   colSpan: 1,
            //   cellHeight: 30,
            //   cellWidth: 60,
            //   // vAlign: 'centre',
            //   align: 'left',
            //   click: function() { editorManager.remove(event); } },
            
            // { name: 'cancelButton',
            //   type: "button",
            //   title: "Cancel",  
            //   endRow: false,
            //   width: 50,
            //   colSpan: 1,
            //   align: 'left',
            //   cellHeight: 30,
            //   vAlign: 'centre',
            //   click: function() { editorManager.cancel(event); } },
            
            // { name: 'saveButton',
            //   type: "button",
            //   title : 'Save',
            //   // startRow: false,
            //   //endRow: true,
            //   width: 50,
            //   cellWidth: 60,
            //   cellHeight: 30,
            //   // vAlign: 'centre',
            //   // // height: 20, 
            //   colSpan: 2,
            //   align: 'right',
            //   click: function() { addEvent(); } },
            isc.addDefaults({
                showTitle: false,
                startRow: true,
                colSpan:1
                //TODO: implement 'event'. Change form when this is selected to somethin
                //appropriate for an event 
            }, fields.claim),
            
            locationPickList,
            
            
            //---------------------------- 
            personPickList,
            
            { name: "date",
              required: true,
              showTitle: false,
              type: "date",
              startRow: true},
            
            isc.addDefaults({
                showTitle: false,
                name: "sleepOver",
                align: 'left',
                startRow: false ,
                colSpan:2
            }, fields.sleepOver),
            
            //---------------------------------
            {name: "startTime", type: "time", editorType: 'comboBox', required: true,
             title:'From',showTitle: true,
             titleOrientation: 'top', startRow: true
             ,valueMap: getTimeList(settings.eventSnapGap)
            },
            
            {name: "endTime", type: "time", editorType: 'comboBox', required: true,
             title:'To',showTitle: true, colSpan: 1,
             validators: [{ type:'isAfter'}],
             titleOrientation: 'top', startRow: false
             ,valueMap: getTimeList(settings.eventSnapGap)
            },
            
            //----------------------------------------
            {name: "repeats",
             type: "Select",
             showTitle: false,
             startRow: true,
             valueMap: ['Does not repeat', 'Daily', 'Every weekday (Mon-Fri)', 'Weekly',
                        'Monthly', 'Yearly'],
             required: true,
             defaultValue: 'Does not repeat',
             disabled: true
            },
            //TODO implement repeats UI, similar to Extensible calenda
            
            //---------------------------------------- 
            isc.addDefaults(
                { height: '100',
                  titleOrientation: 'top',
                  showTitle: true,
                  width: '340',
                  colSpan: 3,
                  startRow: true}
                
                , fields.notes)
            //-------------------------------------- 
            ]
    };
    
    
    var eventForm = isc.DynamicForm.create(eventFormData);
    
    var layout = isc.VLayout.create({
          
        height: '100%',
        width: '100%',
        members: [
            eventForm,
            buttonBar(allButtons, 'horizontal', 25, 350,
                      ['Delete', '|', 'Cancel', 'Save'],
                      {  width: 50,
                         autoDraw: false
                      }, action)
              
            ]  
    });
    
    // var cancelButton = eventForm.getField('cancelButton');
    // var removeButton = eventForm.getField('removeButton');
    // var saveButton = eventForm.getField('saveButton');
    // editor.canvas = eventForm;
    editor.canvas = layout;
    
    editor.canvas.rememberValues = function() {
        eventForm.rememberValues();
    };
    editor.canvas.getValues = function() {
        return eventForm.getValues();
    };
    editor.set = function(someEvent, someSettings) {
        
        event = someEvent;
        personNames = [];
        log.d('setting values', someEvent);
        settings = isc.addDefaults(someSettings, defaultSettings);
        
        event.endTime = isc.Time.createLogicalTime(event.endDate.getHours(),
                                                   event.endDate.getMinutes(),0);
        event.startTime = isc.Time.createLogicalTime(event.startDate.getHours(),
                                                     event.startDate.getMinutes(),0);
        event.date = event.startDate;
        
        
        eventForm.clearErrors();
        eventForm.setValues(someEvent);
        log.d('CHANGED', eventForm.valuesHaveChanged());
        
        allButtons.Cancel.setVisibility(settings.cancelButton);
        allButtons.Delete.setVisibility(settings.removeButton);
        allButtons.Save.setVisibility(settings.saveButton);
        allButtons.Save.setDisabled(true);
        // if (settings.cancelButton) cancelButton.show(); else cancelButton.hide();
        // if (settings.removeButton) removeButton.show(); else removeButton.hide();
        // if (settings.saveButton) saveButton.show(); else saveButton.hide();
    };
    

  }});
