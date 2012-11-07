/*global module:true pp:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:150 devel:true*/

define
({inject: ['roster', 'pouchDS'],
  factory: function(roster, pouchDS) {
      "use strict";
      var currentHeight= 300;
      var groupFilter;
      var state; 
      var defaultState = { height: 300, usingSimpleFilter: true, editableAdvFilter : true
                           ,groups: ["shift"], isExpanded: true, tab: 1, hidden: false};
      
      var API = {};
      //only one observer...
      var observer;
          
      //--------------------@handling state----------------------------- 
      function getTableState() {
          state =  isc.addProperties(state, {
	      grid: dataTable.getViewState(),
	      criteria : dataTable.getFilterEditorCriteria(),
              
              //editor
              hidden: false,
              tab: tabSet.getSelectedTabNumber(),
              height: (function() {
                  if (stack.sectionIsExpanded('Editor')) 
                      return dataTable.getHeight();
                  return currentHeight;
              })(),
              isExpanded: stack.sectionIsExpanded('Editor')
          });
          
          console.log('getTableState', isc.clone(state));
          return isc.clone(state);
      } 
      
      API.getState = getTableState;

      function setTableState(newstate) {
          // console.log('setTableState:', newstate);
          state = isc.addProperties(defaultState, isc.clone(newstate));
          
          //groups
          if (state.groups.length === 0) state.groups = ['shift'];
          setGroupingState();
          objectGroupList.setSelection();
              
          //layout
          tabSet.selectTab(state.tab);
          dataTable.setHeight(state.height);
          if (state.isExpanded) {
              stack.expandSection('Editor');   
              dataTable.setHeight(currentHeight);
          }
          else stack.collapseSection('Editor');
          if (state.hidden) stack.hideSection('Editor');
          else stack.showSection('Editor');
          
          //dataTable state
          dataTable.setViewState(state.grid);
              
          //filters
          advancedFilter.setCriteria(state.savedAdvCriteria);
          // var advancedCriteria = {
          //     _constructor:"AdvancedCriteria",
          //     operator:"and",
          //     criteria:[
          //         // this is a Criterion
          //         { fieldName:"group", operator:"equals", value:"shift" }
          //         // { operator:"or", criteria:[
          //         //     { fieldName:"title", operator:"iContains", value:"Manager" },
          //         //     { fieldName:"reports", operator:"notNull" }
          //         // ]  
          //         // }
          //     ]
              
          // };
          
          
         //TODO filter out the groups in pouchDS by giving extra props
         //to dsrequest in the fetchData call instead of this client filtering
          // var criteria = {
          //     group : 'shift'
          // };
          var appliedCriteria = isc.DataSource.combineCriteria(
              groupFilter,state.savedAdvCriteria);
          // appliedCriteria = advancedCriteria;
          // appliedCriteria = criteria;
          console.log('Applied Criteria', appliedCriteria);
          module.temp = appliedCriteria;
          console.log('will fetch data', dataTable.willFetchData(appliedCriteria));
          if (dataTable.willFetchData(appliedCriteria)) 
              dataTable.fetchData(undefined, 
                                  function() {
                                      dataTable.setCriteria(appliedCriteria);
                                      console.log('fetch completed');});
          else dataTable.setCriteria(appliedCriteria);
          
          // dataTable.setCriteria(criteria);
          //                     { myprop: 'blablabla'});
          // dataTable.setCriteria(appliedCriteria);
          // useSimpleFilter(state.usingSimpleFilter, appliedCriteria);
          layoutFilters(false); //start in normal mode
          setAdvFilterVisible(state.editableAdvFilter);
          
          setFilterDescription();
          //TODO alternative would be to remember the selectiion in the
          //table and also to only enable the update/save button when the
          //record has been edited
          editForm.getField('editnew').click() ;
          // pp('****************finished setting table state');
      }
      
      
      function setGroupingState() {
          // set the label
          // pp('setGroupingState', state);
          objectGroupLabel.setLabel(state.groups);
              
          //apply group selection by ..
          //get the fields relevant to the group(s)
          var fieldsCloner = roster.getTags(state.groups);
          //select out the non-relevant tags for the table
          dataTable.setFields(fieldsCloner());
          //and also for the advanced filter
          filterFields.setCacheData(fieldsCloner());
          //reset it so the fields take effect
          //this means a change of groups will reset the filter
          advancedFilter.setCriteria(); 
          //we need to set the relevant editor fields
          editForm.setGroupFields(fieldsCloner());
          //we need to filter the group...
          groupFilter = { group : state.groups };
          //this will be combined with the normal filters
          console.log('GROUPFILTER', groupFilter);
          
          // dataTable.filterData(groupFilter);
         
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
	      // autoFetchData: true,
	      //editing
	      recordClick: recordClick, //"this.updateDetails()",
	      canEdit:true,
	      modalEditing:true,
	      cellChanged:"this.updateDetails()",
	      editByCell: true,
	      //filteringg
	      showFilterEditor:true,
	      filterOnKeypress: true,
	      allowFilterExpressions: true,
              showDetailFields: false, 
              filterButtonPrompt: 'Clear filter',
              filterButtonProperties: {
	          click : function () {
	              dataTable.clearCriteria();
	              dataTable.filterData(state.savedAdvCriteria);
                      tableViewStateChanged('clearSimpleFilter');
	          },
                  icon:'clear.png',
                  showRollOverIcon: false,
                  showDownIcon: true
              },
              // headerContextMenu: true,
              // clearFilterText: 'Clear inline filter',
	      viewStateChanged: function() { tableViewStateChanged('viewStateChanged'); },
	      // 	  showEmptyMessage: true,
	      // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	      // cellContextClick:"return itemListMenu.showContextMenu()",
	      // Function to update details based on selection
	      filterEditorSubmit: function() {
	          console.log('modified filter');
                  tableViewStateChanged('filterEditorSubmit');
	          // storeTableViewState();
	      },
	      updateDetails : function (index) {
                  var record;
                 if (index) record = dataTable.getRecord(index); 
                  else record = this.getSelectedRecord();
	          console.log(record, "Selected Record");
	          editForm.editRecord(record);
                  editForm.getField('saveButton').setTitle('Update record');
                  editForm.getField('saveButton').method = 'updateData';
                   editForm.getField('editnew').setDisabled(false);
                  editForm.clearErrors(true);
	      }
          });
      
      function recordClick(viewer, record, recordNum, field, fieldNum, value, rawValue) {
         dataTable.updateDetails(recordNum); 
          
      }
      
      //---------------@EDITFORM----------------------------
      var editForm = isc.DynamicForm.create(
          { ID:"editForm",
	    dataSource:pouchDS
	    // ,useAllDataSourceFields:true
	    // ,overflow:'auto'	
	    ,titleOrientation: 'top'
            ,setGroupFields: function(fields) {
                this.setFields(this.fields.concat(fields));   
            }
	    ,fields:[
	        {name:"editnew", type:"button", width:130,
	         title:"Clear form", click: function()
                 { var newValues = {};
                   if (state.groups.length === 1)
                       newValues.group = state.groups[0];
                   // dataTable.startEditingNew(newValues);
                   dataTable.deselectAllRecords();
                   editForm.setValues(newValues);
                   editForm.getField('saveButton').setTitle('Save form');
                   editForm.getField('saveButton').method = 'addData';
                   // editForm.getField('editnew').setDisabled(true);
                   editForm.clearErrors(true);
                   
                   console.log(dataTable.getSelectedRecord());
                 }
                },
	        {name:"saveButton", type:"button", width: 130, method: 'addData',
	         title:"Save form", click: function() { saveFormData(editForm, this.method); }},
	        {name:"delete", type:"button",
	         width:130, title:"Delete Selected Item", 
	         click:function() { remove(); }}
	    ],
	    width:650,
	    numCols:3,
	    // colWidths:[30,150,30,150],
	    margin:3,
	    cellPadding:5,
	    autoFocus:false
          });
      
      function remove() {
          var selRecord = dataTable.getSelectedRecord();
          if (selRecord) {
              var index = dataTable.getRecordIndex(selRecord);
              // console.log('index of selected item before removing it is: ', index);
              //an async call, so the new selindex has to be one more or less
              dataTable.removeSelectedData();
              
              if (dataTable.getTotalRows() === index + 1) index--;
              else index++;
              // console.log('total rows now is ' + dataTable.getTotalRows());
              // console.log('selecting row: ' + index);
              dataTable.selectRecord(index);
              dataTable.updateDetails(index);
          }
      }
      
      function saveFormData(form, method) {
          if (!form.valuesHaveChanged() || !form.validate()) return; 
          console.log(form.getValues());
          var newValues = form.getValues();
          
          // newValues.group = 'shift';
          // var method = 'addData';
          var f = pouchDS[method];
          var args = [newValues, function(resp, data, req) 
			     {   dataTable.selectRecord(data);
                                 editForm.setValues(data); console.log(resp,data,req);}];
          
          // editForm.getField('editnew').setDisabled(false);
          editForm.getField('saveButton').setTitle('Update record');
          editForm.getField('saveButton').method = 'updateData';
          f.apply(pouchDS, args );
          //pouchDS.addData(newValues, function(resp, data, req) 
	  //{ editForm.setValues(data); console.log(resp,data,req);});
      }
      
      //--------------------@EDIT FILTER SETUP------------------ 
      var editButton = isc.Button.create({
	  title:"Edit",
	  width:50,
	  height:20,
	  click : function () {
              // var isObjectGroupListVisible = objectGroupList.isVisible();
              //isObjectGroupListVisible ? false : true;
              //TODO filter out the right groups...
              layoutFilters(!objectGroupList.isVisible());
              
              
	  }
      });
      
      function layoutFilters(bool) { //
          // console.log('editfilterSetup');
          if (bool) { //more mode
              //reset it in case user has been meddling with it and has not clicked apply
              objectGroupList.setSelection();
              groupSelectWarnLabel.hide(true);
              applyGroupSelectionButton.setDisabled(true);
              selectGroupsRow.show(true);
              advFilterToggle.show(true);
              simpleFilterToggle.show(true);
              editButton.setTitle('Less'); }
          else { //less mode
              selectGroupsRow.hide(true);
              //hide the toggles 
              advFilterToggle.hide(true);
              simpleFilterToggle.hide(true);
              //set the button text back to more 
              editButton.setTitle('More');
          }
      }
      
      
      //-------------@OBJECTGROUPS------------------------------------
      var filterFields = isc.DataSource.create({
          ID: "filterFields",
          clientOnly: true,
          fields: [
              { name: "name", type: "text" },
              { name: "title", type: "text" },
              { name: "type", type: "text" }
          ]
      });
      
      // function makeGroupFilter() {
      //     // var filter = { group : [] };
      //     // state.groups.forEach(function(g){
      //     //     filter.group.push({ group : g }); 
      //     // });
      //     return { group : state.groups };
      // } 
      
      var objectGroupList = isc.ListGrid.create({
          ID: "objectGroupList",
          width:100, 
          alternateRecordStyles:true,
          autoFitData: 'both',
	  autoFetchData: true,
          showHeader:false,
          showHeaderContextMenu:false,
          showHeaderMenuButton:false,
          selectionAppearance:"checkbox"
          ,fields: [{name: 'group', title: 'type'}]
          ,data: (function() {
              return roster.groups.map(function(g) {
                  return { group : g };
              });})()
          ,selectionChanged: function(rec, bool) {
              
              groupSelectWarnLabel.show(true);
              applyGroupSelectionButton.setDisabled(false);
              // console.log('----------selection changed----------');
              // var sel = objectGroupList.getSelection();
              //make sure at least one group is selected, by not
              //letting the user deselect the last one.
              // if (sel.length === 0) {
              //     objectGroupList.selectRecord(rec); 
              //     sel = objectGroupList.getSelection();
              // }
          }
          ,setSelection: function() {
              // console.log('----------setting group selection----------');
              objectGroupList.deselectAllRecords();  
              if (state.groups)
                  objectGroupList.getData().forEach(function(e) {
                      if (state.groups.contains(e.group)) objectGroupList.selectRecord(e);
                  });
          }
      }); 
      
      var applyGroupSelectionButton = isc.IButton.create({
	  // ID:"clearAdvFilterButton",
	  title:"Apply",
	  width:50,
	  click : function () {
              var sel = objectGroupList.getSelection();
              if (sel.length === 0) {
                  alert('Select at least one group.');
                  return;   
              }
              // make a proper groups array out of the selection
              state.groups = sel.map(function(g) {
                  return g.group;
              });
              setGroupingState();
              tableViewStateChanged();
              
              groupSelectWarnLabel.hide(true);
              applyGroupSelectionButton.setDisabled(true);
           //update criteria   
             var appliedCriteria = isc.DataSource.combineCriteria(
                  groupFilter,state.savedAdvCriteria);
              // appliedCriteria = advancedCriteria;
              // appliedCriteria = criteria;
              // console.log('Applied Criteria', appliedCriteria);
              // module.temp = appliedCriteria;
              // console.log('will fetch data', dataTable.willFetchData(criteria));
              if (dataTable.willFetchData(appliedCriteria)) 
                  dataTable.fetchData(undefined, 
                                      function() {
                                          dataTable.setCriteria(appliedCriteria);
                                          console.log('fetch completed');});
              else dataTable.setCriteria(appliedCriteria);
	  }
      });
      
      var objectGroupLabel = isc.Label.create(
          {
              ID: 'mylabel',
              width:'100%',
              setLabel: function() {
                  // console.log('setting groups label', groups);
                  var contents, str1;
                  // var maxGroups = roster.groups.length;
                  if (state.groups.length === 0) {
                      contents = 'ERROR: No type selected, this should not happen!!!';}
                  else if (state.groups.length === roster.groups.length) {
                      contents = 'Showing all items in database.';
                  }
                  else {
                      str1 = 'This table is limited to showing objects of type ';
                      // console.error("hello");
                      // pp('lable', state);
                      contents = "";
                      contents += state.groups.join(', ') + '.';
                      var comma = contents.lastIndexOf(',');
                      if (comma >= 0)
                          contents = contents.slice(0,comma) +
                          ' and' + contents.slice(comma+1);
                  }
                  this.setContents(str1 + contents);
                  stack.getSection('Editor').setTitle('Table: ' + contents);
              }
          }         
      );
      
      
      var objectGroupLine = isc.HLayout.
	  create({height: 30, 
		  members: [objectGroupLabel, 
			    isc.LayoutSpacer.create({width:'*'}),
			    editButton]});
      
      var groupSelectWarnLabel = isc.Label.create({
          contents:'Applying this selection will reset the table layout'});
      
      var selectGroupsRow = isc.HLayout.
	  create({height: 30, 
		  members: [objectGroupList,  
			    applyGroupSelectionButton,
			    isc.LayoutSpacer.create({width:20}),
                            groupSelectWarnLabel
                           ]});
      
      
      // filterFields.setCacheData( [{name:'bla', title: 'bla', type: 'text'}]);
      //-----------------------@ADVANCED FILTER--------------------------------------
      var advancedFilter = isc.FilterBuilder.
          create({ ID:"filter"
	           // ,topOperatorAppearance: "inline"
	           // ,dataSource:"pouchDS"
                   // ,dataSource: 'filterFieldsDS'
                   ,fieldDataSource: 'filterFields'
	           // ,criteria: { _constructor: "AdvancedCriteria",
		   //             operator: "and", criteria: [
		   //                 {fieldName: "group", operator: "iEquals", value: ""}
		   //                 // {operator: "or", criteria: [
		   //     {fieldName: "countryName", operator: "iEndsWith", value: "land"},
		   //     {fieldName: "population", operator: "lessThan", value: 3000000}
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
              
	      state.savedAdvCriteria = advancedFilter.getCriteria(); 
              console.log(isc.FilterBuilder.getFilterDescription(state.savedAdvCriteria, pouchDS));
	      dataTable.filterData(state.savedAdvCriteria);
              setFilterDescription();
              tableViewStateChanged('applyAdvFilter');
	  }
      });
      
      
      function setFilterDescription() {
          var filterDescription;
          console.log('setFilterDescription');
          if (state.savedAdvCriteria) {
              console.log('setFilterDescription',state.savedAdvCriteria);
              filterDescription =
                  isc.FilterBuilder.getFilterDescription(state.savedAdvCriteria, pouchDS);
              console.log('setFilterDescription', filterDescription, state.savedAdvCriteria);
          }
          if (!filterDescription) filterDescription = 'No filter set';
          filterLabel.setContents(filterDescription);
          
          console.log('filterDescription: '+ filterDescription);
      }
      
      var advancedFilterButtons = isc.HLayout.
	  create({height: 30, 
		  members: [filterButton, 
			    isc.LayoutSpacer.create({width:'*'}),
			    clearAdvFilterButton]});


      function setAdvFilterVisible(bool) {
          console.log('setAdvFiltervisible');
          if (bool) {
	      advFilterToggle.setIcon('toggleOn.png');
              advancedFilter.show(true);
              advancedFilterButtons.show(true);
          }
          else {
	      advFilterToggle.setIcon('toggleOff.png');
              advancedFilter.hide(false);
              advancedFilterButtons.hide(false);
          }
      }
      
      var advFilterToggle = 
          isc.Label.create(
	      { ID:'advFilterToggle',
	        height: 20,
	        width:50
	        ,iconClick: function() {
                    if (state.editableAdvFilter) {
                        state.editableAdvFilter = false;
	                // advFilterToggle.setIcon('toggleOff.png');
                    }
                    else {
                        state.editableAdvFilter = true;
	                // advFilterToggle.setIcon('toggleOn.png');
                    }
	            setAdvFilterVisible(state.editableAdvFilter);
	              
	        }
	        // padding: 10,
	        ,align: "left",
	        valign: "center",
	        wrap: false
	        ,icon: defaultState.editableAdvFilter ? "toggleOn.png" : "toggleOff.png"
	        // showEdges: true,
	        // ,contents: "<i>Approved</i> for release"
	        ,contents: "Editable advanced filter"
	          
	      });
      
      var filterLabel = 
          isc.Label.create(
	      { ID: 'filterLabel',
                height: 20, width: '100%',
                contents: '' });
      
      //-----------------@SIMPLEFILTER----------------
      function useSimpleFilter(bool, criteria) {
          if (bool) {
	      dataTable.setShowFilterEditor(true);
              console.log('setting simple criteria:', criteria);
	      dataTable.setFilterEditorCriteria(criteria);
          }
          else {
	      // simpleFilterToggle.setIcon('toggleOff.png');
	      state.savedCriteria = dataTable.getFilterEditorCriteria();
	      dataTable.clearCriteria();
	      dataTable.setShowFilterEditor(false);
          }
      }          

      var simpleFilterToggle = 
          isc.Label.create(
	      { ID:'simpleFilterToggle',
	            height: 20,
	        width:50
	        ,iconClick: function() {
                    if (state.usingSimpleFilter) {
                        state.usingSimpleFilter = false;   
	                simpleFilterToggle.setIcon('toggleOff.png');
                    }
                    else {
                        state.usingSimpleFilter = true;   
	                simpleFilterToggle.setIcon('toggleOn.png');
                    }
	            useSimpleFilter(state.usingSimpleFilter,
                                    isc.DataSource.combineCriteria(state.savedAdvCriteria,
                                                                   state.savedCriteria));
                    //TODO sort out the use of two filters and their correct interaction
	            // dataTable.filterData(state.savedAdvCriteria);
	            // if (state.usingSimpleFilter) dataTable.filterData(state.savedCriteria);
                    tableViewStateChanged('simpleFilterToggle');
	              
	        }
	        ,align: "left",
	        valign: "center",
	        wrap: false
	        ,icon: defaultState.usingSimpleFilter ? "toggleOn.png" : "toggleOff.png"
	        ,contents: "Enable simple filter"
	          
	      });
      
      // var simpleFilterLine = isc.HLayout.
      //     create({height: 30, 
      //membersMargin:15, 
      //members: [ simpleFilterToggle, clearSimpleFilterButton]});
      
      
      //---------------@FILTERSTACK------------------
      var filterStack = isc.VLayout.
          create(
	      {// ID:'filterStack',
	              membersMargin:10,
	          align:'left',
                  members:
	          [
                      objectGroupLine
                      ,selectGroupsRow
                      ,simpleFilterToggle
                      ,advFilterToggle
                      ,filterLabel
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
		  {title: "Edit",
		   pane:editForm
		  }
		  ,{ title: "Filter table",
		     pane: filterStack 
		   } 
	      ]
	  });
      
      //---------------------- @total component-------------
      var stack = isc.SectionStack.
          create({ 
              ID: 'stack',
	      visibilityMode:"multiple",
	      animateSections:true
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
	      ,sections:[
		  {name:'Table', showHeader:false,
                   title:'Data', items:[dataTable]}
		  ,{name: 'Editor', title:"Edit", expanded:true,  hidden: false, items:[tabSet]}
	      ]
	  });
      //need to do this, the sectionstack seems to show the first section regardless of its hidden prop.
      // rightSideLayout.hideSection('Table');
      
      //------------------@API----------------------------- 
      //for use in layout to show these components
      API.grid = stack;
      API.name = 'Table';
      return API;
  }});

//TODO get rid of all ID:
