const File = require('vinyl');
const PassThrough = require('stream').PassThrough;

const rewire = require('rewire');
const sinon = require('sinon');
const chai = require('chai');
const path = require('path');
const es = require('event-stream');

const i18next = rewire('../dist');

chai.should();

describe('gulp-i18next-conv', () => {
  describe('in streaming mode', () => {
    it('should convert given po file', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new PassThrough(),
      });

      // Create a prefixer plugin stream
      const converter = i18next(() => 'en');
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        file.isStream().should.equal(true);
        path.basename(file.path).should.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        file.contents.pipe(es.wait((err, data) => {
          // check the contents
          data.toString().should.equal('{\n    "foo": "bar"\n}');
          done();
        }));
      });
    });
  });

  describe('in buffering mode', () => {
    it('should convert given po file', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new Buffer(''),
      });

      // Create a prefixer plugin stream
      const converter = i18next(() => 'en');
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        file.isBuffer().should.equal(true);
        path.basename(file.path).should.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        file.contents.toString().should.equal('{\n    "foo": "bar"\n}');
        done();
      });
    });
  });

  describe('errors', () => {
    it('should throw error on invalid file', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: null,
      });

      // Create a prefixer plugin stream
      const converter = i18next(() => 'en');
      converter.write(poFile);

      converter.on('error', err => {
        err.message.should.equal('Invalid file');
        done();
      });
    });
  });

  describe('options', () => {
    it('should correctly determine domain with the default option', done => {
      const defDetermineDomain = sinon.spy(i18next.__get__('defDetermineDomain'));
      i18next.__with__({
        defDetermineDomain,
      })(() => {
        // create the fake file
        const poFile = new File({
          path: 'test/messages.po',
          contents: new Buffer(''),
        });

        // Create a prefixer plugin stream
        const converter = i18next();
        converter.write(poFile);

        // wait for the file to come back out
        converter.once('data', file => {
          // make sure it came out the same way it went in
          file.isBuffer().should.equal(true);
          defDetermineDomain.calledOnce.should.equal(true);
          defDetermineDomain.returned('test').should.equal(true);

          done();
        });
      });
    });

    it('should use option keyasareference', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new Buffer(''),
      });

      // Create a prefixer plugin stream
      const converter = i18next(() => 'en', { keyasareference: true });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        file.isBuffer().should.equal(true);
        path.basename(file.path).should.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        file.contents.toString().should.equal('{\n    "lib/error.c:116": "bar"\n}');
        done();
      });
    });
  });
});
