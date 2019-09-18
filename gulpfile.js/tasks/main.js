//==============================================================================
//
//  Main (user-facing) tasks
//
//==============================================================================

import { add, series, parallel } from '../lib/tasks';

// Clean
add({
    name: 'clean',
    alias: 'c',
    help: 'Delete all build files',
    tasks: 'clean:all',
});

// Build
add({
    name: 'build',
    alias: ['b', 'prod'],
    help: 'Build all assets in production mode',
    tasks: series([
        'set-mode:build',
        'clean:all',
        parallel([
            'build:all',
            '.htaccess',
            'settings.json',
            'dev-mode:warning-files',
            'livereload:script',
        ]),
        'inline-images',
        parallel([
            'clean:temp',
            'version',
        ]),
    ]),
});

add({
    name: 'dev',
    alias: 'd',
    help: 'Build all assets in development mode without optimising',
    tasks: series([
        'set-mode:dev',
        'clean:quick',
        parallel([
            'build:all',
            '.htaccess',
            'settings.json',
            'dev-mode:warning-files',
            'livereload:script',
        ]),
        'dev-mode:display-warning',
    ]),
});

// Watch
add({
    name: 'watch',
    alias: 'w',
    help: 'Watch for changes and build assets in development mode',
    tasks: series([
        'set-mode:watch',
        parallel([
            'watch:init',
            '.htaccess',
            'dev-mode:warning-files',
            'settings.json',
            'livereload:script',
        ]),
        'watch:start',
    ]),
});

add({
    name: 'live',
    alias: 'l',
    help: 'Watch for changes and build assets in development mode, with LiveReload',
    tasks: series([
        'set-mode:live',
        parallel([
            'watch:init',
            '.htaccess',
            'dev-mode:warning-files',
            'livereload:server',
        ]),
        parallel([
            'settings.json',
            'livereload:script',
            'watch:start',
        ]),
    ]),
});

add({
    name: 'hot',
    alias: 'h',
    help: 'Watch for changes and build assets in development mode, with Hot Module Replacement and LiveReload',
    tasks: series([
        'set-mode:hot',
        parallel([
            'watch:init',
            '.htaccess',
            'dev-mode:warning-files',
            'livereload:server',
            'webpack:server',
        ]),
        parallel([
            'settings.json',
            'livereload:script',
            'watch:start',
        ]),
    ]),
});
