var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var opts = {};
opts.entries = ['./']
opts.standalone = 'ioRouter';

gulp.task('default', function() {
    return browserify(opts)
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('socket.io-router.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./build/'));
});
