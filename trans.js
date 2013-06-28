trans = {
	
	
	stack: [],			// A stack of all pages rendered by their ID.
	parent: undefined,	// Default parent for all pages.
	
	init: function() {
		// Initializes all the transition related stuff.
		
		//$(document.body).transition('options', {defaultPageTransition : 'slide', domCache : true});
		
		trans.parent = $('body');
		
		$(document).bind('pagehide', function(event, element) {
			
			trans.deletePage(event, element);
			
		});
		
	},
	
	back: function() {
		// Goes back to the previous page in the stack.
		// If the previous page is just an id, show it.
		// Else, assume it's for an atom 
		// and that the first element is they key, and the second the desired view mode.
		if ( trans.stack.length > 1 ) {
			var prev = trans.stack[trans.stack.length-2];
			if ( typeof prev === "string" ) {
				$(document).transition('to', prev, 'slide', 'reverse');
			} else {
				var key = prev[0];
				var mode = prev[1];
				var viewmodel = atom.createViewModel(key);
				viewmodel.createView(mode, ['slide', "reverse"]);
				trans.stack.pop();
			}
			trans.stack.pop();
		}		
	},
	
	root: function() {
		if ( trans.stack.length > 1 ) {
			var root = trans.stack[0];
			trans.stack = [];
			var key = root[0];
			var mode = root[1];
			var viewmodel = atom.createViewModel(key);
			viewmodel.createView(mode, ['slide', "reverse"]);
		}	
	},
	
	deletePreviousKey: function(
		key		// Element to compare against.
	) {
		for ( var i = 0; i < trans.stack.length-1; i++ ) {
			if ( trans.stack[i][0] == key ) {
				trans.stack = trans.stack.splice(i, 1);
			}
		}
	},
	
	deletePage: function(event, element) {
		//TODO: Delete the page when returning from it and it's viewmodel if any.
		var viewmodel = ko.dataFor(element);
		var viewId = $(element).attr('id');
		if ( viewmodel ) {
			viewmodel.deleteView(viewId);
		} else {
			$(element).remove();
		}
	}
	
	
};
