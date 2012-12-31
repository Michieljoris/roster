/*global  Raphael:false  define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:190 devel:true*/


       var portWidth = 950
       ,portHeight = 660

       ,fontSize = 11
       ,labelBoxWidth = 175
       ,totalBoxWidth = 85 
       ,topRows = 4
       ,gridColumns =14 
           ,gridRows = 27
           ,bottomRows = 4
           ,rows = topRows + gridRows + bottomRows
       ,gxs = Math.floor((portWidth-labelBoxWidth-totalBoxWidth)/gridColumns)
       ,ys = Math.floor(portHeight/rows)
       ,paper = Raphael(0,0,portWidth, portHeight)
       ,title = 'EMPLOYEE TIMESHEET - DISABILITY EMPLOYEE'
       ,labels = ['*DAY', '*DATE', '*COST CENTRE', 'START', 'FINISH', 'START', 'FINISH', 'START', 'FINISH',  
	          '*TOTAL HOURS WORKED', 'EARLY (6-7.30)', 'ORD (7.30-19.30)', 'LATE (19.30-22.00M)', 
	          'WEEKEND T1.5', 'SICK LEAVE', 'ANNUAL LEAVE', 'LONG SERVICE LEAVE', 'OTHER LEAVE (specify)', 
	          'PUBLIC HOLIDAY ORD', 'OVERTIME T1.5', 'OVERTIME T2', 'PUBLIC HOL WORK PERM 1.5', 'PUBLIC HOL WORK 2.5', 
	          '*SLEEP OVER 8 HRS', '*AWAY FROM BASE ALLOW', '*ADMIN HOURS USED', '*DISTURBED SLEEP HRS'
                 ]
       ,line1 = ['EMPLOYEE NAME:', '', 'EMPLOYEE PAYROLL NUMBER:', '', 'CONTACT PHONE:', '' ]
       ,data1 = {name : 10, number : 57, phone: 80 }
       ,data2 = {fulltime:6.5, parttime:15, casual:21, dsw: 35, dsw2:58, ending:75}
       ,line1Pos = [0,data1.name, 40, data1.number, 70, data1.phone, 100] 
       ,line2 = [ 'FULLTIME:', '', 'PART TIME:','', 'CASUAL:','', 'DSW CA LEVEL:','', 'ALTERNATIVE DSW CA LEVEL:','', 'PERIOD ENDING:','']
       ,line2Pos = [0,data2.fulltime, 8, data2.parttime, 16, data2.casual, 25, data2.dsw, 40, data2.dsw2, 65, data2.ending, 100] 

       ,employeeSign = ['EMPLOYEE"S SIGNATURE:_____________________________________________________  DATE:_____________']
       ,managerSign =  ['MANAGER"S SIGNATURE:______________________________________________________  DATE:_____________']
       // ,line5 = 'PLEASE NOTE ALL HOURS TO BE IN 24 HOUR TIME'
       ,days = ['SAT', 'SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI' ]
       ,totalHours = 'TOTAL HOURS'
       ,enteredBy = 'ENTERED BY:'
       ,enteredByDate = 'DATE:'
       ;
           var topBox = {
               x:portWidth/2 - 200,
               y:0,
               w:400,
               h:2*ys
           };
       text(title, topBox, {}, { size: 4, weight:'bold'});
       paper.rect(topBox.x, topBox.y, topBox.w, topBox.h);

       function drawTopLines() {
           var unit = Math.round(portWidth / 100);
           for (var i = 0; i< line1.length; i++) {
               text(line1[i], { x: line1Pos[i] * unit, y : ys *2, h: ys*1, w: line1Pos[i+1]* unit },{align: 'start'}, {weight: 'bold'});
           }
           for (i = 0; i< line2.length; i++) {
               text(line2[i], {x: line2Pos[i] * unit, y : ys *3, h: ys*1, w: line2Pos[i+1]* unit },{align: 'start'}, {weight: 'normal'});
           }
           return function(data, value) {
               if (data1[data]) {
                   text(value, { x: data1[data] * unit, y : ys *2, h: ys*1, w: 999 },{align: 'start'}, {weight: 'normal'});
               } 
               else if (data2[data]) {
                   text(value, { x: data2[data] * unit, y : ys *3, h: ys*1, w: 999 },{align: 'start'}, {weight: 'norma l'});
               } 
           };
       }
       var setData = drawTopLines();

       function drawHLine(x,y,l) {
           paper.path('M' + x + ' ' + y + 'H' + (x+l)).attr('fill', 'black');
       }
       function drawVLine(x,y,l) {
           paper.path('M' + x + ' ' + y + 'V' + (y+l)).attr('fill', 'black');
       }

       function drawMatrix(x, y, w, h, nColumn, nRow) {
           var xs = Math.floor(w/nColumn);
           w = xs * nColumn; 
           h = ys * nRow;
           var acc = x;
           for (var i = 0; i <= nColumn; i++) {
               drawVLine(acc  , y, h);
               acc += xs;
           } 
           acc = y;
           for (i = 0; i <= nRow; i++) {
               drawHLine(x, acc, w);
               acc += ys;
           } 
       } 

       function text(str, box, al, attr) {
           //align is a string with start or end, top or bottom ,  or combination, default is middle
           //attr sets font, size (relative to fontSize), weight:
           //normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit 
           var x,y; 
           al = al ? al : {};  
           attr = attr ? attr : {};  
           var padding = al.padding ? al.padding : 2;
           var size = attr.size ? attr.size : 0;
           size = fontSize + size;
           var font  = attr.font ?  attr.font : 'Courier';
           var weight = attr.weight ? attr.weight : 'normal';
  
           var align = al.align ? al.align : 'middle';
           var h_align = align.match('start') ? 'start': align.match('end') ? 'end': 'middle';
           var v_align = align.match('top') ? 'top': align.match('bottom') ? 'bottom': 'middle';
           switch (h_align) {
             case 'start' : x = box.x + padding; break;
             case 'middle' : x = box.x + box.w/2;  break;
             case 'end' : x = box.x + box.w - padding; break;
           }
           switch (v_align) {
             case 'top' :  y = box.y + size/2 + padding; break;
             case 'middle' : y = box.y + box.h/2 + 2;  break;
             case 'bottom' : y = box.y + box.h - size/2 - padding; break;
           }
           paper.text(x, y, str).attr({'font-family': font, 'font-size': size, 'font-weight': weight,  
			               'height': 200, 'text-anchor': h_align});
       }

       function grid(str, r, c, al, attr) {
           text(str, 
	        { x: labelBoxWidth + c * gxs ,
	          y: (topRows + r) * ys,
	          w: gxs,
	          h: ys },al, attr); 
       }

       //grids
       drawMatrix(labelBoxWidth, topRows * ys, 
	          portWidth - labelBoxWidth - totalBoxWidth,   ys * gridRows,
	          gridColumns, gridRows);
       drawMatrix(0, topRows * ys,   labelBoxWidth, ys * gridRows, 1, gridRows);
       drawMatrix(labelBoxWidth + gxs * gridColumns, topRows * ys, totalBoxWidth, ys * gridRows, 1, gridRows);
       //thick borders:
       paper.rect(1, topRows * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns , gridRows * ys ).attr({'stroke-width': 2});
       paper.rect(1, topRows * ys  , labelBoxWidth + gxs * gridColumns , gridRows * ys ).attr({'stroke-width':2});
       paper.rect(1, topRows * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 1) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 2) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 9) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 23) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 24) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 25) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       paper.rect(1, (topRows + 26) * ys  , labelBoxWidth + totalBoxWidth + gxs * gridColumns ,  ys ).attr({'stroke-width':2});
       //grey out some boxes
       paper.rect(labelBoxWidth + gxs * gridColumns, topRows * ys  , totalBoxWidth, 8 * ys ).attr('fill', 'grey');
       paper.rect(labelBoxWidth + gxs * 2, (topRows + 13) * ys  , 5 * gxs,  ys ).attr('fill', 'grey');
       paper.rect(labelBoxWidth + gxs * 9, (topRows + 13) * ys  , 5 * gxs,  ys ).attr('fill', 'grey');

       text(totalHours,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 8)* ys ,w:totalBoxWidth,h:ys},
            {align: 'middle'}, {weight:'bold'});
       text(enteredBy ,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 24)* ys ,w:totalBoxWidth,h:ys},
            {align: 'start'}, {weight:'bold'});
       text(enteredByDate,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 26)* ys ,w:totalBoxWidth,h:ys},
            {align: 'start'}, {weight:'bold'});
       //lefthand labels
       var n = 0;
       labels.forEach(
           function(l) {
               var weight = 'normal';
               var label;
               if (labels[n].charAt(0) === '*')  {
                   label = labels[n].slice(1);
                   weight = 'bold';
               }
               else label = labels[n];
               text(label, 
	            {x:0, y: (topRows + n)*ys,
	             w: labelBoxWidth, h: ys},
	            { align: 'end' } , {weight: weight});
               n++; 
           });
       //days in toprow
       n = 0;
       days.forEach(
           function(d) {
               grid(days[n], 0, n, {}, { weight: 'bold'});
               grid(days[n], 0, n + 7, {}, { weight: 'bold'});
               n++; 
           });
       //bottom
       text(employeeSign, 
            {x:0, y: (topRows + gridRows)*ys,
             w: labelBoxWidth + totalBoxWidth + gridColumns * gxs, h: ys*2},
            { align: 'start bottom' } , {weight: 'normal'});
       text(managerSign, 
            {x:0, y: (topRows + gridRows + 2)*ys,
             w: labelBoxWidth + totalBoxWidth + gridColumns * gxs, h: ys*2},
            { align: 'start' } , {weight: 'normal'});
       //fill a grid cell with a value
       grid('2200', 5,6);
       grid('2400', 6,6);
       //set a field with data
       setData('name', 'Simone Ivy');
       //draws a rect around the viewport/canvas
       // paper.rect(0,0, portWidth, portHeight).attr("fill", "#00"); 
