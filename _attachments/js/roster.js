define
({factory: function() {
    
    var roster = Object.create(null);
    
    // var rootUser = {
    //   _id:'root',
    //   // name: 'super-admin',
    //   group: 'people',
    //   login: 'root',
    //   autoLogin: false,
    //   password:'1511e358bea6f50b2ddb2ca19c6422e871a0086f',
    //   permissions: {
	
    //   }
    // // };
    
    var guestUser = {
        _id:'guest',
        // name: 'super-admin',
        group: 'people',
        login: 'guest',
        autoLogin: true,
        password:'guest',
        role: 'admin'
    };
    
    var tagArray = [
        {name:"_id", primaryKey:true}
        ,{name:"_rev"}
      
        ,{name:"group", type: 'text' } //shift, location, person, role
        //shift 
        ,{name:"endDate", type: "datetime", group: 'shift'}
        ,{name:"startDate", type: "datetime", group: 'shift'}
        ,{name:"person", type: 'ref', group: 'shift'} //ref to person obj ,,,change to person..
        ,{name:"location", group: 'shift'} //ref to loc object,,, change to location
        ,{name:"notes", group: 'shift'}//,,, change to notes
        ,{name:"ad", type: 'boolean', group: 'shift'} //allday
        ,{name:"annualLeave", type: 'boolean', group: 'shift'}
        ,{name:"sickLeave", type: 'boolean', group: 'shift'}
        ,{name:"longServiceLeave", type: 'boolean', group: 'shift'}
        ,{name:"otherLeave", type: 'boolean', group: 'shift'}
        ,{name:"sleepOver", type: 'boolean', group: 'shift'}
        ,{name:"awayFromBase", type: 'boolean', group: 'shift'}
        ,{name:"adminHours", type: 'float', group: 'shift'}
        ,{name:"disturbedSleep", type: 'float', group: 'shift'}
        
        // location
        ,{name:"name", type: 'text', group: ['location', 'person']}
        ,{name:"address", type: 'text', group: ['location', 'person']}
        ,{name:"suburb", type: 'text', group: ['location', 'person']}
        ,{name:"state",detail: true, type: 'text', group: ['location', 'person']}
        ,{name:"phone", type: 'text', group: ['location', 'person']}
        
        
        //person 
        ,{name:"firstName", type: 'text', group: 'person'}
        ,{name:"lastName", type: 'text', group: 'person'}
        ,{name:"sex", type: 'text', group: 'person'}
        ,{name:"award", type: 'text', group: 'person'}
        ,{name:"login", type: 'text', group: ['user','person']}
        ,{name:"autoLogin", type: 'text', group: ['user','person']}
        ,{name:"password", type: 'text', group: ['user','person']}
        ,{name:"role", type: 'text', group: ['user','person']}
        
        //role 
        ,{name:"name", type: 'text', group: 'role'}
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
        if (tagGroups[group].containsProperty('name', tag.name)) console.log('ERROR: double tag', tag.name);
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
    
    function setDb(db) {
        roster.db = db; 
    }
    
    function setUser(user) {
        roster.user = user;
        // roster.permissions = user.permissions;
    }
    
    
    function getTags(groups) {
       var result = []; 
        // console.log(groups);
        if (groups.length > 1) {
            result.push({name:'group', type:'text', title:'Group'});
        }
        tagArray.forEach(function(t){
            if (t.group) {
                if (typeof t.group === 'string') {
                    if (groups.contains(t.group) && !result.containsProperty('name', t.name)) result.push(t);
                } 
                else if (isc.isA.Array(t.group)) {
                 t.group.forEach(function(g) {
                    if (groups.contains(g) && !result.containsProperty('name', t.name)) result.push(t);
                 });  
                }
        }});
        return function () {
            return isc.shallowClone(result);
        };
        // return result;
    }
    
    roster = {
        user:guestUser, 
        groups: (function () {
            var groups = [];
            for (var e in tagGroups) groups.push(e);
            return groups;
        })(),
        // tagGroups: tagGroups,
        getTags: getTags,
        setDb: setDb,
        setUser: setUser,
        tagArray: isc.shallowClone(tagArray),
        tags: tags,
        guestUser: guestUser,
        dbname: 'idb://rosterdb'
    };
    return roster; 
}});
