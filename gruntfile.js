module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      config: {
        options: {
          banner: "(function(angular) {",
          footer: "}(angular));"
        }
      },
      dist: {
        src: ['src/main.js',
              'src/services/widget.js',
              'src/factories/widget.js',
              'src/factories/directive.js',
              'src/directives/widgets.js',
              'src/directives/dataSource.js'],
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
    // docco: {
    //   build: {
    //     src: [ '<%= pkg.name %>.js' ],
    //     options: {
    //       css: 'app/css/docco.css',
    //       output: 'docs/'
    //     }
    //   }
    // },
    copy: {
      main: {
        files: [
          { src: ['docs/angular-kendo.html'], dest: 'app/partials/docs.html', filter: 'isFile' }, // includes files in path
        ]
      }
    },
    watch: {
      scripts: {
        files: "src/**/*.js",
        tasks: "default"
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

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};
