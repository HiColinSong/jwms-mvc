/*global require*/
/*command: 
    1. gulp 
    2. gulp --env dev
    3. gulp --env qa
    4. gulp --env prod ---production
    5. gulp mock-gulpfiles.js
*/
'use strict';

// const apiDomain={
//     local:"http://localhost:8080",
//     dev:"http://sgdevbx:8080",
//     qa:"http://sgqabx:8080",
//     prod:"http://sgprodbx:8080"
// }


var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify-es').default,
    cleanCss = require('gulp-clean-css'),
    minifyHtml = require('gulp-minify-html'),
    replace = require('gulp-replace'),
    removeCode = require('gulp-remove-code'),
    stripLine = require('gulp-strip-line'),
    removeLines = require('gulp-remove-empty-lines'),
    templateCache = require('gulp-angular-templatecache'),
    paths = {
        //the order matters for all app.xxx.js
        scripts: [
            // 'web/js/app.js',
            // 'web/js/app.route-provider.js',
            // 'web/js/app.http-provider.js',
            // 'web/js/app.local-storage-service-provider.js',
            // 'web/js/app.run.js',
            // 'web/js/controllers/*.js',
            // 'web/js/directives/*.js',
            // 'web/js/filters/*.js',
            // 'web/js/services/*.js'
            'web/js/**',
            '!web/js/mock/**'
        ],
        css: ['web/css/*.css'],
        // json: ['json/*.json'],
	    htmlPartials: ['web/partials/*.html'],
        unifiedjs:['deploy/web/js/bx.min.js','deploy/web/partials/templates.js'],
        index:['web/index.html'],
	    jsCssLibrary: ['bower_components/*/*.*']
    },
    argv = require('yargs').argv,
    isProduction=argv.production,
    isQA=argv.qa;
    const env=argv.env||"local";
    // gulpCallback = require('./gulp-helper.js')

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('clean', function() {
    return gulp.src(['deploy'])
        .pipe(clean({force:true}));
});

gulp.task('copy-jsLibFiles', ['clean'], function() {
    gulp.src('bower_components/**/*.*').pipe(gulp.dest('deploy/bower_components/'));
});

// gulp.task('copy-imageFolders', ['clean'], function() {
//     gulp.src('images/**/*.*').pipe(gulp.dest('deploy/images/'));
// });

gulp.task('scripts', ['clean'], function() {
    return gulp.src(paths.scripts)
        // .pipe(replace('apiDomain:"localhost:8080"', 'apiDomain:"'+apiDomain[env]+'"'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('bx.min.js'))
        .pipe(gulp.dest('deploy/web/js'));
});

gulp.task('css', ['clean'], function() {
    return gulp.src(paths.css)
        .pipe(cleanCss())
        .pipe(concat('bx.min.css'))
        .pipe(gulp.dest('deploy/web/css'));
});


gulp.task('template',['clean'], function() {
 return gulp.src(paths.htmlPartials)
     .pipe(removeCode({ production: isProduction }))
     .pipe(removeCode({ qa: isQA }))
            .pipe(minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            }))
     .pipe(removeLines())
    .pipe(templateCache({
        root:"web/partials/",
        module:"bx"
    }))
    .pipe(gulp.dest('deploy/web/partials'));
});

gulp.task('mergeJsWithPartials',['clean','scripts','template'], function() {
    return gulp.src(paths.unifiedjs)
        .pipe(concat('bx.min.js'))
        .pipe(gulp.dest('deploy/web/js'));
    });

gulp.task('index', ['clean'], function() {
    var today = new Date().getTime();

    gulp.src(paths.index)
        // .pipe(replace(/##GULP-BUILD##/, today))
        .pipe(stripLine(/'js\/[A-z_\d.-]*\.js'/))
        .pipe(stripLine(/'js\/[A-z_\d.-]*\/[A-z_\d.-]*\.js'/))
        .pipe(stripLine(/remove place holder/))
        .pipe(replace(/\/\/minify js place holder/g, '\'js/bx.min.js\''))
        .pipe(stripLine(/<link rel="stylesheet" href="css\/[A-z_\d.-]*\.css/))
        .pipe(replace(/<!-- compact css place holder -->/g, '<link rel=\'stylesheet\' href=\'css/bx.min.css\'>'))
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
gulp.task('remove-partials',['mergeJsWithPartials'], function() {
    return gulp.src(['deploy/web/partials'])
        .pipe(clean({force:true}));
});
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.htmlPartials, ['htmlPartials']);
});
gulp.task('default', ['copy-jsLibFiles','scripts','css','template','mergeJsWithPartials','remove-partials','index']);
//gulp.task('default', ['copy-jsLibFiles','copy-imageFolders','scripts','aceCss','css','template','index']);


