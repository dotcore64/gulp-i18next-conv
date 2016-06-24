import File from 'vinyl';
import { PassThrough } from 'stream';

import rewire from 'rewire';
import sinon from 'sinon';
import path from 'path';
import es from 'event-stream';
import chai, { expect } from 'chai';
import { readFileSync } from 'fs';

chai.use(require('sinon-chai'));
chai.use(require('dirty-chai'));

const i18next = rewire('../src');
const pkg = require('../package.json');
const testFile = readFileSync('test/messages.po').toString('utf8');

describe('gulp-i18next-conv', () => {
  describe('in streaming mode', () => {
    it('should convert given po file', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new PassThrough(),
      });
      poFile.contents.write(testFile);
      poFile.contents.end();

      // Create a prefixer plugin stream
      const converter = i18next({
        determineDomain: () => 'en',
      });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        expect(file.isStream()).to.be.true();
        expect(path.basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        file.contents.pipe(es.wait((err, data) => {
          // check the contents
          expect(data.toString()).to.equal('{\n    "foo": "bar"\n}');
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
        contents: new Buffer(testFile),
      });

      // Create a prefixer plugin stream
      const converter = i18next({
        determineDomain: () => 'en',
      });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.equal(true);
        expect(path.basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        expect(file.contents.toString()).to.equal('{\n    "foo": "bar"\n}');
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
      const converter = i18next({
        determineDomain: () => 'en',
      });
      converter.write(poFile);

      converter.on('error', err => {
        expect(err.message).to.equal('Invalid file');
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
          expect(file.isBuffer()).to.equal(true);
          expect(defDetermineDomain).to.be.calledOnce();
          expect(defDetermineDomain).to.have.returned('test');

          done();
        });
      });
    });

    it('should use option keyasareference', done => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new Buffer(testFile),
      });

      // Create a prefixer plugin stream
      const converter = i18next({
        determineDomain: () => 'en',
        keyasareference: true,
      });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', file => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.be.true();
        expect(path.basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        expect(file.contents.toString()).to.equal('{\n    "lib/error.c:116": "bar"\n}');
        done();
      });
    });
  });

  describe('named exports', () => {
    it('should export correct metadata', () => {
      expect(i18next.version).to.equal(pkg.version);
    });

    it('should correctly determine domain with exported determineDomain', () => {
      const defDetermineDomain = i18next.determineDomain;
      expect(defDetermineDomain('foo/bar')).to.equal('foo');
    });
  });
});
