Ext.define('AM.controller.Users', {
    extend: 'Ext.app.Controller'

    ,stores: ['Users']

    ,models: ['User']

    ,views: ['user.Edit', 'user.List'],

    refs: [
        {
            ref: 'usersPanel',
            selector: 'panel'
        }
    ],

    init: function() {
        this.control({
            'viewport > userlist dataview': {
                itemdblclick: this.editUser
            },
            'useredit button[action=save]': {
                click: this.updateUser
            },
            'useredit button[action=delete]': {
                click: this.deleteUser
            },
            'useredit button[action=create]': {
                click: this.createUser
            }
        });
    },

    editUser: function(grid, record) {
        var edit = Ext.create('AM.view.user.Edit').show();

        edit.down('form').loadRecord(record);
    	edit.grid=grid;
    }

    ,updateUser: function(button) {
        var win    = button.up('window'),
            form   = win.down('form'),
            record = form.getRecord(),
            values = form.getValues();

        record.set(values);
        win.close();
        this.getUsersStore().sync();
    }
	       
    ,createUser: function(button) {
        var win    = button.up('window'),
            form   = win.down('form'),
            record = form.getRecord(),
            values = form.getValues();
    	var newuser=Ext.create('AM.model.User',values);
    	// console.log(values);
    	// console.log(newuser);
    	// console.log(record);
        this.getUsersStore().insert(0,newuser);
	
        win.close();
        this.getUsersStore().sync();
    }
    	       // var sm = grid.getSelectionModel();
               //  rowEditing.cancelEdit();
               //  store.remove(sm.getSelection());
               //  if (store.getCount() > 0) {
               //      sm.select(0);
	       
    ,deleteUser: function(button) {
        var win    = button.up('window'),
            form   = win.down('form'),
            record = form.getRecord(),
            values = form.getValues();
    	var sm = win.grid.getSelectionModel(),
    	store = this.getUsersStore();	
	
    	store.remove(sm.getSelection());
	
        // record.set(values);
        win.close();
        this.getUsersStore().sync();
    }
});
