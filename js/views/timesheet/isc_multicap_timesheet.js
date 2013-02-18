/*global SheetClip:false $:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:20 maxlen:190 devel:true*/


define
({ inject: ['views/timesheet/multicap_timesheet_casual_raphael'
            ,'views/timesheet/multicap_timesheet_contract_raphael'
            ,'views/timesheet/fetchTimesheetShifts'
            // ,'views/timesheet/calculateTimesheet',
           ],
   factory: function(casualTimesheet, contractTimesheet , fetchShifts) {
       "use strict";
       var log = logger('timesheet component');
       
       
       var  timesheet;
       
       function setData(state) {
           log.d('WHAT IS STATE?', state);
           fetchShifts(state.person, state.location, state.fortnight, process);
       }
       
       
       function process(data) {
           log.d('IN PROCESS');
           var person = data.person;
           function showSheet(aTimesheet) {
               timesheet = aTimesheet;
               if (!timesheet.isDrawn())
                   timesheet.draw();
               timesheet.setData(data);
               timesheet.setVisibility('inherit');
           }
           
           // if (!clipped) zclip();
           
           switch (person.status) {
             case 'casual':
               if (timesheet !== sheets.casual)  
                   if (timesheet) timesheet.setVisibility('hidden');   
               showSheet(sheets.casual);
               break;
             case 'part time': 
             case 'permanent':
               if (timesheet !== sheets.contract)   
                   if (timesheet) timesheet.setVisibility('hidden');   
               showSheet(sheets.contract);
               break;
           default:
               console.error('Person does not have status', person);
               alert('Is this person casual or on contract? ' + person.name);
               return;
           }
           log.d("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
               
       }
       
       
       function printDiv(type)
       {
           log.d('TYPE',type);
           var divToPrint=document.getElementById('timesheet' + type);
           var newWin= window.open("");
           newWin.document.write(divToPrint.outerHTML);
           newWin.print();
           newWin.close();
       }
       
        
       isc.defineClass("Multicap_Timesheet", "Canvas");
       isc.Multicap_Timesheet.addProperties({
           // write out a div with a known ID
           getInnerHTML : function () {
               // return "<div style='width:100%;height:100%' ID='" + 
               return "<div  ID='" + 
                   "timesheet" + this.timesheet.type +  "'></div>";
                   // "timesheet" + '' +  "'></div>";
           },
           // call superclass method to draw, then have
           // timesheet canvas draw itself
           draw : function () {
               log.d('drawing............................');
               if (!this.readyToDraw()) return this;
               this.Super("draw", arguments);
               this.timesheet.draw("timesheet" + this.timesheet.type);
               // this.timesheet.draw("timesheet" );
               return this;
           }
           ,redrawOnResize:false // see next section
           // ,setCell: timesheet.setCell
           ,setData: function() {
               this.timesheet.setData.apply(this, arguments);   
           }
           ,remove: function() {
               this.timesheet.remove() ;
           }
           ,setColumn: function () {
               this.timesheet.setColumn.apply(this, arguments);
           }
           // ,clear: timesheet.clear
           ,canFocus: false
           ,print: function() {
               printDiv(this.timesheet.type);
           }
           ,saveAsExcel: function () {
               this.timesheet.exportToExcel.apply(this, arguments);   
           }
           
       });
       
       var sheets = {};
       
       function createComponent(ts) {
           var component = isc.Multicap_Timesheet.create({
               ID: 'timesheet' + ts.type,
               timesheet: ts,
               overflow:'auto',
               showResizeBar: false,
               padding: 35
               ,visibility: 'hidden'
           });
           sheets[ts.type] = component;
       }
       
       createComponent(casualTimesheet);
       createComponent(contractTimesheet);

       function createTimesheets() {
           return {
               setData: setData
               ,print: function() {
                   if (timesheet) timesheet.print();
               }
               ,saveAsExcel: function() {
                   timesheet.saveAsExcel.apply(timesheet, arguments);
               }
               ,getSheets: function() {
                   var sheetsLayout = isc.VLayout.create({
                       members: Object.keys(sheets).map(function(s) {
                           return sheets[s];
                       })
                   });
                   return sheetsLayout;
               }
           };
       }

       return {
           create: createTimesheets
       };
       
   }});
