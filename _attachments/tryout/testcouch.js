/*global Cookie:false $:false couchapi:false PBKDF2:false isc:false define:false emit:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:130 devel:true newcap:false*/
$.couch.urlPrefix = "http://localhost:5984";
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
        couchapi.addUser($scope.name, $scope.pwd, ["newrole"]).when(
            function(data) {
                console.log(data);
            }
        );
        // var userDoc = {
        //     // _id: "org.couchdb.user:" + $scope.name,
        //     name: $scope.name
        //     ,roles:['somerole']
        // };
        // $.couch.signup(userDoc, $scope.pwd, {
        //     success: function(data) {
        //         console.log(data);
        //     },
        //     error: function(status) {
        //         console.log(status);
        //     }
        // });
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
        couchapi.session().when( function(data) {
            console.log(data);
        });
    };
    
    $scope.dbInfo = function() {
        couchapi.dbInfo($scope.dbName).when(
            function(data) {
                console.log(data);
            },function(data) {
                console.log(data);
            }
        );
    };
    
    $scope.logout = function() {
        $.couch.logout({
            success: function(data) {
                console.log(data);
            }
        });
    };
    $scope.setDbProperty = function() {
        $.couch.db('atest').setDbProperty('_security', {}, {
            success: function(data) {
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
            
        });
       }; 
    $scope.getDbProperty = function() {
        $.couch.db('atest').getDbProperty('_security', {
            success: function(data) {
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
            
        });
       }; 
    $scope.config = function() {
        $.couch.config({
            success: function(data) {
                console.log(data);
            },
            error: function(status) {
                console.log(status);
            }
        },'bla','blaa','bla');
    };
    $scope.salt = '77bac623e30d91809eecbc974aecf807';
    $scope.pwd = 'password';
    $scope.hash = function() {
        var key = new PBKDF2($scope.pwd, $scope.salt, 10, 20).deriveKey();
        console.log('result =' + key);
    };
    $scope.active = function() {
        couchapi.activeTasks().when(
           function(data) {
              console.log(data); 
           } 
           ,function(data) {
              console.log(data); 
           } 
        );
       }; 
    $scope.replicateRemove = function() {
        couchapi.replicationRemove($scope.repId).when(
            function(data) {
                console.log(data);
            }
            ,function(data) {
                console.log(data);
            }
        );
       }; 
    $scope.replicate = function() {
        console.log('replicate');
        couchapi.replicationAdd($scope.repId, {
            source: $scope.source
            ,target: $scope.target
            ,create_target: true
            ,continuous: $scope.continuous
            ,role: '_admin'
        }).when(
            function(data) {
                console.log(data);
            }
            ,function(data) {
                console.log(data);
            }
        );
    };
    
}
