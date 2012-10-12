//***********************init*******************8
//have to call this otherwise dynamic form won't save
Offline.goOnline();
Date.setInputFormat('YMD');


//**********Left hand side************************ 
//viewTree defined in viewtree.js
//adminTree
isc.TreeGrid.
  create({
	   ID: "adminTree",
	   showHeader:false,
    	   nodeClick: function() {
    	     console.log("Hello from nodeClick");
	     
    	   },
    	   nodeContextClick: function() {
    	     console.log("Hello from nodeContextclick");
    	   },
	   
    	   leafClick: function() {
    	     console.log("Hello from leafclick");
	     
    	   },
    	   leafContextClick: function() {
    	     console.log("Hello from leafContextclick");
    	   },
	   data: isc.Tree.
	     create({
		      modelType: "parent",
		      nameProperty: "title",
		      idField: "id",
		      parentIdField: "parent",
		      data: [
			// shifts, locations, people, roles, calendars, timesheets, rosters,
			// specialized rosterviews, admin
			{ id:'Printing'}
			,{ id:'Rosters', parent:'Printing'}
			,{ id:'Settings'}
			,{ id:'Roles'}
			,{ id:'AllRoles', parent:'Roles', title: 'All'}
			
		      ]
		    })
	 });

//help section
isc.HTMLPane.
  create({
	   ID:"helpCanvas",
	   height:'25%',
	   contentsURL:'helptext.html'
	   ,overflow:"auto",
	   styleName:"defaultBorder",
	   padding:10
	 });

//left hand side layout 
isc.SectionStack.
  create({ ID:"leftSideLayout",
	   visibilityMode:"multiple",
	   animateSections:true,
	   showResizeBar:true,
	   visibilityMode:'multiple',
	   width:200,
	   sections:[
	     {showHeader:false, items:[viewTree]},
	     {title:"Admin", expanded:false, autoShow:true, items:[adminTree]},
	     {title:"Help", expanded:false,  items:[helpCanvas]}
	   ]
	 });

//*********************right hand side*************************
//TABLE

// isc.VLayout.create({
// 		      ID:'rightSideLayout', 
// 		      members: [
// 			dataTable,ds3
// 		      ]
// 		    });

// var view = {
// 	   datatable:[
// 	     {showHeader:false, title:'Data', autoShow:true, items:[dataTable]},
// 	     {title:"Edit", expanded:true, autoShow:true, items:[tabSet]}
// 	   ]
// };

// //right hand side layout
isc.SectionStack.
  create({ ID:"rightSideLayout",
	   visibilityMode:"multiple",
	   animateSections:true
	   // sections:view.datatable
	   ,sections:[
	     {name:'datatable', showHeader:false, title:'Data', autoShow:true, items:[dataTable]}
	     ,{name: 'calendar', title:"Calendar", expanded:true, autoShow:true, hidden: false,items:[shiftCalendar]}
	     ,{name: 'tabset', title:"Edit", expanded:true, autoShow:true, items:[tabSet]}
	   ]
	 });
rightSideLayout.hideSection('datatable');
rightSideLayout.hideSection('tabset');
rightSideLayout.hideSection('calendar');



//**************************main layout************************
isc.HLayout.
  create({ ID: 'mainLayout' 
	   ,width: "100%",
	   height: "100%",
	   members: [
	     leftSideLayout,
	     rightSideLayout
	   ]
	 });

isc.Page.setEvent("load", "mainLayout.redraw()");
