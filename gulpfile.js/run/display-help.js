import gulp from '../lib/gulp';

// This just neatens up the output by skipping the start + end task messages
if (process.argv.length <= 2 || process.argv[2] === 'help' || process.argv[2] === '--help' || process.argv[2] === '-h') {
    gulp.tasks.help.fn();
    process.exit();
}
