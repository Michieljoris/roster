//***********************init*******************8
//have to call this otherwise dynamic form won't save
Offline.goOnline();
Date.setInputFormat('YMD');

isc.ToolStripButton.create({
    ID: "loginButton",    
    // icon: "other/printer.png",  
    title: "Logout"
    
});
isc.ToolStrip.create({
    ID: "gridEditControls",
    // width: "100%", height:24, 
    members: [
        // isc.Label.create({
        //     padding:5,
        //     ID:"totalsLabel"
        // }),
      loginButton
        ,isc.LayoutSpacer.create({ width:"*" })
      
        ,isc.ToolStripButton.create({
            icon: "[SKIN]/actions/add.png", 
            prompt: "Create a new view",
            click: "viewTree.removeSelectedData()"
        })
        ,isc.ToolStripButton.create({
            icon: "[SKIN]/FileBrowser/createNewFolder.png", 
            prompt: "Create a new folder",
            click: "viewTree.removeSelectedData()"
        })
        ,isc.ToolStripButton.create({
            icon: "[SKIN]/actions/edit.png",
            prompt: "Rename selected item",
            click: function () {
                var record = viewTree.getSelectedRecord();
                if (record == null) return;
               viewTree.startEditing(viewTree.data.indexOf(record));
            }
        })
        ,isc.ToolStripButton.create({
            icon: "[SKIN]/actions/remove.png", 
            prompt: "Remove selected item",
            click: "viewTree.removeSelectedData()"
        })
    ]
});

    isc.Tree.create({
				  ID:'mytree',
        modelType: "parent",
        nameProperty: "EmployeeId",
        idField: "EmployeeId",
        parentIdField: "ReportsTo",
		     // dataChanged:function() {
		     //   console.log('data changed in the tree');
		     // },
    // dataChanged : function () {
    //     this.Super("dataChanged", arguments);
    //     var totalRows = this.data.getLength();
    //     if (totalRows > 0 && this.data.lengthIsKnown()) {
    //         totalsLabel.setContents(totalRows + " Records");
    //     } else {
    //         totalsLabel.setContents("&nbsp;");
    //     }
    // },
		      
		      
		      
        data: [
            {EmployeeId:"4", ReportsTo:"1", Name:"Charles Madigen"},
            {EmployeeId:"188", ReportsTo:"4", Name:"Rogine Leger"},
            {EmployeeId:"189", ReportsTo:"4", Name:"Gene Porter"},
            {EmployeeId:"265", ReportsTo:"189", Name:"Olivier Doucet"},
            {EmployeeId:"264", ReportsTo:"189", Name:"Cheryl Pearson"}
        ]
    });




isc.TreeGrid.create({
		      ID: "viewTree",
		      canDragRecordsOut:true,
		      canAcceptDroppedRecords:true,
		      canEdit: true
		      // ,dataSource:'pouchDS'      
		      ,useAllDataSourceFields:true,
		      canReorderRecords: true,
		      canAcceptDroppedRecords: true
		      ,data:mytree 
	  ,showHeader:false
		      // dataSource:'pouchDS',
		      ,autoFetchData:true
		      ,gridComponents:[gridEditControls, "header", "body" ]
		      // ,fetchData:function() {
		      // 	console.log('fetchdata changed in the treegrid');
		      // }
		      
		      
		      ,fields:[{
				 title:"Name",
				 name:"Name",
				 length:128,
				 type:"text"
			       },
			       {
				 title:"Employee ID",
				 primaryKey:true,
				 name:"EmployeeId",
				 type:"integer",
				 required:true
			       },
			       {
				 // title:"Manager",
				 // detail:false,
				 rootValue:"1",
				 name:"ReportsTo",
				 type:"integer",
				 required:true,
				 foreignKey:"pouchDS.EmployeeId"
			       },
			       {
				 // title:"Title",
				 name:"Job",
				 length:128,
				 type:"text"
			       }]

		      // customize appearance
		      // width: 500,
		      // height: 400,
		      // nodeIcon:"icons/16/person.png",
		      // folderIcon:"icons/16/person.png",
		      // showOpenIcons:false,
		      // showDropIcons:false,
		      // closedIconSuffix:""
		    });

//**********Left hand side************************ 
//data tree
// isc.TreeGrid.
//   create({
// 	   ID: "viewTree",t
// 	   dataSource: pouchDS,
// 	   autoFetchData:true,
// 	     fields: [
//         {name: "viewName"},
//         {name: "_id"}
//     ],
// 	   // showHeader:false,
//     	   // nodeClick: function() {
//     	   //   console.log("Hello from nodeClick");

//     	   // },
//     	   // nodeContextClick: function() {
//     	   //   console.log("Hello from nodeContextclick");
//     	   // },
	   
//     	   // leafClick: function() {
//     	   //   console.log("Hello from leafclick");
	     
//     	   // },
//     	   // leafContextClick: function() {
//     	   //   console.log("Hello from leafContextclick");
//     	   // },
// 	   data: isc.Tree.
// 	     create({
// 		      modelType: "parent",
// 		      nameProperty: "viewName",
// 		      idField: "_id",
// 		      parentIdField: "treeParent",
// 		      data: [
// 			// shifts, locations, people, roles, calendars, timesheets, rosters,
// 			// specialized rosterviews, admin
// 			{ _id:'All', viewName :'rootnode'}
// 			,{ id:'myleaf', treeParent:'All', viewName: 'myleaf name'}
// 			// ,{ id:'Locations'}
// 			// ,{ id:'AllLocations', parent:'Locations', title: 'All'}
// 			// ,{ id:'Shifts'}
// 			// ,{ id:'AllShifts', parent:'Shifts', title: 'All'}
// 			// ,{ id:'Calendars'}
// 			// ,{ id:'Rosters'}
// 			// ,{ id:'Timesheets'}
			
// 		      ]
// 		    })
// 	 });


isc.TreeGrid.
  create({
	   ID: "adminTree",
	   showHeader:false,
    	   nodeClick: function() {
    	     console.log("Hello from nodeClick");
	     
    	   },
    	   nodeContextClick: function() {
    	     console.log("Hello from nodeContextclick");
    	   },
	   
    	   leafClick: function() {
    	     console.log("Hello from leafclick");
	     
    	   },
    	   leafContextClick: function() {
    	     console.log("Hello from leafContextclick");
    	   },
	   data: isc.Tree.
	     create({
		      modelType: "parent",
		      nameProperty: "title",
		      idField: "id",
		      parentIdField: "parent",
		      data: [
			// shifts, locations, people, roles, calendars, timesheets, rosters,
			// specialized rosterviews, admin
			{ id:'Printing'}
			,{ id:'Rosters', parent:'Printing'}
			,{ id:'Settings'}
			,{ id:'Roles'}
			,{ id:'AllRoles', parent:'Roles', title: 'All'}
			
		      ]
		    })
	 });

//help section
isc.HTMLPane.
  create({
	   ID:"helpCanvas",
	   height:'25%',
	   contentsURL:'helptext.html'
	   ,overflow:"auto",
	   styleName:"defaultBorder",
	   padding:10
	 });

//left hand side layout 
isc.SectionStack.
  create({ ID:"leftSideLayout",
	   visibilityMode:"multiple",
	   animateSections:true,
	   showResizeBar:true,
	   visibilityMode:'multiple',
	   width:200,
	   sections:[
	     {showHeader:false, items:[viewTree]},
	     {title:"Admin", expanded:false, autoShow:true, items:[adminTree]},
	     {title:"Help", expanded:false,  items:[helpCanvas]}
	   ]
	 });

//*********************right hand side*************************
//TABLE
isc.ListGrid.create(
    {   ID: "dataTable",
	dataSource: pouchDS,
	useAllDataSourceFields:true,
	//looks
	alternateRecordStyles:true, 
	//behaviour
	selectionType:"single",
	headerAutoFitEvent:"doubleClick",
	canHover:true,
	canReorderRecords:true,
	autoFetchData: true,
	//editing
	recordClick:"this.updateDetails()",
	canEdit:true,
	modalEditing:true,
	cellChanged:"this.updateDetails()",
	editByCell: true,
	//filteringg
	showFilterEditor:true,
	filterOnKeypress: true,
	 allowFilterExpressions: true,
    // 	  showEmptyMessage: true,
    // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	// cellContextClick:"return itemListMenu.showContextMenu()",
	// Function to update details based on selection
	updateDetails : function () {
            var record = this.getSelectedRecord();
	    console.log(record, "Recorod");
            // if (record == null) return itemDetailTabs.clearDetails();
	    editForm.editRecord(record);
	    // console.log(record);
            // if (itemDetailTabs.getSelectedTabNumber() == 0) {
	    // 	// View tab: show selected record
	    // 	itemViewer.setData(record);
            // } else {
	    // 	// Edit tab: edit selected record
	    // 	itemDetailTabs.updateTab("editTab", editForm);
	    // 	editForm.editRecord(record);
            // }
	   // return 0;
	}
    });

isc.DynamicForm.create(
    {   ID:"editForm",
	dataSource:pouchDS,
	useAllDataSourceFields:true
	 // ,overflow:'auto'	
	,titleOrientation: 'top'
	,fields:[
	    // {name:"_id"},
	    // {name:"_rev"},
	    // {name:"text"},
	    {name:"editnew", type:"button", width:130,
	     title:"Create New Item", click:"dataTable.startEditingNew()"},
	    {name:"save", type:"button", width: 130,
	     title:"Save Form Data", click:"dataTable.startEditingNew()"},
	    {name:"delete", type:"button",
	     width:130, title:"Delete Selected Item", click:"dataTable.removeSelectedData();"}
	    // {name:"savebtn", type:"button",
	    //  width:100, title:"Save Item", click:"editForm.saveData()"}
	    // ,{name:"updatebtn", type:"button",
	    //  width:100, title:"Update Item", click:"editForm.saveData()"}
	    // ,{name:"deletebtn", type:"button", 
	    //  width:100, title:"Delete Item", click:"dataTable.removeSelectedData();"}
	],
	width:650,
	numCols:6,
	// colWidths:[30,150,30,150],
	margin:3,
	cellPadding:5,
	autoFocus:false
    });

isc.FilterBuilder.create({
    ID:"advancedFilter",
    dataSource:"pouchDS",
    criteria: { _constructor: "AdvancedCriteria",
        operator: "and", criteria: [
            {fieldName: "group", operator: "iEquals", value: ""}
            // {operator: "or", criteria: [
            //     {fieldName: "countryName", operator: "iEndsWith", value: "land"},
            //     {fieldName: "population", operator: "lessThan", value: 3000000}
            // ]}
        ]
    }
});

isc.IButton.create({
    ID:"filterButton",
    title:"Filter",
    click : function () {
        dataTable.filterData(advancedFilter.getCriteria());
    }
});

isc.VStack.create({
		    ID:'filterStack',
		    membersMargin:10,
		    members:[ advancedFilter, filterButton]
		  });

isc.TabSet.
  create({
	   ID: "tabSet",
	   tabBarPosition: "top"
	   ,height:'60%'
	   ,selectedTab: 1,
	   tabs: [{ title: "Filter",
		    pane: filterStack 
		  }, 
		  {title: "Item",
		   pane:editForm
		  }]
	 });

// isc.VLayout.create({
// 		      ID:'rightSideLayout', 
// 		      members: [
// 			dataTable,ds3
// 		      ]
// 		    });

// //right hand side layout
isc.SectionStack.
  create({ ID:"rightSideLayout",
	   visibilityMode:"multiple",
	   animateSections:true,
	   sections:[
	     {showHeader:false, title:'Data', autoShow:true, items:[dataTable]},
	     {title:"Edit", expanded:true, autoShow:true, items:[tabSet]}
	   ]
	 });

//**************************main layout************************
isc.HLayout.
  create({ ID: 'mainLayout' 
	   ,width: "100%",
	   height: "100%",
	   members: [
	     leftSideLayout,
	     rightSideLayout
	   ]
	 });

isc.Page.setEvent("load", "mainLayout.redraw()");
