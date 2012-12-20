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


//> @object Rule
// A rule is a declaration that on some triggering event, a form will change the display or
// behavior of one or more of its fields.  Examples include displaying a warning message,
// disabling a field, or populating a field with a calculated value.
// <P>
// A rule is a generalization of a +link{Validator}: validators are designed so that they always
// make sense to run where data is being saved and can either accept or reject the saved data.
// Rules can be triggered by actions other than saving (including button presses) and may have
// side effects that do not constitute rejection of values (such as informational messages, or
// automatically calculated suggested values for fields).
//
// @inheritsFrom Validator
// @visibility rules
//<




//> @attr rule.type (RuleType : null : IR)
// Type of rule - see +link{type:RuleType}.  Any +link{type:ValidatorType} is valid as a rule type
// as well.
// @visibility rules
//<

//> @type RuleType
// @value "message" displays an informational or warning message without marking a field invalid
// @value "populate" applies a calculated value to a field based on values in other fields
// @value "setRequired" marks a field as being required
// @visibility rules
//<


//> @attr rule.fieldName (String | Array of String : null : IR)
// Name of the field that this rule affects.  If this rule affects multiple fields (for example, a
// "readOnly" rule that disables editing on a whole set of fields), either a comma-separated list
// of fieldNames or an Array of fieldNames can be specified.
// @visibility rules
//<


//> @attr rule.triggerEvent (TriggerEvent : "submit" : IR)
// Event that triggers this rule.  See +link{TriggerEvent}.
// @visibility rules
//<

//> @type TriggerEvent
// @value "editStart" Rule is triggered each time the form is populated with data (inclusive of
//                    being initialized to +link{dynamicForm.editNewRecord,edit a new record},
//                    such that all fields show their +link{FormItem.defaultValue,default value})
// @value "editorEnter" Rule is triggered when focus enters the field
// @value "editorExit" Rule is triggered when focus leaves the field
// @value "changed" Rule is triggered whenever a changed event happens on it's field
// @value "submit" Rule is triggered when values in the form are being submitted.  This includes
//                 both saving in a form that edits a record, or being submitted as search
//                 criteria in a search form
// @value "manual" Rule is never automatically fired and must be programmatically triggered
// @visibility rules
//<


//> @attr rule.dependentFields (String | Array of String : null : IR)
// For rules that are triggered by user actions in other fields, a list of fieldNames that can
// trigger the rule.  If multiple fields trigger the rule, either a comma-separated list of
// fieldNames or an Array of fieldNames can be specified.
// @visibility rules
//<

//> @attr rule.applyWhen (AdvancedCriteria : null : IRA)
// Used to create a conditional rule based on +link{AdvancedCriteria,criteria}.  The rule
// will only be triggered if the criteria match the current form values.
// @visibility rules
//<

//> @class RulesEngine
// The rulesEngine class applies +link{Rule,Rules} to fields displayed across dataBoundComponents
// @visibility rules
//<
isc.defineClass("RulesEngine");

isc.RulesEngine.addProperties({
    init : function () {
        this.Super("init", arguments);
        isc.ClassFactory.addGlobalID(this);
        
        if (this.members == null) this.members = [];
        else {
            for (var i = 0; i < this.members.length; i++) {
                var member = this.members[i];
                
                if (isc.isA.String(member)) {
                    this.members[i] = member = window[member];
                }
                this._addMember(member, true);
            }
        }
        
    },
    
    //> @attr rulesEngine.members (Array of DataBoundComponents : null : IRW)
    // Array of dataBoundComponents associated with this rulesEngine. The +link{rulesData,rules}
    // for this engine can be triggered by events generated from this set of components and
    // will act upon them, using +link{rule.fieldName} to find the appropriate component and
    // field to interact with.
    // <P>
    // Note that developers may attach members to a rulesEngine either by setting
    // +link{dataBoundComponent.rulesEngine}, or by including the component in the members array
    // for a rulesEngine.
    //
    // @visibility rules
    //<
    
    //> @method rulesEngine.addMember()
    // Add a member to +link{rulesEngine.members}.
    // @param member (DataBoundComponent) new member to add
    // @visibility rules
    //<
    addMember : function (member) {
        if (!this.members.contains(member)) {
            this.members.add(member);
            this._addMember(member);
        }
    },
    
    _addMember : function (member) {
        if (member.rulesEngine != this) {
            
            if (member.rulesEngine != null) {
                member.rulesEngine.removeMember(member);
            }
            member.rulesEngine = this;
        }
        
        
    },
    
    // Notification method that one of our members started editing a new set of values - 
    // called from DynamicForm.setValues()
    processEditStart : function (component) {
        this._processComponentTriggerEvent("editStart", component);
    },
    
    // Notification when a field gets focus (editor enter)
    processEditorEnter : function (component, field) {
        this._processFieldTriggerEvent("editorEnter", component, field);
    },

    // Notification method that a field changed
    // Fired in response to 'changed' not 'change' since we need to extract values from the
    // DBC. Therefore no way to (for example) cancel the change.
    processChanged : function (component, field) {
        this._processFieldTriggerEvent("changed", component, field);
    },
    
    // Notification method that a field lost focus
    processEditorExit : function (component, field) {
        this._processFieldTriggerEvent("editorExit", component, field);
    },
    
    // Notification that one of our members was submitted (fires after validation at the form level)
    processSubmit : function (component) {
        // In this case we return the result of the validation run. This allows the
        // calling form to cancel submit.
        
        return this._processComponentTriggerEvent("submit", component);            
    },
    
    // Actual code to fire 'processRules' on for rules associated with a trigger-event.
    _processComponentTriggerEvent : function (eventType, component) {
        var rules = this.rulesData;
        if (!rules || rules.length == 0) return;
        var eventTypeRules = [];
        
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].triggerEvent == eventType) {
                eventTypeRules[eventTypeRules.length] = rules[i];
            }
        }
        
        if (eventTypeRules.length > 0) return this.processRules(eventTypeRules);
        return null;

    },
    
    _processFieldTriggerEvent : function (eventType, component, field) {
        var rules = this.rulesData;
        if (!rules || rules.length == 0) return;
        var eventTypeRules = [];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].triggerEvent == eventType) {
                // check fieldName / dependent field...
                var sourceField;
                // Populate rules auto-derive the dependent fields based on the
                // formulaVars
                
                if (rules[i].type == "populate") {
                    sourceField = [];
                    for (var key in rules[i].formulaVars) {
                        sourceField.add(rules[i].formulaVars[key]);
                    }
                } else {
                    sourceField = rules[i].dependentFields || rules[i].fieldName;
                    if (!isc.isAn.Array(sourceField)) sourceField = sourceField.split(",");
                }
                for (var j = 0; j < sourceField.length; j++) {
                    var dotIndex = sourceField[j].indexOf("."),
                        ds = sourceField[j].substring(0, dotIndex),
                        dsField = sourceField[j].substring(dotIndex+1);
                    
                    if (component.getDataSource() == isc.DataSource.get(ds) &&
                        dsField == field.name) 
                    {
                        eventTypeRules.add(rules[i]);
                        // drop out of the inner for-loop
                        break;
                    }
                }
            }
        }
        if (eventTypeRules.length > 0) return this.processRules(eventTypeRules);
        return null;
    },
    
    // getValues() Assembles a record values type object comprised of values from all 
    // member forms. This will be used by rule / validator logic.
    // Note that for databound forms we store the form values under the dataSource name
    // as an attribute on this object.
    getValues : function () {
        var record = {};
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            var values = member.getValues(),
                dataSource = member.getDataSource(),
                dsID = dataSource ? dataSource.getID() : null;
            
            if (dsID != null) {
                record[dsID] = isc.addProperties(record[dsID] || {}, values);
            } else {
                
                record.addProperties(values);
            }
        }
        
        return record;
    },
    
    //> @method rulesEngine.processRules()
    // Process a set of the rules present in +link{rulesEngine.rulesData}.
    // This method is invoked by the system when the appropriate +link{rule.triggerEvent} occurs
    // on +link{members} of this engine. It may also be called manually, passing in the
    // array of rules to process. This is how rules with <code>triggerEvent</code> set to
    // <code>"manual"</code> are processed.
    // @param rules (Array of Rules) Rules to process
    // @visibility rules
    //<
    
    processRules : function (rules) {
        var values = this.getValues(),
            result = null;
        for (var i = 0; i < rules.length; i++) {
//            this.logWarn("processing rule:" + this.echo(rules[i]));
            var rule = rules[i],
                fieldNames = rule.fieldName;
                
            // Support fieldName being a single fieldName, an array of fieldName strings, or
            // a comma-separated string.
            // Normalize to an array first.
            if (isc.isA.String(fieldNames)) {
                fieldNames = fieldNames.split(",");
            }
            for (var j = 0; j < fieldNames.length; j++) {
                var fieldName = fieldNames[j],
                    dsName = fieldName.substring(0,fieldName.indexOf(".")),
                    ds = dsName ? isc.DataSource.get(dsName) : null,
                    dsFieldName = fieldName.substring(dsName.length+1),
    
                    value = isc.DataSource.getPathValue(values, fieldName),
    
                    componentInfo = this.getComponentInfo(fieldName),
                    component = componentInfo ? componentInfo.component: null,
                    field = componentInfo ? componentInfo.item : 
                                (ds ? ds.getField(dsFieldName) : null);
                ;
                
                
                if (field == null) {
                    this.logWarn("RulesEngine contains rule definition with specified fieldName:"
                            + fieldName + " - unable to find associated " + 
                             (component == null ? "member component" : "field") + " for this rule.");
                    continue;
                }
    
                
                if (rule.applyWhen) {
                    var criteria = rule.applyWhen;
                    if (ds == null) {
                        isc.logWarn("Conditional rule criteria ignored because form has no dataSource");
                    } else {
                        var matchingRows = ds.applyFilter([values], criteria);
                        // If the condition does not apply we still need to apply the action
                        // This is typically the meat of the rule - for example - ensure a field that
                        // is currently hidden due to a rule with type set to readOnly gets re-shown
                        // when that validator no longer applies.
                        if (matchingRows.length == 0) {
                            // Use result of null to let validator know it was skipped
//                             this.logWarn("rule of type:" + rule.type + " triggered from:"
//                                 + rule.triggerEvent + " did not match applyWhen criteria");
                            isc.Validator.performAction(null, field, rule, values, component);
                            continue;
                        }
                    }
                }
                var isValid = 
                    (isc.Validator.processValidator(field, rule, value, null, values) == true);
                isc.Validator.performAction(isValid, field, rule, values, component);
                
                
                if (!isValid) {
                    result = false;
                    component.addFieldErrors(
                        field.name, 
                        isc.Validator.getErrorMessage(rule),
                        true
                    );
                } else {
                    if (result == null) result = true;
                }
            }
        }
        return result;
    },
    
    // Method to take a fieldName (including DS name) like "supplyItem.SKU" and find the
    // associated component and item.
    // Returns an object like {component:<dynamicFormInstance>, item:<formitemInstance>}
    getComponentInfo : function (fieldName) {
        var item,
            index = fieldName.indexOf("."),
            dataSource;
        if (index != -1) {
            dataSource = isc.DataSource.get(fieldName.substring(0, index));
            fieldName = fieldName.substring(index+1);
        }
        
        
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].getDataSource() == dataSource) {
                item = this.members[i].getItem(fieldName);
                if (item != null) {
                    return {component:this.members[i], item:item};
                }
            }
        }
        
    },

    //> @method rulesEngine.removeMember()
    // Removes a dataBoundComponent from this engine's +link{members} array.
    // @param member (DataBoundComponent) member to remove
    // @visibility rules
    //<
    removeMember : function (member) {
        if (this.members.contains(member)) {
            this._removeMember(member);
        }
    },
    _removeMember : function (member) {
        this.members.remove(member);
        member.rulesEngine = null;
    },
    
    setRulesData : function (rulesData) {
        this.rulesData = rulesData;
    }
});