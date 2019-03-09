"use strict";

var _pluginError = _interopRequireDefault(require("plugin-error"));

var _through = _interopRequireDefault(require("through2"));

var _path = _interopRequireDefault(require("path"));

var _vinylContentsTostring = _interopRequireDefault(require("vinyl-contents-tostring"));

var _i18nextConv = require("i18next-conv");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const PLUGIN_NAME = 'gulp-i18next-conv';

const defDetermineLocale = filename => filename.split(_path.default.sep)[0];

function getConverter(file, gettextFormat) {
  switch (_path.default.extname(file.path)) {
    // file.extname doesn't work in older vinyl used by gulp 3
    case '.po':
    case '.pot':
    case '.mo':
      return [_i18nextConv.gettextToI18next, '.json'];

    case '.json':
      switch (gettextFormat) {
        case 'po':
          return [_i18nextConv.i18nextToPo, '.po'];

        case 'pot':
          return [_i18nextConv.i18nextToPot, '.pot'];

        case 'mo':
          return [_i18nextConv.i18nextToMo, '.mo'];

        default:
          throw new _pluginError.default(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
      }

    default:
      throw new _pluginError.default(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
  }
}

function getContents(file, data) {
  if (file.isBuffer()) {
    return Buffer.from(data);
  }

  if (file.isStream()) {
    const contents = (0, _through.default)();
    contents.write(data);
    contents.end();
    return contents;
  } // In case vinyl accepts new file types in the future


  throw new Error('Invalid file');
} // plugin level function (dealing with files)


function gulpGettextConv(_ref = {}) {
  let _ref$determineLocale = _ref.determineLocale,
      determineLocale = _ref$determineLocale === void 0 ? defDetermineLocale : _ref$determineLocale,
      _ref$gettextFormat = _ref.gettextFormat,
      gettextFormat = _ref$gettextFormat === void 0 ? 'po' : _ref$gettextFormat,
      options = _objectWithoutProperties(_ref, ["determineLocale", "gettextFormat"]);

  // creating a stream through which each file will pass
  return _through.default.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    let converter;
    let ext;

    try {
      var _getConverter = getConverter(file, gettextFormat);

      var _getConverter2 = _slicedToArray(_getConverter, 2);

      converter = _getConverter2[0];
      ext = _getConverter2[1];
    } catch (err) {
      return cb(err);
    }

    return (0, _vinylContentsTostring.default)(file, enc).then(contents => {
      try {
        const domain = determineLocale(file.relative, contents);
        return converter(domain, contents, options);
      } catch (e) {
        throw new _pluginError.default(PLUGIN_NAME, 'determineLocale failed', {
          showStack: true
        });
      }
    }).then(data => {
      const dirname = _path.default.dirname(file.path);

      const basename = _path.default.basename(file.path, _path.default.extname(file.path));

      Object.assign(file, {
        path: _path.default.join(dirname, `${basename}${ext}`),
        contents: getContents(file, data)
      }); // make sure the file goes through the next gulp plugin

      this.push(file);
      cb();
    }).catch(err => {
      cb(new _pluginError.default(PLUGIN_NAME, err.message));
    });
  });
} // exporting the plugin main function


module.exports = gulpGettextConv;
module.exports.determineLocale = defDetermineLocale;