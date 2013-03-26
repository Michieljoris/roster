/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  inject : ['globals'], 
    factory: function(globals) {
        "use strict";
        var log = logger('type_location');
        log.d('Evaluating type_location');
        
        var fields = {
            name: { type: 'text', title: 'Name'} //should be unique within its type..
            ,address: { type: 'text'}
            ,suburb: { type: 'text'}
            ,state: { type: "comboBox",
                      valueMap: {
                          "QLD" : "QLD",
                          "NSW" : "NSW",
                          "SA" : "SA",
                          "NT" : "NT",
                          "WA" : "WA"  }
                    }
            ,phone: { type: 'text'}
            ,mob: { type: 'text'}
            ,email: { type: 'text'}
            ,postalCode: { type: 'text'}
            ,region: { type: 'text'}
            ,costCentre: { type: 'text'}
        };
        
        
    }});