function help() {  
    console.log(module.viewTree.getData().$27m);
}

/* -----@ TOP ----- */
define
({inject: ['roster', 'table', 'utils'],
  factory: function(roster, table, utils) {
      //with this table can notify us when it has changed and give us the
      //new state so that we can store it in the tree
      table.setObserver(viewStateChanged); 
      
      var show, //to be set by layout so we can show/hide views in the layout
          saveOnChange = false,
          modified, //so we know whether to let the user navigate away or not
          leafShowing = { view: '' },
          ignoreChangeState,
          originalStateOfView,
          autoSaveInterval = 2;
      
      //--------------------@HANDLING STATE----------------------------- 
      function notify(newState) {
          var viewTreeState = isc.JSON.decode(newState);
          if (viewTreeState) {
	      // table.display.init = true;
	      //clear the tree
	      tree.removeList(tree.getChildren(tree.getRoot()));
	      tree.linkNodes(viewTreeState.state);
	      viewTree.setSelectedPaths(viewTreeState.selectedPaths);
	      var selRecord = viewTree.getSelectedRecord();
	      viewTree.setWidth(viewTreeState.width);
	      if (selRecord && !selRecord.isFolder) { 
	          viewTree.openLeaf(selRecord);
	      }
	      setModified(false);
	      pp('finished changing tree state');
              //do an autosave every minute..
              // window.setInterval(autoSave, autoSaveInterval * 60000);
          };
          
      } 
      
      //reads state of tree and returns a JSON string
      function getStateJSON() {
          var tree = viewTree.getData().getAllNodes();
          //isc.JSON.encode(
          return { width: viewTree.getWidth(),
                   time: isc.timeStamp(),
                   selectedPaths: viewTree.getSelectedPaths(),
                   state: tree.map(function(n) {return {
	               view: n.view,
	               id: n.id,
	               parentId: n.parentId,
	               isFolder: n.isFolder,
	               name: n.name,
	               isOpen: n.isOpen,	
	               viewState: n.viewState
                   };
			                       })
                 };
      }
      
      function setModified(bool) {
          console.log('modified =' + bool);
          modified = bool;
          if (modified) saveButton.show(true);// saveButton.setTitle('! modified');
          else {
              saveButton.hide(true);// saveButton.setTitle('');
          }                
          
          
      }
      
      //gets called by currently showing views when their state changes
      //should be set to the observer of any view implemented
      function viewStateChanged() {
          // if (ignoreChangeState) {
          //     ignoreChangeState = false;
          //     pp('ignoring this callback');
          //     return;
          // }
          //store state in leaf currently selected leaf
          // pp('viewStateChanged: assigning ', state , 'to', leafShowing);  
          // leafShowing.viewState = state;
          // console.log('************viewstateschanged', state);
          // pp(leafShowing);
          // leafShowing.modified = true;
          // treeStateChanged();
      }
      
      //this function gets called everytime a change in the viewtree occurs
      function treeStateChanged(origin) {
          console.log('******************tree changed: ' +  origin);
          setModified(true);
          // tree.$27m.forEach(function(l) {
          //     pp(l.name);
              
          //     // pp(l.viewState.grid);
          //     if (l && l.viewState && l.viewState.grid)
          //         var temp = isc.JSON.decode( l.viewState.grid);
          //     pp(temp);
          //     if (l && l.viewState && l.viewState.editor)
          //         pp(l.viewState.editor);
          // });
          // pp(leafShowing);
          // if (!modified) {
          //     setModified(true);
          //     pp('setting onbeforeunload..');
          //     window.onbeforeunload= 
	  //         function() { 
          //             console.log(table.getState());
          //             console.log(leafShowing.viewTreeState);
                      
	  //             return 'Changes have been made. Leaving will discard these changes.';
          //         };}
          if (saveOnChange) saveTreeToDb();
      }
      var confirmButton = isc.Button.create({
          title: "Ask",
          click : function () {
          }
      });
      
      function openLeaf(leaf) {
          pp('**************************---------------openLeaf');
          function openView(view) {
              
              // if (!isEqual(table.getState(), leafShowing.viewState) || modified) {
                 leafShowing.viewState = table.getState(); 
                 // saveTreeToDb();
              // }
              switch (view) { 
                case 'Table': 
                  //if viewState is set , then there will be a callback
                  //notification for a changed stated of the the view. just
                  //ignore this callback.
                  // if (leaf.viewState) ignoreChangeState = true;
	          table.notify(leaf.viewState);
	          if (leafShowing.view !== 'Table') {
	              show(leafShowing.view, false);
	              show('Table', true);
	              //TODO depends onp viewstate whether to show editor..
	              // show('TableEditor', true);
	          }
                  // leaf.viewState = leaf.viewState || table.getState();
                  // console.log(leaf);
	          break; 
	      
              default: 
	          console.log(node.view + ' not yet implemented'); 
	          return; 	
              } 
              leafShowing = leaf;
              
              pp('finished opening leaf');
          }
          
          var dialog = isc.Dialog.create({
              message : "Keep changes?",
              icon:"[SKIN]ask.png",
              isModal: true,
              buttons : [
                  isc.Button.create({ title:"Save" }),
                  isc.Button.create({ title:"Discard" })
              ],
              buttonClick : function (button, index) {
                  this.hide();
                  // leafShowing.modified = false;
                  console.log(button.title);
                  if (button.title === 'Save') {
                      saveTreeToDb(
                          function() {
                              openView(leaf.view);
                          }  );
                  }   
                  else {
                      leafShowing.viewState = originalStateOfView; 
                      pp(originalStateOfView);
                      openView(leaf.view);
                     
                  } 
              }
          });
              
          //opening same leaf, do nothing
          if (leaf === leafShowing) return;
          //navigating away, just save the viewstate 
          // if (leafShowing.modified){
          openView(leaf.view);
          // saveTreeToDb(
          //     function() {
          //         leafShowing.modified = false;
          //         //     // openView(leaf.view);
          //         //     // leafShowing.modified = false;
          //     }
          // );
          // dialog.show();
          // if (value) {
          //     saveTreeToDb();
          // }
          // else {
          //     leafShowing.modified = false;
          // }
          // }
          // else openView(leaf.view);
      }
      
      var autoSaveState= { id: 'autosave' };
      function autoSave(callback) {
          if (!modified) return; 
          // if (!autoSaved) return;
          autoSaveState.state = getStateJSON();
          // if (autoSaveState.time )
          autoSaveState.time = isc.timeStamp();
          roster.db.put(autoSaveState, function(err, response) {
              if (err) {
	          console.log('ERRROR: Could not save changed state of the view tree.' 
		              + err.error + ' ' + err.reason);
                  isc.warn('ERROR: Could not save the state of the ui..');
              }
              else {
                  console.log('autosaved state');
	          autoSaveState._rev = response.rev;
              }
              if (callback) callback();
          });
      }
      
      function saveTreeToDb(callback) {
          roster.user.viewTreeState = isc.JSON.encode(getStateJSON());
          console.log('saving tree');
          roster.db.put(roster.user, function(err, response) {
              if (err) {
	          console.log('ERRROR: Could not save changed state of the view tree.' 
		              + err.error + ' ' + err.reason);
                  isc.warn('ERROR: Could not save the state of the ui..');
              }
              else {
	          roster.user._rev = response.rev;
              }
              setModified(false);
              // window.onbeforeunload = function() { };
              if (callback) callback();
          });
      }
      
      // function setSaveOnChange(bool) {
      //   saveOnChange = bool;
      //   // switch (method) {
      //   // 	case 'auto' : saveOnUnload();  break;
      //   // 	case 'onchange' : autoSave = false; break;
      //   // 	default: console.log('ERROR: setSaveMethod was called with an invalid parameter');
      //   // }
      // }
      
      //if called it sets up saving at intervals and when navigating away
      //not working because the callback from pouch comes to late, 
      //everything is wiped already I think
      // function saveOnUnload() {
      //   window.setInterval(save, 300000);
      //   window.onbeforeunload= save;
      // }
      
      //------------------@manipulate tree---------------------
      
      // var temp = '"{   "state":"({selected:\"[{_id:\\\"guest\\\"}]\",field:\"[{name:\\\"_rev\\\",width:null},{name:\\\"person\\\",width:null},{name:\\\"startDate\\\",width:100},{name:\\\"endDate\\\",width:100},{name:\\\"group\\\",width:null},{name:\\\"_id\\\",width:null},{name:\\\"location\\\",width:null}]\",sort:\"({fieldName:\\\"person\\\",sortDir:\\\"ascending\\\",sortSpecifiers:[{property:\\\"person\\\",direction:\\\"ascending\\\"}]})\",hilite:null,group:\"\"})",    "criteria":null,    "advCriteria":null,    "usingSimpleFilter":true}"';
      
      function clone() {
          var selRecord = viewTree.getSelectedRecord();
          if (!selRecord) return;
          var view = selRecord.view;
          var state = selRecord.viewState;
          var name = selRecord.name;
          console.log(state);
              if (!selRecord)  selRecord = '/';
          else {
              viewTree.selectRecord(selRecord, false);
              selRecord = selRecord['_parent_' + tree.ID];
          }
          var newRecord = tree.add({id:isc.timeStamp(),isFolder:false, 
                                    name: 'Clone of ' + name, view: view,
                                    viewState : state}, selRecord);
          viewTree.selectRecord(newRecord);
          viewTree.openFolder(selRecord);
          treeStateChanged('clone');
          viewTree.openLeaf(newRecord);
          // ignoreChangeState = true;
      };
      
      
      
      function newView(view) {
          var selRecord = viewTree.getSelectedRecord();
          // var state = selRecord.viewState;
          var parent; 
          if (!selRecord)  parent = '/';
              else {
                  viewTree.selectRecord(selRecord, false);
                  parent = selRecord['_parent_' + tree.ID];
              }
          var newRecord = tree.add({id:isc.timeStamp(),isFolder:false, 
                                    name:'New ' + view, view: view
                                    // ,viewState : '{}'
                                   }, parent);
          
          viewTree.selectRecord(newRecord);
          viewTree.openFolder(selRecord);
          pp('---------',leafShowing.viewState);
          treeStateChanged('newView');
          viewTree.openLeaf(newRecord);
          leafShowing.viewState = table.getState();
          pp('---------',leafShowing.viewState);
          
          // ignoreChangeState = true;
      };
      
      function newFolder() {
          var selRecord = viewTree.getSelectedRecord();
          if (!selRecord)  selRecord = '/';
          else {
              viewTree.selectRecord(selRecord, false);
              selRecord = selRecord['_parent_' + tree.ID];
          }
          var newRecord = tree.add({id:isc.timeStamp(),isFolder:true, 
                                    name:'New folder'},selRecord || '/');
          viewTree.selectRecord(newRecord);
          viewTree.openFolder(selRecord);
          treeStateChanged('newFolder');
          viewTree.openFolder(newRecord);
      };
          
      function rename() {
          var record = viewTree.getSelectedRecord();
          if (record == null) return;
          viewTree.startEditing(viewTree.data.indexOf(record));
          
      };
      
      function remove() {
          var selRecord = viewTree.getSelectedRecord();
          if (selRecord) {
              var index = viewTree.getRecordIndex(selRecord);
              viewTree.removeSelectedData();
              if (viewTree.getTotalRows() === index) index--;
              console.log(viewTree.getTotalRows(), index);
              viewTree.selectRecord(index);
              treeStateChanged('remove');
          }
      }

      //--------------------------components-------------------
      //--------------------@MENUS AND TOOLSTRIP
      //for use in both toolstrip and context menu
      
      var tableSubMenu = [
          {title:"Everything", 
           click: function() { newView(this.title); } 
           // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
           // ,submenu:tableSubMenu  
          },
          {title:"People",
           click: function() { newView(this.title); } 
           // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          },
          {title:"Locations",
           click: function() { newView(this.title); } 
           // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          },
          {title:"Shifts",
           click: function() { newView(this.title); } 
           // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          }

          
      ];
      var newViews = [
          {title:"Table", 
           click: function() { newView(this.title); } 
           ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
           // ,submenu:tableSubMenu  
          },
          {title:"Calendar",
           click: function() { newView(this.title); } 
           ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          },
          {title:"Roster",
           click: function() { newView(this.title); } 
           ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          },
          {title:"Timesheet",
           click: function() { newView(this.title); } 
           ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          }
      ];

      var rightClickMenu = isc.Menu.create(
              {// ID:"rightClickMenu",
                  width:150
                  ,data:[
                      {title:"Select"
	               // ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
	               ,click: function() { select(); } 
	              } 
	              ,{isSeparator:true}
	              ,{title:"Clone"
		        ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
		        ,click: function() { clone(); } 
	               } 
                      ,{isSeparator:true}
	              ,{title:"New folder"
		        ,icon: isc.Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
		        ,click: function() { newFolder(); } 
	               } 
	              ,{title:"Rename"
		        ,icon: isc.Page.getSkinDir() +"images/actions/edit.png"
		        ,click: function() { rename(); } 
	               }
	              ,{title:"Remove"
		        ,icon: isc.Page.getSkinDir() +"images/actions/remove.png"
		        ,click: function() { remove(); } 
	               }
	              ,{isSeparator:true}
	              ,{title:"Save tree"
		        ,icon: isc.Page.getSkinDir() +"images/actions/save.png"
		        ,click: function() { saveTreeToDb(); }
	               }]
              });
      
      var loginButton = isc.ToolStripButton.create(
          {
              align:'left' 
          });
      
      var saveButton = isc.ToolStripButton.create({
	  icon: "[SKIN]/actions/save.png",
	  prompt: "Save this view"
	  ,click: function() { saveTreeToDb(); }
      });

      var toolStrip = isc.ToolStrip.create(
          {members: [
              loginButton
	      ,saveButton     
              ,isc.LayoutSpacer.create({  width:"*" })
              ,isc.IconMenuButton.create({title:''
				          ,ID:'addButton'
				          ,iconClick: "this.showMenu()"
				          ,showMenuIcon:false
				          ,width :20
				          ,icon: "[SKIN]/actions/add.png", 
				          prompt: "Create a new view"
				          ,menu: {width:150 ,data: newViews}
				         })
              ,isc.ToolStripButton.create({
	          icon: "[SKIN]/RichTextEditor/copy.png",
	          prompt: "Clone selected view"
	          ,click: function() { clone(); }
              })
              ,isc.ToolStripButton.create({
	          icon: "[SKIN]/FileBrowser/createNewFolder.png", 
	          prompt: "Create a new folder"
	          ,click: function() { newFolder(); }
              })
              ,isc.ToolStripButton.create({
	          icon: "[SKIN]/actions/edit.png",
	          prompt: "Rename selected item"
	          ,click: function() { rename(); }
              })
              ,isc.ToolStripButton.create({
	          icon: "[SKIN]/actions/remove.png", 
	          prompt: "Remove selected item"
	          ,click: function() { remove(); }
              })
          ]
          });
      
      //------------------@VIEWTREE------------------
      var tree = isc.Tree.
	  create({
	      ID:'tree',
	      modelType: "parent",
	      nameProperty: "id",
	      idField: "id",
	      parentIdField: "parentId",
	      openProperty :'isOpen'
	  });

      var viewTree = isc.TreeGrid.
          create({
	      contextMenu:rightClickMenu
	      ,canDragRecordsOut:true,
	      canAcceptDroppedRecords:true
	      ,canReorderRecords: true,
	      canAcceptDroppedRecords: true
	      ,data: tree 
	      ,showHeader:false
	      ,modalEditing: true
	      ,selectOnEdit: false
	      ,escapeKeyEditAction: 'cancel'
	      ,editorExit: function() { this.canEdit = false;}
	      ,viewStateChanged: function() {
                  // console.log('vsw');
	          treeStateChanged('treeStateChanged');
	      }
	      ,cellChanged: function() {
                  console.log('cell');
	          treeStateChanged('cellChanged');
	      }
	      ,onFolderDrop: function() {
	          treeStateChanged('onFolderDrop');
	      }
	      ,openLeaf: openLeaf
	      ,autoFetchData:true
	      ,gridComponents:[toolStrip, "header", "body" ]
	      ,fields:[{
	          name:"name",
	          length:128,
	          type:"text"
	      }
		          ]
	  });
      function isEqual(a,b) {
          for (p in a) {
              var same = true;
              if (typeof a[p] === 'object') same = isEqual(a[p], b[p]);
              else {
                  if (!a[p] && !b[p]) same = true;
                  else same = (a[p] === b[p]);   
              }
              
              if (!same){
                  console.log(p);
                return false;  
              } 
          };
          return true;   
      };
      
      window.onbeforeunload= 
	  function() { 
              // console.log('in beforeunload');
              // console.log(table.getState());
              pp('current state', table.getState());
              pp('original state', leafShowing.viewState);
              pp(isEqual(table.getState(), leafShowing.viewState));                   
              
              if (isEqual(table.getState(), leafShowing.viewState)) {
                  if (!modified) return null;
                  else return 'Leaving will discard changes made to the organising tree';
              }
              leafShowing.viewState = table.getState();
              setModified(true);
              // saveTreeToDb();
	      return 'Leaving will discard changes made to a view.';
          };
      //-----------------------@API-----------------------
      //sets the show function so that viewTree has a means to show/hide 
      //components
      viewTree.setShow = function(f) { show = f; };
      //to set viewTree to a new state
      viewTree.notify = notify;
      //exposes the loginButton, not really part of this component.
      viewTree.loginButton = loginButton;
      return viewTree;
  }});
