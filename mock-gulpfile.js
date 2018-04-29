/*global require*/
'use strict';

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    replace = require('gulp-replace'),
    removeCode = require('gulp-remove-code'),
    stripLine = require('gulp-strip-line'),
    removeLines = require('gulp-remove-empty-lines'),
    templateCache = require('gulp-angular-templatecache'),
    paths = {
        //the order matters for all app.xxx.js
        scripts: ['js/vendor/*.js',
            'js/app.js',
            'js/app/*.js',
            'js/controllers/*.js',
            'js/directives/*.js',
            'js/filters/*.js',
            'js/services/*.js'],
        css: ['css/ump-*.css'],
        json: ['json/*.json'],
	    htmlPartials: ['partials/*.html','partials/*.tmpl'],
        unifiedjs:['deploy/js/ump.min.js','deploy/partials/templates.js'],
        index:['index.html'],
	    jsCssLibrary: ['bower_components/*/*.*']
    },
    gulpCallback = require('./gulp-helper.js')

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('clean', function() {
    return gulp.src(['deploy'])
        .pipe(clean({force:true}));
});

gulp.task('index', ['clean'], function() {
    var today = new Date().getTime();

    gulp.src(paths.index)
        .pipe(replace(/##GULP-BUILD##/, today))
        .pipe(stripLine(/'js\/[A-z_\d.-]*\.js'/))
        .pipe(stripLine(/'js\/[A-z_\d.-]*\/[A-z_\d.-]*\.js'/))
        .pipe(stripLine(/remove place holder/))
        .pipe(replace(/\/\/minify js place holder/g, '\'js/ump.min.js\'+jT'))
        .pipe(stripLine(/<link rel="stylesheet" href="css\/ump-/))
        .pipe(replace(/<!-- compact css place holder -->/g, '<link rel=\'stylesheet\' href=\'css/ump.min.css?ts='+today+'\'>'))
        //.pipe(replace(/\.html\'\"/g, '\.html?ts='+today+'\'\"'))
        .pipe(replace(/\.html\'\"/g, '\.html\'\"'))
        .pipe(minifyHtml({
            empty: true,
            comments: true,
            spare: true,
            quotes: true,
            loose: true
        }))
        .pipe(removeLines())
        .pipe(gulp.dest('deploy'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.htmlPartials, ['htmlPartials']);
});
gulp.task('default', ['index']);
//gulp.task('default', ['copy-jsLibFiles','copy-imageFolders','scripts','aceCss','css','template','index']);


