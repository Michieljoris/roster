/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
   inject: ['globals', 'pouchDS', 'isc_components/multicap_timesheet', 'calculateTimesheet'],
   factory: function(globals, datasource, Timesheet, calculateTimesheet) 
    { "use strict";
      var log = logger('timesheet');
      var observer;
      
      var currentState;
      var defaultState = { person:'guest', location:'E745F82E-1CC9-46B5-A320-38F9595C6847', fortnight:'2013-01-01T11:00:00.000Z'};
      
      var fortnightStart = Date.parse('2000, 1 Jan').getTime();
      var fortnightLength = 14 *  24 * 60 * 60 *1000;
      var fortnight;
      var person;
      var location;
      
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
          var state =  isc.addProperties(currentState, {
              // grid: dataTable.getViewState(),
              // criteria : dataTable.getFilterEditorCriteria(),
              
              // //editor
              // height: (function() {
              //     if (stack.sectionIsExpanded('Editor')) 
              //         return dataTable.getHeight();
              //     else return editorHeightExpanded;
              // })(),
              // isExpanded: stack.sectionIsExpanded('Editor')
          });
          // isc.addProperties(state, tableFilter.getState());
          // log.d('getTableState', isc.clone(state));
          currentState = isc.clone(state);
          return currentState;
      } 
      
      function setState(state) {
          log.d("hello from timesheet");
          if (currentState !== undefined && state === currentState) return;
          
          state = isc.addProperties(defaultState, isc.clone(state));
          log.d(state);
          person = state.person; location = state.location; fortnight = state.fortnight;
          // calculateTimesheet.go(state.person, state.location, state.fortnight);    
      }
      
      var timesheet = Timesheet.create({
          overflow:'auto',
          showResizeBar: false,
          padding: 35
      });
      
      
      var fortnightPickList = { name: "fortnight",
                                // type: 'enum',
                                type: "select",
                                // editorType: 'comboBox',
                                required: true, 
                          
                                change: function (form) {
                                    fortnight = form.getField('fortnight')
                                        .pickList.getSelectedRecord();
                                    log.d('PICKLIST', fortnight);
                                },
                                showTitle: false,
                                startRow: true,
                                // multiple: true,
                                multipleAppearance: 'picklist',
                                width:180
                                
                               ,valueMap : { 
                                   "new" : "New",
                                   "active" : "Active",
                                   "revisit" : "Revisit",
                                   "fixed" : "Fixed",
                                   "delivered" : "Delivered",
                                   "resolved" : "Resolved",
                                   "reopened" : "Reopened"
                               }
                                // colSpan:2
                                // icons: [{
                                //     // src: isc.Page.getSkinDir() +"images/actions/edit.png",
                                //     src: 'person.png'
                                //     // click: "isc.say(item.helpText)"
                                //     //TODO: make drag drop shift worker editor
                                // }] 
                              };
      
      var personPickList = { name: "person",
                             type: 'enum',
                             // type: "select",
                             editorType: 'comboBox',
                             required: true, 
                             change: function (form) {
                                 person = form.getField('person')
                                     .pickList.getSelectedRecord();
                                 log.d('PICKLIST', person);
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
                                   location = form.getField('location')
                                       .pickList.getSelectedRecords();
                                   log.d('PICKLIST', location);
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

      var dateForm = isc.DynamicForm.create({fields: [fortnightPickList]});
      
      function fortnightPicked() {
          dateForm.setFortnight(fortnight);
          pickFortnightWindow.hide();
      }
      function getDateStr(d) {
          return d.getShortDayName() + '  ' + d.getDate() + ' ' + d.getMonthName() + ' ' +
              d.getFullYear();
      }
      
      function fortnightToString(date) {
          var endFortnight = date.clone().addDays(13);
          return getDateStr(fortnight) + ' - ' + getDateStr(endFortnight);
      }
      
      dateForm.setFortnight = function(date) {
          var field = dateForm.getField('fortnight');
          field.setValue(date);
          field.setValueMap({ a: fortnightToString(date)});
          
      };
      
      window.test = dateForm;
      
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
                   var date = arguments[2];
                   var time = date.getTime();
                   var n = Math.floor((time - fortnightStart)/fortnightLength);
                   fortnight = new Date(fortnightStart + n * fortnightLength);
                   pickFortnightForm.setValue('fortnightLabel', fortnightToString(fortnight));
                   log.d('date changed'); }},
              
              { type: "BlurbItem", value: 'This date falls in the fortnight of:'},
              { name: 'fortnightLabel', type: "BlurbItem", value: '12 Dec - 14 Jan'}
              // { name: 'static', type: "StaticTextItem", value: 'blabla', startRow: true},
              
          ] 
      });
      
      var okButton = isc.Button.create({
          // top: 60,
          title: "Ok",
          width: 40,
          click: fortnightPicked
          ,snapTo: 'R'
          });
      
      var cancelButton = isc.Button.create({
          // top: 60,
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
              // {type: "button", title: "Cancel", width: 50, colSpan: 1,
              //  click: "pickFortnightWindow.hide();" }
              // ,{type: "button", title: "Done", startRow: true, 
              //   click: fortnightPicked }
           ]
       });
      
      
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
                              pickFortnightWindow.show();
                          }
                      })
                      ,dateForm
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