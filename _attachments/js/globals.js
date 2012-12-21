/*global define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({ 
   factory: function() {
       "use strict";
       var roster = {};
    
       // var rootUser = {
       //   _id:'root',
       //   // name: 'super-admin',
       //   type: 'person',
       //   login: 'root',
       //   autoLogin: false,
       //   password:'1511e358bea6f50b2ddb2ca19c6422e871a0086f',
       //   permissions: {
	
       //   }
       // // };
    
       var guestUser = {
           _id:'guest',
           name: 'guest',
           type: 'person',
           login: 'guest',
           autoLogin: true,
           password:'guest',
           role: 'admin'
       };
       
       // dbname: 'http://127.0.0.1:2020/roster'
       function setDb(db) {
           roster.db = db; 
       }
    
       function setUser(user) {
           roster.user = user;
           // roster.permissions = user.permissions;
       }
    
       roster = {
           user:guestUser, 
           setDb: setDb,
           setUser: setUser,
           dbname: window.dbname
       };
       return roster; 
   }});
