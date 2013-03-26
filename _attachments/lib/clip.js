/*global $:false logger:false define:false */
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:7 maxlen:1190 devel:true*/

define
({ //load: ['js!lib/raphael-min.js'],
    inject: [],
    factory: function() {
        "use strict";
        var log = logger('clip');
        var clipped = {};
        function zclip(id, copy, afterCopy) {
            if (clipped[id]) return; 
            var el = $('#' + id);
            var clip = {
                path:'lib/ZeroClipboard.swf',
                copy: copy
                ,afterCopy: afterCopy
                // function() {
                //     alert('Dummy timesheet data copied to system clipboard which you can paste into excel (not implemented yet).');
                // }
            };
            el.zclip(clip);
           
            // var arr = [
            //     ['A', 'B', 'C'],
            //     ['D', 'Some long text', 'F'],
            //     ['G', 'H', 'I']
            // ];
            // text = SheetClip.stringify(arr);
            clipped[id] = true;
           
        }
        
       return zclip;
        
        
    }});