import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import { log, colors } from 'gulp-util';


//--------------------------------------
// Task definition
//--------------------------------------

/**
 * Define a Gulp task. This is a wrapper for gulp.task()
 */
export function add({ alias, name, help, tasks })
{
    if (alias) {
        // Note: Not using the gulp-help 'aliases' parameter because it uses dependent tasks, which means the output
        // says "Starting 'build', Finished 'build', Starting 'b', Finished 'b'" which is confusing. This way it
        // says "Starting 'b', Starting 'build', Finished 'build', Finished 'b'" which is slightly better.
        let aliases = Array.isArray(alias) ? alias : [alias];

        aliases.forEach(function (alias)
        {
            gulp.task(alias, series(name));
        });

        help += colors.black.bold(' (' + aliases.join(', ') + ')');
    }

    // Allow a single task to be specified by name instead of wrapped in series() or parallel()
    if (typeof tasks !== 'function') {
        tasks = series(tasks);
    }

    // This is intercepted by the gulp-help plugin
    gulp.task(name, help, tasks);
}


//--------------------------------------
// series() and parallel() helpers
//--------------------------------------

// This more or less emulates gulp.series() and gulp.parallel() which are coming in v4 (not released yet)
// by using the run-sequence plugin to run the tasks
// https://github.com/OverZealous/run-sequence

/**
 * Create a closure that runs the specified tasks in series.
 *
 * @param tasks
 * @returns {function()}
 */
export function series(...tasks)
{
    // Accept either an array or a set of arguments or a mixture
    tasks = flatten(tasks);

    let closure = (cb) =>
    {
        // Convert function tasks (e.g. nested parallel/series) to named tasks because runSequence can't handle functions
        tasks = convertArrayToNamedTasks(tasks);

        if (tasks.length === 0) {
            return typeof cb === 'function' ? cb() : null;
        }

        // Here we pass each task as a separate parameter, and runSequence runs them in order
        // When used with watch we get given an event object not a callback - ignore it
        if (typeof cb === 'function') {
            return plugins.runSequence(...tasks, cb);
        } else {
            return plugins.runSequence(...tasks);
        }
    };

    // Later we may want to know the type of sequence to give a readable name to anonymous tasks
    closure.type = 'series';
    return closure;
}

/**
 * Create a closure that runs the specified tasks in parallel.
 *
 * @param tasks
 * @returns {function()}
 */
export function parallel(...tasks)
{
    // Accept either an array or a set of arguments or a mixture
    tasks = flatten(tasks);

    let closure = (cb) =>
    {
        // Convert function tasks (e.g. nested parallel/series) to named tasks because runSequence can't handle functions
        tasks = convertArrayToNamedTasks(tasks);

        if (tasks.length === 0) {
            return typeof cb === 'function' ? cb() : null;
        }

        // Here we pass all tasks in the first parameter, and runSequence runs them in parallel
        // When used with watch we get given an event object not a callback - ignore it
        if (typeof cb === 'function') {
            return plugins.runSequence(tasks, cb);
        } else {
            return plugins.runSequence(tasks);
        }
    };

    // Later we may want to know the type of sequence to give a readable name to anonymous tasks
    closure.type = 'parallel';
    return closure;
}


//--------------------------------------
// Helpers
//--------------------------------------

function flatten(arr)
{
    return arr.reduce(function (flat, toFlatten)
    {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

let autoTaskId = {};

function convertClosureToNamedTask(task)
{
    if (typeof task === 'function') {

        // Convert a closure, returned by series() or parallel(), to a registered task (e.g. "parallel:1")
        // because runSequence doesn't handle these well (Note: this shouldn't be needed in Gulp v4)
        let type = task.type || 'task';

        if (!autoTaskId[type]) {
            autoTaskId[type] = 1;
        }

        let name = type + ':' + autoTaskId[type]++;

        gulp.task(name, false, task);

        return name;

    } else {

        // Warn the user if the task doesn't exist, but don't throw an error - this allows us to comment out tasks
        // we're not using without having to update the places that call it
        if (!gulp.tasks[task]) {
            gulp.task(task, function()
            {
                log(
                    colors.blue.bold('Note:'),
                    "Skipping task '" +
                    colors.blue.bold(task) +
                    "' which is disabled or doesn't exist"
                );
            });
        }

        return task;

    }
}

function convertArrayToNamedTasks(tasks)
{
    return tasks.map(convertClosureToNamedTask).filter(task => !!task);
}

export function run(task, cb)
{
    task = convertClosureToNamedTask(task);

    if (!task) {
        return typeof cb === 'function' ? cb() : null;
    }

    if (typeof cb === 'function') {
        return plugins.runSequence(task, cb);
    } else {
        return plugins.runSequence(task);
    }
}
