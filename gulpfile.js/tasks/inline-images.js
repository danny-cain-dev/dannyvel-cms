//==============================================================================
//
//  Converts images in CSS to inline data URIs
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev gulp-postcss@^6.2.0 postcss-url@^5.1.2
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the required source file structure:
//
//    src/
//      css/
//        <css & scss files>
//      img/
//        inline/
//          <images to be inlined>
//        <images not inlined>
//
//  Only images in the img/inline/ directory will be converted to data URIs. The
//  img/inline/ directory will be deleted from the build files (in production
//  mode only, not in development mode).
//
//  This results in the following build files:
//
//    build/
//      css/
//        <css files>
//      img/
//        <images not inlined>
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  No configuration is required.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To inline third party images, create a task (e.g. in minify-images.js) to
//  copy them to the img/inline/ folder.
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  This converts references to images to inline base64-encoded data URIs.
//  e.g. url(../img/inline/example.gif) becomes url(data:image/gif;base64,...).
//
//  Advantages:
//    - Reduces the number of HTTP requests / connections
//    - May reduce the total data size, depending on HTTP overhead and how well the
//      encoded images compress with gzip
//
//  Disadvantages:
//    - Increases the size of the CSS file, which can delay initial page rendering
//    - May increase the total data size (due to base64 encoding)
//    - As there is only one file, they can't be downloaded in parallel
//
//  Therefore it is recommended to only use this for very small images.
//  Don't inline images that are referenced more than once.
//
//  https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
//  https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  (None)
//
//==============================================================================

import gulp from '../lib/gulp';
import * as config from '../config';
import * as transforms from '../lib/transforms';


//--------------------------------------
// Inline small images
//--------------------------------------

// This happens as a separate task at the end (not in the regular CSS task) to
// (1) ensure the images have been minified first, and (2) avoid complicated URL
// rewriting issues. It is called directly from the 'build' task. It is not used
// in development mode.

gulp.task('inline-images', function ()
{
    return gulp.src(`${config.dest}/css/**/*.css`)
        .pipe(transforms.inlineImages())
        .pipe(gulp.dest(`${config.dest}/css`));
});
