Ext.define('AM.view.user.List' ,{
	       
    extend: 'Ext.grid.Panel',
    alias : 'widget.userlist',

    title : 'All Users',
    store: 'Users',

    columns: [
        {header: '_id',  dataIndex: '_id',  flex: 1},
        {header: '_rev',  dataIndex: '_rev',  flex: 1},
        {header: 'Name',  dataIndex: 'name',  flex: 1},
        {header: 'Email', dataIndex: 'email', flex: 1}
    ]
});
