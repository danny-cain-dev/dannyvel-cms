import $ from 'jquery';

// <div data-runner="dir/script-name" data-opt1="opt1 value" data-opt2="{{ json_encode($object) }}"></div>
// The module should export a function that accepts an object containing 'el', '$el' and 'data'
// e.g.  export function init({ $el, data }) { ... }
// This can be used on any element (even the <body> tag) and used as many times as needed
let runners         = {};
let runnerInstances = {};
let requireRunner   = require.context('bundle-loader!../runners/', true, /\.js$/);

// Uncomment this to get a list of all module names
// console.log(requireRunner.keys());

$('[data-runner], [data-runners]').each(function (i, el)
{
    const $el = $(el);

    let name = $el.data('runner');
    if (name) {
        loadRunner(name);
    } else {
        $el.data('runners').split(/\s*,\s*/).forEach(loadRunner);
    }

    if (DEBUG && name && $el.data('runners')) {
        console.warn("Both 'data-runner' and 'data-runners' attributes are set - only 'data-runner' will be used", el);
    }

    function loadRunner(name)
    {
        const key = `./${name}.js`;

        // Make sure the key is set even if the load fails (e.g. compilation error), so hot reload still works
        if (module.hot) {
            runners[key] = null;
        }

        // Async load each script from separate chunks
        requireRunner(key)(function (script)
        {
            // Load all data- attributes (automatically converts JSON strings where needed)
            let instance = {
                data: $el.data(),
                el: el,
                $el: $el,
            };

            if (typeof script === 'function') {
                // module.exports = function () { ... };
                script(instance);
            } else if (typeof script.default === 'function') {
                // export default function () { ... }
                script.default(instance);
            }

            if (module.hot) {
                runners[key] = script;

                runnerInstances[key] = runnerInstances[key] || [];
                runnerInstances[key].push(instance);
            }
        });
    }
});

// Hot Module Replacement
if (module.hot) {
    // Listen for changes to any of the scripts
    module.hot.accept(requireRunner.id, function ()
    {
        // Update the context with the new script data
        requireRunner = require.context('bundle-loader!../runners/', true, /\.js$/);

        // Loop through the new scripts
        Object.keys(runners).forEach(function (key)
        {
            // Get the old script
            let oldScript = runners[key];

            let loader = requireRunner(key);
            // console.info(key, loader);

            // Download the module
            loader(function (newScript)
            {
                // If the module hasn't changed, skip it
                if (oldScript === newScript) return;

                try {

                    // If there is a hot_dispose() method on the old module, call it
                    if (typeof oldScript.hot_dispose === 'function') {
                        // module.exports.hot_dispose = function() { ... };
                        //   or
                        // export function hot_dispose() { ... }
                        runnerInstances[key].forEach((instance) => oldScript.hot_dispose(instance));
                    }

                    // Initialise the new module
                    if (newScript.hot_accept === true) {

                        if (typeof newScript === 'function') {
                            // module.exports = function () { ... };
                            // module.exports.hot_accept = true;
                            runnerInstances[key].forEach(newScript);
                        } else if (typeof newScript.default === 'function') {
                            // export default function () { ... }
                            // export const hot_accept = true;
                            runnerInstances[key].forEach(newScript.default);
                        }

                    } else if (typeof newScript.hot_accept === 'function') {

                        // module.exports.hot_accept = function() { ... };
                        //   or
                        // export function hot_accept() { ... }
                        runnerInstances[key].forEach(newScript.hot_accept);

                    } else {
                        throw new Error(`No hot_accept() method for ${name}`);
                    }

                } catch (err) {
                    // If there is no hot_accept() method/const, or either method (dispose or accept) threw an error, trigger
                    // a full page reload. This code is duplicated from Webpack itself:
                    // https://github.com/webpack/webpack/blob/54aa3cd0d6167943713491fd5e1110b777336be6/hot/dev-server.js#L32
                    // We can't just throw an error for Webpack to catch because this callback is asynchronous
                    console.warn('[HMR] Cannot apply update. Need to do a full reload!');
                    console.warn('[HMR] ' + err.stack || err.message);
                    window.location.reload();
                }

                runners[key] = newScript;
            });
        });
    });
}
