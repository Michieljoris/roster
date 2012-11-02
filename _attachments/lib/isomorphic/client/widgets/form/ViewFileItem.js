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

 



//> @groupDef viewFile
//<

//>	@class ViewFileItem
//
// Item for displaying the contents of "imageFile" fields in DynamicForms. 
// <P>
// Displays one of two UIs, according to the value of 
// +link{viewFileItem.showFileInline, showFileInline}.  If showFileInline is false, this Item
// displays the View and Download icons and the filename.  Otherwise, it streams the image-file 
// and displays it inline.
//
// @group upload
// @treeLocation Client Reference/Forms/Form Items
// @visibility external
//<
isc.ClassFactory.defineClass("ViewFileItem", "CanvasItem");

isc.ViewFileItem.addProperties({

    shouldSaveValue: false,
    colSpan: "*",
    height: 20,
    width: "*",
    overflow: "visible",

    //> @attr viewFileItem.showFileInline    (boolean : null : [IR])
    // Indicates whether to stream the image and display it
    // inline or to display the View and Download icons.
    // 
    // @visibility external
    //<

    canvasDefaults: {
        _constructor: "Canvas",
        height: 10, width: "100%"
    },

    isEditable : function () {
        return false;
    },
    
    init : function () {
        this.addAutoChild("canvas");
        this.Super('init', arguments);
    },

    formValuesChanged : function () {
        this.setCanvasContent(null);
    },

    setValue : function(data) {
        this.setCanvasContent(data);
        this.Super("setValue", arguments);
    },

    setCanvasContent : function (data) {
        var record = this.getFormRecord();

        if (this.type == "imageFile" && this.showFileInline != false) {
            this.canvas.setHeight("*");
            this.canvas.setWidth("*");
            this.canvas.setContents(this.getImageHTML() || "&nbsp;");
        } else {
            if (this.showFileInline == true) { // non-imageFile field
	            this.logWarn("setValue(): Unsupported field-type for showFileInline: " +this.type);
            }
            this.canvas.setHeight(20);
            this.canvas.setWidth("*");
            this.canvas.setContents(this.getViewDownloadHTML(data, record) || "&nbsp;");
        }
    },

    getViewDownloadHTML : function (value, record) {

        if (isc.isA.String(value)) return value;
        if (record == null) return null;

        var nativeName = this.nativeName || this.name,
            name = record[nativeName + "_filename"];

        
        if (name == null || isc.isA.emptyString(name)) return this.emptyCellValue;
        var viewIconHTML = isc.Canvas.imgHTML("[SKIN]actions/view.png", 16, 16, null,
                        "style='cursor:"+isc.Canvas.HAND+"' onclick='"+this.getID()+".viewFile()'");
        var downloadIconHTML = isc.Canvas.imgHTML("[SKIN]actions/download.png", 16, 16, null,
                        "style='cursor:"+isc.Canvas.HAND+"' onclick='"+this.getID()+".downloadFile()'");

        return "<nobr>" + viewIconHTML + "&nbsp;" + downloadIconHTML + "&nbsp;" + name + "</nobr>";
    },
    
    getFormDataSource : function () {
        // get the DS from either the parent form or it's VM
        var ds = this.form.getDataSource() || 
                (this.form.valuesManager ? this.form.valuesManager.getDataSource() : null)
        ;
        return ds;
    },
    
    getFormRecord : function () {
        // get the data from either the VM or the parent form
        var record = this.form.valuesManager ? this.form.valuesManager.getValues() : null;
        if (!record || isc.isAn.emptyObject(record)) record = this.form.getValues();
        return record;
    },

    getImageHTML : function () {
        var record = this.getFormRecord(),
            field = this.form.getField(this.name),
            urlProperty = this.name + "_imgURL",
            value;

        if (!record || isc.isAn.emptyObject(record)) return;

        if (!record[urlProperty]) {
            var dimensions = isc.Canvas.getFieldImageDimensions(field, record);

            value = record[urlProperty] = 
                isc.Canvas.imgHTML(this.getFormDataSource().streamFile(record, field.name),
                    dimensions.width, dimensions.height);
        } else 
            value = record[urlProperty];

        return value;
    },

    viewFile : function () {
        isc.DS.get(this.getFormDataSource()).viewFile(this.getFormRecord(), this.name);
    },

    downloadFile : function () {
        isc.DS.get(this.getFormDataSource()).downloadFile(this.getFormRecord(), this.name);
    },
    
    _shouldAllowExpressions : function () {
        return false;
    }
});
