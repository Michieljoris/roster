/*global  logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/

//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['Editor', 'types/typesAndFields', 'editorUtils', 'editorManager', 'lib/sha1' ],
  factory: function(Editor, typesAndFields, editorUtils, editorManager, hash) {
      "use strict";
      var log = logger('typesAndFields') ;
      var editor = { type: 'person'};
      var fields = editorManager.register(editor);
      var buttonBar = editorUtils.buttonBar;
      var person;   
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
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          cellPadding: 4,
          numCols: 2,
          itemKeyPress: function(item,keyName) {
              if (keyName === 'Enter') addPerson();
          },
          itemChanged: formChanged,
          // itemChange: function() {
          //     log.d('ITEMCHANGE', vm.valuesHaveChanged());
          // },
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  align: 'left',
                  // title: 'Id',
                  colSpn:2,
                  required: false
                  ,showIf: 'true'
                  ,canEdit: true
              }, fields.name),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.firstName),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.lastName),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.dswCALevel),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.payrollNumber),
              isc.addDefaults({
                  showIf: 'true'
              }, fields.status),
              isc.addDefaults({
                  // showIf: 'true'
              }, fields.inheritable),
              isc.addDefaults({
                  // showIf: 'true'
              }, fields.inheritingFrom)
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
              if (keyName === 'Enter') addPerson();
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
                  startRow: true
                  ,showIf: 'true'
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
              if (keyName === 'Enter') addPerson();
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
          itemChanged: formChanged,
          autoDraw: false,
          // width:300,
          // height: 48,
          // colWidths: [90, "*"],
          cellPadding: 4,
          // numCols: 2,
          // itemKeyPress: function(item,keyName) {
          //     if (keyName === 'Enter') addPerson();
          // },
          // cellBorder: 1,
          fields: [
              isc.addDefaults({
                  align: 'left',
                  showTitle: true,
                  titleOrientation: 'top',
                  width: 250,
                  height: 150,
                  // colSpan: 2,
                  startRow: true
                  ,showIf: 'true'
              }, fields.notes)
              
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
    
    
      function addPerson() {
          console.log('addPerson',vm.getValues());
          if (vm.validate()) {
              var person = vm.getValues();
        
              if (!person.notes) person.notes = '';
              //TODO? set all booleans to default off value?
              //     console.log(startDate, endDate);
	      // // calendar.addPerson(startDate, endDate,
              // var otherFields = { group: 'shift',
              //                     claim: person.claim,
              //                     repeats: person.repeats,
              //                     sleepOver: person.sleepOver,
              //                     person: person.person,
              //                     ad: false,
              //                     displayPerson: []};
              // console.log('changed:', personForm.valuesHaveChanged(), personForm.getChangedValues());
            
              // var personList = personForm.getField('person').pickList.getSelectedRecords();
              // personList.forEach(function(p) {
              // otherFields.displayPerson.push(p.name);
              // });
            
              //************ 
              // person.startDate = startDate;
              // person.endDate = endDate;
              // isc.addProperties(person, otherFields);
            
              typesAndFields.removeUnderscoreFields(person);
              editorManager.save(person, updateVm);           
              // if (person._rev) {
              //     if (vm.valuesHaveChanged())
              //         database.updateData(person);
              // }
              // else database.addData(person);
            
              // console.log('***********', person.person)    ;
              // if (person._rev) {
              //     if (personForm.valuesHaveChanged())
              //         pouchDS.updatePerson(person,
              //                              startDate, endDate,
              //                              // isc.JSON.encode(person.person),
              //                              person.person,
              //                              person.notes,
              //                              otherFields);
              // }
              // else pouchDS.addPerson(startDate, endDate,
              //                        // isc.JSON.encode(person.person),
              //                        person.person,
              //                        person.notes,
              //                        otherFields);
              // personEditorWindow.hide(); 
          }
      }
      
      function updateVm(record) {
          vm.setValues(record);
          allButtons.Save.setDisabled(!settings.isNewRecord);
          editorManager.changed(editor, false);
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
      
      var formLayout = isc.HLayout.create({
          members: [ mainForm
                     ,addressForm
                     ,contactForm
                     ,notesForm
                   ]
      });
      
      var editLayout = isc.VLayout.create({
          // autoSize:true,
          width: "30%",
          // height: "100%",
          members: [
              isc.HLayout.create({
                  width: "70%",
                  members: [
                      buttonBar(allButtons, 'vertical', 180, 50,
                                ['Main', 'Address', 'Contact', 'Notes', 'Password'],
                                { // baseStyle: "cssButton",
                                    left: 200,
                                    showRollOver: true,
                                    showDisabled: true,
                                    showDown: true
                                    //icon: "icons/16/icon_add_files.png"
                                },
                                action)
                      ,formLayout
                  ]
              })
              ,buttonBar(allButtons, 'horizontal', 25, 350,
                         ['Delete', '|', 'Discard', 'Save'],
                         {  width: 50,
                            autoDraw: false
                         }, action)
          ]
      });

      
      /** Pick a password */
      function pickPwd(){
          
          var pwdForm = isc.DynamicForm.create({
              columns: 1
              ,fields: [
                  { type: 'password', name: 'pwd1', title: 'Password:', 
                    titleOrientation: 'top', startRow: true}
                  ,{ type: 'password', name: 'pwd2', title: 'Repeat:', 
                     titleOrientation: 'top', startRow: true}
              ]
              });
            
          var helpLabel = isc.Label.create({
              // ID:'test',
              // width: 300,
              height: '100%',
              margin: 10
              ,contents: 'Enter your new password.'
          });
            
          var window = isc.Window.create({
              title: "Set a password"
              ,autoSize: true
              // ,height:200
              // ,width:300
              // ,autoSize: true
              ,canDragReposition: true
              ,canDragResize: false
              ,showMinimizeButton:false
              ,showCloseButton:false
              ,autoCenter: true
              ,isModal: true
              ,showModalMask: true
              ,autoDraw: false
              ,items: [
                  pwdForm
                  ,helpLabel
                  ,isc.HLayout.create({
                      layoutMargin: 6,
                      membersMargin: 6,
                      // border: "1px dashed blue",
                      height: 20,
                      width:'100%',
                      members: [
                          isc.LayoutSpacer.create()
                          ,isc.Button.create({
                              title: 'Cancel'
                              // ,visibility: cancellable ? 'inherit' : 'hidden'
                              // ,startRow: false
                              ,click: function() {
                                  window.hide();
                              }  
                              
                          })
                          ,isc.Button.create({
                              title: 'Ok'
                              ,startRow: true
                              ,click: function() {
                                  var pwd1 = pwdForm.getValue('pwd1'); 
                                  var pwd2 = pwdForm.getValue('pwd2');
                                  log.d('passwords are: ',pwd1, pwd2);
                                  pwd1 = pwd1 ? pwd1 : '';
                                  pwd2 = pwd2 ? pwd2 : '';
                                  if (hash.calc(pwd1) === hash.calc(pwd2)) {
                                      vm.setValue('pwd', hash.calc(pwd1));
                                      pwdForm.setValue('pwd1', '');
                                      pwdForm.setValue('pwd2', '');
                                      formChanged();
                                      window.hide();
                                  }
                                  else {
                                      helpLabel.setContents("Passwords don't match. Try again.");
                                  }
                              }  
                          })
                          ,isc.LayoutSpacer.create()
                      ]
                  })
              ] 
          });
          window.show();
      }
        
       
      
      function action(e) {
          switch (e) {
            case 'Main': formLayout.setVisibleMember(mainForm); break;
            case 'Address': formLayout.setVisibleMember(addressForm); break;
            case 'Contact': formLayout.setVisibleMember(contactForm); break;
            case 'Notes': formLayout.setVisibleMember(notesForm); break; 
            case 'Password': pickPwd();
              break;
              
            case 'Save': addPerson(); break; 
            case 'Discard': editorManager.cancel(person); break; 
            case 'Delete': editorManager.remove(person); break;
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
          //TODO: This only shows the fields with showIf: 'true'
          fields: typesAndFields.getFieldsCloner('person')()
      });
      
      // var editorMessage = isc.Label.create({
      //     // ID:"editorMessage",
      //     autoDraw: false,
      //     width:"100%",
      //     height:"100%",
      //     align:"center",
      //     contents:"Select a record to edit, or a category to insert a new record into"
      // });

    
      var tabSet = isc.TabSet.
          create({
              // autoSize: true,
              height: '100%',
              width: '100%',
              // height: 270,
              // width: 380,
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
          
          height: '100%',
          width: '100%',
          members: [
              tabSet
              // ,buttons
          ]  
      });
      
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
      
      editor.set = function(somePerson, someSettings) {
          console.log('setting values', somePerson, someSettings);
          settings = isc.addDefaults(someSettings, defaultSettings);
          
          // console.log('somePerson', somePerson);
          person = somePerson;
          vm.setValues(person);
          itemViewer.setData(somePerson);
          
          vm.clearErrors();
          
          allButtons.Discard.setVisibility(settings.cancelButton);
          allButtons.Delete.setVisibility(settings.removeButton);
          allButtons.Save.setVisibility(settings.saveButton);
          allButtons.Save.setDisabled(true);
          // allButtons.Discard.setDisabled(true);
          formLayout.setVisibleMember(mainForm);
          
      };
      
      editor.init = function() {
          // var dataSource = Editor.getBackend().getDS();
          // eventForm.getField('person').setOptionDataSource(dataSource);
          // eventForm.getField('location').setOptionDataSource(dataSource);
      };
    
      return editor;

  }});
