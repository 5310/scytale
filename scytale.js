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
				if ( model.type === "default" ) {
					throw "Model is not of same atom type as viewmodel.";
				} else {
					var viewmodel = {};
					viewmodel.model = model;
					viewmodel.key = key;
					viewmodel.age = 0;
					viewmodel.active = true;
					viewmodel.type = model.type;
					viewmodel.save = function() {
						atom.store(this.model, this.key);
					};
					return viewmodel;
				}
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
				if ( model.type !== "note" ) {
					throw "Model is not of same atom type as viewmodel.";
				} else {
					var viewmodel = {};
					
					viewmodel.model = model;
					viewmodel.key = key;
					viewmodel.age = 0;
					viewmodel.active = true;
					viewmodel.type = model.type;
					viewmodel.save = function() {
						atom.store(this.model, this.key);
					};
					
					viewmodel.title = ko.observable(model.title).extend({modelsync: [model, 'title']});
					viewmodel.content = ko.observable(model.content).extend({modelsync: [model, 'content']});
					
					return viewmodel;
				}
			},
			views: {
				list: "",
				card: "",
				full: "\
					<h1 data-bind='text: title'></h1>\
					<pre data-bind='text: content'></pre>\
				",
				edit: "\
					<input data-bind='text: title'></input>\
					<textarea data-bind='text: content'></textarea>\
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
	render: function(
		key,	// An ls key that contains an atom object to render. 
		mode,	// A string specifying the template mode. "list", "display" and "edit" are standard ones.
		parent	// A DOM object (or jQuery object) to append the rendered element to.
	) {
	// Renders the atom on the given key as DOM via given mode and appends the bound view to the given parent.
	// Returns the KO viewmodel object.
	
		// Get atom object and model for the KO operation.
		var model = atom.retrieve(key);
		
		// Get parent DOM object.
		parent = parent.jquery ? parent[0] : parent;
		
		// Append view.
		var id = "atom_"+key;
		var view = "<div id='"+id+"'>"+atom.definitions[model.type].views[mode]+"</div>";
		parent.append($(view));
		
		// Create viewmodel and bind it.
		var viewmodel = atom.definitions[model.type].ViewModel( model, key );
		ko.applyBindings( viewmodel, document.getElementById(id) );
		
		return viewmodel;
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
	  
	  
	a = atom.store(atom.create("note"));
	a_vm = atom.render(a, "full", $('body'));
	
	setTimeout( function() {
		console.log(atom.retrieve(a)); 
		a_vm.title('Another'); 
		a_vm.save(); 
		console.log(atom.retrieve(a))
	}, 1000 );
	
	
}
