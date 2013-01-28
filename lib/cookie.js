/*global logger:false Pouch:false define:false VOW:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

//#cookie
/**
   This can be implemented how we like. We can use pouchdb if
   available, or local storage, or just a plain cookie. It returns
   promises so that we can change from an async implementation to a
   sync one easily.
 */
define(
    { //inject: [''], 
      factory: function() 
        { "use strict";
          var log = logger('cookie');
	  log.d('Executing cookie');
	
          // var cookie;
          // var cookieId = 'cookie';
          // cookie = (function() {
          //     var c = { _id: 'cookie' };
          //     function save() {
          //         return db.get().putDoc(c);
          //     }
          //     function setDatabase(name) {
          //         c.database = name;
          //         return save();
          //     }
          //     function setLastLogin(id) {
          //         c.lastLogin = id;
          //         return save();
          //     }
          // })();
          
          
          // //##getPouchdbHandle
          // /** Get a promise of the pouchdb handle
          //  */
          // function getPouchdbHandle(){
          //     var vow = VOW.make();
          //     Pouch(idbName, function(err, pouchHandle) {
	  //         if (!err) vow.keep(pouchHandle);
          //         else { var msg = "Error opening idb database" + idbName +
	  //       	 "err: "+ err.error + ' reason:' + err.reason;
          //                vow['break'](msg);
	  //              }
          //     });
          //     return vow.promise;
          // }
          
          
          // //##saveDbName
	  // /** Save the name of the database backend to the local
          //   pouchdb. This is a async operation, so it needs the vow
          //   object to report its results. If succesfull it will keep
          //   the vow's promise with the db it got passed in.
          //  */
          // function saveCookie(pouchHandle, vow, doc, db){
          //     pouchHandle.put(doc,
          //                     function(err, response) {
	  //                         if (!err) {
          //                             doc._id = response.id;
          //                             vow.keep(db);   
          //                         }
          //                         else { var msg = 'Error saving' + doc.name + ' to ' +
          //                                idbName + " err: "+ err.error + ' reason:' +
          //                                err.reason;
          //                                vow['break'](msg);
	  //                              }
          //                     });
          // } 
          
          
          function createCookie(name,value,days) {
              var expires,date;
	      if (days) {
		  date = new Date();
		  date.setTime(date.getTime()+(days*24*60*60*1000));
		  expires = "; expires="+date.toGMTString();
	      }
	      else expires = "";
	      document.cookie = name+"="+value+expires+"; path=/";
              return VOW.kept();
          }

          function readCookie(name) {
              log.d('reading cookie', name);
	      var nameEQ = name + "=";
	      var ca = document.cookie.split(';');
              for(var i=0;i < ca.length;i++) {
	          var c = ca[i];
	          while (c.charAt(0)===' ') c = c.substring(1,c.length);
	          if (c.indexOf(nameEQ) === 0)
                       return VOW.kept(c.substring(nameEQ.length,c.length));
              }
	      return VOW.broken('Can not find cookie:' + name);
          }

          function eraseCookie(name) {
	      return VOW.kept(createCookie(name,"",-1));
          }
          
          return {
              set: createCookie,
              get: readCookie,
              rm: eraseCookie
          };
	
        }});

