Ext.define(
    'AM.view.shift.Calendar', {
	
	extend: 'Shifts.FullCalendar'
	,alias: 'widget.shiftcalendar'
	
	,title: 'All shifts'
	,store: ['Calendars', 'Shifts']
	});
