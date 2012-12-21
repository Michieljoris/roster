/*global isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({ 
    factory: function() {
        "use strict";
        var typesAndFields = {};
       
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
        
        var genericFields = {
            type: { type: 'text', required: true}
            ,_id: { primaryKey: true }
            ,_rev: { type: 'text'}
            ,inheritable: { type: 'boolean' }
            ,inheritingFrom: { type: 'list'}
        };
        
        
        var typeFields = {
            startDate: {  type: "datetime"}
            ,endDate: {  type: "datetime"}
            ,person: { type: 'list'}
            ,location: { type: "text"} 
            ,description: { type: "text", length: 500}
            ,notes: { type: "text", length: 500}
            ,ad: { title: 'All day', type: 'boolean'} //allday
            ,claim: { type: 'text'} 
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
    
        function fieldsCloner(someTypes) {
            if (typeof someTypes === 'string'){
                someTypes = [ someTypes ];
            }
            var result = []; 
            someTypes.forEach(function(t) {
                if (types[t]) {
                    types[t].forEach(function(fieldName) {
                        var field = typeFields[fieldName];
                        if (field && !result.containsProperty('name', fieldName)) {
                            field.name = fieldName;
                            if (!field.title)
                                field.title = isc.DataSource.getAutoTitle(field.name); 
                            result.push(field);
                        }  
                    });
                }
               
            });
            result = genericFieldsArray.concat(result);
            
            // if (someTypes.length > 1) {
            //     result.push({name:'group', type:'text', title:'Group'});
            // }
            return function () {
                return result;
                // return isc.clone(result);
            };
        }
        
        typesAndFields = {
            views: views,
            allTypes: allTypes,
            allFields: isc.clone(fieldsArray),
            getField: function(fieldName) {
                return fields[fieldName];
            },
            getFieldsCloner: fieldsCloner
           
            // tagArray: isc.shallowClone(tagArray),
            // tags: tags
            // dbname: window.dbname
            // tagGroups: tagGroups,
        };
        return typesAndFields; 
    }});



