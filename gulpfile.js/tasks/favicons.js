//==============================================================================
//
//  Generate favicons of various sizes, plus manifest files
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-newer@^1.3.0 gulp-favicons@^2.2.7 gulp-imagemin@^3.1.1 imagemin-jpeg-recompress@^5.1.0
//
//  Add one of these to the <head> section in the template:
//
//    {!! Asset::favicons() !!}                              - Laravel
//    <?= Asset::favicons() ?>                               - WordPress, etc.
//    <?php readfile('path/to/build/favicons/meta.html') ?>  - Manual load
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the required source file structure:
//
//    src/
//      favicons.png
//
//  It only accepts a single source image - typically a large square image.
//
//  It generates the following build files:
//
//    build/
//      favicons/
//        favicon.ico
//        favicon-16x16.png
//        ...
//        meta.html
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Fill in the values below.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  N/A
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Favicon generator:
//
//    https://github.com/haydenbleasel/favicons
//
//  Manifest files:
//
//    https://w3c.github.io/manifest/
//    https://msdn.microsoft.com/en-us/library/dn320426%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
//    https://tech.yandex.com/browser/tableau/doc/dg/concepts/create-widget-docpage/
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  appleStartup is disabled by default because we're not typically building
//  applications and it adds ~7 seconds to the build time.
//
//==============================================================================

import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as livereload from '../lib/livereload';
import * as transforms from '../lib/transforms';
import * as watch from '../lib/watch';

// Define the task
gulp.task('favicons', function ()
{
    // There should only be one file but the extension doesn't matter
    return gulp.src(`${config.src}/favicons.*`)

        // Skip unless it has changed (for speed when watching or running 'dev' repeatedly)
        // https://github.com/tschaub/gulp-newer
        .pipe(plugins.newer(`${config.dest}/favicons/favicon.ico`))

        // Generate favicons and manifest files
        // https://github.com/haydenbleasel/favicons
        .pipe(plugins.favicons({

            // Background colour
            background: '#fff',

            // Application details
            appName: '',        // e.g. My App
            appDescription: '', // e.g. This is my application
            url: '',            // e.g. http://www.example.com/
            version: 1.0,
            display: 'browser', // 'browser' or 'standalone'
            orientation: 'portrait',
            start_url: '/',

            // Developer details
            developerName: 'Alberon Ltd',
            developerURL: 'https://www.alberon.co.uk/',

            // Select icons
            icons: {
                android: true,          // Android homescreen icon
                appleIcon: true,        // Apple touch icons
                appleStartup: false,    // Apple startup images
                coast: true,            // Opera Coast icon
                favicons: true,         // Regular favicons
                firefox: true,          // Firefox OS icons
                windows: true,          // Windows 8 tile icons
                yandex: true,           // Yandex browser icon
            },

            // File paths
            path: `${config.publicPath}/favicons/`,
            html: 'meta.html',

            // Plugin options
            logging: false,
            online: false,
            preferOnline: false,
            pipeHTML: true,
            replace: true

        }))

        // Minify the generated images
        .pipe(transforms.minifyImg())

        // Write files
        .pipe(gulp.dest(`${config.dest}/favicons`))

        // Reload the page
        .pipe(livereload.stream());
});

// Add it to the list of tasks to be run when building everything
builders.add('favicons');

// Add watchers for the source files
watch.add(`${config.src}/favicon/**/*.*`, 'favicons');
