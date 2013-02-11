var data = {
    users: [
        {
            id: 1,
            name: 'Ed Spencer',
            email: '555 1234'
        },
        {
            id: 2,
            name: 'Abe Elias',
            email: '666 1234'
        }
    ]
};


Ext.define(
    'AM.store.Users', {
	extend: 'Ext.data.Store',
	model: 'AM.model.User',
	autoLoad: true
	// ,data:data
	
	,requires: [
	    'lib.ext.proxy.Pouchdb',
            'Ext.data.reader.Json',
            'Ext.data.writer.Json'
	]
	,proxy: {
            type: 'pouchdb',
	    protocol:"idb://",
	    database: mydb,
	    map: function (doc) {
		       emit(doc,null);
	 	   },
	    // reduce: function() {
		
	    // },
	    reduce:false,
            reader: {
		type: 'json',
		root: 'rows',
		record: 'key'
		// successProperty: 'success'
            }
            ,writer: {
		type: 'json',
		nameProperty: 'mapping',
		writeAllFields: true,
		allowSingle: false,
		root: "docs"
            }
	}
    });