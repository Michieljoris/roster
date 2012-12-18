/*global module:true pp:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define
({ load: ['editorLoader'],
   inject: ['typesAndFields', 'pouchDS', 'editorManager', 'tableFilter'],
   factory: function(typesAndFields, database, editors, tableFilter) {
       "use strict";
       var currentHeight= 300;
       var groupFilter;
       var state; 
       var defaultState = { height: 300, isExpanded: true, tab: 1, hidden: false};
       // var recordMenuData;     
      
       // setting up the various editForms used for different groups of records     
       // var editor; //points to editCanvas currently shown in the lower section
       // v
       //     shift: shiftEditor,
       //     location: locationEditor
       //     // ,person: null
       //     // ,role: null
       // };
       //add all these forms to the lower section and hide them by
       //default they are shown and hidden depending on what the group
       //of the record is that is selected
       // var forms = [];
       // Object.keys(editForms).forEach(function(f) { forms.push(editForms[f]);
       //                                              // editForms[f].hide();
       //                                            });
      
       // forms.push(tableFilter.filterStack);     
       // tableFilter.filterStack.hide();
      
       //groupmenu items get added dynamically in setGroupState
       var addRecordMenu = {
           width: 150
       };
      
       var API = {};
      
       //only one observer...
       var observer;
      
      
       // var editorWindow = isc.Window.create({
       //     title: "Mamre , Southside, Respite",
       //     autoSize: true,
       //     canDragReposition: true,
       //     canDragResize: true,
       //     showMinimizeButton:false, 
       //     autoCenter: true,
       //     isModal: true,
       //     showModalMask: true,
       //     autoDraw: false,
       //     setCanvas: function(canvas) {
       //         this.removeCanvas();
       //         this.canvas = canvas;
       //         this.addItem(canvas);
       //     }, 
       //     removeCanvas: function() {
       //         if (this.canvas) this.removeItem(this.canvas);
       //     }
       //     // height: 300,
       //     // width:300,
       //     // items: [ dialogLayout ]
       // });
      
       // var setupEditor = function(editor, container, record) {
       //     editor.removeFromItsContainer();
       //     editor.setValues(record);
       //     editor.putInContainer(container);
       //     // container.show();
       // };
      
      
      
      
          
       //--------------------@handling state----------------------------- 
       function getTableState() {
           state =  isc.addProperties(state, {
	       grid: dataTable.getViewState(),
	       criteria : dataTable.getFilterEditorCriteria(),
              
               //editor
               hidden: false,
               // tab: tabSet.getSelectedTabNumber(),
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
           console.log('setTableState:', newstate);
           state = isc.addProperties(defaultState, isc.clone(newstate));
          
           //groups
           if (!state.groups || state.groups.length === 0) state.groups = typesAndFields.groups;
          
           var fieldsCloner = typesAndFields.getTagsCloner(state.groups);
           setGroupingState(fieldsCloner);
          
           tableFilter.setState(state);
           // tableFilter.objectGroupList.setSelection();
              
           //layout
           // tabSet.selectTab(state.tab);
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
           // advancedFilter.setCriteria(state.savedAdvCriteria);
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
           // layoutFilters(false); //start in normal mode
           // setAdvFilterVisible(state.editableAdvFilter);
          
           // setFilterDescription();
           //TODO alternative would be to remember the selectiion in the
           //table and also to only enable the update/save button when the
           //record has been edited
           // editForm.getField('editNew').click() ;
           // pp('****************finished setting table state');
       }
      
      
       function setGroupingState(fieldsCloner) {
           // set the label
           // pp('setGroupingState', state);
           // objectGroupLabel.setLabel(state.groups);
              
           //apply group selection by ..
           //get the fields relevant to the group(s)
           // var fieldsCloner = roster.getTagsCloner(state.groups);
           //select out the non-relevant tags for the table
           dataTable.setFields(fieldsCloner());
           //we need to set the relevant editor fields
           // editForm.setGroupFields(fieldsCloner());
           //set the right groups in the right top add record button
           addRecordMenu.data = []; 
           state.groups.forEach(function(g) {
               addRecordMenu.data.push({
                   name: g,
                   icon: isc.Page.getSkinDir() +"images/actions/add.png",
                   click: function() {
                       newRecord(g);
                   }
               }); 
           });
         
           // console.log('RECORDMENUDATA', recordMenuData);
           //we need to filter the group...
           groupFilter = { group : state.groups };
           //this will be combined with the normal filters
           console.log('GROUPFILTER', groupFilter);
          
           // dataTable.filterData(groupFilter);
         
       } 
      
       //called when table's view is modified
       function tableViewStateChanged(){
           // console.log('**************table changed: ' + origin);
           if (observer) observer();
       }
      
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
      
       var newRecord = function(aGroup) {
           // addUpdateData('addData', { group: 'group'});
           database.addData({ group: aGroup },
                            function(resp, data, req) 
		            {   dataTable.selectRecord(data);
                                rowClicked(data);
                                // editForm.setValues(data);
                                console.log(resp,data,req);});
       };
      
      
       function removeRecord() {
           //TODO ask for confirmation..
           var selRecord = dataTable.getSelectedRecord();
           if (selRecord) {
               var index = dataTable.getRecordIndex(selRecord);
               // console.log('index of selected item before removing
               //it is: ', index); an async call, so the new selindex
               //has to be one more or less
               dataTable.removeSelectedData();
              
               if (dataTable.getTotalRows() === index + 1) index--;
               else index++;
               // console.log('total rows now is ' + dataTable.getTotalRows());
               // console.log('selecting row: ' + index);
               dataTable.selectRecord(index);
              
               rowClicked(dataTable.getSelectedRecord());
           }
       }
      
      
       function rowClicked(record) {
           // locationEditor.showDialog(record, {});
           // if (showingFilter) {
           //     stack.removeItem(1, tableFilter.filterStack, 0);
           //     stack.addItem(1, editForm);
           //     showingFilter = false;
           // }
           // console.log(index);
           tableFilter.filterStack.hide();
           // var record;
           // if (index) record = dataTable.getRecord(index); 
           // else record = dataTable.getSelectedRecord();
	   console.log(record, "Selected Record");
           // if (editor !== editors[record.group]) {
           // if (editForm) editForm.hide();
           //point editForm to the appropriate editor
           // editor = editors[record.group];
           // }
                      
           // editForm.setSettings();
	   // editForm.editRecord(record); //also sets saveoperationtype to 'update'
           // editForm.getField('saveButton').setTitle('Update record');
           // editForm.getField('saveButton').method = 'updateData';
           // editForm.getField('editNew').setDisabled(false);
           // editForm.clearErrors(true);
           // editForm.show();
           editors.fill(editorContainer, record, {});
           // editor.init(editorWindow, record, {});
           // editorWindow.show();
       }
                  
       // tabSet.setTabPane(0, shiftEditor.getForm(record));
                      
       // tabSet.setTabPane(0, editForm);
                      
       // }
      
       // function addUpdateData(method, newValues) {
       //     // if (!form.valuesHaveChanged() || !form.validate()) return; 
       //     // console.log(form.getValues());
       //     // var newValues = form.getValues();
          
       //     // newValues.group = 'shift';
       //     // var method = 'addData';
       //     var f = pouchDS[method];
       //     var args = [newValues, function(resp, data, req) 
       //     {   dataTable.selectRecord(data);
       //                     editForm.setValues(data); console.log(resp,data,req);}];
          
       //     // editForm.getField('editnew').setDisabled(false);
       //     editForm.getField('saveButton').setTitle('Update record');
       //     editForm.getField('saveButton').method = 'updateData';
       //     f.apply(pouchDS, args );
       //     //pouchDS.addData(newValues, function(resp, data, req) 
       //     //{ editForm.setValues(data); console.log(resp,data,req);});
       // }
      
       var tableContextMenu = isc.Menu.create(
           {// ID:"rightClickMenu",
               width:150
               ,data:[
	           // {title:"click"
		   //  ,icon: isc.Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
		   //  ,click: function() { console.log('hello'); }
	           // } ,
                   // { title: 'edit',
		   //   icon: isc.Page.getSkinDir() +"images/actions/edit.png",
                   //   // icon: "edit.png", 
                   //   click: function() { console.log('edit'); }
                   // },
                   { title:  'remove',
		     icon: isc.Page.getSkinDir() +"images/actions/remove.png",
                     // icon: "remove.png", 
                     click: function() { removeRecord(); }
                   },
                   { title:  'dialog',
		     // icon: isc.Page.getSkinDir() +"images/actions/remove.png",
                     // icon: "remove.png", 
                     click: function() {
                         // rowClicked(dataTable.getSelectedRecord());
                         editors.show(dataTable.getSelectedRecord(), {});
                         // editor.init(editorWindow, dataTable.getSelectedRecord(), {});
                         // editorWindow.show();
                     }
                   }
                  
               ]
           });
      
       var tableLabel = isc.Label.create({
           width: "100%", 
           padding:5,
           ID:"tableLabel", 
           prompt:'hello',
           contents: 'Table bla blabla bla bla'
       });
      
      
       var toolStrip = isc.ToolStrip.create({
           // ID: "gridEditControls",
           width: "100%", height:24, 
           members: [
               isc.ToolStripButton.create({
                   icon: "[SKIN]/actions/filter.png", 
                   prompt: "Set filters",
                   click: function() {
                       // if (!tableFilter.filterStack.isVisible()) {
                       // tableFilter.filterStack.show(); 
                      
                       // if (editor) editor.hide();
                       // editor = undefined;
                       // stack.addItem(1, tableFilter.filterStack, 0);
                       // stack.removeItem(1, editForm);
                       // showingFilter = true;
                       // }
                   }
               }),
               tableLabel,
               isc.LayoutSpacer.create({ width:"*" })
               // ,isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/add.png", 
               //     prompt: "Add record",
               //     click: "console.log('add');"
               // })
               ,isc.IconMenuButton.create({
                   title:''
		   // ,ID:'addButton'
		   ,iconClick: "this.showMenu()"
		   ,showMenuIcon:false
		   ,width :20
		   ,icon: "[SKIN]/actions/add.png", 
		   prompt: "Create a new record"
		   ,menu: addRecordMenu //{ID: 'mymenu', width:150  }
	       })
               // ,isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/remove.png", 
               //     prompt: "Remove selected record",
               //     // click: "console.log('remove');"
               //     click: function() { remove(); }
               // }),
               // isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/edit.png", 
               //     prompt: "Edit record",
               //     click: "console.log('edit');"
               // })
           ]
       });

       var dataTable = isc.ListGrid.create(
           {   
	       ID: "dataTable",
	       dataSource: database,
               gridComponents:[toolStrip,"filterEditor", "header",  "body"],
               // titleField: 'title',
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
	       recordClick: function (viewer, record) {
                   rowClicked(record); 
               },
              
	       cellChanged: function (record) {
                   rowClicked(record); 
               },
               // recordClick: updateEditForm,
	       canEdit:true,
	       modalEditing:true,
	       // cellChanged: updateEditForm,
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
               setGroupingState: setGroupingState,
               setLabel: function(label) {
                   tableLabel.setContents(label);
               },
               contextMenu: tableContextMenu
               // bodyKeyPress : function() { 
               //    console.log('keypress');
               //    return true; 
               // }
           });
      
       tableFilter.link(dataTable, defaultState);
      
      
      
       //---------------@EDITFORM----------------------------
      
       // var defaultEditForm = isc.DynamicForm.create(
       //     { ID:"editForm",
       //       dataSource:pouchDS
       //       // ,useAllDataSourceFields:true
       //       // ,overflow:'auto'	
       //       ,titleOrientation: 'top'
       //       ,setGroupFields: function(fields) {
       //           this.setFields(this.fields.concat(fields));   
       //       }
       //       ,fields:[
       //           {name:"editnew", type:"button", width:130,
       //            title:"Clear form", click: function()
       //            { var newValues = {};
       //              if (state.groups.length === 1)
       //                  newValues.group = state.groups[0];
       //              // dataTable.startEditingNew(newValues);
       //              dataTable.deselectAllRecords();
       //              editForm.setValues(newValues);
       //              editForm.getField('saveButton').setTitle('Save form');
       //              editForm.getField('saveButton').method = 'addData';
       //              // editForm.getField('editnew').setDisabled(true);
       //              editForm.clearErrors(true);
                   
       //              console.log(dataTable.getSelectedRecord());
       //            }
       //           },
       //           {name:"saveButton", type:"button", width: 130, method: 'addData',
       //            title:"Save form", click: function() {
       //                if (!editForm.valuesHaveChanged() || !editForm.validate()) return; 
       //                console.log(editForm.getValues());
       //                var newValues = editForm.getValues();
       //                addUpdateData(this.method, newValues); }}
       //           // , {name:"delete", type:"button",
       //           //  width:130, title:"Delete Selected Item", 
       //           //  click:function() { remove(); }}
       //       ],
       //       width:650,
       //       numCols:3,
       //       // colWidths:[30,150,30,150],
       //       margin:3,
       //       cellPadding:5,
       //       autoFocus:false
       //     });
      
      
       // editForm = defaultEditForm;
      
      
      
      
       //------------------@TABSET------------------- (not using it now)
      
       // var tabSet = isc.TabSet.
       //     create({
       //         ID: "tabSet"
       //         ,tabSelected: function() {
       //             tableViewStateChanged('tabSelected');
       //         }
       //         ,resized: function() {
       //             tableViewStateChanged('tabSetResized');
       //         }
       //         ,tabBarPosition: "top"
       //         ,height:'30%'
       //         ,selectedTab: 1,
       //         tabs: [
       // 	   {title: "Edit",
       // 	    pane: editor
       // 	   }
       // 	   // ,{ title: "Filter table",
       //	   //    pane: tableFilter.filterStack 
       // 	   //  } 
       //         ]
       //     });
       var editorContainer = isc.Canvas.create({
           getCanvas: function() {
               if (this.children) return this.children[0];
               else return null;
           },
           setCanvas: function(canvas) {
               // if (this.canvas === canvas) return;
               // this.removeCanvas();
               // this.canvas = canvas;
               this.addChild(canvas);
           }, 
           removeCanvas: function() {
               // if (this.canvas) this.removeChild(this.canvas);
               this.removeChild(this.getCanvas());
           }
       });
      
      
       //---------------------- @the whole component-------------
      
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
		   {name:'Table', showHeader:false, title:'Data', items:[dataTable]}
		   ,{name: 'Editor', title:"Details", expanded:true,  hidden: false, items:[editorContainer]}
	       ]
               
	   });
       //need to do this, the sectionstack seems to show the first section regardless of its hidden prop.
       // rightSideLayout.hideSection('Table');
      
       //------------------@API----------------------------- 
       //for use in layout to show these components
       API.grid = stack;
       API.name = 'Table';
       API.icon = "table.png";
       return API;
   }});

//TODO get rid of all ID:
