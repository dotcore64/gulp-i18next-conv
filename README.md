# gulp-i18next-conv

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

> Convert po files into i18next compatible json files

## Install

```
$ npm install --save-dev gulp-i18next-conv
```


## Usage

If for example you have the following po files: `locale/en/LC_MESSAGES/message.po` and `locale/jp/LC_MESSAGES/messages.po`, then you can produce `locale/en/messages.json` and `locale/jp/messages.json` with the following task:

```js
var gulp    = require('gulp'),
	i18next = require('gulp-i18next-conv');

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

### i18next(determineDomain)

#### determineDomain

Type: `function` optional, default: 

```js
function(filename) {
	return filename.match(/^\/?([^\/]+)\//)[1];
};
```

Function that can be used to specify what part of the input path is the locale. By default it is the name of the first directory specified by a glob. For example, in the example above `locale/*/LC_MESSAGES/*.po`, the contents of the first `*` will be used as the locale name.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/travis/perrin4869/gulp-i18next-conv/master.svg?style=flat-square
[build]: https://travis-ci.org/perrin4869/gulp-i18next-conv

[npm-badge]: https://img.shields.io/npm/v/gulp-i18next-conv.svg?style=flat-square
[npm]: https://www.npmjs.org/package/gulp-i18next-gulp
