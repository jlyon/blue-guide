define([

	//libs
	'backbone'

],

function(Backbone) {
	
	'use strict';

	var ApplicationModel = Backbone.Model.extend({

		defaults: {
			message: 'Hello Phonegap!'
		}
	});

	return ApplicationModel;
});