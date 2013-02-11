
Extensible.eventWindow='Shifts.view.shift.EventWindow';
Extensible.eventDetails='extensible.myeventeditform';


Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
	"Shifts" :"js/views/extcalendar/app"
	// "AM" :"app"
	// ,"AM" : "app"
        ,"Extensible": "lib/ext/extensible/src"
    }
});

Ext.require([
	,'Shifts.view.shift.EventWindow'
	,'Shifts.view.shift.EventDetails'
	,'Shifts.FullCalendar'	
	// ,'data.example.Calendars'	
	// ,'data.example.Events'	
	,'Extensible.calendar.CalendarPanel'	
	,'Extensible.calendar.gadget.CalendarListPanel'	
	,'Extensible.form.recurrence.Fieldset'
		
]);



Ext.application(
    {
	name: 'AM',
	appFolder: 'js/views/extcalendar/app',
	controllers: [
	    'Users'
	    // ,'Calendar'
	],	

	launch: function() {
	    console.log("launching");
	    
	    window.mycal = Ext.create('Shifts.FullCalendar');
           //  Ext.create('Ext.container.Viewport', 
	   // {
           //      layout: 'fit',
           //      items: [
           //          {
			
	    		// xtype: 'userlist'
			
			
	   		// xtype: 'extensible.calendarpanel'
			
	   		// ,calendarStore : Ext.create('AM.store.Calendars') 
	   		// ,eventStore : Ext.create('AM.store.Shifts')
	   		// ,border: false,
	   		// id:'app-calendar',
	   		// region: 'center',
	   		// activeItem: 3 // month view
	    		// Ext.create('Shifts.FullCalendar')
	    		// xtype: 'fullcalendar'
	    		// ,calendarStore : Ext.create('AM.store.Calendars')
	    		// ,eventStore : Ext.create('AM.store.Shifts')
	    		// border: false,
	    		// id:'app-calendar',
	    		// // region: 'center',
	    		// activeItem: 3 // month view
			
	    		// ,eventStore : Ext.create('AM.store.Shifts')
	    		// ,calendarStore : Ext.create('AM.store.Calendars')
	    		// xtype: 'shiftcalendar'
                    // }
                // ]
            // });
	    
	    
	}
	
    });



// Ext.onReady(function() {

//    console.log("constructing");
//     Ext.create('TestApp.App');
// });
