window.onload = function() {
	
	atom.init();
	trans.init();
	 
	a_key = atom.store(atom.create("folder"));
	//a_key = "64dd7cbb57dccd35";
	a = atom.createViewModel(a_key);
	a.keys(["3204d789083f7785", "4b31df307b38dc27", "d7ed7ab113c36a0d", "64dd7cbb57dccd35", "64ddxcbb57dccd35"]); a.parse();
	//a.keys(['a5fa6b36dd696387', 'be435b6c59e06201', 'a5fa6b36dd696487', 'a5fa6b36dd692487', 'a5fa6b36dd696487']);
	a.save();
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
