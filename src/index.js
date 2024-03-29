import { sep, extname } from 'node:path';
import { callbackify } from 'node:util';

import PluginError from 'plugin-error';
import through from 'through2';
import vinylToString from 'vinyl-contents-tostring';
import {
  gettextToI18next,
  i18nextToPo,
  i18nextToPot,
  i18nextToMo,
} from 'i18next-conv';

const PLUGIN_NAME = 'gulp-i18next-conv';
const defDetermineLocale = (filename) => filename.split(sep)[0];

function getConverter(file, gettextFormat) {
  switch (extname(file.path)) { // file.extname doesn't work in older vinyl used by gulp 3
    case '.po':
    case '.pot':
    case '.mo': {
      return [gettextToI18next, '.json'];
    }
    case '.json': {
      switch (gettextFormat) {
        case 'po': {
          return [i18nextToPo, '.po'];
        }
        case 'pot': {
          return [i18nextToPot, '.pot'];
        }
        case 'mo': {
          return [i18nextToMo, '.mo'];
        }
        default: {
          throw new PluginError(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
        }
      }
    }
    default: {
      throw new PluginError(PLUGIN_NAME, 'Cannot determine which which file to convert to.');
    }
  }
}

const getContents = (file, data) => (file.isBuffer()
  ? Buffer.from(data)
  : file.isStream()
    ? through().end(data)
    : throw new PluginError(PLUGIN_NAME, 'Invalid file'));

export { defDetermineLocale as determineLocale };

export default ({
  determineLocale = defDetermineLocale,
  gettextFormat = 'po',
  ...options
} = {}) => through.obj(callbackify(function (file, enc) {
  if (file.isNull()) {
    this.push(file);
    return Promise.resolve();
  }

  let converter;
  let ext;

  try {
    [converter, ext] = getConverter(file, gettextFormat);
  } catch (e) {
    return Promise.reject(e);
  }

  return vinylToString(file, enc)
    .then((contents) => {
      if (contents === undefined) {
        return Promise.reject(new Error('Invalid file'));
      }

      let domain;

      try {
        domain = determineLocale(file.relative, contents);
      } catch {
        return Promise.reject(new PluginError(PLUGIN_NAME, 'determineLocale failed', { showStack: true }));
      }

      return converter(domain, contents, options);
    })
    .then((data) => Object.assign(file, {
      extname: ext,
      contents: getContents(file, data),
    }))
    .then(() => { this.push(file); });
}));
