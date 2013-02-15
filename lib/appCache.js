// console.log('In appCache');

var appCache = window.applicationCache;
function handleCacheEvent(e) {
    var bar;
    switch (e.type) {
      case  'updateready':
        if (appCache.status === appCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            if (confirm('A new version of this web application is available. If you select Ok, the browser will refresh the page and load the new version. If you select Cancel you can continue using the app as it is, and the browser will load the new version next time the page is refreshed (by F5, Control-r or a restart of the browser).')) {
                window.location.reload();
            }
        } 
        break;
      case 'noupdate':
        
        // console.log('my appcache event:', e);
        bar = document.getElementById('progressBar');
        bar.value = 100;
        // bar.style = 'visibility:hidden';
        break; 
      case 'progress' : 
        
        // text = document.getElementById('statusUpdate');
        bar = document.getElementById('progressBar');
        bar.value =  Math.floor(e.loaded/e.total * 100);
        // text.innerHTML = 'Loading app into cache ' + Math.floor(e.loaded/e.total * 100) + '%';
        // console.log(e);
        break;
    default:   
        // Manifest didn't change. Nothing new to server.
        //...
    }
} 

function handleCacheError(e) {
    alert('Error: Cache failed to update!');
    console.log('what',e);
}

// Fired after the first cache of the manifest.
appCache.addEventListener('cached', handleCacheEvent, false);

// Checking for an update. Always the first event fired in the sequence.
appCache.addEventListener('checking', handleCacheEvent, false);

// An update was found. The browser is fetching resources.
appCache.addEventListener('downloading', handleCacheEvent, false);

// The manifest returns 404 or 410, the download failed,
// or the manifest changed while the download was in progress.
appCache.addEventListener('error', handleCacheError, false);

// Fired after the first download of the manifest.
appCache.addEventListener('noupdate', handleCacheEvent, false);

// Fired if the manifest file returns a 404 or 410.
// This results in the application cache being deleted.
appCache.addEventListener('obsolete', handleCacheEvent, false);

// Fired for each resource listed in the manifest as it is being fetched.
appCache.addEventListener('progress', handleCacheEvent, false);

// Fired when the manifest resources have been newly redownloaded.
appCache.addEventListener('updateready', handleCacheEvent, false);

// applicationCache.addeventListener(applicationCache.UPDATEREADY, function() {
//     alert('Update ready');

// });