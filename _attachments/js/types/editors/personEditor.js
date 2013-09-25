/*global  $:false ITERATIONS:false sjcl:false logger:false isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/

//This kind of module does not produce an injectable, but registers itself with the editorManager
//to use this editor, both load the editorLoader module and inject the editorManager
define
({inject: ['Editor', 'types/typesAndFields', 'editorUtils', 'editorManager', 'lib/utils'],
  factory: function(Editor, typesAndFields, editorUtils, editorManager, utils) {
      "use strict";
      var log = logger('personEditor') ;
      var editor = { type: 'person'};
      var fields = editorManager.register(editor);
      var buttonBar = editorUtils.buttonBar;
      var person;   
      var defaultSettings = {};
      var settings = {}; 
      var MINSCORE = 2;
      // var locationsDocUrl = "http://localhost:5984/multicap/locations";
      var locationsDocUrl = "https://ssl.axion5.net/multicap/locations";
      var ajaxedLocations;
      
      var rolesArray =[
          "allow_*_"
          , "allow_*_type:'shift'"
          , "allow_*_type:'shift'"
          , "allow_*_type:'location'"
          , "allow_*_type:'person'"
          , "allow_*_type:'person';_id:user"
          , "allow_*_type:'person';_id:user|ONLY derivedKey salt lastEditedAt"
          , "allow_*_type:'person';_id:user|NOT roles derivedKey salt"
          , "allow_*_type:'person';_id:user|NOT roles"
          , "allow_*_type:'settings';lastEditedBy:user"
          , "allow_*_type:'user'"
          , "allow_*_type:'user';_id:user"
          , "allow_*_type:'user';_id:user|ONLY derivedKey salt"
          , "allow_*_type:'user';_id:user|NOT roles"
      ];
      
      var roles = rolesArray.map(function(r) {
          return { role: r };
      });
      
      var locations = [ 'Waterford West', "Runcorn 9" ];
      locations = locations.map(function(r) {
          return { name: r };
      });
      
      function areArraysEqual(a1, a2) {
          if (!isc.isAn.Array(a1) || !isc.isAn.Array(a2)) return false;
          if (a1.length !== a2.length) return false;
          for (var i=0; i< a1.length; i++) {
              if (a2.indexOf(a1[i]) === -1) return false;
          }
          return true;   
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
                 
                  title: 'Unique name',
                  colSpn:2,
                  required: false
                  ,canEdit: false
              }, fields._id),
              isc.addDefaults({
             
              }, fields.firstName),
              isc.addDefaults({
              
              }, fields.lastName),
              isc.addDefaults({
              }, fields.dswCALevel),
              isc.addDefaults({
              }, fields.payrollNumber),
              isc.addDefaults({
              }, fields.status),
              isc.addDefaults({
              }, fields.inheritable),
              isc.addDefaults({
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
              }, fields.address),
              
              isc.addDefaults({
                  align: 'left'
              }, fields.suburb),
              isc.addDefaults({
                  align: 'left'
              }, fields.postalCode),
              isc.addDefaults({
                  align: 'left'
              }, fields.state)
          ] 
      };
      
      //**************************************************************************************************************************************
      //*********************************************************************************************************************
      //***********************************************************************************************************
      var searchRoleInput = isc.DynamicForm.create({
          // width: 300,
          fields: [
              {name: "rolePattern", title:"Search role:", type:"text",
               titleOrientation:'top',
               width:300,
               changed: function(form, item, value) {
                   var removedRoles = rolesGrid.getData().map(function(r) {
                       return r.role;
                   });
                   var filteredRoles = roles.filter(function(r) {
                       return fuzzy_match(r.role, value) && removedRoles.indexOf(r.role) === -1;
                   });
                   rolesGridSource.setData(filteredRoles);

               }
              } 
          ]
      });
      var searchAvailInput = isc.DynamicForm.create({
          // width: 300,
          fields: [
              {width:150, name: "availPattern", title:"Search locations:", type:"text",
               titleOrientation:'top'
               ,changed: function(form, item, value) {
                   var removed = availabilityGrid.getData().map(function(a) {
                       return a.name;
                   });
                   console.log(locations);
                   
                   var filtered = locations.filter(function(a) {
                       var match;
                       try {
                           match = fuzzy_match(a.name, value) ;
                       }catch(e) { console.log(e); }
                       return match && removed.indexOf(a.name) === -1; 
                   });
                   console.log(filtered);
                   availabilityGridSource.setData(filtered);
               }
              } 
          ]
      });
      
      
      function fuzzy_match(str,pattern){
          if (!pattern) return true;
          str = str || "";
          pattern = pattern.split("").reduce(function(a,b){ return a+'[^'+b+']*'+b; });
          return (new RegExp(pattern)).test(str);
      }
      
      function getLocations() {
          if (ajaxedLocations) return;
          $.ajax({
              url: locationsDocUrl,
              type: 'get',
              dataType: 'json',
              success: function(data) {
                  console.log('success');
                  locations = data;
                  delete locations._id;
                  delete locations._rev;
                  console.log(locations);
                  locations = Object.keys(locations).map(function(r) {
                      return locations[r];
                  });                      
              }
              ,error: function(err) {
                  console.log('failed to get locations from database', err);
              }
              ,complete: function() {
                  console.log('completed', arguments);
                  
                  availabilityGridSource.setData(locations)
                  
                  var newRoles = ['read', 'write', 'read_persons', 'write_persons','read_locations','write_locations'];
                  locations.forEach(function(l) {
                      newRoles.push('read_' + l.dbName );
                      newRoles.push('write_' + l.dbName );
                  });
                  roles = newRoles.concat(rolesArray);
                  roles = roles.map(function(r) {
                      return { role: r };
                  });
                  
                  var removedRoles = rolesGrid.getData().map(function(r) {
                      return r.role;
                  });
                  var filteredRoles = roles.filter(function(r) {
                      // return fuzzy_match(r.role, value) && removedRoles.indexOf(r.role) === -1;
                      return removedRoles.indexOf(r.role) === -1;
                  });
                  rolesGridSource.setData(filteredRoles);
                  
                  var removed = availabilityGrid.getData().map(function(a) {
                      return a.name;
                  });
                  var filtered = locations.filter(function(a) {
                      // return fuzzy_match(a.name, value) && removed.indexOf(a.name) === -1;
                      return  removed.indexOf(a.name) === -1;
                  });
                  availabilityGridSource.setData(filtered);
                  ajaxedLocations = true;
              }
          });
      }
      
      
      
      isc.defineClass("AvailabilityGrid","ListGrid").addProperties({
          width:150, height:400, cellHeight:24, imageSize:16,
          showEdges:false,  bodyStyleName:"normal",
          alternateRecordStyles:true, showHeader:false, 
          emptyMessage:"<br><br>Nothing selected"
          ,fields:[
              {name:"name"}
          ]
      });
      
      isc.defineClass("RolesGrid","ListGrid").addProperties({
          width:300, height:400, cellHeight:24, imageSize:16,
          bodyStyleName:"normal",
          alternateRecordStyles:true, showHeader:false,// leaveScrollbarGap:false,
          emptyMessage:"<br><br>Nothing selected"
          ,selectionType: 'single'
          ,selectionUpdated: function(record) {
              console.log('role selected:', record);
              editRoleBox.getField('editRole').setValue(record.role);
          }
          ,fields:[
              {name:"role"}
          ]
      });
      var rolesGridSource = isc.RolesGrid.create({
          ID:"rolesGridSource",
          data: roles,
          canDragRecordsOut: true,
          canAcceptDroppedRecords: true,
          canReorderRecords: true
          ,onRecordDrop: function(records) {
              console.log(records);
              records = records.map(function(r) {
                  return r.role;
              });
              var roles = rolesGrid.getData().filter(function(r) {
                  return records.indexOf(r.role) === -1;
              });
              formChanged('roles', roles.map(function(r) { return r.role; }));
          }
      });
          
      var rolesGrid = isc.RolesGrid.create({
          ID:"rolesGrid",
          canDragRecordsOut: true,
          canAcceptDroppedRecords: true,
          canReorderRecords: true,
          dragDataAction: "move"
          ,onRecordDrop: function(records) {
              console.log(records);
              formChanged('roles', rolesGrid.getData().concat(records).map(function(r) { return r.role; }));
          }
      });
      
      var rolesSourceLabel = isc.Label.create({
          // ID:'test',
          width: 280,
          height: 20,
          // margin: 10
          contents: 'Or drag required roles to the box on the right:'
      });
      var rolesLabel = isc.Label.create({
          // ID:'test',
          width: 280,
          height: 20,
          // margin: 10
          contents: 'Roles assigned to this user:'
      });
      
      var availSourceLabel = isc.Label.create({
          // ID:'test',
          width: 150,
          height: 20,
          // margin: 10
          contents: 'Drag locations to the box on the right:'
      });
      var availLabel = isc.Label.create({
          // ID:'test',
          width: 150,
          height: 20,
          // margin: 10
          contents: 'Locations the user is available to work at:'
      });
      
      var editLabel = isc.Label.create({
          // ID:'test',
          width: 150,
          height: 20,
          // margin: 10
          contents: 'Edit this role then add it:'
      });
      
      
      var editRoleBox = isc.DynamicForm.create({
          fields: [
              {name: "editRole", title:"Edit this role then add it:", type:"text"
               ,titleOrientation: 'top', showTitle: false
               ,width:600
              }
          ]
      });
      
      var addButton = isc.Button.create({
          ID:'mybutton',
          top: 14,
          width: 40,
          title: "Add",
          click: function () {
              rolesGrid.addData({ role: editRoleBox.getField('editRole').getValue() });
              formChanged('roles', rolesGrid.getData().map(function(r) { return r.role; }));
          }
      });


      var rolesPane = isc.VStack.create({layoutLeftMargin:20, membersMargin:10, height:160, members:[
          isc.VStack.create({layoutLeftMargin:0, membersMargin:3, height:40, members:[
              editLabel,
              isc.HStack.create({layoutLeftMargin:0, membersMargin:2, height:20, members:[
                  addButton, editRoleBox
              ]})
          ]}),
          isc.HStack.create({layoutLeftMargin:0, membersMargin:10, height:160, members:[
              isc.VStack.create({layoutLeftMargin:0, membersMargin:10, height:160, members:[
                  rolesSourceLabel,
                  searchRoleInput,
                  rolesGridSource]})
              ,isc.VStack.create({width:32, height:74, layoutAlign:"center", membersMargin:10, members:[
                  isc.Img.create({src:"arrow_right.png", width:32, height:32,
                                  click:function() {
                                      rolesGrid.transferSelectedData(rolesGridSource);
                                      formChanged('roles', rolesGrid.getData().map(function(r) { return r.role; }));
                                  }
                                 }),
                  isc.Img.create({src:"arrow_left.png", width:32, height:32,
                                  click: function() {
                                      rolesGridSource.transferSelectedData(rolesGrid);
                                      formChanged('roles', rolesGrid.getData().map(function(r) { return r.role; }));
                                  }
                                 })
              ]}),
              isc.VStack.create({layoutLeftMargin:0, membersMargin:10, height:160, members:[
                  rolesLabel,
                  rolesGrid]})
          ]})
      ]});
      var availabilityGridSource = isc.AvailabilityGrid.create({
          ID:"availabilityGridSource",
          data:locations,
          canDragRecordsOut: true,
          canAcceptDroppedRecords: true,
          canReorderRecords: true,
          dragDataAction: "move"
          ,onRecordDrop: function(records) {
              console.log(records);
              records = records.map(function(r) {
                  return r.name;
              });
              var locations = availabilityGrid.getData().filter(function(a) {
                  return records.indexOf(a.name) === -1;
              });
              formChanged('avail', locations.map(function(a) { return a.name; }));
          }
      });
      
      var availabilityGrid = isc.AvailabilityGrid.create({
          ID:"availabilityGrid",
          canDragRecordsOut: true,
          canAcceptDroppedRecords: true,
          canReorderRecords: true
          ,onRecordDrop: function(records) {
              console.log(records);
              formChanged('avail', availabilityGrid.getData().concat(records).map(function(r) { return r.name; }));
          }
      });
      var availabilityPane = isc.HStack.create({layoutLeftMargin:20, membersMargin:10, height:160, members:[
          
          isc.VStack.create({layoutLeftMargin:0, membersMargin:10, height:160, members:[
              availSourceLabel,
              searchAvailInput,
              availabilityGridSource
          ]}),
          isc.VStack.create({width:32, height:74, layoutAlign:"center", membersMargin:10, members:[
              isc.Img.create({src:"arrow_right.png", width:32, height:32,
                              click: function() {
                                  availabilityGrid.transferSelectedData(availabilityGridSource);   
                                  formChanged('avail', availabilityGrid.getData().map(function(r) { return r.name; }));
                              }
                             }),
              isc.Img.create({src:"arrow_left.png", width:32, height:32,
                              click: function() {
                                  availabilityGridSource.transferSelectedData(availabilityGrid);
                                  formChanged('avail', availabilityGrid.getData().map(function(r) { return r.name; }));
                              }
                             })
          ]}),
          isc.VStack.create({layoutLeftMargin:0, membersMargin:10, height:160, members:[
              availLabel,
              availabilityGrid
          ]})
      ]});

      //*****************************************************************************************************
      //******************************************************************************************************************
      //**************************************************************************************************************************************
      
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
              }, fields.phone),
              isc.addDefaults({
                  align: 'left'
              }, fields.mob),
              isc.addDefaults({
                  align: 'left'
              }, fields.email)
              
          ]
      };
      
      var notesFormConfig = {
          itemChanged: formChanged,
          autoDraw: false,
          // width:300,
          // height: 48,
          colWidths: [90, "*"],
          numCols: 2,
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
                  // titleOrientation: 'top',
                  width: 250,
                  height: 150,
                  // colSpan: 2,
                  startRow: true
              }, fields.notes)
              
          ]
      };
      
      
      var personEditorHelpLabel = isc.Label.create({
          // ID:'test',
          width: 280,
          height: 20,
          margin: 10,
          contents: 'If save doesn\'t work please check that Status under Main has been filled in.<p></p>' +
              'For a person to be allowed to log in under his own name please assign a password.<p></p>' +
              'Assign at the very least a role of read or for instance read_location-waterford-west for a user to be able to read any data.'
      });
      
      var mainForm = isc.DynamicForm.create(mainFormConfig);
      window.personmainForm = mainForm;
      var addressForm = isc.DynamicForm.create(addressFormConfig);
      var contactForm = isc.DynamicForm.create(contactFormConfig);
      var notesForm = isc.DynamicForm.create(notesFormConfig);
      // var rolesForm = isc.DynamicForm.create(rolesFormConfig);
      
      
      // window.rolesForm = rolesForm;
      // var rolesForm = rolesPane;
      // var availabilityForm = isc.DynamicForm.create(availabilityFormConfig);
      
      var newRoles, newAvailability;
      // var changed;
      
      function formChanged(item, newValue) {
          if (ignoreChanges) return;
          var changed = false;
          console.log(item, newValue);
          log.d('ITEMCHANGED', vm.valuesHaveChanged(), vm.getChangedValues());
          changed = vm.valuesHaveChanged();
          
          if (item === 'roles') {
              console.log('comparing roles', newValue, person.roles);
              if (!areArraysEqual(newValue, person.roles)) {
                  newRoles = newValue;
                  changed = true;
              }
              else newRoles = false;
          }
          else if (item  === 'avail') {
              if (!areArraysEqual(newValue, person.availability)) {
                  newAvailability = newValue;
                  changed = true;
              }
              else newAvailability = false;
          } 
          allButtons.Save.setDisabled(!changed);
      }
      
      

      var pickerBgLabel = isc.Label.create({
          border: "1px grey solid",
          contents: 'background',
          align: 'center',
          width: 100, height: 20,
          click: function() {
              isc.ColorPicker.getSharedColorPicker({
                  colorSelected: function(color, opacity) {
                      // pickerFgLabel.setBackgroundColor(color);
                      // pickerFgLabel.setOpacity(opacity);
                      pickerBgLabel.setBackgroundColor(color);
                      // pickerBgLabel.setOpacity(opacity);
                      // pickerBgLabel.setContents(color);
                      bgColorPicker.setBg(color);
                  }
                  
              }).show();
          }
      });
      
      var pickerFgLabel = isc.Label.create({
          border: "1px grey solid",
          contents: 'text',
          align: 'center',
          width: 100, height: 20,
          click: function() {
              isc.ColorPicker.getSharedColorPicker({
                  colorSelected: function(color, opacity) {
                      pickerFgLabel.setBackgroundColor (color);
                      bgColorPicker.setFg(color);
                      // pickerBgLabel.setBackgroundColor (color);
                      // pickerFgLabel.setContents(color);
                  }
                  
              }).show();
          }
      });
      
      var fgColorPicker = isc.HTMLFlow.create({
          setHtml: function(bg,fg) {
              this.setContents("<div style='border:1px grey solid; text-align:center;" +
                               " min-height:20px; line-height:20px; color:" +
                               fg + ";background-color:" + bg +
                               ";'>Text</div>");
          },
          setBg: function(bg) {
              this.bg = bg;
              this.setHtml(this.bg, this.fg);
          },
          setFg: function(fg) {
              this.fg = fg;
              this.setHtml(this.bg, this.fg);
          },
          align: 'center',
          width: 30, height: 30
          ,click: function() {
              isc.ColorPicker.getSharedColorPicker({
                  colorSelected: function(color) {
                      vm.setValue('colorFg', color);
                      formChanged();
                      fgColorPicker.setFg(color);
                      bgColorPicker.setFg(color);
                  }
                  
              }).show();
          }
      });
      
      var bgColorPicker = isc.HTMLFlow.create({
          setHtml: function(bg,fg) {
              this.setContents("<div style='border:1px grey solid; text-align:center;" +
                               " min-height:20px; line-height:20px; color:" +
                               fg + ";background-color:" + bg +
                               ";'>Calendar color</div>");
          },
          setBg: function(bg) {
              this.bg = bg;
              this.setHtml(this.bg, this.fg);
          },
          setFg: function(fg) {
              this.fg = fg;
              this.setHtml(this.bg, this.fg);
          },
          align: 'center',
          width: 172, height: 30
          ,click: function() {
              isc.ColorPicker.getSharedColorPicker({
                  colorSelected: function(color) {
                      vm.setValue('colorBg', color);
                      formChanged();
                      bgColorPicker.setBg(color);
                      fgColorPicker.setBg(color);
                  }
                  
              }).show();
          }
      });

      
      var mainLayout = isc.VLayout.create({
          align:'top',
          members: [
              mainForm,
              isc.HLayout.create({
                  height:'22',
                  members: [
                      bgColorPicker
                      ,fgColorPicker
                  ]
              })
              ,isc.LayoutSpacer.create({ height: 10 })
          ]
          
      }); 
      
      
      
      var vm = isc.ValuesManager.create({
          members: [
              mainForm, addressForm, contactForm, notesForm //rolesForm, availabilityForm
          ]
      });
    
      window.valueManager = vm;
    
      function addPerson() {
          console.log('addPerson',vm.getValues());
          if (vm.validate()) {
              var person = vm.getValues();
        
              if (!person.notes) person.notes = '';
              
              var fg = person.colorFg ? person.colorFg : 'black';
              var bg = person.colorBg ? person.colorBg : 'f0f8ff';
              log.d('setting css classes' , person._id, fg, bg);
              utils.createCSSClass('.eventColor' + person._id,
                                   'background-color:' + bg +
                                   '; color:' + fg);
              
              if (newRoles) person.roles = newRoles;
              // person.roles = newRoles || [];
              if (newAvailability) person.availability = newAvailability;
              // person.rolesStr= JSON.stringify(person.roles);
              // person.availabilityStr = JSON.stringify(person.availability);
              // person.roles = "";
              // person.availability = "";
              
              typesAndFields.removeUnderscoreFields(person);
              console.log('no underscores?', person);
              editorManager.save(person, updateVm);           
          }
          else {
              console.log('not validating', vm.getErrors());
              
          }
      }
      
      function updateVm(record) {
          console.log('updateVm');
          vm.setValues(record);
          log.d('Disabling save button');
          // changed = !settings.isNewRecord;
          allButtons.Save.setDisabled(!settings.isNewRecord);
          editorManager.changed(editor, false);
      }
                                       
      
      // var parentLabel = isc.Label.create({
      //         height: 30,
      //     padding: 10,
      //     align: "center",
      //     valign: "center",
      //     wrap: false,
      //     // icon: "icons/16/approved.png",
      //     // showEdges: true,
      //     contents: "Mamre house, Southside",
      //     click: "console.log('hello')",
      //     prompt: 'click to edit'
          
      // });
      
      
      var allButtons = {};
      
      var formLayout = isc.HLayout.create({
          members: [ mainLayout
                     ,addressForm
                     ,contactForm
                     ,notesForm
                     // ,rolesForm
                     ,rolesPane
                     ,availabilityPane
                     ,personEditorHelpLabel
                     // ,availabilityForm
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
                                ['Main', 'Address', 'Contact', 'Notes', 'Password', 'Roles', 'Availability', 'Help'],
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
          
          var pwdHelp = "You will have to fill in a password with a score of at least "+MINSCORE +". The password is relatively secure but try not to use a password you already use somewhere else.<p>Feel free to write it down on a piece of paper if you like,just take care never to type it in anywhere except when logging into this app.<p>For more security you can set the password directly in the user database. For how to do this and for more info on security and this app click <a target='_blank' href='http://roster_help.michieljoris.net'>here</a>.";
          var pwd1 = '', pwd2 = '';
          var score = 0;
          
          function checkPwd() {
              score = zxcvbn(pwd1);
              var equal = pwd1 === pwd2 ? 'Passwords identical!!' : 'Passwords not identical';
              helpLabel.setContents('Score: ' + score.score + '<br>Time to crack: ' + score.crack_time_display + '<br><br>' + equal + '<p>' + pwdHelp);
              passwordOk.setDisabled(score.score >= MINSCORE  && pwd1 === pwd2 ? false: true);
              // passwordOk.setDisabled(false);
              return score;
          }
          
          var pwdForm = isc.DynamicForm.create({
              columns: 1
              ,fields: [
                  { type: 'password', name: 'pwd1', title: 'Password:', 
                    titleOrientation: 'top', startRow: true,
                    change:function() {
                        pwd1 = arguments[2];
                        checkPwd();
                    }
                  }
                  
                  ,{ type: 'password', name: 'pwd2', title: 'Repeat:', 
                     change:function() {
                         pwd2 = arguments[2];
                         checkPwd();
                         // console.log('change pwd');
                     },
                     titleOrientation: 'top', startRow: true}
              ]
          });
            
          var helpLabel = isc.Label.create({
              // ID:'test',
              width: 300,
              height: '100%',
              margin: 10
              ,contents: 'Enter your new password.<p>' + pwdHelp
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
                              ID: 'passwordOk',
                              title: 'Ok'
                              ,startRow: true
                              ,disabled: true
                              ,click: function() {
                                  // var pwd1 = pwdForm.getValue('pwd1') || ''; 
                                  // var pwd2 = pwdForm.getValue('pwd2') || '';
                                  log.d('passwords are: ',pwd1, pwd2);
                                  // pwd1 = pwd1  pwd1 : '';
                                  // pwd2 = pwd2 ? pwd2 : '';
                                  
                                  // var key2 = new PBKDF2(pwd2).deriveKey();
                                  
                                  if (pwd1 === pwd2 && score.score >= MINSCORE){
                                      var salt = generateSalt(64);
                                      var iterations = ITERATIONS;
                                      var key = calcKey(pwd1, iterations, salt);
                                      vm.setValue('derived_key', key);
                                      vm.setValue('iterations', iterations);
                                      vm.setValue('password_scheme', 'pbkdf2');
                                      vm.setValue('salt', salt);
                                      pwdForm.setValue('pwd1', '');
                                      pwdForm.setValue('pwd2', '');
                                      formChanged();
                                      window.hide();
                                  }
                                  else {
                                      
                                      // helpLabel.setContents("Passwords don't match. Try again.");
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
      
      function calcKey(pwd, iterations, salt) {
          var hmacSHA1 = function (key) {
              var hasher = new sjcl.misc.hmac(key, sjcl.hash.sha1);
              this.encrypt = function () {
                  return hasher.encrypt.apply(hasher, arguments);
              };
          };
                                      
          function a2hex(str) {
              var arr = [];
              for (var i = 0, l = str.length; i < l; i ++) {
                  var hex = Number(str.charCodeAt(i)).toString(16);
                  arr.push(hex);
              }
              return arr.join('');
          }
                                      
          var hexSalt = a2hex(salt);
          var sjclSalt = sjcl.codec.hex.toBits(hexSalt);
              // var compkey = new PBKDF2(pwd, iterations, salt).deriveKey();
          var key = sjcl.codec.hex.fromBits(
                  sjcl.misc.pbkdf2(pwd,
                                   sjclSalt,
                                   iterations, 160, hmacSHA1));
          // console.log(compkey, key);
          return key;
      }
        
      function generateSalt(len) {
          var set = '0123456789abcdefghijklmnopqurstuvwxyz',
          setLen = set.length,
          salt = '';
          for (var i = 0; i < len; i++) {
              var p = Math.floor(Math.random() * setLen);
              salt += set[p];
          }
          return salt;
      }
       
      
      function action(e) {
          switch (e) {
            case 'Main': formLayout.setVisibleMember(mainLayout); break;
            case 'Address': formLayout.setVisibleMember(addressForm); break;
            case 'Contact': formLayout.setVisibleMember(contactForm); break;
            case 'Notes': formLayout.setVisibleMember(notesForm); break; 
            case 'Roles': getLocations(); formLayout.setVisibleMember(rolesPane); break; 
            case 'Availability': getLocations(); formLayout.setVisibleMember(availabilityPane); break; 
            case 'Password': pickPwd(); break;
            case 'Help': formLayout.setVisibleMember(personEditorHelpLabel); break;
              
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
      
      
      
      // var layout = isc.VLayout.create({
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
      
      var ignoreChanges;
      editor.set = function(somePerson, someSettings) {
          ignoreChanges = true;
          ajaxedLocations = false;
          console.log('setting values', somePerson, someSettings);
          settings = isc.addDefaults(someSettings, defaultSettings);
          
          // console.log('somePerson', somePerson);
          person = somePerson;
          console.log("PERSON.ROLES:", person.roles, typeof person.roles);
          // try {
          //     person.roles = JSON.parse(person.roles);
          // }catch(e) {
          //     person.roles = [];
          // }
          person.roles = person.roles || [];
          console.log("PERSON.ROLES:", person.roles, typeof person.roles);
          rolesGrid.setData(
              person.roles.map(function(r) {
                  return { role: r };
              }));
          newRoles = false;
          
          person.availability = person.availability || [];
          // try {
          //     person.availability = JSON.parse(person.availabiltiy);
          // }catch(e) {
          //     person.availability = [];
          // }
          availabilityGrid.setData(
              person.availability.map(function(a) {
                  return { name: a };
              }));
          newAvailability = false;
          
          fgColorPicker.setBg(person.colorBg);
          bgColorPicker.setBg(person.colorBg);
          fgColorPicker.setFg(person.colorFg);
          bgColorPicker.setFg(person.colorFg);
          itemViewer.setData(somePerson);
          
          vm.clearErrors();
          
          allButtons.Discard.setVisibility(settings.cancelButton);
          allButtons.Delete.setVisibility(settings.removeButton);
          allButtons.Save.setVisibility(settings.saveButton);
          allButtons.Save.setDisabled(true);
          // allButtons.Discard.setDisabled(true);
          
          formLayout.setVisibleMember(mainLayout);
          // if (typeof person.rolesStr === 'string')
          //      person.roles = JSON.parse(person.rolesStr);
          // else person.roles = [];
          // if (typeof person.availabilityStr === 'string')
          //     person.availability = JSON.parse(person.availabilityStr);
          // else person.availability = [];
          // person.roles = person.roles || [''];
          // person.availability = person.availability || [''];
          vm.setValues(person);
          // changed = false;
          ignoreChanges = false;
      };
      
      editor.init = function() {     // var dataSource = Editor.getBackend().getDS();
          // eventForm.getField('person').setOptionDataSource(dataSource);
          // eventForm.getField('location').setOptionDataSource(dataSource);
      };
      
      editor.isChanged = function() {
          log.d('returning changed', allButtons.Save.state);
          return allButtons.Save.state !== 'Disabled';
      };
      
      addButton.setTop(14);
      return editor;

  }});


