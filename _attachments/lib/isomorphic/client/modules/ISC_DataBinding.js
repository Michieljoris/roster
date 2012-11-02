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



//
// This script will load all of the Isomorhic SmartClient Application Framework libraries for you
//
// The idea is that in your app file you can just load the script "Isomorphic_SmartClient.js" which
// in a production situation would be all of the scripts jammed together into a single file.
//
// However, it's easier to work on the scripts as individual files, this file will load all of the
// scripts individually for you (with a speed penalty).
//		
var libs = 
	[
		"language/XMLSerialize.js",		// serialize an object as an xml string

        "language/XMLTools.js",

		"application/DataSource.js",		// representation of a server data source (databse table, etc)
        "application/WebService.js",       // WebService / WSDL 
		"application/RPCManager.js",	    // framework for editing/interacting with datasources
		"application/DMI.js",	            // Direct Method Invocation
		"application/ResultSet.js",        // data model for Lists loaded incrementally from a server
		"application/ResultTree.js",       // data model for Trees loaded incrementally from a server
		"application/ActionMethods.js",      // flow methods for databinding-capable components
        
        "application/DataView.js",         // Self-contained application element, capable of loading 
                                        // its own config, components and data from webservices
        "application/ServiceOperation.js", // A webservice operation
        
        "application/Offline.js",          // Offline support

        
        
        "application/RulesEngine.js",      // Support for validation rules across multiple databound components
        
		"widgets/EditMode.js",             // support for an editing mode and editing container
		"widgets/PropertySheet.js",        // specialized, compact form

        "widgets/ListEditor.js",           // combination grid and form for editing a list of
                                        // records

		"widgets/ViewLoader.js",	    // manages components dynamically loaded from server
		"widgets/HTMLFlow.js",	        // a block of free-flowing HTML, with dynaload facilities

        "application/WSDataSource.js", // DataSource that works through ISC Web Service
        "application/RestDataSource.js", // Generic DataSource for arbitrary web servers (PHP / etc)

        // load schema needed to perform client-side XML to JS just for WSDL/XMLSchema
        // definitions produced by the schemaTranslator
        "schema/DataSource.ds.xml.js",
        "schema/DataSourceField.ds.xml.js",
        "schema/Validator.ds.xml.js",
        "schema/SimpleType.ds.xml.js",
        "schema/XSComplexType.ds.xml.js",
        "schema/XSElement.ds.xml.js",
        "schema/SchemaSet.ds.xml.js",
        "schema/WSDLMessage.ds.xml.js",
        "schema/WebService.ds.xml.js",
        "schema/WebServiceOperation.ds.xml.js",
        "schema/WSOperationHeader.ds.xml.js",


        "application/Operators.js",        // i18n naming object for AdvancedCriteria operators
		"widgets/form/FilterBuilder.js",	// advanced search form that allows the user to specify
                                        // individual fields and operators
        "widgets/RuleEditor.js",          // widget for editing rules
        
                                        
        //>S3
        //"application/S3.js",
        //<S3
        
        "widgets/ScreenReader.js",
        
        "widgets/DataSourceEditor.js" 
        
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
		document.write("<"+"SCRIPT SRC=" + window.isomorphicDir + "client/" + libs[i]+"><"+"/SCRIPT>");
	}
	window.defaultStatus = "";
}
iscLoadLibs();
