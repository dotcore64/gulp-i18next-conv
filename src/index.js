import Promise from 'bluebird';
import { PluginError } from 'gulp-util';

import through from 'through2';
import conv from 'i18next-conv';
import path from 'path';

// consts
const PLUGIN_NAME = 'gulp-i18next-conv';
const defDetermineDomain = filename => filename.match(/^\/?([^\/]+)\//)[1];

conv.gettextToI18nextDataAsync = Promise.promisify(conv.gettextToI18nextData);

// plugin level function (dealing with files)
function gulpGettextConv({
  determineDomain = defDetermineDomain,
  ...options,
} = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    const domain = determineDomain(file.relative);

    conv.gettextToI18nextDataAsync(domain, file.path, options)
    .then(data => {
      const newFile = file.clone();
      const dirname = path.dirname(file.path);
      const basename = path.basename(file.path, path.extname(file.path));

      newFile.path = path.join(dirname, `${basename}.json`);

      if (file.isBuffer()) {
        newFile.contents = new Buffer(data);
      } else if (file.isStream()) {
        newFile.contents.write(data);
        newFile.contents.end();
      } else {
        throw new Error('Invalid file');
      }

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
