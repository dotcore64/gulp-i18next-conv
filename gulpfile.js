const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

const src = 'lib/index.js';

gulp.task('lint', () =>
  gulp.src(src)
  .pipe(eslint())
  .pipe(eslint.format())
);

gulp.task('build', ['lint'], () => (
  gulp.src(src)
  .pipe(babel())
  .pipe(gulp.dest('dist'))
));
