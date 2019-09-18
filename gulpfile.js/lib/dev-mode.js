import fs from 'fs';
import plugins from '../lib/plugins';
import * as config from '../config';
import * as mode from '../lib/mode';
import { log, colors } from 'gulp-util';

export const markerFilename = "DO NOT COMMIT CHANGES - RUN 'gulp build' OR 'gulp clean' FIRST";

export function needsRebuild()
{
    // Check for the existence of one of the marker files - if there are none we are either in production mode or have
    // never built the files and therefore definitely need to rebuild
    if (!fs.existsSync(`${config.root}/1. ${markerFilename}`)) {
        return true;
    }

    // When we use 'hot' mode, Webpack files are not generated
    // If we later switch to 'live' or 'watch' mode, we need to build them
    if (mode.hot) {
        return false;
    }

    return !fs.existsSync(`${config.dest}/webpack`);
}

export function displayWarning()
{
    log(
        colors.blue.bold('Note:'),
        colors.white.bold('Running in'),
        colors.blue.bold('development mode'),
        colors.white.bold('- remember to rebuild in production mode before committing any changes')
    );
}

export function generateWarningFiles()
{
    if (!mode.dev || fs.existsSync(`${config.root}/1. ${markerFilename}`)) {
        return plugins.through2.obj();
    }

    // Create 10 separate warning files, to increase the chances they're noticed in "git status"
    let files = [];

    for (let i = 0; i <= 9; i++) {
        files.push({ name: `${i}. ${markerFilename}`, source: `${markerFilename}\n` });
    }

    return plugins.file(files);
}
