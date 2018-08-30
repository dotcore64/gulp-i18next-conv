import PluginError from 'plugin-error';
import through from 'through2';
import path from 'path';
import vinylToString from 'vinyl-contents-tostring';
import {
  gettextToI18next,
  i18nextToPo,
  i18nextToPot,
  i18nextToMo,
} from 'i18next-conv';

const PLUGIN_NAME = 'gulp-i18next-conv';
const defDetermineLocale = filename => filename.split(path.sep)[0];

function getConverter(file, gettextFormat) {
  switch (path.extname(file.path)) { // file.extname doesn't work in older vinyl used by gulp 3
    case '.po':
    case '.pot':
    case '.mo':
      return [gettextToI18next, '.json'];
    case '.json':
      switch (gettextFormat) {
        case 'po':
          return [i18nextToPo, '.po'];
        case 'pot':
          return [i18nextToPot, '.pot'];
        case 'mo':
          return [i18nextToMo, '.mo'];
        default:
          throw new PluginError(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
      }
    default:
      throw new PluginError(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
  }
}

function getContents(file, data) {
  if (file.isBuffer()) {
    return Buffer.from(data);
  }

  if (file.isStream()) {
    const contents = through();
    contents.write(data);
    contents.end();

    return contents;
  }

  // In case vinyl accepts new file types in the future
  throw new Error('Invalid file');
}

// plugin level function (dealing with files)
function gulpGettextConv({
  determineLocale = defDetermineLocale,
  gettextFormat = 'po',
  ...options
} = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    let converter;
    let ext;

    try {
      [converter, ext] = getConverter(file, gettextFormat);
    } catch (err) {
      return cb(err);
    }

    return vinylToString(file, enc)
      .then((contents) => {
        try {
          const domain = determineLocale(file.relative, contents);
          return converter(domain, contents, options);
        } catch (e) {
          throw new PluginError(PLUGIN_NAME, 'determineLocale failed', { showStack: true });
        }
      })
      .then((data) => {
        const dirname = path.dirname(file.path);
        const basename = path.basename(file.path, path.extname(file.path));

        Object.assign(file, {
          path: path.join(dirname, `${basename}${ext}`),
          contents: getContents(file, data),
        });

        // make sure the file goes through the next gulp plugin
        this.push(file);
        cb();
      })
      .catch((err) => {
        cb(new PluginError(PLUGIN_NAME, err.message));
      });
  });
}

// exporting the plugin main function
module.exports = gulpGettextConv;
module.exports.determineLocale = defDetermineLocale;
