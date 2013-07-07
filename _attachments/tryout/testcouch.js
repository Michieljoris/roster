/*global Cookie:false $:false Pouch:false logger:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/
$.couch.urlPrefix = CouchDB.urlPrefix = "http://localhost:5984";
function myapp($scope) {
    "use strict" ;
    $scope.info = function () {
        console.log('info');
        $.couch.info({
            success: function(data) {
                console.log(data);
            }
        });
    };
    
    $scope.allDbs = function() {
        console.log('allDbs');
        $.couch.allDbs({
            success: function(data) {
                console.log(data);
            }
        
        });
    }; 

    $scope.signup = function() {
        var userDoc = {
            _id: "org.couchdb.user:" + $scope.name,
            name: $scope.name
        };
        $.couch.signup(userDoc, $scope.pwd, {
            success: function(data) {
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
        });
    };
    $scope.login = function() {
        $.couch.login({
            // url: 'http://127.0.0.1:5984',
            name: $scope.name,
            password: $scope.pwd,
            withCredentials:true,
            success: function(data) {
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
        });
    };
    $scope.session = function(){
        $.couch.session({
            success: function(data) {
                console.log(data.userCtx);
            }
        });
    };
    $scope.logout = function() {
        $.couch.logout({
            success: function(data) {
                console.log(data);
            }
        });
    };
    $scope.config = function() {
        $.couch.config({
            success: function(data) {
                console.log(data);
            }
        },'cors','blaa','bla');
    };
    
}
