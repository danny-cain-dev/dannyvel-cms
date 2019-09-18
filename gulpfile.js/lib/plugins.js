import loader from 'gulp-load-plugins';

// Lazy-load plugins

// e.g.
//   plugins.imagemin   ==>  require('gulp-imagemin')    // With 'gulp-' prefix
//   plugins.through2   ==>  require('through2')         // This one has no prefix (see below)
//   plugins.destClean  ==>  require('gulp-dest-clean')  // Hyphens are converted to camelCase

// For details of how this works, see https://github.com/jackfranklin/gulp-load-plugins#gulp-load-plugins
// Note: This only works for plugins listed in package.json, not their dependencies

export default loader({
    pattern: [
        // All Gulp plugins
        'gulp-*',

        // Some plugins don't start with 'gulp-' - we whitelist them here to
        // avoid confusion, rather than using '*' to match everything
        'del',
        'files-exist',
        'imagemin-jpeg-recompress',
        'merge-stream',
        'postcss-url',
        'run-sequence',
        'through2',
        'uglifyjs-webpack-plugin',
        'webpack-manifest-plugin',
        'webpack-md5-hash',

    ],
});
