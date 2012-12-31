/*!
 * Extensible 1.6.0-b1
 * Copyright(c) 2010-2012 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        // "Extensible": "lib/",
        "Extensible.data": "data/"
    }
});

Ext.require([
    'Extensible.calendar.data.MemoryEventStore',
    'Extensible.calendar.CalendarPanel',
    'Extensible.data.Events'
]);

// Ext.application({
//     name: 'HelloExt',
//     launch: function() {
//         Ext.create('Ext.container.Viewport', {
//             layout: 'fit',
//             items: [
//                 {
//                     title: 'Hello Ext',
//                     html : 'Hello! Welcome to Ext JS.'
//                 }
//             ]
//         });
//     }
// }); 
    Ext.create('TestApp.App');

Ext.onReady(
    function() {
	var eventStore = Ext.create('Extensible.calendar.data.MemoryEventStore', {
					// defined in ../data/Events.js
					data: Ext.create('Extensible.data.Events')
				    });
	
	//
	// example 1: simplest possible stand-alone configuration
	//
	Ext.create('Extensible.calendar.CalendarPanel', {
		       eventStore: eventStore,
		       renderTo: 'simple',
		       title: 'Basic Calendar',
		       showMultiDayView: true,		   
		       width: "100%",
		       height: 500,
		       activeItem: 2, // default view 
		       editModal:true,
		       editViewCfg: {
			   titleTextAdd:"SHIFT"			   
		       },
		       viewCfg: {
			   
		       },
		       dayViewCfg: {
			   ddCreateEventText: 'Create shift for {0}',
			   ddMoveEventText: 'Move shift to {0}',
			   ddCopyEventText: 'Copy shift to {0}',
			   ddResizeEventText: 'Update shift to {0}',
			   // Hide the half-hour marker line
			   showHourSeparator: false,
			   // Start the view at 6:00
			   viewStartHour: 6,
			   // End the view at 8:00pm / 20:00
			   viewEndHour: 22,
			   // Default the scroll position on load to 8:00 if the body is overflowed
			   scrollStartHour: 8,
			   // Customize the hour (and event) heights. See the docs for details on setting this.
			   // This example will be double-height (the default is 42)
			   hourHeight: 30,
			   // Allow drag-drop, drag-create and resize of events in 10-minute increments
			   ddIncrement: 10,
			   // Since the hour blocks are double-height, we can shorten the minimum event display 
			   // height to match the ddIncrement
			   minEventDisplayMinutes: 20,
			   showTodayText:false,
			   showTime:false
			   
		       },
		       multiDayCfg: {
			   startDayIsStatic: true
		       },
		       weekViewCfg: {
			   ddCreateEventText: 'Create shift for {0}',
			   ddMoveEventText: 'Move shift to {0}',
			   ddCopyEventText: 'Copy shift to {0}',
			   ddResizeEventText: 'Update shift to {0}',
			   dayCount: 7, // The number of days to display in the view (defaults to 7)
			   startDay: 6 //Monday is day 1
			   
		       },
		       
		       multiWeekViewCfg: {
			   weekCount: 3
		       },
		       monthViewCfg: {
			   ddCreateEventText: 'Create shift for {0}',
			   ddMoveEventText: 'Move shift to {0}',
			   ddCopyEventText: 'Copy shift to {0}',
			   ddResizeEventText: 'Update shift to {0}'
			   }
		   });
	
	//
	// example 2: shows off some common Ext.Panel configs as well as a 
	// few extra CalendarPanel-specific configs + a calendar store
	//
	Ext.create('Extensible.calendar.CalendarPanel', {
		       id: 'cal-example2',
		       eventStore: eventStore,
		       renderTo: 'panel',
		       title: 'Calendar with Panel Configs',
		       activeItem: 1, // default to week view
		       width: 700,
		       height: 500,
		       
		       // Standard Ext.Panel configs:
		       frame: true,
		       collapsible: true,
		       bbar: [{text: 'A Button', handler: function(){
				   Ext.Msg.alert('Button', 'I work!');
			       }}],
		       
		       listeners: {
			   // A simple example showing how to handle a custom calendar event to
            // override default behavior. See the docs for all available events.
            'eventclick': {
                fn: function(panel, rec, el){
                    // override the default edit handling
                    //Ext.Msg.alert('App Click', 'Editing: ' + rec.data.Title);
                    
                    // return false to tell the CalendarPanel that we've handled the click and it 
                    // should ignore it (e.g., do not show the default edit window)
                    //return false;
                },
                scope: this
            }
        }
    });
});
