/*global  logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/



//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['Editor', 'types/Shift', 'editorUtils', 'editorManager'],
  factory: function(Editor, Shift, editorUtils, editorManager) 
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
        // eventSnapGap: 60, //only works with a refresh
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
        
        var startTime = isc.Time.createLogicalTime(eventForm.getValue('startTime').getHours(),
                                                   eventForm.getValue('startTime').getMinutes(),0);
        var endTime = isc.Time.createLogicalTime(eventForm.getValue('endTime').getHours(),
                                                 eventForm.getValue('endTime').getMinutes(),0);
        if (endTime.getHours() === 0 &&
            endTime.getMinutes() === 0) endTime.setDate(startTime.getDate() + 1);
        var period = {
            startDate: startTime,
            endDate: endTime
        };
        var length = Shift.calculateLength(period);
        eventForm.setValue('length', length);
        eventForm.validate();
    }
    
    isc.Validator.addValidator(
        'isAfter',
        function(item, validator, dummy, record) {
            log.d('validator',validator, record);
            // var startTime = eventForm.getValue('startTime');
            var startTime = isc.Time.createLogicalTime(record.startTime.getHours(),
                                                     record.startTime.getMinutes(),0);
            var endTime = isc.Time.createLogicalTime(record.endTime.getHours(),
                                                       record.endTime.getMinutes(),0);
            // var startTime = record.startTime;
            // var endTime = record.endTime;
            log.d(startTime<endTime);
            var errorMessage;
            
            if (endTime.getHours() === 0 &&
                endTime.getMinutes() === 0) endTime.setDate(startTime.getDate() + 1);
            var length = endTime.getTime() - startTime.getTime();
            log.d(startTime, endTime, ' validated--------------------------');
            if (startTime >= endTime)  {
                errorMessage = 'Finish time should be after start time';
            }
            //TODO should this be enforced or reminded?
            //TODO should we check shifts are in worktime?
            else if (length < settings.minimumShiftLength * 60000) 
                errorMessage = 'Smaller than ' + settings.minimumShiftLength/60 + ' hours.';
            else if (length > settings.maximumShiftLength * 60000) 
                errorMessage = 'Bigger than ' + settings.maximumShiftLength/60 + ' hours';
            // log.d('XXXXXXXXXX',validator.errorMessage, startTime, endTime);
            validator.errorMessage = errorMessage;
            return !errorMessage;
        }
        
    );
    
    
    function addEvent() {
        var validates = eventForm.validate();
        if (!validates) {
            var errors = eventForm.valuesAreValid(false, true);
            validates = true;
            if (errors.location || errors.person ||
                errors.startTime.startsWith('Finish')) 
                validates = false;
            log.d(errors);
        }
        if (validates && eventForm.valuesHaveChanged()) {
            var eventValues = eventForm.getValues();
            eventValues.personNames = personNames;
            eventValues.locationNames = locationNames;
            
            event =Shift.create(eventValues);
            editorManager.save(event, updateForm);
        }
    }
    
    function updateForm(record) {
        eventForm.setValues(record);
        allButtons.Save.setDisabled(true);
        editorManager.changed(editor, false);
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
                               // personNames = personNames.toString();
                               log.d('PICKLIST', personNames);
                           },
                           // ID: 'personPickList' ,
                           showTitle: false,
                           startRow: true,
                           multiple: true,
                           multipleAppearance: 'picklist',
                           // optionDataSource: backend.get().getDS(),
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
                                 // event.locationNames = locationNames.toString();
                             },
                          
                             // ID: 'locationPickList' ,
                             showTitle: false,
                             startRow: false,
                             // multiple: true,
                             // multipleAppearance: 'picklist',
                             align: 'left',
                             // optionDataSource: backend.get().getDS(),
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
        // width:250,
        // dataSource: datasource,
        height: 350,
        colWidths: ['60', '60', '*'],
        cellPadding: 4,
        numCols: 3,
        timeFormatter: 'toShort24HourTime',
        validateOnChange: true,
        
        itemChanged: formChanged,
        // itemKeyPress: function(item,keyName) {
        //     if (keyName === 'Enter') addEvent();
                
        // },
        // cellBorder: 1,
        fields: [
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
            
            //---------------------------------
            isc.addDefaults({
                colSpan: 1,
                titleOrientation: 'top',
                startRow: true
                ,canEdit: true
                // ,valueMap: getTimeList(settings.eventSnapGap)
            }, fields.date),
            isc.addDefaults({
                showTitle: false,
                titleOrientation: 'top',
                // name: "sleepOver",
                align: 'left',
                startRow: false 
                // colSpan:2
            }, fields.sleepOver),
            
            isc.addDefaults({
                titleOrientation: 'top',
                startRow: true
                ,canEdit: true
                ,validators: [{ type:'isAfter'}]
                // ,valueMap: getTimeList(settings.eventSnapGap)
            }, fields.startTime),
            isc.addDefaults({
                titleOrientation: 'top',
                startRow: false
                ,canEdit: true
                ,validators: [{ type:'isAfter'}]
                // ,valueMap: getTimeList(settings.eventSnapGap)
            }, fields.endTime),
            // isc.addDefaults({
            //  //name: "date",
            //   // required: true,
            //   showTitle: false,
            //   // type: "date",
            //   startRow: true
            // }, fields.date),
            
            
            
            //----------------------------------------
            {name: "repeats",
             type: "Select",
             showTitle: true,
             startRow: true,
             titleOrientation: 'top',
             valueMap: ['Does not repeat', 'Daily', 'Every weekday (Mon-Fri)', 'Weekly',
                        'Monthly', 'Yearly'],
             required: true,
             defaultValue: 'Does not repeat',
             disabled: true
            },
            isc.addDefaults({
                titleOrientation: 'top',
                title: 'Admin (hours)',
                startRow: false,
                width: 50,
                canEdit: true
                //TODO add validator to make sure the value is smaller than the length
                // ,valueMap: getTimeList(settings.eventSnapGap)
            }, fields.adminHoursUsed),
            
            isc.addDefaults({
                showTitle: false,
                titleOrientation: 'top',
                title: 'Working on public holiday',
                align: 'left',
                startRow: true 
                // colSpan:2
            }, fields.isPublicHolidayWorked),
            {
                titleOrientation: 'top',
                type: 'text',
                title: 'Shift length (hours)',
                canEdit: false,
                name:'length'
            },
            // isc.BlurbItem.create({
            //   name: 'blurb', value: 'hello'  
            // }),
            //TODO implement repeats UI, similar to Extensible calenda
            
            //---------------------------------------- 
            isc.addDefaults(
                { height: 100,
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
        // overflow:'auto',
          // autoSize:true,
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
      
    // editor.canvas.disableSaveButton = function() {
    //     allButtons.Save.setDisabled(true);
    // };
    
    editor.canvas.getValues = function() {
        return eventForm.getValues();
    };
    editor.set = function(someEvent, someSettings) {
        // log.d('AAAAAAAAAAAAAAAAA', someSettings.isNewRecord);
        // log.d('AAAAAA', someEvent.person);
        event = someEvent;
        personNames = [];
        // log.d(event.person);
        // if (event.person && typeof event.person === 'string') event.person = event.person.split(',');
        // else event.person = [];
        log.d('setting values', someEvent);
        settings = isc.addDefaults(someSettings, defaultSettings);
        
        event.endTime = isc.Time.createLogicalTime(event.endDate.getHours(),
                                                   event.endDate.getMinutes(),0);
        event.startTime = isc.Time.createLogicalTime(event.startDate.getHours(),
                                                     event.startDate.getMinutes(),0);
        event.date = event.startDate;
        event.length = Shift.calculateLength(event);
        
        
        eventForm.clearErrors();
        eventForm.setValues(someEvent);
       // log.d('CHANGED', eventForm.valuesHaveChanged());
        
        allButtons.Cancel.setVisibility(settings.cancelButton);
        allButtons.Delete.setVisibility(settings.removeButton);
        allButtons.Save.setVisibility(settings.saveButton);
        allButtons.Save.setDisabled(!settings.isNewRecord);
        // if (settings.cancelButton) cancelButton.show(); else cancelButton.hide();
        // if (settings.removeButton) removeButton.show(); else removeButton.hide();
        // if (settings.saveButton) saveButton.show(); else saveButton.hide();
    };
    editor.init = function() {
              var dataSource = Editor.getBackend().getDS();
              eventForm.getField('person').setOptionDataSource(dataSource);
              eventForm.getField('location').setOptionDataSource(dataSource);
    };
    return editor; 

  }});
