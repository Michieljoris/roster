/*global  isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:4 maxcomplexity:7 maxlen:190 devel:true*/

define
({inject: [],
  factory: function() {
      "use strict";
      var API = {};

      var exampleData = [
          { _id: 'p1'},
          { _id: 'p2'}
      ];
      
      var parentLabel = isc.Label.create({
          height: 30,
          padding: 10,
          align: "center",
          valign: "center",
          wrap: false,
          // icon: "icons/16/approved.png",
          // showEdges: true,
          contents: "Drag parent items back and forth"
          
      });
      
      isc.defineClass("parentList","ListGrid").addProperties({
          width:150, cellHeight:24, imageSize:16,
          height:300,
          showEdges:true, border:"0px", bodyStyleName:"normal",
          alternateRecordStyles:true, showHeader:false, leaveScrollbarGap:false,
          emptyMessage:"<br><br>Drag &amp; drop parents here",
          
          fields:[
              {name:"_id", title: 'Inheriting values from:',
               prompt: "Drag items into inheriting from box"
              }]
          // trackerImage:{src:"pieces/24/cubes_all.png", width:24, height:24}
      });
      
      var inheritableList = isc.VStack.create({

          members: [
              isc.Label.create({ contents: 'Eligible parents:', height: 20 }),
              isc.parentList.create({
                  ID:"inheritableList",
                  // height: 300,
                  autoDraw:false,
                  canDragRecordsOut: true,
                  canAcceptDroppedRecords: true,
                  // canReorderRecords: true,
                  data: [
                      { _id: 'Southside'},
                      { _id: 'Northside'}
                  ]
              }) ]
          
      });

      
      var inheritingList = isc.VStack.create({
          members: [
              isc.Label.create({ contents: 'Inherited', height: 20 }),
              isc.parentList.create({
                  ID:"inheritingList",
                  // height: 300, 
                  autoDraw:false,
                  canDragRecordsOut: true,
                  canAcceptDroppedRecords: true,
                  canReorderRecords: true,
                  data: [
                      { _id: 'p1'},
                      { _id: 'p2'}
                  ]
              })

          ]});
      
      
          var arrows = isc.VStack.create(
              {width:32, height:74, layoutAlign:"center", membersMargin:10,
               members:[
                   isc.Img.create({src:"arrow_right.png", width:32, height:32,
                                   click:"inheritingList.transferSelectedData(inheritableList)"
                                  }),
                   isc.Img.create({src:"arrow_left.png", width:32, height:32,
                                   click:"inheritableList.transferSelectedData(inheritingList)"
                                  })
               ]});
      
          var stack = isc.HStack.create({
              // left:170,
              // showEdges:true,
               membersMargin:5,  layoutMargin:10,
              members:[ 
                      inheritableList, arrows, inheritingList 
              
              ]
          });


      var buttons = isc.HStack.create({
          // width: 500, 
          membersMargin:5,  layoutMargin:10,
          height: 20,
          // showEdges:true,
          // align: 'right',
          members: [
              isc.Button.create({
                  title: "Cancel",
                  click: '',
                  width: 50
              }),
              // isc.LayoutSpacer.create(), // Note the use of the LayoutSpacer
              isc.Canvas.create({width:230}), // Note the use of the LayoutSpacer
              isc.Button.create({
                  title: "Save",
                  click: '',
                  width: 50,
                  layoutAlign: 'right'
              }) 
          ]
      });
      
      
    
          var parentListEditorWindow = isc.Window.create({
              ID: 'parentEditor',
              title: "Edit parents",
              autoSize: true,
              // width: 400,
              canDragReposition: true,
              canDragResize: false,
              showMinimizeButton:false, 
              autoCenter: true,
              isModal: true,
              showModalMask: true,
              autoDraw: false,
              items: [parentLabel, stack, buttons]
          });
      
    
    
          API.show = function(group, parents) {
              //TODO put parents in right box, all items of group 'group'
              //in leftbox, except the ones that are already in the
              //rightbox
              parentListEditorWindow.show();
          };
          return API;   

      }});
