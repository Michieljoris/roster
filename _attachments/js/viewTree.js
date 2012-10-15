define
({inject: ['roster', 'table'],
  factory: function(roster, table) {
    
    function getJSON() {
      var tree = viewTree.getData().getAllNodes();
      return isc.JSON.encode(
	{ 
	  width: viewTree.getWidth(),
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
	  });
    }
    
    var saveOnChange = false;
    function setSaveOnChange(bool) {
      saveOnChange = bool;
      // switch (method) {
      // 	case 'auto' : saveOnUnload();  break;
      // 	case 'onchange' : autoSave = false; break;
      // 	default: console.log('ERROR: setSaveMethod was called with an invalid parameter');
      // }
    }
    
    //if called it sets up saving at intervals and when navigating away
    //not working because the callback from pouch comes to late, 
    //everything is wiped already I think
    // function saveOnUnload() {
    //   window.setInterval(save, 300000);
    //   window.onbeforeunload= save;
    // }
    
    //this function gets called everytime a change in the viewtree occurs
    function saveViewTreeState() {
      if (saveOnChange) save();
    }
    
    function save() {
      roster.user.viewTreeState = getJSON();
      roster.db.put(roster.user, function(err, response) {
		      if (err) {
			console.log('Could not save changed state of the view tree.' 
				    + err.error + ' ' + err.reason);}
		      else {
			// alert('saved');
			roster.user._rev = response.rev;
		      }
		    })
      // return 'are you sure?';
    }
    
    function setState(viewTreeState) {
      var viewTreeState = isc.JSON.decode(viewTreeState);
      if (viewTreeState) {
	clearTree();
	mytree.linkNodes(viewTreeState.state);
	viewTree.setSelectedPaths(viewTreeState.selectedPaths);
	var selRecord = viewTree.getSelectedRecord();
	viewTree.setWidth(viewTreeState.width);
	// if (!selRecord.isFolder)
	//   viewTree.openLeaf(selRecord);
      }
    }
    
    function clearTree (){
      mytree.removeList(mytree.getChildren(mytree.getRoot()));
    }


    function newView(view) {
      var selRecord = viewTree.getSelectedRecord();
      if (!selRecord)  selRecord = '/';
      else {
	viewTree.selectRecord(selRecord, false);
	selRecord = selRecord['_parent_' + mytree.ID];
      }
      var newRecord = mytree.add({id:isc.timeStamp(),isFolder:false, 
				  name:'New ' + view, view: view},selRecord)
      viewTree.selectRecord(newRecord);
      viewTree.openFolder(selRecord);
      saveViewTreeState();
      viewTree.openLeaf(newRecord);
    };
    
    function newFolder() {
      var selRecord = viewTree.getSelectedRecord();
      if (!selRecord)  selRecord = '/';
      else {
	viewTree.selectRecord(selRecord, false);
	selRecord = selRecord['_parent_' + mytree.ID];
      }
	var newRecord = mytree.add({id:isc.timeStamp(),isFolder:true, 
				    name:'New folder'},selRecord || '/')
      viewTree.selectRecord(newRecord);
      viewTree.openFolder(selRecord);
      saveViewTreeState();
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
	saveViewTreeState();
      }
    }

    var newViews = [
      {title:"Table", 
       click: function() { newView(this.title); } 
       ,icon: isc.Page.getSkinDir() +"images/actions/add.png"
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


    var newViewMenu = isc.Menu.create(
      {
	// ID:"newViewMenu",
	width:150
	,data: newViews
      });


    var loginButton = isc.ToolStripButton.create(
      {
	// ID: "loginButton",    
	// icon: "other/printer.png",  
	// action:function() {
	  
	//   isc.showLoginDialog(function(a,cb) {console.log(a); cb(true);}, {dismissable:true});
	// },
	// title: "Logout"
	
      });


      var rightClickMenu = isc.Menu.create(
	{// ID:"rightClickMenu",
	  width:150
	  ,data:newViews.concat(
	    [
	      {isSeparator:true}
	      ,{title:"Copy"
		,icon: isc.Page.getSkinDir() +"images/RichTextEditor/copy.png"
		,click: function() { copy(); } 
	       } 
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
		,click: function() { save(); }
	       }
	    ])
	});

    var gridEditControls = isc.ToolStrip.create(
      {
	// ID: "gridEditControls",
	// width: "100%", height:24, 
	members: [
        // isc.Label.create({
        //     padding:5,
        //     ID:"totalsLabel"
        // }),
	     loginButton
             // ,isc.LayoutSpacer. create({ width:"*" })
	  
             ,isc.ToolStripButton.create({
					   icon: "[SKIN]/actions/save.png",
					   prompt: "Save this view"
					   ,click: function() { save(); }
					 })
             ,isc.IconMenuButton.create({title:''
					,ID:'addButton'
					 ,iconClick: "this.showMenu()"
					 ,showMenuIcon:false
					 ,width :20
					   ,icon: "[SKIN]/actions/add.png", 
					   prompt: "Create a new view"
					   ,menu:newViewMenu
					 })
             ,isc.ToolStripButton.create({
					   icon: "[SKIN]/RichTextEditor/copy.png",
					   prompt: "Copy this view"
					   ,click: function() { copy(); }
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

      var mytree = isc.Tree.
	create({
		 // ID:'mytree',
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
	       ,data: mytree 
	       ,showHeader:false
	       ,modalEditing: true
	       ,selectOnEdit: false
	       ,escapeKeyEditAction: 'cancel'
	       ,editorExit: function() { this.canEdit = false;}
	       ,viewStateChanged: function() {
		 saveViewTreeState();
	       }
	       ,cellChanged: function() {
		 saveViewTreeState();
	       }
	       ,onFolderDrop: function() {
		 saveViewTreeState();
	       }
	       ,autoFetchData:true
	       ,gridComponents:[gridEditControls, "header", "body" ]
	       ,fields:[{
			  name:"name",
			  length:128,
			  type:"text"
			}
		       ]
	     });
    
    // viewTree.getJSON = getJSON;
    viewTree.setState = setState;
    viewTree.loginButton = loginButton;
    viewTree.setSaveOnChange = setSaveOnChange;
    return viewTree;
  }});
