import Handlebars from 'handlebars';
import * as config from '../config';
import * as mode from '../lib/mode';
import * as webpack from '../lib/webpack';


//----------------------------------------
// Register helpers
//----------------------------------------

// Get a versioned filename from an original filename - e.g. {{filename 'webpack/main.js'}}
// Based on Asset::filename() - see helpers/Asset.php
Handlebars.registerHelper('filename', function (name)
{
    const fs = require('fs');

    // Webpack versioned files
    if (name.substr(0, 8) === 'webpack/') {
        const filename = `${config.dest}/webpack/manifest.json`;
        const manifest = JSON.parse(fs.readFileSync(filename));

        name = name.substr(8);

        if (manifest[name]) {
            return 'webpack/' + manifest[name];
        }

        throw new Error(`Cannot find asset '${name}' in ${filename}`);
    }

    // Gulp versioned files
    const filename = `${config.dest}/manifest.json`;
    const manifest = JSON.parse(fs.readFileSync(filename));

    if (manifest[name]) {
        return manifest[name];
    }

    throw new Error(`Cannot find asset '${name}' in ${filename}`);
});


//----------------------------------------
// Compile templates to functions
//----------------------------------------

const templates = {};

function compile(filename)
{
    // Cache compiled templates in memory
    if (!templates[filename]) {
        const fs = require('fs');

        const source = fs.readFileSync(`${__dirname}/../templates/${filename}`, { encoding: 'utf8' });

        // http://handlebarsjs.com/
        templates[filename] = Handlebars.compile(source);
    }

    return templates[filename];
}


//----------------------------------------
// Generate files from templates
//----------------------------------------

export function generate(template)
{
    template = compile(template);

    return template({ config, mode, process, webpack, php: '<?php' });
}
