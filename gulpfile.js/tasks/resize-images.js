//==============================================================================
//
//  Resize images
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-imagemin@^3.1.1 imagemin-jpeg-recompress@^5.1.0 gulp-newer@^1.3.0 gulp-clone@^1.0.0 gulp-rename@^1.2.2 gulp-image-resize@^0.11.0 merge-stream@^1.0.1
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the source file structure required for the example task:
//
//    src/
//      bg/
//        example.jpg
//
//  It generates the following build files:
//
//    build/
//      bg/
//        example-800.jpg
//        example-1024.jpg
//        example-1280.jpg
//        ...
//
//  Create a separate directory for each task.
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Change/duplicate the 'bg' task as required.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To resize third party images, either adjust the src below or create a new task.
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Image resizing:
//
//    https://github.com/scalableminds/gulp-image-resize
//
//  Image minification:
//
//    https://github.com/sindresorhus/gulp-imagemin
//    https://github.com/imagemin/imagemin-jpeg-recompress
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  We can't use gulp-dest-clean to remove old files because of the rename.
//  However, they will be removed by the 'build' task calling 'clean:all'.
//
//==============================================================================

import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as livereload from '../lib/livereload';
import * as transforms from '../lib/transforms';
import * as watch from '../lib/watch';


//--------------------------------------
// Background images
//--------------------------------------

// Example task showing how to resize background images
gulp.task('bg', function ()
{
    const sizes = [800, 1024, 1280, 1440, 1920];

    // Load the source images
    const images = gulp
        .src(`${config.src}/bg/**/*.*`)
        .pipe(transforms.errorHandler());

    const streams = sizes.map(size =>
        // Clone the image for each size
        // https://github.com/mariocasciaro/gulp-clone
        images.pipe(plugins.clone())

            // Rename the image to indicate the image size
            // https://github.com/hparra/gulp-rename
            .pipe(plugins.rename({ suffix: '-' + size }))

            // Skip unchanged files (for speed when watching or running 'dev' repeatedly)
            // https://github.com/tschaub/gulp-newer
            .pipe(plugins.newer(`${config.dest}/bg`))

            // Resize the images
            // https://github.com/scalableminds/gulp-image-resize
            .pipe(plugins.imageResize({ width: size }))
    );

    // Merge the images into a single stream
    return plugins.mergeStream(streams)

        // Minify the images
        .pipe(transforms.minifyImg())

        // Write files
        .pipe(gulp.dest(`${config.dest}/bg`))

        // LiveReload the images
        .pipe(livereload.stream());
});

// Add it to the list of tasks to be run when building everything
builders.add('bg');

// Add watchers for the source files
watch.add(`${config.src}/bg/**/*.*`, 'bg');
