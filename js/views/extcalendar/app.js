
function log() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	// if (typeof  arg == "string") console.log(arg);
	// else if (typeof arg == 'object') for (j in arg) console.log(j + "=" + arg[j]);
	// else
	    console.log(arg);
    }
}

function pp() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	if (typeof  arg == "string") {console.log(arg);} 
	else if (typeof arg == 'object') for (j in arg) console.log(" " + j + ":" + arg[j]);
	else console.log(arg);
    }
}

var db='idb://testshifts';
// var db='http://localhost:1234/testext';
function pdestroy() {
    Pouch.destroy(db);

}

function pinfo() {
    function map(doc) {
	if(doc) {
	    emit(doc, null);
	}
    }

    Pouch(db, function(err, db) {
	      if (err) {
		  console.log("Error from pouch :");
		  console.log(err);
	      } 
	      db.info(function(err, info) {
	  		  if (err) {
	  		      console.log("Error from pouch info:");
	  		      console.log(err);
	  		  } 
	  		  pp(info);
	  	      });
	      
	      
	      db.query({map: map}, {reduce: false}, function(err, response) {
	  		   if (err) {
	  		       console.log("Error from pouch query:");
	  		       console.log(err);
	  		   } 
			   response.rows.forEach(function(e) {
						     pp(e.key); 
						 });
			   console.log(response);
		       });
	  });
}

function ppost(obj) {
    Pouch(db, function(err, db) {
	      if (err) {
		  console.log("Error from pouch info:");
		  console.log(err);
	      } 
	     else 
	      db.post(obj, function(err, response) {
			  if (err) {
			      pp("Error from pouch info:",err);
			  } 
			  pp("Response is:", response);
			  });
	      
	  });
}


function pput(obj) {
    Pouch(db, function(err, db) {
	      if (err) {
		  console.log("Error from pouch info:");
		  console.log(err);
	      } 
	     else 
	      db.put(obj, function(err, response) {
			  if (err)  pp("Error from pouch info:",err);
			  else pp("Response is:", response);
			  });
	      
	  });
}


function pget(id) {
    Pouch(db, function(err, db) {
	      if (err) {
		  console.log("Error from pouch info:");
		  console.log(err);
	      } 
	      else
	      db.get(id, function(err, response) {
			  if (err)  pp("Error from pouch info:",err);
			  else pp("Response is:", response);
			  });
	      
	  });
}


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
	    
	    Ext.create('Shifts.FullCalendar');
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
