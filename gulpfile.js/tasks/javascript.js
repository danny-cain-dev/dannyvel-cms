//==============================================================================
//
//  Simple JavaScript compilation (including CoffeeScript) - for legacy sites
//  or simple scripts that don't need the features or overhead of Webpack
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-babel@^6.1.2 gulp-concat@^2.6.1 gulp-iife@^0.3.0 gulp-uglify@^2.0.0 babel-preset-env@^1.0.2 gulp-header@^1.8.8
//
//  For CoffeeScript support, uncomment the CoffeeScript line below and run:
//
//    yarn add --dev coffee-script@^1.11.1 gulp-coffee@^2.3.3
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the recommended source file structure:
//
//    src/
//      js/
//        main/
//          <files>
//
//  The files are compiled and then concatenated in alphabetical order.
//  Alternatively modify the src array below to list the files individually.
//
//  It generates the following build files:
//
//    build/
//      js/
//        main.js
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Change/duplicate the 'main.js' section to include each of the JS files to
//  be generated. e.g. In WordPress you might have an 'admin.js' file for admin
//  area customisations.
//
//  Use the build() function to define a task for each file. If you need
//  different settings for different files, either duplicate it entirely or add
//  extra parameters to the build function.
//
//  You can customise the transforms further in lib/transforms.js if required.
//
//  Also see config.js for additional options.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To import third party (vendor) files, find the package on npm:
//
//    https://www.npmjs.com/search
//
//  Install it using Yarn - e.g.:
//
//    yarn add --dev bootstrap-sass@^3.3.7
//
//  Add it to the src array below - e.g.:
//
//    'node_modules/jquery/dist/jquery.js',
//
//  If Gulp is running in watch/live/hot mode, quit and restart it to pick up the
//  change. (You may also need to trigger a rebuild by pressing 'b'.)
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Babel / ES2015 - https://babeljs.io/learn-es2015/
//  CoffeeScript   - http://coffeescript.org/
//  IIFE           - http://benalman.com/news/2010/11/immediately-invoked-function-expression/
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  The DEBUG flag is added in global scope, not wrapped in an IIFE, which
//  shouldn't be a problem as long as no other script overwrites it.
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
// Build function
//--------------------------------------

function build(src, dest, filename)
{
    return gulp
        .src(src)
        .pipe(transforms.errorHandler())
        .pipe(plugins.sourcemaps.init())

        // Convert ES6+ JavaScript to ES5
        .pipe(transforms.babel())

        // Wrap each file in an IIFE to prevent variables leaking
        .pipe(transforms.iife())

        // Compile CoffeeScript files (Note: this adds its own IIFE)
        // .pipe(transforms.coffeescript())

        // Concatenate the files
        // https://github.com/contra/gulp-concat
        .pipe(plugins.concat(filename))

        // Add var DEBUG = true; in development mode
        .pipe(transforms.addDebugFlagJs())

        // Minify JavaScript (also sets DEBUG = false in production mode)
        .pipe(transforms.minifyJs())

        // Add copyright or other info to the file header
        .pipe(transforms.addHeader())

        // Write source maps
        .pipe(transforms.writeSourceMaps())

        // Write files
        .pipe(gulp.dest(dest))

        // Reload the page
        .pipe(livereload.stream());
}


//--------------------------------------
// main.js
//--------------------------------------

// Define the task
gulp.task('main.js', function ()
{
    return build(
        [
            // Source files
            // 'node_modules/jquery/dist/jquery.js',
            `${config.src}/js/main/*.*`,
        ],
        `${config.dest}/js`,
        'main.js'
    );
});

// Add it to the list of tasks to be run when building everything
builders.add('main.js');

// Add watchers for the source files
watch.add(`${config.src}/js/main/**/*.*`, 'main.js');
