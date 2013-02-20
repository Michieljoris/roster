/*global isc:false logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
// ({inject: ['globals', 'table', calendar' ],
({//inject: [],
  factory: function() {
      var log = logger('View');
      
      var backend;
      
      function create(data) {
          // log.d(data.type, data.defaultState.fortnight);
          if (!data.defaultState) data.defaultState = {};
          var state = data.defaultState;
          var observer, cmp;
          return {
              init: typeof data.init === 'function' ? data.init : function() {}
              // getDefaultState: function () {
              //     return isc.clone(data.defaultState);
              // },
              ,getType: function () {
                  return data.type;
              }
              // ,getIcon: function() {
              //     if (!data.icon)
              //         return isc.Page.getSkinDir() +"images/actions/add.png";
              //     return data.icon;
              // }
              ,setCmp: function(someCmp) {
                  cmp = someCmp;
              }
              ,getCmp: function() {
                  return cmp;
              }
              ,setObserver: function(f) {
                  observer = f;
              }
              ,modified: function() {
                  if (observer) observer(data.type);
              }
              ,sync: function() {
                  log.d('in sync of view: ' + data.type);
                  if (data.sync) data.sync(state);
              }
              ,set: function(someState) {
                  if (!data.alwaysSet && someState && someState === state) {
                      log.d('Same, so not setting state', state);
                      return;
                  }
                  // if (!someState) someState = isc.clone(data.defaultState);
                  state = someState;
                  log.d('Setting view '+ data.type + ' to its new state:', state);
                  if (data.set) data.set(state);
              }
              ,getState: function() {
                  return state;
              }
              ,create: function() {
                  return isc.clone(state);
                  // return isc.clone(defaultState);
              }
              ,getIcon: function() { log.d('getting icon', data.icon); return data.icon; }
          };    
      }
      
      return {
          create:create
          ,setBackend: function(aBackend) {
              backend = aBackend;
          }
          ,getBackend: function() {
              return backend;
          }
      }; 
  }});