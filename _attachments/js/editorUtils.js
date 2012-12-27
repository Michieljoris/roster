/*global  isc:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:190 devel:true*/

define
({inject: [],
  factory: function() {
      "use strict";
     var log = logger('editorUtils') ;

      
      function buttonBar(allButtons, orientation, height, width,  entries, buttonProps, action) {
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
              height: height,
              width: width,
              members: members
              //,showResizeBar: true,
              // ,border: "1px solid blue"
          });
          
      }
      
      return {
          buttonBar: buttonBar
      };
      

  }});
