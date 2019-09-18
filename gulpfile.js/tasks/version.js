//==============================================================================
//
//  Add hashes to filenames to identify different versions, allowing browsers
//  to cache the assets while triggering a reload when they change
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-rev-all@^0.9.7 gulp-clean@^0.3.2
//
//  Use the 'Asset' class to get the versioned paths:
//
//    <link rel="stylesheet" href="<?= Asset::url('css/main.css') ?>" />
//    <script src="<?= Asset::url('webpack/main.js') ?>"></script>
//
//  Or with Laravel Blade:
//
//    <link rel="stylesheet" href="{{ Asset::url('css/main.css') }}" />
//    <script src="{{ Asset::url('webpack/main.js') }}"></script>
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  All files in the build/ directory (with some exceptions - see below) are
//  versioned in-place.
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  No configuration is required, however you may adjust the file list, file
//  extensions and exclusions below if necessary.
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
//  Plugin documentation:
//
//    https://github.com/smysnk/gulp-rev-all
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  This doesn't alter Webpack files, which are versioned separately. Webpack
//  files should not reference non-Webpack files or vice-versa.
//
//==============================================================================

import gulp from '../lib/gulp';
import path from 'path';
import plugins from '../lib/plugins';
import * as config from '../config';
import * as transforms from '../lib/transforms';


//----------------------------------------
// Version files
//----------------------------------------

// Note: This has to be a separate task that runs last because it needs all the assets to exist first so it can resolve
// dependencies (e.g. HTML -> CSS -> Image). It also means we can't do partial rebuilds (e.g. via 'watch') in production
// mode (we'd have to keep the unversioned files for that to be possible).

gulp.task('version', function ()
{
    return gulp
        .src([
            `${config.dest}/*/**/*.*`,                  // Select all files in subdirectories but ignore files in the root directory
            `!${config.dest}/**/*.map`,                 // Skip .map files (if sourcemaps are enabled in production)
            `!${config.dest}/img/inline/**/*.*`,        // Skip inlined images - we're going to delete them anyway
            `!${config.dest}/webpack/manifest.json`,    // Don't break the Webpack manifest
        ])
        .pipe(transforms.errorHandler())

        // Delete the original files, only keep the versioned files
        // https://github.com/scniro/gulp-clean-css
        .pipe(plugins.clean())

        // Run gulp-rev-all to rename files and replace references
        .pipe(revAll())

        // Write files
        .pipe(gulp.dest(config.dest))

        // Generate a manifest file so we know where to find the renamed files
        .pipe(plugins.revAll.manifestFile())
        .pipe(gulp.dest(config.dest));
});

function revAll()
{
    const tool = require('gulp-rev-all/tool');

    const nonFileNameChar = '[^a-zA-Z0-9\\.\\-\\_\\/]';

    const options = {
        // Save the manifest file as manifest.json
        fileNameManifest: 'manifest.json',

        // Don't rename:
        dontRenameFile: [
            // The Favicon HTML file is only used server-side
            /favicons\/meta\.html/,
            // The Webpack files are already versioned (but search and replace image paths inside them)
            /webpack\/.*/,
        ],

        // Don't search and replace in:
        dontSearchFile: [
            // Source map files - we want to see the original files with no changes
            /\.map$/,
        ],

        // Include images, etc. in the manifest so they can be referenced directly, not just through the CSS
        // Note: There is currently no way to specify '*' here (https://github.com/smysnk/gulp-rev-all/pull/151#issuecomment-253882380)
        // And I can't find any way to get a list of all files in the stream either
        includeFilesInManifest: ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.svgz'],

        // Use 20 character hashes to match Webpack
        transformFilename(file, hash)
        {
            if (file.path.indexOf('/webpack/') > -1) {
                // rev-all seems to search and replace the filename even when it's listed in dontRenameFile
                return file.revFilenameOriginal;
            }

            let ext = path.extname(file.path);

            return path.basename(file.path, ext) + '.' + hash.substr(0, 20) + ext;
        },

        // This is mostly the same as the original but removes the special handling of quoted JS strings
        referenceToRegexs(reference)
        {
            let prefix = '';

            // If it's an absolute URL, need to add the base path too
            if (reference.path[0] === '/') {
                prefix = config.publicPath;
            }

            let escPrefix = prefix.replace(/([^0-9a-z])/ig, '\\$1');
            let escRefPathBase = tool.path_without_ext(reference.path).replace(/([^0-9a-z])/ig, '\\$1');
            let escRefPathExt  = path.extname(reference.path).replace(/([^0-9a-z])/ig, '\\$1');

            let regExp = `(${nonFileNameChar}${escPrefix})${escRefPathBase}(${escRefPathExt})(${nonFileNameChar}|$)`;

            // console.log(regExp);

            return [new RegExp(regExp, 'g')];
        },

        replacer(fragment, regExp, filename)
        {
            fragment.contents = fragment.contents.replace(
                regExp,
                (match, before, ext, after) => before + filename + ext + after
            );
        },
    };

    return plugins.revAll.revision(options);
}
