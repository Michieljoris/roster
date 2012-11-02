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


//> @class RuleEditor
// A user-interface component for creation and editing of a +link{Rule} or +link{Validator} 
// definition
// @treeLocation Client Reference/Rules
// @visibility rules
//<
isc.defineClass("RuleEditor", "VLayout");


isc.RuleEditor.addProperties({

    // ----
    // Basics / Attributes
    // ----
    
    // Default height to explicit size. This will give it "implicit height" and stop it
    // expanding in Layouts to fill available space.
    height:100,
    
    //> @attr ruleEditor.rule (Validator : null : IRW)
    // Rule to be edited by this ruleEditor. Use +link{setRule} and +link{getRule} to
    // update or retrieve this object at runtime.
    // @visibility rules
    //<
    
    //> @attr ruleEditor.validator (Validator : null : IRW)
    // Validator to be edited by this ruleEditor. Synonym for +link{ruleEditor.rule}.
    // Use +link{setRule} and +link{getRule} to update or retrieve this object at runtime.
    // @visibility rules
    //<
    
    //> @attr ruleEditor.fieldName  (String : null : IRW)
    // Name of the field to which the rule applies. If +link{fieldPicker} is visible, this may
    // be chosen by the user.
    // @visibility rules
    //<
    
    
    //> @attr ruleEditor.dataSource (DataSource : null : IR)
    // DataSource where this validator will be applied. The +link{fieldName} should refer
    // to a field within this dataSource. Should not be set in conjunction with +link{dataSources}.
    // @visibility rules
    //<
    
    //> @attr ruleEditor.dataSources (Arrqy of DataSource : null : IR)
    // DataSources available to this rule when defining a rule. The +link{fieldName} should
    // refer to a field within these dataSource, using notation of the form
    // <code><i>dataSourceID</i>.<i>fieldName</i></code>. Should not be set in conjunction with
    // +link{dataSource}.
    // @visibility rules
    //<
    
    //> @attr ruleEditor.triggerEvent (TriggerEvent : null : IRW)
    // If this ruleEditor is editing a rule to be applied via a +link{rulesEngine}, 
    // what +link{rule.triggerEvent} is assigned to the rule?
    // +link{triggerEventPicker}
    // @visibility rules
    //<
    // This may be specified programmatically or picked by the user via the triggerEventPicker
    
    //> @attr ruleEditor.validatorType (ValidatorType : null : IRW)
    // Type of validator being edited. If +link{showTypePicker} is true, this may be chosen
    // by the user.
    // @setter setValidatorType
    // @visibility rules
    //<

    //> @attr ruleEditor.validatorIsRule (boolean : true : IRA)
    // Is this ruleEditor editing a rule to be applied via a +link{rulesEngine}, or 
    // modifying a validator to be applied directly to a field.
    // @visibility rules
    //<
    
    validatorIsRule:true,
    
    //> @attr ruleEditor.availableTypes (Array of ValidatorType : [...] : IR)
    // List of available validator types.  Defaults to all validator types and rule types
    // that do not require input of a custom expression (eg "requiredIf"), excluding validators 
    // that just verify the field type and are usually implicit (isBoolean, isString, etc).
    // <P>
    // The special value "range" may be specified to indicate that the appropriate "range"
    // validator for the +link{ruleEditor.field,field type} (integerRange, dateRange, etc) should
    // be used.
    // @visibility rules
    //<
    
    availableTypes:[
        "matchesField",
        "isOneOf",
        "lengthRange",
        "contains",
        "doesntContain",
        "substringCount",
        "regexp",
        "mask",
        "floatPrecision",
        "required",
        "readOnly",
        "isUnique",
        "hasRelatedRecord",
        "range",
        "message",
        "populate",
        "setRequired"        
    ],
    
    //> @attr ruleEditor.applyWhen (AdvancedCriteria : null : IRW)
    // Criteria indicating under what circumstances the rule should be applied.
    // @visibility rules
    //<
    
    // -------
    
    
    // default width to 400 - that's enough to accomodate the mainForm
    width:400,
    
    
    initWidget : function () {
        var initialRule = this.rule || this.validator;
        if (initialRule != null) {
            // this will derive fieldName etc from the rule object.
            this.setRule(initialRule, true);
        }

        // Default to hiding the typePicker if a validatorType is defined at init-time
        if (this.showTypePicker == null && this.validatorType != null) {
            this.showTypePicker = false;
        }
        
        // call addAutoChildren to build the UI. This will pick up dynamicDefaults from
        // the special 'getDynamicDefaults' method, and will handle custom UI being injected
        // into the layout.
        this.addAutoChildren(this.components);

        // set initial field values based on initial rule passed in.        
        if (this.nameForm != null && initialRule != null) {
            this.nameForm.setValue("name", initialRule.name);
            this.nameForm.setValue("description", initialRule.description);
        }
        if (this.mainForm) {
            this.fieldPicker = this.mainForm.getItem("fieldName");
            if (this.fieldName != null) this.fieldPicker.setValue(this.fieldName);
        
            this.triggerEventPicker = this.mainForm.getItem("event");
            if (this.triggerEvent) this.triggerEventPicker.setValue(this.triggerEvent);
            
            // If validatorIsRule we show neither the fieldName nor the eventPicker, so
            // hide that entire form so it doesn't take up space.
            if (!this.validatorIsRule) {
                this.mainForm.setVisibility(isc.Canvas.HIDDEN);
            }
        }
        
        if (this.applyWhenForm) {
            // conditionalForm - configures the "applyWhen" block of the validator
            if (this.applyWhen != null) {
                this.applyWhenForm.setValue("applyWhen", true);
                this.updateConditionalForm(true);
            }
        }
        if (this.validatorForm) {        
            this.typePicker = this.validatorForm.getItem("type");
            if (this.validatorType != null) this.typePicker.setValue(this.validatorType);
            
            
            if (this.validatorType != null) {
                this.updateValidatorType(this.validatorType);
            }
        }
        
        // Initialize 'errorMessage' value
        if (this.messageForm) {
            if (this.rule && this.rule.errorMessage) {
                this.messageForm.setValue("errorMessage", this.rule.errorMessage);
            }
        }

        // update the clause to show the initial 'value' field attributes etc if there
        // are any.
        if (initialRule != null) {
            this.setClauseAttributes(initialRule);
        }
        
        return this.Super("initWidget", arguments);
    },
    
    
    // ----
    // UI
    // ----
    
    
    //> @attr ruleEditor.components (Array of Object : [...] : IRA)
    // Member components of this rule editor. Default value is an array of auto-children
    // names (strings), but for custom UI, additional components may be explicitly added.
    // @visibility rules
    //<
    components:[
        "nameForm", "mainForm", "applyWhenForm", "validatorForm", "messageForm"
    ],
    
    getDynamicDefaults : function (childName) {
        switch (childName) {
            case "nameForm" : 
                // nameForm autoChild - configures name and description
                var nameItem = isc.addProperties({name:"name"}, 
                                    this.nameItemProperties, this.nameItemDefaults),
                    descriptionItem = isc.addProperties({name:"description"}, 
                                    this.descriptionItemProperties, this.descriptionItemDefaults);
                
                
                return {items:[nameItem,descriptionItem]};

        
            case "mainForm" : 
                
                // The picker fields follow the autoChildren pattern but we can't
                // use createAutoChild since the form will of course create the live item instances
                var fieldItem = isc.addProperties(
                        {creator:this, editorType:this.fieldPickerConstructor},
                         this.fieldPickerDefaults,
                         this.fieldPickerProperties
                    ),
                    triggerEventItem = isc.addProperties(
                        {creator:this, editorType:this.triggerEventPickerConstructor},
                        this.triggerEventPickerDefaults,
                        this.triggerEventPickerProperties
                    )
        
                return {
                    items:[fieldItem, triggerEventItem]
                };
            
            case "applyWhenForm" : 
                return;
                
            // - validatorForm 
            //  o typeItem - for selecting the validator type
            //  o valuesForm (embedded in a CanvasItem) for configuring the validator.
            //    this is a filterClause
            case "validatorForm" :
                
                var typeItem = isc.addProperties(
                        {creator:this, editorType:this.typePickerConstructor},
                         this.typePickerDefaults,
                         this.typePickerProperties
                    );
                    
                var valuesItem = {
                    name:"valuesItem",
                    editorType:"CanvasItem",
                    showTitle:true, title:null,
                    showIf:"false",
                    canvas:this.getValuesForm(this.validatorType)
                }    
                
                return {
                    disabled:(this.fieldName == null),
                    items:[typeItem, valuesItem]
                };
                
            case "messageForm" :
                return;
        }
    },

    
    //> @attr ruleEditor.showNameForm (boolean : false : IR)
    // Should we show the +link{ruleEditor.nameForm} for editing the <code>name</code> and
    // <code>description</code> attributes of the rule being edited?
    // @visibility rules
    //<
    showNameForm:false,
    
    //> @attr ruleEditor.nameForm (DynamicForm AutoChild : null : IR)
    // DynamicForm used to edit the <code>name</code> and <code>description</code> of the rule
    // being edited.
    // <P>
    // Contains the +link{ruleEditor.nameItem} and +link{ruleEditor.descriptionItem}
    //
    // @visibility rules
    //<
    // Name form - contains name and description
    nameFormConstructor:"DynamicForm",
    nameFormDefaults:{
        numCols:2
    },
    
    //> @attr ruleEditor.nameItem (TextItem AutoChild : {...} :IR)
    // Item for editing the +link{validator.name,name} of the rule being edited. Displayed
    // in the +link{ruleEditor.nameForm} (if +link{ruleEditor.showNameForm} is true).
    // Implemented as an autoChild, so may be customized via <code>nameItemProperties</code>
    // @visibility external
    //<
    nameItemDefaults:{
        editorType:"TextItem",
        title:"Name"
    },
    
    //> @attr ruleEditor.descriptionItem (TextItem AutoChild : {...} :IR)
    // Item for editing the +link{validator.description,description} of the rule being edited.
    // Displayed in the +link{ruleEditor.nameForm} (if +link{ruleEditor.showNameForm} is true).
    // Implemented as an autoChild, so may be customized via <code>nameItemProperties</code>
    // @visibility external
    //<
    descriptionItemDefaults:{
        editorType:"TextAreaItem",
        title:"Description"
    },
    
    
    // Main Form (FieldName / TriggerEvent)
    
    mainFormConstructor:"DynamicForm",
    mainFormDefaults:{
        numCols:2,
        height:20
    },
    
    //> @attr ruleEditor.fieldPicker (AutoChild FormItem : null : IR)
    // Field for picking +link{rule.fieldName}. This form item will only be visible if
    // the user is editing a rule (see +link{validatorIsRule}).
    // @visibility rules
    //<
    
    fieldPickerConstructor:"SelectItem",
    
    fieldPickerDefaults:{
        name:"fieldName",
        multiple:true,
        title:"FOR",
        showIf:function () {
            return this.creator.shouldShowFieldPicker();
        },
        pickListProperties:{
            showHeader:true,
            canSelectAll:false
        },
        getClientPickListData:function () {
            return this.form.creator.getFieldData();
        },
        valueField:"name",
        getPickListFilterCriteria:function () {
            // This has been implemented to disallow the user from picking 
            // (say) an int field and a string field since we can't apply certain validators
            // to both field types (integerRange, etc).
            // Arguably it should check for baseType - so you get sequence and integer showing
            // up together, but this would also cause date and datetime to show up together so
            // it's not clear that this is really desirable.
            var currentValue = this.getValue();
            if (currentValue == null || isc.isAn.emptyArray(currentValue)) return null;
            if (isc.isAn.Array(currentValue)) currentValue = currentValue[0];
            var field = this.creator.getField(currentValue);
            if (field) return {type:field.type || "text"};
            return null;
        },
        pickListWidth:200,
        // show the type so its obvious what's going on when we filter by type.
        pickListFields:[
            {name:"name", title:"Field Name", width:"*"},
            {name:"type", title:"Type", width:"*"}
        ],
        changed : function (form,item,value) {
            // force a refilter to show only fields that match the specified type.
            if (this.pickList && this.pickList.isVisible()) this.filterPickList();
            this.creator.updateFieldName(value);
        }
    },
    shouldShowFieldPicker : function () {
        if (this.showFieldPicker != null) return this.showFieldPicker;
        return this.validatorIsRule;
    },
    
    getField:function(fieldName) {
        return this.dataSource ? this.dataSource.getField(fieldName) 
                            : isc.DataSource.getFieldFromDataSources(fieldName ,this.dataSources);
    },
    
    // Client side pickList Data (ValueMap) for the field picker
    getFieldData : function () {
        if (this._fieldNames == null) {
            var dataSources = this.dataSources;
            if (dataSources != null) {
                this._fieldNames = isc.DataSource.getCombinedDataSourceFields(this.dataSources);

            } else if (this.dataSource) {
                var dsFields = isc.getKeys(this.dataSource.getFields());
                this._fieldNames = dsFields.duplicate();
            }
            this._fieldData= [];
            for (var i = 0; i < this._fieldNames.length; i++) {
                var name = this._fieldNames[i],
                    field = this.getField(name);
                    
                this._fieldData[i] = {
                    name:name,
                    type:field.type || "text"
                }
            }
        }
        return this._fieldData;
    },
    updateFieldName : function (fieldName) {
        this.fieldName = fieldName;
        if (this.validatorForm) {
            if (fieldName == null || (isc.isAn.Array(fieldName) && fieldName.length == 0)) {
                // Clear validatorType and disable validatorForm.
                // - it'd be invalid to get a rule with no field name
                // - if we leave the type intact, when the user next selects a field the type
                //   may not be applicable to that field
                this.validatorForm.setValue("type", null);
                this.validatorType = null;
                this.validatorForm.setDisabled(true);
            } else {
                if (this.validatorForm.isDisabled()) this.validatorForm.enable();
            }
        }
        
        if (isc.isAn.Array(fieldName)) fieldName = fieldName[0];
        if (fieldName != null && this.validatorType != null) {
            this.valuesForm.fieldName = fieldName;
            
            this.valuesForm.clause.setValue("fieldName", fieldName);
            this.valuesForm.clause.setValue("operator", this.validatorType);

            // We can't just call 'fieldNameChanged()' - that'll attempt to compare the
            // operatorType with an operator object using 'DataSource.getSearchOperator()' which
            // doesn't apply outside of Criteria editing. Insted call updateValueItems directly.
            var validatorDefinition = this.getValidatorDefinition(this.validatorType);
    
            this.valuesForm.updateValueItems(
                    this.valuesForm.getField(fieldName), validatorDefinition, fieldName);
        } 
        this.updateValuesFormVisibility();
    },
    
    updateValuesFormVisibility : function () {
        
        if (this.valuesForm) {
            if (this.fieldName == null || this.validatorType == null) {
                this.validatorForm.getItem("valuesItem").hide();
            } else {
                if (!this.valuesForm.isVisible()) {
                    this.validatorForm.getItem("valuesItem").show();
                }
            }
        }
    },

    //> @attr ruleEditor.triggerEventPicker (AutoChild FormItem : null : IR)
    // Field for picking +link{rule.triggerEvent}. This form item will only be visible if
    // the user is editing a rule (see +link{validatorIsRule}).
    // @visibility rules
    //<

    triggerEventPickerConstructor:"SelectItem",
    triggerEventPickerDefaults:{
        name:"event",
        startRow:true,
        title:"ON",
        valueMap:["editStart", "editorEnter", "editorExit", "changed", "submit", "manual"],
        changed : function (form,item,value) {
            this.creator.updateTriggerEvent(value);
        },
        showIf : function () {
            return this.creator.shouldShowTriggerEventPicker();
        }
    },
    
    shouldShowTriggerEventPicker : function () {
        if (this.showTriggerEventPicker != null) return this.showTriggerEventPicker;
        return this.validatorIsRule;
    },
    
    // ---
    // Conditional / applyWhen UI
    // ---

    // 'applyWhenForm' contains just the checkbox to show /hide the conditional criteria form
    applyWhenFormConstructor:"DynamicForm",
    applyWhenFormDefaults:{
        numCols:2,
        fixedColWidths:true,
        
        height:20,
        defaultItems:[
            {name:"applyWhen", labelAsTitle:true, showLabel:false, title:"WHEN", editorType:"CheckboxItem",
             hint:"Enable", width:20,
             changed:"this.form.creator.updateConditionalForm(value)"},
            {type:"CanvasItem", showTitle:true, title:null, name:"conditionalItem", showIf:"false",
             createCanvas:function () {
                return this.form.creator.createConditionalForm()
             }
            }
        ]
    },

    //> @attr ruleEditor.conditionalForm (AutoChild : null : IR)
    // Automatically generated filter-builder used to edit the +link{rule.applyWhen} attribute
    // when editing a rule. Only visible if +link{ruleEditor.validatorIsRule} is true.
    // @visibility rules
    //<
    
    conditionalFormConstructor:"FilterBuilder",
    conditionalFormDefaults:{
        showFieldTitles:false
    },
    
    createConditionalForm : function () {
        
        this.conditionalForm = this.createAutoChild("conditionalForm", 
            {dataSource:this.dataSource, dataSources:this.dataSources}
        );
        return this.conditionalForm;
    },
    
    updateConditionalForm : function (show) {
        var item = this.applyWhenForm.getItem("conditionalItem");
        if (!show) {
            item.hide();
        } else {
            var criteria = this.applyWhen || {};
            this.conditionalForm.setCriteria(criteria);
            item.show();
        }
    },
    
    // ---
    // Validator Config UI: type picker and valuesForm
    // ---
    
    // validatorForm - contains the 'typePicker' and the valuesForm CanvasItem  
    validatorFormConstructor:"DynamicForm",
    validatorFormDefaults:{
        numCols:2,
        fixedColWidths:true,
        height:20
    },

    //> @attr ruleEditor.typePicker (AutoChild FormItem : null : IR)
    // Field for picking +link{validatorType}.
    // @visibility rules
    //<

    //> @attr ruleEditor.showTypePicker (boolean : null : IR)
    // Whether the +link{typePicker} is shown. If not explicitly specified, the typePicker will
    // be shown if +link{validatorType} is not specified at initialization time.
    // @visibility rules
    //<

    typePickerConstructor:"SelectItem",
    
    typePickerDefaults:{
        name:"type",
        title:"RULE",
        showIf:function () {
            var ruleEditor = this.form.creator;
            return ruleEditor.showTypePicker == false ? false : true;
        },
        getValueMap:function () {
            return this.creator.getTypeValueMap();
        },
        changed:function(form,item,value) {
            this.creator.updateValidatorType(value);
        }
    },
    
    // ValueMap for the validator type form item.
    getTypeValueMap : function () {
        var types = this.availableTypes,
            fieldName = this.fieldName,
            dataType;
        
        // We only want to show validators that apply to the data type of the selected field.
        // If multiple fields are selected and they don't match type, we only want to show 
        // "generic" validators like "required".
        
        if (fieldName == null) fieldName = [];
        else if (!isc.isAn.Array(fieldName)) fieldName = [fieldName];
        for (var i = 0; i < fieldName.length; i++) {
            var field = this.getField(fieldName[i]);
            if (field == null) {
                this.logWarn("unable to retrieve field for:" + fieldName);
                continue;
            }
            var fieldDataType = isc.SimpleType.getBaseType(field.type || "text");
            if (dataType == null) {
                dataType = fieldDataType;
            } else if (dataType != fieldDataType) {
                dataType = null;
                break;
            }
        }
        
        if (this.availableTypeMap == null) {
            this.availableTypeMap = {};
            for (var i = 0; i < this.availableTypes.length; i++) {
                var defDataType = null;
                
                // special case "range" -this doesn't map directly to a validator type-name.
                if (this.availableTypes[i] == "range") {
                    defDataType = ["date", "time", "float", "integer"]
                } else {
                    var definition = this.getValidatorDefinition(this.availableTypes[i]);
                    defDataType = definition.dataType || "none";
                }
                if (!isc.isA.Array(defDataType)) defDataType = [defDataType];
                for (var ii = 0; ii < defDataType.length; ii++) {
                    if (this.availableTypeMap[defDataType[ii]] == null) {
                        this.availableTypeMap[defDataType[ii]] = [this.availableTypes[i]];
                    } else {
                        this.availableTypeMap[defDataType[ii]].add(this.availableTypes[i]);
                    }
                }
            }
        }
        
        var types = [];
        types.addList(this.availableTypeMap["none"]);
        if (dataType != null) types.addList(this.availableTypeMap[dataType]);
        
        return types;
    },

    // This method fired when the validator type changes.
    // Refreshes the valuesForm
    updateValidatorType : function (type) {
        this.validatorType = type;
        if (type != null) {
            var currentValuesForm = this.valuesForm,
                newValuesForm = this.getValuesForm(type);
            // Note that 'getValuesForm()' will actually update the valuesForm's valueItems
            
            if (currentValuesForm != newValuesForm) {
                this.valuesForm = newValuesForm;
                this.validatorForm.getItem("valuesItem").setCanvas(this.valuesForm);
                // (Don't destroy old validator form - we may want to reuse it
            }
        }
        // This'll actually hide the form if there's no selected validatorType
        this.updateValuesFormVisibility();
    },
    
    messageFormConstructor:"DynamicForm",
    messageFormDefaults:{
        numCols:2,
        width:"100%",
        height:20,
        defaultItems:[
            {name:"errorMessage", title:"MESSAGE", editorType:"TextItem", width:"*"}
        ]
    },
   
    //> @attr ruleEditor.valuesForm (AutoChild FilterClause : null : IR)
    // Form used for editing the attributes of a validator.
    // @visibility rules
    //<
    // This is a customized filterClause -- we use the class so it will derive the appropriate
    // form items to show based on available dataSource fields, field.type and validator.valueType 
    // but we make the following fundamental changes:
    // - suppress the "remove" icon
    // - suppress the "fieldPicker" field (shown directly in the RuleEditor instead)
    // - suppress the "operator" picker. The clause will be passed validator definition objects
    //   instead of criterion operator objects. We show an operator picker directly in the RuleEditor
    // - never call the standard 'getCriterion' method - we're building validators, not criteria.
    //   Instead we duplicate the relevant bits of this to extract the values from the value field(s)
    //   and for custom editors, call the special validator.getAttributesFromEditor() API
     
    valuesFormConstructor:"FilterClause",
    
    valuesFormDefaults:{
        // validatorAttribute / rangeStart/end attributes and getAttributesFromEditor may be
        // defined on the validator definitions.
        customGetValuesFunction:"getAttributesFromEditor",
        customSetValuesFunction:"setEditorAttributes",
        operatorAttribute:"type",
    
        // Don't show the field-picker item
        fieldPickerProperties:{
            showIf:"return false"
        },
        
        getEditorType : function (field, validatorType) {
            if (field && isc.SimpleType.inheritsFrom(field.type, "date")) return "RelativeDateItem";
            // Return null - this'll back off to default behavior
            return null;
        }
        
    },
    
    // Helper to get a 'validatorDefinition' from a validatorType name
    getValidatorDefinition : function (type) {
        if (type == null) type = this.validatorType;
        if (type == null) return null;
        
        // special-case "range" - get the range for the field type
        if (type == "range") {
            var field = this.fieldName,
                // IF we don't have a field, this is sorta invalid, but default to integerRange
                type = field ? field.type : "integer",
                baseType = isc.SimpleType.getBaseType(type);
             
            // All ranges:
            // integerRange
            // dateRange
            // timeRange
            // floatRange
            // - default to integerRange if its none of these!
            // ('lengthRange' is the only range that makes sense for strings, but it'd be
            // an odd behavior if the user picks just "range" on a string field).
            if (baseType == "date" || baseType == "datetime") {
                type = "dateRange";
            } else if (baseType == "time") {
                type = "timeRange";
            } else if (baseType == "float") {
                type = "floatRange"
            } else {
                type = "integerRange"
            }
                
        }
        return isc.Validator._validatorDefinitions[type];
    },
    
    
    getValuesForm : function (validatorType) {

        if (validatorType != null) {
            var validatorDefinition = this.getValidatorDefinition(validatorType),
                valueType = validatorDefinition.valueType;
        }
        
        var fieldName = this.fieldName;        
        
        if (isc.isAn.Array(fieldName)) fieldName = fieldName[0];
        
        if (this.valuesForm) {        
            this.valuesForm.updateValueItems(
                this.valuesForm.getField(fieldName), validatorDefinition, fieldName);
            
            this.valuesForm.clause.setValue("operator", validatorType);
            
            return this.valuesForm;
        } else {
            
            var form = this.valuesForm = this.createAutoChild("valuesForm", {
                visibility:(this.fieldName ? "inherit" : "hidden"),
                showRemoveButton:false,
                // support multiple or singular dataSource
                dataSources:this.dataSources,
                dataSource:this.dataSource,
                fieldName:fieldName,
                operatorType:validatorType
            });
            
            // hide the operatorPicker in the clause - we have a separate item for this.
            
            var clauseForm = form.clause;
            clauseForm.getItem("operator").hide();
            // allow unknown values so we can set to 'validatorTypes' that aren't present in the
            // standard 'operators' valueMap
            
            clauseForm.getItem("operator").addUnknownValues = true;
            return form;
        }
    },
    
    // -----
    // End of UI
    // -----
    
    //> @method ruleEditor.setValidatorType()
    // Update the +link{ruleEditor.validatorType}
    // @param type (ValidatorType) validatorType
    // @visibility rules
    //<
    setValidatorType : function (type) {
        this.validatorType = type;
        this.validatorForm.setValue("type", type);
        this.updateValidatorType(type);
    },
        
    //> @method ruleEditor.setFieldName()
    // Sets the fieldName applied to the rule.
    // @visibility rules
    //<
    // For validators managed by a rulesEngine,
    // rule.fieldName specifies what field the validator is attached to.
    // For normal forms the validators are defined as an attribute on the field.
    // We need to know the fieldName in order to show the correct UI - assume the calling code
    // will set this at init time or runtime.
    setFieldName : function (fieldName) {
        if (this.fieldPicker) {
            this.fieldPicker.setValue(fieldName);
        }
        this.updateFieldName(fieldName);
    },
    
    //> @method ruleEditor.setTriggerEvent()
    // Sets the +link{triggerEvent} for this ruleEditor
    // @param event (TriggerEvent) new trigger event
    // @visibility rules
    //<
    setTriggerEvent : function (event) {
        if (this.triggerEventPicker) {
            this.triggerEventPicker.setValue(event);
        }
        this.updateTriggerEvent(event);
    },
    updateTriggerEvent : function (event) {
        this.triggerEvent = event;
    },

    
    //> @method ruleEditor.setApplyWhen()
    // Sets the +link{applyWhen} attribute for this ruleEditor.
    // @param applyWhen (AdvancedCriteria) criteria indicating when the rule should be applied.
    // @visibility rules
    //<
    setApplyWhen : function (criteria) {
        this.applyWhen = criteria;
        this.applyWhenForm.setValue("applyWhen", (this.applyWhen != null));
        this.updateConditionalForm(criteria != null);
    },
    
    getApplyWhen : function () {
        if (this.applyWhenForm.getValue("applyWhen")) {
            this.applyWhen = this.conditionalForm.getCriteria();
        } else {
            this.applyWhen = null;
        }
        return this.applyWhen;
    },

    // attributes from the 'valuesForm'.
    // Typically this is just the single value/fieldName, but may include other fields
    // depending on the valueType / editorType etc of the validator.
    
    getAttributesFromClause : function () {
        var baseDef = this.getValidatorDefinition();
        var fieldName = this.fieldName,
            validatorClause = this.valuesForm;
        
        if (isc.isAn.Array(fieldName)) fieldName = fieldName[0];
        var validatorAttributes = validatorClause.getClauseValues(fieldName, baseDef);
        return validatorAttributes;
    },
    
    setClauseAttributes : function (attributes) {
        if (this.valuesForm == null) return;
        // update the "value" field[s] of the clause form
        // That's typically "value" or "start"/"end" but might call custom setter for some
        // validator types.
        // Note that this sill not update validatorType/fieldName -- that should already have
        // been handled via setRule() if necessary.
        var baseDef = this.getValidatorDefinition();
        var fieldName = this.fieldName;
        
        if (isc.isAn.Array(fieldName)) fieldName = fieldName[0];

        this.valuesForm.setClauseValues(fieldName, baseDef, attributes);
        
    },
    
    //> @method ruleEditor.getValidator()
    // synonym for +link{getRule()}.
    // @return (Validator) edited validator object
    // @visibility rules
    //<
    getValidator : function () {
        return this.getRule();
    },
    
    //> @method ruleEditor.getRule()
    // Get the rule (validator). Will return null if +link{fieldName} or +link{validatorType} are
    // not set.
    // @return (Validator) edited validator object
    // @visibility rules
    //<
    getRule : function () {
        if (this.validatorType == null || this.fieldName == null) return null;
        var validator = {};
        validator.type = this.validatorType;
        
        if (this.nameForm != null) {
            var name = this.nameForm.getValue("name");
            if (name != null) validator.name = name;
            var description = this.nameForm.getValue("description");
            if (description != null) validator.description = description;
        }
                
        // attributes from the filterClause form
        if (this.valuesForm != null) {
            var validatorAttributes = this.getAttributesFromClause();
            isc.addProperties(validator, validatorAttributes);
        }
        
        
        if (this.validatorIsRule) {
            validator.fieldName = this.fieldName;
            if (this.triggerEvent) validator.triggerEvent = this.triggerEvent;
        } else {
            delete validator.fieldName;
        }

        validator.errorMessage = this.messageForm.getValue("errorMessage");

        // applyWhen criteria for the validator        
        var applyWhen = this.getApplyWhen();
        if (applyWhen != null) validator.applyWhen = applyWhen;
        
        return validator;
    },
    
    //> @method ruleEditor.validate()
    // Validate the current set of values for the rule.
    // @return (boolean) true if validation passed for all component forms, false otherwise.
    // @visibility external
    //<
    
    validate : function () {
        var failed = false;
        // if name/description have been marked as required, enforce this
        if (this.nameForm) failed = this.nameForm.validate() == false;
        if (this.mainForm) failed = (this.mainForm.validate() == false) || failed;
        if (this.applyWhenForm && this.applyWhenForm.getValue("applyWhen")) {
            failed = (this.conditionalForm.validate() == false) || failed;
        }
        if (this.validatorForm) {
            failed = (this.validatorForm.validate() == false) || failed;
            if (this.valuesForm) failed = (this.valuesForm.validate() == false) || failed;
        }
        if (this.messageForm) failed = (this.messageForm.validate() == false) || failed;
        return !failed;
    },
    
    //> @method ruleEditor.setRule()
    // Show the specified rule in this ruleEditor
    // @param rule (Validator) Rule to edit.
    // @visibility rules
    //<
    // initTime param used internally
    setRule : function (rule, initTime) {
        
        this.validator = this.rule = rule;

        if (initTime) {
            this.validatorType = rule.type;
            this.applyWhen = rule.applyWhen;
            this.fieldName = rule.fieldName;
            this.triggerEvent = rule.triggerEvent;
            // errorMessage is applied lazily to the messageForm when its initialized.
        } else {
            if (this.nameForm) {
                this.nameForm.setValue("name", rule.name);
                this.nameForm.setValue("description", rule.description);
            }
            
            if (rule.fieldName != null) this.setFieldName(rule.fieldName);
            this.setTriggerEvent(rule.triggerEvent);
            this.setValidatorType(rule.type);
            this.setApplyWhen(rule.applyWhen);
            this.messageForm.setValue("errorMessage", rule.errorMessage);

            this.setClauseAttributes(rule);
        }
    },
    //> @method ruleEditor.setValidator()
    // Show the specified validator in this ruleEditor. Synonym for setRule().
    // @param rule (Validator) Rule to edit.
    // @visibility rules
    //<
    setValidator : function (validator) {
    
        this.setRule(validator);
    },
    
    //> @method ruleEditor.clearRule()
    // Clear the ruleEditor's values (dropping the current rule entirely). Note that this will
    // clear all settings for the rule, including <code>fieldName</code>.
    // @visibility rules
    //<
    clearRule : function () {
        this.rule = this.validator = null;
        this.setFieldName(null);
        this.setValidatorType(null);
        this.setApplyWhen(null);
        this.setTriggerEvent(null);
        if (this.nameForm) this.nameForm.clearValues();
        if (this.messageForm) this.messageForm.clearValue("errorMessage");
    },
    
    //> @method ruleEditor.clearValidator()
    // Clear the ruleEditor's values (dropping the current validator entirely).
    // @visibility rules
    //<
    clearValidator : function () {
        return this.clearRule();
    }

});


if (isc.DynamicForm) {


// Custom form item types for editing built-in validator definition objects
// These are referred to via the "validator.editorType" attribute 


isc.defineClass("SubstringCountEditor", "CanvasItem").addProperties({
    
    canvasConstructor:"DynamicForm",
    canvasDefaults:{
        numCols:3
    },
    
    substringFieldDefaults:{
        name:"substring",
        showTitle:false, type:"text", colSpan:"*", width:"*"
    },
    countFieldDefaults:{
        name:"count", showTitle:false, hint:"Count", showHintInField:true, 
        width:50, type:"integer"
    },
    operatorFieldDefaults:{
        name:"operator", title:"Operator", editorType:"SelectItem",
        width:50,
        defaultValue:"==", allowEmptyValue:false,
        valueMap:["==", "!=", "<", "<=", ">", ">=" ]
    },
    createCanvas : function (form,item) {
        
        var substringField = isc.addProperties({}, 
                this.substringFieldDefaults, this.substringFieldProperties),
            countField = isc.addProperties({},
                this.countFieldDefaults, this.countFieldProperties),
            operatorField = isc.addProperties({},
                this.operatorFieldDefaults, this.operatorFieldProperties);
        
        return this.canvas = this.createAutoChild(
            "canvas", 
            { items:[
                    substringField,
                    countField,
                    operatorField
                ]
            }
        );
    }
});

isc.defineClass("FloatRangeEditor", "CanvasItem").addProperties({
    
    canvasConstructor:"DynamicForm",
    canvasDefaults:{
        numCols:2
    },
    minFieldDefaults:{
        name:"min",
        showTitle:false, type:"float",
        hint:"Min", showHintInField:true
    },
    maxFieldDefaults:{
        name:"max", 
        showTitle:false, type:"float",
        hint:"Max", showHintInField:true
    },
    exclusiveFieldDefaults:{
        name:"exclusive", title:"Exclusive", 
        colSpan:"*",
        prompt:"Range is exclusive (does not include min/max values)",
        type:"boolean",
        editorType:"CheckboxItem", defaultValue:false
    },
    createCanvas : function (form,item) {
        
        var minField = isc.addProperties({}, 
                 this.minFieldDefaults, this.minFieldProperties),
            maxField = isc.addProperties({},
                this.maxFieldDefaults, this.maxFieldProperties),
            exclusiveField = isc.addProperties({},
                this.exclusiveFieldDefaults, this.exclusiveFieldProperties);
        
        return this.canvas = this.createAutoChild(
            "canvas", 
            { items:[
                    minField,
                    maxField,
                    exclusiveField
                ]
            }
        );
    }
});

isc.defineClass("FloatPrecisionEditor", "CanvasItem").addProperties({
    
    canvasConstructor:"DynamicForm",
    canvasDefaults:{
        numCols:1
    },
    
    precisionFieldDefaults:{
        name:"precision",
        showTitle:false, type:"float",
        hint:"Precision", showHintInField:true
    },
    roundFieldDefaults:{
        showTitle:false,
        name:"roundToPrecision", title:"Round to precision", 
        type:"boolean",
        editorType:"CheckboxItem", defaultValue:false
    },
    createCanvas : function (form,item) {
        
        var precisionField = isc.addProperties({}, 
                this.precisionFieldDefaults, this.precisionFieldProperties),
            roundField = isc.addProperties({},
                this.roundFieldDefaults, this.roundFieldProperties);
        
        return this.canvas = this.createAutoChild(
            "canvas", 
            { items:[
                    precisionField, roundField
                ]
            }
        );
    }
});

isc.defineClass("MaskRuleEditor", "CanvasItem").addProperties({
    // Needs 2 strings - mask (a regex), and transformTo
    canvasConstructor:"DynamicForm",
    canvasDefaults:{
        numCols:1
    },
    
    maskFieldDefaults:{
        name:"mask", editorType:"TextItem",
        showTitle:false,
        hint:"mask", showHintInField:true
    },
    transformFieldDefaults:{
        name:"transformTo", editorType:"TextItem",
        showTitle:false,
        hint:"transformTo", showHintInField:true
    },
    createCanvas : function (form,item) {
        
        var maskField = isc.addProperties({}, 
                this.maskFieldDefaults, this.maskFieldProperties),
            transformField = isc.addProperties({},
                this.transformFieldDefaults, this.transformFieldProperties);
        
        return this.canvas = this.createAutoChild(
            "canvas", 
            { items:[
                    maskField, transformField
                ]
            }
        );
    }    
});

isc.defineClass("PopulateRuleEditor", "BlurbItem").addProperties({

    emptyFormulaText:"Click the icon to select a formula",
    formulaVarsTitle:"Formula Variables:",
    formulaTitle:"Formula:",
    editFormulaPrompt:"Click to edit formula",
    
    formatValue:function (value,record,form,item) {
        // rule is an object containing "formula" (string) and "formulaVars" (map)
        if (value == null || value.formula == null) {
            return this.emptyFormulaText;
        }
        return "<table class=" + this.getTextBoxStyle() + "><tr><td>" + this.formulaVarsTitle + "</td><td>" 
                    + isc.JSON.encode(value.formulaVars, {prettyPrint:true}) + "</td></tr>" +
                "<tr><td>" + this.formulaTitle + "</td><td>" + value.formula + "</td></tr></table>";        
    },
    icons:[
        {click:"item.showFormulaWindow()"}
    ],
    
    init:function () {
        this.icons[0].prompt = this.editFormulaPrompt;
        return this.Super("init", arguments);
    },
    
    formulaWindowConstructor:"Window",
    formulaWindowDefaults:{
        title: "Formula Editor",
        showMinimizeButton: false, showMaximizeButton: false,
        isModal: true, 
        showModalMask:true, 
        autoSize: true,
        autoCenter: true,
        autoDraw: true,
        headerIconProperties: { padding: 1,
            src: "[SKINIMG]ListGrid/formula_menuItem.png"
        },
        
        closeClick: function () {
            // call the method to cancel editing on the formulaBuilder. That'll automatically
            // dismiss this window.
            this.items.get(0).completeEditing(true);
        }

    },
    
    formulaBuilderConstructor:"FormulaBuilder",
    formulaBuilderDefaults:{
        width:300,
        // FormulaBuilders typically edit formula fields for components - but we just want UI
        // for creating and testing formulae.
        // Hide any UI to do with formula fields / source component fields
        showTitleField:false,
        showAutoHideCheckBox:false,

        // no need for "save and add another"! We'll use save/cancel
        // (since we show the thing in a popup)
        showSaveAddAnotherButton:false,
        
        fireOnClose:function () {
            this.creator.userEditComplete(!this.cancelled);
        }
    },
    
    showFormulaWindow : function () {
        if (this.formulaBuilder == null) {
            this.formulaBuilder = this.createAutoChild(
                "formulaBuilder",
                
                {dataSource:this.form.creator.dataSource, dataSources:this.form.creator.dataSources,
                 mathFunctions: isc.MathFunction.getDefaultFunctionNames()}
            );
            
            this.formulaWindow = this.createAutoChild("formulaWindow", {items:[this.formulaBuilder]});
        }
        // Clear the current value in the window if there is one.
        
        this.formulaBuilder.setValue("");
        this.formulaWindow.show();
    },
    
    userEditComplete : function (saveValue) {
        if (saveValue) {
            var formulaObj = this.formulaBuilder.getBasicValueObject(),
                formula,
                formulaVars;
            if (formulaObj != null) {
                formula = formulaObj.text;
                formulaVars = formulaObj.formulaVars;
            }
            if (formula != null) {
                this.storeValue({formula:formula, formulaVars:formulaVars});
            } else {
                this.storeValue(null);
            }
            this.redraw();
        }
        this.formulaWindow.clear();
    }
    
});

isc.defineClass("ReadOnlyRuleEditor", "SelectItem").addProperties({
    defaultValue:isc.Validator.READONLY,
    valueMap:[
        isc.Validator.HIDDEN,
        isc.Validator.DISABLED,
        isc.Validator.READONLY
    ]
});

}   // End of check for DynamicForm being defined