window.onload = function() {
	 
	a_key = atom.store(atom.create("note"));
	a = atom.createViewModel(a_key);
	//a.createView("edit", $('#target'));
	a.createView("full", $('body'));
	//a.createView("edit", $('body'));
	
	/*setTimeout( function() {
		console.log(atom.retrieve(a_key)); 
		a.title('Another'); 
		a.saveModel(); 
		console.log(atom.retrieve(a_key)); 
		//a.deleteViewModel();
	}, 1000 );*/
	
}
