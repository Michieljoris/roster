//have to call this otherwise dynamic form won't save
Offline.goOnline();
Date.setInputFormat('YMD');

isc.ListGrid.create(
    {   ID: "pouchList",
	width:'100%', height:224, alternateRecordStyles:true, 
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
	    console.log(record, "Recorod");
            // if (record == null) return itemDetailTabs.clearDetails();
	    editAllForm.editRecord(record);
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
    {   ID: "shiftCalender", 
	dataSource: pouchDS, 
	autoFetchData: true,
	descriptionField: 'notes'
	,nameField: 'person'
	// ,initialCriteria: { group:'shift'  }
	  // eventAdded: function(event) {
	//   console.log("Event added", event);
	// },
	// eventChanged: function(event) {
	//   console.log("Event changed", event);
	// }
	// ,eventClick: function(event, viewName) {
	//   console.log("Event click", event, viewName);
	//   event.group = 'shift';
	//   return true;
	// }
	,backgroundClick: function(startDate, endDate) {
	  console.log('New event',startDate, endDate);
	  
	  // isc.Dialog.create({
	  // 		      message : "Please choose whether to proceed",
	  // 		      icon:"[SKIN]ask.png",
	  // 		      buttons : [
	  // 			isc.Button.create({ title:"OK" }),
	  // 			isc.Button.create({ title:"Cancel" })
	  // 		      ],
	  // 		      buttonClick : function (button, index) {
	  // 			this.hide();
	  // 		      }
	  // 		    });
	  
	  shiftCalender.addEvent(startDate, endDate, '1', 'notes', { group: 'shift', ad: false});
	 return false;
	}
}); 
shiftCalender.setCriteria({group:'shift'});
// shiftCalender.fetchData({group:'shift'});

// isc.IButton.create({
//     top:250,
//     title:"Edit New",
//     click:"pouchList.startEditingNew()"
// });


isc.DynamicForm.create(
    {   ID:"editAllForm",
	dataSource:pouchDS,
	useAllDataSourceFields:true
	,titleOrientation: 'top'
	,fields:[
	    // {name:"_id"},
	    // {name:"_rev"},
	    // {name:"text"},
	    {name:"editnew", type:"button",
	     width:100, title:"Edit new", click:"pouchList.startEditingNew()"}
	    // {name:"savebtn", type:"button",
	    //  width:100, title:"Save Item", click:"editForm.saveData()"}
	    // ,{name:"updatebtn", type:"button",
	    //  width:100, title:"Update Item", click:"editForm.saveData()"}
	    // ,{name:"deletebtn", type:"button", 
	    //  width:100, title:"Delete Item", click:"pouchList.removeSelectedData();"}
	],
	width:650,
	numCols:4,
	// colWidths:[30,150,30,150],
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
	 pouchList, editAllForm
     ]});

// var extroster_url = 'http://localhost:8000/mysrc/javascript/rosterext/index.html';
// var extroster_url = 'http://localhost:8080/rosterext/';
// var extroster_url='file:///home/michieljoris/mysrc/javascript/rosterext/index.html';
var extroster_url='http://localhost:8000/_attachments/rosterext/index.html';
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
		   pane:shiftCalender 
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
