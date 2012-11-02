/*
 * Isomorphic SmartClient
 * Version v8.2p_2012-09-05 (2012-09-05)
 * Copyright(c) 1998 and beyond Isomorphic Software, Inc. All rights reserved.
 * "SmartClient" is a trademark of Isomorphic Software, Inc.
 *
 * licensing@smartclient.com
 *
 * http://smartclient.com/license
 */


// Encapsulates various bits of logic for generating, converting, and 
// presenting stack traces.
isc.defineClass("StackTrace");

isc.StackTrace.addClassMethods({
    // Creates a StackTrace from a browser-native exception stack
    //
    // For instance:
    // 
    // try {
    //     eval("bob ===== 7;");
    // }
    // catch (e) {
    //     if (e.stack) {
    //         var trace = isc.StackTrace.fromNativeStack(e.stack);
    //         var output = trace.toString();
    //     }
    // }
    //
    // Chooses the correct subclass based on the browser. If the browser
    // native stack is not supported yet for te browswer, it will simply
    // output the stack itself.
    fromNativeStack : function (stack) {
        if (isc.Browser.isMoz) {
            return isc.MozStackTrace.create({stack: stack});
        } else if (isc.Browser.isChrome) {
            return isc.ChromeStackTrace.create({stack: stack});
        } else {
            return isc.UnsupportedStackTrace.create({stack: stack});
        }
    }
});

isc.StackTrace.addProperties({
    // Provide the browser-native stack on creation    
    
    stack: null,

    // Where we store the "converted" stack trace in readable format
    // Access via the toString() method.
    _output: "",

    init : function() {
        if (this.stack) {
            this._parseStack();
        }
    },

    // Should extract the function name from a line of the stack
    // Implement in a browser-specific subclass
    extractFunctionFromLine : function (line) {
        this.logError("Should implement extractFunctionFromLine in subclass");
    },

    // Should extract the arguments from a line of the stack
    // Implement in a browser-specific subclass
    extractArgumentsFromLine : function (line) {
        this.logError("Should implement extractArgumentsFromLine in subclass");
    },

    // Should extract the source file and line number from a line of the stack
    // Implement in a browser-specific subclass
    extractSourceFromLine : function (line) {
        this.logError("Should implement extractSourceFromLine in subclass");
    },

    // Parse native stack trace
    // ---------------------------------------------------------------------------------------
    // Do an in-browser transform of the native stack to make it more readable.
    //
    // FF theoretically provides an onerror notification, but it seems flaky, and it is not
    // possible to walk the stack via arguments.caller.callee in this notification even when it
    // does fire.  So the best we can get when an error occurs is the native error.stack,
    // which we transform here for readability.
    //
    // How good is it:
    // - if function names have been embedded into framework code with server-side help, we can
    //   correctly identify and print the class and method for all framework functions that go
    //   through the obfuscator
    //   - this is better than the current state of parsing with the help of a server-side Perl
    //     script, which frequently misidentifies functions 
    // - worse than stack walking via arguments.callee.caller, where:
    //   - we can identify all functions, regardless of whether they went through the
    //     obfuscator
    //   - we can directly access arguments and format them more meaningfully (eg, show than an
    //     object being passed to a method is an SC class, and show it's ID)
    _parseStack : function () {
        // Parse inside a try/catch block so that we can simply use the supplied
        // stack as the output if an error occurs in parsing.
        try {
            var lines = this.stack.split("\n"),
                output = isc.StringBuffer.create(),
                appDir = isc.Page.getAppDir(),
                hostAndProtocol = window.location.protocol + "//" + window.location.host;
        
            //isc.logWarn("original trace: " + lines.join("\n\n"));
        
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i],
                    argNames = null,
                    className = null,
                    methodName = null;
        
                //isc.logWarn("parsing line: " + line);
        
                var functionName = this.extractFunctionFromLine(line); 
                if (functionName == "") {
                    functionName = "unnamed";
                } else if (functionName.startsWith("isc_")) {
                    var isClassMethod;
                    if (functionName.startsWith("isc_c_")) {
                        functionName = functionName.substring(6);
                        isClassMethod = true;
                    } else {
                        functionName = functionName.substring(4);
                    }
                    className = functionName.substring(0, functionName.indexOf("_"));
                    methodName = functionName.substring(className.length+1);
        
                    var clazz = isc.ClassFactory.getClass(className),
                        method = null;
                    if (clazz) {
                        method = isClassMethod ? 
                            clazz[methodName] : clazz.getInstanceProperty(methodName);
                    }
                    // if we figure out what actual method is being referred to, we can find
                    // out the official argument names and show them
                    if (method != null) {
                        functionName = isc.Func.getName(method, true);
                        //isc.logWarn("Got live method: " + isc.Func.getName(method, true) +
                        //            " from functionName: " + functionName);
                        var argString;
                        if (!isClassMethod) {
                            // takes into account StringMethods
                            argString = clazz.getArgString(methodName);
                        } else {
                            argString = isc.Func.getArgString(method);
                        }
                        argNames = argString.split(",");
                        // NOTE: we checked to see if the live stack might still be there, since that would
                        // let us just call the normal getStackTrace() facility with the exception just
                        // serving to help us locate the leaf method, but as expected, only the stack above
                        // the try..catch is intact.  This does mean that we could call getStackTrace() for
                        // the top of the stack instead of parsing the Moz native trace, but not currently
                        // doing this since it could hit recursion issues and might mislead you into
                        // thinking two arguments differed since our traces provide more information (eg
                        // they look for an ID and display that)
                        //if (method.caller) {
                        //    isc.logWarn("method.caller: " + isc.Func.getName(method.caller, true) +
                        //                "\n" + isc.Log.getCallTrace(method.caller.arguments));
                    } else {
                        functionName = functionName.replace(/_{1}/, ".");
                        functionName = functionName.replace(/_{2}/, "._");
                    }
                }
        
                output.append("    ", functionName, "(");
        
                var argString = this.extractArgumentsFromLine(line);
                var argNum = 0;
            
                while (argString && argString.length > 0) {
                    if (argNum > 0) output.append(", ");
                    if (argNames) output.append(argNames[argNum] + "=>");
                    var lastLength = argString.length;
                    argString = this._parseArgument(argString, output);
                    if (argString.length == lastLength) {
                        isc.logWarn("failure to parse next arg at:\n" + argString);
                        break;
                    }
                    argNum++;
                }
                                                    
                output.append(")");

                // add source path and line number
                var atIndex = line.lastIndexOf("@");
                output.append(this._getSourceLine(this.extractSourceFromLine(line), appDir, hostAndProtocol));

                output.append("\n");
            }

            this._output = output.toString();
        }
        // If there are any errors, we just store the stack itself as output
        catch (e) {
            this._output = this.stack;
        }
    },

    // parse an argument from a line in a native stack trace
    _parseArgument : function (argString, output) {
        //isc.logWarn("parsing argString: " + argString);
       
        var firstChar = argString.charAt(0);
    
        if (firstChar == "\"") { // string argument
            // look for an unquoted closing quote
            var stringEnd = argString.search(/[^\\]"/);
            if (stringEnd == -1) stringEnd = argString.length; // shouldn't happen
    
            var stringArg = argString.substring(0, stringEnd+2);
            // enforce max size
            if (stringArg.length > 40) {
                stringArg = stringArg.substring(0,40) + "...\"[ " + stringArg.length + "]";
            }
            output.append(stringArg);
            return argString.substring(stringEnd+3);
    
        } else if (firstChar == "[") { // object argument
            var closeBrace = argString.substring(1).indexOf("]"),
                objectString = argString.substring(0, closeBrace+2);
            // shorten this common case
            if (objectString == "[object Object]") objectString = "{Obj}";
    
            output.append(objectString);
            return argString.substring(closeBrace+3);
    
        } else if (argString.startsWith("(void 0)")) {
            output.append("undef");
            return argString.substring(9);
    
        } else if (argString.startsWith("undefined")) {
            output.append("undef");
            return argString.substring(10);
    
        } else if (argString.startsWith("(function ")) {
            var signature = argString.substring(1,argString.indexOf("{"));
            if (signature.endsWith(" ")) signature = signature.substring(0, signature.length-1);
            output.append(signature);
    
            var functionEnd = argString.indexOf("}),");
            if (functionEnd == -1) return ""; // no more arguments
            return argString.substring(functionEnd+3);
    
        } else { // other argument
            var nextComma = argString.indexOf(",");
            if (nextComma == -1) nextComma = argString.length;
            output.append(argString.substring(0, nextComma));
            return argString.substring(nextComma+1);
        }
    },
    
    // return an intelligently shortened version of the source file and line number
    _getSourceLine : function (sourceLine, appDir, hostAndProtocol) {
        // detect core modules
        var modulesStart = sourceLine.indexOf("/system/modules/ISC_"),
            devModulesStart = sourceLine.indexOf("/system/development/ISC_");
           
        // core modules: trim off everything but module name
        if (modulesStart != -1) {
            sourceLine = sourceLine.substring(modulesStart + 16);
        } else if (devModulesStart != -1) {
            sourceLine = sourceLine.substring(devModulesStart + 20) + "[d]";
        }

        if (modulesStart != -1 || devModulesStart != -1) {
            // option to not show core modules    
            if (!this.logIsDebugEnabled("traceLineNumbersCore")) return "";

            // core modules: trim out the version parameter (just noise)
            var versionIndex = sourceLine.indexOf("?isc_version");
            if (versionIndex != -1) {
                sourceLine = sourceLine.substring(0, versionIndex) +
                    sourceLine.substring(sourceLine.indexOf(":"));
            }
        }
           
        // other files: show obviously relative paths as relative
        if (sourceLine.startsWith(appDir)) {
            sourceLine = sourceLine.substring(appDir.length);
        } else if (sourceLine.startsWith(hostAndProtocol)) {
            sourceLine = sourceLine.substring(hostAndProtocol.length);
        }

        return " @ " + sourceLine;
    },

    // Return the normalized output
    toString : function () {
        return this._output;
    }
});

// Browser specific subclass for Mozilla etc. The lines from the native
// stack trace look something like this:
//
// eval("bob ==== 7;")@:0
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:45
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:40
// ()@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:36
// ([object Object],[object Object])@http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:56 
// isc_TestCase_run()@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29775
// isc_TestRunner_runTests(0)@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29920
// isc_TestRunner_init([object Object],(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0))@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29882
// isc_Class_completeCreation([object Object],(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0),(void 0))@http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:2323

isc.defineClass("MozStackTrace", isc.StackTrace).addProperties({
    // Parse a line from the stack and extract the function name
    extractFunctionFromLine : function (line) {
        var parenIndex = line.indexOf("(");
        return line.substring(0, parenIndex);
    },

    // Parse a line from the stack and extract the arguments
    extractArgumentsFromLine : function (line) {
        var parenIndex = line.indexOf("(");
        var atIndex = line.lastIndexOf("@");
        return line.substring(parenIndex + 1, atIndex - 1);
    },

    // Extract the source file and line numver from a line
    extractSourceFromLine : function (line) {
        var atIndex = line.lastIndexOf("@");
        if (atIndex >= 0) {
            return line.substring(atIndex + 1);
        } else {
            return "";
        }
    }
});

// Browser specific subclass for Google Chrome
// The lines from the native stack trace look something like this:
//
//    at Object.function3 (http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:45:9)
//    at Object.function2 (http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:40:21)
//    at Object.function1 (http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:36:21)
//    at Object.doTest (http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:56:24)
//    at Object.isc_TestCase_run [as run] (http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29775:13)
//    at Object.isc_TestRunner_runTests [as runTests] (http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29920:13)
//    at Object.isc_TestRunner_init [as init] (http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:29882:22)
//    at Object.isc_Class_completeCreation [as completeCreation] (http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:2323:6)
//    at Object.isc_c_Class_create (http://localhost:40011/isomorphic/system/modules/ISC_Core.js?isc_version=dev.js:1547:25)
//    at http://localhost:40011/isomorphic/QA/Debug/StackTrace.test:49:16  

isc.defineClass("ChromeStackTrace", isc.StackTrace).addMethods({ 
    _functionRegexp: /Object\.([^ ]+)/,
    _sourceRegexp: /\((.+)\)/,

    // Parse a line from the stack and extract the function name
    extractFunctionFromLine : function (line) {
        var match = line.match(this._functionRegexp);
        return match ? match[1] : "";
    },

    // Parse a line from the stack and extract the arguments
    // Chrome does not appear to show the arguments ...
    extractArgumentsFromLine : function (line) {
        return "";
    },

    // Extract the source file and line numver from a line
    extractSourceFromLine : function (line) {
        var match = line.match(this._sourceRegexp);
        return match ? match[1] : "";
    }
});

// Subclass for unsupported browsers
isc.defineClass("UnsupportedStackTrace", isc.StackTrace).addMethods({
    // For parseStack, just do nothing
    _parseStack : function () {

    },

    // Just return the stack itself
    toString : function () {
        return this.stack;
    }
});

