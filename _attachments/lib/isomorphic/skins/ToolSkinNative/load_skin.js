/*
	Isomorphic SmartClient Tools Skin File
	
    This file contains skinning modifications for SmartClient Tools, allowing controls in
    SmartClient tools to have a different appearance from standard application controls
    
	To load this skin, reference this file in a <SCRIPT> tag immediately
	after your Isomorphic SmartClient loader:
	
		<SCRIPT ...>
*/

isc.loadToolSkin = function (theWindow) {
if (theWindow == null) theWindow = window;
with (theWindow) {
    
    
isc.defineClass("TScrollThumb", "ScrollThumb");
isc.defineClass("THScrollThumb", "TScrollThumb");
isc.defineClass("TVScrollThumb", "TScrollThumb");
isc.defineClass("TScrollbar", "Scrollbar");
isc.defineClass("TPropertySheet", "PropertySheet");
isc.defineClass("TSnapbar", "Snapbar");
isc.defineClass("TLayout", "Layout");
isc.defineClass("TSectionItem", "SectionItem");
isc.defineClass("TSectionStack", "SectionStack");
isc.defineClass("TSectionHeader", "SectionHeader");
isc.defineClass("TImgSectionHeader", "ImgSectionHeader");
isc.defineClass("TImgSectionHeader2", "TImgSectionHeader");
isc.defineClass("TButton", "IButton");
isc.defineClass("TAutoFitButton", "TButton").addProperties({
    autoFit: true,
    autoFitDirection: isc.Canvas.HORIZONTAL
});
isc.defineClass("TTabSet", "TabSet");
isc.defineClass("TTab", "ImgTab");


if (isc.DynamicForm) {
    isc.defineClass("TDynamicForm", "DynamicForm");
}

if (isc.ComponentEditor) {
    isc.defineClass("TComponentEditor", "ComponentEditor");

}

isc.defineClass("TListGrid", "ListGrid");
isc.defineClass("TTreeGrid", "TreeGrid");

if (isc.ListPalette) {
    isc.defineClass("TListPalette", "ListPalette");

    isc.defineClass("TTreePalette", "TreePalette");

    isc.defineClass("TEditTree", "EditTree");
}

isc.defineClass("TTextItem", "TextItem");
isc.defineClass("TColorItem", "ColorItem");
isc.defineClass("TTextAreaItem", "TextAreaItem");
isc.defineClass("TSelectItem", "SelectItem");
isc.defineClass("TRadioGroupItem", "RadioGroupItem");
isc.defineClass("TCheckboxItem", "CheckboxItem");
isc.defineClass("TExpressionItem", "ExpressionItem");
isc.defineClass("TButtonItem", "ButtonItem");
isc.defineClass("THTMLFlow", "HTMLFlow");
isc.defineClass("TMenu", "Menu");
isc.defineClass("TMenuButton", "MenuButton");

if (isc.Window) {
    isc.defineClass("TWindow", "Window");   
    isc.defineClass("TSaveFileDialog", "SaveFileDialog"); 
    isc.defineClass("TLoadFileDialog", "LoadFileDialog");
}

} // End of with(theWindow) block

}   // END of loadToolSkin function definition
// call the loadToolSkin routine
isc.loadToolSkin()
