auth = {	// Module with all the authentication and encryption routines and states.
	
	
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
	
	
	login: function(passkey) {},	//TODO:
	
	
	logout: function() {},   		//TODO:
	
	
};
