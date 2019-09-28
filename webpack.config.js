//==============================================================================
// Settings
//==============================================================================

// Features (Only enable what you need, to speed up installation and compilation)
const hasCss = true; // Including <style> in .vue files
const hasSass = true; // Including .scss files and <style lang="scss"> in .vue files
const hasImages = false;
const hasVue = true;
const useBabel = true; // Transpile ES6+ features inc. import/export
const useCache = false; // Slower first build, faster subsequent builds
const useImagemin = false;

// Entry points & source files
const src = `${__dirname}/assets`;

const entryPoints = {
    'main': [
        // These two polyfills are needed for IE11 to load chunks, but they're not
        // added automatically because the webpack runtime isn't parsed by Babel
        useBabel && 'core-js/modules/es.array.iterator',
        useBabel && 'core-js/modules/es.promise',
        `${src}/js/main.js`,
        hasSass && `${src}/css/main.scss`,
    ].filter(Boolean),
};

if (hasImages) {
    entryPoints.images = `${src}/img/images.js`
}

// Additional files to watch in HMR mode (and trigger a full page reload)
const watches = [
    `${__dirname}/app/**/*.php`,
    `${__dirname}/config/**/*.php`,
    `${__dirname}/resources/lang/**/*.php`,
    `${__dirname}/resources/views/**/*.php`,
    `${__dirname}/routes/**/*.php`,
];

// Supported browsers (for Babel, PostCSS) - https://github.com/browserslist/browserslist
const browsers = [
    'defaults',
    '> 0.5% in GB',
    //'> 0.5% in my stats', // See https://github.com/browserslist/browserslist#custom-usage-data
];

// Banner - Added to the top of each CSS and JS file (so keep it short)
const banner = `Created by Alberon - www.alberon.co.uk\nCopyright (c) ${(new Date).getFullYear()}`;


//==============================================================================
// Generate webpack config
//==============================================================================

// If you change anything below this point, please comment it clearly and/or
// submit a merge request to add it to our standard template
// https://gitlab.com/alberon/php-site-templates

module.exports = function ({ production, development, watch, hot, dest, publicPath }) {
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');
    const crypto = require('crypto');
    const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
    const fs = require('fs');
    const ImageminPlugin = (hasImages && useImagemin) && require('imagemin-webpack-plugin').default;
    const MiniCssExtractPlugin = (hasCss || hasSass) && require('mini-css-extract-plugin');
    const TerserPlugin = require('terser-webpack-plugin');
    const VueLoaderPlugin = hasVue && require('vue-loader/lib/plugin');
    const { BannerPlugin, DefinePlugin, HashedModuleIdsPlugin, NamedChunksPlugin } = require('webpack');
    const { MinChunkSizePlugin } = require('webpack').optimize;
    const AssetsManifest = require('webpack-assets-manifest');

    const usedChunkIds = new Set;
    const cacheIdentifier = crypto.createHash('md5')
        .update(fs.readFileSync(__filename))
        .update(fs.readFileSync(`${__dirname}/node_modules/.yarn-integrity`))
        .update(production ? 'production' : 'development')
        .digest('hex');

    const cacheLoader = {
        // https://github.com/webpack-contrib/cache-loader
        loader: 'cache-loader',
        options: {
            cacheIdentifier: cacheIdentifier,
        },
    };

    const cssLoader = {
        // https://github.com/webpack-contrib/css-loader
        loader: 'css-loader',
        options: {
            sourceMap: development,
        },
    };

    const postCssLoader = {
        // https://github.com/postcss/postcss-loader
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: () => [
                require('postcss-preset-env')({
                    // https://preset-env.cssdb.org/
                    // Includes:
                    // - Automatic vendor prefixes (Autoprefixer)    - https://github.com/postcss/autoprefixer
                    // - #rrggbbaa hex color codes with transparency - https://github.com/postcss/postcss-color-hex-alpha
                    // - :any-link pseudo-class                      - https://github.com/jonathantneal/postcss-pseudo-class-any-link
                    // - :matches() pseudo-class                     - https://github.com/postcss/postcss-selector-matches
                    // - < and > in media queries                    - https://github.com/postcss/postcss-media-minmax
                    // - More: https://preset-env.cssdb.org/features#stage-2
                    browsers: browsers,
                }),
            ],
            sourceMap: development,
        },
    };

    const styleLoaderOrCssExtract = {
        oneOf: [{
            // Don't extract CSS in Vue components (necessary for HMR,
            // and avoids creating lots of small CSS files)
            // Note: Source maps don't work 100% in Firefox 59+
            // https://github.com/webpack-contrib/style-loader/issues/303
            resourceQuery: /^\?vue/,
            loader: 'vue-style-loader',
        }, {
            // https://github.com/webpack-contrib/mini-css-extract-plugin
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: hot },
        }],
    };

    // Workaround for Terser ReferenceError: banner is not defined
    process.env.banner = banner;

    return {

        entry: entryPoints,
        externals : {
            vue : 'Vue'
        },
        output: {
            path: dest,
            publicPath: publicPath,
            filename: hot ? '[name].js' : '[name].[contenthash:20].js',
            chunkFilename: hot ? '[id].js' : '[id].[contenthash:20].js',
        },

        resolve: {
            alias: {
                // This allows imports relative to the main src directory
                //   JS:  import '@/js/example';
                //   CSS: url(~@/img/example.png)    - https://youtrack.jetbrains.com/issue/WEB-37978 (Fixed in PhpStorm 2019.3)
                //   Vue: <img src="@/img/logo.png"> - https://youtrack.jetbrains.com/issue/WEB-38331
                //
                // This is based on Vue CLI - https://cli.vuejs.org/guide/html-and-static-assets.html#url-transform-rules
                // It is disabled by default because we think it's better to be explicit most of the time,
                // but you can uncomment it if you have a particular case where it would be useful
                //'@': src,
            },
            extensions: ['.wasm', '.vue', '.mjs', '.js', '.json'],
        },

        module: {
            rules: [

                // Javascript
                useBabel && {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [{
                        // https://github.com/babel/babel-loader
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    // https://babeljs.io/docs/en/babel-preset-env (see .browserslistrc)
                                    corejs: 3,
                                    // debug: true, // Output targets/plugins used
                                    modules: false,
                                    targets: browsers,
                                    useBuiltIns: 'usage',
                                }],
                            ],
                            plugins: [
                                ['@babel/plugin-transform-runtime', {
                                    // https://babeljs.io/docs/en/babel-plugin-transform-runtime/
                                    // https://github.com/babel/babel-loader#babel-is-injecting-helpers-into-each-file-and-bloating-my-code
                                    corejs: 3,
                                    useESModules: true,
                                }],
                            ],
                            cacheDirectory: true,
                            cacheIdentifier: cacheIdentifier,
                            cacheCompression: false, // Faster (and consistent with cache-loader)
                        },
                    }],
                },

                // CSS
                hasCss && {
                    test: /\.css$/,
                    rules: [styleLoaderOrCssExtract, {
                        use: [
                            useCache && cacheLoader,
                            cssLoader,
                            postCssLoader,
                        ].filter(Boolean),
                    }],
                },

                // SCSS
                hasSass && {
                    test: /\.(sass|scss)$/,
                    rules: [styleLoaderOrCssExtract, {
                        use: [
                            useCache && cacheLoader,
                            cssLoader,
                            postCssLoader,
                            {
                                // Rewrite relative image paths in imports
                                // https://github.com/bholloway/resolve-url-loader
                                loader: 'resolve-url-loader',
                                options: {
                                    keepQuery: true, // e.g. ?inline
                                    sourceMap: development,
                                },
                            },
                            {
                                // https://github.com/webpack-contrib/sass-loader
                                // https://github.com/sass/node-sass
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: true, // Always required by resolve-url-loader
                                },
                            },

                        ].filter(Boolean),
                    }],
                },

                // Vue
                // https://vue-loader.vuejs.org/guide/#manual-setup
                hasVue && {
                    test: /\.vue$/,
                    use: [
                        useCache && cacheLoader,
                        'vue-loader',
                    ].filter(Boolean),
                },

                // Images - GIF, JPG, PNG
                hasImages && {
                    test: /\.(gif|jpeg|jpg|png)$/,
                    rules: [{
                        oneOf: [{
                            // Resize image - Always files (I can't find a way to inline them)
                            // https://github.com/herrstucki/responsive-loader
                            resourceQuery: /[?&](sizes|size|min|max)(=|&|\[|$)/,
                            loader: 'responsive-loader',
                            options: {
                                adapter: require('responsive-loader/sharp'),
                                name: '[name]-[width].[contenthash:20].[ext]',
                            },
                        }, {
                            // Anything in images.js - Always a file (no matter how small)
                            // https://github.com/webpack-contrib/file-loader
                            issuer: `${src}/img/images.js`,
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                            },
                        }, {
                            // image.jpg?file (or ?external) - Always a file
                            // https://github.com/webpack-contrib/file-loader
                            resourceQuery: /[?&](file|external)(&|$)/,
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                            },
                        }, {
                            // image.jpg?inline - Always inline data URI
                            // https://github.com/webpack-contrib/url-loader
                            resourceQuery: /[?&]inline(&|$)/,
                            loader: 'url-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                            },
                        }, {
                            // Default - inline small images under 1kb
                            loader: 'url-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                                limit: 1024,
                            },
                        }],
                    }],
                },

                // Images - SVG
                // https://github.com/bhovhannes/svg-url-loader
                hasImages && {
                    test: /\.svg$/,
                    rules: [{
                        oneOf: [{
                            // image.svg?file (or ?external) - Always a file
                            resourceQuery: /[?&](file|external)(&|$)/,
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                            },
                        }, {
                            // Anything in images.js - Always a file (no matter how small)
                            // https://github.com/webpack-contrib/file-loader
                            issuer: `${src}/img/images.js`,
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                            },
                        }, {
                            // image.svg?inline - Always inline data URI
                            resourceQuery: /[?&]inline(&|$)/,
                            loader: 'svg-url-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                                iesafe: true,
                                stripdeclarations: true,
                            },
                        }, {
                            // Default - inline small images under 1kb
                            loader: 'svg-url-loader',
                            options: {
                                name: '[name].[contenthash:20].[ext]',
                                limit: 1024,
                                stripdeclarations: true,
                            },
                        }],
                    }],
                },

                // Fonts and other files that don't need any processing
                {
                    test: /\.(ani|cur|eot|otf|ttf|woff2?)$/,
                    loader: 'file-loader',
                },

            ].filter(Boolean),
        },

        plugins: [
            // https://webpack.js.org/plugins/

            // Delete old build files before build, and images.js after build
            !hot && new CleanWebpackPlugin({
                // https://github.com/johnagan/clean-webpack-plugin
                cleanAfterEveryBuildPatterns: ['images.????????????????????.js'],
                protectWebpackAssets: false,
            }),

            // JavaScript
            new DefinePlugin({
                // https://webpack.js.org/plugins/define-plugin/
                // Shorthand for process.env.NODE_ENV === 'development'
                // Not just 'DEBUG' because PhpStorm thinks that's invalid
                'process.env.DEBUG': development,
            }),

            // CSS / SCSS
            (hasCss || hasSass) && new MiniCssExtractPlugin({
                // https://webpack.js.org/plugins/mini-css-extract-plugin/
                filename: hot ? '[name].css' : '[name].[contenthash:20].css',
                chunkFilename: hot ? '[id].css' : '[id].[contenthash:20].css',
            }),

            // Vue
            // https://vue-loader.vuejs.org/guide/#manual-setup
            hasVue && new VueLoaderPlugin,

            // Images
            hasImages && useImagemin && new ImageminPlugin({
                // https://www.npmjs.com/package/imagemin-webpack-plugin
                // Note: We have this enabled in development so we can see the quality
                // and ensure there are no more issues like SVG missing IDs (see below)
                gifsicle: { // GIF
                    // https://github.com/imagemin/imagemin-gifsicle
                    interlaced: false,
                },
                mozjpeg: { // JPG
                    // https://github.com/imagemin/imagemin-mozjpeg
                },
                optipng: { // PNG
                    // https://github.com/imagemin/imagemin-optipng
                },
                svgo: { // SVG
                    // https://github.com/imagemin/imagemin-svgo
                    plugins: [
                        // Prevent SVGs with IDs (e.g. sprites) losing content when minified
                        { cleanupIDs: false },
                    ],
                },
                test: /\.(jpe?g|png|gif|svg)$/i,
                cacheFolder: useCache ? `${__dirname}/node_modules/.cache/imagemin/${cacheIdentifier}` : null,
            }),

            // Add copyright banner to entry files
            banner && new BannerPlugin({
                // https://webpack.js.org/plugins/banner-plugin/
                banner: `/*\n${banner}\n*/`, // Prevent webpack adding '*' to each line or copying to the licenses file
                entryOnly: true,
                raw: true,
            }),

            // Improve browser caching by using stable IDs
            // https://webpack.js.org/plugins/hashed-module-ids-plugin/
            !hot && new HashedModuleIdsPlugin,

            !hot && new NamedChunksPlugin(function (chunk) {
                // Based on https://github.com/webpack/webpack/issues/4837#issuecomment-397545259 and HashedModuleIdsPlugin
                let resultId;
                if (chunk.name && !usedChunkIds.has(chunk.name)) {
                    resultId = chunk.name;
                } else {
                    const moduleIds = chunk.getModules().map(m => m.id).sort().join(';');
                    const hashId = crypto.createHash('md4').update(moduleIds).digest('hex');
                    let len = 4;
                    do resultId = hashId.substr(0, len++); while (usedChunkIds.has(resultId));
                }
                usedChunkIds.add(resultId);
                return resultId;
            }),

            // Combine small chunks to reduce the number of them
            new MinChunkSizePlugin({
                // https://webpack.js.org/plugins/min-chunk-size-plugin/
                minChunkSize: 5000,
            }),

            // Generate manifest.json for PHP
            new AssetsManifest({
                // https://github.com/webdeveric/webpack-assets-manifest
                customize: entry => entry.key === 'images.js' ? false : entry,
                space: 4,
                writeToDisk: true
            }),

            // Warn about duplicate packages
            new DuplicatePackageCheckerPlugin({
                // https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin
                verbose: true,
            }),

        ].filter(Boolean),

        // Automatically adds several plugins, and sets process.env.NODE_ENV
        // https://webpack.js.org/configuration/mode/
        mode: production ? 'production' : 'development',

        // Slower but much more useful (easier to debug) than the 'eval' variants
        // https://webpack.js.org/configuration/devtool/
        // TODO: Use 'hidden-source-map' for uploading to Sentry
        devtool: development ? 'inline-source-map' : false,

        optimization: {
            // https://webpack.js.org/configuration/optimization/
            minimizer: [
                new TerserPlugin({
                    // https://github.com/webpack-contrib/terser-webpack-plugin#options
                    cache: useCache ? `${__dirname}/node_modules/.cache/terser-webpack-plugin/${cacheIdentifier}` : false,
                    extractComments: {
                        condition: 'some',
                        filename: 'licenses.txt',
                        banner: file => `License information is in ${file}`,
                    },
                    // sourceMap: false, // Will need this for Sentry
                    terserOptions: {
                        // https://github.com/terser/terser#minify-options-structure
                        output: {
                            comments(output, comment) {
                                return process.env.banner && comment.value.trim() === process.env.banner.trim();
                            },
                        },
                    },
                }),
            ],
        },

        performance: {
            // https://webpack.js.org/configuration/performance/
            // Don't warn about large files in development mode (unoptimized) - only in production
            hints: production ? 'warning' : false,
        },

        devServer: {
            // https://webpack.js.org/configuration/dev-server/
            // Note: Also see scripts/webpack.js which adds further options
            before(app, server) {
                if (!watches.length) return;

                const chokidar = require('chokidar');

                chokidar
                    .watch(watches, {
                        alwaysStat: true,
                        atomic: false,
                        followSymlinks: false,
                        ignoreInitial: true,
                        ignorePermissionErrors: true,
                        persistent: true,
                        usePolling: true,
                    })
                    .on('all', (event, path) => {
                        console.log(`${path} modified (${event}) - triggering page reload`);
                        server.sockWrite(server.sockets, 'content-changed');
                    });
            },
            overlay: {
                warnings: true,
                errors: true,
            },
        },

    };
};


//--------------------------------------
// Auto-install dependencies
//--------------------------------------

// See scripts/webpack.js
module.exports.install = [

    'clean-webpack-plugin@^3.0.0',
    'duplicate-package-checker-webpack-plugin@^3.0.0',
    'file-loader@^4.2.0',
    'terser-webpack-plugin@^2.0.1',
    'webpack-assets-manifest@^3.1.1',

    useBabel && '@babel/core@^7.6.0',
    useBabel && '@babel/plugin-transform-runtime@^7.6.0',
    useBabel && '@babel/preset-env@^7.6.0',
    useBabel && '@babel/runtime-corejs3@^7.6.0',
    useBabel && 'babel-loader@^8.0.6',
    useBabel && 'core-js@^3.2.1',

    (hasCss || hasSass) && 'css-loader@^3.2.0',
    (hasCss || hasSass) && 'postcss-preset-env@^6.7.0',
    (hasCss || hasSass) && 'postcss-loader@^3.0.0',
    (hasCss || hasSass) && 'mini-css-extract-plugin@^0.8.0',

    hasSass && 'node-sass@^4.12.0',
    hasSass && 'resolve-url-loader@^3.1.0',
    hasSass && 'sass-loader@^8.0.0',

    hasImages && useImagemin && 'imagemin-webpack-plugin@^2.4.2',
    hasImages && 'responsive-loader@^1.2.0',
    hasImages && 'sharp@^0.23.0',
    hasImages && 'svg-url-loader@^3.0.2',
    hasImages && 'url-loader@^2.1.0',

    hasVue && 'vue@^2.6.10',
    hasVue && 'vue-loader@^15.7.1',
    hasVue && 'vue-template-compiler@^2.6.10',

    useCache && 'cache-loader@^4.1.0',

    watches.length && 'chokidar@^3.0.2',

].filter(Boolean);

module.exports.remove = [
    // This can be used to remove old dependencies (as long as they're not
    // required by other webpack configs or scripts)
    'bundle-loader',
    'es6-promise-promise',
];
