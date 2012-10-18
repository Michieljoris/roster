define
({inject: ['pouchDS'],
  factory: function() {
      var  savedCriteria, savedAdvCriteria, usingSimpleFilter= true;
      // var leaf;
      var API = {};
      //only one...
      var observer;
          
      //--------------------@handling state----------------------------- 
      function useSimpleFilter(bool, criteria) {
          if (bool) {
	      simpleFilterToggle.setIcon('toggleOn.png');
	      dataTable.setShowFilterEditor(true);
	      dataTable.setFilterEditorCriteria(criteria);
	      clearSimpleFilterButton.show(true);}
          else {
	      simpleFilterToggle.setIcon('toggleOff.png');
	      savedCriteria = dataTable.getFilterEditorCriteria();
	      dataTable.clearCriteria();
	      dataTable.setShowFilterEditor(false);
	      clearSimpleFilterButton.hide(true);}}
      
      function getTableState() {
          return isc.JSON.encode({
	      state: dataTable.getViewState(),
	      criteria : dataTable.getFilterEditorCriteria(),
	      advCriteria: savedAdvCriteria,
	      usingSimpleFilter: usingSimpleFilter});} 

      function setTableState(state) {
          // if (!state) state = "{ }";
          // pp('before',state);
          state = isc.JSON.decode(state);
          // pp('after',state.state);
          dataTable.setViewState(state.state);
          useSimpleFilter(state.usingSimpleFilter, state.criteria);
          advancedFilter.setCriteria(state.advCriteria);
          dataTable.filterData(state.advCriteria);
          pp('****************finished setting table state');
      }
      // API.put = setTableState;
      // API.get= getTableState;
      
      // function storeTableViewState() {
      //   leaf.viewState = getTableState();  
      //   //notify leaf and thus tree and treegrid that the table has changed
      //   //this gives the tree 
      //   leaf.onModified();}
      
      //called when table's view is modified
      function tableViewStateChanged(){
          console.log('**************table changed');
          // if (display.init) {
          // 	console.log('setting init to false');
          // 	display.init = false;
          // 	return;
          // }
          // console.log('modified');
          // storeTableViewState();
          //let our observer know and give him the new state
          observer(getTableState());
      }
      
      //onViewChange we call when the state of this table changes
      //set by viewTree
      API.setObserver = function (f) {
          // console.log('setobserver', f);
          observer = f;
      };
      
      //called from viewTree when a leaf is double clicked
      API.notify = function (newState) {
          pp('**************setting table to new state');
          setTableState(newState);
          // setTableState(leaf.viewState);
      };
      
      //----------------------components---------------------    
      //----------------@TABLE----------------------------
      var dataTable = isc.ListGrid.create(
          {   
	      // ID: "dataTable",
	      dataSource: pouchDS,
	      // useAllDataSourceFields:true,
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
	      viewStateChanged: tableViewStateChanged,
	      // 	  showEmptyMessage: true,
	      // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	      // cellContextClick:"return itemListMenu.showContextMenu()",
	      // Function to update details based on selection
	      filterEditorSubmit: function() {
	          console.log('modified filter');
                  tableViewStateChanged();
	          // storeTableViewState();
	      },
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
              ,fields: [         
                  {name:"_rev"}
                  ,{name:"startDate", type: "datetime", group: ['shift']}
                  ,{name:"person", type: 'ref', group: ['shift']} //ref to person obj ,,,change to person..
                  ,{name:"endDate", type: "datetime", group: ['shift']}
                  ,{name:"group"} //shift, location, person, role
                  ,{name:"_id", primaryKey:true}
                  ,{name:"location", group: ['shift']} //ref to loc object,,, change to location
              ]
          });
      
      //---------------@EDITFORM----------------------------
      var editForm = isc.DynamicForm.create(
          {// ID:"editForm",
	      dataSource:pouchDS,
	      useAllDataSourceFields:true
	      // ,overflow:'auto'	
	      ,titleOrientation: 'top'
	      ,fields:[
	          // {name:"_id"},
	          // {name:"_rev"},
	          // {name:"text"},
	          {name:"editnew", type:"button", width:130,
	           title:"Create New Item", click: function() { dataTable.startEditingNew(); }},
	          // title:"Create New Item", click:"dataTable.startEditingNew()"},
	          {name:"save", type:"button", width: 130,
	           title:"Save Form Data", click: function() { saveFormData(editForm); }},
	          // title:"Save Form Data", click:'saveFormData(editForm)'},
	          {name:"delete", type:"button",
	           width:130, title:"Delete Selected Item", 
	           click:function() { dataTable.removeSelectedData(); }}
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
          pouchDS.updateData(newValues, function(resp, data, req) 
			     { editForm.setValues(data); console.log(resp,data,req);});
          

      }
      
      //-----------------------@FILTER BUILDER--------------------------------------
          var advancedFilter = isc.FilterBuilder.
          create({// ID:"advancedFilter"
	          // ,topOperatorAppearance: "inline",
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
      
          var clearAdvFilterButton = isc.IButton.create({
	      // ID:"clearAdvFilterButton",
	      title:"Reset",
	      width:50,
	      click : function () {
	          advancedFilter.clearCriteria();
	          filterButton.click();
	      }
          });

      var filterButton = isc.IButton.create({
	  // ID:"filterButton",
	  title:"Apply",
	  width:50,
	  click : function () {
	      savedAdvCriteria = advancedFilter.getCriteria(); 
	      dataTable.filterData(savedAdvCriteria);
              tableViewStateChanged();
	      // storeTableViewState();
	      }
      });


      var clearSimpleFilterButton = isc.IButton.create({
	  // ID:"clearSimpleFilterButton",
	  title:"Clear",
	  // layoutAlign: 'right',
	  width:50,
	  hieght:50,
	  click : function () {
	      dataTable.clearCriteria();
	      dataTable.filterData(savedAdvCriteria);
	  }
      });

      var simpleFilterToggle = 
          isc.Label.create(
	      {// ID:'simpleFilterToggle',
	          height: 20,
	          width:50
	          ,iconClick: function() {
	              usingSimpleFilter = (usingSimpleFilter ^ true) ? true : false;
	              useSimpleFilter(usingSimpleFilter, null);
	              dataTable.filterData(savedAdvCriteria);
	              if (usingSimpleFilter) dataTable.filterData(savedCriteria);
	              // if (!usingSimpleFilter) {
	              // clearSimpleFilterButton.click();
	              // }
                      tableViewStateChanged();
	              // storeTableViewState();
	              
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

      var filterStack = isc.VLayout.
          create(
	      {// ID:'filterStack',
	          membersMargin:10,
	          align:'left',
 	          members:
	          [ advancedFilter
	            ,isc.HLayout.
	            create({height: 30, 
		            members: [filterButton, 
			              isc.LayoutSpacer.create({width:'*'}),
			              clearAdvFilterButton]})
	            ,isc.HLayout.
	            create({height: 30, 
		            membersMargin:15, 
		            members: [ simpleFilterToggle, clearSimpleFilterButton]})
	          ]
	      });
      //------------------@TABSET-------------------
      var tabSet = isc.TabSet.
          create({
	      // ID: "tabSet",
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
      
      //------------------@API----------------------------- 
      //for use in layout to show these components
      API.grid = dataTable;
      API.editor = tabSet;
      return API;
      // return {
      //   editor: tabSet,
      //   grid: dataTable,
      //   display: display
      // };
  }});
