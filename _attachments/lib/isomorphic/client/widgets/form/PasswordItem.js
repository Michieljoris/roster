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

 





//>	@class	PasswordItem
// FormItem for password fields, where text input by the user should not be shown in readable text.
// @visibility external
//<
isc.ClassFactory.defineClass("PasswordItem", "TextItem");
isc.PasswordItem.addProperties({
	_elementType:"PASSWORD"
});

