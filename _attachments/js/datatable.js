var  savedCriteria, savedAdvCriteria, usingSimpleFilter= true;

function getGridState() {
  return {
    state: dataTable.getViewState(),
    criteria : dataTable.getFilterEditorCriteria(),
    advCriteria: savedAdvCriteria,
    usingSimpleFilter: usingSimpleFilter
  };
}


function setGridState(state) {
  dataTable.setViewState(state.state);
  setSimpleFilter(state.usingSimpleFilter, state.criteria);
  advancedFilter.setCriteria(state.advCriteria);
  dataTable.filterData(state.advCriteria);
}


isc.ListGrid.create(
  {   ID: "dataTable",
      dataSource: pouchDS,
      useAllDataSourceFields:true,
      //looks
      alternateRecordStyles:true, 
      //behaviour
      selectionType:"single",
      // headerAutoFitEvent:"doubleClick",
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
	console.log(record, "Selected Record");
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
	 title:"Save Form Data", click:'saveFormData(editForm)'},
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
      numCols:3,
      // colWidths:[30,150,30,150],
      margin:3,
      cellPadding:5,
      autoFocus:false
  });
function saveFormData(form) {
  if (!form.validate()) return; 
  console.log(form.getValues());
  var newValues = form.getValues();
  
  pouchDS.updateData(newValues, function(resp, data, req) { editForm.setValues(data); console.log(resp,data,req);});
  

}

//-----------------------Filter Builder--------------------------------------
isc.FilterBuilder.create({
			   ID:"advancedFilter"
			   // ,topOperatorAppearance: "inline"
			   ,dataSource:"pouchDS",
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
		     title:"Apply",
		     width:50,
		     click : function () {
		       savedAdvCriteria = advancedFilter.getCriteria(); 
		       dataTable.filterData(savedAdvCriteria);
		     }
		   });


isc.IButton.create({
		     ID:"clearSimpleFilterButton",
		     title:"Clear",
		     // layoutAlign: 'right',
		     width:50,
		     hieght:50,
		     click : function () {
		       dataTable.clearCriteria();
		       dataTable.filterData(savedAdvCriteria);
		     }
		   });


isc.IButton.create({
		     ID:"clearAdvFilterButton",
		     title:"Reset",
		     width:50,
		     click : function () {
		       advancedFilter.clearCriteria();
		       filterButton.click();
		     }
		   });

function setGridState(state) {
  dataTable.setViewState(state.state);
  setSimpleFilter(state.usingSimpleFilter);
  advancedFilter.setCriteria(state.savedAdvCriteria);
  dataTable.filterData(state.savedAdvCriteria);
}

function setSimpleFilter(use, criteria) {
  if (use) {
    simpleFilterToggle.setIcon('toggleOn.png');
    dataTable.setShowFilterEditor(true);
    dataTable.setFilterEditorCriteria(criteria);
    clearSimpleFilterButton.show(true);    
  }
  else {
    simpleFilterToggle.setIcon('toggleOff.png');
    savedCriteria = dataTable.getFilterEditorCriteria();
    dataTable.clearCriteria();
    dataTable.setShowFilterEditor(false);
    clearSimpleFilterButton.hide(true);    
  }
  
}

isc.Label.create({
		   ID:'simpleFilterToggle',
		   height: 20,
		   width:50
		   ,iconClick: function() {
		     usingSimpleFilter = (usingSimpleFilter ^ true) ? true : false;
		     setSimpleFilter(usingSimpleFilter, null);
		     dataTable.filterData(savedAdvCriteria);
		     if (usingSimpleFilter) dataTable.filterData(savedCriteria);
		     // if (!usingSimpleFilter) {
		       // clearSimpleFilterButton.click();
		     // }
		     
		   }
		   // padding: 10,
		   ,align: "left",
		   valign: "center",
		   wrap: false
		   ,icon: usingSimpleFilter ? "toggleOn.png" : "toggleOff.png"
		   // showEdges: true,
		   // ,contents: "<i>Approved</i> for release"
		   ,contents: "Using simple filter editor"
		 });

isc.IButton.create({
		     ID:"clearAdvFilterButton",
		     title:"Reset",
		     width:50,
		     click : function () {
		       advancedFilter.clearCriteria();
		       filterButton.click();
		     }
		   });

isc.IButton.create({
		     ID:"saveStateButton",
		     title:"Store table",
		     width:100,
		     click : function () {
		     }
		   });

isc.VLayout.create({
		    ID:'filterStack',
		    membersMargin:10,
		    align:'left',
 		    members:[ advancedFilter
			      ,isc.HLayout.create({height: 30, members: [filterButton, isc.LayoutSpacer.create({width:'*'}),clearAdvFilterButton]})
			      ,isc.HLayout.create({height: 30, membersMargin:15, members: [ simpleFilterToggle, clearSimpleFilterButton]})
			      ,isc.HLayout.create({height: 30, membersMargin:15, members: [ saveStateButton ]})
]
		  });

isc.TabSet.
  create({
	   ID: "tabSet",
	   tabBarPosition: "top"
	   ,height:'60%'
	   ,selectedTab: 1,
	   tabs: [
	     {title: "Details",
	      pane:editForm
	     }
	     ,{ title: "Filter",
	       pane: filterStack 
	     } 
	     ]
	 });



