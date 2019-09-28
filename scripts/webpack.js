#!/usr/bin/env node

/*##############################################################################
# Run webpack
#
# **Usage:**
# `t webpack [[target] mode]`
#
# **Examples:**
# `t webpack`          - Display help & list of available targets
# `t webpack build`    - Production build of `webpack/default.js`
# `t webpack nova hot` - Run HMR server for `webpack/nova.js`
#
# Targets are configured in `webpack.json`.
##############################################################################*/

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.dirname(__dirname);


//--------------------------------------
// Helpers
//--------------------------------------

// Note: No packages are installed the first time this script runs so we can't
// use packages for colour-coding, etc. until after they're installed (below)
const darkGray = "\033[90m";
const lightCyan = "\033[96m";
const lightGreen = "\033[92m";
const lightRed = "\033[91m";
const reset = "\033[0m";
const white = "\033[97m";

function fail(message) {
    console.error(lightRed + message + reset);
    process.exit(1);
}


//--------------------------------------
// Load targets
//--------------------------------------

const targetsFile = `${root}/webpack.json`;

if (!fs.existsSync(targetsFile)) {
    fail(`Cannot find webpack.json in ${root}`);
}

const targets = require(targetsFile);

if (!targets || typeof targets !== 'object' || Object.keys(targets).length === 0) {
    fail('No targets configured in webpack.json');
}


//--------------------------------------
// Parse arguments
//--------------------------------------

let target, mode;

if (process.argv.length === 2) {
    // t webpack
    target = 'default';
    mode = 'help';
} else if (process.argv.length === 3) {
    // t webpack build
    target = 'default';
    mode = process.argv[2];
} else if (process.argv.length === 4) {
    // t webpack nova build
    // Note: The mode is last to make it easier to jump between dev/hot and build
    target = process.argv[2];
    mode = process.argv[3];
} else {
    fail('Too many arguments');
}

// Mode aliases / shortcuts
const aliases = {
    '-h': 'help',
    'help': 'help',
    '--help': 'help',

    'b': 'production',
    'p': 'production',
    'prod': 'production',
    'build': 'production',
    'production': 'production',

    'bw': 'production-watch',
    'pw': 'production-watch',
    'prod-watch': 'production-watch',
    'build-watch': 'production-watch',
    'production-watch': 'production-watch',

    'd': 'development',
    'dev': 'development',
    'development': 'development',

    'w': 'development-watch',
    'dw': 'development-watch',
    'watch': 'development-watch',
    'dev-watch': 'development-watch',
    'development-watch': 'development-watch',

    'h': 'hot',
    'l': 'hot', // Backwards compatibility with our old Gulpfile
    'hmr': 'hot',
    'hot': 'hot',
    'live': 'hot',

    'cc': 'clear-cache',
    'clear-cache': 'clear-cache',
    'cache:clear': 'clear-cache', // Laravel format
};

if (mode in aliases) {
    mode = aliases[mode];
} else if (target in aliases && !(target in targets)) {
    // Quietly fix arguments in the wrong order
    // t webpack build nova
    [mode, target] = [aliases[target], mode];
}

// Validate target
if (!(target in targets)) {
    fail(`Invalid target '${target}'`);
}

const targetData = targets[target];

for (let setting of ['config', 'dest', 'publicPath', 'packages']) {
    if (!(setting in targetData)) {
        fail(`Missing "${setting}" setting in '${target}' target`);
    }
}

const packageFile = `${root}/${targetData.packages}`;
const packageDir = path.dirname(packageFile);

// Load config file
const configFile = `${root}/${targetData.config}`;
if (!fs.existsSync(configFile)) {
    fail(`Cannot find config file '${configFile}'`);
}

const configData = require(configFile);


//--------------------------------------
// Help
//--------------------------------------

if (mode === 'help') {
    console.log(`${lightGreen}Usage:${reset}`);
    console.log(`${white}scripts/webpack.js [target] <mode>${reset}`);
    console.log();

    console.log(`  ${lightCyan}target${reset}`);
    for (let [target, targetData] of Object.entries(targets)) {
        console.log(`  ${white}${target}${reset} - ${targetData.config || 'Unknown'}`);
    }
    console.log();

    console.log(`  ${lightCyan}mode${reset}`);
    console.log(`  ${white}production${reset} - Build once in production mode ${darkGray}(p, prod, b, build)${reset}`);
    console.log(`  ${white}production-watch${reset} - Build in production mode and watch for changes ${darkGray}(pw, bw)${reset}`);
    console.log(`  ${white}development${reset} - Build once in development mode ${darkGray}(d, dev)${reset}`);
    console.log(`  ${white}watch${reset} - Build in development mode and watch for changes ${darkGray}(w, dw)${reset}`);
    console.log(`  ${white}hot${reset} - Run hot module replacement (HMR) server ${darkGray}(h, hmr)${reset}`);
    console.log(`  ${white}clear-cache${reset} - Clear all caches (e.g. Babel, Terser, webpack) ${darkGray}(cc)${reset}`);
    console.log();

    console.log(`${lightGreen}Examples:${reset}`);
    console.log(`${white}scripts/webpack.js build${reset}`);
    console.log(`${white}scripts/webpack.js nova hot${reset}`);

    process.exit();
}


//--------------------------------------
// Install dependencies
//--------------------------------------

function escapeArg(arg) {
    return "'" + arg.replace(/'/g, `'\\''`) + "'";
}

function installed(packageJson, name) {
    // Note: Package names may include '@' at the start (e.g. @babel/core)
    name = name.replace(/@[^@]+$/, '');

    return Boolean(
        (packageJson.devDependencies && packageJson.devDependencies[name]) ||
        (packageJson.dependencies && packageJson.dependencies[name]),
    );
}

function installAndRemove(packageJsonDir, packagesToInstall, packagesToRemove = []) {

    const packageJsonFile = path.join(packageJsonDir, 'package.json');

    // Ensure package.json exists
    if (!fs.existsSync(packageJsonFile)) {
        fs.writeFileSync(packageJsonFile, JSON.stringify({
            "private": true,
            "license": "UNLICENSED",
        }, null, 4))
    }

    // Read package.json
    const packageJson = require(packageJsonFile);

    // Install
    packagesToInstall = (packagesToInstall || [])
        .filter(pkg => !installed(packageJson, pkg));

    if (packagesToInstall.length > 0) {
        let command = 'yarn add --dev ' + packagesToInstall.map(escapeArg).join(' ');

        console.log(lightCyan + 'Installing missing packages...' + reset);
        console.log(darkGray + command + reset);
        console.log('');
        childProcess.execSync(command, { cwd: packageJsonDir, stdio: 'inherit' });
        console.log('');
    }

    // Remove
    packagesToRemove = (packagesToRemove || [])
        .filter(pkg => installed(packageJson, pkg));

    if (packagesToRemove.length > 0) {
        let command = 'yarn remove ' + packagesToRemove.map(escapeArg).join(' ');

        console.log(lightCyan + 'Removing old packages...' + reset);
        console.log(darkGray + command + reset);
        console.log('');
        childProcess.execSync(command, { cwd: packageJsonDir, stdio: 'inherit' });
        console.log('');
    }
}

const myPackages = [
    'dedent@^0.7.0',
    'portfinder@^1.0.24',
    'rimraf@^3.0.0',
    'webpack@^4.39.3',
    'webpack-dev-middleware@^3.7.0',
    'webpack-dev-server@^3.8.0',
];

const myOldPackages = [
    // This can be used to remove old dependencies (as long as they're not
    // required by the webpack config or other scripts)
];

if (root === packageDir) {

    // Combined (faster)
    installAndRemove(
        root,
        myPackages.concat(configData.install || []),
        myOldPackages.concat(configData.remove || []),
    );

} else {

    // For this script
    installAndRemove(root, myPackages, myOldPackages);

    // For the webpack config file
    installAndRemove(packageDir, configData.install, configData.remove);

}


//--------------------------------------
// Clear cache
//--------------------------------------

if (mode === 'clear-cache') {
    const cacheDir = `${packageDir}/node_modules/.cache`;

    if (fs.existsSync(cacheDir)) {
        const rimraf = require('rimraf');

        rimraf.sync(cacheDir, { glob: false });

        console.log(`Deleted ${cacheDir}/`);
    } else {
        console.log(`No cache exists (${cacheDir}/)`);
    }

    process.exit();
}


//--------------------------------------
// Run webpack
//--------------------------------------

const webpack = require('webpack');

const statsConfig = {
    // assets: false,
    // children: false,
    // chunks: false,
    colors: true,
    errorDetails: true,
    // hash: false,
    // timings: false,
    // version: false,
};

const watchOptions = {
    // poll: true,
};

let hot = (mode === 'hot');
let production = (mode === 'production' || mode === 'production-watch');
let development = !production;
let watch = (mode === 'production-watch' || mode === 'development-watch');

// Required by cache-loader (and maybe others)
process.env.NODE_ENV = production ? 'production' : 'development';

let subdir = 'prod';
if (hot) {
    subdir = 'hot';
} else if (development) {
    subdir = 'dev';
}

let dest = `${root}/${targetData.dest}/${subdir}`;
let publicPath = `${targetData.publicPath}/${subdir}/`;

let config = configData({ production, development, watch, hot, dest, publicPath });

function compiler() {
    const compiler = webpack(config);

    // Display progress
    const ProgressPlugin = webpack.ProgressPlugin;
    new ProgressPlugin({ profile: true, entries: true }).apply(compiler);

    return compiler;
}

let firstRun = true;

function separator(show = true) {
    if (firstRun) {
        firstRun = false;
    } else if (show) {
        console.log();
        console.log('----------------------------------------');
        console.log();
    }
}

function writeFile(file, data) {
    let dir = path.dirname(file);

    try {
        fs.mkdirSync(dir);
    } catch (e) {
        if (!fs.existsSync(dir)) {
            throw e;
        }
    }

    fs.writeFileSync(file, data);
}

function writeJsonFile(file, data) {
    writeFile(file, JSON.stringify(data, null, 4) + "\n");
}


function deleteFile(file) {
    try {
        fs.unlinkSync(file);
    } catch (e) {
        if (fs.existsSync(file)) {
            throw e;
        }
    }
}

function compilerCallback(err, stats) {
    if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        process.exit(1);
    }

    let output = stats.toString(statsConfig);

    if (output) {
        separator();
        console.log(output);
    }
}

if (mode === 'hot') {

    const crypto = require('crypto');
    const dedent = require('dedent');
    const standardReporter = require('webpack-dev-middleware/lib/reporter');
    const DevServer = require('webpack-dev-server');

    // Hash the path to get a stable port, so clients can reconnect after restart
    const hash = crypto.createHash('md4').update(dest).digest('hex');
    const preferredPort = 49152 + parseInt(hash, 16) % (65535 - 49152 - 100);

    // Make sure the port is available, and get the next available one if not
    require('portfinder').getPort({ port: preferredPort }, function (err, port) {
        if (err) throw err;

        // Start the development server
        const devServer = new DevServer(webpack(config), {
            contentBase: false, // Don't serve non-webpack files
            disableHostCheck: true, // https://github.com/webpack/webpack-dev-server/issues/1604
            headers: { 'Access-Control-Allow-Origin': '*' },
            hot: true,
            public: `0.0.0.0:${port}`, // Required even when proxying, else it connects to localhost
            publicPath: publicPath,
            sockPath: `${publicPath}sockjs-node`, // Must be the same as the proxy path
            reporter(middlewareOptions, options) {
                separator(!options.state /* Compiling... */);
                standardReporter(middlewareOptions, options)
            },
            stats: statsConfig,
            watchOptions: watchOptions,
            // The webpack config file may add to/override these options
            ...(config.devServer || {}),
        });

        devServer.listen(port, '::');

        // Configure Apache to proxy requests to the dev server (prevents SSL warnings)
        writeFile(`${dest}/.htaccess`, dedent`
            RewriteEngine on

            RewriteCond %{HTTP:Connection} Upgrade [NC]
            RewriteCond %{HTTP:Upgrade} websocket [NC]
            RewriteRule (.*) ws://127.0.0.1:${port}${publicPath}$1 [P,L]

            RewriteRule (.*) http://127.0.0.1:${port}${publicPath}$1 [P,L]\n
        `);

        // Tell PHP what mode to use
        writeJsonFile(`${root}/${targetData.dest}/mode.json`, { mode: 'hot' });
    });

} else {

    // Run webpack
    if (watch) {
        compiler().watch(watchOptions, compilerCallback);
    } else {
        compiler().run(compilerCallback);
    }

    // Tell PHP what mode to use
    writeJsonFile(`${root}/${targetData.dest}/mode.json`, { mode: production ? 'prod' : 'dev' });

}

// Only commit the production build files, not development
writeFile(`${root}/${targetData.dest}/.gitignore`, "/.gitignore\n/dev/\n/hot/\n/mode.json\n");
