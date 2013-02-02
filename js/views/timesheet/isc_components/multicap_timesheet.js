/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/


define
({ inject: ['timesheet/multicap_timesheet_raphael',
            'timesheet/fetchTimesheetShifts'
            ,'timesheet/calculateTimesheet'],
   factory: function(timesheet, fetchShifts, calc) {
       "use strict";
       var log = logger('timesheet component');
       
       function setData(state) {
           fetchShifts(state.person, state.location, state.fortnight, process);
       }
       
       function process(data) {
           var person = data.person;
           var location = data.location;
           var shifts = data.shifts;
           var fortnight = data.fortnight;
           timesheet.clear();
           log.pp('setting data:::::', person, location, shifts);
           timesheet.setData({
               name: person.firstName + ' ' + person.lastName
               ,payrollNumber: person.payrollNumber
               ,phone: person.phone
               ,dswCALevel: person.dswCALevel
               ,ending: fortnight.clone().addDays(13).toEuropeanShortDate()
           }); 
           
           switch(person.status) {
               case 'permanent' : timesheet.setData({ permanent: 'X'}); break;
               case 'part time' : timesheet.setData({ parttime: 'X'}); break;
               case 'casual' : timesheet.setData({ casual: 'X'}); break;
               default: log.e('Person status is not valid', person);
           }

           calc(fortnight, person, location, shifts);
           for (var i=0; i<14; i++) {
               // timesheet.setColumn( i, sheet.getColumn(i));
           }
           
       }
       
        
       var component = isc.defineClass("Multicap_Timesheet", "Canvas");
       isc.Multicap_Timesheet.addProperties({
           // write out a div with a known ID
           getInnerHTML : function () {
               // return "<div style='width:100%;height:100%' ID='" + 
               return "<div  ID='" + 
                   this.getID() + "_timesheet" + "'></div>";
           },
           // call superclass method to draw, then have
           // timesheet_canvas replace the textarea we wrote out with
           // the CKEditor widget
           draw : function () {
               if (!this.readyToDraw()) return this;
               this.Super("draw", arguments);
               timesheet.draw(this.getID() + "_timesheet");
               return this;
           }
           ,redrawOnResize:false // see next section
           // ,setCell: timesheet.setCell
           ,setData: setData
           // ,setColumn: timesheet.setColumn
           // ,clear: timesheet.clear
           // ,remove: timesheet.remove
           ,canFocus: false
       });

       
       return component;
       
       
   }});

       
      // function setShifts(data) {
      //     log.d('Fetched shifts and they are:', data.shifts);
      //     // personForm.setValue('person', data.person._id);
      //     // locationForm.setValue('location', data.location._id);
      // }
