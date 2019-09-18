import gulp from '../lib/gulp';
import path from 'path';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as devMode from '../lib/dev-mode';
import * as livereload from '../lib/livereload';
import * as mode from '../lib/mode';
import * as webpack from '../lib/webpack';
import { log, colors } from 'gulp-util';
import { run, series, parallel } from '../lib/tasks';

const stdin = process.stdin;

export const watchers = [];

/**
 * Specify a pattern to watch and a task / function to call when the file changes.
 *
 * This allows us to specify watchers inline with the tasks.
 */
export function add(glob, fn, condition)
{
    watchers.push({ glob, fn, condition });
}

function watchingMessage()
{
    let message = colors.green.bold('Watching... ');
    message += colors.white.bold('Press ') + colors.green.bold('b') + colors.white.bold(' to rebuild all files, ');

    if (mode.live) {
        message += colors.green.bold('r') + colors.white.bold(' to reload the browser, ');
    }

    message += colors.green.bold('q') + colors.white.bold(' to quit');

    log(message);
    devMode.displayWarning();
}

// Track the number of active tasks and display a message when all are finished
let activeTasks = 0;
let errors      = false;

export function recordError()
{
    errors = true;
}

function taskStarted()
{
    activeTasks++;
}

function taskFinished()
{
    activeTasks--;

    if (activeTasks === 0) {
        if (errors) {
            log(colors.red.bold('Finished with errors'));
        } else {
            log(colors.green('Finished'));
            watchingMessage();
        }

        errors = false;
        livereload.resume();
    }
}

function watchError(error)
{
    // Silently catch 'ENOENT' error typically caused by renaming watched folders
    // https://github.com/gulpjs/gulp/issues/651#issuecomment-160723986
    if (error.code === 'ENOENT') {
        return;
    }

    throw error;
}

function mainMenuKeyPress(key)
{
    if (key === 'q' || key === 'Q' || key === '\u0003' /*Ctrl-C*/) {

        // Quit
        stdin.removeListener('data', mainMenuKeyPress);

        // Stop automatic reloading and webpack server straight away
        // Note 1: Pause but not stop LiveReload so that we can trigger a reload after the production build
        // Note 2: AFAIK we can't actually stop the watchers
        livereload.pause();
        webpack.stopServer();

        // Delete the LiveReload script
        livereload.clearScript();

        // Ask whether to do a full production build
        log(
            colors.magenta.bold('Build in production mode before exiting?'),
            '[' + colors.white.bold('Y') + '/' + colors.white.bold('n') + ']'
        );

        stdin.on('data', exitMenuKeyPress);

    } else if ((key === 'r' || key === 'R') && mode.live) {

        run('livereload:reload', watchingMessage);

    } else if (key === 'b' || key === 'B') {

        // Build
        if (activeTasks > 0) return;

        // Disable LiveReload until the full build has finished
        livereload.pause();

        taskStarted();
        log(colors.yellow.bold('Building...'));
        run('watch:build', taskFinished);

    }
}

function exitMenuKeyPress(key)
{
    if (key === 'y' || key === 'Y' || key === 'q' || key === 'Q' || key === '\x0D' /* Enter */) {

        // Yes - Full build
        run(series('build', 'livereload:reload'), process.exit);

    } else if (key === 'n' || key === 'N' || key === '\u0003' /*Ctrl-C*/) {

        // No - Just exit
        // Trigger LiveReload anyway to stop the page trying to connect to the LiveReload or Webpack servers
        livereload.forceReload();
        process.exit();

    }
}

export function start()
{
    // Register file watchers - see watcher() function
    watchers.forEach(function (watcher)
    {
        if (watcher.condition && !watcher.condition()) {
            return;
        }

        gulp.watch(watcher.glob, function (event)
        {
            taskStarted();

            // Display a message showing what was changed
            let type = event.type.substr(0, 1).toUpperCase() + event.type.substr(1);

            log(
                colors.yellow.bold(type + ':'),
                colors.white.bold(path.relative('.', event.path))
            );

            // Display another message when the task finishes, as it's hard to tell otherwise
            if (typeof watcher.fn === 'function') {
                watcher.fn(taskFinished);
            } else {
                run(watcher.fn, taskFinished);
            }
        }).on('error', watchError);
    });

    // Watch the Gulpfile itself - but don't try to reload it, just warn the user when it is changed
    gulp.watch([`${config.root}/gulpfile.js/**/*.*`, `!${config.root}/gulpfile.js/settings.json`], function ()
    {
        log(
            colors.red.bold('Gulpfile changed.'),
            colors.white.bold('Press'),
            colors.red.bold('q'),
            colors.white.bold('to exit, then reload Gulp to load the new configuration')
        );
    }).on('error', watchError);

    // Listen for keyboard input
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', mainMenuKeyPress);

    // Display a message to the user, else it looks like nothing happened
    watchingMessage();
}

export function init(cb)
{
    if (devMode.needsRebuild()) {
        // Build everything to ensure all files are in development mode
        // Note: The 'webpack' task is already included in the 'builders' array
        return run(series('clean:quick', 'build:all'), cb);
    }

    // Already in development mode - skip the initial build
    log(
        colors.blue.bold('Note:'),
        colors.white.bold('Skipping initial build - press'),
        colors.green.bold('b'),
        colors.white.bold('if you need to rebuild')
    );

    return cb();
}
