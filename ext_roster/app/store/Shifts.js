Ext.define(
    'AM.store.Shifts', {
	// extend: 'Extensible.calendar.data.MemoryEventStore'
	// extend: 'Extensible.calendar.data.EventStore'
	extend: 'Ext.data.Store'
	,model: 'Extensible.calendar.data.EventModel',
	autoLoad: true,
	// data:Ext.create('data.example.Events'),
	
	
	requires: [
	    'lib.proxy.Pouchdb',
            'Ext.data.reader.Json',
            'Ext.data.writer.Json',
            'Extensible.calendar.data.EventModel',
            'Extensible.calendar.data.EventMappings'
	],
	
	proxy: {
            type: 'pouchdb',
	    // protocol:"http://localhost:1234",
	    protocol:"idb://",
	    database:"rosterdb",
	    map: function (doc) {
	     if (doc[Extensible.calendar.data.EventMappings.Group.mapping] === 'shift')  {
		      // if(doc.type === 'shift') {
		       emit(doc,null);
		       }
	 	   },
	    // reduce: function() {
		
	    // },
	    reduce:false,
	    mappings: Extensible.calendar.data.EventMappings,
	    nameProperty: 'mapping',
	    idProperty: 'EventId',
	    revProperty: 'Revision',
	    
            reader: {
		type: 'json',
		root: 'rows',
		record: 'key',
		// read the id property generically, regardless of the mapping:
		idProperty: Extensible.calendar.data.EventMappings.EventId.mapping  || 'id',
		
		// this is also a handy way to configure your reader's fields generically:
		fields: Extensible.calendar.data.EventModel.prototype.fields.getRange()

// Extensible.calendar.EventRecord.prototype.fields.getRange()
		
		// successProperty: 'success'
            },
            writer: {
		type: 'json',
		nameProperty: 'mapping',
		writeAllFields: true,
		allowSingle: false,
		root: "docs"
            }
	},
	// It's easy to provide generic CRUD messaging without having to handle events on every individual view.
        // Note that while the store provides individual add, update and remove events, those fire BEFORE the
        // remote transaction returns from the server -- they only signify that records were added to the store,
        // NOT that your changes were actually persisted correctly in the back end. The 'write' event is the best
        // option for generically messaging after CRUD persistence has succeeded.
        listeners: {
            'write': function(store, operation){
                var title = Ext.value(operation.records[0].data[Extensible.calendar.data.EventMappings.Title.name], '(No title)');
                switch(operation.action){
                case 'create':
                    Extensible.example.msg('Add', 'Added "' + title + '"');
                    break;
                case 'update':
                    Extensible.example.msg('Update', 'Updated "' + title + '"');
                    break;
                case 'destroy':
                    Extensible.example.msg('Delete', 'Deleted "' + title + '"');
                    break;
                }
            }
	},
	
	constructor: function(config) {
            config = config || {};

            this.callParent(arguments);
	}	
    });



// Ext.define(
//     'AM.store.Shifts', {
// 	extend: 'Extensible.calendar.data.MemoryEventStore'
// 	// ,model:'AM.model.Shift'
// 	,data: Ext.create('data.example.Events')
// 	,autoMsg: false
	
	
//     }


// );

