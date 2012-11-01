define
({inject: ['datasources', 'roster'],
  factory: function(pouchDS, roster) 
  {
      var observer;
      
      var calendar = isc.Calendar.create(
          {   ID: "isc_ShiftCalendar", 
	      dataSource: pouchDS, 
	      autoFetchData: true,
	      descriptionField: 'notes'
	      ,nameField: 'person'
              ,eventOverlapIdenticalStartTimes: true
              ,eventOverlap:false
              
	      // ,initialCriteria: { group:'shift'  }
	      // eventAdded: function(event) {
	      //   console.log("Event added", event);
	      // },
	      // eventChanged: function(event) {
	      //   console.log("Event changed", event);
	      // }
	      // ,eventClick: function(event, viewName) {
	      //   console.log("Event click", event, viewName);
	      //   event.group = 'shift';
	      //   return true;
	      // }
	      ,backgroundClick: function(startDate, endDate) {
	          console.log('New event',startDate.getUTCHours(), endDate.getUTCHours());
	          module.temp=startDate;
	          // isc.Dialog.create({
	          // 		      message : "Please choose whether to proceed",
	          // 		      icon:"[SKIN]ask.png",
	          // 		      buttons : [
	          // 			isc.Button.create({ title:"OK" }),
	          // 			isc.Button.create({ title:"Cancel" })
	          // 		      ],
	          // 		      buttonClick : function (button, index) {
	          // 			this.hide();
	          // 		      }
	          // 		    });
	  
	          calendar.addEvent(startDate, endDate, '1', 'notes', { group: 'shift', ad: false});
                  observer('calendar');
	          return false;
	      }
              ,notify: function() {
                  console.log('calendar is notified');
              }
              ,getState: function() {
                  return {};
              }
              ,setObserver: function(f) {
                  observer = f;
              }
              ,name: 'Calendar'
          }); 
      
      return calendar; 
      
  }});



