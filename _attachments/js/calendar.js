isc.Calendar.create(
    {   ID: "shiftCalendar", 
	dataSource: pouchDS, 
	autoFetchData: true,
	descriptionField: 'notes'
	,nameField: 'person'
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
	  console.log('New event',startDate, endDate);
	  
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
	  
	  shiftCalendar.addEvent(startDate, endDate, '1', 'notes', { group: 'shift', ad: false});
	 return false;
	}
}); 
