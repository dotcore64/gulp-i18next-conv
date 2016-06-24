# gulp-i18next-conv

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][dependency-status-badge]][dependency-status]
[![devDependency Status][dev-dependency-status-badge]][dev-dependency-status]

> Convert po files into i18next compatible json files

## Install

```
$ npm install --save-dev gulp-i18next-conv
```


## Usage

If for example you have the following po files: `locale/en/LC_MESSAGES/message.po` and `locale/jp/LC_MESSAGES/messages.po`, then you can produce `locale/en/messages.json` and `locale/jp/messages.json` with the following task:

```js
const gulp = require('gulp');
const i18next = require('gulp-i18next-conv');

gulp.task('locale-build', function() {
  // Backend locales
  return gulp.src('locale/*/LC_MESSAGES/*.po')
  .pipe(i18next())
  .pipe(jsonminify())
  .pipe(rename(path => path.dirname = path.dirname.replace('/LC_MESSAGES', '')))
  .pipe(gulp.dest('locale'));
});
```

Of course, the input paths and output paths can be fully adapted according to your needs.

## API

### i18next({ determineDomain, ...options })

#### determineDomain

Type: `function(filename, contents)` optional, default: `filename => filename.match(/^\/?([^\/]+)\//)[1]`

Function that can be used to determine the locale of the file being translated. Gets the relative path of the file, and its contents. By default it is the name of the first directory specified by a glob. For example, in the example above `locale/*/LC_MESSAGES/*.po`, the contents of the first `*` will be used as the locale name.

#### options

Type: `object`, optional, default `{}`

Any remaining properties will be passed to the [i18next-conv](https://github.com/i18next/i18next-gettext-converter) as options.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/travis/perrin4869/gulp-i18next-conv/master.svg?style=flat-square
[build]: https://travis-ci.org/perrin4869/gulp-i18next-conv

[npm-badge]: https://img.shields.io/npm/v/gulp-i18next-conv.svg?style=flat-square
[npm]: https://www.npmjs.org/package/gulp-i18next-conv

[coveralls-badge]: https://img.shields.io/coveralls/perrin4869/gulp-i18next-conv/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/perrin4869/gulp-i18next-conv

[dependency-status-badge]: https://david-dm.org/perrin4869/gulp-i18next-conv.svg?style=flat-square
[dependency-status]: https://david-dm.org/perrin4869/gulp-i18next-conv

[dev-dependency-status-badge]: https://david-dm.org/perrin4869/gulp-i18next-conv/dev-status.svg?style=flat-square
[dev-dependency-status]: https://david-dm.org/perrin4869/gulp-i18next-conv#info=devDependencies
