//***********************init*******************8
//have to call this otherwise dynamic form won't save
Offline.goOnline();
Date.setInputFormat('YMD');




//**********Left hand side************************ 
//data tree
isc.TreeGrid.
  create({
	   ID: "dataTree",
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
			{ id:'People'}
			,{ id:'AllPeople', parent:'People', title: 'All'}
			,{ id:'Locations'}
			,{ id:'AllLocations', parent:'Locations', title: 'All'}
			,{ id:'Shifts'}
			,{ id:'AllShifts', parent:'Shifts', title: 'All'}
			,{ id:'Calendars'}
			,{ id:'Rosters'}
			,{ id:'Timesheets'}
			
		      ]
		    })
	 });


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
	     {showHeader:false, items:[dataTree]},
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
	   ,selectedTab: 0,
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
