const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', () => (
  gulp.src('lib/index.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'))
));
