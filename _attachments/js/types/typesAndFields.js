/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  inject : [], 
    factory: function() {
        "use strict";
        var log = logger('typesAndFields');
        var typesAndFields = {};
        // var dataSource;
        var timeLists = {};
        // var eventSnapGap = 30;
        // database.setViews(views);
        
        var genericFields = {
            type: { type: 'text', required: true, canFilter: false , canEdit: false}
            ,_id: { primaryKey: true , title: 'ID', canEdit: false}
            ,_rev: { type: 'text', title: 'Rev', canEdit: false}
            ,inheritable: { type: 'boolean', showIf: 'false' }
            ,inheritingFrom: { type: 'text', title: 'Inheriting values from:', showIf: 'false' }
        };
    
        for (var f in genericFields) if (!genericFields[f].title)
            genericFields[f].title = isc.DataSource.getAutoTitle(f); 
        
        // var personPickList = {name: "person",// type: "select",
        //                       editorType: 'comboBox',
        //                       // title: 'person',
        //                       // change: function (form, item, value) {
        //                       //     var personList = eventForm.getField('person').pickList.getSelectedRecords();
        //                       //     // var personList = personPickList.getSelectedRecords();
        //                       //     console.log('PICKLIST', personList);
        //                       //     displayPerson = [];
        //                       //     // var person = []; 
        //                       //     personList.forEach(function(p) {
        //                       //         displayPerson.push(p.name);
        //                       //         // person.push(p._id);
        //                       //     });
        //                       //     console.log('PICKLIST', displayPerson);
        //                       //     if (displayPerson.length === 0) displayPerson = ['Nobody'];
        //                       //     console.log(form, item, value);
        //                       // },
        //                       // type: 'enum',
        //                       showTitle: true,
        //                       // required: true, 
        //                       // startRow: true,
        //                       multiple: true,
        //                       multipleAppearance: 'picklist',
        //                       showOptionsFromDataSource: true,
        //                       // optionDataSource: dataSource,
        //                       // filterLocally: true, 
        //                       pickListCriteria: { type: 'person'},
        //                       // filterEditorProperties: { displayField: 'name' 
        //                       //                           // ,pickListCriteria: { type: 'person'},
        //                       //  // optionDataSource: dataSource
                                                    
        //                       // // multiple: true,
        //                       // // multipleAppearance: 'picklist',

        //                       // // valueField: '_id'
        //                       //                         },
        //                       displayField: 'name',
        //                       valueField: '_id',
        //                       canEdit: true
        //                       // width:340,
        //                       // colSpan:2,
        //                       // click: function() {
        //                       //     setPickList(personField,
        //                       //                 this.form.getValues().person);
        //                       //     return true;},
        //                       // icons: [{
        //                       //     src: isc.Page.getSkinDir() +"images/actions/edit.png",
        //                       //     click: "isc.say(item.helpText)"
        //                       //     //TODO: make drag drop shift worker editor
        //                       // }]
        //                       // ,formatCellValue: function (value) {
        //                       //     console.log('valUEUEUEUE', value);
        //                       //     if (value) {
        //                       //         return value.name;
        //                       //     }
        //                       // }
        //                      };
        
        
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
            // if (list.last() === '24:00') list[list.length-1] = '0.00';
            timeLists[uniqueList] = list;

            return list;
        }
        
        //add fields here and they will appear in dropdown boxes and when claimed will create
        //a field in the shift record with the value of the shift's length
        var claimFields =  {
            sickLeave: { type: 'float' , canEdit: false}
            ,annualLeave: { type: 'float' , canEdit: false}
            ,longServiceLeave: { type: 'float' , canEdit: false}
            ,otherLeave: { type: 'float' , canEdit: false}
            // ,admin: { type: 'float' , canEdit: false}
            // ,disturbedSleep: { title: 'Disturbed Sleep',  type: 'float' , canEdit: false}
        };           
        
        // var claimTypes = ['Normal shift', 'Sick leave', 'Annual leave',
        //                   'Long service leave', 'Other leave', 'Away from base',
        //                   'Admin', 'Disturbed sleep', 'Event'];
        var claimValueMap = [];
        claimValueMap.push('Normal shift');
        claimValueMap.push('Away from base');
        Object.keys(claimFields).forEach(function(f) {
            claimValueMap.push( claimFields[f].title ? claimFields[f].title :
                                isc.DataSource.getAutoTitle(f) ); 
        });
        // claimValueMap.push('Event');
        
        // var rolesDS = isc.DataSource.create({
        //     allowAdvancedCriteria: true,
        //     dataFormat: "json",
        //     dataURL: "roles.json",
        //     fields:[
        //         { name: "entry" }
        //     ]
        // });
        
        
        var typeFields = {
            startDate: {  type: "datetime"}
            ,endDate: {  type: "datetime"}
            ,date: { type: 'date'
                     ,canEdit:false
                   }
            ,startTime: { type: 'time',
                          // editorType: 'select',
                          required: true,
                          title:'From'
                          ,canEdit:false
                          // ,valueMap: getTimeList(eventSnapGap)
                        }
            ,endTime: { type: 'time',
                        canEdit:false,
                        // editorType: 'select',
                        required: true,
                        title:'To'
                        // ,validators: [{ type:'isAfter'}],
                        // valueMap: getTimeList(eventSnapGap)
                      }
            ,person: { type: 'enum', canFilter: false, canEdit: false, title: 'Person Ids' }
            // ,personNames: { type 'text', canEdit: false, title: 'Employee(s)', validOperators: ['iContains', 'iNotContains']}
            ,personIdsString: { title: 'Person IDs', type: 'text', canEdit: false,
                                validOperators: ['iContains', 'iNotContains']}
            ,location: { type: "text", canEdit: false, title: 'Location Id'} 
            // ,locationString: { type: 'text', title: 'Location'}
            ,eventWindowStyle: { type: 'text'}
            ,description: { hide:true, type: "text", length: 500}
            ,notes: { type: "textarea", length: 5000 }
            ,ad: { title: 'All day', type: 'boolean'} //allday
            // ,claim: { type: 'text'} 
            ,claim:  {type: "select",
                      valueMap: claimValueMap,
                      defaultValue: 'Normal shift',
                      required: true
                      //TODO: implement 'event'. Change form when this is selected to somethin
                      //appropriate for an event 
                     }
            ,disturbedSleepHours : { type : 'float',
                                     title: 'Disturbed sleep'}
            ,adjustDisturbedHours: { type: "boolean",
                                     title: "Claim"}
            ,isPublicHolidayWorked: { type: 'boolean'}
            ,sleepOver: { type: 'boolean'}
            ,adminHoursUsed: { type: 'float' , canEdit: false }
            // ,name: { type: 'text', title: 'Unique name', canEdit: false} //should be unique within its type..
            ,colorFg: { type: 'text' }
            ,colorBg: { type: 'text' }
            ,roles: {
                name: "roles",
                title: "Roles"
            }
            ,availibility: {
                name: "availibility",
                title: "Availibility"
            }
            ,address: { type: 'text'}
            ,suburb: { type: 'text'}
            ,state: { type: "comboBox",
                      
                      valueMap: {
                          "QLD" : "QLD",
                          "NSW" : "NSW",
                          "SA" : "SA",
                          "NT" : "NT",
                          "WA" : "WA"  }
                    }
            ,phone: { type: 'text'}
            ,mob: { type: 'text'}
            ,email: { type: 'text'}
            ,postalCode: { type: 'text'}
            ,region: { type: 'text'}
            ,firstName: { type: 'text'}
            ,lastName: { type: 'text'}
            // ,shortName: { title: 'Short Name', type: 'text'}
            ,sex: { type: 'text'}
            ,award: { type: 'text'}
            // ,username: { type: 'text' }
            ,pwd: { type: 'text', canEdit: false}
            ,role: { type: 'text'}
            ,permissions: { type: 'text'}
            ,dswCALevel:  { type: 'text' }
            ,payrollNumber: { type: 'text'}
            ,status: { type: 'text ', required: true,
                       valueMap: ['permanent', 'part time', 'casual']
                     }
            ,costCentre: { type: 'text'}
            ,dayStart: { type: 'time',
                         // editorType: 'select',
                         required: true,
                         title:'Start of the day'
                         // ,canEdit:false
                         // ,valueMap: getTimeList(30)
                       }
            ,dayEnd: { type: 'time',
                       // editorType: 'select',
                       required: true,
                       title:'End of the day'
                       // ,canEdit:false
                       // ,valueMap: getTimeList(30)
                     }
            ,dayLength: { type: 'float',
                          // editorType: 'select',
                          required: true,
                          title:'Length of day (can be past 12 midnight)'
                          // ,canEdit:false
                          // ,valueMap: getTimeList(30)
                        }
            //calculated fields for a shift:
            ,length: { type: 'float' , canEdit: false}
            
            ,early: { type: 'float' , canEdit: false}
            ,ord: { type: 'float' , canEdit: false}
            ,late: { type: 'float' , canEdit: false}
            ,weekend: { type: 'float' , canEdit: false}
            
            ,publicHolidayOrdinary: { type: 'float' , canEdit: false}
            ,publicHolWorkPerm1p5: { type: 'float' , canEdit: false}
            // ,publicHolWork2p5: { type: 'float' , canEdit: false}
            
            ,awayFromBase: { type: 'boolean' , canEdit: false}
            
            ,overtimeT1p5: { type: 'float' , canEdit: false}
            ,overtimeT2: { type: 'float' , canEdit: false}
            
            ,disturbedSleepHoursT1: { type: 'float' , canEdit: false}
            ,disturbedSleepHours1p5: { type: 'float' , canEdit: false}
            ,disturbedSleepHoursT2: { type: 'float' , canEdit: false}
            ,disturbedSleep: { type: 'float' , canEdit: false}
            
            ,toilAccrued: { type: 'float' , canEdit: false}
            ,toilTaken: { type: 'float' , canEdit: false}
            
            ,dayName: { type: 'text' }
            
        };
        
        var types = {
            shift: { fields: ['location', //'person',
                              // 'personString', 'locationString',
                              'personIdsString',
                              'claim',
                              'sleepOver',
                              'startDate',
                              'endDate', 'date',
                              'startTime', 'endTime', 'length',
                              'sickLeave', 'annualLeave', 'adminHoursUsed','isPublicHolidayWorked',
                              'adjustDisturbedHours' ,'disturbedSleepHours',
                              'notes', 'ad' ]
                     ,icon: 'shift.png'
                   },
            location: {
                fields: ['dayStart', 'dayEnd', 'dayLength', 'costCentre', 'address', 'suburb','postalCode', 'state',
                         'phone', 'mob', 'email', 'region', 'notes']
                ,icon: 'home.png'
            }
            ,person: {
                fields: ['pwd', 'firstName', 'lastName', 'dswCALevel',
                         'payrollNumber', 'status', 'address', 'suburb','postalCode',
                         'state', 'phone', 'mob', 'email', 'notes', 'colorFg', 'colorBg', 'roles', 'availibility']
                ,icon: 'person.png'

            }};
        
        
        //-================================================================ 
        typeFields = isc.addProperties(typeFields, claimFields);
        
        var fields = isc.addProperties({}, genericFields, typeFields);
        
        fields.type.valueMap = allTypes;   
        
            var genericFieldsArray = (function() {
                var array = [];
                for (var f in genericFields) {
                    var field = genericFields[f];
                    field.name = f;
                    array.push(field);
                }
                    return array;
            })();

        var fieldsArray = (function() {
            var array = [];
            for (var f in fields) {
                var field = fields[f];
                field.name = f;
                if (!field.title)
                    field.title = isc.DataSource.getAutoTitle(field.name); 
                array.push(field);
            }
            return array;
        })();
        
        
        function getFieldNameByTitle(autoTitle) {
            for (var f in fields) {
                var field = fields[f];
                if (field.title === autoTitle) return field.name;
            }   
                return undefined;
        }
        
        var allTypes = (function () {
            var array = [];
            for (var t in types) array.push(t);
            return array;
        })();
    
        function fieldsCloner(someTypes, asObject) {
            if (typeof someTypes === 'string'){
                    someTypes = [ someTypes ];
            }
            var result = []; 
            var obj = {};
            someTypes.forEach(function(t) {
                if (types[t]) {
                    types[t].fields.forEach(function(fieldName) {
                        var field = typeFields[fieldName];
                        if (field && !result.containsProperty('name', fieldName)) {
                            field.name = fieldName;
                            result.push(field);
                            obj[fieldName] = field;
                        }  
                    });
                }
               
            });
            result = genericFieldsArray.concat(result); 
            obj = isc.addProperties(genericFields, obj);
            // if (someTypes.length > 1) {
            //     result.push({name:'group', type:'text', title:'Group'});
            // }
            return function () {
                return isc.clone( asObject ? obj : result);
                // if (!asObject) return isc.clone(result);
                // return isc.clone(obj);
            };
        }

        
        var initializer = {
            shift: function(record) {
                //TODO use shift.js to create new shift!!!!
                var date =  new Date();
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                var endDate = new Date(date);
                var startDate = new Date(date);
                endDate.setMinutes(30);
                var event = {
                    startDate: startDate,
                    endDate: endDate,
                    date: date,
                    endTime : isc.Time.createLogicalTime(endDate.getHours(),
                                                         endDate.getMinutes(),0),
                    startTime : isc.Time.createLogicalTime(startDate.getHours(),
                                                           startDate.getMinutes(),0),
                    endTijd : '-' + isc.Time.toTime(endDate, 'toShortPaddedTime', true)
                };
                isc.addDefaults(record, event);
            }
            ,location: function (record) {
                isc.addDefaults(record,{
                    dayStart: Date.parse('2000 6am'), dayEnd:Date.parse('2000 10pm'), dayLength: 14
                });
            }
        };
        
        
        // isc.Validator.addValidator(
        //     'isAfter',
        //     function(item, validator, endTime, record) {
        //         log.d('validator',validator);
        //         var startTime = eventForm.getValue('startTime');
        //         log.d(startTime<endTime);
        //         var errorMessage;
            
        //         if (endTime.getHours() === 0 &&
        //             endTime.getMinutes() === 0) endTime.setDate(endTime.getDate() + 1);
        //         var length = endTime.getTime() - startTime.getTime();
        //         if (startTime >= endTime) 
        //             errorMessage = 'Finish time should be after start time';
        //         //TODO should this be enforced or reminded?
        //         //TODO should we check shifts are in worktime?
        //         //TODO should we add extra shifts when somebody does a sleepover?
        //         else if (length < settings.minimumShiftLength * 60000) 
        //             errorMessage = 'Too small';
        //         else if (length > settings.maximumShiftLength * 60000) 
        //             errorMessage = 'Too big';
        //         log.d(validator.errorMessage);
        //         validator.errorMessage = errorMessage;
        //         return !errorMessage;
        //         // if (errorMessage) return false;
        //         // else return true;
        //         // return validator.errorMessage;
        //     }
        
        // );
    
        
        var newRecord = function(aType) {
            var record = {};
            record.type = aType;
            if (initializer[aType]) initializer[aType](record);
            return record;
        };
        
        //idb doesn't mind, but couchdb doesn't like fields starting
        //with underscores. So we remove all of them except for _id
        //and _rev. I don't use underscore fields, but smartclient
        //does. And they get added to my records when retrieved from a
        //form
        function removeUnderscoreFields(record) {
            log.d('removing underscore fields');
            Object.keys(record).forEach(function(k) {
                if (k !== '_id' &&
                    k !== '_rev' &&
                    k[0]==='_') {
                    delete record[k];   
                    log.d('removed underscore field', k);
                }
            });
        }
        
        typesAndFields = {
            // views: dbviews,
            allTypes: allTypes,
            allFields: isc.clone(fieldsArray),
            getField: function(fieldName) {
                return fields[fieldName];
            },
            getFieldsCloner: fieldsCloner,
            newRecord: newRecord,
            getFieldNameByTitle: getFieldNameByTitle,
            getType: function (aType) {
                return types[aType];
            }
            // setDataSource: function(ds) {
            //     dataSource = ds;
            // }
            ,removeUnderscoreFields: removeUnderscoreFields
        };
        
        return typesAndFields; 
    }});



