//==============================================================================
//
//  Custom tasks
//
//==============================================================================

import * as builders from '../lib/builders';
import * as config from '../config';
import * as livereload from '../lib/livereload';
import * as tasks from '../lib/tasks';
import * as transforms from '../lib/transforms';
import * as watch from '../lib/watch';
import * as webpack from '../lib/webpack';
import gulp from '../lib/gulp';
import plugins from '../lib/plugins';


//--------------------------------------
// Example copy task
//--------------------------------------

// Define the task
gulp.task('example', function()
{
    // Copy the files with no changes
    return gulp
        .src([
            'node_modules/example/example.css',
            'node_modules/example/example.js',
        ])
        .pipe(gulp.dest(`${config.dest}/example`));
});

// Add it to the list of tasks to be run when building everything
builders.add('example');
