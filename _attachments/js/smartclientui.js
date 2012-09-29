isc.ListGrid.create(
    {   ID: "pouchList",
	width:500, height:224, alternateRecordStyles:true, 
	position:"relative",
	dataSource: pouchDS,
	autoFetchData: true,
	useAllDataSourceFields:true,
	recordClick:"this.updateDetails()",
	canEdit:true,
	modalEditing:true,
	cellChanged:"this.updateDetails()",
	alternateRecordStyles:true,
	canDragRecordsOut:true,
	hoverWidth:200,
	hoverHeight:20,
	selectionType:"single",
	cellContextClick:"return itemListMenu.showContextMenu()",
	// Function to update details based on selection
	updateDetails : function () {
            var record = this.getSelectedRecord();
	    // console.log(record, "Recorod");
            // if (record == null) return itemDetailTabs.clearDetails();
	    editForm.editRecord(record);
	    // console.log(record);
            // if (itemDetailTabs.getSelectedTabNumber() == 0) {
	    // 	// View tab: show selected record
	    // 	itemViewer.setData(record);
            // } else {
	    // 	// Edit tab: edit selected record
	    // 	itemDetailTabs.updateTab("editTab", editForm);
	    // 	editForm.editRecord(record);
            // }
	   // return 0;
	}
    });

isc.Calendar.create(
    {   ID: "eventcalendar", 
	datasource: eventDS, 
	autofetchdata: true
    }) ;

isc.DynamicForm.create(
    {   ID:"editForm",
	dataSource:pouchDS,
	useAllDataSourceFields:true,
	fields:[
	    {name:"id"},
	    {name:"text"},
	    {name:"savebtn", editorType:"button",
	     width:100, title:"Save Item", click:"editForm.saveData()"}
	    ,{name:"updatebtn", editorType:"button",
	     width:100, title:"Update Item", click:"editForm.saveData()"}
	    ,{name:"deletebtn", editorType:"button", 
	     width:100, title:"Delete Item", click:"pouchList.removeSelectedData();"}
	],
	width:650,
	// numCols:4,
	// colWidths:[100,200,100,200],
	margin:25,
	cellPadding:5,
	autoFocus:false
    });

isc.Menu.create(
    {
	ID:"itemListMenu",
	cellHeight:22,
	data:[
	    {title:"Add New Item",
	     icon:"demoApp/icon_add.png",
	     click:function () {
		 pouchList.selection.deselectAll();
		 pouchList.updateDetails();
	     }
	    },
	    {isSeparator:true},
	    {title:"Show Details",
	     icon:"demoApp/icon_view.png",
	     click:" pouchList.updateDetails()"},
	    {title:"Edit Item",
	     icon:"demoApp/icon_edit.png",
	     click:"pouchList.updateDetails()"},
	    {title:"Delete Item",
	     icon:"demoApp/icon_delete.png",
	     click:"pouchList.removeSelectedData()" 
	    }	     
	]
    });


isc.VLayout.create(
    {ID: "pouchpane", width:"100%", height:"100%", members:[
	 pouchList, editForm
     ]});

// var extroster_url = 'http://localhost:8000/mysrc/javascript/rosterext/index.html';
// var extroster_url = 'http://localhost:8080/rosterext/';
// var extroster_url='file:///home/michieljoris/mysrc/javascript/rosterext/index.html';
var extroster_url='http://localhost:8000/mysrc/javascript/roster/_attachments/rosterext/index.html';
isc.VLayout.create(
    {ID: "extcalendar", width:"100%", height:"100%", members:[
	 isc.HTMLPane.create({
				 showEdges:false,
				 contentsURL:extroster_url,
				 contentsType:"page"
			     })

     ]});


isc.TabSet.create({
	ID: "tabSet",
	    width: 400,
	    height: 200,
	// tabBarPosition: "top",
	width: "100%",
	height: "100%",
	selectedTab: 0,
	tabs: [{
		   title: "Pouchdb grid",
		   pane:pouchpane
	       },
	       {
		   title: "SmartClient Calendar",
		   pane:eventcalendar 
	       }
	       ,{ title: "Extjs Calendar",
		  pane: extcalendar 
		}]
    });
// // function init() {
// //   //   Pouch('idb://todos', function(err, db) {
// //   // 	      console.log(err);
// //   // });

// // }

// // window.addEventListener("DOMContentLoaded", init, false);
