/*global logger:false module:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true*/

define
({inject: ['typesAndFields', 'globals'],
  factory: function(typesAndFields, globals) {
      "use strict";
      var log = logger.get('pouchDS', 'debug');
      
      var views = typesAndFields.views;
      
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
	                case 'datetime': 
	                  var d = Date.parseDate(obj[k].slice(0, obj[k].length-5));
                          // console.log('in typefy',d);
	                  var timezoneOffset = d.getTimezoneOffset();
                          // timezoneOffset = 0;
	                  obj[k] = new Date(d.getTime() - (timezoneOffset * 60000));
	                  break;
	              default: 
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
	      // console.log(id);
	      db.get( id,
		      function (err,doc){
			  if (err) { console.log('ERRROR: can\'t find doc ', 
						 err.error, err.reason); 
				     return; }
                          db.remove(doc, function(err,response) {
			      if (err) { console.log('ERRROR: can\'t find doc ', 
						     err.error, err.reason); 
					 return; }
			      dsResponse.data = doc;
			      if (err) console.log("could not remove doc");	
			      else  pouchDS.processResponse(requestId, dsResponse);} );});});}
      function fetch(view, dsResponse, requestId ) {
          doPouch(function(db) {
              db.query( {map:view.map},{reduce: view.reduce},
                        // db.query( 'pouch/alldocs',
                        function (err,response){
			    if (err) console.log("Error from pouch query in fetch:", err,
						 "resp:", response);
			    else {
			      
			        console.log('Response in fetch is: ', response);
			        dsResponse.data=[];
			        for (var i = 0; i< response.rows.size();i++) {
				    var key=response.rows[i].key;
                                    // console.log('calling typefy');
				    typefyProps(key); 
				    // dsResponse.data.push({ _id:key._id, _rev:key._rev, text:key.text});
				
				    dsResponse.data.push(key);
                                }
			        console.log('data: ', dsResponse.data);
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
                             console.log("hello",  data.endDate);
                             module.temp= data;
                             pouchDS.processResponse(requestId, dsResponse);}});
	  });
      }

      function update(data, dsResponse, requestId) {
          // console.log('data', data);
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
          // Pouch(db, function(err, db) {
	  // if (err) console.log("Error opening database", db, "err:", err, "db:", db);
	  // else f(db);});
          f(globals.db);
      }			 

      
      var pouchDS = isc.DataSource.create(
          {
	      ID : "pouchDS",
	      fields: typesAndFields.allFields,
	      autoDeriveTitles:true,
	      dataProtocol: "clientCustom",
	
              // titleField: 'title',
	      // recordName:"employee",
	      // titleField:"Name",
              
	      transformRequest: function (dsRequest) {
	          // DS = this;
	          log.d(dsRequest);
                  log.d(dsRequest.data);
	          var dsResponse;
	          switch (dsRequest.operationType) {
	            case "fetch":
	              var fetchView = views.all;
                      // console.log('about to switch......', dsRequest);
                      switch (dsRequest.componentId) {
	                case 'isc_ShiftCalendar' :
                          fetchView = views.shift;  
	                  console.log('in shiftCalendar', fetchView); 
	                  break;
	              default:
                          //console.log('getting all objects for: ', dsRequest.componentId); 
	              }
                      if (dsRequest.view) {
                          fetchView = views[dsRequest.view];   
                      }
	              console.log('fetch', fetchView); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              fetch(fetchView, dsResponse, dsRequest.requestId);
                      console.log('dsResponse', dsResponse);
	              break;
	            case "update" : 
	              console.log("update", dsRequest); 
	              console.log("old values", dsRequest.oldValues); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  errors: {},
	      
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
	            case "remove" :
	              console.log("remove"); 
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              remove(dsRequest.data._id, dsResponse, dsRequest.requestId); 
	              break; 
	          default: console.log("This is unknown operation on pouchdb: ", dsRequest.operationType );
	          }
	      }
          });    
      
      typesAndFields.setDataSource(pouchDS);
      return pouchDS;
  }});
