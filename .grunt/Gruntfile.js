'use strict';
var path = require('path');
//var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // Configuration to be run (and then tested)
    watch: {
      options: {
        livereload: false,
      },
      css: {
        files: ['../sass/**/*.s*ss'],
        tasks: ['compass:dist']
      }
    },
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  //grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['watch', 'compass']);
};
