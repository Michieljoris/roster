var roster =
  function() {
    var exp = {};
    
    exp.dbname='rosterdb';
    var tagArray = [
      {name:"_id", primaryKey:true}
      ,{name:"_rev"}
      ,{name:"group"} //shift, location, person, role
      
      ,{name:"startDate", type: "datetime", group: ['shift']}
      ,{name:"endDate", type: "datetime", group: ['shift']}
      ,{name:"person", type: 'ref', group: ['shift']} //ref to person obj ,,,change to person..
      ,{name:"location", group: ['shift']} //ref to loc object,,, change to location
      ,{name:"notes", group: ['shift']}//,,, change to notes
      ,{name:"ad", type: 'boolean', group: ['shift']}
      //needed for recurrence
      ,{name:"rrule", group: ['shift']}
      ,{name:"duration", group: ['shift']}
      //these props need not be persistent, see extensible's Eventmappings.js
      // ,{name:"origid"}
      // ,{name:"ristart"},
      // ,{name:"redit"}
      //obsolete
      // {name:"eventId", primaryKey: true, type: "sequence"},
      // ,{name:"cid"} //mapped to name in EventMappings
      // ,{name:"notes"} // mapped to description in EventMappings
      // ,{name:"start"} // mapped to startDate in EventMappings
      // ,{name:"end"}// mapped to endDate in EventMappings
    ];
    var tags = {};
    tagArray.forEach(
      function(t) {
	tags[t.name] = t;	
      });
    exp.tagArray = tagArray;
    exp.tags = tags;
    return exp; 
   }(); 

isc.DataSource.create(
   function() {
     var pouchds = {};
     var DS;
     function typefyProps(obj) {
       Object.keys(obj).forEach(
	 function(k) {
	   if (roster.tags[k]) {
	     var type = roster.tags[k].type;
	     switch (type) {
	     case 'datetime': 
	       var d = Date.parseDate(obj[k].slice(0, obj[k].length-5));
	       var timezoneOffset = d.getTimezoneOffset();
	       obj[k] = new Date(d.getTime() - (timezoneOffset * 60000));
	       break;
	     default: ;
	     }
	   }
	   else {
	    //leave it as is
	   }
	 // console.log(k, obj[k]);
	 }
       );
     }
     function remove (id, dsResponse, requestId) {
       doPouch(function(db) {
		 console.log(id);
		 db.get( id,
			 function (err,doc){
			   console.log('err', err);
			   console.log('doc', doc);
			   db.remove(doc, function(err,response) {
				       console.log('err',err);
				       dsResponse.data = doc;
				       if (err) console.log("could not remove doc");	
				       else  pouchDS.processResponse(requestId, dsResponse);} );});});}
      function fetch(dsResponse, requestId ) {
	function map(doc) {
	  // if(doc.text) {
	  emit(doc,null);
	  // }
	}
	doPouch(function(db) {
    		       db.query( {map:map},{reduce:false},
    				 function (err,response){
				   if (err) console.log("Error from pouch query in fetch:", err,
							"resp:", response);
				   else {
				     console.log(response);
				     dsResponse.data=[];
				     for (var i = 0; i< response.rows.size();i++) {
				       var key=response.rows[i].key;
				       typefyProps(key); 
			    	       // dsResponse.data.push({ _id:key._id, _rev:key._rev, text:key.text});
				       
			    	       dsResponse.data.push(key);
    				     }
				     pouchDS.processResponse(requestId, dsResponse);}});});}
      function add(data, dsResponse, requestId) {
      	// setGroup(data);
      	doPouch(function(db) {
      		       delete data._id;
      		       db.put(data,
      			      function (err,response){
      				if (err) console.log("Error from pouch put in add:", err,
      						     "resp:", response);
      				else {
      				  data._id = response.id; 
      				  data._rev = response.rev; 
      				  dsResponse.data = data;
      				  pouchDS.processResponse(requestId, dsResponse);}});});}
      function update(data, dsResponse, requestId) {
	console.log('data', data);
	// setGroup(data);
	doPouch(function(db) {
    		       db.put(data,
    			      function (err,response){
				if (err) console.log("Error from pouch put in update:", err,
						     "resp:", response);
				else {
				  data._rev = response.rev; 
				  dsResponse.data = data;
				  pouchDS.processResponse(requestId, dsResponse);}});});} 
     function doPouch(f) {
	Pouch(db, function(err, db) {
		if (err) console.log("Error opening database", db, "err:", err, "db:", db);
		else f(db);});}			 
     
     // function setGroup(data) {
     //   data.group =  DS.group ? DS.group : data.group;
     //   console.log(DS.group);
     // };
     
     pouchds.ID = "pouchDS";
      pouchds.fields= roster.tagArray;
      pouchds.autoDeriveTitles=true;
      pouchds.dataProtocol= "clientCustom";
      var db =  'idb://' + roster.dbname;
      pouchds.transformRequest= function (dsRequest) {
	DS = this;
	console.log('dsRequest:',dsRequest);
	var dsResponse;
	switch (dsRequest.operationType) {
	case "fetch":
	  console.log("Fetch");
	  dsResponse = {
	    clientContext: dsRequest.clientContext,
	    status: 1};
	  fetch(dsResponse, dsRequest.requestId);
	  break;
	case "update" : 
	  console.log("update", dsRequest); 
	  console.log("old values", dsRequest.oldValues); 
	  dsResponse = {
	    clientContext: dsRequest.clientContext,
	    status: 1};
	  update(isc.addProperties({}, dsRequest.oldValues, dsRequest.data), 
		      dsResponse, dsRequest.requestId);
	  break; 
	case "add" : 
	  console.log("add"); 
	  console.log('data', dsRequest.data);
	  dsResponse = {
	    clientContext: dsRequest.clientContext,
	    status: 1};
	  add(dsRequest.data, dsResponse, dsRequest.requestId);
	  break;
	case "remove" : console.log("remove"); 
	  dsResponse = {
	    clientContext: dsRequest.clientContext,
	    status: 1};
	  remove(dsRequest.data._id, dsResponse, dsRequest.requestId); 
	  break; 
	default: console.log("default??");
	};
      };
     return pouchds;
   }());


// isc.DataSource.create(
//   function() {
//     var calendarDS = Object.create(pouchDS);
//     calendarDS.ID = 'calendarDS';
//     calendarDS.group = 'shift';
//     return calendarDS;
//   }()

// );

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
			
			
			// transformRequest: function (dsRequest) { console.log(dsRequest, "Hello!!!!!");}, 
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

// isc.DataSource.create({
// 			ID: "testDS",
// 			fields:[
// 			  {title:"time", name:"time", primaryKey: true, type: "sequence"},
// 			  {title:"text", name:"text"}
// 			  // {name:"description"},
// 			  // {name:"startDate", type: "datetime"},
// 			  // {name:"endDate", type: "datetime"}
// 			],
// 			clientOnly: true,
// 			testData: testData
// 		      });     