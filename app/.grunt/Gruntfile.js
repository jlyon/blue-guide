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
        livereload: true,
      },
      css: {
        files: ['../sass/**/*.s*ss'],
        tasks: ['compass:dist']
      },
      coffee: {
        files: ['../coffeescript/*.coffee'],
        tasks: 'coffee:glob_to_multiple'
      }
    },
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
    /*coffeeredux: {
      options: {
        bare: true,
        sourceMap: true
      },
      compile: {
        files: {
          '../js/custom.js': ['../coffeescript/*.coffee']
        }
      }
    }*/
    coffee: {
      options: {
        bare: true,
        sourceMap: true
      },
      glob_to_multiple: {
        expand: true,
        flatten: true,
        cwd: '../coffeescript/',
        src: ['*.coffee'],
        dest: '../js/',
        ext: '.js'
      }
      //compile: {
      //  files: {
      //    // @todo: use wildcards
      //    '../js/custom.js': ['../coffeescript/*.coffee']
      //    /*'../js/filters.js': '../coffeescript/filters.coffee',
      //    '../js/general.js': '../coffeescript/general.coffee',
      //    '../js/GoogleSpreadsheetsQuery.js': '../coffeescript/GoogleSpreadsheetsQuery.coffee',
      //    '../js/jsonQuery.js': '../coffeescript/jsonQuery.coffee',
      //    '../js/map.js': '../coffeescript/map.coffee'
      //  }
      //}
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-coffee-redux');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  //grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['watch', 'compass', 'coffee']);
};
