
/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['View', 
             'views/extcalendar/isc_extCalendar'
            ],
   factory: function(View, TimesheetWW)
    
    { "use strict";
      var log = logger('extCalendar');
      
      var view = View.create({
          type: 'Calendar2'
          ,alwaysSet: true
          ,icon: 'calendar.png'
          ,defaultState: { }
          // ,sync: function(state) {
          //     log.d('UPDATING STATE:', state);
          // } 
          ,init: function() {
              // var dataSource = View.getBackend().getDS();
              // personForm.getField('person').setOptionDataSource(dataSource);
              // locationForm.getField('location').setOptionDataSource(dataSource);
          }
          ,set: function(state) {
              log.d('SETTING STATE:', state);
              // if (typeof state.fortnight === 'string') {
              //     var fn = state.fortnight;
              //     log.d('parsing: ', fn);
              //     state.fortnight = Date.parseSchemaDate(state.fortnight);
              // }
              // state.fortnight = calculateFortnight(state.fortnight);
              // setData(state);
          }
          
           
      });
      
      
      var isc_extCalendar = TimesheetWW.create({
          ID: 'extCalendar',
          overflow:'auto',
          showResizeBar: false,
          padding: 35,
          height: '100%',
          width: '100%' 
      });
      
      var layout = isc.VLayout.create({
          members: [
              isc_extCalendar
          ] 
      });
      
      
      view.setCmp(layout);
      return view;
    }});