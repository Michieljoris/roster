/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define
({ load: ['editorLoader'], 
   inject: [ 'typesAndFields', 'pouchDS', 'editorManager', 'tableFilter'],
   factory: function (typesAndFields, database, editors, tableFilter) {
       "use strict";
       
       var log = logger.get('table', 'debug');

       var editorHeightExpanded= 300;
       var typeFilter;
       var state; 
       var defaultState = { height: 300, isExpanded: true, tab: 1, hidden: false};
       
       // tableFilter.filterStack.hide();
      
       //type menu items get added dynamically in setTypingState
       var addRecordMenu = {
           // ID:'typeMenu',
           width: 150,
           data: [ { title: 'hello' }]
       };
       //all possible types for the right top add record button
       // addRecordMenu.data = []; 
       var typeMenuItems = [];
       typesAndFields.allTypes.forEach(function(g) {
           typeMenuItems[g] = {
               name: g,
               icon: isc.Page.getSkinDir() +"images/actions/add.png",
               click: function() {
                   newRecord(g);
               }
           }; 
       });
      
       var API = {};
      
       //only one observer...
       var observer;
      
       //--------------------@handling state----------------------------- 
       function getTableState() {
           state =  isc.addProperties(state, {
	       grid: dataTable.getViewState(),
	       criteria : dataTable.getFilterEditorCriteria(),
              
               //editor
               height: (function() {
                   if (stack.sectionIsExpanded('Editor')) 
                       return dataTable.getHeight();
                   else return editorHeightExpanded;
               })(),
               isExpanded: stack.sectionIsExpanded('Editor')
           });
           isc.addProperties(state, tableFilter.getState());
           console.log('getTableState', isc.clone(state));
           currentState = isc.clone(state);
           return currentState;
       } 
      
       API.getState = getTableState;
       
       function setTypingState(types) {
           //types
           if (!types || types.length === 0) state.types = typesAndFields.allTypes;
           types = state.types;
           //set title of table to types displayed
           tableTypeLabel.setContents('[' + types.toString() + ']');  
           
           //producer of fields used with these types
           var fieldsCloner = typesAndFields.getFieldsCloner(types);
           
           //select out the non-relevant tags for the table 
           dataTable.setFields(fieldsCloner());
           
           //set addRecord menu
           var items = [];
           types.forEach(function(t) {
               items.push(typeMenuItems[t]);
           });
           if (addRecordButton.menu.setItems) addRecordButton.menu.setItems(items);
           else addRecordButton.menu.data = items;
           
           //this is for the type selection window
           typeList.setSelection(types);
           
           //we need to filter the by type
           //this will be combined with the normal filters
           typeFilter = { type : types };
           //TODO         
           // dataTable.filterData(typeFilter);
         
       } 

       var currentState;
       function setTableState(newState) {
           log.d(newState, currentState);
           //no need to set the state if we're returning to the same one
           if (currentState !== undefined && newState === currentState) return;
           log.d(newState);
           state = isc.addProperties(defaultState, isc.clone(newState));
          
           setTypingState(state.types);
          
           tableFilter.setState(state);
           
           //layout
           if (state.isExpanded) {
               stack.expandSection('Editor');   
               dataTable.setHeight(state.height);
           }
           else {
               stack.collapseSection('Editor');   
               editorHeightExpanded = state.height;
           }
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
           // return;
           var appliedCriteria = isc.DataSource.combineCriteria(
               typeFilter,state.savedAdvCriteria);
           // appliedCriteria = advancedCriteria;
           // appliedCriteria = criteria;
           log.d('Applied Criteria', appliedCriteria);
           // module.temp = appliedCriteria;
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
       API.notify = function (newstate) {
           log.d('setting table to newstate!!!');
           setTableState(newstate);
       };
      
      
      
       //----------------------components---------------------    
       //----------------@TABLE----------------------------
       var typeList = isc.ListGrid.create({
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
                   return { type : g };
               });})()
           ,selectionChanged: function() {
              
               // log.d('----------selection changed----------');
               // var sel = typeList.getSelection();
               // //make sure at least one type is selected, by not
               // //letting the user deselect the last one.
               // if (sel.length === 0) {
               //     typeList.selectRecord(rec); 
               //     sel = typeList.getSelection();
               // }
           }
           ,setSelection: function(types) {
               // console.log('----------setting group selection----------');
               typeList.deselectAllRecords();  
               // if (state.types)
               typeList.getData().forEach(function(e) {
                   if (types.contains(e.type)) typeList.selectRecord(e);
               }
                                         );
           }
       }); 
       
       var okButton = isc.Button.create({
           left: 200,
           showRollOver: true,
           showDisabled: true,
           showDown: true,
           title: "Ok",
           click: function() {
               var sel = typeList.getSelection();
               if (sel.length < 1) return;
               // make a proper groups array out of the selection
               state.types = sel.map(function(t) {
                   return t.type;
               });
               typeWindow.hide(); 
               setTableState(state);
               tableViewStateChanged();
           }
       });
       
       var cancelButton = isc.Button.create({
           left: 200,
           showRollOver: true,
           showDisabled: true,
           showDown: true,
           title: "Cancel",
           click: function() { typeWindow.hide(); }
       });
       // typeWindow.addItem(typeList);
      
      
       var typeWindow = isc.Window.create({
           title: "Types",
           autoSize: true,
           // width:300, height:300,
           canDragReposition: true,
           canDragResize: false,
           showMinimizeButton:false, 
           autoCenter: true,
           isModal: true,
           showModalMask: true,
           autoDraw: false
           ,items: [
               typeList    
               ,okButton
               ,cancelButton
           ]
       });
       
       
       
       
       var newRecord = function(aType) {
           // addUpdateData('addData', { group: 'group'});
           var record = typesAndFields.newRecord(aType);
           database.addData( record,
                             function(resp, data, req) 
		             {   dataTable.deselectAllRecords();
                                 dataTable.selectRecord(data);
                                 editRecord(data);
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
              
               editRecord(dataTable.getSelectedRecord());
           }
       }
      
      
       function editRecord(record) {
           // locationEditor.showDialog(record, {});
           // if (showingFilter) {
           //     stack.removeItem(1, tableFilter.filterStack, 0);
           //     stack.addItem(1, editForm);
           //     showingFilter = false;
           // }
           // console.log(index);
           // tableFilter.filterStack.hide();
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
           editors.fill(editorContainer, record, {
               cancelButton: false, saveButton: true, removeButton: true
           });
           
           // dataTable.setHeight(editorHeightExpanded);   
           stack.expandSection('Editor');   
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
                         editors.show(dataTable.getSelectedRecord(), {
                             cancelButton: true, saveButton: true, removeButton: true
                         });
                         // editor.init(editorWindow, dataTable.getSelectedRecord(), {});
                         // editorWindow.show();
                     }
                   }
                  
               ]
           });
      
       var tableTypeLabel = isc.Label.create({
           width: "*", 
           padding:5,
           prompt:'Types shown in this table.<p>Click to edit',
           click: function() { typeWindow.show();}
       });
       
       var tableFilterLabel = isc.Label.create({
           width: "100%", 
               padding:5,
           prompt:'Current filter for this table.<p> Click to edit',
           click: showFilter
       });
       
       function showFilter() {
           stack.expandSection('Editor');   
           // dataTable.setHeight(editorHeightExpanded);   
           
           editorContainer.removeCanvas();
           editorContainer.setCanvas(tableFilter.filterStack);
       }
      
       var addRecordButton = isc.IconMenuButton.create({
           title:''
	   ,ID:'iconButton'
	   ,iconClick: "this.showMenu()"
	   ,showMenuIcon:false
	   ,width :20
	   ,icon: "[SKIN]/actions/add.png", 
	   prompt: "Create a new record"
	   ,menu: addRecordMenu //{ID: 'mymenu', width:150  }
       });
       
       var toolStrip = isc.ToolStrip.create({
           // ID: "gridEditControls",
           width: "100%", height:24, 
           members: [
               tableTypeLabel,
               // isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/filter.png", 
               //     prompt: "Set filters",
               //     click: showFilter
               // }),
               tableFilterLabel,
               
               isc.LayoutSpacer.create({ width:"*" })
               // ,isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/add.png", 
               //     prompt: "Add record",
               //     click: "console.log('add');"
               // })
               ,addRecordButton
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
	       autoFetchData: true,
	       //editing
	       recordClick: function (viewer, record) {
                   editRecord(record); 
               },
              
	       cellChanged: function (record) {
                   editRecord(record); 
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
               // cle fsda fasdfarFilterText: 'Clear inline filter',
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
               setTypingState: setTypingState,
               setFilterLabel: function(label) {
                   tableFilterLabel.setContents(label);
               },
               setTypeLabel: function(label) {
                   tableTypeLabel.setContents(label);
               },
               contextMenu: tableContextMenu
               // bodyKeyPress : function() { 
               //    console.log('keypress');
               //    return true; 
               // }
           });
      
       tableFilter.link(dataTable, defaultState);
       
       var editorMessage = isc.Label.create({
           // ID:"editorMessage",
           autoDraw: false,
               width:"100%",
           height:"100%",
           align:"center",
           contents:"Select a record to view and edit"
       });
      
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
           },
           done: function(record, action) {
               switch (action) {
                 case 'save' : console.log('selecting record after save', record);
                   dataTable.selectRecord(record); break;
                 case 'remove' : editorContainer.removeCanvas(); break;
                  
               }
           },
           removeRecord: removeRecord
           
           
       });
      
       editorContainer.setCanvas(editorMessage);
      
       //---------------------- @the whole component-------------
      
       var stack = isc.SectionStack.
           create({ 
               ID: 'stack',
	           visibilityMode:"multiple",
	       animateSections:true
               ,onSectionHeaderClick :function() {
                   if (stack.sectionIsExpanded('Editor')) {
                       //save height
                       editorHeightExpanded = dataTable.getHeight();
                       stack.collapseSection('Editor');
                   }
                   else {
                       dataTable.setHeight(editorHeightExpanded);   
                       stack.expandSection('Editor');   
                   }
                   tableViewStateChanged('sectionHeaderClick');
                   return false; }
	       ,sections:[
		   {name:'Table', showHeader:false, title:'Data', items:[dataTable]}
		   ,{name: 'Editor', title:"Details", expanded:false,  hidden: false, items:[editorContainer]}
	       ]
               
	   });
      
       //------------------@API----------------------------- 
       //for use in layout to show these components
       API.grid = stack;
       API.name = 'Table';
       API.icon = "table.png";
       return API;
   }});

//TODO get rid of all ID:
