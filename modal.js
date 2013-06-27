modal = {	// Implements modal dialogs because Fries doesn't yet.
	
	definitions: {
		example: {
			viewmodel: {
				views: [],
				remove: function(data, event) {
					for ( var i = this.views.length-1; i >= 0; i-- ) {
						var viewId = this.views[i];
						$('#'+viewId).remove();
					}
				}
			},
			view: '\
				<div class="modal_frame">\
					<div class="modal_container">\
						<div class="modal_window">\
							<div class="modal_header">Do something?</div>\
							<div class="modal_content">No warranties, you know!</div>\
							<div class="modal_buttons">\
								<div class="modal_button" data-bind="click: remove">Ok</div>\
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
		type
	) {
		// Creates and appends a modal dialog view to the given parent bound to the given type.
		
		// Create and append modal dialog to parent.
		var viewId = "modal_key_"+this.key+"_"+type+"_"+Math.floor(1000+Math.random()*9000);
		var view = "<div id='"+viewId+"' >"+modal.definitions[type].view+"</div>";
		parent.append($(view));
		$('#'+viewId).find('textarea').autoResizer();
		
		// Correct height for centering.
		var modal_window = $('#'+viewId).find('.modal_window');
		modal_window.css('margin-top', '-'+modal_window.height()/2+'px');
		
		// Bind viewmodel to view.
		var viewmodel = modal.definitions[type].viewmodel;
		viewmodel.views.push(viewId);
		ko.applyBindings( viewmodel, $("#"+viewId)[0] );
		
		// Append to list and return.
		return viewId;
		
	},
	
};
