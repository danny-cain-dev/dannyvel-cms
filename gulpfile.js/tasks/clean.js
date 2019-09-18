import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as config from '../config';
import * as devMode from '../lib/dev-mode';

// https://github.com/sindresorhus/del
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md

gulp.task('clean:all', function ()
{
    // Delete all generated files
    return plugins.del([
        `${config.root}/[0-9]. ${devMode.markerFilename}`,
        config.dest,
    ]);
});

gulp.task('clean:quick', function ()
{
    // Delete only directories that will be regenerated - skip images and other slow-to-build files
    return plugins.del([
        `${config.dest}/css`,
        `${config.dest}/js`,
        `${config.dest}/webpack`,
    ]);
});

gulp.task('clean:temp', function ()
{
    return plugins.del([
        // Delete images that have been inlined
        `${config.dest}/img/inline`,
    ]);
});
