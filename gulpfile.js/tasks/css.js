//==============================================================================
//
//  Compiles Sass, transpiles future CSS syntax, minifies the CSS, adds
//  copyright info and triggers LiveReload
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-header@^1.8.8 gulp-sass@^2.3.2 gulp-postcss@^6.2.0 postcss-url@^5.1.2 postcss-cssnext@^2.9.0 caniuse-db@^1.0.30000652 gulp-clean-css@^2.0.13
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the recommended source file structure:
//
//    src/
//      css/
//        main/          Partials for the main file only
//        shared/        Partials shared between CSS files
//        main.scss      Main file
//
//  You can split main/ into multiple directories if you have a complex
//  application, and you can add additional CSS files if needed.
//
//  It generates the following build files:
//
//    build/
//      css/
//        main.css
//
//  You can customise it below as required.
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Change/duplicate the 'main.css' section to include each of the CSS files to
//  be generated. e.g. In WordPress you might have an 'admin.css' file for admin
//  area customisations.
//
//  Also see config.js for additional options.
//
//  You can customise the transforms further in lib/transforms.js if required.
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
//  Configure and import it in the Sass file - e.g.:
//
//    $icon-font-path: '../fonts/bootstrap/';
//    @import 'bootstrap-sass/assets/stylesheets/bootstrap';
//
//  Note: The import path is relative to the node_modules/ directory. The .scss
//  extension is not required.
//
//  You may also need to copy some assets to the build folder - see fonts.js for
//  an example task. The $icon-font-path is the relative path from the compiled
//  CSS file (build/css/main.css) to the copied fonts (build/fonts/bootstrap/).
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Sass - http://sass-lang.com/guide - includes:
//
//    - Import other files (relative to the current file or to node_modules/)
//    - $variables
//    - Selector nesting (don't abuse this! - https://www.sitepoint.com/beware-selector-nesting-sass/)
//    - Maths operators (+, -, *, / and %)
//
//  PostCSS-cssnext - http://cssnext.io/ - includes:
//
//    - Automatic vendor prefixes (Autoprefixer)                    - https://github.com/postcss/autoprefixer
//    - #rrggbbaa hex color codes with transparency (alpha channel) - https://github.com/postcss/postcss-color-hex-alpha
//    - :any-link pseudo-class                                      - https://github.com/jonathantneal/postcss-pseudo-class-any-link
//    - :matches() pseudo-class                                     - https://github.com/postcss/postcss-selector-matches
//
//  Clean-css - https://github.com/jakubpawlowicz/clean-css - minifies the CSS.
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  We use a separate task for each file to ensure 'watch' is fast - we only
//  rebuild the files that have actually changed, rather than all CSS files.
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

// This function is reusable in case there are multiple CSS files to be compiled
// If you need different settings for different files, either duplicate it or add extra parameters
function build(src, dest)
{
    return gulp
        .src(src)
        .pipe(transforms.errorHandler())
        .pipe(plugins.sourcemaps.init())

        // Add $DEBUG: true (non-minified) / false (minified)
        .pipe(transforms.addDebugFlagCss())

        // Compile Sass files
        .pipe(transforms.sass())

        // Run through PostCSS (including cssnext and Autoprefixer)
        .pipe(transforms.postcss())

        // Rewrite URLs starting with / to include the public path (/img/example.gif => /build/img/example.gif)
        .pipe(transforms.rewriteUrls())

        // Minify CSS and inline CSS imports
        .pipe(transforms.minifyCss())

        // Add copyright or other info to the file header
        .pipe(transforms.addHeader())

        // Write source maps
        .pipe(transforms.writeSourceMaps())

        // Write files
        .pipe(gulp.dest(dest))

        // LiveReload the CSS
        .pipe(livereload.stream());
}


//--------------------------------------
// main.css
//--------------------------------------

// Define the task
gulp.task('main.css', function ()
{
    return build(`${config.src}/css/main.scss`, `${config.dest}/css`);
});

// Add it to the list of tasks to be run when building everything
builders.add('main.css');

// Add watchers for the source files
watch.add(
    [
        // Add any additional source files to watch here
        `${config.src}/css/main.scss`,
        `${config.src}/css/main/**/*.scss`,
        `${config.src}/css/shared/**/*.scss`,
    ],
    'main.css'
);


//--------------------------------------
// emails.css
//--------------------------------------

// Define the task
gulp.task('emails.css', function ()
{
    return build(`${config.src}/css/emails.scss`, `${config.dest}/css`);
});

// Add it to the list of tasks to be run when building everything
builders.add('emails.css');

// Add watchers for the source files
watch.add(
    [
        // Add any additional source files to watch here
        `${config.src}/css/emails.scss`,
        `${config.src}/css/emails/**/*.scss`,
        `${config.src}/css/shared/**/*.scss`,
    ],
    'emails.css'
);
