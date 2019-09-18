//==============================================================================
//
//  Copies font files from vendor packages to the build directory
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  There are no additional dependencies for this task.
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  There are no source files except the vendor files installed in node_modules/.
//
//  It generates the following build files:
//
//    build/
//      fonts/
//        <vendor name>/
//          <font files>
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Uncomment one of the sections below, or add your own task for another fonts
//  package.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To install a font package, find the package on npm:
//
//    https://www.npmjs.com/search
//
//  Install it using Yarn - e.g.:
//
//    yarn add --dev font-awesome@^4.7.0
//
//  Configure and import it in the Sass file - e.g.:
//
//    $fa-font-path: '../fonts/font-awesome';
//    @import 'font-awesome/scss/font-awesome';
//
//    $fa-font-path: '../fonts/font-awesome';
//    @import '@fortawesome/fontawesome-free/scss/fontawesome';
//    @import '@fortawesome/fontawesome-free/scss/solid';
//
//  Note: The import path is relative to the node_modules/ directory. The .scss
//  extension is not required. The $fa-font-path is the relative path from the
//  compiled CSS file (build/css/main.css) to the copied fonts
//  (build/fonts/font-awesome/).
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Bootstrap fonts - http://getbootstrap.com/components/#glyphicons
//  Font Awesome    - http://fontawesome.io/
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  Make sure the src paths end with '**/*' to keep the directory structure:
//  http://stackoverflow.com/questions/25038014/how-do-i-copy-directories-recursively-with-gulp
//
//==============================================================================

import gulp from '../lib/gulp';
import * as builders from '../lib/builders';
import * as config from '../config';


//--------------------------------------
// Font Awesome 4
//--------------------------------------

// // Define the task
// gulp.task('font-awesome', function()
// {
//     // Copy the files with no changes
//     return gulp
//         .src('node_modules/font-awesome/fonts/**/*')
//         .pipe(gulp.dest(`${config.dest}/fonts/font-awesome`));
// });
//
// // Add it to the list of tasks to be run when building everything
// builders.add('font-awesome');


//--------------------------------------
// Font Awesome 5
//--------------------------------------

// // Define the task
// gulp.task('font-awesome', function()
// {
//     // Copy the files with no changes
//     return gulp
//         .src('node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
//         .pipe(gulp.dest(`${config.dest}/fonts/font-awesome`));
// });
//
// // Add it to the list of tasks to be run when building everything
// builders.add('font-awesome');


//--------------------------------------
// Bootstrap
//--------------------------------------

// // Define the task
// gulp.task('bootstrap-fonts', function()
// {
//     // Copy the files with no changes
//     return gulp
//         .src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
//         .pipe(gulp.dest(`${config.dest}/fonts/bootstrap`));
// });
//
// // Add it to the list of tasks to be run when building everything
// builders.add('bootstrap-fonts');


//--------------------------------------
// Material Design Icons
//--------------------------------------

// // Define the task
// gulp.task('material-design-icons', function()
// {
//     // Copy the files with no changes
//     return gulp
//         .src('node_modules/material-design-icons-iconfont/dist/fonts/**/*')
//         .pipe(gulp.dest(`${config.dest}/fonts/material-design-icons`));
// });
//
// // Add it to the list of tasks to be run when building everything
// builders.add('material-design-icons');
