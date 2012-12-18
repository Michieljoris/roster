/*global isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
({inject: [ 'viewTree', 'table', 'calendar'],
  factory: function(viewTree, table, calendar) 
  { "use strict";

    //**********@Left hand side************************ 
    //viewTree defined in viewtree.js
    //adminTree
    var adminTree = isc.TreeGrid.
    create({
	// ID: "adminTree",
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
    var helpCanvas = isc.HTMLPane.
    create({
	// ID:"helpCanvas",
	height:'25%',
	contentsURL:'helptext.html'
	,overflow:"auto",
	styleName:"defaultBorder",
	padding:10
    });

    
    var leftSideLayout = isc.SectionStack.
    create({ 
	    // ID:"leftSideLayout",
	visibilityMode:"multiple",
	animateSections:true,
	showResizeBar:true,
	width:0,
	sections:[
	    {showHeader:false, items:[viewTree]},
	    {title:"Admin", hidden: true, expanded:false, items:[adminTree]},
	    {title:"Help", expanded:false,  items:[helpCanvas]}
	]
    });

    //*********************@right hand side*************************
    //TABLE
    // //right hand side layout
    var rightSideLayout = isc.SectionStack.
    create({ 
	// ID:'rightSideLayout',
	visibilityMode:"multiple",
	animateSections:false
              
	,sections:[
	    {name: 'Table', showHeader:false, hidden: true, items:[table.grid]}
	    ,{name: 'Calendar', showHeader: false, hidden: true,items:[calendar]}
	]
    });
    //need to do this, the sectionstack seems to show
    //the first section regardless of its hidden prop.
    rightSideLayout.hideSection('Table');

    //**************************@main layout************************
    
    var mainLayout = isc.HLayout.
    create({ //ID: 'mainLayout',
	    width: "100%",
	height: "100%",
	members: [
	    leftSideLayout,
	    rightSideLayout
	    ]
	});
    
    //viewTree can get data from, and influence data of the layout it is 
    //a part of with the following functions:
    viewTree.getWidth = function() {
        return leftSideLayout.getWidth();
    }; 
    viewTree.setWidth = function(w) {
        return leftSideLayout.setWidth(w);
    };
    //with this viewTree can show/hide sections in this layout
    viewTree.setShow(function(cmp, bool) {
          
        // console.log('show')   ;
	if (bool) rightSideLayout.showSection(cmp);
	else rightSideLayout.hideSection(cmp);		       
    });
    
    function draw(newUser) {
        // viewTree.setInitialState(user.viewTreeState); 
        viewTree.notify(newUser.viewTreeState); 
        // viewTree.setModified(false);
        mainLayout.draw();
    }
    
    //-------------@API 
    return {
        draw : draw
    };
    
  }});
