/*global Cookie:false VOW:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:200 devel:true*/

define
({inject: ['View', 'loaders/view', 'loaders/backend', 'user'],
  factory: function(View, views, backend, user) {
      "use strict";
      var log = logger('viewTree');
      var newViewMenu = [];
      views = (function() {
          var result = {};
          views.forEach(function(v) {
              v.setObserver(function() { setViewModified(true); });
              var type = v.getType();
              if (type !== 'Empty') {
                  newViewMenu.push({
                      name: type,
                      click: function() { newView(type); } 
                      ,icon: v.getIcon()
                  });
              }
              result[type] = v;
          });
          return result;
      })();
      
      var show, //To be set by layout so we can show/hide views in the layout
          treeModified, //Whether the ui has changed
          viewModified,
          viewInstanceShowing;
      
      //--------------------HANDLING STATE OF THE VIEWTREE-------------------------- 
      function notify() {
          log.d('viewTree got notified of a change of user!');
          // var viewTreeState = isc.JSON.decode(newState);
          var viewTreeState = user.getLook();
          loginButton.setTitle(user.get()._id);
          if (viewTreeState) {
              //width of side bar
              viewTree.setWidth(viewTreeState.width);
	      //clear the tree
	      tree.removeList(tree.getChildren(tree.getRoot()));
              //set the tree to the saved state
	      tree.linkNodes(viewTreeState.state);
              // log.d('path:::::',viewTreeState.pathOfLeafShowing);
	      viewTree.setSelectedPaths(viewTreeState.pathOfLeafShowing);
	      var selRecord = viewTree.getSelectedRecord();
	      if (selRecord && !selRecord.isFolder) { 
	          open(selRecord);
	      }
              //not much use because there will be state change
              //callbacks from smartclient to come after this
	      setTreeModified(false);
              //so set a interval time to see if the state is really
              //different from the stored state and if so setModified to true
              window.setTimeout(checkState, 2000);
              // window.setImmediate(checkState);
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
	  // var selRecord = viewTree.getSelectedRecord();
          // if (selRecord && !selRecord.isFolder) { 
	  //     open(selRecord);
	  // }
          log.d("Checking state");
          // setModified(!isEqual(table.getState(), leafShowing.viewState));
          // setModified(!isEqual(views[viewShowing.type].getState(),viewShowing.viewState));
      }
      
      //reads state of tree
      function getTreeState() {
          var tree = viewTree.getData().getAllNodes();
          //isc.JSON.encode(
          return { width: viewTree.getWidth(),
                   time: isc.timeStamp(),
                   pathOfLeafShowing: viewInstanceShowing ? viewInstanceShowing.path : null,
                   // selectedPaths: pathShowing, //viewTree.getSelectedPaths(),
                   //only store data needed to rebuild the tree 
                   state: tree.map(function(n) {
                       return {
	                   type: n.type,
	                   id: n.id,
	                   parentId: n.parentId,
	                   isFolder: n.isFolder,
	                   name: n.name,
	                   isOpen: n.isOpen,	
	                   state: n.state,
                           icon: n.icon
                       };
		   })
                 };
      }
      
      //Whenver the state of the navigation tree changes this gets called
      function setTreeModified(bool) {
          // log.d('modified =' + bool);
          treeModified = bool;
          if (bool) saveButton.show(true);
          else {saveButton.hide(true);}                
      }
      
      //Gets called by currently showing views when their state changes
      function setViewModified(bool) {
          // log.d('modified =' + bool);
          viewModified = bool;
          if (bool) saveButton.show(true);
          else {saveButton.hide(true);}                
      }
      
      //Gets called by currently showing views when their state changes
      //It is set to the observer of any view implemented
      // function viewStateChanged(origin) {
      //     log.d('Changed: ' + origin);
      //     setModified(true);
      // }
      
      //this function gets called everytime a change in the viewtree occurs
      function treeStateChanged(origin) {
          log.d('******************tree changed: ' +  origin);
          setTreeModified(true);
          // if (saveOnChange) saveTreeToDb();
      }
      
      function open(viewInstance) {
          //If we have disabled the view don't open it!!
          if (!views[viewInstance.type]) return;
          
          log.d('**************************---------------open view');
          //opening same view with same data, do nothing
          if (viewInstanceShowing && viewInstance === viewInstanceShowing) {
              log.d('Opening same view..');
              return;         
          }
          
          //save any changes that might have occured in the view
          if (viewInstanceShowing) {
              views[viewInstanceShowing.type].sync(); 
              log.d('Saved changes to the state of the view',
                    viewInstanceShowing.name, viewInstanceShowing.state);
	      if (viewInstanceShowing.type !== viewInstance.type) {
	          show(viewInstanceShowing.type, false);
	      }
          }
          // } 
          //give the component that's about to be shown the specific
          //data of this instance of the view
          views[viewInstance.type].set(viewInstance.state);
          //show the view, redundant, harmless call if it's the same
          //type of view
          show(viewInstance.type, true);   
          //set a pointer to the view instance that's now showing
          viewInstanceShowing = viewInstance;
          viewInstanceShowing.path = viewTree.getSelectedPaths();
          //we're changing views, so set modified flag
          setTreeModified(true);
          
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
          if (viewInstanceShowing) views[viewInstanceShowing.type].sync();
          // debugger;
          // user.setLook(isc.JSON.encode(getTreeState())); 
          user.setLook(getTreeState()); 
          // globals.user.viewTreeState = isc.JSON.encode(getTreeState());
          
          user.saveSettings().when(
              function() {
                  log.d('Saved UI successfully');
              },
              function(err) {
                  var msg = 'Error: Could not save the UI state of the app!!';
                  log.d(msg + err);
                  isc.warn(msg + err);
                  alert(msg + err);
              }
              
          );
          // globals.db.put(globals.user, function(err, response) {
          //     if (err) {
	  //         log.d('ERRROR: Could not save changed state of the view tree.' +
          //               err.error + ' ' + err.reason);
          //         isc.warn('ERROR: Could not save the state of the ui..');
          //     }
          //     else {
	  //         globals.user._rev = response.rev;
          //         log.d('save',globals.user.viewTreeState);
          //     }
              setTreeModified(false);
              setViewModified(false);
              // window.onbeforeunload = function() { };
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
      
      function newView(type) {
          log.d('newView',type);
          var selRecord = viewTree.getSelectedRecord();
          // var state = selRecord.viewState;
          var parent; 
          if (!selRecord)  parent = '/';
          else {
              viewTree.selectRecord(selRecord, false);
              parent = selRecord['_parent_' + tree.ID];
              
          }
          var newName = getUniqueName(type, parent);
          //make sure the state of the view is synced with data structures.
          views[type].sync();
          var viewInstance = tree.add({
              id:isc.timeStamp(),isFolder:false, 
              // name:newName, type: type , icon: 'timesheet.png' //''icon: views[type].getIcon()
              name:newName, type: type , icon: views[type].getIcon()
              ,state: views[type].create()
          }, parent);
          
          viewTree.selectRecord(viewInstance);
          //open the parent folder, otherwise we can't see the the new record/view
          viewTree.openFolder(parent);
          viewTree.openLeaf(viewInstance);
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
      
      // var databaseButton = isc.ToolStripButton.create(
      //     {   align:'left' 
      //         ,icon: "database.png"
      //         ,action: function() {
      //             backend.pick(function(aBackend, name, url){
      //                 VOW.every([
      //                     Cookie.set('backendName', name, Date.today().addYears(10))
      //                     ,Cookie.set('backendUrl', url, Date.today().addYears(10))]
      //                          ).when(
      //                              function() { log.d('Saved backend cookie.');
      //                                           location.reload();
      //                                         }
      //                              ,function() {
      //                                  log.e('Unable to set the backend or url cookie!!'); }
      //                          );
      //             }, 'cancellable');
      //         }
      //     }); 
      
      var loginButton = isc.ToolStripButton.create(
          {   align:'left' 
	      ,action: user.change 
          }); 
      
      var saveButton = isc.ToolStripButton.create({
	  icon: "saveui.png",
	  prompt: "Save this view"
	  ,click: function() { saveTreeToDb(); }
      });

      var toolStrip = isc.ToolStrip.create(
          {members: [
              // databaseButton,
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
      
      // window.test = function() {
      //     tree.root.children.forEach(function(c, i) {
      //         console.log(i, c.state);
      //     });
      //     return 'end';
      // };
      
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
              ,nodeContextClick: function() { rightClickMenu.showContextMenu(); }
              // ,cellContextClick: "log.d('hello')"
	      ,viewStateChanged: function() {
                  // log.d('vsw');
	          // treeStateChanged('treeStateChanged');
                  var leaf = viewTree.getSelectedRecord();
                  if (leaf && !leaf.isFolder)
                      open(viewTree.getSelectedRecord());
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
      
      // function isEqual(a,b) {
      //     if (!a && !b) return true;
      //     if (!a || !b) return false;
      //     for (var p in a) {
      //         // var same = true;
      //         if (typeof a[p] === 'object') return isEqual(a[p], b[p]);
      //         else {
      //             if (!a[p] && !b[p]) return true;
      //             else return (a[p] === b[p]);   
      //         }
              
      //         // if (!same){
      //         //     // log.d(p);
      //         //     // log.d(a, b);
      //         //     return false;  
      //         // } 
      //     }
      //     return true;   
      // }
      
      window.onbeforeunload= 
	  function() { 
              if (viewInstanceShowing) views[viewInstanceShowing.type].sync();
              // if (!modified) return null;
              // else return 'Leaving will discard changes made to the organising tree.'+
              //     '\\n Select "Stay on this page" and then click the icon next to '+
              //         'the login name to save the changes.';
              
              // return 'Leaving will discard changes made to a view.\n\nSelect "Stay on '+
              //     'this page" and then click the icon next to the login name to ' +
              //     'save the changes.';
              return null;
          };
      
      //-----------------------@API-----------------------
      //sets the show function so that viewTree has a means to show/hide 
      //components
      viewTree.setShow = function(f) { show = f; };
      //to set viewTree to a new state
      viewTree.notify = notify;
      viewTree.ls = function() {
          log.d(viewInstanceShowing);
      };
      
      user.addObserver(viewTree);
      viewTree.newView = newView;
      
      return viewTree;
  }});


// function inf() {
//     var temp = module.viewTree.getData().root.children;
//     log.d(temp[0].name, temp[0].viewState.grid);
//     log.d(temp[1].name, temp[1].viewState.grid);
// }
