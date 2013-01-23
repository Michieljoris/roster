/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['globals', 'pouchDS',
             'isc_components/multicap_timesheet',
             'calculateTimesheet', 'fetchTimesheetShifts'],
   factory: function(globals, datasource, Timesheet,
                     calculateTimesheet, fetchShifts) 
    { "use strict";
      var log = logger('timesheet');
      var observer;
      
      var currentState;
      var defaultState = { person:'', location:'', fortnight: Date.parse('2013-01-01')};
      
      var fortnightStart = Date.parse('2000, 1 Jan').getTime();
      var fortnightLength = 14 *  24 * 60 * 60 *1000;
      // var fortnight;
      // var person;
      // var location;
      var state;
      
      // var settings = {
      //     // minimumShiftLength: 10,
      //     // maximumShiftLength: 600,
      //     // eventSnapGap: 15, //only works with a refresh
      //     // workdayStart: '6:00',
      //     // workdayEnd: '22:00',
      //     // currentViewName: 'week', //day, week or month
      //     chosenDate: new Date()
      // };
      
      function getState() {
          log.d('GETTING STATE:', state);
          log.d('+++++++++++++++++++++++++++++');
          // state =  isc.addProperties(state, {
          //     fortnight: fortnight,
          //     location: location,
          //     person: person
          // });
          currentState = isc.clone(state);
          // log.d(currentState, state);
          return currentState;
      } 
      
      function setState(someState) {
          if (currentState !== undefined && state === currentState) {
              log.d('Same, so not setting state', state);
              return;
          }
          log.d('and its new state is:', someState);
          
          state = isc.addProperties(defaultState, isc.clone(someState));
          // person = state.person; location = state.location; 
          if (typeof state.fortnight === 'string') {
              state.fortnight = Date.parse("2013-01-11T14:00:00");
          }
          // else fortnight = state.fortnight;
          log.d('SETTING STATE:', state);
          state.fortnight = calculateFortnight(state.fortnight);
          fortnightLabel.setContents(fortnightToString(state.fortnight));
          // fetchShifts(person, location, fortnight, setShifts);
          personForm.setValue('person', state.person);
          locationForm.setValue('location', state.location);
          // calculateTimesheet.go(state.person, state.location, state.fortnight);    
      }
      
      function setShifts(data) {
          log.d('Fetched shifts and they are:', data.shifts);
          personForm.setValue('person', data.person._id);
          locationForm.setValue('location', data.location._id);
      }
      
      var timesheet = Timesheet.create({
          overflow:'auto',
          showResizeBar: false,
          padding: 35
      });
      
      var personPickList = { name: "person",
                             type: 'enum',
                             // type: "select",
                             editorType: 'comboBox',
                             required: true, 
                             change: function (form) {
                                 state.person = form.getField('person')
                                     .pickList.getSelectedRecord();
                                 state.person = state.person._id;
                                 observer('timesheet');
                                 log.d('PICKLIST', state.person);
                             },
                             // ID: 'personPickList' ,
                             showTitle: false,
                             // startRow: true,
                             // multiple: true,
                             multipleAppearance: 'picklist',
                             optionDataSource: datasource,
                             filterLocally: true, 
                             pickListCriteria: { type: 'person'},
                             displayField: 'name',
                             valueField: '_id',
                             width:180
                             // colSpan:2
                             // ,icons: [{
                             //     // src: isc.Page.getSkinDir() +"images/actions/edit.png",
                             //     src: 'home.png'
                             //     // click: "isc.say(item.helpText)"
                             //     //TODO: make drag drop shift worker editor
                             // }]
                           };
    
      var locationPickList = { name: "location",
                               type: 'enum',
                               // type: "select",
                               editorType: 'comboBox',
                               required: true, 
                               change: function (form) {
                                   state.location = form.getField('location')
                                       .pickList.getSelectedRecord();
                                   state.location = state.location._id;
                                 observer('timesheet');
                                 log.d('PICKLIST', state.location);
                               },
                          
                               // ID: 'locationPickList' ,
                               showTitle: false,
                               startRow: false,
                               // multiple: true,
                               // multipleAppearance: 'picklist',
                               align: 'left',
                               optionDataSource: datasource,
                               filterLocally: true, 
                               pickListCriteria: { type: 'location'},
                               displayField: 'name',
                               valueField: '_id'
                               ,width:180
                               // width:340,
                               // colSpan:1
                               // icons: [{
                               //     src: isc.Page.getSkinDir() +"images/actions/edit.png",
                               //     click: "isc.say(item.helpText)"
                               //     //TODO: make drag drop shift worker editor
                               // }]
                             };
      
      var personForm = isc.DynamicForm.create({fields: [personPickList]});
      
      var locationForm = isc.DynamicForm.create({fields: [locationPickList]});

      
      
      function getDateStr(d) {
          return d.getShortDayName() + '  ' + d.getDate() + ' ' + d.getShortMonthName() + ' ' +
              d.getFullYear();
      }
      
      function fortnightToString(date) {
          var endFortnight = date.clone().addDays(13);
          return getDateStr(date) + ' - ' + getDateStr(endFortnight);
      }
      
      function calculateFortnight(date) {
          var time = date.getTime();
          var n = Math.floor((time - fortnightStart)/fortnightLength);
          return new Date(fortnightStart + n * fortnightLength);
      }
      
      
      var pickFortnightForm = isc.DynamicForm.create({
          autoDraw: false,
          // cellBorder: 1,
          numCols: 3,
          // height: 48,
          padding:4,
          fields: [
              { type: "BlurbItem", value: 'Pick the first or any other day of the fortnight you want to calculate:'},
              {name: "date", showTitle: false
               ,colSpan:2,
               type: "date", //titleOrientation: 'top',
               change: function() {
                   log.d(arguments[2]);
                   var fortnight = calculateFortnight(arguments[2]);
                   pickFortnightForm.setValue('fortnightLabel', fortnightToString(fortnight));
                   pickFortnightForm.setValue('date', fortnight);
                   log.d('date changed'); }},
              
              { type: "BlurbItem", value: 'This date falls in the fortnight of:'},
              { name: 'fortnightLabel', type: "BlurbItem", value: '12 Dec - 14 Jan'}
              // { name: 'static', type: "StaticTextItem", value: 'blabla', startRow: true},
              
          ] 
      });
      
      var okButton = isc.Button.create({
          title: "Ok",
          width: 40,
          click: function fortnightPicked() {
              state.fortnight = pickFortnightForm.getValue('date');
              setFortnightLabel();
              pickFortnightWindow.hide(); 
          }

          });
      
      var cancelButton = isc.Button.create({
          title: "Cancel",
          width: 40,
          click: function() { pickFortnightWindow.hide(); }
      });

       var pickFortnightWindow = isc.Window.create({
           title: "Choose a fortnight:",
           autoSize: true,
           width: 350,
           // height:370,
           canDragReposition: true,
           canDragResize: false ,
           showMinimizeButton:false, 
           autoCenter: true,
           isModal: true,
           showModalMask: true,
           autoDraw: false
           ,items: [
               pickFortnightForm,
               // isc.LayoutSpacer.create({ height: 20}),
               isc.HLayout.create({
                   layoutMargin: 6,
                   membersMargin: 6,
                   // border: "1px dashed blue",
                   height: 30,
                   width: '100%',
                   members: [
                       cancelButton,
                       isc.LayoutSpacer.create(),
                       okButton 
                   ] 
               })
           ]
       });
      
      var fortnightLabel = isc.Label.create({
          contents: 'fortnight' ,
          align: 'center',
          width: 200
      });
      
      function setFortnightLabel() {
          observer('timesheet');
          fortnightLabel.setContents(fortnightToString(state.fortnight));
          
      }
      
      var buttonWidth = 10; 
      var layout = isc.VLayout.create({
          members: [
              isc.HLayout.create({
                  align: 'left',
                  height: 25,
                  members: [
                      isc.Button.create({
                          width:100,				
                          title: 'Print',
	                  height: '100%',
	                  icon:"print.png"
                      })
                      ,isc.LayoutSpacer.create({width: 25})
                      ,isc.Button.create({
                          width: 22,				
                          title: '',
	                  icon:"date_control.png"
                          ,click: function() {
                              pickFortnightForm.setValue('fortnightLabel',
                                                         fortnightToString(state.fortnight));
                              pickFortnightForm.setValue('date', state.fortnight);
                              pickFortnightWindow.show();
                          }
                      })
                      ,isc.LayoutSpacer.create({width: 5})
                      ,isc.Button.create({
                          width: 22,				
                          title: '',
	                  icon:"arrow_left.png"
                          ,click: function() {
                              state.fortnight.addWeeks(-2);
                              setFortnightLabel();
                          }
                      })
                      ,fortnightLabel
                      ,isc.Button.create({
                          width: 22,				
                          title: '',
	                  icon:"arrow_right.png"
                          ,click: function() {
                              state.fortnight.addWeeks(2);
                              setFortnightLabel();
                          }
                      })
                      ,isc.LayoutSpacer.create({width: 25})
                      ,isc.Label.create({
                          width:buttonWidth,				
                          title: '',
	                  icon:"person.png"
                      })
                      ,personForm
                      ,isc.LayoutSpacer.create({width: 25})
                      ,isc.Label.create({
                          width:buttonWidth,				
                          title: '',
	                  icon:"home.png"
                      })
                      ,locationForm
                  ]
              })
              ,timesheet
          ] 
          
          
          
          ,notify: function(newState) {
              log.d('timesheet is notified');
              setState(newState);
          }
          ,getState: getState
          ,setObserver: function(f) {
              observer = f;
          }
          ,name: 'Timesheet'
        
      });
      
      
      
      
      return layout;
     
     
    }});