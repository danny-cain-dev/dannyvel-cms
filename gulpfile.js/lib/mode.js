import gulp from '../lib/gulp';

export let dev, watch, live, hot;

gulp.task('set-mode:build', function ()
{
    dev   = false;
    watch = false;
    live  = false;
    hot   = false;

    process.env.NODE_ENV = 'production';
});

gulp.task('set-mode:dev', function ()
{
    dev   = true;
    watch = false;
    live  = false;
    hot   = false;

    process.env.NODE_ENV = 'development';
});

gulp.task('set-mode:watch', function ()
{
    dev   = true;
    watch = true;
    live  = false;
    hot   = false;

    process.env.NODE_ENV = 'development';
});

gulp.task('set-mode:live', function ()
{
    dev   = true;
    watch = true;
    live  = true;
    hot   = false;

    process.env.NODE_ENV = 'development';
});

gulp.task('set-mode:hot', function ()
{
    dev   = true;
    watch = true;
    live  = true;
    hot   = true;

    process.env.NODE_ENV = 'development';
});
