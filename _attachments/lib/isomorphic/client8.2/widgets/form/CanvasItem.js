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






//> @class CanvasItem
// FormItem which renders a Canvas inline in a DynamicForm instance.
// <P>
// CanvasItem is +link{FormItem.shouldSaveValue,shouldSaveValue}:false by default, meaning that
// no value from the CanvasItem will be present in +link{form.values} and no value will be
// saved when +link{dynamicForm.saveData()} is called.  This is appropriate if your Canvas does
// not participate in displaying or editing the values of the form and is embedded in the form
// for layout purposes only.
// <P>
// If you set +link{FormItem.shouldSaveValue,shouldSaveValue}:true,
// +link{CanvasItem.showValue()} will be called to provide a value that your item should
// display.  Implement <code>showValue()</code> and call methods on the Canvas you've created
// to cause the value to be displayed.
// <P>
// <code>showValue()</code> will be called in various situations where the form receives data,
// including a call to +link{dynamicForm.setValues()}, +link{dynamicForm.editRecord()}, or if
// +link{dynamicForm.fetchData()} is called and a Record is returned.  Bear in mind that
// <code>showValue()</code> can be called when the form and your item have not yet been drawn;
// in this case, store the value for later display.
// <P>
// To provide a value to the form, call +link{CanvasItem.storeValue()} whenever the user changes
// the value in your Canvas.  Note that the form <b>will not</b> call
// <code>canvasItem.getValue()</code> in order to discover your item's value, so there is no
// purpose in overriding this method - use <code>storeValue</code> to proactively inform the
// form about changes instead.  This approach is necessary in order to enable change events.
// <P>
// If you cannot easily detect changes to values in your Canvas, a workaround is to call
// <code>storeValue</code> right before the form saves.
//
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<
isc.ClassFactory.defineClass("CanvasItem", "FormItem");
isc.CanvasItem.addProperties({
    width:"*", height:null,

    //> @attr canvasItem.shouldSaveValue (boolean : false : IR)
    // Should this item's value be saved in the form's values and hence returned from
    // +link{dynamicForm.getValues,form.getValues()}?
    // <P>
    // See the +link{CanvasItem} class overview for a discussion of values-handling in 
    // CanvasItems
    // @visibility external
    //<
    shouldSaveValue:false,
    
    // override setElementValue() to call showValue()
    setElementValue : function (newValue, dataValue) {
        
        var undef;
        if (dataValue === undef) {  
            dataValue = this._value;
        }
        
        this.showValue(newValue, dataValue, this.form, this);
    },  
    
    // Have showvalue no-op by default -- documented in registerStringMethods
    showValue : function (displayValue, dataValue) {
    },
    
    //> @method canvasItem.storeValue()
	// Store a value for this form item. This method will fire standard +link{formItem.change()}
	// and +link{formItem.changed()} handlers, and store out the method passed in such that
	// subsequent calls to +link{formItem.getValue()} or +link{dynamicForm.getValue()} will return
	// the new value for this item.
	// <P>
	// For canvasItems that manipulate values and display them in some arbitrary
	// canvas representation developers should call this method when the user interacts with
	// the embedded canvas in a way that modifies the value for the item.
	// <P>
	// If you cannot easily detect changes to values in your Canvas, a workaround is to call
    // <code>storeValue</code> right before the form saves.
    // @param	value 	(any)				value to save for this item
	// @visibility external
	//<
	// Implemented at the FormItem level

    // ------------------------
    // Methods applied directly to this.canvas (fired in the scope of the canvas, not the
    // canvasItem-  use this.canvasItem to point back to the item).
    
    // set up observation of resizing
    
    _canvas_resized : function (deltaX, deltaY, reason) {
        this.Super("resized", arguments);

        // CanvasResized will cause a form redraw - only call this if we're not drag
        // resizing to avoid redrawing repeatedly during drag resize interactions.
        if (!this.dragResizing() && this.canvasItem) {
            this.canvasItem.canvasResized(deltaX, deltaY, reason);
        }
    },
    _canvas_dragResized : function () {
        this.canvasItem.canvasResized(1,1); // HACK: 
        return this.Super("dragResized", arguments);
    },
    
    _canvas_focusInNextTabElement : function (forward, mask) {
        if (isc.isA.DynamicForm(this)) {
            return this.Super("_focusInNextTabElement", arguments);
        } else 
            return this.canvasItem.form._focusInNextTabElement(forward, mask);
    },
    _canvas_getTabIndexSpan : function () {
        if (isc.isA.DynamicForm(this)) {
            return this.Super("getTabIndexSpan", arguments);
        }
        // This will go through all descendents recursively to figure out where they should
        // be in the tab-order.
        var tabStops = [];
        this.canvasItem._getCanvasTabDescendents(this, tabStops);
        var span = 0;
        for (var i = 0; i < tabStops.length; i++) {
            if (tabStops[i] == this) span +=1
            else span += tabStops[i].getTabIndexSpan();
        }
        return span
    }

    
  	//> @attr	canvasItem.canvas		(Canvas : null : [IRW])
    //
    // The canvas that will be displayed inside this item.  You can pass an instance you've 
    // already created, or its global ID as a String. You can also implement 
    // +link{CanvasItem.createCanvas()} to dynamically create the canvas when the FormItem
    // is initialized.
    // <P>
    // If <code>canvas</code> and <code>createCanvas()</code> are unspecified, the 
    // canvas for this item will be auto-created using the overrideable defaults:
    // +link{attr:CanvasItem.canvasProperties} and +link{attr:CanvasItem.canvasConstructor}
    // <P>
    // Note that +link{canvas.canvasItem} will be set on the canvas to point back to this
    // item.
    //
    //  @visibility external
	//<
	
	//> @attr canvas.canvasItem (CanvasItem : null : [IR])
	// If this canvas is being displayed in a +link{CanvasItem}, this property will be set
	// to point at the item. Otherwise this property will be null.
	// @visibility external
	//<

  	//> @attr	canvasItem.canvasConstructor		(String : "Canvas" : [IRW])
    //
    // If +link{canvasItem.canvas, this.canvas} is not specified as a canvas instance at init
    // time, a canvas will be created instead. This property denotes the class of that widget
    // (Should be set to the name of a subclass of Canvas).
    //
    //  @visibility external
	//<
    
    
    
    //> @attr	canvasItem.canvasDefaults		(Object : {} : [IRW])
    //
    // Default properties for the canvas if this.canvas is not already a canvas instance.
    //
    //  @visibility external
	//<
    
    //> @attr	canvasItem.canvasProperties		(Object : {} : [IRW])
    //
    // Properties to apply to this canvas on creation if this.canvas is not already a canvas 
    // instance.
    //
    //  @visibility external
	//<
    

    // whether to destroy our Canvas when we are destroyed.  Appropriate for most CanvasItems
    // that auto-create a Canvas.
    //
    
    //autoDestroy: false

    //showTitle:false
    
    //> @attr CanvasItem.overflow (Overflow : null : IR)
    // CanvasItems support specifying overflow for the Canvas directly on the item.
    // @visibility external
    //<
});
isc.CanvasItem.addMethods({
    init : function () {
        this.Super("init", arguments);
        this._createCanvas(this.form, this);
    },
    
    // A straight canvasItem is non-editable. Subclasses that allow editing (such as the sliderItem)
    // will override this method to return true
    
    isEditable : function () {
        return false;
    },
    
    // override _canFocus -- if our canvas is focusable, we're focusable
    _canFocus : function () {
        // If the developer explicitly marks the item as canFocus true, assume they know what
        // they're doing.
        if (this.canFocus == true) return this.canFocus;
        var canvas = this.canvas;
        if (canvas && canvas._canFocus) return canvas._canFocus();
        return false;
    },
    
    // _createCanvas    Method to ensure that the canvas for this item has been instantiated
    // with appropriate properties, and added to the containerWidget as a child.
    _createCanvas : function () {

        // CanvasItem.canvas
        // - can be defined as a live canvas instance
        // - can be defined as a properties block to turn into a live canvas
        // If this.createCanvas() is specified, this.canvas is dynamically set to the
        // result of calling that method
        // 
        // If this.canvas is still unspecified we'll use the autoChild pattern
        // (canvasConstructor, canvasDefaults, canvasProperties)
        //
        // Undocumented: The autoChild subsystem also supports dynamically getting defaults via
        // getDynamicDefaults() which would allow dynamic customization of the canvas autoChild
        // when it's auto-created.
        if (this.createCanvas != null) {
            var canvas = this.canvas;
            this.canvas = this.fireCallback("createCanvas");
            // if this.createCanvas existed but returned nothing, hang onto our original
            // canvas object
            // It could just modify it in place and we should allow that
            if (this.canvas == null) this.canvas = canvas;
        }
        
        //>DEBUG
        if (!isc.isAn.Object(this.canvas) && !this.canvasProperties && !window[this.canvas]) {

            //>EditMode
            // Visual Builder habitually creates CanvasItems which will be furnished with a canvas
            // only after insertion into the editContext (because the canvas itself also needs to 
            // be put into edit mode and added to the editContext).  We don't want the default 
            // canvas because it means we get a warning in the log about creating it, then another  
            // warning immediately that we've deleted it...
            if (isc.designTime) return;
            //<EditMode

            this.logWarn("CanvasItem: " + 
                        (this.getFieldName() ? this.getFieldName() : this.getID()) + 
                        " defined with no canvas property - creating a default " +
                        "canvas for this item.");
        }
        //<DEBUG
        
        // If the supplied canvas property is a string containing the ID of a valid Canvas 
        // object, use that Canvas object 
        if (!isc.isAn.Object(this.canvas) && isc.isA.Canvas(window[this.canvas])) {
            this.canvas = window[this.canvas]
        }

        var canvasProps = {
            // don't redraw when the form redraws - if the developer wishes to redraw this canvas
            // they will have to call redraw() on this form item, or on the Canvas directly.
            _redrawWithParent: false,
            // one time flag to suppress automatic drawing on addChild().  Very key, as a form
            // that has setItems() called on it after creation recreates all items with the
            // form already drawn.
            _dontDrawOnAddChild: true,
            
            // Always set initial tabIndex to -1. This will avoid the canvas from ever getting
            // an auto-assigned tab index and having a prev/next tab-widget.
            // Note that as part of 'setElementTabIndex()' we will explicitly assign the
            // desired tabIndex.
            tabIndex:-1,
            
            //hideUsingDisplayNone:true,

            // Hang a pointer on the canvas back to this form item.
            canvasItem: this,
            disabled: this.shouldDisableCanvas() 
        };
        canvasProps.resized = this._canvas_resized;
        canvasProps.dragResized = this._canvas_dragResized;
        
        // Have standard events on the canvas fall back through to us.
        
        
        canvasProps.handleClick = function () {
            var rv = this.Super("handleClick", arguments);
            // if this is a StatefulCanvas, rely on the 'handleActivate' path to 
            // fire the item level click handler.
            if (!isc.isA.StatefulCanvas(this) && this.canvasItem) {
                rv = this.canvasItem.handleClick() && rv;
            }
            return rv;
        }
        // handleActivate will only be called for StatefulCanvas and subclasses
        canvasProps.handleActivate = function () {
            var rv = this.Super("handleActivate", arguments);
            if (this.canvasItem) rv = this.canvasItem.handleClick() && rv;
            return rv;
        }
        
        canvasProps.handleDoubleClick = function () {
            var rv = this.Super("handleDoubleClick", arguments);
            if (this.canvasItem) rv = this.canvasItem.handleDoubleClick() && rv;
            return rv;
        }
        
        canvasProps.handleKeyPress = function () {
            var rv = this.Super("handleKeyPress", arguments);
            if (this.canvasItem) {
                // fire item.keyPress / form.itemKeyPress if we get a keyPress on the 
                // target canvas (or in fact a sub-canvas thereof).
                var itemRV = this.canvasItem._fireKeyPressHandlers(
                        this.canvasItem,
                        this.canvasItem.form,
                        isc.EH.getKey(),
                        isc.EH.getKeyEventCharacterValue()
                );
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        
        canvasProps.handleKeyDown = function (event,eventInfo) {
            var rv = this.Super("handleKeyDown", arguments);
            if (this.canvasItem) {
                var itemRV = this.canvasItem.handleKeyDown(event, eventInfo);
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        canvasProps.handleKeyUp = function (event,eventInfo) {
            var rv;
            if (this.keyUp != null) {
                rv = this.keyUp(event, eventInfo);
            }
            if (this.canvasItem) {
                var itemRV = this.canvasItem.handleKeyUp(event, eventInfo);
                if (itemRV == false) rv = false;
            }
            return rv;
        }
        
        // Override synthetic focus manipulation methods to fall back to the DF, since that
        // already manages moving focus between form items on tab / shift tab keypress when
        // the clickMask is up 
        canvasProps._focusInNextTabElement = this._canvas_focusInNextTabElement;
        
        canvasProps.getTabIndexSpan = this._canvas_getTabIndexSpan;

        // pass our datasource, if any to the CanvasItem
        if (this.dataSource) canvasProps.dataSource = this.dataSource;
        // pass on our prompt (if any) to the CanvasItem
        if (this.prompt && this.applyPromptToCanvas) canvasProps.prompt = this.prompt;
        // pass on our overflow (is specified) to the canvas.
        if (this.overflow != null) canvasProps.overflow = this.overflow;
        
        // We'll set the tabIndex on the canvas when we write out our innerHTML.
        
        
        // pass on our accessKey if appropriate
        if (this.accessKey != null) canvasProps.accessKey = this.accessKey;
        
        // pass on 'showFocused'
        if (this.showFocused != null) canvasProps.showFocused = this.showFocused;
        if (this.showFocusedAsOver != null) canvasProps.showFocusedAsOver = this.showFocusedAsOver;
        
        if (isc.isA.String(this.canvas) && window[this.canvas]) this.canvas = window[this.canvas];
        
        // if the canvas hasn't been instantiated for us, use the autoChild method to create it
        // otherwise we have to do a bunch of manual patching to achieve the same effect.
        if (!isc.isA.Canvas(this.canvas)) {
            // pick up any properties specified directly on the 'this.canvas' object
            isc.addProperties(canvasProps, this.canvas);        
            if (canvasProps.ID == null) canvasProps.ID = null;
            // since we're auto-creating it's appropriate to autoDestroy
            this.autoDestroy = true;
            
            this.addAutoChild("canvas", canvasProps, isc.Canvas, this.containerWidget);
        } else {
            // apply dynamic properties to existing canvas
            // (Call setter methods wherever necessary).
            this.canvas.setTabIndex(-1);
            if (this.applyPromptToCanvas) this.canvas.setPrompt(this.prompt);
            this.canvas.setAccessKey(this.accessKey);
            
            isc.addProperties(this.canvas, canvasProps);
            if (canvasProps.dataSource) this.canvas.bindToDataSource();
            this.canvas.setDisabled(this.shouldDisableCanvas());
            this.containerWidget.addChild(this.canvas);
        }
        
        // If we're added to a containerWidget rather than the form, and a clickMask is showing
        // we may need to unmask explicitly
        
        if (this.containerWidget != this.form) {
            if (isc.EH.clickMaskUp()) {
                var CMIDs = isc.EH.getAllClickMaskIDs();
                for (var i = CMIDs.length -1; i >= 0; i--) {
                    var parentMasked = isc.EH.targetIsMasked(this.containerWidget, CMIDs[i]);
                    if (!parentMasked) {
                        isc.EH.addUnmaskedTarget(this.canvas, CMIDs[i]);
                        // We're iterating down from the top - once a widget is over one mask it's also
                        // over any masks below that one. Therefore we don't need to keep iterating 
                        // down to the bottom adding unmasked targets.
                        break;
                    }
                }
            }
        }
        
        if (this.canvas) this.observe(this.canvas, "_focusChanged", "observer.canvasFocusChanged()");
        
        if (isc.isA.DynamicForm(this.canvas)) {
            this.observe(this.canvas, "setFocusItem", "observer.nestedFormSetFocusItem()");
        }
    },
    
    setCanvas : function (canvas) {
        if (isc.isA.Canvas(this.canvas) && this.canvas != canvas) {
            this.ignore(this.canvas, "_focusChanged");
            if (isc.isA.DynamicForm(this.canvas)) this.ignore(this.canvas, "setFocusItem");
        }
        if (canvas) this.canvas = canvas;
        this._createCanvas();
    },
    
    
    /*
    // Ensure redraw on this item redraws the Canvas.
    redraw : function (suppressCanvasRedraw) {
        // redraw the canvas before redrawing our innerHTML - allows us to calculate sizes
        // accurately, if they change.
        if (!suppressCanvasRedraw && this.canvas.isDrawn()) {
            this.canvas.redraw("canvasItem.redraw");
        }
        this.Super("redraw", arguments);
    },
    */

    
    redrawn : function (suppressCanvasRedraw) {
        this.Super("redrawn", arguments);
        var disabled = this.shouldDisableCanvas();
        if (this.canvas.isDisabled() != disabled) this.canvas.setDisabled(disabled);
    },

    // clear the pointer on this item's canvas back to this item on destroy()
    destroy : function () {
        if (this.canvas) {
            delete this.canvas.canvasItem;
            if (this.autoDestroy) this.canvas.destroy(true);
            else if (this.canvas.visibility != isc.Canvas.HIDDEN) this.canvas.hide();
        }
        return this.Super("destroy", arguments);
    },
    
    placeCanvas : function (delayed) {
        var canvas = this.canvas;
        // show or hide the Canvas according to whether this item is visible, so that showIfs work
        if (this.visible == false) {
            canvas.hide();
            
            isc.Canvas.moveOffscreen(canvas);
            return;
        }
 
        if (this.form && !this.form.isDrawn() && this.form.position == isc.Canvas.RELATIVE) {
            
            //this.logWarn("hiding Canvas during initial relative draw");
            canvas.hide();
            return;
        }

        // place the Canvas over the cell for the item

        // figure out the spacer's coordinates within the form
        var containerHandle = this.containerWidget.getClipHandle(),
            spacerParent = isc.Element.get(this.getID() + "_spacerParent");
            
        var left = isc.Element.getLeftOffset(spacerParent, containerHandle),
            top = isc.Element.getTopOffset(spacerParent, containerHandle);

        // this.logWarn("placing Canvas at: " + [left, top]);

        // place the Canvas on top of that cell
        canvas.moveTo(left, top);
        if (canvas.visibility == isc.Canvas.HIDDEN) {
            canvas.show();
        }
        

        
        if (!delayed && isc.Browser.isMac && isc.Browser.isMoz && left == 0 && top == 0) {
            isc.Timer.setTimeout({target:this, methodName:"_delayedPlaceCanvas"}, 0);
        }
    },
    
    _delayedPlaceCanvas : function () {
        this.placeCanvas(true);
    },
    
    cleared : function () {
        this.Super("cleared", arguments);
        // when a canvasItem gets cleared, ensure the canvas is cleared too
        if (this.canvas && this.canvas.isDrawn()) this.canvas.clear();
    },
    
    // ensure the canvas floats in the right place if the item is moved
    moved : function () {
        if (this.isDrawn()) this.placeCanvas();
    },

    // Sizing
    // ---------------------------------------------------------------------------------------
    

    checkCanvasOverflow : function () {
        return this.sizeCanvas(true);
    },
    
    sizeCanvas : function (firstResizePass) {
        var canvas = this.canvas;

        // if we can't overflow in the height direction, we don't need to do anything on the
        // first sizing pass
        if (firstResizePass && 
            !(canvas.overflow == isc.Canvas.VISIBLE || canvas.overflow == isc.Canvas.CLIP_H))
        {
            this.logDebug("ignoring first pass, can't overflow", "canvasItemSizing");
            return;
        }

        // get the sizes specified by layout policy
        var policyWidth = this.getInnerWidth(),
            policyHeight = this.getInnerHeight(),
            resizeWidth, resizeHeight;

        // we feed the specified height (whether it appears on the Canvas or CanvasItem) to 
        // TableResizePolicy; if we give it a pixel size it will feed that back.  If we give it
        // a variable size (percent or "*"), that size will be incorporated into sizing the row
        // as a whole and we'll get the row height back.
        
        // Note: if we're writing the title inline the space available for the canvas will be
        // reduced by the title height
        if (this.showTitle && this.getTitleOrientation() == isc.Canvas.TOP) {
            policyHeight -= this.form.getTitleHeight(this);
        }
        resizeHeight = policyHeight;

        // TableResizePolicy doesn't consider the specified width of items when determining
        // column widths.  Hence only apply the width if our width is unset or "*"
        var specifiedWidth = canvas._userWidth || this.width;
        resizeWidth = (specifiedWidth == null || specifiedWidth == "*" ? 
                       policyWidth : specifiedWidth);

        // if width is not increasing past the current overflowed size, don't try to reduce the
        // height of an height-overflowed Canvas to less than the overflowed size, because 
        // there's no reason to expect it to shrink (unless it's dirty, in which case we assume
        // it might change size)
        
        if (!canvas.isDirty() &&
            (resizeWidth == null || resizeWidth <= canvas.getVisibleWidth()) &&
            canvas.getHeight() < canvas.getVisibleHeight() && 
            resizeHeight <= canvas.getVisibleHeight()) 
        {
            this.logDebug("not applying height: " + resizeHeight + 
                          " to overflowed Canvas with height: " + canvas.getVisibleHeight(),
                          "canvasItemSizing");
            resizeHeight = null;
        }
        

        if (!isc.isA.Number(resizeWidth)) resizeWidth = null;
        if (!isc.isA.Number(resizeHeight)) resizeHeight = null;
        
        // actually call 'resizeTo' on the canvas
        this._setCanvasSize(resizeWidth,resizeHeight);

        this.logDebug("this._size: " + this._size + 
                      ", policy size: " + [policyWidth, policyHeight] +
                      ", specifiedSize: " + [specifiedWidth, canvas._userHeight || this.height] +
                      ", Resized Canvas to: " + [resizeWidth, resizeHeight],
                      "canvasItemSizing");

        // draw or redraw the Canvas so we get an accurate size
        if (!canvas.isDrawn()) {
            // skip the case where the containerWidget is undrawn (for example getting PrintHMTL of
            // an undrawn form)
            var containerDrawnState = this.containerWidget.getDrawnState();
            
            if (containerDrawnState == isc.Canvas.COMPLETE || 
                containerDrawnState == isc.Canvas.HANDLE_DRAWN) {
                    // move offscreen before draw so we don't impact the scroll height of
                    // the parent if we're not actually drawn
                    isc.Canvas.moveOffscreen(canvas);
                    canvas.draw();
            }
            
        } else canvas.redrawIfDirty("CanvasItem getting new size");
            
        var width = canvas.getVisibleWidth(),
            height = canvas.getVisibleHeight();

        this.logDebug("visible size of embedded Canvas: " + [width, height], 
                      "canvasItemSizing");
        
        // if the Canvas overflows in the height direction, set this as a minimum
        
        if (!firstResizePass) this.minHeight = null;
        else this.minHeight = height > canvas.getHeight() ? height : null;

        // policyHeight is the space allocated to the row(s) this Canvas spans.  If we've
        // exceeded the space that table sizing policy allocated to our row(s), the policy will
        // need to be rerun, in order to reallocate space among other items that can flex.
        // Note: doesn't matter if we've exceeded width; our width isn't taken into account by
        // the policy.
        // Note: doesn't matter whether the Canvas has actually overflowed it's own specified
        // size, which might be much smaller; eg a button next to a TextArea doesn't need to be
        // as tall as the TextArea.
        if (height > policyHeight) return true;
    },
    
    _setCanvasSize : function (resizeWidth, resizeHeight) {
        this._resizingCanvas = true;
        this.canvas.resizeTo(resizeWidth, resizeHeight);
        this._resizingCanvas = false;
    },
    
    // Rather than embedding HTML for the canvas into the form, we write out a spacer of the
    // appropriate size, and float the Canvas over it.
    getElementHTML : function (value) {
        var canvas = this.canvas;
        
        // Exception: If we're printing, write the printHTML for our canvasItem directly into
        // the item
        
        if (canvas && this._isPrinting()) {
            
            return canvas.getPrintHTML(this.containerWidget.currentPrintProperties);
        }

        // size the Canvas to the final size determined by the resize policy
        this.sizeCanvas();
        
        // Ensure that the canvas has it's tab index written out as specified
        this._setElementTabIndex(this.getGlobalTabIndex());

        
        return "<SPAN style='padding:0px;margin:0px;' ID='" + this.getID() + "_spacerParent'>" 
                + isc.Canvas.spacerHTML(canvas.getVisibleWidth(), canvas.getVisibleHeight()) 
                + "</SPAN>";
    },
    
    
    _applyHandlersToElement : function () {
        this._setUpIconEventHandlers();
    },
        
    
    // return specified widths (which can be %s or *s), whether they appear on the Canvas or
    // CanvasItem, to be fed to the table resize policy.  If there is no specified size, feed
    // the layout policy our default height.
    getHeight : function (reportOverflowedSize) {
        var canvas = this.canvas;
        if (reportOverflowedSize) {
            var visibleHeight = canvas.getVisibleHeight();
            if (visibleHeight > canvas.getHeight()) return visibleHeight;
        }
        return this.canvas._userHeight || this.height || this.canvas.defaultHeight;
    },

    getWidth : function () {
        return this.canvas._userWidth || this.width || this.canvas.defaultWidth;
    },
    
    // if the Canvas is resized by the user or programmatically outside of CanvasItem's layout
    // code, 
    canvasResized : function (deltaX, deltaY, reason) {
        if (this._resizingCanvas) return;
        
        var canvas = this.canvas,
            newWidth = canvas.getWidth(),
            newHeight = canvas.getHeight();

        if (!canvas.isDrawn()) return;

        
        if (reason != "overflow" && reason != "Overflow on initial draw") {
            if (deltaX != null && deltaX != 0) canvas._userWidth = newWidth;
            if (deltaY != null && deltaY != 0) canvas._userHeight = newHeight;
        }

        this.logDebug("canvas resized: new specified sizes: " + [newWidth, newHeight],
                      "canvasItemSizing");
        // redraw to change size
        this.redraw();
    },

    // shouldDisableCanvas - should we explicitly mark this items canvas as disabled
    // true if the item is disabled or read-only
    
    shouldDisableCanvas : function () {
        return this.disabled == true || this.isReadOnly();
    },
    
    // override 'updateDisabled()' to disable the canvas
    updateDisabled : function () {
        this.Super("updateDisabled", arguments);
        this.canvas.setDisabled(this.shouldDisableCanvas());
    },
    
    // override 'updateCanEdit()' to simulate read-only state on the canvas by
    // disabling canvas but leaving item enabled so title doesn't use disabled state.
    updateCanEdit : function () {
        this.Super("updateCanEdit", arguments);
        this.canvas.setDisabled(this.shouldDisableCanvas());
    },

    // Update enabled/disabled state of the element to match our read-only/disabled state.
    // This avoids a complete redraw when changing read-only state.
    setElementReadOnly : function () {
        this._setElementEnabled(!this.isReadOnly() && !this.isDisabled());
    },

    // Override _setElementTabIndex() to update the tabindex of the canvas (and avoid redrawing
    // the form)
    _setElementTabIndex : function (index) {
        this._setCanvasTabIndex(index);
    },
    
    _getCanvasTabDescendents : function (canvas, targetArray) {
        // If a CanvasItem contains a DF which contains another CanvasItem, we already
        // manage the tab-index of the form - no need to attempt to directly manage
        // the tabIndex of canvii embedded in it via canvasItems!
        if (canvas.canvasItem != null && canvas.canvasItem != this) return;
        targetArray.add(canvas);
        var children = canvas.members || canvas.children || {};
        for (var i = 0; i < children.length; i++) {
            this._getCanvasTabDescendents(children[i], targetArray);
        }
    },
    
    _setCanvasTabIndex : function (index) {
        //this.logWarn(this.name + " setCanvasTabIndex running - index:" + index);
        var canvas = this.canvas,
            widgets = [];
        if (canvas) this._getCanvasTabDescendents(canvas, widgets);
        
        for (var i = 0; i < widgets.length; i++) {
            canvas = widgets[i];
            
            // clears any pointers to prev/next in auto-tab-order
            canvas._removeFromAutoTabOrder();
            // use the internal method so we don't hit the user-specified tabIndex ceiling
            //this.logWarn("assigning:" + index + " to " + canvas);            
            canvas._setTabIndex(index, false);
            // increment
            
            index += canvas == this.canvas ? 1 : canvas.getTabIndexSpan();
        }
    },
    
    // Override focusInItem / blurFocusItem to actually put focus into the canvas
    focusInItem : function (focusAtEndDirection) {
        if (this.canvas) {
            // We may be marked as canFocus:true and have a 'canvas' thats not explicitly
            // focusable but has focusable descendants. 
            var targets = [],
                canvas;
            this._getCanvasTabDescendents(this, targets);
            var start = focusAtEndDirection == false ? targets.length-1 : 0,
                end = focusAtEndDirection == false ? 0 : targets.length-1,
                step = focusAtEndDirection == false ? -1 : 1;
            for (var i = start; focusAtEndDirection ? i >= end : i <= end; i+=step) {
                if (targets[i]._canFocus()) {
                    canvas = targets[i];
                    break;
                }
            }
            if (canvas) {
                if (focusAtEndDirection != null) {
                    this.canvas.focusAtEnd(focusAtEndDirection);
                } else {
                    this.canvas.focus();
                }
            }
        }
        return this.Super("focusInItem", arguments);
    },
    
    blurItem : function () {
        if (this.canvas) this.canvas.blur();
        return this.Super("blurItem", arguments);
    },
    
    // observation of focusChanged on the Canvas
    
    canvasFocusChanged : function () {
        if (this.canvas.hasFocus) {
            this.form.setFocusItem(this);
            this.elementFocus();
        } else this.elementBlur();
    },
    
    
    nestedFormSetFocusItem : function () {
        this.form.setFocusItem(this);
    },
    
    //> @method canvasItem.hasAdvancedCriteria()
    // Overridden to return true if +link{canvasItem.canvas} is a dynamicForm.
    // See +link{getCriterion()} for details of editing advanced criteria using nested
    // dynamicForms.
    // @return (boolean) true if this item's canvas is a DynamicForm
    // @group criteriaEditing
    // @visibility external
    //<
    hasAdvancedCriteria : function () {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) return true;
        return this.Super("hasAdvancedCriteria", arguments);
    },

    //> @method canvasItem.canEditCriterion()
    // AdvancedCriteria objects may be edited via nested dynamicForms as described in
    // +link{canvasItem.getCriterion()}
    // <P>
    // This method has been overridden to return true if this item's canvas is a DynamicForm,
    // where the +link{dynamicForm.operator} matches the operator of the criterion passed in
    // and dynamicForm contains items where +link{formItem.canEditCriterion()} returns true
    // for each sub-criterion in the object passed in.
    // @param criterion (Criterion) criteria to test
    // @return (boolean) returns true if the specified criterion may be edited by this item
    // @group criteriaEditing
    // @visibility external
    //<
    canEditCriterion : function (criterion) {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            if (criterion.operator != this.canvas.operator) return false;
            //this.logWarn("going to compare criterion:" + this.echo(criterion) + " with form: " +
            //    this.canvas);
            for (var i = 0; i < criterion.criteria; i++) {
                var items = this.canvas.getItems(),
                    foundItem;
                for (var ii = 0; ii < items.length; ii++) {
                    if (items[ii].canEditCriterion(criterion.criteria[i])) {
                        //this.logWarn("item:" + items[ii] + " can edit:" + this.echo(criterion.criteria[i]));
                        foundItem = true;
                        break;
                    }
                }
                //this.logWarn("found item:" + foundItem + " for criterion:" + this.echo(criterion.criteria[i]));
                if (!foundItem) return false;
            }
            return true;
        }
        return this.Super("canEditCriterion", arguments);
    },
    
    //> @attr canvasItem.editCriteriaInInnerForm (boolean : true : IRA)
    // Flag to disable the criteria editing overrides described in +link{getCriterion()} whereby
    // if this item contains a DynamicForm as its canvas, it will be used to edit nested
    // AdvancedCriteria automatically.
    // <P>
    // This flag is required for cases where a canvasItem contains a DynamicForm, but the form
    // is not set up to show inner field values of nested objects, and therefore should not
    // attempt to apply nested advanced criteria directly to the form.
    //
    // @visibility external
    //<
    // This is required for the RelativeDateItem. It's quite likely to be required for 
    // developer-defined canvasItems too. For simple items where the form just displays an atomic
    // field value in some custom way, setting this flag will be sufficient to get simple
    // operator-based advanced criteria editing working. If the inner form does something more
    // complex, developers would potentially need to override hasAdvancedCriteria, getCriterion, etc
    editCriteriaInInnerForm:true,

    //> @method canvasItem.getCriterion()
    // The standard formItem criteria editing APIs have been overridden in the canvasItem class
    // to simplify the editing of complex +link{AdvancedCriteria} objects using nested 
    // DynamicForms.
    // <P>
    // The following pattern is supported without need for further modification:<br>
    // A complex Advanced criteria object may have nested sub criteria using the <code>"and"</code>
    // or <code>"or"</code> operators. For example:
    // <pre>
    // { _constructor:"AdvancedCriteria",
    //   operator:"and",
    //   criteria:[
    //      {fieldName:"field1", value:"value1", operator:"iContains"},
    //      {operator:"or", criteria:[
    //          {fieldName:"innerField1", value:"value1", operator:"equals"},
    //          {fieldName:"innerField2", value:"value2", operator:"iContains"}
    //       ]
    //      }
    //   ]
    // }
    // </pre>
    // To create a form capable of editing the above criteria without providing custom overrides
    // to +link{formItem.getCriterion()} et al, you would create a form with 2 items.
    // The 'field1' criterion could be edited by a simple form item such as a TextItem.
    // The nested criteria ('innerField1' and 'innerField2') could be edited by a canvasItem
    // whose canvas property was set to a DynamicForm showing items capable of editing the 2
    // inner criteria, and whose operator was specified as "or".<br>
    // For example:
    // <pre>
    //  isc.DynamicForm.create({
    //      items:[
    //          {name:"field1", type:"TextItem"},
    //          {name:"nestedItem", shouldSaveValue:true, type:"CanvasItem",
    //              canvas:isc.DynamicForm.create({
    //                  operator:"or",
    //                  items:[
    //                      {name:"innerField1", type:"TextItem", operator:"equals"},
    //                      {name:"innerField2", type:"TextItem"}
    //                  ]
    //              })
    //          }
    //      ]
    //  });
    //  </pre>
    // This form would be able to edit the above advanced criteria object via
    // +link{dynamicForm.setValuesAsCriteria()}. Edited values would be retrieved via
    // +link{dynamicForm.getValuesAsCriteria()}.
    // <P>
    // Note that the canvas item has <code>shouldSaveValue</code> set to true - this is required
    // to ensure the nested form is actually passed the values to edit. 
    // <P>
    // The default implementation of this method checks for this.canvas being specified as a
    // dynamicForm, and in that case simply returns the result of 
    // +link{dynamicForm.getValuesAsAdvancedCriteria()} on the inner form.
    // <P>
    // Note that this functionality may be entirely bypassed by
    // setting +link{editCriteriaInInnerForm} to false. This flag is useful when defining a
    // dynamicForm based canvasItem which is not intended for editing nested data -- for example
    // if a standard atomic field value is being displayed in some custom way using a
    // DynamicForm embedded in the item.
    // 
    // @return (Criterion) criterion to merge with advanced criteria returned by 
    //  +link{dynamicForm.getValuesAsCriteria()}
    // @group criteriaEditing
    // @visibility external
    //<
    getCriterion : function () {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            return this.canvas.getValuesAsAdvancedCriteria();
        } else return this.Super("getCriterion", arguments);
    },
    
    //> @method canvasItem.setCriterion()
    // Display a +link{criterion} object in this item for editing. Overridden from 
    // +link{formItem.setCriterion()} in order to support editing nested criteria using 
    // nested dynamicForms as described in +link{canvasItem.getCriterion()}.
    // <P>
    // Implementation checks for this.canvas being specified as a DynamicForm, and applies
    // criterion directly to the embedded form via setValuesAsCriteria()
    // @param criterion (Criterion) criteria to edit
    // @group criteriaEditing
    // @visibility external
    //<
    setCriterion : function (criterion) {
        if (this.editCriteriaInInnerForm && isc.isA.DynamicForm(this.canvas)) {
            this.canvas.setValuesAsCriteria(criterion, true);
        } else return this.Super("setCriterion", arguments);
    },
    
    // we copy the prompt onto the Canvas by default - override setPrompt to do the same at runtime
    
    //> @attr canvasItem.applyPromptToCanvas (boolean : true : IRW)
    // If +link{formItem.prompt} is specified for this item, should the prompt be applied to the
    // +link{canvasItem.canvas} for this item?
    // @visibility external
    //<
    applyPromptToCanvas:true,
    
    //> @attr canvasItem.prompt (string : null : IRW)
    // @include FormItem.prompt
    // @visibility external
    //<
    
    //>@method canvasItem.setPrompt()
    // Set the +link{formItem.prompt} for this item. Default implementation will also apply the
    // prompt to +link{canvasItem.canvas} if +link{canvasItem.applyPromptToCanvas} is true.
    // @param prompt (string) new prompt for the item.
    // @visibility external
    //<
    setPrompt : function (prompt) {
        this.Super("setPrompt", prompt);
        if (this.applyPromptToCanvas && this.canvas) {
            if (isc.isA.Canvas(this.canavs)) this.canvas.setPrompt(prompt);
            else this.canvas.prompt = prompt;
        }
    }
});

isc.CanvasItem.registerStringMethods({
    //> @method canvasItem.createCanvas ()
    // This method allows dynamic creation of a CanvasItem's canvas, rather than
    // setting +link{CanvasItem.canvas} statically.
    // If specified this +link{stringMethod} will be called when the form item is 
    // initialized and should return the Canvas to display for this item.
    // @param form (DynamicForm) the dynamicForm in which this item is contained
    // @param item (CanvasItem) the live form item instance
    // @return (Canvas) the canvas to be rendered inside this CanvasItem
    // @visibility external
    //<
    createCanvas:"form,item",
    
    
    //> @method canvasItem.showValue()
    // This method will be called whenever this form item's value is being set via a programmatic
    // call to e.g: +link{dynamicForm.setValues()} or +link{formItem.setValue()} and may be
    // overridden by CanvasItems intended to support displaying data values to update the
    // embedded Canvas to reflect the value passed in.
    // @param displayValue (any) new display-value for the item. This is the value after applying
    //   any custom formatter or valueMap
    // @param dataValue (any) underlying data value for the item
    // @param form (DynamicForm) the dynamicForm in which this item is contained
    // @param item (CanvasItem) the live form item instance
    // @visibility external
    //<
    showValue:"displayValue,dataValue,form,item"
});
