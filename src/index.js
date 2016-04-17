const Promise = require('bluebird');

const through = require('through2');
const gutil = require('gulp-util');
const conv = require('i18next-conv');
const path = require('path');

const PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-i18next-conv';

conv.gettextToI18nextDataAsync = Promise.promisify(conv.gettextToI18nextData);

const defDetermineDomain = filename => filename.match(/^\/?([^\/]+)\//)[1];

// plugin level function (dealing with files)
function gulpGettextConv(determineDomain = defDetermineDomain, options = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    conv.gettextToI18nextDataAsync(determineDomain(file.relative), file.path, options)
    .then(data => {
      const newFile = file.clone();

      if (file.isBuffer()) {
        newFile.contents = new Buffer(data);
      } else if (file.isStream()) {
        // start the transformation
        newFile.contents.write(data);
        newFile.contents.end();
      } else {
        throw new Error('Invalid file');
      }

      const dirname = path.dirname(file.path);
      const basename = path.basename(file.path);
      newFile.path = path.join(dirname, basename.replace(path.extname(basename), '.json'));
      // make sure the file goes through the next gulp plugin
      this.push(newFile);
    })
    .catch(err => {
      throw new PluginError(PLUGIN_NAME, err.message);
    })
    .asCallback(cb);
  });
}

// exporting the plugin main function
module.exports = gulpGettextConv;
