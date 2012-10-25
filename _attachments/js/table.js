define
({inject: ['roster', 'pouchDS'],
  factory: function(roster, pouchDS) {
      var  savedCriteria, savedAdvCriteria, usingSimpleFilter= true, usingAdvFilter;
      var groups;
      var currentHeight= 300;
      var settings = {}; //TODO put above persistables in settings..
      
      var API = {};
      //only one observer...
      var observer;
          
      //--------------------@handling state----------------------------- 
      function useSimpleFilter(bool, criteria) {
          if (bool) {
	      simpleFilterToggle.setIcon('toggleOn.png');
	      dataTable.setShowFilterEditor(true);
              console.log('setting simple criteria:', criteria);
	      dataTable.setFilterEditorCriteria(criteria);
	      clearSimpleFilterButton.show(true);}
          else {
	      simpleFilterToggle.setIcon('toggleOff.png');
	      savedCriteria = dataTable.getFilterEditorCriteria();
	      dataTable.clearCriteria();
	      dataTable.setShowFilterEditor(false);
	      clearSimpleFilterButton.hide(true);}}
      
      function getTableState() {
          var state =  {
	      grid: dataTable.getViewState(),
	      criteria : dataTable.getFilterEditorCriteria(),
	      advCriteria: savedAdvCriteria,
	      usingSimpleFilter: usingSimpleFilter,
              
              usingAdvFilter: usingAdvFilter,
              isObjectGroupListVisible: objectGroupList.isVisible(),
              groups: isc.JSON.encode(groups),
              
              //editor
              hidden: false,
              tab: tabSet.getSelectedTabNumber(),
              height: (function() {
                  if (stack.sectionIsExpanded('Editor')) 
                      return dataTable.getHeight();
                  return currentHeight;
              })(),
              isExpanded: stack.sectionIsExpanded('Editor')
          };
          return state;
      } 
      
      API.getState = getTableState;

      function setTableState(state) {
          // pp('setting table state: ' ,  state);
          if (state) {
              usingSimpleFilter = state.usingSimpleFilter;
              usingAdvFilter = state.usingAdvFilter;
              // isObjectGroupListVisible = state.isObjectGroupListVisible;
              groups = isc.JSON.decode(state.groups);
              // console.log(groups);
              objectGroupList.setSelection(groups);
              showObjectGroupList(state.isObjectGroupListVisible);
              objectGroupLabel.setLabel(groups);
              dataTable.setViewState(state.grid);
              
              savedCriteria = state.criteria;
              savedAdvCriteria = state.advCriteria;
              advancedFilter.setCriteria(state.advCriteria);
              dataTable.filterData(state.advCriteria);
              tabSet.selectTab(state.tab);
              useSimpleFilter(usingSimpleFilter, state.criteria);
              
              useAdvFilter(usingAdvFilter);
              dataTable.setHeight(state.height);
              currentHeight = state.height;
              if (state.isExpanded) {
                  stack.expandSection('Editor');   
                  dataTable.setHeight(currentHeight);
              }
              else stack.collapseSection('Editor');
              if (state.hidden) stack.hideSection('Editor');
              else stack.showSection('Editor');
          }
          // pp('****************finished setting table state');
      }
      
      //called when table's view is modified
      function tableViewStateChanged(origin){
          // console.log('**************table changed: ' + origin);
          if (observer) observer();
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
              showDetailFields: false, 
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
              ,fields: roster.tagGroups.role
              // ,fields: [         
              //     {name:"_rev"}
              //     ,{name:"startDate", type: "datetime", group: ['shift']}
              //     ,{name:"person", type: 'ref', group: ['shift']} //ref to person obj ,,,change to person..
              //     ,{name:"endDate", type: "datetime", group: ['shift']}
              //     ,{name:"group"} //shift, location, person, role
              //     ,{name:"_id", primaryKey:true}
              //     ,{name:"location", group: ['shift']} //ref to loc object,,, change to location
              // ]
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
      
      // var filterFields = [
      //     { name: 'group', type: 'string'}
      // ];
      
      // isc.DataSource.create({
      //     ID: 'filterFieldsDS',
      //     fields: filterFields,
      //     clientOnly:true
      // });
      // var testData =[];

      // for (var i=0; i<1; i++) {
      //     testData[i] = { name: "field"+i, title: "Field "+i, type: "text" };
      // }

      // isc.DataSource.create({
      //     ID: "bigFilterDS",
      //     clientOnly: true,
      //     fields: [
      //         { name: "name", type: "text" },
      //         { name: "title", type: "text" },
      //         { name: "type", type: "text" }
      //     ],
      //     testData: [{name:'group', title: 'group', type: 'text'}]
      // });
      
      var test2 = isc.DataSource.create({
          ID: "test2",
          clientOnly: true,
          fields: [
              { name: "name", type: "text" },
              { name: "title", type: "text" },
              { name: "type", type: "text" }
          ],
          cacheData: [{name:'location', title: 'location', type: 'text'}]
      });
      
      test2.setCacheData( [{name:'bla', title: 'bla', type: 'text'}]);
      //-----------------------@FILTER BUILDER--------------------------------------
      var advancedFilter = isc.FilterBuilder.
          create({ ID:"filter"
	           // ,topOperatorAppearance: "inline"
	           // ,dataSource:"pouchDS"
                   // ,dataSource: 'filterFieldsDS'
                   ,fieldDataSource: 'test2'
	           // ,criteria: { _constructor: "AdvancedCriteria",
		   //             operator: "and", criteria: [
		   //                 {fieldName: "group", operator: "iEquals", value: ""}
		   //                 // {operator: "or", criteria: [
		   //                 //     {fieldName: "countryName", operator: "iEndsWith", value: "land"},
		   //                 //     {fieldName: "population", operator: "lessThan", value: 3000000}
		   //                 // ]}
		   //                 ]
		   //               }
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
	  title:"Filter",
	  width:50,
	  click : function () {
	      savedAdvCriteria = advancedFilter.getCriteria(); 
	      dataTable.filterData(savedAdvCriteria);
              tableViewStateChanged('applyAdvFilter');
	      // storeTableViewState();
	  }
      });
      
      var advancedFilterButtons = isc.HLayout.
	  create({height: 30, 
		  members: [filterButton, 
			    isc.LayoutSpacer.create({width:'*'}),
			    clearAdvFilterButton]});


      var clearSimpleFilterButton = isc.IButton.create({
	  // ID:"clearSimpleFilterButton",
	  title:"Clear inline filter",
	  // layoutAlign: 'right',
	  width:150,
	  hieght:50,
	  click : function () {
	      dataTable.clearCriteria();
	      dataTable.filterData(savedAdvCriteria);
              tableViewStateChanged('clearSimpleFilter');
	  }
      });

      var simpleFilterToggle = 
          isc.Label.create(
	      { ID:'simpleFilterToggle',
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
	          ,contents: "Simple filter"
	          
	      });
      
      
      function useAdvFilter(bool, criteria) {
          if (bool) {
	      advFilterToggle.setIcon('toggleOn.png');
              advancedFilter.show(true);
              advancedFilterButtons.show(true);
	      // dataTable.setShowFilterEditor(true);
              // console.log('setting simple criteria:', criteria);
	      // dataTable.setFilterEditorCriteria(criteria);
	      // clearSimpleFilterButton.show(true);
          }
          else {
	      advFilterToggle.setIcon('toggleOff.png');
              advancedFilter.hide(false);
              advancedFilterButtons.hide(false);
	      // savedCriteria = dataTable.getFilterEditorCriteria();
	      // dataTable.clearCriteria();
	      // dataTable.setShowFilterEditor(false);
	      // clearSimpleFilterButton.hide(true);
          }
      }
      
      var advFilterToggle = 
          isc.Label.create(
	      { ID:'advFilterToggle',
	          height: 20,
	          width:50
	          ,iconClick: function() {
                      if (usingAdvFilter) usingAdvFilter = false;
                      else usingAdvFilter = true;
	              useAdvFilter(usingAdvFilter, null);
	              // dataTable.filterData(savedAdvCriteria);
	              // if (usingSimpleFilter) dataTable.filterData(savedCriteria);
	              // if (!usingSimpleFilter) {
	              // clearSimpleFilterButton.click();
	              // }
                      tableViewStateChanged('advFilterToggle');
	              
	          }
	          // padding: 10,
	          ,align: "left",
	          valign: "center",
	          wrap: false
	          ,icon: usingAdvFilter ? "toggleOn.png" : "toggleOff.png"
	          // showEdges: true,
	          // ,contents: "<i>Approved</i> for release"
	          ,contents: "Advanced filter"
	          
	      });
      
     //-------------------------------------------------------------------------------- 
      var objectGroupList = isc.ListGrid.create({
          ID: "objectGroupList",
          width:100, height:140, alternateRecordStyles:true,
	  autoFetchData: true,
          // showHeader:false,
          selectionAppearance:"checkbox"
          ,fields: [{name: 'group', title: 'type'}]
          ,data: (function() {
              return roster.groups.map(function(g) {
                  return { group : g };
              });})()
          ,selectionChanged: function() {
              var sel = objectGroupList.getSelection();
              var contents = '';
              groups = sel.map(function(g) {
                  return g.group;
              });
              
              objectGroupLabel.setLabel(groups);
              tableViewStateChanged();
          }
          ,setSelection: function(groups) {
            objectGroupList.deselectAllRecords();  
              objectGroupList.getData().forEach(function(e) {
                  if (groups.contains(e.group)) objectGroupList.selectRecord(e);
                  
              });
          }
      }); 
      
      var objectGroupLabel = isc.Label.create(
          {
              ID: 'mylabel',
              width:'100%',
              // contents: 'People',
              setLabel: function(groups) {
                  // console.log(groups);
                  var contents = '';
                  groups.forEach(function(g) {
                      //TODO format nicely, with capitals and commas
                      contents += g + ' ';
                  });
                  this.setContents(contents);
              }
          }         
      );
      var selectObjectGroupButton = isc.Button.create({
	  title:"Select",
	  width:50,
	  height:20,
	  click : function () {
              // var isObjectGroupListVisible = objectGroupList.isVisible(); //isObjectGroupListVisible ? false : true;
              showObjectGroupList(!objectGroupList.isVisible());
              tableViewStateChanged();
	  }
      });
      
      function showObjectGroupList(bool) {
          if (bool)  {
              objectGroupList.show(true);
              selectObjectGroupButton.setTitle('Done');
          }
          else {
              objectGroupList.hide(true);   
              //apply group selection
              console.log(groups);
              
              // advancedFiltero
              var fields = roster.getTags(groups);
              console.log(fields);
              dataTable.setFields(roster.getTags(groups));
              
              test2.setCacheData(roster.getTags(groups));
              advancedFilter.setCriteria();
              selectObjectGroupButton.setTitle('Edit');
          }
      }
      
      var objectGroupLine = isc.HLayout.
	  create({height: 30, 
		  members: [objectGroupLabel, 
			    isc.LayoutSpacer.create({width:'*'}),
			    selectObjectGroupButton]});

      var filterStack = isc.VLayout.
          create(
	      {// ID:'filterStack',
	          membersMargin:10,
	          align:'left',
 	          members:
	          [
                      objectGroupLine
                      ,objectGroupList
	              ,isc.HLayout.
	                  create({height: 30, 
		                  membersMargin:15, 
		                  members: [ simpleFilterToggle, clearSimpleFilterButton]})
                      ,advFilterToggle
                      ,advancedFilter
                      ,advancedFilterButtons
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
                  if (stack.sectionIsExpanded('Editor')) {
                      //save height
                      currentHeight = dataTable.getHeight();
                      stack.collapseSection('Editor');
                  }
                  else {
                      stack.expandSection('Editor');   
                      dataTable.setHeight(currentHeight);   
                  }
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
