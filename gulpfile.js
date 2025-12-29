var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
function vendor() {

  // Bootstrap
  var bootstrap = gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'));

  // Devicons
  var devicons = gulp.src([
      './node_modules/devicons/**/*',
      '!./node_modules/devicons/*.json',
      '!./node_modules/devicons/*.md',
      '!./node_modules/devicons/!PNG',
      '!./node_modules/devicons/!PNG/**/*',
      '!./node_modules/devicons/!SVG',
      '!./node_modules/devicons/!SVG/**/*'
    ])
    .pipe(gulp.dest('./vendor/devicons'));

  // Font Awesome
  var fontAwesome = gulp.src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./vendor/font-awesome'));

  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));

  // jQuery Easing
  var jqueryEasing = gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'));

  // Simple Line Icons
  var simpleLineIconsFonts = gulp.src([
      './node_modules/simple-line-icons/fonts/**',
    ])
    .pipe(gulp.dest('./vendor/simple-line-icons/fonts'));

  var simpleLineIconsCss = gulp.src([
      './node_modules/simple-line-icons/css/**',
    ])
    .pipe(gulp.dest('./vendor/simple-line-icons/css'));

  return Promise.all([bootstrap, devicons, fontAwesome, jquery, jqueryEasing, simpleLineIconsFonts, simpleLineIconsCss]);
}

// Compile SCSS
function cssCompile() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'));
}

// Minify CSS
function cssMinify() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}

// Minify JavaScript
function jsMinify() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
}

// Configure the browserSync task
function browserSyncInit(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
}

// Watch tasks
function watchFiles() {
  gulp.watch('./scss/*.scss', css);
  gulp.watch('./js/*.js', js);
  gulp.watch('./*.html', browserSync.reload);
}

// Define complex tasks
const css = gulp.series(cssCompile, cssMinify);
const js = gulp.series(jsMinify);
const build = gulp.series(vendor, gulp.parallel(css, js));
const dev = gulp.series(build, gulp.parallel(browserSyncInit, watchFiles));

// Export tasks
exports.vendor = vendor;
exports.css = css;
exports.js = js;
exports.build = build;
exports.default = build;
exports.dev = dev;
