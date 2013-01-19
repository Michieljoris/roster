Ext.define('AM.model.Shift', {
	       extend: 'Ext.data.Model',
	       fields: [
		   'CalendarId',
		   'Duration',
		   'EndDate',
		   'EventId',
		   'IsAllDay',
		   'Location',
		   'Notes',
		   // 'OriginalEventId: ""
		   'REditMode',
		   'RInstanceStartDate',
		   'RRule',
		   // 'Reminder: ""
		   'StartDate',
		   'Title'
		   // 'Url'
	       ]	
	   });