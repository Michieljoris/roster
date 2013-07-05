/*global  xlsx:false logger:false Raphael:false  define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:70 maxlen:1190 devel:true*/

//This module basically draws a Multicap timesheet using raphael.js It
//has an API to set individual cells and data fields, set a column in
//one go or clear the whole sheet.

define
({ //load: ['js!lib/raphael-min.js'],
    inject: ['lib/clip', 
            'views/timesheet/calculateTimesheet'
    ],
    factory: function(clip, calc) {
        "use strict";
        var log = logger('raphaelcasual');
       
        var data = {
            props: {},
            grid: []
        };
       
        window.test = function() { return data; };
       
        //Dimensions:
        var portWidth = 950
        ,portHeight = 640
        ,aspectRatio = Math.sqrt(2)
        ,fontSize = 11
        ,labelBoxWidth = 200
        ,totalBoxWidth = 120 
        ,topRows = 4
        ,gridColumns =14 
        ,gridRows = 17
        ,bottomRows = 4
        ,rows = topRows + gridRows + bottomRows
        ,gxs = Math.floor((portWidth-labelBoxWidth-totalBoxWidth)/gridColumns)
        ,ys = Math.floor(portHeight/rows)
        ,topBox = {
            x:portWidth/2 - 200,
            y:0,
            w:450,
            h:2*ys
        }
       
        //Creation of canvas to draw on:
        // ,paper = new Raphael(0,0,portWidth, portHeight)
        ,paper
        ,element
        //Data to fill the timesheet with:
        ,title = 'TIMESHEET CASUAL EMPLOYEE - DISABILITY EMPLOYEE'
        ,rowMap = [
            { title: '*DAY', name: 'dayname' }
            ,{ title: '*DATE', name: 'date' }
            ,{ title: '*COST CENTRE', name: 'costCentre'  }
            ,{ title: 'START', name: 'start1'  }
            ,{ title: 'FINISH', name: 'finish1'  }
            ,{ title: 'START', name: 'start2' }
            ,{ title: 'FINISH', name: 'finish2'  }
            ,{ title: 'START', name: 'start3'  }
            ,{ title: 'FINISH', name: 'finish3' }
            ,{ title: '*TOTAL HOURS WORKED', name: 'totalHoursWorked' }
            // ,{ title: 'EARLY (6-7.30)', name: 'early' }
            ,{ title: 'ORDINARY (6.00-20.00) T1', name: 'ord' }
            // ,{ title: 'PENALTY (20.00-6.00) T1.15', name: 'penalty' }
            // ,{ title: 'WEEKEND (PERM) T1.6', name: 'weekend' }
            // ,{ title: 'SICK LEAVE', name: 'sickLeave' }
            // ,{ title: 'ANNUAL LEAVE', name: 'annualLeave' }
            // ,{ title: 'LONG SERVICE LEAVE', name: 'longServiceLeave' }
            // ,{ title: 'OTHER LEAVE (Please specify)', name: 'otherLeave' }
            ,{ title: 'PUBLIC HOLIDAY ORD T1', name: 'publicHolidayOrdinary' }
            ,{ title: 'PUBLIC HOLIDAY WORK T1.5', name: 'publicHolWorkPerm1p5' }
            // ,{ title: 'OVERTIME (<=2 hrs) T1.5', name: 'overtimeT1p5' }
            // ,{ title: 'OVERTIME (>2 hrs) T2', name: 'overtimeT2' }
            ,{ title: 'DISTURBED SLEEP (CASUAL) T1', name: 'disturbedSleepHoursT1' }
            // ,{ title: 'DISTURBED SLEEP (PERM) T2', name: 'disturbedSleepHoursT2' }
            // ,{ title: 'PUBLIC HOL WORK 2.5', name: 'publicHolWork2p5' }
            ,{ title: '*SLEEP OVER 8 HRS', name: 'sleepOver' }
            ,{ title: '*EXCURSION ALLOWANCE', name: 'awayFromBase' }
            // ,{ title: '*ADMIN HOURS USED', name: 'adminHoursUsed' }
            ,{ title: '*DISTURBED SLEEP HOURS', name: 'disturbedSleepHours' }
        ]
        ,fields = (function() { var obj = {};
                                rowMap.forEach(function(r,i) { r.row = i; obj[r.name] = r;});
                                return obj;
                              })()
        ,line1 = ['EMPLOYEE NAME:', '', 'EMPLOYEE PAYROLL NUMBER:', '', 'CONTACT PHONE:', '' ]
        ,data1 = {name : 10, payrollNumber : 52, phone: 77 }
        ,line1Pos = [0,data1.name, 35, data1.payrollNumber, 67, data1.phone, 100] 
        
        ,line2 = [ 'DSW EA LEVEL:','', 'HIGHER DUTIES LEVEL:','', 'PERIOD ENDING:','']
        ,data2 = { dswCALevel: 44.5, dsw2:62.3, ending:77}
        ,line2Pos = [ 35, data2.dsw, 48, data2.dsw2, 67, data2.ending, 102] 
        ,employeeSign = ['EMPLOYEE"S SIGNATURE:_____________________________________________________  DATE:_____________']
        ,managerSign =  ['MANAGER"S SIGNATURE:______________________________________________________  DATE:_____________']
        // ,line5 = 'PLEASE NOTE ALL HOURS TO BE IN 24 HOUR TIME'
        ,days = ['SAT', 'SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI' ]
        ,totalHours = 'TOTAL HOURS'
        ,enteredBy = 'ENTERED BY:'
        // ,enteredBy = ''
        ,enteredByDate = 'DATE:'
        // ,enteredByDate = ''
        ,dataCells = {}
        ,unit = Math.round(portWidth / 100);
       
        //##Help functions

        //Used in the API's draw that draw the complete timesheet
       
        //Print the 2 top lines
        function drawTopLines() {
            for (var i = 0; i< line1.length; i++) {
                text(line1[i],
                     { x: line1Pos[i] * unit, y : ys *2, h: ys*1, w: line1Pos[i+1]* unit },{align: 'start'},
                     {weight: 'bold'});
            }
            for (i = 0; i< line2.length; i++) {
                text(line2[i], {x: line2Pos[i] * unit, y : ys *3, h: ys*1, w: line2Pos[i+1]* unit },
                     {align: 'start'}, {weight: 'bold'});
            }
        }

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
            return paper.text(x, y, str).attr({'font-family': font, 'font-size': size, 'font-weight': weight,  
			                       'height': 200, 'text-anchor': h_align});
        }

        //Set a value in the grid/matrix
        function grid(str, r, c, al, attr) {
            text(str, 
	         { x: labelBoxWidth + c * gxs ,
	           y: (topRows + r) * ys,
	           w: gxs,
	           h: ys },al, attr); 
        }

        //#API
        function setFields(props) {
            log.d('in setFields in raphael contract', props);
            Object.keys(props).forEach(function(p) {
                setDataField(p, props[p]);
            });
        }
       
        /**
         * ## setData
         *
         * Set a data field (name, phone etc) to a value
         *
         * @param {string} data The name of the data field
         * @param {string} value The value to set the data field to
         */
        function setDataField(key, value) {
            data.props[key] = value;
            if (!value) value = '';
            var element;
            if (dataCells[key]) dataCells[key].remove();
            if (data1[key]) {
                element = text(value, { x: data1[key] * unit, y : ys *2, h: ys*1, w: 999 },{align: 'start'},
                               {weight: 'normal'});
            } 
            else if (data2[key]) {
                element = text(value, { x: data2[key] * unit, y : ys *3, h: ys*1, w: 999 },{align: 'start'},
                               {weight: 'norma l'});
            } 
            if (element) dataCells[key] = element;
            return element;
        }
       
        //##setCell
        //Set a cell with row r and column c to the value str.  Set the
        //alignment with the al string and any attributes with the attr
        //object
       
        //Align is a string with the value start or end, top or bottom , or
        //combination, default is middle. Attr sets font:, size: (relative
        //to fontSize), weight: normal | bold | bolder | lighter | 100
        //| 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit
        function setCell(value, r, c, al, attr) {
            //store data to export
            if (!data.grid[r]) data.grid[r] = [];
            data.grid[r][c + 1] = value;
            //paint it on the timesheet
            var cell = dataCells['' + r + c];
            if (cell) cell.remove();
            dataCells['' + r + c]  =
                text(value, 
	             { x: labelBoxWidth + c * gxs ,
	               y: (topRows + r) * ys,
	               w: gxs,
	               h: ys },al, attr); 
        }
       
        function setShiftTimes(shift, n, day) {
            n++;
            function pad(n) {
                if (n < 10) return '0' + n;
                else return '' + n;
            }
            var startStr = pad(shift.startDate.getHours()) + ':' +
                pad(shift.startDate.getMinutes());
            var finishStr = pad(shift.endDate.getHours()) + ':' +
                pad(shift.endDate.getMinutes());
            // log.d(startstr, finishStr, fields);
           
            setCell(startStr, fields['start' + n].row, day);
            setCell(finishStr, fields['finish' + n].row, day);
        }
       
        //##setColumn
        /* Set a day (0-13) to the values of the object column. See
         * rowMap for possible field names.
         * @param {number} day Between 0 and 13 for the days of the week
         * @param {object} column An object containing the values for the column
         */
       
        function setColumn(day, column) {
            // var vert = data.grid[day] = [];
            Object.keys(column).forEach(function(f) {
                if (fields[f]) {
                    // log.d('setting: ' + fields[f].name + ' to ' + column[f]);
                    setCell(column[f], fields[f].row, day);
                    // vert[fields[f].row] = column[f];
                }
            }); 
            var shifts = column.shifts;
            // var total = 0;
            
            if (shifts) {
                if (shifts.length > 3) {
                    log.e('Only room for 3 shifts per day!!!');   
                    alert('Warning: Can only display 3 shifts per day!!! Not all shifts have been listed for ' +
                          shifts[0].date.toLocaleDateString());
                    
                    // throw new Error('Only room for 3 shifts per day on this timesheet!!! Fix: ' +
                    //                 shifts[0].date.toLocaleDateString());
                }
                shifts.forEach(function (s, i) {
                    if (i<3) setShiftTimes(s, i, day);
                });
            }
           
           
        }
       
        //##clear
        //Clear the timesheet
        function clear() {
            initData();
            Object.keys(dataCells).forEach(function(c) {
                dataCells[c].remove(); 
            });
        }
        
       
        //##draw
        //Draw the timesheet, set element to DOM element or its
        //ID which is going to be a parent for drawing surface.
        function draw(anElement) {
            log.d('DRAWING CONTRACT');
            element = anElement;
            if (element) paper = new Raphael(element,portWidth, portHeight);
            else paper = new Raphael(0, 0 ,portWidth, portHeight);
            // window.mypaper = paper;
            // paper = new Raphael(0,0,portWidth, portHeight, function() {
            //     console.log('hello', arguments);
            // });
            text(title, topBox, {}, { size: 4, weight:'bold'});
            paper.rect(topBox.x, topBox.y, topBox.w, topBox.h);
            drawTopLines();

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
            // paper.rect(labelBoxWidth + gxs * 2, (topRows + 13) * ys  , 5 * gxs,  ys ).attr('fill', 'grey');
            // paper.rect(labelBoxWidth + gxs * 9, (topRows + 13) * ys  , 5 * gxs,  ys ).attr('fill', 'grey');

            text(totalHours,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 8)* ys ,w:totalBoxWidth,h:ys},
                 {align: 'middle'}, {weight:'bold'});
            text(enteredBy ,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 24)* ys ,w:totalBoxWidth,h:ys},
                 {align: 'start'}, {weight:'bold'});
            text(enteredByDate,{x:labelBoxWidth + gxs * gridColumns,y:(topRows + 26)* ys ,w:totalBoxWidth,h:ys},
                 {align: 'start'}, {weight:'bold'});
            //lefthand labels
            rowMap.forEach(
                function(r, n) {
                    var weight = 'normal';
                    var label;
                    if (r.title.charAt(0) === '*')  {
                        label = r.title.slice(1);
                        weight = 'bold';
                    }
                    else label = r.title;
                    text(label, 
	                 {x:0, y: (topRows + n)*ys,
	                  w: labelBoxWidth, h: ys},
	                 { align: 'end' } , {weight: weight});
                });
            //days in toprow
            days.forEach(
                function(d, n) {
                    grid(d, 0, n, {}, { weight: 'bold'});
                    grid(d, 0, n + 7, {}, { weight: 'bold'});
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
            // cont();
            // setFields({name: 'hello'});
            paper.image("images/multicap_logo.png", 820,0,120,60);
            // paper.text('Multicap', 820,0);
            
            // text("Multicap",
            //      {x:0, y: 0,
            //       w: 100, h: ys*2},
            //      { align: 'start' } , {size: 10, weight: 'bold'});
            return paper;
        }       
        
        
        function returnSheetClip() {
            return SheetClip.stringify(data.grid);   
            // return data.grid;   
        }
        
        function setData(someData) {
            clip('swcopy', returnSheetClip, function() {
               alert('Copied to system clipboard') ;
            });
            var fillData = someData;
            var person = fillData.person;
            var location = fillData.location;
            var shifts = fillData.shifts;
            var fortnight = fillData.fortnight;
            clear();
            log.pp('filling timesheet with data:', person, location, shifts);
            // log.d(timesheet);
            var fullName = '';
            if (person.firstName) fullName+= person.firstName;
            if (person.lastName) fullName+= ' ' + person.lastName;
            setFields({
                name: fullName
                ,payrollNumber: person.payrollNumber
                ,phone: person.phone
                ,dswCALevel: person.dswCALevel
                ,dsw2: person.higherDutiesLevel
                ,ending: fortnight.clone().addDays(13).toLocaleDateString()
            }); 
           
            try {
                switch(person.status) {
                  case 'permanent' : setFields({ permanent: 'X'}); break;
                  case 'part time' : setFields({ parttime: 'X'}); break;
                  case 'casual' : setFields({ casual: 'X'}); break;
                    // default: throw new Error("Alert:Person's status is not set (permanent, part time or casual): " + person.name);
                }
                calc.init(fortnight, person, location, shifts);
                for (var i=0; i<14; i++) {
                    log.pp(calc.getColumn(i));
                    setColumn( i, calc.getColumn(i));
                }
                setColumn(14, calc.getTotals());
            }
            catch (e) {
                var message = e.message;
                if (message.substr(0,5) === 'Alert')
                {  message = message.substr(6, message.length);
                   alert(message);
                }
                log.d(e, e.stack);
            }
            
            data.grid.forEach(function(r) {
                // log.pp(data.grid[r]);
                for (var i = 1; i < r.length; i++) {
                    if (!r[i]) r[i] = { value: '' };
                    else r[i] = { value: r[i] };
                }
               
            });
        }               
       
        //#resize
        //Resize the timesheet using either width or height or both.
        //If one is not given, the other is calculated using the
        //aspectRation
        function resize(dimensions) {
            if (dimensions.width) {
                portWidth = dimensions.width;
                portHeight = dimensions.height ?
                    dimensions.height : portWidth/aspectRatio;
            }
            else if (dimensions.height) {
                portHeight = dimensions.height;
                portWidth = portHeight*aspectRatio;
            }
            if (dimensions.fontSize) fontSize = dimensions.fontSize;
            paper.remove();
            gxs = Math.floor((portWidth-labelBoxWidth-totalBoxWidth)/gridColumns);
            ys = Math.floor(portHeight/rows);
            topBox = {
                x:portWidth/2 - 200,
                y:0,
                w:400,
                h:2*ys
            };
            unit = Math.round(portWidth / 100);
            draw(element);
        }
       
        function initData () {
            data.props = {};
            rowMap.forEach(function(r, i) {
                data.grid[i] = [];
                data.grid[i][0] = r.title;
            });
            data.grid[0] = data.grid[0].concat(days).concat(days);
            data.grid[9][15] = totalHours;
        }
       
        function exportToExcel(creator, fileName) {
            log.d('In export',creator, fileName);
            // log.pp(data.grid);
           
            var file = {
                worksheets: [], // worksheets has one empty worksheet (array)
                creator: creator, created: new Date('8/16/2012'),
                lastModifiedBy: creator, modified: new Date(),
                activeWorksheet: 0
            };
            file.worksheets[0] = {};
            file.worksheets[0].data = data.grid;
            file.worksheets[0].name = data.props.name;
            var result = xlsx(file);
            var a = document.createElement('a');
            a.href = result.href();
            a.download = data.props.name + ' ' + fileName + '.xlsx';
            a.click();
        } 
        
        return {
            draw: draw,
            setCell: setCell,
            setData: setData,
            setColumn: setColumn,
            clear: clear,
            resize: resize,
            remove: function() { paper.remove(); },
            exportToExcel: exportToExcel,
            type: 'casual'
        };
    }});
