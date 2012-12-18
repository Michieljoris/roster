/*global isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({ 
   factory: function() {
       "use strict";
       var roster = {};
       
       var views = {
           all: {   map : function(doc) { emit(doc,null); }
	            ,reduce: false}
           ,shift: { map : function(doc) {
	       if (doc.group === 'shift') emit(doc,null);}
		     ,reduce: false}
           ,location: { map : function(doc) {
	       if (doc.group === 'location') emit(doc,null);}
		        ,reduce: false}
          
           ,person: { map : function(doc) {
	       if (doc.group === 'person') emit(doc,null);}
		      ,reduce: false}
           ,role: { map : function(doc) {
	       if (doc.group === 'role') emit(doc,null);}
		    ,reduce: false}
           ,uiState: { map : function(doc) {
	       if (doc.group === 'uiState') emit(doc,null);}
		       ,reduce: false}
       };
       
       var fields = [
              {name:"startDate", title: "blabla", required: true, type: "datetime"}
               ,{name:"endDate", required: true, type: "datetime"}
               ,{name:"person",  title: "blablabal",type: 'list'}
               ,{name:"location", type: "text"} 
               ,{name:"notes", type: "text"}
               ,{name:"ad", title: 'All day', type: 'boolean'} //allday
               ,{name:"claim", type: 'text'} 
               ,{name:"sleepOver", type: 'boolean'}
               ,{name:"name", type: 'text'}
               ,{name:"address", type: 'text'}
               ,{name:"suburb", type: 'text'}
               ,{name:"state",detail: true, type: 'text'}
               ,{name:"phone", type: 'text'}
               ,{name:"mobPhone", type: 'text'}
               ,{name:"email", type: 'text'}
               ,{name:"postalCode", type: 'text'}
               ,{name:"region", type: 'text'}
               ,{name:"firstName", type: 'text'}
               ,{name:"lastName", type: 'text'}
               ,{name:"shortName", title: 'blabla', type: 'text'}
               ,{name:"sex", type: 'text'}
               ,{name:"award", type: 'text'}
               ,{name:"login", type: 'text'}
               ,{name:"autoLogin", type: 'text'}
               ,{name:"password", type: 'text'}
               ,{name:"role", type: 'text'}
               ,{name:"permissions", type: 'text', group: 'role'}
           ];
       
       var types = {
           shift: ['startDate', 'endDate', 'person', 'location', 'notes', 'ad', 'claim', 'sleepOver'],
           location: [],
           person: [],
           role: []
       };
       
       //shift, location, person, role
       var groupField =
               {title: 'Group', name:"group", required: true,
                type: 'text' };
       
               // ,{name:"inheritable", group: ['location', 'person', 'shift', 'role']}//,,, change to notes
       
               // ,{name:"parents", type: 'list', group: ['location', 'person', 'shift', 'role']}//,,, change to notes
       
    
       var tagArray = [
               {name:"_id", primaryKey:true}
           ,{name:"_rev"}
           ,groupField
           //shift 
           // ,{ title: "blabla", name:"newcolumn", required: true, type: "datetime", group: 'shift'}
           ,{name:"startDate", title: "blabla", required: true, type: "datetime", group: 'shift'}
           // ,{name:"startTime", required: true, type: "time", group: 'shift'}
           ,{name:"endDate", required: true, type: "datetime", group: 'shift'}
           // ,{name:"endTime", required: true, type: "time", group: 'shift'}
           ,{name:"person",  title: "blablabal",type: 'list', group: 'shift'}
           ,{name:"location", group: 'shift'} 
           ,{name:"notes", group: ['location', 'person', 'shift', 'role']}//,,, change to notes
           ,{name:"inheritable", group: ['location', 'person', 'shift', 'role']}//,,, change to notes
            
           ,{name:"parents", type: 'list', group: ['location', 'person', 'shift', 'role']}//,,, change to notes
           ,{name:"ad", type: 'boolean', group: 'shift'} //allday
           ,{name:"claim", type: 'text', group: 'shift'} 
           ,{name:"sleepOver", type: 'boolean', group: 'shift'}
            
        
           // location
           ,{name:"name", type: 'text', group: ['location', 'role']}
           ,{name:"shortName", title: 'blabla', type: 'text', group: ['location', 'person']}
           ,{name:"address", type: 'text', group: ['location', 'person']}
           ,{name:"suburb", type: 'text', group: ['location', 'person']}
           ,{name:"state",detail: true, type: 'text', group: ['location', 'person']}
           ,{name:"phone", type: 'text', group: ['location', 'person']}
           ,{name:"mobPhone", type: 'text', group: ['location', 'person']}
           ,{name:"email", type: 'text', group: ['location', 'person']}
           ,{name:"postalCode", type: 'text', group: ['location', 'person']}
           ,{name:"region", type: 'text', group: ['location' ]}
        
        
           //person 
           ,{name:"firstName", type: 'text', group: 'person'}
           ,{name:"lastName", type: 'text', group: 'person'}
           ,{name:"sex", type: 'text', group: 'person'}
           ,{name:"award", type: 'text', group: 'person'}
           ,{name:"login", type: 'text', group: ['person']}
           ,{name:"autoLogin", type: 'text', group: ['person']}
           ,{name:"password", type: 'text', group: ['person']}
           ,{name:"role", type: 'text', group: ['person']}
        
           //role 
           ,{name:"permissions", type: 'text', group: 'role'}
        
           //needed for recurrence
           // ,{name:"rrule", group: ['shift']}
           // ,{name:"duration", group: ['shift']}
           // treeGrids:
           // ,{name:"treeParent", foreignKey: pouchDS._id', group: []}
           // ,{name:"viewName", group: []}
           // these props need not be persistent, see extensible's Eventmappings.js
           // ,{name:"origid"}
           // ,{name:"ristart"},
           // ,{name:"redit"}
           // obsolete
           // {name:"eventId", primaryKey: true, type: "sequence"},
           // ,{name:"cid"} //mapped to name in EventMappings
           // ,{name:"notes"} // mapped to description in EventMappings
           // ,{name:"start"} // mapped to startDate in EventMappings
           // ,{name:"end"}// mapped to endDate in EventMappings
       ];
    
       var tags = {};
       var tagGroups = {};
       function addTagToGroup(tag, group) {
           if (!tagGroups[group]) tagGroups[group] = [];
           if (tagGroups[group].containsProperty('name', tag.name))
               console.log('ERROR: double tag', tag.name);
           else tagGroups[group].push(tag);
       }
    
       tagArray.forEach(
           function(t) {
               t.title = isc.DataSource.getAutoTitle(t.name); 
	       tags[t.name] = t;	
               if (t.group) {
                   if (typeof t.group === 'string') {
                       addTagToGroup(t, t.group); 
                   } 
                   else if (isc.isA.Array(t.group)) {
                       t.group.forEach(function(g) {
                           addTagToGroup(t, g); 
                       });  
                   }
                   else console.log('ERROR: group prop is neither a string or array');
               }
           });
    
    
       function getTagsCloner(groups) {
           var result = []; 
           // console.log(groups);
           if (groups.length > 1) {
               result.push({name:'group', type:'text', title:'Group'});
           }
           tagArray.forEach(function(t){
               if (t.group) {
                   if (typeof t.group === 'string') {
                       if (groups.contains(t.group) &&
                           !result.containsProperty('name', t.name)) result.push(t);
                   } 
                   else if (isc.isA.Array(t.group)) {
                       t.group.forEach(function(g) {
                           if (groups.contains(g) &&
                               !result.containsProperty('name', t.name)) result.push(t);
                       });  
                   }
               }});
           return function () {
               return isc.shallowClone(result);
           };
           // return result;
       }
        
       var groups = (function () {
           var groups = [];
           for (var e in tagGroups) groups.push(e);
           return groups;
       })();
        
       groupField.valueMap = groups;   
        
        
    
       roster = {
           views: views,
           groups:groups,
           getTagsCloner: getTagsCloner,
           tagArray: isc.shallowClone(tagArray),
           tags: tags,
           dbname: window.dbname
           // tagGroups: tagGroups,
       };
       return roster; 
   }});
