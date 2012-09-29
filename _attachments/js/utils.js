///////////////////////log functions//////////////////
function log() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	// if (typeof  arg == "string") console.log(arg);
	// else if (typeof arg == 'object') for (j in arg) console.log(j + "=" + arg[j]);
	// else
	    console.log(arg);
    }
}

function pp() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	if (typeof  arg == "string") {console.log(arg);} 
	else if (typeof arg == 'object') for (j in arg) console.log(" " + j + ":" + arg[j]);
	else console.log(arg);
    }
}

//////////////////////////pouchdb///////////////////////////

var db='idb://test';
// pouch(db, "info", function(response) { console.log(response); });
// pouch("idb://testdb", "query", {map:map}, {reduce:false}, 
//       function(response) { console.log(response); })
var pouch = function() {
    var args = Array.prototype.slice.call(arguments)
    ,dbname = args[0]
    ,op = args[1]
    ,opargs= args.slice(2,args.length-1)
    ,callback=args[args.length-1]
    ,opcallback = function (err,response){
   	if (err) pp("Error from pouch db." + op + ":", err,
   		    "resp:", response);
   	else callback(response);		       
    };
    Pouch(dbname, function(err, db) {
	      if (err) pp("Error opening database", dbname, "err:", err, "db:", db);
	      else db[op].apply(db,opargs.concat(opcallback));
	  }
	 ); 	      
}; 


// var db='http://localhost:1234/testext';
function pdestroy() {
    Pouch.destroy(db);

}

function pinfo() {
    function map(doc) {
	if(doc) {
	    emit(doc, null);
	}
    }
    pouch(db, "info", 
	  function(info) { pp(info); });
    pouch(db, "query", {map: map}, {reduce: false}, 
	  function(response) {
	      response.rows.forEach(function(e) {
					pp(e.key); 
				    });
	  });
}

function ppost(obj) {
    pouch(db, "post", obj, function(resp) { pp("Response is:", resp); });
}


function pput(obj) {
    pouch(db, "put", obj, function(resp) { pp("Response is:", resp); });
}


function pget(id) {
    pouch(db, "put", id, function(resp) { pp("Response is:", resp); });
}


// Pouch.replicate(db, 'http://localhost:1234/todos', function(err, changes) {
// 		    console.log(err);	
// 		    console.log(changes);	
// 		    console.log("replicated??");
// 		});
