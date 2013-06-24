atom = {	// Module with all the atom related functions and definitions.
	
	
	active_atoms: {}, // Stores actively loaded and decrypted atom viewmodels.
	

	definitions: {	// Definitions for atom types.
		
		"default": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "default",
				};
			},
			
			ViewModel: function( 
				model, 	// An atomobject model of the same type.
				key 	// Unique key string of the atomobject.
			) {
				// Constructor for viewmodel for an atom object of same type. Is not stored, but Knockout.js'd upon!
				// Raises exception if supplied model is not an atom object of same type.
				var viewmodel = {};
				viewmodel.model = model;
				viewmodel.key = key;
				viewmodel.type = model.type;
				viewmodel.views = [];
				
				viewmodel.deleteModel = function(
					key		// An atom object key in the ls.
				) {
					// Delete the atom object and all viewmodels etc by the given key, or self.
					if ( key )				 {
						atom.active_atoms[key].deleteViewModel();
						atom.delete(key);
					} else {
						atom.delete(this.key);
						this.deleteViewModel();
					}
				};
				viewmodel.createViewModel = function(
					key		// Key of the atom to try to create a viewmodel for.
				) {
					// Wraps atom.createViewModel in order to work through KO.
					return atom.createViewModel(key);
				};
				viewmodel.deleteViewModel = function() {
					// Delete all dependencies such as views, global ref, and finally itself.
					// Delete all views if list not empty.
					for ( var i = 0; i < this.views.length; i++ ) {
						this.deleteView(this.views[i]);
					}
					// Delete reference from global list.
					delete atom.active_atoms[this.key];
					// Finally, delete this viewmodel itself.
					delete this;
				};
				viewmodel.createView = function(
					mode,		// A string specifying the template mode. "list", "display" and "edit" are standard ones.
					transition	// Object with transition properties.
				) {
					// Renders a view by mode from viewmodel under a the defined global page parent.
					// Returns view id, and adds it to the viewmodel's list.
					
					// Get parent DOM object.
					parent = trans.parent;
					
					// Create the view element.
					var viewId = "atom_key_"+this.key+"_"+mode+"_"+Math.floor(1000+Math.random()*9000);
					var viewClass = "atom_type_"+this.type+"_"+mode;
					var style = transition ? "display: none" : "";
					var view = "<div class='page "+viewClass+"' data-role='page' id='"+viewId+"' style='"+style+"' >"+atom.definitions[this.type].views[mode]+"</div>";
					
					// Append the view to the DOM.
					parent.append($(view));
					$('#'+viewId).find('textarea').autoResizer();
					
					// Settle transitions.
					if ( typeof transition === "object" ) {
						if ( transition[1] ) {
							$(document).transition('to', viewId, transition[0], transition[1]);
						} else {
							$(document).transition('to', viewId, transition[0]);
						}
					} else if ( transition ) {
						$(document).transition('to', viewId, 'slide');
					}
					
					// Bind viewmodel to view.
					ko.applyBindings( this, $("#"+viewId)[0] );
					
					// Append to list and return.
					trans.stack[trans.stack.length] = [viewmodel.key, mode];
					this.views[this.views.length] = viewId;
					return viewId;
				};
				viewmodel.deleteView = function(
					viewId	// ID of the view element.
				) {
					// Deletes a given viewmodel by ID.
					// If viewmodel has no other views, delete it.
					ko.cleanNode($("#"+viewId));
					$("#"+viewId).remove();
					if ( this.views.length <= 0 ) {
						this.deleteViewModel();
					}
				};
				
				
				viewmodel.save = function() {
					// Save the viewmodel's content. By which we mean the underlying model itself to the localstore.
					atom.store(this.model, this.key);
				};
				viewmodel.full = function() {
					// Create a full view to...view it fully.
					var id = this.createView("full", true);
				};
				viewmodel.edit = function() {
					// Create a edit view to...edit it.
					var id = this.createView("edit", ["flip"]);
				};
				viewmodel.back = function() {
					// Method to go back one page.
					trans.back();
				};
				
				return viewmodel;
			},
			
			views: {
				list: "",
				card: '\
					<div class="card" data-bind="text:key">Ahem.</div>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li>\
							<li><a href="#" class="action" title="Return to Root" data-transition="push"><i class="icon-folder"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1>This Atom cannot be read.</h1>\
						<p>Most likely, it was encrypted using a different passkey than the active one. You must remove the current passkey and try to access this atom again with a different one.</p>\
						<p>Once implemented, you can try to decrypt with a different passkey just for this atom without removing the current one.</p>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top" data-bind="click:back">\
						<a href="index.html" class="action page-action" data-ignore="true">\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
					</header>\
					<div class="content inset">\
						<p>You cannot edit this Atom since it cannot be read.</p>\
					</div>\
				'
			}
			
		},

		"note": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "note",
					title: "A Note",
					content: "Some text inside the note."
				};
			},
			
			ViewModel: function( 
				model, 	// An atomobject model of the same type.
				key 	// Unique key string of the atomobject.
			) {
				// Constructor for viewmodel for an atom object of same type. Is not stored, but Knockout.js'd upon!
				// Raises exception if supplied model is not an atom object of same type.
				var viewmodel = atom.definitions['default'].ViewModel(model, key);
				
				viewmodel.title = ko.observable(model.title).extend({modelsync: [model, 'title']});
				viewmodel.content = ko.observable(model.content).extend({modelsync: [model, 'content']});
				
				return viewmodel;
			},
			
			views: {
				list: "",
				card: '\
					<div class="card" data-bind="text:key">Ahem.</div>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li>\
							<li><a href="#" class="action" title="Return to Root" data-transition="push"><i class="icon-folder"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<div class="preformatted" data-bind="text:content" ></div>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:back" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset">\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<textarea name="content" placeholder="Content" class="input-text" autocomplete="off" data-bind="value:content, valueUpdate: \'afterkeydown\'"> </textarea>\
						</form>\
					</div>\
				',
			}
		},
		
		"link": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "link",
					title: "A Link",
					link: "http://ddg.gg"
				};
			},
			
			ViewModel: function( 
				model, 	// An atomobject model of the same type.
				key 	// Unique key string of the atomobject.
			) {
				// Constructor for viewmodel for an atom object of same type. Is not stored, but Knockout.js'd upon!
				// Raises exception if supplied model is not an atom object of same type.
				var viewmodel = atom.definitions['default'].ViewModel(model, key);
				
				viewmodel.title = ko.observable(model.title).extend({modelsync: [model, 'title']});
				viewmodel.link = ko.observable(model.link).extend({modelsync: [model, 'link']});
				
				viewmodel.valid = function() {
					// Returns a string that signifies the validity of the link itself.
					
					var link = this.link().trim();
					
					if ( link.indexOf('://') >= 0 ) {
						return "validurl";
					} else if ( link.length == ls.KEY_LENGTH && link.match(/^[a-f0-9]*$/i) !== null ) {
						if ( ls.exists(link) ) {
							return "validkey";
						} else {
						return "validkeynew";
						}
					} else {
						return "invalid";
					}
					
				}
				
				viewmodel.go = function() {
					// Visit the link, whether it's an atom key or an url.
					
					var link = this.link().trim();
					var validity = this.valid();
					
					console.log(validity);
					
					if ( validity == "validurl" ) {
						window.open(link);
					} else if ( validity == "validkey" ) {
						var modelview = atom.createViewModel(link);
						modelview.createView("full", true);
					} else if ( validity == "validkeynew" ) {
						//TODO: Open new atom dialog.
					} else {
						return;
					}
					
				};
				
				return viewmodel;
			},
			
			views: {	//TODO: Add message for validity status.
				list: "",
				card: '\
					<div class="card" data-bind="text:key">Ahem.</div>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li>\
							<li><a href="#" class="action" title="Return to Root" data-transition="push"><i class="icon-folder"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<a href="#" class="link" data-transition="push" data-bind="click:go, text:title, css: { error: valid() == \'invalid\', warning: valid() == \'validkeynew\' }">Ahem</a>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:back" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset">\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<input type="text" name="link" placeholder="Link" class="input-text" autocomplete="off" data-bind="value:link, valueUpdate: \'afterkeydown\', css: { error: valid() == \'invalid\', warning: valid() == \'validkeynew\' }" />\
						</form>\
					</div>\
				',
			}
		},

		"folder": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "folder",
					title: "A Folder",
					keys: []
				};
			},
			
			ViewModel: function( 
				model, 	// An atomobject model of the same type.
				key 	// Unique key string of the atomobject.
			) {
				// Constructor for viewmodel for an atom object of same type. Is not stored, but Knockout.js'd upon!
				// Raises exception if supplied model is not an atom object of same type.
				var viewmodel = atom.definitions['default'].ViewModel(model, key);
				
				viewmodel.title = ko.observable(model.title).extend({modelsync: [model, 'title']});
				viewmodel.keys = ko.observableArray(model.keys).extend({modelsync: [model, 'keys']});
				
				viewmodel.atoms = ko.observableArray();
				
				viewmodel.parse = function() {
					// Update the atoms array with all the viewmodels referenced by the keys array.
					// No need to worry about duplication or deletion, as it's taken care of elsewhere.
					var atoms = [];
					var keys = this.keys();
					for ( var index in keys ) {
						atoms.push( atom.createViewModel(keys[index]) );
					}
					this.atoms(atoms);
				};
				viewmodel.parse();
				
				return viewmodel;
			},
			
			views: {
				list: "",
				card: '\
					<div class="card" data-bind="text:key">Ahem.</div>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li>\
							<li><a href="#" class="action" title="Return to Root" data-transition="push"><i class="icon-folder"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<ol data-bind="foreach: atoms">\
							<li class="card" data-bind="click: full">\
								<!-- Atom at key <b data-bind="text: $data"></b>. -->\
								<h1 class="key" data-bind="text: key"></h1>\
								<div class="atom">\
									<h2 data-bind="text: title"></h2>\
									<div>Test content.</div>\
								</div>\
							</li>\
						</ol>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:back" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset">\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<textarea name="content" placeholder="Content" class="input-text" autocomplete="off" data-bind="value:content, valueUpdate: \'afterkeydown\'"> </textarea>\
						</form>\
					</div>\
				',
			}
		},
		
		"index": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "index",
					title: "A Passkey Index",
					keys: [],
					all_keys: []
				};
			},
			
			ViewModel: function( 
				model, 	// An atomobject model of the same type.
				key 	// Unique key string of the atomobject.
			) {
				// Constructor for viewmodel for an atom object of same type. Is not stored, but Knockout.js'd upon!
				// Raises exception if supplied model is not an atom object of same type.
				var viewmodel = atom.definitions['folder'].ViewModel(model, key);
				
				viewmodel.all_keys = ko.observableArray(model.all_keys).extend({modelsync: [model, 'all_keys']});
				
				viewmodel.launchKey = function(data, event) {
					var target;
					if (event.target) target = event.target;
					else if (event.srcElement) target = event.srcElement;
					if (target.nodeType == 3) target = target.parentNode; // defeat Safari bug
					var key = $(target).attr('data-key');
					var viewmodel = atom.createViewModel(key);
					viewmodel.full();
				};
				
				return viewmodel;
			},
			
			views: {
				list: "",
				card: '\
					<div class="card" data-bind="text:key">Ahem.</div>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li>\
							<li><a href="#" class="action" title="Return to Root" data-transition="push"><i class="icon-folder"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<ol data-bind="foreach: atoms">\
							<li class="card" data-bind="click: full">\
								<!-- Atom at key <b data-bind="text: $data"></b>. -->\
								<h1 class="key" data-bind="text: key"></h1>\
								<div class="atom">\
									<h2 data-bind="text: title"></h2>\
									<div>Test content.</div>\
								</div>\
							</li>\
						</ol>\
						<ul class="list" data-bind="foreach: all_keys">\
							<!-- ko if: $index() == 0 -->\
								<li class="list-divider">Single Line List</li>\
							<!-- /ko -->\
							<li class="list-item-single-line" data-bind="text: $data, click: $parent.launchKey, attr: { \'data-key\': $data }"></li>\
						</ul>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:back" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset">\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<textarea name="content" placeholder="Content" class="input-text" autocomplete="off" data-bind="value:content, valueUpdate: \'afterkeydown\'"> </textarea>\
						</form>\
					</div>\
				',
			}
		},
		
	},
	
	
	create: function(
		type	// A string of the atom type name.
	) {
		// Creates and returns a blank atom of given type.
		// If given type does not exist, raises exception.
		if ( atom.definitions[type] === undefined ) {
			throw "Atom of type "+type+"is not defined.";
		} else {
			var atomobject = atom.definitions[type].Model();
			return atomobject;
		}
	},
	
	
	delete: function(
		key		// Key of atom object to delete.
	) {
		// Deletes given key from localstorage. Yes, anyone can do this regardless of being able to decrypt it.
		ls.del(key);
	},
	
	
	store: function(
		atomobject,	// Atom object to store.
		key			// Optional key to store to.
	) {
		// Stores a given atom object to localStorage.
		// If key is given, tries to store to that key.
		// Otherwise, stores to a random key.
		// Returns key atom was stored to.
		var value = atom.stringify(atomobject);
		if ( key === undefined ) {
			return ls.set(value);
		} else {
			return ls.set(value, key);
		}
	},
	
	
	stringify: function(
		atomobject	// Atom object to stringify.
	) {
		// Converts atom object to string to be stored to the localStorage
		return value = auth.encrypt(JSON.stringify(atomobject), auth.active_passkey);
	},
	
	
	retrieve: function(
			key		// A string (or string-assumed) localStorage key to try to retrieve and parse atom from.
		) {
		// Tries to retrieve and parse atom from given key.
		// Raises exception given key is non existent.
		// Returns retrieved parsed atom.
		var value = ls.get(key);
		if ( value === null ) {
			throw "Key does not exist."
		} else {
			return atom.parse(value);
		}
	},
	
	
	parse: function(
		value	// A string being parsed as an atom.
	) {
		// Tries to parse given string as atom.
		// Returns generic atom if decryption failed.
		// Throws exception if decrypted object not an atom.
		// Returns decrypted atom.
		try {
			var atomobject = JSON.parse(auth.decrypt(value, auth.active_passkey));
			if ( !(atomobject.type in atom.definitions) ) {
				throw "Object is not an atom." //TODO: Don't throw a fit, Return false so that default render can be made.
			} else {
				return atomobject;
			}
		} catch (e) {
			var atomobject = atom.definitions["default"].Model();
			return atomobject;
		}
	},
	
	
	createViewModel: function(
		key		// An ls key that contains an atom object to create viewmodel of.
	) {
	// If viewmodel does not exist retrieves the atom object/model of the given key, then creates a viewmodel of it. Else returns existing.
	// Returns the atom viewmodel object and appends it to the global list of active viewmodels if not present.

		if ( atom.active_atoms[key] ) {
			
			return atom.active_atoms[key];
			
		} else {

			// Get atom object and model for the KO operation.
			var model = atom.retrieve(key);
			
			// Create viewmodel and bind it.
			var viewmodel = atom.definitions[model.type].ViewModel( model, key );
			
			// Append and return it.
			atom.active_atoms[key] = viewmodel;
			return viewmodel;			
			
		}
		
	},	
	
};
