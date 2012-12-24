/*global isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({  factory: function() {
    "use strict";
    var typesAndFields = {};
    var dataSource;
       
    var views = {
        all: {   map : function(doc) { emit(doc,null); }
	         ,reduce: false}
        ,shift: { map : function(doc) {
	    if (doc.type === 'shift') emit(doc,null);}
		  ,reduce: false}
        ,location: { map : function(doc) {
	    if (doc.type === 'location') emit(doc,null);}
		     ,reduce: false}
          
        ,person: { map : function(doc) {
	    if (doc.type === 'person') emit(doc,null);}
		   ,reduce: false}
        ,role: { map : function(doc) {
	    if (doc.type === 'role') emit(doc,null);}
		 ,reduce: false}
        ,uiState: { map : function(doc) {
	    if (doc.type === 'uiState') emit(doc,null);}
		    ,reduce: false}
    };
    // database.setViews(views);
        
    var genericFields = {
        type: { type: 'text', required: true}
        ,_id: { primaryKey: true }
        ,_rev: { type: 'text'}
        ,inheritable: { type: 'boolean' }
        ,inheritingFrom: { type: 'list'}
    };
        
    var personPickList = {name: "person",// type: "select",
                          // editorType: 'comboBox',
                              // title: 'person',
                          // change: function (form, item, value) {
                          //     var personList = eventForm.getField('person').pickList.getSelectedRecords();
                          //     // var personList = personPickList.getSelectedRecords();
                          //     console.log('PICKLIST', personList);
                          //     displayPerson = [];
                          //     // var person = []; 
                          //     personList.forEach(function(p) {
                          //         displayPerson.push(p.name);
                          //         // person.push(p._id);
                          //     });
                          //     console.log('PICKLIST', displayPerson);
                          //     if (displayPerson.length === 0) displayPerson = ['Nobody'];
                          //     console.log(form, item, value);
                          // },
                          type: 'enum',
                          showTitle: true,
                          // required: true, 
                          // startRow: true,
                          multiple: true,
                          multipleAppearance: 'picklist',
                          // optionDataSource: dataSource,
                          // filterLocally: true, 
                          pickListCriteria: { type: 'person'},
                          // filterEditorProperties: { displayField: 'name' },
                          // displayField: 'name',
                          valueField: '_id',
                          canEdit: false
                          // width:340,
                          // colSpan:2,
                          // click: function() {
                          //     setPickList(personField,
                          //                 this.form.getValues().person);
                          //     return true;},
                          // icons: [{
                          //     src: isc.Page.getSkinDir() +"images/actions/edit.png",
                          //     click: "isc.say(item.helpText)"
                          //     //TODO: make drag drop shift worker editor
                          // }]
                         };
        
    var typeFields = {
        startDate: {  type: "datetime"}
        ,endDate: {  type: "datetime"}
        // ,person: { type: 'list'}
        ,person: personPickList
        ,location: { type: "text"} 
        ,description: { type: "text", length: 500}
        ,notes: { type: "text", length: 500}
        ,ad: { title: 'All day', type: 'boolean'} //allday
        // ,claim: { type: 'text'} 
        ,claim:  {type: "select", defaultValue: 'Normal shift',
                  valueMap: ['Normal shift', 'Sick leave', 'Annual leave',
                             'Long service leave', 'Other leave', 'Away from base',
                             'Admin', 'Disturbed sleep', 'Event'] 
                  //TODO: implement 'event'. Change form when this is selected to somethin
                  //appropriate for an event 
                 }
        ,sleepOver: { type: 'boolean'}
        ,name: { type: 'text', title: 'Name'} //should be unique within its type..
        ,address: { type: 'text'}
        ,suburb: { type: 'text'}
        ,state: {detail: true, type: 'text'}
        ,phone: { type: 'text'}
        ,mob: { type: 'text'}
        ,email: { type: 'text'}
        ,postalCode: { type: 'text'}
        ,region: { type: 'text'}
        ,firstName: { type: 'text'}
        ,lastName: { type: 'text'}
        // ,shortName: { title: 'Short Name', type: 'text'}
        ,sex: { type: 'text'}
        ,award: { type: 'text'}
        ,login: { type: 'text'}
        ,autoLogin: { type: 'text'}
        ,password: { type: 'text'}
        ,role: { type: 'text'}
        ,permissions: { type: 'text', group: 'role'}
    };
        
    var types = {
        shift: ['name', 'startDate', 'endDate', 'person', 'location', 'description', 'notes', 'ad', 'claim', 'sleepOver'],
        location: ['name', 'address', 'suburb','postalCode', 'state', 'phone', 'mob', 'email', 'region'],
        person: ['name', 'firstName', 'lastName',
                 'address', 'suburb','postalCode', 'state', 'phone', 'mob', 'email', 'region'],
        role: ['permissions']
    };
        
    var fields = isc.addProperties({}, genericFields, typeFields);
        
    fields.type.valueMap = allTypes;   
        
    var genericFieldsArray = (function() {
        var array = [];
        for (var f in genericFields) {
            var field = genericFields[f];
            field.name = f;
            array.push(field);
        }
        return array;
    })();

    var fieldsArray = (function() {
            var array = [];
        for (var f in fields) {
            var field = fields[f];
            field.name = f;
            array.push(field);
        }
        return array;
    })();
        
    var allTypes = (function () {
        var array = [];
        for (var t in types) array.push(t);
        return array;
    })();
    
    function fieldsCloner(someTypes, asObject) {
        if (typeof someTypes === 'string'){
            someTypes = [ someTypes ];
        }
        var result = []; 
        var obj = {};
        someTypes.forEach(function(t) {
            if (types[t]) {
                types[t].forEach(function(fieldName) {
                    var field = typeFields[fieldName];
                    if (field && !result.containsProperty('name', fieldName)) {
                        field.name = fieldName;
                        if (!field.title)
                            field.title = isc.DataSource.getAutoTitle(field.name); 
                        result.push(field);
                        obj[fieldName] = field;
                    }  
                });
            }
               
        });
        result = genericFieldsArray.concat(result); 
        obj = isc.addProperties(genericFields, obj);
        // if (someTypes.length > 1) {
        //     result.push({name:'group', type:'text', title:'Group'});
        // }
        return function () {
            return isc.clone( asObject ? obj : result);
            // if (!asObject) return isc.clone(result);
            // return isc.clone(obj);
        };
    }

        
    var initializer = {
        shift: function(record) {
            var date =  new Date();
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            var endDate = new Date(date);
            var startDate = new Date(date);
            endDate.setMinutes(30);
            var event = {
                startDate: startDate,
                endDate: endDate,
                date: date,
                endTime : isc.Time.createLogicalTime(endDate.getHours(),
                                                     endDate.getMinutes(),0),
                startTime : isc.Time.createLogicalTime(startDate.getHours(),
                                                       startDate.getMinutes(),0),
                name : '-' + isc.Time.toTime(endDate, 'toShortPaddedTime', true)
            };
            isc.addDefaults(record, event);
        }
    };
        
    var newRecord = function(aType) {
        var record = {};
        record.type = aType;
        if (initializer[aType]) initializer[aType](record);
        return record;
    };
        
    // //TODO: messy...
    // database.setGetField(function(fieldName) {
    //   return fields[fieldName];  
    // });
        
    typesAndFields = {
        views: views,
        allTypes: allTypes,
        allFields: isc.clone(fieldsArray),
        getField: function(fieldName) {
            return fields[fieldName];
        },
        getFieldsCloner: fieldsCloner,
            newRecord: newRecord,
        setDataSource: function(ds) {
            dataSource = ds;
        }
    };
        
    return typesAndFields; 
}});



