// main.js
console.log('in testzero.js');
var clip = new ZeroClipboard( document.getElementById("bla"), {
  moviePath: "lib/ZeroClipboard.swf"
} );
window.clip = clip;
clip.on( 'load', function(client) {
  console.log( "movie is loaded" );
} );

clip.on( 'complete', function(client, args) {
  // this.style.display = 'none'; // "this" is the element that was clicked
  console.log("Copied text to clipboard: " + args.text );
} );

clip.on( 'mouseover', function(client) {
  // alert("mouse over");
} );

clip.on( 'mouseout', function(client) {
  // alert("mouse out");
} );

clip.on( 'mousedown', function(client) {

  // alert("mouse down");
} );

clip.on( 'mouseup', function(client) {
  // alert("mouse up");
} );