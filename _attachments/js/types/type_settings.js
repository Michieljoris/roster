/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  //inject : ['globals'], 
    factory: function() {
        "use strict";
        var log = logger('type_settings');
        log.d('Evaluating type_settings');
        
        var behaviourFields = {
            fortnightStart: { type: 'boolean',
                               description: 'whether 26/1/2013 is the start of a fortnight' +
                             ' from Sat to Fri'}   
            ,datasource: { type: 'text',
                           description: 'only one datasource sofar, namely pouchDS'}
           };
        
        var lookFields = {
            uiState: { type: 'text',
                       description: 'JSON string of the state of the ui' } 
           };
        
        var permissionFields = { 
            p_saveUiState: { type: 'boolean', showIf: 'false',
                              description: 'Whether the user can persist any changes' +
                                ' to the look of the application'} 
        };
        
    }});