/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

// -----@ TOP ----- */
define
// ({inject: ['globals', 'table', 'calendar' ],
({inject: ['globals', 'table', 'calendar', 'timesheet'],
  factory: function(globals, table, calendar, timesheet) {
      "use strict";
      var log = logger('viewTree');
      //dummy empty view for initialization purposes. Also a template
      //for more views.
      var emptyView =
          { name: 'Empty'
            ,getState: function() {}
            ,setObserver: function() {}};
      
      //add new views to this list. Unfortunately you have to add it
      //three times. Once to inject, once to pass it in, and then to
      //add it to views, although we could read the args list..
      var views = [
          emptyView
          ,table
          ,calendar
          ,timesheet
      ];
      var newViewMenu = [];
      
      views = (function() {
          var result = {};
          var proto = {
              click: function() { newView(this.name); } 
              ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
          };
          views.forEach(function(v) {
              v.setObserver(viewStateChanged);
              var aview = Object.create(proto);
              aview.name = v.name;
              aview.icon = v.icon || aview.icon;
              if (aview.name !== 'Empty')
                  newViewMenu.push(aview);
              result[v.name] = v;
          });
          return result;
      })();
      
      var show, //to be set by layout so we can show/hide views in the layout
          modified, //whether the ui has changed
      
      //for initialization purposes when there is no view at all defined
          leafShowing = {
              view: 'Empty'
          };
      
      //--------------------@HANDLING STATE----------------------------- 
      function notify(newState) {
          var viewTreeState = isc.JSON.decode(newState);
          if (viewTreeState) {
              //width of side bar
              viewTree.setWidth(viewTreeState.width);
	      //clear the tree
	      tree.removeList(tree.getChildren(tree.getRoot()));
              //set the tree to the saved state
	      tree.linkNodes(viewTreeState.state);
              log.d('path:::::',viewTreeState.pathOfLeafShowing);
	      viewTree.setSelectedPaths(viewTreeState.pathOfLeafShowing);
	      var selRecord = viewTree.getSelectedRecord();
	      if (selRecord && !selRecord.isFolder) { 
	          openLeaf(selRecord);
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
	      log.d('finished changing tree state');
              //do an autosave every minute..
              // window.setInterval(autoSave, autoSaveInterval * 60000);
          }
          
      } 
      
      function checkState() {
          log.d("Checking state");
          // setModified(!isEqual(table.getState(), leafShowing.viewState));
          setModified(!isEqual(views[leafShowing.view].getState(),leafShowing.viewState));
      }
      
      //reads state of tree
      function getTreeState() {
          var tree = viewTree.getData().getAllNodes();
          //isc.JSON.encode(
          return { width: viewTree.getWidth(),
                   time: isc.timeStamp(),
                   pathOfLeafShowing: leafShowing.path,
                   // selectedPaths: pathShowing, //viewTree.getSelectedPaths(),
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
          // log.d('modified =' + bool);
          modified = bool;
          if (modified) saveButton.show(true);
          else {saveButton.hide(true);}                
      }
      
      //gets called by currently showing views when their state changes
      //should be set to the observer of any view implemented
      function viewStateChanged(origin) {
          log.d('Changed: ' + origin);
          setModified(true);
      }
      
      //this function gets called everytime a change in the viewtree occurs
      function treeStateChanged(origin) {
          log.d('******************tree changed: ' +  origin);
          setModified(true);
          // if (saveOnChange) saveTreeToDb();
      }
      
      function openLeaf(leaf) {
          log.d('**************************---------------openLeaf');
          //opening same leaf, do nothing
          if (leaf === leafShowing) {
              log.d('Opening same leaf..');
              return;         
          }
          
          //save any changes that might have occured in the leaf
          leafShowing.viewState =
              views[leafShowing.view].getState(); 
          log.d('Saved changes to viewstate', leafShowing.viewState, leafShowing.name);
	  if (leafShowing.view !== leaf.view) {
	      show(leafShowing.view, false);
	  }
          // } 
          //give the component that's about to be shown the specific
          //data of the new leaf
          views[leaf.view].notify(leaf.viewState);
          //show the leaf, redundant, harmless call if it's the same
          //type of view
          show(leaf.view, true);   
          //set a pointer to the leaf that's now showing
          leafShowing = leaf;
          leafShowing.path = viewTree.getSelectedPaths();
          //we're changing views, so set modified flag
          setModified(true);
          
         log.d('finished opening leaf');
          
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
      //             log.d('ERRROR: Could not save changed state of the view tree.' 
      //             + err.error + ' ' + err.reason);
      //             isc.warn('ERROR: Could not save the state of the ui..');
      //         }
      //         else {
      //             log.d('autosaved state');
      //             autoSaveState._rev = response.rev;
      //         }
      //         if (callback) callback();
      //     });
      // }
      
      function saveTreeToDb(callback) {
          console.log('saving');
          leafShowing.viewState = views[leafShowing.view].getState();
          // debugger;
          // console.log(leafShowing.viewState); 
          globals.user.viewTreeState = isc.JSON.encode(getTreeState());
          
          // log.d('save',leafShowing);
          // log.d('save',globals.user.viewTreeState);
          // log.d('saving tree');
          //TODO get the roster.user from the database and then use
          //that object to save the ui, or put the ui in a separate
          //doc...  at the moment there is an update error when you try to
          //save after modifying the current user in a table for
          //instance
          globals.db.put(globals.user, function(err, response) {
              if (err) {
	          log.d('ERRROR: Could not save changed state of the view tree.' +
                              err.error + ' ' + err.reason);
                  isc.warn('ERROR: Could not save the state of the ui..');
              }
              else {
	          globals.user._rev = response.rev;
                  log.d('save',globals.user.viewTreeState);
              }
              setModified(false);
              // window.onbeforeunload = function() { };
              if (callback) callback();
          });
      }
      
      // function setSaveOnChange(bool) { saveOnChange = bool; //
      //   switch (method) { //case 'auto' : saveOnUnload(); break;
      //   //case 'onchange' : autoSave = false; break; //default:
      //   log.d('ERROR: setSaveMethod was called with an
      //   invalid parameter'); // } }
      
      //if called it sets up saving at intervals and when navigating away
      //not working because the callback from pouch comes to late, 
      //everything is wiped already I think
      // function saveOnUnload() {
      //   window.setInterval(save, 300000);
      //   window.onbeforeunload= save;
      // }
      
      //------------------@manipulate tree---------------------
      
      // function clone() {
      //     var selRecord = viewTree.getSelectedRecord();
      //     if (!selRecord) return;
      //     var view = selRecord.view;
      //     var state = selRecord.viewState;
      //     var name = selRecord.name;
      //     log.d(state);
      //     if (!selRecord)  selRecord = '/';
      //     else {
      //         viewTree.selectRecord(selRecord, false);
      //         selRecord = selRecord['_parent_' + tree.ID];
      //     }
      //     var newRecord = tree.add({id:isc.timeStamp(),isFolder:false, 
      //                               name: name + ' (clone)', view: view,
      //                               viewState : state}, selRecord);
      //     viewTree.selectRecord(newRecord);
      //     viewTree.openFolder(selRecord);
      //     treeStateChanged('clone');
      //     viewTree.openLeaf(newRecord);
      //     // ignoreChangeState = true;
      // }
      
      function getUniqueName(baseName, parent) {
          function nameExists(siblings, name) {
              for (var i=0; i < siblings.length; i++) {
                  var sibling = siblings[i];
                  if (sibling.name === name) break;
              } 
              return i !== siblings.length;
          }
          var newName = baseName; 
          var version = 2;
          if (parent && parent.children) {
              while (nameExists(parent.children, newName)) {
                  newName = baseName + ' (' + version + ')';
                  version++;
              }
          }
          return newName;
      } 
      
      function newView(view) {
          log.d('newView')   ;
          var selRecord = viewTree.getSelectedRecord();
          // var state = selRecord.viewState;
          var parent; 
          if (!selRecord)  parent = '/';
          else {
              viewTree.selectRecord(selRecord, false);
              parent = selRecord['_parent_' + tree.ID];
              
          }
          var newName = getUniqueName(view, parent);
          var newRecord = tree.add({id:isc.timeStamp(),isFolder:false, 
                                    name:newName, view: view
                                    // ,viewState : '{}'
                                   }, parent);
          
          viewTree.selectRecord(newRecord);
          //open the parent folder, otherwise we can't see the the new record/view
          viewTree.openFolder(parent);
          // pp('In newView: leafShowing.viewState---------',leafShowing.viewState);
          viewTree.openLeaf(newRecord);
          // eafShowing.viewState = table.getState();
          // pp('In newView: table.getState---------',leafShowing.viewState);t
          treeStateChanged('newView');
      }
      
      function newFolder() {
          var selRecord = viewTree.getSelectedRecord();
          var parent;
          if (!selRecord)  parent = '/';
          else {
              viewTree.selectRecord(selRecord, false);
             parent = selRecord['_parent_' + tree.ID];
          }
          var newName = getUniqueName('Folder', parent);
          var newRecord = tree.add({id:isc.timeStamp(),isFolder:true, 
                                    name: newName}, parent);
          viewTree.selectRecord(newRecord);
          viewTree.openFolder(parent);
          treeStateChanged('newFolder');
          viewTree.openFolder(newRecord);
      }
      
      function rename() {
          var record = viewTree.getSelectedRecord();
          if (record === null) return;
          viewTree.startEditing(viewTree.data.indexOf(record));
          
      }
      
      function remove() {
          var selRecord = viewTree.getSelectedRecord();
          if (selRecord) {
              var index = viewTree.getRecordIndex(selRecord);
              viewTree.removeSelectedData();
              if (viewTree.getTotalRows() === index) index--;
              log.d(viewTree.getTotalRows(), index);
              viewTree.selectRecord(index);
              treeStateChanged('remove');
          }
      }

      //--------------------------components-------------------
      //--------------------@MENUS AND TOOLSTRIP
      //for use in both toolstrip and context menu
      
      // var tableSubMenu = [
      //     {title:"Everything", 
      //      click: function() { newView(this.title); } 
      //      // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
      //      // ,submenu:tableSubMenu  
      //     },
      //     {title:"People",
      //      click: function() { newView(this.title); } 
      //      // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
      //     },
      //     {title:"Locations",
      //      click: function() { newView(this.title); } 
      //      // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
      //     },
      //     {title:"Shifts",
      //      click: function() { newView(this.title); } 
      //      // ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
      //     }

      
      // ];
      
      //TODO different menu for when you click not on a leaf or node?
      var rightClickMenu2 = isc.Menu.create(
          {// ID:"rightClickMenu",
              width:150
              ,data:[
                  // {title:"Select"
	          //  // ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
	          //  ,click: function() { select(); } 
	          // } 
	          // ,{isSeparator:true}
	          // {title:"Clone"
		  //   ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
		  //   ,click: function() { clone(); } 
	          //  } 
                  // ,{isSeparator:true}
	          {title:"New folder"
		   ,icon: isc.Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
		   ,click: function() { newFolder(); } 
	          } 
	          // ,{title:"Rename"
		  //   ,icon: isc.Page.getSkinDir() +"images/actions/edit.png"
		  //   ,click: function() { rename(); } 
	          //  },
	          // {title:"Remove"
		  //   ,icon: isc.Page.getSkinDir() +"images/actions/remove.png"
		  //   ,click: function() { remove(); } 
	          //  }
	          // , {isSeparator:true}
	          // ,{title:"Save tree"
		  //   ,icon: isc.Page.getSkinDir() +"images/actions/save.png"
		  //   ,click: function() { saveTreeToDb(); }
	          //  }
              ]
          });
      
      var rightClickMenu = isc.Menu.create(
          {// ID:"rightClickMenu",
              width:150
              ,data:[
                  // {title:"Select"
	          //  // ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
	          //  ,click: function() { select(); } 
	          // } 
	          // ,{isSeparator:true}
	          // {title:"Clone"
		  //   ,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
		  //   ,click: function() { clone(); } 
	          //  } 
                  // ,{isSeparator:true}
	          // {title:"New folder"
		  //  ,icon: isc.Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
		  //  ,click: function() { newFolder(); } 
	          // } ,
	          {title:"Rename"
		    ,icon: isc.Page.getSkinDir() +"images/actions/edit.png"
		    ,click: function() { rename(); } 
	           }
	          ,{title:"Remove"
		    ,icon: isc.Page.getSkinDir() +"images/actions/remove.png"
		    ,click: function() { remove(); } 
	           }
	          // , {isSeparator:true}
	          // ,{title:"Save tree"
		  //   ,icon: isc.Page.getSkinDir() +"images/actions/save.png"
		  //   ,click: function() { saveTreeToDb(); }
	          //  }
              ]
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
				          prompt: "Create/clone a view"
				          ,menu: {width:150 ,data: newViewMenu}
				         })
              // ,isc.ToolStripButton.create({
	      //     icon: "[SKIN]/RichTextEditor/copy.png",
	      //     prompt: "Clone selected view"
	      //     ,click: function() { clone(); }
              // })
              ,isc.ToolStripButton.create({
	          icon: "[SKIN]/FileBrowser/createNewFolder.png", 
	          prompt: "Create a new folder"
	          ,click: function() { newFolder(); }
              })
              // ,isc.ToolStripButton.create({
	      //     icon: "[SKIN]/actions/edit.png",
	      //     prompt: "Rename selected item"
	      //     ,click: function() { rename(); }
              // })
              // ,isc.ToolStripButton.create({
	      //     icon: "[SKIN]/actions/remove.png", 
	      //     prompt: "Remove selected item"
	      //     ,click: function() { remove(); }
              // })
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
      
      window.test = function() {
          tree.root.children.forEach(function(c, i) {
              console.log(i, c.viewState);
          });
          return 'end';
      };
      
      

      var viewTree = isc.TreeGrid.
          create({
              ID: 'treegrid'
	      ,contextMenu:rightClickMenu2
              ,showCellContextMenus: true
	      ,canDragRecordsOut:true,
	      canAcceptDroppedRecords:true
	      ,canReorderRecords: true
	      ,data: tree 
	      ,showHeader:false
	      ,modalEditing: true
	      ,selectOnEdit: false
	      ,escapeKeyEditAction: 'cancel'
	      // ,editorExit: function() { this.canEdit = false;}
              ,canEdit: true
              ,leafContextClick: function() { rightClickMenu.showContextMenu(); }
              // ,cellContextClick: "log.d('hello')"
	      ,viewStateChanged: function() {
                  // log.d('vsw');
	          // treeStateChanged('treeStateChanged');
                  var leaf = viewTree.getSelectedRecord();
                  if (leaf && !leaf.isFolder)
                      openLeaf(viewTree.getSelectedRecord());
	      }
	      ,cellChanged: function() {
                  // log.d('cell');
	          treeStateChanged('cellChanged');
	      }
	      ,onFolderDrop: function() {
	          treeStateChanged('onFolderDrop');
	      }
	      // ,openLeaf: openLeaf
	      // ,autoFetchData:true //no datasource, so not needed
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
          for (var p in a) {
              var same = true;
              if (typeof a[p] === 'object') same = isEqual(a[p], b[p]);
              else {
                  if (!a[p] && !b[p]) same = true;
                  else same = (a[p] === b[p]);   
              }
              
              if (!same){
                  // log.d(p);
                  // log.d(a, b);
                  return false;  
              } 
          }
          return true;   
      }
      
      window.onbeforeunload= 
	  function() { 
              // pp('current state', table.getState());
              // pp('original state', leafShowing.viewState);
              // pp(isEqual(table.getState(), leafShowing.viewState));                   
              if (isEqual(views[leafShowing.view].getState(), leafShowing.viewState)) {
                  // if (isEqual(table.getState(), leafShowing.viewState)) {
                  if (!modified) return null;
                  return null;
                  // else return 'Leaving will discard changes made to the organising tree.'+
                  //     '\\n Select "Stay on this page" and then click the icon next to '+
                  //     'the login name to save the changes.';
              }
              leafShowing.viewState = views[leafShowing.view].getState();
              setModified(true);
              // saveTreeToDb();
              // return 'Leaving will discard changes made to a view.\n\nSelect "Stay on '+
              //     'this page" and then click the icon next to the login name to ' +
              //     'save the changes.';
              return null;
	      // return 'Leaving will discard changes made to a
	      // view.\nStay to save the changes.';
          };
      
      //-----------------------@API-----------------------
      //sets the show function so that viewTree has a means to show/hide 
      //components
      viewTree.setShow = function(f) { show = f; };
      //to set viewTree to a new state
      viewTree.notify = notify;
      viewTree.ls = function() {
          log.d(leafShowing);
      };
      //exposes the loginButton, not really part of this component.
      viewTree.loginButton = loginButton;
      return viewTree;
  }});


// function inf() {
//     var temp = module.viewTree.getData().root.children;
//     log.d(temp[0].name, temp[0].viewState.grid);
//     log.d(temp[1].name, temp[1].viewState.grid);
// }
