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



       // var tagArray = [
       //         {name:"_id", primaryKey:true}
       //     ,{name:"_rev"}
       //     // ,groupField
       //     //shift 
       //     // ,{ title: "blabla", name:"newcolumn", required: true, type: "datetime", group: 'shift'}
       //     ,{name:"startDate", title: "blabla", required: true, type: "datetime", group: 'shift'}
       //     // ,{name:"startTime", required: true, type: "time", group: 'shift'}
       //     ,{name:"endDate", required: true, type: "datetime", group: 'shift'}
       //     // ,{name:"endTime", required: true, type: "time", group: 'shift'}
       //     ,{name:"person",  title: "blablabal",type: 'list', group: 'shift'}
       //     ,{name:"location", group: 'shift'} 
       //     ,{name:"notes", group: ['location', 'person', 'shift', 'role']}//,,, change to notes
       //     ,{name:"inheritable", group: ['location', 'person', 'shift', 'role']}//,,, change to notes
            
       //     ,{name:"parents", type: 'list', group: ['location', 'person', 'shift', 'role']}//,,, change to notes
       //     ,{name:"ad", type: 'boolean', group: 'shift'} //allday
       //     ,{name:"claim", type: 'text', group: 'shift'} 
       //     ,{name:"sleepOver", type: 'boolean', group: 'shift'}
            
        
       //     // location
       //     ,{name:"name", type: 'text', group: ['location', 'role']}
       //     ,{name:"shortName", title: 'blabla', type: 'text', group: ['location', 'person']}
       //     ,{name:"address", type: 'text', group: ['location', 'person']}
       //     ,{name:"suburb", type: 'text', group: ['location', 'person']}
       //     ,{name:"state",detail: true, type: 'text', group: ['location', 'person']}
       //     ,{name:"phone", type: 'text', group: ['location', 'person']}
       //     ,{name:"mobPhone", type: 'text', group: ['location', 'person']}
       //     ,{name:"email", type: 'text', group: ['location', 'person']}
       //     ,{name:"postalCode", type: 'text', group: ['location', 'person']}
       //     ,{name:"region", type: 'text', group: ['location' ]}
        
        
       //     //person 
       //     ,{name:"firstName", type: 'text', group: 'person'}
       //     ,{name:"lastName", type: 'text', group: 'person'}
       //     ,{name:"sex", type: 'text', group: 'person'}
       //     ,{name:"award", type: 'text', group: 'person'}
       //     ,{name:"login", type: 'text', group: ['person']}
       //     ,{name:"autoLogin", type: 'text', group: ['person']}
       //     ,{name:"password", type: 'text', group: ['person']}
       //     ,{name:"role", type: 'text', group: ['person']}
        
       //     //role 
       //     ,{name:"permissions", type: 'text', group: 'role'}
        
       //     //needed for recurrence
       //     // ,{name:"rrule", group: ['shift']}
       //     // ,{name:"duration", group: ['shift']}
       //     // treeGrids:
       //     // ,{name:"treeParent", foreignKey: pouchDS._id', group: []}
       //     // ,{name:"viewName", group: []}
       //     // these props need not be persistent, see extensible's Eventmappings.js
       //     // ,{name:"origid"}
       //     // ,{name:"ristart"},
       //     // ,{name:"redit"}
       //     // obsolete
       //     // {name:"eventId", primaryKey: true, type: "sequence"},
       //     // ,{name:"cid"} //mapped to name in EventMappings
       //     // ,{name:"notes"} // mapped to description in EventMappings
       //     // ,{name:"start"} // mapped to startDate in EventMappings
       //     // ,{name:"end"}// mapped to endDate in EventMappings
       // ];
    
       // var tags = {};
       // var tagGroups = {};
       // function addTagToGroup(tag, group) {
       //     if (!tagGroups[group]) tagGroups[group] = [];
       //     if (tagGroups[group].containsProperty('name', tag.name))
       //         console.log('ERROR: double tag', tag.name);
       //     else tagGroups[group].push(tag);
       // }
    
       // tagArray.forEach(
       //     function(t) {
       //         t.title = isc.DataSource.getAutoTitle(t.name); 
       //         tags[t.name] = t;	
       //         if (t.group) {
       //             if (typeof t.group === 'string') {
       //                 addTagToGroup(t, t.group); 
       //             } 
       //             else if (isc.isA.Array(t.group)) {
       //                 t.group.forEach(function(g) {
       //                     addTagToGroup(t, g); 
       //                 });  
       //             }
       //             else console.log('ERROR: group prop is neither a string or array');
       //         }
       //     });
    

        // function getTagsCloner(groups) {
        //     var result = []; 
        //     // console.log(groups);
        //     if (groups.length > 1) {
        //         result.push({name:'group', type:'text', title:'Group'});
        //     }
        //     tagArray.forEach(function(t){
        //         if (t.group) {
        //             if (typeof t.group === 'string') {
        //                 if (groups.contains(t.group) &&
        //                     !result.containsProperty('name', t.name)) result.push(t);
        //             } 
        //             else if (isc.isA.Array(t.group)) {
        //                 t.group.forEach(function(g) {
        //                     if (groups.contains(g) &&
        //                         !result.containsProperty('name', t.name)) result.push(t);
        //                 });  
        //             }
        //         }});
        //     return function () {
        //         return isc.shallowClone(result);
        //     };
        //     // return result;
        // }
