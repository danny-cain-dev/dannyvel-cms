//==============================================================================
//
//  Gulp configuration
//
//--------------------------------------
// Installation (existing project)
//--------------------------------------
//
//  To install dependencies if Gulp is already configured:
//
//    yarn install
//
//--------------------------------------
// Installation (new project)
//--------------------------------------
//
//  To set up Gulp for a new project, first run:
//
//    cd path/to/repo/
//    [ ! -f package.json ] && echo '{"private":true,"license":"UNLICENSED"}' > package.json
//    yarn add --dev gulp@^3.9.1 babel-core@^6.18.2 babel-plugin-transform-es2015-modules-commonjs@^6.18.0 dotenv@^2.0.0 gulp-util@^3.0.7 gulp-help@^1.6.1 gulp-load-plugins@^1.4.0 handlebars@^4.0.6 run-sequence@^1.2.2 del@^2.2.2 files-exist@^1.0.2 gulp-file@^0.3.0 through2@^2.0.3 gulp-plumber@^1.1.0 gulp-sourcemaps@^2.2.0 gulp-if@^2.0.2 gulp-livereload@^3.8.1
//
//  Add this to composer.json (to autoload the 'Asset' class):
//
//    "autoload": {
//        "classmap": [
//            "gulpfile.js/helpers/Asset.php"
//        ],
//    },
//
//  Then run:
//
//    composer dump-autoload -o
//
//  Or if Composer is not used you can load Asset.php manually, e.g.:
//
//    require __DIR__ . '/path/to/gulpfile.js/helpers/Asset.php';
//
//  To enable LiveReload, add one of these right before </body>:
//
//    {!! Asset::livereload() !!}                         - Laravel
//    <?= Asset::livereload() ?>                          - WordPress, etc.
//    <?php readfile('path/to/build/livereload.html') ?>  - Manual load
//
//  And add this to the .env file (and .env.example):
//
//    # Hostname for LiveReload and Webpack dev server - All ports must be directly accessible from the developer's machine
//    # e.g. Use the internal hostname for Alberon servers (<name>.alberon.local), not the public hostname (firewalled)
//    LIVERELOAD_HOSTNAME=example.alberon.local
//
//    # Use SSL (with a self-signed certificate) for Webpack HMR? You will need to accept the certificate manually, but it's
//    # the only way to make Webpack work over SSL because it won't allow HTTP sockets on a HTTPS site
//    WEBPACK_SSL=false
//
//  Edit config.js (in this folder) - update the directory paths as required.
//
//  Finally, uncomment the tasks required below, and read each one for further task-specific setup instructions.
//
//--------------------------------------
// Usage
//--------------------------------------
//
//  To build files in development mode:
//
//    gulp dev      # Build once
//    gulp watch    # Watch for changes
//    gulp live     # Watch with LiveReload
//    gulp hot      # Watch with Hot Module Replacement and LiveReload
//
//  To build files in production mode:
//
//    gulp build
//
//  To see the list of available tasks, including any custom tasks:
//
//    gulp help
//
//==============================================================================

// Use Babel to parse imports in the Gulpfile - Node v6 already supports the rest of the ES6 features we use
// (This is only used for Gulpfile - see config.js for the Babel configuration used for the browser)
// Note: we still can't use 'import' in this file because it has already been parsed, so we use require() below
require('babel-register')({
    plugins: ['transform-es2015-modules-commonjs'],
    sourceMaps: true,
});

// Load local configuration from the .env file into process.env
require('./run/load-dotenv');

// Check for configuration errors and tell the user
require('./run/error-check');


//--------------------------------------
// Define tasks
//--------------------------------------

// CSS & Sass
require('./tasks/css');

// Inline (some) images in CSS files
// require('./tasks/inline-images');

// Fonts
require('./tasks/fonts');

// Webpack - More advanced JavaScript including Hot Module Reloading (recommended)
require('./tasks/webpack');

// Simple JavaScript - For legacy sites or simple scripts that don't need the features or overhead of Webpack
// require('./tasks/javascript');

// Minify images
// require('./tasks/minify-images');

// Resize images
// require('./tasks/resize-images');

// Generate favicons of various sizes
// require('./tasks/favicons');

// Watch PHP files for changes and automatically reload the page
// require('./tasks/php');

// Version assets (recommended)
require('./tasks/version');

// Custom tasks
// require('./tasks/custom');


//--------------------------------------
// Required tasks
//--------------------------------------

// Clean
require('./tasks/clean');

// Internal tasks
require('./tasks/internal');

// Main tasks - the ones for users to call
require('./tasks/main');


//--------------------------------------
// Run
//--------------------------------------

// Display a list of tasks if no task is specified or 'gulp help' is called
require('./run/display-help');

// Note: At this point Gulp takes over automatically
