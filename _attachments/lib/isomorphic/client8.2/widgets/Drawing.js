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







//------------------------------------------------------------------------------------------
//  detect native drawing capabilities by browser version
//------------------------------------------------------------------------------------------
isc.Browser.hasCANVAS = isc.Browser.geckoVersion >= 20051107 || isc.Browser.safariVersion >= 181
                        || ((isc.Browser.isIE && isc.Browser.version >= 9) && (typeof(document.createElement('canvas').getContext) === 'function'));
isc.Browser.hasSVG = isc.Browser.geckoVersion >= 20051107; // || isc.Browser.safariVersion >= ???

isc.Browser.hasVML = isc.Browser.isIE && isc.Browser.version >= 5;
isc.Browser.defaultDrawingType = 
                              //isc.Browser.hasSVG ? "svg" :
                              isc.Browser.hasCANVAS ? "bitmap" :
                              isc.Browser.hasVML ? "vml" :
                              "none";



//------------------------------------------------------------------------------------------
//> @class DrawPane
//
// Container for DrawLine, DrawOval, DrawPath, and other DrawItem-based components. These components
// provide consistent cross-browser APIs for rendering shapes using using the browsers' built in
// vector graphics capabilities. These include
// <code>SVG (Scalable Vector Graphics)</code> where available, <code>VML (Vector Markup
// Language)</code> for Microsoft browsers, and the HTML5 <code>&lt;canvas&gt;</code> tag.
// <P>
// You can use any of the following approaches to create DrawPanes and DrawItems:
// <P>
// <dl>
// <dt>DrawPane only</dt>
// <dd> Create a DrawPane with drawItems set to an array of DrawItem instances or DrawItem
// declaration objects, and it will manage those DrawItems. </dd>
// <dt>DrawItem only</dt>
// <dd> Create and draw a DrawItem, and it will use a default DrawPane, which you can
//      access via the drawPane property, eg myDrawItem.drawPane.bringToFront().</dd>
// <dt>Both</dt>
// <dd>Create DrawPanes with or without initial drawItems, then create DrawItems
//     with their drawPane property set to an existing DrawPane instance.</dd>
// </dl>
//
// <var class="smartgwt"><p>To use DrawPane in SmartGWT, include the Drawing module
// in your application by including <code>&lt;inherits name="com.smartgwt.Drawing"/&gt;</code>
// in your GWT module XML. </p></var>
//
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------



isc.defineClass("DrawPane", "Canvas").addProperties({

drawingType: isc.Browser.defaultDrawingType, // vml, bitmap, svg, none

// enable drag scrolling by default
canDrag: false,
cursor: "all-scroll",

// allows the DrawPane to be placed above other widgets and not interfere with finding drop
// targets
isMouseTransparent: true, 

//> @attr drawPane.rotation (float : 0 : IRW)
// Rotation for the DrawPane as a whole, in degrees.  Applied to all DrawItems.
// @setter drawPane.rotate()
// @visibility drawing
//<
rotation:0,

//> @attr drawPane.zoomLevel (float : 1 : IRW)
// Zoom for the drawPane as a whole, where 1 is normal size.  Applied to all DrawItems.
// @setter drawPane.zoom()
// @visibility drawing
//<
zoomLevel: 1, 

translate: null,

// internal map from gradient id to gradients (gradients can be shared across drawItems)
gradients: {},

//> @attr drawPane.drawItems (Array of DrawItem : null : IR)
// Array of DrawItems to initially display in this DrawPane.
// @visibility drawing
//<

//canvasItems - array of Canvii that should be zoomed and panned with this DrawPane

//> @object ColorStop
// An object containing properties that is used in Gradient types
//
// @visibility drawing
//<
//> @attr colorStop.offset (float: 0.0: IR) 
// The relative offset for the color.
//
// @visibility external
//<
//> @attr colorStop.opacity (float: 1.0: IR) 
// 0 is transparent, 1 is fully opaque
//
// @visibility external
//<
//> @attr colorStop.color (CSSColor: null: IR) 
// eg #ff0000 or red or rgb(255,0,0)
//
// @visibility external
//<

//> @object Gradient
// An abstract class which holds an Array of ColorStop or start/stop colors.
//
// @visibility drawing
//<
//> @attr gradient.colorStops (Array of ColorStop: null: IR)
//
// @visibility drawing
//<
//> @attr gradient.startColor (CSSColor: null: IR)
// if both startColor and endColor are set then colorStops is ignored
//
// @visibility drawing
//<
//> @attr gradient.endColor (CSSColor: null: IR) 
// if both startColor and endColor are set then colorStops is ignored
//
// @visibility drawing
//<

//> @object SimpleGradient
// An derived class which is used for simple gradient definitions that only requires 2 colors and a direction
//
// @inheritsFrom Gradient
// @visibility drawing
//<
//> @attr simpleGradient.direction (float: 0.0: IR) 
//Direction vector in degrees
//
//@visibility drawing
//<
//> @attr simpleGradient.startColor (String: null: IR) 
//The color at the start of the gradient.
//
//@visibility drawing
//<
//> @attr simpleGradient.endColor (String : null : IR) 
//The color at the end of the gradient.
//
//@visibility drawing
//<

//> @object LinearGradient
// An ordinary JavaScript object containing properties that describe a linear gradient
//
// @inheritsFrom Gradient
// @visibility drawing
//<
//> @attr linearGradient.x1 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.y1 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.x2 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.y2 (String: null: IR)
//
// @visibility drawing
//<

//> @object RadialGradient
// An ordinary JavaScript object containing properties that describe a radial gradient
//
// @inheritsFrom Gradient
// @visibility drawing
//<
//> @attr radialGradient.cx (String: null: IR) 
// x coordinate of outer radial
//
// @visibility drawing
//<
//> @attr radialGradient.cy (String: null: IR) 
// y coordinate of outer radial
//
// @visibility drawing
//<
//> @attr radialGradient.r  (String: null: IR) 
// radius
//
// @visibility drawing
//<
//> @attr radialGradient.fx (String: null: IR) 
// x coordinate of inner radial
//
// @visibility drawing
//<
//> @attr radialGradient.fy (String: 0: IR) 
// y coordinate of inner radial
//
// @visibility drawing
//<

//> @object Shadow
//A class used to define a shadow used in a Draw<Shape> Types.
//
// @visibility drawing
//<
//> @attr shadow.color (CSSColor: black: IR) 
//
//@visibility drawing
//<
//> @attr shadow.blur (int: 10: IR) 
//
//@visibility drawing
//<
//> @attr shadow.offset (Point: [0,0]: IR) 
//
//@visibility drawing
//<

createQuadTree : function () {
    this.quadTree = isc.QuadTree.create({
        depth: 0,
        maxDepth: 50,
        maxChildren: 1
    });
    this.quadTree.bounds = {x:0,y:0,width:this.getInnerContentWidth(),height:this.getInnerContentHeight()};
    this.quadTree.root = isc.QuadTreeNode.create({
        depth: 0,
        maxDepth: 8,
        maxChildren: 4
    });
    this.quadTree.root.bounds = this.quadTree.bounds;
},

updateQuadTree : function (shape) {
    this.quadTree.update(shape.item);
},

initWidget : function () {
    this.drawItems = this.drawItems || [];
    this.canvasItems = this.canvasItems || [];
    this.createQuadTree();
    for (var i = 0; i < this.drawItems.length; i++) {
        this.addDrawItem(this.drawItems[i]);
    }
    for (var i = 0; i < this.canvasItems.length; i++) {
        this.addCanvasItem(this.canvasItems[i]);
    }
    // don't redraw with SVG or VML or we'll wipe out the DOM elements DrawItems use
    this.redrawOnResize = (this.drawingType=="bitmap"); 

    // initialize internal viewbox properties for global pan/zoom operations
    // see getInnerHTML(), _setViewBox()
    this._viewPortWidth = this.getInnerContentWidth();
    this._viewPortHeight = this.getInnerContentHeight();
    this._viewBoxLeft = 0;
    this._viewBoxTop = 0;
    this._viewBoxWidth = this._viewPortWidth;
    this._viewBoxHeight = this._viewPortHeight;
    
    if (isc.Browser.isIE && this.drawingType == "vml") {
        document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            this.startTagVML = function (tagName) {
                return '<rvml:' + tagName + ' class="rvml" ';
            };
            this.endTagVML = function (tagName) {
                return '</rvml:' + tagName + '>';
            };

        } catch (e) {
            this.startTagVML = function (tagName) {
                return '<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml" ';
            };
            this.endTagVML = function (tagName) {
                return '</rvml:' + tagName + '>';
            };
        }
    }
},
normalize : function (x, y) {
    if(this.zoomLevel != 1 || this.rotation != 0) {
        var rotation = -this.rotation*Math.PI/180.0;
        var xprime = x - this.width/2;
        var yprime = y - this.height/2;
        var xprime2 = xprime*Math.cos(rotation)-yprime*Math.sin(rotation);
        var yprime2 = xprime*Math.sin(rotation)+yprime*Math.cos(rotation);
        xprime2 /= this.zoomLevel;
        yprime2 /= this.zoomLevel;
        xprime2 += this.width/2;
        yprime2 += this.height/2;
        return {x:xprime2,y:yprime2};
    } 
    return {x:x,y:y};
},
getDrawItem: function (x,y) {
    x -= this.getPageLeft();
    y -= this.getPageTop();
    var normalized = this.normalize(x, y);
    x = normalized.x;
    y = normalized.y;
    var  items = this.quadTree.retrieve({x:x,y:y});
    var itemslength = items ? items.length : 0;
    if(itemslength) {
        for(var i = 0; i < itemslength; ++i) {
            var item = items[i].item || items[i];
            var initem = !item.shape.hidden && item.shape.isPointInPath(x,y);
            if(initem) {
                return item.shape;
            }
        }
    }
    return this;
},
getEventTarget: function (scEvent) {
    switch(scEvent.eventType) {
        case 'mouseUp':
        case 'mouseDown':
        case 'mouseMove':
        case 'mouseOut':
        case 'mouseOver':
        case 'click':
            return this.getDrawItem(scEvent.x,scEvent.y);
        default:
            return this;
    }
    return this;
},
prepareForDragging: function () {
    if(this.canDrag) {
        var item = this.getDrawItem(isc.EH.lastEvent.x,isc.EH.lastEvent.y);
        if(item && item.canDrag) {
            isc.EH.dragTarget = item;
            isc.EH.dragOperation = "drag";
        }
    }
    return true;
},
clear : function () {
    this.Super("clear", arguments);
    // wipe the "_drawn" flag from our draw items
    // if we are drawn again, we'll call 'draw()' on each item to re-show as part of drawChildren()
    
    if (this.drawItems != null) {
        this.drawItems.setProperty("_drawn", false);
    }
    if (this.drawingType == "bitmap") {
        this._bitmapContext = null; // clear the cached bitmap context handle
    }
},
// private method for quadtree debug 
drawBounds : function(node) {
    isc.DrawRect.create({
      autoDraw:true,
      drawPane:this,
      left:Math.round(node.bounds.x),
      top:Math.round(node.bounds.y-node.bounds.height),
      width:Math.round(node.bounds.width),
      height:Math.round(node.bounds.height)
    },{
      lineColor:"#FF0000",
      lineOpacity:0.1,
      lineWidth:1,
      linePattern:"solid"
    });
    if(node.nodes && node.nodes.length) {
        for(var i = 0; i < node.nodes.length; ++i) {
          this.drawBounds(node.nodes[i]);
        }
    }
},

//> @method drawPane.erase()
// Call +link{DrawItem.erase()} on all DrawItems currently associated with the DrawPane.  
// <P>
// The DrawItems will continue to exist, and you can call draw() on them to make them appear again, or
// +link{drawItem.destroy,destroy} to get rid of them permanetly.  Use +link{destroyAll()} to permanently
// get rid of all DrawItems.
//
// @visibility drawing
//<
erase : function (destroy) {
    if (destroy) {
        for (var i = 0; i < this.drawItems.length; i++) {
            this.drawItems[i].destroy(true); // pass destroyingAll flag to prevent extra redraws
        }
    } else if (this.isDrawn()) {
        for (var i = 0; i < this.drawItems.length; i++) {
            this.drawItems[i].erase(true); // pass erasingAll flag to prevent extra redraws
        }
    }
    this.drawItems = [];
    this.canvasItems = [];
    this.createQuadTree();
    if (this.drawingType == "bitmap") this.redrawBitmap();
},

//> @method drawPane.destroyItems()
// Permanently +link{drawItem.destroy,destroy} all DrawItems currently associated with this DrawPane,
// leaving the DrawPane itself intact
// @visibility drawing
//<
destroyItems : function () {
    this.erase(true);
},

destroy : function () {
    this.Super("destroy", arguments);
    for (var i = 0; i < this.drawItems.length; i++) {
        this.drawItems[i].destroy(); 
    }
},

//> @method drawPane.addDrawItem()
// Add a drawItem to this drawPane (if necessary removing it from any other drawPanes)
// @param item (DrawItem) drawItem to add
// @param autoDraw (boolean) If explicitly set to false, and this drawPane is drawn, don't draw
//   the newly added item
// @visibility drawing
//<
addDrawItem : function (item, autoDraw) {
    if (item.drawPane == this) return;
    
    if (item._drawn) item.erase();
    item.drawPane = this;
    
    if (!this.drawItems.contains(item)) this.drawItems.add(item);
    
    if (autoDraw == null) autoDraw = true;
    if (autoDraw && this.isDrawn()) {
        item.draw();
    }
},

getInnerHTML : function () {
    var type = this.drawingType;
    if (type == "vml") {
        // Would be nice to write out the VML behavior definition here, but the style block is
        // not parsed when drawn into a canvas after page load? if there is some way to do this,
        // the style definition is <style>VML\:* {behavior:url(#default#VML);}</style>
        // For now, just writing an outermost group that we can use for zoom and pan. Note
        // that this group needs a unique ID, since multiple DrawPanes may be instantiated on
        // the same page.
        // NB: need to at least wipe out the &nbsp, which pushes all shapes right by a few pixels
        // TODO/TEST - IIRC VML is supposed to define an implicit viewbox, but experts on MSDN
        //  articles have said that it is unpredictable, so we explicitly set it to the available
        //  space in the drawpane here. A 1-1 mapping of screen pixels and vector coordinates will
        //  limit precision/resolution of scalable drawings, though. We might want to set a
        //  higher resolution coordsize here and apply scaling to all drawing operations, not sure,
        //  but something to keep in mind if we see scaling artifacts or other pixel-level
        //  problems. For some more info on the coordinate space, see:
        //  http://msdn.microsoft.com/en-us/library/bb250511.aspx
        var innerContentWidth = this.getInnerContentWidth();
        var innerContentHeight = this.getInnerContentHeight();
        return this.startTagVML('GROUP') + " ID='" +
                this.getID() + "_vml_box' STYLE='position:absolute;left:5px;top:5px;width:" +
                innerContentWidth + "px; height:" + innerContentHeight + "px;rotation:" + (this.rotation) +
                ";' coordsize='" + innerContentWidth + ", " + innerContentHeight +
                "' coordorig='0 0'>" + this.endTagVML('GROUP');

    } else if (type == "bitmap") {
        return "<CANVAS ID='" + this.getID() + "_bitmap'" +
               " WIDTH='" + this.getWidth() +
               "' HEIGHT='" + this.getHeight() +
               "'></CANVAS>"; // Firefox *requires* a closing CANVAS tag
    } else if (type == "svg") {
        // iframed svg document
        return "<IFRAME HEIGHT='100%' WIDTH='100%' SCROLLING='NO' FRAMEBORDER='0' SRC='" +
            isc.Page.getHelperDir() + "DrawPane.svg?isc_dp_id=" + this.getID() +"'></IFRAME>"
    } else {
        this.logWarn("DrawPane getInnerHTML: '" + type + "' is not a supported drawingType");
        return this.Super("getInnerHTML", arguments);
        // TODO implement alternate rendering/message when no drawing technology is available
    }
},

getPrintHTML : function () {
    if (this.drawingType == "bitmap") {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        return "<img src='" + canvas.toDataURL()+"' width='" + this.getWidth() + 
            "' height='" + this.getHeight() + "' />";
    } else if (this.drawingType == "vml") {
        var vml_box = document.getElementById(this.getID() + "_vml_box");
        return vml_box.parentElement.innerHTML;
    } else if (this.drawingType == "svg") {
        var s = new XMLSerializer();
        var xmlString = s.serializeToString(this._svgBox);
        var svgDefsXml = s.serializeToString(this._svgDefs);
        return "<svg>" + xmlString + svgDefsXml + "</svg>";
    } else {
    	return "";
    }
},

// Override drawChildren to render out our drawItems
drawChildren : function () {
    this.Super("drawChildren", arguments);
    for (var i = 0; i < this.drawItems.length; i++) {
        var drawItem = this.drawItems[i];
        drawItem.draw();
    }
},

getBitmapContext : function () {
    if (this._bitmapContext) return this._bitmapContext;
    this._bitmapHandle = isc.Element.get(this.getID() + "_bitmap");
    if (!this._bitmapHandle) {
        this.logWarn("DrawPane failed to get CANVAS element handle");
        return;
    }
    this._bitmapContext = this._bitmapHandle.getContext("2d");
    if (!this._bitmapContext) {
        this.logWarn("DrawPane failed to get CANVAS 2d bitmap context");
        return;
    }
    return this._bitmapContext;
},


redraw : function (reason) {
    // in Canvas mode, redraw the <canvas> tag to resize it
    if (this.drawingType == "bitmap") {
        // do normal redraw to resize the <canvas> element in our innerHTML
        this.Super("redraw", arguments);    
        this._bitmapContext = null; // clear the cached bitmap context handle
        this.redrawBitmapNow();
    }
    // otherwise ignore: don't want to lose the SVG or VML DOM
},


redrawBitmap : function () {
    // defer redraw until end of current thread
    if (this._redrawPending) return;
    isc.Timer.setTimeout({target:this, methodName:"redrawBitmapNow"}, 0);
    this._redrawPending = true;
},


redrawBitmapNow : function () {
    if (!this.isDrawn()) return; // clear()d during redraw delay

    this._redrawPending = false; // clear this now in case an individual DrawItem rendering fails
    var context = this.getBitmapContext();
    if (!context) return; // getBitmapContext has already logged this error
    var canvas = document.getElementById(this.getID() + "_bitmap");
    canvas.width = canvas.width;
    context.clearRect(0, 0, this.getWidth(), this.getHeight());
    // this loop is duplicated in drawGroup.drawBitmap() to render nested drawItems
    for (var i=0; i<this.drawItems.length; i++) {
        if (!this.drawItems[i].hidden) {
            this.drawItems[i].drawBitmap(context);
        }
    }
},

//> @method drawPane.drawing2screen() (A)
// Convert global drawing coordinates to screen coordinates, accounting for global zoom and pan.
// Takes and returns a rect in array format [left, top, width, height].
// Use this to synchronize non-vector elements (eg Canvii that provide interactive hotspots;
// DIVs that render text for VML DrawPanes) with the vector space.
// <P>
// <i>NB: this takes global drawing coordinates; be sure to convert from local
//     (DrawGroup translation hierarchy) coordinates first if necessary</i>
// @param drawingRect (array) 4 element array specifying drawing coordinates in format 
//                  <code>[left, top, width, height]</code>
// @return (array) 4 element array specifying screen coordinates, in format
//                  <code>[left, top, width, height]</code>
//<
drawing2screen : function (drawRect) {
    return [
        Math.round((drawRect[0] - this._viewBoxLeft) * this.zoomLevel),
        Math.round((drawRect[1] - this._viewBoxTop) * this.zoomLevel),
        Math.round(drawRect[2] * this.zoomLevel),
        Math.round(drawRect[3] * this.zoomLevel)
    ]
},

//> @method drawPane.screen2Drawing() (A)
// Convert screen coordinates to global drawing coordinates, accounting for global zoom and pan.
// Takes and returns a rect in array format [left, top, width, height].
// Use this to map screen events (eg on transparent Canvas hotspots) into the vector space.
// <P>
// <i>NB: this returns global drawing coordinates; be sure to convert to local
//     (DrawGroup translation hierarchy) coordinates if necessary</i>
// @param screenRect (array) 4 element array specifying screen coordinates in format 
//                  <code>[left, top, width, height]</code>
// @return (array) 4 element array specifying drawing coordinates, in format
//                  <code>[left, top, width, height]</code>
//<
screen2drawing : function (screenRect) {
    //!DONTOBFUSCATE
    return [
        screenRect[0] / this.zoomLevel + this._viewBoxLeft,
        screenRect[1] / this.zoomLevel + this._viewBoxTop,
        screenRect[2] / this.zoomLevel,
        screenRect[3] / this.zoomLevel
    ]
},

// Define the region within the drawing space (the "viewbox") that should be scaled to fit in the
// current visible area (the "viewport"), effectively panning and/or zooming the drawPane.
// zoom() and pan() call through this method to get the job done.
_setViewBox : function (left, top, width, height) {
    var type = this.drawingType;

    // save the new viewbox coordinates
    this._viewBoxLeft = left;
    this._viewBoxTop = top;
    this._viewBoxWidth = width;
    this._viewBoxHeight = height;
    // update items and item properties that are not affected by the viewbox transformation,
    // or that need to be corrected because of the viewbox transformation
    this._updateItemsToViewBox();
    // manipulate the viewbox
    if (type == "vml") {
        if (!this._vmlBox) {
            this._vmlBox = isc.Element.get(this.getID()+"_vml_box");
        }
        if (this._vmlBox) {
            this._vmlBox.coordorigin.x = left;
            this._vmlBox.coordorigin.y = top;
            this._vmlBox.coordsize.x = width;
            this._vmlBox.coordsize.y = height;
        }
    } else if (type == "svg") {
        if (!this._svgBox) {
            var self = this;
            setTimeout(function() {self._setViewBox(left,top,width,height);},100);
        } else {
            this._svgBox.setAttributeNS(null, "transform", "translate(" + -left + "," + -top + ")")
        }
    }
},



// Embed a canvas in this drawpane, so it zooms/pans/clips in synch with shapes in the vector space.
// We assume that the original rect (left/top/width/height properties) of this canvas has been
// set in drawing coordinates, so we apply the current zoom and pan immediately.
// TODO support canvasItems in drawGroups
// TODO patch coordinate setters (setLeft, moveBy, etc) so they work with drawing coords?
//      or implement setDrawingLeft(), etc?
//      Currently we've worked around a single case: In DrawKnobs we supply a custom
//      setCenterPoint() method which can take drawing OR screen coordinates.
//
// NOTE: Any Canvas can be added to a drawPane as a canvasItem (it's not a custom Canvas class, and
// doesn't necessarily have any associated content rendered out as drawItems. 
// By adding a canvas to a drawPane as a canvasItem you're essentially
// just causing the canvas to be notified when the drawPane zooms / pans.

addCanvasItem : function (item) {
    // crosslink
    this.canvasItems.add(item);
    item.drawPane = this;
    // save original position and size settings
    item._drawingLeft = item.left;
    item._drawingTop = item.top;
    item._drawingWidth = item.width;
    item._drawingHeight = item.height;
    // add as child, for local coordinates and clipping
    this.addChild(item);
    // update for current zoom & pan
    this._updateCanvasItemToViewBox(item);
    
    return item;
},

// Create a SVG linearGradient with the given id
// This will be accessible from any DrawItems fillGradient

_createSimpleGradientSVG : function (id, simpleGradient) {
    var elem, i, color, offset, opacity, range, stop;
    if (!isc.Browser.isWebKit) {
        elem = "<linearGradient id='" + id 
            "' x1='" + simpleGradient.x1 + 
            "' x2='" + simpleGradient.x2 + 
            "' y1='" + simpleGradient.y1 + 
            "' y2='" + simpleGradient.y2 + 
            "'>";
        color = simpleGradient.startColor;
        offset = 0.0;
        opacity = "1";
        elem += "<stop stop-color='"+color+"' offset='"+offset+"' stop-opacity='"+opacity+"'/>";
        color = simpleGradient.endColor;
        offset = 1.0;
        opacity = "1";
        elem += "<stop stop-color='"+color+"' offset='"+offset+"' stop-opacity='"+opacity+"'/>";
        elem += "</linearGradient>";
        range = this._svgDocument.createRange();
        range.setStart(this._svgDefs, 0);
        this._svgDefs.appendChild(range.createContextualFragment(elem));
    } else {
        elem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "linearGradient");
        elem.setAttributeNS(null,"id",id);
        elem.setAttributeNS(null,"x1",simpleGradient.x1);
        elem.setAttributeNS(null,"x2",simpleGradient.x2);
        elem.setAttributeNS(null,"y1",simpleGradient.y1);
        elem.setAttributeNS(null,"y2",simpleGradient.y2);
        stop = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "stop");
        stop.setAttributeNS(null,"stop-color",simpleGradient.startColor);
        stop.setAttributeNS(null,"offset","0.0");
        stop.setAttributeNS(null,"stop-opacity","1");
        elem.appendChild(stop);
        stop = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "stop");
        stop.setAttributeNS(null,"stop-color",simpleGradient.endColor);
        stop.setAttributeNS(null,"offset","1.0");
        stop.setAttributeNS(null,"stop-opacity","1");
        elem.appendChild(stop);
        this._svgDefs.appendChild(elem);
    }
},

// Create a SVG linearGradient with the given id
// This will be accessible from any DrawItems fillGradient

_createLinearGradientSVG : function (id, linearGradient) {
    var elem, i, color, offset, opacity, range, stop;
    if (!isc.Browser.isWebKit) {
        elem = "<linearGradient id='" + id +
            "' x1='" + linearGradient.x1 + 
            "' x2='" + linearGradient.x2 + 
            "' y1='" + linearGradient.y1 + 
            "' y2='" + linearGradient.y2 + 
            "'>";
        for (var i = 0; i < linearGradient.colorStops.length; ++i) {
            color = linearGradient.colorStops[i].color;
            offset = linearGradient.colorStops[i].offset;
            opacity = linearGradient.colorStops[i].opacity || "1";;
            elem += "<stop stop-color='"+color+"' offset='"+offset+"' stop-opacity='"+opacity+"'/>";
        }
        elem += "</linearGradient>";
        range = this._svgDocument.createRange();
        range.setStart(this._svgDefs, 0);
        this._svgDefs.appendChild(range.createContextualFragment(elem));
    } else {
        elem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "linearGradient");
        elem.setAttributeNS(null,"id",id);
        elem.setAttributeNS(null,"x1",linearGradient.x1);
        elem.setAttributeNS(null,"x2",linearGradient.x2);
        elem.setAttributeNS(null,"y1",linearGradient.y1);
        elem.setAttributeNS(null,"y2",linearGradient.y2);
        for (var i = 0; i < linearGradient.colorStops.length; ++i) {
            stop = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "stop");
            stop.setAttributeNS(null,"stop-color",linearGradient.colorStops[i].color);
            stop.setAttributeNS(null,"offset",linearGradient.colorStops[i].offset);
            stop.setAttributeNS(null,"stop-opacity",linearGradient.colorStops[i].opacity||"1");
            elem.appendChild(stop);
        }
        this._svgDefs.appendChild(elem);
    }
},

// Create a SVG radialGradient with the given id
// This will be accessible from any DrawItems fillGradient
_createRadialGradientSVG : function (id, radialGradient) {
    var elem, i, color, offset, opacity, range, stop;
    if (!isc.Browser.isWebKit) {
        elem = "<radialGradient id='" + id +
            "' cx='" + radialGradient.cx + 
            "' cy='" + radialGradient.cy + 
            "' r='" + radialGradient.r + 
            "' fx='" + radialGradient.fx + 
            "' fy='" + radialGradient.fy + 
            "'>";
        for (var i = 0; i < radialGradient.colorStops.length; ++i) {
            color = radialGradient.colorStops[i].color;
            offset = radialGradient.colorStops[i].offset;
            opacity = radialGradient.colorStops[i].opacity || "1";;
            elem += "<stop stop-color='"+color+"' offset='"+offset+"' stop-opacity='"+opacity+"'/>";
        }
        elem += "</radialGradient>";
        range = this._svgDocument.createRange();
        range.setStart(this._svgDefs, 0);
        this._svgDefs.appendChild(range.createContextualFragment(elem));
    } else {
        elem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "radialGradient");
        elem.setAttributeNS(null,"id",id);
        elem.setAttributeNS(null,"cx",radialGradient.cx);
        elem.setAttributeNS(null,"cy",radialGradient.cy);
        elem.setAttributeNS(null,"r",radialGradient.r);
        elem.setAttributeNS(null,"fx",radialGradient.fx);
        elem.setAttributeNS(null,"fy",radialGradient.fy);
        for (i = 0; i < radialGradient.colorStops.length; ++i) {
            stop = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "stop");
            stop.setAttributeNS(null,"stop-color",radialGradient.colorStops[i].color);
            stop.setAttributeNS(null,"offset",radialGradient.colorStops[i].offset);
            stop.setAttributeNS(null,"stop-opacity",radialGradient.colorStops[i].opacity||"1");
            elem.appendChild(stop);
        }
        this._svgDefs.appendChild(elem);
    }
},


// move and scale an associated canvas to match the current drawPane zoom & pan
// called when a canvasItem is added to this drawPane, and when the drawPane is zoomed or panned
// will also need to call this when a canvasItem is moved or resized
_updateCanvasItemToViewBox : function (item) {
    // synchingToPane flag - This is required for DrawKnobs - it essentially notifies the 
    // canvas that the drawItem (the knobShape) doesn't need to be moved in response to the
    // canvas move.
    item.synchingToPane = true;
    item.setRect(this.drawing2screen([
        item._drawingLeft,
        item._drawingTop,
        item._drawingWidth,
        item._drawingHeight
    ]));    
    // HACK also scale border width, assuming uniform px borders all around
    // TODO consider how to structure this via shared CSS classes for faster updates
    // Note: we could get the initial border width from parseInt(item.getStyleHandle().borderWidth),
    // but we need some flag anyway to selectively enable border scaling (no point doing
    // this for eg canvasitems that are used as invisible hotspots), so we just use drawBorderSize
    // as a pixel width here
    if (item.drawBorderSize) {
        // floor of 1px prevents borders from disappearing entirely in IE
        item.getStyleHandle().borderWidth = Math.max(1, item.drawBorderSize * this.zoomLevel) + "px";
    }
    delete item.synchingToPane;
},

// Update items and item properties that are not automatically updated by the viewbox
// transformation, or that must be corrected because of the viewbox transformation.
// Currently:
//  - move/resize canvasItems
//  - move/scale text for VML drawpanes
//  - scale lines for VML drawpanes
// TODO/future:
//  - prevent scaling of hairlines (always 1px) in SVG
//  - prevent scaling of fixed-size labels in SVG
//  - enforce minimum arrowhead sizes
// NOTE: must also account for the viewbox when elements are drawn or updated, so currently in:
//      drawPane.addCanvasItem()
//      drawItem._getElementVML()
//      drawItem.setLineWidth()
//      drawLabel._getElementVML()
//      drawLabel.setFontSize()      
// TODO recurse through DrawGroups - this only hits the top level
_updateItemsToViewBox : function () {
    // update canvasItems - see addCanvasItem()
    for (var i=0, ci; i<this.canvasItems.length; i++) {
        this._updateCanvasItemToViewBox(this.canvasItems[i]);
    }
    // scalable text and linewidths for VML
    if (this.drawingType == "vml") {
        for (var i=0, di, screenCoords; i<this.drawItems.length; i++) {
            di = this.drawItems[i];
            if (isc.isA.DrawLabel(di)) {
                // TODO hide these attributes behind DrawLabel setters
                // scale font size
                //  alternate approach - could just change the CSS class, eg:
                //  isc.Element.getStyleDeclaration("drawLabelText").fontSize = 24 * zoomLevel;
                di._vmlTextHandle.fontSize = di._fontSize * this.zoomLevel;
                if (!di.synchTextMove) {
                    // using higher-performance external html DIVs - but need to move them ourselves
                    screenCoords = this.drawing2screen([di.left, di.top, 0, 0]); // width/height not used here - labels overflow
                    di._vmlTextHandle.left = screenCoords[0];
                    di._vmlTextHandle.top = screenCoords[1];
                }
            } else {
                // scale linewidths (TODO call this on DrawShapes only, when DrawShape has been factored out)
                di._setLineWidthVML(di.lineWidth * this.zoomLevel);
            }
        }
    }
},

// Global Pan
//  anticipated panning UIs:
//      - draggable viewbox outline in a thumbnail view -- drag&drop or realtime
//      - hand tool -- drag outlines or realtime
//      - arrow keys/buttons - press to pan by steps
//  so panRight and panDown are *deltas in screen (pixel) coordinates*
pan : function (panRight, panDown) {
    this._setViewBox(
        this._viewBoxLeft + panRight/this.zoomLevel,
        this._viewBoxTop + panDown/this.zoomLevel,
        this._viewBoxWidth,
        this._viewBoxHeight
    );
    if (this.drawingType === 'bitmap') {
        this.translate = this.translate || [0, 0];
        this.translate[0] -= panRight;
        this.translate[1] -= panDown;
        this.redrawBitmap();
    }
},

//> @method drawPane.zoom()
// Zoom this drawPane to the specified magnification, maintaining the current viewport position
// @param zoom (float) Desired zoom level as a float where <code>1.0</code> is equivalent to 100%
//  magnification.
// @visibility drawing
//<

zoom : function (zoomLevel) {
    // We want to zoom the current viewbox around its center to preserve pan() operations
    // BUT the viewbox already reflects some zoom level
    // so first convert absolute zoomLevel to relative zoom level
    var relativeZoom = zoomLevel / this.zoomLevel,
        newViewBoxWidth = this._viewBoxWidth/relativeZoom,
        newViewBoxHeight = this._viewBoxHeight/relativeZoom;
    // then we can save the new zoomLevel
    // NB: MUST set this before _setViewBox(), since side-effected drawing2screen coordinate
    //  conversions (eg to update canvasitems) ref this property for the absolute zoom level
    this.zoomLevel = zoomLevel;
    // then transform the viewbox:
    //  - center of current viewbox is (left + width/2, top + height/2)
    //  - center will remain the same
    //  - so just subtract half of the new width and height to get new top left    
    this._setViewBox(
        this._viewBoxLeft + this._viewBoxWidth/2 - newViewBoxWidth/2,
        this._viewBoxTop + this._viewBoxHeight/2 - newViewBoxHeight/2,
        newViewBoxWidth,
        newViewBoxHeight
    );
    if (this.drawingType === 'bitmap') {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        if(canvas) {
            canvas.style['-webkit-transform'] = 'scale('+this.zoomLevel+','+this.zoomLevel+')';
        }
    }
},

//> @method drawPane.rotate()
// Rotate by degrees
//
// @param degrees (float) rotation in degrees
//<
rotate : function (degrees) {
    var type = this.drawingType;
    this.rotation = degrees;
    if (type === "vml") {
      if (!this._vmlBox) {
          this._vmlBox = isc.Element.get(this.getID()+"_vml_box");
      }
      if(this._vmlBox) {
          this._vmlBox.style.rotation=degrees;
      }
    } else if (type === "svg") {
        if (!this._svgBox) {
            var self = this;
            setTimeout(function() {self.rotate(degrees);},100);
        } else {
            this._svgBox.setAttributeNS(null, "transform", "rotate(" + degrees + ")");
        }
    } else if (this.drawingType === 'bitmap') {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        if(canvas) {
            canvas.style['-webkit-transform'] = 'rotate('+this.rotation+'deg)';
        }
    }
},

//> @method drawPane.createSimpleGradient()
// Creates a simple linear gradient which can be used within any DrawItem 
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the linear gradient
// @param simple (SimpleGradient: null) 
// @visibility drawing
//<
createSimpleGradient : function(id, simple) {
    this.gradients[id] = simple;
    if (this.drawingType === "svg") {
        this._createSimpleGradientSVG(id, simple);
    } 
    return id;
},

//> @method drawPane.createLinearGradient()
// Creates a linear gradient which can be used within any DrawItem 
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the linear gradient
// @param linearGradient (LinearGradient) the linear gradient
// @visibility drawing
//<
createLinearGradient : function(id, linearGradient) {
    this.gradients[id] = linearGradient;
    var type = this.drawingType;
    if (type === "svg") {
        this._createLinearGradientSVG(id, linearGradient);
    } 
    return id;
},

//> @method drawPane.createRadialGradient()
// Creates a radial gradient which can be used within any DrawItem 
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the radial gradient
// @param radialGradient (RadialGradient) the radial gradient
// @visibility drawing
//<
createRadialGradient : function(id, radialGradient) {
    this.gradients[id] = radialGradient;
    var type = this.drawingType;
    if (type == "svg") {
        this._createRadialGradientSVG(id, radialGradient);
    }
    return id;
},

// shouldDeferDrawing() - check for the case where the drawPane is drawn but not yet ready to 
// render out content, and set up a deferred draw operation here
shouldDeferDrawing : function (item) {
    // Assume this is only called when this.isDrawn() is true
    if (this.drawingType == "svg" && !this._svgDocument) {
        if (!this._delayedDrawItems) {
            this._delayedDrawItems = [item];
        } else {
            this._delayedDrawItems.add(item);
        }
        return true;
    } else if (this.drawingType == "vml" && !this.getHandle()) {
        if (!this._delayedDrawItems) {
            this._delayedDrawItems = [item];
        } else {
            this._delayedDrawItems.add(item);
        }
        if (!this.deferring) {
            var self = this;
            self.deferring = true;
            setTimeout(function() {
                if (self._delayedDrawItems) {
                    self._delayedDrawItems.map("draw");
                    delete self._delayedDrawItems;
                }
                delete self.deferring;
            }, 10);
        }
        return true;
    }
    return false;
},

cancelDeferredDraw : function (item) {
    if (this._delayedDrawItems && this._delayedDrawItems.contains(item)) {
        this._delayedDrawItems.remove(item);
        return true;
    }
    return false;
},
        
// TODO execute deferred draw operations here
// TODO remove these props from DrawItem - can get them via drawItem.drawPane
svgLoaded : function () {
    this._svgDocument = this.getHandle().firstChild.contentDocument; // svg helper doc in iframe
    this._svgBody = this._svgDocument.getElementById("isc_svg_body"); // outermost svg element
    this._svgBox = this._svgDocument.getElementById("isc_svg_box"); // outermost svg group
    this._svgDefs = this._svgDocument.getElementById("isc_svg_defs"); // defs element (container for arrowhead marker
    if (this._delayedDrawItems) {
        this._delayedDrawItems.map("draw");
        delete this._delayedDrawItems;
    }
}


}) // end DrawPane.addProperties


isc.DrawPane.addClassProperties({
    defaultDrawingType: isc.Browser.defaultDrawingType,

    // DrawPane class provides default fullscreen DrawPane instances for each drawingType,
    // which are used by DrawItems that are not provided with a DrawPane
    _defaultDrawPanes: [],
    getDefaultDrawPane : function (type) {
        if (!type) type = this.defaultDrawingType;
        if (this._defaultDrawPanes[type]) return this._defaultDrawPanes[type];
        var ddp = this._defaultDrawPanes[type] = this.create({
            drawingType: type,
            // initialize container size to the display rect of the page
            // see (ISSUE: CANVAS element clipping) above
            // this size will be passed through to the CANVAS or SVG element
            width: isc.Page.getScrollWidth(),
            height: isc.Page.getScrollHeight(),
            autoDraw: true
        });
        ddp.sendToBack();
        return ddp;
    },

    // color helper functions
    addrgb: function(a, b) {
        var ca = Array(parseInt('0x'+a.substring(1,3),16),parseInt('0x'+a.substring(3,5),16),parseInt('0x'+a.substring(5,7),16));
        var cb = Array(parseInt('0x'+b.substring(1,3),16),parseInt('0x'+b.substring(3,5),16),parseInt('0x'+b.substring(5,7),16));
        var red = ca[0] + cb[0];
        red = Math.round(red > 0xff ? 0xff : red).toString(16);
        red = red.length === 1 ? "0" + red : red;
        var green = ca[1] + cb[1];
        green = Math.round(green > 0xff ? 0xff : green).toString(16);
        green = green.length === 1 ? "0" + green: green;
        var blue = ca[2] + cb[2];
        blue = Math.round(blue > 0xff ? 0xff : blue).toString(16);
        blue = blue.length === 1 ? "0" + blue: blue;
        return '#' + red + green + blue;
    },
    subtractrgb: function(a, b) {
        var ca = Array(parseInt('0x'+a.substring(1,3),16),parseInt('0x'+a.substring(3,5),16),parseInt('0x'+a.substring(5,7),16));
        var cb = Array(parseInt('0x'+b.substring(1,3),16),parseInt('0x'+b.substring(3,5),16),parseInt('0x'+b.substring(5,7),16));
        var red = ca[0] - cb[0];
        red = Math.round(red < 0x0 ? 0x0 : red).toString(16);
        red = red.length === 1 ? "0" + red : red;
        var green = ca[1] - cb[1];
        green = Math.round(green < 0x0 ? 0x0 : green).toString(16);
        green = green.length === 1 ? "0" + green: green;
        var blue = ca[2] - cb[2];
        blue = Math.round(blue < 0x0 ? 0x0 : blue).toString(16);
        blue = blue.length === 1 ? "0" + blue: blue;
        return '#' + red + green + blue;
    },
    mixrgb: function(a, b){
        return b.charAt(0) === '+' ? isc.DrawPane.addrgb(a,b.substring(1)) : b.charAt(0) === '-' ? isc.DrawPane.subtractrgb(a,b.substring(1)) : b;
    },
    hex2rgb: function(hex,opacity) {
        var hexValue = hex.split('#')[1];
        var hexValueLength = hexValue.length/3;
        var redHex = hexValue.substring(0,hexValueLength);
        var greenHex = hexValue.substring(hexValueLength,hexValueLength*2);
        var blueHex = hexValue.substring(hexValueLength*2,hexValueLength*3);
        var red = parseInt(redHex.toUpperCase(),16);
        var green = parseInt(greenHex.toUpperCase(),16);
        var blue = parseInt(blueHex.toUpperCase(),16);
        var rgb = (typeof(opacity) !== 'undefined') ? 'rgba('+red+','+green+','+blue+','+opacity+')': 'rgb('+red+','+green+','+blue+')';
        return rgb;
    },
    rgb2hex: function(value){
        var hex = "", v, i;
        var regexp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/;
        var h = regexp.exec(value);
        for (i = 1; i < 4; i++) {
          v = parseInt(h[i],10).toString(16);
          if (v.length == 1) {
            hex += "0" + v;
          } else {
            hex += v;
          }
        }
        return ("#" + hex);
    }
})



//------------------------------------------------------------------------------------------
//> @class DrawItem
//
// Base class for graphical elements drawn in a DrawPane.  All properties and methods
// documented here are available on all DrawItems unless otherwise specified.  
// <P>
// Note that DrawItems as such should never be created, only concrete subclasses such as
// +link{DrawGroup} and +link{DrawLine}.
// <P>
// See +link{DrawPane} for the different approaches to create DrawItems.
//
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------

// DrawItem implements the line (aka stroke) and fill attributes that are shared
// by all drawing primitives.



isc.defineClass("DrawItem").addProperties({

    // Pane / Group membership
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.drawPane   (DrawPane : null : IR)
    // +link{DrawPane} this drawItem should draw in.
    // <P>
    // If this item has a +link{drawGroup}, the drawGroup's drawPane is automatically used.
    // @visibility drawing
    //<

    //> @attr drawItem.drawGroup  (DrawGroup : null : IR)
    // +link{DrawGroup} this drawItem is a member of.
    // <P>
    // Coordinates for a drawItem that has a drawGroup are relative to that drawGroup.
    // DrawItems that are part of a drawGroup with translate, scale and rotate with their
    // DrawGroup.
    // @visibility drawing
    //<

    // Line Styling
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.lineWidth  (int : 3 : IRW)
    // Pixel width for lines.
    // @group line
    // @visibility drawing
    //<
    // XXX setLineWidth(0) will not cause a VML line to disappear, but will cause an SVG line
    // to disappear
    lineWidth: 3,

    //> @attr drawItem.lineColor (CSSColor : "#808080" : IRW)
    // Line color
    // @group line
    // @visibility drawing
    //< 
    lineColor: "#808080",

    //> @attr drawItem.lineOpacity (float : 1.0 : IRW)
    // Opacity for lines, as a number between 0 (transparent) and 1 (opaque).
    // @group line
    // @visibility drawing
    //<
    lineOpacity: 1.0,

    //> @attr drawItem.linePattern (LinePattern : "solid" : IRW)
    // Pattern for lines, eg "solid" or "dash"
    // @group line
    // @visibility drawing
    //<
    linePattern: "solid",

    //> @type LinePattern
    // Supported styles of drawing lines.
    // @value "solid"     Solid line
    // @value "dot"       Dotted line
    // @value "dash"      Dashed line
    // @value "shortdot"  Dotted line, with more tightly spaced dots
    // @value "shortdash" Dashed line, with shorter, more tightly spaced dashes
    // @value "longdash"  Dashed line, with longer, more widely spaced dashes
    // @group line
    // @visibility drawing
    //<
    // see setLinePattern() for notes on expanding this set

    //> @attr drawItem.lineCap     (LineCap : "round" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "round",

    //> @type LineCap
    // Supported styles of drawing the endpoints of a line
    //
    // @value "round"    Semicircular rounding
    // @value "square"   Squared-off endpoint
    // @value "butt"     Square endpoint, stops exactly at the line's end coordinates instead
    //                   of extending 1/2 lineWidth further as "round" and "square" do
    // 
    // @group line
    // @visibility drawing
    //<

    // Fill Styling
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.fillColor     (CSSColor : null : IRW)
    // Fill color to use for shapes.  The default of 'null' is transparent.
    // @group fill
    // @visibility drawing
    //<
    //fillColor: null, // transparent

    //> @attr drawItem.fillGradient     (Gradient | string: null : IRW)
    // Fill gradient to use for shapes.  If a string it uses the gradient identifier parameter provided in 
    // +link{drawPane.createSimpleGradient,drawPane.createSimpleGradient}, 
    // +link{drawPane.createRadialGradient,drawPane.createRadialGradient} or 
    // +link{drawPane.createLinearGradient,drawPane.createLinearGradient}. Otherwise 
    // it expects one of +link{SimpleGradient,SimpleGradient}, +link{LinearGradient,LinearGradient} or 
    // +link{RadialGradient,RadialGradient}. 
    // @see Gradient
    // @group fill
    // @visibility drawing
    //<
    fillGradient: null,

    //> @attr drawItem.fillOpacity   (float : 1.0 : IRW)
    // Opacity of the fillColor, as a number between 0 (transparent) and 1 (opaque).
    // @group fill
    // @visibility drawing
    //<
    fillOpacity: 1.0,

    //> @attr drawItem.shadow  (Shadow: null : IRW)
    // Shadow used for all DrawItem subtypes. 
    // @visibility drawing
    //<
    shadow: null,

    //>	@attr drawItem.rotate    (float : 0.0 : IR)
    // rotation in degrees.
    // @visibility drawing
    //<
    rotation: 0, 

    //>	@attr drawItem.scale (Array : null : IR)
    // Array holds 2 values representing scaling along x and y dimensions.
    // @visibility drawing
    //<
    scale: null, 

    // Arrowheads
    // ---------------------------------------------------------------------------------------
    
    //> @attr drawItem.startArrow    (ArrowStyle : null : IRW)
    // Style of arrowhead to draw at the beginning of the line or path.
    //
    // @visibility drawing
    //<

    //> @attr drawItem.endArrow (ArrowStyle : null : IRW)
    // Style of arrowhead to draw at the end of the line or path.
    //
    // @visibility drawing
    //<
    
    //> @type ArrowStyle
    // Supported styles for arrowheads
    // @value "block"     Solid triangle
    // @value "open" arrow rendered as an open triangle. Only applies to
    //  +link{DrawLinePath,DrawLinePaths} - for other items this will be treated as
    //  <code>"block"</code>
    // @value null  Don't render an arrowhead at all
    // @visibility drawing
    //<

    // Future styles, lifted from VML spec:
    // @value "classic"   Classic triangular "barbed arrow" shape
    // @value "open"      Open triangle
    // @value "oval"      Oval line endpoint (not an arrow)
    // @value "diamond"   Diamond line endpoint (not an arrow)
    // Note that VML also defines "chevron" and "doublechevron" but these do nothing in IE
    // Note: We currently do support "open" style arrow heads via segmented lines in drawLinePaths
    // only

    // Control Knobs
    // -----------------------------------------------------------------------------------------
    
    //> @attr drawItem.knobs (Array of KnobType : null : IRW)
    // Array of control knobs to display for this item. Each +link{knobType} specified in this
    // will turn on UI allowing the user to manipulate this drawItem.  To update the set of
    // knobs at runtime use +link{drawItem.showKnobs()} and +link{drawItem.hideKnobs()}
    // 
    // @visibility drawing
    //<
    
    //> @type KnobType
    // Entries for the +link{drawItem.knobs} array. Each specified knobType will enable some UI 
    // allowing the user to manipulate the drawItem directly.
    //
    // @value "resize" <i>Applies to +link{DrawRect} and +link{DrawOval}.</i>
    //  Display up to 4 control knobs at the corners specified by +link{DrawItem.resizeKnobPoints},
    //  allowing the user to drag-resize the item.
    //
    // @value "move" <i>Applies to +link{DrawRect}, +link{DrawOval}, +link{DrawLine}, and
    //  +link{DrawLinePath}.</i> Display a control knob for moving the
    //  item around. See also +link{drawItem.moveKnobPoint} and +link{drawItem.moveKnobOffset}
    //
    // @value "startPoint" <i>Applies to +link{DrawLine} +link{DrawCurve} and
    //  +link{DrawLinePath}.</i> Control knob  to manipulate +link{drawLine.startPoint}.
    //
    // @value "endPoint" <i>Applies to +link{DrawLine}, +link{DrawCurve} and
    //  +link{DrawLinePath}.</i> Control knob to manipulate +link{drawLine.endPoint}.
    //
    // @value "controlPoint1" <i>Applies to +link{DrawCurve} only.</i> Display a draggable
    //  control knob along with a drawLine indicating angle between controlPoint1 and startPoint for
    //  this drawCurve. Dragging the knob will adjust +link{DrawCurve.controlPoint1}
    //
    // @value "controlPoint2" <i>Applies to +link{DrawCurve} only.</i> Display a draggable
    //  control knob along with a drawLine indicating angle between controlPoint2 and endPoint for
    //  this drawCurve. Dragging the knob will adjust +link{DrawCurve.controlPoint2}
    // @visibility drawing
    //<
    
    //drawingType: null, // vml, bitmap, svg - only respected for implicit DrawPane
    
    
    autoOffset:true,
    canDrag: false,
    
//> @method drawItem.getBoundingBox()
// Finds the bounding min, max points for this shape. Implemented by subtypes.
// @return (array) the x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [];
},

//> @method drawItem.isInBounds(x,y)
// returns true if point is in getBoundingBox()
// @param x (integer)
// @param y (integer) 
// @return (boolean)
// @visibility drawing
//<
isInBounds: function (x,y) {
    var b = this.getBoundingBox();
    var inbounds = (x >= b[0]) && (x <= b[2]) && (y >= b[1]) && (y <= b[3]);
    return inbounds;
},

//> @method drawItem.isPointInPath(x,y)
// returns true if point is in path
// @param x (integer)
// @param y (integer)
// @return (boolean)
// @visibility drawing
//<
isPointInPath: function (x,y) {
    if(!this.isInBounds(x,y)) {
        return false;
    }
    if(this.drawPane.drawingType == 'bitmap') {
        var context = this.drawPane.getBitmapContext();
        context.save();
        var lineColor = this.lineColor, lineOpacity = this.lineOpacity;
        this.lineColor = "#000000";
        this.lineOpacity = 0.0;
        this.drawStroke(context);
        context.restore();
        this.lineColor = lineColor;
        this.lineOpacity = lineOpacity;
        var pip = context.isPointInPath(parseFloat(x),parseFloat(y));
        return pip;
    }
    return true;
},

// DrawItem events
getHoverTarget: function (event, eventInfo) {
    return this.drawPane;
},

// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
_allowNativeTextSelection : function (event) {
    return false;
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
_updateCursor : function () {
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
focus : function (reason) {
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
visibleAtPoint : function (x,y) {
    return true;
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
getDragAppearance : function (dragOperation) {
    return "target";
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
bringToFront: function () {
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
moveToEvent: function (x,y) {
    this.moveTo(x,y);
},

//> @attr drawItem.dragStartDistance		(number : 5 : IRWA)
// @include canvas.dragStartDistance
//<
dragStartDistance: 1,
//> @method drawItem.getRect()
// @include canvas.getRect()
//<
getRect : function () {
    var bbox = this.getBoundingBox();
    return [bbox[0],bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]];
},
//> @method drawItem.getPageLeft()    ([A])
// @include canvas.getPageLeft()
//<
getPageLeft : function () {
    return this.getBoundingBox()[0];
},
//> @method drawItem.getPageTop()    ([A])
// @include canvas.getPageTop()
//<
getPageTop : function () {
    return this.getBoundingBox()[1];
},
//> @method drawItem.dragStart() (A)
// @include canvas.dragStart()
//<
dragStart : function (event, info) {
    var bounds = this.getBoundingBox();
    var offsetX = bounds[0];
    var offsetY = bounds[1];
    var normalized = this.drawPane.normalize(event.x,event.y);
    this.dragOffsetX = normalized.x - this.drawPane.getPageLeft() - offsetX;
    this.dragOffsetY = normalized.y - this.drawPane.getPageTop() - offsetY;
    return true;
},
//> @method drawItem.dragMove() (A)
// @include canvas.dragMove()
//<
dragMove : function (event, info) {
    var normalized = this.drawPane.normalize(event.x,event.y);
    var x = normalized.x - this.drawPane.getPageLeft() - this.dragOffsetX;
    var y = normalized.y - this.drawPane.getPageTop() - this.dragOffsetY;
    this.moveTo(x,y);
    return true;
},
//> @method drawItem.dragStop() (A)
// @include canvas.dragStop()
//<
dragStop : function (event, info) {
    var normalized = this.drawPane.normalize(event.x,event.y);
    var x = normalized.x - this.drawPane.getPageLeft() - this.dragOffsetX;
    var y = normalized.y - this.drawPane.getPageTop() - this.dragOffsetY;
    this.moveTo(x,y);
    return true;
},
//> @method drawItem.click() (A)
// @include canvas.click()
//<
click : function() {
    
    return true;
},
//> @method drawItem.mouseDown() (A)
//@include canvas.mouseDown()
//<
mouseDown : function () {
    
    return true;
},
//> @method drawItem.mouseUp() (A)
//@include canvas.mouseUp()
//<
mouseUp : function () {
    
    return true;
},
//> @method drawItem.mouseMove() (A)
//@include canvas.mouseMove()
//<
mouseMove : function () {
    
    return true;
},
//> @method drawItem.mouseOut() (A)
//@include canvas.mouseOut()
//<
mouseOut : function () {
    
    return true;
},
//> @method drawItem.mouseOver() (A)
//@include canvas.mouseOver()
//<
mouseOver : function () {
    
    return true;
},
// end of shape events
init : function () {
    this.Super("init");
    if (this.ID == null || window[this.ID] != this) {
        isc.ClassFactory.addGlobalID(this); 
    }
    this.drawItemID = isc.DrawItem._IDCounter++;

    // add to drawItems for drawGroup or drawPane
    // TODO support layering for CANVAS    
    if (this.drawGroup) {
        this.eventParent = this.drawGroup;
        this.drawGroup.drawItems.add(this);
    } else if (this.drawPane) {
        this.eventParent = this.drawPane;
        this.drawPane.drawItems.add(this);
        var bb = this.getBoundingBox();
        if(bb && bb.length === 4) {
           this.item = {x:bb[0],y:bb[1],width:bb[2]-bb[0],height:bb[3]-bb[1],shape:this};
           if(!(isNaN(this.item.width) || isNaN(this.item.height))) {
             this.drawPane.quadTree.insert(this.item);
           }
        }
    }

    if (this.autoDraw) this.draw();        
},

// Drawing
// ---------------------------------------------------------------------------------------

//> @method drawItem.draw()
// Draw this item into it's current +link{drawPane}.
//
// @visibility drawing
//<
// TODO exception handling for invalid generated VML/SVG markup
draw : function () {
    // be sure to set _drawn before returning
    if (this._drawn) {
        this.logWarn("DrawItem already drawn - exiting draw()"); 
        return;
    }
    
    if (this.drawGroup) { // drawing into a drawGroup
        if (!this.drawGroup._drawn) {
            this.logWarn("Attempted draw into an undrawn group - calling draw() on the group now");
            this.drawGroup.draw();
            if (!this.drawGroup._drawn) return; // drawGroup should have logged an error
        }
        this.drawPane = this.drawGroup.drawPane;
    } else { // drawing directly into a drawPane
        if (!this.drawPane) this.drawPane = isc.DrawPane.getDefaultDrawPane(this.drawingType);
    }
    var dp = this.drawPane,
        drawnState = dp.getDrawnState();

    // If the DP is undrawn, we just wait for it to draw us as it draws.  The handle_drawn
    // states indicates we're being drawn as part of DrawPane's drawChildren.
    if (!dp.isDrawn() && dp.getDrawnState() != isc.Canvas.HANDLE_DRAWN) return;

    // shouldDeferDrawing: for VML/SVG graphics There's a window of time between draw
    // completeing before the iframe is loaded.  If draw() is called in this window, defer the
    // draw (shouldDeferDrawing handles this if it returns true).
    if (dp.shouldDeferDrawing(this)) return;
    
    var type = this.drawingType = dp.drawingType; // drawingType of drawPane wins

    // map string drawingType to faster booleans
    if (type == "vml") {
        this.drawingVML = true;
    } else if (type == "svg") {
        this.drawingSVG = true;
    } else if (type == "bitmap") {
        this.drawingBitmap = true;
    }

    // vml - call _getElementVML() and insert directly into drawPane div
    if (this.drawingVML) {
        if (isc.isA.DrawLabel(this) && !this.synchTextMove) {
            // high-performance external html text is written directly into the DrawPane as DIVs
            this._vmlContainer = dp.getHandle(); // TODO/TEST - what if we just used the VML box/group?
        } else if (this.drawGroup) {
            this._vmlContainer = this.drawGroup._vmlHandle;
        } else {
            this._vmlContainer = isc.Element.get(dp.getID()+"_vml_box"); // TODO initialize in DrawPane
//also TODO - unrelated here - move dp.redrawBitmap calls into a single dp.refresh(), also to serve as a hook
        }
        
        var id = "isc_DrawItem_" + this.drawItemID;
        isc.Element.insertAdjacentHTML(
            this._vmlContainer,
            this.drawToBack ? "afterBegin" : "beforeEnd", // simple layering approach; VML also supports explicit z-index
            this._getElementVML(id)
        );
        this._vmlHandle = isc.Element.get(id);
        if (!isc.isA.DrawGroup(this) && !isc.isA.DrawImage(this) && !isc.isA.DrawLabel(this)) { // groups, images, labels do not have stroke and fill - TODO DrawShape refectoring
            this._vmlStrokeHandle = this._vmlHandle.firstChild; // see drawItem._getElementVML()
            this._vmlFillHandle = this._vmlStrokeHandle.nextSibling; // see drawItem._getElementVML()
        }
        if (isc.isA.DrawLabel(this)) { // labels do have a style handle that we use to set fontsize
            if (this.synchTextMove) {
                this._vmlTextHandle = this._vmlHandle.firstChild.style; // VML TEXTBOX
            } else {
                this._vmlTextHandle = this._vmlHandle.style; // external DIV
            }
        }
        
    // svg - call _getElementSVG() and insert into svg element in drawPane
    } else if (this.drawingSVG) {
        this._svgDocument = dp.getHandle().firstChild.contentDocument; // svg helper doc in iframe
        this._svgContainer = this.drawGroup ? this.drawGroup._svgHandle :
        this._svgDocument.getElementById("isc_svg_box"); // outermost svg group
        
        // the shouldDeferDrawing() check above should avoid this case but as a sanity check
        // verify we got a valid svgContainer
        if (this._svgContainer == null) {
            this.logWarn("DrawItem.draw() - Attempt to render into drawPane using svg unable to" +
                " access svgContainer - svg frame may not have loaded.");
            return;
        }            
        this._svgDefs = this._svgDocument.getElementById("isc_svg_defs"); // defs element (container for arrowhead marker elements)
        var id = "isc_DrawItem_" + this.drawItemID;
        var elem;
        if (!isc.Browser.isWebKit) {
          var range = this._svgDocument.createRange();
          range.setStart(this._svgContainer, 0);
          //NB: SVG fragment text must be lowercase!!! (at least in FF 1.5)
          elem = range.createContextualFragment(this._getElementSVG(id));
        } else {
          elem = this._getElementSVG(id);
        }
        // Believe it or not, SVG does not have a z-index attribute; layering is determined solely
        // by the order in the DOM. So we provide a flag to at least set whether an item is drawn
        // to front (default behavior) or to back (useful for recursive diagram algorithms).
        if (this.drawToBack && this._svgContainer.firstChild) {
            this._svgContainer.insertBefore(elem, this._svgContainer.firstChild);
            this._svgHandle = this._svgContainer.firstChild;
        } else {
            this._svgContainer.appendChild(elem);
            this._svgHandle = this._svgContainer.lastChild;
        }

    // bitmap - redraw the drawPane (NB: redraw is deferred, so item will be added to drawItems first)
    } else if (this.drawingBitmap) {
        dp.redrawBitmap(); // drawPane will call back to this.drawBitmap()

    } else {
        this.logWarn("DrawItem: '" + type + "' is not a supported drawingType");
        return;
    }
    
    this._drawn = true;
    
    // show any specified controlKnobs
    if (this.knobs) {
        for (var i = 0; i < this.knobs.length; i++) this._showKnobs(this.knobs[i]);
    }
},

isDrawn : function () { return !!this._drawn },

// Knobs
// ---------------------------------------------------------------------------------------

// resized / moved notifications
// This is an opportunity to update our control knobs
moved : function () {
    this.updateControlKnobs();
},

resized : function () {
    this.updateControlKnobs();
},

rotated: function () {
    this.updateControlKnobs();
},

scaled: function () {
    this.updateControlKnobs();
},

// _showKnobs / _hideKnobs actually create and render the DrawKnobs for each specified knobType
// Implementation assumes the existance of a show<KnobType>Knobs() method for each specified 
// knobType.
_showKnobs : function (knobType) {
    var functionName = isc.DrawItem._getShowKnobsFunctionName(knobType) 
    if (!this[functionName]) {
        this.logWarn("DrawItem specfied with knobType:"+ knobType + 
                    " but no " +  functionName + " function exists to show the knobs. Ignoring");
    } else {
        this[functionName]();
    }
},

_hideKnobs : function (knobType) {
    var functionName = isc.DrawItem._getShowKnobsFunctionName(knobType, true) 
    if (!this[functionName]) {
        this.logWarn("DrawItem specfied with knobType:"+ knobType + 
                    " but no " +  functionName + " function exists to hide the knobs.");
    } else {
        this[functionName]();
    }
},

//> @method drawItem.showKnobs()
// Shows a set of control knobs for this drawItem. Updates +link{drawItem.knobs} to include the
// specified knobType, and if necessary draws out the appropriate control knobs.
// @param knobType (KnobType or Array of KnobType) knobs to show
// @visibility drawing
//<
showKnobs : function (knobType) {
    // allow the developer to show multiple knobs with a single function call
    if (isc.isAn.Array(knobType)) {
        for (var i = 0; i < knobType.length; i++) {
            this.showKnobs(knobType[i]);
        }
        return;
    }
    if (!this.knobs) this.knobs = [];
    if (this.knobs.contains(knobType)) return;
    
    this.knobs.add(knobType);
    if (this._drawn) {
        this._showKnobs(knobType);
    }
},

//> @method drawItem.hideKnobs()
// Hides a set of control knobs for this drawItem. Updates +link{drawItem.knobs} to remove the
// specified knobType, and clears any drawn knobs for this knobType. 
// @param knobType (KnobType | Array of knobType) knobs to hide
// @visibility drawing
//<
hideKnobs : function (knobType) {
    if (!this.knobs) return;
    if (isc.isAn.Array(knobType)) {
        for (var i = 0; i < knobType.length; i++) {
            this.hideKnobs(knobType[i]);
        }
        return;
    }
    if (this.knobs.contains(knobType)) this.knobs.remove(knobType);
    if (this._drawn) {
        this._hideKnobs(knobType);
    }
},

// -----------------------------------------
// move control knob shared by all drawItems


//> @attr drawItem.moveKnobPoint (string : "TL" : IRW)
// If this item is showing a <code>"move"</code> +link{drawItem.knobs,control knob}, this attribute
// specifies where the knob should appear with respect to the drawItem. Valid options are:
// <pre>
//  <code>"TL"</code> Top Left corner
//  <code>"TR"</code> Top Right corner
//  <code>"BL"</code> Bottom Left corner
//  <code>"BR"</code> Bottom Right corner
//  <code>"T"</code> Centered on the top edge
//  <code>"B"</code> Centered on the bottom edge
//  <code>"L"</code> Centered on the left edge
//  <code>"R"</code> Centered on thie right edge
//  <code>"C"</code> positioned over the center of the drawItem
// </pre>
// @visibility drawing
//<
moveKnobPoint:"TL",

//> @attr drawItem.moveKnobOffset (array : null : IRW)
// If this item is showing a <code>"move"</code> +link{drawItem.knobs,control knob}, this attribute
// allows you to specify an offset in pixels from the +link{drawItem.moveKnobPoint} for the
// move knob. Offset should be specified as a 2-element array of [left offset, top offset].
// @visibility drawing
//<
//moveKnobOffset:null,

// Helper: given a control knob position ("T", "BR", etc) return the x/y coordinates for the knob
_getKnobPosition : function (position) {
    var x,y;
    x = position.contains("L") ? this.left :
            (position.contains("R") ? (this.left + this.width) :
                (this.left + Math.round(this.width/2)));
    y = position.contains("T") ? this.top :
            (position.contains("B") ? (this.top + this.height) :
                (this.top + Math.round(this.height/2)));
    return [x,y];
},

showMoveKnobs : function () {
    // support customization of moveKnob via autoChild mechanism so the user can specify
    // moveKnobDefaults etc. Not currently exposed
    var position = this._getKnobPosition(this.moveKnobPoint),
        x = position[0],
        y = position[1];

    if (this.moveKnobOffset) {
        x += this.moveKnobOffset[0];
        y += this.moveKnobOffset[1];
    }
    this._moveKnob = this.createAutoChild("moveKnob",
        {
            _constructor:"DrawKnob",
            x:x, y:y,
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    
    this.observe(this._moveKnob, "updatePoints", "observer.moveBy(dX,dY)");
},

hideMoveKnobs : function () {
    if (this._moveKnob) {
        this._moveKnob.destroy();
        delete this._moveKnob;
    }
},


// -----------------------------------------
// resize control knob
// Implemented at the drawItem level - not exposed / supported for all drawItems  

//> @attr drawItem.resizeKnobPoints (array : ["TL","TR","BL","BR"] : IRW)
// If this item is showing <code>"resize"</code> +link{drawItem.knobs,control knobs}, this attribute
// specifies which sides / edges should show knobs. May include any of the following values:
// <pre>
//  <code>"TL"</code> Top Left corner
//  <code>"TR"</code> Top Right corner
//  <code>"BL"</code> Bottom Left corner
//  <code>"BR"</code> Bottom Right corner
// </pre>
// @visibility drawing

resizeKnobPoints:["TL","TR","BL","BR"],


getResizeKnobProperties : function (side) {
},

showResizeKnobs : function () {
    var positions = this.resizeKnobPoints;
    for (var i = 0; i < positions.length; i++) {
        var position = positions[i],
            coord = this._getKnobPosition(position),
            x = coord[0], y = coord[1];
        
        // support per-side customization via a method
        var props = isc.addProperties({}, this.getResizeKnobProperties(position),
                    {
                        _constructor:"DrawKnob",
                        targetShape:this,
                        point:position,
                        x:x, y:y,
                        drawPane:this.drawPane,
                        autoDraw:true
                    });
        
        // also use auto-child mechanism to pick up defaults / properties
        var knob = this.createAutoChild("resizeKnob",props);
        // override rather than observing updatePoints.
        // This allows us to cancel the drag if we'd shrink below 1x1 px in size
        knob.addProperties({
            updatePoints:function (left,top,dX,dY) {
                return this.targetShape.handleResizeKnobMove(this.point, left, top, dX, dY);
            }
        }); 
        
        if (!this._resizeKnobs) this._resizeKnobs = [];
        this._resizeKnobs.add(knob);
    }
},

handleResizeKnobMove : function (position, x, y, dX, dY) {
    var newLeft = this.left, 
        newTop = this.top,
        newWidth = this.width,
        newHeight = this.height,
        moved;
        
    if (position.contains("L")) {
        newLeft = x;
        newWidth -= dX;
        
        moved = true;
    } else if (position.contains("R")) {
        newWidth += dX;
        
    }
    if (position.contains("T")) {
        newTop = y;
        newHeight -= dY;
        moved = true;
    } else if (position.contains("B")) {
        newHeight += dY;
    }
    
    // disallow shrinking below zero size.
    if (newWidth < 1 || newHeight < 1) return false;
    
    this.resizeTo(newWidth, newHeight);
    if (moved) this.moveTo(newLeft, newTop);
},

hideResizeKnobs : function () {
    if (this._resizeKnobs) {
        this._resizeKnobs.map("destroy");
        delete this._resizeKnobs;
    }
},


// updateControlKnobs: Fired in response to moved / resized
updateControlKnobs : function () {    

    if (this._moveKnob) {
        var coords = this._getKnobPosition(this.moveKnobPoint);
        if (this.moveKnobOffset) {
            coords[0] += this.moveKnobOffset[0];
            coords[1] += this.moveKnobOffset[1];
        }
        // Gotcha: moveKnob is a Canvas, not an item, so we need to convert to 
        // the screen coordinate frame
        var screenCoords = this.drawPane.drawing2screen(coords);
        this._moveKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
    if (this._resizeKnobs) {
        for (var i = 0; i < this._resizeKnobs.length; i++) {
            var knob = this._resizeKnobs[i],
                coords = this._getKnobPosition(knob.point);
            var screenCoords = this.drawPane.drawing2screen(coords);
            knob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }
    }
},
    

setDrawPane : function (drawPane) {
    if (drawPane == this.drawPane) return;
    // Support setDrawPane(null) as an equivalent to deparent type call in Canvas - clear from
    // any parent drawPane (but keep the item around for future use)
    if (drawPane == null) {
        this.erase();
        this.drawPane = null;
        return;
    }
    
    drawPane.addDrawItem(this);
},

// In some cases (currently DrawLinePaths only) we use additional lines to render out arrowheads
// rather than relying on native SVG etc arrows
_drawLineStartArrow : function () {
    return false;
},
_drawLineEndArrow : function () {
    return false;
},

// Erasing / Destroying 
// ---------------------------------------------------------------------------------------

//> @method drawItem.erase()
// Erase this drawItem's visual representation and remove it from it's DrawGroup (if any) and
// DrawPane.
// 
// @visibility drawing
//< 
// NOTE: after an erase a drawItem should be garbage unless application code holds onto it,
// since currently no global IDs are generated for DrawItems
// TODO leak testing
erase : function (erasingAll) {
    if (!this._drawn) {
        // if we are pending a deferred draw clear it and exit without warning
        if (this.drawPane && this.drawPane.cancelDeferredDraw(this)) return;
        this.logWarn("DrawItem not yet drawn - exiting erase()"); 
        return;
    }
    if (!erasingAll) { // drawPane.erase() or drawGroup.erase() just drops the whole drawItems array
        if (this.drawGroup) this.drawGroup.drawItems.remove(this);
        else {
            this.drawPane.drawItems.remove(this);
            this.item && this.drawPane.quadTree.remove(this.item);
        }
    }
    if (this.drawingVML) {
        // see comments in Canvas.clearHandle(); note that VML is IE only
        if (isc.Page.isLoaded()) this._vmlHandle.outerHTML = "";
        else this._vmlContainer.removeChild(this._vmlHandle);
        this._vmlContainer = null;
        this._vmlHandle = null;
        this._vmlStrokeHandle = null;
        this._vmlFillHandle = null;
    } else if (this.drawingSVG) {
        this._svgContainer.removeChild(this._svgHandle);
        this._svgDocument = null;
        this._svgContainer = null;
        this._svgHandle = null;
    } else if (this.drawingBitmap && !erasingAll) { // drawPane.erase() will call redrawBitmap()
        this.drawPane.redrawBitmap(); // this item has been removed above
    }
    // clear up any drawn knobs
    if (this.knobs) {
        for (var i = 0; i < this.knobs.length; i++) {
            this._hideKnobs(this.knobs[i]);
        }
    }
    
    this._drawn = false;
},


//> @method drawItem.destroy()
// Permanently destroys this DrawItem, similar to +link{Canvas.destroy()}.
//
// @visibility drawing
//<
destroy : function (destroyingAll) {
    this.Super("destroy", arguments);

    // if we're already destroyed don't do it again
    if (this.destroyed) return;

    // set a flag so we don't do unnecessary work during a destroy()
    this.destroying = true;

    this.erase(destroyingAll);

    // clear our global ID (removes the window.ID pointer to us)
    isc.ClassFactory.dereferenceGlobalID(this);
    
    this.destroyed = true;
},

//> @attr drawItem.destroyed (boolean : null : RA)
// Flag indicating a drawItem has been destroyed, similar to +link{canvas.destroyed}.
// @visibility drawing
//<

//> @attr drawItem.destroying (boolean : null : RA)
// Flag indicating a drawItem is mid-destruction, similar to +link{canvas.destroying}.
// @visibility drawing
//<

//--------------------------------------------------------------------------------
//  DrawItem renderers
//  These convenience methods handle the line (stroke) and fill attributes for all
//  primitives. Override these in subclasses for more advanced compound element
//  renderings.
//  NOTE: empty string is supported for no color (transparent) fillColor and
//      lineColor, so subclasses can specify transparency
//--------------------------------------------------------------------------------

// NB: draw() relies on this structure to access stroke (firstChild) and fill (nextSibling)
// elements without IDs
_getElementVML : function (id) {
    var fill = " ON='false", shadow = " ON='false", vector, angle, color1, color2, colors = "", percent; 
    if (this.shadow) {
        shadow = " ON='true' COLOR='" + this.shadow.color + "' OFFSET='" + this.shadow.offset[0] + "pt," + this.shadow.offset[1] + "pt";
    }
    if (this.fillGradient) {
        var def = typeof(this.fillGradient) === 'string' ? this.drawPane.gradients[this.fillGradient] : this.fillGradient;
        if (typeof(def.direction) === 'number' || def.x1 || typeof(def.x1) === 'number') {
                vector = this._normalizeLinearGradient(def,this.getBoundingBox());
                angle = def.direction || 180*Math.atan2((vector[3]-vector[1]),(vector[2]-vector[0]))/Math.PI;
                angle = (270 - angle) % 360;
                colors = "' COLORS='";
                if (def.startColor && def.endColor) {
                    colors += '0% ' + def.startColor + ', 100% ' + def.endColor;
                } else if (def.colorStops && def.colorStops.length) {
                    for(var i = 0; i < def.colorStops.length; ++i) {
                        var colorstop = def.colorStops[i];
                        if (typeof(colorstop.offset) === 'string' && colorstop.offset.endsWith('%')) {
                            percent = colorstop.offset;
                        } else {
                            percent = colorstop.offset;
                        }
                        colors += percent + ' ' + colorstop.color;
                        if (i < def.colorStops.length - 1) {
                            colors += ", ";
                        }
                    }
                }
                fill = " TYPE='gradient' ANGLE='" + angle + colors;
        } else {
                colors = "' COLORS='";
                for(var i = 0; i < def.colorStops.length; ++i) {
                    var colorstop = def.colorStops[i];
                    if (typeof(colorstop.offset) === 'string' && colorstop.offset.endsWith('%')) {
                        percent = colorstop.offset;
                    } else {
                        percent = parseFloat(colorstop.offset)*100 + '%';
                    }
                    colors += percent + ' ' + colorstop.color;
                    if (i < def.colorStops.length - 1) {
                        colors += ", ";
                    }
                }
                fill = " TYPE='gradienttitle' OPACITY='1.0' FOCUS='100%' FOCUSSIZE='0,0' FOCUSPOSITION='0.5,0.5' METHOD='linear" + colors;
        }
    } else if (this.fillColor && !isc.isAn.emptyString(this.fillColor)) {
        fill = " COLOR='" + this.fillColor;
    }
    var vmlElem = isc.SB.concat(
            this.drawPane.startTagVML(this.vmlElementName), 
            " onmousedown='return ", this.drawPane.getID(), ".mouseDown();' ",
            " ID='", id, "' ",
            this.getAttributesVML(), ">", 
            this.drawPane.startTagVML('STROKE'),
            ((this.lineColor && this.lineColor != "") ? 
                " COLOR='" + this.lineColor : " ON='false"),
            // manually adjust lineWidth for global zoom
            "' WEIGHT='", this.lineWidth * this.drawPane.zoomLevel, "px", 
            "' OPACITY='", this.lineOpacity,
            "' DASHSTYLE='", this.linePattern,
            "' JOINSTYLE='miter' MITERLIMIT='8.0",
            "' ENDCAP='" + ((this.lineCap=="butt") ? "flat" : this.lineCap),
            // arrowHeads
            (this.startArrow ? "' STARTARROW='" + this.startArrow + "' STARTARROWWIDTH='wide": ""),
            (this.endArrow ? "' ENDARROW='" + this.endArrow + "' ENDARROWWIDTH='wide": ""),
            "'/>",this.drawPane.startTagVML('FILL'),
            fill,
            "' OPACITY='", this.fillOpacity,
            "'/>", 
            this.drawPane.startTagVML('SHADOW'),
            shadow,
            "'/>",
            this.drawPane.endTagVML(this.vmlElementName));
    return vmlElem;
},

getAttributesVML : function () {
    return "" // implement in subclasses
},

// NB: must be lowercase!
// NOTE: don't bother templating SVG yet, as in Moz it has little impact
_getElementSVG : function (id) {
    var svgElem, fill = "none", center = this.getCenter();
    if (this.fillGradient) {
      var gradient = this.fillGradient;
      if (typeof(gradient) === 'object') {
          if (typeof(gradient.direction) === 'number') {
              this._normalizeLinearGradient(gradient,this.getBoundingBox());
              gradient = this.drawPane.createSimpleGradient(id+"_gradient", gradient);
          } else if (typeof(gradient.x1) === 'number') {
              gradient = this.drawPane.createLinearGradient(id+"_gradient", gradient);
          } else {
              gradient = this.drawPane.createRadialGradient(id+"_gradient", gradient);
          }
      }
      fill = "url(#" + gradient + ")";
    } else if (this.fillColor && this.fillColor.length) {
      fill = this.fillColor;
    }
    if (!isc.Browser.isWebKit) {
      svgElem = "<" + this.svgElementName + " id='" + id + "' " +
            this.getAttributesSVG() +
            " stroke-width='" + this.lineWidth + "px" +
            "' stroke='" + ((this.lineColor && this.lineColor != "") ? this.lineColor : "none") +
            "' stroke-opacity='" + this.lineOpacity +
            "' stroke-dasharray='" + this._getSVGDashArray() +
            "' stroke-linecap='" + this.lineCap +
            // arrowHeads
            (this.startArrow && !this._drawLineStartArrow()
                ? "' marker-start='url(#" + this._getSVGStartArrowID() + ")" : "") +
            (this.endArrow && !this._drawLineEndArrow()
                ? "' marker-end='url(#" + this._getSVGEndArrowID() + ")" : "") +
            ((this.rotation && center && center.length === 2)
                ? "' transform='translate(" + center[0] + "," + center[1] +  ") rotate(" + this.rotation + ") translate(" + -center[0] + "," + -center[1] + ")" : "") +
            "' fill='" + fill + 
            "' fill-opacity='" + this.fillOpacity +
            // contents initially used for text elements only
            "'>" + (this.contents || "") + "</" + this.svgElementName + ">"
    } else {
      svgElem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", this.svgElementName);
      svgElem.setAttributeNS(null,"id",id);
      svgElem.setAttributeNS(null,"stroke-width",this.lineWidth+"px");
      svgElem.setAttributeNS(null,"stroke-opacity",this.lineOpacity);
      svgElem.setAttributeNS(null,"stroke-dasharray",this._getSVGDashArray());
      svgElem.setAttributeNS(null,"stroke-linecap",this.lineCap);
      svgElem.setAttributeNS(null,"stroke",this.lineColor || "none");
      svgElem.setAttributeNS(null,"fill",fill);
      svgElem.setAttributeNS(null,"fill-opacity",this.fillOpacity);
      if (this.rotation) {
        svgElem.setAttributeNS(null, "transform", "translate(" +  center[0]  + "," + center[1] + ") rotate("+this.rotation+") translate("  +  -center[0] + "," + -center[1] + ")");
      }
      if (this.startArrow && !this._drawLineStartArrow()) {
          svgElem.setAttributeNS(null,"markerStart","url(#"+this._getSVGStartArrowID()+")");
      }
      if (this.endArrow && !this._drawLineEndArrow()) {
          svgElem.setAttributeNS(null,"markerEnd","url(#"+this._getSVGEndArrowID()+")");
      }
      var attrs, attr;
      if (this.getAttributesSVG().match(/=/g).length === 1) {
          attr = this.getAttributesSVG().split('=');
          svgElem.setAttributeNS(null,attr[0],attr[1].replace(/'/g,""));
      } else {
          attrs = this.getAttributesSVG().split(/\s/);
          for (var i = 0;i < attrs.length; ++i) {
            attr = attrs[i].split('=');
            svgElem.setAttributeNS(null,attr[0],attr[1].replace(/'/g,""));
          }
      }
    }
    return svgElem;
},


getAttributesSVG : function () {
    return "" // implement in subclasses
},

_normalizeLinearGradient : function(def, boundingBox) {
    // convert percentages to absolute values within the bounding box
    var arr = [], width=Math.abs(boundingBox[2]-boundingBox[0]), height=Math.abs(boundingBox[3]-boundingBox[1]);
    if (typeof(def.direction) === 'number') {
      var distance = Math.round(Math.sqrt(width*width + height*height));
      var radians = def.direction*Math.PI/180.0;
      def.x1 = boundingBox[0];
      def.x2 = boundingBox[0] + distance*Math.cos(radians);
      def.y1 = boundingBox[1];
      def.y2 = boundingBox[1] + distance*Math.sin(radians);
    }
    if (typeof(def.x1) === 'string' && def.x1.endsWith('%')) {
        arr.push(boundingBox[0] + parseFloat(def.x1) * width / 100.0);
    } else if (isc.isA.Number(def.x1)) {
        arr.push(def.x1);
    }
    if (typeof(def.y1) === 'string' && def.y1.endsWith('%')) {
        arr.push(boundingBox[1] + parseFloat(def.y1) * height / 100.0);
    } else if (isc.isA.Number(def.y1)) {
        arr.push(def.y1);
    }
    if (typeof(def.x2) === 'string' && def.x2.endsWith('%')) {
        arr.push(boundingBox[0] + parseFloat(def.x2) * width / 100.0);
    } else if (isc.isA.Number(def.x2)) {
        arr.push(def.x2);
    }
    if (typeof(def.y2) === 'string' && def.y2.endsWith('%')) {
        arr.push(boundingBox[1] + parseFloat(def.y2) * height / 100.0);
    } else if (isc.isA.Number(def.y2)) {
        arr.push(def.y2);
    }
    return arr;
},

_normalizeRadialGradient : function(def, boundingBox) {
    // convert percentages to absolute values using the bounding box values
    var arr = [], r;
    var center = this.getCenter();
    if (typeof(def.fx) === 'string') {
        if(def.fx.endsWith('%')) {
            arr.push(center[0] + (parseFloat(def.fx) / 100.0));
        } else {
            arr.push(center[0] + parseFloat(def.fx));
        }
    } else {
        arr.push(center[0] + def.fx);
    }
    if (typeof(def.fy) === 'string') {
        if(def.fy.endsWith('%')) {
            arr.push(center[1] + (parseFloat(def.fy) / 100.0));
        } else {
            arr.push(center[1] + parseFloat(def.fy));
        }
    } else {
        arr.push(center[1] + def.fy);
    }
    arr.push(0);
    if (typeof(def.cx) === 'string' && isc.isA.Number(boundingBox[0])) {
        if(def.cx.endsWith('%')) {
            arr.push(boundingBox[0]-Math.round(boundingBox[0]*parseInt(def.cx)/100.0));
        } else {
            arr.push(center[0] + parseInt(def.cx));
        }
    } else {
        arr.push(center[0] + def.cx);
    }
    if (typeof(def.cy) === 'string' && isc.isA.Number(boundingBox[1])) {
        if(def.cx.endsWith('%')) {
            arr.push(boundingBox[1]-Math.round(boundingBox[1]*parseInt(def.cy)/100.0));
        } else {
            arr.push(center[1] + parseInt(def.cy));
        }
    } else {
        arr.push(center[1] + def.cy);
    }
    if (typeof(def.r) === 'string' && isc.isA.Number(boundingBox[0]) && isc.isA.Number(boundingBox[1])) {
        r = Math.sqrt(Math.pow(boundingBox[2]-boundingBox[0],2) + Math.pow(boundingBox[3]-boundingBox[1],2));
        if(def.r.endsWith('%')) {
            arr.push(r * parseFloat(def.r) / 100.0);
        } else {
            arr.push(r * parseFloat(def.r));
        }
    } else {
        arr.push(def.r);
    }
    return arr;
},

_drawLinePattern : function (x1, y1, x2, y2, context) {
    var dashArray=[10,5], dashCount = dashArray.length, dx = (x2-x1), dy = (y2-y1);
    var slope = dy/dx;
    var distRemaining = Math.sqrt( dx*dx + dy*dy );
    var dashIndex=0, dashLength, xStep, draw=true;
    switch(this.linePattern.toLowerCase()) {
      default:
      case "dash":
        dashArray=[10,10];
        break;
      case "dot":
        dashArray=[1,10];
        break;
      case "longdash":
        dashArray=[20,10];
        break;
      case "shortdash":
        dashArray=[10,5];
        break;
      case "shortdot":
        dashArray=[1,5];
        break;
    }
    var xpositive = true;
    if(x2<x1) {
      xpositive = false;
    }
    this.bmMoveTo(x1, y1, context);
    while (distRemaining>=0.1){
      dashLength = dashArray[dashIndex++%dashCount];
      if (dashLength > distRemaining) {
          dashLength = distRemaining;
      }
      xStep = Math.sqrt( dashLength*dashLength / (1 + slope*slope) );
      if(xpositive) {
          x1 += xStep;
      } else {
          x1 -= xStep;
      }
      y1 += slope*xStep;
      this[draw ? 'bmLineTo' : 'bmMoveTo'](x1,y1,context);
      distRemaining -= dashLength;
      draw = !draw;
    }
},

drawStroke : function (context) {
    context.lineWidth = this.lineWidth;
    context.lineCap = this.lineCap;
    context.strokeStyle = this.lineColor;
    context.globalAlpha = this.lineOpacity;
    context.beginPath();
    this.drawBitmapPath(context);
    context.stroke();
},

// Note: stroke and fill are each path-ending operations.
// if transparent line or fill color (false, null, empty string), avoid drawing fill or
// filling.
// subclasses are intended to implement drawBitMapPath and have a series of lineTo(), arcTo()
// et al calls
drawBitmap : function (context) {
    context.save();
    try {
        if (this.drawPane && (this.drawPane.zoomLevel || this.drawPane.translate || this.drawPane.rotation)) {
            context.setTransform(1,0,0,1,0,0);
            if (this.drawPane.translate) {
                context.translate(this.drawPane.translate[0], this.drawPane.translate[1]);
            }
/*
            if (this.drawPane.zoomLevel) {
                context.scale(this.drawPane.zoomLevel, this.drawPane.zoomLevel);
            }
            if (this.drawPane.rotation) {
                context.rotate(this.drawPane.rotation*Math.PI/180.0);
            }
*/
        }
        if (this.translate) {
            context.translate(this.translate[0], this.translate[1]);
        }
        if (this.scale && this.scale.length === 2) {
            context.scale(this.scale[0], this.scale[1]);
        }
        if (this.rotation && !isc.isA.DrawLabel(this)) {
            var center = this.getCenter && this.getCenter();
            if (center && center.length === 2) {
              context.translate(center[0], center[1]);
              context.rotate(this.rotation*Math.PI/180.0);
              context.translate(-center[0], -center[1]);
            }
        }
        var fill = this.fillColor, def, vector, offset;
        if (this.fillGradient) {
            def = typeof(this.fillGradient) === 'string' ? this.drawPane.gradients[this.fillGradient] : this.fillGradient;
            if (typeof(def.direction) === 'number' || def.x1 || typeof(def.x1) === 'number') {
                vector = this._normalizeLinearGradient(def,this.getBoundingBox());
                fill = context.createLinearGradient(vector[0],vector[1],vector[2],vector[3]);
            } else {
                vector = this._normalizeRadialGradient(def,this.getBoundingBox());
                fill = context.createRadialGradient(vector[0],vector[1],vector[2],vector[3],vector[4],vector[5]);
            }
            if (def.startColor && def.endColor) {
                fill.addColorStop(0.0,def.startColor);
                fill.addColorStop(1.0,def.endColor);
            } else if (def.colorStops && def.colorStops.length) {
              for (var i = 0; i < def.colorStops.length; ++i) {
                  offset = def.colorStops[i].offset;
                  if (typeof(offset) === 'string' && offset.endsWith('%')) {
                      offset = parseFloat(offset.substring(0,offset.length-1)) / 100.0;
                  } 
                  fill.addColorStop(offset,def.colorStops[i].color);
              }
            }
        }    
        if (this.shadow) {
            context.shadowColor = this.shadow.color;
            context.shadowBlur = this.shadow.blur;
            context.shadowOffsetX = this.shadow.offset[0];
            context.shadowOffsetY = this.shadow.offset[1];
        }
        if (fill) {
            context.fillStyle = fill;
            context.globalAlpha = this.fillOpacity;
            context.beginPath();
            this.drawBitmapPath(context);
            context.fill();
        }
        if (this.lineColor || this.shadow) {
            this.drawStroke(context);
        }
    } catch (e) {
        if (!isc.Log.supportsOnError) this._reportJSError(e);
        else this.logWarn("exception during drawBitmap(): " + e);
    }
    context.restore();
},


//--------------------------------------------------------------------------------
//  Arrowhead support for SVG
//--------------------------------------------------------------------------------
//  In VML, the <stroke> element's startarrow/endarrow can be set to an arrow type, which
//  provide:
//
//      -- automatic sizing, positioning, and rotation
//      -- 3 width x 3 height sizing options
//      -- automatic color and opacity matching
//      -- automatic clipping of line ends to avoid overlap (eg when the arrow is narrower than
//         the line)
//      -- hinting (at least for fine lines, ie, arrowheads do not get smaller below
//          a line width of ~2.5px, so you can still see them as arrowheads)
//
//  SVG supports arrowheads via a more generic "marker" system, where you define shapes in
//  <marker> elements and then attach those markers to points of a path. The SVG system
//  is more flexible, but very very diffcult to implement even a single arrowhead style with
//  all of the expected behaviors. Basically SVG will do:
//
//      -- automatic sizing (but no hinting)
//      -- automatic positioning (but no clipping of the path ends)
//      -- automatic rotation
//
//  Long-term, it might make sense to build our own arrowhead subsystem from the ground up;
//  then it will also work with CANVAS, and provide more customization with VML.
//  The SVG spec provides a basic description of the marker algorithm at:
//      http://www.w3.org/TR/SVG/painting.html#MarkerAlgorithm
//
//  But for now, we just want to get a single arrowhead type working in both SVG and VML. So
//  we are use the built-in "block" arrowhead in VML, and we implement the following logic
//  for markers in SVG:
//
//      1. generate marker elements (NB: no memory management/destroy yet!)
//              see methods immediately below
//
//      2. match marker color/opacity to shape lineColor/lineOpacity
//              see setLineColor() and setLineOpacity()
//
//      3. shorten path ends to avoid line/arrowhead overflow
//              specific to DrawLine and DrawPath components?
//
//      4. (future) use fixed-minimum-size markers for thin lines
//              see setLineWidth()
//
// Some FFSVG 1.5 limitations/notes:
//   -- marker-start and marker-end apparently get the same orientation on a line. not sure if
//      this is a Moz bug, or intended behavior. currently generating separate start and end
//      marker elements to work around this.
//   -- you can write marker-end by itself in the initial SVG fragment and it will be respected,
//      but you cannot set the marker-end attribute directly unless marker-start has been set.
//      workaround: set marker-start, set marker-end, clear marker-start
//      note: not seeing this any more...maybe my mistake
//
// TODO multiple arrowhead types and sizes


// Return the DOM ID for this SVG marker element, calling _drawArrowMarkerSVG() if necessary to
// create a new element. Check that startArrow is not null before calling. Side effects:
//      - sets _svgStartArrowId to the returned ID
//      - sets or clears _svgStartArrowHandle, a handle to the arrow shape that
//          is used to synch color and opacity in setLineColor() and setLineOpacity()
//      - generates a new marker in the SVG DOM if necessary
// This method is a bit messy to allow for startArrow being either an arrowStyle (normal usage)
// or an element ID (advanced usage to share a marker across multiple drawItems).
_getSVGStartArrowID : function () {
    if (this._svgStartArrowID) { // already have a marker element 
        // case 1 - just enable it
        if (this.startArrow == "block") return this._svgStartArrowID;
        // case 2 - replace with another existing marker
        if (this._svgDocument.getElementById(this.startArrow)) {
            this._svgStartArrowID = this.startArrow;
            this._svgStartArrowHandle = null; // NB: we assume this marker is shared 
        } else {
            this.logWarn("SVG marker '" + this.startArrow + "' does not exist; ignoring");
        }
    } else { // no marker element yet
        // case 1 - no valid marker ID provided, so create it now
        if (this.startArrow === "block" || !this._svgDocument.getElementById(this.startArrow)) {
            this._svgStartArrowID = "isc_DrawItem_" + this.drawItemID + "_startArrow";
            this._svgStartArrowHandle = this._drawArrowMarkerSVG(
                this._svgStartArrowID, this.lineColor, this.lineOpacity, true
            );
        // case 2 - using an existing marker
        } else {
            this._svgStartArrowID = this.startArrow;
            // NB: we assume this marker is shared, so we do not set _svgStartArrowHandle
        }
    }
    // NB: startArrow supports marker ID for setting only; convert to normal setting now
    this.startArrow = "block"; 
    return this._svgStartArrowID;
},
// duplicate implementation for endArrow markers - see comments for _getSVGStartArrowID()
_getSVGEndArrowID : function () {
    if (this._svgEndArrowID) {
        if (this.endArrow == "block") return this._svgEndArrowID; // same
        if (this._svgDocument.getElementById(this.endArrow)) {
            this._svgEndArrowID = this.endArrow; // replace with another
            this._svgEndArrowHandle = null;
        } else {
            this.logWarn("SVG marker '" + this.endArrow + "' does not exist; ignoring");
        }
    } else {
        if (this.endArrow == "block" || !this._svgDocument.getElementById(this.endArrow)) {
            this._svgEndArrowID = "isc_DrawItem_" + this.drawItemID + "_endArrow"; // create new
            this._svgEndArrowHandle = this._drawArrowMarkerSVG(
                this._svgEndArrowID, this.lineColor, this.lineOpacity, false // NB: negated flag
            );
        } else {
            this._svgEndArrowID = this.endArrow; // use existing
        }
    }    
    this.endArrow = "block";
    return this._svgEndArrowID;
},

// Create a new SVG marker element for this arrowhead, and return a handle directly to the
// shape (path) of the marker, so associated drawItem(s) can easily change the marker's
// color, opacity, etc to match (see setLineOpacity() and setLineColor() below).
// TODO Actually create TWO marker elements - one that automatically sizes to match the stroke
//      width, and one that draws at a fixed size for small stroke widths. This hinting will
//      need to be accommodated in the code that shortens lines to accommodate arrowheads
// TODO customizable arrow head appearance; currently this is a hardcoded block-style arrow head
// TODO move this logic to DrawPane; markers may be shared across DrawItems
// TODO MEMORY MANAGEMENT; currently markers are not destroyed; this will be tricky if they
//      are shared
_drawArrowMarkerSVG : function (id, color, opacity, start) {
    var markerSVG;
    if (!isc.Browser.isWebKit) {
        markerSVG = "<marker id='" + id +
            "' viewBox='0 0 10 10' refY='5' refX='" + (start ? "10" : "0") +
            "' orient='auto' markerUnits='strokeWidth' markerWidth='4' markerHeight='3'><path d='" +
            (start ? "M 10 0 L 0 5 L 10 10 z" : "M 0 0 L 10 5 L 0 10 z") +
            "' fill='" + ((color && color != "") ? color : "none") +
            "' fill-opacity='" + opacity +
            "' stroke-width='0px'/></marker>";
        var range = this._svgDocument.createRange();
        range.setStart(this._svgDefs, 0);
        this._svgDefs.appendChild(range.createContextualFragment(markerSVG));
    } else {
        markerSVG = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "marker");
        markerSVG.setAttributeNS(null,"id",id);
        markerSVG.setAttributeNS(null,"viewBox","0 0 10 10");
        markerSVG.setAttributeNS(null,"refY","5");
        markerSVG.setAttributeNS(null,"refX",(start ? "10" : "0"));
        markerSVG.setAttributeNS(null,"orient","auto");
        markerSVG.setAttributeNS(null,"markerUnits","strokeWidth");
        markerSVG.setAttributeNS(null,"markerWidth","4");
        markerSVG.setAttributeNS(null,"markerHeight","3");
        var pathSVG = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "path");
        pathSVG.setAttributeNS(null,"d", (start ? "M 10 0 L 0 5 L 10 10 z" : "M 0 0 L 10 5 L 0 10 z"));
        pathSVG.setAttributeNS(null,"fill",  ((color && color != "") ? color : "none") );
        pathSVG.setAttributeNS(null,"fillOpacity",  opacity);
        pathSVG.setAttributeNS(null,"strokeWidth",  "0px");
        markerSVG.appendChild(pathSVG);
        this._svgDefs.appendChild(markerSVG);
    }
    return this._svgDefs.lastChild.firstChild; 
},

//--------------------------------------------------------------------------------
//  visibility
//--------------------------------------------------------------------------------

//> @method drawItem.show()
// Make this drawItem visible.
// @visibility drawing
//<
show : function () {
    this.hidden = false;
    if (this.drawingVML) {
        this._vmlHandle.style.visibility = "visible";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "visibility", "visible");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.hide()
// Hide this drawItem.
// @visibility drawing
//<
hide : function () {
    this.hidden = true;
    if (this.drawingVML) {
        this._vmlHandle.style.visibility = "hidden";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "visibility", "hidden");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//--------------------------------------------------------------------------------
//  line & fill
//--------------------------------------------------------------------------------

//> @method drawItem.setLineWidth()
// Update lineWidth for this drawItem.
// @param width (int) new pixel lineWidth
// @visibility drawing
//<
setLineWidth : function (width) {
    if (width != null) this.lineWidth = width;
    if (this.drawingVML) {
        // NB: applying zoom correction - so this method is for external callers ONLY
        this._setLineWidthVML(this.lineWidth * this.drawPane.zoomLevel);
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-width", this.lineWidth+"px");
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray()); // see _getSVGDashArray
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},
// split out so internal callers can apply zoom correction
_setLineWidthVML : function (width) {
    if (this._vmlStrokeHandle) {
        this._vmlStrokeHandle.weight = width+"px";
    }
},

//> @method drawItem.setLineColor()
// Update lineColor for this drawItem.
// @param color (CSSColor) new line color.  Pass null for transparent.
// @visibility drawing
//<
setLineColor : function (color) {
    this.lineColor = color;
    if (this.drawingVML) {
        if (this.lineColor && this.lineColor != "") {
            this._vmlStrokeHandle.on = true;
            this._vmlStrokeHandle.color = this.lineColor;
        } else {
            this._vmlStrokeHandle.on = false;
        }
    } else if (this.drawingSVG) {
        var color = (this.lineColor && this.lineColor != "") ? this.lineColor : "none"
        this._svgHandle.setAttributeNS(null, "stroke", color);
        // change arrowhead colors too
        if (this._svgStartArrowHandle) {
            this._svgStartArrowHandle.setAttributeNS(null, "stroke", color);
            this._svgStartArrowHandle.setAttributeNS(null, "fill", color);
        }
        if (this._svgEndArrowHandle) {
            this._svgEndArrowHandle.setAttributeNS(null, "stroke", color);
            this._svgEndArrowHandle.setAttributeNS(null, "fill", color);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.setLineOpacity()
// Update lineOpacity for this drawItem.
// @param opacity (float) new opacity, as a number between 0 (transparent) and 1 (opaque).
// @visibility drawing
//<
setLineOpacity : function (opacity) {
    if (opacity != null) this.lineOpacity = opacity;
    if (this.drawingVML) {
        this._vmlStrokeHandle.opacity = this.lineOpacity;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
        // change arrowhead opacity too
        if (this._svgStartArrowHandle) {
            this._svgStartArrowHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
            this._svgStartArrowHandle.setAttributeNS(null, "fill-opacity", this.lineOpacity);
        }
        if (this._svgEndArrowHandle) {
            this._svgEndArrowHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
            this._svgEndArrowHandle.setAttributeNS(null, "fill-opacity", this.lineOpacity);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.setLinePattern()
// Update linePattern for this drawItem.
// @param pattern (LinePattern) new linePattern to use
// @visibility drawing
//<
setLinePattern : function (pattern) {
    this.linePattern = pattern;
    if (this.drawingVML) {
        this._vmlStrokeHandle.dashstyle = this.linePattern;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray());
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO should at least experiment with pattern paints for h/v lines)
    }
},
// Maps to emulate the preset VML dashstyles using the more powerful (but raw) SVG stroke-dasharray
// attribute. Dash and gap sizes here are multiples of lineWidth, regardless of the lineCap type.  
// VML also provides shortdashdot, shortdashdotdot, dashdot, longdashdot, longdashdotdot; not
// currently emulated. To emulate a dashdot pattern will require 4 values (1 dash, 1 dot, 2 gaps);
// dashdotdot patterns will require 6 values.
_linePatternDashSizeMap : {shortdot:1, dot:1, shortdash:3, dash:4, longdash:8},
_linePatternGapSizeMap : {shortdot:1, dot:3, shortdash:1, dash:3, longdash:3},
// NB: We must take lineWidth and lineCap into account to emulate the VML behavior
//      in SVG, so setLineWidth() and setLineCap() must also reset stroke-dasharray.    
_getSVGDashArray : function () {
    var lp = this.linePattern;
    if (!lp || lp == "solid" || lp == "") return "none";
    // for SVG only - Take an array of dash-gap patterns for maximum flexibility. Dash-gap patterns
    // are specified in VML (eg "4 2 1 2" for dash-dot), but they appear to be broken, at least in
    // my IE6xpsp2.
    // TODO someone else try VML dash-gap patterns (not using this join code!) in case I missed something
    // TODO could process this array to adapt to lineWidth/lineCap, as we do for the preset patterns
    if (isc.isAn.Array(lp)) return lp.join("px,")+"px";
    var dashSize = this._linePatternDashSizeMap[lp];
    var gapSize = this._linePatternGapSizeMap[lp];
    // At least in FFSVG, "round" or "square" caps extend into the gap, effectively stealing
    // 1 lineWidth from the gap size and adding it to the dash size, so we compensate here.
    if (this.lineCap != "butt") { // implies "round" or "square"
        // At least in FFSVG, the SVG renderer throws a scribble fit on a zero dash size, and 
        // loses parts of the line on very small dash sizes. 0.1px seems OK for now.
        dashSize = Math.max(0.1, dashSize-1);
        gapSize++;
    }
    return (dashSize*this.lineWidth)+"px,"+(gapSize*this.lineWidth)+"px";
},


//> @method drawItem.setLineCap()
// Update lineCap for this drawItem.
// @param cap (LineCap) new lineCap to use
// @visibility drawing
//<
setLineCap : function (cap) {
    if (cap != null) this.lineCap = cap;
    if (this.drawingVML) {
        this._vmlStrokeHandle.endcap = (this.lineCap=="butt") ? "flat" : this.lineCap;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-linecap", this.lineCap);
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray()); // see _getSVGDashArray
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setShadow(shadow)
// Update shadow for this drawItem.
// @param shadow (Shadow) new shadow
// @visibility drawing
//<
setShadow: function (shadow) {
    if (shadow != null) {
        this.shadow = shadow;
    }
    if (this.drawingVML) {
    } else if (this.drawingSVG) {
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// Arrowheads
// ---------------------------------------------------------------------------------------

//> @method drawItem.setStartArrow()
// Set the arrowhead at the beginning of this path.
// @param arrowStyle (ArrowStyle) style of arrow to use
// @visibility drawing
//<
// NOTE: we support passing an SVG marker element ID as startArrow so we can reuse the same
// arrowheads for multiple drawItems. Note that element IDs are supported for setting only;
// if you read startArrow after draw() it will always be an arrow style.
setStartArrow : function (startArrow) {    
    var wasLineArrow = this._drawLineStartArrow();    
    var undef;
    if (startArrow !== undef) this.startArrow = startArrow;
    else startArrow = this.startArrow;
    
    var isLineArrow = this._drawLineStartArrow(); 

    if (wasLineArrow != isLineArrow) {
        this.setStartPoint();
    }
    // suppress rendering native block arrows with special line-arrows
    if (isLineArrow) startArrow = null;
   
    if (this.drawingVML) {
        this._vmlStrokeHandle.startarrow = (startArrow ? startArrow : "none");
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "marker-start",
            (startArrow ? "url(#" + this._getSVGStartArrowID() + ")" : "none")
        );
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO could implement if there is demand - see arrowhead notes)
    }
},

//> @method drawItem.setEndArrow()
// Set the arrowhead at the end of this path.
// @param arrowStyle (ArrowStyle) style of arrow to use
// @visibility drawing
//<
setEndArrow : function (endArrow) {
    var wasLineArrow = this._drawLineEndArrow();
    var undef;
    if (endArrow !== undef) this.endArrow = endArrow;
    else endArrow = this.endArrow;
    
    var isLineArrow = this._drawLineEndArrow();
    if (wasLineArrow != isLineArrow) {
        this.setEndPoint()
    }
    
    if (isLineArrow) endArrow = null;
    if (this.drawingVML) {
        this._vmlStrokeHandle.endarrow = (endArrow ? endArrow : "none");
    } else if (this.drawingSVG) {            
        this._svgHandle.setAttributeNS(null, "marker-end",
            (endArrow ? "url(#" + this._getSVGEndArrowID() + ")" : "none")
        );
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO could implement if there is demand - see arrowhead notes)
    }
},
//> @method drawItem.moveBy()
// Move the shape by the specified deltas for the left and top coordinate.
//
// @param dX (int) change to left coordinate in pixels
// @param dY (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (dX, dY) {
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }
},
//> @method drawItem.resizeBy()
// Resize the shape by the specified deltas for the left and top coordinate.
//
// @param dX (int) change to left coordinate in pixels
// @param dY (int) change to top coordinate in pixels
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }
},

//> @method drawItem.rotateBy()
// Rotate the shape by the relative rotation in degrees
// @param degrees (float) number of degrees to rotate from current orientation.
// @visibility drawing
//<
rotateBy : function (degrees) {
    this.rotation += degrees;
    if (this.drawingVML) {
        this._vmlHandle.style.rotation = this.rotation;
    } else if (this.drawingSVG) {
        var center = this.getCenter();
        this._svgHandle.setAttributeNS(null, "transform", "translate(" +  center[0]  + "," + center[1] + ") rotate("+this.rotation+") translate("  +  -center[0] + "," + -center[1] + ")");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.rotated(degrees);
},

//> @method drawItem.rotateTo()
// Rotate the shape by the absolute rotation in degrees
// @param degrees (float) number of degrees to rotate
// @visibility drawing
//<
rotateTo : function (degrees) {
    this.rotateBy(degrees - this.rotation);
},

//> @method drawItem.scaleBy()
// Scale the shape by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleBy : function (x, y) {
    this.scale = this.scale || [];
    this.scale[0] = x;
    this.scale[1] = y;
    if (this.drawingVML) {
    } else if (this.drawingSVG) {
        var transform = "scale("+this.scale[0]+","+this.scale[1]+") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.scaled();
},

//> @method drawItem.scaleTo()
// Scale the shape by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleTo : function (x, y) {
    this.scaleBy(x, y);
},

// Fill
// ---------------------------------------------------------------------------------------

//> @method drawItem.setFillColor()
// Update fillColor for this drawItem.
// @param color (CSSColor) new fillColor to use.  Pass null for transparent.
// @visibility drawing
//<
setFillColor : function (color) {
    this.fillColor = color;
    if (this.drawingVML) {
        if (this.fillColor && this.fillColor != "") {
            this._vmlFillHandle.on = true;
            this._vmlFillHandle.color = this.fillColor;
        } else {
            this._vmlFillHandle.on = false;
        }
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill",
            (this.fillColor && this.fillColor != "") ? this.fillColor : "none"
        );
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setFillGradient()
// Update fillGradient for this drawItem.
// @param gradient (Gradient) new gradient to use.  Pass null for transparent.
// @visibility drawing
//<
setFillGradient : function (gradient) {
    this.gradient = gradient;
    if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill",
            (this.fillColor && this.fillColor != "") ? this.fillColor : "none"
        );
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setFillOpacity()
// Update fillOpacity for this drawItem.
// @param opacity (float) new opacity, as a number between 0 (transparent) and 1 (opaque).
// @visibility drawing
//<
setFillOpacity : function (opacity) {
    if (opacity != null) this.fillOpacity = opacity;
    if (this.drawingVML) {
        this._vmlFillHandle.opacity = this.fillOpacity;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill-opacity", this.fillOpacity);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// <canvas> methods wrapped with exception handlers / logging and workarounds as needed
// ---------------------------------------------------------------------------------------

bmMoveTo : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);
    try {
        context.moveTo(left+offset, top+offset); 
    } catch (e) {
        this.logWarn("error on moveTo(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmArc: function (centerPointX, centerPointY, radius, startRadian, endRadian, context) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);

    try {
        context.arc(centerPointX+offset, centerPointY+offset, radius, startRadian, endRadian, false);
    } catch (e) {
        this.logWarn("error on arc(): centerPoint: " + [centerPointX,centerPointY] + 
                     ", radius:" + radius + ", start/end rad:" + [startRadian,endRadian] +  
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmLineTo : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);

    try {
        context.lineTo(left+offset, top+offset); 
    } catch (e) {
        this.logWarn("error on lineTo(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmQuadraticCurveTo : function (x1, y1, x2, y2) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);
    try {
        context.quadraticCurveTo(x1+offset, y1+offset, x2+offset, y2+offset); 
    } catch (e) {
        this.logWarn("error on quadraticCurveTo(): startPoint:" + [x1,y1] + ", endPoint:" + [x2,y2] +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmTranslate : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.translate(left, top); 
    } catch (e) {
        this.logWarn("error on translate(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmRotate : function (angle, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.rotate(angle); 
    } catch (e) {
        this.logWarn("error on translate(): angle: " + angle + 
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmFillText : function (text, left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.fillText(text, left, top); 
    } catch (e) {
        this.logWarn("error on fillText(): text: " + text + 
                     ", left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmStrokeText : function (text, left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.strokeText(text, left, top); 
    } catch (e) {
        this.logWarn("error on fillText(): text: " + text + 
                     ", left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
}

}) // end DrawItem.addProperties

isc.DrawItem.addClassProperties({
    _IDCounter:0,   // for unique DOM IDs
    
    // ControlKnobs: see drawItem.knobs
    // For every knobType "<XXX>" we will call a show<XXX>KnobType() method
    // This method creates and caches these function names centrally (avoids reassembling strings)
    _showKnobsFunctionNameTemplate:["show", ,"Knobs"],
    _hideKnobsFunctionNameTemplate:["hide", ,"Knobs"],
    _getShowKnobsFunctionName : function (knobType, hide) {
        
        if (!this._knobTypeFunctionMap) {
            this._knobTypeFunctionMap = {};
        }
        
        if (this._knobTypeFunctionMap[knobType] == null) {
            knobType = knobType.substring(0,1).toUpperCase() + knobType.substring(1);
            
            this._showKnobsFunctionNameTemplate[1] = knobType;
            this._hideKnobsFunctionNameTemplate[1] = knobType;
            
            this._knobTypeFunctionMap[knobType] = [
                this._showKnobsFunctionNameTemplate.join(isc.emptyString),
                this._hideKnobsFunctionNameTemplate.join(isc.emptyString)
            ];
        }
        return hide ? this._knobTypeFunctionMap[knobType][1] 
                     : this._knobTypeFunctionMap[knobType][0];
    }
});








//------------------------------------------------------------------------------------------
//> @class DrawGroup
//
// DrawItem subclass to manage a group of other DrawItem instances.
// <P> 
// A DrawGroup defines a local coordinate space, so a group of DrawItems may be translated,
// scaled, or rotated together.  A DrawGroup has no visual representation other than that of
// it's DrawItems.
// <P>
// DrawItems are added to a DrawGroup by creating the DrawItems with +link{drawItem.drawGroup}
// set to a drawGroup.
// <P>
// DrawGroups may contain other DrawGroups.
//
// @inheritsFrom DrawItem
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------
// A DrawGroup is like a DrawPane, in that it manages a set of
// drawItems, but it is a DrawItem in that it has position, visibility, scale, and rotation
// (but not any rendering other than that of its contained DrawItems).
/*
DrawGroup further doc/features
- attributes: scale, rotation, visible
- support positioning by at least topleft or center; scale around this point
- what do groups do (translate, scale, rotate, hide/show, erase, [layer, defaults, clip])
- CANVAS - translate, rotate, scale
- SVG - plus matrix, skewX, skewY
- move item between groups
- ungroup/regroup
- selection and edit handles?
*/
isc.defineClass("DrawGroup", "DrawItem").addProperties({

    // NOTE: these doc's are @included elsewhere so should be phrased generically

    //> @attr drawGroup.left      (int : 0 : IRW)
    // Left coordinate in pixels relative to the DrawPane, or owning DrawGroup.
    //
    // @visibility drawing
    //<
    left:0,

    //> @attr drawGroup.top       (int : 0 : IRW)
    // Top coordinate in pixels relative to the DrawPane, or owning DrawGroup.
    //
    // @visibility drawing
    //<
    top:0,

    // NOTE: width/height have no meaning unless/until we implement per-group clipping

    // ---------------------------------------------------------------------------------------
    
    //> @attr drawGroup.drawItems    (Array of DrawItem : null : IR)
    // Initial list of DrawItems for this DrawGroup.
    // <P>
    // DrawItems can be added to a DrawGroup after initialization by setting
    // +link{drawItem.drawGroup}.
    //
    // @visibility drawing
    //<

init : function () {
    if (!this.drawItems) this.drawItems = [];
    this.Super("init");
},

//> @method drawGroup.erase()
// Erases all DrawItems in the DrawGroup.
//
// @visibility drawing
//<
erase : function (erasingAll) {
    // erase grouped items first
    for (var i=0; i<this.drawItems.length; i++) {
        this.drawItems[i].erase(true); // pass erasingAll flag
    }
    this.drawItems = [];
    // then erase this group
    this.Super("erase", arguments);
},

// NB: no stroke and fill subelements for groups
_getElementVML : function (id) {
     
    return isc.SB.concat(
            this.drawPane.startTagVML('FOO'), 
            " onmousedown='return ", this.drawPane.getID(), ".mouseDown();' ",
            " ID='", id, "' ",
            this.getAttributesVML(), ">", 
            this.drawPane.endTagVML(this.vmlElementName));
},

// NB: must be lowercase!
_getElementSVG : function (id) {
    var svgElem;
    if (!isc.Browser.isWebKit) {
      return  "<g id='" + id + "' transform='translate(" + this.left + "," + this.top + ")'></g>"
    } else {
      svgElem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "g");
      svgElem.setAttributeNS(null,"id",id);
      var transform = "translate(" + this.left + "," + this.top + ")";
      svgElem.setAttributeNS(null,"transform", transform);
    }
    return svgElem;
},


drawBitmap : function (context) {
    context.save();
    // context.scale(x, y)
    // context.rotate(angle)
    context.translate(this.left, this.top);
    // same loop as in drawPane.redrawBitmapNow()
    for (var i=0; i<this.drawItems.length; i++) {
        if (!this.drawItems[i].hidden) this.drawItems[i].drawBitmap(context);
    }
    context.restore();
},
drawBitmapPath : function (context) {
    this.bmMoveTo(this.left,this.top);
    this.bmLineTo(this.left+this.width,this.top);
    this.bmLineTo(this.left+this.width,this.top+this.height);
    this.bmLineTo(this.left, this.top+this.height);
    this.bmLineTo(this.left,this.top);
},


// Wipe out the drawItem line and fill attribute setters. drawGroups could conceivably
// be used to set default line and fill properties for their children, but currently they
// do not serve this purpose. If someone blindly called the superclass setters on all drawItems,
// they would error on drawGroups because e.g. there are no VML stroke and fill subelements.
// TODO expand this list as additional setters are added to DrawItem
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")},


//--------------------------------------------------------------------------------
//  position/translation
//--------------------------------------------------------------------------------

//> @method drawGroup.setLeft()
// Set the left coordinate of this drawGroup.  Also moves all member drawItems.
//
// @param left (int) new left coordinate in pixels
// @visibility drawing
//<
setLeft : function (left) {
    if (left != null) this.left = left;
    if (this.drawingVML) {
        this._vmlHandle.coordorigin.x = -this.left;
    } else if (this.drawingSVG) {
        var transform = "translate(" + this.left + "," + this.top + ") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawGroup.setTop()
// Set the top coordinate of this drawGroup.  Also moves all member drawItems.
//
// @param top (int) new top coordinate in pixels
// @visibility drawing
//<
setTop : function (top) {
    if (top != null) this.top = top;
    if (this.drawingVML) {
        this._vmlHandle.coordorigin.y = -this.top;
    } else if (this.drawingSVG) {
        var transform =  "translate(" + this.left + "," + this.top + ") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawGroup.moveTo()
// Set both the left and top coordinate of this drawGroup.  Also moves all member drawItems.
//
// @param left (int) new left coordinate in pixels
// @param top (int) new top coordinate in pixels
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawGroup.moveBy()
// Move this drawGroup by the specified deltas for the left and top coordinate.  Also moves all
// member drawItems.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (dX, dY) {
    this.left += dX;
    this.top += dY;
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.moveBy(dX,dY);
    }
    this.moved(dX, dY);
},

//> @method drawGroup.rotateTo()
// Rotate the group to degrees. This is an absolute rotation and does not consider any existing rotation
//
// @param degrees (float)
// @visibility drawing
//<
rotateTo : function (degrees) {
    this.rotateBy(degrees - this.rotation);
},

//> @method drawGroup.rotateBy()
// Rotate the group by degrees. This is a relative rotation based on any current rotation
// 
//
// @param degrees (integer)
// @visibility drawing
//<
rotateBy : function (degrees) {
    this.rotation += degrees;
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.rotateBy(degrees);
    }
},

//> @method drawGroup.scaleBy()
// Scale all drawItem[] shapes by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleBy : function (x, y) {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.scaleBy(x,y);
    }
},

//> @method drawGroup.getCenter()
// Get the center coordinates of the rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//> @method drawGroup.getBoundingBox()
// Returns the top, left, top+height, left+width 
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

//> @method drawGroup.scaleTo()
// Scale the shape by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleTo : function (x, y) {
    this.scale = this.scale || [];
    this.scale[0] += (this.scale[0]||0) + x;
    this.scale[1] += (this.scale[1]||0) + y;
    this.scaleBy(x, y);
},

//> @method drawGroup.dragStart() (A)
// @include drawItem.dragStart()
//<
dragStart : function (event, info) {
    var bounds = this.getBoundingBox();
    var offsetX = bounds[0];
    var offsetY = bounds[1];
    var normalized = this.drawPane.normalize(event.x,event.y);
    this.dragOffsetX = normalized.x - this.drawPane.getPageLeft() - offsetX;
    this.dragOffsetY = normalized.y - this.drawPane.getPageTop() - offsetY;
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.dragStart(event,info);
    }
    return true;
},

//> @method drawGroup.dragMove() (A)
// @include drawItem.dragMove()
//<
dragMove : function (event, info) {
    var normalized = this.drawPane.normalize(event.x,event.y);
    var x = normalized.x - this.drawPane.getPageLeft() - this.dragOffsetX;
    var y = normalized.y - this.drawPane.getPageTop() - this.dragOffsetY;
    this.moveTo(x,y);
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.dragMove(event,info);
    }
    return true;
},
//> @method drawGroup.dragStop() (A)
// @include drawItem.dragStop()
//<
dragStop : function (event, info) {
    var normalized = this.drawPane.normalize(event.x,event.y);
    var x = normalized.x - this.drawPane.getPageLeft() - this.dragOffsetX;
    var y = normalized.y - this.drawPane.getPageTop() - this.dragOffsetY;
    this.moveTo(x,y);
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.dragStop(event,info);
    }
    return true;
},
//> @method drawGroup.click() (A)
// @include drawItem.click()
//<
click : function() {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.click();
    }
    return true;
},
//> @method drawGroup.mouseDown() (A)
//@include drawItem.mouseDown()
//<
mouseDown : function () {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.mouseDown();
    }
    return true;
},
//> @method drawGroup.mouseUp() (A)
//@include drawItem.mouseUp()
//<
mouseUp : function () {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.mouseUp();
    }
    return true;
},
//> @method drawGroup.mouseMove() (A)
//@include drawItem.mouseMove()
//<
mouseMove : function () {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.mouseMove();
    }
    return true;
},
//> @method drawGroup.mouseOut() (A)
//@include drawItem.mouseOut()
//<
mouseOut : function () {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.mouseOut();
    }
    return true;
},
//> @method drawGroup.mouseOver() (A)
//@include drawItem.mouseOver()
//<
mouseOver : function () {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.mouseOver();
    }
    return true;
}
// end of shape events

}) // end DrawGroup.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawLine
//
//  DrawItem subclass to render line segments.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

//> @object Point
// X/Y position in pixels, specified as an Array with two members, for example: [30, 50]
//
// @visibility drawing
//<
//> @attr point.x (int: 0: IR) 
// The x coordinate of this point.
//
// @visibility drawing
//<
//> @attr point.y (int: 0: IR) 
// The y coordinate of this point.
//
// @visibility drawing
//<

isc.defineClass("DrawLine", "DrawItem").addProperties({
    //> @attr drawLine.startPoint     (Point : [0,0] : IRW)
    // Start point of the line
    // 
    // @visibility drawing
    //<
    startPoint: [0,0], // NB: these arrays are shared by all instances!

    //> @attr drawLine.endPoint       (Point : [100,100] : IRW)
    // End point of the line
    // 
    // @visibility drawing
    //<
    endPoint: [100,100],

    //> @attr drawLine.startLeft      (int : 0 : IR)
    // Starting left coordinate of the line.  Overrides left coordinate of +link{startPoint} if
    // both are set.
    // 
    // @visibility drawing
    //<
//    startLeft:0,

    //> @attr drawLine.startTop       (int : 0 : IR)
    // Starting top coordinate of the line.  Overrides top coordinate of +link{startPoint} if
    // both are set.
    // 
    // @visibility drawing
    //<
//    startTop:0,

    //> @attr drawLine.endLeft        (int : 100 : IR)
    // Ending left coordinate of the line.  Overrides left coordinate of +link{endPoint} if
    // both are set.
    // 
    // @visibility drawing
    //<
//    endLeft:100,

    //> @attr drawLine.endTop         (int : 100 : IR)
    // Ending top coordinate of the line.  Overrides top coordinate of +link{endPoint} if
    // both are set.
    // 
    // @visibility drawing
    //<
//    endTop:100,

    svgElementName: "line",
    vmlElementName: "LINE",
    
init : function () {
    this.startLeft = this.startLeft || this.startPoint[0];
    this.startTop = this.startTop || this.startPoint[1];
    this.endLeft = this.endLeft || this.endPoint[0];
    this.endTop = this.endTop || this.endPoint[1];
    this.Super("init");
},


//----------------------------------------
// SVG arrowhead dependencies
//----------------------------------------

// helper methods to adjust the rendered endpoints of a line to accommodate arrowheads
_getArrowAdjustedPoints : function () {
    if (this.startArrow || this.endArrow) {
        return isc.GraphMath.trimLineEnds(
            this.startLeft, this.startTop, this.endLeft, this.endTop,
            this.startArrow ? this.lineWidth*3 : 0,
            this.endArrow ? this.lineWidth*3 : 0
        );
    } else {
        return [this.startLeft, this.startTop, this.endLeft, this.endTop];
    }
},

// changing the line width or arrows will affect the size
// of the arrows, so call setStartPoint and setEndPoint to update the size of the line segment
// (setStartPoint will take care of the endPoint as well if necessary)
setLineWidth : function (width) {
    this.Super("setLineWidth", arguments);
    if (this.drawingSVG) this.setStartPoint();  
},
setStartArrow : function (startArrow) {
    this.Super("setStartArrow", arguments);
    if (this.drawingSVG) this.setStartPoint();  
},
setEndArrow : function (endArrow) {
    this.Super("setEndArrow", arguments);
    // NB: cannot use setStartPoint here, since we might be clearing endArrow
    if (this.drawingSVG) this.setEndPoint(); 
},


//----------------------------------------
//  DrawLine renderers
//----------------------------------------

getAttributesVML : function () {
    return isc.SB.concat(
          "FROM='", this.startLeft, " ", this.startTop,
            "' TO='", this.endLeft, " ", this.endTop,
            "'");
},

getAttributesSVG : function () {
    // SVG lines must be shortened to accommodate arrowheads
    var points = this._getArrowAdjustedPoints();
    return  "x1='" + points[0] +
            "' y1='" + points[1] +
            "' x2='" + points[2] +
            "' y2='" + points[3] +
            "'";
},

drawBitmapPath : function (context) {
    
    var offset = (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0,
        startLeft = parseFloat(this.startLeft)+offset,
        startTop = parseFloat(this.startTop)+offset,
        endLeft = parseFloat(this.endLeft)+offset,
        endTop = parseFloat(this.endTop)+offset;

    if(this.linePattern.toLowerCase() !== "solid") {
        this._drawLinePattern(startLeft, startTop, endLeft, endTop, context);
    } else {
        this.bmMoveTo(this.startLeft, this.startTop, context);
        this.bmLineTo(this.endLeft, this.endTop, context);
    }
}, 

//----------------------------------------
//  DrawLine attribute setters
//----------------------------------------

// NOTE: setStartPoint/EndPoint doc is @included, use generic phrasing

//> @method drawLine.setStartPoint()
// Update the startPoint
//
// @param left (int) left coordinate for start point, in pixels
// @param left (int) top coordinate for start point, in pixels
// @visibility drawing
//< 
setStartPoint : function (left, top) {
    if (left != null) this.startLeft = left;
    if (top != null) this.startTop = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startLeft + " " + this.startTop;
    } else if (this.drawingSVG) {
        // SVG lines must be shortened to accommodate arrowheads
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x1", points[0]);
        this._svgHandle.setAttributeNS(null, "y1", points[1]);
        if (this.endArrow) { // changing startPoint also changes the angle of the endArrow
            this._svgHandle.setAttributeNS(null, "x2", points[2]);
            this._svgHandle.setAttributeNS(null, "y2", points[3]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawLine.setEndPoint()
// Update the endPoint
//
// @param left (int) left coordinate for end point, in pixels
// @param left (int) top coordinate for end point, in pixels
// @visibility drawing
//< 
setEndPoint : function (left, top) {
    if (left != null) this.endLeft = left;
    if (top != null) this.endTop = top;
    if (this.drawingVML) {
        this._vmlHandle.to = this.endLeft + " " + this.endTop;
    } else if (this.drawingSVG) {
        // SVG lines must be shortened to accommodate arrowheads
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x2", points[2]);
        this._svgHandle.setAttributeNS(null, "y2", points[3]);
        if (this.startArrow) { // changing endPoint also changes the angle of the startArrow
            this._svgHandle.setAttributeNS(null, "x1", points[0]);
            this._svgHandle.setAttributeNS(null, "y1", points[1]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawLine.getBoundingBox()
// Returns the start, end points 
// 
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [].concat(this.startPoint,this.endPoint);
},

//> @method drawLine.getCenter()
// Get the center coordinates of the line
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0]-this.startPoint[0])/2), 
      this.startPoint[1] + Math.round((this.endPoint[1]-this.startPoint[1])/2)];
},

// Support controlKnobs for start/endPoints
// (Documented under DrawKnobs type definition) 
showStartPointKnobs : function () {
    this._startKnob = this.createAutoChild("startKnob",
        {
            _constructor:"DrawKnob",
            x:this.startLeft, y:this.startTop,
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    
    this.observe(this._startKnob, "updatePoints", "observer.setStartPoint(x,y)");
},

hideStartPointKnobs : function () {
    if (this._startKnob) {
        this._startKnob.destroy();
        delete this._startKnob;
    }
},

showEndPointKnobs : function () {
    
    this._endKnob = this.createAutoChild("endKnob",
        {
            _constructor:"DrawKnob",
            x:this.endLeft, y:this.endTop,
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    
    this.observe(this._endKnob, "updatePoints", "observer.setEndPoint(x,y)");
},

hideEndPointKnobs : function () {
    if (this._endKnob) {
        this._endKnob.destroy();
        delete this._endKnob;
    }
},

//> @method drawLine.moveBy()
// Move both the start and end points of the line by a relative amount.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//< 
moveBy : function (x, y) {
    this.startLeft += x;
    this.startTop += y;
    this.endLeft += x;
    this.endTop += y;
    this.startPoint[0] = this.startLeft;
    this.startPoint[1] = this.startTop;
    this.endPoint[0] = this.endLeft;
    this.endPoint[1] = this.endTop;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startLeft + " " + this.startTop;
        this._vmlHandle.to = this.endLeft + " " + this.endTop;
    } else if (this.drawingSVG) {
        // could cache the adjusted points, since their relative positions do not change
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x1", points[0]);
        this._svgHandle.setAttributeNS(null, "y1", points[1]);
        this._svgHandle.setAttributeNS(null, "x2", points[2]);
        this._svgHandle.setAttributeNS(null, "y2", points[3]);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
},

//> @method drawLine.moveTo()
// Move both the start and end points of the line, such that the startPoint ends up at the
// specified coordinate and the line length and angle are unchanged.
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//< 
moveTo : function (left, top) {
    this.moveBy(left - this.startLeft, top - this.startTop);
},

updateControlKnobs : function () {
    // update the position of our start/end point knobs when we update our other control points
    this.Super("updateControlKnobs", arguments);
    if (this._startKnob) {
        var left = this.startLeft,
            top = this.startTop,
            screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._startKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
    if (this._endKnob) {
        var left = this.endLeft,
            top = this.endTop,
            screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._endKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
}

}) // end DrawLine.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawRect
//
//  DrawItem subclass to render rectangle shapes, optionally with rounded corners.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawRect", "DrawItem").addProperties({
    //>	@attr drawRect.left
    // @include drawGroup.left
    //<
    left:0, 

    //>	@attr drawRect.top
    // @include drawGroup.top
    //<
    top:0, 

    // NOTE: width/height @included elsewhere so should be phrased generically

    //> @attr drawRect.width        (int : 100 : IR)
    // Width in pixels.
    // @visibility drawing
    //<
    width:100, 

    //> @attr drawRect.height       (int : 100 : IR)
    // Height in pixels.
    // @visibility drawing
    //<
    height:100,

    //> @attr drawRect.rounding      (float : 0 : IR)
    // Rounding of corners, from 0 (square corners) to 1.0 (shorter edge is a semicircle).
    //
    // @visibility drawing
    //<
    rounding:0,

    //> @attr drawRect.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",

    svgElementName: "rect",
    vmlElementName: "ROUNDRECT",


//----------------------------------------
//  DrawRect renderers
//----------------------------------------

getAttributesVML : function () {
    return isc.SB.concat(
        "STYLE='position:absolute; left:", this.left,
            "px; top:", this.top,
            "px; width:", this.width,
            "px; height:", this.height, "px;'",
            
            " ARCSIZE='"+this.rounding/2+"'");
},

getAttributesSVG : function () {
    return  "x='" + this.left + "' y='" + this.top + "' width='" + this.width +
            "' height='" + this.height + "'" +
            (this.rounding ? " rx='"+(this.rounding*Math.min(this.width, this.height)/2)+"'" : "")
},

drawBitmapPath : function (context) {
    if (this.rounding == 0) {
        this.bmMoveTo(this.left,this.top);
        this.bmLineTo(this.left+this.width,this.top);
        this.bmLineTo(this.left+this.width,this.top+this.height);
        this.bmLineTo(this.left, this.top+this.height);
        this.bmLineTo(this.left,this.top);
    } else {
        
        var r = this.rounding * (Math.min(this.width, this.height)/2);
        this.bmMoveTo(this.left+r,this.top);
        this.bmLineTo(this.left+this.width-r, this.top);
        this.bmQuadraticCurveTo(this.left+this.width,this.top,this.left+this.width,this.top+r);
        this.bmLineTo(this.left+this.width, this.top+this.height-r);
        this.bmQuadraticCurveTo(this.left+this.width,this.top+this.height,this.left+this.width-r,this.top+this.height);
        this.bmLineTo(this.left+r, this.top+this.height);
        this.bmQuadraticCurveTo(this.left,this.top+this.height,this.left,this.top+this.height-r);
        this.bmLineTo(this.left, this.top+r);
        this.bmQuadraticCurveTo(this.left,this.top,this.left+r,this.top);
    }
    context.closePath();
    
},

//----------------------------------------
//  DrawRect attribute setters
//----------------------------------------

//> @method drawRect.setCenter()
// Move the drawRect such that it is centered over the specified coordinates.
// @param left (integer) left coordinate for new center position
// @param top (integer) top coordinate for new center postiion
// @visibility drawing
//<
setCenter : function (left, top) {
    
    if (left != null) left = left - Math.round(this.width/2);
    if (top != null) top = top - Math.round(this.height/2);
    
    this.moveTo(left,top);
},

//> @method drawRect.getCenter()
// Get the center coordinates of the rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//> @method drawRect.getBoundingBox()
// Returns the top, left, top+height, left+width 
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

//> @method drawRect.moveBy()
// Move the drawRect by the specified delta
// @param dX (integer) number of pixels to move horizontally
// @param dY (integer) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    this.left += dX;
    this.top += dY;
    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this.moved(dX, dY);
},

//> @method drawRect.moveTo()
// Move the drawRect to the specified position
// @param left (integer) new left coordinate
// @param top (integer) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawRect.setLeft()
// Set the left coordinate of the drawRect
// @param left (integer) new left coordinate
// @visibility drawing
//<
setLeft : function (left) {
    this.moveTo(left);
},

//> @method drawRect.setTop()
// Set the top coordinate of the drawRect
// @param top (integer) new top coordinate
// @visibility drawing
//<
setTop : function (top) {
    this.moveTo(null,top);
},

//> @method drawRect.resizeTo()
// Resize to the specified size
// @param width (integer) new width
// @param height (integer) new height
// @visibility drawing
//<
resizeTo : function (width,height) {
    var dX = 0, dY = 0;
    if (width != null) dX = width - this.width;
    if (height != null) dY = height - this.height;
    
    this.resizeBy(dX,dY);
},

//> @method drawRect.resizeBy()
// Resize by the specified delta
// @param dX (integer) number of pixels to resize by horizontally
// @param dY (integer) number of pixels to resize by vertically
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if (dX != null) this.width += dX;
    if (dY != null) this.height += dY;
    
    if (this.drawingVML) {
        this._vmlHandle.style.width = this.width;
        this._vmlHandle.style.height = this.height;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "width", this.width);
        this._svgHandle.setAttributeNS(null, "height", this.height);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("resizeBy",arguments);
    this.resized(dX, dY);
},


//> @method drawRect.setWidth()
// Set the width of the drawRect
// @param width (integer) new width
// @visibility drawing
//<
setWidth : function (width) {
    this.resizeTo(width);
},

//> @method drawRect.setHeight()
// Set the height of the drawRect
// @param height (integer) new height
// @visibility drawing
//<
setHeight : function (height) {
    this.resizeTo(null, height);
},

//> @method drawRect.setRect()
// Move and resize the drawRect to match the specified coordinates and size.
// @param left (integer) new left coordinate
// @param top (integer) new top coordinate
// @param width (integer) new width
// @param height (integer) new height
// @visibility drawing
//<
setRect : function (left,top,width,height) {
    this.moveTo(left,top);
    this.resizeTo(width,height);
},


//> @method drawRect.setRounding()
// Setter method for +link{drawRect.rounding}
// @param rounding (float) new rounding value. Should be between zero (a rectangle) and 1 (shorter
//   edge is a semicircle)
// @visibility drawing
//<
setRounding : function (rounding) {
    this.rounding = rounding;
    if (this.drawingVML) {
        
        this.erase();
        this.draw();

    } else if (this.drawingSVG) {      
        this._svgHandle.setAttributeNS(null, "rx", 
            (this.rounding ? (this.rounding*Math.min(this.width, this.height)/2) : null)
        );
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
}

}) // end DrawRect.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawOval
//
//  DrawItem subclass to render oval shapes, including circles.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawOval", "DrawItem").addProperties({

    //>	@attr drawOval.left (int : 0 : IRW)
    // @include drawGroup.left
    //<
    left:0, 

    //>	@attr drawOval.top (int : 0 : IRW)
    // @include drawGroup.top
    //<
    top:0, 

    //> @attr drawOval.width (int : 100 : IRW)
    // @include drawRect.width
    //<
    width:100, 

    //> @attr drawOval.height (int : 100 : IRW)
    // @include drawRect.height
    //<
    height:100,

    //> @attr drawOval.centerPoint    (Point : null : IR)
    // Center point of the oval.  If unset, derived from left/top/width/height.
    // @visibility drawing
    //<

    //> @attr drawOval.radius         (int : null : IR)
    // Radius of the oval.  If unset, horizontal and vertical radii are derived from width and
    // height
    // @visibility drawing
    //<

//  rx
//  ry
    svgElementName: "ellipse",
    vmlElementName: "OVAL",

// TODO review init property precedence and null/zero check    
init : function () {
    // convert rect to center/radii
    if (!this.radius) this._deriveCenterPointFromRect();
    else this._deriveRectFromRadius();
        
    this.Super("init");
},

// Helpers to synch rect coords with specified centerPoint / radius and vice versa 
_deriveRectFromRadius : function () {
    // convert center/radii to rect
    this.rx = this.rx || this.radius;
    this.ry = this.ry || this.radius;
    this.width = this.rx * 2;
    this.height = this.ry * 2;
    // support either centerpoint or direct left/top
    if (this.centerPoint != null) {
        this.left = this.centerPoint[0] - this.width/2;
        this.top = this.centerPoint[1] - this.height/2;
    } else {
        this.centerPoint = [];
        this.centerPoint[0] = this.left + this.width/2;
        this.centerPoint[1] = this.top + this.height/2;
    }
},
_deriveCenterPointFromRect : function () {
    this.centerPoint = [];
    this.centerPoint[0] = this.left + this.width/2;
    this.centerPoint[1] = this.top + this.height/2;
    this.rx = this.width/2;
    this.ry = this.height/2;
},
//----------------------------------------
//  DrawOval renderers
//----------------------------------------

getAttributesVML : function () {
    // POSITION and SIZE attributes from VML spec did not work
    return isc.SB.concat(
        "STYLE='position:absolute;left:", this.left,
            "px;top:", this.top,
            "px;width:", this.width,
            "px;height:", this.height, "px;'");
},

getAttributesSVG : function () {
    return  "cx='" + this.centerPoint[0] +
            "' cy='" + this.centerPoint[1] +
            "' rx='" + this.rx +
            "' ry='" + this.ry +
            "'"
},

//> @method drawOval.getBoundingBox()
// Returns the top, left, top+height, left+width 
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

drawBitmapPath : function (context) {
    var kappa = 0.552284749831;
    var rx = this.rx;
    var ry = this.ry;
    var cx = this.centerPoint[0];
    var cy = this.centerPoint[1];
    context.moveTo(cx, cy - ry);
    context.bezierCurveTo(cx + (kappa * rx), cy - ry,  cx + rx, cy - (kappa * ry), cx + rx, cy);
    context.bezierCurveTo(cx + rx, cy + (kappa * ry), cx + (kappa * rx), cy + ry, cx, cy + ry);
    context.bezierCurveTo(cx - (kappa * rx), cy + ry, cx - rx, cy + (kappa * ry), cx - rx, cy);
    context.bezierCurveTo(cx - rx, cy - (kappa * ry), cx - (kappa * rx), cy - ry, cx, cy - ry);
    context.closePath();
},

//----------------------------------------
//  DrawOval attribute setters
//----------------------------------------

//> @method drawOval.setCenterPoint()
// Change the center point for this oval.
// @param left (int) left coordinate
// @param top (int) top coordinate
// @visibility drawing
//<
setCenterPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    var dX = 0, dY = 0;
    if (left != null) dX = left - this.centerPoint[0];
    if (top != null) dY = top - this.centerPoint[1];
    
    this.moveBy(dX,dY);
},


//> @method drawOval.moveBy()
// Move the drawOval by the specified delta
// @param dX (integer) number of pixels to move horizontally
// @param dY (integer) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    if (dX != null) this.centerPoint[0] += dX;
    if (dY != null) this.centerPoint[1] += dY;
    
    // synch up rect coords
    this._deriveRectFromRadius();
    if (!this._drawn) return;
    
    if (this.drawingVML) {
        // POSITION and SIZE attributes from VML spec did not work
        this._vmlHandle.style.left = this.centerPoint[0] - this.rx;
        this._vmlHandle.style.top = this.centerPoint[1] - this.ry;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "cx", this.centerPoint[0]);
        this._svgHandle.setAttributeNS(null, "cy", this.centerPoint[1]);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this.moved(dX, dY);
},

//> @method drawOval.moveTo()
// Move the drawOval to the specified left/top position. You may also call
// +link{drawOval.setCenterPoint} to reposition the oval around a new center position.
// @param left (integer) new left coordinate
// @param top (integer) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {    
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawOval.setLeft()
// Set the left coordinate of the drawOval
// @param left (integer) new left coordinate
// @visibility drawing
//<
setLeft : function (left) {
    this.moveTo(left);
},

//> @method drawOval.setTop()
// Set the top coordinate of the drawOval
// @param top (integer) new top coordinate
// @visibility drawing
//<
setTop : function (top) {
    this.moveTo(null,top);
},


//> @method drawOval.resizeBy()
// Resize by the specified delta. Note that the resize will occur from the current top/left 
// coordinates, meaning the center positon of the oval may change. You may also use
// +link{drawOval.setRadii()} to change the radius in either direction without modifying the
// centerpoint.
// @param dX (integer) number of pixels to resize by horizontally
// @param dY (integer) number of pixels to resize by vertically
// @visibility drawing
//<
// @param fromCenter (boolean) internal parameter used by setRadii so we can have a single
//  codepath to handle resizing. If passed, resize from the center, not from the top left coordinate
resizeBy : function (dX, dY, fromCenter) {
    if (dX != null) this.width += dX;
    if (dY != null) this.height += dY;
    
    if (fromCenter) {
        if (dX != null) this.left += Math.round(dX / 2);
        if (dY != null) this.top += Math.round(dY / 2);
    }
    
    // Synch up the radius settings
    this._deriveCenterPointFromRect();

    if (this.drawingVML) {
        this._vmlHandle.style.width = this.width;
        this._vmlHandle.style.height = this.height;
        if (fromCenter) {
            this._vmlHandle.style.left = this.left;
            this._vmlHandle.style.top = this.top;
        }
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "rx", this.rx);
        this._svgHandle.setAttributeNS(null, "ry", this.ry);
        if (!fromCenter) {
            this._svgHandle.setAttributeNS(null, "cx", this.centerPoint[0]);
            this._svgHandle.setAttributeNS(null, "cy", this.centerPoint[1]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("resizeBy",arguments);
    this.resized(dX, dY);
    if (fromCenter) this.moved(dX / 2, dY / 2);
},

//> @method drawOval.resizeTo()
// Resize to the specified size. Note that the resize will occur from the current top/left 
// coordinates, meaning the center positon of the oval may change. You may also use
// +link{drawOval.setRadii()} to change the radius in either direction without modifying the
// centerpoint.
// @param width (integer) new width
// @param height (integer) new height
// @visibility drawing
//<
// @param fromCenter (boolean) keep the current center point
resizeTo : function (width,height, fromCenter) {
    var dX = 0, dY = 0;
    if (width != null) dX = width - this.width;
    if (height != null) dY = height - this.height;
    
    this.resizeBy(dX,dY, fromCenter);
},


//> @method drawOval.setWidth()
// Set the width of the drawOval
// @param width (integer) new width
// @visibility drawing
//<
setWidth : function (width) {
    this.resizeTo(width);
},

//> @method drawOval.setHeight()
// Set the height of the drawOval
// @param height (integer) new height
// @visibility drawing
//<
setHeight : function (height) {
    this.resizeTo(null, height);
},

//> @method drawOval.setRect()
// Move and resize the drawOval to match the specified coordinates and size.
// @param left (integer) new left coordinate
// @param top (integer) new top coordinate
// @param width (integer) new width
// @param height (integer) new height
// @visibility drawing
//<
setRect : function (left,top,width,height) {
    this.moveTo(left,top);
    this.resizeTo(width,height);
},

//> @method drawOval.setRadii()
// Resize the drawOval by setting its horizontal and vertical radius, and retaining its current
// center point.
// @param rx (integer) new horizontal radius
// @param ry (integer) new vertical radius
// @visibility drawing
//<
setRadii : function (rx, ry) {
    if (isc.isAn.Array(rx)) {
        ry = rx[1];
        rx = rx[0];
    }
    var width,height;
    if (rx != null) width = 2*rx;
    if (ry != null) height = 2*ry;
    // use resizeTo, with the additional coordinate to retain the current center point. This
    // will give us a consistent code-path for resizes
    this.resizeTo(width,height, true);
},

//> @method drawOval.setRadius()
// Resize the drawOval by setting its radius, and retaining its current center point.
// @param radius (integer) new radius. This will be applied on both axes, meaning calling this
//  method will always result in the drawOval being rendered as a circle
// @visibility drawing
//<
setRadius : function (radius) {
    this.setRadii(radius,radius);
},

//> @method drawOval.setOval()
// Resize and reposition the drawOval by setting its radius, and centerPoint.
// @param cx (integer) new horizontal center point coordinate
// @param cy (integer) new vertical center point coordinate
// @param rx (integer) new horizontal radius
// @param ry (integer) new vertical radius
// @visibility drawing
//<
setOval : function (cx, cy, rx, ry) {
    this.setCenterPoint(cx,cy);
    this.setRadii(rx,ry);
},

//> @method drawOval.getCenter()
// Get the center coordinates of the circle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return this.centerPoint.slice();
}


}) // end DrawOval.addProperties


//------------------------------------------------------------------------------------------
//> @class DrawSector
//
//  DrawItem subclass to render Pie Slices.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

// Typical SVG for this:
// <path d="M300,200 h-150 a150,150 0 1,0 150,-150 z" fill="red" stroke="blue" stroke-width="5" />
// (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+

isc.defineClass("DrawSector", "DrawItem").addProperties({
    //> @attr drawSector.centerPoint     (Point : [0,0] : IRW)
    // Center point of the sector
    // @visibility drawing
    //<
    centerPoint: [0,0],

    //> @attr drawSector.startAngle      (float: 0.0 : IR)
    // start angle of the sector
    // @visibility drawing
    //<
    startAngle: 0.0,

    //> @attr drawSector.endAngle      (float: 20.0 : IR)
    // end angle of the sector
    // @visibility drawing
    //<
    endAngle: 20.0,

    //> @attr drawSector.radius         (int : 100: IR)
    // Radius of the sector. 
    // @visibility drawing
    //<
    radius: 100,

    svgElementName: "path",
    vmlElementName: "SHAPE",

init : function () {
    this.Super("init");
},
//> @method drawSector.getBoundingBox()
// Returns the centerPoint endPoint
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.centerPoint[0],this.centerPoint[1],this.centerPoint[0]+this.radius,this.centerPoint[1]+this.radius];
},

//> @method drawSector.getCenter()
// return the center point
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return this.centerPoint.slice();
},

getAttributesVML : function () {
    var startAngle = -this.startAngle;
    var totalAngle = this.endAngle - this.startAngle;
    var style = "STYLE='position:absolute;top:0px;left:0px;width:100%;height:100%;' ";
    var path = "path='m" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]);
    path += " ae" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]);
    path += " " + Math.round(this.radius) + "," + Math.round(this.radius) + " ";
    path += Math.round(startAngle*65535) + "," + Math.round(-totalAngle*65536) + " x e'";
    return style + path;
},

getAttributesSVG : function () {
    var angle = this.endAngle-this.startAngle+1;
    var radians = angle*Math.PI/180.0;
    var rotation = this.startAngle*Math.PI/180.0;
    var xstart = this.radius;
    var ystart = 0.0;
    var xstartrotated = this.centerPoint[0] + xstart*Math.cos(rotation);
    var ystartrotated = this.centerPoint[1] + xstart*Math.sin(rotation);
    var xend = xstart*Math.cos(radians);
    var yend = xstart*Math.sin(radians);
    var xendrotated = this.centerPoint[0] + xend*Math.cos(rotation) - yend*Math.sin(rotation);
    var yendrotated = this.centerPoint[1] + xend*Math.sin(rotation) + yend*Math.cos(rotation);
    var path = "d='M" + this.centerPoint[0] + " " + this.centerPoint[1];
    path += " L" + xstartrotated + " " + ystartrotated;
    path += " A" + this.radius + " " + this.radius + " 0 0 1 ";
    path += xendrotated + " " + yendrotated + " Z";
    return path;
},

drawBitmapPath : function (context) {
    var angle = this.endAngle-this.startAngle+1;
    var radians = angle*Math.PI/180.0;
    var startRadian = this.startAngle*Math.PI/180.0;
    var endRadian = this.endAngle*Math.PI/180.0;
    var rotation = this.startAngle*Math.PI/180.0;
    var xstart = this.radius;
    var ystart = 0.0;
    var xstartrotated = this.centerPoint[0] + xstart*Math.cos(rotation);
    var ystartrotated = this.centerPoint[1] + xstart*Math.sin(rotation);
    var xend = xstart*Math.cos(radians);
    var yend = xstart*Math.sin(radians);
    var xendrotated = this.centerPoint[0] + xend*Math.cos(rotation) - yend*Math.sin(rotation);
    var yendrotated = this.centerPoint[1] + xend*Math.sin(rotation) + yend*Math.cos(rotation);
    this.bmMoveTo(this.centerPoint[0], this.centerPoint[1], context);
    this.bmLineTo(xstartrotated, ystartrotated, context);
    this.bmArc(this.centerPoint[0], this.centerPoint[1], this.radius, startRadian, endRadian, false);
    this.bmLineTo(this.centerPoint[0], this.centerPoint[1], context);
    context.closePath();
},

//> @method drawSector.setCenterPoint()
// Change the center point for this sector.
// @param left (int) left coordinate
// @param top (int) top coordinate
// @visibility drawing
//<
setCenterPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    var dX = 0, dY = 0;
    if (left != null) dX = left - this.centerPoint[0];
    if (top != null) dY = top - this.centerPoint[1];
    
    this.moveBy(dX,dY);
},

//> @method drawSector.moveTo()
// Move the drawSector by the specified delta
// @param x (integer) coordinate to move to horizontally
// @param y (integer) coordinate to move to vertically
// @visibility drawing
//<
moveTo : function (x, y) {
    this.moveBy(x-this.centerPoint[0],y-this.centerPoint[1]);
},

//> @method drawSector.moveBy()
// Move the drawSector to the specified position. 
// @param x (integer) number of pixels to move by horizontally
// @param y (integer) number of pixels to move by vertically
// @visibility drawing
//<
moveBy : function (x, y) {    
    if (!this._drawn) return;
    this.centerPoint[0] += x;
    this.centerPoint[1] += y;
    if (this.drawingVML) {
        this._vmlHandle.path = "m" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]) +
        " ae" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]) +
        " " + Math.round(this.radius) + "," + Math.round(this.radius) + " " +
        Math.round(-this.startAngle*65535) + "," + Math.round(-(this.endAngle - this.startAngle)*65536) + " x e'";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "transform", "translate(" +  x  + "," + y + ")");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this.moved();
},

//> @method drawSector.resizeBy()
// Resize by the specified delta. Note that the resize delta will be applied to each point.
// @param dX (integer) number of pixels to resize by horizontally
// @param dY (integer) number of pixels to resize by vertically
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if(this.scale) {
        this.scale[0] = dX;
        this.scale[1] = dY;
        if (this.drawingSVG) {
            this._svgHandle.setAttributeNS(null, "transform", "scale(" +  this.scale[0]  + "," + this.scale[1] + ")");
        } else if (this.drawingBitmap) {
            this.drawPane.redrawBitmap();
        }
        this.Super("resizeBy",arguments);
        this.resized(dX, dY);
    }
}

}) // end DrawSector.addProperties


//------------------------------------------------------------------------------------------
//> @class DrawLabel
//
//  DrawItem subclass to render a single-line text label.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawLabel", "DrawItem").addProperties({

// save original fontsize so we can apply scaling - see DrawPane._updateItemsToViewBox()
init : function () {
    this._fontSize = this.fontSize;
    this.Super("init");
},

//> @attr drawLabel.contents (String : null : IR)
// This is the content that will exist as the label.
// @visibility drawing
//<

//> @attr drawLabel.left (int : 0 : IR)
// Sets the amount from the left of its positioning that the element should be placed.
// @visibility drawing
//<
left:0, 

//> @attr drawLabel.top (int : 0 : IR)
// Sets the amount from the top of its positioning that the element should be placed.
// @visibility drawing
//<
top:0,

//> @attr drawLabel.fontFamily (String : "Tahoma" : IR)
// Font family name, similar to the CSS font-family attribute.
// @visibility drawing
//<
fontFamily:"Tahoma",

//> @attr drawLabel.fontSize (int : 18 : IR)
// Font size, similar to the CSS font-size attribute.
// @visibility drawing
//<
fontSize:18,

//> @attr drawLabel.fontWeight (String : "bold" : IR)
// Font weight, similar to the CSS font-weight attribute, eg "normal", "bold".
// @visibility drawing
//<
fontWeight:"bold",

//> @attr drawLabel.fontStyle (String : "normal" : IR)
// Font style, similar to the CSS font-style attribute, eg "normal", "italic".
// @visibility drawing
//<
fontStyle:"normal",

//----------------------------------------
//  DrawLabel renderers
//----------------------------------------

//synchTextMove:true,
_getElementVML : function (id) {

    if (this.synchTextMove) {
    // TEXTBOX implementation
        return isc.SB.concat(
            this.drawPane.startTagVML('RECT')," ID='", id,
            "' STYLE='position:absolute;left:", this.left,
            "px; top:", this.top,
            "px;'>",this.drawPane.startTagVML('TEXTBOX')," INSET='0px, 0px, 0px, 0px' STYLE='overflow:visible",
            
            //(this.rotation != 0 ? ";rotation:" + 90 : ""),
            "; font-family:", this.fontFamily,
            // NOTE: manual zoom
            "; font-size:", this.fontSize * this.drawPane.zoomLevel,
            "; font-weight:", this.fontWeight,
            "; font-style:", this.fontStyle,
            ";'><NOBR>", this.contents, "</NOBR>",this.drawPane.endTagVML('TEXTBOX'),this.drawPane.endTagVML('RECT'));
    } else {
    // DIV implementation
        var screenCoords = this.drawPane.drawing2screen([this.left, this.top, 0, 0]);
        return isc.SB.concat(
             "<DIV ID='", id,
            "' STYLE='position:absolute; overflow:visible; width:1px; height:1px",
            // the top-level VML container is relatively positioned hence 0,0 in drawing space
            // is inside the CSS padding of the draw pane.  This DIV is absolutely positioning
            // hence it's 0,0 would be inside the border, so add padding.
            "; left:", screenCoords[0] + this.drawPane.getLeftPadding(),
            "px; top:", screenCoords[1] + this.drawPane.getTopPadding(), "px",
            
            (this.rotation ? ";writing-mode: tb-rl" : ""),
            //(this.rotation ? ";filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1)" : ""),
            "; font-family:", this.fontFamily,
            "; font-size:", (this.fontSize * this.drawPane.zoomLevel)+"px",
            "; font-weight:", this.fontWeight,
            "; font-style:", this.fontStyle,
            ";color:", this.lineColor,
            ";'><NOBR>", this.contents, "</NOBR></DIV>");
    }
},

_getElementSVG : function (id) {
    var svgElem;
    if (!isc.Browser.isWebKit) {
      svgElem = "<text id='" + id +
            "' x='" + this.left +
            "' y='" + this.top +
            "' dominant-baseline='text-before-edge" + // changes origin from baseline to topleft
//            "' class='" + this.styleName +
            "' font-family='" + this.fontFamily + // TODO FFSVG15 - list of fonts does not work, so switch fontFamily for each OS
            "' font-size='" + this.fontSize +
            "' font-weight='" + this.fontWeight +
            "' font-style='" + this.fontStyle +
            "'>" + this.contents + "</text>"
    } else {
      svgElem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "text");
      svgElem.setAttributeNS(null,"id",id);
      svgElem.setAttributeNS(null,"x",this.left);
      svgElem.setAttributeNS(null,"y",this.top);
      svgElem.setAttributeNS(null,"dominantBaseline","text-before-edge");
      svgElem.setAttributeNS(null,"fontFamily",this.fontFamily);
      svgElem.setAttributeNS(null,"fontSize",this.fontSize);
      svgElem.setAttributeNS(null,"fontWeight",this.fontWeight);
      svgElem.setAttributeNS(null,"fontStyle",this.fontStyle);
      svgElem.textContent = this.contents;
    }
    return svgElem;
},

//> @method drawLabel.moveBy()
// Move both the start and end points of the line by a relative amount.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//< 
moveBy : function (x, y) {
    this.top += y;
    this.left += x;
    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
},

//> @method drawLabel.moveTo()
// Move the label to the absolute x, y coordinates
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//< 
moveTo : function (left, top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawLabel.rotateTo()
//
// Rotate the label by the absolute rotation in degrees
// @param degrees (float) number of degrees to rotate
// @visibility drawing
//<
rotateTo : function (degrees) {
    this.rotateBy(degrees - this.rotation);
},

//> @method drawLabel.getCenter()
// Get the center coordinates of the label 
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.getTextWidth()/2), this.top + Math.round(this.getTextHeight()/2)];
},

//> @method drawLabel.getBoundingBox()
// Returns the top, left, top + textHeight, left + textWidth
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.getTextWidth(), this.top+this.getTextHeight()];
},


makeHTMLText : function () {
    var label = this._htmlText = isc.HTMLFlow.create({
        // TODO account for transformations other than rotation
        left: this.left,
        top: this.top,
        
        rotation:this.rotation,
        
        transformOrigin:"0 0", 
        
        width:1, height:1,
        contents:isc.SB.concat("<span style='font-family:", this.fontFamily,
                                           ";font-weight:", this.fontWeight,
                                           ";font-size:", Math.round(this.fontSize * this.drawPane.zoomLevel),
                                           ";font-style:", this.fontStyle,
                                           ";color:", this.lineColor,
                                           ";white-space:nowrap'>",
                                    this.contents,
                               "</span>"),
        autoDraw: false
    });
    this.drawPane.addChild(label);
},

drawBitmap : function (context) {
    if (this.useHTML || isc.Browser.isIPhone) {
        // option to render as HTML.  Needed for some older browsers.
        if (!this._htmlText) this.makeHTMLText();
    } else {
        this.Super("drawBitmap", arguments);
    }
},

erase : function () {
    if (this._htmlText) this._htmlText.destroy();
    this.Super("erase", arguments);
},

destroy : function () {
    if (this._htmlText) this._htmlText.destroy();
    this.Super("destroy", arguments);
},

getFontString : function () {
    return (this.fontStyle != "normal" ? this.fontStyle + " " : "") +
                     (this.fontWeight != "normal" ? this.fontWeight + " " : "") +
                     this.fontSize + "px " + this.fontFamily;
},


drawBitmapPath : function (context) {

    
    context.textBaseline = "top";

    //this.logWarn("fontString: " + fontString);
    context.font = this.getFontString();

     
    this.bmTranslate(this.left, this.top, context);
    if (this.rotation) {
        this.bmRotate((this.rotation/180)*Math.PI, context);
    }
    if(this.backgroundColor) {
        context.fillStyle = this.backgroundColor;
        context.globalAlpha = this.fillOpacity;
        context.beginPath();
        var x1 = 0, x2 = this.getTextWidth(), y1 = 0, y2 = this.getTextHeight();
        this.bmMoveTo(x1,y1);
        this.bmLineTo(x2,y1);
        this.bmLineTo(x2,y2);
        this.bmLineTo(x1,y2);
        this.bmLineTo(x1,y1);
        context.fill();
    }
    context.fillStyle = this.lineColor;
    this.bmFillText(this.contents, 0, 0, context);
},

//----------------------------------------
//  DrawLabel attribute setters
//----------------------------------------

getTextWidth : function () {
    if (this.drawingVML) {
        if (this.synchTextMove) {
            return this._vmlHandle.firstChild.scrollWidth; // VML TEXTBOX
        } else {
            return this._vmlHandle.scrollWidth; // external DIV
        }
    } else if (this.drawingSVG) {
        // could use getBBox().width - getBBox also gets the height - but guessing this is faster
        return this._svgHandle.getComputedTextLength();
    } else if (this.drawingBitmap) {
        var context = this.drawPane.getBitmapContext();
        context.font = context.font || this.getFontString();
        return context.measureText(this.contents).width;
    }
},
getTextHeight : function () {
    if (this.drawingVML) {
        if (this.synchTextMove) {
            return this._vmlHandle.firstChild.scrollHeight; // VML TEXTBOX
        } else {
            return this._vmlHandle.scrollWidth; // external DIV
        }
    } else if (this.drawingSVG) {
        return this._svgHandle.getBBox().height;
    } else if (this.drawingBitmap) {
        var context = this.drawPane.getBitmapContext();
        context.font = context.font || this.getFontString();
        return context.measureText(this.contents).height || this.fontSize;
    }
},


setFontSize: function (size) {
    if (size != null) this.fontSize = size;
    if (this.drawingVML) {
        this._vmlTextHandle.fontSize = this.fontSize * this.drawPane.zoomLevel;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "font-size", this.fontSize);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// Wipe out the drawItem line and fill attribute setters. Same reason as with DrawGroup:
// If someone blindly called the superclass setters on all drawItems,
// they would error on drawLabels because e.g. there are no VML stroke and fill subelements.
// TODO expand this list as additional setters are added to DrawItem
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")}

// TO DO: we should be able to support moveAPIs and drawKnobs  


}) // end DrawLabel.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawImage
//
//  DrawItem subclass to render embedded images.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawImage", "DrawItem").addProperties({
    //>	@attr drawImage.left
    // @include drawGroup.left
    //<
    left:0, 

    //>	@attr drawImage.top
    // @include drawGroup.top
    //<
    top:0, 

    //> @attr drawImage.width    (int : 16 : IR)
    // @include drawRect.width
    //<
    width:16, 

    //> @attr drawImage.height   (int : 16 : IR)
    // @include drawRect.height
    //<
    height:16,

    //> @attr drawImage.title  (String : null : IR)
    // Title (tooltip hover text) for this image.
    // @visibility drawing
    //<
    //title:"Untitled Image",

    //> @attr drawImage.src    (URL : "blank.png" : IRW)
    // URL to the image file.
    // @visibility drawing
    //<
    src:"blank.png",

    //> @attr drawImage.image    (Image : null : IRW)
    // image object
    // @visibility drawing
    //<
    image:null,

//> @method drawImage.getBoundingBox()
// Returns the top, left, top+width, left+height
//
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

// TODO copy w/h to internal properties so we can apply scaling without changing
//  the user properties
init : function () {
    this.Super("init");
    if (this.src) {
        // support relative image-paths (like [SKIN])
        this.src = this.getSrcURL(this.src);
        this.image = new Image();
        this.image.src = this.src;
    }
},

//----------------------------------------
//  DrawImage renderers
//----------------------------------------

getSrcURL : function (src) {
    var result = isc.Canvas.getImgURL(src);
    return result;
},

_getElementVML : function (id) {
    var result =  isc.SB.concat(
        this.drawPane.startTagVML('IMAGE')," ID='", id,
            "' SRC='", this.getSrcURL(this.src),
            (this.title ? "' ALT='"+this.title : ""),
            "' STYLE='left:", this.left,
            "px; top:", this.top,
            "px; width:", this.width,
            "px; height:", this.height,
            "px;'>",this.drawPane.endTagVML("IMAGE")
    );
    
    return result;
},

_getElementSVG : function (id) {
    var svgElem, center = this.getCenter();
    if (!isc.Browser.isWebKit) {
      svgElem = "<image id='" + id +
            ((this.rotation && center && center.length === 2)
                ? "' transform='translate(" + center[0] + "," + center[1] +  ") rotate(" + this.rotation + ") translate(" + -center[0] + "," + -center[1] + ")" : "") +
            "' x='" + this.left +
            "' y='" + this.top +
            "' width='" + this.width +
            "px' height='" + this.height +
            "px' xlink:href='" + this.getSrcURL(this.src) + 
            "'>" + (this.title ? "<title>"+this.title+"</title>" : "") +
            "</image>"
    } else {
      svgElem = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "image");
      svgElem.setAttributeNS(null,"id",id);
      svgElem.setAttributeNS(null,"x",this.left);
      svgElem.setAttributeNS(null,"y",this.top);
      svgElem.setAttributeNS(null,"width",this.width+"px");
      svgElem.setAttributeNS(null,"height",this.height+"px");
      svgElem.setAttributeNS("http://www.w3.org/1999/xlink","href", this.getSrcURL(this.src));
      if (this.rotation) {
        svgElem.setAttributeNS(null, "transform", "translate(" +  center[0]  + "," + center[1] + ") rotate("+this.rotation+") translate("  +  -center[0] + "," + -center[1] + ")");
      }
      if (this.title) {
        var svgTitle = this._svgDocument.createElementNS( "http://www.w3.org/2000/svg", "title");
        svgTitle.textContent = this.title;
        svgElem.appendChild(svgTitle);
      }
    }
    return svgElem;
},

drawBitmapPath : function(context) {
    context.drawImage(this.image,this.left,this.top,this.width,this.height);
},

//> @method drawImage.getCenter()
// Get the center coordinates of the rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//----------------------------------------
//  DrawImage attribute setters
//----------------------------------------

//> @method drawImage.setSrc()
// Change the URL of the image displayed.
// @param src (URL) new URL
//
// @visibility drawing
//<
setSrc: function (src) {
    if (src != null) {
        this.src = this.getSrcURL(src);
        this.image = new Image();
        this.image.src = this.src;
    }
    if (this.drawingVML) {
        this._vmlHandle.src = this.src;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.src);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// TODO remove these overrides from DrawGroup, DrawLabel, here - factor DrawShape out of
//  DrawItem instead
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")},

//> @method drawImage.moveBy()
// Move the drawImage by the specified delta
// @param dX (integer) number of pixels to move horizontally
// @param dY (integer) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    this.left += dX;
    this.top += dY;
    
    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this.moved(dX, dY);
},

//> @method drawImage.moveTo()
// Move the drawImage to the specified position
// @param left (integer) new left coordinate
// @param top (integer) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
}
}) // end DrawImage.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawCurve
//
//  DrawItem that renders cubic bezier curves.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

// TODO consider whether this should be a subclass of DrawPath instead
isc.defineClass("DrawCurve", "DrawItem").addProperties({
    //> @attr drawCurve.startPoint     (Point : [0,0] : IRW)
    // Start point of the curve
    // @visibility drawing
    //<
    startPoint: [0,0],

    //> @attr drawCurve.endPoint       (Point : [100,100] : IRW)
    // End point of the curve
    // @visibility drawing
    //<
    endPoint: [100,100],

    //> @attr drawCurve.controlPoint1  (Point : [100,0] : IRW)
    // First cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint1: [100,0],

    //> @attr drawCurve.controlPoint2  (Point : [0,100] : IRW)
    // Second cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint2: [0,100],

    svgElementName: "path",
    vmlElementName: "curve",

    //> @attr drawCurve.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",
    
init : function () {
    this.Super("init");
},

_getKnobPosition : function (position) {
    var x,y;
    x = this.endPoint[0] - this.startPoint[0];
    y = this.endPoint[1] - this.startPoint[1];
    return [x,y];
},

//> @method drawCurve.getCenter()
// Get the center coordinates of the curve
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0] - this.startPoint[0])/2), this.startPoint[1] + Math.round((this.endPoint[1] - this.startPoint[1])/2)]; 
},

//----------------------------------------
//  DrawCurve renderers
//----------------------------------------

getAttributesVML : function () {
    return isc.SB.concat(
            "FROM='", this.startPoint[0], " ", this.startPoint[1],
            "' TO='", this.endPoint[0], " ", this.endPoint[1],
            "' CONTROL1='", this.controlPoint1[0], " ", this.controlPoint1[1],
            "' CONTROL2='", this.controlPoint2[0], " ", this.controlPoint2[1],
            "'");
},

getAttributesSVG : function () {
    return  "d='" + this.getPathSVG() + "'"
},

getPathSVG : function () {
    return  "M" + this.startPoint[0] + " " + this.startPoint[1] +
            "C" + this.controlPoint1[0] + " " + this.controlPoint1[1] +
            " " + this.controlPoint2[0] + " " + this.controlPoint2[1] +
            " " + this.endPoint[0] + " " + this.endPoint[1]
},

drawBitmapPath : function (context) {
    context.moveTo(
        this.startPoint[0], this.startPoint[1]
    );
    context.bezierCurveTo(
        this.controlPoint1[0], this.controlPoint1[1],
        this.controlPoint2[0], this.controlPoint2[1],
        this.endPoint[0], this.endPoint[1]
    );
},

//----------------------------------------
//  DrawCurve attribute setters
//----------------------------------------

//> @method drawCurve.setStartPoint()
// @include drawLine.setStartPoint
//<
setStartPoint : function (left, top) {
    if (left != null) this.startPoint[0] = left;
    if (top != null) this.startPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawCurve.setEndPoint()
// @include drawLine.setEndPoint
//<
setEndPoint : function (left, top) {
    if (left != null) this.endPoint[0] = left;
    if (top != null) this.endPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.to = this.endPoint[0] + " " + this.endPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},


//> @method drawCurve.setControlPoint1()
// Update the first cubic bezier control point
//
// @param left (int) left coordinate for control point, in pixels
// @param left (int) top coordinate for control point, in pixels
// @visibility drawing
//< 
setControlPoint1 : function (left, top) {
    if (left != null) this.controlPoint1[0] = left;
    if (top != null) this.controlPoint1[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.control1 = this.controlPoint1[0] + " " + this.controlPoint1[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    
    this.updateControlKnobs();
},

//> @method drawCurve.setControlPoint2()
// Update the second cubic bezier control point
//
// @param left (int) left coordinate for control point, in pixels
// @param left (int) top coordinate for control point, in pixels
// @visibility drawing
//< 
setControlPoint2 : function (left, top) {
    if (left != null) this.controlPoint2[0] = left;
    if (top != null) this.controlPoint2[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.control2 = this.controlPoint2[0] + " " + this.controlPoint2[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawCurve.getBoundingBox()
// Returns the startPoint endPoint
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [].concat(this.startPoint, this.endPoint);
},

// Support control knobs for start point, end point and control points.
// (Documented under DrawKnobs type definition)

// Note: can't borrow from drawLine - we have startPoint (two element array) rather than
// startLeft / endLeft
showStartPointKnobs : function () {
    this._startKnob = this.createAutoChild("startKnob", {
            _constructor:"DrawKnob",
            x:this.startPoint[0], y:this.startPoint[1],
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    this.observe(this._startKnob, "updatePoints", "observer.setStartPoint(x,y)");
},

hideStartPointKnobs : function () {
    if (this._startKnob) {
        this._startKnob.destroy();
        delete this._startKnob;
    }
},

showEndPointKnobs : function () {
    this._endKnob = this.createAutoChild("endKnob", {
            _constructor:"DrawKnob",
            x:this.endPoint[0], y:this.endPoint[1],
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    this.observe(this._endKnob, "updatePoints", "observer.setEndPoint(x,y)");
},

hideEndPointKnobs : function () {
    if (this._endKnob) {
        this._endKnob.destroy();
        delete this._endKnob;
    }
},

// Control point knobs - these include a line going back to the start or end point
showControlPoint1Knobs : function () {
    this._c1Knob = this.createAutoChild("c1Knob", {
            _constructor:"DrawKnob",
            x:this.controlPoint1[0], y:this.controlPoint1[1],
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    this._c1Line = this.createAutoChild("c1Line",
        {
            _constructor:"DrawLine",
            startLeft:this.startPoint[0], startTop:this.startPoint[1],
            endLeft:this.controlPoint1[0], endTop:this.controlPoint1[1],
            drawPane:this.drawPane,
            autoDraw:true
        }
    );
    this.observe(this._c1Knob, "updatePoints", "observer.setControlPoint1(x,y)");
},

hideControlPoint1Knobs : function () {
    if (this._c1Knob) {
        this._c1Knob.destroy();
        delete this._c1Knob;
    }
    if (this._c1Line) {
        this._c1Line.erase();
        delete this._c1Line;
    }
},

showControlPoint2Knobs : function () {
    this._c2Knob = this.createAutoChild("c2Knob", {
            _constructor:"DrawKnob",
            x:this.controlPoint2[0], y:this.controlPoint2[1],
            drawPane:this.drawPane,
            autoDraw:true
    });
    this._c2Line = this.createAutoChild("c2Line", {
            _constructor:"DrawLine",
            startLeft:this.endPoint[0], startTop:this.endPoint[1],
            endLeft:this.controlPoint2[0], endTop:this.controlPoint2[1],
            drawPane:this.drawPane,
            autoDraw:true
    });
    this.observe(this._c2Knob, "updatePoints", "observer.setControlPoint2(x,y)");
},

hideControlPoint2Knobs : function () {
    if (this._c2Knob) {
        this._c2Knob.destroy();
        delete this._c2Knob;
    }
    if (this._c2Line) {
        this._c2Line.erase();
        delete this._c2Line;
    }
},

updateControlKnobs : function () {
    // update the position of our start/end point knobs when we update our other control points
    this.Super("updateControlKnobs", arguments);
    if (this._startKnob || this._c1Line) {
        var left = this.startPoint[0],
            top = this.startPoint[1];
        
        // If we're showing the control line, update its start point
        if (this._c1Line) this._c1Line.setStartPoint(left,top);
        
        // startKnob is a canvas - hence drawing2Screen
        if (this._startKnob) {
            var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
            this._startKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }
        
    }
    if (this._endKnob || this._c2Line) {
        var left = this.endPoint[0],
            top = this.endPoint[1];
        if (this._c2Line) this._c2Line.setStartPoint(left,top);
        if (this._endKnob) {
            var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
            this._endKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }
    }
    
    if (this._c1Knob) {
        var left = this.controlPoint1[0], top = this.controlPoint1[1];
        // we always render c1Line with c1Point
        this._c1Line.setEndPoint(left,top);
            
        var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._c1Knob.setCenterPoint(screenCoords[0], screenCoords[1]);        
    }
    
    if (this._c2Knob) {
        var left = this.controlPoint2[0], top = this.controlPoint2[1];
        
        this._c2Line.setEndPoint(left,top);
            
        var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._c2Knob.setCenterPoint(screenCoords[0], screenCoords[1]);        
    }
},

//> @method drawCurve.moveTo()
// Sets start, end and control points of this curve
//
// @param x (int) new x coordinate in pixels
// @param y (int) new y coordinate in pixels
// @visibility drawing
//<
moveTo : function (x, y) {
  this.moveBy(x-this.startPoint[0],y-this.startPoint[1]);
},

//> @method drawCurve.moveBy()
// Increment start, end and control points of this curve
//
// @param x (int) new x coordinate in pixels
// @param y (int) new y coordinate in pixels
// @visibility drawing
//<
moveBy : function (x, y) {
    this.startPoint[0] += x;
    this.startPoint[1] += y;
    this.controlPoint1[0] += x;
    this.controlPoint1[1] += y;
    this.controlPoint2[0] += x;
    this.controlPoint2[1] += y;
    this.endPoint[0] += x;
    this.endPoint[1] += y;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
        this._vmlHandle.to = this.endPoint[0] + " " + this.endPoint[1];
        this._vmlHandle.control1 = this.controlPoint1[0] + " " + this.controlPoint1[1];
        this._vmlHandle.control2 = this.controlPoint2[0] + " " + this.controlPoint2[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this.moved(x,y);
}

}) // end DrawCurve.addProperties



//------------------------------------------------------------------------------------------
//> @class DrawBlockConnector
//
// DrawItem subclass to render multi-segment, orthogonal-routing paths.
//
// @inheritsFrom DrawItem
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawBlockConnector", "DrawCurve").addProperties({
    startPoint: [0,0],
    endPoint: [100,100],

    //> @attr drawBlockConnector.controlPoint1  (Point : [100,0] : IRW)
    // First cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint1: [100,0],

    //> @attr drawBlockConnector.controlPoint2  (Point : [0,100] : IRW)
    // Second cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint2: [0,100],

    svgElementName: "path",
    vmlElementName: "curve",
    
init : function () {
    this.Super("init");
},

//----------------------------------------
//  DrawBlockConnector renderers
//----------------------------------------

getAttributesVML : function () {
    return  "FROM='" + this.startPoint[0] + " " + this.startPoint[1] +
            "' TO='" + this.endPoint[0] + " " + this.endPoint[1] +
            "' CONTROL1='" + this.controlPoint1[0] + " " + this.controlPoint1[1] +
            "' CONTROL2='" + this.controlPoint2[0] + " " + this.controlPoint2[1] +
            "'"
},

getAttributesSVG : function () {
    return  "d='" + this.getPathSVG() + "'"
},

//----------------------------------------
//  DrawBlockConnector attribute setters
//----------------------------------------

setStartPoint : function (left, top) {
    if (left != null) this.startPoint[0] = left;
    if (top != null) this.startPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
}

}) // end DrawBlockConnector.addProperties




//------------------------------------------------------------------------------------------
//> @class DrawPath
//
// Draws a multi-segment line.
//
// @inheritsFrom DrawItem
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------
isc.defineClass("DrawPath", "DrawItem").addProperties({
    //> @attr drawPath.points (Array of Point : [[0,0], [100,100]] : IRW)
    // Array of Points for the line.
    // @visibility drawing
    //<
    points : [[0,0], [100,100]],

    svgElementName: "polyline",
    vmlElementName: "POLYLINE",

//> @method drawPath.getBoundingBox()
// Returns the min, max points
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var point = this.points[0], min=[point[0], point[1]], max=[point[0], point[1]], i;
    for (i = 1; i < this.points.length; ++i) {
        point = this.points[i];
        min[0] = Math.min(min[0], point[0]);
        min[1] = Math.min(min[1], point[1]);
        max[0] = Math.max(max[0], point[0]);
        max[1] = Math.max(max[1], point[1]);
    }
    return [].concat(min, max);
},

//----------------------------------------
//  DrawPath renderers
//----------------------------------------

// get the list of points as a series of integers like "0 0 100 100" (representing the points
// [0,0] and [100,100], which is what both VML and SVG want for a series of points
getPointsText : function () {
    var output = isc.SB.create(),
        points = this.points;
    for (var i = 0; i < points.length; i++) {
        output.append(points[i][0], " ", points[i][1]);
        if (i < points.length - 1) output.append(" ");
    }
    return output.toString();
},

getAttributesVML : function () {
    return isc.SB.concat(
        "STYLE='position:absolute; left:", this.left,
            "px; top:", this.top,
            "px; width:", this.width,
            "px; height:", this.height, "px;'",
            " POINTS='" + this.getPointsText() + "'");
//    return  "POINTS='" + this.getPointsText() + "'"
},

getAttributesSVG : function () {
    return  "points='" + this.getPointsText() + "'"
},

drawBitmapPath : function (context) {
    var points = this.points;
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < this.points.length; i++) {
        var point = points[i];
        if(this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(points[i-1][0],points[i-1][1],points[i][0],points[i][1],context);
        } else {
            this.bmLineTo(point[0], point[1], context);
        }
    }
},

//> @method drawPath.getCenter()
// Get the center of the path
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    var point, i, x = 0, y = 0, length = this.points.length;
    for (i = 0; i < length; ++i) {
        point = this.points[i];
        x += point[0];
        y += point[1];
    }
    x = Math.round(x/length);
    y = Math.round(y/length);
    return [x,y];
},

//----------------------------------------
//  DrawPath attribute setters
//----------------------------------------
setPoints : function (points) {
    this.points = points;
    if (this.drawingVML) {
        this._vmlHandle.points.value = this.getPointsText();
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "points", this.getPointsText());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},
//> @method drawPath.moveTo(left,top)
// Move both the start and end points of the line, such that the startPoint ends up at the
// specified coordinate and the line length and angle are unchanged.
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//< 
moveTo : function (x, y) {
    var dX = x - this.points[0][0];
    var dY = y - this.points[0][1];
    this.moveBy(dX,dY);
},
//> @method drawPath.moveBy(dX,dY)
// Move the points by dX,dY
//
// @param dX (int) delta x coordinate in pixels
// @param dY (int) delta y coordinate in pixels
// @visibility drawing
//< 
moveBy : function (dX, dY) {
    if(this.getClass().getClassName() !== 'DrawLinePath') {
        var point, length = this.points.length;
        for (var i = 0; i < length; ++i) {
            point = this.points[i];
            point[0] += dX;
            point[1] += dY;
        }
        if (this.drawingVML) {
            this._vmlHandle.points.value = this.getPointsText();
        } else if (this.drawingBitmap) {
            this.drawPane.redrawBitmap();
        }
    }
    this.Super("moveBy",arguments);
}

});



//------------------------------------------------------------------------------------------
//> @class DrawTriangle
//
//  DrawItem subclass to render triangles
//
//  @inheritsFrom DrawPath
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawTriangle", "DrawPath").addProperties({

    //> @attr drawTriangle.points (Array of Point : [[0,0], [50,50], [100,0]] : IRW)
    // Array of Points for the triangle.
    // @visibility drawing
    //<
    points : [[0,0], [50,50], [100,0]],

    //> @attr drawTriangle.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the corners of triangle.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",

    svgElementName: "path",
    vmlElementName: "POLYLINE",

init : function () {
    this.Super("init");
},

getPointsText : function () {
    var output = isc.SB.create(),
        points = this.points;
    for (var i = 0; i < points.length; i++) {
        output.append(points[i][0], " ", points[i][1], " ");
    }
    output.append(points[0][0], " ", points[0][1]);
    return output.toString();
},

getAttributesSVG : function () {
    var path = "d='M ", i, point = this.points[0];
    path += point[0] + " " + point[1] + " ";
    for (i = 1; i < this.points.length; ++i) {
        point = this.points[i];
        path += "L " + point[0] + " " + point[1];
    }
    point = this.points[0];
    path += "L " + point[0] + " " + point[1] + "'";
    return path;
},

drawBitmapPath : function (context) {
    var points = this.points;
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < this.points.length; i++) {
        var point = points[i];
        this.bmLineTo(point[0], point[1], context);
    }
    this.bmLineTo(points[0][0], points[0][1], context);
    context.closePath();
},

//> @method drawTriangle.dragStart() (A)
// @include canvas.dragStart()
//<
dragStart : function (event, info) {
    var bounds = this.getBoundingBox();
    var offsetX = bounds[0] + (bounds[2]-bounds[0])/2;
    var offsetY = bounds[1];
    var normalized = this.drawPane.normalize(event.x,event.y);
    this.dragOffsetX = normalized.x - this.drawPane.getPageLeft() - offsetX;
    this.dragOffsetY = normalized.y - this.drawPane.getPageTop() - offsetY;
    return true;
}

}) // end DrawTriangle.addProperties

//------------------------------------------------------------------------------------------
//> @class DrawLinePath
//
//  DrawItem subclass to render a connector between two points. If the points are aligned
//  on one axis, this connector will draw as a straight line. If the points are offset on
//  both axes and there is enough space, the connector will draw short horizontal segments
//  from the start and end points, and a diagonal segment connecting the ends of these
//  'margin' segments.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawLinePath", "DrawPath").addProperties({
    //> @attr drawLinePath.startPoint (Point : [0,0] : IRW)
    // @include drawLine.startPoint
    //<
    startPoint: [0,0],

    //> @attr drawLinePath.endPoint (Point : [100,100] : IRW)
    // @include drawLine.endPoint
    //<
    endPoint: [100,100],
    
    
    //> @attr drawLinePath.tailSize (integer : 30 : IR)
    // Length of the horizontal "tail" between the start and end points of this LinePath and the
    // diagonal connecting segment
    // @visibility drawing
    //<
    tailSize: 30, // length of horizontal segments at each end
    
    //> @attr drawLinePath.startLeft (integer : 0 , IRW)
    // @include drawLine.startLeft
    //<
    //> @attr drawLinePath.startTop (integer : 0 , IRW)
    // @include drawLine.startTop
    //<
    
    //> @attr drawLinePath.endLeft (integer : 0 , IRW)
    // @include drawLine.endLeft
    //<
    
    //> @attr drawLinePath.endTop (integer : 0 , IRW)
    // @include drawLine.endTop
    //<

    startArrow:null,

    //> @attr drawLinePath.endArrow (ArrowStyle : "open", IRW)
    // @include drawItem.endArrow
    //<
    endArrow:"open",

init : function () {
    this.startLeft = this.startLeft || this.startPoint[0];
    this.startTop = this.startTop || this.startPoint[1];
    this.endLeft = this.endLeft || this.endPoint[0];
    this.endTop = this.endTop || this.endPoint[1];
    this.points = this._getSegmentPoints();
    this.Super("init");
},

_getSegmentPoints : function () {    
    var tailWidth = this.tailSize;
    if (this.startLeft <= this.endLeft) {
        tailWidth = -tailWidth;
    }
    this._segmentPoints = [];
    this._segmentPoints.addList([
        [this.startLeft, this.startTop],
        [this.startLeft - tailWidth, this.startTop],
        [this.endLeft + tailWidth, this.endTop],
        [this.endLeft, this.endTop]
    ]);
    return this._segmentPoints;    
},

_drawLineStartArrow : function () {
    return this.startArrow == "open"
},

_drawLineEndArrow : function () {
    return this.endArrow == "open"
},

//> @method drawLinePath.getCenter()
// Get the center coordinates of the line path
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0] - this.startPoint[0])/2), this.startPoint[1] + Math.round((this.endPoint[1] - this.startPoint[1])/2)]; 
},

//> @method drawLinePath.dragStart() (A)
// @include canvas.dragStart()
//<
dragStart : function (event, info) {
    var bounds = this.getBoundingBox();
    var offsetX = bounds[0];
    var offsetY = bounds[1];
    var normalized = this.drawPane.normalize(event.x,event.y);
    this.dragOffsetX = normalized.x - this.drawPane.getPageLeft() - offsetX;
    this.dragOffsetY = normalized.y - this.drawPane.getPageTop() - offsetY;
    return true;
},

//----------------------------------------
//  DrawLinePath attribute setters
//----------------------------------------


//> @method drawLinePath.setStartPoint()
// @include drawLine.setStartPoint()
//<
setStartPoint : function (left, top) {
    if (left != null) {
        this.startLeft = this.startPoint[0] = left;
    }
    if (top != null) {
        this.startTop = this.startPoint[1] = top;
    }

    // regenerate points
    this.setPoints(this._getSegmentPoints());

    this.updateControlKnobs();
},

//> @method drawLinePath.setEndPoint()
// @include drawLine.setEndPoint()
//<
setEndPoint : function (left, top) {
    if (left != null) {
        this.endLeft = this.endPoint[0] = left;
    }
    if (top != null) {
        this.endTop = this.endPoint[1] = top;
    }

    // regenerate points
    this.setPoints(this._getSegmentPoints());

    this.updateControlKnobs();
},

drawBitmapPath : function (context) {
    // for start / end arrows of style "open" we use line segments to render out the 
    // starting ending points (and suppress the VML / SVG block type heads)
    var arrowDelta = 10;
    if (this.startLeft > this.endLeft) arrowDelta = -arrowDelta;
    if (this.startArrow == "open") {
/*
        if (this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(this.startLeft,this.startTop,this.startLeft+arrowDelta,this.startTop-arrowDelta,context);
            this._drawLinePattern(this.startLeft,this.startTop,this.startLeft+arrowDelta,this.startTop+arrowDelta,context);
        } else {
*/
            this.bmMoveTo(this.startLeft + arrowDelta, this.startTop - arrowDelta, context);
            this.bmLineTo(this.startLeft, this.startTop, context);
            this.bmLineTo(this.startLeft + arrowDelta, this.startTop + arrowDelta, context);
//        }
    }
    var points = this.points;
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < points.length; i++) {
        var point = points[i];
        if(this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(points[i-1][0],points[i-1][1],points[i][0],points[i][1],context);
        } else {
            this.bmLineTo(point[0], point[1], context);
        }
    }
    if (this.endArrow == "open") {
/*
        if (this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(this.endLeft,this.endTop,this.endLeft-arrowDelta,this.endTop+arrowDelta,context);
            this._drawLinePattern(this.endLeft,this.endTop,this.endLeft-arrowDelta,this.endTop-arrowDelta,context);
        } else {
*/
            this.bmMoveTo(this.endLeft - arrowDelta, this.endTop + arrowDelta, context);
            this.bmLineTo(this.endLeft, this.endTop, context);
            this.bmLineTo(this.endLeft - arrowDelta, this.endTop - arrowDelta, context);
//        }
    }
},

//> @method drawLinePath.getBoundingBox()
// Returns the startPoint, endPoint
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [].concat(this.startPoint, this.endPoint);
},

// steal start/endpoint knobs functions from drawLine
showStartPointKnobs : isc.DrawLine.getPrototype().showStartPointKnobs,
hideStartPointKnobs : isc.DrawLine.getPrototype().hideStartPointKnobs,
showEndPointKnobs : isc.DrawLine.getPrototype().showEndPointKnobs,
hideEndPointKnobs : isc.DrawLine.getPrototype().hideEndPointKnobs,
updateControlKnobs : isc.DrawLine.getPrototype().updateControlKnobs,

//> @method drawLinePath.moveBy()
// @include drawLine.moveBy()
//<
moveBy : function (x, y) {
    this.startLeft += x;
    this.startPoint[0] += x;
    this.startTop += y;
    this.startPoint[1] += y;
    this.endLeft += x;
    this.endPoint[0] += x;
    this.endTop += y;
    this.endPoint[1] += y;

    // regenerate points
    this.setPoints(this._getSegmentPoints());
    this.Super("moveBy",arguments);
    this.moved(x,y);
},
//> @method drawLinePath.moveTo()
// Moves the line path to the specified point
//<
moveTo : function (x, y) {
    this.moveBy(x-this.startLeft,y-this.startTop);
    this.moved(x,y);
}

}) // end DrawLinePath.addProperties


//------------------------------------------------------------------------------------------
//  Helpers
//------------------------------------------------------------------------------------------

isc.GraphMath = {
// convert polar coordinates (angle, distance) to screen coordinates (x, y)
// takes angles in degrees, at least -360 to 360 are supported, 0 degrees is 12 o'clock
zeroPoint : [0,0],
polar2screen : function (angle, radius, basePoint, round) {
    basePoint = basePoint || this.zeroPoint;
    var radians = Math.PI - ((angle+450)%360)/180*Math.PI;
    var point = [
        basePoint[0] + (radius * Math.cos(radians)), // x
        basePoint[1] + (-radius * Math.sin(radians)) // y
    ]
    if (round) {
        point[0] = Math.round(point[0]);
        point[1] = Math.round(point[1]);
    }
    return point;
},

// convert screen coordinates (x, y) to polar coordinates (angle, distance)
// returns an angle in degrees, 0-360, 0 degrees is 12 o'clock
screen2polar : function (x, y) {
    return [
        ((Math.PI - Math.atan2(-y,x))/Math.PI*180 + 270)%360, // angle
        Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) // radius
    ]
},

// find the delta to go from angle1 to angle2, by the shortest path around the circle.  eg
// angle1=359, angle2=1, diff = 2.
// Does not currently support angles outside of 0-360
angleDifference : function (angle1, angle2) {
/*
[
isc.GraphMath.angleDifference(180, 90), // -90
isc.GraphMath.angleDifference(90, 180), // 90
isc.GraphMath.angleDifference(359, 1), // 2
isc.GraphMath.angleDifference(1, 359), // -2
isc.GraphMath.angleDifference(360, 1), // 1
isc.GraphMath.angleDifference(0, 1) // 1
];
*/
    var larger = Math.max(angle1, angle2),
        smaller = Math.min(angle1, angle2),
        clockwiseDiff = larger - smaller,
        counterDiff = smaller+360 - larger;
    if (counterDiff < clockwiseDiff) {
        var direction = larger == angle1 ? 1 : -1;
        return direction * counterDiff;
    } else {
        var direction = larger == angle1 ? -1 : 1;
        return direction * clockwiseDiff;
    }
},

// straight line difference between two points
straightDistance : function (pt1, pt2) {
    var xOffset = pt1[0] - pt2[0],
        yOffset = pt1[1] - pt2[1];
    return Math.sqrt(xOffset*xOffset+yOffset*yOffset);
},



// given coordinates for a line, and a length to trim off of each end of the line,
// return the coordinates for the trimmed line
trimLineEnds : function (x1, y1, x2, y2, trimStart, trimEnd) {
    // don't allow trimming to reverse the direction of the line - stop at the (proportional)
    // centerpoint, except for a fractional pixel difference between endpoints to preserve the
    // orientation of the line (and therefore any arrowheads)
    // TODO extend the reach of this logic so arrowheads *disappear* when the line is too short for them
    var fullLength = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
    if (trimStart+trimEnd > fullLength) {
        var midX = trimStart/(trimStart+trimEnd) * (x2-x1) + x1;
        var midY = trimStart/(trimStart+trimEnd) * (y2-y1) + y1;
        return [
            midX + (x1==x2 ? 0 : x1>x2 ? 0.01 : -0.01),
            midY + (y1==y2 ? 0 : y1>y2 ? 0.01 : -0.01),
            midX + (x1==x2 ? 0 : x1>x2 ? -0.01 : 0.01),
            midY + (y1==y2 ? 0 : y1>y2 ? -0.01 : 0.01)
        ]
    }
    var angle = Math.atan2(y1-y2,x2-x1);
    return [
        x1 + (trimStart * Math.cos(angle)),
        y1 - (trimStart * Math.sin(angle)),
        x2 - (trimEnd * Math.cos(angle)),
        y2 + (trimEnd * Math.sin(angle))
    ]
}
} // end isc.GraphMath



// center a canvas on a new position
isc.Canvas.addProperties({
    setCenter : function (x, y) {
        this.moveTo(x - this.getVisibleWidth()/2, y - this.getVisibleHeight()/2);
    },
    getCenter : function () {
        return [
            this.getLeft() + this.getVisibleWidth()/2,
            this.getTop() + this.getVisibleHeight()/2
        ]
    }
})






/*
 LinkedList. 
*/
isc.defineClass("LinkedList", "Class").addProperties({
length: 0,
init : function () {
    this.head = null;
},
add: function(data) {
    var node = {next:null,data:data};
    if(!this.head) {
        this.head = node;
    } else {
        var current = this.head;
        while(current.next) {
            current = current.next;
        }
        current.next = node;
    }
    this.length++;
},
get: function(index) {
    var data = null;
    if(index >= 0 && index < this.length) {
        var current = this.head, i = 0;
        while(i++ < index) {
            current = current && current.next;
        }
        data = current.data;
    }
    return data;
},
remove: function(index) {
    var data = null;
    if(index >= 0 && index < this.length) {
        var current = this.head, i = 0;
        if(index === 0) {
            this.head = current.next;
        } else {
            var previous;
            while(i++ < index) {
                previous = current;
                current = current && current.next;
            }
            previous.next = current.next;
        }
        data = current.data;
        this.length--;
    }
    return data;
},
toArray: function() {
    var array = [], current = this.head;
    while(current) {
        array.push(current.data);
        current = current.next;
    }
    return array;
}
});

/*
 A quadtree provides indexing and quick lookup of shapes located in 2D space. A quadtree will split a space into 
 4 subspaces when a threshold of max_objects has been reached. Subdivision will stop when max_depth has been reached.
 Given a point, a quadtree will return the number of objects found in the quadrant containing this point.
*/
isc.defineClass("QuadTree", "Class").addProperties({
depth: 0,
maxDepth: 0,
maxChildren: 0,
init : function () {
    this.root = null;
    this.bounds = null;
},
insert : function(item) {
    if(isc.isAn.Array(item)) {
        var len = item.length;
        for(var i = 0; i < len; i++) {
            this.root.insert(item[i]);
        }
    } else {
        this.root.insert(item);
    }
},
remove : function(item) {
    this.root.remove(item);
},
clear : function() {
    this.root.clear();
},
retrieve : function(item) {
    return this.root.retrieve(item).slice();
},
update : function(item) {
    return this.root.update(item);
}
});

isc.defineClass("QuadTreeNode", "Class").addClassProperties({
TOP_LEFT:0,
TOP_RIGHT:1,
BOTTOM_LEFT:2,
BOTTOM_RIGHT:3
});

isc.QuadTreeNode.addProperties({
depth: 0,
maxDepth: 4,
maxChildren: 4,
init : function() {
    this.bounds = null;
    this.nodes = [];
    this.children = isc.LinkedList.create();
},
insert : function(item) {
    if(this.nodes.length) {
        var quadrants = this.findQuadrants(item);
        for(var i = 0; i < quadrants.length; ++i) {
            var quadrant = quadrants[i];
            this.nodes[quadrant].insert(item);
        }
        return;
    }
    this.children.add(item);
    var len = this.children.length;
    if(!(this.depth >= this.maxDepth) && len > this.maxChildren) {
        this.subdivide();
        for(var i = 0; i < len; i++) {
            this.insert(this.children.get(i));
        }
        this.children = isc.LinkedList.create();
    }
},
remove : function(item) {
    if(this.nodes.length) {
        var quadrants = this.findQuadrants(item);
        for(var i = 0; i < quadrants.length; ++i) {
            var quadrant = quadrants[i];
            this.nodes[quadrant].remove(item);
        }
    }
    for(var j = 0; j < this.children.length; ++j) {
        var data = this.children.get(j);
        if(data === item) {
            this.children.remove(j);
        }
    }
},
retrieve : function(point) {
    if(this.nodes.length) {
        var quadrant = this.findQuadrant(point);
        return this.nodes[quadrant].retrieve(point);
    }
    return this.children.toArray();
},
findQuadrant: function(point) {
    var b = this.bounds;
    var left = (point.x > b.x + b.width / 2)? false : true;
    var top = (point.y > b.y + b.height / 2)? false : true;
    //top left
    var quadrant = isc.QuadTreeNode.TOP_LEFT;
    if(left) {
        //left side
        if(!top) {
            //bottom left
            quadrant = isc.QuadTreeNode.BOTTOM_LEFT;
        }
    } else {
        //right side
        if(top) {
            //top right
            quadrant = isc.QuadTreeNode.TOP_RIGHT;
        } else {
            //bottom right
            quadrant = isc.QuadTreeNode.BOTTOM_RIGHT;
        }
    }
    return quadrant;
},
findQuadrants: function(item) {
    var quadrants = [];
    var qmap = {};
    var quadrant = this.findQuadrant({x:item.x,y:item.y});
    quadrants.push(quadrant);
    qmap[quadrant] = true;
    quadrant = this.findQuadrant({x:item.x+item.width,y:item.y+item.height});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
        qmap[quadrant] = true;
    }
    quadrant = this.findQuadrant({x:item.x,y:item.y+item.height});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
        qmap[quadrant] = true;
    }
    quadrant = this.findQuadrant({x:item.x+item.width,y:item.y});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
    }
    return quadrants;
},
subdivide : function() {
    var depth = this.depth + 1;
    var bx = this.bounds.x;
    var by = this.bounds.y;
    //floor the values
    var b_w_h = (this.bounds.width / 2)|0;
    var b_h_h = (this.bounds.height / 2)|0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;
    //top left
    this.nodes[isc.QuadTreeNode.TOP_LEFT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.TOP_LEFT].bounds = {x:bx, y:by, width:b_w_h, height:b_h_h};
    //top right
    this.nodes[isc.QuadTreeNode.TOP_RIGHT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.TOP_RIGHT].bounds = {x:bx_b_w_h,y:by,width:b_w_h,height:b_h_h};
    //bottom left
    this.nodes[isc.QuadTreeNode.BOTTOM_LEFT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.BOTTOM_LEFT].bounds = {x:bx,y:by_b_h_h,width:b_w_h,height:b_h_h};
    //bottom right
    this.nodes[isc.QuadTreeNode.BOTTOM_RIGHT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.BOTTOM_RIGHT].bounds = {x:bx_b_w_h,y:by_b_h_h,width:b_w_h,height:b_h_h};
},
clear : function() {    
    this.children = isc.LinkedList.create();
    var len = this.nodes.length;
    for(var i = 0; i < len; i++) {
        this.nodes[i].clear();
    }
    this.nodes = [];
    this.depth = 0;
    this.maxDepth = 4;
    this.maxChildren = 4;
},
update : function(item) {
    this.remove(item);
    this.insert(item);
}  
});

