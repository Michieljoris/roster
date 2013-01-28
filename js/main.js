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
        inject: ['lib/cookie', 'databases/db', 'user', 'layout'], 
        factory: function(cookie, db, user, layout) 
        { "use strict";
          var log = logger('main');
          log.d('Evaluating main..');
          
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
          function setDatabase(vow, dbName) {
              if (db.exists(dbName)) vow.keep(db.set(dbName));
              else  {
                  var msg = 'There is no database adapter' + 'named:' + dbName +
                      '.\nAlert the developer!';
                  log.d(msg);
                  cookie.rm('database').when(
                      function() {
                          vow['break']( msg + 
                                        '\nRefresh the browser (f5), choose a different database');
                      },
                      function() {
                          vow['break'](msg + "\nCan't erase the database cookie!!!" +
                                       ' \nMaybe ask your browser to delete all cookies' +
                                       ' and then refresh (f5)!'); 
                      }
                  );
              }             
              return vow.promise;
          }
          
          //##pickDatabase
          /**Pick a database backend from a list, and set the cookie
           * to the choice made.
           */
          function pickDatabase(vow) {
              db.pick(function(database, url){
                  var name = database.name;
                  vow.keep(database);
                  VOW.every([
                      cookie.set('database', name, 3650)
                      ,cookie.set('databaseUrl', url, 3650)]
                  ).when(
                      function() { log.d('Set database and url cookies'); }
                      ,function() { log.e('Unable to set the database or url cookie!!'); }
                  );
              });
              
          }
          
          //##getDatabase
          /**Gets the cookie, and then either sets or lets the user
           * pick a database, depending on whether the cookie was
           * existant
           */
          function getDatabase(){
              var vow = VOW.make();
              cookie.get('database').when(
                  function(dbName) {
                      setDatabase(vow, dbName);   
                  }
                  ,function() {
                      pickDatabase(vow);
                  });
              return vow.promise;
          }
          
          
          //##initDatabase
          /** Try to get the database url cooke and initialize the
           * database with it.
             */
          function initDatabase(database){
              var vow = VOW.make();
              cookie.get('databaseUrl').when(
                  function(url) {
                      database.init(vow, url);
                  }
                  ,function() {
                      var msg = 'There is no database url cookie';
                      log.d(msg);
                      cookie.rm('database').when(
                          function() {
                              vow['break'](
                                  msg + '\nRefresh the browser (f5), choose a database and url');
                          },
                          function() {
                              vow['break'](msg + "\nCan't erase the database cookie!!!" +
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
              getDatabase().when(
                  initDatabase
              ).when(
                  user.init
             ) 
              .when(
                  //Give some feedback
                  function(arg) {
                      log.d('Success!!!', arg);
                  },
                  function(err) {
                      console.log('Failed', err);
                  }
              );
              
          }
          
          //Let's do it then!!
          start();
      
        }});


