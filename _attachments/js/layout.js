define
({inject: ['viewTree', 'table', 'roster'],
  factory: function(viewTree, table, roster) 
  {
    //***********************init*******************8
    //have to call this otherwise dynamic form won't save
    isc.Offline.goOnline();
    Date.setInputFormat('YMD');

    //**********Left hand side************************ 
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

    //left hand side layout 
    
    var leftSideLayout = isc.SectionStack.
      create({ 
	       // ID:"leftSideLayout",
	       visibilityMode:"multiple",
	       animateSections:true,
	       showResizeBar:true,
	       visibilityMode:'multiple',
	       width:200,
	       sections:[
		 {showHeader:false, items:[viewTree]},
		 {title:"Admin", hidden: true, expanded:false, items:[adminTree]},
		 {title:"Help", expanded:false,  items:[helpCanvas]}
	       ]
	     });

    //*********************right hand side*************************
    //TABLE
    // //right hand side layout
    var rightSideLayout = isc.SectionStack.
      create({ 
	       // ID:'rightSideLayout',
	       visibilityMode:"multiple",
	       animateSections:true
	       // sections:view.datatable
	       ,sections:[
		 {name:'table', showHeader:false, hidden: true, title:'Data', items:[table.table]}
		 // ,{name: 'calendar', title:"Calendar", expanded:true, hidden: false,items:[shiftCalendar]}
		 ,{name: 'tableEditor', title:"Edit", expanded:true,  hidden: true, items:[table.editor]}
	       ]
	     });
    //need to do this, the sectionstack seems to show the first section regardless of its hidden prop.
    rightSideLayout.hideSection('table');
    
    // console.log(rightSideLayout);
    function show(cmp) {
      rightSideLayout.showSection(cmp);
    }
    
    function hide(cmp) {
      rightSideLayout.hideSection(cmp);
    }
    roster.show = show;
    roster.hide = hide;
    // rightSideLayout.hideSection('tableEditor');
    // rightSideLayout.hideSection('calendar');


    //**************************main layout************************
    
    var mainLayout = isc.HLayout.
      create({ //ID: 'mainLayout',
		 width: "100%",
	       height: "100%",
	       members: [
		 leftSideLayout,
		 rightSideLayout
	       ]
	     });
    
    return {
      draw : function() { mainLayout.draw(); },
      show:show,
      hide:hide,
      getLeftSideWidth: function() {
	return leftSideLayout.getWidth();
      }, 
      setLeftSideWidth: function(w) {
	return leftSideLayout.setWidth(w);
      }
    };
    //------------      
  }});
