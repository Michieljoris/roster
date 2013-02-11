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
               //call render on the panel of the calendar...  not
               //wired up. Also is it the script injecting of extjs a
               //good thing? Maybe we shold put the scripts directly
               //in index.html. We're just loading app.js here. But at
               //the moment if you render doing
               //mycal.render('extCalenderId') in the console after
               //opening tthe extcalendar view the dialogs are hiding
               //behind the calendar... But it -is- showing up!! Also
               //the css is interfering. In the ext-all-debug.css you
               //need to comment out some of the resets in the
               //beginning of the file. But then the calendar gets
               //messed up a little bit. Can't win can we..
               
               //extCalendar.render("extCalendarId")
               
               return this;
           }
           ,redrawOnResize:false // see next section
           ,canFocus: false
           
       });

       return component;
   }});