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
      var views = {
          'Table':table
      };
      var show, //to be set by layout so we can show/hide views in the layout
          modified, //whether the ui has changed. This
          leafShowing = null;
          // autoSaveInterval = 2;
      
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
              //not much use because there will be state change
              //callbacks from smartclient to come after this
	      setModified(false);
              //so set a interval time to see if the state is really
              //different from the stored state and if so setModified to true
              window.setTimeout(checkState, 2000);
              //now any changes made by user will be stored in the
              //leaf and tree when opening up another leaf, when the
              //user saves the tree to the db and when the user
              //navigates away and he gets a chance to mend his ways
              //and to save before leaving.
	      pp('finished changing tree state');
              //do an autosave every minute..
              // window.setInterval(autoSave, autoSaveInterval * 60000);
          };
          
      } 
      
      function checkState() {
          console.log("Checking state");
          setModified(!isEqual(table.getState(), leafShowing.viewState));
      }
      
      //reads state of tree
      function getTreeState() {
          var tree = viewTree.getData().getAllNodes();
          //isc.JSON.encode(
          return { width: viewTree.getWidth(),
                   time: isc.timeStamp(),
                   selectedPaths: viewTree.getSelectedPaths(),
                   //only store data needed to rebuild the tree 
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
          // console.log('modified =' + bool);
          modified = bool;
          if (modified) saveButton.show(true);
          else {saveButton.hide(true);}                
      }
      
      //gets called by currently showing views when their state changes
      //should be set to the observer of any view implemented
      function viewStateChanged() {
          console.log('************viewstateschanged');
          setModified(true);
      }
      
      //this function gets called everytime a change in the viewtree occurs
      function treeStateChanged(origin) {
          console.log('******************tree changed: ' +  origin);
          setModified(true);
          // if (saveOnChange) saveTreeToDb();
      }
      
      function openLeaf(leaf) {
          pp('**************************---------------openLeaf');
          //opening same leaf, do nothing
          if (leaf === leafShowing) return;
          
          //save any changes that might have occured in the leaf
          //for a new leaf...
          if (leafShowing) {
          // console.log('leafShowing name, groups and gridstate',leafShowing.name,
          //             leafShowing.viewState.groups, leafShowing.viewState.grid); 
              leafShowing.viewState = views[leafShowing.view].getState(); 
          // console.log('after: name, groups and gridstate',leafShowing.name,
          //             leafShowing.viewState.groups, leafShowing.viewState.grid); 
	      if (leafShowing.view !== leaf.view) {
	          show(leafShowing.view, false);
	      }
          } 
          else {
           show(leaf.view, true);   
          }
          views[leaf.view].notify(leaf.viewState);
          //set a pointer to the leaf that's now showing
          leafShowing = leaf;
          //we're changing views, so set modified flag
          setModified(true);
              
          pp('finished opening leaf');
          
      }
      
      // var autoSaveState= { id: 'autosave' };
      // function autoSave(callback) {
      //     if (!modified) return; 
      //     // if (!autoSaved) return;
      //     autoSaveState.state = getTreeState();
      //     // if (autoSaveState.time )
      //     autoSaveState.time = isc.timeStamp();
      //     roster.db.put(autoSaveState, function(err, response) {
      //         if (err) {
      //             console.log('ERRROR: Could not save changed state of the view tree.' 
      //   	              + err.error + ' ' + err.reason);
      //             isc.warn('ERROR: Could not save the state of the ui..');
      //         }
      //         else {
      //             console.log('autosaved state');
      //             autoSaveState._rev = response.rev;
      //         }
      //         if (callback) callback();
      //     });
      // }
      
      function saveTreeToDb(callback) {
          leafShowing.viewState = views[leafShowing.view].getState();
          roster.user.viewTreeState = isc.JSON.encode(getTreeState());
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
       console.log('newView')   ;
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
          //open the parent folder, otherwise we can't see the the new record/view
          viewTree.openFolder(parent);
          // pp('In newView: leafShowing.viewState---------',leafShowing.viewState);
          viewTree.openLeaf(newRecord);
          // eafShowing.viewState = table.getState();
          // pp('In newView: table.getState---------',leafShowing.viewState);
          // treeStateChanged('newView');
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
              ID: 'treegrid',
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
          if (!a && !b) return true;
          if (!a || !b) return false;
          for (p in a) {
              var same = true;
              if (typeof a[p] === 'object') same = isEqual(a[p], b[p]);
              else {
                  if (!a[p] && !b[p]) same = true;
                  else same = (a[p] === b[p]);   
              }
              
              if (!same){
                  // console.log(p);
                  // console.log(a, b);
                return false;  
              } 
          };
          return true;   
      };
      
      window.onbeforeunload= 
	  function() { 
              // pp('current state', table.getState());
              // pp('original state', leafShowing.viewState);
              // pp(isEqual(table.getState(), leafShowing.viewState));                   
              if (isEqual(table.getState(), leafShowing.viewState)) {
                  if (!modified) return null;
                  else return 'Leaving will discard changes made to the organising tree.\\nSelect "Stay on this page" and then click the icon next to the login name to save the changes.';
              }
              leafShowing.viewState = views[leafShowing.view].getState();
              setModified(true);
              // saveTreeToDb();
              return 'Leaving will discard changes made to a view.\n\nSelect "Stay on this page" and then click the icon next to the login name to save the changes.';
	      // return 'Leaving will discard changes made to a view.\nStay to save the changes.';
          };
      //-----------------------@API-----------------------
      //sets the show function so that viewTree has a means to show/hide 
      //components
      viewTree.setShow = function(f) { show = f; };
      //to set viewTree to a new state
      viewTree.notify = notify;
      viewTree.ls = function() {
          console.log(leafShowing);
      };
      //exposes the loginButton, not really part of this component.
      viewTree.loginButton = loginButton;
      return viewTree;
  }});


function inf() {
    var temp = module.viewTree.getData().root.children;
   console.log(temp[0].name, temp[0].viewState.grid);
   console.log(temp[1].name, temp[1].viewState.grid);
}
