/*global  isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:190 devel:true*/

//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['typesAndFields', 'editorManager',  'parentListEditor'],
  factory: function(typesAndFields, editorManager, parentListEditor) {
      "use strict";

      var editor = {};
      var location;   
      var defaultSettings = {};
      var settings = {}; 
      
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
          // cellBorder: 1,
          fields: [
              {name: "name", 
               // title: 'Full Name',
               align: 'left',
               // titleOrientation: 'top',
               colSpan:2,
               required: false
              }, 
              {name: "shortName", 
               // title: 'Short Name',
               align: 'left',
               // titleOrientation: 'top',
               // colSpan:2,
               required: false 
              },
              {name: "region", title: 'Region', type: "text", required: false
               // titleOrientation: 'top'
              },
              {name: "inheritable", title: 'Inheritable', type: "boolean", required: false
               // titleOrientation: 'top'
              },
              {name: "parents", title: 'Inheriting values from:', type: "list", required: false
               // titleOrientation: 'top'
              }
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
          // cellBorder: 1,
          fields: [
              {name: "address", 
               title: 'Address',
               // titleOrientation: 'top', 
               // click: "this.setCanEdit(true); console.log('hello')",
               // hint: 'myhint',
               itemHoverHTML: function(item, form) {
                   return "Inherited value. <br>Click to edit.<b>hello</b>";
               },
               colSpan: 2,
               type: "Text", startRow: true},
              {name: "suburb",
               title: 'Suburb', align: 'left', showTitle: true, type: "text",
               titleOrientation: 'top',  required: false,
               startRow: true },
              {name: 'postalCode', title: "Postal Code", type: "text", required: false,
               startRow: false
              },
              {name: "state", title: 'State', type: "comboBox", required: false,
               showTitle: true, 
               valueMap: {
                   "QLD" : "QLD",
                   "NSW" : "NSW",
                   "SA" : "SA",
                   "NT" : "NT",
                   "WA" : "WA"
               }
               // ,titleOrientation: 'top', startRow: true
              }
              
              
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
          // cellBorder: 1,
          fields: [
              {name: "phone", title: 'Phone', type: "text", required: false
               // titleOrientation: 'top'
              },
              {name: "mobPhone", title: 'Mobile', type: "text", required: false
               // titleOrientation: 'top'
              },
              {name: "email", title: 'Email', type: "text", required: false
               // titleOrientation: 'top'
              }
              
          ]
      };
      
      var notesFormConfig = {
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addLocation();
          },
          // cellBorder: 1,
          fields: [
              {name:"notes", title:'Notes', type: "textarea", length: 5000,
               titleOrientation: 'top',// width: "*",
               showTitle: true,  colSpan: 2, startRow: true}
              
          ]
      };
              
      var mainForm = isc.DynamicForm.create(mainFormConfig);
      var addressForm = isc.DynamicForm.create(addressFormConfig);
      var contactForm = isc.DynamicForm.create(contactFormConfig);
      var notesForm = isc.DynamicForm.create(notesFormConfig);
      
      
      var vm = isc.ValuesManager.create({
          members: [
              mainForm, addressForm, contactForm, notesForm
          ]
      });
    
    
      function addLocation() {
          console.log('addLocation',vm.getValues());
          if (vm.validate()) {
              var location = vm.getValues();
        
              if (!location.notes) location.notes = '';
              //TODO? set all booleans to default off value?
              //     console.log(startDate, endDate);
	      // // calendar.addLocation(startDate, endDate,
              // var otherFields = { group: 'shift',
              //                     claim: location.claim,
              //                     repeats: location.repeats,
              //                     sleepOver: location.sleepOver,
              //                     location: location.location,
              //                     ad: false,
              //                     displayPerson: []};
              // console.log('changed:', locationForm.valuesHaveChanged(), locationForm.getChangedValues());
            
              // var personList = locationForm.getField('person').pickList.getSelectedRecords();
              // personList.forEach(function(p) {
              // otherFields.displayPerson.push(p.name);
              // });
            
              //************ 
              // location.startDate = startDate;
              // location.endDate = endDate;
              // isc.addProperties(location, otherFields);
              editorManager.save(location, vm.valuesHaveChanged());           
              // if (location._rev) {
              //     if (vm.valuesHaveChanged())
              //         database.updateData(location);
              // }
              // else database.addData(location);
            
              // console.log('***********', location.person)    ;
              // if (location._rev) {
              //     if (locationForm.valuesHaveChanged())
              //         pouchDS.updateLocation(location,
              //                              startDate, endDate,
              //                              // isc.JSON.encode(location.person),
              //                              location.person,
              //                              location.notes,
              //                              otherFields);
              // }
              // else pouchDS.addLocation(startDate, endDate,
              //                        // isc.JSON.encode(location.person),
              //                        location.person,
              //                        location.notes,
              //                        otherFields);
              // locationEditorWindow.hide(); 
          }
      }
                                       
      var parentLabel = isc.Label.create({
          height: 30,
          padding: 10,
          align: "center",
          valign: "center",
          wrap: false,
          // icon: "icons/16/approved.png",
          // showEdges: true,
          contents: "Mamre house, Southside",
          click: "console.log('hello')",
          prompt: 'click to edit'
          
      });
      
      var allButtons = {};
      function buttonBar(orientation, entries, buttonProps, action) {
          var members = [];
          
          entries.forEach(function(e) {
              if (e === '|') {
                  members.push(isc.LayoutSpacer.create());
                  return;
              }
              var button;
              buttonProps.title = e;
              buttonProps.click = function() {
                  action(e);
              };
              button = isc.Button.create(buttonProps);
              allButtons[e] = button;
              members.push(button);
              
          });
          
          // members.push(isc.LayoutSpacer.create()); // Note the use of the LayoutSpacer
          // buttonProps.title = 'bla';
          // var button = isc.Button.create(buttonProps);
          
          // members.push(button);
          var layout = orientation === 'vertical' ? isc.VLayout : isc.HLayout;
          return layout.create({
              // contents: "Navigation",
              // align: "center",
              // overflow: "hidden",
              // border: "1px solid blue",
              // width: '100%',
              members: members
              //,showResizeBar: true,
              // border: "1px solid blue"
          });
          
      }
      
      
      var formLayout = isc.HLayout.create({
          members: [ mainForm
                     ,addressForm
                     ,contactForm
                     ,notesForm
                   ]
      });
      
     var actionBarDeleteCancelSave = buttonBar('horizontal',
                         ['Delete', '|', 'Cancel', 'Save'],
                         {  width: 50,
                            autoDraw: false
                         }, action);
      
      var editLayout = isc.VLayout.create({
          // autoSize:true,
          // width: "100%",
          // height: "100%",
          members: [
              isc.HLayout.create({
                  // width: "70%",
                  members: [
                      buttonBar('vertical',
                                ['Main', 'Address', 'Contact', 'Notes'],
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
            case 'Address': formLayout.setVisibleMember(addressForm); break;
            case 'Contact': formLayout.setVisibleMember(contactForm); break;
            case 'Notes': formLayout.setVisibleMember(notesForm); break; 
            case 'Save': addLocation(); break; 
            case 'Cancel': editorManager.cancel(location); break; 
            case 'Delete': editorManager.remove(location); break;
          default: alert('unknown action in function action!!');
          }
          console.log(e);
      }
      
      var itemViewer = isc.DetailViewer.create({
          // ID:"itemViewer",
          // dataSource:"supplyItem",
          // width:"100%",
          // margin:"25",
          emptyMessage:"Select an item to view its details",
          fields: typesAndFields.getFieldsCloner('location')()
      });
      
      var editorMessage = isc.Label.create({
          // ID:"editorMessage",
          autoDraw: false,
          width:"100%",
          height:"100%",
          align:"center",
          contents:"Select a record to edit, or a category to insert a new record into"
      });

    
      var tabSet = isc.TabSet.
          create({
              // autoSize: true,
              // height: '100%',
              // width: '100%',
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
      
      
      
      var layout = isc.VLayout.create({
          
          // autoSize: true,
          height: '100%',
          width: '100%',
          members: [

              tabSet
              // ,buttons
          ]  
      });
      
      
      editor.type = 'location';
      editor.canvas = layout;
      editor.set = function(someLocation, someSettings) {
          console.log('setting values', someLocation, someSettings);
          settings = isc.addDefaults(someSettings, defaultSettings);
          console.log('someLocation', someLocation);
          location = someLocation;
          vm.setValues(location);
          itemViewer.setData(location);
          vm.clearErrors();
          allButtons.Cancel.setVisibility(settings.cancelButton);
          allButtons.Delete.setVisibility(settings.removeButton);
          allButtons.Save.setVisibility(settings.saveButton);
      };
      editorManager.register(editor);
    
      // return API;   

  }});
