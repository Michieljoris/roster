var todos={};

todos.addTodo = function(todoText) {
    
    Pouch('idb://todos2', function(err, db) {
	     if (todoText) 
	      db.put({ _id: String(new Date().getTime()),text: todoText },
		      function (err,response){
			  console.log(err);
			  console.log(response);
			  if (!err) todos.getAllTodoItems();
	      	      });
	     else {
		 
		 console.log("Empty todo text"); 
		 todos.getAllTodoItems();
	     }
	  });
};

todos.deleteTodo = function(id) {
    Pouch('idb://todos2', function(err, db) {
	      console.log(id);
	      db.get( id,
		      function (err,doc){
			  console.log(err);
			  console.log(doc);
			  db.remove(doc, function(err,response) {
					console.log(err);
					console.log(doc);
					if (err) console.log("could not remove doc");	
					else todos.getAllTodoItems();
			  	    } );
	      	      });
	  });
    
};

todos.getAllTodoItems = function() {
    var todoItems = document.getElementById("todoItems");
    todoItems.innerHTML = "";
    
    function map(doc) {
	if(doc.text) {
	    emit(doc,null);
	}
    }
    Pouch('idb://todos2', function(err, db) {
	      db.query( {map:map},{reduce:false},
			function (err,response){
			    console.log(err);
			    console.log(response);
			    for (row in response.rows) {
				renderTodo(response.rows[row].key);
			    }
	      		});
	  });
    
};

function renderTodo(row) {
    var todoItems = document.getElementById("todoItems");
    var li = document.createElement("li");
    var a = document.createElement("a");
    if (!row) return;
	var t = document.createTextNode(row.text);
    
    a.addEventListener("click", function() {
			   todos.deleteTodo(row._id);
		       }, false);
    
    a.textContent = " [Delete]";
    li.appendChild(t);
    li.appendChild(a);
    todoItems.appendChild(li);
}

function addTodo() {
    var todo = document.getElementById("todo");
    todos.addTodo(todo.value);
    todo.value = "";
}

function init() {
   Pouch('idb://todos2', function(err, db) {
	      console.log(err);
  });

}

function replicate() {
    Pouch.replicate('idb://todos2', 'http://localhost:1234/todos', function(err, changes) {
		console.log(err);	
		console.log(changes);	
		console.log("replicated??");
		    });
}


function replicate2() {
    Pouch.replicate('http://localhost:1234/todos', 'idb://todos2', function(err, changes) {
		console.log(err);	
		console.log(changes);	
		console.log("replicated??");
		    });
}

window.addEventListener("DOMContentLoaded", init, false);


// var authors = [
//   {name: 'Dale Harvey', commits: 253},
//   {name: 'Mikeal Rogers', commits: 42},
//   {name: 'Johannes J. Schmidt', commits: 13},
//   {name: 'Randall Leeds', commits: 9}
// ];
// Pouch('idb://authors', function(err, db) {
// 	  // Opened a new database
// 	      console.log(err);
//       });
	  
// init();

