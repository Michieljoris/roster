/*global logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:7 maxlen:190 devel:true*/

define
({ //load: ['editorLoader'],
    inject: ['View', 
             'views/timesheet/isc_multicap_timesheet'
            ],
   factory: function(View, isc_Timesheet)
    
    { "use strict";
      var log = logger('timesheet');
      
      var fortnightStart = Date.parse('2000, 1 Jan').getTime();
      var fortnightLength = 14 *  24 * 60 * 60 *1000;
      
      function calculateFortnight(date) {
          var time = date.getTime();
          var n = Math.floor((time - fortnightStart)/fortnightLength);
          return new Date(fortnightStart + n * fortnightLength);
      }
      
      var isc_timesheet = isc_Timesheet.create(); 
      
      var view = View.create({
          type: 'Timesheet'
          ,alwaysSet: true
          ,icon: 'timesheet.png'
          ,defaultState: { person:'guest', location:'',
                           fortnight: calculateFortnight(Date.today())} 
          // ,sync: function(state) {
          //     log.d('UPDATING STATE:', state);
          // } 
          ,init: function() {
              var dataSource = View.getBackend().getDS();
              personForm.getField('person').setOptionDataSource(dataSource);
              locationForm.getField('location').setOptionDataSource(dataSource);
              
          }
          ,set: function(state) {
              log.d('SETTING STATE:', state);
              if (typeof state.fortnight === 'string') {
                  var fn = state.fortnight;
                  log.d('parsing: ', fn);
                  state.fortnight = Date.parseSchemaDate(state.fortnight);
              }
              state.fortnight = calculateFortnight(state.fortnight);
              setData(state);
              
              // console.log('IDIDIDIDIDIDI',document.getElementById('isc_F'));
              // console.log('IDIDIDIDIDIDI',mybutton.getActiveElement().id);
              // var el = mybutton.getActiveElement();
              // var el = document.getElementById('test');
              // console.log('DEFINING CLIP', el);
              // var clip = new ZeroClipboard(
              //     el,
              //     { moviePath: "lib/ZeroClipboard.swf" }
              // );
              // console.log(clip);
              // clip.setText("Ah, it's in the system clipboard");
              // clip.on( 'mousedown', function(client) {

              //     alert("mouse down");
              // } );
              // clip.on( 'load', function(client) {
              //     log.d('loaded!!!!!!!!!!!!!!!!!!!!!!!!!!');
              // } );

              // clip.on( 'mouseover', function(client) {
              //     alert("mouse over");
              // } );

              // clip.on( 'mouseout', function(client) {
              //     alert("mouse out");
              // } );


              // clip.on( 'mouseup', function(client) {
              //     alert("mouse up");
              // } );
              // window.test = clip;    
          }
          
           
      });
      
      function setData(state) {
          var person = state.person, location = state.location, fortnight = state.fortnight;
          fortnightLabel.setContents(fortnightToString(fortnight));
          personForm.setValue('person', person);
          locationForm.setValue('location', location);
          //TODO: depending on location and perhaps person, do
          //setVisibility(true) and false on the other ones, have all
          //the different timesheets added to the layout, build a
          //separate smartclient component for each, and add them all.
          //Have a field in location that lets you pick the timesheet to use.
          isc_timesheet.setData(state);
       
      }
      
      
      
      
      var personPickList = { name: "person",
                             type: 'enum',
                             // type: "select",
                             editorType: 'comboBox',
                             required: true, 
                             change: function (form) {
                                 var state = view.getState();
                                 state.person = form.getField('person')
                                     .pickList.getSelectedRecord();
                                 state.person = state.person._id;
                                 setData(state);
                                 view.modified();
                                 log.d('PICKLIST', state.person);
                             },
                             // ID: 'personPickList' ,
                             showTitle: false,
                             // startRow: true,
                             // multiple: true,
                             multipleAppearance: 'picklist',
                             // optionDataSource: dataSource,
                             filterLocally: true, 
                             pickListCriteria: { type: 'person'},
                             displayField: '_id',
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
                                   var state = view.getState();
                                   state.location = form.getField('location')
                                       .pickList.getSelectedRecord();
                                   state.location = state.location._id;
                                   setData(state);
                                   view.modified();
                                   log.d('PICKLIST', state.location);
                               },
                          
                               // ID: 'locationPickList' ,
                               showTitle: false,
                               startRow: false,
                               // multiple: true,
                               // multipleAppearance: 'picklist',
                               align: 'left',
                               // optionDataSource: dataSource,
                               filterLocally: true, 
                               pickListCriteria: { type: 'location'},
                               displayField: '_id',
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
      
      var locationForm = isc.DynamicForm.create({ID:'myform', fields: [locationPickList]});

      
      
      function getDateStr(d) {
          return d.getShortDayName() + '  ' + d.getDate() + ' ' + d.getShortMonthName() + ' ' +
              d.getFullYear();
      }
      
      function fortnightToString(date) {
          var endFortnight = date.clone().addDays(13);
          return getDateStr(date) + ' - ' + getDateStr(endFortnight);
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
              
          ] 
      });
      //in viewplugin  
      
      
      var okButton = isc.Button.create({
          title: "Ok",
          width: 40,
          click: function fortnightPicked() {
              var state = view.getState();
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
          // observer('timesheet');
          view.modified();
          var state = view.getState();
          fortnightLabel.setContents(fortnightToString(state.fortnight));
          
      }
      
      
      
      var htmlButton = isc.HTMLFlow.create({
          width:'80px',				
          height:'25px',
          contents: "<button  type='button' href='#' id='swcopy' class style='font-size:11px;width:80px;height:25px'>Copy</button>"

      });
      
      var buttonWidth = 10; 
          var layout = isc.VLayout.create({
              members: [
                  isc.HLayout.create({
                      align: 'left',
                      height: 25,
                      members: [
                          isc.Button.create({
                              width:'80px',				
                              title: 'Print',
	                      height: '100%',
	                      icon:"print.png",
                              click: function() {
                                  isc_timesheet.print();
                              }
                          })
                          ,isc.Button.create({
                              width:'80px',				
                              title: 'Export',
	                      height: '100%',
                              'data-clipboard-text': 'my copy text',
	                      icon:"Excel-icon.png"
                              ,click: function() {
                                  var location = locationForm.getValueMap()[locationForm.getValue('location')];
                                  // log.d(location);
                                  var person = personForm.getValueMap()[personForm.getValue('person')];
                                  // log.d(person);
                                  // var creator = user.get().login;
                                  var creator = 'creator';
                                  isc_timesheet.saveAsExcel(creator, '(' +
                                                            person + ') at ' + location +
                                                            ' ' + fortnightLabel.getContents());
                              }
                          })
                          ,htmlButton
                          ,isc.LayoutSpacer.create({width: 25})
                          ,isc.Button.create({
                              width: 22,				
                              title: '',
	                      icon:"date_control.png"
                              ,click: function() {
                                  var state = view.getState();
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
                                  var state = view.getState();
                                  state.fortnight.addWeeks(-2);
                                  setFortnightLabel();
                                  setData(state);
                              }
                          })
                          ,fortnightLabel
                              ,isc.Button.create({
                                  width: 22,				
                                  title: '',
	                          icon:"arrow_right.png"
                                  ,click: function() {
                                      var state = view.getState();
                                      state.fortnight.addWeeks(2);
                                      setFortnightLabel();
                                      setData(state);
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
                  ,isc_timesheet.getSheets()
              ] 
          });
      
      // isc_timesheet_casual.hide();
      
      view.setCmp(layout);
      return view;
    }});