
var pp = function() {
  for (var i=0; i< arguments.length; i++) {
    var arg= arguments[i];
    if (typeof  arg == "string") {console.log(arg);} 
    else if (typeof arg == 'object') for (j in arg) console.log(" " + j + ":" + arg[j]);
    else console.log(arg);
  }
};

function callback(resp, arg2) { pp(resp); pp(arg2);}

//////////////////////////pouchdb///////////////////////////
var pouch = 
  (function() {
     var db; 
     function setdb(dbname) {
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
       Pouch(dbname, function(err, db) {
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
       Pouch('idb://' + roster.dbname, function(err, db) {
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
			    response.rows.forEach(function(e) {
						    pp(e.key); 
						  });
			  }
			}); 
  	     });
     };
     
     
     var pquery = function(map, callback) {
       Pouch('idb://' + roster.dbname, function(err, db) {
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


     var pput = function(obj, callback) {
       pouch(db, "put", obj, callback); //function(resp) { console.log("Response is:", resp); });
     };


     var pget = function(id, callback) {
       pouch(db, "get", id, callback); //function(resp) { console.log("Response is:", resp); });
     };


     // Pouch.replicate(db, 'http://localhost:1234/todos', function(err, changes) {
     // 		    console.log(err);	
     // 		    console.log(changes);	
     // 		    console.log("replicated??");
     // 		});

     //   }
     // });
     return {
       setdb: setdb,
       info: pinfo,
       get: pget,
       post: ppost,
       put: pput,
       destroy: pdestroy,
       get: pget,
       query: pquery
     };
     
   })();
