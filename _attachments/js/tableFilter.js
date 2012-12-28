/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:120 devel:true*/

// -----@ TOP ----- */
define
({inject: ['typesAndFields', 'pouchDS'] ,
  factory: function(typesAndFields, pouchDS) {
      "use strict";
      var state, dataTable;
      var defaultState = { usingSimpleFilter: true };
      
      var log = logger('tableFilter');
      var setState = function(aState) {
          state = isc.addDefaults(aState, defaultState);
          // objectGroupList.setSelection();
          //get the fields relevant to the group(s) 
          var fieldsCloner = typesAndFields.getFieldsCloner(state.types);
          log.d('filterFields', fieldsCloner());
          filterFields.setCacheData(fieldsCloner());
          // objectGroupLabel.setLabel(state.types);
          advancedFilter.setCriteria(state.savedAdvCriteria);
          
          // layoutFilters(false); //start in normal mode
          // setAdvFilterVisible(state.editableAdvFilter);
          // setAdvFilterVisible(true);
          useSimpleFilter(state.usingSimpleFilter);
          setFilterDescription();
      };     
      
      var getState = function() {
          return state; 
      };
           
      //--------------------@EDIT FILTER SETUP------------------ 
     //asdfa asdfa sdf
      
      
      // var editButton = isc.Button.create({
      //     title:"Edit",
      //     width:50,
      //     height:20,
      //     click : function () {
      //         // var isObjectGroupListVisible = objectGroupList.isVisible();
      //         //isObjectGroupListVisible ? false : true;
      //         //TODO filter out the right groups...
      //         // layoutFilters(!objectGroupList.isVisible());
      //     }  k
      // });
      
      // function layoutFilters(bool) { //
      //     // log.d('editfilterSetup');
      //     if (bool) { //more mode
      //         //reset it in case user has been meddling with it and has not clicked apply
      //         objectGroupList.setSelection();
      //         groupSelectWarnLabel.hide(true);
      //         applyGroupSelectionButton.setDisabled(true);
      //         selectGroupsRow.show(true);
      //         advFilterToggle.show(true);
      //         simpleFilterToggle.show(true);
      //         editButton.setTitle('Less'); }
      //     else { //less mode
      //         selectGroupsRow.hide(true);
      //         //hide the toggles 
      //         advFilterToggle.hide(true);
      //         simpleFilterToggle.hide(true);
      //         //set the button text back to more 
      //         editButton.setTitle('More');
      //     }
      // }
      
      
      //-------------@OBJECTGROUPS------------------------------------
      
      // function makeGroupFilter() {
      //     // var filter = { group : [] };
      //     // state.groups.forEach(function(g){
      //     //     filter.group.push({ group : g }); 
      //     // });
      //     return { group : state.groups };
      // } 
      
      // var objectGroupList = isc.ListGrid.create({
      //     ID: "objectGroupList",
      //     width:100, 
      //     alternateRecordStyles:true,
      //     autoFitData: 'both',
      //     autoFetchData: true,
      //     showHeader:false,
      //     showHeaderContextMenu:false,
      //     showHeaderMenuButton:false,
      //     selectionAppearance:"checkbox"
      //     ,fields: [{name: 'type', title: 'Type'}]
      //     ,data: (function() {
      //         return typesAndFields.allTypes.map(function(g) {
      //             return { group : g };
      //         });})()
      //     ,selectionChanged: function() {
              
      //         groupSelectWarnLabel.show(true);
      //         applyGroupSelectionButton.setDisabled(false);
      //         // log.d('----------selection changed----------');
      //         // var sel = objectGroupList.getSelection();
      //         //make sure at least one group is selected, by not
      //         //letting the user deselect the last one.
      //         // if (sel.length === 0) {
      //         //     objectGroupList.selectRecord(rec); 
      //         //     sel = objectGroupList.getSelection();
      //         // }
      //     }
      //     ,setSelection: function() {
      //         // log.d('----------setting group selection----------');
      //         objectGroupList.deselectAllRecords();  
      //         if (state.types)
      //             objectGroupList.getData().forEach(function(e) {
      //                 if (state.types.contains(e.type)) objectGroupList.selectRecord(e);
      //             });
      //     }
      // }); 
      
      
      // var objectGroupLabel = isc.Label.create(
      //     {
      //         ID: 'mylabel',
      //         width:'100%',
      //         setLabel: function() {
      //             // log.d('setting groups label', groups);
      //             var contents, str1 = '';
      //                 // var maxGroups = roster.groups.length;
      //             if (state.types.length === 0) {
      //                 contents = 'ERROR: No type selected, this should not happen!!!';}
      //             else if (state.types.length === typesAndFields.allTypes.length) {
      //                 contents = 'Showing all items in database.';
      //             }
      //             else {
      //                 str1 = 'This table is limited to showing objects of type ';
      //                 // console.error("hello");
      //                 // pp('lable', state);
      //                 contents = "";
      //                 contents += state.types.join(', ') + '.';
      //                 var comma = contents.lastIndexOf(',');
      //                 if (comma >= 0)
      //                     contents = contents.slice(0,comma) +
      //                     ' and' + contents.slice(comma+1);
      //             }
      //             this.setContents(str1 + contents);
      //             dataTable.setLabel('Table: ' + contents);
      //         }
      //     }         
      // );
      
      // var applyGroupSelectionButton = isc.IButton.create({
      //     // ID:"clearAdvFilterButton",
      //     title:"Apply",
      //     width:50,
      //         click : function () {
      //             var sel = objectGroupList.getSelection();
      //             if (sel.length === 0) {
      //                 alert('Select at least one t.');
      //                 return;   
      //             }
      //             // make a proper groups array out of the selection
      //             state.types = sel.map(function(t) {
      //                 return t.type;
      //             });
      //             var fieldsCloner = typesAndFields.getFieldsCloner(state.types);
      //                 filterFields.setCacheData(fieldsCloner());
      //             dataTable.setGroupingState(fieldsCloner);
      //             objectGroupLabel.setLabel(state.types);
      //             dataTable.viewStateChanged();
              
      //             groupSelectWarnLabel.hide(true);
      //             applyGroupSelectionButton.setDisabled(true);
      //             //update criteria   
              
      //             var groupFilter = { type : state.types };
      //             var appliedCriteria = isc.DataSource.combineCriteria(
      //                 groupFilter,state.savedAdvCriteria);
      //             // appliedCriteria = advancedCriteria;
      //             // appliedCriteria = criteria;
      //             // log.d('Applied Criteria', appliedCriteria);
      //             // module.temp = appliedCriteria;
      //             // log.d('will fetch data', dataTable.willFetchData(criteria));
      //             if (dataTable.willFetchData(appliedCriteria)) 
      //                 dataTable.fetchData(undefined, 
      //                                     function() {
      //                                         dataTable.setCriteria(appliedCriteria);
      //                                         log.d('fetch completed');});
      //             else dataTable.setCriteria(appliedCriteria);
      //         }
      // });
      
      
      
      // var objectGroupLine = isc.HLayout.
      //     create({height: 30, 
      //             width: 400,
      //   	  members: [objectGroupLabel, 
      //   		    isc.LayoutSpacer.create({width:'*'}),
      //   		    editButton]});
      
      //     var groupSelectWarnLabel = isc.Label.create({
      //         contents:'Applying this selection will reset the table layout'});
      
      // var selectGroupsRow = isc.HLayout.
      //     create({height: 30, 
      //   	  members: [objectGroupList,  
      //   		    applyGroupSelectionButton,
      //   		    isc.LayoutSpacer.create({width:20}),
      //                       groupSelectWarnLabel
      //                      ]});
      
      
      // filterFields.setCacheData( [{name:'bla', title: 'bla', type: 'text'}]);
      //-----------------------@ADVANCED FILTER--------------------------------------
      var filterFields = isc.DataSource.create({
          ID: "filterFields",
          clientOnly: true,
          fields: [
              { name: "name", type: "text" },
              { name: "title", type: "text" },
              { name: "type", type: "text" }
          ]
      });
      
      var advancedFilter = isc.FilterBuilder.
          
          create({  ID:"advfilter",
	           // ,topOperatorAppearance: "inline"
	           // ,dataSource:"pouchDS"
                   // ,dataSource: 'filterFieldsDS'
                   fieldDataSource: 'filterFields'
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
              log.d(isc.FilterBuilder.getFilterDescription(state.savedAdvCriteria,
                                                           pouchDS));
              var appliedCriteria = isc.DataSource.combineCriteria(
                  dataTable.typeFilter,state.savedAdvCriteria);
	      dataTable.filterData(appliedCriteria);
	      // dataTable.filterData(state.savedAdvCriteria);
              setFilterDescription();
              dataTable.viewStateChanged('applyAdvFilter');
	  }
      });
      
      
      function setFilterDescription() {
          var filterDescription;
          // log.d('setFilterDescription');
          if (state.savedAdvCriteria) {
              // log.d('setFilterDescription',state.savedAdvCriteria);
              filterDescription =
                  isc.FilterBuilder.getFilterDescription(state.savedAdvCriteria, pouchDS);
              // log.d('setFilterDescription', filterDescription, state.savedAdvCriteria);
          }
          if (!filterDescription) filterDescription = 'No filter set';
          filterLabel.setContents(filterDescription);
          dataTable.setFilterLabel(filterDescription);
          
          // log.d('filterDescription: '+ filterDescription);
      }
      
      var advancedFilterButtons = isc.HLayout.
	      create({height: 30, 
                      width: 400,
		      members: [filterButton, 
			        isc.LayoutSpacer.create({width:'*'}),
			        clearAdvFilterButton]});


      // function setAdvFilterVisible(bool) {
      //     log.d('setAdvFiltervisible');
      //     if (bool) {
      //         advFilterToggle.setIcon('toggleOn.png');
      //         advancedFilter.show(true);
      //         advancedFilterButtons.show(true);
      //     }
      //     else {
      //         advFilterToggle.setIcon('toggleOff.png');
      //         advancedFilter.hide(false);
      //         advancedFilterButtons.hide(false);
      //     }
      // }
      
      // var advFilterToggle = 
      //     isc.Label.create(
      //         { ID:'advFilterToggle',
      //           height: 20,
      //           width:50
      //           ,iconClick: function() {
      //               if (state.editableAdvFilter) {
      //                   state.editableAdvFilter = false;
      //                   // advFilterToggle.setIcon('toggleOff.png');
      //               }
      //               else {
      //                   state.editableAdvFilter = true;
      //                   // advFilterToggle.setIcon('toggleOn.png');
      //               }
      //               setAdvFilterVisible(state.editableAdvFilter);
	              
      //           }
      //           // padding: 10,
      //           ,align: "left",
      //           valign: "center",
      //           wrap: false
      //           ,icon: defaultState.editableAdvFilter ? "toggleOn.png" : "toggleOff.png"
      //           // showEdges: true,
      //           // ,contents: "<i>Approved</i> for release"
      //           ,contents: "Editable advanced filter"
	          
      //         });
      
      var filterLabel = 
          isc.Label.create(
	      { ID: 'filterLabel',
                height: 20, width: '100%',
                contents: '' });
      
      //-----------------@SIMPLEFILTER----------------
      function useSimpleFilter(bool, criteria) {
          if (bool) {
	      dataTable.setShowFilterEditor(true);
              log.d('setting simple criteria:', criteria);
	      dataTable.setFilterEditorCriteria(criteria);
	      simpleFilterToggle.setIcon('toggleOn.png');
          }
          else {
	      // simpleFilterToggle.setIcon('toggleOff.png');
	      state.savedCriteria = dataTable.getFilterEditorCriteria();
	      dataTable.clearCriteria();
	      dataTable.setShowFilterEditor(false);
	      simpleFilterToggle.setIcon('toggleOff.png');
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
                    }
                    else {
                        state.usingSimpleFilter = true;   
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
	        ,contents: "Inline filter editor"
	          
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
                  margin: 10,
	          // align:'left',
                  width: '100%',
                  members:
	          [
                      // objectGroupLine
                      // ,selectGroupsRow
                      simpleFilterToggle
                      // ,advFilterToggle
                      ,filterLabel
                      ,advancedFilter
                      ,advancedFilterButtons
	          ]
	      });
	      
      return {
          link: function(aDataTable, aDefaultState) {
              defaultState = isc.addDefaults(defaultState, aDefaultState),
              dataTable = aDataTable; },
          filterStack: filterStack,
          setState: setState,
          getState: getState
      };
	      
  }});