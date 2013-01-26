/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  //inject : ['globals'], 
    factory: function() {
        "use strict";
        var log = logger('type_role');
        log.d('Evaluating type_role');
        
        var fields = {
            name: { type: 'text'}
            ,canAddViews: { type: 'boolean' ,
                            description: "Whether the user can add/remove views"}
        };
        
    }});