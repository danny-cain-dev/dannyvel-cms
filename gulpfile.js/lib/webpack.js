import * as livereload from '../lib/livereload';
import * as mode from '../lib/mode';
import { log, colors, PluginError } from 'gulp-util';


//--------------------------------------
// Configuration
//--------------------------------------

// See tasks/webpack.js for the actual configuration
let configCallback;
let config;

/**
 * Set a callback to be run to get the Webpack configuration. It is done with a callback because (1) we don't know
 * the configuration until the task runs (it depends on the mode), but (2) we don't want to generate it every time the
 * task runs (only when we trigger a full build).
 */
export function configure(callback)
{
    configCallback = callback;
}

// Output warnings & errors but not other information
const statsConfig = {
    assets: false,
    children: false,
    chunks: false,
    colors: true,
    errorDetails: true,
    hash: false,
    timings: false,
    version: false,
};

//--------------------------------------
// Compiler
//--------------------------------------

/**
 * Build the files and return the compiler object
 */
function build(cb)
{
    // Load the configuration
    if (!configCallback) {
        log(colors.yellow('WARNING: No Webpack configuration supplied'));
        return false;
    }

    config = configCallback();

    const webpack = require('webpack');

    if (mode.hot) {
        // Add the webpack/hot/dev-server module to all entry points to handle hot module reloading
        // Note: The webpack-dev-server module, which listens for changes, is added in livereload.html
        Object.keys(config.entry).map((name) => {
            // Convert to an array if needed
            if (typeof config.entry[name] === 'string') {
                config.entry[name] = [config.entry[name]];
            }

            // Load the websocket client to listen for changes
            config.entry[name].unshift(`webpack-dev-server/client`);

            // Option 1: Hot reload when possible, and fall back to full page reload when not
            config.entry[name].unshift('webpack/hot/dev-server');

            // Option 2: Hot reload when possible, but if it fails don't reload the page
            // config.entry[name].unshift('webpack/hot/only-dev-server');
        });

        // Display module names instead of numbers in the console
        config.plugins.push(new webpack.NamedModulesPlugin);

        // Add the HMR plugin
        config.plugins.push(new webpack.HotModuleReplacementPlugin);
    }

    // Run webpack
    return webpack(config, function (err, stats) {
        // Handle errors
        if (err) {
            throw new PluginError('webpack', err);
        }

        // Display warnings, etc.
        let output = stats.toString(statsConfig);

        if (output) {
            console.log(output);
        }

        // Reload the page if using LiveReload but not Hot Module Replacement
        if (mode.live && !mode.hot) {
            livereload.reload();
        }

        // Run the callback if provided
        if (cb) {
            cb();
        }
    });
}

//--------------------------------------
// Development server
//--------------------------------------

// Note: Some of the HMR configuration is above in the build() function and some is below
// It is cobbled together from several sources and a lot of experimentation!
// https://webpack.github.io/docs/hot-module-replacement.html
// https://webpack.github.io/docs/hot-module-replacement-with-webpack.html

let devServer;

// Export the port number for use in asset-loader.js
export let port;

export function startServer(cb)
{
    // Must call build() before require() as Webpack may not be available
    const compiler = build();

    if (!compiler) {
        log(colors.yellow('WARNING: Hot reload not available'));
        return cb();
    }

    const WebpackDevServer = require('webpack-dev-server');

    devServer = new WebpackDevServer(compiler, {
        contentBase: false,         // Don't serve non-webpack files
        hot: true,                  // Enable hot module replacement
        noInfo: true,               // Don't show "webpack: bundle is now (IN)VALID" message in console
        stats: statsConfig,
        https: process.env.WEBPACK_SSL === 'true',
        disableHostCheck: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            // "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
        watchOptions: {
            // Enable this if using Vagrant shared folders (or another network filesystem)
            // TODO: Move this to .env?
            // poll: true,
        },
    });

    devServer.listen(0, '::', function () {
        // Node will assign a random port number - find out what it is
        port = devServer.listeningApp.address().port;

        // Load all assets from the dev server
        config.output.publicPath = (process.env.WEBPACK_SSL === 'true' ? 'https' : 'http') + `://${process.env.LIVERELOAD_HOSTNAME}:${port}/`;

        // Immediately invalidate the cache to avoid errors
        // No idea why that happens, but I can reproduce it consistently...
        // Best guess is there is something cached somewhere from the previous production build
        devServer.invalidate();

        // Display a message to the user
        log(colors.white.bold(`Webpack dev server running on port ${port}...`));

        // Tell Webpack the task is complete
        cb();
    });
}

export function stopServer()
{
    // Disabled 3 Dec 2018 because of this error after upgrading dependencies:
    //     [11:56:53] Finished 'h' after 16 s
    //     [12:39:38] Build in production mode before exiting? [Y/n]
    //     net.js:723
    //       if (req.async && this._handle.writeQueueSize != 0)
    //                                    ^
    //
    //     TypeError: Cannot read property 'writeQueueSize' of null
    //         at TLSSocket.Socket._writeGeneric (net.js:723:32)
    //         at TLSSocket.Socket._write (net.js:736:8)
    //         at doWrite (_stream_writable.js:333:12)
    //         at clearBuffer (_stream_writable.js:441:7)
    //         at onwrite (_stream_writable.js:372:7)
    //         at TLSSocket.WritableState.onwrite (_stream_writable.js:90:5)
    //         at WriteWrap.afterWrite (net.js:818:12)
    // (Upgrading Node.js to v6.15.0 didn't help.)

    // if (devServer) {
    //     devServer.close();
    // }
}


//--------------------------------------
// Run task
//--------------------------------------

/**
 * Run Webpack - either build files, start the development server, or trigger a rebuild, as appropriate for the current mode
 */
export function run(cb)
{
    if (!mode.hot) {
        // Build as normal
        build(cb);
    } else if (devServer) {
        // Dev server running - clear the cache so Webpack will rebuild all files on the next reload
        devServer.invalidate();
        cb();
    } else {
        // Dev server not running yet
        cb();
    }
}
