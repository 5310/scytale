window.onload = function() {
	
	trans.init();
	 
	//a_key = atom.store(atom.create("note"));
	a_key = "a5fa6b36dd696487";
	a = atom.createViewModel(a_key);
	a.keys(['a5fa6b36dd696487', 'be435b6c59e06201']); a.parse();
	a.all_keys(['a5fa6b36dd696387', 'be435b6c59e06201', 'a5fa6b36dd696487', 'a5fa6b36dd696487', 'a5fa6b36dd696487']);
	a.createView("full", true);
	//a.createView("edit");
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
