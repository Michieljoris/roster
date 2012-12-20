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



//> @groupDef treeDataBinding
// 
// The SmartClient +link{TreeGrid} component is a visual representation of a tree and requires
// a +link{Tree} or +link{ResultTree} datatype passed via the +link{TreeGrid.data} attribute to
// initialize the tree view.  The +link{Tree} datatype is used when you want to provide all of
// the tree nodes in one shot at initialization time.  The +link{ResultTree} datatype is used
// when you want portions of the tree to be loaded on demand from the server.
// <p>
// <b><u>Providing all data to the Tree at creation</u></b>
// <p>
// The simplest mechanism by which to initialize a Tree is to simply provide all the data
// up-front when the Tree itself is created.  Depending on the format of your tree data, this
// can be done by setting +link{Tree.root} or +link{Tree.data}.  This functionality is provided
// by the +link{Tree} class.
// <p>
// For examples of this type of databinding, see the following SDK examples:
// <ul>
// <li>+explorerExample{childrenArrays, TreeGrid Initialization Example}</li>
// <var class="smartclient">
// <li>+externalLink{/examples/server_integration/#jstlTree, TreeGrid Initialization with JSTL}</li>
// </var>
// </ul>
// <p>
// <b><u>Loading Tree nodes on demand</u></b>
// <p>
// In this mode, tree nodes are loaded on-demand the first time a user expands a folder.  This
// approach is necessary for large trees.  This functionality is provided by the
// +link{ResultTree} class, which uses a +link{DataSource} to load data from the server.  Each
// DataSource Record becomes a +link{TreeNode}.
// <p>
// ResultTrees require that every node in the tree have an +link{Tree.idField,id} that is
// unique tree-wide.  When the user expands a folder whose contents have not yet been loaded
// from the server (or you programmatically call openFolder() on such a node), the client
// automatically sends a +link{DSRequest} to the server to ask for all immediate children of
// that node.  The +link{DSRequest} criteria will specify the id of the node for which children
// are being requested via the <code>parentId</code> property (see +link{Tree.parentIdField}).
// This client is asking the server: "give me all nodes whose parentId is the id of this
// node".
// <P>
// If there are no pre-existing node ids in the dataset you are loading, you must generate node
// ids (because the client needs some way to identify nodes when talking to the server).
// Generally a node id should contain whatever information is required to fetch the node and
// it's children on the server.  One typical approach is to use the path to the node as a node
// id.  For XML datasets in particular, the path may be a valid XPath, so that server-side
// lookup of child nodes is just a matter of applying the node id as an XPath to a server-side
// XMLDocument.
// <P>
// +link{ResultTree}s are created for you by the +link{TreeGrid} when you set
// +link{TreeGrid.dataSource}, but you can pass an initial dataset to a databound TreeGrid by
// setting +link{TreeGrid.initialData}.  The +link{Tree.idField} is derived from the dataSource
// you provide to the TreeGrid - the first field marked as
// +link{DataSourceField.primaryKey}:true becomes the idField of the ResultTree.
// The +link{Tree.parentIdField} is found by looking for a field that has a
// +link{DataSourceField.foreignKey} property pointing to the idField.
// <P>
// If you do not provide +link{TreeGrid.initialData}, the first DSRequest you receive will be a
// request for the nodes under root.  The id of the root node of the tree is the value of the
// <code>rootValue</code> attribute on the +link{Tree.parentIdField} of the Tree DataSource. 
// <p>
// For examples of this type of databinding, see the following SDK examples:
// <ul>
// <li>+explorerExample{initialData, TreeGrid DataBinding Example}</li>
// <var class="smartclient">
// <li>+externalLink{/examples/server_integration/#xml2JSLOD, TreeGrid XML DataBinding}
// </var>
// </ul>
// <P>
// <b><u>Multi-Level load on demand</u></b>
// <P>
// The ResultTree's DSRequests ask for the immediate children of a node only (by specifying
// <code>parentId</code> in the criteria). Any nodes returned whose <code>parentId</code> field
// value is unset or matches this criterion will be added to the tree as immediate children of the
// node. However you are also free to return multiple levels of children.  This can be done by
// simply returning a flat list of descendents with valid id's and parentId's, exactly as though 
// you were initializing a multi-level tree via +link{Tree.data}.  
// <P>
// Note that when receiving multiple levels of children, the ResultTree's assumption is that
// if any children are loaded for a parent, then that parent is considered fully loaded.
// <P>
// When loading children for a given parent node, the ResultTree calls
// +link{DataSource.fetchData} on its DataSource.  For custom code that may need to reference
// the parentNode or tree in some way, the parent node whose children are being loaded is
// available on the dsRequest instance in the DataSource flow as dsRequest.parentNode, where it
// can be inspected during +link{DataSource.transformRequest()}.
//
// @title Tree DataBinding
// @treeLocation Client Reference/Data Binding
// @visibility external
//< 


//>	@class ResultTree
// ResultTrees are an implementation of the +link{class:Tree} API, used to handle hierarchical
// data, whose nodes are DataSource records which are retrieved from a server.
//
// @visibility external
// @treeLocation    Client Reference/Data Binding
//<
isc.ClassFactory.defineClass("ResultTree", isc.Tree);

isc.ResultTree.addProperties({
    nameProperty:"__nodePath",
    nodeTypeProperty:"nodeType",
    childTypeProperty:"childType",
    modelType: "parent",

    // DataModel
	// ---------------------------------------------------------------------------------------
    //> @attr resultTree.dataSource (DataSource or ID : null : IR)
    //  What +link{class:DataSource} is this resultTree associated with?
    //
    // @include dataBoundComponent.dataSource
    // @visibility external
    //<

    //> @attr resultTree.context (OperationContext : null : IRA)
    // OperationContext to be sent with all operations performed by this ResultTree.
    //<

    //> @attr resultTree.loadDataOnDemand (boolean : true : IR)
    // Does this resultTree load data incrementally as folders within the tree are opened, or
    // is it all loaded in a single request?
    // @see treeGrid.loadDataOnDemand
    // @visibility external
    //<
    loadDataOnDemand:true,

    //> @attr resultTree.fetchMode (FetchMode : "basic" : IR)
    // Mode of fetching records from server.
    // <P>
    // In a ResultTree, "basic" fetchMode implies that if search criteria change, the entire
    // tree will be discarded and re-fetched from the server. +link{getOpenState} will be
    // preserved.
    // <P>
    // fetchMode:"local" implies that local filtering will be performed. See
    // +link{keepParentsOnFilter} for additional filtering details.
    // <P>
    // fetchMode:"paged" does not apply to ResultTrees. Instead, +link{loadDataOnDemand} is
    // used for folder-by-folder loading of tree data. If enough nodes exist that paging is
    // desirable within a folder, a better UI can be obtained by showing an adjacent ListGrid
    // (similar to Outlook email) to show a large number of child nodes.
    //
    // @visibility external
    //<
    fetchMode:"basic",

    //> @attr resultTree.defaultIsFolder (boolean : null : IR)
    // Controls whether nodes are assumed to be folders or leaves by default.
    // <P>
    // Nodes that have children or have the +link{tree.isFolderProperty,isFolderProperty} set
    // to true will always be considered folders.  Other nodes will be considered folders or
    // leaves by default according to this setting.
    // <P>
    // If <code>defaultIsFolder</code> is unset, the ResultTree will automatically set it to
    // match the value of +link{loadDataOnDemand}.  This means that, when using
    // folder-by-folder load on demand (<code>loadDataOnDemand:true</code>), by default a newly
    // loaded node will be considered to be a folder that has not loaded its children yet.  
    // <P>
    // When not using folder-by-folder load on demand, by default a newly loaded node is
    // considered a leaf.  If you set <code>defaultIsFolder:true</code> explicitly, by default
    // a newly loaded node is considered to be a folder with no children.
    // <P> 
    // See +link{Tree.isFolder()} for details on how to explicitly mark nodes as folders or leaves.
    //
    // @see treeGrid.loadDataOnDemand
    // @visibility external
    //<
    
    //> @attr resultTree.rootNode (any : null :IR)
    // This attribute may be used to specify a root value for the parentIdField of this resultTree.
    // This overrides the default +link{DataSourceField.rootValue} for this tree, allowing
    // a component to navigate a tree starting at a specific node.
    // <P>
    // May be overridden via +link{TreeGrid.treeRootValue} for ResultTrees generated by a TreeGrid
    // component.
    // @visibility external
    //<
        
    //> @attr resultTree.discardParentlessNodes (boolean : null : IRA)
    // When data is loaded from the server, should nodes with an explicit value for
    // the +link{tree.parentIdField} which doesn't map to a valid parent node be dropped?
    // If set to false, for +link{TreeGrid.loadDataOnDemand}:false trees, parentless nodes will be
    // added as children of the root node - for +link{TreeGrid.loadDataOnDemand}:true, they will be
    // added as children of the folder currently requesting children.
    // <P>
    // This effectively allows nodes to be loaded into the current (or root) folder without
    // needing an explicit +link{tree.parentIdField,parentIdField value} that matches the folder's
    // ID or <code>rootValue</code> for the resultTree.
    // <P>
    // Note: For <code>loadDataOnDemand:false</code> trees, if this property is unset at init time,
    // it will default to <code>true</code> if an explicit +link{resultTree.rootNode} has been
    // specified. This ensures that if the data tree retrieved from the server includes ancestors
    // of the desired root-node we don't display them. Otherwise this property always defaults to
    // false.
    // @visibility external
    //<
    
    //>@attr ResultTree.defaultNewNodesToRoot (boolean : false : IRWA)
    // This attribute governs how to handle cache-synch when a new node is added to this dataSource 
    // with no explicit parentId.
    // <P>
    // If set to <code>true</code>, when a new node is added to this dataSource via
    // +link{DataSource.addData()}, with no explicit parentId, the node will be added as a 
    // child of the root node of this result tree. Otherwise it will be ignored.
    // <P>
    // Similar logic applies to +link{DataSource.updateData(),updated nodes} - if this property is
    // true and the parentId of an updated node is cleared, it will be moved to become a child of
    // root, otherwise it will be dropped from the tree.
    // @visibility external
    //<
    defaultNewNodesToRoot:false,

    
    //> @attr resultTree.updateCacheFromRequest (boolean : true : IRA) 
    // When a successful Add, Update or Remove type operation fires on this ResultTree's 
    // dataSource, if +link{dsResponse.data} is unset, should we integrate the submitted
    // data values (from the request) into our data-set?
    //
    // @group cacheSync
    // @visibility external
    //<
    updateCacheFromRequest:true
    
    //> @attr   resultTree.disableCacheSync (boolean : false : IRA)
    // By default when the data of this ResultTree's dataSource is modified, the ResultTree will
    // be updated to display these changes.
    // Set this flag to true to disable this behavior.
    // @group cacheSync
    // @visibility external
    //<

    // Filtering
    // ----------------------------------------------------------------------------------------

    //> @attr resultTree.keepParentsOnFilter (boolean : null : IR)
    // If set, tree-based filtering is performed such that parent nodes are kept as long as
    // they have children that match the filter criteria, even if the parents themselves do not
    // match the filter criteria. If not set, filtering will exclude parent nodes not matching
    // the criteria and all nodes below it in the tree.
    // <P>
    // When enabled, fetchMode:"local" is automatically enabled so that all filtering behavior
    // shifts to the client-side and full criteria are no longer sent to the server.  Instead,
    // server fetches will always load all nodes, or with +link{loadDataOnDemand}:true, will
    // always load all nodes under a given parent.  This means that the server does not need
    // to implement special tree filtering logic.
    // <P>
    // Optionally, +link{resultTree.serverFilterFields} can be set to a list of field names that
    // will be sent to the server whenever they are present in the criteria.
    // @visibility external
    //<

    //> @attr resultTree.serverFilterFields (Array of String : null : IR)
    // When +link{keepParentsOnFilter} is enabled, this property lists field names that will be
    // sent to the server if they are present in criteria.
    // @visibility external
    //<
});

isc.ResultTree.addMethods({
//>	@method	resultTree.init()	(A)
//			Initialize this ResultTree.  Pass in objects with properties to add or override
//			defaults.
//
//		@param	[all arguments]	(object)	objects with properties to override from default
//<
init : function (a,b,c,d,e,f) {
	// create a pointer to us in the global context
	isc.ClassFactory.addGlobalID(this);

	if (!this.criteria) this.criteria = {};

    if (!this.operation) this.operation = {operationType : "fetch"};

    // dataSource can be specified either on the operation or the ResultTree.
    if (!this.dataSource) this.dataSource = this.operation.dataSource;
    if (!this.operation.dataSource) this.operation.dataSource = this.dataSource;
    
    
    if (isc.isAn.Array(this.dataSource)) {
        this.dataSource = this.dataSource[0];
        this.operation.dataSource = this.dataSource;
    }
    
    // If any of rootValue, idField, parentIdField are not explicitly specified on this
    // ResultTree, autodetect them from the DataSource relationship.
    if (!this.isMultiDSTree()) {
        
        // root node has to exist for getTreeRelationship to work, so create it now if it
        // doesn't exist 
        if (!this.root) this.root = this.makeRoot();
        var relationship = this.getTreeRelationship(this.root);

        var undef;
        // compare to undef because rootValue can be set to null
        if (this.rootValue === undef) this.rootValue = relationship.rootValue;
        
        // If we're not loading on demand, and the rootValue is not null/undef,
        // 'discardParentlessNodes' to true.
        // This ensures that if we load an entire tree, and have a rootValue set to pick up 
        // a sub-tree of that, we don't add the full tree's top level element to root and thus
        // show the entire tree
        if (!this.loadDataOnDemand && 
            (this.rootValue != null || (this.root != null && this.root[this.idField] != null)) &&
            this.discardParentlessNodes == null)
        {
            this.discardParentlessNodes = true;
        }
        
        if (this.idField == null) this.idField = relationship.idField;
        if (this.parentIdField == null) this.parentIdField = relationship.parentIdField;
        if (relationship.childrenProperty) this.childrenProperty = relationship.childrenProperty;
        
        this.root[this.idField] = this.rootValue;
    }

    // establish default values for isFolderProperty et al that were not derived from the tree
    // relationship
    this.setupProperties();

    // keepParentsOnFilter implies fetchMode:"local"
    if (this.keepParentsOnFilter && !this.isLocal()) this.fetchMode = "local";

    if (this.initialData) {
        if ("parent" == this.modelType) this.data = this.initialData;
        else if ("children" == this.modelType) this.root = this.initialData;
    }

    // observe dataChanged on our dataSource
    var dataSource = isc.DataSource.getDataSource(this.dataSource);
    this.observe(dataSource, "dataChanged", "observer.dataSourceDataChanged(dsRequest,dsResponse);");

    // whether to invalidate our cache when an update occurs on one of our datasources.
    // Default is update the current cache in place.
    this.dropCacheOnUpdate = this.operation.dropCacheOnUpdate;
    
    // set up defaultIsFolder before invoking Tree.init
    // This is required in linkNodes to ensure LOD ResultTrees' child nodes show up as
    // openable folders
    if (this.defaultIsFolder == null) this.defaultIsFolder = this.loadDataOnDemand;
    
    this.invokeSuper(isc.ResultTree, "init", a,b,c,d,e,f);
    
    // if we're not using folder-by-folder load on demand, all nodes should be initially marked loaded
    this.defaultLoadState = this.loadDataOnDemand ? isc.Tree.UNLOADED : isc.Tree.LOADED;
    
},


destroy : function () {
    this.Super("destroy", arguments);
    var dataSource = isc.DataSource.getDataSource(this.dataSource);
    if (dataSource) this.ignore(dataSource, "dataChanged");
},

isLocal : function () { return this.fetchMode == "local" },
haveCriteria: function (criteria) { return criteria != null && !isc.isAn.emptyObject(criteria) },

// This is necessary to support higher-level callback processing like for DBC.filterData.
setContext : function (context) {
    this.context = context;
},

// A Tree navigates a 1 to many (parent to children) relationship, which can exist within or 
// across DataSources.

// figuring out the type of child records at each level of the tree
// - use cases
//   - all one type
//     - supported: set just this.dataSource
//   - fixed levels
//     - example: salesOrder, lineItem
//     - supported: set this.dataSource for root DataSource, this.treeRelations for transitions
//   - mixed child types (each parent in a level has different child types)
//     - example: outlook left-hand tree navigation: top level is a random conglomeration of Inbox,
//       Favorites, etc, each with different child node types (message folders, filesystem folders,
//       etc)
//     - supported: next level is specified via node[this.childNodeType], or via overriding
//       getChildDataSource
//   - mixed type within a level
//     - supported: the Tree just needs a DataSource with a primary key for the level.  Any join
//       that can produce this is fine.

getTreeRelationship : function (parentNode) {
    var childDS = this.getChildDataSource(parentNode);
    // ask the datasource for a tree relationship, which can be declared explicitly or
    // autodetected from field declarations
    var relationship = childDS.getTreeRelationship();
    return relationship;

    
},

//> @method resultTree.getChildDataSource()
// Get the DataSource for children under this node.
//
// If this node has no appropriate child node type, this method will return null - in a multi-DS
// tree this indicates that there is no appropriate next DataSource to navigate to, and this node
// will be a leaf.
//<
// NOTE: nodeDS is an optional parameter, used when we need to know the child datasource of a node
// before it gets linked into the tree (at that time, the node's DS can't be determined by looking
// at it's future parent).
getChildDataSource : function (node, nodeDS) {
    // look for explicitly specified child type 
    var childDSName = node[this.childTypeProperty];
    if (childDSName != null) return isc.DS.get(childDSName);

    // see if there is a mapping from this parent's type to its child type
    var nodeDS = nodeDS || this.getNodeDataSource(node);

    // - if this is a single DS tree, use the one and only DataSource
    // - if we're at root (which is the only node with no DS), use the root DataSource
    if (nodeDS == null || !this.isMultiDSTree()) return this.getRootDataSource();

    // otherwise try to find a relation from this node's DS to some other DS

    // see if there's an explicitly declared tree relation
    var treeRelations = this.treeRelations,
        childDataSources = nodeDS.getChildDataSources();

    //this.logWarn("getChildDataSource: nodeDS is : " + nodeDS + 
    //             ", treeRelations: " + this.echo(treeRelations) + 
    //             ", childDataSources: " + this.echo(childDataSources));

    if (treeRelations) {
        childDSName = treeRelations[nodeDS.ID];
        if (childDSName != null) return isc.DS.get(childDSName);
    }
    // otherwise take the first relationship to any other DataSource
    if (childDataSources != null) return childDataSources[0];
},

// get the DataSource for this node
getNodeDataSource : function (node) {
    // check for explicitly specified type (this allows mixed types within a set of children)
    var dsName = node[this.nodeTypeProperty];

    // use the type stored on parent node when this child was fetched
    if (dsName == null) {
        var parentNode = this.getParent(node);
        if (parentNode == null) {
            // the special, singular "root" object has no DataSource 
            return null; 
        } else if (parentNode == this.root) {
            // nodes under root are of the first or "root" DataSource (slightly confusing)
            dsName = this.getRootDataSource().ID;
        } else {
            // when we have a mixture of node types, and the parent stores the type of the
            // child nodes when they are loaded
            dsName = parentNode._derivedChildNodeType;
            // otherwise we have just one node type
            if (dsName == null) dsName = this.getRootDataSource().ID;
        }
    }
    return isc.DS.get(dsName) || this.getRootDataSource();
},

isMultiDSTree : function () {
    return this.multiDSTree || this.treeRelations != null;
},

// get the DataSource for the nodes that appear at root
getRootDataSource : function () {
    if (this.operation && this.operation.dataSource) return isc.DS.get(this.operation.dataSource);
    else return  isc.DS.get(this.dataSource);
},

// get the criteria to apply (aside from parentId) when selecting children from childDS
getCriteria : function (childDS, parentDS, parentNode) {
    if (this.getRootDataSource() == childDS) return this.criteria;
    return null;
},

// get an operationId to use to select children from childDS.   operation can optionally depend
// on parentDS and parentNode
getOperationId : function (childDS, parentDS, parentNode) {
    // FIXME we may want a declarative way to specify the operation to use to select on each
    // DataSource the tree may encounter
    return this.operation ? this.operation.ID : null;
},

//>	@method resultTree.loadChildren()
// @include tree.loadChildren()
//<

//>	@method resultTree.unloadChildren()
// @include tree.unloadChildren()
//<

// Note this is an internal method to fetch the children and fold them into the children array
// for the node in question. It doesn't check for the children already being loaded - so if
// called repeatedly you'd end up with duplicates in the children array.
loadChildren : function (parentNode, callback) {
    // figure out what parent-child relationship will be used to select children of this node.  
    var isRoot = (parentNode == null || parentNode == this.root),
        relationship, childDS, parentDS;

//    this.logWarn("parentNode: " + this.echo(parentNode) + 
//                 ", isRoot: " + isRoot);

    // if we're at root, and this is a multi-DataSource tree, the root-level nodes have no parent
    // dataSource.  We just do a normal select, using only the criteria
    if (isRoot && this.isMultiDSTree()) {
        childDS = this.getRootDataSource();
        // XXX this isn't really a relationship: the singular "root" has no schema, hence there is
        // no "parentDS" or "idField", and in the childDS there is no parentIdField that points to
        // root.  But the notion of "childDS", the DataSource of the nodes being loaded, is still
        // valid.
        relationship = { childDS:childDS }; 
    } else {    
        // otherwise, we detect some relationship that this node has either within its own
        // DataSource or across DataSources, and load children using that relationship
        relationship = this.getTreeRelationship(parentNode);

        childDS = relationship.childDS;
        parentDS = relationship.parentDS;
    }

    if (!this.isMultiDSTree()) {
        // force local overrides of idField, parentIdField and rootValue on the relationship -
        // these are autodetected and initialized in init() if unset on this ResultTree.
        relationship.idField = this.idField;
        relationship.parentIdField = this.parentIdField;
        relationship.rootValue = relationship.rootValue;
    }
    if (this.logIsDebugEnabled()) {
        this.logDebug("parent id: " + (isRoot ? "[root]" : parentNode[relationship.idField]) + 
                     " (type: " + (isRoot ? "[root]" : parentDS.ID) + ")" +
                     " has childDS: " + childDS.ID +
                     ", relationship: " + this.echo(relationship));
    }

    // remember the type of children under this parent, because we'll use this to figure out the
    // type of the children's children.
    parentNode._derivedChildNodeType = childDS.ID;

    // put together criteria that should always be used when selecting against this DataSource
    var criteria = {};
    if (!this.isLocal()) {
        // no local filtering - send all criteria to the server
        criteria = isc.addProperties({}, this.getCriteria(childDS, parentDS, parentNode));
    } else if (this._serverCriteria != null) {
        criteria = isc.addProperties({}, this._serverCriteria);
    }

    if (isRoot && this.isMultiDSTree()) {
        // leave criteria alone 
    } else if (this.loadDataOnDemand) {

        // loadOnDemand: instead of loading the whole tree, only load the children of a single
        // node.  Put together criteria that will find all records from the childDS that belong
        // under this parent record (eg lineItems in a salesOrder)
        
        var parentIdFieldValue = parentNode[relationship.idField];
        // Note: If we're loading the children of the root node, default to the
        // rootValue as specified at the dataSource level if no rootValue was specified directly
        // on the tree
        var undefined;
        if (isRoot && parentIdFieldValue === undefined) {
            parentIdFieldValue = relationship.rootValue;
        }
        
        criteria[relationship.parentIdField] = parentIdFieldValue;
        //this.logWarn("criteria is: " + this.echo(criteria));
        
    } else {
        // we're going to fetch the entire tree in one go, so mark everything as loaded
        this.defaultLoadState = isc.Tree.LOADED;
    }

    // remember the parentNode whose children we are loading, and what relationship we used
    // also set up the callback to fire on return.    
    
    
    var clientContext = isc.addProperties(
        {parentNode:parentNode, relationship:relationship, childrenReplyCallback:callback},
        this.context ? this.context.clientContext : null);
    
    // If this is the initial fetch, hang a flag on the clientContext so we know to fire the initial
    // fetch callback.
    
    if (!this._performedInitialFetch) {
        clientContext._isInitialFetch = true;
        this._performedInitialFetch = true;
    }

    var requestProperties = isc.addProperties({parentNode: parentNode, resultTree:this}, 
                                              this.context, 
                                              { clientContext : clientContext });

    // get an operation to do a select against the child DS
    var operationId = this.getOperationId(childDS, parentDS, parentNode);
    if (operationId) requestProperties.operationId = operationId;

    // set willHandleErrors to true so we can clear up our loading prompt on a server error    
    requestProperties.willHandleError = true;

    // set the parent as loading
    if (parentNode != null) this.setLoadState(parentNode, isc.Tree.LOADING);

    // kick off the operation to fetch children
    childDS.fetchData(criteria, {caller:this, methodName:'loadChildrenReply'}, 
                      requestProperties);
        
},

loadChildrenReply : function (dsResponse, data, request) {
//    this.logWarn("loadChildren reply: " + this.echoFull(dsResponse.data));

    var context = dsResponse.clientContext;
    var parentNode = context.parentNode;

    // Are we filtering data locally?
    var localFiltering = (this.isLocal() && this.haveCriteria(this._localFilter || this.criteria));

    // incorporate the new records into the tree
    var relationship = context.relationship,
        newNodes = dsResponse.data;

    // if we're returned an error handle it as if we were returned no data, then
    // call the standard RPCManager error handling code
    if (dsResponse.status < 0) newNodes = null;

    // if we're returned the STATUS_OFFLINE condition, handle it as an empty dataset
    if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
        newNodes = [];
        if (parentNode != null && !this.isRoot(parentNode)) {
            isc.say(window[request.componentId].offlineNodeMessage);
        }
    }

    // Determine target tree for this new data.
    // Re-target our parentNode if using a different tree.
    var tree = this;
    if (localFiltering) {
        // Link new data into the complete tree
        if (!this.completeTree) this.completeTree = this.duplicate(true, true);
        tree = this.completeTree;

        var parentPath = this.getPath(parentNode);
        parentNode = tree.find(parentPath);
    }

    if (newNodes == null || newNodes.length == 0) {
        // no new nodes, mark parentNode as loaded
        if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
            tree.setLoadState(parentNode, isc.Tree.UNLOADED);
            tree.delayCall("closeFolder", [parentNode], 0);
        } else {
            tree.setLoadState(parentNode, isc.Tree.LOADED);
        }
        
        if (newNodes == null) {
            if (dsResponse.status < 0) {
                isc.RPCManager._handleError(dsResponse, request);
            } else {
                this.logWarn("null children returned; return empty List instead");
            }
            newNodes = [];
        }
    }

    if (tree.isMultiDSTree()) {
        for (var i = 0; i < newNodes.length; i++) {
            var node = newNodes[i];
            // in a multi-DS tree, a node is a folder if there's a childDS to fetch nodes from
            var nextChildDS = this.getChildDataSource(node, relationship.childDS);
            if (nextChildDS != null) this.convertToFolder(node);

            // Node naming:
            // - in a single-DS tree, all nodes have an id that is unique tree-wide, the "idField" from
            //   the tree relationship
            // - in a multi-DS tree, nodes are from a mix of DataSources and do not necessarily have a
            //   tree-wide unique id - they only have a unique id within each set of children, since
            //   each set of children can be from a different DataSource (even when on the same level).
            // 
            // So, for multiDSTrees, in this case all newNodes are immediate children
            //
            // link it in
            tree.add(node, parentNode);
        }
    } else {
        // we're dealing with a mixed bag of parents and children, any number of levels deep.  In
        // this case we assume a unique id across all tree nodes, as opposed to just one level, and
        // run a linking algorithm that can handle the nodes in any order.
        
        if (dsResponse.status == isc.RPCResponse.STATUS_OFFLINE) {
            tree.setLoadState(parentNode, isc.Tree.UNLOADED);
            tree.delayCall("closeFolder", [parentNode], 0);
        } else {
            // If we are filtering locally, postpone dataChanged event until we finish filtering.
            var suppressDataChanged = localFiltering;
            tree.linkNodes(newNodes,
                           relationship.idField,
                           relationship.parentIdField,
                           relationship.rootValue,
                           relationship.isFolderProperty,
                           parentNode,
                           suppressDataChanged);
        }
    }
    
    // If filtering locally, do it now.
    if (localFiltering) {
        var openState = (this._openStateForLoad ? this._openStateForLoad : this._getOpenState());
        this.filterLocalData();
        this._setOpenState(openState);
        if (this._openStateForLoad) delete this._openStateForLoad;
    }
    // Reopen any nodes after cache is filled
    if (this._openStateForLoad) {
        this._setOpenState(this._openStateForLoad);
        delete this._openStateForLoad;
    }

    // Fire any callback passed to 'loadChildren' in the scope of this tree.
    if (context.childrenReplyCallback) {
        this.fireCallback(context.childrenReplyCallback, "node", [parentNode], this);
    }
    
    // NOTE: when paging within child sets is implemented, we'll add "startChild,endChild" to
    // this signature
    if (this.dataArrived != null) {
        isc.Func.replaceWithMethod(this, "dataArrived", "parentNode");
        this.dataArrived(parentNode);
    }
},

// Cache sync
// ------------------------------------
// On initial load of data for some folder, we always retrieve the entire set of children for the
// parents of the node.
// When dataChanged fires on our dataSource, we need to update these stored children arrays to
// incorporate the modified nodes into our tree of local data.

// helper method to get this.dataSource as a datasource object (even if specified as an ID only)
getDataSource : function () {
    return isc.DataSource.getDataSource(this.dataSource);
},

//> @method resultTree.invalidateCache() [A]
// Manually invalidate this ResultTree's cache.
// <P>
// Generally a ResultTree will observe and incorporate updates to the DataSource that provides it's
// records, but when this is not possible, <code>invalidateCache()</code> allows manual cache
// invalidation.
// <P>
// Components bound to this ResultTree will typically re-request the currently visible portion
// of the dataset, causing the ResultTree to re-fetch data from the server.
// @visibility external
//<
invalidateCache : function () {
    if (!this.isLoaded(this.root)) return;
    // Save current open state so it can be reapplied when new data arrives
    this._openStateForLoad = this._getOpenState();
    // reset root to refetch all our data.
    this.defaultLoadState = isc.Tree.UNLOADED;
    this.setRoot(this.makeRoot(), true);
    this.defaultLoadState = this.loadDataOnDemand ? isc.Tree.UNLOADED : isc.Tree.LOADED;
    
    
    if (!this.loadDataOnDemand) this.reloadChildren(this.root);
},

dataSourceDataChanged : function (dsRequest, dsResponse) {

    // respsect the flag to suppress cache sync altogether
    if (this.disableCacheSync) return;
    
    var updateData = isc.DataSource.getUpdatedData(dsRequest, dsResponse, 
                                                   this.updateCacheFromRequest);
    
    this.handleUpdate(dsRequest.operationType, updateData, dsResponse.invalidateCache);
},

handleUpdate : function (operationType, updateData, forceCacheInvalidation) {
    if (isc._traceMarkers) arguments.__this = this;
    if (this.dropCacheOnUpdate || forceCacheInvalidation) {
        

        this.invalidateCache();

        
        if (!this.getDataSource().canQueueRequests) this.dataChanged();
        return;
    }

    // update our cached tree directly  Note our cache is filtered, so we may just discard the
    // update if the new row doesn't pass the filter
    this.updateCache(operationType, updateData);
    this.dataChanged();
},


// updateCache() - catch-all method fired when the dataSource dataChanged method fires.
// Integrates (or removes) the modified nodes into our local tree of data.
updateCache : function (operationType, updateData) {
    if (updateData == null) return;
    

    operationType = isc.DS._getStandardOperationType(operationType);

	if (!isc.isAn.Array(updateData)) updateData = [updateData];

	//>DEBUG
    if (this.logIsInfoEnabled()) {
        this.logInfo("Updating cache: operationType '" + operationType + "', " + 
                     updateData.length + " rows update data" +
                     (this.logIsDebugEnabled() ? 
                      ":\n" + this.echoAll(updateData) : ""));
    } //<DEBUG

	switch (operationType) {
	case "remove":
        this.removeCacheData(updateData);
		break;
	case "add":
        this.addCacheData(updateData);
		break;
	case "replace":
	case "update":
        this.updateCacheData(updateData);
		break;
	}

}, 

addCacheData : function (updateData) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];

    // Don't add rows that don't pass filtering
    var validRows = this.getDataSource().applyFilter(updateData, this.criteria, this.context);

    this.logInfo("Adding rows to cache: " + validRows.length + " of " + updateData.length + 
                 " rows match filter criteria");

    var pk = this.getDataSource().getPrimaryKeyFieldNames()[0];
    for (var i = 0; i < validRows.length; i++) {
        // Update cache of the entire tree (all nodes)
        if (this.completeTree) {
            this._addNodeToCache(this.completeTree, validRows[i], pk);
        }
        // Update the visible tree
        this._addNodeToCache(this, validRows[i], pk);
    }
},

_addNodeToCache : function (tree, node, pk) {
    if (pk == null) pk = this.getDataSource().getPrimaryKeyFieldNames()[0];
    
    var parentId = node[this.parentIdField], parentNode;
    
    if (parentId != null) parentNode = tree.find(pk, parentId);
    else {
        if (this.defaultNewNodesToRoot || tree.rootValue == null) parentNode = tree.getRoot();
        else parentNode = null;
    }
    
    // Duplicate the node when adding it -- this is required to avoid us writing 
    // properties onto the object directly
    // Note: add() will automatically sort the new node in the children array
    if (parentNode != null && (tree.getLoadState(parentNode) == isc.Tree.LOADED)) {
        node = isc.clone(node);
        tree.add(node, parentNode);
        return true;
    }
    return false;
},

updateCacheData : function (updateData) {
	if (!isc.isAn.Array(updateData)) updateData = [updateData];

    //>DEBUG
    var debugTotals = {
        addedRows: 0,
        updatedRows: 0,
        removedRows: 0};
    //<DEBUG

    // Are we filtering data locally?
    var localFiltering = (this.isLocal() && this.haveCriteria(this._localFilter || this.criteria));

    var ds = this.getDataSource(),
        criteria = this._localCriteria || this.criteria,
        haveCriteria = this.haveCriteria(criteria)
    ;
    for (var i = 0; i < updateData.length; i++) {
        var updateRow = updateData[i];
        var matchesFilter = true;
        if (haveCriteria) {
            var matches = ds.applyFilter([updateRow], criteria, this.context);
            matchesFilter = (matches != null && matches.length > 0);
        }
        //>DEBUG
        if (this.logIsDebugEnabled() && !matchesFilter) {
            this.logDebug("updated node :\n" + this.echo(updateRow) +
                         "\ndidn't match filter: " + this.echo(criteria));
        }
        //<DEBUG

        // Update cache of the entire tree (all nodes)
        if (this.completeTree) {
            this._updateNodeInCache(this.completeTree, updateRow, true, null);
        }
        // Update the visible tree
        this._updateNodeInCache(this, updateRow, matchesFilter, debugTotals);
    }

    //>DEBUG
    if (this.logIsDebugEnabled()) {
        this.logDebug("updated cache: "
             + debugTotals.addedRows + " row(s) added, "
             + debugTotals.updatedRows + " row(s) updated, "
             + debugTotals.removedRows + " row(s) removed.");            
    }
    //<DEBUG
},

_updateNodeInCache : function (tree, updateRow, matchesFilter, debugTotals) {

    var ds = this.getDataSource(),
        pk = ds.getPrimaryKeyFieldNames()[0],
        node = tree.find(pk, updateRow[pk])
    ;

    // Very likely we'll see null nodes - we probably haven't opened their parent folder yet
    // However - check for the case where we have and if so, add to our data-set
    if (node == null) {
        if (matchesFilter) {
            if (this._addNodeToCache(tree, updateRow, pk)) {
                // This situation is valid - a developer updated a child of a parent we haven't
                // loaded (possibly in another tree on the page) and shifted it into a
                // parent we have loaded
                this.logInfo("updated row returned by server doesn't match any cached row, " +
                             " adding as new row.  Primary key value: " + this.echo(updateRow[pk]) +
                             ", complete row: " + this.echo(updateRow));
                if (debugTotals) debugTotals.addedRows++;
            }
        }
        return;
    }
        
        if (matchesFilter) {
            // the change may have reparented a node.
            if (updateRow[this.parentIdField] != node[this.parentIdField]) {
                var newParentNode = tree.find(pk, updateRow[this.parentIdField]);
                if (newParentNode == null && 
                    (this.defaultNewNodesToRoot || this.rootValue == null))
                {
                    newParentNode = tree.getRoot();
                }

            if (newParentNode == null || (tree.getLoadState(newParentNode) != isc.Tree.LOADED)) {
                tree.remove(node)
                if (debugTotals) debugTotals.removedRows++;
                return;
            }
            tree.move(node, newParentNode);
        }
        // apply all modified fields to the node.
        isc.addProperties(node, updateRow);

        
        var fieldNames = ds.getFieldNames(); 
        for (var i = 0; i < fieldNames.length; i++) {
            var name = fieldNames[i];
            if (!updateRow.hasOwnProperty(name)) delete node[name];
        }
        if (debugTotals) debugTotals.updatedRows++;
    } else {
        tree.remove(node);
        if (debugTotals) debugTotals.removedRows++;
    }
},

removeCacheData : function (updateData) {
    if (!isc.isAn.Array(updateData)) updateData = [updateData];

    var pk = this.getDataSource().getPrimaryKeyFieldNames()[0];

    // Update cache of the entire tree (all nodes)
    if (this.completeTree) {
        this._removeNodesFromCache(this.completeTree, updateData, pk);
    }
    // Update the visible tree
    this._removeNodesFromCache(this, updateData, pk);
},

_removeNodesFromCache : function (tree, updateData, pk) {
    if (pk == null) pk = this.getDataSource().getPrimaryKeyFieldNames()[0];

    // Build list of nodes to be removed
    var nodes = [];
    for (var i = 0; i < updateData.length; i++) {
        var node = tree.find(pk, updateData[i][pk]);
        if (node == null) {
            this.logWarn("Cache synch: couldn't find deleted node:" + this.echo(updateData[i]));
            continue;
        }
        nodes.add(node);
    }
    tree.removeList(nodes);
},

// get the title for this node
getTitle : function (node) {
    // look up the node's DataSource and return its title field
    var dataSource = this.getNodeDataSource(node);

    // the special, singular root node has no DataSource
    if (!dataSource) return "root";

    var title = node[dataSource.getTitleField()];
    if (title != null) return title;

    // if there's no title on this node, try not to leave a blank
    return this.Super("getTitle", arguments);
},

// indexOf: As with ResultSets support being passed primaryKey values only as well as pointers 
// to nodes
// Note: This will return the index wrt the visible (open) nodes of the tree. If the node is not
// currently visible, -1 will be returned.
indexOf : function (node, a,b,c,d) {
    var pks = this.getDataSource().getPrimaryKeyFieldNames();
    for (var i = 0; i < pks.length; i++) {
        var pk = pks[i];
        if (node[pk] != null) return this.findIndex(pk, node[pk]);
    }
    
    return this.invokeSuper(isc.ResultTree, "indexOf", node, a,b,c,d);
},



// Criteria / Filtering
// --------------------------------------------------------------------------------------------

//> @method resultTree.setCriteria()
// Set the filter criteria to use when fetching rows.
// <P>
// Depending on the result of +link{compareCriteria()} and setting for
// +link{resultTree.fetchMode}, setting criteria may cause a trip to the server to get a new
// set of nodes, or may simply cause already-fetched nodes to be re-filtered according to the
// new criteria.
// <P>
// For a basic overview on when server fetches are generally performed, see
// +link{resultTree.fetchMode}.
// However, this is not the final determination of when server fetches occur. Criteria can
// be split into local criteria and server criteria by specifying +link{serverFilterFields}.
// Thus, even when using fetchMode:"local" a new server fetch will occur if the server
// criteria changes. For details on how the criteria is split, see
// +link{dataSource.splitCriteria}.
// <P>
// Note: if criteria is being split to retrieve server criteria portion and the criteria
// is an +link{AdvancedCriteria}, the criteria must consist of a single "and" operator
// and one or more simple criteria below it. No other logical operators may be used. In
// other words, the +link{AdvancedCriteria} provided must be exactly representable by a
// simple criteria.
//
// @param newCriteria (Criteria) the filter criteria
// @visibility external
//<
// An overview on tree caching:
// We have 2 kinds of cache
// - the cache of results that matches the current criteria: this.data
// - the cache of the full tree received from the server: this.completeTree
//   * When in local filtering mode both caches are populated. New records from the
//     server always go to completeTree and then the visible tree is filtered from
//     that. Local filtering mode only occurs in fetchMode:"local" with a client-side
//     criteria. Note that if server criteria changes the completeTree cache is
//     overwritten with data from the server and the local cache rebuilt from client-side
//     criteria.
//   * When in basic filtering mode, we only populate the local cache: this.data.
//     On the first fetch we fill this local cache with the results returned from the server.
//     On subsequent changes to filter criteria, we will perform a new server fetch
//     and update the local cache.
setCriteria : function (newCriteria) {

    var oldCriteria = this.criteria || {},
        oldServerCriteria = this._serverCriteria || {},
        ds = this.getDataSource()
    ;

    // clone the criteria passed in - avoids potential issues where a criteria object is passed in
    // and then modified outside the RS
    // Avoid this with advanced criteria - our filter builder already clones the output
    if (!ds.isAdvancedCriteria(newCriteria)) {
        // use clone to deep copy so we duplicate dates, arrays etc
        newCriteria = isc.clone(newCriteria);
    }
        
    this.criteria = newCriteria;

    // If one of the criteria objects is an AdvancedCriteria, convert the other one to 
    // enable comparison
    if (ds.isAdvancedCriteria(newCriteria) && !ds.isAdvancedCriteria(oldCriteria)) {
        oldCriteria = isc.DataSource.convertCriteria(oldCriteria);
    }
    if (!ds.isAdvancedCriteria(newCriteria) && ds.isAdvancedCriteria(oldCriteria)) {
        newCriteria = isc.DataSource.convertCriteria(newCriteria);
        this.criteria = newCriteria;
    }

    if (this.serverFilterFields != null && this.serverFilterFields.length > 0) {
        this._localCriteria = isc.DataSource.copyCriteria(newCriteria);
        this._serverCriteria = ds.splitCriteria(this._localCriteria, this.serverFilterFields);
    } else {
        delete this._localCriteria;
        delete this._serverCriteria;
    }
 
    // See if the criteria changed
    var result = this.compareCriteria(newCriteria, oldCriteria);

    if (result != 0) {
        // Criteria changed
        if (!this.isLocal()) {
            // Not using client-side filtering, just invalidateCache
            //>DEBUG
            this.logInfo("setCriteria: filter criteria changed, invalidating cache");
            //<DEBUG
            this.invalidateCache();
        } else {
            // Filtering locally but the server part of criteria may have changed.
            // If so, we have to invalidate our cache to get a new tree.
            if ((isc.isAn.emptyObject(this._serverCriteria) &&
                    !isc.isAn.emptyObject(oldServerCriteria)) ||
                (!isc.isAn.emptyObject(this._serverCriteria) &&
                    this.compareCriteria(this._serverCriteria, oldServerCriteria) != 0))
            {
                //>DEBUG
                this.logInfo("setCriteria: filter criteria changed, invalidating cache");
                //<DEBUG
                this.invalidateCache();
            } else {
                // No server criteria change
                var openState = this._getOpenState();

                // Make sure we have a complete tree saved if we are starting to filter locally
                if (isc.isAn.emptyObject(oldCriteria)) {
                    this.completeTree = this.duplicate(true, true);
                }
                this.filterLocalData();
                this._setOpenState(openState);

                if (this.dataArrived != null) {
                    isc.Func.replaceWithMethod(this, "dataArrived", "parentNode");
                    this.dataArrived(this.getRoot());
                }
            }
        }
    }
},

filterLocalData : function(parentNode) {

    if (!parentNode) parentNode = this.getRoot();

    var criteria = this._localCriteria || this.criteria,
        sourceTree = this.completeTree
    ;

    if (this.haveCriteria(criteria)) {
        // Filter tree
        var filterMode = (this.keepParentsOnFilter ? isc.Tree.KEEP_PARENTS : isc.Tree.STRICT),
            dataSource = this.getDataSource()
        ;
        sourceTree = this.applyFilter(this.completeTree, criteria, filterMode, dataSource);
	//>DEBUG
	this.logInfo("Local filter applied: " + sourceTree.getNodeList().length
                 + " of " + this.completeTree.getNodeList().length 
                 + " records matched filter:" + this.echoFull(criteria));
	//<DEBUG
    } else {
        // No criteria anymore. Drop the complete tree as there is no need
        // to keep it updated.
	//>DEBUG
	this.logInfo("Local filter applied: all " + sourceTree.getNodeList().length
                 + " records matched filter: none");
	//<DEBUG
        delete this.completeTree;
    }

    // Remove our existing tree structure
    this.data = null;
    this.setRoot(this.getCleanNodeData(this.getRoot(), false, true));

    // Copy source tree (filtered or full)
    var nodes = sourceTree.getAllNodes();
    nodes = sourceTree.getCleanNodeData(nodes, false, true);
    this.linkNodes(nodes);

    this._clearNodeCache(true);
},

//> @method resultTree.applyFilter() [A]
// The ResultTree will call applyFilter() when it needs to locally filter the tree using the
// current filter criteria.
// <P>
// Default behavior is to call +link{tree.getFilteredTree()} to obtain a new, filtered tree.
// <P>
// Override this method or +link{tree.getFilteredTree()} to implement your own client-side
// filtering behavior. Note that the original tree should not be affected.
//
// @param   tree        (Tree)           the source tree to be filtered
// @param   criteria    (Criteria)       the filter criteria
// @param   filterMode  (TreeFilterMode) mode to use for filtering
// @param   dataSource  (DataSource)     dataSource for filtering if the Tree does not
//                                       already have one
// @return  (Tree)     the filtered tree (copy)
// @visibility external
//<
applyFilter : function (tree, criteria, filterMode, dataSource) {
    return tree.getFilteredTree(criteria, filterMode, dataSource);
},

//> @method resultTree.compareCriteria()
// Default behavior is to call +link{dataSource.compareCriteria()} to determine whether new
// criteria is equivalent to the old criteria (returns 0) or not.
// <P>
// See +link{dataSource.compareCriteria()} for a full explanation of the default behavior.
// The +link{criteriaPolicy} used is "dropOnChange".
// <P>
// Override this method or +link{dataSource.compareCriteria()} to implement your own client-side
// filtering behavior.
//
// @param   newCriteria     (Criteria)  new filter criteria
// @param   oldCriteria     (Criteria)  old filter criteria
// @param   [requestProperties]     (DSRequest Properties)  dataSource request properties
// @return  (Number)    0 if the criteria are equivalent, -1 if the criteria are different
// @see criteriaPolicy
// @visibility external
//<
compareCriteria : function (newCriteria, oldCriteria, requestProperties, policy) {
    return this.getDataSource().compareCriteria(
                newCriteria, oldCriteria, 
                requestProperties ? requestProperties : this.context, 
                "dropOnChange");
},

//> @method resultTree.willFetchData()
// Will changing the criteria for this resultTree require fetching new data from the server
// or can the new criteria be satisfied from data already cached on the client?
// <p>
// This method can be used to determine whether +link{TreeGrid.fetchData()} or 
// +link{TreeGrid.filterData()} will cause a server side fetch when passed a certain set of 
// criteria.
//
// @param newCriteria (Criteria) new criteria to test.
// @return (boolean) true if server fetch would be required to satisfy new criteria.
// @visibility external
//<
willFetchData : function (newCriteria) {
    
    var undef;
    var oldCriteria = this.criteria || {},
        oldServerCriteria = this._serverCriteria || {},
        ds = this.getDataSource()
    ;

    // clone the criteria passed in - avoids potential issues where a criteria object is passed in
    // and then modified outside the RS
    // Avoid this with advanced criteria - our filter builder already clones the output
    if (!ds.isAdvancedCriteria(newCriteria)) {
        newCriteria = isc.DataSource.copyCriteria(newCriteria);
    }
        
    // If one of the criteria objects is an AdvancedCriteria, convert the other one to 
    // enable comparison
    if (ds.isAdvancedCriteria(newCriteria) && !ds.isAdvancedCriteria(oldCriteria)) {
        oldCriteria = isc.DataSource.convertCriteria(oldCriteria);
    }
    if (!ds.isAdvancedCriteria(newCriteria) && ds.isAdvancedCriteria(oldCriteria)) {
        newCriteria = isc.DataSource.convertCriteria(newCriteria);
        this.criteria = newCriteria;
    }

    var result = this.compareCriteria(newCriteria, oldCriteria);
    
    // If we have no change in criteria we won't perform a fetch
    if (result == 0) return false;

    // If we are filtering locally a fetch is required
    if (this.isLocal()) return true;

    // Criteria has changed but we need to see if it affects the fetches. That is the
    // case only if the server criteria portion has changed.

    // Split our criteria to obtain the new server criteria
    var newServerCriteria = {};
    if (this.serverFilterFields != null && this.serverFilterFields.length > 0) {
        var localCriteria = isc.DataSource.copyCriteria(newCriteria);
        newServerCriteria = ds.splitCriteria(localCriteria, this.serverFilterFields);
    }

    // If server criteria changed, a fetch is required
    return ((isc.isAn.emptyObject(newServerCriteria) &&
                !isc.isAn.emptyObject(oldServerCriteria)) ||
            (!isc.isAn.emptyObject(newServerCriteria) &&
                this.compareCriteria(newServerCriteria, oldServerCriteria) != 0));
},
    
// View state
// --------------------------------------------------------------------------------------------

 
//> @method resultTree.getOpenState() 
// Returns a snapshot of the current open state of this tree's data as
// a +link{type:treeGridOpenState} object.
// <P>
// This object can be passed to +link{resultTree.setOpenState()} or
// +link{treeGrid.setOpenState()} to open the same set of folders
// within the tree's data (assuming the nodes are still present in the data).
// @return (treeGridOpenState) current open state for the grid.
// @group viewState
// @see resultTree.setOpenState()
// @visibility external
//<
getOpenState : function() {
    var openState = this._getOpenState();
    return isc.Comm.serialize(openState);
},  

_getOpenState : function() {
    var root = this.getRoot(),
        openState = []
    ;
    this._addNodeToOpenState(this, root, openState);
    return openState;
},

//> @method resultTree.setOpenState() 
// Reset the set of open folders within this tree's data to match the 
// +link{type:treeGridOpenState} object passed in.
// <P>
// Used to restore previous state retrieved from the tree by a call to 
// +link{resultTree.getOpenState()}.
//
// @param openState (treeGridOpenState) Object describing the desired set of open folders.
// @group viewState
// @see resultTree.getOpenState()
// @visibility external
//<
setOpenState : function(openState) {
    openState = isc.Canvas.evalViewState(openState, "openState", false, this)
    if (!openState) return;
    this._setOpenState(openState);
},

_setOpenState : function(openState) {
    if (!openState) return;
    this.closeAll();
    this.openFolders(openState);
},


_addNodeToOpenState : function (tree, node, openState) {
    if (!tree.isOpen(node) || !tree.isLoaded(node)) return false;
    var children = tree.getFolders(node),
        hasOpenChildren = false;
    if (children != null) {
        for (var i = 0; i < children.length; i++) {
            hasOpenChildren = this._addNodeToOpenState(tree, children[i], openState) 
                              || hasOpenChildren;
        }
    }
    openState[openState.length] = tree.getPath(node);
    return true;
}

});

// isc._dataModelToString and isc._dataModelLogMessage are defined in Log.js
isc.ResultTree.getPrototype().toString = isc._dataModelToString;
isc.ResultTree.getPrototype().logMessage = isc._dataModelLogMessage;

isc.ResultTree.registerStringMethods({
    
    //> @method resultTree.dataArrived
    // This callback fires whenever the resultTree receives new nodes from the server, after
    // the new nodes have been integrated into the tree.
    // 
    // @param parentNode (TreeNode) The parentNode for which children were just loaded
    //
    // @visibility external
    //<
    dataArrived: "parentNode"
});

