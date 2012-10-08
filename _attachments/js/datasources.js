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
      ,{name:"annualLeave", type: 'boolean', group: ['shift']}
      ,{name:"sickLeave", type: 'boolean', group: ['shift']}
      ,{name:"longServiceLeave", type: 'boolean', group: ['shift']}
      ,{name:"otherLeave", type: 'boolean', group: ['shift']}
      ,{name:"sleepOver", type: 'boolean', group: ['shift']}
      ,{name:"awayFromBase", type: 'boolean', group: ['shift']}
      ,{name:"adminHours", type: 'float', group: ['shift']}
      ,{name:"disturbedSleep", type: 'float', group: ['shift']}
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
    function fetch(view, dsResponse, requestId ) {
      doPouch(function(db) {
    		db.query( {map:view.map},{reduce: view.reduce},
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
    var view = {
      all: {   map : function(doc) { emit(doc,null); }
	       ,reduce: false}
      ,shifts: { map : function(doc) {
	       if (doc.group === 'shift') emit(doc,null);}
	     ,reduce: false}
      };
    
    
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
	console.log(dsRequest.componentId);
	var fetchView = view.all;
	switch (dsRequest.componentId) {
	case 'shiftCalender' :fetchView = view.shifts;  console.log('fetchView', fetchView); break;
	default: console.log('default??', dsRequest.componentId); 
	}
	console.log("Fetch");
	dsResponse = {
	  clientContext: dsRequest.clientContext,
	  status: 1};
	fetch(fetchView, dsResponse, dsRequest.requestId);
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
    //this filter out the proper objects when the objects are in cache, and not retrieved from
    //the server. Using views for that. (See fetch)
    // pouchds.applyFilter = function(data, criteria, requestProps) {
    //   console.log('applyFilter',data, criteria, requestProps);
    //   var filteredData = {};
    //   var group;
    //   switch (requestProps.componentId){
    //   case 'shiftCalender': group = 'shift'; break;
    //   }
    //   return data.filter(
    //   	function(d) { return group ? (d.group === group ? true : false) : true; } 
    //   );
    // };
    return pouchds;
  }());


