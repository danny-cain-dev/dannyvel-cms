import gulp from 'gulp';
import help from 'gulp-help';
import plugins from '../lib/plugins';
import { log, colors } from 'gulp-util';

// Ensure source files exist, warn the user if not
const origSrc = gulp.src;

gulp.src = function (glob, opt)
{
    if (glob) {

        if (typeof glob === 'string') {
            glob = [glob];
        }

        // Use the same filter that Gulp uses
        // https://github.com/Kaivosukeltaja/files-exist
        let filtered = plugins.filesExist(glob, { checkGlobs: true, throwOnMissing: false });

        if (filtered.length < glob.length) {
            let missing = glob.filter(g => filtered.indexOf(g) < 0);
            for (let pattern of missing) {
                log(colors.yellow(`WARNING: No files matched by "${pattern}"`));
            }
        }

    } else {
        log(colors.yellow('WARNING: gulp.src() called with no filenames'));
    }

    return origSrc.call(gulp, glob, opt);
};

// Wrap Gulp with the Help plugin - required to register tasks
// https://github.com/chmontgomery/gulp-help
export default help(gulp, {
    description: false,
    hideDepsMessage: true,
    hideEmpty: true,
});
