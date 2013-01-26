/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  inject : ['globals'], 
    factory: function(globals) {
        "use strict";
        var log = logger('type_person');
        log.d('Evaluating type_person');
        
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
            ,firstName: { type: 'text'}
            ,lastName: { type: 'text'}
            ,sex: { type: 'text'}
            ,award: { type: 'text'}
            ,login: { type: 'text'}
            ,autoLogin: { type: 'text'}
            ,password: { type: 'text'}
            ,dswCALevel:  { type: 'text' }
            ,payrollNumber: { type: 'text'}
            ,status: { type: 'text ',
                       valueMap: ['permanent', 'part time', 'casual']
                     }
            //references to other docs, containing their _id's
            ,role: { type: 'text' }
            ,settings: { type: 'text' }
        };
        
        
        
    }});