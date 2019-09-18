import fs from 'fs';
import plugins from '../lib/plugins';
import * as config from '../config';
import * as mode from '../lib/mode';
import { log, colors } from 'gulp-util';

// https://github.com/vohof/gulp-livereload

let enabled = true;
let port = 35729;

/**
 * Start LiveReload server
 */
export function start(cb)
{
    function listen()
    {
        // log(colors.black.bold(`Starting LiveReload server on port ${port}...`));
        let opts = {
            port: port,
            quiet: true,
            errorListener: failed,
        };

        if (process.env.WEBPACK_SSL === 'true') {
            // Using Webpack's self-signed SSL certificate (webpack-dev-server/ssl/server.pem)
            // TODO: They have switched to using a randomly generated certificate, so there's no benefit to using theirs
            // https://github.com/webpack/webpack-dev-server/pull/942
            opts.cert = `-----BEGIN CERTIFICATE-----
MIIDIDCCAgigAwIBAgIJAL7WpFUUJ1eDMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV
BAMTCWxvY2FsaG9zdDAeFw0xNjEwMjkxNDAzNDJaFw0yNjEwMjcxNDAzNDJaMBQx
EjAQBgNVBAMTCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOW+YWdnccD9ENOTDFWRma7PnnHOWczgW75L5NQmew/+2l3snf71kVw+umUG
5MKfF1MXIQLywpsvOKQsHMXWo16E/2HY/NF/kj7h3ce2MaHUmPa5eSnzo+Z95+FD
8TiUVxVs5zhvmrXq6mG/lkU5nCX0vfnCbXws+UDZ2B4Xc3A3jwpT/He/KP+lTBgM
ZdrLnKBfssfVwLNb0A+sGIjVoeTznZcVwK9Yrs7bp8vzFdHZZ7df9jULaVY9zr3j
Daoui3nTt23ljLuTW97J51HSuvBMaIiVbWyWecxKJTK2Pc0vSd5U1ZKu8IWVAJtf
GoW1F/IN435duVxFVI4ymzQd730CAwEAAaN1MHMwHQYDVR0OBBYEFKkaLYAmQMa/
1mDLJBlOn+h116WbMEQGA1UdIwQ9MDuAFKkaLYAmQMa/1mDLJBlOn+h116WboRik
FjAUMRIwEAYDVQQDEwlsb2NhbGhvc3SCCQC+1qRVFCdXgzAMBgNVHRMEBTADAQH/
MA0GCSqGSIb3DQEBCwUAA4IBAQCi2ywUN/y5fgH2PTVZjgKq6AUD/RqrdTISa2UO
kxcSPlSGNlapjHD3iGpZ2FdyCVYoCIIRx9Eol9B2VW7gihbJrMdybbZk1v16AN1y
sqgcHhXOeEh4Phi/suljZOaCWGoj1eZOvTXV7fZjeSq4lmdXEwFGuxXwVgvt8teM
vJT6i3DtxcD7+V60Q691ky+QuZqDG1FKVmzXQ1CNt7Bq3075pled1KJz8ziIEdjc
KeBDWN/NLbyZeBwlg9QxrbGazxGedMQdDzG5kyaaXwhCvAxfY2yHzkV/2iFE17AJ
0796jb2KsrT6JNtwkMye1Jc/ZwNat7InH5WkqFzUrCKqw08u
-----END CERTIFICATE-----`;

            opts.key = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA5b5hZ2dxwP0Q05MMVZGZrs+ecc5ZzOBbvkvk1CZ7D/7aXeyd
/vWRXD66ZQbkwp8XUxchAvLCmy84pCwcxdajXoT/Ydj80X+SPuHdx7YxodSY9rl5
KfOj5n3n4UPxOJRXFWznOG+aterqYb+WRTmcJfS9+cJtfCz5QNnYHhdzcDePClP8
d78o/6VMGAxl2sucoF+yx9XAs1vQD6wYiNWh5POdlxXAr1iuztuny/MV0dlnt1/2
NQtpVj3OveMNqi6LedO3beWMu5Nb3snnUdK68ExoiJVtbJZ5zEolMrY9zS9J3lTV
kq7whZUAm18ahbUX8g3jfl25XEVUjjKbNB3vfQIDAQABAoIBAANyKpXZeFxTr2ft
Abda2rpDhPXiCXjIOLgO/VytQxVHVlEoVmpXlpmSm0seolnE9x2Y8DbSG1cmiyvz
OW9CO+sUBZybG5es2S22R5RSSEZMIQs6VvXpIKE5bDv1v+2AVBoPKxyul9x4rJFQ
xVk+dvgexqazYt8E8awmWFaDNYkOVQCBcBvbiObg1g7m3iY8vaTnTOixYva++++0
+7XcVwYsF1yD8UE8I311ujhsoi+bK6Skz/lNqy+//59pIae9hRHAo2Mh79zCxapf
miDbTI9Vs39eL6h52yO1V+fJ352sFJzxlx8xDGEPJeVqS6ht8C067BXAgVGvvaMl
7jGT44UCgYEA+nAG77B+buP/qGYJMYYZQuUxQQq7nM0D2QA1u233lQMUBaTzDQTq
jhSfdlko2uguad8HaqmVS2fhHQXFDNsCWTmrA7r3qB2TvWCOct4a+sAosP/CWRo9
Dk67hKCpPBVMA1HBcj0gmYccd4/Wz8d1DfiUyv63dTWCiVUNOQU1rFsCgYEA6tiw
X4RqdT9kz0FETENG0y7TV/VHBeqGJLcyzekc1+HX5vUuextaaDBplzxmES6WnQO3
9geEksD/4pKuAJUNQUjUSYEabWuSIO3ix2irJEmX6UISGJOVKGnmOzrdgOzVZg30
gqRr0JXm99ci93piQewqXVYWfeqWLSw8u6NL+wcCgYBweQmUciaGNN1nytOMK1aD
BZ3WQTS7GhQFTCPVlnCfuq8uTcNecHvK7ZYkN6yyi530rFaPX7QOFowyVZoGyQFI
Ay870KdTGF12qruu+PMS9GQSAftNuwv6tf9fdCwtML9fqkL/xFY0vUpao/3seP6o
FKD2fej0ueBzPwBeQGm3iwKBgF6PKVUMaCEViW26Bdn/LMFTlV1RMWu8Zo7aBObL
+gUitmAUUMbY2Koi9CEk/KPmclZ+bM/vbv34IBAGp3Esks26mV+PUCjGq2v+3NUV
2/McfsI5DDhBFEnVehJXPWDv+2zAKbeApLiz4u/f/ABRksagZN54D05b6mP97+ZN
dgZ5AoGBAIBXSJ24JOo6Z8hiqQVEO9oI1ZQlwzc2TR1dKrjLBl2y7/AClSr3b2++
iNQOyycweCF8WPM+Pf9fRBjI6STtiboVAcCq/vP/eSGX5SJWRSTENFTiBprdcj2P
p+exFe+9P1yAy5WxLnt7cTFsdgqG6HXq0MOEUIyNcLVWnmZnIncC
-----END RSA PRIVATE KEY-----`;
        }

        plugins.livereload.listen(opts, listening);
    }

    function listening()
    {
        log(colors.white.bold(`LiveReload server running on port ${port}...`));
        cb();
    }

    function failed(err)
    {
        // Need to clear the server instance so we can try again
        plugins.livereload.server = undefined;

        if (err.code === 'EADDRINUSE') {
            // Port in use - try again on another port
            port++;
            listen();
        } else {
            // Some other error - give up
            log(colors.red.bold(`Cannot run LiveReload server on port ${port}`));
            log(colors.red.bold('> ') + (err.stack || err.message));
            cb();
        }
    }

    listen();
}

/**
 * Temporarily disable reloading - used during full rebuilds to delay reloading until every task has finished
 */
export function pause()
{
    enabled = false;
}

/**
 * Re-enable reloading
 */
export function resume()
{
    enabled = true;
}

/**
 * Reload the full page (if enabled)
 */
export function reload()
{
    if (enabled) {
        plugins.livereload.reload();
    }
}

/**
 * Reload the full page (even if disabled)
 */
export function forceReload()
{
    plugins.livereload.reload();
}

/**
 * Sends notifications about files in a stream to the LiveReload client (if enabled)
 */
export function stream()
{
    if (!enabled) {
        return plugins.through2.obj();
    }

    // Ignore .map files, else it reloads the entire page every time
    return plugins.if(['*', '!*.map'], plugins.livereload());
}

export function generateLiveReloadHtml()
{
    let contents = '';

    if (mode.live) {
        let script = (process.env.WEBPACK_SSL === 'true' ? 'https' : 'http') + `://${process.env.LIVERELOAD_HOSTNAME}:${port}/livereload.js`;
        contents += `<script src="${script}" defer></script>\n`;
    }

    // Always write the file, even if LiveReload is disabled, so we can blindly include it in the output
    // https://github.com/alexmingoia/gulp-file
    return plugins.file('livereload.html', contents);
}

export function clearScript()
{
    // Do this synchronously for simplicity and to ensure it completes before Node exits
    fs.writeFileSync(`${config.dest}/livereload.html`, '');
}
