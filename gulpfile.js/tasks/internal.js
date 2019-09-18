//==============================================================================
//
//  Internal tasks
//
//==============================================================================

import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as devMode from '../lib/dev-mode';
import * as livereload from '../lib/livereload';
import * as settings from '../lib/settings';
import * as tasks from '../lib/tasks';
import * as transforms from '../lib/transforms';
import * as watch from '../lib/watch';
import * as webpack from '../lib/webpack';

// Build
gulp.task('build:all', tasks.parallel(builders.all()));

// Development mode
gulp.task('dev-mode:display-warning', devMode.displayWarning);

gulp.task('dev-mode:warning-files', function ()
{
    return gulp.src([])
        .pipe(devMode.generateWarningFiles())
        .pipe(gulp.dest(config.root));
});

// .htaccess file
gulp.task('.htaccess', function ()
{
    return gulp.src([])
        .pipe(transforms.generateFile('.htaccess.hbs', '.htaccess'))
        .pipe(gulp.dest(config.dest));
});

// LiveReload
gulp.task('livereload:reload', livereload.forceReload);

gulp.task('livereload:script', function ()
{
    return gulp.src([])
        .pipe(livereload.generateLiveReloadHtml())
        .pipe(gulp.dest(config.dest));
});

gulp.task('livereload:server', livereload.start);

// settings.json
gulp.task('settings.json', function ()
{
    // This has to be in gulpfile.js/, not in the build directory, so the helpers can find it - otherwise
    // there's a chicken-and-egg problem where we can't find the build path before loading settings
    return gulp.src([])
        .pipe(plugins.file('settings.json', JSON.stringify(settings.all()) + '\n'))
        .pipe(gulp.dest('gulpfile.js/'));
});

// Watch
gulp.task('watch:build', tasks.series('clean:quick', 'build:all', 'livereload:reload'));

gulp.task('watch:init', watch.init);

gulp.task('watch:start', watch.start);

// Webpack
gulp.task('webpack:server', webpack.startServer);
