import plugins from '../lib/plugins';
import * as config from '../config';
import * as mode from '../lib/mode';
import * as handlebars from '../lib/handlebars';
import * as postcsslib from '../lib/postcss';
import * as watch from '../lib/watch';
import { log, colors } from 'gulp-util';

/**
 * Sets $DEBUG = true or false, for conditionally adding a development mode warning
 */
export function addDebugFlagCss()
{
    // https://github.com/tracker1/gulp-header
    return plugins.header(`$DEBUG: ${mode.dev};\n\n`);
}

/**
 * Sets DEBUG = true in development mode, to allow conditional logic similar to Webpack
 */
export function addDebugFlagJs()
{
    // This is not required in production - see config.uglifyOptions
    if (!mode.dev) {
        return plugins.through2.obj();
    }

    // https://github.com/tracker1/gulp-header
    return plugins.header('var DEBUG = true;\n\n');
}

/**
 * Add a header message to the top of each CSS and JS file in the stream
 */
export function addHeader(message = config.banner)
{
    // If there is no message, we don't need to do anything
    if (!message) {
        return plugins.through2.obj();
    }

    // Always use /*...*/ syntax because it works in both and allows new lines
    message = `/*\n${message}\n*/\n`;

    // Only apply to CSS and JavaScript files - ignore other files that may be in the stream
    // https://github.com/tracker1/gulp-header
    return plugins.if(/\.(css|js)$/, plugins.header(message));
}

/**
 * Convert ES6+ code to ES5 for the browser
 */
export function babel()
{
    return plugins.if(
        // .js files, excluding vendor files
        f => f.path.match(/\.js$/) && !f.path.match(/node_modules|bower_components/),
        // https://github.com/babel/gulp-babel
        plugins.babel(config.babelOptions)
    );
}

/**
 * Compile CoffeeScript files
 */
export function coffeescript()
{
    // https://github.com/contra/gulp-coffee
    return plugins.if(/\.coffee$/, plugins.coffee());
}

/**
 * Handle errors in later plugins
 */
export function errorHandler()
{
    // https://github.com/floatdrop/gulp-plumber
    return plugins.plumber({
        errorHandler: function (error)
        {
            // Count errors during watch
            watch.recordError();

            // Display an error message
            if (error.plugin && error.relativePath) {
                log(colors.bgRed.white.bold(`Error in ${error.plugin} in ${error.relativePath}\n`));
            } else {
                log(colors.bgRed.white.bold('Error:\n'));
            }

            if (error.messageFormatted) {
                console.log(error.messageFormatted);
            } else {
                console.log(error.toString());
            }

            // Don't break watch when there's an error
            // http://blog.ibangspacebar.com/handling-errors-with-gulp-watch-and-gulp-plumber/
            this.emit('end');
        },
    });
}

/**
 * Generate a file from a template
 */
export function generateFile(template, dest)
{
    // https://github.com/alexmingoia/gulp-file
    return plugins.file(dest, handlebars.generate(template));
}


/**
 * Wrap .js files in an IIFE to ensure variables don't leak
 */
export function iife(strict = true)
{
    return plugins.if(
        // .js files, excluding vendor files
        f => f.path.match(/\.js$/) && !f.path.match(/node_modules|bower_components/),
        // https://github.com/mariusschulz/gulp-iife
        plugins.iife({
            bindThis: true,          // Set local 'this' to the parent 'this'
            prependSemicolon: false, // No ; at the start of the file
            trimCode: false,         // Don't trim whitespace
            useStrict: strict,       // Prepend "use strict"; directive - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
        })
    );
}

/**
 * Convert small images into data URIs to reduce the number of HTTP requests
 */
export function inlineImages()
{
    // https://github.com/postcss/gulp-postcss
    return plugins.postcss([
        // https://github.com/postcss/postcss-url
        plugins.postcssUrl({
            url: 'inline',
            // Only images in the img/inline/ directory - this allows us to decide which images are inlined rather than
            // trying to guess, and we can delete the inline/ directory afterwards
            filter: /\/inline\//,
        }),
    ]);
}


/**
 * Minify CSS files
 */
export function minifyCss()
{
    if (mode.dev) {
        return plugins.through2.obj();
    }

    // https://github.com/scniro/gulp-clean-css
    return plugins.if(/\.css$/, plugins.cleanCss(config.cleanCssOptions));
}

/**
 * Minify JavaScript files
 */
export function minifyJs()
{
    if (mode.dev) {
        return plugins.through2.obj();
    }

    // https://github.com/terinjokes/gulp-uglify
    return plugins.if(/\.js$/, plugins.uglify(config.uglifyOptions));
}

/**
 * Minify images
 */
export function minifyImg()
{
    // https://github.com/sindresorhus/gulp-imagemin
    return plugins.imagemin([

        //--------------------------------------
        // Default (lossless) plugins
        //--------------------------------------

        // https://github.com/imagemin/imagemin-gifsicle
        plugins.imagemin.gifsicle(),

        // https://github.com/imagemin/imagemin-jpegtran
        // plugins.imagemin.jpegtran(),

        // https://github.com/imagemin/imagemin-optipng
        plugins.imagemin.optipng(),

        // https://github.com/imagemin/imagemin-svgo
        plugins.imagemin.svgo({
            plugins: [
                // Prevent SVGs with IDs (e.g. sprites) losing content when minified
                { cleanupIDs: false },
            ],
        }),

        //--------------------------------------
        // Additional plugins
        //--------------------------------------

        // Re-compress JPEG images too (lossy)
        // https://github.com/imagemin/imagemin-jpeg-recompress
        plugins.imageminJpegRecompress({
            // Tweak these settings if necessary
            // https://github.com/imagemin/imagemin-jpeg-recompress#api
            loops: 4,
            min: 50,
            max: 95,
            quality: 'high',
        }),

    ]);
}

/**
 * Transform CSS through PostCSS plugins, e.g. Autoprefixer
 */
export function postcss()
{
    // https://github.com/postcss/gulp-postcss
    return plugins.postcss(postcsslib.plugins());
}

/**
 * Rewrite URLs starting with / to include the public path (/img/example.gif => /build/img/example.gif)
 *
 * This allows PhpStorm to validate URLs without us attempting to rewrite relative URLs in Sass partials
 */
export function rewriteUrls()
{
    // https://github.com/postcss/gulp-postcss
    return plugins.postcss([
        // https://github.com/postcss/postcss-url
        plugins.postcssUrl({
            url: (url) => {
                if (url[0] === '/') {
                    return config.publicPath + url;
                }

                return url;
            },
            // Filter not working - maybe only used for inlining?
            // filter: /^\//,
        }),
    ]);
}

/**
 * Compile Sass (SCSS) files
 */
export function sass()
{
    // https://github.com/dlmanning/gulp-sass
    return plugins.sass({
        includePaths: [
            // '.',
            `${config.root}/node_modules`,
            `${config.root}/bower_components`,
        ],
        outputStyle: 'expanded',
        sourceMap: true,
    });
}

/**
 * Writes sourcemaps to the stream (if enabled)
 */
export function writeSourceMaps()
{
    // https://github.com/floridoo/gulp-sourcemaps
    if (mode.dev) {
        // Write inline
        return plugins.sourcemaps.write();
    } else if (config.sourceMapsInProduction) {
        // Write to .map files
        return plugins.sourcemaps.write('.');
    } else {
        // Disabled
        return plugins.through2.obj();
    }
}
