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

 
// FilterBuilder requires DynamicForm but is loaded in a separate module. 
// Ensure DF is present before attempting to initialize
if (isc.DynamicForm) {



// This class is used by the clause forms that make up a filter-builder.
// Extend SearchForm rather than DynamicForm - this ensures we show editableItems if
// canFilter is true.
isc.defineClass("DynamicFilterForm", "SearchForm");
isc.DynamicFilterForm.addProperties({
    
    _$Enter:"Enter",
    handleKeyPress : function (event, eventInfo) {
        // We need to suppress normal DynamicForm saveOnEnter behavior; we also need to let
        // the FilterBuilder that will eventually see this event know whether or not the field
        // triggering it was a TextItem
        var item = this.getFocusSubItem();
        if (isc.isA.TextItem(item)) eventInfo.firedOnTextItem = true;
        
        // But we need normal key handling for everything except Enter!
        if (event.keyName != this._$Enter) {
            return this.Super("handleKeyPress", [event, eventInfo]);
        }
    },
    itemChanged : function (item, newValue, oldValue) {
        if (this.creator.itemChanged) this.creator.itemChanged();
    }

});



//> @class FilterClause
// An HStack-based widget that allows a user to input a single criterion based on one field and
// one operator.
// <P>
// Note that FilterClauses must be used in conjunction with a +link{class:filterBuilder}. By default
// the FilterBuilder will auto-generate its clauses based on specified criteria, but for advanced
// usage a FilterClause may be instantiated directly and passed to a filterBuilder via 
// +link{filterBuilder.addClause()}.
// 
// @treeLocation Client Reference/Forms
// @visibility external
//<

isc.defineClass("FilterClause", "HStack").addProperties({

height: 20,

//> @attr filterClause.criterion (Criteria : null : IRW)
// Initial criterion for this FilterClause.
// <P>
// When initialized with a criterion, the clause will be automatically set up for editing
// the supplied criterion.
// <P>
// Note that an empty or partial criterion is allowed, for example, it may specify
// +link{criterion.fieldName} only and will generate an expression with the operator not chosen.
// @visibility external
//<

//> @attr filterClause.showFieldTitles (boolean : true : IR)
// If true (the default), show field titles in the drop-down box used to select a field for querying.
// If false, show actual field names instead.
// @visibility external
//< 
showFieldTitles: true,

//> @attr filterClause.validateOnChange (boolean : true : IR)
// If true (the default), validates the entered value when it changes, to make sure it is a 
// a valid value of its type (valid string, number, and so on).  No other validation is 
// carried out.  If you switch this property off, it is still possible to validate the 
// <code>FilterClause</code> by calling +link{filterClause.validate()} from your own code.
// @visibility external
//< 
validateOnChange: true,

// Clause creation
// ---------------------------------------------------------------------------------------

fieldPickerWidth: 150,
operatorPickerWidth: 150,
valueItemWidth: 150,

fieldPickerDefaults: { 
    type: "SelectItem", 
    name: "fieldName", 
    showTitle: false, 
    textMatchStyle: "startsWith",
    changed : function () { this.form.creator.fieldNameChanged(this.form); }
},

//> @attr filterClause.fieldPickerTitle (String : "Field Name" : IR)
// The title for the +link{filterBuilder.fieldPicker, field-picker} select-item.
// @group i18nMessages
// @visibility external
//<
fieldPickerTitle: "Field Name",

operatorPickerDefaults : {
    // list of operators
    name:"operator", 
    type:"select", 
    showTitle:false, 
    addUnknownValues:false, 
    defaultToFirstOption:true,
    changed : function () { this.form.creator.operatorChanged(this.form); }
},

//> @attr filterBuilder.operatorPickerTitle (String : "Operator" : IR)
// The title for the operator-picker select-item.
// @group i18nMessages
// @visibility external
//<
operatorPickerTitle: "Operator",


//> @attr filterClause.valueItemTitle (String : "Value" : IR)
// The title for the value-item.
// @group i18nMessages
// @visibility external
//<
valueItemTitle: "Value",

//> @attr filterClause.valueSetHint (String : "Enter values separated by comma" : IR)
// A hint to show in the value-item when editing an operator which takes an array of values.
// @group i18nMessages
// @visibility rules
//<

valueSetHint:"Enter values separated by comma",


//> @attr filterClause.clause (AutoChild : null : IR)
// AutoChild containing the UI for the filter-properties in this FilterClause.
// @visibility external
//<
clauseConstructor: isc.DynamicFilterForm,

//> @attr filterClause.showRemoveButton (boolean : true : IR)
// If set, show a button for this clause allowing it to be removed.
// @visibility external
//<
showRemoveButton:true,

//> @attr filterClause.removeButtonPrompt (string : "Remove" : IR)
// The hover prompt text for the remove button.
//
// @group i18nMessages 
// @visibility external
//<
removeButtonPrompt: "Remove",
  
// set this flag to prevent non-filterable fields from being excluded - such exclusion makes
// sense in a FilterBuilder, but we don't want it when we're using a FilterClause widget simply 
// as a UI - for instance, from the HiliteEditor.
excludeNonFilterableFields: true,

//> @attr filterClause.removeButton (AutoChild : null : IR)
// The clause removal ImgButton that appears before this clause if
// +link{showRemoveButton} is set.
// @visibility external
//<
removeButtonDefaults : {
    _constructor:isc.ImgButton,
    width:18, height:18, layoutAlign:"center",
    src:"[SKIN]/actions/remove.png",
    showRollOver:false, showDown:false,
    showDisabled:false, // XXX
    click: function () { this.creator.remove(); }
},

flattenItems: true
    
});

isc.FilterClause.addMethods({

initWidget : function () {
    this.Super("initWidget", arguments);
    this.setupClause();
},

//> @method filterClause.getFilterBuilder()
// Returns the +link{class:filterBuilder,filterBuilder} containing this clause, or null if
// this filterClause is not embedded in a filterBuilder.
// @visibility external
//<
getFilterBuilder : function () {
    // filterBuilder attribute is set by filterBuilder.addClause()
    return this.filterBuilder;
},

// getPrimaryDS() - this returns the dataSource used to drive field operators etc.
getPrimaryDS : function (fieldName) {
    if (this.dataSources) {
        
        if (fieldName == null) {
            return isc.DataSource.get(this.dataSources[0]);
        }
        
        if (isc.isAn.Object(fieldName)) {
            if (fieldName._origField != null) {
                fieldName = fieldName._origField;
            }
            for (var i = 0; i < this.dataSources.length; i++) {
                var fields = isc.getValues(this.dataSources[i].getFields());
                if (fields.contains(fieldName)) return this.dataSources[i];
            }
            // it's an object but wasn't an actual field within a DS, grab the name
            
            fieldName = fieldName.name;
        }

        return isc.DataSource.getDataSourceForField(fieldName, this.dataSources);
    }
    if (this.dataSource) return this.getDataSource();
    else if (this.fieldDataSource) return this.fieldDataSource;
},

getField : function (fieldName) {
    if (isc.isAn.Object(fieldName)) return fieldName;
    var field;
    if (this.dataSources) {
        field = isc.DataSource.getFieldFromDataSources(fieldName, this.dataSources);
    } else if (this.dataSource) {
        field = this.getDataSource().getField(fieldName);
    } else {
        if (this.clause) {
            field = this.fieldData ? this.fieldData[fieldName] : null;
            if (!field) field = this.clause.getField("fieldName").getSelectedRecord();
            if (!field) field = this.field;
            else this.field = field;
        }
    }
    return field;
},

getFieldNames : function () {
    if (this.dataSources) {
        return isc.DataSource.getCombinedDataSourceFields(this.dataSources);
    }
    if (this.dataSource) return this.getDataSource().getFieldNames(true);
},

getFieldOperatorMap : function (field, includeHidden, valueType, omitValueType) {
    return this.getPrimaryDS(field).getFieldOperatorMap(field, includeHidden, valueType, omitValueType);
},

getSearchOperator : function (operatorName, field) {
    return this.getPrimaryDS(field).getSearchOperator(operatorName);
},

combineFieldData : function (field, targetField) {
    var ds = this.getPrimaryDS(targetField),
        dsField = this.getField(targetField);
        
    if (dsField) 
        return ds.combineFieldData(field, targetField);
    else return field;
},

// setupClause initializes autoChildren etc.
setupClause : function () {
    this._clauseInitialized = true;
    if (this.dataSource && !isc.isA.DataSource(this.dataSource))
        this.dataSource = isc.DataSource.get(this.dataSource);
    if (this.fieldDataSource && !isc.isA.DataSource(this.fieldDataSource))
        this.fieldDataSource = isc.DataSource.get(this.fieldDataSource);

    if (this.showRemoveButton) {
        this.addAutoChild("removeButton", { prompt: this.removeButtonPrompt });
    }

    this.fieldPickerDefaults.title = this.fieldPickerTitle;
    this.operatorPickerDefaults.title = this.operatorPickerTitle;
    
    var fieldMap = {};

    if (this.showClause != false) {
        if (this.topOperatorAppearance == "inline") {
            if (this.topOperator == "and") {
                var map = {and: this.creator.inlineAndTitle, not: this.creator.inlineAndNotTitle};
            } else {
                var map = {or: this.creator.inlineOrTitle, not: this.creator.inlineAndNotTitle};
            }
            var operatorIndex = 0;
            this.topOperatorFormProperties = {layoutAlign: "top"};
            if (this.creator.showSelectionCheckbox) {
                isc.addProperties(this.topOperatorFormProperties, {
                    numCols: 2,
                    width: 120,
                    colWidths: ["20%", "80%"]
                });
                this.topOperatorFormProperties.items = this.topOperatorFormDefaults.items;
                this.topOperatorFormProperties.items.addAt({
                    name: "select",
                    type: "checkbox",
                    showTitle: false,
                    showLabel: false,
                    defaultValue: false,
                    showIf: function() { return this.form.creator.showSelectionCheckbox }
                }, 0);
                operatorIndex = 1;
            }
            this.addAutoChild("topOperatorForm");
            this.topOperatorForm.items[operatorIndex].valueMap = map;
            this.topOperatorForm.items[operatorIndex].defaultValue = this.negated ? 
                                                                     "not" : this.topOperator;
            this.updateInlineTopOperator();
        }
        var items = [
                isc.addProperties(isc.clone(this.fieldPickerDefaults), 
                    { width: this.fieldPickerWidth }, 
                    this.fieldPickerProperties,
                    {name:"fieldName"}
                ),
                isc.addProperties(isc.clone(this.operatorPickerDefaults), 
                    { width: this.operatorPickerWidth }, 
                    this.operatorPickerProperties,
                    { name:"operator" }
                )
            ],
            criterion = this.criterion,
            fieldNames = this.getFieldNames(),
            selectedFieldName
        ;

        if (this.fieldName && (this.dataSource || this.dataSources)) {
            // fieldName provided - change the type of the first DF field and set it's value -
            // this behavior is only supported when this.dataSource is present
            var specificFieldName = this.fieldName;
            var field = this.getField(specificFieldName),
                fieldTitle
            ;

            isc.addProperties(items[0], { type: "staticText", clipValue: true, wrap: false });

            if (!field || (this.excludeNonFilterableFields && field.canFilter == false)) specificFieldName = fieldNames[0];
            else if (this.showFieldTitles) {
                fieldTitle = field.title ? field.title : specificFieldName;
            }
            items[0].defaultValue = specificFieldName;
            if (fieldTitle != null) {
                var valueMap = {};
                valueMap[specificFieldName] = fieldTitle;
                items[0].valueMap = valueMap;
            }            
            selectedFieldName = specificFieldName;
        } else {
            if (this.fieldDataSource) {
                // change the fieldPicker to be a ComboBoxItem, setup the fieldDataSource as 
                // it's optionDataSource and provide type-ahead auto-completion
                isc.addProperties(items[0], {
                    type: "ComboBoxItem",
                    completeOnTab: true,
                    optionDataSource: this.fieldDataSource,
                    valueField: "name",
                    displayField: this.showFieldTitles ? "title" : "name",
                    pickListProperties: { reusePickList : function () { return false;} } 
                });
                if (this.field) items[0].defaultValue = this.field.name;
            } else {
                // build and assign a valueMap to the fieldPicker item
                for (var i = 0; i < fieldNames.length; i++) {
                    var fieldName = fieldNames[i],
                        field = this.getField(fieldName);
                    if (this.excludeNonFilterableFields && field.canFilter == false) continue;
                    if (this.showFieldTitles) {
                        var fieldTitle = field.title;
                        fieldTitle = fieldTitle ? fieldTitle : fieldName;
                        fieldMap[fieldName] = fieldTitle;
                    } else {
                        fieldMap[fieldName] = fieldName;
                    }
                }
                items[0].valueMap = fieldMap;

                items[0].defaultValue = isc.firstKey(fieldMap);
            }
        }

        this.fieldPicker = items[0];
        var fieldItem = items[0],
            operatorItem = items[1];

        if (!this.fieldName) {
            if (criterion && criterion.fieldName) {
                if (this.fieldDataSource) {
                    fieldItem.defaultValue = criterion.fieldName;
                } else {
                    if (fieldNames.contains(criterion.fieldName)) {
                        fieldItem.defaultValue = criterion.fieldName;
                    } else {
                        isc.logWarn("Criterion specified field " + criterion.fieldName + ", which is not" +
                                    " in the record. Using the first record field (" + 
                                    fieldMap ? isc.firstKey(fieldMap) : fieldNames[0] + 
                                    ") instead");
                        fieldItem.defaultValue = fieldMap ? isc.firstKey(fieldMap) : fieldNames[0];
                    }
                }
            }

            selectedFieldName = fieldItem.defaultValue;
        }
        if (selectedFieldName) {
            var field = this.field || this.getField(selectedFieldName);
            var valueMap = field ? this.getFieldOperatorMap(field, false, "criteria", true) : null;

            operatorItem.valueMap = valueMap;
            if (valueMap) {
                if (criterion && criterion.operator) {
                    operatorItem.defaultValue = criterion.operator;
                } else {
                    operatorItem.defaultValue = isc.firstKey(valueMap);
                }
            }

            this._lastFieldName = selectedFieldName;

            var operator = this.getSearchOperator(operatorItem.defaultValue, field);

            if (!operator && valueMap.length > 0) {
                isc.logWarn("Criterion specified unknown operator " + 
                        (criterion ? criterion.operator : "[null criterion]") + 
                        ". Using the first valid operator (" + isc.firstKey(valueMap) + ") instead");
                operatorItem.defaultValue = isc.firstKey(valueMap);
                operator = this.getSearchOperator(operatorItem.defaultValue, field);
            }
            var valueItems = this.buildValueItemList(field, operator, selectedFieldName);
            
            
            if (criterion) {
                if (criterion.value != null && valueItems.containsProperty("name", "value")) {
                    valueItems.find("name", "value").defaultValue = criterion.value;
                }
                if (criterion.start != null && valueItems.containsProperty("name", "start")) {
                    valueItems.find("name", "start").defaultValue = criterion.start;
                }
                if (criterion.end != null && valueItems.containsProperty("name", "end")) {
                    valueItems.find("name", "end").defaultValue = criterion.end;
                }
            }
            if (valueItems) items.addList(valueItems);
        } else {
            operatorItem.disabled = true;
        }

        this.addAutoChild("clause", {
            flattenItems: this.flattenItems,
            items: items
        });

        this.fieldPicker = this.clause.getItem("fieldName");

        this.operatorPicker = this.clause.getItem("operator");
    }

    this.addMembers([this.topOperatorForm, this.removeButton, this.clause]);
    
    if (this.fieldPicker && this.fieldPicker.type == "staticText") {
        this.fieldPicker.prompt = this.fieldPicker.getValue();
    }

},

updateInlineTopOperator : function () {
    if (this.topOperatorAppearance != "inline") return;
    var operatorIndex = this.creator.showSelectionCheckbox ? 1 : 0;
    if (this.creator.isFirstClause(this)) {
        // Hide the operator
        this.topOperatorForm.items[operatorIndex].hide();
    } else {
        this.topOperatorForm.items[operatorIndex].show();
    }
},

// getEditorType for some field / operator. Call the same-named method on the FilterBuilder by default
// otherwise back-off to looking at the clause (a SearchForm subclass)'s implementation.

getEditorType : function (field, operatorID) {
    if (isc.isA.FilterBuilder(this.filterBuilder)) {
        return this.filterBuilder.getEditorType(field, operatorID);
    } else {
        // our clause inherits from searchForm so we can call getEditorType directly on it
        if (this.clause) return this.clause.getEditorType(field, operatorID);
        return null;
    }
},

// create the form items that constitute the clause, based on the DataSource field involved and
// the chosen operator.
// Note: In the case where we are linked to multiple dataSources fieldName can differ from
// field.name (due to the dataSource ID prefix)
buildValueItemList : function (field, operator, fieldName) {

    // Sanity check only - we don't expect the operator to be unset but if it is log a warning
    if (operator == null) this.logWarn("buildValueItemList passed null operator");

    if (field == null) {
        
        return;
    }

    if (fieldName == null) fieldName = field.name;
    
    var valueType = operator ? operator.valueType : "text",
        baseFieldType = isc.SimpleType.getType(field.type) || isc.SimpleType.getType("text"),
        items = [],
        props,
        editorType = null
    ;
    
    // We're not interested in the object, just the name
    baseFieldType = baseFieldType.name;
    
    
    var dupField = {_origField:field};
    isc.addProperties(dupField, field);
    dupField.canEdit = field.canFilter;
    field = dupField;
  	     
    editorType = this.getEditorType(field, operator.ID);
    // a value of the same type as the field
    if (valueType == "fieldType" || valueType == "custom" || valueType == "valueSet")  {
        var dataType = baseFieldType;

        
        if (valueType == "valueSet") {
            editorType = "TextAreaItem";
            
        } else if (valueType == "custom" && operator && operator.editorType) {
            editorType = operator.editorType;            
        }

        var fieldDef = isc.addProperties({
            type: dataType,
            // valueType - calling code can use this to determine whether the value type has
            // changed
            valueType:valueType,

            
            name: field.name, 
            showTitle: false,
            title : this.valueItemTitle,
            width: this.valueItemWidth, 
            changed : function () { 
                this.form.creator.valueChanged(this, this.form); 
            }
        }, this.getValueFieldProperties(field.type, fieldName, operator.ID, "value"));

        if (editorType) fieldDef.editorType = editorType;

        if (valueType == "valueSet") {
            fieldDef.multiple = true;
            fieldDef.showHintInField = true;
            fieldDef.hint = this.valueSetHint;
            fieldDef.parseEditorValue = function (value,form,item) {
                if (value == null) return value;
                return value.split(",")
            };
            fieldDef.formatEditorValue = function (value, record, form, item) {
                if (value == null) return "";
                if (isc.isAn.Array(value)) {
                    return value.join(",");
                }
                return value;
            }
        }        
        // Pick up DataSource presentation hints
        
        fieldDef = this.combineFieldData(fieldDef, field);
        
        fieldDef.name = "value";

        if (field.type == "enum") {
            fieldDef = isc.addProperties(fieldDef, {
                valueMap: field.valueMap
            });
        }

        if (baseFieldType == "boolean") {
            fieldDef = isc.addProperties(fieldDef, {
                defaultValue: false
            });
        }

        
        if (field.editorProperties) {
            if (field.editorType == "SelectItem" || field.editorType == "ComboBoxItem" ||
                field.editorType == "select") 
            {
                props = field.editorProperties;
                if (props.optionDataSource != null) fieldDef.optionDataSource = props.optionDataSource;
                if (props.valueField != null) fieldDef.valueField = props.valueField;
                if (props.displayField != null) fieldDef.displayField = props.displayField;
            } else {
                fieldDef = isc.addProperties({}, fieldDef, field.editorProperties);
            }
        }
        
        items.add(fieldDef);

    } else if (valueType == "fieldName") {
        // another field in the same DataSource
        props = isc.addProperties({}, this.fieldPickerDefaults, {
            type: "select", showTitle: false,
            valueType:valueType,
            width: this.valueItemWidth, 
            textMatchStyle: this.fieldPicker.textMatchStyle,
            changed : function () { 
                this.form.creator.valueChanged(this, this.form); 
            }
        });
        
        if (this.fieldDataSource) {
            // using a fieldDataSource - apply this as the optionDataSource
            props = isc.addProperties(props, {
                type: "ComboBoxItem",
                completeOnTab: true,
                optionDataSource: this.fieldDataSource,
                valueField: "name",
                displayField: this.showFieldTitles ? "title" : "name",
                pickListProperties: { reusePickList : function () { return false; } }
            });
        } else {
            var altFieldNames = this.getFieldNames(true);
            altFieldNames.remove(fieldName);
            var fieldMap = {};
            for (var i = 0; i < altFieldNames.length; i++) {
                var nextFieldName = altFieldNames[i];
                if (this.showFieldTitles) {
                    var fieldTitle = this.getField(nextFieldName).title;
                    fieldTitle = fieldTitle ? fieldTitle : nextFieldName;
                    fieldMap[nextFieldName] = fieldTitle;
                } else {
                    fieldMap[nextFieldName] = nextFieldName;
                }
            }
            props = isc.addProperties(props, { valueMap: fieldMap });
        }

        items.add(isc.addProperties(props, 
            this.getValueFieldProperties(field.type, fieldName, operator.ID, "name"),
            this.fieldPickerProperties,
            // In SGWT the wrapper code picks up the 'name' attr on the field picker
            // override this here.
            {name: "value"})); 

    } else if (valueType == "valueRange") {
        // two values of the same type as the field

        props = this.combineFieldData(
            isc.addProperties({ 
                type: baseFieldType, editorType:editorType, showTitle: false, width: this.valueItemWidth,
                changed : function () { 
                    this.form.creator.valueChanged(this, this.form); 
                }
            }), field);

        items.addList([
            isc.addProperties({}, props,
                { name: "start" },
                this.getValueFieldProperties(field.type, fieldName, operator.ID, "start")),
            isc.addProperties(
                { type: "staticText", name: "rangeSeparator", showTitle: false,
                    width: 1, shouldSaveValue:false,
                    defaultValue: this.filterBuilder ? this.filterBuilder.rangeSeparator : null,
                    changed : function () { 
                        this.form.creator.valueChanged(this, this.form); 
                    }
                },
                this.getRangeSeparatorProperties(field.type, fieldName, operator.ID)
            ),
            isc.addProperties({}, props,
                { name: "end" },
                this.getValueFieldProperties(field.type, fieldName, operator.ID, "end"))
        ]);
    }

    if (this.validateOnChange) {
        for (var i = 0; i < items.length; i++) {
            isc.addProperties(items[i], {
                blur : function(form, item) {
                    if (!form.creator.itemsInError) form.creator.itemsInError = [];
                    if (!form.validate(null, null, true)) {
                        item.focusInItem();
                        if (!form.creator.itemsInError.contains(item)) {
                            form.creator.itemsInError.add(item);
                        }
                    } else {
                        if (form.creator.itemsInError.contains(item)) {
                            form.creator.itemsInError.remove(item);
                        }
                    }
                }
            });
        }
    }

    for (var i=0; i<items.length; i++) {
        if (items[i].showIf != null) delete items[i].showIf;
    }
    
    return items;
},

//> @type ValueItemType
// Enum used within the +link{FilterBuilder} class to indicate the role of a particular 
// value-field form item within a filter clause.
//
// @value "value" This is the single form item that will populate the generated 
//  +link{criteria.value} for this clause. This applies for operators with
//  +link{operator.valueType} of <code>"fieldType"</code> or <code>"custom"</code>.
// @value "name" This is the single form item that will populated the generated 
//  +link{criteria.value} for +link{operator.valueType} of <code>"fieldName"</code>.
// @value "start" Indicates this item will generate the lower-bound value (or "start") when generating
//  criteria with +link{operator.valueType} <code>"valueRange"</code>.
// @value "end" Indicates this item will generate the higher-bound value (or "end") when generating
//  criteria with +link{operator.valueType} <code>"valueRange"</code>.
//
// @visibility external
//< 

//> @method filterClause.getValueFieldProperties()
// 
// Override to return properties for the FormItem(s) used for the "value" field displayed in this
// filterClause.
// <P>
// Default implementation simply calls +link{filterBuilder.getValueFieldProperties()} on the
// filterBuilder in which this clause is displayed.
// <P>
// Note that the +link{operator.valueType} impacts when this method is called. For operators with
// valueType <code>"fieldType"</code> or <code>"custom"</code>, a single value field is displayed.
// For operators with valueType <code>"valueRange"</code> two value-field items are displayed
// (one for the start and one for the end position). The <code>valueItemType</code> parameter may
// be used to determine which form item is being generated.
// 
// @param type (FieldType) type of the DataSource field for this filter row
// @param fieldName (String) name of the DataSource field for this filter row
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @param itemType (ValueItemType) What valueItem is being generated.
//
// @return (FormItem Properties) properties for the value field
// @visibility external
//<
getValueFieldProperties : function (type, fieldName, operatorId, itemType) {
    if (this.filterBuilder) {
        return this.filterBuilder.getValueFieldProperties(type,fieldName,operatorId,itemType);
    }
},


getRangeSeparatorProperties : function (type, fieldName, operatorId) {
    if (this.filterBuilder) return this.filterBuilder.getRangeSeparatorProperties(type,fieldName, operatorId);
},

//> @method filterClause.remove()
// Remove this clause by destroy()ing it.
// 
// @visibility external
//<
remove : function () {
    this.markForDestroy();
},

getValues : function () {
    var clause = this.clause;

    return clause.getValues();
},

getFieldName : function () {
    return this.fieldPicker.getValue() || this.fieldName;
},

//> @method filterClause.getCriterion()
// Return the criterion specified by this FilterClause.
// 
// @return (Criteria) The single criterion for this FilterClause
// @visibility external
//<
getCriterion : function (includeEmptyValues) {
    if (!this.clause) return null;

    var fieldName = this.getFieldName(),
        operator = this.operatorPicker.getValue();
        
    if (!fieldName) return null;

    if (isc.isA.String(operator)) operator = this.getSearchOperator(operator, fieldName);
    
    if (operator == null) return;
    
    // getClauseValues - extracts the value / start & end attributes from the clause-form
    var criterion = this.getClauseValues(fieldName, operator);
    
    if (!includeEmptyValues) {
        // Ignore criteria where no value has been set, unless it is an operator (eg, isNull)
        // that does not require a value, or requires a start/end rather than a value
        // This behavior can be controlled by a parameter - to allow for the case where
        // you actually want to check for someField != null.
        if (!operator || (operator.valueType != "none" && 
            operator.valueType != "valueRange" &&
            (criterion.value == null || 
            (isc.isA.String(criterion.value) && criterion.value == ""))))
        {
            return null;
        }
    }
    
    return criterion;
},

// getClauseValues() returns the values of the clause form
// - Contains fields for operator, fieldName, and either value or start/end by default
// - if operator.getCriterion is defined, use that rather than just returning values from the form.
// Note: we use filterClause in the RuleEditor where we're editing Rules (Validators).
// Because of this we make the various attribute names etc customizable -- for example
// a "contains" validator has a single value field but the attribute on the validator is
// validator.substring, not validator.value. It also uses 'getAttributesFromEditor' rather than
// getCriterion to handle custom UI.

customGetValuesFunction:"getCriterion",
valueAttribute:"value",
rangeStartAttribute:"start",
rangeEndAttribute:"end",
operatorAttribute:"operator",

getClauseValues : function (fieldName, operator) {
    
    var clause = this.clause,
        values = {},
        valueField = clause.getField("value"),
        startField = clause.getField("start"),
        endField = clause.getField("end"),
        
        valueAttribute = operator.valueAttribute || this.valueAttribute,
        rangeStartAttribute = operator.rangeStartAttribute || this.rangeStartAttribute,
        rangeEndAttribute = operator.rangeEndAttribute || this.rangeEndAttribute;
    
    values[this.operatorAttribute] = clause.getValue("operator");

    
    if (fieldName != null) values.fieldName = fieldName;
    
    // If operator.getCriterion() [or validator.getAttributesFromEditor() for example] is 
    // defined, call it.
    if (operator[this.customGetValuesFunction] && 
        isc.isA.Function(operator[this.customGetValuesFunction])) 
    {
        if (valueField) {
            values = operator[this.customGetValuesFunction](fieldName, valueField);
        } else {

            var startCriterion = operator[this.customGetValuesFunction](fieldName, startField),
                endCriterion = operator[this.customGetValuesFunction](fieldName, endField);
            values.fieldName = startCriterion.fieldName;
            values[this.operatorAttribute] = startCriterion.operator;
            values[rangeStartAttribute] = startCriterion.value;
            values[rangeEndAttribute] = endCriterion.value;
        }
    } else {
        if (valueField) values[valueAttribute] = valueField.getValue();
        if (startField) values[rangeStartAttribute] = startField.getValue();
        if (endField) values[rangeEndAttribute] = endField.getValue();
    }
    
    // flag dates as logicalDates unless the field type inherits from datetime
    var field = this.getField(fieldName);
    if (isc.isA.Date(values[this.valueAttribute]) && 
        (!field || !isc.SimpleType.inheritsFrom(field.type, "datetime"))) 
    {
        values[valueAttribute].logicalDate = true;
    }
    return values;
},

// setClauseValues() - update the clause form items to reflect the object passed in

setCustomValuseFunction:"setCriterion",
setClauseValues : function (fieldName, operator, values) {
    if (this.clause == null) return;

    var clause = this.clause,
        valueField = clause.getField("value"),
        startField = clause.getField("start"),
        endField = clause.getField("end"),
        
        valueAttribute = operator.valueAttribute || this.valueAttribute,
        rangeStartAttribute = operator.rangeStartAttribute || this.rangeStartAttribute,
        rangeEndAttribute = operator.rangeEndAttribute || this.rangeEndAttribute;
    
    
    
    // Call the custom setter to update custom components if necessary.
    if (operator[this.customSetValuesFunction] && 
        isc.isA.Function(operator[this.customSetValuesFunction])) 
    {
        if (valueField) {
            operator[this.customSetValuesFunction](fieldName, valueField, values);
        } else {
            
            operator[this.customSetValuesFunction](fieldName, startField, values);
            operator[this.customSetValuesFunction](fieldName, endField, values);
        }
    // no custom setter - just update the value field or range start/end
    } else {
        if (valueField) valueField.setValue(values[valueAttribute]);
        if (startField) startField.setValue(values[rangeStartAttribute]);
        if (endField) endField.setValue(values[rangeEndAttribute]);
    }
},

setDefaultFocus : function () {
    if (!this.clause) return;
    if (isc.isA.Function(this.clause.focusInItem)) this.clause.focusInItem("fieldName");
},

//> @method filterClause.validate
// Validate this clause.
// @return (Boolean) true if if the clause is valid, false otherwise
// @visibility external
//<
validate : function () {
    return this.clause ? this.clause.validate(null, null, true) : true;
},

itemChanged : function () {
    if (this.creator && isc.isA.Function(this.creator.itemChanged)) this.creator.itemChanged();
},

valueChanged : function (valueField, form) {
},

fieldNameChanged : function () {
    this.clause.getItem("operator").disabled = false;
    this.updateFields();
},

removeValueFields : function () {
    if (!this.clause) return;
    var form = this.clause;
    if (form.getItem("value")) form.removeItem("value");
    if (form.getItem("rangeSeparator")) form.removeItem("rangeSeparator");
    if (form.getItem("start")) form.removeItem("start");    
    if (form.getItem("end")) form.removeItem("end");    
},

operatorChanged : function () {
    if (!this.clause) return;

    var form = this.clause,
        fieldName = this.fieldName || form.getValue("fieldName")
    ;

    if (fieldName == null) return;

    var field = this.getField(fieldName);
    var operator = this.getSearchOperator(form.getValue("operator"), field);
    
    this.updateValueItems(field,operator,fieldName);
},

// Note: In the case where we are linked to multiple dataSources fieldName can differ from
// field.name (due to the dataSource ID prefix)
updateValueItems : function (field,operator,fieldName) {

    var form = this.clause;
    var oldValueItem = form.getItem("value");
    var oldValueType = oldValueItem ? oldValueItem.valueType : null;

    this.removeValueFields();
    var items = this.buildValueItemList(field, operator, fieldName)
    
    
    form.addItems(items);
    var valueItem = form.getItem("value");
    if (valueItem && 
        // type changed (so was a field picker, now a text field, etc)
        ((valueItem.valueType != oldValueType) || 
         (valueItem.getValueMap() && valueItem._valueInValueMap && 
                !valueItem._valueInValueMap(valueItem.getValue()) ||
         valueItem.optionDataSource ||
         !this.retainValuesAcrossFields))
        ) {
        valueItem.clearValue();
    }
},

// updateFields() Fired when the user changes the fieldName field of this clause.
// Opportunity to determine the newly selected field type and update the operator valueMap and
// appropriate valueFields.
updateFields : function () {
    if (!this.clause) return;

    var form = this.clause,
        oldFieldName = this._lastFieldName,
        fieldName = this.fieldName || form.getValue("fieldName")
    ;
    if (fieldName == null) return;
    if (fieldName == oldFieldName) return;

    var field = this.getField(fieldName),
        oldField = this.getField(oldFieldName);

    if (!field) return;

    var operator = form.getValue("operator");

    // note this setValueMap() call means if an operator was already chosen, it will be
    // preserved unless no longer valid for the new field
    form.getItem("operator").setValueMap(
        this.getFieldOperatorMap(field, false, "criteria", true)
    );
    if (operator == null || form.getValue("operator") != operator) {
        // if the operator was lost from the valueMap, the value will have been cleared
        // Reset to the first option
        
        if (form.getValue("operator") == null) {
            form.getItem("operator").setValue(form.getItem("operator").getFirstOptionValue());
        }
        operator = form.getValue("operator");
    }

    // Now we've got the operator type we want, normalize it to a config object
    operator = this.getSearchOperator(operator, field);

    var typeChanged;
    if (form.getItem("value")) {
        var currentType = form.getItem("value").type,
            newType = field.type || "text";
        typeChanged = (currentType != newType);
    }

    // otherwise rebuild the value fields
    this.removeValueFields();
    form.addItems(this.buildValueItemList(field, operator, fieldName));

    // Clear out the currently entered value if 
    //    1) the valueField data type has changed
    //    2) the new valueField has a valueMap and the current value doesn't appear in it
    //    3) either the old or new field has a valueMap or optionDataSource
    //    4) this.retainValuesAcrossFields is false
    if (typeChanged) {
        form.clearValue("value");
    } else {
        var valueItem = form.getItem("value"),
            shouldClear = (
                (field.valueMap || field.optionDataSource) ||
                (oldField && (oldField.valueMap || oldField.optionDataSource)) || 
                !this.retainValuesAcrossFields
            )
        ;

        if (valueItem && shouldClear) valueItem.clearValue();
    }
    // For now always clear out range fields
    if (form.getItem("start")) form.setValue("start", null);
    if (form.getItem("end")) form.setValue("end", null);

    
    this._lastFieldName = fieldName;
},

//> @method filterClause.getFieldOperators()
// Get the list of +link{Operators} that are valid on this field.  By default, all operators
// returned by +link{dataSource.getFieldOperators()} are used.
// <P>
// Called whenever the fieldName is changed.
// 
// @return (Array of Operator) valid operators for this field
// @visibility external
//<
getFieldOperators : function (fieldName) {
    var field = this.getField(fieldName)
    return this.getPrimaryDS(fieldName).getFieldOperators(field); 
},

// called when the user changes the topOperator via a form - inline only.  We only implement
// it so we can use the same form config for builder-level and clause-level topOperators
topOperatorChanged : function (newOp) {
}

});



isc.FilterClause.registerStringMethods({
    remove : ""
});


//> @class FilterBuilder
// A form that allows the user to input advanced search criteria, including operators on
// field values such as "less than", and sub-clauses using "AND" and "OR" operators.
// <P>
// A FilterBuilder produces an +link{AdvancedCriteria} object, which the +link{DataSource}
// subsystem can use to filter datasets, including the ability to perform such filtering within
// the browser for datasets that are completely loaded.
// <P>
// The operators available for each field can be customized at the DataSource level via
// +link{DataSourceField.validOperators()}, +link{DataSource.setTypeOperators()} and related
// APIs.
//
// @treeLocation Client Reference/Forms
// @visibility external
//<
isc.defineClass("FilterBuilder", "Layout");

isc.FilterBuilder.addClassProperties({
//> @attr filterBuilder.missingFieldPrompt (String: "[missing field definition]" : IR)
// The message to display next to fieldNames that do not exist in the available dataSource.
// @group i18nMessages
// @visibility external
//<
missingFieldPrompt: "[missing field definition]"

});

isc.FilterBuilder.addClassMethods({

//> @classMethod filterBuilder.getFilterDescription()
// Returns a human-readable string describing the clauses in this filter.
// 
// @param type (AdvancedCriteria or Criterion) Criteria to convert to a readable string
// @param dataSource (DataSource) DataSource to provide definitions of operators
// @return (String) Human-readable string describing the clauses in the passed criteria
// @visibility external
//<
getFilterDescription : function (criteria, dataSource) {

    // support being passed an array of dataSources, and using dot-notation on the fieldNames
    // to extract field info
    if (!isc.isAn.Array(dataSource)) {    
        if (!isc.isA.DataSource(dataSource)) dataSource = isc.DS.getDataSource(dataSource);
        if (!dataSource) return "No dataSource";
    }

    var result = "";

    if (criteria.criteria && isc.isAn.Array(criteria.criteria)) {
        // complex criteria, call this method again with that criteria
        var operator = criteria.operator,
            subCriteria = criteria.criteria;
            
        for (var i = 0; i<subCriteria.length; i++) {
            var subItem = subCriteria[i];

            if (i > 0) result += " " + operator + " ";
            if (subItem.criteria && isc.isAn.Array(subItem.criteria)) {
                result += "("
                result += isc.FilterBuilder.getFilterDescription(subItem, dataSource);
                result += ")"
            } else {
                result += isc.FilterBuilder.getCriterionDescription(subItem, dataSource);
            }
        }
    } else {
        // simple criterion
        result += isc.FilterBuilder.getCriterionDescription(criteria, dataSource);
    }
    
    return result;
},

// helper method to return the description of a single criterion
getCriterionDescription : function (criterion, dataSource) {

    var fieldName = criterion.fieldName,
        operatorName = criterion.operator,
        value = criterion.value,
        start = criterion.start,
        end = criterion.end,
        field;
    
    if (isc.isAn.Array(dataSource)) {
        dataSource = isc.DataSource.getDataSourceForField(fieldName, dataSource);
        // At this point we've identified the dataSource, but the fieldName is dot-prefixed, so
        // use getFieldFromDataSources to get the field object.
        field = isc.DataSource.getFieldFromDataSources(fieldName, [dataSource]);
    } else {
        if (!isc.isA.DataSource(dataSource)) dataSource = isc.DS.getDataSource(dataSource);
        if (!dataSource) return "No DataSource";
        field = dataSource.getField(fieldName);
    }
    
    var operator = dataSource.getSearchOperator(operatorName, field),
        operatorMap = dataSource.getFieldOperatorMap(field, true, operator.valueType, false),
        result=""
    ;

    if (!field) {
        if (criterion.criteria && isc.isAn.Array(criterion.criteria)) {
            // we've been passed an AdvancedCriteria as a simple criterion - log a warning and
            // return the result of getFilterDescription(), rather than just bailing
            isc.logWarn("FilterBuilder.getCriterionDescription: Passed an AdvancedCriteria - "+
                "returning through getFilterDescription.");
            return isc.FilterBuilder.getFilterDescription(criterion, dataSource);
        }

        // just an unknown field - log a warning and bail
        
        result = fieldName + " " + isc.FilterBuilder.missingFieldPrompt + " ";

        isc.logWarn("FilterBuilder.getCriterionDescription: No such field '"+fieldName+"' "+
            "in DataSource '"+dataSource.ID+"'.");
    } else {
        result = (field.title ? field.title : fieldName) + " ";
    }

    switch (operatorName)
        {
            case "lessThan": 
            case "greaterThan": 
            case "lessOrEqual": 
            case "greaterOrEqual": 
            case "between":
            case "notNull" : 
                result += "is " + operatorMap[operatorName] || operatorName;
                break;
            case "equals": 
                result += "is equal to";
                break;
            case "notEqual": 
                result += "is not equal to";
                break;
            default: result += operatorMap[operatorName] || operatorName;
        }

    if (operator.valueType == "valueRange") result += " " + start + " and " + end;
    else if (operatorName != "notNull") result += " " + value;

    return result;
}

});

isc.FilterBuilder.addProperties({

// Layout: be a minimum height stack by default
// ---------------------------------------------------------------------------------------
vertical:false,
vPolicy:"none",
height:1,
defaultWidth:400,

//> @attr filterBuilder.fieldDataSource (DataSource : null : IR)
// If specified, the FilterBuilder will dynamically fetch DataSourceField definitions from 
// this DataSource rather than using +link{filterBuilder.dataSource}.  The +link{fieldPicker} 
// will default to being a +link{ComboBoxItem} rather than a +link{SelectItem} so that the user 
// will have type-ahead auto-completion.
// <P>
// The records returned from the <code>fieldDataSource</code> must have properties 
// corresponding to a +link{DataSourceField} definition, at a minimum, 
// +link{DataSourceField.name,"name"} and +link{DataSourceField.type,"type"}.  Any property 
// legal on a DataSourceField is legal on the returned records, including 
// +link{DataSourceField.valueMap,valueMap}.
// <P>
// Even when a <code>fieldDataSource</code> is specified, +link{filterBuilder.dataSource} may
// still be specified in order to control the list of 
// +link{DataSource.setTypeOperators,valid operators} for each field.
//
// @visibility external
//<

//> @attr filterBuilder.fieldPicker (AutoChild : null : IR)
// AutoChild for the +link{FormItem} that allows a user to pick a DataSource field when 
// creating filter clauses.
// <P>
// This will be a +link{SelectItem} by default, or a +link{ComboBoxItem} if
// +link{filterBuilder.fieldDataSource} has been specified.
//
// @visibility external
//<
fieldPickerDefaults: { 
    type: "SelectItem", 
    name: "fieldName", 
    textMatchStyle: "startsWith",
    showTitle: false, 
    changed : function () { this.form.creator.fieldNameChanged(this.form); }
},

//> @attr filterBuilder.fieldPickerTitle (String : "Field Name" : IR)
// The title for the +link{filterBuilder.fieldPicker, field-picker} select-item.
// @group i18nMessages
// @visibility external
//<
fieldPickerTitle: "Field Name",

//> @attr filterBuilder.fieldPickerProperties (FormItem Properties : null : IR)
// Properties to combine with the +link{fieldPicker} autoChild FormItem.
//
// @visibility external
//<


// Schema and operators
// ---------------------------------------------------------------------------------------

//> @attr filterBuilder.dataSource (DataSource or ID : null : IRW)
// DataSource this filter should use for field definitions and available +link{Operator}s.
// @visibility external
//< 
setDataSource : function(ds) {
    if (isc.DataSource.get(this.dataSource).ID != isc.DataSource.get(ds).ID) {
        this.dataSource = ds;
        this.clearCriteria();
    }
},


setDataSources : function (dsList) {
    this.dataSources = dsList;
    this.clearCriteria();
},

//> @attr filterBuilder.criteria (AdvancedCriteria : null : IRW)
// Initial criteria.
// <P>
// When initialized with criteria, appropriate clauses for editing the provided criteria will
// be automatically generated.
// <P>
// Note that empty or partial criteria are allowed, for example, criteria that specify
// +link{criterion.fieldName} only will generate an expression with the operator not chosen
// yet, and a +link{criterion} with a logical operator ("and" or "or") but not
// +link{criterion.criteria,subcriteria} defined will generate an empty subclause.
// @visibility external
//<

//> @attr filterBuilder.saveOnEnter (boolean : null : IR)
// If true, when the user hits the Enter key while focused in a text-item in this 
// FilterBuilder, we automatically invoke the user-supplied +link{filterBuilder.search()} method.
// @visibility external
//< 

//> @attr filterBuilder.showFieldTitles (boolean : true : IR)
// If true (the default), show field titles in the drop-down box used to select a field for querying.
// If false, show actual field names instead.
// @visibility external
//< 
showFieldTitles: true,

//> @attr filterBuilder.validateOnChange (boolean : true : IR)
// If true (the default), validates each entered value when it changes, to make sure it is a 
// a valid value of its type (valid string, number, and so on).  No other validation is 
// carried out.  If you switch this property off, it is still possible to validate the 
// <code>FilterBuilder</code> by calling +link{filterBuilder.validate()} from your own code.
// @visibility external
//< 
validateOnChange: true,

// Add/remove buttons
// ---------------------------------------------------------------------------------------
  
//> @attr filterBuilder.showRemoveButton (boolean : true : IR)
// If set, a button will be shown for each clause allowing it to be removed.
// @visibility external
//<
showRemoveButton:true,

//> @attr filterBuilder.removeButtonPrompt (string : "Remove" : IR)
// The hover prompt text for the remove button.
//
// @group i18nMessages 
// @visibility external
//<
removeButtonPrompt: "Remove",

//> @attr filterBuilder.removeButton (AutoChild : null : IR)
// The removal ImgButton that appears before each clause if
// +link{showRemoveButton} is set.
// @visibility external
//<
removeButtonDefaults : {
    _constructor:isc.ImgButton,
    width:18, height:18, layoutAlign:"center",
    src:"[SKIN]/actions/remove.png",
    showRollOver:false, showDown:false,
    showDisabled:false, // XXX
    //prompt:"Remove",
    click: function () { this.creator.removeButtonClick(this.clause); }
},

//> @attr filterBuilder.showAddButton (boolean : true : IR)
// If set, a button will be shown underneath all current clauses allowing a new clause to be
// added.
// @visibility external
//<
showAddButton:true,

//> @attr filterBuilder.addButtonPrompt (string : "Add" : IR)
// The hover prompt text for the add button.
//
// @group i18nMessages 
// @visibility external
//<
addButtonPrompt: "Add", 

//> @attr filterBuilder.addButton (AutoChild : null : IR)
// An ImgButton that allows new clauses to be added if +link{showAddButton}
// is set.
// @visibility external
//<
addButtonDefaults : {
    _constructor:isc.ImgButton,
    autoParent:"buttonBar",
    width:18, height:18, 
    src:"[SKIN]/actions/add.png",
    showRollOver:false, showDown:false, 
    //prompt:"Add",
    click: function () { this.creator.addButtonClick(this.clause); }
},

buttonBarDefaults : {
    _constructor:isc.HStack,
    autoParent:"clauseStack",
    membersMargin:4, 
    defaultLayoutAlign:"center",
    height:1
},

addButtonClick : function () {
    this.addNewClause();
},

removeButtonClick : function (clause) {
    if (!clause) return;
    this.removeClause(clause);
},

//> @method filterBuilder.removeClause()
// Remove a clause this FilterBuilder is currently showing.
// @param clause (FilterClause) clause as retrieved from filterBuilder.clauses
// @visibility external
//<
removeClause : function (clause) {
    // remove the clause from the clauses array and destroy it
    this.clauses.remove(clause);
    if (this.clauseStack) this.clauseStack.hideMember(clause, function () { clause.destroy(); });
    // update the first removeButton
    this.updateFirstRemoveButton();
    if (this.clauses[0] && this.clauses[0].updateInlineTopOperator) this.clauses[0].updateInlineTopOperator();
    clause.filterBuilder = null;
    // fire filterChanged
    if (isc.isA.Function(this.filterChanged)) this.filterChanged();
},

//> @attr filterBuilder.allowEmpty (boolean : false : IR)
// If set to false, the last clause cannot be removed.
// @visibility external
//<

updateFirstRemoveButton : function () {
    var firstClause = this.clauses[0];

    if (!firstClause || !firstClause.removeButton) return;

    if (this.clauses.length == 1 && !this.allowEmpty) {
        firstClause.removeButton.disable(); 
        firstClause.removeButton.setOpacity(50); // XXX need media with disabled state
    } else if (this.clauses.length > 1) {
        firstClause.removeButton.enable();
        firstClause.removeButton.setOpacity(100); // XXX need media with disabled state
    }
},

isFirstClause : function (clause) {
    return this.clauses[0] == clause;
},
 
// Top-level Operator  
// ---------------------------------------------------------------------------------------

//> @type LogicalOperator
// Operators that can evaluate a set of criteria and produce a combined result.
//
// @value "and" true if all criteria are true
// @value "or" true if any criteria are true
// @value "not" true if all criteria are false
// @visibility external
//< 

//> @attr filterBuilder.retainValuesAcrossFields (boolean : true : IRW)
// Dictates whether values entered by a user should be retained in the value fields when a 
// different field is selected.  Default value is true.
// <P>
// Note that, when switching between fields that have an optionDataSource or valueMap, this
// property is ignored and the values are never retained.
// @visibility external
//<
retainValuesAcrossFields: true,


//> @attr filterBuilder.topOperator (LogicalOperator : "and" : IRW)
// Default logical operator for all top-level clauses in the FilterBuilder.
// <P>
// May be able to be changed by the user via the UI, according to +link{topOperatorAppearance}.
// @visibility external
//<
topOperator:"and",

//> @attr filterBuilder.radioOptions (Array of OperatorId : ["and", "or", "not"] : IR)
// Logical operators to allow if we have a +link{topOperatorAppearance} of "radio".
//
// @visibility external
//<
radioOptions: ["and", "or", "not"],

//> @method filterBuilder.setTopOperator()
// Programmatically change the +link{topOperator} for this FilterBuilder.
// @param operator (OperatiorId) new top-level operator
// @visibility external
//<
setTopOperator : function (newOp) {
    this.topOperator = newOp;
    var appearance = this.topOperatorAppearance;

    if (appearance == "bracket") {
        this.topOperatorForm.setValue("operator", newOp);
    } else if (appearance == "radio") {
        this.radioOperatorForm.setValue("operator", newOp);
    }
},

// called when the user changes the topOperator via a form
topOperatorChanged : function (newOp) {
    this.topOperator = newOp;
},

//> @type TopOperatorAppearance
// Interface to use for showing and editing the +link{filterBuilder.topOperator,top-level operator} 
// of a FilterBuilder.
//
// @value "radio" radio buttons appear at the top of the form
//
// @value "bracket" a SelectItem appears with a "bracket" spanning all top-level clauses,
// exactly the same appearance used for showing
// +link{filterBuilder.showSubClauseButton,subClauses}, if enabled.
//
// @value "inline" each line in the FilterBuilder is a top-level item, with a SelectItem shown
// on the left that allows the user to choose between the main operator in force (either "and"
// or "or", depending on the setting of topOperator) and "and not".
//
// @value "none" no interface is shown.  The top-level operator is expected to be shown to
// the user outside the FilterBuilder, and, if editable, +link{filterBuilder.setTopOperator()}
// should be called to update it
// @visibility external
//<

//> @attr filterBuilder.topOperatorAppearance (TopOperatorAppearance : "bracket" : IR)
// How to display and edit the +link{topOperator,top-level operator} for this FilterBuilder.
// <P>
// See +link{type:TopOperatorAppearance} for a list of options.
// @visibility external
//<
topOperatorAppearance:"bracket", 

//> @attr filterBuilder.radioOperatorForm (AutoChild : null : IR)
// With +link{topOperatorAppearance}:"radio", form that appears above the stack of clauses
// and allows picking the +link{LogicalOperator} for the overall FilterBuilder.
// <P>
// By default, consists of a simple RadioGroupItem.
// @visibility external
//<
radioOperatorFormDefaults : {
    _constructor:isc.DynamicForm,
    autoParent:"clauseStack",
    height:1, 
    items : [
        { name:"operator", type:"radioGroup", 
          showTitle:false, title:"Overall Operator",
          vertical:false,
          width: 250,
          changed : function (form, item, value) {
              form.creator.topOperatorChanged(value);
          }
        }
    ]
},

//> @attr filterBuilder.radioOperatorTitle (String : "Overall Operator" : IR)
// The title for the Operator RadioGroupItem displayed in the +link{radioOperatorForm}.
// @group i18nMessages
// @visibility external
//<
radioOperatorTitle: "Overall Operator",

//> @attr filterBuilder.showSelectionCheckbox (boolean : false : IR)
// If true, causes a CheckboxItem to appear to the left of each clause in "inline" 
// +link{topOperatorAppearance,appearance}.  This checkbox allows the user to select 
// individual clauses so that, for example, clauses can be removed from the filterBuilder 
// by application code.  This property is ignored for appearances other than "inline".
// @visibility external
//<

//> @attr filterBuilder.topOperatorForm (AutoChild : null : IR)
// With +link{topOperatorAppearance} "bracket" and "inline", a form that appears to the left
// of the stack of clauses and allows picking the +link{LogicalOperator} for the overall 
// FilterBuilder (or for that specific FilterClause, in the case of "inline")
// <P>
// By default, consists of a CheckboxItem if +link{showSelectionCheckbox} is true, and a 
// simple SelectItem containing the available logical operators.
// @visibility external
//<
topOperatorFormDefaults : {
    height:1, 
    width:80, numCols:1, colWidths:["*"],
    layoutAlign:"center",
    _constructor:isc.DynamicForm,
    items : [
        { 
            name:"operator",
            type: "select",
            showTitle:false,
            width:"*", 
            changed : function (form, item, value) {
                form.creator.topOperatorChanged(value);
            }
        }
    ]
},

//> @attr filterBuilder.topOperatorTitle (String : "Clause Operator" : IR)
// The title for the left-aligned Operator selectItem in the +link{topOperatorForm}.
// @group i18nMessages
// @visibility external
//<
topOperatorTitle: "Clause Operator",

//> @attr filterBuilder.defaultSubClauseOperator (LogicalOperator : "or" : IR)
// Default operator for subclauses added via the +link{subClauseButton}.
// @visibility external
//<
defaultSubClauseOperator:"or",

//> @attr FilterBuilder.matchAllTitle (String : "Match All" : IR)
// Title for the "Match All" (and) operator
// @group i18nMessages
// @visibility external
//<
matchAllTitle: "Match All",

//> @attr FilterBuilder.matchNoneTitle (String : "Match None" : IR)
// Title for the "Match None" (not) operator
// @group i18nMessages
// @visibility external
//<
matchNoneTitle: "Match None",

//> @attr FilterBuilder.matchAnyTitle (String : "Match Any" : IR)
// Title for the "Match Any" (or) operator
// @group i18nMessages
// @visibility external
//<
matchAnyTitle: "Match Any",

//> @attr FilterBuilder.inlineAndTitle (String : "and" : IR)
// Title for the "And" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineAndTitle: "and",

//> @attr FilterBuilder.inlineOrTitle (String : "or" : IR)
// Title for the "Or" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineOrTitle: "or",

//> @attr FilterBuilder.inlineAndNotTitle (String : "and not" : IR)
// Title for the "And Not" operator (only applicable to the "inline" appearance)
// @group i18nMessages
// @visibility external
//<
inlineAndNotTitle: "and not",

// Init
// ---------------------------------------------------------------------------------------

// getPrimaryDS() - this returns the dataSource used to drive field operators etc.

getPrimaryDS : function (fieldName) {
    if (this.dataSources) {
        if (fieldName == null) {
            return isc.DataSource.get(this.dataSources[0]);
        }
        
        if (isc.isAn.Object(fieldName)) {
            if (fieldName._origField != null) {
                fieldName = fieldName._origField;
            }
            for (var i = 0; i < this.dataSources.length; i++) {
                var fields = isc.getValues(this.dataSources[i].getFields());
                if (fields.contains(fieldName)) return this.dataSources[i];
            }
            fieldName = fieldName.name;
        }
        return isc.DataSource.getDataSourceForField(fieldName, this.dataSources);
    }
    if (this.dataSource) return this.getDataSource();
    else if (this.fieldDataSource) return this.fieldDataSource;
},

initWidget : function () {
    this.Super("initWidget", arguments);

    if (this.fieldDataSource && this.criteria) this._initializingClauses = true;

    this.fieldPickerDefaults.title = this.fieldPickerTitle;

    
    // set strings for button defaults
    this.addButtonDefaults.prompt = this.addButtonPrompt;
    this.removeButtonDefaults.prompt = this.removeButtonPrompt;
    this.subClauseButtonDefaults.prompt = this.subClauseButtonPrompt;
    this.subClauseButtonDefaults.title = this.subClauseButtonTitle;
    
    var undef;
    if (this.showSubClauseButton == undef) {
        this.showSubClauseButton = (this.topOperatorAppearance != "radio" &&
                                    this.topOperatorAppearance != "inline");
    }
    
    this.clauses = [];

    var topOp = this.topOperatorAppearance;

    if (isc.isA.String(this.fieldDataSource)) 
        this.fieldDataSource = isc.DS.get(this.fieldDataSource);

    if (isc.isA.String(this.dataSource)) 
        this.dataSource = isc.DS.get(this.dataSource);
    
    
    var ds = this.getPrimaryDS(),
        tempMap = ds.getTypeOperatorMap("text", true, "criteria"),
        tempArr = [];
        
    var radioItemMap = {
        "and": this.matchAllTitle,
        "or": this.matchAnyTitle,
        "not": this.matchNoneTitle
    };

    // We haven't got a lot of room, so we really want to be saying "and" in this 
    // select box, rather than "All subcriteria are true"
    for (var prop in tempMap) {
        tempArr.add(prop);
    }

    if (topOp == "bracket") {
        if (this.showTopRemoveButton) {
            // When the FilterBuilder is being used as a subclause it needs a remove button.
            // Our parent FilterBuilder could tack one on, but only by introducing an extra
            // layer of nesting, so we manage it here.
            var removeButton = this.removeButton = this.createAutoChild("removeButton", {
                click : function () { 
                    this.creator.parentClause.removeButtonClick(this.creator);
                }
            });
            this.addMember(removeButton);
        }
        this.addAutoChild("topOperatorForm");
        this.topOperatorForm.items[0].title = this.topOperatorTitle;
        this.topOperatorForm.items[0].valueMap = tempMap;
        this.topOperatorForm.items[0].defaultValue = this.topOperator;

        this.addAutoChild("bracket");
    } 
    this.addAutoChild("clauseStack");
    this.clauseStack.hide();
    if (topOp == "radio") {
        this.addAutoChild("radioOperatorForm");
        var radioMap = {};
        for (var i = 0; i < this.radioOptions.length; i++) {
            radioMap[this.radioOptions[i]] = radioItemMap[this.radioOptions[i]];
        }
        this.radioOperatorForm.items[0].title = this.radioOperatorTitle;
        this.radioOperatorForm.items[0].valueMap = radioMap; 
        this.radioOperatorForm.items[0].defaultValue = this.topOperator;
    }
    this.addAutoChildren(["buttonBar", "addButton", "subClauseButton"]);

    // support criteria being passed with null elements
    this.stripNullCriteria(this.criteria);
    this.setCriteria(this.criteria);
},


//> @attr filterBuilder.clauseStack (AutoChild : null : IR)
// VStack of all clauses that are part of this FilterBuilder
// @visibility external
//<
clauseStackDefaults : {
    _constructor:isc.VStack,
    height:1,
    membersMargin:1, // otherwise brackets on subclauses are flush
    animateMembers: true,
    animateMemberTime: 150
},

// Clause creation
// ---------------------------------------------------------------------------------------

clauseConstructor: "FilterClause",

addNewClause : function (criterion, field, negated) {
    // create a new isc.FilterClause
    var defaults = isc.addProperties({}, this.topOperatorFormDefaults);
    defaults.items = [];
    for (var i = 0; i < this.topOperatorFormDefaults.items.length; i++) {
        defaults.items.add(isc.addProperties({}, this.topOperatorFormDefaults.items[i]));
    }
    
    var filterClause = this.createAutoChild("clause", {
        visibility: "hidden",
        flattenItems: true,
        criterion: criterion,
        
        // Various ways we can define dataSources/field configs...
        dataSources: this.dataSources,
        dataSource: this.dataSource,
        fieldDataSource: this.fieldDataSource,
        
        validateOnChange: this.validateOnChange,
        showFieldTitles: this.showFieldTitles,
        showRemoveButton: this.showRemoveButton,
        removeButtonPrompt: this.removeButtonPrompt,
        retainValuesAcrossFields: this.retainValuesAcrossFields,
        field: field,
        fieldData: this.fieldData,
        fieldPickerDefaults: this.fieldPickerDefaults,
        fieldPickerProperties: this.fieldPickerProperties,
        remove : function () {
            this.creator.removeClause(this);
        },
        fieldNameChanged : function () {
            this.Super("fieldNameChanged", arguments);
            this.creator.fieldNameChanged(this);
        },
        topOperatorAppearance: this.topOperatorAppearance,
        topOperator: this.topOperator,
        topOperatorFormDefaults: defaults,
        showSelectionCheckbox: this.showSelectionCheckbox,
        negated: negated,
        filterBuilder: this
    });
    var rtnVal = this._addClause(filterClause);
    filterClause.updateInlineTopOperator();
    return rtnVal;
},

//> @method filterBuilder.addClause()
// Add a new +link{FilterClause} to this FilterBuilder.
// <P>
// This API is intended for the rare use case of adding a highly customized FilterClause
// component that does not include the standard field/operator/value picking interface, instead
// providing a custom interface and returning a criterion via +link{filterClause.getCriterion()}.
// <P>
// If you just want to programmatically add a new FilterClause showing a specific Criterion use
// +link{addCriterion()}.
// <P>
// If you want to use the standard field/operator/value interface but provide a custom control
// for editing the value, see +link{DataSource.addSearchOperator} and +link{Operator.editorType}.
// 
// @param filterClause (FilterClause) A +link{FilterClause} instance
// @visibility external
//<
addClause : function (filterClause) {
    // add the passed filterClause
    if (!filterClause) return filterClause;

    var _this = this;
    

    filterClause.fieldDataSource = this.fieldDataSource;
    filterClause.remove = function () {
        _this.removeClause(this);
    };
    filterClause.fieldNameChanged = function () {
        this.Super("fieldNameChanged", arguments);
        _this.fieldNameChanged(this);
    };

    var rtnVal = this._addClause(filterClause);
    filterClause.updateInlineTopOperator();
    return rtnVal;
},

_addClause : function (filterClause) {
    filterClause.filterBuilder = this;

    // Refresh the clause's fields so it can
    // pick up context from the filterBuilder
    filterClause.updateFields();
    this.clauses.add(filterClause);

    var clauseStack = this.clauseStack,
        position = Math.max(0, clauseStack.getMemberNumber(this.buttonBar)),
        _this = this
    ;

    clauseStack.addMember(filterClause, position);
    clauseStack.showMember(filterClause, 
        function () { 
            if (!_this._settingCriteria) filterClause.setDefaultFocus(); 
        }
    );

    this.updateFirstRemoveButton();
    // fire filterChanged
    if (isc.isA.Function(this.filterChanged)) this.filterChanged();
    return filterClause;
},

//> @method filterBuilder.getChildFilters()
// Returns an array of child +link{class:FilterBuilder}s, representing the list of complex 
// clauses, or an empty array if there aren't any.
// 
// @return (Array of FilterBuilder) The list of complex clauses for this filterBuilder
// @visibility external
//<
getChildFilters : function () {
    var childFilters = [];

    for (var i = 0; i<this.clauses.length; i++) {
        var filter = this.clauses[i];
        if (isc.isA.FilterBuilder(filter)) childFilters.add(filter);
    }

    return childFilters;
},


//> @method filterBuilder.getFilterDescription()
// Returns a human-readable string describing the clauses in this filterBuilder.
// 
// @param type (AdvancedCriteria or Criterion) Criteria to convert to a readable string
// @return (String) Human-readable string describing the clauses in the passed criteria
// @visibility external
//<
getFilterDescription : function () {
    return isc.FilterBuilder.getFilterDescription(this.getCriteria(),
            // getFilterDescription handles being passed an array of DS's and criteria with
            // a dataSource.fieldName type fieldName.
            (this.dataSources || this.dataSource));
},

//> @attr filterBuilder.rangeSeparator (String : "and" : IR)
// For operators that check that a value is within a range, text to show between the start and
// end input fields for specifying the limits of the range.
// @visibility external
// @group i18nMessages
//<
rangeSeparator: "and",

//> @method filterBuilder.validate
// Validate the clauses of this FilterBuilder.
// @return (Boolean) true if all clauses are valid, false otherwise
// @visibility external
//<
validate : function () {
    var valid = true;
    for (var i = 0; i < this.clauses.length; i++) {
        if (!this.clauses[i].validate(null, null, true)) valid = false;
    }
    return valid;
},


//> @method filterBuilder.getFieldOperators()
// Get the list of +link{Operators} that are valid on this field.  By default, all operators
// returned by +link{dataSource.getFieldOperators()} are used.
// <P>
// Called whenever the fieldName is changed.
// 
// @return (Array of Operator) valid operators for this field
// @visibility external
//<
getFieldOperators : function (fieldName) {
    var field = this.getField(fieldName);
    return this.getPrimaryDS(fieldName).getFieldOperators(field); 
},

//> @method filterBuilder.getValueFieldProperties()
// 
// Override to return properties for the FormItem(s) used for the "value" field displayed within
// clauses within this filterBuilder.
// <P>
// Note that the +link{operator.valueType} impacts when this method is called. For operators with
// valueType <code>"fieldType"</code> or <code>"custom"</code>, a single value field is displayed.
// For operators with valueType <code>"valueRange"</code> two value-field items are displayed
// (one for the start and one for the end position). The <code>valueItemType</code> parameter may
// be used to determine which form item is being generated.
// 
// @param type (FieldType) type of the DataSource field for this filter row
// @param fieldName (String) name of the DataSource field for this filter row
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @param itemType (ValueItemType) What valueItem is being generated.
//
// @return (FormItem Properties) properties for the value field
// @visibility external
//<
getValueFieldProperties : function (type, fieldName, operatorId, itemType) {
    // This is recursive - this filterBuilder could be a subclause of a parent filterBuilder!
    if (this.filterBuilder) {
        return this.filterBuilder.getValueFieldProperties(type,fieldName,operatorId,itemType);
    }
},


getRangeSeparatorProperties : function (type, fieldName, operatorId) {
    return this.rangeSeparatorProperties;
},


// Subclauses
// ---------------------------------------------------------------------------------------

//> @attr filterBuilder.showSubClauseButton (boolean : See Description : IR)
// Whether to show a button that allows the user to add subclauses.  Defaults to false if 
// the +link{topOperatorAppearance} is "radio" or "inline", true in all other cases.
// @visibility external
//<

//> @attr filterBuilder.subClauseButtonTitle (string : "+()" : IR)
// The title of the subClauseButton
//
// @group i18nMessages 
// @visibility external
//<
subClauseButtonTitle: "+()",

//> @attr filterBuilder.subClauseButtonPrompt (string : "Add Subclause" : IR)
// The hover prompt text for the subClauseButton.
//
// @group i18nMessages 
// @visibility external
//<
subClauseButtonPrompt: "Add Subclause",

//> @attr filterBuilder.subClauseButton (AutoChild : null : IR)
// Button allowing the user to add subclauses grouped by a +link{type:LogicalOperator}.
// @visibility external
//<
subClauseButtonDefaults : {
    _constructor:"IButton",
    autoParent:"buttonBar",
    //title:"+()", // need an icon for this
    autoFit:true,
    //prompt:"Add Subclause",
    click : function () { this.creator.addSubClause(this.clause); }
},

//> @attr filterBuilder.bracket (AutoChild : null : IR)
// Widget used as a "bracket" to hint to the user that a subclause groups several
// field-by-field filter criteria under one logical operator.
// <P>
// By default, a simple CSS-style Canvas with borders on three sides.  A vertical StretchImg
// could provide a more elaborate appearance.
// @visibility external
//<
bracketDefaults : {
    styleName:"bracketBorders", 
    width:10
},

internalSearchFormDefaults: {
    _constructor: "SearchForm",
    visibility: "hidden",
    autoDraw: false
},

childResized : function () {
    this.Super("childResized", arguments);
    if (this.clauseStack && this.bracket) this.bracket.setHeight(this.clauseStack.getVisibleHeight());
},
draw : function () {
    this.Super("draw", arguments);
    if (this.clauseStack && this.bracket) this.bracket.setHeight(this.clauseStack.getVisibleHeight());
},
resized : function () {
    if (this.clauseStack && this.bracket) this.bracket.setHeight(this.clauseStack.getVisibleHeight());
},

addSubClause : function (criterion) {
    var operator;
    if (criterion) {
        operator = criterion.operator;
    }
    var clause = this.createAutoChild("subClause", {
        dataSource:this.dataSource,
        dataSources:this.dataSources,
        showFieldTitles:this.showFieldTitles,
        filterBuilder:this,
        parentClause:this, showTopRemoveButton:true,
        topOperatorAppearance:"bracket",
        topOperator: operator || this.defaultSubClauseOperator,
        clauseConstructor: this.clauseConstructor,
        fieldPickerDefaults: this.fieldPickerDefaults,
        fieldPickerProperties: this.fieldPickerProperties,
        fieldDataSource: this.fieldDataSource,
        fieldData: this.fieldData,
        visibility:"hidden",
        saveOnEnter: this.saveOnEnter,
        validateOnChange: this.validateOnChange,
        // We don't need (or want) to create empty children of new subclauses if we're 
        // building up the UI from a passed-in AdvancedCriteria
        dontCreateEmptyChild: criterion != null
    }, this.Class);

    this.clauses.add(clause);

    this.clauseStack.addMember(clause, this.clauses.length-1);
    this.clauseStack.showMember(clause, function () { 
        clause.topOperatorForm.focusInItem("operator");
        clause.bracket.setHeight(clause.getVisibleHeight());
    });

    // update the firstRemoveButton on the containing clause
    this.updateFirstRemoveButton();

    return clause;
},


// Deriving AdvancedCriteria
// ---------------------------------------------------------------------------------------

//> @method filterBuilder.getCriteria()
// Get the criteria entered by the user.
// 
// @param [includeEmptyValues] (boolean) By default if a user has selected a field and operator
//   type, but has failed to enter a value for the field it will be skipped. This optional parameter
//   allows you to retrieve all criteria, including those with an empty <code>value</code> attribute.
// @return (AdvancedCriteria)
// @visibility external
//<
getCriteria : function (includeEmptyValues) {
    if (this._initializingClauses) {
        // if we were initialized with criteria and the clauses are still being created, just 
        // return the criteria we were initialized with
        return this.criteria;
    }
    
    if (this.topOperatorAppearance == "inline") {
        return this.getInlineCriteria(includeEmptyValues);
    }

    var criteria = {
        _constructor:"AdvancedCriteria",
        operator:this.topOperator,
        criteria:[]
    };

    for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i],
            criterion,
            skipCriterion = false;

        if (isc.isA.FilterBuilder(clause)) {
            criterion = clause.getCriteria(includeEmptyValues);
        } else {
            criterion = clause.getCriterion(includeEmptyValues);
            skipCriterion = (criterion == null);
        }
        if (!skipCriterion) {
            criteria.criteria.add(criterion);
        } 
    }
    // Return a copy - the original contains pointers to the live screen objects
    return isc.clone(criteria);
},

getInlineCriteria : function (includeEmptyValues) {
    var criteria = {
        _constructor:"AdvancedCriteria",
        operator:this.topOperator,
        criteria:[]
    };
    
    if (this.topOperator == "or") {
        // If we have any "and not"s, we need to bundle everything under a top-level
        // "and"
        var orAndNot;
        for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].topOperatorForm.getValue("operator") == "not") {
                orAndNot = true;
                break;
            }
        }
        if (orAndNot) {
            criteria.operator = "and";
            var orCriteria = {
                operator: "or",
                criteria: []
            }
            criteria.criteria.add(orCriteria);
        }
    }
    
    for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i];
        var operator = clause.topOperatorForm.getValue("operator");
        if (operator == this.topOperator) {
            if (orAndNot) {
                orCriteria.criteria.add(clause.getCriterion(includeEmptyValues));
            } else {
                criteria.criteria.add(clause.getCriterion(includeEmptyValues));
            }
        } else {
            criteria.criteria.add({
                operator: "not",
                criteria: [ clause.getCriterion(includeEmptyValues) ]
            });
        }
    }
    return criteria;
},

// fired when this builder is ready for interactive use
filterReady : function () { },

//> @method filterBuilder.setCriteria()
// Set new criteria for editing.  
// <P>
// An interface for editing the provided criteria will be generated identically to what happens
// when initialized with +link{criteria}.
// <P>
// Any existing criteria entered by the user will be discarded.  
// 
// @param criteria (AdvancedCriteria) new criteria.  Pass null or {} to effectively reset the
//                                    filterBuilder to it's initial state when no criteria are
//                                    specified
// @visibility external
//<
setCriteria : function (criteria) {

    this.clearCriteria(true);

    var animation = this.clauseStack ? this.clauseStack.animateMembers : null;
    if (this.clauseStack) this.clauseStack.animateMembers = false;

    this.stripNullCriteria(criteria);

    this._settingCriteria = true;
    
    if (!this._loadingFieldData && this.fieldDataSource && criteria) {
        // fetch the necessary field-entries so they can be passed into the filterClauses
        if (isc.isA.String(this.fieldDataSource)) {
            this.fieldDataSource = isc.DS.getDataSource(this.fieldDataSource);
        }
        
        var _this = this,
            fieldsInUse = this.fieldDataSource.getCriteriaFields(criteria),
            fieldCriteria = {}
        ;

        if (fieldsInUse && fieldsInUse.length > 0) {
            // construct an advanvcedCriteria to use when requesting used fields from the 
            // fields DS
            fieldCriteria = { _constructor: "AdvancedCriteria", operator: "or", criteria: [] };
            for (i=0; i<fieldsInUse.length; i++) {
                var fieldName = fieldsInUse[i],
                    cachedField = this.fieldData ? this.fieldData[fieldName] : null;

                if (!cachedField) {
                    fieldCriteria.criteria[fieldCriteria.criteria.length] = 
                        { fieldName: "name", operator: "equals", value: fieldName };
                }
            }

            if (fieldCriteria.criteria.length != 0) {
                this._loadingFieldData = true;
                this.fieldDataSource.fetchData(fieldCriteria, 
                    function (data) {
                        _this.fetchFieldsReply(data, criteria);
                    }
                );
                return;
            }
        }
    }

    if (!criteria) {
        if (!this.allowEmpty && !this.dontCreateEmptyChild) this.addNewClause();
        this.clauseStack.show();
        this.redraw();
        this.filterReady();
        return;
    }
    
    
    if (!this.getPrimaryDS().isAdvancedCriteria(criteria)) {
        // The textMatchStyle we pass here is kind of arbitrary...
        criteria = isc.DataSource.convertCriteria(criteria, "substring");
    }
    
    if (this.topOperatorAppearance == "inline") {
        return this.setInlineCriteria(criteria, animation);
    }

    this.setTopOperator(criteria.operator);

    if ((!criteria.criteria || criteria.criteria.length == 0) &&
        !this.radioOptions.contains(criteria.operator)) 
    {
        // AdvancedCriteria can validly consist of just an operator like lessThan and a field,
        // but the FilterBuilder assumes a top-level logical operator and need conversion for
        // this case
        this.logWarn("Found top-level AdvancedCriteria with no sub-criteria. Converting " +
                     "to a top-level 'and' with a single sub-criterion");
        this.setTopOperator(this.topOperator);
        this.addNewClause(criteria);     
    } else {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var criterion = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[criterion.fieldName] : null;
            this.addCriterion(criterion, field);
        }
        // possible in the trivial case of a top-most operator of "add" and an empty set of
        // criteria
        if (this.clauses.length == 0 && !this.allowEmpty) this.addNewClause();
    }

    delete this._initializingClauses;
    this._loadingFieldData = false;
    this._settingCriteria = false;
    this.clauseStack.show();
    this.delayCall("redraw");

    if (this.clauseStack) this.clauseStack.animateMembers = animation;

    this.filterReady();
},

setInlineCriteria : function (criteria, animation) {
    // Inline AdvancedCriteria are expected to have a certain structure, so we'll verify that
    // first and crash out if it is not as expected
    var ok = true,
        andMode = false,
        orMode = false;
    if (criteria.operator == "and") {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i];
            if (!clause.criteria) {
                andMode = true;
            } else {
                if (clause.operator == "or") {
                    orMode = true;
                    for (var j = 0; j < clause.criteria.length; j++) {
                        var subClause = clause.criteria[j];
                        if (subClause.criteria) {
                            ok = false;
                            break;
                        }
                    }
                } else {
                    if (clause.operator == "not") {
                        if (clause.criteria.length != 1 || clause.criteria[0].criteria) {
                            ok = false;
                        }
                    } else {
                        ok = false;
                    }
                }
            }
        }
    } else {
        ok = false;
    }
    
    // We must be in one of andMode or orMode, but not both
    if (ok) ok = !(andMode && orMode);
    if (ok) ok = andMode || orMode;
    
    if (!ok) {
        isc.logWarn("Trying to load an AdvancedCriteria into an 'inline' FilterBuilder, but " +
                    "the criteria is too complex to be represented in 'inline' format");
        return;
    }
    
    this.setTopOperator(andMode ? "and" : "or");
    if (andMode) {
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[clause.fieldName] : null;
            if (!clause.criteria) {
                this.addCriterion(clause, field);
            } else {
                // It must be a not with a single subclause
                field = this.fieldData ? this.fieldData[clause.criteria[0].fieldName] : null;
                this.addNewClause(clause.criteria[0], field, true);
            }
        }
    } else {
        // orMode
        for (var i = 0; i < criteria.criteria.length; i++) {
            var clause = criteria.criteria[i],
                field = this.fieldData ? this.fieldData[clause.fieldName] : null;
            if (clause.operator == "or") {
                for (var j = 0; j < clause.criteria.length; j++) {
                    // We've already tested that no subClause of the "or" group is itself a 
                    // criteria group
                    var subClause = clause.criteria[j];
                    field = this.fieldData ? this.fieldData[subClause.fieldName] : null;
                    this.addCriterion(subClause, field);
                }
            } else {
                // It must be a not with a single subclause
                field = this.fieldData ? this.fieldData[clause.criteria[0].fieldName] : null;
                this.addNewClause(clause.criteria[0], field, true);
            }
        }
    }

    delete this._initializingClauses;
    this._loadingFieldData = false;
    this._settingCriteria = false;
    this.clauseStack.show();
    this.delayCall("redraw");

    if (this.clauseStack) this.clauseStack.animateMembers = animation;

    this.filterReady();
    
},

stripNullCriteria : function (criteria) {
    if (criteria && criteria.criteria && criteria.criteria.length>0) {
        for (var i = criteria.criteria.length-1; i>=0; i--) {
            if (criteria.criteria[i] == null) {
                criteria.criteria.removeAt(i);
            } else {
                if (criteria.criteria[i].criteria) this.stripNullCriteria(criteria.criteria[i]);
            }
        }
    }
},

fetchFieldsReply : function (data, criteria) {
    if (this.fieldData) {
        var newFields = isc.getValues(this.fieldData);
        newFields.addList(data.data);
        this.fieldData = newFields.makeIndex("name");
    } else this.fieldData = data.data.makeIndex("name");

    this.setCriteria(criteria);
},

//> @method filterBuilder.clearCriteria()
// Clear all current criteria.
// @visibility external
//<
clearCriteria : function (dontCheckEmpty) {
    
    var animation = this.clauseStack ? this.clauseStack.animateMembers : null;
    if (this.clauseStack) this.clauseStack.animateMembers = false;

    while (this.clauses.length > 0) {
        this.removeClause(this.clauses[0]);
    }

    if (!dontCheckEmpty && !this.allowEmpty) this.addNewClause();

    if (this.clauseStack) this.clauseStack.animateMembers = animation;
},

//> @method filterBuilder.addCriterion()
// Add a new criterion, including recursively adding sub-criteria for a criterion that
// contains other criteria.
// 
// @param criterion (Criterion) new criterion to be added
// @visibility external
//<
addCriterion : function (criterion, field) {

    if (criterion.criteria) {
        var clause = this.addSubClause(criterion);
        for (var idx = 0; idx < criterion.criteria.length; idx++) {
            field = this.fieldData ? this.fieldData[criterion.criteria[idx].fieldName] : null;
            clause.addCriterion(criterion.criteria[idx], field);
        }
    } else {
        this.addNewClause(criterion, field);
    }

},

_$Enter:"Enter",
handleKeyPress: function (event, eventInfo){

    // Special case for Enter keypress: If this.saveOnEnter is true, and the enter keypress
    // occurred in a text item, and this is a top-level FilterBuilder with a search() method
    // defined, call the search() method and stop bubbling
    if (event.keyName == this._$Enter) {
        if (this.saveOnEnter) {
            if (eventInfo.firedOnTextItem) {
                if (!this.creator && this.search) {
                    this.search(this.getCriteria());
                    return isc.EH.STOP_BUBBLING;
                }
            }
        }
    }
},

itemChanged : function () {
    if (this.creator && isc.isA.Function(this.creator.itemChanged)) {
        this.creator.itemChanged();
    } else {
        if (!this.creator && isc.isA.Function(this.filterChanged)) {
            this.filterChanged();
        }
    }
},

fieldNameChanged : function (filterClause) {
},

// switch this on to allow the emptyValue entry in valueMapped fields
allowEmptyValues: false,

//> @method FilterBuilder.getEditorType()
// Returns the type of editor to use for the field.
// <P>
// Default behavior is to use the +link{operator.editorType} for a custom operator, otherwise, 
// use +link{RelativeDateItem} for before/after/between operators on date fields, otherwise, 
// use the same editor as would be chosen by a +link{SearchForm}.
//
// @param field (DataSourceField) DataSourceField definition
// @param operatorId (OperatorId) +link{OperatorId} for the chosen operator
// @return (SCClassName) SmartClient class to use (must be subclass of FormItem)
// @visibility external
//<
getEditorType : function (field, operatorId) {
    var ds = this.getPrimaryDS(field),
        className;
        
    
    var dupField = {};
    isc.addProperties(dupField, field);
    dupField.canEdit = field.canFilter;
    field = dupField;
        
    var operator = ds.getSearchOperator(operatorId, field);

    // return the operator's editorType, if it has one
    if (operator.editorType) return operator.editorType;
    if (operator.getEditorType && isc.isA.Function(operator.getEditorType)) {
        return operator.getEditorType();
    }
    
    
    if (field) {
        // create a SearchForm instance so we can use completely standard SearchForm
        // editor creation logic
        
        
        // special case most operators on dates because the default behavior of using whatever a
        // SearchForm would show would actually show a date range control
        // Handled via the searchForm "defaultDateEditorType" attribute.
        var defaultDateItem =
            (operatorId == "equals" || operatorId == "notEqual" || 
            operatorId == "lessThan" || operatorId == "greaterThan" || 
            // insensitive operators don't really apply to dates but this check is here in case
            // they are explicitly supplied by a developer
            operatorId == "iBetween" || operatorId == "iBetweenInclusive" ||
            operatorId == "between" || operatorId == "betweenInclusive" ||
            operatorId == "greaterOrEqual" || operatorId == "lessOrEqual")
                    ? "RelativeDateItem" : "DateRangeItem";
        
        if (!this.internalSearchForm) {
            this.internalSearchForm = this.createAutoChild("internalSearchForm", 
                { useAllDataSourceFields:false, dataSource: ds, fields:[field], 
                defaultDateEditorType:defaultDateItem,
                allowEmptyValues: this.allowEmptyValues }
            );
        } else {
            this.internalSearchForm.defaultDateEditorType = defaultDateItem;
            this.internalSearchForm.setFields([field]);
        }
        return this.internalSearchForm.getEditorType(field);
    } else
        return isc.FormItemFactory.getItemClassName({}, "text", null);


},


//> @method FilterBuilder.getSelectedClauses()
// Returns the list of this FilterBuilder's FilterClauses that are currently selected.  A 
// clause is "selected" if the user has checked the checkbox next to it; therefore, this 
// method always returns an empty list unless the 
// +link{showSelectionCheckbox,showSelectionCheckbox} property is set.  This method is only 
// applicable where +link{topOperatorAppearance} is "inline" (because that is the only 
// appearance that supports <code>showSelectionCheckbox</code>)
//
// @return (Array of FilterClause) The list of selected clauses
// @visibility external
//<
getSelectedClauses : function () {
    var list = [];
    if (this.showSelectionCheckbox) {
        for (var i = 0; i < this.clauses.length; i++) {
            var c = this.clauses[i];
            if (c.topOperatorForm && c.topOperatorForm.getValue("select")) {
                list.add(c);
            }
        }
    }
    return list;
}

});

isc.FilterBuilder.registerStringMethods({
    
    //> @method filterBuilder.search()
    // A StringMethod that is automatically invoked if +link{filterBuilder.saveOnEnter} is set 
    // and the user presses Enter whilst in a text-item in any clause or subclause.
    //
    // @param criteria (AdvancedCriteria) The criteria represented by the filterBuilder
    // @visibility external
    //< 

    search : "criteria",
    
    //> @method filterBuilder.filterChanged()
    // Handler fired when there is a change() event fired on any FormItem within the 
    // filterBuilder. 
    //
    // @visibility external
    //< 

    filterChanged : ""
});

    
} // End of if (isc.DynamicForm)
