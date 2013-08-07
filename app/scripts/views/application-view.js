define([

	// libs
	'jquery',
	'backbone'
],

function($, Backbone) {

	'use strict';

	var ApplicationView = Backbone.View.extend({

		render: function() {

			console.log('ApplicationView.render:');

			this.$el.html('<h1>' + this.model.get('message') + '</h1>');
		}
	});

	return ApplicationView;
});
