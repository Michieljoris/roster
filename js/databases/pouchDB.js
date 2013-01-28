/*global VOW:false Pouch:false logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/

define
({inject: ['typesAndFields'],
  factory: function(typesAndFields) {
      "use strict";
      
      var log = logger('pouchDB', 'debug');
      
      var pouchDbHandle;
      
      var rootUser = {
          _id:'root',
          name: 'root',
          type: 'person',
          login: 'root',
          autoLogin: true,
          pwd:'root'
      };
      
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
	      if (doc.type === 'settings') emit(doc,null);}
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
      //TODO get rid of this function, it is useless and have a module wide var called db
      function doPouch(f) {
          f(pouchDbHandle);
      }			 

      
      var pouchDS = isc.DataSource.create(
          {   ID : "pouchDS2",
	      fields: typesAndFields.allFields,
	      autoDeriveTitles:true,
	      dataProtocol: "clientCustom",
              // autoCacheAllData: true,
	
	      transformRequest: function (dsRequest) {
	          log.d(dsRequest);
                  // log.d(dsRequest.data);
	          var dsResponse;
	          switch (dsRequest.operationType) {
	            case "fetch":
	              var fetchView = dbviews.all;
                      // log.d('about to switch......', dsRequest);
                      if (dsRequest.componentId === 'isc_ShiftCalendar') {
                          fetchView = dbviews.shift;  
	                  log.d('in shiftCalendar', fetchView); 
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
      
      //##init
      /** Make sure there is a handle for pouch, and a root user in
       * the database */
      function init(vow, idbname) {
          Pouch(idbname, function(err, aDb) {
	      if (!err) {
                  log.d('pouchDB is ready');
                  pouchDbHandle = aDb;
                  VOW.first([
                      getDoc('root'),
                      putDoc(rootUser)]).when()
                      .when(
                          vow.keep, vow['break']
                      );
              }
              else { var msg = "Error opening idb database for pouchDS" + idbname +
		     "err: "+ err.error + ' reason:' + err.reason;
                     vow['break'](msg);
		   }
          });
      }
      
      //##getDoc
          
      //A helper function to easily extract a doc from the
      //pouchdb. This function returns a promise of
      //a doc.
      function getDoc(record) {
          log.d('getDoc ', record);
          var vow = VOW.make();
          if (!record)  
              vow['break']('Can not get doc with undefined id');
          else if (record._id) return vow.keep(record);
          else pouchDbHandle.get(record, function(err, doc) {
              if (!err) {
                  log.d('keeping get vow');
                  vow.keep(doc);   
              }
              else {
                  log.d('breaking get vow');
                  err.record = record; 
                  vow['break'](err);   
              }
          });
          return vow.promise;
      }
      
      //##putDoc
      /**A helper function to easily save a doc to the database. This
       * function return a promise of a save.
       */
      function putDoc( record ){
          console.log('putDoc ', record);
          var vow = VOW.make();
          pouchDbHandle.put(record, function(err, response) {
              if (!err) {
                      log.d('keeping put vow');
                  record._id = response.id;
                  record._rev = response.rev;
                  vow.keep(record);   
              }
              else {
                  log.d('breaking put vow');
                  err.record = record; 
                  vow['break'](err);   
              }
          });
          return vow.promise;
      }
      
      
      return {
          name: 'pouchDB'
          ,shortName: 'Browser local storage (idb)'
          ,description: 'The data will be stored in the browser local storage. This is persisted across refreshes of the browser you are using now. If you use a standalone version you will be able to carry the data with you on a usb stick for instance. '
          ,getDS: function() { return pouchDS; }
          ,urlPrefix: 'idb://' //or 'url' of the database
          ,init: init
          ,getDoc: getDoc
          ,putDoc: putDoc
      };
  }});
