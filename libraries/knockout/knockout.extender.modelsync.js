ko.extenders.modelsync = function(
	target, 	// Implicit: The target observable.
	option		// An array with a (model) object reference and a key string in that order, to sync one way with the observable's change.
) {
	// Syncs any changes made to the observable back to any object and property reference pair.
	// This'll let me implement proper models to store, instead of the messy viewmodels of KO.
	
	if ( typeof option[0] === "object" && typeof option[1] === "string" ) {
		target.subscribe(function(newValue) {
		   option[0][option[1]] = newValue;
		});
	} else {
		throw "Given object and property to sync to is not valid.";
	}
    
    return target;
    
};
