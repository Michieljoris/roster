/*global module:true pp:true isc:false define:false */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:150 devel:true*/

var pp = function() {
    "use strict";
  for (var i=0; i< arguments.length; i++) {
    var arg= arguments[i];
    if (typeof  arg === "string") {console.log(arg);} 
    else if (typeof arg === 'object')
        for (var j in arg) console.log("  " + j + ":" + arg[j]);
    else console.log(arg);
  }
};

// function callback(resp, arg2) { pp(resp); pp(arg2);}
"use strict";

//////////////////////////pouchdb///////////////////////////
var pouch = 
    (function() {
        "use strict";
        var db; 
        function setdb(dbname) {
            // console.error('quickpouch');
            db = dbname; 
            // console.log(db);
        }
        // var db= 'idb://' + roster.dbname;
        // pouch(db, "info", function(response) { console.log(response); });
        // pouch("idb://testdb", "query", {map:map}, {reduce:false}, 
        //       function(response) { console.log(response); })
        var pouch = function() {
            var args = Array.prototype.slice.call(arguments)
            ,dbname = args[0]
            ,op = args[1]
            ,opargs= args.slice(2,args.length-1)
            ,callback=args[args.length-1];
            // ,opcallback = function (err,response){
            // 	 if (err) {
            // 	   if (op === 'get') callback(err,null);
            // 	   else console.log("Error from pouch db." + op + ":", err.error, err.reason);
            // 	 }
            // 	 else callback(null, response);		       
            // };
            // console.log('POUCH', op,opargs, opcallback);
            Pouch(db, function(err, db) {
	        if (err) console.log("Error opening database", dbname, "err:", err.error, err.reason, " db:", db);
	        else db[op].apply(db,opargs.concat(callback));
	    }
                 ); 
        }; 


        // var db='http://localhost:1234/testext';
        var pdestroy = function() {
            Pouch.destroy(db);

        };

        var pinfo = function () {
            Pouch(db, function(err, db) {
	        if (err) {
		    console.log(err.error, err.reason); 
		    return;
	        }
  	        function map(doc) {
  		    if(doc) {
  		        emit(doc, null);
  		    }}
  	        db.info(function(err,info) {
		    if (err) console.log(err.error, err.reason); 
  		    else pp(info);
  		});
	       
	        db.query({map: map}, {reduce: false}, function(err, response) {
		    if (err) console.log(err.error, err.reason); 
  		    else {
			var i=0; 
			response.rows.forEach(function(e) {
						    
			    console.log(i + '------------------');
			    console.dir(e.key); 
			});
		    }
		}); 
  	    });
        };
     
     
        var pquery = function(map, callback) {
            Pouch(db, function(err, db) {
	        if (err) {
		    console.log(err.error, err.reason); 
		    return;
	        }
	        db.query({map: map}, {reduce: false}, callback);
	    });
        };
        var ppost = function(obj, callback) {
	    pouch(db, "post", obj, callback); //function(resp) { console.log("Response is:", resp); });
        };

        var pbulk = function(obj, callback) {
	    pouch(db, "bulkDocs", {docs: obj }, callback); //function(resp) { console.log("Response is:", resp); });
        };

        var pput = function(obj, callback) {
            pouch(db, "put", obj, callback); //function(resp) { console.log("Response is:", resp); });
        };

        
        var pget = function(id, callback) {
            pouch(db, "get", id, callback); //function(resp) { console.log("Response is:", resp); });
        };
        
        
        var premove = function(id) {
            Pouch(db, function(err, pdb) {
	        if (err) {
		    console.log(err.error, err.reason); 
		    return;
	        }
                pdb.get(id, function(err, doc) {
                    pdb.remove(doc, function(err, response) {
                        console.log(response);
                        // Response:
                        // {
                        //   "ok": true,
                        //   "id": "mydoc",
                        //   "rev": "2-9AF304BE281790604D1D8A4B0F4C9ADB"
                        // }
                    });
                });
	    });
        };

        function getBool() {
            
            var r = Math.floor(Math.random() * 2);
            return r === 0;
        }
        
        var lmax = 20; //number of locations
        var pmax = 100; //number of people
        
        var locations = (function(n) {
            var result = [];
            for (var i = 0; i < n; i++) {
                result.push( 'loc' + i);
            } 
            return result; 
        })(lmax);
        
        var persons = (function(n) {
            var result = [];
            for (var i = 0; i < n; i++) {
                result.push( 'p' + i);
            } 
            return result; 
        })(pmax);
        
        function random(rangeStart, rangeEnd) {
            var span = rangeEnd - rangeStart + 1;
            return rangeStart +  Math.floor(Math.random() * span);
        }
        
        function makeRandomShift(period) {
            var start = new Date();
            var hour = random(0,23);
            var offset = random(0,period); 
            start.setDate(start.getDate() + offset);
            start.setHours(hour);
            start.setMinutes(0);
            start.setSeconds(0);
            var length= random(1,20)/2;
            if (hour + length > 24) length = 24 - hour;
            var end = new Date( start.getTime() + length*3600000);
	    var timezoneOffset = start.getTimezoneOffset();
            console.log(timezoneOffset);
	    start = new Date(start.getTime() + (timezoneOffset * 60000));
	    end = new Date(end.getTime() + (timezoneOffset * 60000));
            console.log(hour, length, start,end);
            return {
                group: 'shift',
                startDate: start,
                endDate: end,
                notes: 'notes',
                ad: getBool(),
                person: persons[Math.floor(Math.random() * pmax)],
                location: locations[Math.floor(Math.random() * lmax)]
            };
            
        }
        
        function bulk(args) {
            var i;
            var shiftsPerDay = args.shiftsPerDay;
            var newDocs= [];
            for (var g in args) {
                // console.log(args[g]);
                var amount = args[g];
                var period = Math.floor(amount/shiftsPerDay);
                switch (g) {
                  case 'shift':
                    for (i = 0; i < amount; i++) {
                        newDocs.push(makeRandomShift(period));
                    }
                    break;
                  case 'person': console.log('person'); break;
                default:
                }
            } 
            return newDocs;
        } 
        
        function doBulk() {
            var docs =  bulk({
                shiftsPerDay: 2,
                shift: 100,
                location: 10,
                person: 10,
                role: 10,
                user:10 
            });
            
            console.log(docs);
            pbulk(docs, function(err, response) {
                console.log(err, response);
                // Response array:
                // [
                //   {
                //     "ok": true,
                //     "id": "828124B9-3973-4AF3-9DFD-A94CE4544005",
                //     "rev": "1-A8BC08745E62E58830CA066D99E5F457"
                //   }
                // ]
            });
        } 
        // Puch.replicate(db, 'http://localhost:1234/todos', function(err, changes) {
        // 		    console.log(err);	
        // 		    console.log(changes);	
        // 		    console.log("replicated??");
        // 		});

        //   }
        // });
        return {
            make: makeRandomShift,
            doBulk: doBulk,
            // bulk: bulk,
            setdb: setdb,
            info: pinfo,
            get: pget,
            post: ppost,
            put: pput,
            destroy: pdestroy,
            query: pquery,
            remove: premove
        };
     
    })();

pouch.setdb(window.dbname);


var localUrl = window.dbname; //'localdb';
var remoteUrl = 'http://p1:p1@localhost:8080/db/remoteroster4';

function openDB(name, options,callback) {
  new Pouch(name, options, function(err, db) {
    if (err) {
      console.error(err);
      console.log('failed to open database');
    }
    callback.apply(this, arguments);
  });
}

// var localDB2;
function initDB() {
    openDB(localUrl, {adapter:'idb'}, function(err, db) {
        if (err) { console.log("Can't open local database " + remoteUrl); }
        else {
            window.localDB2 = db; 
        }
    });
}


function repToRemote(url) {
    if (!url) url = remoteUrl;
    if (!window.localDB2) initDB();
    openDB(url, { adapter:'http'}, function( err, remoteDB) {
         if (err) { console.log("Can't open remote database " + remoteUrl); }
        else {
            var options = {};
            // options.complete = function() { console.log('complete', arguments); };
            // options.onChange = function() { console.log('onChange', arguments); };
            // Pouch.replicate('idb://db',  'http://localhost:8082/db/db', function(err, changes) {
            window.localDB2.replicate.to(remoteDB,  function(err, changes) {
                if (err) {
                    alert('Replicating to ' + url + 'produced errors: ' + err);
                }
                else alert('Replication was successfull.' + changes);
                console.log('err:',err, 'changes', changes);
            });
            
        }
        
    });
}


function repFromRemote() {
    openDB(remoteUrl,{adapter:'http'}, function( err, remoteDB) {
        if (err) { console.log("Can't open remote database " + remoteUrl); }
        else {
            var options = {};
            // options.complete = function() { console.log('complete', arguments); };
            // options.onChange = function() { console.log('onChange', arguments); };
            // Pouch.replicate('idb://db',  'http://localhost:8082/db/db', function(err, changes) {
            localDB2.replicate.from(remoteDB,  function(err, changes) {
                console.log('err:',err, 'changes', changes);
            });
            
        }
        
    });
}

