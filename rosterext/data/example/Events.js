/*!
 * Extensible 1.6.0-b1
 * Copyright(c) 2010-2012 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
Ext.define('data.example.Events', {
    constructor :  function() {
        var today = Ext.Date.clearTime(new Date()),
            makeDate = function(d, h, m, s){
                d = d * 86400;
                h = (h || 0) * 3600;
                m = (m || 0) * 60;
                s = (s || 0);
                return Ext.Date.add(today, Ext.Date.SECOND, d + h + m + s);
            };
            
        return {
            "evts" : [{
                "id"    : 1001,
                "cid"   : 1,
                "start" : makeDate(-20, 10),
                "end"   : makeDate(-10, 15),
                "notes" : "Have fun"
            }
// , {
//                 "id"    : 1002,
//                 "cid"   : 2,
//                 "start" : makeDate(0, 11, 30),
//                 "end"   : makeDate(0, 13),
//                 "loc"   : "Chuy's!",
//                 "notes" : "Order the queso"
//             },{
//                 "id"    : 1003,
//                 "cid"   : 3,
//                 "notes" : "Project due",
//                 "start" : makeDate(0, 15),
//                 "end"   : makeDate(0, 15)
//             },{
//                 "id"    : 1004,
//                 "cid"   : 1,
//                 "start" : today,
//                 "end"   : today,
//                 "notes" : "Need to get a gift"
//             },{
//                 "id"    : 1005,
//                 "cid"   : 2,
//                 "notes" : "A long one...",
//                 "start" : makeDate(-12),
//                 "end"   : makeDate(10, 0, 0, -1)
//             },{
//                 "id"    : 1006,
//                 "cid"   : 3,
//                 "notes" : "School holiday",
//                 "start" : makeDate(5),
//                 "end"   : makeDate(7, 0, 0, -1)
//             },{
//                 "id"    : 1007,
//                 "cid"   : 1,
//                 "notes" : "Haircut",
//                 "start" : makeDate(0, 9),
//                 "end"   : makeDate(0, 9, 30)
//             },{
//                 "id"    : 1008,
//                 "cid"   : 3,
//                 "notes" : "An old event",
//                 "start" : makeDate(-30),
//                 "end"   : makeDate(-28)
//             },{
//                 "id"    : 1009,
//                 "cid"   : 2,
//                 "notes" : "Board meeting",
//                 "start" : makeDate(-2, 13),
//                 "end"   : makeDate(-2, 18),
//                 "loc"   : "ABC Inc."
//             },{
//                 "id"    : 1012,
//                 "cid"   : 4,
//                 "notes" : "Gina's basketball tournament",
//                 "start" : makeDate(8, 8),
//                 "end"   : makeDate(10, 17)
//             },{
//                 "id"    : 1013,
//                 "cid"   : 4,
//                 "notes" : "Toby's soccer game",
//                 "start" : makeDate(5, 10),
//                 "end"   : makeDate(5, 12)
            // }
]
        };
    }
});
