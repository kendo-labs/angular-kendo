module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: [ 'angular-kendo.js' ],
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      main: {
        files: [{
          src: ['docs/angular-kendo.html'],
          dest: 'app/partials/docs.html',
          filter: 'isFile'
        }]
      }
    },
    watch: {
      scripts: {
        files: "angular-kendo.js",
        tasks: ['default']
      }
    },
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        github: 'kendo-labs/angular-kendo',
        version: grunt.file.readJSON('bower.json').version
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('debug', ['default', 'watch']);

};
