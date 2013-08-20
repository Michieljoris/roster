/*global console:false exports:false */
/*jshint globalstrict:true*/

"use strict";

var validateDoc;
var cachedRules;
var validateUser;
var cachedUserCtx;


function isArray(value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
}

function isDate(value){
    return Object.prototype.toString.apply(value) === '[object Date]';
}

var code = {
    defined: {
        id: '',
        test: function(value) { return typeof value !== 'undefined'; }
    },
    array: {
        id: '',
        test: isArray
    },
    string: {
        id: '',
        test: function(value) { return typeof value == 'string'; }
    },
    object: {
        id: '',
        test: function(value) {
            var toString = Object.prototype.toString.apply(value);
            return typeof value === 'object' &&
                toString !== '[object Array]' &&
                toString !== '[object Date]';
        }
    },
    date: {
        id: '',
        test: isDate
    },
    number: {
        id: '',
        test: function(value) { return typeof value === 'number'; }
    },
    notdefined: {
        id: '',
        test: function(value) { return typeof value === 'undefined'; }
    },
    illegal: {
        id: '',
        test: function(doc, key) {
            for (var k in doc) {
                if (k === key) return false;
            }
            return true;
        }
    }
};

var defined = code.defined.id, array = code.array.id, string = code.string.id, object = code.object.id,
    date = code.date.id, number = code.number.id, illegal = code.illegal.id, notdefined = code.notdefined.id;

var test = (function() {
    var obj = {};
    Object.keys(code).forEach(function(k) {
        obj[code[k].id] = code[k].test;
    });
    return obj;
})();


function equals(o1, o2) {
    
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

function parseDbRule(rule) {
    rule = 'rule = {' + rule + '}';
    try { eval(rule); } catch(e) {
        throw({ source: rule, error: e.message });
    }
    var fixedValues = {},
        testValueType = {},
        testIllegality = [];
    for (var k in rule) {
        if (test
    }
    
    return {
        fixedValues: fixedValues,
        testValueType: testValueType,
        testIllegality: testIllegality
    };
} 
// var tst = {
//     f1: "str", f2: 123, f2a: [1,2,3] //literals
//     ,f3: defined, //typeof f3 !== 'undefined'
//     f4:array, f5:string, f6:date, f7:object, f8:number, //type
//     f9:illegal, //not even the key can exist
//     f10:notdefined //key can exist, but cannot have a value
// };

function getDocTest(rule) {
    var newTest = function(doc) {
        var k;
        for (k in rule.fixedValues) {
            if (!equals(doc[k], rule[k])) return false; }
        for (k in rule.testValueType) {
            if (!rule[k](doc[k])) return false;
        }
        for (k in rule.testIllegality) {
            if (!rule[k](doc, k)) return false;
        }
        return true;
    };
    
    return newTest;
}

function compileRules(rules) {
    rules = rules.filter(function(r) {
        return r.indexOf('_') === 0;
    }).map(function(r) {
        r = parseDbRule(r.slice(1));
        r.test = getDocTest(r);
        return r;
    });
    
    
    cachedRules = dbRules;
    validateDoc = function(doc) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].test(doc)) return true;
        }
        return false;
    };
    return validateDoc;
}

//////--------------------------------------

function parse(rule, user) {
    //user might be used in the eval..
    var dq = '"', ignoreQuote, inQuote, objStr, keysString, ch;
    
    for (var i=0; i < rule.length; i++) {
        ch = rule[i];
        if (ch === dq && !ignoreQuote) {
            inQuote = !inQuote;
        } 
        else if (inQuote) {
            if (ch === '\\') ignoreQuote = true;
            else ignoreQuote = false;
        } 
        else if (ch === '|' && !inQuote) {
            objStr = rule.slice(0, i);
            keysString = rule.slice(i + 1);
            break;
        }
    }
    
    var obj;
    var str = 'obj = {' + objStr + '}';
    try { eval(str); } catch(e) {
        throw({ source: objStr, error: e.message });
    }
    
    var colonPos = keysString.indexOf(':');
    if (colonPos === -1)
        return { rule: rule, error: 'colon missing'};
    var type = keysString.slice(0, colonPos).
        indexOf('NOT') === -1 ? 'only': 'not';
    keysString = keysString.slice(colonPos + 1);
    
    var keys = [];
    var key = [];
    var state = 'waitingForNextKey';
    
    for (i=0; i < keysString.length; i++) {
        ch = keysString[i];
        if (state === 'readLiteral') {
                state = 'parsingQuotedKey';
            key.push(ch);   
        }
        else if (state === 'parsingQuotedKey') {
            if (ch === '\\') state = "readLiteral";
            else if (ch === dq) {
                keys.push(key.join(''));
                state = 'waitingForNextKey';
            }
            else key.push(ch); } 
        else if (state === 'parsingKey') {
            if (ch === ' ') {
                keys.push(key.join(''));
                state = 'waitingForNextKey';
            }
            else key.push(ch); 
        } 
        else if (state === 'waitingForNextKey') {
            if (ch === ' ') ;
            else { key = [];
                   if (ch === dq) state = 'parsingQuotedKey';
                   else { key.push(ch);
                          state = 'parsingKey';   
                        }
                 }
        }
    }
    
    if (state === 'parsingQuotedKey')
        throw { source: rule, error: 'ending quote missing' };
    if (state === 'parsingKey') keys.push(key.join(''));
    
    return { rule: rule, fixedValues: obj, type: type, keys: keys };
}

function getAllowedRules(array, currentDb) {
    array = array || [];
    var rules = [];
    array.forEach(function(r) {
        var isRule =  r.indexOf( 'allow_') === 0;
        if (isRule) {
            var nextUnderScore = r.indexOf('_', 9);
            console.log('yes it starts with allow_', nextUnderScore);
            var db = r.slice(9, nextUnderScore);
            if (db === '*' || db === currentDb)
                rules.push(r.slice(nextUnderScore + 1));
        }
    });
    return rules;
} 


function getUserTest(r) {
    var test = {};
    test.only = function(newDoc, oldDoc) {
        var key;
        for (key in r.fixedValues) oldDoc[key] = r.fixedValue[key];
        for (key in r.keys) oldDoc[key] = newDoc[key];
        return equals(newDoc, oldDoc);
    };
    
    test.not = function(newDoc, oldDoc) {
        var key;
        for (key in r.fixedValues) {
            if (!equals(newDoc[key], r.fixedValues[key])) return false;
        }
        for (key in r.keys) {
            if (!equals(newDoc[key], oldDoc[key])) return false;
        } 
        return true;
    };
    
    return test[r.type];
}

function compileUserCtx(userCtx) {
    var user = userCtx.name;
    var allowedRules = getAllowedRules(userCtx.roles, userCtx.db);
    
    allowedRules = allowedRules.map(function(r) {
        var parsed = parse(r, user);
        parsed.test = getUserTest(parsed);
        return parsed;
    });
    
    cachedUserCtx =userCtx;
    validateUser = function(newDoc, oldDoc) {
        for (var i = 0; i < allowedRules.length; i++) {
            if (allowedRules[i].test(newDoc, oldDoc)) return true;
        }
        return false;
    };
    return validateUser;
}


function init(dbRules, userCtx) {
    
    return {
        validateDoc: equals(dbRules, cachedRules)  ? validateDoc : compileRules(dbRules)
        ,validateUser: equals(userCtx, cachedUserCtx)  ? validateDoc : compileUserCtx(userCtx)
    };
}

exports.init = init;


// var a = "type:'loc|ation', id:user | NOT: salt, key" 
