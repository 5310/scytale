atom = {	// Module with all the atom related functions and definitions.
	
	
	active_atoms: {}, // Stores actively loaded and decrypted atom viewmodels.
	

	definitions: {	// Definitions for atom types.
		
		"default": {
			
			Model: function() {
				// Constructor for a barebones atom object that serves as static model for clean storage as well.
				return {
					type: "default",
					key: undefined,
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
				viewmodel.type = model.type;
				viewmodel.key = key;
				viewmodel.views = [];
				
				viewmodel.keyValidity = function() {
					return atom.validity(this.key);
				}
				
				
				viewmodel.deleteModel = function() {
					// Delete the atom object and all viewmodels etc by the given key, or self.
					atom.delete(this.key);
					this.deleteViewModel();
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
					if ( this.keyValidity() == 'key' ) {
						atom.store(this.model, this.key);
					} else {
						throw "Not a valid atom to save!";
					}
				};
				viewmodel.remove = function() {
					// Delete atom.
					this.deleteModel();
					trans.back();
				};
				viewmodel.full = function() {
					// Create a full view to...view it fully.
					if ( this.keyValidity() == 'key' ) {
						var id = this.createView("full", true);
					} else if ( this.keyValidity() == 'key_new' ) {
						atom.createNewAtom(key);						
					} else {
						throw "Not a valid atom to fully view!";
					}
				};
				viewmodel.edit = function() {
					// Create a edit view to...edit it.
					if ( this.keyValidity() == 'key' ) {
						var id = this.createView("edit", ["flip"]);
					} else if ( this.keyValidity() == 'key_new' ) {
						atom.createNewAtom(key);
					} else {
						throw "Not a valid atom to edit!";
					}
				};
				viewmodel.back = function() {
					// Method to go back one page.
					trans.back();
				};
				viewmodel.saveback = function() {
					// Method to go back one page.
					this.save();
					trans.back();
				};
				viewmodel.showback = function() {
					if ( trans.stack.length > 0 ) {
						return true;
					} else {
						return false;
					}
				};
				viewmodel.root = function() {
					// Method to go root page, which is usually an index, and no need to check.
					trans.root();
				};
				viewmodel.copy = function() {} //TODO:
				viewmodel.logout = function() {
					// Logs out to the main screen. Relies on auth.logout for the real deal.
					auth.logout();
				};
				
				return viewmodel;
			},
			
			views: {
				card: '\
					<li class="card" data-bind="click: full, css: { error: keyValidity() == \'invalid\', warning: keyValidity() == \'key_new\', locked: keyValidity() == \'key_invalid\' }">\
						<h1 class="key" data-bind="text: key"></h1>\
					</li>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron" data-bind="css: { hide: !showback() }"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<!-- <li><a href="#" class="action" title="Copy Atom Key" data-bind="click:copy" data-transition="push"><i class="icon-copy"></i></a></li> -->\
							<li><a href="#" class="action" title="Return to Root" data-transition="push" data-bind="click: root"><i class="icon-storage"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push" data-bind="click: logout"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1>This Atom cannot be read.</h1>\
						<p>Most likely it was deleted.</p>\
						<p>Or maybe it never existed, or is corrupted or something.</p>\
						<p>Or it could be that it was encrypted using a different passkey than the active one. You can log in under a different passkey and try again.</p>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top" data-bind="click:saveback">\
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
				card: '\
					<li class="card" data-bind="click: full">\
						<h1 class="key" data-bind="text: key"></h1>\
						<div class="atom">\
							<h2 data-bind="text: title"></h2>\
							<div class="preformatted" data-bind="text: content"></div>\
						</div>\
					</li>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron" data-bind="css: { hide: !showback() }"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<!-- <li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li> -->\
							<li><a href="#" class="action" title="Return to Root" data-transition="push" data-bind="click: root"><i class="icon-storage"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push" data-bind="click: logout"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<div class="preformatted" data-bind="text:content" ></div>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:saveback" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Delete" data-transition="push" data-bind="click:remove" ><i class="icon-trash"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset" data-bind="submit: saveback">\
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
				
				viewmodel.linkValidity = function() {
					// Returns a string that signifies the validity of the link itself.
					var link = this.link().trim();
					return atom.validity(link);
				}
				
				viewmodel.go = function(data, event) {
					// Visit the link, whether it's an atom key or an url.
					
					var link = this.link().trim();
					var link_validity = this.linkValidity();
					
					if ( link_validity == "url" ) {
						window.open(link);
					} else if ( link_validity == "key" ) {
						var modelview = atom.createViewModel(link);
						modelview.createView("full", true);
					} else if ( link_validity == "key_new" ) {
						//TODO: Open new atom dialog.
					} else {
						return;
					}
					
					event.stopPropagation();
					
				};
				
				return viewmodel;
			},
			
			views: {	//TODO: Add message for validity status.
				card: '\
					<li class="card" data-bind="click: full">\
						<h1 class="key" data-bind="text: key"></h1>\
						<div class="atom">\
							<h2><a href="#" class="link" data-transition="push" data-bind="click:go, text:title, css: { error: linkValidity() == \'invalid\', warning: linkValidity() == \'validkeynew\' }">Ahem</a></h2>\
						</div>\
					</li>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron" data-bind="css: { hide: !showback() }"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<!-- <li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li> -->\
							<li><a href="#" class="action" title="Return to Root" data-transition="push" data-bind="click: root"><i class="icon-storage"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push" data-bind="click: logout"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<a href="#" class="link" data-transition="push" data-bind="click:go, text:title, css: { error: linkValidity() == \'invalid\', warning: linkValidity() == \'key_new\' }">Ahem</a>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:saveback" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Delete" data-transition="push" data-bind="click:remove" ><i class="icon-trash"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset" data-bind="submit: saveback">\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<input type="text" name="link" placeholder="Link" class="input-text" autocomplete="off" data-bind="value:link, valueUpdate: \'afterkeydown\', css: { error: linkValidity() == \'invalid\', warning: linkValidity() == \'validkeynew\' }" />\
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
				
				viewmodel.length = function() {
					return this.keys().length;
				};
				viewmodel.lengthText = function() {
					var length = this.length(0);
					if ( length == 0 ) {
						return "Empty.";
					} else if ( length == 1 ) {
						return "Contains "+length+" atom.";
					} else {
						return "Contains "+length+" atoms.";
					}
				};
				
				viewmodel.keysObservable = ko.observableArray();
				viewmodel.atoms = ko.observableArray();
				
				viewmodel.parse = function() {
					// Update the atoms array with all the viewmodels referenced by the keys array.
					// No need to worry about duplication or deletion, as it's taken care of elsewhere.
					var keysObservable = [];
					var atoms = [];
					var keys = this.keys();
					var self = this;
					for ( var index in keys ) {
						var observable = ko.observable(keys[index]);
						observable.subscribe(function(newValue) {
						   self.record();
						});
						keysObservable.push( observable );
						atoms.push( atom.createViewModel(keys[index]) );
					}
					this.keysObservable(keysObservable);
					this.atoms(atoms);
				};
				//viewmodel.parse();
				
				viewmodel.record = function() {
					var keys = [];
					for ( var i = 0; i < this.keysObservable().length; i++ ) {
						var key = this.keysObservable()[i]();
						if ( key.trim() ) keys.push(key);
					}
					this.keys(keys);
					this.parse();
					this.save();
				};
				
				viewmodel.addKey = function( data, event ) {
					
					var target;
					if (event.target) target = event.target;
					else if (event.srcElement) target = event.srcElement;
					if (target.nodeType == 3) target = target.parentNode; // defeat Safari bug
					
					var key = ls.randomkey();
					
					this.keys.push(key);
					this.parse();
					this.record();
					
				};
				
				viewmodel.keysValidity = function( data ) {
					return atom.validity(data);
				}
				
				viewmodel.atomTemplate = function(viewmodel) {
					return "template_"+viewmodel.type;
				};
				
				// Extend view creation to trigger parsing only for the full view, so that infinite loops don't occur for folders containing itself as a card.
				viewmodel._createView = viewmodel.createView;
				viewmodel.createView = function( mode, transition ) {
					if ( mode == "full" ) {
						this.parse();
					}
					return viewmodel._createView( mode, transition );
				}
				
				return viewmodel;
			},
			
			views: {
				card: '\
					<li class="card" data-bind="click: full">\
						<h1 class="key" data-bind="text: key"></h1>\
						<div class="atom">\
							<h2 class="folder" data-bind="text: title"></h2>\
							<div data-bind="text: lengthText()"></div>\
						</div>\
					</li>\
				',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron" data-bind="css: { hide: !showback() }"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<!-- <li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li> -->\
							<li><a href="#" class="action" title="Return to Root" data-transition="push" data-bind="click: root"><i class="icon-storage"></i></a></li>\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push" data-bind="click: logout"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<ol data-bind="template: { name: atomTemplate, foreach: atoms}" >\
						</ol>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:saveback" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Delete" data-transition="push" data-bind="click:remove" ><i class="icon-trash"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset" data-bind="submit: saveback">\
							<label class="list-divider">Folder Name</label>\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<ul class="list" data-bind="foreach: keysObservable">\
							<!-- ko if: $index() == 0 -->\
								<li class="list-divider">Folder Content</li>\
							<!-- /ko -->\
							<input type="text" name="key" placeholder="Key" class="input-text folder-content-key" autocomplete="off" data-bind="value: $parent.keysObservable()[$index()], attr: { \'data-index\': $index } " />\
						</ul>\
						<button type="button" class="btn btn-block" data-bind="click: addKey">+</button>\
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
					index: true,
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
				
				viewmodel.index = ko.observable(model.index).extend({modelsync: [model, 'index']});
				viewmodel.all_keys = ko.observableArray(model.all_keys).extend({modelsync: [model, 'all_keys']});
				
				viewmodel.launchKey = function(
					data, 	// Implicit data argument.
					event	// Implicit event that is passed to every call.
				) {
					// Launches the index key.
					// Does no validation check, mind. Shouldn't be needed.
					var target;
					if (event.target) target = event.target;
					else if (event.srcElement) target = event.srcElement;
					if (target.nodeType == 3) target = target.parentNode; // defeat Safari bug
					var key = $(target).attr('data-key');
					var viewmodel = atom.createViewModel(key);
					viewmodel.full();
				};
				
				viewmodel.addIndex = function(
					key		// Key to add.
				) {
					// Adds any key to the all_keys index if not already there.
					// Does no validation check, mind. Shouldn't be needed.
					if ( key == this.key ) return;
					var exists = false;
					var list = this.all_keys();
					for ( var i in list ) {
						if ( list[i] == key ) exists = true;
					}
					if ( !exists) list.push(key);
					this.save();
				};
				viewmodel.removeIndex = function(
					key		// Key to remove.
				) {
					// Removes any key from the index if there at all.
					// Does no validation check, mind. Shouldn't be needed.
					if ( key == this.key ) return;
					this.all_keys.remove(key);
					this.save();
				};
				
				return viewmodel;
			},
			
			views: {
				card: '',
				full: '\
					<header class="action-bar fixed-top">\
						<a href="#" class="app-icon action up" data-bind="click:back">\
							<i class="chevron" data-bind="css: { hide: !showback() }"></i>\
						</a>\
						<h1 class="title" data-bind="text:key" ></h1>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Edit" data-transition="push" data-bind="click:edit" ><i class="icon-edit"></i></a></li>\
							<!-- <li><a href="#" class="action" title="Copy Atom Key" data-transition="push"><i class="icon-copy"></i></a></li> -->\
							<li><a href="#" class="action" title="Remove Passkey" data-transition="push" data-bind="click: logout"><i class="icon-key"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset">\
						<h1 data-bind="text:title" ></h1>\
						<ol data-bind="template: { name: atomTemplate, foreach: atoms }" >\
						</ol>\
						<ul class="list" data-bind="foreach: all_keys">\
							<!-- ko if: $index() == 0 -->\
								<li class="list-divider">All Atoms Under this PassKey</li>\
							<!-- /ko -->\
							<li class="list-item-single-line" data-bind="text: $data, click: $parent.launchKey, attr: { \'data-key\': $data }"></li>\
						</ul>\
					</div>\
				',
				edit: '\
					<header class="action-bar fixed-top">\
						<a href="index.html" class="action page-action" data-ignore="true" data-bind="click:saveback" >\
							<i class="icon-accept"></i>\
							<span class="action-title">Done</span>\
						</a>\
						<ul class="actions pull-right">\
							<li><a href="#" class="action" title="Delete" data-transition="push" data-bind="click:remove" ><i class="icon-trash"></i></a></li>\
						</ul>\
					</header>\
					<div class="content inset form-flex">\
						<form class="inset" data-bind="submit: saveback">\
							<label class="list-divider">Folder Name</label>\
							<input type="text" name="title" placeholder="Title" class="input-text" autocomplete="off" data-bind="value:title, valueUpdate: \'afterkeydown\'" />\
							<ul class="list" data-bind="foreach: keysObservable">\
							<!-- ko if: $index() == 0 -->\
								<li class="list-divider">Folder Content</li>\
							<!-- /ko -->\
							<input type="text" name="key" placeholder="Key" class="input-text folder-content-key" autocomplete="off" data-bind="value: $parent.keysObservable()[$index()], attr: { \'data-index\': $index } " />\
						</ul>\
						<button type="button" class="btn btn-block" data-bind="click: addKey">+</button>\
						</form>\
					</div>\
				',
			}
		},
		
	},
	
	init: function() {
		// Sets up things.
		$('body').append('<div style="display: none;" id="template_container"></div>');
		var template_container = $('#template_container');
		for ( var type in atom.definitions ) {
			var definition = atom.definitions[type];
			var template = "<script type='text/html' id='template_"+type+"'>"+definition.views['card']+"</script>";
			template_container.append($(template));
		}
	},
	
	create: function(
		type	// A string of the atom type name.
	) {
		// Creates and returns a blank atom of given type.
		// If given type does not exist, raises exception.
		if ( atom.definitions[type] === undefined ) {
			throw "Atom of type "+type+" is not defined.";
		} else {
			var atomobject = atom.definitions[type].Model();
			return atomobject;
		}
	},
	
	
	delete: function(
		key		// Key of atom object to delete.
	) {
		// Removes key from index.
		auth.active_passkey_viewmodel.removeIndex(key);
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
		
		//TODO: save to index.
		//var index = atom.createViewModel(auth.active_passkey);
		//if ( index.index() ) {
			//index.all_keys.push(atomobject.key);
		//}
		//console.log(index);
		
		var value = atom.stringify(atomobject);
		var index_key;
		if ( key === undefined ) {
			index_key = ls.set(value);
		} else {
			index_key = ls.set(value, key);
		}
		
		auth.active_passkey_viewmodel.addIndex(index_key);
		
		return index_key;
		
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
		// Returns retrieved parsed atom, or default atom with validity property set.
		
		var validity = atom.validity(key);
		
		//console.log(key);
		
		if ( validity === 'key' ) {
			var value = ls.get(key);
			return atom.parse(value);
		} else {
			return atom.create('default');
		}
		
	},
	
	
	parse: function(
		value	// A string being parsed as an atom.
	) {
		// Tries to parse given string as atom.
		// Returns generic atom if decryption failed.
		// Throws exception if decrypted object not an atom.
		// Returns decrypted atom.
		var atomobject = JSON.parse(auth.decrypt(value, auth.active_passkey));
		if ( !(atomobject.type in atom.definitions) ) {
			throw "Object is not an atom."; //TODO: Don't throw a fit, Return false so that default render can be made.
		} else {
			return atomobject;
		}
	},
	
	validity: function(
		key	// Key to check validity of.
	) {
		// Returns key validity by certain classes.
		if ( key.indexOf('://') >= 0 ) {
			return 'url';
		} else if ( key.length == ls.KEY_LENGTH && key.match(/^[a-f0-9]*$/i) !== null ) {
			if ( ls.exists(key) ) {
				try {
					var value = ls.get(key);
					var atomobject = atom.parse(value);
					return 'key';
				} catch (e) {
					return 'key_invalid';
				}
			} else {
				return 'key_new';
			}
		} else {
			return 'invalid';
		}	
	},
	
	createViewModel: function(
		key,	// An ls key that contains an atom object to create viewmodel of.
		force	//
	) {
	// If viewmodel does not exist retrieves the atom object/model of the given key, then creates a viewmodel of it. Else returns existing.
	// Returns the atom viewmodel object and appends it to the global list of active viewmodels if not present.

		if ( atom.active_atoms[key] && !force ) {
			
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
	
	createNewAtom: function(key) {
		return modal.create($('body'), "newatom", {'key': key, blacklist: ['default', 'index']});
	}
	
};
