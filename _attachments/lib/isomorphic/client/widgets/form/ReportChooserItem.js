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

 
// Requires Grids
if (isc.ReportBuilder) {




//>	@class	ReportChooserItem
// 
// @visibility internal
//<
isc.defineClass("ReportChooserItem", "ComboBoxItem").addProperties({
    title: "Report",
    optionDataSource: isc.ReportBuilder.defaultDataSource,
    valueField: isc.ReportBuilder.reportIdField,
    displayField: isc.ReportBuilder.reportNameField,
    categoryField: isc.ReportBuilder.reportCategoryField,

    pickListWidth: 250,
    pickListProperties: {
        showHeader: false,
        overFlow: "visible",
        groupStartOpen: "all",
        // In dataArrived, we hack the data then call regroup - by default this won't 
        // re-run openAll as it will attempt to maintain the current open state of the tree. 
        // In this case we want to suppress this behavior and always open all on regroup.
        retainOpenStateOnRegroup:false,
        dataFetchMode: "local",
        dataProperties: {
            dataArrived : function (startRow, endRow) {
                var data = this.localData,
                    record = { reportId: -299, reportName: "Configure...", 
                        reportCategory: "Configuration"
                    }
                ;

                data.add(record);
                var comp = window[this.componentId];
                if (comp && comp.regroup) {
                    comp.regroup();
                }
            }
        }
    },

    init : function () {
        this.pickListFields = [
            { name: this.valueField, showIf: "false" },
            { name: this.categoryField, showIf:"false" },
            { name: this.displayField, title: "Report Name", width: "100%" }        
        ];
        this.pickListProperties.autoFitFieldWidths = false;
        this.pickListProperties.groupByField = this.categoryField
    },

    change : function (form, item, value, oldValue) {
        if (this.grid && value == -299) {
            // the Configure... option
            isc.ReportBuilder.showReportBuilder(this.grid, this.getID()+".reportBuilderReply()");
            if (this.pickList) this.pickList.invalidateCache();
            return false;
        } else return true;
    },
    changed : function (form, item, value) {
        var record = this.getSelectedRecord(); 
        if (this.grid && record && record.reportId != -299) {
            isc.ReportBuilder.setLinkedGridState(record, this.grid);
        }
    },
    reportBuilderReply : function () {
        this.pickList.invalidateCache();
        this.setValue(null);
    }
});

} // if (isc.ReportBuilder)