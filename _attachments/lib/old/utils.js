
/*global console:false define:false __stack:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

define
({ 
    factory: function() {
        "use strict";
        Object.defineProperty(window, '__stack', {
            get: function(){
                var orig = Error.prepareStackTrace;
                Error.prepareStackTrace = function(_, stack){ return stack; };
                var err = new Error;
                Error.captureStackTrace(err, arguments.callee);
                var stack = err.stack;
                Error.prepareStackTrace = orig;
                return stack;
            }
        });

        Object.defineProperty(window, '__line', {
            get: function(){
                return __stack[1].getLineNumber();
            }
        });

        
            
        // var verbosity = 'debug';

        // //returns a timestamp in ms without arguments,
        // var timeStamp = (function () {
	//     var bootstart = new Date();
	//     return function () { return new Date() - bootstart;};})();
        // //log with levels  eg: log(W,"bla");
        // var E=1, W=2, I=3, D=4;
        // var levels = ['none', 'error', 'warn', 'info', 'debug'];
     
        // //------------------------------------------------------------ 
        // function print() {
        //     var args = Array.prototype.slice.call(arguments);
        //     var level = args[0];
        //     args[0] = timeStamp();
        //     if (level <= verbosity) console[levels[level]].apply(console, args);
        // }
   
        // return {
        //     error: 
        //     warn:
        //     info:
        //     debug:
        // };
    }});