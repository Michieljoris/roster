//hello
/*global logger:false Pouch:false define:false VOW:false*/
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
        inject: ['lib/cookie', 'loaders/backend', 'user', 'layout', 'View', 'Editor'], 
        factory: function(cookie, backend, user, layout, View, Editor) 
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
                  var msg = 'There is no backend ' + 'named:' + backendName +
                      '.\nAlert the developer!';
                  log.d(msg);
                  cookie.rm('backendName').when(
                      function() {
                          vow['break']( msg + 
                                        '\nRefresh the browser (f5), choose a different backend');
                      },
                      function() {
                          vow['break'](msg + "\nCan't erase the backend cookie!!!" +
                                       ' \nMaybe ask your browser to delete all cookies' +
                                       ' and then refresh (f5)!'); 
                      }
                  );
              }             
              return vow.promise;
          }
          
          //##pickBackend
          /**Pick a backend from a list, and set the cookie
           * to the choice made.
           */
          function pickBackend(vow) {
              backend.pick(function(aBackend, name, url){
                  // var name = aBackend.name;
                  vow.keep(aBackend);
                  VOW.every([
                      cookie.set('backendName', name, 3650)
                      ,cookie.set('backendUrl', url, 3650)]
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
              cookie.get('backendName').when(
                  function(backendName) {
                      
                      setBackend(vow, backendName);   
                  }
                  ,function() {
                      pickBackend(vow);
                  });
              return vow.promise;
          }
          
          
          //##initDatabase
          /** Try to get the database url cooke and initialize the
           * database with it.
             */
          function initBackend(aBackend){
              var vow = VOW.make();
              cookie.get('backendUrl').when(
                  function(url) {
                      aBackend.init(vow, url);
                  }
                  ,function() {
                      var msg = 'There is no backend url cookie';
                      log.d(msg);
                      cookie.rm('backendName').when(
                          function() {
                              vow['break'](
                                  msg + '\nRefresh the browser (f5), choose a backend and url');
                          },
                          function() {
                              vow['break'](msg + "\nCan't erase the backend cookie!!!" +
                                           ' \nMaybe ask your browser to delete all cookies' +
                                           ' and then refresh (f5)!'); 
                          }
                      );
                  });
              return vow.promise;
          }
          
          //##start
          /** This kicks off the app
           */
          function start() {
              getBackend().when(
                  initBackend
              ).when(
                  function(backend)  {
                      View.setBackend(backend); 
                      Editor.setBackend(backend);
                      return backend.login();   
                  }
              ).when(
                  user.init
             ).when(
                  //Give some feedback
                  function() {
                      log.d('Drawing app.');
                      // layout.draw();
                      try { layout.draw(); } catch(e) {
                          console.error(e.stack); }
                      
                  },
                  function(err) {
                      console.log('Failed setting up app..', err.stack);
                  }
              );
              
          }
          
          window.reset = function() {
              cookie.rm('backendName');
              cookie.rm('backendUrl');
              cookie.rm('lastLogin');
          };
          
          //Let's do it then!!
          start();
      
        }});


