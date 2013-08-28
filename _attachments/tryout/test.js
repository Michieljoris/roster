
/*global define: false logger:false   */
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:100 maxlen:190 devel:true*/


var  goalSalt = "cd6f5f958dc7886b6ae406696f7258cb";

function decimalToHex(d) {
  var hex = Number(d).toString(16);
  hex = "00".substr(0, 2 - hex.length) + hex; 
  return hex;
}


function hex2a(hex) {
    var arr = [];
    for (var i = 0, l = hex.length; i < l; i += 2) {
    	arr.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
    }
    return arr.join('');
}

function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
        var hex = Number(str.charCodeAt(i)).toString(16);
        arr.push(hex);
    }
    return arr.join('');
}

// console.log('\nWorking? ',hex2a(a2hex('abc')) === 'abc' );
function checkId(str) {
           var msg;
           var match = str.match(/\*?[A-Za-z \-_]+/);
           console.log(match);
           if (str.length === 0) msg = "Empty string";
           else if (!match || match.length === 0 || match[0].length !== str.length)
               msg = 'Illegal character';
           
           if (msg) {
               // alert(msg);
               console.log(msg);
               return false;
           }
           return true;
       }

var result = checkId('*b-_a');
console.log(result);
