ls = { 		// A shorthand wrapper for localStorage with some utilities.
	
	
	KEY_LENGTH: 16,	// Length of all keys in the localStorage, as well as use length of hashes, etc. A constant.
	
	
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
	
	
	ls: function() {
		// Returns a list with all the keys in the localStorage. Because reasons.
		var list = [];
		for ( var key in localStorage ) {
			list.push(key);
		}
		return list;
	},
	
	
};
