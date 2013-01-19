/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/


define
({ inject: ['multicap_timesheet_raphael'],
   factory: function(timesheet) {
       "use strict";
        
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
           ,setCell: timesheet.setCell
           ,setData: timesheet.setData
           ,setColumn: timesheet.setColumn
           ,clear: timesheet.clear
           ,remove: timesheet.remove
       });

       
       return component;
       
       
   }});

       
