//==============================================================================
//
//  Watch PHP files for changes and trigger LiveReload
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
//  N/A
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Adjust the watch paths below as appropriate. It is recommended to only watch
//  the subdirectories you are working on, or at least exclude the vendor/
//  directory, for efficiency and to prevent unnecessary page reloads.
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
//  Glob syntax:
//
//    https://github.com/isaacs/node-glob#glob-primer
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  (None)
//
//==============================================================================

import * as config from '../config';
import * as watch from '../lib/watch';

// When any PHP file is changed, reload the page
watch.add(
    [
        'app/**/*.php',
        'config/**/*.php',
        'resources/lang/**/*.php',
        'resources/views/**/*.php',
        'routes/**/*.php',

        // Ignore files created by Gulp
        `!${config.dest}/**`,
    ],
    'livereload:reload'
);
