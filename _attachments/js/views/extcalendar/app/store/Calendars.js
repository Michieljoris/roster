Ext.define(
    'AM.store.Calendars', {
	extend: 'Extensible.calendar.data.MemoryCalendarStore'
	// ,model:'AM.model.Calendar'
	//,autoload: true
	,data: Ext.create('AM.data.Calendars')
    }
);

