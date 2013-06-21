window.onload = function() {
	
	trans.init();
	 
	a_key = atom.store(atom.create("link"));
	a = atom.createViewModel(a_key);
	//a.createView("edit");
	a.createView("full", true);
	//a.deleteViewModel();
	
	//b_key = atom.store(atom.create("note"));
	//b = atom.createViewModel(b_key);
	//b.createView("full", true);
	
	/*setTimeout( function() {
		console.log(atom.retrieve(a_key)); 
		a.title('Another'); 
		a.saveModel(); 
		console.log(atom.retrieve(a_key)); 
		//a.deleteViewModel();
	}, 1000 );*/
	
}
