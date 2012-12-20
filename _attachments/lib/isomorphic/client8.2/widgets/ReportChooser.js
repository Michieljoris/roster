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




// ----------------------------------------------------------------------------------------


//> @class ReportBuilder 
//
// @treeLocation Client Reference/Reporting
// @visibility internal
//<
isc.ClassFactory.defineClass("ReportBuilder", "VLayout");

isc.ReportBuilder.addClassProperties({

    reportIdField: "reportId",
    reportNameField: "reportName",
    reportCategoryField: "reportCategory",
    reportCreatorField: "reportCreator",
    reportIsSharedField: "reportIsShared",
    reportIsDefaultField: "reportIsDefault",
    reportViewStateField: "reportViewState",

    defaultDataSource: "ReportChooserDS",

    showReportBuilder : function (grid, callback, builderProperties, windowProperties, dataSource) {
        var dialog = isc.Window.create(isc.addProperties({}, 
            {
                isModal: true,
                width: "90%",
                height: "90%",
                title: "Report Builder",
                vertical: true,
                autoSize: true,
                autoCenter: true,
                visible: false,
                callback: callback,
                showMinimizeButton: false,
                closeClick : function () {
                    if (this.callback) this.fireCallback(this.callback);
                    return this.Super("closeClick");
                }
            }, windowProperties)
        );

        var builder = isc.ReportBuilder.create(isc.addProperties({}, 
            {
                width: "100%",
                height: "100%",
                dataSource: dataSource || isc.DS.get(this.defaultDataSource),
                grid: grid,
                callback: callback
            }, builderProperties)
        );

        dialog.body.addChild(builder);
        dialog.show();
    },

    setLinkedGridState : function (record, grid) {
        grid = grid || this.previewGrid;

        if (!grid || !record) return;
        
        var state = record["reportViewState"],
            obj = isc.ReportBuilder.getObjectFromState(state)
        ;

        grid.setCriteria(obj && obj.criteria ? isc.ReportBuilder.getObjectFromState(obj.criteria) : null);

        var fieldObj = isc.ReportBuilder.getObjectFromState(obj.field);

        grid.setFieldState(fieldObj ? fieldObj.field : null);
        grid.setSortState(fieldObj ? fieldObj.sort : null);
        grid.ungroup();
        if (fieldObj.group && fieldObj.group.length > 0) 
            grid.groupBy(fieldObj ? fieldObj.group : null);

        grid.setHiliteState(obj.hilite);

        //obj = this.getObjectFromState(record[this.reportFormulaStateField]);
        //grid.setFormulaState(record[this.reportFormulaStateField]);

        //obj = this.getObjectFromState(record[this.reportSummaryStateField]);
        //grid.setSummaryState(record[this.reportSummaryStateField]);
    },
 
    getObjectFromState : function (state) {
        if (state == null) return null;
        var obj = eval(state);
        return obj;
    },

    getStateForObject : function (obj) {
        if (obj == null) return null;
        return "(" + isc.JSON.encode(obj, {dateFormat:"dateConstructor"}) + ")";
    }

});

isc.ReportBuilder.addProperties({
// attributes 
vertical: true,
padding: 10,
width: 830,
height: 600,

//> @attr ReportBuilder.dataSource (DataSource or ID : null : IRW)
// DataSource providing the available fields for the ReportBuilder.
// <P>
// @group formulaFields
// @visibility internal
//<


layoutDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: 1
}, 

reportGridDefaults: {
    _constructor: "ListGrid",
    width: "100%",
    height: 122,
    autoParent: "layout",
    canEdit: false,
    autoFetchData: true,
    recordClick : function (viewer, record) {
        this.creator.showRecord(record);
    },
    dataArrived : function (startRow, endRow) {
        var selection = this.getSelection();
        
        if (selection && selection.length == 0) {
            this.selectSingleRecord(0);
            this.recordClick(this, this.getRecord(0));
        }
    },
    fields: [
        { name: "reportName", title: "Report Name" },
        { name: "reportDescription", title: "Description" },
        { name: "reportCreator", title: "Created By" },
        { name: "reportIsDefault", type: "boolean", title: "Default" },
        { name: "reportIsShared", type: "boolean", title: "Shared" },
        { name: "reportCategory", title: "Category" }
    ]
},

reportGridButtonLayoutDefaults: {
    _constructor: "HLayout",
    width: "100%",
    height: 1,
    overflow: "visible",
    autoParent: "layout",
    align: "right"
},

cloneSelectedButtonTitle: "Clone",
cloneSelectedButtonDefaults: {
    _constructor: "IButton",
    autoFit: true,
    click: "this.creator.cloneSelected();",
    autoParent: "reportGridButtonLayout"
},
addNewButtonTitle: "+",
addNewButtonDefaults: {
    _constructor: "IButton",
    width: 18,
    click: "this.creator.addNew();",
    autoParent: "reportGridButtonLayout"
},
removeSelectedButtonTitle: "-",
removeSelectedButtonDefaults: {
    _constructor: "IButton",
    width: 18,
    click: "this.creator.removeSelected();",
    autoParent: "reportGridButtonLayout"
},

editorLayoutDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: 1,
    overflow: "visible",
    layoutTopMargin: 15,
    autoParent: "layout"
}, 

editorFormDefaults: {
    _constructor: "DynamicForm",
    width: "100%",
    numCols: 7,
    colWidths: [ 100, "*", "*", 120, 60, 60, 80 ],
    fields: [
        { name: "reportName", type: "text", colSpan: 2, width: "*", title: "Report Name" },
        { name: "reportIsDefault", type: "boolean", colSpan: 1, width: "*", showTitle: false },
        { name: "reportIsShared", type: "boolean", colSpan: 1, width: "*", title: "Shared", showTitle: false },
        { name: "reportCategory", type: "select", width: "*", title: "Category", endRow: true,
            valueMap: [ "Financial", "HR" ]
        },
        { name: "reportDescription", type: "textArea", colSpan: "*", width: "*", height: 66, title: "Description", endRow: true }
    ],
    autoParent: "editorLayout"
}, 

editorTabSetDefaults: {
    _constructor: "TabSet",
    width: "100%",
    height: 200,
    autoParent: "editorLayout"
}, 

editorButtonLayoutDefaults: {
    _constructor: "HLayout",
    width: "100%",
    height: 1,
    overflow: "visible",
    autoParent: "editorLayout",
    backgroundColor: "lightblue",
    membersMargin: 5,
    padding: 3,
    align: "right"
}, 

editorPreviewLabelTitle: "Preview",
editorPreviewLabelDefaults: {
    _constructor: "Label",
    //autoFit: true,
    width: "*",
    height: 22,
    layoutAlign: "right",
    autoParent: "editorButtonLayout"
},

editorTryItButtonTitle: "Apply",
editorTryItButtonDefaults: {
    _constructor: "IButton",
    autoFit: true,
    click: "this.creator.tryIt();",
    layoutAlign: "right",
    autoParent: "editorButtonLayout"
},
editorSaveButtonTitle: "Save",
editorSaveButtonDefaults: {
    _constructor: "IButton",
    autoFit: true,
    click: "this.creator.saveEditor();",
    layoutAlign: "right",
    autoParent: "editorButtonLayout"
},
editorCancelButtonTitle: "Revert",
editorCancelButtonDefaults: {
    _constructor: "IButton",
    autoFit: true,
    click: "this.creator.cancelEditor();",
    layoutAlign: "right",
    autoParent: "editorButtonLayout"
},

criteriaPaneDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: "100%",
    
    formDefaults: {
        _constructor: "DynamicForm",
        width: 160,
        height: 22,
        fields: [
            { name: "criteriaType", type: "radioGroup", colSpan: "*", width: "*",
                showTitle: false,
                vertical: false,
                valueMap: [ "Basic", "Advanced" ],
                defaultValue: "Advanced",
                changed : function (form, item, value) {
                    form.creator.showFilterBuilder(value);
                }
            }
        ],
        extraSpace: 10
    },

    filterBuilderDefaults: {
        _constructor: "FilterBuilder",
        width: "100%",
        height: "100%"
    },
    
    initWidget : function () {
        this.Super("initWidget", arguments);
        
        if (this.criteriaState) {
            this.initialCriteria = this.getState(this.criteriaState);
        }

        this.addAutoChild("form");

        this.addAutoChild("filterBuilder", { 
            dataSource: this.dataSource,
            criteria: this.initialCriteria
        });

        this.addMember(this.filterBuilder);
    },

    showFilterBuilder : function (value) {
        var criteria = this.filterBuilder.getCriteria();
        this.removeMember(this.filterBuilder);
        this.filterBuilder.destroy();
        this.filterBuilder = null;

        var props = {
            dataSource: this.dataSource,
            criteria: criteria
        };
        
        if (value == "Basic") props.topOperatorAppearance = "radio";

        this.addAutoChild("filterBuilder", props);

        this.addMember(this.filterBuilder);
    },

    getCriteria : function () {
        var criteria = this.filterBuilder.getCriteria();
        if (!criteria || criteria.criteria.length == 0) return null;
        return criteria;
    },
    setCriteria : function (criteria) {
        return this.filterBuilder.setCriteria(criteria);
    },
    getState : function (crit) {
        crit = crit || this.getCriteria();
        if (crit == null) return null;
        return "(" + isc.JSON.encode(crit, {dateFormat:"dateConstructor"}) + ")";
    },
    setState : function (state) {
        //!DONTOBFUSCATE
        if (state == null) this.setCriteria(null);
        var crit = eval(state);
        this.setCriteria(crit);
    }
},

columnPaneDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: "100%",

    layoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    layoutLabelDefaults: {
        _constructor: "Label",
        width: "100%",
        height: "30",
        contents: "Use the arrows or drag and drop column-names to configure visible columns."+
            "  You may also directly manipulate the Preview grid below.",
        autoParent: "layout"
    },

    childLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%",
        autoParent: "layout"
    },
    
    fieldGridDefaults: {
        _constructor: "ListGrid",
        width: "30%",
        height: "100%",
        autoParent: "childLayout",
        fields: [
            { name: "title", title: "Title" },
            { name: "type", title: "Type" }
        ],

        canDragRecordsOut: true,
        canAcceptDroppedRecords: true,
        canReorderRecords: true,
        dragDataAction: "move",

        transferRecords : function (dropRecords, targetRecord, index, sourceWidget, callback) {
            dropRecords.setProperty("isInGrid", false);
            this.Super("transferRecords", arguments);
        }
    },

    buttonLayoutDefaults: {
        _constructor: "VLayout",
        width: 1,
        height: "100%",
        autoParent: "childLayout",
        padding: 10,
        align: "center",
        layoutAlign: "center"
    },

    moveLeftButtonDefaults: {
        _constructor: "IButton",
        width: 30,
        height: 30,
        title: "<<",
        autoParent: "buttonLayout",
        layoutAlign: "center",
        disabled: true,
        click: "this.creator.moveSelectionLeft()"
    },

    moveRightButtonDefaults: {
        _constructor: "IButton",
        width: 30,
        height: 30,
        title: ">>",
        autoParent: "buttonLayout",
        layoutAlign: "center",
        disabled: true,
        click: "this.creator.moveSelectionRight()"
    },

    configGridDefaults: {
        _constructor: "ListGrid",
        width: "*",
        height: "100%",
        autoParent: "childLayout",
        fields: [
            { name: "name", showIf: "false", title: "Name" },
            { name: "title", title: "Title" },
            { name: "width", title: "Width" },
            { name: "frozen", canToggle: true, type: "boolean", title: "Frozen" },
            { name: "sortIndex", title: "Sort Order" },
            { name: "sortDirection", type: "select", title: "Sort Direction", 
                valueMap: { ascending: "Ascending", descending: "Descending" }
            },
            { name: "groupIndex", title: "Group By Order"},
            { name: "masterIndex", showIf: "false" }
        ],
        initialCriteria: { _constructor: "AdvancedCriteria", operator: "and",
            criteria: [
                { fieldName: "isInGrid", operator: "equal", value: true}
            ]
        },
        initialSort: [
            { property: "masterIndex", direction: "ascending" }
        ],
        canEdit: true,
        autoSaveEdits: true,

        canDragRecordsOut: true,
        canAcceptDroppedRecords: true,
        canReorderRecords: true,
        dragDataAction: "move",
        
        transferRecords : function (dropRecords, targetRecord, index, sourceWidget, callback) {
            dropRecords.setProperty("isInGrid", true);
            this.Super("transferRecords", arguments);
        }

    },

    getPreviewGrid : function () {
        if (!this.previewGrid) {
            this.previewGrid = this.creator.previewGrid;
            var _this = this;
            this.observe(this.previewGrid, "viewStateChanged", "observer.setData(observer.previewGrid);");
        }
        return this.previewGrid;
    },
    
    initWidget : function () {
        this.Super("initWidget", arguments);

        this.addAutoChild("layout");
        this.addAutoChild("layoutLabel");
        this.addAutoChild("childLayout");

        this.addAutoChild("fieldGrid");
        this.addAutoChildren([ "buttonLayout", "moveLeftButton", "moveRightButton" ]);
        this.addAutoChild("configGrid", { previewGrid: this.getPreviewGrid() });

        if (this.columnState) {
            this.setState(this.columnState);
        } else {
            this.setInitialData();
        }
    },

    moveSelectionLeft : function () {
        var selected = this.configGrid.getSelection();
        selected.setProperty("isInGrid", false);
        if (selected) this.fieldGrid.transferRecords(selected, null, null, this.configGrid);
    },

    moveSelectionRight : function () {
        var selected = this.fieldGrid.getSelection();
        if (selected) this.configGrid.transferRecords(selected, this.configGrid.data.length-1, this.configGrid.data.length, this.fieldGrid);
    },

    getState : function () {
        return isc.ReportBuilder.getStateForObject(this.getData());
    },
    setState : function (state) {
        if (!state) {
            this.setInitialData();
            return;
        }

        var obj = isc.ReportBuilder.getObjectFromState(state),
            previewGrid = this.getPreviewGrid(),
            linkedGrid = this.linkedGrid
        ;

        previewGrid.setFieldState(obj.field);
        previewGrid.setSortState(obj.sort);
        if (obj && obj.group == "") obj.group = null;
        previewGrid.groupByFields = obj.group;
        previewGrid.groupBy(obj.group);

        this.setData(previewGrid);
    },

    setInitialData : function () {
        this.setData(this.linkedGrid);
    },

    getData : function () {
        var grid = this.getPreviewGrid();

        var result = { 
            field: isc.ReportBuilder.getObjectFromState(grid.getFieldState()),
            sort: {}
        };

        var fieldData = this.configGrid.data,
            groupFields = [],
            sortFields = []

        for (var i=0; i<result.field.length; i++) {
            var field = result.field[i],
                configField = fieldData.find("name", field.name)
            ;

            if (configField) {
                delete field.visible;
                field.frozen = configField.frozen;
                delete field._calculatedAutoFitWidth;
                if (configField.width == "AutoFit") {
                    field.autoFitWidth = true;
                    delete field.width;
                    //field.width = null;
                } else {
                    var width = configField.width != null ? configField.width : "*";
                    delete field.autoFitWidth;
                    var intWidth = parseInt(width);
                    field.width = !isNaN(intWidth) ? intWidth : width;
                }

                if (configField.groupIndex != null) {
                    groupFields.add({ name: configField.name, groupIndex: configField.groupIndex });
                }

                if (configField.sortIndex != null) {
                    sortFields.add({ name: configField.name, sortDirection: configField.sortDirection, sortIndex: configField.sortIndex });
                }

            } else {
                field.visible = false;
            }
        }

        if (sortFields) {
            sortFields = sortFields.sortByProperty("sortIndex", true);

            for (var i=0; i<sortFields.length; i++) {
                if (!result.sort.sortSpecifiers) result.sort.sortSpecifiers = [];
                result.sort.sortSpecifiers.add(
                    { property: sortFields[i].name, direction: sortFields[i].sortDirection } 
                );
            }
        }

        // grouping
        if (groupFields) {
            groupFields = groupFields.sortByProperty("groupIndex", true);
            result.group = groupFields.getProperty("name").join(",");
        }

        return result;
    },
    setData : function (grid) {
        var data = grid.getAllFields();

        var visibleFields = grid.getFields(),
            sortSpecifiers = grid.getSort(),
            groupByFields = grid.getGroupByFields(),
            newData = []
        ;

        for (var i=0; i<data.length; i++) {
            var dataItem = isc.shallowClone(data[i]),
                visibleItem = visibleFields.find("name", dataItem.name),
                sortSpec = grid.getSortSpecifier(dataItem.name),
                sortIndex = sortSpec ? sortSpecifiers.indexOf(sortSpecifiers.find("property", dataItem.name)) : 0,
                itemGrouped = groupByFields ? groupByFields.contains(dataItem.name) : false,
                groupIndex = itemGrouped ? groupByFields.indexOf(dataItem.name) : 0
            ;

            if (visibleItem && visibleItem.visible != false) {
                dataItem.isInGrid = true;
            } else {
                dataItem.isInGrid = false;
            }

            if (dataItem.autoFitWidth) dataItem.width = "AutoFit";
            if (!dataItem.width) dataItem.width = "*";

            if (sortSpec) {
                dataItem.sortIndex = sortIndex + 1;
                dataItem.sortDirection = sortSpec.direction;
            } else {
                delete dataItem.sortIndex;
                delete dataItem.sortDirection;
            }

            if (itemGrouped) {
                dataItem.groupIndex = groupIndex + 1;
            } else {
                delete dataItem.groupIndex;
            }

            newData.add(dataItem);
        }

        var rows;
        if (this.fieldGrid) {
            rows = newData.findAll("isInGrid", false);
            this.fieldGrid.setData(rows ? rows.duplicate() : []);
        }
        if (this.configGrid) {
            rows = newData.findAll("isInGrid", true);
            this.configGrid.setData(rows ? rows.duplicate() : []);
        }
    }
},

hilitePaneDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: "100%",
    overflow: "auto",
    
    hiliteEditorDefaults: {
        _constructor: "HiliteEditor",
        width: "100%",
        height: "100%",
        showHiliteButtons: false
    },
    
    initWidget : function () {
        this.Super("initWidget", arguments);
        
        if (this.hiliteState) {
            this.hilites = this.getState(this.hiliteState);
        }

        this.addAutoChild("hiliteEditor", { 
            dataSource: this.dataSource,
            hilites: this.hilites
        });
        
        this.addMember(this.hiliteEditor);
    },
    getState : function (hilites) {
        var state = hilites || this.hiliteEditor.getHiliteState();
        return state;
    },
    setState : function (state) {
        //!DONTOBFUSCATE
        this.hiliteEditor.clearHilites();
        if (state == null) {
            this.hiliteEditor.setHilites(null);
            return;
        }
        var hilites = eval(state);

        this.hiliteEditor.setHilites(hilites);
    }
},

formulaPaneDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: "100%",

    layoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    childLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%",
        autoParent: "layout"
    },
    
    fieldGridDefaults: {
        _constructor: "ListGrid",
        width: "30%",
        height: "100%",
        autoParent: "childLayout",
        fields: [
            { name: "title", title: "Title" },
            { name: "type", title: "Type" }
        ]
    },

    builderDefaults: {
        _constructor: "FormulaBuilder",
        width: "*",
        height: "100%",
        autoParent: "childLayout"
    },

    initWidget : function () {
        this.Super("initWidget", arguments);
        
        if (this.formulaState) {
            //this.formula = this.getState(this.formulaState);
        }

        this.addAutoChild("layout");
        this.addAutoChild("layoutLabel");
        this.addAutoChild("childLayout");

        this.addAutoChild("fieldGrid");
        this.addAutoChild("builder", { dataSource: this.dataSource });

        this.addMember(this.layout);
    },
    getState : function (hilites) {
        //return hilites || this.hiliteEditor.getHiliteState();
    },
    setState : function (state) {
        //!DONTOBFUSCATE
        //if (state == null) this.hiliteEditor.setHilites(null);
        //var hilites = eval(state);
        //this.hiliteEditor.setHilites(hilites);
    }
},

summaryPaneDefaults: {
    _constructor: "VLayout",
    width: "100%",
    height: "100%",

    layoutDefaults: {
        _constructor: "VLayout",
        width: "100%",
        height: "100%"
    },

    childLayoutDefaults: {
        _constructor: "HLayout",
        width: "100%",
        height: "100%",
        autoParent: "layout"
    },
    
    fieldGridDefaults: {
        _constructor: "ListGrid",
        width: "30%",
        height: "100%",
        autoParent: "childLayout",
        fields: [
            { name: "title", title: "Title" },
            { name: "type", title: "Type" }
        ]
    },

    builderDefaults: {
        _constructor: "SummaryBuilder",
        width: "*",
        height: "100%",
        autoParent: "childLayout"
    },

    initWidget : function () {
        this.Super("initWidget", arguments);
        
        if (this.summaryState) {
            //this.summary = this.getState(this.summaryState);
        }

        this.addAutoChild("layout");
        this.addAutoChild("layoutLabel");
        this.addAutoChild("childLayout");

        this.addAutoChild("fieldGrid");
        this.addAutoChild("builder", { dataSource: this.dataSource });

        this.addMember(this.layout);
    },
    getState : function (hilites) {
        //return hilites || this.hiliteEditor.getHiliteState();
    },
    setState : function (state) {
        //!DONTOBFUSCATE
        //if (state == null) this.hiliteEditor.setHilites(null);
        //var hilites = eval(state);
        //this.hiliteEditor.setHilites(hilites);
    }
},

previewGridDefaults: {
    _constructor: "ListGrid",
    width: "100%",
    height: 122,
    autoParent: "layout",
    canEdit: false,
    autoFetchData: true
},

normalAutoChildren: [
    "layout", 
        "reportGrid", 
        "reportGridButtonLayout",
            "cloneSelectedButton",
            "adddNewButton",
            "removeSelectedButton"
],

editorAutoChildren: [
    "editorLayout",
        "editorForm",
        "editorTabSet",
        "editorButtonLayout",
            "editorPreviewLabel",
            "editorSaveButton",
            "editorCancelButton"
],

otherAutoChildren: [
    "previewGrid"
],

initWidget : function () {
    this.Super("initWidget", arguments);

    this.reportIdField = this.reportIdField || this.getClass().reportIdField;
    this.reportNameField = this.reportNameField || this.getClass().reportNameField;
    this.reportCategoryField = this.reportCategoryField || this.getClass().reportCategoryField;
    this.reportCreatorField = this.reportCreatorField || this.getClass().reportCreatorField;
    this.reportIsSharedField = this.reportSharedField || this.getClass().reportIsSharedField;
    this.reportIsDefaultField = this.reportIsDefaultField || this.getClass().reportIsDefaultField;
    this.reportViewStateField = this.reportViewStateField || this.getClass().reportViewStateField;

    // get the dataSource so we know what fields to support
    this.dataSource = isc.DS.get(this.dataSource);

    if (!isc.isA.DataSource(this.dataSource)) 
        this.dataSource = isc.DS.get(this.getClass().defaultDataSource);

    this.addAutoChild("layout");

    var props = { dataSource: this.dataSource };

    var criteria = null;

    this.addAutoChild("reportGrid", { dataSource: this.dataSource, initialCriteria: criteria });

    this.addAutoChild("reportGridButtonLayout");

    this.addAutoChild("cloneSelectedButton", { title: this.cloneSelectedButtonTitle });
    this.addAutoChild("addNewButton", { title: this.addNewButtonTitle });
    this.addAutoChild("removeSelectedButton", { title: this.removeSelectedButtonTitle });

    this.createEditorLayout();

    var linkedGrid = this.getGrid();
    this.addAutoChild("previewGrid", { 
        dataSource: linkedGrid.dataSource
    });

    var state = linkedGrid.getViewState();
    this.previewGrid.setViewState(state);
},

createEditorLayout : function () {
    if (!this.editorLayout) {
        this.addAutoChild("editorLayout");

        this.addAutoChild("editorForm", { dataSource: this.dataSource, extraSpace: 10 });

        this.addMember(isc.LayoutSpacer.create({ width: "100%", height: 10 }));
        this.addAutoChild("editorTabSet");

        this.editorTabSet.addTabs([
            { ID: "criteria_tab", name: "criteriaPane", title: "Criteria", selected: true },
            { ID: "columns_tab", name: "columnsPane", title: "Columns" },
            { ID: "hilites_tab", name: "hilitesPane", title: "Hilites" },
            { ID: "formula_tab", name: "formulaPane", title: "Calculated Columns" },
            { ID: "summary_tab", name: "summaryPane", title: "Summary Columns" }
        ]);
        this.editorTabSet.selectTab(0);

        this.addAutoChild("criteriaPane", { 
            dataSource: this.getGridDataSource()
        });
        this.editorTabSet.setTabPane(0, this.criteriaPane);

        this.addAutoChild("columnPane", { 
            dataSource: this.getGridDataSource(),
            linkedGrid: this.getGrid()
        });
        this.editorTabSet.setTabPane(1, this.columnPane);

        this.addAutoChild("hilitePane", { 
            dataSource: this.getGridDataSource()
        });
        this.editorTabSet.setTabPane(2, this.hilitePane);

        this.addAutoChild("formulaPane", { 
            dataSource: this.getGridDataSource()
        });
        this.editorTabSet.setTabPane(3, this.formulaPane);

        this.addAutoChild("summaryPane", { 
            dataSource: this.getGridDataSource()
        });
        this.editorTabSet.setTabPane(4, this.summaryPane);


        this.addAutoChild("editorButtonLayout");
        this.addAutoChild("editorPreviewLabel", { contents: this.editorPreviewLabelTitle });
        this.addAutoChild("editorTryItButton", { title: this.editorTryItButtonTitle });
        this.addAutoChild("editorSaveButton", { title: this.editorSaveButtonTitle });
        this.addAutoChild("editorCancelButton", { title: this.editorCancelButtonTitle });
    } else {
        this.editorLayout.show();
    }
},


getUserID : function () {
    return "testUser";
},

getSelected : function () {
    var selection = this.reportGrid.getSelection();
    if (isc.isAn.Array(selection) && selection.length > 0) return selection[0];
    return null;
},

cloneSelected : function () {
    var record = this.getSelected();
    if (record) {
        var newRecord = isc.addProperties({}, record);
        newRecord[this.dataSource.getPrimaryKeyFieldNames()[0]] = null;
        this.showEditor(newRecord, "add");
    }
},
showRecord : function (record) {
    if (record) this.showEditor(record);
},
addNew : function () {
    this.showEditor(null, "add");
},
removeSelected : function () {
    var record = this.getSelected();
    if (record) {
        this.reportGrid.removeRecord(null, record);
    }
},

getGrid : function () {
    return this.grid;
},
setGrid : function (grid) {
    this.grid = grid;
},

getGridDataSource : function () {
    var grid = this.getGrid();

    if (!grid) return this.dataSource;
    return grid.getDataSource();
},

showEditor : function (record, formOperationType) {
//    this.cloneSelectedButton.disable();
//    this.addNewButton.disable();
//    this.removeSelectedButton.disable();

//    this.reportGrid.disable();

    this.setEditorData(record, formOperationType);
}

});

isc.ReportBuilder.addProperties({


getEditorCriteriaState : function () {
    return this.criteriaPane ? this.criteriaPane.getState() : null;
},
setEditorCriteriaState : function (record) {
    if (this.criteriaPane) 
        this.criteriaPane.setState(record ? record.criteria : null);
},
getEditorColumnState : function () {
    return this.columnPane ? this.columnPane.getState() : null;
},
setEditorColumnState : function (record) {
    if (this.columnPane) this.columnPane.setState(record ? record.field : null);
},
getEditorHiliteState : function () {
    return this.hilitePane ? this.hilitePane.getState() : null;
},
setEditorHiliteState : function (record) {
    if (this.hilitePane) this.hilitePane.setState(record ? record.hilite : null);
},
getEditorSummaryState : function () {
    return this.summaryPane ? this.summaryPane.getState() : null;
},
setEditorSummaryState : function (record) {
    if (this.summaryPane) this.summaryPane.setState(record ? record.summary : null);
},
getEditorFormulaState : function () {
    return this.formulaPane ? this.formulaPane.getState() : null;
},
setEditorFormulaState : function (record) {
    if (this.formulaPane) this.formulaPane.setState(record ? record.formula : null);
},

setEditorData : function (record, formOperationType) {
    var form = this.editorForm;

    // get the form going
    if (!record || formOperationType == "add") {
        form.editNewRecord( isc.addProperties({}, record, { reportCreator: this.getUserID() }) );
    } else form.editRecord(record);

    // populate the criteria, column, hilite, formula and summary tabs
    var state = record ? isc.ReportBuilder.getObjectFromState(record[this.reportViewStateField]) : null;
    this.setEditorCriteriaState(state);
    this.setEditorColumnState(state);
    this.setEditorHiliteState(state);
    this.setEditorFormulaState(state);
    this.setEditorSummaryState(state);

    this.tryIt();
},

clearEditorData : function () {
    this.setEditorData(null, null);
},

hideEditor : function () {
    this.editorLayout.hide();

    var selected = this.getSelected();
    this.cloneSelectedButton.setDisabled(!selected);
    this.addNewButton.enable();
    this.removeSelectedButton.setDisabled(!selected);

    this.reportGrid.enable();
},

updateFormRecord: function () {
    var form = this.editorForm;

    var result = {
            criteria: this.getEditorCriteriaState(),
            field: this.getEditorColumnState(),
            hilite: this.getEditorHiliteState(),
            formula: this.getEditorFormulaState(),
            summary: this.getEditorSummaryState()
        };
    form.setValue(this.reportViewStateField, isc.ReportBuilder.getStateForObject(result));
},

saveEditor : function () {
    this.updateFormRecord();
    //this.logWarn("Saving report template record: \n\n"+isc.echoFull(this.editorForm.getValues()));
    this.editorForm.saveData();
},

cancelEditor : function () {
    var selected = this.getSelected(),
        opType = this.editorForm.formOperationType,
        index = 0
    ;

    if (opType != "add") {
        index = this.reportGrid.getRecordIndex(selected);
    }
    this.clearEditorData();
    this.reportGrid.deselectAllRecords();
    this.reportGrid.selectSingleRecord(index);
    this.showEditor(this.reportGrid.getRecord(index));
},

tryIt : function () {
    if (this.columnPane && this.columnPane.configGrid) this.columnPane.configGrid.endEditing();
    this.updateFormRecord();
    isc.ReportBuilder.setLinkedGridState(this.editorForm.getData(), this.previewGrid);
}

});


