/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

//This module lays out the app into two main sections, left and
//right. The left side contains the tree of views to be shown in the
//right hand side, and a collapsable help section.

define
({inject: [ 'viewTree', 'viewLoader'],
  factory: function(viewTree, views) 
  { "use strict";
    var log = logger('layout');
    log.d('Evaluating layout.js..');

    //#Left hand side of the layout
    
    //Help section
    var helpCanvas = isc.HTMLPane.
    create({
	height:'25%',
	contentsURL:'helptext.html'
	,overflow:"auto",
	styleName:"defaultBorder",
	padding:10
    });

    //A section stack with the viewTree and help section
    var leftSideLayout = isc.SectionStack.create({ 
	visibilityMode:"multiple",
	animateSections:true,
	showResizeBar:true,
	width:200,
	sections:[
	    {showHeader:false, items:[viewTree]},
	    {title:"Help", expanded:false,  items:[helpCanvas]}
	]
    });
    
    
    //##Right hand side of the layout
    
    //A section for every view. These views are NOT lazily created,
    //just hidden and shown when selected.
    var sections = (function() {
        var result = [];
        views.forEach(function(v) {
            result.push({
                name: v.getType(),
                showHeader: false,
                hidden: true,
                items: [v.getCmp()]
            });
        });
        return result;
    })();

    var rightSideLayout = isc.SectionStack.create({ 
	visibilityMode:"multiple",
	animateSections:false
	,sections: sections
    });
    
    //Need to do this, the sectionstack seems to show
    //the first section regardless of its hidden prop.
    rightSideLayout.hideSection(sections[0].name);

   //##The main layout 
    var mainLayout = isc.HLayout.create({ 
	width: "100%",
	height: "100%",
	members: [
	    leftSideLayout,
	    rightSideLayout
	]
    });
    
    //viewTree can get data from, and influence data of the layout it is 
    //a part of with the following functions:
    //###getWidth
    viewTree.getWidth = function() {
        return leftSideLayout.getWidth();
    }; 
    //###setWidth
    viewTree.setWidth = function(w) {
        return leftSideLayout.setWidth(w);
    };
    
    //###setShow
    //With this viewTree can show/hide sections in this layout
    viewTree.setShow(function(cmp, bool) {
	if (bool) rightSideLayout.showSection(cmp);
	else rightSideLayout.hideSection(cmp);		       
    });
    
    //##draw

    //The one exported function. It takes a JSON string
    //containing the state of the ui to be drawn.
    function draw(uiState) {
        viewTree.notify(uiState); 
        viewTree.setLoginName(user.login);
        mainLayout.draw();
    }
    
    
    
    //##API 
    return {
        draw : draw
    };
    
  }});
