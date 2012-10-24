define
({inject: ['pouchDS'],
  factory: function() {
      var  savedCriteria, savedAdvCriteria, usingSimpleFilter= true;
      // var leaf;
      var API = {};
      //only one...
      var observer;
      // var modified;
          
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
          // console.log('getting table state'); 
          //isc.JSON.encode(
          var state =  {
	      grid: dataTable.getViewState(),
	      criteria : dataTable.getFilterEditorCriteria(),
	      advCriteria: savedAdvCriteria,
	      usingSimpleFilter: usingSimpleFilter,
              //editor
              hidden: false,
              tab: tabSet.getSelectedTabNumber(),
              height:dataTable.getHeight()
              ,isExpanded: stack.sectionIsExpanded('Editor')

          };
          // pp('getting table editor state', state.editor);
          return state;
      } 
      
      API.getState = getTableState;

      function setTableState(state) {
          //to 
          // if (!state) state = '{}';
          // pp('before',state);
          // else state = isc.JSON.decode(state);
          // pp('after',state.state);
          pp('setting table state: ' ,  state);
          if (state) {
              // state = isc.JSON.decode(state);
              dataTable.setViewState(state.grid);
              useSimpleFilter(state.usingSimpleFilter, state.criteria);
              advancedFilter.setCriteria(state.advCriteria);
              dataTable.filterData(state.advCriteria);
              tabSet.selectTab(state.tab);
              // if (state.editor.height > stack.getHeight() - 26)
              //     dataTable.setHeight(stack.getHeight() - 26);
              // else dataTable.setHeight(state.editor.height);
              if (state.isExpanded) stack.expandSection('Editor');
              else stack.collapseSection('Editor');
              if (state.hidden) stack.hideSection('Editor');
              else stack.showSection('Editor');
          }
         // else tableViewStateChanged();
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
      function tableViewStateChanged(origin){
          console.log('**************table changed: ' + origin);
          
          // if (display.init) {
          // 	console.log('setting init to false');
          // 	display.init = false;
          // 	return;
          // }
          // console.log('modified');
          // storeTableViewState();
          //let our observer know and give him the new state
          if (observer) observer();
          // modified = true;
      }
      
      //onViewChange we call when the state of this table changes
      //set by viewTree
      API.setObserver = function (f) {
          console.log('setobserver', f);
          observer = f;
      };
      
      //called from viewTree when a leaf is double clicked
      API.notify = function (newState) {
          pp('**************setting table to new state');
          //to prevent the ext table from producing errors
          setTableState(newState);
          // setTableState(leaf.viewState);
      };
      
      //----------------------components---------------------    
      //----------------@TABLE----------------------------
      var dataTable = isc.ListGrid.create(
          {   
	      ID: "dataTable",
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
	      viewStateChanged: function() { tableViewStateChanged('viewStateChanged') },
	      // 	  showEmptyMessage: true,
	      // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	      // cellContextClick:"return itemListMenu.showContextMenu()",
	      // Function to update details based on selection
	      filterEditorSubmit: function() {
	          console.log('modified filter');
                  tableViewStateChanged('filterEditorSubmit');
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
              tableViewStateChanged('applyAdvFilter');
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
                      if (usingSimpleFilter) usingSimpleFilter = false;
                      else usingSimpleFilter = true;
	              // usingSimpleFilter = (usingSimpleFilter ^ true) ? true : false;
	              useSimpleFilter(usingSimpleFilter, null);
	              dataTable.filterData(savedAdvCriteria);
	              if (usingSimpleFilter) dataTable.filterData(savedCriteria);
	              // if (!usingSimpleFilter) {
	              // clearSimpleFilterButton.click();
	              // }
                      tableViewStateChanged('simpleFilterToggle');
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
	      ID: "tabSet"
              ,tabSelected: function() {
                  tableViewStateChanged('tabSelected');
              }
              ,resized: function() {
                  tableViewStateChanged('tabSetResized');
              }
	      ,tabBarPosition: "top"
	      ,height:'30%'
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
      
      
      var stack = isc.SectionStack.
          create({ 
              ID: 'stack',
	      visibilityMode:"multiple",
	      animateSections:true
              // ,sectionHeaderClick: function() {
              //     console.log('sectionHeaderClick');
              // }
              ,onSectionHeaderClick :function() {
                  if (stack.sectionIsExpanded('Editor')) 
                      stack.collapseSection('Editor');
                  else stack.expandSection('Editor');
                  tableViewStateChanged('sectionHeaderClick');
                  return false; }
              // ,showExpandControls : false
	      ,sections:[
		  {ID: 'grid', name:'Table', showHeader:false, false: true, title:'Data', items:[dataTable]}
		  // ,{name: 'calendar', title:"Calendar", expanded:true, hidden: false,items:[shiftCalendar]}
		 ,{ID: 'g2', name: 'Editor', title:"Edit", expanded:true,  hidden: false, items:[tabSet]}
	      ]
	  });
      //need to do this, the sectionstack seems to show the first section regardless of its hidden prop.
      // rightSideLayout.hideSection('Table');
      
      //------------------@API----------------------------- 
      //for use in layout to show these components
      API.grid = stack;
      // API.editor = tabSet;
      return API;
      // return {
      //   editor: tabSet,
      //   grid: dataTable,
      //   display: display
      // };
  }});
