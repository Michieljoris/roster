/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/


define
({ load: [ 'views/extcalendar/app.js'],
    // inject: ['views/timesheet/multicap_ww_timesheet_raphael'
    //         // ,'views/timesheet/multicap_2_timesheet_raphael',
    //         ,'views/timesheet/fetchTimesheetShifts'
    //         ,'views/timesheet/calculateTimesheet'],
   factory: function() {
       "use strict";
       var log = logger('isc_extCalendar');
       
        
       var component = isc.defineClass("isc_extCalendar", "Canvas");
       isc.isc_extCalendar.addProperties({
           // write out a div with a known ID
           getInnerHTML : function () {
               // return "<div style='width:100%;height:100%' ID='" + 
               return "<div  ID='" + 
                   "extCalendarId" + "'></div>";
           },
           // call superclass method to draw, then have
           // timesheet_canvas replace the textarea we wrote out with
           // the CKEditor widget
           draw : function () {
               if (!this.readyToDraw()) return this;
               this.Super("draw", arguments);
               // timesheet.draw("timesheet1");
               return this;
           }
           ,redrawOnResize:false // see next section
           ,canFocus: false
           
       });

       return component;
   }});