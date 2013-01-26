/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  inject : ['globals'], 
    factory: function(globals) {
        "use strict";
        var log = logger('type_shift');
        log.d('Evaluating type_shift');
        
        
        var timeLists = {};
        
        var claimFields =  {
            sickLeave: { type: 'float' , canEdit: false, showIf: 'false'}
            ,annualLeave: { type: 'float' , canEdit: false, showIf: 'false'}
            ,longServiceLeave: { type: 'float' , canEdit: false, showIf: 'false'}
            ,otherLeave: { type: 'float' , canEdit: false, showIf: 'false'}
            // ,admin: { type: 'float' , canEdit: false, showIf:
            // 'false'} ,disturbedSleep: { title: 'Disturbed Sleep',
            // type: 'float' , canEdit: false, showIf: 'false'}
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
        claimValueMap.push('Event');
        
        
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
        
        var fields = {
            startDate: {  type: "datetime"}
            ,endDate: {  type: "datetime"}
            ,date: { type: 'date'
                     ,canEdit:false 
                   }
            ,startTime: { type: 'time',
                          editorType: 'comboBox',
                          required: true,
                          title:'From',
                          canEdit:false,
                          valueMap: getTimeList(globals.eventSnapGap)
                        }
            ,endTime: { type: 'time',
                        canEdit:false,
                        editorType: 'comboBox',
                        required: true,
                        title:'To',
                        // validators: [{ type:'isAfter'}],
                        valueMap: getTimeList(globals.eventSnapGap)
                      }
            ,person: { type: 'enum', canEdit: false }
            ,personstring: { type: 'text', canEdit: false }
            ,personNames: { type: 'text', canEdit: false, title: 'Employee(s)', validOperators: ['iContains', 'iNotContains']}
            // ,person: personPickList
            ,location: { type: "text", canEdit: false} 
            ,locationNames: { type: 'text', title: 'Location', validOperators: ['iContains', 'iNotContains']}
            ,description: { hide:true, type: "text", length: 500}
            ,notes: { type: "textarea", length: 5000}
            ,ad: { title: 'All day', type: 'boolean'} //allday
            // ,claim: { type: 'text'} 
            ,claim:  {type: "select",
                      valueMap: claimValueMap,
                      defaultValue: 'Normal shift',
                      required: true
                      //TODO: implement 'event'. Change form when this is selected to somethin
                      //appropriate for an event 
                     }
            ,sleepOver: { type: 'boolean'}
            ,admin: { type: 'float' , canEdit: false, showIf: 'true'}
            
            //calculated fields for a shift:
            ,length: { type: 'float' , canEdit: false, showIf: 'false'}
            
            ,early: { type: 'float' , canEdit: false, showIf: 'false'}
            ,ord: { type: 'float' , canEdit: false, showIf: 'false'}
            ,late: { type: 'float' , canEdit: false, showIf: 'false'}
            ,weekend: { type: 'float' , canEdit: false, showIf: 'false'}
            
            ,publicHolidayOrdinary: { type: 'float' , canEdit: false, showIf: 'false'}
            ,publicHolWorkPerm1p5: { type: 'float' , canEdit: false, showIf: 'false'}
            ,publicHolWork2p5: { type: 'float' , canEdit: false, showIf: 'false'}
            
            
            ,awayFromBase: { type: 'boolean' , canEdit: false, showIf: 'false'}
            
            ,overtimeT1p5: { type: 'float' , canEdit: false, showIf: 'false'}
            ,overtimeT2: { type: 'float' , canEdit: false, showIf: 'false'}
            
            ,toilAccrued: { type: 'float' , canEdit: false, showIf: 'false'}
            ,toilTaken: { type: 'float' , canEdit: false, showIf: 'false'}
        }; 
        
        var create = function() {
            //TODO use shift.js to create new shift!!!!
            var date =  new Date();
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            var endDate = new Date(date);
            var startDate = new Date(date);
            endDate.setMinutes(30);
            var instance = {
                type: 'shift',
                startDate: startDate,
                endDate: endDate,
                date: date,
                endTime : isc.Time.createLogicalTime(endDate.getHours(),
                                                     endDate.getMinutes(),0),
                startTime : isc.Time.createLogicalTime(startDate.getHours(),
                                                       startDate.getMinutes(),0),
                endTijd : '-' + isc.Time.toTime(endDate, 'toShortPaddedTime', true)
            };
            return instance;
        };
        
    }});