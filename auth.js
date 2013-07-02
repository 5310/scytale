auth = {	// Module with all the authentication and encryption routines and states.
	
	
	active_passkey: "ahem", //Math.random().toString()+Math.random().toString(),	// Stores the currently active passkey to encrypt and decrypt all things. Yeah, I know...
	active_passkey_viewmodel: undefined,
	iv_string: Math.random().toString()+Math.random().toString(), 	// CONSTANT: iv value for AES. Heh...yeah...
	salt: "maria",	// String to salt passkey hashes with.
	
	
	init: function() {
		this.createLogScreen();
	},
	
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
	
	createLogScreen: function(parent) {
		
		var parent = parent ? parent : $('body');
		
		var viewmodel = {
			passkey: ko.observable(""),
			login: function() {
				auth.login(this.passkey());
			}
		};
		
		var view = '\
			<div class="page logscreen">\
			  <div class="content">\
				  <div class="content container">\
					<form class="inset" data-bind="submit: login">\
					  <input type="password" name="password" placeholder="Passkey" class="input-text centered large" data-bind="value: passkey, valueUpdate: \'afterkeydown\'">\
					  <div class="form-actions">\
						<input type="submit" class="btn btn-block submit" value="Enter">\
					  </div>\
					</form>\
				  </div>\
			  </div>\
			</div>\
		';
		
		var viewId = "logscreen"+Math.floor(1000+Math.random()*9000);
		view = "<div id='"+viewId+"' >"+view+"</div>";
		parent.append($(view));
		$('#'+viewId).find('textarea').autoResizer();
		ko.applyBindings( viewmodel, $("#"+viewId)[0] );
		
		return viewId;
		
	},
	
	login: function(
		passkey		// Passkey as string.
	) {
		// Logs into a given passkey.
		// Does nothing to clear previous atoms in memory, and just another index to the stack.
		
		// Set active_passkey.
		auth.active_passkey = passkey;

		// Define index key.
		var hashed_passkey = auth.hash(auth.active_passkey, auth.salt);
		var key = hashed_passkey;
		
		// Create index if non-existent.
		if ( atom.validity(key) != 'key' ) {
			var atomobject = atom.create("index");
			ls.set(atom.stringify(atomobject), key);
		}
		
		// Render index.
		var model = atom.parse(ls.get(key));
		var viewmodel = atom.definitions[model.type].ViewModel(model, key);
		auth.active_passkey_viewmodel = viewmodel;
		viewmodel.createView("full", true);
		
		return viewmodel;
		
	},
	
	logout: function() {
		document.location = "index.html";
	},
	
};
