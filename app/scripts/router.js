define([

  // libs
  'jquery',
  'backbone',

  // Application.
  'app',

  // Views
  'views/application-view',

  // Models
  'models/application-model'
],

function($, Backbone, app, ApplicationView, ApplicationModel) {

  'use strict';

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      '': 'index'
    },

    index: function() {

      console.log('Router.index');

      // Create a basic view to display the contents of a model
      new ApplicationView({
        el: $('#main'),
        model: new ApplicationModel()
      }).render();
    }
  });

  return Router;

});
