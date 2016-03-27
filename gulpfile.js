const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

gulp.task('lint', () =>
  gulp.src('index.js')
  .pipe(eslint())
  .pipe(eslint.format())
);

gulp.task('build', () => (
  gulp.src('lib/index.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'))
));
