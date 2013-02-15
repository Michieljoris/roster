/*global isc:false console:false __stack:false __line:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:20 maxlen:190 devel:true*/

if ( ! window.console ) {

    (function() {
        "use strict";
        var names = ["log", "debug", "info", "warn", "error",
                     "assert", "dir", "dirxml", "group", "groupEnd", "time",
                     "timeEnd", "count", "trace", "profile", "profileEnd"],
            i, l = names.length;

        window.console = {};

        for ( i = 0; i < l; i++ ) {
            window.console[ names[i] ] = function() {};
        }
    }());

}


(function(global) {
    //A little logging utility.
    //Load the script with:
    
    //`<script src=pathto/logger.js></script>`
    //A new global is created named logger.
    //Make a new logger with:
    //var log = logger('nameOfLogger', level, showTimeStamp )
    //these optional parameters default to 'logger', defaultGlobalLevel and false. 
    //The object returned has the following function properties:
    //e, w, i, d for error, warn, info and debug
    //setLevel to set the level for this particular logger
    //showTimeStamp and hideTimeStamp
    //logger.setLevel sets the level for all debuggers, overriding their individual levels.
    //logger.enable and logger.disable will make all loggers non-functional, in effect turning this
    //script into a dummy script, doing nothing but returning its logging calls.
    //to completely remove all log statements from the script, maybe use Douglas Crockford's JSDev
    //https://github.com/douglascrockford/JSDev
    
    //The logger will add to every printout to the console the
    //logger's name, the function it was called from, the line number
    //and optionally a timestamp. The same logger object can be
    //retrieved as many times as you like by calling logger with the
    //same name. Set the level of individual loggers anywhere in your
    //app, and/or use the same logger in multiple places.  All
    //printouts will go to the standard javascript
    //console. console.debug, console.warn, console.info and
    //console.error are used under the covers.
    
    //TODO: detect console object, fail gracefully
    //TODO: pass through other console properties
    //TODO: maybe store messages to output somewhere else
    //-------------------------------------------------------------------------------
    var globalHook = 'logger';
    var defaultGlobalLevel = 'debug';
    //-------------------------------------------------------------------------------
    
    var loggers = {};
    var globalLevel;
    var globalTimeStamp = false;
    var globalStamp = true;
    var enabled = true;
    
    function addHooks() {
        enabled = true;
        Object.defineProperty(window, '__stack', {
            get: function(){
                var orig = Error.prepareStackTrace;
                Error.prepareStackTrace = function(_, stack){ return stack; };
                var err = new Error;
                if (Error && Error.captureStackTrace) 
                    Error.captureStackTrace(err, arguments.callee);
                var stack = err.stack;
                Error.prepareStackTrace = orig;
                return stack;
            },
            configurable:true
        });

        Object.defineProperty(window, '__line', {
            get: function(){
                var origin = __stack[3];
                // console.log(origin);
                var name;
                if (origin && origin.fun) 
                    name = origin.fun.name;
                if (!name) name = 'anon';
                var lineNumber = origin.getLineNumber ? origin.getLineNumber() : '?';
                return '.' + name + ':' + lineNumber;
            },
            configurable: true
        });
        
    }
    
    function removeHooks() {
        enabled = false;
        delete global.__line;
        Object.defineProperty(window, '__line', {
            get: function(){
                return '';
            },
            configurable: true
        });
        delete global.__stack;
    }
    
    var isArray = function (value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    };
    
    //returns a timestamp in ms without arguments,
    var timeStamp = (function () {
	var bootstart = new Date();
	return function () { return new Date() - bootstart;};})();
    
    var levels = ['none', 'error', 'warn', 'info', 'debug'];
        
    function print(name, level, args) {
        if (!enabled) return;
        args = isc.clone(Array.prototype.slice.call(args));
        // args.forEach(function(a) {
        //    if  (a && a.Class === 'Array') {
        //       a.__proto__ = null; //bloody smartclient puts all these
        //                            //props on standard objects, they
        //                            //mess with console.log, it prints
        //                            //out way too much, so we nullify
        //                            //the proto of a clone of the
        //                            //object
        //    }
        // });
        var out = [];
        var post = '(';
        if (globalTimeStamp || loggers[name].timeStamp) post += '[' + timeStamp() + ']';
        post += name +  __line + ')';
        out = out.concat(args);
        if (globalStamp) out.push(post);
        if (level <= globalLevel && level <= loggers[name].level) {
            //messing around for IE
            var consoleObj = console[levels[level]];
            if (consoleObj) consoleObj.apply(console, out);
            else console.log(out);
        }
    }
        
    function setLevel(name, level) {
        var l = levels.indexOf(level);
        if (l > -1) {
            loggers[name].level = l;   
        } 
        else {
            console.warn("logger.setLevel: level should be one of 'none', " +
                         "'error', 'warn', 'info' or 'debug' not:",
                         level);
        }
    }
    
    function pp() {
        for (var i=0; i< arguments.length; i++) {
            console.log(JSON.stringify(arguments[i], null, 2));
	    // var arg= arguments[i];
	    // if (typeof  arg === "string") console.log(arg); 
	    // else if (arg instanceof Date) console.log(arg); 
            // else if (isArray(arg)) {
            //     console.log('Array: [');
            //     for (var k=0; k<arg.length; k++) {
            //         console.log(k); pp(arg[k]);
            //     }
            //     console.log(']');
            // }
	    // else if (typeof arg === 'object') {
            //     var pre = '{ ', post = ',';
            //     var index = 0;
            //     var length = Object.keys(arg).length;
            //     for (var j in arg) {
            //         if (index>0) pre = '  '; 
            //         if (index === length-1) post = ' }'; 
            //         console.log(pre + j + ":" + arg[j] + post);   
            //         index++;
            //     }
            // }
	    // else console.log(arg);
        }
    }
        
    function getLogger(name, level, showTimeStampVar) {
        if (typeof name !== 'string') return getLogger('logger');
        if (loggers[name]) return loggers[name];
        
        loggers[name] = {
            e: function() {
                print(name,1,arguments);   
            },
            w: function() {
                print(name,2,arguments);   
            },
            i: function() {
                print(name,3,arguments);   
            },
            d: function() {
                print(name,4,arguments);   
            },  
            pp: pp,
            setLevel: function(level) { setLevel(name, level); },
            showTimeStamp: function() { loggers[name].timeStamp = true; }, 
            hideTimeStamp: function() { loggers[name].timeStamp = false; }
        };
        if (!level || typeof level !== 'string') loggers[name].level = globalLevel;
        else setLevel(name, level);
        loggers[name].timeStamp = showTimeStampVar;
        return loggers[name];
    }
        
    function setGlobalLevel(level) {
        globalLevel = levels.indexOf(level);
        if (globalLevel === -1) {
            console.warn("logger.setLevel: level should be one of 'none', 'error', 'warn', 'info' or 'debug' not:",
                         level);
            console.log("setting level of logger to 'debug'");
            globalLevel = levels.indexOf('debug');
        }
        
    }
    
    
    setGlobalLevel(defaultGlobalLevel);
    addHooks();
    //API
    getLogger.setLevel = setGlobalLevel;
    getLogger.showTimeStamp = function() { globalTimeStamp = true; };
    getLogger.hideTimeStamp = function() { globalTimeStamp = false; };
    getLogger.disable = removeHooks;
    getLogger.enable = addHooks;
    getLogger.showStamp = function() { globalStamp = true; };
    getLogger.hideStamp = function() { globalStamp = false; };
    global[globalHook] = getLogger;
    
})(this);