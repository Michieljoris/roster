//customize:
//starthour, endhour, resolution, openingview
//collapsible left side bar



Ext.define(
    'Shifts.FullCalendar', {
	
	constructor : function() {
	    this.calendarStore = Ext.create('AM.store.Calendars');
	    this.eventStore = Ext.create('AM.store.Shifts');
	    // console.log(this.calendarStore);
	    Ext.tempes=this.eventStore;	    
	    // Ext.create('Ext.container.Viewport', {
			   Ext.create('Ext.panel.Panel', {
			   width: 800,
			   height: 500,
			   // renderTo: Ext.getBody(),
			   renderTo: 'myid',
			   layout: 'border',
			   items: [
			       // {
			       //     id: 'app-header',
			       //     region: 'north',
			       //     height: 0,
			       //     border: false,
			       //     contentEl: 'app-header-content'
			       // },
			       {
				   id: 'app-center',
				   title: '...', // will be updated to the current view's date range
				   region: 'center',
				   layout: 'border',
				   listeners: {
				       'afterrender': function(){
					   Ext.getCmp('app-center').header.addCls('app-center-header');
				       }
				   },
				   items: [{   id:'app-west',
					       region: 'west',
					       width: 179,
					       border: false,
					       items: [{
							   xtype: 'datepicker',
							   id: 'app-nav-picker',
							   cls: 'ext-cal-nav-picker',
							   listeners: {
							       'select': {
								   fn: function(dp, dt){
								       Ext.getCmp('app-calendar').setStartDate(dt);
								   },
								   scope: this
							       }
							   }
						       }
						       ,{
						       	   xtype: 'extensible.calendarlist',
							   title: 'People and events',
						       	   store: this.calendarStore,
						       	   border: false,
						       	   width: 178
						       }
						      ]
					   }
					   ,{  xtype: 'extensible.calendarpanel'
					       ,eventStore: this.eventStore,
					       calendarStore: this.calendarStore,
					       border: false,
					       id:'app-calendar',
					       region: 'center',
					       recurrence: true,

					       activeItem: 1, // month view
					       
					       // Any generic view options that should be applied to all sub views:
					       viewConfig: {
					   	   //enableFx: false,
					   	   //ddIncrement: 10, //only applies to DayView and subclasses, but convenient to put it here
					   	   //viewStartHour: 6,
					   	   //viewEndHour: 18,
					   	   //minEventDisplayMinutes: 15
					   	   showTime: false
					       },
					       
					       // View options specific to a certain view (if the same options exist in viewConfig
					       // they will be overridden by the view-specific config):
					       monthViewCfg: {
					   	   showHeader: true,
					   	   showWeekLinks: true,
					   	   showWeekNumbers: true
					       },
					       
					       multiWeekViewCfg: {
					   	   weekCount: 2
					       },
					       
					       // Some optional CalendarPanel configs to experiment with:
					       //readOnly: true,
					       //showDayView: false,
					       //showMultiDayView: true,
					       //showWeekView: false,
					       //showMultiWeekView: false,
					       //showMonthView: false,
					       //showNavBar: false,
					       //showTodayText: false,
					       //showTime: false,
					       //editModal: true,
					       //enableEditDetails: false,
					       //title: 'My Calendar', // the header of the calendar, could be a subtitle for the app
					       
					       listeners: {
					   	   'eventclick': {
					   	       fn: function(vw, rec, el){
					   		   // console.log("eventclick");
					   		   this.clearMsg();
					   		   // return false;
					   	       },
					   	       scope: this
					   	   },
					   	   'eventover': function(vw, rec, el){
					   	       // console.log('Entered evt rec='+rec.data[Extensible.calendar.data.EventMappings.CalendarId.name]+', view='+ vw.id +', el='+el.id);
					   	   },
					   	   'eventout': function(vw, rec, el){
					   	       // console.log('Leaving evt rec='+rec.data[Extensible.calendar.data.EventMappings.CalendarId.name]+', view='+ vw.id +', el='+el.id);
					   	   },
					   	   'eventadd': {
					   	       fn: function(cp, rec){
					   		   this.showMsg('Event '+ rec.data[Extensible.calendar.data.EventMappings.CalendarId.name] +' was added');
					   	       },
					   	       scope: this
					   	   },
					   	   'eventupdate': {
					   	       fn: function(cp, rec){
					   		   console.log("eventupdate");
					   		   this.showMsg('Event '+ rec.data[Extensible.calendar.data.EventMappings.CalendarId.name] +' was updated');
					   	       },
					   	       scope: this
					   	   },
					   	   'eventcancel': {
					   	       fn: function(cp, rec){
					   		   // edit canceled
					   	       },
					   	       scope: this
					   	   },
					   	   'viewchange': {
					   	       fn: function(p, vw, dateInfo){
					   		   if(dateInfo){
					   		       this.updateTitle(dateInfo.viewStart, dateInfo.viewEnd);
					   		   }
					   	       },
					   	       scope: this
					   	   },
					   	   'dayclick': {
					   	       fn: function(vw, dt, ad, el){
					   		   this.clearMsg();
					   		   // console.log("Dayclick");
					   		   // console.log(vw);
					   		   // console.log(dt);
					   		   // console.log(ad);
					   		   // console.log(el);
							   
					   		   // return false;
					   	       },
					   	       scope: this
					   	   },
					   	   'rangeselect': {
					   	       fn: function(vw, dates, onComplete){
					   		   this.clearMsg();
					   	       },
					   	       scope: this
					   	   },
					   	   'eventcopy': {
					   	       fn: function(vw, rec){
					   		   this.onEventCopyOrMove(rec, 'copy');
					   	       },
					   	       scope: this
					   	   },
					   	   'eventmove': {
					   	       fn: function(vw, rec){
					   		   this.onEventCopyOrMove(rec, 'move');
					   	       },
					   	       scope: this
					   	   },
					   	   'eventresize': {
					   	       fn: function(vw, rec){
					   		   rec.commit();
					   		   this.showMsg('Event '+ rec.data[Extensible.calendar.data.EventMappings.CalendarId.name] +' was updated');
					   	       },
					   	       scope: this
					   	   },
					   	   'eventdelete': {
					   	       fn: function(win, rec){
					   		   this.eventStore.remove(rec);
					   		   this.showMsg('Event '+ rec.data[Extensible.calendar.data.EventMappings.CalendarId.name] +' was deleted');
					   	       },
					   	       scope: this
					   	   },
					   	   'initdrag': {
					   	       fn: function(vw){
					   		   // do something when drag starts
					   	       },
					   	       scope: this
					   	   }
					       }
					    }
					  ]
			       }]
		       });
	},
	
	// The CalendarPanel itself supports the standard Panel title config, but that title
	// only spans the calendar views.  For a title that spans the entire width of the app
	// we added a title to the layout's outer center region that is app-specific. This code
	// updates that outer title based on the currently-selected view range anytime the view changes.
	updateTitle: function(startDt, endDt){
	    var p = Ext.getCmp('app-center'),
	    fmt = Ext.Date.format;
	    
	    if(Ext.Date.clearTime(startDt).getTime() === Ext.Date.clearTime(endDt).getTime()){
		p.setTitle(fmt(startDt, 'F j, Y'));
	    }
	    else if(startDt.getFullYear() === endDt.getFullYear()){
		if(startDt.getMonth() === endDt.getMonth()){
		    p.setTitle(fmt(startDt, 'F j') + ' - ' + fmt(endDt, 'j, Y'));
		}
		else{
		    p.setTitle(fmt(startDt, 'F j') + ' - ' + fmt(endDt, 'F j, Y'));
		}
	    }
	    else{
		p.setTitle(fmt(startDt, 'F j, Y') + ' - ' + fmt(endDt, 'F j, Y'));
	    }
	},
	
	// Handle event moves or copies generically
	onEventCopyOrMove: function(rec, mode) {
	    var mappings = Extensible.calendar.data.EventMappings,
	    time = rec.data[mappings.IsAllDay.name] ? '' : ' \\a\\t g:i a',
	    action = mode === 'copy' ? 'copied' : 'moved';
	    
	    rec.commit();
	    
	    this.showMsg('Event '+ rec.data[mappings.Title.name] +' was ' + action + ' to '+
			 Ext.Date.format(rec.data[mappings.StartDate.name], ('F jS'+time)));
	},
	
	// This is an application-specific way to communicate CalendarPanel event messages back to the user.
	// This could be replaced with a function to do "toast" style messages, growl messages, etc. This will
	// vary based on application requirements, which is why it's not baked into the CalendarPanel.
	showMsg: function(msg){
	    console.log(msg);
	    // Ext.fly('app-msg').update(msg).removeCls('x-hidden');
	    
	},
	
	clearMsg: function(){
	    // Ext.fly('app-msg').update('').addCls('x-hidden');
	}
    });