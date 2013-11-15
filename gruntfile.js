module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: "(function(angular) {",
        footer: "}(angular));"
      },
      dist: {
        src: [
            'src/main.js',
            'src/services/widget.js',
            'src/services/kendoDecorator.js',
            'src/factories/widget.js',
            'src/factories/directive.js',
            'src/directives/widgets.js',
            'src/directives/dataSource.js',
            'src/directives/kendoGrid.js'],
        dest: 'build/angular-kendo.js'
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/angular-kendo.js',
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
        files: "src/**/*.js",
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

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-conventional-changelog');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('debug', ['default', 'watch']);

};
