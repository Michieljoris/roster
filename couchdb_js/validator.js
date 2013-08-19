/*global toJSON:false exports:false */

function init(rules, userCtx) {
    "use strict";
    
    function equals(o1, o2) {
        function isArray(value) {
            return Object.prototype.toString.apply(value) === '[object Array]';
        }

        function isDate(value){
            return Object.prototype.toString.apply(value) === '[object Date]';
        }
    
        if (o1 === o2) return true;
        if (o1 === null || o2 === null) return false;
        if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
        var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 === t2) {
            if (t1 === 'function') {
                return t1.toString() === t2.toString();
            }
            else if (t1 === 'object') {
                if (isArray(o1)) {
                    if (!isArray(o2)) return false;
                    if ((length = o1.length) === o2.length) {
                        for(key=0; key<length; key++) {
                            if (!equals(o1[key], o2[key])) return false;
                        }
                        return true;
                    }
                } else if (isDate(o1)) {
                    return isDate(o2) && o1.getTime() === o2.getTime();
                } else {
                    if (isArray(o2)) return false;
                    keySet = {};
                    for(key in o1) {
                        if (!equals(o1[key], o2[key])) return false;
                        keySet[key] = true;
                    }
                    for(key in o2) {
                        if (!keySet.hasOwnProperty(key) &&
                            o2[key] !== undefined ) return false;
                    }
                    return true;
                }
            }
        }
        return false;
    }


    var validateDoc;
    var cachedRules;
    var validateUser;
    var cachedUserCtx;

    // function startsWith(str, c) {
    //     return str.indexOf(c) === 0;
    // }


    // function getRules(rules) {
    //     var restrictions =
    //         rules.filter(function(e) {
    //             return startsWith(e, '_');
    //         });
    //     return restrictions;
    // };


    function compileRules(rules) {
        // var newRules = toJSON(rules);
        // if (newRules === oldRules)
        //     return docValidator;
        // oldRules = newRules;
        // rules = getRules(rules);
    
        // docValidator = function() {};
        // return docValidator;
        validateDoc = function() {};
        cachedRules = rules;
    }

    //////--------------------------------------
    
    function parse(rule) {
        var dq = '"'; 
        var ignoreQuote;
        var inQuote;
        var firstHalf, secondHalf;
        var result = {};
        for (var i=0; i < rule.length; i++) {
            if (rule[i] === dq && !ignoreQuote) {
                inQuote = !inQuote;
            } 
            else if (inQuote) {
                if (rule[i] === '\\') ignoreQuote = true;
                else ignoreQuote = false;
            } 
            else if (rule[i] === '|' && !inQuote) {
                firstHalf = rule.slice(0, i);
                secondHalf = rule.slice(i + 1);
                break;
            }
        }
        
        firstHalf = 'firstHalf = {' + firstHalf + '}';
        eval(firstHalf);
        secondHalf = secondHalf.trim();
        if (secondHalf.indexOf('NOT') === 0)  {
            result.type = 'not';
        }
        else if (secondHalf.indexOf('ONLY') === 0)  {
            result.type = 'only';
        }
        console.log(firstHalf, secondHalf);
        
    }
    
    function compileUserCtx(userCtx) {
        var user = userCtx.name;
        var db = userCtx.db;
        
        userCtx.roles = userCtx.roles || [];
    
        var restrictions = userCtx.roles.filter(function(r) {
            return r.indexOf( 'restrict_') === 0;
        }).map(function(r) {
            r = r.slice(9);
            r = parse(r);
        });
    
        
        validateDoc = function() {


            
        };
        cachedUserCtx =userCtx;
    }


    if (!equals(rules, cachedRules)) compileRules(rules);
    if (!equals(userCtx, cachedUserCtx)) compileUserCtx(userCtx);
    
    return {
        validateDoc: validateDoc,
        validateUser: validateUser
    };
}

exports.init = init;


    // var a = "type:'loc|ation', id:user | NOT: salt, key" 
