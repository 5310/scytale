window.onload = function() {
	 
	a_key = atom.store(atom.create("note"));
	var a = atom.createViewModel(a_key);
	//a.createView("edit", $('#target'));
	a.createView("full", $('#target'));
	
	/*setTimeout( function() {
		console.log(atom.retrieve(a_key)); 
		a.title('Another'); 
		a.saveModel(); 
		console.log(atom.retrieve(a_key)); 
		a.deleteViewModel();
	}, 1000 );*/
	
}
