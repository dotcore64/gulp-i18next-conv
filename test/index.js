var File   = require('vinyl'),
	PassThrough = require('stream').PassThrough;

var chai = require('chai'),
	path = require('path'),
	es   = require('event-stream');

var i18next = require('../');

chai.should();

describe('gulp-i18next-conv', function() {
	describe('in streaming mode', function() {

		it('should convert given po file', function(done) {
			// create the fake file
			var poFile = new File({
				path: 'test/messages.po',
				contents: new PassThrough()
			});

			// Create a prefixer plugin stream
			var converter = i18next(function() { return 'en'; });
			converter.write(poFile);

			// wait for the file to come back out
			converter.once('data', function(file) {
				// make sure it came out the same way it went in
				file.isStream().should.equal(true);
				path.basename(file.path).should.equal('messages.json');

				// buffer the contents to make sure it got prepended to
				file.contents.pipe(es.wait(function(err, data) {
					// check the contents
					data.toString().should.equal('{\n    "foo": "bar"\n}');
					done();
				}));
			});
		});

	});

	describe('in buffering mode', function() {

		it('should convert given po file', function(done) {
			// create the fake file
			var poFile = new File({
				path: 'test/messages.po',
				contents: new Buffer("")
			});

			// Create a prefixer plugin stream
			var converter = i18next(function() { return 'en'; });
			converter.write(poFile);

			// wait for the file to come back out
			converter.once('data', function(file) {
				// make sure it came out the same way it went in
				file.isBuffer().should.equal(true);
				path.basename(file.path).should.equal('messages.json');

				// buffer the contents to make sure it got prepended to
				file.contents.toString().should.equal('{\n    "foo": "bar"\n}');
				done();
			});
		});

	});
});
