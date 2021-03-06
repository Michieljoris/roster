/*global logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true*/

define
({inject: ['typesAndFields', 'globals'],
  factory: function(typesAndFields, globals) {
      "use strict";
      var log = logger('pouchDS', 'debug');
      
      var dbviews = {
          all: {   map : function(doc) { emit(doc,null); }
	           ,reduce: false}
          ,shift: { map : function(doc) {
	      if (doc.type === 'shift') emit(doc,null);}
		    ,reduce: false}
          ,location: { map : function(doc) {
	      if (doc.type === 'location') emit(doc,null);}
		       ,reduce: false}
          
          ,person: { map : function(doc) {
	      if (doc.type === 'person') emit(doc,null);}
		     ,reduce: false}
          ,settings: { map : function(doc) {
	      if (doc.type === 'role') emit(doc,null);}
		   ,reduce: false}
      };
      
      function typefyProps(obj) {
          Object.keys(obj).forEach(
	      function(k) {
                  var field = typesAndFields.getField(k);
	          if (field) {
	              var type = field.type;
	              switch (type) {
                        case 'list':
                          // obj[k] = isc.JSON.decode(obj[k]);
                          break;
                        case 'time' : 
                        case 'date' :
	                case 'datetime': 
                          // log.d('DATE CONVERSION');
                          // log.d(obj[k].toString());
	                  // var d = Date.parseStandardDate(obj[k].slice(0, obj[k].length-5));
                          // // log.d('in typefy',d);
	                  // var timezoneOffset = d.getTimezoneOffset();
                          // // timezoneOffset = 0;
	                  // obj[k] = new Date(d.getTime() - (timezoneOffset * 60000));
                          obj[k]=Date.parseSchemaDate(obj[k]);
                          // log.d(obj[k])
	                  break;
	              default: 
	              }
	          }
	          else {
	              //leave it as is
	          }
	          // log.d(k, obj[k]);
	      }
          );
      }
      
      function remove (id, dsResponse, requestId) {
          doPouch(function(db) {
	      // log.d(id);
	      db.get( id,
		      function (err,doc){
			  if (err) { log.d('ERRROR: can\'t find doc ', 
					   err.error, err.reason); 
				     return; }
                          db.remove(doc, function(err,response) {
			      if (err) { log.d('ERRROR: can\'t find doc ', 
					       err.error, err.reason); 
					 return; }
			      dsResponse.data = doc;
			      if (err) log.d("could not remove doc");	
			      else  pouchDS.processResponse(requestId, dsResponse);} );});});}
      function fetch(view, dsResponse, requestId ) {
          doPouch(function(db) {
              db.query( {map:view.map},{reduce: view.reduce},
                        // db.query( 'pouch/alldocs',
                        function (err,response){
			    if (err) log.d("Error from pouch query in fetch:", err,
					   "resp:", response);
			    else {
			      
			        log.d('Response in fetch is: ', response);
			        dsResponse.data=[];
			        for (var i = 0; i< response.rows.size();i++) {
				    var key=response.rows[i].key;
                                    // log.d('calling typefy');
				    typefyProps(key); 
				    // dsResponse.data.push({ _id:key._id, _rev:key._rev, text:key.text});
				
				    dsResponse.data.push(key);
                                }
			        // log.d('data: ', dsResponse.data);
			        pouchDS.processResponse(requestId, dsResponse);}});});}
      function add(data, dsResponse, requestId) {
          doPouch(function(db) {
              delete data._id;
              db.put(data,
                     function (err,response){
                         if (err) log.d("Error from pouch put in add:", err,
                                        "resp:", response);
                         else {
                             data._id = response.id; 
                             data._rev = response.rev; 
                             dsResponse.data = data;
                             // log.d("hello",  data.endDate);
                             // module.temp= data;
                             pouchDS.processResponse(requestId, dsResponse);}});
	  });
      }

      function update(data, dsResponse, requestId) {
          // log.d('data', data);
          doPouch(function(db) {
              db.put(data,
                     function (err,response){
			 if (err) log.d("Error from pouch put in update:", err,
					"resp:", response);
			 else {
			     data._rev = response.rev; 
			     dsResponse.data = data;
			     pouchDS.processResponse(requestId, dsResponse);}});});} 

      function doPouch(f) {
          f(globals.db);
      }			 

      
      var couchDS = isc.DataSource.create(
          {   name: 'CouchDB',
	      ID : "couchDS",
	      fields: typesAndFields.allFields,
	      autoDeriveTitles:true,
	      dataProtocol: "clientCustom",
              // autoCacheAllData: true,
	
	      transformRequest: function (dsRequest) {
	          // DS = this;
	          log.d(dsRequest);
                  // log.d(dsRequest.data);
	          var dsResponse;
	          switch (dsRequest.operationType) {
	            case "fetch":
	              var fetchView = dbviews.all;
                      // log.d('about to switch......', dsRequest);
                      switch (dsRequest.componentId) {
	                case 'isc_ShiftCalendar' :
                          fetchView = dbviews.shift;  
	                  log.d('in shiftCalendar', fetchView); 
	                  break;
	              default:
                          //log.d('getting all objects for: ', dsRequest.componentId); 
	              }
                      if (dsRequest.view) {
                          fetchView = dbviews[dsRequest.view];   
                      }
	              log.d('fetch', fetchView); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              fetch(fetchView, dsResponse, dsRequest.requestId);
                      log.d('dsResponse', dsResponse);
	              break;
	            case "update" : 
	              log.d("update", dsRequest); 
	              log.d("old values", dsRequest.oldValues); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  errors: {},
	      
	                  status: 1};
	              update(isc.addProperties({}, dsRequest.oldValues, dsRequest.data), 
		             dsResponse, dsRequest.requestId);
	              break; 
	            case "add" : 
	              log.d("add"); 
	              log.d('data', dsRequest.data);
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              add(dsRequest.data, dsResponse, dsRequest.requestId);
	              break;
	            case "remove" :
	              log.d("remove"); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              remove(dsRequest.data._id, dsResponse, dsRequest.requestId); 
	              break; 
	          default: log.d("This is unknown operation on pouchdb: ", dsRequest.operationType );
	          }
	      }
          });    
      
      return {
          name: 'couchDS'
          ,shortName: 'CouchDB'
          ,description: 'This is a database engine either installed on your local machine, or reachable via a network.'
          ,handle: couchDS 
          ,sourceType: 'url:'
      };
  }});
