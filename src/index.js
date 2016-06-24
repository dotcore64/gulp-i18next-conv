import { PluginError } from 'gulp-util';

import through from 'through2';
import path from 'path';
import vinylToString from 'vinyl-contents-tostring';
import { gettextToI18next } from 'i18next-conv';

// consts
const PLUGIN_NAME = 'gulp-i18next-conv';
const defDetermineDomain = filename => filename.match(/^\/?([^\/]+)\//)[1];

// plugin level function (dealing with files)
function gulpGettextConv({
  determineDomain = defDetermineDomain,
  ...options,
} = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    vinylToString(file, enc)
    .then(contents => {
      const domain = determineDomain(file.relative, contents);
      return gettextToI18next(domain, contents, options);
    })
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
      cb();
    })
    .catch(err => {
      cb(new PluginError(PLUGIN_NAME, err.message));
    });
  });
}

// exporting the plugin main function
module.exports = gulpGettextConv;
