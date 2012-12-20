/*
 * Isomorphic SmartClient
 * Version v8.2p_2012-09-05 (2012-09-05)
 * Copyright(c) 1998 and beyond Isomorphic Software, Inc. All rights reserved.
 * "SmartClient" is a trademark of Isomorphic Software, Inc.
 *
 * licensing@smartclient.com
 *
 * http://smartclient.com/license
 */






// --------------------------------------------------------------------------------------------
//> @class ProcessElement
// A ProcessElement is an abstract superclass for elements involved in a +link{Process}, such
// as a +link{Task} or +link{XORGateway}.
// @visibility workflow
//<
isc.defineClass("ProcessElement");

isc.ProcessElement.addProperties({
    //> @attr processElement.ID (String : null : IR)
    // Optional ID for this process element, allowing it to be referred to from
    // +link{Gateway}s, or as the +link{process.startElement}.  See +link{ProcessSequence} and
    // +link{Process} to understand when this is required or can be omitted.
    // <P>
    // Unlike +link{Canvas.ID} a <code>processElement</code>'s is a not a globally unique
    // variable, it need only by unique within it's process.
    // <P>
    // When assigned an ID, a <code>processElement</code> can be retrieve via
    // +link{process.getElement()}.
    // @visibility workflow
    //<

    //> @attr processElement.nextElement (String : null : IR)
    // Next +link{process.sequences,sequence} or +link{process.elements,element} to execute
    // after this one completes.  Sequences are checked first. <code>nextElement</code> does
    // not need to be specified on most elements if you use
    // +link{Process.sequences,sequences}.
    // @visibility workflow
    //<
});

// --------------------------------------------------------------------------------------------
//> @class ProcessSequence
// An Array of +link{ProcessElement}s involved in a +link{Process}.  A 
// <code>ProcessSequence</code> is used to reduce the number of explicit
// +link{ProcessElement.ID}s that need to be assigned, by creating an implicit next element -
// the next in the sequence.
// <P>
// A sequence cannot be executed outside of a Process and has no state.
// @visibility workflow
//<
isc.defineClass("ProcessSequence", "ProcessElement");

isc.ProcessSequence.addProperties({
    //> @attr processSequence.elements (Array of ProcessElement : null : IR)
    // The +link{ProcessElement}s in this sequence.
    // @visibility workflow
    //<
});

// --------------------------------------------------------------------------------------------

//> @class Task
// A Task is an abstract superclass for +link{Process} and for all Task types that can be
// involved in a Process, such as a +link{ServiceTask}.
//
// @visibility workflow
//<

isc.defineClass("Task", "ProcessElement");

isc.Task.addProperties({
    //> @attr task.inputField (String : null : IR)
    // Field in the +link{Process.state,process state} which is provided as input data to this
    // task.  
    // See +link{group:taskIO}.
    // @visibility workflow
    //<

    //> @attr task.inputFieldList (Array of String : null : IR)
    // List of multiple fields from the +link{Process.state,process state} which are provided
    // as input data to this task. See +link{group:taskIO}.
    // <P>
    // If +link{inputField} is also specified, it will be implicitly added to the
    // <code>inputFieldList</code> if it is not already present.
    // @visibility workflow
    //<

    //> @attr task.outputField (String : null : IR)
    // Field in the +link{Process.state,process state} which this task writes outputs to. See
    // +link{group:taskIO}.
    // @visibility workflow
    //<

    //> @attr task.outputFieldList (Array of String : null : IR)
    // List of multiple fields from the +link{Process.state,process state} which this task will
    // write to. See +link{group:taskIO}.  
    // <P>
    // If +link{outputField} is also specified, it will be implicitly added to the
    // <code>outputFieldList</code> if it is not already present.
    // @visibility workflow
    //<

    //> @groupDef taskIO
    // Each task has inputs, which can be thought of as copied from the 
    // +link{process.state,Process state} when the task is started, and outputs, which can be
    // thought of as atomically applied to the Process state when a task is completed.
    // <P>
    // Task can use +link{task.inputField} to specify the field from the Process state that
    // should be used as inputs, and +link{task.outputField} to specify the field from the
    // Process state that the task should output to.
    // <P>
    // More complex tasks can take multiple fields from the process state via
    // +link{task.inputFieldList} and write to multiple fields of the process state via
    // +link{task.outputFieldList}. In this case, the task is said to have an "input Record"
    // and/or "output Record", which can be thought of as a copy of the process state Record
    // with only the fields listed in the <code>inputFieldList</code> are copied.
    // <P>
    // When both <code>inputField</code> and <code>inputFieldList</code> are specified, the
    // inputField is considered the "primary" input field and will be used automatically by
    // various Task subclasses.
    // @title Task Input / Output
    // @visibility workflow
    //<
    

    //> @groupDef taskInputExpression
    // In some tasks, the input to the task needs to be passed to a service being called by the
    // task, to a user-visible form, or other consumers of the input data. 
    // A TaskInputExpression can be used to do this declaratively.
    // <P>
    // A TaskInputExpression is a String prefixed with either "$input" or "$inputRecord",
    // followed by an optional dot-separated hierarchical path, which can specify either an
    // atomic data value (String, Number) or Record from the input data.  For example, if the
    // +link{process.state} represented in JSON were:
    // <pre>
    // {
    //    orderId:5,
    //    orderItems: [
    //       {name:"Pencils", quantity:3, itemId:2344}
    //    ],
    //    orderUser: { name:"Henry Winkle", address:"...", ... }
    // }
    // </pre>
    // .. and a task specified an <code>inputField</code> of "orderId" and an inputFieldList of
    // "orderItems","orderUser", then:
    // <ul>
    // <li>$input is the value 5
    // <li>$inputRecord.orderUser.name is "Henry Winkle"
    // <li>$inputRecord.orderItems[0] is the first orderItems Record ({name:"Pencils", ... })
    // </ul>
    // @title Task Input Expressions
    // @visibility workflow
    //<
});

// --------------------------------------------------------------------------------------------
//> @class Process
// A instance of Process represents a stateful process executing a series of Tasks, 
// which may be:
// <ul>
// <li> user interactions
// <li> calls to DataSources (hence: any database or web service)
// <li> arbitrary code
// <li> other Processes
// </ul>
// A Process is <i>stateful</i> in the sense that it maintains +link{process.state,state}
// across the different tasks that are executed.  This allows you to maintain context as you
// walk a user through a multi-step business process in your application, which may involve
// multiple operations on multiple entities.  Each Task that executes can use the Process state
// as inputs, and can output a result which is stored in the Process state - see
// +link{group:taskIO}.
// <P>
// A Process can have multiple branches, choosing the next Task to execute based on
// +link{Criteria} - see +link{XORGateway} and +link{DecisionGateway}.
// <P>
// Because a Process may return to a previous Task in various situations, the data model of a
// Process is strictly speaking a <i>graph</i> (a set of nodes connected by arbitary
// interlinks). However, most processes have sequences of several tasks in a row, and the
// definition format allows these to be represented as simple Arrays called "sequences",
// specified via +link{process.sequences}.  This reduces the need to manually specify IDs and
// interlinks for Tasks that simply proceed to the next task in a sequence.
// 
// @visibility workflow
//<
isc.defineClass("Process", "Task");

isc.Process.addProperties({
    init : function () {
        var res = this.Super("init", arguments);
        if (this.autoStart) this.start();
        return res;
    },
    
    //> @attr process.sequences (Array of ProcessSequence : null : IR)
    // Sequences of ProcessElements.  By defining a sequences of elements you can make the
    // +link{processElement.nextElement} implicit.
    // <P>
    // <var class="smartclient">You do not have to explicitly create a +link{ProcessSequence},
    // you can instead use the shorthand:
    // <pre>
    // isc.Process.create({
    //     startElement:"firstSequence", 
    //     sequences: [
    //         { ID:"something", elements: [ ... ] },
    //         { ID:"somethingElse", elements: [ ... ] },
    //         ...
    //     ]
    //     ...
    // });
    // </pre>
    // .. this is equivalent to ..
    // <pre>
    // isc.Process.create({
    //     startElement:"firstSequence", 
    //     sequences: [
    //         isc.ProcessSequence.create({ 
    //              ID:"something", 
    //              elements: [ ... ] 
    //         }),
    //         isc.ProcessSequence.create({ 
    //              ID:"somethingElement", 
    //              elements: [ ... ] 
    //         }),
    //         ...                           
    //     ]
    //     ...
    // });
    // </pre>
    // </var>
    // <var class="smartgwt">
    // Example of using sequences:
    // <pre>
    // Process process = new Process();
    // process.setStartElement("firstSequence");
    // ProcessSequence innerSequence = new ProcessSequence(incTask, add2Task, incTask);
    // process.setSequences(
    //     new ProcessSequence("firstSequence", serviceTask, decisionGateway),
    //     new ProcessSequence("errorFlow", failureTask, userNotifyTask)
    // );
    // // standalone process elements not part of sequences
    // process.setElements(new ServiceTask(){...});
    // Record state = new Record();
    // state.setAttribute("someField", "someValue");
    // process.setState(state);
    // process.start();
    // </pre>
    // </var>
    // @visibility workflow
    //<

    //> @attr process.elements (Array of ProcessElement : null : IR)
    // Elements involved in this Process.  You can also group elements into +link{sequences}
    // to reduce the need to explicitly define IDs for elements and interlink them.
    // @visibility workflow
    //<

    //> @attr process.startElement (String : null : IR)
    // The ID of either a +link{sequences,sequence} or an +link{elements,element} which should
    // be the starting point of the process.  If not specified, the first sequence is chosen,
    // or if there are no sequences, the first element.
    // - log a warning and do nothing if there are neither sequences or elements
    // <var class="smartclient">
    // - an example of how a Process would be defined
    // <pre>
    // isc.Process.create({
    //     startElement:"firstSequence", 
    //     sequences: [
    //         { 
    //            id:"firstSequence",
    //            elements : [
    //                isc.ServiceTask.create({ .. }),
    //                isc.DecisionGateway.create({ .. })
    //            ]
    //         },
    //         {
    //            id:"errorFlow",
    //            elements : [ ... ]
    //            
    //         }
    //     ],
    //     elements: [
    //        // standalone process elements not part of sequences
    //        isc.ServiceTask.create({ .. })
    //     ],
    //     state : {
    //         someField:"someValue"
    //     }
    // })
    // </pre>
    // </var>
    // @visibility workflow
    //<

    //> @method process.getElement()
    // Retrieve a +link{ProcessElement} by it's ID
    // @param ID (String) id of the process element
    // @return (ProcessElement) the indicated process element, or null if no such element
    // exists
    // @visibility workflow
    //<
    getElement : function (ID) {
        return this._searchElement(this, ID);
    },
    
    _searchElement : function (sequence, ID) {
        if (sequence.sequences) {
            for (var i = 0; i < sequence.sequences.length; i++) {
                var s = sequence.sequences[i];
                if (s.ID == ID) {
                    return s;
                } else if (s.sequences || s.elements) {
                    var res = this._searchElement(s, ID);
                    if (res) return res;
                }   
            }
        }
        if (sequence.elements) {
            for (var i = 0; i < sequence.elements.length; i++) {
                var e = sequence.elements[i];
                if (e.ID == ID) {
                    return e;
                } else if (e.sequences || e.elements) {
                    var res = this._searchElement(e, ID);
                    if (res) return res;
                }   
            }
        }
    },

    //> @attr process.state (Record : null : IRW)
    // Current state of a process.  As with Records in general, any field of a Record may
    // contain a nested Record or Array of Records, so the process state is essentially a
    // hierarchical data structure.
    //
    // @visibility workflow
    //<
    
    
    //> @attr process.autoStart (boolean : false : IR)
    // Cause the process to automatically call +link{start()} as soon as it is created.
    // @visibility workflow
    //<
    autoStart: false,
        
    //> @method process.start()
    // Starts this task by executing the +link{startElement}.
    // @visibility workflow
    //<
    start : function () {
        // Process can be async, so we continue it's execution no matter where we've stopped
        if (this.executionStack == null) {
            this.executionStack = [];        
        }
        while (this._next()) {
            var currentTask = this._getFirstTask();
            // check for empty sequence
            if (currentTask) {
                // every task should implement it's logic
                if (!currentTask.executeElement(this)){
                    return;
                }
            }
            
        }
        if (this.finished) this.finished(this.state);
    },
    
    // If user didn't set ID or don't use nextElement property we will take next element
    // or sequence based on their order
    _next : function () {
        var currEl = this.executionStack.last();
        if (currEl == null) {
            // start processing
            if (this.startElement) {
                return this._gotoElement(this, this.startElement);    
            } else if (this.sequences && this.sequences.length > 0) {
                this.executionStack.add({el:this, sIndex: 0});
                return this.sequences[0];
            } else if (this.elements && this.elements.length > 0) {
                this.executionStack.add({el:this, eIndex: 0});
                return this.elements[0];
            } else {
                isc.logWarn("There are neither sequences or elements. Nothing to execute.");
            }
        } else {
            var el = null;
            if (currEl.sIndex != null) {
                el = currEl.el.sequences[currEl.sIndex];
            } else if (currEl.eIndex != null) {
                el = currEl.el.elements[currEl.eIndex];
            }
            if (el.nextElement) {
                this.executionStack = [];
                return this._gotoElement(this, el.nextElement);
            } else {
                return this._findNextElement();
            }
        }
    },
    
    _gotoElement : function (sequence, ID) {
        var elData = {el: sequence};
        this.executionStack.add(elData);
        if (sequence.sequences) {
            for (var i = 0; i < sequence.sequences.length; i++) {
                var s = sequence.sequences[i];
                elData.sIndex = i;
                if (s.ID == ID) {
                    return s;
                } else if (s.sequences || s.elements) {
                    var res = this._gotoElement(s, ID);
                    if (res) return res;
                }   
            }
        }
        delete elData.sIndex;
        if (sequence.elements) {
            for (var i = 0; i < sequence.elements.length; i++) {
                var e = sequence.elements[i];
                elData.eIndex = i;
                if (e.ID == ID) {
                    return e;
                } else if (e.sequences || e.elements) {
                    var res = this._gotoElement(e, ID);
                    if (res) return res;
                }   
            }
        }
        this.executionStack.removeAt(this.executionStack.length - 1);
    },
    
    _findNextElement : function () {
        var elData = this.executionStack.last();
        if (elData.eIndex != null && elData.el != this) {
            if (elData.eIndex == elData.el.elements.length - 1) {
                this.executionStack.removeAt(this.executionStack.length - 1);
                if (elData.el == this) {
                    return;
                } else {
                    return this._findNextElement();                            
                }
            } else {
                elData.eIndex++;
                return elData.el.elements[elData.eIndex];
            }
        }
    },
    
    // recursively search for first non-sequence in element
    _getFirstTask : function () {
        var lastElData = this.executionStack.last();
        var el = null;
        if (lastElData.sIndex != null) {
            el = lastElData.el.sequences[lastElData.sIndex];
        } else if (lastElData.eIndex != null) {
            el = lastElData.el.elements[lastElData.eIndex];
        }
        if (el.sequences == null && el.elements == null) {
            return el;
        }
        var elData = {el: el};
        this.executionStack.add(elData);
        if (el.sequences) {
            for (var i = 0; i < el.sequences.length; i++) {
                elData.sIndex = i
                var res = this._getFirstTask(el.sequences[i]);
                if (res) return res;
            }
        }
        if (el.elements) {
            for (var i = 0; i < el.elements.length; i++) {
                elData.eIndex = i
                var res = this._getFirstTask(el.elements[i]);
                if (res) return res;
            }
        }
        this.executionStack.removeAt(this.executionStack.length - 1);
    },
    
    setNextElement : function (nextElement) {
        this.executionStack = [];
        this.startElement = nextElement;
    }
});

isc.Process.registerStringMethods({
    //> @method process.finished()
    // StringMethod called when a process completes, meaning the process executes a 
    // ProcessElement with no next element.
    // @param state (Record) the final process state
    // @visibility workflow
    //<
    finished: "state"
});

// --------------------------------------------------------------------------------------------

//> @class ServiceTask
// A ServiceTask is an element of a +link{Process} which calls a DataSource operation, 
// optionally using part of the +link{Process.state,process state} as inputs or storing outputs
// in the process state.
// <P>
// By default a ServiceTask takes the data indicated by +link{task.inputField} and uses it as
// +link{dsRequest.data}.  This means the input data becomes +link{Critera} for a "fetch"
// operation, new record values for an "add" operation, etc.
// <P>
// Alternatively, you can set +link{serviceTask.criteria} for a "fetch" operation, or
// +link{serviceTask.values} for other operationTypes.  In both cases, you have the ability to
// use simple expressions like $input.<i>fieldName</i> to take portions of the input data and
// use it as part of the criteria or values.
// <P>
// As a special case, if the <code>inputField</code> is an atomic value (just a String or
// Number rather than a Record) and operationType is "fetch", it will be assumed to be value
// for the primary key field of the target DataSource if +link{serviceTask.criteria,criteria}
// is not explicitly specified
// <P>
// OutputData and outputFieldList work as filters. You should determine which properties should
// be fetched into the process state. If you want to load all data without defining every
// property manually you can pass a name started with '$' and fetched record or records will be 
// placed as a record or an array of records by the name without this specific symbol.
// <P>
// For example if you specify 'id' and 'name' in outputFieldList, only these properties will be
// fetched in the process state. If you pass '$record' in outputField a whole record will be 
// stored in process state under the 'record' key. Also you can use javascript syntax there.
// For example '$record.item[0]'.
// @visibility workflow
//<
isc.defineClass("ServiceTask", "Task");

isc.ServiceTask.addProperties({
    //> @attr serviceTask.dataSource (DataSource or identifier : null : IR)
    // DataSource ID or DataSource instance to be used.
    // @visibility workflow
    //<

    //> @attr serviceTask.operationType (DSOperationType : "fetch" : IR)
    // Type of operation to invoke
    // @visibility workflow
    //<
    operationType: "fetch",

    //> @attr serviceTask.criteria (Criteria : null : IR)
    // Criteria (including AdvancedCriteria) to use for a "fetch" operation.
    // <P>
    // Data values in this criteria prefixed with "$" will be treated as dynamic expressions
    // which can access the inputs to this task as $input - see
    // +link{group:taskInputExpression}.  Specifically, this means that for simple criteria,
    // any property value that is a String and is prefixed with "$" will be assumed to be an
    // expression, and for AdvancedCriteria, the same treatment will be applied to
    // +link{criterion.value}.
    // <P>
    // If any data value should not be treated as dynamic (for example, a "$" should be taken
    // as literal), you can place it in +link{fixedCriteria} instead.
    // <P>
    // Ignored for any operationType other than "fetch".  Update or delete operations should
    // place the primary key to update in +link{values}.
    // @group taskIO
    // @visibility workflow
    //<

    //> @attr serviceTask.values (Record : null : IR)
    // Values to be submitted for "update", "add" and "remove" operations.
    // <P>
    // Similar to +link{criteria}, data values prefixed with "$" will be treated as a
    // +link{group:taskInputExpression}.  Use +link{fixedValues} for any values that start with
    // "$" but should be treated as a literal.
    // @visibility workflow
    //<

    //> @attr serviceTask.fixedCriteria (Criteria : null : IR)
    // Criteria to be submitted as part of the DSRequest, regardless of inputs to the task.
    // Will be combined with the data from the +link{task.inputField} or with
    // +link{serviceTask.criteria} if specified, via +link{DataSource.combineCriteria()}.
    // @visibility workflow
    //<

    //> @attr serviceTask.fixedValues (Record : null : IR)
    // Values to be submitted as part of the DSRequest, regardless of inputs to the task. Will 
    // be combined with the data from the +link{task.inputField} or with
    // +link{serviceTask.values} if specified, via simple copying of fields, with
    // <code>fixedValues</code> overwriting values provided by the <code>inputField</code>, but
    // explicitly specified +link{serviceTask.values} overriding <code>fixedValues</code>.
    // @visibility workflow
    //<
    
    executeElement : function (process) {
        var ds = this.dataSource;
        if (ds.getClassName == null || ds.getClassName() != "DataSource") {
            ds = isc.DataSource.get(ds);
        }
        var inputData = {};
        if (this.inputFieldList) {
            for (var i = 0; i < this.inputFieldList.length; i++) {
                inputData[this.inputFieldList[i]] = process.state[this.inputFieldList[i]];
            };
        }
        if (this.inputField) {
            inputData[this.inputField] = process.state[this.inputField];
        }
        
        var data = null;
        if (this.operationType == "fetch") {
            if (this.criteria) {
                data = this.criteria;
                this._processCriteriaExpressions(data, inputData);
            }
            if (this.fixedCriteria) {
                if (data == null) {
                    data = this.fixedCriteria
                } else {
                    data = isc.DataSource.combineCriteria(data, this.fixedCriteria);    
                }
            }
        }
        if (data == null) {
            data = inputData;
        }
        var task = this;
        ds.performDSOperation(this.operationType, data, function(dsResponse) {
            if (dsResponse.data.length > 0) {
                if (task.outputField && task.outputField.startsWith("$")) {
                    var data = dsResponse.data;
                    if (data.length == 1) data = data[0];
                    var path = task.outputField.substring(1);
                    isc.Class.evaluate("state." + path + " = data",
                        {state: process.state, data: data});
                } else {
                    var fieldsToProceed = [];
                    if (task.outputFieldList) {
                        fieldsToProceed.addList(task.outputFieldList);
                    }
                    if (task.outputField) fieldsToProceed.add(task.outputField);
                    for (var i = 0; i < fieldsToProceed.length; i++) {
                        var fieldName = fieldsToProceed[i];
                        var value = dsResponse.data[0][fieldName];
                        if (typeof value != 'undefined') {
                            if (dsResponse.data.length > 1) {
                                value = [value];
                                for (var i = 1; i < dsResponse.data.length; i++) {
                                  value.add(dsResponse.data[i][fieldName])
                                }
                            }
                            process.state[fieldName] = value;
                        }
                    };
                }
            }
            process.start();
        });
        return false;
    },
    
    _processCriteriaExpressions : function (criteria, inputData) {
        for (var name in criteria) {
            if (name == "criteria") {
                this._processCriteriaExpressions(criteria.criteria, inputData);
            } else if (criteria[name].startsWith("$input")) {
                var script = "state." + criteria[name].replace("$input", this.inputField);
                criteria[name] = isc.Class.evaluate(script, {state: inputData});
            } else if (criteria[name].startsWith("$inputRecord")) {
                var script = criteria[name].replace("$inputRecord", "state");
                criteria[name] = isc.Class.evaluate(script, {state: inputData});
            }
        }
    }
});

// --------------------------------------------------------------------------------------------

//> @class ScriptTask
// Task that executes arbitrary code, either synchronous or asynchronous.  Override the
// +link{execute()} method to provide custom logic.
// @visibility workflow
//<
isc.defineClass("ScriptTask", "Task");

isc.ScriptTask.addProperties({
    //> @method scriptTask.getInputData()
    // Get the inputs to this task as specified by +link{task.inputField}.
    // <P>
    // For a task with a +link{task.inputFieldList,inputFieldList}, use +link{getInputRecord}
    // to get access to other inputs.
    // @return (any) input data
    // @group taskIO
    // @visibility workflow
    //<
    getInputData : function () {
        return this.inputData;
    },

    //> @method scriptTask.setOutputData()
    // Set the task output as specified by +link{task.outputField}.
    // <P>
    // NOTE: for an +link{script.isAsync,asychronous task}, calling
    // <code>setOutputData()</code> indicates the task is complete.  For a task with
    // +link{task.outputFieldList,multiple outputs}, call +link{setOutputRecord()} instead.
    // @param taskOutput (any) task output
    // @group taskIO
    // @visibility workflow
    //<
    setOutputData : function (taskOutput) {
        this._finishTask(this.process, null, taskOutput);
    },

    //> @method scriptTask.getInputRecord()
    // Get all inputs to the task as specified by the 
    // +link{task.inputFieldList,inputFieldList}, as a Record.
    // @return (Record) input data
    // @group taskIO
    // @visibility workflow
    //<
    getInputRecord : function () {
        return this.inputRecord;
    },

    //> @method scriptTask.setOutputRecord()
    // Set all outputs of the task as specified by the
    // +link{task.outputFieldList,outputFieldList}, by providing a Record.
    // @param outputRecord (Record) output record
    // @group taskIO
    // @visibility workflow
    //<
    setOutputRecord : function (outputRecord) {
        this._finishTask(this.process, outputRecord);
    },

    //> @attr scriptTask.isAsync (boolean : false : IR)
    // Whether the script task is asynchronous.  A synchronous task is expected to return data
    // directly from execute() and is considered complete once the execute() method exits.
    // <P>
    // An asnychronous task is expected to start processing in execute(), and will not be
    // considered complete until either +link{setOutputData()} or +link{setOutputRecord} is
    // called.
    // @visibility workflow
    //<
    isAsync : false,
    
    executeElement : function (process) {
        // process input
        var inputData;
        var inputRecord;
        if (this.inputFieldList) {
            inputRecord = {};
            for (var i = 0; i < this.inputFieldList.length; i++) {
                inputRecord[this.inputFieldList[i]] = process.state[this.inputFieldList[i]];
            };
        }
        if (this.inputField) {
            inputData = process.state[this.inputField];
            if (inputRecord) {
                inputRecord[this.inputField] = inputData;
            }
        }

        this.inputData = inputData;
        this.inputRecord = inputRecord;
        this.process = process;
        
        try {
            var output = this.execute(inputData, inputRecord);
        } catch (e) {
            isc.logWarn("Error while executing ScriptTask: "+e.toString());
        }
    
        if (this.isAsync) {
            return false;
        }
        
        if (typeof output == 'undefined') {
            return true;
        }

        this._processTaskOutput(process, output);
        return true;
    },
    
    _processTaskOutput : function (process, output) {
        // process output
        if (this.outputFieldList) {
            for (var i = 0; i < this.outputFieldList.length; i++) {
                if (typeof output[this.outputFieldList[i]] != 'undefined') {
                    process.state[this.outputFieldList[i]] 
                        = output[this.outputFieldList[i]];    
                }
            };
        }
        if (this.outputField) {
            if (this.outputFieldList == null) {
                if (typeof output != 'undefined') {
                    process.state[this.outputField] = output;
                }
            } else {
                if (typeof output[this.outputField] != 'undefined') {
                    process.state[this.outputField] = output[this.outputField];
                }
            }
        }
    },
    
    _finishTask : function (process, outputRecord, outputData) {
        if (outputRecord == null) {
            this._processTaskOutput(process, outputData);
        } else {
            if (outputData) {
                outputRecord[this.outputField] = outputData;
            }
            this._processTaskOutput(process, outputRecord);
        }
        
        if (this.isAsync) {
            process.start();
        }
    }
});

isc.ScriptTask.registerStringMethods({
    //> @method scriptTask.execute()
    // Execute the task.  
    // @param input (any) the task input
    // @param inputRecord (Record) the task input record if an <code>inputFieldList</code> was
    // specified. See +link{group:taskIO}
    // @return (any) the task output.  For multiple field output, call 
    // +link{setOutputRecord()} instead, and return null
    // @visibility workflow
    //<
    execute: "input,inputRecord"
});

// --------------------------------------------------------------------------------------------

//> @class XORGateway
// Chooses one or another next process element based on AdvancedCriteria applied to
// +link{process.state}.
// <P>
// If the AdvancedCriteria evaluate to true, the +link{nextElement} is chosen, otherwise the
// +link{failureElement}.
// <P>
// Note that "XOR" in <code>XORGateway</code> means "exclusive or" - only one next element is
// chosen.
// - implementation note: we need to allow the propertyName in simple Criteria or the
// criterion.name in AdvancedCriterion to a be path of the form "orderUser.name".  This should
// be a general enhancement applied across the entire Criteria/AdvancedCriteria system.
// @visibility workflow
//<

isc.defineClass("XORGateway", "ProcessElement");

isc.XORGateway.addClassProperties({
	_processFieldsRecursively : function (object, prefix) {
        var dsFields = [];
        for (var key in object) {
            if (isc.isA.Object(object[key]) && !isc.isA.Array(object[key]) &&
                !isc.isA.RegularExpression(object[key]) && !isc.isA.Date(object[key])) 
            {
                var newPrefix = prefix == null ? key : (prefix + "." + key);
                dsFields.addList(this._processFieldsRecursively(object[key], newPrefix));
            } else {
                dsFields.add({name: (prefix == null ? key : (prefix + "." + key))});    
            }
        }
        return dsFields
    }
});

isc.XORGateway.addProperties({
    //> @attr xorGateway.criteria (Criteria : IR : IR)
    // Simple or +link{AdvancedCriteria} to be applied to the task inputs.  These will be
    // applied to either the data indicated by the +link{task.inputField} or to the
    // "inputRecord" if multiple input fields are declared (see +link{taskIO}).
    // @visibility workflow
    //<

    //> @attr xorGateway.nextElement (String : null : IR)
    // ID of the next +link{process.sequences,sequence} or {process.elements,element} to
    // procede to if the criteria match the process state.  If this gateway is part of a
    // +link{process.sequences,sequence} and has a next element in the sequence,
    // <code>nextElement</code> does not need to be specified.
    // @visibility workflow
    //<

    //> @attr xorGateway.failureElement (String : null : IR)
    // ID of the next sequence or element to proceed to if the criteria do not match.
    // @visibility workflow
    //<
    
    executeElement : function (process) {
        var dsFields = isc.XORGateway._processFieldsRecursively(process.state);
        // construct datasource that will check all fields in process state
        var ds = isc.DataSource.create({
            fields: dsFields
        });
        if (ds.applyFilter([process.state], this.criteria).length == 1) {
            if (this.nextElement) process.setNextElement(this.nextElement);
        } else {
            if (this.failureElement) process.setNextElement(this.failureElement);
        }
        return true;
    }
});

// --------------------------------------------------------------------------------------------

//> @class DecisionGateway
// Chooses a next element in a +link{Process} by evaluating a series of criteria against the
// +link{process.state} and choosing the element associated with the criteria that matched, or
// a +link{defaultElement} if none of the criteria match.
// @visibility workflow
//<

isc.defineClass("DecisionGateway", "ProcessElement");

isc.DecisionGateway.addProperties({
    //> @attr decisionGateway.criteriaMap (Object<String,Criteria> : null : IR)
    // A Map from +link{ProcessElement.ID} to Criteria that will cause this ProcessElement to
    // be chosen as the next element if the criteria matches.
    // @visibility workflow
    //<

    //> @attr decisionGateway.defaultElement (String : null : IR)
    // Next element to pick if no criteria match.  If this gateway is part of a
    // +link{process.sequences,sequence} and has a next element in the sequence, the
    // <code>defaultElement</code> is assumed to be the next element and does not need to be
    // specified.    
    // @visibility workflow
    //<
    
    executeElement : function (process) {
        var dsFields = isc.XORGateway._processFieldsRecursively(process.state);
        // construct datasource that will check all fields in process state
        var ds = isc.DataSource.create({
            fields: dsFields
        });
        for (var key in this.criteriaMap) {
            if (ds.applyFilter([process.state], this.criteriaMap[key]).length == 1) {
                process.setNextElement(key);
                return true;
            }
        }
        if (this.defaultElement) process.setNextElement(this.defaultElement);    
        return true;
    }
});

// --------------------------------------------------------------------------------------------

//> @class UserTask
// A task that involves showing a user interface to the end user allowing the user to view and
// input data and press a button (or do some other UI gesture) to complete the task.
// <P>
// A UserTask takes the following steps:
// <ul>
// <li> Optionally show() or otherwise make visible the +link{targetView}
// <li> Provide values to either a +link{DynamicForm} designated as the +link{targetForm} or to
//      a +link{ValuesManager} designated as the +link{targetVM}, via +link{setValues()}
// <li> Waits for notification of completion or cancellation.  The UserTask is notified of
//      completion if a +link{SubmitItem} is pressed in either the <code>targetForm</code> or
//      any form that is a member of the <code>targetVM</code>.  Likewise a +link{CancelItem}
//      triggers cancellation.  Direct calls to +link{dynamicForm.cancelEditing()} or
//      +link{dynamicForm.completeEditing()} achieve the same result.
// <li> if cancellation occurs, the process continues to the +link{cancelElement}
// <li> if completion occurs, values are retrieved from the form or valuesManager and applied
//      to the process state
// </ul>
// @visibility workflow
//<


isc.defineClass("UserTask", "Task");

isc.UserTask.addProperties({
    //> @attr userTask.targetView (Canvas or String : null : IR)
    // Optional widget that should be shown to allow user input.  If this widget is a DynamicForm,
    // it will also be automatically used as the +link{targetForm} unless either
    // <code>targetForm</code> or +link{targetVM} is set.
    // <P>
    // <code>UserTask</code> will automatically handle various scenarios of the
    // <code>targetView</code> being not currently visible or draw()n, according to the following
    // rules:
    // <ul>
    // <li> if the view itself is marked hidden, it will be show()n
    // <li> if the view is inside a hidden parent, the parent will be show()n
    // <li> if the view is the +link{tab.pane} of a tab in a TabSet, the tab will be selected
    // <li> if the view is listed in +link{SectionStackSection.items} for a which is either
    //      collapsed or hidden section, the section will be shown and expanded
    // <li> if the view is listed in +link{Window.items} for a Window, the Window will be shown
    // <li> if any of these conditions apply to any parent of the targetView, the rules will be
    //      applied to that parent as well.  For example, the targetView is in a collapsed section
    //      inside a tab which is not selected, the section will be expanded <b>and</b> the tab
    //      selected
    // </ul>
    // @visibility workflow
    //<
    
    //> @attr userTask.targetForm (DynamicForm : null : IR)
    // DynamicForm that should be populated with data and that should provide the data for the task
    // outputs.
    // <P>
    // Use +link{targetVM} to use a +link{ValuesManager} instead.
    // @visibility workflow
    //<
    
    //> @attr userTask.targetVM (ValuesManager or String : null : IR)
    // Optional ValuesManager which will receive task inputs and provide task outputs.  Use
    // +link{targetForm} instead of you want to use a DynamicForm.
    // @visibility workflow
    //<
    
    //> @attr userTask.cancelElement (String : null : IR)
    // Next element to proceed to if the task is cancelled because the +link{targetForm} or
    // +link{targetVM} had <code>cancelEditing()</code> called on it.
    // @visibility workflow
    //<

    //> @method userTask.cancelEditing() ([])
    // Revert any changes made in a form and finish this userTask execution. 
    // +link{cancelElement} will be proceed as the next element of current process.  
    // @visibility workflow
    //<
    cancelEditing : function () {
        if (this.process) {
            var process = this.process
            // should be deleted before continuing process execution to be able to invoke
            // userTask several times in workflow
            delete this.process;
            process.setNextElement(this.cancelElement);
            process.start();
        }
    },
    
    //> @method userTask.completeEditing() ([])
    // Finish editing and store edited values in +link{Process.state,process state}.  
    // @visibility workflow
    //<
    completeEditing : function () {
        if (this.process) {
            var values;
            if (this.targetVM) {
                values = this.targetVM.getValues();
            } else if (this.targetForm) {
                values = this.targetForm.getValues();
            }
            var process = this.process;
            // should be deleted before continuing process execution to be able to invoke
            // userTask several times in workflow
            delete this.process;
            process.state[this.inputField] = values;
            process.start();
        }
    },

    executeElement : function (process) {
        this.process = process;
        // convert from IDs to objects
        if (this.targetView && isc.isA.String(this.targetView)) {
            this.targetView = window[this.targetView];
        }
        if (this.targetVM && isc.isA.String(this.targetVM)) {
            this.targetVM = window[this.targetVM];
        }
        if (this.targetForm && isc.isA.String(this.targetForm)) {
            this.targetForm = window[this.targetForm];
        }
        if (this.targetView == null) {
            isc.logWarn("TargetView should be set for UserTask");
            return true;
        }
        if (this.targetForm == null) {
            if (this.targetView.getClassName() == "DynamicForm") {
                this.targetForm = this.targetView;
            }
        }
        if (this.targetForm == null && this.targetVM == null) {
            isc.logWarn("Rather targetForm or targetVM should be set for UserTask or " + 
                "targetView should be a DynamicForm");
            return true;
        }
        this.targetView.showRecursively();
        if (this.targetVM) {
            this.targetVM.setValues(isc.clone(process.state[this.inputField]));
            this.targetVM.userTask = this;
        }
        if (this.targetForm) {
            this.targetForm.setValues(isc.clone(process.state[this.inputField]));
            this.targetForm.userTask = this;
        }
        return false;
    }
    
});







