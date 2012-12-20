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





//> @groupDef accessibility
// SmartClient is a fully accessible technology which fulfills the Section 508 requirements of
// U.S. government law and similar international standards.  Specificallly:
// <ul>
// <li> components are fully keyboard navigable and the browser's native focus indicator reveals
// keyboard focus to the user
// <li> components are themable/brandable, allowing a variety of high contrast and limited color
// range look and feel options to compensate for visual acuity disabilities
// <li> the WAI-ARIA standard is supported for adding semantic markup to components to identify them to
// screen readers such as NVDA or JAWS.
// </ul>
// <P>
// <b>WAI-ARIA support</b>
// <P>
// ARIA is a standard from the WAI (Web Accessibility Institute) that allows modern Ajax applications to
// add semantic markup to the HTML used to create modern Ajax interfaces to enable screen reader support.
// This semantic markup allows a screen reader to identify the function and state of complex components
// such as load-on-demand lists and trees even though they are composed of simple elements such a &lt;div&gt;s.  
// <P>
// Note that ARIA support is the correct way to evaluate the accessibility of a web
// <i>application</i>.  Standards which apply to a web <i>site</i>, such as ensuring that all interactive
// elements are composed of native HTML anchor (&lt;a&gt;) or &lt;form&gt; controls, cannot and should
// not be applied to a web <i>application</i>.  A web application's accessibility must be evaluated in
// terms of its ARIA support.
// <P>
// By default, SmartClient components will write out limited ARIA markup sufficient to navigate basic
// menus and buttons.  Full screen reader mode is not enabled by defaut because it has a small
// performance impact and subtly changes the management of keyboard focus in a way that is slightly worse
// for unimpaired users.  
// <P>
// The limited ARIA support which is enabled by default is intended to allow a screen reader user to
// navigate to a menu to enable full screen reader support.  This is analogous to a partially visually
// impaired user ariving at a site with normal theming and needing to switch to a high-contrast skin.
// <P>
// To enable full screenReader mode, call +link{isc.setScreenReaderMode()} before any
// SmartClient components are created or drawn.  This implies that if an end user dynamically enables
// full screen reader support, the application page must be reloaded, as an any existing components will
// not have full ARIA markup.
// <P>
// For an overview of ARIA, see +externalLink{http://www.w3.org/WAI/intro/aria.php}.
// <P>
// To completely disable ARIA markup, call
// +link{isc.setScreenReaderMode(),isc.setScreenReaderMode(false)} before any components are drawn.
// <P>
// <b>Recommended Screen Reader Configuration</b>
// <P>
// The recommended configuration for screen reader use is the most recent available release of Firefox
// and either the JAWS or NVDA screen reader.
// <P>
// While WAI-ARIA markup is provided for other browsers, support for WAI-ARIA itself is known to be
// limited in current release versions of IE and other browsers supported by SmartClient.
// <P>
// <b>Application-level concerns</b>
// <P>
// While SmartClient enables accessible web applications to be created, it is always possible for an
// application to violate accessibility standards.  The following is a brief and not exhaustive list of
// concerns for application authors:
// <ul>
// <li> for any operation that can be triggered via drag and drop, you should offer an equivalent
// keyboard-only means of performing the same operation.  For common grid to grid drags, this is easily
// accomplished using +link{ListGrid.transferSelectedData()}.
// <li> if you use a component in a way that is not typical, such as using an ImgButton as a
// non-interactive stateful display, set its +link{canvas.ariaRole} appropriately.  For a list of ARIA
// roles, see +externalLink{http://www.w3.org/WAI/PF/aria/roles#role_definitions}
// <li> for plain HTML content that is incorporated into an Ajax interface (such as an embedded help
// system), embed the HTML into an +link{HTMLFlow} (whose default ARIA role is "article") and ensure the
// HTML itself is accessible (for example, has "alt" attributes on all images which are semantically
// meaningful)
// </ul>
// 
// @treeLocation Concepts
// @title Accessibility / Section 508 compliance
// @visibility external
//<

//> @classMethod isc.setScreenReaderMode()
// Enables full screen reader mode.  Must be called before any components are created.  See
// +link{group:accessibility}.
// @param newState (boolean) new setting
// @visibility external
//<
isc.setScreenReaderMode = function (newState) {
   isc.screenReader = newState;
}

//> @attr canvas.ariaRole (String : null : IR)
// ARIA role of this component.  Usually does not need to be manually set - see
// +link{groupDef:accessibility}.
// @visibility external
//<
 
//isc.screenReader = undefined; // initially undefined

// liteAria
// - may be explicitly set to true to minimize what Aria behaviors are enabled
// - otherwise we default to true in IE8 and earlier unless 'setScreenReaderMode(true)' has been
//   explicitly called.
isc.liteAria = null;

// internal DOM manipulation methods, don't document
isc.Canvas.addClassMethods({

    
    // this just indicates whether we write out basic ARIA attributes for most elements, not whether we
    // are in full screenReader mode
    ariaEnabled : function () {
        return isc.screenReader || isc.screenReader !== false &&
            ((isc.Browser.isIE && isc.Browser.version >=8) || !isc.Browser.isIE);
    },
    
    useLiteAria : function () {
        // allow "liteAria" to be explicitly specified.
        // Otherwise if screenReader is explicitly set to true, don't use liteAria
        // - otherwise use liteAria for <= IE8 since it's slow.
        if (isc.liteAria != null) return isc.liteAria;
        if (isc.screenReader == true) return false;
        return (isc.Browser.isIE && isc.Browser.version < 9);
        
    },

    setAriaRole : function (element, role) {
        if (this.logIsDebugEnabled("aria")) {
            this.logDebug("ARIA role changed to: " + role + 
                          " on element: " + this.echoLeaf(element), "aria");
        }
        element.setAttribute("role", role);
    },
    setAriaState : function (element, stateName, stateValue) {
        if (!element) return;
        if (this.logIsInfoEnabled("aria")) {
            this.logInfo("ARIA state: " + stateName + ": " + stateValue +
                         ", set on element: " + isc.echoLeaf(element), "aria");
        }
        
        // Escape HTML that got inadvertently passed in 
        // Since this is critical path, avoid escaping anything we don't need
        // (Signature is  amp, lt, gt, quot, apos, cr)
        stateValue = isc.makeXMLSafe(stateValue,  false, true, true, false, true, true);

        element.setAttribute("aria-" + stateName, stateValue);
    },
    setAriaStates : function (element, state) {
        if (!element) return;
        if (state == null) return;
        for (var stateName in state) {
            this.setAriaState(element, stateName, state[stateName]);
        }
    },

    clearAriaState : function (element, stateName) {
        if (!element) return;
        element.removeAttribute("aria-" + stateName);
    },

    getAriaStateAttributes : function (ariaState) {
        var output = "";
        if (ariaState) {
            for (var stateName in ariaState) {
                var stateValue = ariaState[stateName]; 
                if (isc.isA.String(stateValue)) {
                    // Run through 'makeXMLSafe' to escape quotes 
                    // (avoid early termination of string), and escape HTML tags.
                    // Since this is critical path, avoid escaping anything we don't need
                    // (Signature is  amp, lt, gt, quot, apos, cr)
                    stateValue = isc.makeXMLSafe(stateValue,  false, true, true, false, true, true);
            
                }
                output += " aria-" + stateName + "='" + stateValue + "'";
            }
        }
        return output;
    }
});

isc.Canvas.addMethods({
    // instance-level methods.  Canvases set ariaRole and ariaState on their
    // clipHandle
    setAriaRole : function (role) {
        isc.Canvas.setAriaRole(this.getClipHandle(), role);
    },
    setAriaState : function (stateName, stateValue) {
        isc.Canvas.setAriaState(this.getClipHandle(), stateName, stateValue);
    },
    setAriaStates : function (state) {
        isc.Canvas.setAriaStates(this.getClipHandle(), state);
    },
    clearAriaState : function (stateName) {
        isc.Canvas.clearAriaState(this.getClipHandle(), stateName);
    },

    // called during initial draw for non-IE browsers
    getAriaStateAttributes : function () {
        return isc.Canvas.getAriaStateAttributes(this.ariaState);
    }
});


if (isc.DynamicForm) {

// General support for formItems
// ---------------------------------------------------------------------------------------
// Note: FormItemIcon: in FormItem.js, given fixed role="button" and icon.prompt made into aria-label.

isc.FormItem.addMethods({
    // FormItems set ariaRole and ariaState on their focus element, if any
    setAriaRole : function (role) {
        var focusElement = this.getFocusElement();  
        if (focusElement != null) isc.Canvas.setAriaRole(focusElement, role);
    },
    setAriaState : function (stateName, stateValue) {
        var focusElement = this.getFocusElement();  
        if (focusElement != null) isc.Canvas.setAriaState(focusElement, stateName, stateValue);
    },
    setAriaStates : function (state) {
        var focusElement = this.getFocusElement();
        if (focusElement != null) isc.Canvas.setAriaStates(focusElement, state);
    },
    clearAriaState : function (stateName) {
        var focusElement = this.getFocusElement();
        if (focusElement != null) isc.Canvas.clearAriaState(focusElement, stateName);
    },
    getAriaState : function () {
        var state = {};

        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-required  
        if (this.required && this.form && this.form.hiliteRequiredFields) state.required = true;
 
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-invalid
        if (this.hasErrors()) {
            state.invalid = true;
            
            var errorIconId = this.getErrorIconId();
            state.describedby = errorIconId;
        }

        // Disabled also means it's not in the tab order so won't be read by default.  However the spec
        // below mentions this is the case so presumably this is for screen readers to add features to
        // allow users to have disabled fields read.
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-disabled
        if (this.isDisabled()) state.disabled = true;

        if (isc.isA.CheckboxItem(this)) state.checked = !!this.getValue();

        return state;
    },

    // called after a FormItem is drawn
    addContentRoles : function () {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return;

        if (!this._canFocus() || !this.ariaRole) return;

        this.setAriaRole(this.ariaRole);

        var outerElement;
        if (this.outerAriaRole) {
            outerElement = this.getHandle();
            if (outerElement != null) isc.Canvas.setAriaRole(outerElement, this.outerAriaRole);
        }

        // with a visible title, we write out <label for=>, but we need an explicit aria-label if the
        // title is either not visible or if we do not have a native HTML input element (since 
        // <label for=> is intended for true HTML input elements).
        
        
        if (this.title) {
            var titleElement;
            if (this.hasDataElement()) {
                titleElement = this.getDataElement();
            } else if (this.outerAriaRole) {
                titleElement = outerElement != null ? outerElement : this.getHandle();
            } else {
                titleElement = this._getTextBoxElement();
            }
            if (titleElement != null) {
                //this.logWarn("applied aria-label to: " + this.echo(titleElement));
                isc.Canvas.setAriaState(titleElement, "label", this.title);
            }
        }

    
        // instance default state such as multiline:true for TextArea
        if (this.ariaState) this.setAriaStates(this.ariaState);

        // dynamic state
        this.setAriaStates(this.getAriaState());
    }
});

isc.TextAreaItem.addProperties({
    ariaState : { multiline : true }
});


isc.ComboBoxItem.addProperties({
    ariaState:{ autocomplete:"list" },
    ariaRole:"combobox"
    //outerAriaRole:"combobox",
    //pickListAriaRole:"list", // not implemented 
    //pickListItemAriaRole:"listitem" // not implemented
});

isc.SelectItem.addProperties({
    ariaRole:"option",
    outerAriaRole:"listbox",
    ariaState:{ expanded:false, selected:true }
});

isc.StaticTextItem.addProperties({
    ariaRole:"textbox",
    
    ariaState:{ disabled:true }
});

// "menu" role vs "list" role: somewhat ambiguous, as both roles have the notions of
// selectability (via "checked" for menus), but generally menus show actions and sometimes
// choices whereas lists show just choices.
// ListGrid currently advertises itself as a List, it's subclass ScrollingMenu sounds like it
// should advertise itself as a Menu, however it is not used for anything but the PickList
// NOTE: separators already handled by ListGrid superclass
//isc.PickListMenu.addProperties({
//    ariaRole:"list",
//    rowRole:"listitem"
//});

} // end if (isc.DynamicForm)

if (isc.GridRenderer) {

// Grids
// ---------------------------------------------------------------------------------------


// Support for row and cell roles and states
isc.GridRenderer.addMethods({
    setRowAriaState : function (rowNum, stateName, stateValue) {
        var row = this.getTableElement(rowNum);
        if (row == null) return;
        isc.Canvas.setAriaState(row, stateName, stateValue);
    },
    setRowAriaStates : function (rowNum, state) {
        var row = this.getTableElement(rowNum);
        if (row == null) return;
        isc.Canvas.setAriaStates(row, state);
    }
});

isc.ListGrid.addMethods({
    ariaRole:"list",
    rowRole:"listitem",
    getRowRole : function (rowNum, record) {
        if (record && record.isSeparator) return "separator";
        return this.rowRole;
    },
    getRowAriaState : function (rowNum, record) {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return; // too expensive to enable by default

        // if only rendering a range of rows, need to tell the reader the total size and position
        var state;
        if (!this.showAllRecords && this.data != null) {
            state = { setsize : this.getTotalRows(), 
                      posinset : rowNum }
        }
        
        if (this.selection && this.selection.isSelected && this.selection.isSelected(rowNum)) {
            if (state == null) state = {}
            state.selected = true;
        }
        return state;
    }
});

isc.TreeGrid.addMethods({
    ariaRole:"tree",
    rowRole:"treeitem",
    getRowRole : function (rowNum, node) {
        return this.rowRole;
    },
    // an attempt to use the hasparent attribute to link nodes.  Not respected by FF1.5
    //getRowElementId : function (rowNum) {
    //    return this.getID() + "_row_" + rowNum;
    //},
    getRowAriaState : function (rowNum, node) {
        if (!isc.Canvas.ariaEnabled() || isc.Canvas.useLiteAria()) return; // too expensive to enable by default

        var theTree = this.data,
            selected = !!(this.selection && this.selection.isSelected && 
                            this.selection.isSelected(node)),
            level = theTree.getLevel(node);
    
        var state = { selected : selected, 
                      level : level,
                      // if only rendering a range of rows, need to tell the reader the 
                      // total size and position
                      setsize : this.getTotalRows(),
                      posinset : rowNum
                    };

        if (theTree.isFolder(node)) state.expanded = !!theTree.isOpen(node);

        // an attempt to use the hasparent attribute to link nodes.  Not respected by FF1.5
        //var parent = theTree.getParent(node);
        //if (parent && parent != theTree.getRoot()) {  
        //    state.hasparent = this.getRowElementId(theTree.indexOf(parent));
        //}

        return state;
    }
});

// NOTE: CubeGrid support in AnalyticsScreenReader.js

// Menus / ListPickers
// ---------------------------------------------------------------------------------------

isc.Menu.addMethods({
    ariaRole:"menu",
    getRowRole : function (rowNum, item) {
        if (!item || item.isSeparator) return "separator";
        if (item.checked || item.checkIf || item.checkable) return "menuitemcheckable";
        if (item.radio) return "menuitemradio";
        return "menuitem";
    },
    getRowState : function (rowNum) {
        if (this.hasSubmenu(this.getItem(rowNum))) return { haspopup:true };
    }
});

// There is no "menubutton" role, but with aria-haspopup NVDA 2011.1.1 at least reads
// this as "menubutton submenu".
isc.MenuButton.addProperties({
    ariaRole:"button",
    ariaState:{ haspopup:true }
});
isc.MenuBar.addProperties({
    ariaRole:"menubar"
});

} // end if (isc.GridRenderer)




(function () {
    var roleMap = {
        Button : "button",
        StretchImgButton : "button",
        ImgButton : "button",
        Label : "label",
        
        // Section stacks - headers are "heading"s
        SectionHeader:"heading",
        ImgSectionHeader:"heading",
    
        // FormItems
        CheckboxItem : "checkbox",
        Slider : "slider",

        TextItem : "textbox",

        // TextArea is textbox + plus multiple:true state 
        // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-multiline
        TextAreaItem : "textbox", 

        Window : "dialog",
        Toolbar : "toolbar",

        // a good default.  Without this NVDA will read an HTMLFlow as just "section" and stop.  With
        // this, contents are read.
        HTMLFlow:"article",
        HTMLPane:"article",

        // not doing this by default since lots of components use Layouts in various internal
        // ways that do not correspond to a "group"
        //Layout : "group", 

        // NOTE example shows 'tablist' element surrounding 'tab's but not 'tabpanel's
        // http://www.mozilla.org/access/dhtml/class/tabpanel
        TabBar : "tablist",
        PaneContainer : "tabpanel",
        ImgTab : "tab",
        
        EdgedCanvas : "presentation",
        BackMask : "presentation"
        
    }
    for (var className in roleMap) {
        var theClass = isc.ClassFactory.getClass(className);
        if (theClass) theClass.addProperties({ariaRole:roleMap[className]});
    }
})();
