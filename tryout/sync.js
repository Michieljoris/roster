/*global logger:false $:false Pouch:false VOW:false Cookie:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

(function() {
    "use strict";
    var log = logger('sync');
    var testing = true;
    var result;
    var localUrl, remoteUrl;
    
    function openDB(url, options) {
        var vow = VOW.make();
        new Pouch(url, options, function(err, db) {
            if (err) {
                var text =  err.statusText ?
                    err.statusText : err.reason ?
                    err.reason : err.status;
                text = ["Can't open database " + url,   'Reason: ' + text];
                vow['break'](text);
                
            }
            else vow.keep(db);
        });
        return vow.promise;
    }

    function replicate(db1, db2) {
        var vow = VOW.make();
        db1.replicate.to(db2, function(err, changes) {
            if (err) {
                log.d('in replicate error');
                vow['break'](['Replicating from ' + db1.url + ' to ' +
                              db2.url + ' produced errors: ' + err]) ;
            }
            else {
                log.d('in replicate ok');
                result = result.concat(['Replicated ' + db1.url + ' to ' + db2.url,
                              '\nDocs read: ' + changes.docs_read, 
                              '\n Docs written: ' + changes.docs_written]);
                vow.keep();
            }
            
        });
        return vow.promise;
    }
    
    function sync(dbs) {
        log.d('in sync');
        dbs[0].url = localUrl;
        dbs[1].url = remoteUrl;
        return replicate(dbs[0], dbs[1]).when(
            function () {
                return replicate(dbs[1], dbs[0]);
            }
        );
    }

    function startSyncing() {
        result = [];
        VOW.every([
            openDB(localUrl, { adapter:'idb'}),
            openDB(remoteUrl, { adapter:'http'})
        ]).when(
            sync 
        ).when(
            function() {
                console.log('dfa',result);
                $('#sync').html(result.join('<br>'));
            },
            function(err) {
                $('#sync').html(err.join('<br>'));
                console.log(err);
            }
        );

    } 
    
    function parseCookie(cookie) {
        localUrl = 'db14';
        remoteUrl = 'http://localhost:8090/local/repto';
    }
    
    var cookie = Cookie.get('sync');
    parseCookie(cookie);
    
    if (cookie || testing) {
        Cookie.remove('sync');
        window.stop();
        startSyncing();
    }
    
})();
