var roster = {
    dbname:'todos2'
};


isc.DataSource.create(
    {
	ID: "pouchDS",
	fields:[
	    {name:"id", title:"time"},
	    {name:"text", title:"text"}
	],
	dataProtocol: "clientCustom",
	db: roster.dbname 
	,transformRequest: function (dsRequest) {
	    console.log(dsRequest, "in transform");
	    var dsResponse;
	    switch (dsRequest.operationType) {
	    case "fetch":
		console.log("Fetch");
		dsResponse = {
		    clientContext: dsRequest.clientContext,
		    status: 1};
		this.fetch(dsResponse, this, dsRequest.requestId);
		break;
	    case "update" : console.log("update"); break; 
	    case "add" : console.log("create"); break; 
	    case "remove" : console.log("remove"); break; 
	    default: console.log("default??");
	    };
	}
	,fetch: function(dsResponse, ds, requestId ) {
	    function map(doc) {
		if(doc.text) {
		    emit(doc,null);
		}
	    }
	    Pouch('idb://' + this.db, function(err, db) {
    		      db.query( {map:map},{reduce:false},
    				function (err,response){
				    if (err) pp("Error from pouch query in fetch:", err,
						"resp:", response);
				    else {
					console.log('Response:', response);
					dsResponse.data=[];
					for (var i = 0; i< response.rows.size();i++) {
					    var key=response.rows[i].key;
			    		    dsResponse.data.push({id:key._id, text:key.text});
    					}
					ds.processResponse(requestId, dsResponse);
					
				    }
    	     			});
    		  });
	}
	,doPouch: function(f) {
	    var me = this;
	    Pouch(me.db, function(err, db) {
		      if (err) pp("Error opening database", me.db, "err:", err, "db:", db);
		      else f(db);
		  });
	}			 
    });



var _today = new Date;
var _start = _today.getDate() - _today.getDay();
var _month = _today.getMonth();
var _year = _today.getFullYear();
var eventData = [
    {
	eventId: 1, 
	name: "Meeting",
	description: "Shareholders meeting: monthly forecast report",
	startDate: new Date(_year, _month, _start + 2, 9),
	endDate: new Date(_year, _month, _start + 2, 14)
    },
    {
	eventId: 2,
	name: "Realtor",
	description: "Breakfast with realtor to discuss moving plans",
	startDate: new Date(_year, _month, _start + 3, 8 ),
	endDate: new Date(_year, _month, _start + 3, 10)
    },
    {
	eventId: 3,
	name: "Soccer",
	description: "Little league soccer finals",
	startDate: new Date(_year, _month, _start + 4, 13),
	endDate: new Date(_year, _month, _start + 4, 16)
    },
    {
	eventId: 4, 
	name: "Sleep",
	description: "Catch up on sleep",
	startDate: new Date(_year, _month, _start + 4, 5),
	endDate: new Date(_year, _month, _start + 4, 9)
    },
    {
	eventId: 5,
	name: "Inspection",
	description: "Home inspector coming",
	startDate: new Date(_year, _month, _start + 4, 10),
	endDate: new Date(_year, _month, _start + 4, 12),
	eventWindowStyle: "testStyle",
	canEdit: false
    },
    {
	eventId: 6,
	name: "Airport run",
	description: "Pick James up from the airport",
	startDate: new Date(_year, _month, _start + 4, 1),
	endDate: new Date(_year, _month, _start + 4, 3)
    },
    {
	eventId: 7,
	name: "Dinner Party",
	description: "Prepare elaborate meal for friends",
	startDate: new Date(_year, _month, _start + 4, 17),
	endDate: new Date(_year, _month, _start + 4, 20)
    },
    {
	eventId: 8,
	name: "Poker",
	description: "Poker at Steve's house",
	startDate: new Date(_year, _month, _start + 4, 21),
	endDate: new Date(_year, _month, _start + 4, 23)
    },
    {
	eventId: 9,
	name: "Meeting",
	description: "Board of directors meeting: discussion of next months strategy",
	startDate: new Date(_year, _month, _start + 5, 11),
	endDate: new Date(_year, _month, _start + 5, 15)
    }
];


// using a client-only dataSource so that test data is always relative to the current date
isc.DataSource.create({
    ID: "eventDS",
    fields:[
        {name:"eventId", primaryKey: true, type: "sequence"},
        {name:"name"},
        {name:"description"},
        {name:"startDate", type: "datetime"},
        {name:"endDate", type: "datetime"}
    ],
    clientOnly: true,
    testData: eventData
        
});     

var testData = [
    {
	time: 1, 
	text: "Meeting"
    },
    {
	time: 2, 
	text: "Dog"
    },
    {
	time: 3, 
	text: "Cat"
    }
]; 

isc.DataSource.create({
    ID: "testDS",
    fields:[
        {title:"time", name:"time", primaryKey: true, type: "sequence"},
        {title:"text", name:"text"}
        // {name:"description"},
        // {name:"startDate", type: "datetime"},
        // {name:"endDate", type: "datetime"}
    ],
    clientOnly: true,
    testData: testData
});     