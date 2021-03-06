/*global Cookie:true pp:true isc:false Pouch:false */
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

//////////////////////////pouchdb///////////////////////////
var pouch = 
    (function() {
        
        // function readCookie(name) {
        //     // console.log('reading cookie', name);
        //     var nameEQ = name + "=";
        //     var ca = document.cookie.split(';');
        //     for(var i=0;i < ca.length;i++) {
	//         var c = ca[i];
	//         while (c.charAt(0)===' ') c = c.substring(1,c.length);
	//         if (c.indexOf(nameEQ) === 0)
        //             return c.substring(nameEQ.length,c.length);
        //     }
        //     return false;
        // }
        Cookie.useVows = false;
        db = Cookie.get('backendUrl');
        Cookie.useVows = true;
        if (!db) db = 'db';
        console.log('quickpouch is loaded with url ' + db);
        var db; 
        function setdb(dbname) {
            // console.error('quickpouch');
            db = dbname; 
            // console.log(db);
        }
        
        var pouch = function() {
            var args = Array.prototype.slice.call(arguments)
            ,dbname = args[0]
            ,op = args[1]
            ,opargs= args.slice(2,args.length-1)
            ,callback=args[args.length-1];
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

        var palldocs = function () {
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
			    // console.dir(e.key); 
			    pp(e.key); 
			});
		    }
		}); 
  	    });
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
	    pouch(db, "post", obj, function(err, resp) { console.log("Response is:",err, resp); });
        };

        var pbulk = function(obj, callback) {
	    pouch(db, "bulkDocs", {docs: obj }, callback); //function(resp) { console.log("Response is:", resp); });
        };

        var pput = function(obj, callback) {
            pouch(db, "put", obj, function(err, resp) { console.log("Response is:", err, resp); });
        };
        var extend = function(o1, o2) {
           Object.keys(o2).forEach(function(k) {
              o1[k] = o2[k]; 
               });
            return o1;
            };

        var mod = function(id, obj) {
            
            pouch(db, 'get', id, function(err, res) {
                extend(res, obj);
               
                pouch(db, 'put', res, function(err, res) {
                    console.log(err, res);
               
                });
            });
        }; 
        
        var pget = function(id, obj) {
            if (!obj) obj = {};
            pouch(db, "get", id, function(err, resp) { window.test = obj.doc = resp;  console.log("Response is:", err, resp); });
        };
        
        var pgetrev = function(id, rev) {
            var options = {
                rev: rev
            };
            Pouch(db, function(err, db) {
	        if (err) console.log("Error opening database", dbname, "err:", err.error, err.reason, " db:", db);
	        else {
                 db.get(id, options, function(err, res) {
                     console.log(err, res);
                 });   
                }
	    }); 
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
        
        function revs(id) {
            var options = {
                open_revs:"all"
                // revs: true,
                // revs_info: true
            };
            Pouch(db, function(err, db) {
	        if (err) console.log("Error opening database", dbname, "err:", err.error, err.reason, " db:", db);
	        else {
                 db.get(id, options, function(err, res) {
                     console.log(err, res);
                 });   
                }
	    }); 
        }
        
        
        return {
            revs:revs,
            make: makeRandomShift,
            doBulk: doBulk,
            // bulk: bulk,
            setdb: setdb,
            info: pinfo,
            alldocs: palldocs,
            get: pget,
            post: ppost,
            put: pput,
            destroy: pdestroy,
            query: pquery,
            remove: premove,
            mod:mod,
            getrev: pgetrev
        };
     
    })();
