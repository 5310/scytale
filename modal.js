modal = {	// Implements modal dialogs because Fries doesn't yet.
	
	definitions: {
		example: {
			ViewModel: function(data) {
				var viewmodel = {};
				viewmodel.views = [];
				viewmodel.remove = function(data, event) {
					var self = viewmodel;
					for ( var i = self.views.length-1; i >= 0; i-- ) {
						var viewId = self.views[i];
						$('#'+viewId).remove();
					}
				};
				viewmodel.back = function() {
					trans.back();
				}
				return viewmodel;
			},
			view: '\
				<div class="modal_frame">\
					<div class="modal_container">\
						<div class="modal_window">\
							<div class="modal_header">Do something?</div>\
							<div class="modal_content padded">No warranties, you know!</div>\
							<div class="modal_buttons">\
								<div class="modal_button half" data-bind="click: remove">Ok</div>\
								<div class="modal_button half" data-bind="click: remove">Cancel</div>\
							</div>\
						</div>\
					</div>\
				</div>\
			'
		},
		newatom: {
			ViewModel: function(data) {
				var viewmodel = modal.definitions['example'].ViewModel();
				viewmodel.key = data.key;
				viewmodel.blacklist = data.blacklist ? data.blacklist : [];
				viewmodel.types = function() {
					var list = [];
					for ( var type in atom.definitions) {
						var passed = true;
						for ( var i = 0; i < this.blacklist.length; i++) {
							if ( this.blacklist[i] == type ) passed = false;
						}
						if ( passed ) list.push(type.trim());
					}
					return list;
				};
				viewmodel.capitalize = function(string) {
					return string.charAt(0).toUpperCase() + string.slice(1);
				}
				viewmodel.create = function() {
					var target;
					if (event.target) target = event.target;
					else if (event.srcElement) target = event.srcElement;
					if (target.nodeType == 3) target = target.parentNode; // defeat Safari bug
					var type = $(target).attr('data-type');
					if ( viewmodel.key ) {
						var model = atom.create(type);
						var key = atom.store(model, viewmodel.key);
					} else {
						var model = atom.create(type);
						var key = atom.store(model);
					}
					//var vm = atom.definitions[model.type].ViewModel( model, key ); atom.active_atoms[key] = viewmodel;
					var vm = atom.createViewModel(key, true);
					vm.save();
					vm.createView("edit", true);
					return key;
				}
				return viewmodel;
			},
			view: '\
				<div class="modal_frame">\
					<div class="modal_container">\
						<div class="modal_window">\
							<div class="modal_header">Choose Atom to create.</div>\
							<div class="modal_content" data-bind="foreach: types()">\
								<div class="modal_button" data-bind="text: $parent.capitalize($data), click: $parent.create, attr: { \'data-type\': $data } "></div>\
							</div>\
							<div class="modal_buttons">\
								<div class="modal_button" data-bind="click: remove">Cancel</div>\
							</div>\
						</div>\
					</div>\
				</div>\
			'
		},
	},
	
	create: function(
		parent,
		type,
		data
	) {
		// Creates and appends a modal dialog view to the given parent bound to the given type.
		
		// Create and append modal dialog to parent.
		var viewId = "modal_key_"+type+"_"+Math.floor(1000+Math.random()*9000);
		var view = "<div id='"+viewId+"' >"+modal.definitions[type].view+"</div>";
		parent.append($(view));
		$('#'+viewId).find('textarea').autoResizer();
		
		// Bind viewmodel to view.
		var viewmodel = modal.definitions[type].ViewModel(data);
		viewmodel.views.push(viewId);
		ko.applyBindings( viewmodel, $("#"+viewId)[0] );
		
		// Correct height for centering.
		var modal_window = $('#'+viewId).find('.modal_window');
		modal_window.css('margin-top', '-'+modal_window.height()/2+'px');
		
		// Append to list and return.
		return viewId;
		
	},
	
};
