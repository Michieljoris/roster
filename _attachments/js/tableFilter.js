/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:120 devel:true*/

// -----@ TOP ----- */
define
({inject: ['typesAndFields', 'pouchDS'] ,
  factory: function(typesAndFields, pouchDS) {
      "use strict";
      var state, dataTable;
      var defaultState = { usingSimpleFilter: true, editableAdvFilter : true
                           ,types: ["shift"]};
      
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
          ,fields: [{name: 'type', title: 'Type'}]
          ,data: (function() {
              return typesAndFields.allTypes.map(function(g) {
                  return { group : g };
              });})()
          ,selectionChanged: function() {
              
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
              if (state.types)
                  objectGroupList.getData().forEach(function(e) {
                      if (state.types.contains(e.type)) objectGroupList.selectRecord(e);
                  });
          }
      }); 
      
      
      var objectGroupLabel = isc.Label.create(
              {
                  ID: 'mylabel',
                  width:'100%',
                  setLabel: function() {
                      // console.log('setting groups label', groups);
                      var contents, str1 = '';
                      // var maxGroups = roster.groups.length;
                      if (state.types.length === 0) {
                          contents = 'ERROR: No type selected, this should not happen!!!';}
                      else if (state.types.length === typesAndFields.allTypes.length) {
                          contents = 'Showing all items in database.';
                      }
                      else {
                          str1 = 'This table is limited to showing objects of type ';
                          // console.error("hello");
                          // pp('lable', state);
                          contents = "";
                          contents += state.types.join(', ') + '.';
                          var comma = contents.lastIndexOf(',');
                          if (comma >= 0)
                              contents = contents.slice(0,comma) +
                              ' and' + contents.slice(comma+1);
                      }
                      this.setContents(str1 + contents);
                      dataTable.setLabel('Table: ' + contents);
                  }
              }         
      );
      
      var applyGroupSelectionButton = isc.IButton.create({
	      // ID:"clearAdvFilterButton",
	  title:"Apply",
	  width:50,
	  click : function () {
              var sel = objectGroupList.getSelection();
              if (sel.length === 0) {
                  alert('Select at least one t.');
                  return;   
              }
              // make a proper groups array out of the selection
              state.types = sel.map(function(t) {
                  return t.type;
              });
              var fieldsCloner = typesAndFields.getFieldsCloner(state.types);
              filterFields.setCacheData(fieldsCloner());
              dataTable.setGroupingState(fieldsCloner);
              objectGroupLabel.setLabel(state.types);
              dataTable.viewStateChanged();
              
              groupSelectWarnLabel.hide(true);
              applyGroupSelectionButton.setDisabled(true);
              //update criteria   
              
              var groupFilter = { type : state.types };
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
      
      
      
      var objectGroupLine = isc.HLayout.
	  create({height: 30, 
                  width: 400,
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
              console.log(isc.FilterBuilder.getFilterDescription(state.savedAdvCriteria,
                                                                 pouchDS));
	      dataTable.filterData(state.savedAdvCriteria);
              setFilterDescription();
              dataTable.viewStateChanged('applyAdvFilter');
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
                  width: 400,
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
                    dataTable.viewStateChanged('simpleFilterToggle');
	              
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
                  // hidden: true,
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
      
      var setState = function(aState) {
          state = aState;
          objectGroupList.setSelection();
          //get the fields relevant to the group(s)
          var fieldsCloner = typesAndFields.getFieldsCloner(state.types);
          filterFields.setCacheData(fieldsCloner());
          objectGroupLabel.setLabel(state.types);
          
          advancedFilter.setCriteria(state.savedAdvCriteria);
          
          layoutFilters(false); //start in normal mode
          setAdvFilterVisible(state.editableAdvFilter);
          
          setFilterDescription();
      };
	      
      return {
          link: function(aDataTable, aDefaultState) {
              defaultState = isc.addDefaults(defaultState, aDefaultState),
              dataTable = aDataTable; },
          filterStack: filterStack,
          setState: setState
      };
	      
  }});