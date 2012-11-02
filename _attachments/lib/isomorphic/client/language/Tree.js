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

 






//>	@class	Tree
//
// A Tree is a data model representing a set of objects linked into a hierarchy.
// <P>
// A Tree has no visual presentation, it is displayed by a +link{TreeGrid} or +link{ColumnTree}
// when supplied as +link{treeGrid.data} or +link{columnTree.data}.
// <P>
// A Tree can be constructed out of a List of objects interlinked by IDs or via explicitly
// specified Arrays of child objects.  See +link{attr:Tree.modelType} for an explanation of how
// to pass data to a Tree.
// <P>
// Typical usage is to call +link{treeGrid.fetchData()} to cause automatic creation of a 
// +link{ResultTree}, which is a type of Tree that automatically handles loading data on 
// demand.  For information on DataBinding Trees, see +link{group:treeDataBinding}.
// 
// @treeLocation Client Reference/System
// @visibility external
//<
isc.ClassFactory.defineClass("Tree", null, "List");

// List.getProperty() needs to be explicitly installed because there is a Class.getProperty()
isc.Tree.addProperties({
    getProperty : isc.List.getInstanceProperty("getProperty")
})

//> @groupDef ancestry
// Parent/child relationships
//<

//> @groupDef openList
// Managing the list of currently visible nodes based on the open state of parents
// <P>
// This state may move to the TreeGrid
// @visibility internal
//<

isc.Tree.addClassProperties({

//>	@type	DisplayNodeType
//
// Flag passed to functions as displayNodeType, telling the function whether it should work on
// folders, leaves or both at once.
//		@group	ancestry
// @visibility external
//
//	@value	null/unset                      operate on both folders and leaves
FOLDERS_AND_LEAVES:null,			
// 	@value	"folders"                       operate on folders only, ignoring leaves
FOLDERS_ONLY: "folders",			
//	@value	"leaves"                        operate on leaves only, ignoring folders
LEAVES_ONLY: "leaves",			
//<

//>	@type	LoadState
// Trees that dynamically load nodes keep track of whether each node has loaded its children.
//			
//	@value	isc.Tree.UNLOADED		children have not been loaded and are not loading
UNLOADED: null,						
//	@value	isc.Tree.LOADING		currently in the process of loading
LOADING: "loading",					
//	@value	isc.Tree.FOLDERS_LOADED	folders only are already loaded
FOLDERS_LOADED: "foldersLoaded",			
//	@value	isc.Tree.LOADED			already fully loaded
LOADED: "loaded",
// @group loadState
// @visibility external
//<

//> @type TreeModelType
//
// @value "parent" In this model, each node has an ID unique across the whole tree and a
// parent ID that points to its parent.  The name of the unique ID property can be specified
// via +link{attr:Tree.idField} and the name of the parent ID property can be specified via
// +link{attr:Tree.parentIdField}.  The initial set of nodes can be passed in as a list to
// +link{attr:Tree.data} and also added as a list later via +link{method:Tree.linkNodes}.
// Whether or not a given node is a folder is determined by the value of the property specified
// by +link{attr:Tree.isFolderProperty}.
// <br><br>
// The "parent" modelType is best for integrating with relational storage (because nodes can
// map easily to rows in a table) and collections of Beans and is the model used for DataBound
// trees.
PARENT:"parent",
//
// @value "children" In this model, nodes specify their children as a list of nodes.  The
// property that holds the children nodes is determined by +link{attr:Tree.childrenProperty}.
// Nodes are not required to have an ID that is unique across the whole tree (in fact, no ID is
// required at all).  Node names (specified by the +link{attr:Tree.nameProperty}, unique within
// their siblings, are optional but not required.  Whether or not a given node is a folder is
// determined by the presence of the children list (+link{attr:Tree.childrenProperty}).
CHILDREN:"children",
//
// @visibility external
//<

//> @type TreeFilterMode
// Mode for applying criteria to a tree.
// @value "strict" only nodes that actually match criteria are shown.  If a parent does not
//                 match the criteria, it will not be shown, even if it has children that do
//                 match the criteria
STRICT:"strict",
// @value "keepParents" parent nodes are kept if they have children which match the criteria,
//                      or, in a tree with
//                      +link{resultTree.loadDataOnDemand,loadDataOnDemand:true}, if they have
//                      not loaded children yet.
KEEP_PARENTS:"keepParents",
// @group treeFilter
// @visibility external
//<


autoID:0

});


//
//	add instance defaults to the tree
//
isc.Tree.addProperties({
	
//> @attr tree.modelType        (TreeModelType: "children" : IRWA)
//
// Selects the model used to construct the tree representation.  See +link{TreeModelType} for
// the available options and their implications.
// <P>
// If the "parent" modelType is used, you can provide the initial parent-linked data set to the
// tree via the +link{attr:Tree.data} attribute.  If the "children" modelType is used, you can
// provide the initial tree structure to the Tree via the +link{attr:Tree.root} attribute.
//
// @see attr:Tree.data
// @see attr:Tree.root
//
// @visibility external
// @example nodeTitles
//<
modelType: "children",

//> @attr tree.isFolderProperty     (String: "isFolder": IRW)
//
// Name of property that defines whether a node is a folder.  By default this is set to
// +link{TreeNode.isFolder}.
//
// @see TreeNode.isFolder
// @visibility external
//<
isFolderProperty: "isFolder",

//> @attr tree.defaultIsFolder (boolean : null : IR)
// Controls whether nodes are assumed to be folders or leaves by default.
// <P>
// Nodes that have children or have the +link{isFolderProperty} set to true will be considered
// folders by default.  Other nodes will be considered folders or leaves by default according
// to this setting.
//
// @see treeGrid.loadDataOnDemand
// @visibility external
//<

//> @attr tree.reportCollisions (boolean : true : IR)
// If new nodes are added to a tree with modelType:"parent" which have the same
// +link{tree.idField,id field value} as existing nodes, the existing nodes are removed when
// the new nodes are added.
// <P>
// If reportCollisions is true, the Tree will log a warning in the developer console about this.
// <P>
// Note that if an id collision occurs between a new node and its ancestor, the ancestor will be
// removed and the new node will not be added to the tree.
// @visibility external
//<
reportCollisions:true,



//>	@attr	tree.autoSetupParentLinks		(boolean : true : IRWA)
//			true == we should automatically set up links 
//			 from nodes to their parents at init() time
//
//		@see	tree.init()
//<
autoSetupParentLinks:true,

//>	@attr	tree.pathDelim		(string : "/" : IRWA)
//
// Specifies the delimiter between node names.  The pathDelim is used to construct a unique
// path to each node. A path can be obtained for any node by calling
// +link{method:Tree.getPath} and can be used to find any node in the tree by calling
// +link{method:Tree.find}.  Note that you can also hand-construct a path - in other words
// you are not required to call +link{method:Tree.getPath} in order to later use
// +link{method:Tree.find} to retrieve it.
// <br><br>
// The pathDelim can be any character or sequence of characters, but must be a unique string
// with respect to the text that can appear in the +link{attr:Tree.nameProperty} that's used
// for naming the nodes.  So for example, if you have the following tree:
// <pre>
// one
//   two
//     three/four
// </pre>
// Then you will be unable to find the <code>three/four</code> node using
// +link{method:Tree.find} if your tree is using the default pathDelim of /.
// In such a case, you can use a different pathDelim for the tree.  For example if you used |
// for the path delim, then you can find the <code>three/four</code> node in the tree above by
// calling <code>tree.find("one|two|three/four")</code>.
// <br><br>
// The pathDelim is used only by +link{method:Tree.getPath} and +link{method:Tree.find} and
// does not affect any aspect of the tree structure or other forms of tree navigation (such as
// via +link{method:Tree.getChildren}).
//
// @see attr:Tree.nameProperty
// @see method:Tree.find
// @visibility external
//<
pathDelim:"/",

// not documented:
// parentProperty : always generated, // direct pointer to parent node

treeProperty : "_isc_tree", // internal property pointing back to the origin tree

//>	@attr tree.nameProperty     (string : "name" : IRW)
//
// Name of the property on a +link{TreeNode} that holds a name for the node that is unique
// among it's immediate siblings, thus allowing a unique path to be used to identify the node,
// similar to a file system.  Default value is "name".  See +link{TreeNode.name} for usage.
//
// @see TreeNode.name
// @visibility external
// @example nodeTitles
//< 
nameProperty:"name",

//>	@attr tree.titleProperty	(string : "title" : IRW)
//
// Name of the property on a +link{TreeNode} that holds the title of the node as it should be
// shown to the user.  Default value is "title".  See +link{TreeNode.title} for usage.
//
// @visibility external
//<
titleProperty:"title",

//> @attr tree.idField    (string : "id" : IRA)
//
// Name of the property on a +link{TreeNode} that holds an id for the node which is unique
// across the entire Tree.  Required for all nodes for trees with modelType "parent".
// Default value is "id".  See +link{TreeNode.id} for usage.
//
// @see TreeNode.id
// @visibility external
// @example nodeTitles
//<

//> @attr tree.parentIdField (string : "parentId" : IRA)
//
// For trees with modelType "parent", this property specifies the name of the property
// that contains the unique parent ID of a node.  Default value is "parentId".  See
// +link{TreeNode.parentId} for usage.
//
// @see TreeNode.parentId
// @visibility external
// @example nodeTitles
//<

//>	@attr	tree.childrenProperty	(string : "children" : IRW)
//
// For trees with the modelType "children", this property specifies the name of the property
// that contains the list of children for a node.
// 
// @see attr:Tree.modelType
// @visibility external
// @example childrenArrays
//<
childrenProperty:"children",

//>	@attr	tree.openProperty	(string : null : IRWA)
//
// The property consulted by the default implementation of +link{Tree.isOpen()} to determine if the
// node is open or not.  By default, this property is auto-generated for you, but you can set
// it to a custom value if you want to declaratively specify this state, but be careful - if
// you display this Tree in multiple TreeGrids at the same time, the open state will not be
// tracked independently - see +link{group:sharingNodes} for more info on this.
//
// @group	openList
// @see group:sharingNodes
// @visibility external
// @example initialData
//<

//>	@attr	tree.cacheOpenList	(boolean : true : IRWA)
//		@group	openList
//			If true, we cache the open list and only recalculate it 
//			if the tree has been marked as dirty.  If false, we get the openList
//			every time.
//<
cacheOpenList:true,

//>	@attr	tree.openListCriteria	(string|function : null : IRWA)
//		@group	openList
//			Criteria for whether or not nodes are included in the openList
//<


//> @attr tree.data             (List of TreeNode : null : IR)
//
// Optional initial data for the tree. How this data is interpreted depends on this tree's
// +link{tree.modelType}.
// <P>
// If <code>modelType</code> is <code>"parent"</code>, the list that you provide will be passed 
// to +link{method:Tree.linkNodes}, integrating the nodes into the tree.
// <p>
// In this case the root node may be supplied explicitly via +link{Tree.root}, or auto generated,
// picking up its <code>id</code> via +link{Tree.rootValue}. Any nodes in the data with no
// explicitly specified +link{treeNode.parentId} will be added as children to this root element.
// <P>
// To create this tree:
// <pre>
// foo
//   bar
// zoo
// </pre>
// with modelType:"parent", you can do this:
// <pre>
// Tree.create({
//   data: [
//     {name: "foo", id: "foo"},
//     {name: "bar", id: "bar", parentId: "foo"},
//     {name: "zoo", id: "zoo"}
// });
// </pre>
// Or this (explicitly specified root):
// <pre>
// Tree.create({
//   root: {id: "root"},
//   data: [
//     {name: "foo", id: "foo", parentId: "root"},
//     {name: "bar", id: "bar", parentId: "foo"},
//     {name: "zoo", id: "zoo", parentId: "root"}
// });
// </pre>
// Or this (explicitly specified rootValue):
// <pre>
// Tree.create({
//   rootValue: "root",
//   data: [
//     {name: "foo", id: "foo", parentId: "root"},
//     {name: "bar", id: "bar", parentId: "foo"},
//     {name: "zoo", id: "zoo", parentId: "root"}
// });
// </pre>
// Specifying the root node explicitly allows you to give it a name, changing the way path
// derivation works (see +link{Tree.root} for more on naming the root node).
// <P>
// For <code>modelType:"children"</code> trees, the data passed in will be assumed to be an 
// array of children of the tree's root node. 
//
// @see attr:Tree.modelType
// @see TreeNode
// @visibility external
// @example nodeTitles
//<

//> @attr tree.rootValue             (string|number : null : IR)
//
// If you are using the "parent" modelType and did not specify a root node via +link{Tree.root}
// with an id (+link{Tree.idField}), then you can provide the root node's id via this property.
// See the example in +link{Tree.data} for more info.
// 
// @see Tree.data
// @visibility external
// @example nodeTitles
//<

//>	@attr	tree.root		(TreeNode : null : IRW)
//
// If you're using the "parent" modelType, you can provide the root node configuration via this
// property.  If you don't provide it, one will be auto-created for you with an empty name.
// Read on for a description of what omitting the name property on the root node means for path
// derivation.
// <p>
// If you're using the "children" modelType, you can provide the initial tree data via this
// property.  So, for example, to construct the following tree:
// <pre>
// foo
//   bar
// zoo
// </pre>
// You would initialize the tree as follows: 
// <pre>
// Tree.create({
//     root: { name:"root", children: [
//         { name:"foo", children: [
//             { name: "bar" }
//         ]},
//         { name: "zoo" }
//     ]}
// });
// </pre>
// Note that if you provide a <code>name</code> property for the root node, then the path to
// any node underneath it will start with that name.  So in the example above, the path to the
// <code>bar</code> node would be <code>root/foo/bar</code> (assuming you're using the default
// +link{attr:Tree.pathDelim}.  If you omit the name attribute on the root node, then it's name
// is automatically set to the +link{attr:Tree.pathDelim} value.  So in the example above, if
// you omitted <code>name:"root"</code>, then the path to the <code>bar</code> node would be
// <code>/foo/bar</code>.
// <br><br>
// Note: if you initialize a Tree with no <code>root</code> value, a root node will be
// auto-created for you.  You can then call +link{method:Tree.add} to construct the tree.
//
// @see Tree.modelType
// @see Tree.setRoot()
//
// @visibility external
// @example childrenArrays
//<

//discardParentlessNodes

//> @attr tree.discardParentlessNodes (boolean : false : IRA)
// If this tree has +link{Tree.modelType,modelType:"parent"}, should nodes in the data array for the
// tree be dropped if they have an explicitly specified value for the +link{attr:Tree.parentIdField}
// which doesn't match any other nodes in the tree. If set to false these nodes will be added as
// children of the root node.
// @visibility external
//<
discardParentlessNodes:false,

//> @attr Tree.indexByLevel (boolean : false : IR)
// If enabled, the tree keeps an index of nodes by level, so that +link{tree.getLevelNodes()}
// can operate more efficiently
//<
indexByLevel: false,

//> @object TreeNode
//
// Every node in the tree is represented by a TreeNode object which is an object literal with a
// set of properties that configure the node.
// <p>
// When a Tree is supplied as +link{TreeGrid.data} to +link{TreeGrid}, you can also set
// properties from +link{ListGridRecord} on the TreeNode (e.g. setting
// +link{ListGridRecord.enabled}:<code>false</code> on the node).
//
// @treeLocation Client Reference/Grids/TreeGrid
// @treeLocation Client Reference/System/Tree
// @visibility external
//<


//> @attr treeNode.enabled  (boolean : null : IR)
// @include ListGridRecord.enabled
// @visibility external
//<

//> @attr treeNode.canDrag  (boolean : null : IRA)
// Governs whether this node can be dragged. Only has an effect if this node is displayed in
// a +link{TreeGrid} where +link{TreeGrid.canDragRecordsOut}, +link{TreeGrid.canReorderRecords}
// or +link{TreeGrid.canReparentNodes} is <code>true</code>.
// @visibility external
//<

//> @attr treeNode.canAcceptDrop (boolean : null : IRA)
//
// Governs whether dragged data (typically other <code>treeNode</code>s) may be dropped over
// this node. Only has an effect if this node is displayed in a +link{TreeGrid} where
// +link{TreeGrid.canAcceptDroppedRecords}, +link{TreeGrid.canReorderRecords} or 
// +link{TreeGrid.canReparentNodes} is true.
//
// @visibility external
//<

//> @attr treeNode.isFolder (Boolean or String : null : IR)
//
// Set to <code>true</code> or a string that is not equal to (ignoring case)
// <code>"false"</code> to explicitly mark this node as a folder.  See +link{Tree.isFolder} for
// a full description of how the +link{Tree} determines whether a node is a folder or not.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.isFolderProperty}.
//
// @see Tree.isFolderProperty
// @visibility external
//<

//> @attr treeNode.name (String : null, but see below : IR)
//
// Provides a name for the node that is unique among it's immediate siblings, thus allowing a
// unique path to be used to identify the node, similar to a file system.  See
// +link{Tree.getPath()}.
// <p>
// If the nameProperty is not set on a given node, the +link{TreeNode.id} will be used instead.  If
// this is also missing, +link{tree.getName()} and +link{tree.getPath()} will auto-generate a
// unique name for you.  Thus names are not required, but if the dataset you are using already
// has usable names for each node, using them can make APIs such as +link{tree.find()} more
// useful.  Alternatively, if your dataset has unique ids consider providing those as
// +link{TreeNode.id}.
// <P>
// If a value provided for the nameProperty of a node (e.g. node.name) is not a
// string, it will be converted to a string by the Tree via ""+value.
// <p>
// This property is also used as the default title for the node (see +link{Tree.getTitle()})
// if +link{TreeNode.title} is not specified.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.nameProperty}.
//
// @see Tree.nameProperty
// @see Tree.pathDelim
// @see Tree.getPath
// @see Tree.getTitle
// @visibility external
//<

//> @attr treeNode.title (HTML : null : IR)
//
// The title of the node as it should appear next to the node icon in the +link{Tree}.  If left
// unset, the value of +link{TreeNode.name} is used by default.  See the description in
// +link{Tree.getTitle()} for full details.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.titleProperty}.
//
// @see Tree.titleProperty
// @see Tree.getTitle()
// @visibility external
//<

//> @attr treeNode.id (String or Number: null : IR)
//
// Specifies the unique ID of this node.  
// <P>
// Required for trees with +link{Tree.modelType} "parent".  With modelType:"parent", the unique
// ID of a node, together with the unique ID of its parent (see +link{TreeNode.parentId}) is
// used by +link{Tree.linkNodes} to link a list of nodes into a tree.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.idField}.
//
// @see TreeNode.parentId
// @see Tree.linkNodes()
// @see Tree.modelType
// @see Tree.idField
// @visibility external
//<

//> @attr treeNode.parentId (String or Number : null : IR)
//
// For trees with modelType:"parent", this property specifies the unique ID of this node's 
// parent node.
// The unique ID of a node, together with the unique ID of its parent is used by
// +link{method:Tree.linkNodes} to link a list of nodes into a tree.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.parentIdField}.
//
// @see TreeNode.id
// @see Tree.linkNodes()
// @see Tree.modelType
// @see Tree.parentIdField
// @visibility external
//<

//> @attr treeNode.children (List of TreeNode : null : IRW)
//
// For trees with the modelType "children", this property specifies the children of this
// TreeNode.
// <p>
// Note: the name of this property can be changed by setting +link{Tree.childrenProperty}
//
// @see Tree.modelType
// @see Tree.childrenProperty
// @visibility external
//<

//> @attr   treeNode.icon   (SCImgURL : null : [IRW])
// This Property allows the developer to customize the icon displayed next to a node.
// Set <code>node.icon</code> to the URL of the desired icon to display and
// it will be shown instead of the standard +link{treeGrid.nodeIcon} for this node.<br>
// Note that if +link{TreeNode.showOpenIcon} and/or +link{TreeNode.showDropIcon} 
// is true for this node, customized icons for folder nodes will be appended with the 
// +link{treeGrid.openIconSuffix} or +link{treeGrid.dropIconSuffix} suffixes on state change 
// as with the standard +link{TreeGrid.folderIcon} for this treeGrid.  Also note that for
// custom folder icons, the +link{treeGrid.closedIconSuffix} will never be appended.
// <P>You can change the name of this property by setting 
// +link{TreeGrid.customIconProperty}.
// @group treeIcons
// @visibility external
//<

//> @attr   treeNode.showOpenIcon (boolean : false : [IRWA])
// For folder nodes showing custom icons (set via +link{treeNode.icon}),
// this property allows the developer to specify on a per-node basis whether an
// open state icon should be displayed when the folder is open.
// Set <code>node.showOpenIcon</code> to true to show the open state
// icons, or false to suppress this.<br>
// If not specified, this behavior is determined by +link{TreeGrid.showCustomIconOpen}
// for this node.
// <P>You can change the name of this property by setting 
// +link{TreeGrid.customIconOpenProperty}.
// @see treeGrid.customIconProperty
// @see treeGrid.showCustomIconOpen
// @visibility external
// @group treeIcons
//<
showOpenIcon: false,

//> @attr   treeNode.showDropIcon (boolean : false : [IRWA])
// For folder nodes showing custom icons (set via +link{treeNode.icon}),
// this property allows the developer to specify on a per-node basis whether a
// drop state icon should be displayed when the 
// user drop-hovers over this folder.<br>
// Set <code>node.showDropIcon</code> to true to show the drop state
// icon, or false to suppress this.<br>
// If not specified, this behavior is determined by +link{treeGrid.showCustomIconDrop}
// for this node.
// <P>You can change the name of this property by setting 
// +link{TreeGrid.customIconDropProperty}.
// @see treeGrid.customIconProperty
// @see treeGrid.showCustomIconDrop
// @visibility external
// @group treeIcons
//<
showDropIcon: false,


//>	@attr	tree.sortProp			(string : null : IRW)
//		@group	openList
//			Name of the property to sort by.  
//			Set to null because we don't sort by default.
//<


//>	@attr	tree.sortDirection				(SortDirection : Array.ASCENDING : IRW)
//			Sort ascending by default
//<
sortDirection: Array.ASCENDING,

//>	@attr	tree.showRoot			(boolean : false : IRW)
// Controls whether a call to +link{getOpenList()} includes the root node.  Since view
// components such as +link{TreeGrid} use <code>getOpenList()</code> to display the currently
// visible tree, <code>showRoot</code> controls whether the root node is shown to the user.
// <P>
// All Trees must have a single, logical root, however, most applications want to show multiple
// nodes at the top level.  <code>showRoot:false</code>, the default setting, prevents the logical
// root from being shown, so that the displayed tree begins with the children of root.
// <P>
// You can set <code>showRoot:true</code> to show the single, logical root node as the only
// top-level node.  This property is only meaningful for Trees where you supplied a value for
// +link{Tree.root}, otherwise, you will see an automatically generated root node that is
// meaningless to the user.
//
// @visibility external
//<
showRoot: false,

//>	@attr	tree.autoOpenRoot			(boolean : true : IRW)
//
// If true, the root node is automatically opened when the tree is created or
// +link{Tree.setRoot()} is called.
//
// @visibility external
//<
autoOpenRoot: true,

//>	@attr	tree.separateFolders	(boolean : false : IRW)
// Should folders be sorted separately from leaves or should nodes be ordered according to
// their sort field value regardless of whether the node is a leaf or folder?
// @see tree.sortFoldersBeforeLeaves
// @visibility external
//<
separateFolders:false,

//>	@attr	tree.sortFoldersBeforeLeaves (boolean : true : IRW)
// If +link{tree.separateFolders} is true, should folders be displayed above or below leaves?
// When set to <code>true</code> folders will appear above leaves when the
// <code>sortDirection</code> applied to the tree is +link{Array.ASCENDING}
// @visibility external
//<
sortFoldersBeforeLeaves:true,

//>	@attr	tree.defaultNodeTitle	(string : "Untitled" : IRW)
//
// Title assigned to nodes without a +link{attr:Tree.titleProperty} value or a
// +link{attr:Tree.nameProperty} value.
//
// @visibility external
//<
defaultNodeTitle:"Untitled",

//>	@attr	tree.defaultLoadState	(LoadState : isc.Tree.UNLOADED : IRW)
//		@group	loadState
//			default load state for nodes where is has not been explicitly set
//<
defaultLoadState:isc.Tree.UNLOADED	

});

//
//	add methods to the tree
//
isc.Tree.addMethods({
//>	@method	tree.init()	(A)
// Initialize the tree.<br><br>
//
// Links the initially provided nodes of the tree according to the tree.modelType.
// <br><br>
//
// Gives the tree a global ID and places it in the global scope.
//
//		@group	creation		
//
//		@param	[all arguments]	(object)	objects with properties to override from default
//
// @see group:sharingNodes
//<
init : function () {
    this.setupProperties();
    
    // if a root wasn't specified, create one
    this.setRoot(this.root || this.makeRoot());

    // load breadth-first on init if so configured
    if (this.loadOnInit && this.loadBatchSize >= 0) this.loadSubtree(null, null, true);
},

setupProperties : function () {
	// make sure we have a global ID, but avoid doing this more than once as subclasses may
    // already have set up an ID
	if (this.ID == null || window[this.ID] != this) isc.ClassFactory.addGlobalID(this);

    // use a unique property for the parent link so that nodes moved between trees can't get
    // confused.  Advanced usages may still override.
    if (!this.parentProperty) this.parentProperty = "_parent_"+this.ID;

    // we rely on being able to scribble the isFolderProperty on nodes - if the user set this
    // to null or the empty string, create a unique identifier.
    if (!this.isFolderProperty) this.isFolderProperty = "_isFolder_"+this.ID;

    // initialize here instead of in addProperties() so we can detect if the user provided
    // explicit values - used by ResultTree.
    if (this.idField == null) this.idField = "id";
    if (this.parentIdField == null) this.parentIdField = "parentId";

	// set the openProperty if it wasn't set already
	if (!this.openProperty) this.openProperty = "_isOpen_" + this.ID;

	// Create an empty _levelNodes array if we're indexing by level
	if (this.indexByLevel) this._levelNodes = [];
},

//> @method tree.duplicate()
// Create a copy of tree. If includeData is <code>true</code>, the tree nodes are copied.
// Otherwise, just the tree settings and an empty root node are in the new tree.
//
// @param [includeData] (bool)  Should tree nodes be copied?
// @param [includeLoadState] (bool)  Should tree node loadState be retained?
// @return (tree) copy of tree.
// @group creation
// @visibility internal
//<
_knownProperties : ["autoOpenRoot", "childrenProperty", "defaultIsFolder", 
                    "defaultNodeTitle", "discardParentlessNodes", "idField",
                    "isFolderProperty", "modelType", "nameProperty",
                    "parentIdField", "pathDelim", "reportCollisions", "rootValue",
                    "showRoot", "titleProperty", "isMultiDSTree", "dataSource", "operation"],
_$openProperty: "openProperty",
duplicate : function (includeData, includeLoadState) {

    // Create a new tree object
    var newTree = isc.Tree.create();

    // Copy known properties
    var undef;
    for (var i = 0; i < this._knownProperties.length; i++) {
        var propertyName = this._knownProperties[i],
            value = this[propertyName]
        ;
        if (value !== undef) newTree[propertyName] = value;
    }
    // Handle some special dynamic properties
    var value = this[this._$openProperty];
    if (value !== undef && !value.startsWith("_isOpen_")) newTree[this._$openProperty] = value;

    // Create a clean root node
    newTree.setRoot(this.getCleanNodeData(this.getRoot(), false, includeLoadState));

    // Copy nodes
    if (includeData) {
        var nodes = this.getOpenList(null, isc.Tree.FOLDERS_AND_LEAVES, null, null, null, null, true);
        nodes = this.getCleanNodeData(nodes, false, includeLoadState);
        newTree.linkNodes(nodes);
    }

    return newTree;
},


destroy : function () {
	// remove the window.ID pointer to us.  NOTE: don't destroy the global variable if it no longer
    // points to this instance (this might happen if you create a new instance with the same ID)
    this.destroyed = true;
    if (window[this.ID] == this) window[this.ID] = null;
},

//>	@method	tree.makeRoot()
//		@group	creation
// 			Make a new, empty root node.
//
//		@return	(object) 	new root node.
//<
makeRoot : function () {
    var root = {};
    var undef;
    if (this.idField !== undef) root[this.idField] = this.rootValue;
    root[this.treeProperty] = this.ID;
    return root;
},

// convert a node to a folder
convertToFolder : function (node) {
    // mark the node as a folder
    node[this.isFolderProperty] = true;
},

//>	@method	tree.makeNode()
// 			Make a new, empty node from just a path
//			NOTE: creates any parents along the chain, as necessary
//		@group	creation
//		@return	(TreeNode) 	new node
//<
// autoConvertParents forces the conversion of nodes in the parent chain to leaf or folder status as
// necessary to avoid dups.  For example, makeNode('foo') followed by makeNode('foo/') would
// normally create a leaf foo and a folder foo.  If autoConvertParents is set to true, there would
// only be the folder foo regardless of the makeNode() call order.
//
makeNode : function (path, autoConvertParents) {

	// first try to find the node -- if we can find it, just return it
	var node = this.find(path);
	if (node) {
        if (autoConvertParents) this.convertToFolder(node);
        return node;
    }

    // The path will be in the format:
    // "root/p1/p2/p3/newLeaf" or
    // "/p1/p2/p3/newFolder/"
    //      where p1 etc are existing parents
	
	// get the parent path for this node
	var pathComponents = path.split(this.pathDelim);    // array:['','p1','p2','p3','newNode']
    
    // The path must start at the root - if it doesn't, assume it was intended to
    var rootName = this.getRoot()[this.nameProperty];
    if (rootName.endsWith(this.pathDelim)) {
        rootName = rootName.substring(0, rootName.length - this.pathDelim.length);
    }
    
    if (pathComponents[0] != rootName) pathComponents.addAt(rootName, 0);
    
    // If we're making a folder rather than a leaf, the path passed in will finish with the path
    // delimiter, so we'll have a blank at the end of the array
    var newNodeName = pathComponents[pathComponents.length - 1],
        makingLeaf = (newNodeName != isc.emptyString);
        
    if (!makingLeaf) {
        // chop off the empty slot at the end
        pathComponents.length = pathComponents.length -1;
        newNodeName = pathComponents[pathComponents.length - 1]
    }
//    this.logWarn("makingLeaf: " + makingLeaf + ", pathComponents:" + pathComponents);    
    
    var parentPath = pathComponents.slice(0, (pathComponents.length -1)).join(this.pathDelim) 
                     + this.pathDelim;

    
	// get a pointer to the parent
	var parent = this.find(parentPath);
    
    
    if (parent == null) {
        parent = this.find(parentPath.substring(0, parentPath.length - this.pathDelim.length));
    }

    // We need to create the parent if it doesn't exist, or is a leaf, and we're not converting
    // parents.  Call ourselves recursively to get the parent.
	// NOTE: this should bottom out at the root, which should always be defined
	if (!parent) {
        parent = this.makeNode(parentPath, autoConvertParents);
    } else if (!this.isFolder(parent)) {
        // If necessary convert the leaf parent to a folder
        this.convertToFolder(parent);
    }
    
	// make the actual node
    var node = {};
	
	// set the name and path of the node
	node[this.nameProperty] = newNodeName;
    
    // making a folder - convert the node to a folder
    if (!makingLeaf) this.convertToFolder(node);

	// and add it to the tree
	return this.add(node, parent);

},


//>	@method	tree.isRoot()
//
// Return true if the passed node is the root node.
//
// @param	node	(TreeNode) 	node to test
// @return			(boolean)	true if the node is the root node
//
// @visibility external
//<
isRoot : function (node) {
	return this.root == node;
},

//>	@method	tree.setupParentLinks()	(A)
//			Make sure the parent links are set up in all children of the root.
//			This lets you create a simple structure without back-links, while
//			 having the back-links set up automatically
//		@group	ancestry		
//
//		@param	[node]	(TreeNode)	parent node to set up child links to
//									 (default is this.root)
//<
setupParentLinks : function (node) {
	// if the node wasn't passed in, use the root
	if (!node) node = this.root;
    if (node[this.idField] != null) this.nodeIndex[node[this.idField]] = node;

	// get the children array of the node
	var	children = node[this.childrenProperty];
    
    if (children) {
        // current assumption whenever loading subtrees is that if any children are returned
        // for a node, it's the complete set, and the node is marked "loaded"
        this.setLoadState(node, isc.Tree.LOADED);

        // handle the children property containing a single child object.
        if (!isc.isAn.Array(children)) {
            children = node[this.childrenProperty] = [children];
        }
    }

	// if no children defined, bail
	if (!children || children.length == 0) return;
	// for each child
	for (var i = 0, length = children.length, child; i < length; i++) {
		child = children[i];

		// if the child is null, skip it
		if (!child) continue;

        // set the parentId on the child if it isn't set already
        if (child[this.parentIdField] == null && node[this.idField] != null) 
            child[this.parentIdField] = node[this.idField];

		// set the child's parent to the parent
		child[this.parentProperty] = node;
        
        this._addToLevelCache(child, node);

		// if the child is a folder, call setupParentLinks recursively on the child
		if (this.isFolder(child)) {
            this.setupParentLinks(child);
        } else if (child[this.idField] != null) {
            this.nodeIndex[child[this.idField]] = child; // link into the nodeIndex
        }
	}
},

//> @method tree.linkNodes()
// Adds an array of tree nodes into a Tree of +link{modelType} "parent".   
// <P>
// The provided TreeNodes must contain, at a minimum, a field containing a unique ID for the
// node (specified by +link{attr:Tree.idField}) and a field containing the ID of the node's 
// parent node (specified by +link{attr:Tree.parentIdField}).
// <P>
// This method handles receiving a mixture of leaf nodes and parent nodes, even out of order and
// with any tree depth.
// <P>
// Nodes may be passed with the +link{childrenProperty} already populated with an Array of
// children that should also be added to the Tree, and this is automatically handled.
//
// @param nodes (Array of TreeNode) list of nodes to link into the tree.
//
// @see attr:Tree.data
// @see attr:Tree.modelType
// @visibility external
//<
connectByParentID : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty) {
    this.linkNodes(records, idProperty, parentIdProperty, rootValue, isFolderProperty);    
},
connectByParentId : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty) {
    this.linkNodes(records, idProperty, parentIdProperty, rootValue, isFolderProperty);
},


// NOTE: this does not handle multi-column (multi-property) primary keys
linkNodes : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty, contextNode, suppressDataChanged) {

    if (this.modelType == "fields") {
        this.connectByFields(records);
        return;
    }

    records = records || this.data;
    idProperty = (idProperty != null) ? idProperty : this.idField;
    parentIdProperty = (parentIdProperty != null) ? parentIdProperty : this.parentIdField;
    rootValue = (rootValue != null) ? rootValue : this.rootValue;
    
    var newNodes = [];
    newNodes.addList(records);
    
    // build a local index of the nodes passed in. this will allow us to find parents within the
    // tree without having to do multiple array.finds (so it'll be linear time lookup)
    var localNodeIndex = {};
    for (var i = 0; i < newNodes.length; i++) {
        var id = newNodes[i][idProperty];
        if (id != null) localNodeIndex[id] = newNodes[i];
    }
    
    for (var i = 0; i < newNodes.length; i++) {
        var node = newNodes[i];
        
        // We look up parent chains and add interlinked nodes in parent order
        // so if we already have this node in the tree, skip it
        if (this.nodeIndex[node[idProperty]] == node) continue;
        if (node == null) continue;
        
        // Our parentId property may point to another node passed in (potentially in a chain)
        // In this case, ensure we link these parents into the tree first.
        var newParentId = node[parentIdProperty],
            newParent = newParentId != null ? localNodeIndex[newParentId] : null,
            newParents = []
        ;
        
        while (newParent != null) {
            if (newParent) newParents.add(newParent);
            newParentId = newParent[parentIdProperty];            
            // Note: don't infinite loop if parentId==id - that's bad data, really, but such
            // datasets exist in the wild..
            newParent = newParentId != null && newParentId != node[parentIdProperty] ? localNodeIndex[newParentId] : null;            
        }
      
        if (newParents.length > 0) {            
            for (var ii = (newParents.length -1); ii >= 0; ii--) {
                if (this.logIsDebugEnabled(this._$treeLinking)) {
                    this.logDebug("linkNodes running - adding interlinked parents to the tree in "+
                        " reverse hierarchical order -- currently adding node with id:"+
                        newParents[ii][idProperty], this._$treeLinking);
                }                
                this._linkNode(newParents[ii], idProperty, parentIdProperty,
                               contextNode, rootValue);
                // at this point the parent is linked into the real tree -- 
                // blank out the entry in the local index so other nodes linked to it do
                // the right thing
                delete localNodeIndex[newParents[ii][idProperty]];
            }
        }
        // Actually link in this node
        this._linkNode(node, idProperty, parentIdProperty, contextNode, rootValue);
        // blank out this slot - this will avoid us picking up this node in the newParents
        // array of other nodes when it has already been added to the tree if appropriate
        delete localNodeIndex[node[idProperty]];
        
    }
    
    this._clearNodeCache(true);
    if (!suppressDataChanged) this.dataChanged();
},

// old synonyms for backcompat
connectByParentID : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty) {
    this.linkNodes(records, idProperty, parentIdProperty, rootValue, isFolderProperty);    
},
connectByParentId : function (records, idProperty, parentIdProperty, rootValue, isFolderProperty) {
    this.linkNodes(records, idProperty, parentIdProperty, rootValue, isFolderProperty);
},

// _linkNode - helper to actually attach a node to our tree - called from the for-loop in linkNodes
// returns true if the node was successfully added to the tree.
_$treeLinking:"treeLinking",
_linkNode : function (node, idProperty, parentIdProperty, contextNode, rootValue) {
    
    var logDebugEnabled = this.logIsDebugEnabled(this._$treeLinking);

    var id = node[idProperty],
        parentId = node[parentIdProperty],
        undef,
        nullRootValue = (rootValue == null), 
        // Note explicit === for emptyString comparison necessary as
        // 0 == "", but zero is a valid identifier
        nullParent = (parentId == null || parentId == -1 || parentId === isc.emptyString),
        parent = this.nodeIndex[parentId];
    
    if (parent) {
        if (logDebugEnabled) {
            this.logDebug("found parent " + parent[idProperty] + 
                         " for child " + node[idProperty], this._$treeLinking);
        }        
        this._add(node, parent);
    } else if (!nullRootValue && parentId == rootValue) {
                 
        if (logDebugEnabled) {
            this.logDebug("root node: " + node[idProperty], this._$treeLinking);
        }        
        // this is a root node
        this._add(node, this.root);
        
    } else {
        // Drop nodes with an explicit parent we can't find if discardParentlessNodes is true
        if (!nullParent && this.discardParentlessNodes) {
            this.logWarn("Couldn't find parent: " + parentId + " for node with id:" + id,
                         this._$treeLinking);
        } else {
            
            var defaultParent = contextNode || this.root;
            // if a contextNode was supplied, use that as the default parent node for all
            // nodes that are missing a parentId - this is for loading immediate children
            // only, without specifying a parentId
            if (logDebugEnabled) {
                this.logDebug("child:" + node[idProperty] + 
                              (nullParent ? " has no explicit parent " :
                                        (" unable to find specified parent:" + parentId)) +
                              "- linking to default node " +
                              defaultParent[idProperty], this._$treeLinking);
            }            
            this._add(node, defaultParent);
        }
    }
    
},

connectByFields : function (data) {
    if (!data) data = this.data;
    // for each record
    for (var i = 0; i < data.length; i++) {
        this.addNodeByFields(data[i]);
    }
},

addNodeByFields : function (node) {
    // go through each field in this.fields in turn, descending through the hierarchy, creating
    // hierarchy as necessary

    
    var parent = this.root;
    for (var i = 0; i < this.fieldOrder.length; i++) {
        var fieldName = this.fieldOrder[i],
            fieldValue = node[fieldName];

        var folderName = isc.isA.String(fieldValue) ? fieldValue : 
                                                      fieldValue + isc.emptyString,
            childNum = this.findChildNum(parent, folderName),
            child;
        if (childNum != -1) {
            //this.logWarn("found child for '" + fieldName + "':'" + fieldValue + "'");
            child = this.getChildren(parent).get(childNum);
        } else {
            // if there's no child with this field value, create one
            //this.logWarn("creating child for '" + fieldName + "':'" + fieldValue + "'");
            child = {};
            child[this.nameProperty] = folderName;
            this.add(child, parent);
            this.convertToFolder(child);
        }
        parent = child;
    }
    // add the new node to the Tree
    //this.logWarn("adding node at: " + this.getPath(parent));
    this.add(node, parent);
},

//>	@method	tree.getRoot()
//
// Returns the root node of the tree.
//
// @return  (TreeNode)    the root node
//
// @visibility external
//<
getRoot : function () {
	return this.root;
},

//>	@method	tree.setRoot()
//
// Set the root node of the tree. 
//
// @param   newRoot (TreeNode)    new root node
// @param   autoOpen (boolean)  set to true to automatically open the new root node.
//
// @visibility external
//<
setRoot : function (newRoot, autoOpen) {
	// assign the new root
	this.root = newRoot;

    // avoid issues if setRoot() is used to re-root a Tree on one of it's own nodes
    if (newRoot && isc.endsWith(this.parentProperty, this.ID)) newRoot[this.parentProperty] = null;

    // make sure root points to us as it's tree
    this.root[this.treeProperty] = this.ID;

    if (this.rootValue == null) this.rootValue = this.root[this.idField];

    // if the root node has no name, assign the path property to it.  This is for backcompat
    // and also a reasonable default.
    var rootName = this.root[this.nameProperty];    
    if (rootName == null || rootName == isc.emptyString) this.root[this.nameProperty] = this.pathDelim;

    // the root node is always a folder
    if (!this.isFolder(this.root)) this.convertToFolder(this.root);

    // NOTE: this index is permanent, staying with this Tree instance so that additional sets of
    // nodes can be incrementally linked into the existing structure. 
    this.nodeIndex = {};

    // (re)create the structure of the Tree according to the model type
    if ("parent" == this.modelType) {
        // nodes provided as flat list (this.data); each record is expected to have a property
        // which is a globally unique ID (this.idField) and a property which has the globally
        // unique ID of its parent (this.parentIdField).

        // assemble the tree from this.data
        if (this.data) this.linkNodes();
    } else if ("fields" == this.modelType) {
        
        // nodes provided as flat list; a list of fields, in order, defines the Tree
        if (this.data) this.connectByFields();

    } else if ("children" == this.modelType) {
        // each parent has an array of children
        if (this.autoSetupParentLinks) 	this.setupParentLinks();
        if (this.data) {
            var data = this.data;
            this.data = null;
            this.addList(data, this.root);
        }
    } else {
        this.logWarn("Unsupported modelType: " + this.modelType);
    }

	// open the new root if autoOpen: true passed in or this.autoOpenRoot is true.  Suppress
    // autoOpen if autoOpen:false passed in
    if (autoOpen !== false && (this.autoOpenRoot || autoOpen)) {
        this.openFolder(newRoot);
    }
    
    // Slot the root node into nodeIndex
    this.setupParentLinks();

	// mark the tree as dirty and note that the data has changed
	this._clearNodeCache();
	this.dataChanged();
},

// get a copy of these nodes without all the properties the Tree scribbles on them.
// Note the intent here is that children should in fact be serialized unless the caller has
// explicitly trimmed them.
getCleanNodeData : function (nodeList, includeChildren, cleanChildren, includeLoadState) {
    if (nodeList == null) return null;

    var nodes = [], wasSingular = false;
    if (!isc.isAn.Array(nodeList)) {
        nodeList = [nodeList];
        wasSingular = true;
    }

    // known imperfections:
    // - by default, isFolderProperty is "isFolder", we write this into nodes and sent it when
    //   saving
    // - we create empty children arrays for childless nodes, and save them

    for (var i = 0; i < nodeList.length; i++) {
        var treeNode = nodeList[i],
            node = {};
        // copy the properties of the tree node, dropping some Tree/TreeGrid artifacts
		for (var propName in treeNode) {
            
			if (propName == this.parentProperty ||
                // currently hardcoded
                (!includeLoadState && propName == "_loadState") ||
                propName == "_isc_tree" ||
                
                propName == "__ref" ||
                // the openProperty and isFolderProperty are documented and settable, and if
                // they've been set should be saved, so only remove these properties if they
                // use the prefix that indicates they've been auto-generated (NOTE: this prefix
                // is obfuscated)
                propName.startsWith("_isOpen_") || 
                propName.startsWith("_isFolder_") || 
                
                // default nameProperty from ResultTree, which by default does not have
                // meaningful node names
                propName.startsWith("__nodePath") || 
                // class of child nodes, set up by ResultTree
                propName == "_derivedChildNodeType" ||
                
                // from selection model
                propName.startsWith("_selection_") ||
                
                // Explicit false passed as 'includeChildren' param.
                (includeChildren == false && propName == this.childrenProperty)) continue;

            node[propName] = treeNode[propName];
   
            // Clean up the children as well (if there are any)
            if (propName == this.childrenProperty && isc.isAn.Array(node[propName])) {
                node[propName] = this.getCleanNodeData(node[propName], false, cleanChildren, includeLoadState);
            }
        }
        nodes.add(node);
    }
    if (wasSingular) return nodes[0];
    return nodes;
},

//
// identity methods -- override these for your custom trees
//

//>	@method	tree.getName()
//
// Get the 'name' of a node.  This is node[+link{Tree.nameProperty}].  If that value has not
// been set on the node, a unique value (within this parent) will be auto-generated and
// returned.
//	
// @param	node	(TreeNode)	node in question
// @return			(string)	name of the node 
//
// @visibility external
//<
_autoName : 0,
getName : function (node) {
    var ns = isc._emptyString;

	if (!node) return ns;
    var name = node[this.nameProperty];
    if (name == null) name = node[this.idField];

    
    if (name == null) {
        // unnamed node: give it a unique name. 
        

        // never assign an autoName to a node not from our tree
        if (!this.isDescendantOf(node, this.root) && node != this.root) return null;

        // assign unique autoNames per tree so we don't get cross-tree name collisions on D&D
        if (!this._autoNameBase) this._autoNameBase = isc.Tree.autoID++ + "_";
        name = this._autoNameBase+this._autoName++;
    }

    // convert to string because we call string methods on this value elsewhere
    if (!isc.isA.String(name)) name = ns+name;
    
    // cache
    node[this.nameProperty] = name;

    return name;
},

//>	@method	tree.getTitle()
//
// Return the title of a node -- the name as it should be presented to the user.  This method
// works as follows:
// <ul>
// <li> If a +link{attr:Tree.titleProperty} is set on the node, the value of that property is
// returned.
// <li> Otherwise, if the +link{attr:Tree.nameProperty} is set on the node, that value is
// returned, minus any trailing +link{attr:Tree.pathDelim}.
// <li> Finally, if none of the above yielded a title, the value of
// +link{attr:Tree.defaultNodeTitle} is returned.
// </ul>
// You can override this method to return the title of your choice for a given node.
// <br><br>
// To override the title for an auto-constructed tree (for example, in a databound TreeGrid),
// override +link{method:TreeGrid.getNodeTitle} instead.
//
// @param node  (TreeNode) node for which the title is being requested
// @return      (string) title to display
//
// @see method:TreeGrid.getNodeTitle
//
// @visibility external
//<
getTitle : function (node) {
	if (!node) return null;
	// if the node has an explicit title, return that
	if (node[this.titleProperty] != null) return node[this.titleProperty];

	// otherwise derive from the name
	var name = node[this.nameProperty];
	if (name == null) name = this.defaultNodeTitle;
	return (isc.endsWith(name, this.pathDelim) 
                ? name.substring(0,name.length-this.pathDelim.length) 
                : name);
},

//>	@method	tree.getPath()
//
// Returns the path of a node - a path has the following format:
// <code>([name][pathDelim]?)*</code>
// <br><br>
// For example, in this tree:
// <pre>
// root
//   foo
//     bar
// </pre>
// Assuming that +link{attr:Tree.pathDelim} is the default <code>/</code>, the <code>bar</code>
// node would have the path <code>root/foo/bar</code> and the path for the <code>foo</code>
// node would be <code>root/foo</code>.
// <br><br>
// Once you have a path to a node, you can call find(path) to retrieve a reference to the node
// later.
//
// @param	node	(TreeNode)	node in question
// @return			(string)	path to the node
//
// @see method:Tree.getParentPath
// @visibility external
//<
getPath : function (node) {
    var parent = this.getParent(node);
    if (parent == null) return this.getName(node);

    var parentName = this.getName(parent);
    return this.getPath(parent) + 
            (parentName == this.pathDelim ? isc.emptyString : this.pathDelim) + 
                this.getName(node);        
},

//>	@method	tree.getParentPath()
//
// Given a node, return the path to it's parent.  This works just like
// +link{method:Tree.getPath} except the node itself is not reported as part of the path.
//
// @param	node	(TreeNode)	node in question
// @return			(string) path to the node's parent
//
// @see method:Tree.getPath
// @visibility external
//<
getParentPath : function (node) {
	// get the node's path
	var name = this.getName(node),
		path = this.getPath(node);
		
	// return the path minus the name of the node
	return path.substring(0, path.length - name.length - this.pathDelim.length);
},

//>	@method	tree.getParent()
//
// Returns the parent of this node.
//
// @param   node    (TreeNode)    node in question
// @return  (node)              parent of this node
//
// @visibility external
//<
getParent : function (node) {
    if (node == null) return null;
	return node[this.parentProperty];
},

//>	@method	tree.getParents()
//
// Given a node, return an array of the node's parents with the immediate parent first.  The
// node itself is not included in the result.  For example, for the following tree:
// <pre>
// root
//   foo
//     bar
// </pre>
// Calling <code>tree.getParents(bar)</code> would return: <code>[foo, root]</code>.  Note that
// the returned array will contain references to the nodes, not the names.
//
// @param   node    (TreeNode)            node in question
// @return          (Array)             array of node's parents
//
// @visibility external
//<
getParents : function (node) {
	var list = [],
		parent = this.getParent(node);
	// while parents exist
	while (parent) {
		// add them to the list
		list.add(parent);
		
		// if the parent is the root, jump out!
		//	this lets us handle subTrees of other trees
		if (parent == this.root) break;
		
		// and get the next parent in the chain
		parent = this.getParent(parent);
	}
	// return the list of parents
	return list;
},

//>	@method	tree.getLevel()	(A)
//
// Return the number of levels deep this node is in the tree.  For example, for this tree:
// <pre>
// root
//   foo
//     bar
// </pre>
// Calling <code>tree.getLevel(bar)</code> will return <code>2</code>. 
// <P>
// Note +link{showRoot} defaults to false so that multiple nodes can be shown at top level.  In
// this case, the top-level nodes still have root as a parent, so have level 1, even though
// they have no visible parents.
//
// @param   node    (TreeNode)    node in question
// @return          (number)    number of parents the node has
//
// @visibility external
//<
getLevel : function (node) {
	return this.getParents(node).length;
},

// Given a node, iterate up the parent chain and return an array containing each level for 
// which the node or its ancestor has a following sibling
// Required for treeGrid connectors
// We could improve performance here by cacheing this information on each node and having this
// method be called recursively on parents rather than iterating through the parents' array
// for every node this method is called on.
_getFollowingSiblingLevels : function (node) {
    var levels = [],
        parents = this.getParents(node),
        level = parents.length;
    // note that parents come back ordered with the root last so iterate through them forwards
    // to iterate up the tree
    for (var i = 0; i < level; i++) {
        var children = this.getChildren(parents[i]);        
        if (children.indexOf(node) != children.length -1) levels.add(level-i);
        node = parents[i];
    }
    return levels;
},

//>	@method	tree.isFolder()
//
// Determines whether a particular node is a folder.  The logic works as follows:<br><br>
// <ul>
// <li> If the +link{TreeNode} has a value for the +link{attr:Tree.isFolderProperty}
// (+link{TreeNode.isFolder} by default) that value is returned.
// <li> Next, the existence of the +link{attr:Tree.childrenProperty} (by default
// +link{TreeNode.children}) is checked on the +link{TreeNode}.  If the node has the children
// property defined (regardless of whether it actually has any children), then isFolder()
// returns true for that node.
// </ul>
// <P>
// You can override this method to provide your own interpretation of what constitutes a folder.
//
// @param	node	(TreeNode)	node in question
// @return			(boolean)	true if the node is a folder
//
// @visibility external
//<
isFolder : function (node) {
    if (node == null) return false;

    // explicit isFolder set
    var isFolder = node[this.isFolderProperty];
    if (isFolder != null) return isFolder;

    // has a children array (may have zero actual children currently, but having a children
    // array is sufficient for us to regard this as a folder).  Note that we scribble the
    // children array on the nodes even in modelTypes other than "children", so this check
    // is correct for other modelTypes as well.
    if (node[this.childrenProperty]) return true;

    // infer folderness from the name of the node
    // XXX 10/13/2005 : this is purposefully not documented.  We have it here for backcompat
    // with trees that may have relied on this, but disclosing this will confuse people -
    // they'll start to think about having to tack on the path delimiter on their nodes to
    // signify folderness, which in turn translates into confusion about when you should or
    // should not supply the slash or give back a trailing slash from e.g. getPath()
    var name = this.getName(node);

    // if there's no name, we have no way of knowing
   	if (name == null) return false;

    // if the last character is the pathDelim, it's a folder.
    return isc.endsWith(name, this.pathDelim);
},

//>	@method	tree.isLeaf()
//
// Returns true if the passed in node is a leaf.
//
// @param   node    (TreeNode)    node in question
// @return          (boolean)   true if the node is a leaf
//
// @visibility external
//<
isLeaf : function (node) {
	return ! this.isFolder(node);
},

//> @method tree.isFirst() (A)
// Note: because this needs to take the sort order into account, it can be EXTREMELY expensive!
// @group ancestry			
// Return true if this item is the first one in it's parents list.
//
// @param  node (TreeNode)  node in question
// @return (boolean)  true == node is the first child of its parent
//<
isFirst : function (node) {
    var parent = this.getParent(node);
    if (! parent) return true;
    
    var kids = this.getChildren(parent, this.opendisplayNodeType, 
        this._openNormalizer, this.sortDirection, null, this._sortContext);
    return kids[0] == node;
},

//>	@method	tree.isLast()	(A)
// 		Note: because this needs to take the sort order into account, it can be EXTREMELY expensive!
//		@group	ancestry			
//			Return true if this item is the last one in it's parents list.
//
//		@param	node	(TreeNode)	node in question
//		@return			(boolean)	true == node is the last child of its parent
//<
isLast : function (node) {
	var parent = this.getParent(node);
	if (! parent) return true;
    
	var kids = this.getChildren(parent, this.opendisplayNodeType, 
            this._openNormalizer, this.sortDirection, null, this._sortContext);
	return kids[kids.length-1] == node;
},


//
//	finding a node
//

//>	@method	tree.findById()	(A)
//
// Find the node with the specified ID.  Specifically, it returns the node whose idField
// matches the id passed to this method. If the tree is using the "parent" modelType, this
// lookup will be constant-time.  For all other modelTypes, the tree will be searched
// recursively.
//
// @group   location
// @param   id (string)    ID of the node to return.
// @return  (object)       node with appropriate ID, or null if not found.
//
// @see attr:Tree.idField
// @see method:Tree.find
//
// @visibility external
//<
findById : function (id) {
    return this.find(this.idField, id);
},


//>	@method	tree.find()
//
// Find a node within this tree using a string path or by attribute value(s).  This method can be
// called with 1 or 2 arguments. If a single String
// argument is supplied, the value of the argument is treated as the path to the node.  If a 
// single argument of type Object is provided, it is treated as a set of field name/value 
// pairs to search for (see +link{List.find}).
// <br>
// If 2 arguments are supplied, this method will treat the first argument as a fieldName, and
// return the first node encountered where <code>node[fieldName]</code> matches the second 
// argument.  So for example, given this tree:
// <pre>
// foo
//   zoo
//     bar
//   moo
//     bar
// </pre>
// Assuming your +link{attr:Tree.pathDelim} is the default <code>/</code> and <code>foo</code>
// is the name of the root node, then
// <code>tree.find("foo/moo/bar")</code> would return the <code>bar</code> node under the
// <code>moo</code> node.
// <br><br>
// <code>tree.find("name", "bar")</code> would return the first <code>bar</code> node because
// it is the first one in the list whose <code>name</code> (default value of
// +link{attr:Tree.nameProperty}) property matches the value
// <code>bar</code>.  The two argument usage is generally more interesting when your tree nodes
// have some custom unique property that you wish to search on.  For example if your tree nodes
// had a unique field called "UID", their serialized form would look something like this:
// <pre>
// { name: "foo", children: [...], UID:"someUniqueId"}
// </pre> 
// You could then call <code>tree.find("UID", "someUniqueId")</code> to find that node.  Note
// that the value doesn't have to be a string - it can be any valid JS value, but since this
// data generally comes from the server, the typical types are string, number, and boolean.
// <br><br>
// The usage where you pass a single object is interesting when your tree nodes have a number
// of custom properties that you want to search for in combination.  Say your tree nodes had 
// properties for "color" and "shape"; <code>tree.find({color: "green", shape: "circle"})</code>
// would return the first node in the tree where both properties matched.
// <br><br>
// When searching by path, trailing path delimiters are ignored.  So for example
// <code>tree.find("foo/zoo/bar")</code> is equivalent to
// <code>tree.find("foo/zoo/bar/")</code>
// 
// @group location			
// @param fieldNameOrPath   (string)    Either the path to the node to be found, or the name of
//                                      a field which should match the value passed as a second
//                                      parameter
// @param [value]          (any)     If specified, this is the desired value for the 
//                                   appropriate field
// @return (object) the node matching the supplied criteria or null if not found
//
// @see attr:Tree.root
// @see attr:Tree.pathDelim
// @see attr:Tree.nameProperty
//
// @visibility external
//<
// NOTE: This should be a good generic implemention, try overriding findChildNum instead.
find : function (fieldName, value) {

    var undef;
    if (value === undef && isc.isA.String(fieldName)) return this._findByPath(fieldName);
    
    if (value !== undef) {
        // constant time lookup when we have nodeIndex
        if (fieldName == this.idField) return this.nodeIndex[value];
        // special-case root, which may not appear in getDescendants() depending on this.showRoot
        if (this.root[fieldName] == value) return this.root;
        // Use 'getDescendants()' to retrieve both open and closed nodes.
        return this.getDescendants().find(fieldName, value);
    } else {
        // fieldName is an Object, so use the multi-property option of List.find()
        var searchList = this.getDescendants();
        searchList.add(this.root);
        return searchList.find(fieldName);
    }
    
},

findAll : function (fieldName, value) {
    // Use 'getDescendants()' to retrieve both open and closed nodes.
    return this.getDescendants().findAll(fieldName, value);
},

// Find a node within this tree by path.
_findByPath : function (path) {

    
    
    // return early for cases of referring to just root
	if (path == this.pathDelim) return this.root;
	var rootPath = this.getPath(this.root);
    if (path == rootPath) return this.root;
    
	var node = this.root,
        lastDelimPosition = 0,
        delimLength = this.pathDelim.length;

    // if the path starts with a references to root, start beyond it
    if (isc.startsWith(path, rootPath)) {
		lastDelimPosition = rootPath.length;
    } else if (isc.startsWith(path, this.pathDelim)) {
        lastDelimPosition += delimLength;
    }
		
    //this.logWarn("path: " + path);

	while (true) {
		var delimPosition = path.indexOf(this.pathDelim, lastDelimPosition);

        //this.logWarn("delimPosition: " + delimPosition);

		// skip over two delims in a row (eg "//") and trailing (single) delimeter
		if (delimPosition == lastDelimPosition) {
            //this.logWarn("extra delimeter at: " + delimPosition);
            lastDelimPosition += delimLength;
            continue;
        }

        var moreDelims = (delimPosition != -1),
    		// name of the child to look for at this level
            name = path.substring(lastDelimPosition, moreDelims ? delimPosition : path.length),
		    // find the node number of that child
		    nodeNum = this.findChildNum(node, name);

        //this.logWarn("name: " + name);

		if (nodeNum == -1) return null;

		node = node[this.childrenProperty][nodeNum];

        // if there are no more delimeters we're done
        if (!moreDelims) return node;

		// advance the lastDelimiter
		lastDelimPosition = delimPosition + delimLength;
		
		// if we got all the way to the end of the path, we're done:  return the node
		if (lastDelimPosition == path.length) return node;			
	}
},

//>	@method	tree.findChildNum()	(A)
//		@group	location			
//			Given a parent and the name of a child, return the number of that child.
//
// 		Note: names of folder nodes will have pathDelim stuck to the end
//
//		@param	parent	(TreeNode)	parent node
//		@param	name	(string)	name of the child node to find
//		@return			(number)	index number of the child, -1 if not found
//<
findChildNum : function (parent, name) {
	var children = this.getChildren(parent);

	if (children == null) return -1;
    if (name == null) return -1;

    var length = children.getLength(),
        nameHasDelim = isc.endsWith(name, this.pathDelim),
        delimLength = this.pathDelim.length
    ;
	for (var i = 0; i < length; i++) {
        
        var childName = this.getName(children.get(i)),
            lengthDiff = childName.length - name.length;

        if (lengthDiff == 0 && childName == name) return i;

        if (lengthDiff == delimLength) {
            // match if childName has trailing delim and name does not
            if (isc.startsWith(childName, name) &&
                isc.endsWith(childName, this.pathDelim) && !nameHasDelim)
            {
                return i;
            }
        } else if (nameHasDelim && lengthDiff == -delimLength) {
            // match if name has trailing delim and childName does not
            if (isc.startsWith(name, childName)) return i;
        }
	}

	// not found, return -1
	return -1;
},

//>	@method	tree.getChildren()
//
// Returns all children of a node.  If the node is a leaf, this method returns null.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet} rather than a simple 
// array - so it's important to access the return value using the +link{interface:List} 
// interface instead of as a native Javascript Array.
//
// @param node (TreeNode) The node whose children you want to fetch.
// @return (List)       List of children for the node (empty List if node is a leaf
//                      or has no children)
//
// @visibility external
//<

getChildren : function (parentNode, displayNodeType, normalizer, sortDirection,
                        criteria, context, returnNulls) {
    
    // If separateFolders is true, we need to have an openNormalizer so we can sort/separate
    // leaves and folders
    // This will not actually mark the tree as sorted by any property since we're not setting up
    // a sortProp.
    
    if (normalizer == null && this._openNormalizer == null && this.separateFolders) {
        this.sortByProperty();
    }
    
	if (parentNode == null) parentNode = this.root;

	// if we're passed a leaf, it has no children, return empty array
	if (this.isLeaf(parentNode)) return null;
	
	// if the parentNode doesn't have a child array, create one
	if (parentNode[this.childrenProperty] == null) {
	    if (returnNulls) return null;
        var children = [];
        parentNode[this.childrenProperty] = children;
        // just return the new empty children array
        return children;
    }
	
	var list = parentNode[this.childrenProperty],
        subset;
        
	// if a criteria was passed in, remove all items that don't pass the criteria
	if (criteria) {
        subset = [];

		for (var i = 0, length = list.length; i < length; i++) {
			var childNode = list[i];

    		// CALLBACK API:  available variables:  "node,parent,tree"
            if (this.fireCallback(criteria, "node,parent,tree", [childNode, parentNode, this]))
                subset[subset.length] = childNode;
		}

		list = subset;
	}

	// reduce the list if a displayNodeType was specified
	//	
	//	if only folders were specified, get the subset that are folders
	if (displayNodeType == isc.Tree.FOLDERS_ONLY) {
		subset = [];
		for (var i = 0, length = list.length; i < length; i++) {
			if (this.isFolder(list[i])) subset[subset.length] = list[i];
		}
	//	if only leaves were specified, get the subset that are leaves
	} else if (displayNodeType == isc.Tree.LEAVES_ONLY) {
		subset = [];
		for (var i = 0, length = list.length; i < length; i++) {
			if (this.isLeaf(list[i])) subset[subset.length] = list[i];
		}
	// otherwise return the entire list (folders and leaves)
	} else {
		subset = list;
	}
	// if a normalizer is specified, sort before returning
	if (normalizer) {
        
        
        if  (// we're not in a grouped LG OR
                !this._groupByField || 
            // the special 'alwaysSortGroupHeaders' flag is set (indicating group headers have
            // multiple meaningful field values, as when we show summaries in headers) OR
                this.alwaysSortGroupHeaders ||
            // we're not sorting on the _groupByField and this isn't a group-node OR
                (this._groupByField != this.sortProp && parentNode != this.getRoot()) ||
            // we're sorting the group-nodes and the sort-field IS the _groupByField
                (this._groupByField == this.sortProp && parentNode == this.getRoot()) )
        {
            subset.sortByProperty(this.sortProp, sortDirection, normalizer, context);
        }
	}

	return subset;
},

//>	@method	tree.getFolders()
//
// Returns all the first-level folders of a node.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet},
// so it's important to access the return value using the +link{interface:List} interface
// instead of as a native Javascript Array.
//
// @param   node    (TreeNode)    node in question
// @return  (List)              List of immediate children that are folders
//
// @visibility external
//<

getFolders : function (node, normalizer, sortDirection, criteria, context) {
	return this.getChildren(node, isc.Tree.FOLDERS_ONLY, normalizer, sortDirection, criteria, 
                        context);
},

//>	@method	tree.getLeaves()
//
// Return all the first-level leaves of a node.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet},
// so it's important to access the return value using the +link{interface:List} interface
// instead of as a native Javascript Array.
//
// @param   node    (TreeNode)    node in question
// @return          (List)      List of immediate children that are leaves.
//
// @visibility external
//<

getLeaves : function (node, normalizer, sortDirection, criteria, context) {
	return this.getChildren(node, isc.Tree.LEAVES_ONLY, normalizer, sortDirection, criteria, 
                            context);
},

//> @method Tree.getLevelNodes()
// Get all nodes of a certain depth within the tree, optionally starting from
// a specific node.  Level 0 means the immediate children of the passed node,
// so if no node is passed, level 0 is the children of root
// @param depth (integer) level of the tree
// @param [node] (TreeNode) option node to start from
// @return (Array of TreeNode)
//<
getLevelNodes : function (depth, node) {

    if (this.indexByLevel && (node == null || node == this.getRoot())) {
        return this._levelNodes[depth] || [];
    } else {
        if (!node) node = this.getRoot();
        var children = this.getChildren(node);
       
        if (depth == 0) return children;
        var result = [];
        if (!children) return result;
        for (var i = 0; i < children.length; i++) {
            var nestedChildren = this.getLevelNodes(depth-1, children[i]);
            if (nestedChildren) result.addList(nestedChildren);
        }
        return result;
    }
}, 

getDepth : function () {
    if (this._levelNodes) return this._levelNodes.length;
    return null;
},

//>	@method	tree.hasChildren()
//
// Returns true if this node has any children.
//
// @param	node			(TreeNode)			node in question
// @return					(boolean)			true if the node has children
//
// @visibility external
//<

hasChildren : function (node, displayNodeType) {
	var children = this.getChildren(node, displayNodeType);
	return children != null && children.length > 0;
},

//>	@method	tree.hasFolders()
//
// Return true if this this node has any children that are folders.
//
// @param	node	(TreeNode)	node in question
// @return         (boolean)   true if the node has children that are folders
//
// @visibility external
//<
hasFolders : function (node) {
	return this.hasChildren(node, isc.Tree.FOLDERS_ONLY);
},

//>	@method	tree.hasLeaves()
//
//  Return whether this node has any children that are leaves.
//
//	@param	node	(TreeNode)	node in question
//	@return			(boolean)   true if the node has children that are leaves
//
// @visibility external
//<
hasLeaves : function (node) {
	return this.hasChildren(node, isc.Tree.LEAVES_ONLY);
},


//>	@method	tree.isDescendantOf()
//			Is one node a descendant of the other?
//
//		@param	child	(TreeNode)	child node
//		@param	parent	(TreeNode)	parent node
//		@return			(boolean)	true == parent is an ancestor of child
// @visibility external
//<
isDescendantOf : function (child, parent) {
    if (child == parent) return false;
    var nextParent = child;
    while (nextParent != null) {
        if (nextParent == parent) return true;
        nextParent = nextParent[this.parentProperty];
    }
    return false;
},

//>	@method	tree.getDescendants()
//
// Returns the list of all descendants of a node.  Note: this method can be very slow,
// especially on large trees because it assembles a list of all descendants recursively.
// Generally, +link{method:Tree.find} in combination with +link{method:Tree.getChildren} will
// be much faster.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet},
// so it's important to access the return value using the +link{interface:List} interface
// instead of as a native Javascript Array.
//
// @param   [node]  (TreeNode)    node in question (the root node is assumed if none is specified)
// @return  (List)              List of descendants of the node.
//
// @visibility external
//<

getDescendants : function (node, displayNodeType, condition) {
	if (!node) node = this.root;
	
	// create an array to hold the descendants
	var list = [];
	
	// if condition wasn't passed in, set it to an always true condition
    // XXX convert this to a function if a string, similar to getChildren()
	if (!condition) condition = function(){return true};
	
	// if the node is a leaf, return the empty list
	if (this.isLeaf(node)) return list;
	
	// iterate through all the children of the node
	// Note that this can't depend on getChildren() to subset the nodes,
	//	because a folder may have children that meet the criteria but not meet the criteria itself.
	var children = this.getChildren(node);
	if (!children) return list;
	
	// for each child
	for (var i = 0, length = children.length, child; i < length; i++) {
		// get a pointer to the child
		child = children[i];
		
		// if that child is a folder
		if (this.isFolder(child)) {
			// if we're not exluding folders, add the child
			if (displayNodeType != isc.Tree.LEAVES_ONLY && condition(child))
				list[list.length] = child;
				
			// now concatenate the list with the descendants of the child
			list = list.concat(this.getDescendants(child, displayNodeType, condition));
		
		} else {
			// if we're not excluding leaves, add the leaf to the list
			if (displayNodeType != isc.Tree.FOLDERS_ONLY && condition(child)) {
				list[list.length] = child;
			}
		}
	}
	// finally, return the entire list
	return list;
},

//>	@method	tree.getDescendantFolders()
//
// Returns the list of all descendants of a node that are folders.  This works just like
// +link{method:Tree.getDescendants}, except leaf nodes are not part of the returned list.
// Like +link{method:Tree.getDescendants}, this method can be very slow for large trees.
// Generally, +link{method:Tree.find} in combination with +link{method:Tree.getFolders} 
// will be much faster.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet},
// so it's important to access the return value using the +link{interface:List} interface
// instead of as a native Javascript Array.
//
// @param   [node]      (TreeNode)	node in question (the root node is assumed if none is specified)
// @return  (List)	    List of descendants of the node that are folders.
//
// @visibility external
//<

getDescendantFolders : function (node, condition) {
	 return this.getDescendants(node, isc.Tree.FOLDERS_ONLY, condition)
},
//>	@method	tree.getDescendantLeaves()
//
// Returns the list of all descendants of a node that are leaves.  This works just like
// +link{method:Tree.getDescendants}, except folders are not part of the returned list.
// Folders are still recursed into, just not returned.  Like +link{method:Tree.getDescendants},
// this method can be very slow for large trees.  Generally, +link{method:Tree.find} in
// combination with +link{method:Tree.getLeaves} will be much faster.
// <br><br>
// For load on demand trees (those that only have a partial representation client-side), this
// method will return only nodes that have already been loaded from the server.  Furthermore,
// for databound trees the return value will be a +link{class:ResultSet},
// so it's important to access the return value using the +link{interface:List} interface
// instead of as a native Javascript Array.
//
// @param   [node]      (TreeNode)	node in question (the root node is assumed if none specified)
// @return  (List)	    List of descendants of the node that are leaves.
//
// @visibility external
//<

getDescendantLeaves : function (node, condition) {
	return this.getDescendants(node, isc.Tree.LEAVES_ONLY, condition)
},


//>	@method	tree.dataChanged()	(A)
//
// Called when the structure of this tree is changed in any way.  Intended to be observed.
// <br><br>
// Note that on a big change (many items being added or deleted) this may be called multiple times
//
// @visibility external
//<
dataChanged : function () {},


//
// adding nodes
//

//> @groupDef sharingNodes
//
// For local Trees, that is, Trees that don't use load on demand, SmartClient supports setting
// up the Tree structure by setting properties such as "childrenProperty", directly on data
// nodes.  This allows for simpler, faster structures for many common tree uses, but can create
// confusion if nodes need to be shared across Trees.
// <P>
// <b>using one node in two places in one Tree</b>
// <P>
// To do this, either clone the shared node like so:<pre>
//
//     tree.add(isc.addProperties({}, sharedNode));
//
// </pre> or place the shared data in a shared subobject instead.
// <P>
// <b>sharing nodes or subtrees across Trees</b>
// <P>
// Individual nodes within differing tree structures can be shared by two Trees only if
// +link{Tree.nameProperty}, +link{Tree.childrenProperty}, and +link{Tree.openProperty} have
// different values in each Tree.
// <P>
// As a special case of this, two Trees can maintain different open state across a single
// read-only structure as long as just "openProperty" has a different value in each Tree.
//
// @title Sharing Nodes
// @visibility external
//<
 

//>	@method	tree.add()
//
// Add a single node under the specified parent
//
// @param	node		(TreeNode)	node to add
// @param	parent		(String or TreeNode)	Parent of the node being added.  You can pass
//                                          in either the +link{TreeNode} itself, or a path to
//	                                        the node (as a String), in which case a
//	                                        +link{method:Tree.find} is performed to find
//	                                        the node. 
// @param	[position]	(number)	Position of the new node in the children list. If not
//	                                specified, the node will be added at the end of the list.
// @return (TreeNode or null) The added node. Will return null if the node was not added (typically
//    because the specified <code>parent</code> could not be found in the tree).
//
// @see group:sharingNodes
// @see method:Tree.addList
// @visibility external
//<
// Note: the node passed in is directly integrated into the tree, so you will see properties
// written onto it, etc. We may want to duplicate it before adding, then return a pointer
// to the node as added.
add : function (node, parent, position) {
    if (parent == null && this.modelType == isc.Tree.PARENT) {
        var parentId = node[this.parentIdField];
        if (parentId != null) parent = this.findById(parentId);
    }
	// normalize the parent parameter into a node
	if (isc.isA.String(parent)) {
        parent = this.find(parent);
    } else if (!this.getParent(parent) && parent !== this.getRoot()) {
        // if parent is not in the tree, bail
        isc.logWarn('Tree.add(): specified parent node:' + this.echo(parent) +
                    ' is not in the tree, returning');
        return null;
    }
	// if the parent wasn't found, return null
	// XXX note that we could actually add to the root, but that's probably not what you want
	if (! parent) {
		// get the parentName of the node
		var parentPath = this.getParentPath(node);
		if (parentPath) parent = this.find(parentPath);
		if (! parent) return null;
	}

    this._add(node, parent, position);

	this._clearNodeCache(true);
		
	// call the dataChanged method
	this.dataChanged();    
    
    return node;
},

_reportCollision : function (ID) {
    if (this.reportCollisions) {
        this.logWarn("Adding node to tree with id property set to:"+ ID + 
            ". A node with this ID is already present in this Tree - that node will be " +
            "replaced. Note that this warning may be disabled by setting the " + 
            "reportCollisions attribute to false.");
    }
},

// internal interface, used by linkNodes, addList, and any other place where we are adding a
// batch of new nodes to the Tree.  This implementation doesn't call _clearNodeCache() or
// dataChanged() and assumes you passed in the parent node as a node object, not a string.
_add : function (node, parent, position) {
    var ID = node[this.idField];
    if (ID != null && this.modelType == isc.Tree.PARENT) {
        // note: in modelType:"children", while we do maintain a nodeIndex, an idField is not
        // required and there tree does not depend on globally unique ids
        var collision = this.findById(ID);
        if (collision) {
            this._reportCollision(ID);
            this.remove(collision);
        }
    }
    
    // convert name to a string - we rely on this fact in getTitle() and possibly other
    // places.  Also, ultimately getName() will convert it to a string anyway and at that
    // point, if new values are not strings from the start, sorting won't work as expected (the
    // non-strings will be segregated from the strings).
    this.getName(node);

	// convert the parent node to a folder if necessary
    this.convertToFolder(parent);
	var children = parent[this.childrenProperty];
    if (!children) children = parent[this.childrenProperty] = [];

    // if the children attr contains a single object, assume it to be a single child of
    // the node.    
    
    if (children != null && !isc.isAn.Array(children)) 
        parent[this.childrenProperty] = children = [children];

	// if position wasn't specified, set it the last item.
    // NOTE: specifying position > children.length is technically wrong but happens easily with
    // a remove followed by an add
	if (position == null || position > children.length) {
        children.add(node);
    } else {
    	// add the node to the parent - addAt is slower, so only do this if you position was
        // passed in
	    children.addAt(node, position);
    }

    // parentId-based loading can be used without the parentId
    // appearing in the child nodes, for example, if loading nodes from a large XML structure, 
    // we may use the parentId to store the XPath to the parent, and load children via accessing
    // the parentElement.childNodes Array.
    //
    // set the parentId on the node if it isn't set already
    var idField = this.idField
    // just do this unconditionally - it doesn't make sense for the parentId field of the child
    // not to match the idField of the parent.
    node[this.parentIdField] = parent[idField];
	// link to the parent
	node[this.parentProperty] = parent;
    // link to the Tree (by String ID, not direct pointer)
	node[this.treeProperty] = this.ID;
	
    // update nodeIndex 
    // if we don't do a null check there are cases where null values get added into the 
    // nodeIndex and children get added to the wrong parent, i.e. when using autoFetch and 
    // modeltype 'children' within a treegrid. 
    if (node[idField] != null) this.nodeIndex[node[idField]] = node;

    // current assumption whenever loading subtrees is that if any
    // children are returned for a node, it's the complete set, and the node is marked "loaded"
    this.setLoadState(parent, isc.Tree.LOADED);
    
    this._addToLevelCache(node, parent, position)

	// if the node has children, recursively add them to the node - this ensures that their
    // parent link is set up correctly
    var grandChildren = node[this.childrenProperty];
    if (grandChildren != null) {
		node[this.childrenProperty] = [];
        // handle children being specified as a single element recursively.
        // _add will slot the element into the new children array.
        if (!isc.isAn.Array(grandChildren)) this._add(grandChildren, node);
        else if (grandChildren.length > 0) this._addList(grandChildren, node);
        
        // if a children array is present, mark the node as loaded even if the children array
        // is empty - this is a way of indicating an empty folder in XML or JSON results
        this.setLoadState(node, isc.Tree.LOADED);

	} else {
        // canonicalize the isFolder flag on the node
        var isFolder = node[this.isFolderProperty];
        
        // convert to boolean
        if (isFolder != null && !isc.isA.Boolean(isFolder)) 
            isFolder = isc.booleanValue(isFolder, true);

        // ResultTree nodes that don't specify isFolder default to isFolder: true,
        // But Trees work exactly the opposite way
        if (isFolder == null && this.defaultIsFolder) isFolder = true;
        node[this.isFolderProperty] = isFolder;
    }
},	

_addToLevelCache : function (nodes, parent, position) {
    if (!this.indexByLevel) return;

    var level = this.getLevel(parent);
    if (!this._levelNodes[level]) this._levelNodes[level] = [];
    var levelNodes = this._levelNodes[level];

    // Special case - array is empty, just add the node to the end
    if (levelNodes.length == 0) {
        if (!isc.isAn.Array(nodes)) {
            levelNodes.push(nodes);
        } else {
            levelNodes.concat(nodes);
        }
    } else {
        // Make sure none of these nodes is already cached
        if (!isc.isAn.Array(nodes)) {
            if (levelNodes.contains(nodes)) return;
        } else {
            var cleanNodes = [];
            for (var j = 0; j < nodes.length; j++) {
                if (!levelNodes.contains(nodes[j])) {
                    cleanNodes.push(nodes[j]);
                }
            }
        }
        // Slot the node(s) into the level cache at the correct position
        var startedThisParent = false,
            siblingCount = 0,
            i = 0;
        for (i; i < levelNodes.length; i++) {
            if (this.getParent(levelNodes[i]) == parent) {
                startedThisParent = true;
            } else if (startedThisParent) {
                break;
            } else {
                continue;
            }
            // Exact equality is important - position 0 means first, position null means last
            if (siblingCount === position) {
                break;
            }
            siblingCount++;
        }
        
        if (!isc.isAn.Array(nodes)) {
            levelNodes.splice(i, 0, nodes);
        } else {
            // Using concat() because splice, push and unshift all insert the array itself,
            // not the array's contents, and a solution involving a Javascript loop would 
            // presumably cause far more churn in the array than passing everything in a 
            // single native call and letting the browser deal with it
            if (i == 0) {
                this._levelNodes[level] = cleanNodes.concat(levelNodes);
            } else if (i == levelNodes.length) {
                this._levelNodes[level] = levelNodes.concat(cleanNodes);
            } else {
                this._levelNodes[level] = 
                            levelNodes.slice(0, i).concat(cleanNodes, levelNodes.slice(i));
            }
        }
    }
},

//>	@method	tree.addList()
//
// Add a list of nodes to some parent.
//
// @param   nodeList      (List of TreeNode) The list of nodes to add
// @param	parent		(String or TreeNode)	Parent of the nodes being added.  You can pass
//                                          in either the +link{TreeNode} itself, or a path to
//	                                        the node (as a String), in which case a
//	                                        +link{method:Tree.find} is performed to find
//	                                        the node. 
// @param	[position]	(number)	Position of the new nodes in the children list. If not
//	                                specified, the nodes will be added at the end of the list.
// @return	(List)	List of added nodes.
//
// @see group:sharingNodes
// @visibility external
//<
addList : function (nodeList, parent, position) {
	// normalize the parent property into a node
	if (isc.isA.String(parent)) parent = this.find(parent);

	// if the parent wasn't found, return null
	if (!parent) return false;

    this._addList(nodeList, parent, position);

    this._clearNodeCache(true);
    this.dataChanged(); 

    return nodeList;
},

_addList : function (nodeList, parent, position) {
	// simply call add repeatedly for each child
	for (var i = 0, length = nodeList.length; i < length; i++) {
		this._add(nodeList[i], parent, position != null ? position++ : null);
    }
},


// Structural changes
// --------------------------------------------------------------------------------------------

//>	@method	tree.move()
//
// Moves the specified node to a new parent.
//
// @param	node		(TreeNode)	node to move
// @param	newParent	(TreeNode)	new parent to move the node to
// @param	[position]	(number)	Position of the new node in the children list. If not
//	                                specified, the node will be added at the end of the list.
// @visibility external
//<
move : function (node, newParent, position) {
    this.moveList([node], newParent, position);
},


//>	@method	tree.moveList()
//			Move a list of nodes under a new parent.
//
//		@group	dataChanges			
//
//		@param	nodeList	(List of TreeNode)	list of nodes to move
//		@param	newParent	(TreeNode)	new parent node
//		@param	[position]	(number)	position to place new nodes at.  
//										If not specified, it'll go at the end
//<
moveList : function (nodeList, newParent, position) {
    var node = nodeList[0],
        oldParent = this.getParent(node),
        oldPosition = this.getChildren(oldParent).indexOf(node);

	// remove the nodes from their old parents
	this.removeList(nodeList);
	
    // the nodes may be moving within their own parent
    if (newParent == oldParent && nodeList.length == 1) {
        // if there's exactly one node moving, and it moved later in the list, reduce the
        // insertion point by one to compensate for the node's removal
        if (position > oldPosition) position--;
    } else {
        // otherwise just make sure that if the parent's child list has shortened because some
        // nodes from this parent were removed, we don't leave gaps.   
        
        var children = this.getChildren(newParent);
        if (children && position > children.length) position = children.length;
    }

	// add the nodes to the new parent
	this.addList(nodeList, newParent, position);
	// call the dataChanged method to notify anyone who's observing it
	this.dataChanged();
},

//>	@method	tree.remove()
//
// Removes a node, along with all its children.
//
// @param	node	(TreeNode)	node to remove
// @return			(boolean)	true if the tree was changed as a result of this call
//
// @visibility external
//<
remove : function (node, noDataChanged) {
	// get the parent of the node
	var parent = this.getParent(node);
	if (! parent) return false;
	
//    this.logWarn("removing: " + isc.Log.echoAll(node) + " from: " + isc.Log.echoAll(parent));

	// get the children list of the parent and the name of the node
	var children = this.getChildren(parent);
	if (! children) return false;
	
	// figure out the child number
    if (children.remove(node)) {
        // remove from nodeIndex
        delete this.nodeIndex[node[this.idField]];
        
        // this can be expensive if we're called iteratively for a large set of nodes  -
        // e.g. via removeList, so consult noDataChanged flag
        if (!noDataChanged) {
    		// mark the entire tree as dirty
	    	this._clearNodeCache(true);
		    // call the dataChanged method to notify anyone who's observing it
    		this.dataChanged();
        }
        
        // Recursively remove the node's children from the node index.  We do this rather 
        // than call remove() because we don't want to remove the children from the node
        // itself, just from the tree's cache
        this.removeChildrenFromNodeIndex(node);
        
        this._removeFromLevelCache(node);

        return true;
	}
	
    return false;
},

removeChildrenFromNodeIndex : function (node) {
    var children = this.getChildren(node, null, null, null, null, null, true);
    if (!children) return;
    for (var i = 0; i < children.length; i++) {
            this.removeChildrenFromNodeIndex(children[i]);
        delete this.nodeIndex[children[i][this.idField]];
    }
},

//>	@method	tree.removeList()
//
// Remove a list of nodes (not necessarily from the same parent), and all children of those nodes.
//			
// @param	nodeList	(List of TreeNode)	list of nodes to remove
// @return				(boolean)	true if the tree was changed as a result of this call
// 
// @visibility external
//<
removeList : function (nodeList) {

    // this is our return value
    var changed = false;

	// simply call remove for each node that was removed
    
    // we can be passed the result of tree.getChildren() - if that happens, then remove() will
    // operate on the same array that we're iterating over, which means nodeList will shrink as
    // we iterate, so count down from nodeList.length instead of counting up
    for (var length = nodeList.length-1, i = length; i >= 0; i--) {
        if(this.remove(nodeList[i], true)) changed = true;
    }
		
	// call the dataChanged method to notify anyone who's observing it
	if (changed) {
        this._clearNodeCache(true);
        this.dataChanged();
    }

    return changed;
},

_removeFromLevelCache : function (node, level) {
    if (!this.indexByLevel) return;
    
    level = level || this.getLevel(node) - 1;
    
    // Remove index entries for descendants first
    var nodeChildren = this.getChildren(node);
    if (nodeChildren) {
        for (var i = 0; i < nodeChildren.length; i++) {
            this._removeFromLevelCache(nodeChildren[i], level + 1);
        }
    }
    
    if (this._levelNodes[level]) {
        var levelNodes = this._levelNodes[level];
        for (var i = 0; i < levelNodes.length; i++) {
            if (levelNodes[i] == node) {
                levelNodes.splice(i, 1);
                break;
            }
        }
    }
},


// Loading and unloading of children
// --------------------------------------------------------------------------------------------


//>	@method	tree.getLoadState()
// What is the loadState of a given folder?
//
// @param node (TreeNode) folder in question
// @return (LoadState) state of the node
// @group loadState			
// @visibility external
//<
getLoadState : function (node) {
	if (!node) return null;
	if (!node._loadState) return this.defaultLoadState;
	return node._loadState;
},

//>	@method	tree.isLoaded()
// For a databound tree, has this folder either already loaded its children or is it in the
// process of loading them.
//
// @param node (TreeNode) folder in question
// @return (boolean) folder is loaded or is currently loading
// @group loadState
// @visibility external
//<
isLoaded : function (node) {
    var loadState = this.getLoadState(node);
	return (loadState == isc.Tree.LOADED || loadState == isc.Tree.LOADING);
},

//>	@method	tree.setLoadState()
// Set the load state of a particular node.
// @group loadState			
// @param node (TreeNode) node in question
// @param newState (string) new state to set to
// @return (boolean) folder is loaded or is currently loading
//<
setLoadState : function (node, newState) {
	node._loadState = newState;
},

//>	@method	tree.loadRootChildren()
//			Load the root node's children.
//			Broken out into a special function so you can override more cleanly
// 				(default implementation just calls loadChildren)
//      @param  [callback]  (callback) StringMethod to fire when loadChildren() has loaded data.
//		@group	loadState			
//<
loadRootChildren : function (callback) {
	this.loadChildren(this.root, callback);
},

//>	@method	tree.loadChildren()
// Load the children of a given node.
// <P>
// For a databound tree this will trigger a fetch against the Tree's DataSource.
//
//
// @param node	(TreeNode)	node in question
// @param [callback] (callback) Optional callback (stringMethod) to fire when loading 
//                      completes. Has a single param <code>node</code> - the node whose 
//                      children have been loaded, and is fired in the scope of the Tree.
// @group loadState			
// @visibility external
//<
loadChildren : function (node, callback) {
	if (!node) node = this.root;

	// mark the node as loaded
	this.setLoadState(node, isc.Tree.LOADED);
    if (callback) {
        //Fire the callback in the scope of this tree
        this.fireCallback(callback, "node", [node], this);
    }
},

//>	@method	tree.unloadChildren()
// Unload the children of a folder, returning the folder to the "unloaded" state.
//
// @param node (TreeNode) folder in question
// @group loadState			
// @visibility external
//<
// NOTE internal parameter:	[displayNodeType]	(DisplayNodeType)	Type of children to drop
unloadChildren : function (node, displayNodeType) {
    if (this.isLeaf(node)) return;
    
    var droppedChildren;
	if (displayNodeType == isc.Tree.LEAVES_ONLY) {
        // set the children array to just the folders
        droppedChildren = this.getLeaves(node);
        node[this.childrenProperty] = this.getFolders(node);
		// and mark the node as only the folders are loaded
		this.setLoadState(node, isc.Tree.FOLDERS_LOADED);
	} else {
        // clear out the children Array
        droppedChildren = node[this.childrenProperty];
        node[this.childrenProperty] = [];
		// and mark the node as unloaded
		this.setLoadState(node, isc.Tree.UNLOADED);
	}

    // take the droppedChildren out of the node index
    // NOTE: we shouldn't just call remove() to do this.  unloadChildren() is essentially
    // discarding cache, whereas calling remove() in a dataBound tree would actually kick off a
    // DataSource "remove" operation
    if (droppedChildren) {
        for (var i = 0; i < droppedChildren.length; i++) {
            var node = droppedChildren[i];
            delete this.nodeIndex[node[this.idField]];
        }
    }

	// mark the tree as dirty and note that the data has changed
	this._clearNodeCache(true);
	this.dataChanged();
},

//>	@method	tree.reloadChildren()
// Reload the children of a folder.
//
// @param node (TreeNode) node in question
// @group loadState			
// @visibility external
//<

reloadChildren : function (node, displayNodeType) {
	this.unloadChildren(node, displayNodeType);
	this.loadChildren(node, displayNodeType);
},


//
//	open and close semantics for a set of tree nodes
//


// clears the open node cache (used by getOpenList())
// and optionally the all node cache (used by getNodeList()).
_clearNodeCache : function (allNodes) {
    if (allNodes) this._allListCache = null;
    this._openListCache = null;
},

//>	@method	tree.isOpen()
//
// Whether a particular node is open or closed (works for leaves and folders).
//
// @param	node	(TreeNode)	node in question
// @return  (boolean)           true if the node is open
//
// @visibility external
//<
isOpen : function (node) {
	return node != null && !!node[this.openProperty];
},


//>	@method	tree.getOpenFolders()
//		Return the list of sub-folders of this tree that have been marked as open.
//		Note: unlike tree.getOpenList(), this only returns *folders* (not files),
//			and this will return nodes that are open even if their parent is not open.
//		@group	openList			
//
//		@param	node	(TreeNode)	node to start with.  If not passed, this.root will be used.
//<
getOpenFolders : function (node) {
	if (node == null) node = this.root;
	var openNodes = 
        this.getDescendantFolders(node, new Function("node","return node."+this.openProperty));
	if (this.isOpen(node)) openNodes.add(node);
	return openNodes;
},

//>	@method	tree.getOpenFolderPaths()
//		Return the list of sub-folders of this tree that have been marked as open.
//		Note: unlike tree.getOpenList(), this only returns *folders* (not files),
//			and this will return nodes that are open even if their parent is not open.
//		@group	openList			
//
//		@param	node	(TreeNode)	node to start with.  If not passed, this.root will be used.
//<
getOpenFolderPaths : function (node) {
	var openNodes = this.getOpenFolders(node);
	for (var i = 0; i < openNodes.length; i++) {
		openNodes[i] = this.getPath(openNodes[i]);
	}
	return openNodes;
},

//>	@method	tree.changeDataVisibility()	(A)
// Open or close a node.<br><br>
//
// Note that on a big change (many items being added or deleted) this may be called multiple times.
//
//		@group	openList			
//
//		@param	node		(TreeNode)	node in question
//		@param	newState	(boolean)	true == open, false == close
//      @param  [callback] (callback) Optional callback (stringMethod) to fire when loading 
//                      completes. Has a single param <code>node</code> - the node whose 
//                      children have been loaded, and is fired in the scope of the Tree.
//<
changeDataVisibility : function (node, newState, callback) {
//!DONTOBFUSCATE  (obfuscation breaks the inline function definitions)

	// if they're trying to open a leaf return false
	if (this.isLeaf(node)) return false;

	// mark the node as open or closed
	node[this.openProperty] = newState;

	// mark the open node list as dirty
	this._clearNodeCache();

	// if the node is not loaded, load it!
	if (newState && !this.isLoaded(node)) {
		this.loadChildren(node, callback);
	}
},

//>	@method	tree.toggleFolder()
//			Toggle the open state for a particular node
//		@group	openList			
//
//		@param	node	(TreeNode)	node in question
//<
toggleFolder : function (node) {
	this.changeDataVisibility(node, !this.isOpen(node));
},


//>	@method	tree.openFolder()
//
// Open a particular node
//
// @param	node	(TreeNode)	node to open
// @param  [callback] (callback) Optional callback (stringMethod) to fire when loading 
//                      completes. Has a single param <code>node</code> - the node whose 
//                      children have been loaded, and is fired in the scope of the Tree.
// @see ResultTree.dataArrived
// @visibility external
//<
openFolder : function (node, callback) {
	if (node == null) node = this.root;
	
	// if the node is not already set to the newState
	if (!this.isOpen(node)) {			
		// call the dataChanged method to notify anyone who's observing it
		this.changeDataVisibility(node, true, callback);
	}
},


//>	@method	tree.openFolders()
//
// Open a set of folders, specified by path or as pointers to nodes.
//
// @param	nodeList	(List of TreeNode)		List of nodes or node paths.
//
// @see ResultTree.dataArrived
// @visibility external
//<
openFolders : function (nodeList) {
	for (var i = 0; i < nodeList.length; i++) {
		var node = nodeList[i];
		if (node == null) continue;
		if (isc.isA.String(node)) node = this.find(node);
		if (node != null) {
			this.openFolder(node);
		}
	}
},

//>	@method	tree.closeFolder()
//
// Closes a folder
//
// @param	node	(TreeNode)	folder to close
//
// @visibility external
//<
closeFolder : function (node) {
	// if the node is not already set to the newState
	if (this.isOpen(node)) {			
		// call the dataChanged method to notify anyone who's observing it
		this.changeDataVisibility(node, false);
	}
},

//>	@method	tree.closeFolders()
//
// Close a set of folders, specified by path or as pointers to nodes.
//
// @param	nodeList	(List of TreeNode)		List of nodes or node paths.
//
// @visibility external
//<
closeFolders : function (nodeList) {
	for (var i = 0; i < nodeList.length; i++) {
		var node = nodeList[i];
		if (node == null) continue;
		if (isc.isA.String(node)) node = this.find(node);
		if (node != null) {
			this.closeFolder(node);
		}
	}
},

//>	@method	tree.openAll()
//
// Open all nodes under a particular node.
//
// @param	[node]	(TreeNode)	node from which to open folders (if not specified, the root
//                              node is used)
// @visibility external
// @example parentLinking
//<
openAll : function (node) {
	if (!node) node = this.root;
	var nodeList = this.getDescendants(node, isc.Tree.FOLDERS_ONLY);
	for (var i = 0, length = nodeList.length; i < length; i++) {
		// if the node is not already set to the newState
		if (!this.isOpen(nodeList[i])) {			
			// call the dataChanged method to notify anyone who's observing it
			this.changeDataVisibility(nodeList[i], true);
		}
	}
	// make the node itself open
	this.changeDataVisibility(node, true);
},

//>	@method	tree.closeAll()
// Close all nodes under a particular node
//
// @param	[node]	(TreeNode)	node from which to close folders (if not specified, the root
//                              node is used)
//
// @visibility external
//<
closeAll : function (node) {
	if (!node) node = this.root;
	var nodeList = this.getDescendants(node, isc.Tree.FOLDERS_ONLY);
	for (var i = 0, length = nodeList.length; i < length; i++) {
		// if the node is not already set to the newState
		if (this.isOpen(nodeList[i])) {			
			// call the dataChanged method to notify anyone who's observing it
			this.changeDataVisibility(nodeList[i], false);
		}
	}
	
	// close the node as well, unless (node==this.root and this.showRoot == false)
	//	this way we make sure you won't close an invisible root, 
	//  leaving no way to re-open it.
	if (!(node == this.root && this.showRoot == false)) this.changeDataVisibility(node, false);
},





//>	@method	tree.getOpenList()
//
// Return a flattened list of nodes that are open under some parent, including the parent
// itself.  If the passed in node is a leaf, this method returns null
//
// @param [node]			(TreeNode)			node in question
// @return					(List of TreeNode)      		flattened list of open nodes
//
// @visibility external
//<

getOpenList : function (node, displayNodeType, normalizer, sortDirection, criteria, context, getAll) {
	// default to the tree root
	if (! node) node = this.root;

	// default the normalizer to this._openNormalizer and sortDirection to this.sortDirection
	if (normalizer == null) 		normalizer = this._openNormalizer;
	if (sortDirection == null)		sortDirection = this.sortDirection;
	if (context == null) context = this._sortContext;
	// if the node is a leaf, return the empty list since it's not going to have any children
	if (this.isLeaf(node)) { 
        // prevents mysterious crash if an isFolder() override claims root is a leaf
        if (node == this.root) return []; 
        return null;
    }

	// create an array to hold the descendants
	var list = [];
	
	// add the node if we're not skipping folders
	if (displayNodeType != isc.Tree.LEAVES_ONLY) list[list.length] = node;
	
	// if this node is closed, return the list
	if (!getAll && !this.isOpen(node)) return list;

	// iterate through all the children of the node
	var children = this.getChildren(node, displayNodeType, normalizer, sortDirection, criteria, 
                                    context);
	// for each child
	for (var i = 0, length = children.length, child; i < length; i++) {
		// get a pointer to the child
		child = children[i];    
		if (! child) {
            //>DEBUG
            //alert"getOpenList: child # " + i + " of folder " + node.path + " is null!");
            //<DEBUG
			continue;
		}
		
        // if the child is a folder, recurse, but check that it actually has children -
        // otherwise we eat a function call, array alloc, empty concat, and a bunch of other
        // checks (top of this function) all for nothing.  This is a typical case for loading a
        // large set of folders from the server in loadOnDemand mode
        //
        var grandChildren = child[this.childrenProperty];
		if (grandChildren && grandChildren.length) {
			// now concatenate the list with the descendants of the child
			list = list.concat(this.getOpenList(child, displayNodeType, normalizer,
                                                sortDirection, criteria, context, getAll));
		} else {
			// if we're not excluding leaves, add the leaf to the list
			
			if (displayNodeType != isc.Tree.FOLDERS_ONLY) {
				list[list.length] = child;
			}
		}
	}

    // if showRoot is false, remove the first item (which will be the root)
    if (!this.showRoot && list[0] == this.root) {
        list = list.slice(1,list.length);
    }

	// finally, return the entire list
	return list;
},


//>	@method	tree._getOpenList()	(A)
// Internal routine to set the open list if it needs to be set	
//		@group	openList			
//<
_getOpenList : function () {
	// if the _openListCache hasn't been calculated,
	//		or we're not supposed to cache the openList
	if (! this._openListCache || !this.cacheOpenList) {
		// recalculate the open list
		this._openListCache = this.getOpenList(this.root, this.openDisplayNodeType,
                                               this._openNormalizer, this.sortDirection,
                                               this.openListCriteria);
	}
	return this._openListCache;
},

//> @method tree.getNodeList()
// Return a flattened list of all nodes in the tree.
//<
getNodeList : function () {
    // if the _allListCache hasn't been calculated,
    // or we're not supposed to cache the openList
    if (! this._allListCache || !this.cacheAllList) {
        // recalculate the node list
        this._allListCache = this.getAllNodes(this.root);
    }
    return this._allListCache;
},

//> @method tree.getAllNodes()
// Get all the nodes that exist in the tree under a particular node, as a flat list, in
// depth-first traversal order.
//
// @params [node] optional node to start from.  Default is root.
// @return (Array of TreeNode) all the nodes that exist in the tree
// @visibility external
//<
getAllNodes : function (node) {
    return this.getOpenList(node, null, null, null, null, null, true);
},

// List API
// --------------------------------------------------------------------------------------------

//>	@method	tree.getLength()
//
// Returns the number of items in the current open list.
//
// @return		(number)	number of items in open list
//
// @see method:Tree.getOpenList
// @visibility external
//<
getLength : function () {
	return this._getOpenList().length;
},

//>	@method	tree.get()
//			Get the item in the openList at a particular position
//		@group	openList, Items			
//		@return		(TreeNode)	node at that position
//<
get : function (pos) {
	return this._getOpenList()[pos];
},

//>	@method	tree.getRange()
//			Get a range of items from the open list
//		@group	openList, Items			
//
//		@param	start	(number)	start position
//		@param	end		(number)	end position (NOT inclusive)
//		@return			(TreeNode)	list of nodes in the open list
//<
getRange : function (start, end) {
	return this._getOpenList().slice(start,end);	
},

//>	@method	tree.indexOf()
// @include list.indexOf
//<
indexOf : function (node, pos, endPos) {
	return this._getOpenList().indexOf(node, pos, endPos);
},

//>	@method	tree.lastIndexOf()
// @include list.lastIndexOf
//<
lastIndexOf : function (node, pos, endPos) {
	return this._getOpenList().lastIndexOf(node, pos, endPos);
},

//>	@method	tree.getAllItems()
//			Get the entire list (needed by Selection)
//		@group	openList, Items			
//
//		@return		(TreeNode)	all nodes in the open list
//<
getAllItems : function () {
	return this._getOpenList();
},



//>	@method	tree.sortByProperty()
// Handle a 'sortByProperty' call to change the default sort order of the tree
//		@group	sorting			
//
//		@param	[property]	(string)	name of the property to sort by
//		@param	[direction]		(boolean)	true == sort ascending
//		@param	[normalizer](function)	sort normalizer (will be derived if not specified)
//<
sortByProperty : function (property, direction, normalizer, context) {
	if (property != null) this.sortProp = property;
	if (direction != null) this.sortDirection = direction;

	// create the _openNormalizer function
	if (normalizer && isc.isA.Function(normalizer)) {
		this._openNormalizer = normalizer;
	} else {
		this._makeOpenNormalizer();
	}
    
    // always hang onto the context
    this._sortContext = context;

	// mark as dirty so any list who points to us will be redrawn
	this._clearNodeCache(true);

	// call the dataChanged method to notify anyone who's observing it
	this.dataChanged();
},

//>	@method	tree._makeOpenNormalizer()	(A)
// Create a normalizer function according to the sortProp and sortDirection variables
//		@group	sorting			
//<
_makeOpenNormalizer : function () {
	//	function normalizer(obj, property, destination)

    // create a String that sorts:
    // - [optionally] according to folderness [based on separateFolders]
    // - [optionally] according to an arbitrary property [sortProp]
    // - [optionally] according to title. Title is retrieved via 'getTitle()' when the
    //   sortProp is set to "title".
    
	var property = this.sortProp,
		sortDirection = this.sortDirection,
		separateFolders = this.separateFolders != false;
	
	var script = isc.SB.create();
    script.append("var __tree__ = ", this.getID(), ";\rvar value = '';");
    // sanity check - if we've been destroyed and this method is called, bail.
    script.append("if (__tree__ == null) return;\r");
    // optionally sort by folder vs file
    if (separateFolders) {
        var folderPrefix, leafPrefix;
        if (this.sortFoldersBeforeLeaves) {
            folderPrefix = "0:";
            leafPrefix = "1:";
        } else {
            folderPrefix = "1:";
            leafPrefix = "0:";
        }
        script.append("value+=(__tree__.isFolder(obj) ? '" + folderPrefix +
                                                    "' : '" + leafPrefix + "');");
    }
    
    // optionally sort by sortProp
    if (property && property != "title") {
        script.append("var prop = obj['", property, "'];",
                      
                      "if (isc.isA.Number(prop)) {",
                        "if (prop > 0) prop = '1' + prop.stringify(12,true);",
                        "else {",
                            "prop = 999999999999 + prop;",
                            "prop = '0' + prop.stringify(12,true);",
                        "}",
                      "} else if (isc.isA.Date(prop)) prop = prop.getTime();",
                      "if (prop != null) value += prop + ':';")
    }

    if (property) {
        // sort by title
        script.append("var title = __tree__.getTitle(obj);",
                          
                          "if (isc.isA.Number(title)) {",
                            "if (title > 0) title = '1' + title.stringify(12,true);",
                            "else {",
                                "title = 999999999999 + prop;",
                                "title = '0' + title.stringify(12,true);",
                            "}",
                          "} else if (isc.isA.Date(title)) title = title.getTime();",
                          "if (title != null) {title = title + ''; value += title.toLowerCase();}");
    }
    script.append("return value;");
    
    //isc.Log.logWarn("script text: " + script);
	this.addMethods({_openNormalizer : new Function("obj,property", script.toString())});
},

// Loading batches of children: breadth-first loading up to a maximum
// ---------------------------------------------------------------------------------------

loadBatchSize:50,
loadSubtree : function (node, max, initTime) {
    if (!node) node = this.getRoot();
    if (max == null) max = this.loadBatchSize;

    //this.logWarn("loading subtree of node: " + this.echoLeaf(node) +
    //             "up to max: " + max);

    this._loadingBatch = initTime ? 2 : 1;

    var count = 0,
        stopDepth = 1;
    // load at increasing depth until we hit max or run out of children
    while (count < max) {
        var numLoaded = this._loadToDepth(max, node, count, stopDepth++);
        if (numLoaded == 0) break; // nothing left to load
        count += numLoaded;
    }

    this._loadingBatch = null;

    if (count > 0) this._clearNodeCache(true);
}, 

// allows loadChildren() to detect we're loading a batch of children and defer loading a folder
// that doesn't have interesting children
loadingBatch : function (initOnly) { 
    if (initOnly) return this._loadingBatch == 2;
    else return this._loadingBatch;
},

_loadToDepth : function (max, node, count, stopDepth) {

    var numLoaded = 0;
    if (!this.isOpen(node)) {
        if (!this.isLoaded(node)) this.loadChildren(node);

        // NOTE: we assume that during batch loading, folders can decline to actually load or
        // open, and these should remain closed
        if (this.isLoaded(node)) {
            if (this.openFolder(node) === false) return numLoaded;
        }

        if (node.children) {
            numLoaded += node.children.length;
            count += node.children.length;
        }
    }

    var childNodes = node.children;

    if (count >= max || stopDepth == 0 || childNodes == null) return numLoaded;

    for (var i = 0; i < childNodes.length; i++) {
        var child = childNodes[i];

        var loaded = this._loadToDepth(max, child, count, stopDepth-1);

        numLoaded += loaded;
        count += loaded;

        //this.logWarn("recursed into: " + this.getTitle(child) + 
        //             " and loaded: " + loaded + 
        //             ", total count: " + count);
        
        if (count >= max) return numLoaded;
    }
    return numLoaded;
},

// Tree Filtering
// ---------------------------------------------------------------------------------------

//> @method tree.getFilteredTree() 
// Filters this tree by the provided criteria, returning a new Tree containing just the nodes
// that match the criteria.
// <P>
// If <code>filterMode</code> is "keepParents", parents are retained if
// any of their children match the criteria even if those parents do not match the criteria.
// 
// @param criteria (Criteria or AdvancedCriteria) criteria to filter by
// @param [filterMode] (TreeFilterMode) mode to use for filtering, defaults to "strict"
// @param [dataSource] (DataSource) dataSource to use for filtering, if this Tree does not
//                                  already have one
// @return (Tree) filtered tree
// @group treeFilter
// @visibility external
//<
getFilteredTree : function(criteria, filterMode, dataSource) {
    filterMode = filterMode || isc.Tree.STRICT;

    var dataSource = this.dataSource || dataSource;
    if (!dataSource) {
        isc.logWarn("Cannot apply filter to Tree without dataSource");
        return null;
    }

    // Filter the tree in-place to avoid moving nodes around as we add
    // missing parent nodes back in place. We also retain loadState.
    var tree = this.duplicate(true, true);
    tree._filterChildren(criteria, filterMode, dataSource, tree.getRoot());
    return tree;
},

// Returns true if any children match criteria
_filterChildren : function(criteria, filterMode, dataSource, parent) {
    if (parent.children == null || parent.children.length == 0) return false;

    var children = parent.children,
        haveMatchingNodes = false
    ;

    if (isc.isA.String(dataSource)) dataSource = isc.DS.get(dataSource);

    for (var i = children.length-1; i >= 0; i--) {
        var node = children[i],
            hasImmediateMatches = false
        ;
        if (node.children != null && node.children.length > 0) {
            hasImmediateMatches = this._filterChildren(criteria, filterMode, dataSource, node);
        }
        haveMatchingNodes = haveMatchingNodes || hasImmediateMatches;

        // Don't have to filter parent node (this child) if keeping parent nodes
        // and there are matching children.
        if (!hasImmediateMatches || filterMode == isc.Tree.STRICT) {
            var matches = dataSource.applyFilter([node], criteria);
            if (matches != null && matches.length > 0) {
                haveMatchingNodes = true;
            } else {
                this.remove(node, true);
            }
        }
    }
    return haveMatchingNodes;
}

});	// END isc.Tree.addMethods()

isc.Tree.addClassMethods({
    // Tree Discovery
    // ---------------------------------------------------------------------------------------
    // utilities for discovering the tree structure of a block of data heuristically

    // heuristically find a property that appears to contain child objects.
    // Searches through an object and find a property that is either Array or Object valued.
    // Returns the property name they were found under.
    // mode:
    // "any" assume the first object or array value we find is the children property
    // "array" assume the first array we find is the children property, no matter the contents
    // "object" assume the first object or array of objects we find is the children property
    //          (don't allow arrays that don't have objects)
    // "objectArray" accept only an array of objects as the children property
    findChildrenProperty : function (node, mode) {
        if (!isc.isAn.Object(node)) return;

        if (!mode) mode = "any"; 

        var any = (mode == "any"),
            requireObject = (mode == "object"),
            requireArray = (mode == "array"),
            requireObjectArray = (mode == "objectArray");

        for (var propName in node) {
            var propValue = node[propName];
            // note: isAn.Object() matches both Array and Object
            if (isc.isAn.Object(propValue)) {
                if (any) return propName;
                if (isc.isAn.Array(propValue)) {
                    // array of objects always works
                    if (isc.isAn.Object(propValue[0])) return propName;
                    // simple array satisfies all but "object" and "objectArray"
                    if (!requireObject && !requireObjectArray) return propName;
                } else {
                    // object works only for "object" and "any" ("any" covered above)
                    if (requireObject) return propName;
                }
            }
        }
    },

    // given a hierarchy of objects with children under mixed names, heuristically discover the
    // property that holds children and copy it to a single, uniform childrenProperty.  Label each
    // discovered child with a configurable "typeProperty" set to the value of the property
    // that held the children.
    discoverTree : function (nodes, settings, parentChildrenField) {
        if (!settings) settings = {}; // less null checks

        var childrenMode = settings.childrenMode || "any";
    
        // scanMode: how to scan for the childrenMode
        // "node": take each node individually
        // "branch": scan direct siblings as a group, looking for best fit
        // "level": scan entire tree levels as a group, looking for best fit
        var scanMode = settings.scanMode || "branch";

        // tieMode: what to do if there is more than one possible childrenProperty when using
        // scanMode "branch" or "level"
        // "node": continue, but pick childrenProperty on a per-node basis (will detect
        //             mixed) 
        // "highest": continue, picking the childrenProperty that occurred most as the single
        //            choice
        // "stop": if there's a tie, stop at this level (assume no further children)
        // NOT SUPPORTED YET: "branch": if using scanMode:"level", continue but with scanMode
        //                              "branch"
        var tieMode = settings.tieMode || "node";

            // what to rename the array of children once discovered
        var newChildrenProperty = settings.newChildrenProperty ||
                                  isc.Tree.getInstanceProperty("childrenProperty"),
            typeProperty = settings.typeProperty || "nodeType",
            // for string leaf nodes (if allowed), what property to store the string under in
            // the auto-created object
            nameProperty = settings.nameProperty || "name";

        if (!isc.isAn.Array(nodes)) nodes = [nodes];

        // go through all the nodes on this level and figure out what property occurs most
        // often as a children property.  This allows us to handle edge cases where the
        // property occurs sometimes as an Array and sometimes singular
        var globalBestCandidate;
        if (scanMode == "level" || scanMode == "branch") {
            var candidateCount = {};
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i],
                    childrenProperty = null;

                // optimization: this node was up-converted from a String, it can't have
                // children
                if (node._fromString) continue;

                childrenProperty = this.findChildrenProperty(node, childrenMode);

                if (childrenProperty == null) continue;

                candidateCount[childrenProperty] = (candidateCount[childrenProperty] || 0);
                candidateCount[childrenProperty]++;
            }
            var counts = isc.getValues(candidateCount),
                candidates = isc.getKeys(candidateCount);

            if (candidates.length == 0) {
                // no children property could be found
                return;
            } else if (candidates.length == 1) {
                // use the only candidate
                globalBestCandidate = candidates[0];
            } else if (tieMode == "node") {
                // multiple candidates found, don't set globalBestCandidate and we will
                // automatically go per-node
            } else if (tieMode == "stop") {
                return;
            } else { // tieMode == "highest"
                // pick highest and proceed
                var max = counts.max(),
                    maxIndex = counts.indexOf(max);
                globalBestCandidate = candidates[maxIndex];
            }

            //this.logWarn("counts are: " + this.echo(candidateCount) +
            //             ", globalBestCandidate: " + globalBestCandidate);
        }

        var allChildren = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            // default to the globalBestCandidate if there is one
            var bestCandidate = globalBestCandidate;

            if (node._fromString) continue; // can't have children
            
            // determine the best children property individually per node if we haven't already
            // determined it by scanning all nodes
            if (!bestCandidate) {   
                bestCandidate = this.findChildrenProperty(node, childrenMode);
                //this.logWarn("individual bestCandidate: " + bestCandidate + 
                //             " found for node: " + this.echo(node));
            }

            // no children found
            if (bestCandidate == null) continue;

            // normalize children to an Array (even if absent, if a single bestCandidate
            // property was determined for the level)
            var children = node[bestCandidate];
            if (children != null && !isc.isAn.Array(children)) children = [children];
            else if (children == null) children = [];

            // copy discovered children to the normalized childrenProperty
            node[newChildrenProperty] = children;

            // mark all children with a "type" property indicating the property they were found
            // under.  Needed because this information is missing once we normalize all children
            // arrays to appear under the same property name
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                // if we end up with Strings in the children (valid only with childrenMode
                // "array") auto-convert them to Objects
                if (isc.isA.String(child)) {
                    children[j] = child = {
                        name:child,
                        _fromString:true
                    }   
                } 
                child[typeProperty] = bestCandidate;
            }

            // proceed with this node's children
            if (scanMode == "level") {
                allChildren.addAll(children);
            } else {
                this.discoverTree(children, settings, bestCandidate);
            }
        }   
        if (scanMode == "level" && allChildren.length > 0) this.discoverTree(allChildren, settings);
    },
    
    getCleanNodeData : function (nodeList, includeChildren, cleanChildren, tree) {
        if (nodeList == null) return null;
    
        var nodes = [], wasSingular = false;
        if (!isc.isAn.Array(nodeList)) {
            nodeList = [nodeList];
            wasSingular = true;
        }
    
        // known imperfections:
        // - by default, isFolderProperty is "isFolder", we write this into nodes and sent it when
        //   saving
        // - we create empty children arrays for childless nodes, and save them
    
        for (var i = 0; i < nodeList.length; i++) {
            var treeNode = nodeList[i],
                node = {};
            if (tree == null) {
                var treeID = treeNode._isc_tree;
                if (treeID) tree = window[treeID];
            }
            
            // copy the properties of the tree node, dropping some Tree/TreeGrid artifacts
            for (var propName in treeNode) {
                
                if ((tree != null && propName == tree.parentProperty) ||
                    // currently hardcoded
                    propName == "_loadState" ||
                    propName == "_isc_tree" ||
                    
                    propName == "__ref" ||
                    // the openProperty and isFolderProperty are documented and settable, and if
                    // they've been set should be saved, so only remove these properties if they
                    // use the prefix that indicates they've been auto-generated (NOTE: this prefix
                    // is obfuscated)
                    propName.startsWith("_isOpen_") || 
                    propName.startsWith("_isFolder_") || 
                    
                    // default nameProperty from ResultTree, which by default does not have
                    // meaningful node names
                    propName.startsWith("__nodePath") || 
                    // class of child nodes, set up by ResultTree
                    propName == "_derivedChildNodeType" ||
                    
                    // from selection model
                    propName.startsWith("_selection_") ||
                    
                    // Explicit false passed as 'includeChildren' param.
                    (includeChildren == false && 
                     tree && 
                     propName == tree.childrenProperty)) 
                {
                     continue;
                }
                node[propName] = treeNode[propName];
       
                // Clean up the children as well (if there are any)
                if (cleanChildren && 
                    tree && 
                    propName == tree.childrenProperty && 
                    isc.isAn.Array(node[propName])) 
                {
                    node[propName] = tree.getCleanNodeData(node[propName],true,true,tree);
                }
            }
            nodes.add(node);
        }
        if (wasSingular) return nodes[0];
        return nodes;
    }

});
