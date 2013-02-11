/**
 * @author Ed Spencer
 * Adapted for pouchdb by Michiel van Oosten
 
 * Pouchdb proxy. 
 *
 * Usually this Proxy isn't used directly, serving instead as a helper to a {@link Ext.data.Store Store} where a reader
 * is required to load data. For example, say we have a Store for a User model and have some data we want to
 * load, but this data isn't in quite the right format: we can use a PouchdbProxy with a JsonReader to read it into our
 * Store:
 *
 *     //this is the model we will be using in the store
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             {name: 'id',    type: 'int'},
 *             {name: 'name',  type: 'string'},
 *             {name: 'phone', type: 'string', mapping: 'phoneNumber'}
 *         ]
 *     });
 *
 *
 *     //note how we set the 'root' in the reader to match the data structure above
 *     var store = Ext.create('Ext.data.Store', {
 *         autoLoad: true,
 *         model: 'User',
 proxy: {
 type: 'pouchdb',
 reader: {
 type: 'json',
 root: 'rows',
 record: 'key'
 }
 *     });
 */

//TODO cache (see LocalstorageProxy), phantom, id

Ext.define('lib.ext.proxy.Pouchdb', {
	       extend: 'Ext.data.Proxy',
	       alias: 'proxy.pouchdb',
	       alternateClassName: 'Ext.data.PouchdbProxy',

	       /**
		* @cfg {Object} data
		* Optional data to pass to configured Reader.
		*/

	       constructor: function(config) {
		   this.callParent([config]);
		   
		   //<debug>
		   if (this.database === undefined) {
		       Ext.Error.raise("No database was given for the pouchdb proxy.");
		   }
		   //</debug>
		   
		   //setting up pouchdb 
		   this.protocol = this.protocol || 'idb://';
		   this.path = this.protocol + this.database;
		   this.map = this.map || function (doc) { emit(doc,null); };
		   this.map_reduce={ map : this.map };
		   if (this.reduce) this.map_reduce.reduce=reduce;
		   this.reduce = this.reduce || false;
		   
		   this.idProperty =  this.idProperty || "_id";
		   this.revProperty =  this.revProperty || "_rev";
		   if (this.mappings) {
		       if (this.mappings[this.idProperty])
			   this.idProperty =  this.mappings[this.idProperty]["name"];
		       else pp('Error: mappings does not have a idProperty ' + this.idProperty);
		       if (this.mappings[this.revProperty]) 
			   this.revProperty = this.mappings[this.revProperty]["name"];
		       else pp('Error: mappings does not have a revProperty: ' + this.revProperty);
		   }
		   //ensures that the reader has been instantiated properly
		   this.setReader(this.reader);
	       }
	       
	       ,updateOperation: function(operation, callback, scope) {
		   operation.setCompleted();
		   operation.setSuccessful();
		   Ext.callback(callback, scope || this, [operation]);
	       }
	       
	       ,read: function(operation, callback, scope) {
		   console.log("read operation", operation);
		   var me = this;
		   operation.setStarted();
		   this.doPouch(function(db) {
				    db.query( me.map_reduce,{reduce:me.reduce},
					      function (err,response){
						  if (err) pp("Error in query", err, "resp:", response);
						  else
						  { operation.resultSet = me.getReader().read(response);
						    me.updateOperation.call(me, operation,callback,scope);
						  }
	      				      });
				});
	       }
	       
	       ,create: function(operation, callback, scope) {
		   console.log("write operation:", operation);
		   this.create_update(true, operation, callback, scope);
		   return;
	       }
	       
	       ,update: function(operation, callback, scope) {
		   console.log("update operation:", operation);
		   this.create_update(false, operation, callback, scope);
		   return;
	       }
	       ,create_update: function(create, operation, callback, scope) {
		   pp('in create_update');
		   var me = this,
		   recs = operation.getRecords(),
		   docs = { docs : [] };
		   //and map the objects properties to the name used in the database
		   recs.forEach(function(e) {
				    var data = {};
				    if (me.mappings) {
					for (k in e.data) { 
					    var prop = me.mappings[k];   
					    if (prop && !prop.unused)
						data[prop[me.nameProperty]] = e.data[k]; 
					}
				    }
				    else data = e.data;
				    docs.docs.push(data);
				});
		   // we really want to create a new database item, so delete any accidentally set _id:
		   if (create) 
		       docs.docs.forEach(function(d) {
		   		    	     delete d._id; delete d._rev;
					 });
		 console.log(docs.docs[0]);  
		   this.doPouch(function(db) {
				    db.bulkDocs(
					docs,
					// request.jsonData,
					function (err,response){
					    if (err) pp("Error from pouch bulkDocs in create:", err,
							"resp:", response);
					    else
					    {  
						// response.forEach( function(r) { pp("Response:", r); }); 
						response.reverse();
						recs.forEach(function(r) {
				     				 var resp=response.pop();
								 pp('Response:', resp);
								 if (resp.ok) {
								     r.data[me.revProperty]=resp.rev;
				     				     r.data[me.idProperty]=resp.id;	  
				     				     r.commit();
								 }
								 else {
								     pp('we should do some proper error handling here...');							
								 }
			     				     });
						me.updateOperation.call(me,operation,callback,scope);
					    }	
	      				});
				});
		   
	       }
	       
	       ,destroy: function(operation, callback, scope) {
		   console.log("destroy operation:", operation);
		   
		   var me = this,
		   recs = operation.getRecords();
		   docs = [];
		   //and map the objects properties to the name used in the database
		   recs.forEach(function(e) {
				    docs.push({_id : e.data[me.idProperty],
					       _rev : e.data[me.revProperty] });
				});
		   
		   operation.setStarted();
		   this.doPouch(function(db) {
				    docs.forEach(function(doc) {
						     console.log(doc);
						     console.log(doc._id);
		   				     db.remove(doc,
		   						function (err,response){
		   						    if (err) pp("Error from pouch remove :",
		   								err, "resp:", response);
		   						    else
		   						    { pp("Response:", response); 
		   						      me.updateOperation.call(me, operation,callback,scope);
		   						    }
	      	   						});
						 });
		   		});
		   
	       }
	       
	       /**
		* Reads data from the configured {@link #data} object. Uses the Proxy's {@link #reader}, if present.
		* @param {Ext.data.Operation} operation The read Operation
		* @param {Function} callback The callback to call when reading has completed
		* @param {Object} scope The scope to call the callback function in
		*/

	       ,clear: Ext.emptyFn
	       
	       ,doPouch: function(f) {
		   var me = this;
		   Pouch(me.path, function(err, db) {
			     if (err) pp("Error opening database", me.path, "err:", err, "db:", db);
			     else f(db);
			 });
	       }			 
	       
	       // , batch: function(options, /* deprecated */listeners) {
	       // 	   pp("I am in batch!!");
	       // 	   var me = this,
	       // 	   useBatch = me.batchActions,
	       // 	   batch,
	       // 	   records,
	       // 	   actions, aLen, action, a, r, rLen, record;

	       // 	   if (options.operations === undefined) {
	       // 	       // the old-style (operations, listeners) signature was called
	       // 	       // so convert to the single options argument syntax
	       // 	       options = {
	       // 		   operations: options,
	       // 		   listeners: listeners
	       // 	       };
	       // 	   }

	       // 	   if (options.batch) {
	       // 	       if (Ext.isDefined(options.batch.runOperation)) {
	       // 		   batch = Ext.applyIf(options.batch, {
	       // 					   proxy: me,
	       // 					   listeners: {}
	       // 				       });
	       // 	       }
	       // 	   } else {
	       // 	       options.batch = {
	       // 		   proxy: me,
	       // 		   listeners: options.listeners || {}
	       // 	       };
	       // 	   }

	       // 	   if (!batch) {
	       // 	       batch = new Ext.data.Batch(options.batch);
	       // 	   }

	       // 	   batch.on('complete', Ext.bind(me.onBatchComplete, me, [options], 0));

	       // 	   actions = me.batchOrder.split(',');
	       // 	   aLen    = actions.length;

	       // 	   for (a = 0; a < aLen; a++) {
	       // 	       action  = actions[a];
	       // 	       records = options.operations[action];

	       // 	       if (records) {
	       // 		   if (useBatch) {
	       // 		       batch.add(new Ext.data.Operation({
	       // 							    action  : action,
	       // 							    records : records
	       // 							}));
	       // 		   } else {
	       // 		       rLen = records.length;

	       // 		       for (r = 0; r < rLen; r++) {
	       // 			   record = records[r];

	       // 			   batch.add(new Ext.data.Operation({
	       // 								action  : action,
	       // 								records : [record]
	       // 							    }));
	       // 		       }
	       // 		   }
	       // 	       }
	       // 	   }

	       // 	   batch.start();
	       // 	   return batch;
	       // },
	       // ,setRecord: function(me, record
	       // 			   // , id
	       // 			  ) {
	       // 			      // if (id) {
	       // 			      //     record.setId(id);
	       // 			      // } else {
	       // 			      //     id = record.getId();
	       // 			      // }

	       // 			      var rawData = record.data,
	       // 			      data    = {},
	       // 			      model   = me.model,
	       // 			      fields  = model.prototype.fields.items,
	       // 			      length  = fields.length,
	       // 			      i = 0,
	       // 			      field, name, obj, key;

	       // 			      for (; i < length; i++) {
	       // 				  field = fields[i];
	       // 				  name  = field.name;

	       // 				  if(field.persist) {
	       // 				      data[name] = rawData[name];
	       // 				  }
	       // 			      }
	       // 			      return data;
	       // 			  }
	   });



