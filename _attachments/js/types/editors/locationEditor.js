/*global  logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:190 devel:true*/

//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['lib/utils', 'defaultTimePatterns', 'patterns',
           'Editor', 'types/typesAndFields', 'editorManager', 'editorUtils'],
  factory: function(utils, defaultTimePatterns, patterns,
                    Editor, typesAndFields, editorManager, editorUtils) {
      "use strict";
      var log = logger('locationEditor');
      

      var editor = { type: 'location' };
      var fields = editorManager.register(editor);
      var buttonBar = editorUtils.buttonBar;
      
      var location;   
      var defaultSettings = {};
      var settings = {}; 
      
      function formChanged() {
          log.d('ITEMCHANGED', vm.valuesHaveChanged());
          var changed = vm.valuesHaveChanged();
          allButtons.Save.setDisabled(!changed);
          // allButtons.Discard.setDisabled(!changed);
          editorManager.changed(editor, changed);
      }
      
      
      var mainFormConfig = {
          ID: 'mainForm',
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addLocation();
          },
          itemChanged: formChanged,
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  align: 'left',
                  title: 'Unique name',
                  colSpan:2,
                  required: false
                  ,canEdit: false
                  ,showIf: 'true'
              }, fields._id),
              isc.addDefaults({
                  align: 'left',
                  colSpan:2,
                  required: false
                  ,showIf: 'true'
              }, fields.costCentre),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.region),
              isc.addDefaults({
                  // showIf: 'true'
              }, fields.inheritable),
              isc.addDefaults({
                  // showIf: 'true'
              }, fields.inheritingFrom)
          ]
      };
      
     var dayLengthFormConfig = {
          // ID: 'lengthForm',
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addLocation();
          },
          itemChanged: formChanged,
          fields: [
              {
                  // title:'Info',
                  showTitle: false,
                  type: 'text',
                  canEdit: false,
                  value: 'The day should start not later than penalty hours end in the morning, and not not end before penalty hours start in the evening.<p>Refresh the page to update the calendar\'s greyed out areas (These will not appear in the calendar when the day ends past midnight).'
              },
              isc.addDefaults({
                  colSpan:2,
                  itemHoverHTML: function() {
                      return 'If filled in, takes prevalence over the day length value.<p>'; 
                      // return 'In increments of 30 minutes.';
                  },
                  titleOrientation: 'top',
                  showIf: 'true'
                  ,change: function() {
                      var startTime = arguments[2];
                      var endTime = lengthForm.getValue('dayEnd');
                      var sHour, sMinutes;
                      var eHour, eMinutes;
                      var dayLength;
                      if (endTime) {
                          eHour = endTime.getHours();
                          eMinutes = endTime.getMinutes();
                          if (startTime) {
                              sHour = startTime.getHours();
                              sMinutes = startTime.getMinutes();
                              dayLength = eHour - sHour +
                                  (eMinutes - sMinutes)/60;
                              if (dayLength <= 0) {
                                  dayLength = null;                                 
                                  lengthForm.setValue('dayStart',null);
                              }
                              lengthForm.setValue('dayLength', dayLength);
                          }
                      }
                  }
              }, fields.dayStart),
              isc.addDefaults({
                  itemHoverHTML: function() {
                      return 'If filled in, takes prevalence over the day length value.<p>' +
                          'The day has to end before midnight.';
                  },
                  colSpan:2,
                  titleOrientation: 'top',
                  showIf: 'true'
                  ,change: function() {
                      var endTime = arguments[2];
                      var startTime = lengthForm.getValue('dayStart');
                      var sHour, sMinutes;
                      var eHour, eMinutes;
                      var dayLength;
                      if (endTime) {
                          eHour = endTime.getHours();
                          eMinutes = endTime.getMinutes();
                          if (startTime) {
                              sHour = startTime.getHours();
                              sMinutes = startTime.getMinutes();
                              dayLength = eHour - sHour +
                                  (eMinutes - sMinutes)/60;
                              if (dayLength <= 0) {
                                  dayLength = null;                                 
                                  lengthForm.setValue('dayEnd',null);
                              }
                              lengthForm.setValue('dayLength', dayLength);
                          }
                      }
                  }
              }, fields.dayEnd),
              isc.addDefaults({
                  itemHoverHTML: function() {
                      return 'If modified, it takes prevalence over the day end value.<p>' +
                          'This makes it possible to end a day on or after midnight';
                  },
                  colSpan:2,
                  titleOrientation: 'top',
                  showIf: 'true',
                  change: function() {
                      var length = arguments[2];
                      if (length<=0) lengthForm.setValue('dayEnd',null);
                      else {
                          var dayStart = lengthForm.getValue('dayStart');
                          if (dayStart) lengthForm.setValue('dayEnd', dayStart.clone().addHours(length));
                      }
                  }
                  ,validators: [{ type:'isOnHalfHour'}]
              }, fields.dayLength)
              ]
     };
      
      var addressFormConfig = {
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addLocation();
          },
          itemChanged: formChanged,
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  // click: "this.setCanEdit(true); log.d('hello')",
                  // hint: 'myhint',
                  itemHoverHTML: function(item, form) {
                      return "Inherited value. <br>Click to edit.<b>hello</b>";
                  },
                  colSpan: 2,
                  startRow: true,
                  showIf: 'true'
              }, fields.address),
              
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.suburb),
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.postalCode),
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.state)
          ] 
      };
              
      
      var contactFormConfig = {
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addLocation();
          },
          itemChanged: formChanged,
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.phone),
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.mob),
              isc.addDefaults({
                  align: 'left'
                  ,showIf: 'true'
              }, fields.email)
              
          ]
      };
      
      var notesFormConfig = {
          autoDraw: false,
          itemChanged: formChanged,
          // width:300,
          // height: 48,
          // colWidths: [90, "*"],
          cellPadding: 4,
          // numCols: 2,
          // itemKeyPress: function(item,keyName) {
          //     if (keyName === 'Enter') addLocation();
          // },
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  align: 'left',
                  showTitle: true,
                  titleOrientation: 'top',
                  width: 290,
                  height: 150,
                  // colSpan: 2,
                  startRow: true
                  ,showIf: 'true'
              }, fields.notes)
              
          ]
      };
              
      var mainForm = isc.DynamicForm.create(mainFormConfig);
      var lengthForm = isc.DynamicForm.create(dayLengthFormConfig);
      var addressForm = isc.DynamicForm.create(addressFormConfig);
      var contactForm = isc.DynamicForm.create(contactFormConfig);
      var notesForm = isc.DynamicForm.create(notesFormConfig);
      
      
      var vm = isc.ValuesManager.create({
          members: [
              mainForm, lengthForm, addressForm, contactForm, notesForm
          ]
      });
      
    isc.Validator.addValidator(
        'isOnHalfHour',
        function(item, validator, dummy, record) {
            var errorMessage;
            var length = item.getValue();
            var multiple = length/0.5;
            if (multiple - Math.floor(multiple) > 0)
                errorMessage = 'Day length has to be a multiple of 0.5';
            validator.errorMessage = errorMessage;
            return !errorMessage;
        }
        
    );
    
    
      function addLocation() {
          log.d('addLocation',vm.getValues());
          if (vm.valuesHaveChanged() && vm.validate()) {
              var location = vm.getValues();
              
              if (!location.notes) location.notes = '';
              
              typesAndFields.removeUnderscoreFields(location);
              // if (location.dayEnd.getHours() === 0 &&
              //     location.dayEnd.getMinutes() === 0) {
              //     location.dayEnd.addSeconds(-1); //so that we get 23:59
              // }
              var timePattern = patterns.makeDayHours(location.dayStart, location.dayLength);
              log.d('DAYPATTERN', timePattern);
               
              location.timePattern = JSON.stringify(timePattern);
              // location.timePatterns = utils.addProperties(
              //     defaultTimePatterns.weekend,
              //     defaultTimePatterns.publicHolidays,
              //     dayPattern);
              editorManager.save(location, updateVm);           
          }
      }
      
      function updateVm(record) {
          vm.setValues(record);
          allButtons.Save.setDisabled(!settings.isNewRecord);
          editorManager.changed(editor, false);
      } 
                                       
      // var parentLabel = isc.Label.create({
      //     height: 30,
      //     padding: 10,
      //     align: "center",
      //     valign: "center",
      //     wrap: false,
      //     // icon: "icons/16/approved.png",
      //     // showEdges: true,
      //     contents: "Mamre house, Southside",
      //     click: "log.d('hello')",
      //     prompt: 'click to edit'
          
      // });
      
      var allButtons = {};
      // function buttonBar(orientation, entries, buttonProps, action) {
      //     var members = [];
          
      //     entries.forEach(function(e) {
      //         if (e === '|') {
      //             members.push(isc.LayoutSpacer.create());
      //             return;
      //         }
      //         var button;
      //         buttonProps.title = e;
      //         buttonProps.click = function() {
      //             action(e);
      //         };
      //         button = isc.Button.create(buttonProps);
      //         allButtons[e] = button;
      //         members.push(button);
              
      //     });
          
      //     // members.push(isc.LayoutSpacer.create()); // Note the use of the LayoutSpacer
      //     // buttonProps.title = 'bla';
      //     // var button = isc.Button.create(buttonProps);
          
      //     // members.push(button);
      //     var layout = orientation === 'vertical' ? isc.VLayout : isc.HLayout;
      //     return layout.create({
      //         // contents: "Navigation",
      //         // align: "center",
      //         // overflow: "hidden",
      //         // border: "1px solid blue",
      //         // width: '100%',
      //         members: members
      //         //,showResizeBar: true,
      //         // border: "1px solid blue"
      //     });
          
      // }
      
      
      var formLayout = isc.HLayout.create({
          members: [ mainForm
                     ,lengthForm
                     ,addressForm
                     ,contactForm
                     ,notesForm
                   ]
      });
      
      var actionBarDeleteCancelSave = buttonBar(allButtons, 'horizontal', 25, 350,
                                                ['Delete', '|', 'Discard', 'Save'],
                                                {  width: 50,
                                                   autoDraw: false
                                                }, action);
      
      var editLayout = isc.VLayout.create({
          // autoSize:true,
          width: "30%",
          // height: "100%",
          members: [
              isc.HLayout.create({
                  // autoSize:true,
                  width: "30%",
                  // align: 'left', 
                  members: [
                      buttonBar(allButtons, 'vertical', 180, 50,
                                ['Main', 'Day hours', 'Address', 'Contact', 'Notes'],
                                { // baseStyle: "cssButton",
                                    // left: 200,
                                    showRollOver: true,
                                    showDisabled: true,
                                    showDown: true
                                    //icon: "icons/16/icon_add_files.png"
                                },
                                action)
                      ,formLayout
                  ]
              })
              ,actionBarDeleteCancelSave
          ]
      });
      
      function action(e) {
          switch (e) {
            case 'Main': formLayout.setVisibleMember(mainForm); break;
            case 'Day hours': formLayout.setVisibleMember(lengthForm); break;
            case 'Address': formLayout.setVisibleMember(addressForm); break;
            case 'Contact': formLayout.setVisibleMember(contactForm); break;
            case 'Notes': formLayout.setVisibleMember(notesForm); break; 
            case 'Save': addLocation(); break; 
            case 'Discard': editorManager.cancel(location); break; 
            case 'Delete': editorManager.remove(location); break;
          default: alert('unknown action in function action!!');
          }
          log.d(e);
      }
      
      var itemViewer = isc.DetailViewer.create({
          // ID:"itemViewer",
          // dataSource:"supplyItem",
          // width:"100%",
          // margin:"25",
          emptyMessage:"Select an item to view its details",
          fields: typesAndFields.getFieldsCloner('location')()
      });
      

    
      var tabSet = isc.TabSet.
          create({
              // autoSize: true,
              height: '100%',
              width: '100%',
              // height: 400,
              // width: 400,
	      // ID: "tabSet"
              // tabSelected: updateDetails, //"itemList.updateDetails()",
              tabSelected: function() {
                  // tableViewStateChanged('tabSelected');
              }
              ,resized: function() {
                  // tableViewStateChanged('tabSetResized');
              }
	      ,tabBarPosition: "top"
	      // ,height:'30%'
	      ,selectedTab: 1,
	      tabs: [
	          {title: "View"
	           ,pane: itemViewer
	          }
                  ,{title: "Edit",
                    pane: editLayout
                   }
	      ]
          });
      
      
      
      // var layout = isc.VLayout.create({
          
      //     // autoSize: true,
      //     height: '100%',
      //     width: '100%',
      //     members: [

      //         tabSet
      //         // ,buttons
      //     ]  
      // });
      
      
      // editor.canvas = layout;
      editor.canvas = tabSet;
      // editor.canvas.valuesHaveChanged = function() {
      //     return vm.valuesHaveChanged();   
      // };
      editor.canvas.rememberValues = function() {
          vm.rememberValues();
      };
      
      editor.canvas.getValues = function() {
          return vm.getValues();
      };
      
      // editor.canvas.disableSaveButton = function() {
      //     allButtons.Save.setDisabled(true);
      // };
      
      editor.set = function(someLocation, someSettings) {
          log.d('setting values', someLocation, someSettings);
          settings = isc.addDefaults(someSettings, defaultSettings);
          log.d('someLocation', someLocation);
          location = someLocation;
          vm.setValues(location);
          itemViewer.setData(location);
          vm.clearErrors();
          allButtons.Discard.setVisibility(settings.cancelButton);
          allButtons.Delete.setVisibility(settings.removeButton);
          allButtons.Save.setVisibility(settings.saveButton);
          allButtons.Save.setDisabled(true);
          formLayout.setVisibleMember(mainForm);
      };
      
      editor.init = function() {
          // var dataSource = Editor.getBackend().getDS();
      };
    
    
      return editor;

  }});

