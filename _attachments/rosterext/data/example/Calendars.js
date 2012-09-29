/*!
 * Extensible 1.6.0-b1
 * Copyright(c) 2010-2012 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
Ext.define('data.example.Calendars', {
    constructor: function() {
        return {
            "calendars" : [{
                "id"    : 1,
                "title" : "Peter",
                "color" : 2
            },{
                "id"    : 2,
                "title" : "Rosie",
                "color" : 22
            },{
                "id"    : 3,
                "title" : "Chris",
                "color" : 7
            },{
                "id"    : 4,
                "title" : "David",
                //"hidden" : true, // optionally init this calendar as hidden by default
                "color" : 26
            }]
        };
    }
});
