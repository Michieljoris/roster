/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/


define
({ inject: ['timesheet_canvas'],
   factory: function(timesheet_canvas) {
       "use strict";
        
       isc.defineClass("MyComponent", "Canvas");
       isc.MyComponent.addProperties({
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
               timesheet_canvas.draw(this.getID() + "_timesheet");
               return this;
           }
           ,redrawOnResize:false // see next section
       });


       isc.HLayout.create({
           ID: 'layout',
           width: "100%",
           height: "100%",
           members: [
               isc.Label.create({
                   contents: "Navigation",
                   align: "center",
                   overflow: "hidden",
                   width: "30%",
                   showResizeBar: true,
                   border: "1px solid blue"
               }),
               isc.VLayout.create({
                   width: "70%",
                   members: [
                       isc.MyComponent.create({
                           ID: 'test',
                           overflow:'auto',
                           showResizeBar: true,
                           padding: 35
                           // align: "center",
                           // height: "70%",
                       }),
                       isc.Label.create({
                           contents: "Listing",
                           align: "center",
                           overflow: "hidden",
                           height: "30%",
                           border: "1px solid blue"
                       })
                   ]
               })
           ]
       });
       layout.draw();
       
       
   }});

       function printDiv()
       {
           var divToPrint=document.getElementById('test_timesheet');
           var newWin= window.open("");
           newWin.document.write(divToPrint.outerHTML);
           newWin.print();
           newWin.close();
       }
       
