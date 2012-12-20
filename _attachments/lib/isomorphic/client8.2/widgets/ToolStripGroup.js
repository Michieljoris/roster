/*
 * Isomorphic SmartClient
 * Version v8.2p_2012-09-05 (2012-09-05)
 * Copyright(c) 1998 and beyond Isomorphic Software, Inc. All rights reserved.
 * "SmartClient" is a trademark of Isomorphic Software, Inc.
 *
 * licensing@smartclient.com
 *
 * http://smartclient.com/license
 */

 




//>	@class	ToolStripGroup
// 
// A widget that groups other controls for use in +link{class:ToolStrip, tool-strips}.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("ToolStripGroup", "VLayout").addProperties({

    //> @attr toolStripGroup.styleName (CSSClassName : "toolStripGroup" : IRW)
    // CSS class applied to this ToolStripGroup.
    // @visibility external
    //<
    styleName: "toolStripGroup",

    layoutMargin: 2,
    membersMargin: 1,
    
    layoutAlign: "top",
    
    autoDraw: false,
    
    height: 1,
    width: 1,
    overflow: "visible",

    //> @attr toolStripGroup.controls (Array of Widget : null : IRW)
    // The array of controls to show in this group.
    // @visibility external
    //<

    //> @attr toolStripGroup.label (AutoChild : null : IR)
    // Label autoChild that presents the title for this ToolStripGroup.
    // This can be customized via the standard +link{type:AutoChild} pattern.
    // @visibility external
    //<

    labelLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: 22
    },

    //> @attr toolStripGroup.labelConstructor (String : "Label" : IRA)
    // SmartClient class for the title label.
    // @visibility external
    //<
    labelConstructor: "Label",

    labelDefaults: {
        width: "100%",
        height: 22,
        autoDraw: true,
        wrap: false,
        overflow: "hidden",
        border: "none"
    },

    //> @attr toolStripGroup.titleAlign (Alignment : "center" : IRW)
    // Controls the horizontal alignment of the group-title in its label.  Setting this
    // attribute overrides the default specified by 
    // +link{toolStrip.groupTitleAlign, groupTitleAlign} on the containing 
    // +link{class:ToolStrip, ToolStrip}.
    // @visibility external
    //<
    //titleAlign: "center",

    //> @attr toolStripGroup.titleStyle (CSSClassName : "toolStripGroupTitle" : IRW)
    // CSS class applied to this ToolStripGroup.
    // @visibility external
    //<
    titleStyle: "toolStripGroupTitle",

    //> @attr toolStripGroup.titleOrientation (VerticalAlignment : "top" : IRW)
    // Controls the horizontal alignment of the group-title in its label.  Setting this
    // attribute overrides the default specified by 
    // +link{toolStrip.groupTitleAlign, groupTitleOrientation} on the containing 
    // +link{class:ToolStrip, ToolStrip}.
    // @visibility external
    //<
    //titleOrientation: "top",

    //> @attr toolStripGroup.titleProperties (AutoChild Properties : null : IRW)
    // AutoChild properties for fine customization of the title label.
    // @visibility external
    //<
    
    //> @attr toolStripGroup.body (AutoChild : null : IR)
    // HLayout autoChild that manages multiple VLayouts containing controls.
    // @visibility external
    //<

    //> @attr toolStripGroup.bodyConstructor (String : "HLayout" : IRA)
    // SmartClient class for the body.
    // @visibility external
    //<
    bodyConstructor:"HLayout",

    bodyDefaults: {
        width: "*",
        height: "*",
        overflow: "visible",
        membersMargin: 2,
        autoDraw: false
    },

    // some autochild defaults for the individual VLayouts that represent columns
    columnLayoutDefaults: {
        _constructor: "VLayout",
        width: 1,
        membersMargin: 2,
        height: "100%",
        overflow: "visible",
        autoDraw: false,
        numRows: 0,
        addMember : function (member, position) {
            this.Super("addMember", arguments);
    
            if (member.rowSpan == null) member.rowSpan = 1;
            var height = member.rowSpan * this.creator.rowHeight + 
                ((member.rowSpan-1) * this.membersMargin);

            if (member.orientation == "vertical") {
                member.rowSpan = this.maxRows;
                height = (member.rowSpan * this.creator.rowHeight) + 
                    ((this.maxRows-1) * this.membersMargin);
            }
            member.setHeight(height);
            this.numRows += member.rowSpan;
            if (this.numRows > this.maxRows) this.numRows = this.maxRows;
        },
        removeMember : function (member) {
            this.Super("removeMember", arguments);

            if (member.rowSpan == null) member.rowSpan = 1;
            this.numRows -= member.rowSpan;

            member.markForDestroy();
            member = null;
        }
    },

    //> @attr toolStripGroup.numRows (Number : 1 : IRW)
    // The number of rows of controls to display in each column.
    // @visibility external
    //<
    numRows: 1,

    //> @attr toolStripGroup.rowHeight (Number : 20 : IRW)
    // The height of rows in each column.
    // @visibility external
    //<
    rowHeight: 20,

    defaultColWidth: "*",
    
    //> @attr toolStripGroup.titleHeight (Number : 18 : IRW)
    // The height of the +link{toolStripGroup.label, title label} in this group.
    // @visibility external
    //<
    titleHeight: 18,

    initWidget : function () {
        this.Super("initWidget", arguments);

        var showLabel = this.showTitle != false && this.showLabel != false;

        if (showLabel) {
            this.addAutoChild("labelLayout", { height: this.titleHeight });

            this.addAutoChild("label", 
                isc.addProperties({}, this.titleProperties || {}, {
                    styleName: this.titleStyle,
                    height: this.titleHeight,
                    align: this.titleAlign,
                    contents: this.title,
                    autoDraw: false
                })
            );
        
            this.labelLayout.addMember(this.label);
            
            if (this.showTitle == false) this.labelLayout.hide();
            this.addMember(this.labelLayout);
        }

        this.addAutoChild("body", {
            _constructor: this.bodyConstructor,
            height: this.numRows * this.rowHeight
        });

        this.addMember(this.body, showLabel ? (this.titleOrientation == "bottom" ? 0 : 1) : 0);

        if (this.controls) {
            this.addControls(this.controls, false);
        }
        
    },

    //> @method toolStripGroup.setTitle()
    // Sets the header-text for this group.
    // 
    // @param title (String) The new title for this group
    // @visibility external
    //<
    setTitle : function (title) {
        if (this.label) this.label.setContents(title);
    },

    //> @method toolStripGroup.setShowTitle()
    // This method forcibly shows or hides this group's title after initial draw.
    // 
    // @param showTitle (Boolean) should be show the title be shown or hidden?
    // @visibility external
    //<
    setShowTitle : function (showTitle) {
        this.showTitle = showTitle;
        if (!showTitle && this.labelLayout.isVisible()) this.labelLayout.hide();
        else if (showTitle && !this.labelLayout.isVisible()) this.labelLayout.show();
    },

    //> @method toolStripGroup.setTitleAlign()
    // This method forcibly sets the text-alignment of this group's title after initial draw.
    // 
    // @param align (Alignment) the new alignment for the text, left or right
    // @visibility external
    //<
    setTitleAlign : function (align) {
        this.titleAlign = align;
        if (this.label) this.label.setAlign(this.titleAlign);
    },

    //> @method toolStripGroup.setTitleOrientation()
    // This method forcibly sets the orientation of this group's title after initial draw.
    // 
    // @param align (VerticalAlignment) the new orientation for the title, either bottom or top
    // @visibility external
    //<
    setTitleOrientation : function (orientation) {
        this.titleOrientation = orientation;
        if (this.label && this.labelLayout) {
            if (this.titleOrientation == "top") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 0);
            } else if (this.titleOrientation == "bottom") {
                this.removeMember(this.labelLayout);
                this.addMember(this.labelLayout, 1);
            }
        }
    },

    addColumn : function (index, controls) {
        var undef;
        if (index === null || index === undef) {
            index = this.body.members.length;
        }

        var colWidth = this.defaultColWidth;
        if (this.colWidths && this.colWidths[index] != null) colWidth = this.colWidths[index];

        var newColumn = this.createAutoChild("columnLayout", 
            { maxRows: this.numRows, numRows: 0, width: colWidth, height: this.body.getVisibleHeight()-1 }
        );
        this.body.addMember(newColumn, index);

        if (controls) newColumn.addMembers(controls);

        return newColumn;
    },

    getAvailableColumn : function (createIfUnavailable) {
        var members = this.body.members;

        if (members && members.length > 0) {
            for (var i=0; i<members.length; i++) {
                var member = members[i];
                //this.logWarn("member " + member + " numRows is " + member.numRows);
                if (member.numRows < member.maxRows) return member;
            }
        }

        if (createIfUnavailable != false) return this.addColumn();
        return null;
    },

    //> @method toolStripGroup.setControlColumn()
    // Return the column widget that contains the passed control.
    // 
    // @param control (Canvas) the control to find in this group
    // @visibility external
    //<
    getControlColumn : function (control) {
        var members = this.body.members;

        if (members && members.length > 0) {
            for (var i=members.length-1; i>=0; i--) {
                if (members[i].members.contains(control)) return members[i];
            }
        }

        return null;
    },

    //> @method toolStripGroup.setControls()
    // Clears the array of controls and then adds the passed array to this toolStripGroup, 
    // creating new columns as necessary according to each control's rowSpan attribute and 
    // the group's +link{numRows} attribute.
    // 
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    setControls : function (controls, store) {
        if (this.controls) {
            this.removeAllControls();
        }
        this.addControls(controls, store);
    },

    //> @method toolStripGroup.addControls()
    // Adds an array of controls to this group, creating new columns as necessary
    // according to each control's rowSpan attribute and the group's numRows attribute.
    // 
    // @param controls (Array of Canvas) an array of widgets to add to this group
    // @visibility external
    //<
    addControls : function (controls, store) {
        if (!controls) return;
        if (!isc.isAn.Array(controls)) controls = [controls];

        for (var i=0; i<controls.length; i++) {
            this.addControl(controls[i], null, store);
        }
    },

    //> @method toolStripGroup.addControl()
    // Adds a control to this toolStripGroup, creating a new column if necessary,
    // according to the control's rowSpan attribute and the group's +link{numRows} attribute.
    // 
    // @param control (Canvas) a widget to add to this group
    // @param [index] (Number) optional insertion index for this control
    // @visibility external
    //<
    addControl : function (control, index, store) {
        if (!control) return null;
        
        var undef;
        if (index === null || index === undef || index >= this.numRows) index = this.numRows-1;

        var column = this.getAvailableColumn(true);
        
        if (!this.controls) this.controls = [];
        if (store != false) this.controls.add(control);

        column.addMember(control, index);
        column.reflowNow();
    },

    //> @method toolStripGroup.removeControl()
    // Removes a control from this toolStripGroup, destroying an existing column if this is the
    // last widget in that column.
    // 
    // @param control (Canvas) a widget to remove from this group
    // @visibility external
    //<
    autoHideOnLastRemove: false,
    removeControl : function (control) {
        control = isc.isAn.Object(control) ? control : this.getMember(control);
        if (!control) return null;

        var column = this.getControlColumn(control);

        if (column) {
            column.removeMember(control);
            this.controls.remove(control);
            if (column.members.length <= 1) {
                // if the column is now empty, destroy it
                column.hide();
                this.body.removeMember(column);
                column.markForDestroy();
                column = null;
            }
        }
        
        if (this.body.members.length == 0 && this.autoHideOnLastRemove) {
            // hide ourselves
            this.hide();
        }
    },

    removeAllControls : function () {
        if (!this.controls || this.controls.length == 0) return null;
        
        for (var i=this.controls.length-1; i>=0; i--) {
            var control = this.controls[i];
            control.hide();
            this.removeControl(control);
            control.markForDestroy();
            control = null;
        }
    },
    
    resized : function () {
        this._updateLabel();
    },
    
    draw : function () {
        this.Super("draw", arguments);
        
        this._updateLabel();
    },

    redraw : function () {
        this.Super("redraw", arguments);
        
        this._updateLabel();
    },

    _updateLabel : function () {
        var visibleWidth = this.getVisibleWidth(),
            margin = this.layoutMargin,
            newWidth = this.getVisibleWidth() - (this.layoutMargin*3)
        ;

        this.labelLayout.setWidth(newWidth);
        this.label.setWidth(newWidth);
    }
    
});


//>	@class	IconButton
// A Button subclass that displays an icon, title and optional menuIcon and is capable of 
// horizontal and vertical orientation.
//
// @visibility external
//<
isc.defineClass("IconButton", "Button").addProperties({

width: 1,
overflow: "visible",
height: 1,

padding: 3,

autoDraw: false,

usePartEvents: true,

//> @attr iconButton.orientation (String : "horizontal" : IRW)
// The orientation of this IconButton.  The default value, "horizontal", renders icon, title
// and potentially menuIcon from left to right: "vertical" does the same from top to bottom.
// 
// @visibility external
//<
orientation: "horizontal",

//> @attr iconButton.baseStyle (CSSClassName : "iconButton" : IRW)
// Default CSS class.
//
// @visibility external
//<
baseStyle: "iconButton",

//> @attr iconButton.showMenuIcon (Boolean : false : IRW)
// Whether to show the +link{menuIconSrc, menu-icon} which fires the +link{menuIconClicked} 
// notification method when clicked.
//
// @visibility external
//<
showMenuIcon: false,

//> @attr iconButton.menuIconSrc (SCImgURL : "[SKINIMG]/Menu/submenu_down.png" : IRW)
// Image that shows a +link{class:Menu, menu} when clicked.
//
// @visibility external
//<
menuIconSrc: "[SKINIMG]/Menu/submenu_down.png",
menuIconOverSrc: "[SKINIMG]/Menu/submenu_downOver.png",

menuIconWidth: 14,
menuIconHeight: 13,
menuIconStyleCSS: "vertical-align:middle; border:1px solid transparent; -moz-border-radius: 3px; " +
    "-webkit-border-radius: 3px; -khtml-border-radius: 3px; border-radius: 3px;"
,
menuIconOverBorderCSS: "1px solid #A7ABB4",

menuConstructor: isc.Menu,

initWidget : function () {
    if (this.orientation == "vertical") {
        this.align = "center";
        this.valign = "top";
    } else {
        this.align = "left";
        this.valign = "center";
    }
    
    this._originalTitle = this.title;
    this._originalIcon = this.icon;

    this.Super("initWidget", arguments);

},


//> @attr iconButton.icon (SCImgURL : null : IRW)
// Icon to show to the left of or above the title, according to the button's +link{orientation}.
// <P>
// When specifying <code>titleOrientation = "vertical"</code>, this icon will be stretched to 
// the +link{largeIconSize} unless a +link{largeIcon} is specified.
//
// @visibility external
//<

//> @attr iconButton.iconSize (Number : 16 : IRW)
// The size of the normal icon for this button.
//
// @visibility external
//<
iconSize: 16,

//> @attr iconButton.largeIcon (SCImgURL : null : IRW)
// Icon to show above the title when +link{orientation} is "vertical".
// <P>
// If a largeIcon is not specified, the +link{icon, normal icon} will be stretched to 
// the +link{largeIconSize}.
//
// @visibility external
//<

//> @attr iconButton.largeIconSize (Number : 32 : IRW)
// The size of the large icon for this button.  If +link{largeIcon} is not specified, the
// +link{icon, normal icon} will be stretched to this size.
//
// @visibility external
//<
largeIconSize: 32,

getTitle : function () {

    var isLarge = this.orientation == "vertical",
        icon = (isLarge ? this.largeIcon || this._originalIcon : this._originalIcon),
        iconSize = (isLarge ? this.largeIconSize : this.iconSize),
        title = this._originalTitle
    ;

    if (this.showDisabledIcon && this.disabled) {
        var dotIndex = icon.lastIndexOf("."),
            tempIcon = icon.substring(0, dotIndex) + "_Disabled" + icon.substring(dotIndex)
        ;

        icon = tempIcon;
    }

    var iconCSS = "vertical-align:middle;" + (isLarge ? "margin-bottom:5px;" : ""),
        menuIconCSS = this.menuIconStyleCSS + (isLarge ? "margin-top:4px;" : ""),
        img = this.imgHTML(icon, iconSize, iconSize, null, 
            " style='" + iconCSS + "' eventpart='icon'"),
        menuIcon = this.showMenuIcon ? 
            this.imgHTML(this.menuIconSrc, this.menuIconWidth, this.menuIconHeight, "menuIcon",
                " style='" + menuIconCSS + "' eventpart='menuIcon' " ) : null;
    ;

    if (this.orientation == "vertical") {
        this.icon = null;

        var pad = "<span style='font-size:4px'><br></span>";

        title = img + "<br>" + title;
        if (menuIcon) title += "<br>" + menuIcon;
    } else {
        if (this.showMenuIcon && menuIcon) title += "&nbsp;" + menuIcon;
    }

    this.title = title;
    return title;

},

mouseOut : function () {
    this.Super("mouseOut", arguments);
    
    if (this.showingMenuButtonOver) this.menuIconMouseOut();
},

//> @method iconButton.menuIconClick()
// Notification method fired when a user clicks on the menuIcon on this IconButton.
//
// @visibility external
//<
menuIconClick : function () {},

//> @attr iconButton.showMenuIconOver (Boolean : false : IRW)
// Image that shows a +link{class:Menu, menu} when clicked.
//
// @visibility external
//<
showMenuIconOver: false,

menuIconMouseMove : function () {
    if (!this.showMenuIconOver || this.showingMenuButtonOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = true;
        element.style.border = this.menuIconOverBorderCSS;
    }
},

menuIconMouseOut : function () {
    if (!this.showMenuIconOver) return;

    var element = this.getImage("menuIcon");

    if (element) {
        this.showingMenuButtonOver = false;
        element.style.border = "1px solid transparent";
    }
}


});

//>	@class	IconMenuButton
// A subclass of +link{IconButton} that shows a menuIcon by default and implements showMenu().
//
// @visibility external
//<
isc.defineClass("IconMenuButton", "IconButton").addProperties({

usePartEvents: true,

showMenuIcon: true,

menuIconClick : function () {
    this.showMenu();
},

//>	@attr iconMenuButton.menu (Menu : null : IRW)
// The menu to show when the +link{this.menuIconSrc, menu-icon} is clicked.
// <P>
// For a menu button with no menu (menu: null) the up/down arrow image can
// be suppressed by setting
// +link{menuButton.showMenuButtonImage, showMenuButtonImage}: <code>false</code>.
//
// @visibility external
//<
menu:null,

//> @attr iconMenuButton.menuAnimationEffect (string : null : IRWA)
// Allows you to specify an animation effect to apply to the menu when it is being shown.
// Valid options are "none" (no animation), "fade", "slide" and "wipe".
// If unspecified falls through to <code>menu.showAnimationEffect</code>
// @visibility animation
//<

//> @method iconMenuButton.showMenu()
// Shows this button's +link{iconMenuButton.menu}.  Called automatically when a user clicks the 
// +link{menuIconSrc, menuIcon}.
//
// @visibility external
//<
showMenu : function () {
    // lazily create the menu if necessary, so we can init with, or set menu to, an object 
    // properties block
    if (isc.isA.String(this.menu)) this.menu = window[this.menu];
    if (!isc.isA.Menu(this.menu)) this._createMenu(this.menu);
    if (!isc.isA.Menu(this.menu)) return;

    var menu = this.menu;
    
    // draw offscreen so that we can figure out what size the menu is
    // Note that we use _showOffscreen which handles figuring out the size, and
    // applying scrollbars if necessary.
    menu._showOffscreen();

    // figure out the left coordinate of the drop-down menu
    var left = this.getPageLeft();

    //left = left - (menu.getVisibleWidth() - this.getVisibleWidth()); 

    var top = this.getPageTop()+this.getVisibleHeight()+1;

    // don't allow the menu to show up off-screen
    menu.placeNear(left, top);
    menu.show(this.menuAnimationEffect);
},

_createMenu : function (menu) {
    if (!menu) return;
    menu.autoDraw = false;

    var cons = this.menuConstructor || isc.Menu;
    this.menu = cons.create(menu);
}


});


//> @class RibbonBar
//
// A +link{class:ToolStrip, ToolStrip-based} class for showing 
// +link{class:RibbonGroup, groups} of related buttons and other controls.
//
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("RibbonBar", "ToolStrip").addProperties({

    groupConstructor: "RibbonGroup",
    
    //> @method ribbonBar.addGroup()
    // Add a new group to this RibbonBar. You can either create your group externally and pass 
    // it in, or you can pass a properties block from which to automatically construct it.
    //
    // @param group (RibbonGroup) the new group to add to this ribbon
    // @param [position] (Number) the index at which to insert the new group
    // @visibility external
    //<
    addGroup : function (group, position) {
        return this.addToolStripGroup(group, position);
    }

});
//> @class RibbonGroup
// 
// A widget that groups other controls for use in +link{class:RibbonBar, RibbonBars}.
// 
// @treeLocation Client Reference/Layout
// @visibility external
//<
isc.defineClass("RibbonGroup", "ToolStripGroup").addProperties({

    //> @attr ribbonGroup.newControlConstructor (Class : "IconButton" : IR)
    // Widget class for controls +link{createControl, created automatically} by this 
    // RibbonGroup.  Since +link{newControl, such controls} are created via the autoChild 
    // system, they can be further customized via the newControlProperties property.
    // 
    // @visibility external
    //<
    newControlConstructor: "IconButton",
    //> @attr ribbonGroup.newControlDefaults (AutoChild : null : IR)
    // Properties used by +link{createControl} when creating new controls.
    // 
    // @visibility external
    //<
    newControlDefaults: {
    },

    //> @method ribbonGroup.createControl()
    // Add a new control to this RibbonBar.  The control is created using the autoChild system,
    // according to the +link{newControlConstructor, new control} You can either create your group and pass it in the
    // first parameter, or you can pass a properties clock from which to automatically
    // construct it.
    //
    // @param properties (Canvas Properties) properties from which to construct a new control
    // @param [position] (Number) the index at which to insert the new control
    // 
    // @visibility external
    //<
    createControl : function (properties, position) {
        var newControl = this.createAutoChild("newControl", properties);

        return this.addControl(newControl, position);
    } 

});



