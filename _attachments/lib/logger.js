
/*global console:false __stack:false __line:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:8 maxlen:190 devel:true*/

(function(global) {
    var LEVEL = 'debug';
    var defaultLevel = 'debug'; 
    
    //-------------------------------------------------------------------------------
    var loggers = {};
    var globalLevel;
    
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
            var origin = __stack[3];
            // console.log(origin);
            var name = origin.fun.name;
            if (!name) name = 'anon';
            return '.' + name + ':' + origin.getLineNumber();
        }
    });
            
    
    //returns a timestamp in ms without arguments,
    var timeStamp = (function () {
	var bootstart = new Date();
	return function () { return new Date() - bootstart;};})();
    var levels = ['none', 'error', 'warn', 'info', 'debug'];
        
    function print(name, level, args) {
        args = Array.prototype.slice.call(args);
        var out = [];
        var pre = '(';
        if (loggers[name].showTimeStamp) pre += '[' + timeStamp() + ']';
        pre += name +  __line + ')';
        out.push(pre);
        out = out.concat(args);
        // console.log(level, globalLevel, loggers[name].level);
        if (level <= globalLevel && level <= loggers[name].level) console[levels[level]].apply(console, out);
    }
        
    function setLevel(name, level) {
        level = levels.indexOf(level);
        if (level > -1) {
            loggers[name].level = level;   
        } 
        else {
            console.warn("Logger " + name + " set to default level of " + defaultLevel);
            loggers[name].level = levels.indexOf(defaultLevel);
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
            setLevel: function(level) { setLevel(name, level); },
            showTimeStamp: function() { loggers[name].showTimeStamp = true; }, 
            hideTimeStamp: function() { loggers[name].showTimeStamp = false; }
        };
        setLevel(name, level);
        loggers[name].showTimeStamp = showTimeStampVar;
        return loggers[name];
    }
        
        
    function setGlobalLevel(level) {
        globalLevel = levels.indexOf(level);
    }
    
    setGlobalLevel(LEVEL);
        
    global.logger =  {
        get: getLogger,
        set: setGlobalLevel
    };
   
})(this);