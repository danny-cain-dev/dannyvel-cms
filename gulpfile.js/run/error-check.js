import fs from 'fs';
import * as config from '../config';
import { log, colors } from 'gulp-util';

let exit = false;

// Check .env file settings
if (!process.env.LIVERELOAD_HOSTNAME) {
    log(colors.yellow('WARNING: LIVERELOAD_HOSTNAME is not set in .env'));
    process.env.LIVERELOAD_HOSTNAME = 'localhost';
}

if (!process.env.WEBPACK_SSL) {
    log(colors.yellow('WARNING: WEBPACK_SSL is not set in .env'));
    process.env.WEBPACK_SSL = 'false'; // No booleans allowed
}

// Ensure configured directories exist
if (!config.root) {
    log(colors.red.bold('Error: config.root is not set'));
    exit = true;
} else if (!fs.existsSync(config.root)) {
    log(colors.red.bold(`Error: root directory does not exist (${config.root}/)`));
    exit = true;
}

if (!config.src) {
    log(colors.red.bold('Error: config.src is not set'));
    exit = true;
} else if (!fs.existsSync(config.src)) {
    log(colors.red.bold(`Error: src directory does not exist (${config.src}/)`));
    exit = true;
}

if (!config.docroot) {
    log(colors.red.bold('Error: config.docroot is not set'));
    exit = true;
} else if (!fs.existsSync(config.docroot)) {
    log(colors.red.bold(`Error: docroot directory does not exist (${config.docroot}/)`));
    exit = true;
}

// Exit if there were any fatal errors
if (exit) {
    process.exit(1);
}

// Check if the build directory is listed in gitattributes
let found = false;

if (fs.existsSync(`${config.root}/.gitattributes`)) {
    let contents = fs.readFileSync(`${config.root}/.gitattributes`, { encoding: 'utf8' });
    let filename = config.dest.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
    if (new RegExp(`^/${filename}/\\*\\*\\s+binary`, 'm').test(contents)) {
        found = true;
    }
}

if (!found) {
    log(
        colors.blue.bold('Note:'),
        colors.white.bold('If you add'),
        colors.blue.bold(`/${config.dest}/** binary`),
        colors.white.bold("to .gitattributes, Git won't show generated files in diff/merge")
    );
}
