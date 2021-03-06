/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true*/

define
({ load: ['loaders/editor'], 
   inject: [ 'View', 'types/typesAndFields', 'editorManager', 'views/table/tableFilter', 'user'],
   factory: function (View, typesAndFields, editors, tableFilter, user) {
       "use strict";
       var log = logger('table');
       var dataSource;

       var view = View.create({
           type: 'Table'
           ,icon : "table.png"
           ,defaultState : { height: 300, isExpanded: true, tab: 1, hidden: false}
           ,init: function() {
               //TODO you could do lazy creating of this view here...
               //so only when init gets called.
               dataSource = View.getBackend().getDS();
               dataTable.setDataSource(dataSource);
           }
           ,sync: function(state) {
               log.d('XXXXXXXXXXXXXXXX', editorHasChanged);
               // if (editorHasChanged)
               //     getConfirmDialog('The editor has unsaved changes.' +
               //                      ' Save now? If you choose no, you can still ' +
               //                      'go back to the table and save it from there',
               //                      'Yes', 'No').show();
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
           } 
           
           ,set: function(state) {
               setTypingState(state);
               tableFilter.setState(state);
               //layout
               if (state.isExpanded) {
                   stack.expandSection('Editor');   
                   dataTable.setHeight(state.height);
               }
               else {
                   stack.collapseSection('Editor');   
               }
               editorHeightExpanded = state.height;
               //dataTable state
               dataTable.setViewState(state.grid);
               applyCriteria(state);
              
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
               // log.d('bbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaa',dataTable.typeFilter);
          
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
       });
       //End of definition of the table view
       
       var editorHeightExpanded= 300;
       var editorHasChanged = false;
       
       // tableFilter.filterStack.hide();
      
       //type menu items get added dynamically in setTypingState
       var addRecordMenu = {
           // ID:'typeMenu',
           width: 150,
           data: [ { title: 'hello' }]
       };
       
       //all possible types for the right top add record button
       var typeMenuItems = [];
       log.d('allTypes----------------', typesAndFields.allTypes);
       typesAndFields.allTypes.forEach(function(g) {
           typeMenuItems[g] = {
               name: g,
               // icon: isc.Page.getSkinDir() +"images/actions/add.png",
               icon: typesAndFields.getType(g).icon,
               click: function() {
                  newRecord(g);
               }
           }; 
       });
      
       //--------------------@handling state----------------------------- 
       function applyCriteria(state) {
           var appliedCriteria = isc.DataSource.combineCriteria(
               dataTable.typeFilter,state.savedAdvCriteria);
           if (dataTable.willFetchData(appliedCriteria)) 
               dataTable.fetchData(undefined, 
                                   function() {
                                       dataTable.setCriteria(appliedCriteria);
                                       log.d('fetch completed');});
           else dataTable.setCriteria(appliedCriteria);
       }

       function setTypingState(state) {
           //types
           if (!state.types || state.types.length === 0) state.types = typesAndFields.allTypes;
           var types = state.types;
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
           // typeFilter = { type : types };
           //TODO         
           // dataTable.filterData(typeFilter);
           
           
           var criteria = [];
           types.forEach(function(t) {
             criteria.push({
                 fieldName: 'type',
                 operator:'equals',
                 value:t
             });  
           });
           dataTable.typeFilter = {
               _constructor:"AdvancedCriteria",
               operator:"or",
               criteria: criteria  
           };
           // log.d('aaaaaaaaaaaaaaaaaaaaaaaaa',dataTable.typeFilter);
       } 
      
       //called when table's view is modified
       function tableViewStateChanged(){
           view.modified();
       }
      
       //----------------------components---------------------    
       //----------------@TABLE----------------------------
       var typeList = isc.ListGrid.create({
           width:100, 
           alternateRecordStyles:true,
           autoFitData: 'both',
           autoFetchData: true,
           autoFetchDisplayMap: true,
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
               // log.d('----------setting group selection----------');
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
               var state = view.getState();
               if (sel.length < 1) return;
               // make a proper groups array out of the selection
               state.types = sel.map(function(t) {
                   return t.type;
               });
               log.d(state.types);
               typeWindow.hide(); 
               tableViewStateChanged();
               setTypingState(state);
               applyCriteria(state);
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
       
       // var editorHasChanged = function() {
       //     var presentEditor = editorContainer.getCanvas();
       //     if (presentEditor && presentEditor.valuesHaveChanged && presentEditor.valuesHaveChanged()) {
       //         dataTable.setSelectionType('none');
       //         return true;
       //     }
       //     return false;
       // };
           
       function getConfirmDialog(msg, yes, no, action) {
           var confirmDiscardDialog = isc.Dialog.create({
               message : msg,
               icon:"[SKIN]ask.png",
               buttons : [
                   isc.Button.create({ title: no }), //0
                   isc.Button.create({ title: yes })  //1
               ],
               buttonClick : function (button, index) {
                   log.d(index);
                   if (index === 1) {
                       var record = editorContainer.getCanvas().getValues();
                       log.d('saving record', record);
                       typesAndFields.removeUnderscoreFields(record);
                       
                       var callback = function(response, record) {
                           log.d('CALLBACK', response, record);
                           editorHasChanged = false;
                           if (action)  action();
                       };
           
                       if (record._rev) {
                           dataSource.updateData(record, callback);
                       }
                       else dataSource.addData(record, callback);
                   }
                   else {
                       if (no === 'Discard') editorHasChanged = false;
                       if (action) action();   
                   }
                   this.hide();
               }
           });
           return confirmDiscardDialog;
       }
       
       function setEditor(action) {
           log.d('SETEDITOR', editorContainer.isChanged && editorContainer.isChanged());
           
           // if (!editorHasChanged) action();
           if (!editorContainer.isChanged ||
               (editorContainer.isChanged && !editorContainer.isChanged())
               // || !editorHasChanged
              ) action();
           else {
               getConfirmDialog('Values have changed. Save?',
                               'Save', 'Discard', action).show();
           }
       }
       
       
       function checkId(str) {
           var msg;
           // var match = str.match(/[A-Za-z0-9 \-_]+/);
           var match = str.match(/^[A-Za-z0-9_\-]*[A-Za-z][A-Za-z0-9 _]*$/);
           console.log(match);
           if (str.length === 0) msg = "Empty string";
           else if (!match || match.length === 0 || match[0].length !== str.length)
               msg = 'Illegal id, only letters, numbers, space, - (dash) and _  (underscore) are allowed, with at least one letter.';
           if (msg) {
               alert(msg);
               console.log(msg);
               return false;
           }
           return true;
       }
       
       var newRecord = function(aType, prompt) {
           prompt =  prompt || '';
           if (dataTable.selectionType === 'none') return;
           var record = typesAndFields.newRecord(aType);
           // record.lastEdited = {
           //     user: user.get()._id,
           //     time: new Date()
           // };
           
           if (record.type === 'location' || record.type === 'person') {
               isc.askForValue('Set the unique id for this ' + record.type,
                               function(value) {
                                   if (value === null) return; //cancel
                                   value = value.trim();
                                   if (checkId(value)) {
                                       record.lastEditedAt = new Date();
                                       record.lastEditedBy = user.get()._id;
                                       record._id = value;
                                       dataSource.addData( record,
                                                           function(resp, data, req) 
		                                           {   dataTable.deselectAllRecords();
                                                               dataTable.selectRecord(data);
                                                               editRecord(data);
                                                               // editForm.setValues(data);
                                                               // log.d('AAAAAAAAAAA',resp,data,req);
                                                           });
                       
                                   }
                                   else newRecord(aType, value);
                               }, {
                                   width: 400                 
                                   ,defaultValue: prompt 
                               });
               // record.name = 'mynewname';
           } else dataSource.addData(
               record,
               function(resp, data, req) 
	       {   dataTable.deselectAllRecords();
                   dataTable.selectRecord(data);
                   editRecord(data);
                   // editForm.setValues(data);
                   log.d('AAAAAAAAAAA',resp,data,req);});
       };
      
      
       function removeRecord() {
           //TODO ask for confirmation..
           var selRecord = dataTable.getSelectedRecord();
           if (selRecord) {
               var index = dataTable.getRecordIndex(selRecord);
               // log.d('index of selected item before removing
               //it is: ', index); an async call, so the new selindex
               //has to be one more or less
               dataTable.removeSelectedData();
              
               if (dataTable.getTotalRows() === index + 1) index--;
               else index++;
               // log.d('total rows now is ' + dataTable.getTotalRows());
               // log.d('selecting row: ' + index);
               dataTable.selectRecord(index);
              
               editRecord(dataTable.getSelectedRecord());
           }
       }
      
      
       function editRecord(record) {
           // if (editorHasChanged) return;
           if (dataTable.selectionType === 'none') return;
	   log.d(record, "Selected Record");
           
           editors.fill(editorContainer, record, {
               cancelButton: false, saveButton: true, removeButton: true
           });
           stack.getSection('Editor').setTitle('Details: ' + record.type);
           
           log.d('editorHeightExpanded', editorHeightExpanded);
           if (stack.sectionIsExpanded('Editor')) {
               //save height
               editorHeightExpanded = dataTable.getHeight();
               log.d('editorHeightExpanded', editorHeightExpanded);
               // stack.collapseSection('Editor');
           }
           else {
               dataTable.setHeight(editorHeightExpanded);   
               log.d('editorHeightExpanded', editorHeightExpanded);
               stack.expandSection('Editor');   
           }
       }

      
       var tableContextMenu = isc.Menu.create(
           {// ID:"rightClickMenu",
               width:150
               ,data:[
	           // {title:"click"
		   //  ,icon: isc.Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
		   //  ,click: function() { log.d('hello'); }
	           // } ,
                   // { title: 'edit',
		   //   icon: isc.Page.getSkinDir() +"images/actions/edit.png",
                   //   // icon: "edit.png", 
                   //   click: function() { log.d('edit'); }
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
                         editorHeightExpanded = dataTable.getHeight();
                         stack.collapseSection('Editor');
                         stack.getSection('Editor').setTitle('');
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
           prompt:'Current filter for this table.'
           // prompt:'Current filter for this table.<p> Click to edit',
           // click: showFilter
       });
       
       function showFilter() {
           stack.expandSection('Editor');   
           // dataTable.setHeight(editorHeightExpanded);   
           
           stack.getSection('Editor').setTitle('Filter');
           editorContainer.removeCanvas();
           editorContainer.setCanvas(tableFilter.filterStack);
       }
      
       var addRecordButton = isc.IconMenuButton.create({
           title:''
	       ,ID:'iconButton'
	   ,click: "this.showMenu()"
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
               isc.ToolStripButton.create({
                   icon: "[SKIN]/actions/filter.png", 
                   prompt: "Set filters",
                   click: showFilter
               }),
               
               tableFilterLabel,
               isc.LayoutSpacer.create({ width:"*" })
               // ,isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/add.png", 
               //     prompt: "Add record",
               //     click: "log.d('add');"
               // })
               ,tableTypeLabel
               ,addRecordButton
               // ,isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/remove.png", 
               //     prompt: "Remove selected record",
               //     // click: "log.d('remove');"
               //     click: function() { remove(); }
               // }),
               // isc.ToolStripButton.create({
               //     icon: "[SKIN]/actions/edit.png", 
               //     prompt: "Edit record",
               //     click: "log.d('edit');"
               // })
           ]
       });

       var dataTable = isc.ListGrid.create(
           {   
	       ID: "dataTable",
	       // dataSource: backend.get().getDS(),
               showEmptyMessage: true,
               emptyMessage: "<br>Click the <b>Green plus butoon</b> to populate this grid.",    
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
                   var action = function() {
                       editRecord(record); 
                   };
                   setEditor(action);
               },
              
	       cellChanged: function (record) {
                   var action = function() {
                       editRecord(record); 
                   };
                   setEditor(action);
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
                       var state = view.getState();
	               dataTable.clearCriteria();
                           var appliedCriteria = isc.DataSource.combineCriteria(
                               dataTable.typeFilter,state.savedAdvCriteria);
	               dataTable.filterData(appliedCriteria);
                       tableViewStateChanged('clearSimpleFilter');
	           },
                   icon:'clear.png',
                   showRollOverIcon: false,
                   showDownIcon: true
               },
               
               // headerContextMenu: true,
               // FilterText: 'Clear inline filter',
	       viewStateChanged: function() { tableViewStateChanged('viewStateChanged'); },
	       // 	  showEmptyMessage: true,
	       // emptyMessage: "<br>Click the <b>Set data</b> button to populate this grid.",
	       // cellContextClick:"return itemListMenu.showContextMenu()",
	       // Function to update details based on selection
	       // filterEditorSubmit: function(criteria) {
                   
               //     tableViewStateChanged('filterEditorSubmit');
               //     // var appliedCriteria = isc.DataSource.combineCriteria(
               //     //     dataTable.typeFilter,state.savedAdvCriteria);
               //     // var finalCriteria = isc.DataSource.combineCriteria(
               //     //     criteria, appliedCriteria);
               //     // this.setCriteria(finalCriteria);
	       //    // log.d('modified filter', finalCriteria);
               //     // return false;
	       //     // storeTableViewState();
	       // },
               setTypingState: setTypingState,
               setFilterLabel: function(label) {
                   tableFilterLabel.setContents(label);
               },
               setTypeLabel: function(label) {
                   tableTypeLabel.setContents(label);
               },
               contextMenu: tableContextMenu
               // bodyKeyPress : function() { 
               //    log.d('keypress');
               //    return true; 
               // }
           });
      
       tableFilter.link(dataTable);
       
       var emptyMessage = isc.Label.create({
           // ID:"editorMessage",
           autoDraw: false,
           width:"100%",
           height:"100%",
           align:"center",
           contents:"Select a record to view and edit"
       });
      
       var editorContainer = isc.Canvas.create({
           overflow:'auto',
           width: '100%',
           height:'100%',
           getCanvas: function() {
               log.d('getting canvas');
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
                 case 'save' : log.d('selecting record after save', record);
                   dataTable.selectRecord(record); break;
                 case 'remove' : editorContainer.removeCanvas(); break;
                  
               }
           },
           removeRecord: removeRecord,
           changed: function(changed) {
               log.d('changed');
               if (changed) {
                   editorHasChanged = true;
                   // dataTable.setSelectionType('none');
               }
               else {
                   editorHasChanged = false;
                   // dataTable.setSelectionType('single');
               }
               
           }
           
           
       });
      
       editorContainer.setCanvas(emptyMessage);
      
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
                       log.d('editorHeightExpanded', editorHeightExpanded);
                       stack.collapseSection('Editor');
                   }
                   else {
                       dataTable.setHeight(editorHeightExpanded);   
                       log.d('editorHeightExpanded', editorHeightExpanded);
                       stack.expandSection('Editor');   
                   }
                   tableViewStateChanged('sectionHeaderClick');
                   return false; }
	       ,sections:[
		   {name:'Table', showHeader:false, title:'Data', items:[dataTable]}
		   ,{name: 'Editor', title:"Details", expanded:false,  hidden: false, items:[editorContainer]}
	       ]
               
	   });
      
       //for use in layout to show these components
       view.setCmp(stack);
       return view;
   }});
//TODO get rid of all ID:
