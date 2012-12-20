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

 


// Class will not work without the ListGrid
if (isc.ListGrid) {





//>	@class	DateTimeItem
//
// Subclass of DateItem for manipulating +link{type:FieldType,datetimes}.
//
// @visibility external
// @example dateItem
//<
// Note: This edits 'datetime' type fields, not 'dateTime' type fields, we should possibly rename
// to DatetimeItem.
isc.defineClass("DateTimeItem", "DateItem");


isc.DateTimeItem.addProperties({
    //>	@attr dateTimeItem.useTextField   (boolean : true : IRW)
    // DateTimeItems show datetime values in a freeform text entry area.
    // @group basics
    // @visibility external
    //<              
    useTextField:true,

    //>	@attr	dateTimeItem.displayFormat  (DateDisplayFormat : null : IRW)
    // This property can be used to customize the format in which datetimes are displayed.<br>
    // Should be set to a standard +link{type:DateDisplayFormat} or
    // a function which will return a formatted date time string.
    // <P>
    // If unset, the standard shortDateTime format as set up in 
    // +link{Date.setShortDatetimeDisplayFormat()} will be used.
    // <P>
    // <B>NOTE: you may need to update the +link{DateTimeItem.inputFormat, inputFormat}
    // to ensure the DateItem is able to parse user-entered date strings back into Dates</B>
    // @see dateTimeItem.inputFormat
    // @visibility external
    //<
    
    // set the undocumented showTime flag so we use 'toShortDatetime' rather than 'toShortDate'
    // when formatting our dates by default. Can be overridden via a custom formatter of course.
    showTime:true
    
    //> @attr  dateTimeItem.inputFormat  (DateInputFormat : null : IRW)
    // @include dateItem.inputFormat
    // @visibility external
    //<
});


} // end of if (isc.ListGrid)
