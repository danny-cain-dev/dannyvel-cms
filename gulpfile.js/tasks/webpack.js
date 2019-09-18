//==============================================================================
//
//  Webpack - More advanced JavaScript including Hot Module Reloading
//
//--------------------------------------
// Installation
//--------------------------------------
//
//  To install dependencies run:
//
//    yarn add --dev webpack@^2.2.0-rc.3 webpack-dev-server@^2.2.0-rc.0 webpack-manifest-plugin@^1.1.0 babel-loader@^6.2.10 uglifyjs-webpack-plugin@^1.1.8 bundle-loader@^0.5.4 clean-css-loader@^0.0.3 css-loader@^0.26.0 noop-loader@^1.0.0 postcss-loader@^1.2.1 sass-loader@^4.1.0 babel-preset-env@^1.0.2 es6-promise-promise@^1.0.0 postcss-cssnext@^2.9.0 caniuse-db@^1.0.30000652 node-sass@^3.13.0 webpack-md5-hash@^0.0.5 url-loader@^0.5.7 file-loader@^0.9.0
//
//  For Vue.js component support run:
//
//    yarn add --dev vue@^2.1.4 vue-loader@^10.0.1 vue-template-compiler@^2.1.4
//
//  For CoffeeScript support (not recommended except for legacy code) run:
//
//    yarn add --dev coffee-script@^1.11.1 coffee-loader@^0.7.2
//
//  To add ES2015+ functions with babel-polyfill run:
//
//    yarn add --dev babel-polyfill
//
//--------------------------------------
// File structure
//--------------------------------------
//
//  This is the recommended source file structure:
//
//    src/
//      webpack/
//        main/       Modules used by main.js
//        runners/    Async loaded scripts (optional - see main/runners.js)
//        vue/        Async loaded Vue apps and components (optional - see main/vue.js)
//        main.js     Main entry point
//
//  You can split main/ into multiple directories if you have a complex
//  application, and you can add additional entry points if needed.
//
//  It generates the following build files:
//
//    build/
//      webpack/
//        chunk-[id].[hash].js    Aync loaded modules
//        main.[hash].js          Entry point and synchronously loaded modules
//        manifest.json           JSON map of original filenames to versioned filenames
//
//--------------------------------------
// Configuration
//--------------------------------------
//
//  Change the 'entry' option below to generate additional entry points. e.g. In
//  WordPress you might have an 'admin.js' file for admin area customisations.
//
//  Note: If you want to have multiple entry points but also some common code,
//  add an entry point called 'common' and uncomment the CommonsChunkPlugin below.
//  (Without this you should not load multiple entry points on the same page, but
//  you can have different entry points on different pages.)
//
//  If you are loading any vendor files such as jQuery outside of Webpack (e.g.
//  using jQuery bundled with WordPress), enter them in the 'externals' option.
//
//  You may want to tweak the 'minChunkSize' setting below to balance the size
//  and the number of chunks that are generated.
//
//  Additional Webpack configuration can also be applied below.
//
//  Also see config.js for additional options.
//
//--------------------------------------
// Vendor files
//--------------------------------------
//
//  To import third party (vendor) files, find the package on npm:
//
//    https://www.npmjs.com/search
//
//  Install it using Yarn - e.g.:
//
//    yarn add --dev jquery@^3.1.1
//
//  Import it when required in the JavaScript - e.g.:
//
//    import $ from 'jquery';
//
//  Or use the CommonJS require() syntax:
//
//    const $ = require('jquery');
//
//  You can import the same module more than once, including in different files -
//  it will only be executed once and the same value will be returned each time.
//
//--------------------------------------
// Documentation
//--------------------------------------
//
//  Webpack v2 documentation (incomplete as of Dec 2016):
//
//    https://webpack.js.org/guides/
//
//  Webpack v1 documentation (more complete but in some places out of date):
//
//    http://webpack.github.io/docs/
//
//  Differences between v1 and v2:
//
//    https://gist.github.com/sokra/27b24881210b56bbaff7
//    http://javascriptplayground.com/blog/2016/10/moving-to-webpack-2/
//
//  Babel - ES2015:
//
//    https://babeljs.io/learn-es2015/
//    https://babeljs.io/docs/usage/polyfill/
//
//  Vue.js single file components:
//
//    https://vuejs.org/v2/guide/single-file-components.html
//    https://vue-loader.vuejs.org/en/
//
//--------------------------------------
// Notes
//--------------------------------------
//
//  This file contains most of the configuration and the Gulp task. Actually
//  running Webpack, including Hot Module Replacement, is handled by
//  lib/webpack.js.
//
//  We don't use Webpack to build CSS files, as Webpack + Sass + HMR is
//  noticeably slower than Gulp + Sass + LiveReload. However, styles may be added
//  to Vue component files, where they will be injected as needed, keeping the
//  CSS file(s) small and speeding up the initial render.
//
//==============================================================================

import gulp from '../lib/gulp';
import plugins from '../lib/plugins';
import * as builders from '../lib/builders';
import * as config from '../config';
import * as mode from '../lib/mode';
import * as postcss from '../lib/postcss';
import * as watch from '../lib/watch';
import * as webpacklib from '../lib/webpack';


//--------------------------------------
// Configuration
//--------------------------------------

// This is done in a callback rather than directly in the task so that it is only called when needed not every time
webpacklib.configure(function ()
{
    const webpack        = require('webpack');
    const sourceMap      = mode.dev || config.sourceMapsInProduction;
    const cleanCssLoader = mode.dev ? 'noop-loader' : 'clean-css-loader';

    let options = {
        // vue-loader doesn't currently allow us to pass options to the loaders as an object, and JSON.stringify()
        // is not working after upgrading to Webpack 2, so use this to set the Babel options instead
        babel: config.babelOptions,

        // Both css-loader and bundle-loader need this option
        context: `${config.root}/${config.src}/webpack`,

        // Configure Clean CSS
        module: { cleancss: config.cleanCssOptions },

        // Configure PostCSS
        postcss: postcss.plugins,

        // Set $DEBUG variable in Sass
        sassLoader: {
            data: `$DEBUG: ${mode.dev};\n\n`,
        },
    };

    let webpackConfig = {
        entry: {
            // Define the application's entry points here
            'main': `${config.root}/${config.src}/webpack/main.js`,
        },
        resolve: {
            alias: {
                // Add aliases for imports here if needed
                // https://webpack.js.org/configuration/resolve/#resolve-alias
            },
            modules: [
                `${config.root}/${config.src}`,
                'node_modules',
                'bower_components',
            ],
            extensions: ['.js', '.json', '.node'],
        },
        externals: {
            // jquery  : 'jQuery',
            // Vue : 'Vue'
            // List any packages loaded outside of Webpack so that Webpack doesn't load them again
            // Make sure those dependencies are loaded *before* the Webpack script(s)
            // Format: '<package name>': '<global variable name>'
            // https://webpack.github.io/docs/library-and-externals.html

            // e.g. Use this if jQuery is already loaded in WordPress with wp_enqueue_script('jquery'):
            // This means "require('jquery')" becomes equivalent to "window.jQuery".
            // 'jquery': 'jQuery',
            'vue' : 'Vue'

        },
        output: {
            path: `${config.root}/${config.dest}/webpack/`,
            publicPath: `${config.publicPath}/webpack/`,
            filename: '[name].js',
            chunkFilename: 'chunk-[id].js',
        },
        module: {
            rules: [],
        },
        devtool: mode.dev ? 'inline-source-map' : config.sourceMapsInProduction ? 'source-map' : false,
        performance: {
            // Don't warn about large files in development mode, only in production
            hints: mode.dev ? false : 'warning',
        },
        plugins: [

            // Define constants
            // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
            new webpack.DefinePlugin({
                // Debugging constants used in JS files
                'DEBUG': mode.dev,
                'process.env.NODE_ENV': mode.dev ? '"development"' : '"production"',
            }),

            // Automatic dependency injection
            // https://webpack.github.io/docs/list-of-plugins.html#provideplugin
            new webpack.ProvidePlugin({
                // Promise polyfill is required for IE11 compatibility when using async module loading
                'Promise': 'es6-promise-promise',
            }),

            // Loader options - for v2 compatibility with v1 plugins
            // Note: We will need to migrate to the new options style once the plugins support it
            // https://webpack.js.org/guides/migrating/#loaderoptionsplugin-context
            new webpack.LoaderOptionsPlugin({ options }),

            // Combine common chunks
            // https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
            // If there are multiple entry points, you can use this to move the runtime and common code to a separate
            // file, which should be loaded (with a <script> tag) before the entry point(s)
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: 'common',
            // }),

            // Generate hashes based on file contents alone, so it doesn't change unless the content does
            // https://github.com/erm0l0v/webpack-md5-hash
            // https://github.com/webpack/webpack/issues/1315
            // Removed 20 Jan 2017 because I noticed files changing without the hash changing when module IDs change -DJM
            // new plugins.webpackMd5Hash(),

        ],
    };


    //--------------------------------------
    // Standard modules
    //--------------------------------------

    // JavaScript
    webpackConfig.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules|bower_components/,
        use: [
            { loader: 'babel-loader', options: config.babelOptions },
        ],
    });

    // CSS
    webpackConfig.module.rules.push({
        test: /\.css$/,
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader',
                options: { sourceMap: sourceMap, importLoaders: 1 }
            },
            {
                loader: cleanCssLoader,
            },
            {
                loader: 'postcss-loader',
                options: { sourceMap: sourceMap }
            },
        ],
    });

    // Sass
    webpackConfig.module.rules.push({
        test: /\.scss$/,
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader',
                options: { sourceMap: sourceMap, importLoaders: 1 }
            },
            {
                loader: cleanCssLoader,
            },
            {
                loader: 'postcss-loader',
                options: { sourceMap: sourceMap }
            },
            {
                loader: 'sass-loader',
                options: { sourceMap: sourceMap }
            },
        ],
    });

    // Images
    webpackConfig.module.rules.push({
        test: /\.(gif|jpg|jpeg|png|svg|svgz)$/,
        use: [
            {
                // Inline images under 1kb as a data URI
                loader: 'url-loader?limit=1024',
                // Use file-loader to turn off inlining
                // loader: 'file-loader',
            },
        ],
    });


    //--------------------------------------
    // CoffeeScript
    //--------------------------------------

    webpackConfig.module.rules.push({
        test: /\.coffee$/,
        use: [
            { loader: 'coffee-loader' },
        ],
    });


    //--------------------------------------
    // Vue.js
    //--------------------------------------

    webpackConfig.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader',
        // options: {}, // Not working, see below
    });

    // Have to use LoaderOptionsPlugin for now because it crashes due to the "!"s if we use "options" above
    const args = sourceMap ? 'sourceMap' : '';

    options.vue = {
        loaders: {
            css: `vue-style-loader!css-loader?importLoaders=1&${args}!${cleanCssLoader}!postcss-loader?${args}`,
            scss: `vue-style-loader!css-loader?importLoaders=1&${args}!${cleanCssLoader}!postcss-loader?${args}!sass-loader?${args}`,
        },
    };

    webpackConfig.resolve.extensions.push('.vue');

    // Use the standalone version of Vue.js *only if* you need to use templates inside the HTML rather than from .vue files
    // https://vuejs.org/v2/guide/installation.html#Standalone-vs-Runtime-only-Build
    // webpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.common.js';


    //--------------------------------------
    // Minify and optimise
    //--------------------------------------

    if (!mode.dev) {
        webpackConfig.plugins.push(
            // Minify the JavaScript
            new plugins.uglifyjsWebpackPlugin({ uglifyOptions: config.uglifyOptions }),
            // Combine small chunks to reduce the number of them
            new webpack.optimize.MinChunkSizePlugin({
                // Tweak this size if needed
                minChunkSize: 5000,
            }),
        );
    }

    //--------------------------------------
    // Banner
    //--------------------------------------

    // Must add the banner *after* minifying
    // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
    webpackConfig.plugins.push(new webpack.BannerPlugin({
        banner: `/*\n${config.banner}\n*/\n`,
        entryOnly: true,
        raw: true,
    }));


    //--------------------------------------
    // Version
    //--------------------------------------

    if (!mode.dev) {
        // Add a hash to the filenames
        webpackConfig.output.filename      = '[name].[hash].js';
        webpackConfig.output.chunkFilename = 'chunk-[id].[chunkHash].js';

        // Generate a manifest file
        webpackConfig.plugins.push(new plugins.webpackManifestPlugin({
            fileName: 'manifest.json',
        }));
    }

    return webpackConfig;
});


//--------------------------------------
// Task
//--------------------------------------

// Define the task
gulp.task('webpack', function (cb)
{
    webpacklib.run(cb);
});

// Add it to the list of tasks to be run when building everything
builders.add('webpack');

// Add watchers for the source files - but only if hot module replacement is disabled
watch.add(
    `${config.src}/webpack/**/*.*`,
    'webpack',
    () => !mode.hot
);
