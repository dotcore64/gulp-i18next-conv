var Promise = require('bluebird');

var through = require('through2'),
	gutil   = require('gulp-util'),
	conv    = require('i18next-conv'),
	path    = require('path');

var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-i18next-conv';

conv.gettextToI18nextDataAsync = Promise.promisify(conv.gettextToI18nextData);

// plugin level function (dealing with files)
function gulpGettextConv(determineDomain) {
	determineDomain = determineDomain || function(filename) {
		return filename.match(/^\/?([^\/]+)\//)[1];
	};

	// creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, cb) {
		var self = this;
		
		conv.gettextToI18nextDataAsync(determineDomain(file.relative), file.path)
	    .then(function(data) {
			if (file.isBuffer()) {
				file.contents = new Buffer(data);
			} else if(file.isStream()) {
				// start the transformation
				file.contents.write(data);
				file.contents.end();
			}

			var dirname = path.dirname(file.path);
			var basename = path.basename(file.path);
			file.path = path.join(dirname, basename.replace(path.extname(basename), '.json'));
			// make sure the file goes through the next gulp plugin
			self.push(file);
		})
		.catch(function(err) {
			throw new PluginError(PLUGIN_NAME, err.message);
		})
		.asCallback(cb);
	});

	// returning the file stream
	return stream;
}

// exporting the plugin main function
module.exports = gulpGettextConv;
