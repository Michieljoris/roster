/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/

define
({ inject: ['isc_components/multicap_timesheet'],
   factory: function(Timesheet) {
       "use strict";
       console.log('hello'); 
       var timesheet = Timesheet.create({
           ID: 'test',
           overflow:'auto',
           showResizeBar: true,
           padding: 35
           // align: "center",
           // height: "70%",
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
                       timesheet,
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
       console.log(timesheet);
       layout.draw();
       timesheet.setData('name', 'hello');

   }});

function printDiv()
{
    var divToPrint=document.getElementById('test_timesheet');
    var newWin= window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
}


