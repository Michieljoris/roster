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
      permissions: {
	
      }
      // ,viewTreeStateDocId: 'defaultViewTreeStateDoc'
    };
    
    var tagArray = [
      {name:"_id", primaryKey:true}
      ,{name:"_rev"}
      
      ,{name:"endDate", type: "datetime", group: ['shift']}
      ,{name:"startDate", type: "datetime", group: ['shift']}
      ,{name:"person", type: 'ref', group: ['shift']} //ref to person obj ,,,change to person..
      ,{name:"group"} //shift, location, person, role
      ,{name:"location", group: ['shift']} //ref to loc object,,, change to location
      // ,{name:"notes", group: ['shift']}//,,, change to notes
      // ,{name:"ad", type: 'boolean', group: ['shift']}
      // ,{name:"annualLeave", type: 'boolean', group: ['shift']}
      // ,{name:"sickLeave", type: 'boolean', group: ['shift']}
      // ,{name:"longServiceLeave", type: 'boolean', group: ['shift']}
      // ,{name:"otherLeave", type: 'boolean', group: ['shift']}
      // ,{name:"sleepOver", type: 'boolean', group: ['shift']}
      // ,{name:"awayFromBase", type: 'boolean', group: ['shift']}
      // ,{name:"adminHours", type: 'float', group: ['shift']}
      // ,{name:"disturbedSleep", type: 'float', group: ['shift']}
      // //needed for recurrence
      // ,{name:"rrule", group: ['shift']}
      // ,{name:"duration", group: ['shift']}
      //treeGrids:
      // ,{name:"treeParent", foreignKey: pouchDS._id', group: []}
      // ,{name:"viewName", group: []}
      //these props need not be persistent, see extensible's Eventmappings.js
      // ,{name:"origid"}
      // ,{name:"ristart"},
      // ,{name:"redit"}
      //obsolete
      // {name:"eventId", primaryKey: true, type: "sequence"},
      // ,{name:"cid"} //mapped to name in EventMappings
      // ,{name:"notes"} // mapped to description in EventMappings
      // ,{name:"start"} // mapped to startDate in EventMappings
      // ,{name:"end"}// mapped to endDate in EventMappings
    ];
    var tags = {};
    tagArray.forEach(
      function(t) {
	tags[t.name] = t;	
      });
      
    // function setViewStateDoc(viewStateDoc) {
    //   roster.viewStateDoc = viewStateDoc;
    // }
    
    function setDb(db) {
      roster.db = db; 
    }
    
    function setUser(user) {
      roster.user = user;
      roster.permissions = user.permissions;
    }
    
    roster = {
      user:guestUser,
      setDb: setDb,
      // saveViewTreeState: saveViewTreeState,
      setUser: setUser,
      tagArray: tagArray,
      tags: tags,
      // rootUser: rootUser,
      guestUser: guestUser,
      dbname: 'idb://rosterdb'
    };
    return roster; 
  }});
