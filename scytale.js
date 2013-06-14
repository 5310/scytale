ls = {
	KEY_LENGTH: 16,	// Length of all keys in the localStorage, as well as use length of hashes, etc. A constant.
	// A shorthand wrapper for localStorage with some utilities.
	exists: function(
		key		// A string (or string-assumed) key to query localStorage for existence.
	) {
		// Returns true if a key already exists in localStorage.
		if (localStorage.getItem(key) === null) {
			return false;
		} else {
			return true;
		}
	},
	randomkey: function() {
		// Returns a randomly generated hexadecimal key that does not exist in the localStorage by the constant key length.
		var key = undefined;
		while ( key === undefined || ls.exists(key) ) {
			key = "";
			for ( var i = 0; i < ls.KEY_LENGTH; i++ ) {
			key += "x";
			}
			key = key.replace(/[x]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
			});
		}
		return key;
	},
	set: function(
		value,	// A string (or string-assumed) data to store to the localStorage.
		key		// A specific string (or string-assumed) key to try to store the value to.
	){
		// Sets value in localStorage, optionally with a given key.
		// Returns the stored value key if successful.
		// Overwrites with impunity.
		var key = key === undefined ? ls.randomkey() : key;
		localStorage.setItem(key, value);
		return key;
	},
	get: function(
		key		// A string (or string-assumed) key to query the localStorage for.
	) {
		// Returns the value associated with the given key if it exists, or else returns null.
		// A shorthand, honestly.
		return localStorage.getItem(key);
	},
	del: function(
		key		// A string (or string-assumed) key to delete from the localStorage.
	) {
		// Removes the given key from localStorage if it exists in the first place.
		localStorage.removeItem(key);
	},
	clear: function() {
		// Shorthand to clear all of localStorage. Use only for debugging now!
		localStorage.clear();
	},
};

atom = {
	// Module with all the atom related functions and definitions.
	active_atoms: {}, // Stores actively loaded and decrypted atom viewmodels.
	definitions: { //TODO:
	// Definitions for atom types.
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
				
				viewmodel.saveModel = function() {
					// Save the viewmodel's content. By which we mean the underlying model itself to the localstore.
					atom.store(this.model, this.key);
				};
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
				viewmodel.createViewmodel = function(
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
					parent		// A DOM object (or jQuery object) to append the rendered element to.
				) {
					// Renders a view by mode from viewmodel under a specific parent.
					// Returns view id, and adds it to the viewmodel's list.
					// Get parent DOM object.
					parent = parent.jquery ? parent[0] : parent;
					
					// Create and append view.
					var viewId = "atom_"+this.key+"_"+mode+"_"+Math.floor(1000+Math.random()*9000);
					var view = "<div id='"+viewId+"'>"+atom.definitions[this.type].views[mode]+"</div>";
					parent.append($(view));
					
					// Bind viewmodel to view.
					ko.applyBindings( this, $("#"+viewId)[0] );
					
					// Append to list and return.
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
						this.deleteViewmodel();
					}
				};
				
				return viewmodel;
			},
			views: {
				list: "",
				card: "",
				full: "<div data-bind='text: key'></div>",
				edit: ""
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
				card: "",
				full: "\
					<div data-bind='text: title'></div>\
					<div data-bind='text: content'></div>\
				",
				edit: "\
					<input data-bind='value: title'></input>\
					<textarea data-bind='value: content'></textarea>\
				"
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
	var atomobject = JSON.parse(auth.decrypt(value, auth.active_passkey));
	if ( !(atomobject.type in atom.definitions) ) {
		throw "Object is not an atom." //TODO: Don't throw a fit, Return false so that default render can be made.
	} else {
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

auth = {
	// Module with all the authentication and encryption routines and states.
	active_passkey: Math.random().toString()+Math.random().toString(),	// Stores the currently active passkey to encrypt and decrypt all things. Yeah, I know...
	iv_string: Math.random().toString()+Math.random().toString(), 	// CONSTANT: iv value for AES. Heh...yeah...
	hash: function(
		value, 	// A string (or string-assumed) value to hash.
		salt	// A salt to hash it with.
	) {
	// Returns the optionally salted hash of the given value.
	salt = salt ? salt : "";
	var hashed = CryptoJS.SHA3(value+salt);
	hashed = CryptoJS.enc.Hex.stringify(hashed);
	hashed = hashed.substr(0, ls.KEY_LENGTH);
	return hashed;
	},
	encrypt: function(
		message,  	// A string (or string-assumed) value to encrypt.	
		passkey	// An optional string passkey to encrypt with, otherwise the active one.
	) {
	// Encrypts given string message with passkey.
	var passkey = passkey === undefined ? auth.hash(auth.active_passkey, "enc") : auth.hash(passkey, "enc"),
		passkey64 = atob(passkey), // base 64 encode the key
		message = message,
		iv = CryptoJS.enc.Hex.parse(auth.iv_string),
		encrypted = CryptoJS.AES.encrypt(message, passkey, {iv: iv}).toString();
	return encrypted;
	},
	decrypt: function(
		message,  	// A string (or string-assumed) value to decrypt.	
		passkey	// An optional string passkey to decrypt with, otherwise the active one.
	) {
	// Decrypts givens string message with passkey.
	var passkey = passkey === undefined ? auth.hash(auth.active_passkey, "enc") : auth.hash(passkey, "enc");
	var decrypted = CryptoJS.AES.decrypt(message, passkey).toString(CryptoJS.enc.Utf8);
	return decrypted;		
	},
	login: function(passkey) {},
	logout: function() {},   
};

window.onload = function() {
	 
	a_key = atom.store(atom.create("note"));
	var a = atom.createViewModel(a_key);
	a.createView("edit", $('body'));
	a.createView("full", $('body'));
	
	setTimeout( function() {
		console.log(atom.retrieve(a_key)); 
		a.title('Another'); 
		a.saveModel(); 
		console.log(atom.retrieve(a_key)); 
		a.deleteViewModel();
	}, 1000 );
	
}
