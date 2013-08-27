function isArray(value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
}

function test(doc, req) {
    if (!req.query) return true;
    var q = req.query;
    return Object.keys(q).some(function(k) {
        if (isArray(q[k]))
            return q[k].some(function(v) {
                return v === doc[k];
            });
        else return q[k] === doc[k];
    }); 
}

var a =test({ a:1, b:3 }, { query: { a: [3,2], b: [3,4] }});
console.log(a);

