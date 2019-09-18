import * as config from '../config';

export function plugins()
{
    // This is used in both Webpack and Gulp
    return [

        // cssnext - http://cssnext.io/
        // Includes Autoprefixer - https://github.com/postcss/autoprefixer
        require('postcss-cssnext')({
            // http://cssnext.io/usage/
            browsers: config.browsers,
            feature: {
                autoprefixer: {
                    grid: false, // IE11/Edge grid support is not good enough
                },
            },
        }),

    ];
}
