/**
 * @author Ed Spencer
 * Adapted for pouch */
 /**db by Michiel van Oosten
 
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

Ext.define('lib.proxy.Pouchdb2', {
	       extend: 'Ext.data.Proxy',
	       alias: 'proxy.pouchdb2',
	       alternateClassName: 'Ext.data.PouchdbProxy2',

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
		   
		   //ensures that the reader has been instantiated properly
		   this.setReader(this.reader);
	       }
	       
	       ,updateOperation: function(success, operation, callback, scope) {
		   // pp("update operation");
		   operation.setCompleted();
		   if (success) operation.setSuccessful();
		   
		   Ext.callback(callback, scope || this, [operation]);
	       }
	       
	       ,read: function(operation, callback, scope) {
		   log("read operation", operation);
		   var me = this;
		   operation.setStarted();
		   this.doPouch(function(db) {
				    db.query( me.map_reduce,{reduce:me.reduce},
					      function (err,response){
						  if (err) pp("Error in query", err, "resp:", response);
						  else
						  { pp("Response::", response); 
						    operation.resultSet = me.getReader().read(response);
						    me.updateOperation.call(me, (response ? true : false),
									    operation,callback,scope);
						  }
	      				      });
				});
	       }
	       
	       ,create: function(operation, callback, scope) {
		   log("write operation:", operation);
		   var me = this,
		   recs = operation.getRecords(),
		   raw = [];
		   
		   operation.setStarted();
		   recs.forEach(function(e) {
				    pp(e);
		   		    delete e.raw._id; delete e.raw._rev;
		   		    raw.push(e.data); });
 
		   this.doPouch(function(db) {
				    db.bulkDocs({ docs :raw },
						function (err,response){
						    if (err) pp("Error from pouch bulkDocs in create:", err,
								"resp:", response);
						    else
						    { response.forEach( function(r) { pp("Response:", r); }); 
						      response.reverse();
						      recs.forEach(function(r) {
				     				       var resp=response.pop();
				     				       r.data._id=resp.id;	  
				     				       r.data._rev=resp.rev;	  
				     				       r.commit();
			     					   });
						      me.updateOperation.call(me, err,
									      operation,callback,scope);
						    }					 
	      					});
				});
		   
	       }
	       
	       ,update: function(operation, callback, scope) {
		   log("update operation:", operation);
		   var me = this,
		   recs = operation.getRecords(),
		   raw = [];
		   
		   operation.setStarted();
		   recs.forEach(function(e) { raw.push(e.data); });
		   this.doPouch(function(db) {
		   		    db.bulkDocs({ docs :raw },
		   				function (err,response){
						    if (err) pp("Error from pouch bulkDocs in update:",
								err, "resp:", response);
						    else
						    { response.forEach( function(r) { pp("Response:", r); }); 
		   				      response.reverse();
		   				      recs.forEach(function(r) {
		   		     				       var resp=response.pop();
		   		     				       r.data._id=resp.id;	  
		   		     				       r.data._rev=resp.rev;	  
		   		     				       r.commit();
		   	     					   });
		   				      me.updateOperation.call(me, err,
		   							      operation,callback,scope);
						    }
	      	   				});
		   		});
		   
	       }
	       
	       ,destroy: function(operation, callback, scope) {
		   log("destroy operation:", operation);
		   var me = this,
		   recs = operation.getRecords();
		   
		   operation.setStarted();
		   this.doPouch(function(db) {
				    
				    recs.forEach(function(record) {
						     log(record);
						     log(record.data._id);
		   				     db.remove(record.data,
		   						function (err,response){
		   						    if (err) pp("Error from pouch remove :",
		   								err, "resp:", response);
		   						    else
		   						    { pp("Response:", response); 
		   						      me.updateOperation.call(me, err,
		   									      operation,callback,scope);
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



