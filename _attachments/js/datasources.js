/*global emit:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
({inject: ['roster'],
  factory: function(roster) {
     "use strict";
      function typefyProps(obj) {
          console.log('typify1',obj);
          Object.keys(obj).forEach(
	      function(k) {
	          if (roster.tags[k]) {
	              var type = roster.tags[k].type;
	              switch (type) {
	                case 'datetime': 
	                  var d = Date.parseDate(obj[k].slice(0, obj[k].length-5));
	                  var timezoneOffset = 0; //d.getTimezoneOffset();
	                  obj[k] = new Date(d.getTime() - (timezoneOffset * 0));
                          console.log(d, obj[k]);
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
          
          console.log('typify2', obj);
      }
      
      var pouchDS = isc.DataSource.create(
          (function() {
              var pouchds = {};
              var DS;
              function remove (id, dsResponse, requestId) {
                  console.log('****remove');
                  doPouch(function(db) {
		      // console.log(id);
		      db.get( id,
			      function (err,doc){
			          console.log('err', err);
			          console.log('doc', doc);
			          db.remove(doc, function(err,response) {
				      console.log(response,'err',err);
				      dsResponse.data = doc;
				      if (err) console.log("could not remove doc");	
				      else  pouchDS.processResponse(requestId, dsResponse);} );});});}
              function fetch(dsResponse, requestId ) {
                  console.log('****fetch');
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
                                            // dsResponse.data.push({
                                            // _id:key._id,
                                            // _rev:key._rev,
                                            // text:key.text});
                                            dsResponse.data.push(key);
                                        }
				        pouchDS.processResponse(requestId, dsResponse);}});});}
              function add(data, dsResponse, requestId) {
                  console.log('****add');
                  // setGroup(data);
                  doPouch(function(db) {
                      delete data._id;
                      db.put(data,
                             function (err,response){
                                 if (err) console.log("Error from pouch put in add:", err,
                                                      "resp:", response);
                                 else {
                                     console.log('add response:',dsResponse);
                                     data._id = response.id; 
                                     data._rev = response.rev; 
                                     dsResponse.data = data;
                                     pouchDS.processResponse(requestId, dsResponse);
                                 }});});}
              function update(data, dsResponse, requestId) {
                  console.log('****update');
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
              var db =  roster.dbname;
              // var db =  'idb://' + 'testdb';
              console.log('db=',db);
              pouchds.transformRequest= function (dsRequest) {
                  console.log('****transform');
	          DS = this;
	          // console.log('dsRequest:',dsRequest);
	          var dsResponse;
	          switch (dsRequest.operationType) {
	            case "fetch":
	              // console.log("Fetch");
	              dsResponse = {
	                  clientContext: dsRequest.clientContext,
	                  status: 1};
	              fetch(dsResponse, dsRequest.requestId);
	              break;
	            case "update" : 
	              // console.log("update", dsRequest); 
	              // console.log("old values", dsRequest.oldValues); 
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
	          }
              };
              return pouchds;
          })());

      return pouchDS;
  }});
