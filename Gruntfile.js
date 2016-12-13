module.exports = function(grunt) {

	require('jit-grunt')(grunt, {
		sprite: 'grunt-spritesmith',
		cachebreaker: 'grunt-cache-breaker',
		replace: 'grunt-text-replace',
		cmq: 'grunt-combine-media-queries',
		bower: 'grunt-bower-task'
	});

	require('time-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sourcePath: 'src',
		precompiledPath: '.tmp',
		distributionPath: 'dist',
		buildPath: 'build',

		packagePath: 'git_submodules',

		bower: {
			install : {
				options: {
					targetDir: './bower_components/',
					layout: 'byComponent',
					install: true,
					verbose: false,
					cleanTargetDir: false,
					cleanBowerDir: false,
					bowerOptions: {
						forceLatest: false,
						production: true,
					}
				}
			}
		},

		sass_globbing: {
			options: {
				signature: false
			},
			packages: {
				files: {
					'<%= sourcePath %>/assets/sass/_tipi.import.frameworks.scss': [
						'bower_components/bourbon/app/assets/stylesheets/_bourbon.scss',
					],
					'<%= sourcePath %>/assets/sass/_tipi.import.packages.scss': [
						'<%= packagePath %>/**/*tipi.base.*.scss',
						'<%= packagePath %>/**/*tipi.tool.*.scss',
						'<%= packagePath %>/**/*tipi.component.*.scss',
						'!**/__*.scss'
					]
				}
			},
			source: {
				files: {
					'<%= sourcePath %>/assets/sass/_tipi.import.core.scss': [
						'<%= sourcePath %>/assets/sass/tipi.core/variables/**.scss',
						'<%= sourcePath %>/assets/sass/tipi.core/mixins/**.scss',
						'!**/__*.scss'
					],
					'<%= sourcePath %>/assets/sass/_tipi.import.custom-components.scss': [
						'<%= sourcePath %>/assets/sass/tipi.custom-components/**/*.scss',
						'!**/__*.scss'
					],

				}
			}
		},

		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'expanded',
				sourceComments: false,
			},
			source: {
				files: {
					'<%= precompiledPath %>/assets/css/tipi.css': '<%= sourcePath %>/assets/sass/tipi.scss'
				}
			}
		},

		sprite:{
			source: {
				src: '<%= sourcePath %>/assets/img/layout/sprite/*.png',
				cssTemplate: '<%= sourcePath %>/assets/img/layout/sprite/config.handlebars',
				dest: '<%= precompiledPath %>/assets/img/layout/sprite.png',
				destCss: '<%= precompiledPath %>/assets/css/tipi.sprite.css',
				cssHandlebarsHelpers : {
					divideRetina : function(value) {
						return parseInt(value) / 2;
					}
				}
			}
		},

		svgstore: {
			options: {
				cleanup: [
					'fill',
					'stroke',
					'fill-rule',
					'stroke-width',
					'id'
				],
				cleanupdefs: true,
				prefix : 'glyph-',
				inheritviewbox: true
			},
			source: {
				files: {
					'<%= precompiledPath %>/assets/img/layout/svg-sprite.svg': [
						'<%= sourcePath %>/assets/img/layout/svg-sprite/**/*.svg'
					]
				}
			}
		},

		concat: {
			options: {
				separator: ';',
				sourceMap: true
			},
			modules : {
				src: (function () {
					var cwd = "<%= sourcePath %>/assets/js/modules/";
					var files = [
						"**/*.js",
					];

					files = files.map(function (file) {
						return cwd + file;
					});

					return files;
				}()),
				dest: '<%= precompiledPath %>/assets/js/modules.js',
			},
			packages : {
				src: (function () {
					var cwd = "<%= packagePath %>/";
					var files = [
						"**/tipi.*.js",
					];

					files = files.map(function (file) {
						return cwd + file;
					});

					return files;
				}()),
				dest: '<%= precompiledPath %>/assets/js/lib/tipi/tipi.js',
			}
		},

		zetzer: {
			options: {
				partials: "<%= sourcePath %>/inc/partials/",
				templates: "<%= sourcePath %>/inc/templates/",
				dot_template_settings: {
					strip: false
				}
			},
			source: {
				files: [{
					expand: true,
					cwd: '<%= sourcePath %>/',
					src: [
						'**/*.html',
						'!**/inc/**'
					],
					dest: '<%= precompiledPath %>/',
					ext: '.html'
				}]
			},
			modules: {
				files: [{
					expand: true,
					cwd: 'git_submodules/',
					src: [
						'tipi.*/*.html',
						'!**/inc/**'
					],
					dest: '<%= precompiledPath %>/modules/',
					ext: '.html',
				}]
			}
		},

		clean: {
			gruntFolders: {
				src: [
					'<%= precompiledPath %>',
					'<%= distributionPath %>',
					'<%= buildPath %>'
				]
			}
		},

		copy: {
			bower_to_distribution: {
				expand: true,
				cwd: 'bower_components/',
				src: [
					'jquery/**',
					'svg-sprite-injector/**'
				],
				dest: '<%= distributionPath %>/assets/js/lib/'
			},
			precompiled_to_distribution: {
				expand: true,
				cwd: '<%= precompiledPath %>/',
				src: [
					'assets/**',
					'**/*.html'
				],
				dest: '<%= distributionPath %>/'
			},
			source_to_distribution: {
				expand: true,
				cwd: '<%= sourcePath %>/',
				src: [
					'assets/js/**',
					'assets/img/**',
					'!assets/img/layout/sprite/**',
					'!assets/img/layout/svg-sprite/**',
				],
				dest: '<%= distributionPath %>/'
			},
			distribution_to_production: {
				expand: true,
				cwd: '<%= distributionPath %>/',
				dest: '<%= buildPath %>/',
				src: [
					'**'
				],
			}
		},

		cssmin: {
			production: {
				files: [{
					expand: true,
					cwd: '<%= precompiledPath %>/assets/css',
					src: ['*.css', '!*.min.css'],
					dest: '<%= buildPath %>/assets/css',
					ext: '.min.css'
				}]
			}
		},

		cmq: {
			production: {
				files: {
					'<%= buildPath %>/assets/css/': ['<%= buildPath %>/assets/css/*.css']
				}
			}
		},

		imagemin: {
			production: {
				options: {
					optimizationLevel: 3
				},
				files: [{
					expand: true,
					cwd: '<%= sourcePath %>/assets/img/',
					src: [
						'**/*.{png,jpg,jpeg,gif}',
					],
					dest: '<%= buildPath %>/assets/img/'
				}]
			}
		},

		uglify: {
			options: {
				compress : {
					drop_console : true
				},
				sourceMap : false
			},
			bower_components: {
				files: {
					'<%= distributionPath %>/assets/js/lib/svg-sprite-injector/svg-sprite-injector.min.js': '<%= distributionPath %>/assets/js/lib/svg-sprite-injector/svg-sprite-injector.js'
				}
			},
			production: {
				files: {
					'<%= buildPath %>/assets/js/lib/tipi/tipi.min.js': '<%= distributionPath %>/assets/js/lib/tipi/tipi.js',
					'<%= buildPath %>/assets/js/modules.min.js': '<%= distributionPath %>/assets/js/modules.js',
					'<%= buildPath %>/assets/js/main.min.js': '<%= distributionPath %>/assets/js/main.js'
				}
			}
		},

		replace: {
			production: {
				src: ['<%= buildPath %>/**/*.html'],
				overwrite: true,
				replacements: [
					{
						from: 'tipi.css',
						to: 'tipi.min.css'
					},
					{
						from: 'tipi.sprite.css',
						to: 'tipi.sprite.min.css'
					},
					{
						from: 'main.js',
						to: 'main.min.js'
					},
					{
						from: 'tipi.js',
						to: 'tipi.min.js'
					},
					{
						from: 'svg-sprite-injector.js',
						to: 'svg-sprite-injector.min.js'
					}
				]
			}
		},

		cachebreaker: {
			distribution: {
				options: {
					match : [
						'cached'
					]
				},
				files: {
					src: [
						'<%= distributionPath %>/**/*.html',
					]
				}
			},

			production: {
				options: {
					match: [
						'cached',
						'css/*/tipi.min.css',
						'js/*/tipi.min.js',
						'js/*/modules.min.js'
					]
				},
				files: {
					src: [
						'<%= buildPath %>/**/*.html'
					]
				}
			}
		},

		watch: {
			options: {
				spawn: false
			},
			assets: {
				files: [
					'<%= sourcePath %>/assets/**/*',

					'!<%= sourcePath %>/assets/**/_tipi.import.*',
					'!**/node_modules/**'
				],
				tasks: [
					'newer:copy:source_to_distribution',
				],
				options : {
					event: ['added', 'deleted']
				}
			},
			packages: {
				files: [
					'<%= packagePath %>/**/*',

					'!**/node_modules/**',
				],
				tasks: [
					'sass_globbing:packages',
					'concat:packages',
					'copy:precompiled_to_distribution',
					'copy:source_to_distribution'
				],
				options: {
					event: ['added', 'deleted'],
				}
			},
			sass_globbing: {
				files: [
					'<%= sourcePath %>/assets/sass/**/*.scss',

					'!<%= sourcePath %>/assets/**/_tipi.import.*',
					'!**/node_modules/**',
				],
				tasks: [
					'sass_globbing:source',
				],
				options: {
					event: ['added', 'deleted'],
				}
			},
			scss: {
				files: [
					'<%= sourcePath %>/assets/sass/**/*.scss',
					'git_submodules/**/*.scss',

					'!<%= sourcePath %>/assets/**/_tipi.import.*',
					'!**/node_modules/**',
				],
				tasks: [
					'sass:source',
					'copy:precompiled_to_distribution',
					'newer:copy:source_to_distribution',
				],
				options: {
					interrupt: true,
					spawn : true
				}
			},
			sprite: {
				files: [
					'<%= sourcePath %>/assets/img/**/sprite/**/*.png'
				],
				tasks: [
					'sprite:source',
					'copy:precompiled_to_distribution',
				]
			},
			svgsprite: {
				files: [
					'<%= sourcePath %>/assets/img/**/svg-sprite/**/*.svg'
				],
				tasks: [
					'svgstore:source',
					'copy:precompiled_to_distribution',
					'cachebreaker:distribution'
				]
			},
			js: {
				files: [
					'<%= sourcePath %>/assets/js/**/*.js',
					'git_submodules/**/*.js',
				],
				tasks: [
					'concat:modules',
					'concat:packages',
					'newer:copy:precompiled_to_distribution',
					'newer:copy:source_to_distribution'
				]
			},
			html: {
				files: [
					'<%= sourcePath %>/**/*.html',
					'git_submodules/**/*.html'
				],
				tasks: [
					'zetzer:source',
					'zetzer:modules',
					'newer:copy:precompiled_to_distribution'
				],
				options : {
					livereload : true,
					livereloadOnError: false
				}
			},
			reload: {
				files: [
					'<%= distributionPath %>/**/*.css'
				],
				options : {
					livereload : true,
					livereloadOnError: false
				}
			},
			config: {
				files : [
					'Gruntfile.js'
				],
				options : {
					reload : true
				}
			}
		},

		connect: {
			distribution: {
				options: {
					port: 8000,
					base: '<%= distributionPath %>',
					livereload: true,
					open: {
						target: 'http://localhost:8000'
					}
				}
			}
		},

		concurrent: {
			distribution: [
				[
					'clean:gruntFolders',
					'bower:install',
					'copy:bower_to_distribution',
					'uglify:bower_components'
				],
				[
					'sass_globbing:packages',
					'sass_globbing:source',
					'sass:source',
					'sprite:source',
					'svgstore:source',
					'concat:packages',
					'concat:modules',
					'zetzer:source',
					'zetzer:modules',
					'copy:precompiled_to_distribution',
					'copy:source_to_distribution'
				]
			],
			production: [
				[
					'imagemin:production',
				],
				[
					'uglify:production',
					'cmq:production',
					'cssmin:production'
				],
				[
					'replace:production',
					'cachebreaker:production'
				]

			]
		}
	});

	grunt.registerTask(
		'default', [
			'concurrent:distribution'
		]
	);


	grunt.registerTask(
		'serve', [
			'concurrent:distribution',
			'connect:distribution',
			'watch'
		]
	);

	grunt.registerTask(
		'build', [
			'concurrent:distribution',
			'copy:distribution_to_production',
			'concurrent:production'
		]
	);
};