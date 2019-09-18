import path from 'path';

//--------------------------------------
// Directories
//--------------------------------------

// Project root - you shouldn't need to change this
export const root = path.resolve(__dirname, '..');

// Source directory - relative to project root
export const src = 'assets';

// Document root - relative to project root
export const docroot = './assets';

// Destination directory relative to document root
export const publicPath = '/vendor/cms';

// Destination directory relative to project root
export const dest = docroot + publicPath;


//--------------------------------------
// Banner
//--------------------------------------

// This is added to the top of each CSS and JS file, so keep it short
// It can be used for copyright information and/or credits
// New lines are allowed - \n

const year = (new Date).getFullYear();

export const banner = `Created by Danny Cain - www.dannycain.com\nCopyright (c) ${year}`;


//--------------------------------------
// Browser list
//--------------------------------------

// Supported browsers (for Babel, cssnext and Autoprefixer)
// https://github.com/ai/browserslist // http://browserl.ist/
export const browsers = [
    '> 1%',             // Any browser with more than 1% usage globally (default)
    '> 1% in GB',       // Any browser with more than 1% usage in the UK (custom)
    'last 2 versions',  // The last 2 versions of each major browser (default)
    'Firefox ESR',      // The latest Firefox Extended Support Release (default)
    // 'IE >= 8',       // Uncomment this if you need to support old IE versions!
].join(', ');


//--------------------------------------
// Source maps
//--------------------------------------

// Generate source maps for production files?
// Disabled by default because it adds extra .map files to the Git repo and makes the source code publicly viewable
// But usually that isn't a problem, and it can be safely enabled if you need to debug production code
export const sourceMapsInProduction = false;


//--------------------------------------
// Babel
//--------------------------------------

// Babel transpiles ES2015+ to allow new language features to be used in older browsers
// https://babeljs.io/docs/core-packages/#options
export const babelOptions = {

    // Presets are predefined sets of plugins
    // https://babeljs.io/docs/plugins/#presets
    presets: [

        // Automatically determine which plugins are needed based on the browser list (recommended)
        // https://github.com/babel/babel-preset-env
        [
            'env',
            {
                targets: { browsers },  // See list of browsers above
                modules: false,         // Don't transform imports - Webpack will do that (and regular JS doesn't support it)
            }
        ],

        // Or manually specify the presets to use
        // yarn add --dev babel-preset-es2015@^6.18.0 babel-preset-es2016@^6.16.0 babel-preset-es2017@^6.16.0
        // ['es2015', { modules: false }], // ES2015 (ES6) - https://babeljs.io/docs/plugins/preset-es2015/
        // 'es2016',                       // ES2016 (ES7) - https://babeljs.io/docs/plugins/preset-es2016/
        // 'es2017',                       // ES2017       - https://babeljs.io/docs/plugins/preset-es2017/

    ],

    // You can also specify extra plugins to use
    // https://babeljs.io/docs/plugins/
    plugins: [

        // Object rest spread - https://www.npmjs.com/package/babel-plugin-transform-object-rest-spread
        // e.g. { x, y, ...z }
        // yarn add --dev babel-plugin-transform-object-rest-spread@^6.19.0
        // 'transform-object-rest-spread',

        // dedent - https://www.npmjs.com/package/babel-plugin-dedent
        // Removes extra indentation from multiline template strings (dedent` ... `)
        // yarn add --dev babel-plugin-dedent@^2.0.0
        // 'dedent',

        // Dynamic include() - https://www.npmjs.com/package/babel-plugin-syntax-dynamic-import
        // yarn add --dev babel-plugin-syntax-dynamic-import
        // 'syntax-dynamic-import',

    ]
};


//--------------------------------------
// UglifyJS (JS minifier)
//--------------------------------------

// This is used in both Webpack and simple JavaScript compilation
export const uglifyOptions = {
    compress: {
        // http://lisperator.net/uglifyjs/compress
        drop_console: true, // Remove console.log(), etc.
        warnings: false,    // Don't warn about dropped code (there's a lot in Vue.js)
        global_defs: {
            DEBUG: false,   // Remove debugging code (if (DEBUG) {...})
        },
    },
    output: {
        // http://lisperator.net/uglifyjs/codegen
        comments: false,    // Remove all comments including /*!...*/ added by dependencies (we add the banner separately)
    },
    sourceMap: sourceMapsInProduction,
};


//--------------------------------------
// Clean-css (CSS minifier)
//--------------------------------------

// This is used in both Webpack and simple JavaScript compilation
// https://github.com/jakubpawlowicz/clean-css/tree/3.4#how-to-use-clean-css-api
export const cleanCssOptions = {
    processImportFrom: ['local'],       // Only inline local CSS files, skip any remote files (e.g. Google Fonts)
    root: docroot,                      // Need to specify the document root to inline absolute @imports
    rebase: false,                      // Don't rewrite image paths
    keepSpecialComments: 0,             // Remove all comments including /*!...*/ added by dependencies (we add the banner separately)
    sourceMap: sourceMapsInProduction,
};


//--------------------------------------
// System
//--------------------------------------

// This doesn't seem to work...
// process.traceDeprecation = true;
// So to track down DeprecationWarning messages run this instead:
// node --trace-deprecation $(which gulp) dev
