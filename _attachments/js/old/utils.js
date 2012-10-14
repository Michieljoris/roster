// jdefine( 
//   {
//     factory : function() {
///////////////////////log functions//////////////////
// this.log = function() {
// 	for (var i=0; i< arguments.length; i++) {
// 	  var arg= arguments[i];
// 	  // if (typeof  arg == "string") console.log(arg);
// 	  // else if (typeof arg == 'object') for (j in arg) console.log(j + "=" + arg[j]);
// 	  // else
// 	  console.log(arg);
// 	}
// };

var pp = function() {
  for (var i=0; i< arguments.length; i++) {
    var arg= arguments[i];
    if (typeof  arg == "string") {console.log(arg);} 
    else if (typeof arg == 'object') for (j in arg) console.log(" " + j + ":" + arg[j]);
    else console.log(arg);
  }
};

//////////////////////////pouchdb///////////////////////////

var db='idb://rosterdb';
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
var pdestroy = function() {
  Pouch.destroy(db);

};

var pinfo = function() {
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
};

var ppost = function(obj) {
  pouch(db, "post", obj, function(resp) { pp("Response is:", resp); });
};


var pput = function(obj) {
  pouch(db, "put", obj, function(resp) { pp("Response is:", resp); });
};


var pget = function(id) {
  pouch(db, "put", id, function(resp) { pp("Response is:", resp); });
};


// Pouch.replicate(db, 'http://localhost:1234/todos', function(err, changes) {
// 		    console.log(err);	
// 		    console.log(changes);	
// 		    console.log("replicated??");
// 		});

//   }
// });
