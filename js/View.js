/*global isc:false logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:90 devel:true*/

define
// ({inject: ['globals', 'table', calendar' ],
({//inject: [],
  factory: function() {
      var log = logger('View');
      
      function create(data) {
          if (!data.defaultState) data.defaultState = {};
          var state = data.defaultState;
          var observer, cmp;
          return {
              getDefaultState: function () {
                  return data.defaultState;
              },
              getType: function () {
                  return data.type;
              },
              getIcon: function() {
                  if (!data.icon)
                      return isc.Page.getSkinDir() +"images/actions/add.png";
                  return data.icon;
              }
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
                  // if (!state) state = {};
                  if (data.sync) data.sync(state);
              }
              ,set: function(someState) {
                  if (someState && someState === state) {
                      log.d('Same, so not setting state', state);
                      return;
                  }
                  log.d('Setting view to its new state:', someState);
                  if (!someState) someState = isc.clone(data.defaultState);
                  state = someState;
                  if (data.set) data.set(state);
              }
              ,getState: function() {
                  return state;
              }
          };    
      }
      
      return {
          create:create
      }; 
  }});