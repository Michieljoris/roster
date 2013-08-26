/*global logger:false Cookie:false define:false VOW:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

//The js file that kicks off the app. It sets up the database, decides
//on a user and finally calls draw from layout.js to show the app.

//Changing database backend is as easy as wiping the doc with id
//DataSource in the puch db with name pouchdb. Then refresh the
//browser and it will ask for the backend to use. There is no
//restrictions on this.

//When a user's setup gets confused or mucked up, wipe his settings
//doc. Their setup will revert to default
//To do this for everybody, wipe all docs with type 'settings'


define(
    {   
        inject: ['loaders/backend', 'user', 'layout', 'View', 'Editor', 'authWindow'], 
        factory: function(backend, user, layout, View, Editor, authWindow) 
        { "use strict";
          var log = logger('main');
          
          //Are we alive? 
          log.d('Starting up app...');
          
      
          //##Startup logic.  We try to get the cookie with info on
          //the database last used. If present we set up the app with
          //the appropriate database adapter. If absent we let the
          //user pick a database adapter. We then initialize this
          //database. Same story for the user, first try a cookie,
          //then show a login dialog. Finally we call layout.draw to
          //display the app.

          //##setDatabase
          /** Promises to set the database backend. To change
              database delete the cookie's database value*/
          function setBackend(vow, backendName) {
              if (backend.exists(backendName)) vow.keep(backend.set(backendName));
              else  {
                  backendName = 'pouchDB';
                  Cookie.set('backendName', backendName, Date.today().addYears(10));
                  vow.keep(backend.set(backendName));
                  // var msg = 'There is no backend ' + 'named:' + backendName +
                  //     '.\nAlert the developer!';
                  // log.d(msg);
                  // Cookie.remove('backendName').when(
                  //     function() {
                  //         vow['break']( msg + 
                  //                       '\nRefresh the browser (f5), choose a different backend');
                  //     },
                  //     function() {
                  //         vow['break'](msg + "\nCan't erase the backend cookie!!!" +
                  //                      ' \nMaybe ask your browser to delete all cookies' +
                  //                      ' and then refresh (f5)!'); 
                  //     }
                  // );
              }             
              return vow.promise;
          }
          
                  //got rid of db dialog, leaving the code in here for
                  //now, but not being used: the backend pick function
                  //now always calls the callback with the parameters
                  //pouchDB and db
          //##pickBackend
          /**Pick a backend from a list, and set the cookie
           * to the choice made.
           */
          function pickBackend(vow) {
              console.log('picking backend');
              backend.pick(function(aBackend, name, url){
                  vow.keep(aBackend);
                  VOW.every([
                      Cookie.set('backendName', name, Date.today().addYears(10))
                      ,Cookie.set('backendUrl', url, Date.today().addYears(10))]
                           ).when(
                               function() { log.d('Saved backend cookie.'); }
                               ,function() { log.e('Unable to set the backend or url cookie!!'); }
                           );
              });
              
          }
          
          //##getBackend
          /**Gets the cookie, and then either sets or lets the user
           * pick a backend, depending on whether the cookie was
           * existant
           */
          function getBackend(){
              var vow = VOW.make();
              Cookie.get('backendName').when(
                  function(backendName) {
                      setBackend(vow, backendName);   
                  }
                  ,function() {
                      var backendName = 'pouchDB';
                      Cookie.set('backendName', backendName, Date.today().addYears(10)).when(
                               function() { log.d('Saved backend name cookie.'); }
                               ,function() { log.e('Unable to set the backend name cookie!!'); }
                           );
                      setBackend(vow, backendName);   
                      // pickBackend(vow);
                  });
              return vow.promise;
          }
          
          
          //##initDatabase
          /** Try to get the database url cookie and initialize the
           * database with it.
           */
          function initBackend(aBackend){
              var vow = VOW.make();
              Cookie.get('backendUrl').when(
                  function(url) {
                      aBackend.init(vow, url);
                  }
                  ,function() {
                      var msg = 'There is no backend url cookie';
                      log.d(msg);
                      //set default url to internal database
                      var url = 'db';
                      Cookie.set('backendUrl', url, Date.today().addYears(10)).when(
                               function() { log.d('Saved backend url cookie.'); }
                               ,function() { log.e('Unable to set the backend url cookie!!'); }
                           );
                      aBackend.init(vow, url);
                      // Cookie.remove('backendName').when(
                      //     function() {
                      //         vow['break'](
                      //             msg + '\nRefresh the browser (f5), choose a backend and url');
                      //     },
                      //     function() {
                      //         vow['break'](msg + "\nCan't erase the backend cookie!!!" +
                      //                      ' \nMaybe ask your browser to delete all cookies' +
                      //                      ' and then refresh (f5)!'); 
                      //     }
                      // );
                  });
              return vow.promise;
          }
          
          //##start
          /** This kicks off the app
           */
          function start() {
              //>>reads cookie, defaults to pouchDB if cookie or backend doesn't exist
              //only one backend used at the moment: pouchDB
              getBackend().
                  when(
                      //>>looks for cookie, defaults to internal db
                      //give the backend an url to work with, and connect
                      initBackend).
                  when(
                      function(backend)  {
                          console.log('Connected with backend', backend);
                          View.setBackend(backend); 
                          Editor.setBackend(backend);
                          user.setBackend(backend);
                          // authWindow.setBackend(backend);
                          //>>looks for lastlogin cookie
                          //defaults to guest user if present or it can be
                          //created otherwise prompt
                          //in any case it returns a user doc from the backend
                          return backend.autoLogin();   
                      }).
                  when(
                  // //     //gets the user's settings file
                  // //     user.init).
                  // when(
                      function() {
                          //Draw the app 
                          log.d('Drawing app.');
                          try { layout.draw();
                                //hide startup messages
                                document.getElementById('appFail').style.display = 'none';
                                document.getElementById('statusUpdate').style.display = 'none';
                                //TODO do something for new users
                                log.d('-----------------------------------New database? ', backend.get().isNew());
                                if (backend.get().isNew()) {
                                    layout.setup();
                                }
                              } catch(e) {
                                  console.error(e.stack); }
                      
                      },
                      function(err) {
                          console.log('Failed setting up app....', err, ' ', err.stack);
                          alert('Failed setting up app....\n' + (err.error || '') + '\n ' +  (err.reason  || '') +
                                '\nClicking ok will refresh the page and load the default internal database'
                               );
                          reset();
                          location.reload();
                      }
                  );
              
          }
          
          window.reset = function() {
              Cookie.remove('backendName');
              Cookie.remove('backendUrl');
              Cookie.remove('lastLogin');
          };
          
          //Let's do it then!!
          start();
      
        }});


