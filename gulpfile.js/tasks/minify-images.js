//==============================================================================
//
//  Minifies images
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-dest-clean@^0.5.0 gulp-imagemin@^3.1.1 imagemin-jpeg-recompress@^5.1.0 gulp-newer@1.3.0
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the required source file structure:
//
//    src/
//      img/
//        <source images>
//
//  It generates the following build files:
//
//    build/
//      img/
//        <minified images>
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  No configuration is required.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To add third party images, either adjust the src below or create a new task.
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Image minification:
//
//    https://github.com/sindresorhus/gulp-imagemin
//    https://github.com/imagemin/imagemin-jpeg-recompress
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  (None)
//
//==============================================================================

import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as livereload from '../lib/livereload';
import * as transforms from '../lib/transforms';
import * as watch from '../lib/watch';


//--------------------------------------
// Minify images
//--------------------------------------

// Define the task
gulp.task('img', function ()
{
    return gulp
        .src(`${config.src}/img/**`)
        .pipe(transforms.errorHandler())

        // Delete files that no longer exist in the src directory
        // https://github.com/clark800/gulp-clean-dest
        .pipe(plugins.destClean(`${config.dest}/img`))

        // Skip unchanged files (for speed when watching or running 'dev' repeatedly)
        // https://github.com/tschaub/gulp-newer
        .pipe(plugins.newer(`${config.dest}/img`))

        // Minify the images that have changed
        .pipe(transforms.minifyImg())

        // Write files
        .pipe(gulp.dest(`${config.dest}/img`))

        // LiveReload the images
        .pipe(livereload.stream());
});

// Add it to the list of tasks to be run when building everything
builders.add('img');

// Add watchers for the source files
watch.add(`${config.src}/img/**/*.*`, 'img');
