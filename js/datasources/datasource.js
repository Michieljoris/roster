/*global logger:false define:false isc:false*/
/*jshint strict:true unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:5 maxcomplexity:10 maxlen:190 devel:true*/

define
({  inject : ['datasources/pouchDS', 'datasources/couchDS'],
// ({  inject : ['datasources/pouchDS'],
    factory: function() {
        "use strict";
        var log = logger('datasource');
        log.d('Evaluating datasource');
        
        var dataSource;
        var idbname= 'idb://pouchdb';
        
        var args = Array.prototype.slice.apply(arguments);
        var dsNames = [];
        var dsMap = {};
        var valueMap = {};
        
        args.forEach(function(a) {
            dsNames.push(a.name);
            dsMap[a.name] = a;
            valueMap[a.name] = a.shortName;
        });
        
        //return list of names of the databases available
        function ls() {
            return dsNames;
        }
        
        //set the database adapter to be used to dbname
        function set(dsName) {
            dataSource = dsMap[dsName];
            return dataSource;
        }
        
        function get() {
            //return handle to the datasource currently used
            return dataSource;
        }
        
        
        /** Pick a datasource */
        function pick(callback){
            var pickDsForm = isc.DynamicForm.create({
                columns: 1
                ,fields: [
                    {  type: 'radioGroup', name: "datasource",  showTitle: true, 
                       valueMap: valueMap, titleOrientation: 'top', value: 'pouchDS'
                       ,width: 300
                       ,change: function() {
                           var dataSourceName = arguments[2];
                           log.d('change', dataSourceName);
                           helpLabel.setContents(dsMap[dataSourceName].description);
                           pickDsForm.getField('dbname').title=dsMap[dataSourceName].sourceType;
                           pickDsForm.getField('dbname').redraw();
k                           
                       }
                    }
                    ,{ type: 'text', name: 'dbname', title: 'Url or name', ID:'test',
                       titleOrientation: 'top', startRow: true, width: 300, value: 'pouchDB'}
                ]
            });
            
            var helpLabel = isc.Label.create({
                // ID:'test',
                width: 300,
                height: '100%',
                margin: 10
                ,contents: dsMap.pouchDS.description
            });
            
            var editorWindow = isc.Window.create({
                title: "Select a database backend."
                // ,autoSize: true
                ,height:300
                ,width:320
                ,canDragReposition: false
                ,canDragResize: false
                ,showMinimizeButton:false
                ,showCloseButton:false
                ,autoCenter: true
                ,isModal: true
                ,showModalMask: true
                ,autoDraw: false
                ,items: [
                    pickDsForm
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
                                title: 'Ok'
                                ,startRow: false
                                ,click: function() {
                                    var ds = pickDsForm.getValue('datasource'); 
                                    // log.d(ds);
                                    dataSource = dsMap[ds];
                                    // console.log(dsMap, dataSource);
                                    editorWindow.hide();
                                    callback(dataSource.name);
                                }  
                            })
                            ,isc.LayoutSpacer.create()
                        ]
                        
                    })
                ] 
            });
            editorWindow.show();
        }
        
        return {
            ls: ls
            ,pick: pick
            ,get: get
            ,set: set
        };
    }
});