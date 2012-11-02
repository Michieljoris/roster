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

var libs = 
	[
		"widgets/Drawing",		// VML, SVG, CANVAS abstraction layer and drawing primitives
        "widgets/DrawKnob"
	];

//<STOP PARSING 

// The following code only executes if the script is being dynamically loaded.

// the following statement allows a page that is not in the standard location to take advantage of
// dynamically loaded scripts by explicitly setting the window.isomorphiDir variable itself.
if (! window.isomorphicDir) window.isomorphicDir = "../isomorphic/";

// dynamic loading
function iscLoadLibs() {
	for(var i=0,l=libs.length;i<l;i++) {
		if (!libs[i]) continue;
		if (window.UNSUPPORTED_BROWSER_DETECTED == true) break;
		document.write("<"+"SCRIPT SRC=" + window.isomorphicDir + "client/" + libs[i]+".js><"+"/SCRIPT>");
	}
	window.defaultStatus = "";
}
iscLoadLibs();
