// tree.removeList, .linkNodes, getAllNodes
// viewTree.setData(tree)

function saveViewTree(user, tree) {
  
}




function extractBareTree(treegrid) {
  var tree = treegrid.getData().getAllNodes();
  return tree.map(function(n) {
		    return {
		      id: n.id,
		      parentId: n.parentId,
		      isFolder: n.isFolder,
		      name: n.name
		    };
});
}


var viewTreeActions = {
  newView: function(view) {
    var selRecord = viewTree.getSelectedRecord();
    switch (view) { 
    case 'table+editor': 
      rightSideLayout.showSection('tabset');
      
    case 'table': 
      rightSideLayout.showSection('table');
      setGridState({});
      break; 
      
    default: console.log(view + ' not yet implemented'); 
    } 
    if (!selRecord)  selRecord = '/';
    else {
     if (!selRecord.isFolder) selRecord = selRecord._parent_mytree;
    }
    mytree.add({id:isc.timeStamp(),isFolder:false, name:'New ' + view},selRecord);
    viewTree.openFolder(selRecord);
  },
  newFolder: function() {
    var selRecord = viewTree.getSelectedRecord();
    if (!selRecord)  selRecord = '/';
    else {
     if (!selRecord.isFolder) selRecord = selRecord._parent_mytree;
    }
    mytree.add({id:isc.timeStamp(),isFolder:true, name:'New folder'},selRecord || '/');
    viewTree.openFolder(selRecord);
  },
  rename: function() {
    var record = viewTree.getSelectedRecord();
    if (record == null) return;
    viewTree.startEditing(viewTree.data.indexOf(record));
  },
  remove: function() {
    viewTree.removeSelectedData();
  }
};

var newViews = [
  {title:"Table", //, submenu: chooseTableMenu
   click:'viewTreeActions.newView("table")'
  },
  {title:"Table with editor", //, submenu: chooseTableMenu
   click:'viewTreeActions.newView("table+editor")'
  },
  {title:"B/W Calendar"},
  {title:"Color Calendar"},
  {title:"Roster"},
  {title:"Timesheet"
  }];


isc.Menu.create({
		  ID:"newViewMenu",
		  width:150
		  ,data: newViews
		});


isc.ToolStripButton.create({
			     ID: "loginButton",    
			     // icon: "other/printer.png",  
			     title: "Logout"
			     
			   });


isc.Menu.create({
		  ID:"rightClickMenu",
		  width:150
		  ,data:newViews.concat([
					   {title:"New folder"
					    ,icon: Page.getSkinDir() +"images/FileBrowser/createNewFolder.png"
					    ,click: 'viewTreeActions.newFolder()'
					   }, 
					   {isSeparator:true},
					   {title:"Rename"
					    ,icon: Page.getSkinDir() +"images/actions/edit.png"
					    ,click: 'viewTreeActions.rename()'
					   },
					   {title:"Remove"
					    ,icon: Page.getSkinDir() +"images/actions/remove.png"
					    ,click: 'viewTreeActions.remove()'
					   }
					 ])
		});

isc.ToolStrip.
  create({
	   ID: "gridEditControls",
	   // width: "100%", height:24, 
	   members: [
        // isc.Label.create({
        //     padding:5,
        //     ID:"totalsLabel"
        // }),
	     loginButton
             ,isc.LayoutSpacer. create({ width:"*" })
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
					   icon: "[SKIN]/FileBrowser/createNewFolder.png", 
					   prompt: "Create a new folder"
					   ,click: 'viewTreeActions.newFolder()'
					 })
             ,isc.ToolStripButton.create({
					   icon: "[SKIN]/actions/edit.png",
					   prompt: "Rename selected item",
					   click: 'viewTreeActions.rename'
					 })
             ,isc.ToolStripButton.create({
					   icon: "[SKIN]/actions/remove.png", 
					   prompt: "Remove selected item",
					   click: 'viewTreeActions.remove()'
					 })
    ]
});


isc.Tree.
  create({
	   ID:'treetest',
	   modelType: "parent",
	   nameProperty: "id",
	   idField: "id",
	   parentIdField: "parentId"
});

// viewTree.removeSelectedRecord
// drag and rearrange, rename by double clicking
// mytree.add(node, parent)
// viewTree.setData and getData , then use indexNodes to extraxt data for
// saving and loading, after setData call viewTree.redraw 
// Make a tree from data loaded from the database
// mytree.add({EmployeeId:'306',isFolder:true, Name:'xfolderd'},a);
isc.Tree.
  create({
	   ID:'mytree',
	   modelType: "parent",
	   nameProperty: "id",
	   idField: "id",
	   parentIdField: "parentId"
	   // dataChanged:function() {
	   //   console.log('data changed in the tree');
	   // },
	   // dataChanged : function () {
	   //     this.Super("dataChanged", arguments);
	   //     var totalRows = this.data.getLength();
	   //     if (totalRows > 0 && this.data.lengthIsKnown()) {
	   //         totalsLabel.setContents(totalRows + " Records");
	   //     } else {
	   //         totalsLabel.setContents("&nbsp;");
	   //     }
	   // },
	   
	   // data: [
	   //   {id:"4", parentId:"1", name:"Charles Madigen"},
	   //   {id:"188", parentId:"5", name:"Rogine Leger"},
	   //   {id:"189", parentId:"4", name:"Gene Porter"},
	   //   {id:"265", parentId:"189", name:"Olivier Doucet"},
	   //   {id:"264", parentId:"189", name:"Cheryl Pearson"}
	   // ]
	 });

isc.TreeGrid.
  create({
	   ID: "viewTree"
	   ,contextMenu:rightClickMenu
	   ,canDragRecordsOut:true,
	   canAcceptDroppedRecords:true,
	   canEdit: true
	   // ,useAllDataSourceFields:true,
	   ,canReorderRecords: true,
	   canAcceptDroppedRecords: true
	   ,data: mytree 
	   ,showHeader:false
	   // dataSource:'pouchDS',
	   ,autoFetchData:true
	   ,gridComponents:[gridEditControls, "header", "body" ]
	   // ,fetchData:function() {
	   // 	console.log('fetchdata changed in the treegrid');
	   // }
	   
    	   // ,nodeClick: function() {
    	   //   console.log("Hello from nodeClick");

    	   // },
    	   // nodeContextClick: function() {
    	   //   console.log("Hello from nodeContextclick");
    	   // },
	   
    	   // leafClick: function() {
    	   //   console.log("Hello from leafclick");
	     
    	   // },
    	   // leafContextClick: function() {
    	   //   console.log("Hello from leafContextclick");
    	   // }
	   ,fields:[{
		      // title:"name",
		      name:"name",
		      length:128,
		      type:"text"
		    }
		    ,{
		      // title:"group",
		      
// shift, location, people, role, calendar, timesheet, roster,
// specialized rosterviews, admin
		      name:"group",
		      length:128,
		      detail: true,
		      type:"text"
		    }
		    // ,{
		    //   title:"Employee ID",
		    //   primaryKey:true,
		    //   name:"id",
		    //   type:"integer",
		    //   required:true
		    // },
		    // {
		    //   // title:"Manager",
		    //   // detail:false,
		    //   rootValue:"1",
		    //   name:"parentId",
		    //   type:"integer",
		    //   required:true,
		    //   foreignKey:"pouchDS.id"
		    // }
]

	   // customize appearance
	   // width: 500,
	   // height: 400,
	   // nodeIcon:"icons/16/person.png",
	   // folderIcon:"icons/16/person.png",
	   // showOpenIcons:false,
	   // showDropIcons:false,
	   // closedIconSuffix:""
	 });