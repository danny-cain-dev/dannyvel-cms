import * as config from '../config';
import * as mode from '../lib/mode';
import * as webpack from '../lib/webpack';

export function all()
{
    return {
        dev: mode.dev,
        hot: mode.hot,
        dest: config.dest,
        publicPath: config.publicPath,
        webpackHost: mode.hot ? `${process.env.LIVERELOAD_HOSTNAME}:${webpack.port}` : null,
        webpackSsl: mode.hot ? process.env.WEBPACK_SSL === 'true' : null,
    };
}
