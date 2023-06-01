import { PassThrough } from 'node:stream';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import File from 'vinyl';
import { spy, stub } from 'sinon';
import es from 'event-stream';
import { expect } from 'chai';

// https://github.com/import-js/eslint-plugin-import/issues/1649
// eslint-disable-next-line import/no-unresolved
import i18next, { __RewireAPI__, determineLocale as defDetermineLocale } from 'gulp-i18next-conv';

const testFile = readFileSync('test/messages.po');
const expectedJSON = readFileSync('test/messages.json').slice(0, -1);
const expectedPo = readFileSync('test/messages.expected.po').slice(0, -1);
const expectedPot = readFileSync('test/messages.expected.pot').slice(0, -1);
const expectedMo = readFileSync('test/messages.expected.mo');

describe('gulp-i18next-conv', () => {
  describe('in streaming mode', () => {
    it('should convert given po file', (done) => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: new PassThrough(),
      });
      poFile.contents.write(testFile);
      poFile.contents.end();

      // Create a prefixer plugin stream
      const converter = i18next({
        determineLocale: () => 'en',
      });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', (file) => {
        // make sure it came out the same way it went in
        expect(file.isStream()).to.be.true();
        expect(basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        file.contents.pipe(es.wait((err, data) => {
          // check the contents
          expect(data).to.deep.equal(expectedJSON);
          done();
        }));
      });
    });
  });

  describe('in buffering mode', () => {
    it('should convert given po file', (done) => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: Buffer.from(testFile),
      });

      // Create a prefixer plugin stream
      const converter = i18next({
        determineLocale: () => 'en',
      });
      converter.write(poFile);

      // wait for the file to come back out
      converter.once('data', (file) => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.equal(true);
        expect(basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        expect(file.contents).to.deep.equal(expectedJSON);
        done();
      });
    });
  });

  describe('null file', () => {
    it('should return a null file', (done) => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: null,
      });

      // Create a prefixer plugin stream
      const converter = i18next({
        determineLocale: () => 'en',
      });
      converter.write(poFile);

      converter.on('data', (data) => {
        expect(data.isNull()).to.be.true();
        done();
      });
    });
  });

  describe('i18next to gettext', () => {
    it('should convert json to po', (done) => {
      const jsonFile = new File({
        path: 'test/messages.json',
        contents: Buffer.from(expectedJSON),
      });

      const converter = i18next({
        determineLocale: () => 'en',
        noDate: true,
      });
      converter.write(jsonFile);

      converter.once('data', (file) => {
        expect(file.contents).to.deep.equal(expectedPo);
        done();
      });
    });

    it('should convert json to pot', (done) => {
      const jsonFile = new File({
        path: 'test/messages.json',
        contents: Buffer.from(expectedJSON),
      });

      const converter = i18next({
        determineLocale: () => 'en',
        gettextFormat: 'pot',
        noDate: true,
      });
      converter.write(jsonFile);

      converter.once('data', (file) => {
        expect(file.contents).to.deep.equal(expectedPot);
        done();
      });
    });

    it('should convert json to mo', (done) => {
      const jsonFile = new File({
        path: 'test/messages.json',
        contents: Buffer.from(expectedJSON),
      });

      const converter = i18next({
        determineLocale: () => 'en',
        gettextFormat: 'mo',
        noDate: true,
      });
      converter.write(jsonFile);

      converter.once('data', (file) => {
        expect(file.contents).to.deep.equal(expectedMo);
        done();
      });
    });
  });

  describe('errors', () => {
    it('should throw error on invalid vinyl file', (done) => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: null,
      });

      stub(poFile, 'isNull');
      poFile.isNull.returns(false);

      // Create a prefixer plugin stream
      const converter = i18next({
        determineLocale: () => 'en',
      });
      converter.on('error', (err) => {
        expect(err.message).to.equal('Invalid file');
        done();
      }).write(poFile);
    });

    it('should throw error on non gettext or json file', (done) => {
      const fooFile = new File({
        path: 'test/messages.foo',
        contents: Buffer.from(''),
      });

      const converter = i18next();
      converter.on('error', (err) => {
        expect(err.message).to.equal('Cannot determine which which file to convert to.');
        done();
      }).write(fooFile);
    });

    it('should throw error on non-valid gettextFormat', (done) => {
      const jsonFile = new File({
        path: 'test/messages.json',
        contents: Buffer.from(''),
      });

      const converter = i18next({ gettextFormat: 'foo' });
      converter.on('error', (err) => {
        expect(err.message).to.equal('Cannot determine which which file to convert to.');
        done();
      }).write(jsonFile);
    });

    it('should throw error if determineLocale fails', (done) => {
      const jsonFile = new File({
        path: 'test/messages.json',
        contents: Buffer.from(''),
      });

      const converter = i18next({ determineLocale() { throw new Error('determine domain failed'); } });
      converter.on('error', (err) => {
        expect(err.message).to.equal('determineLocale failed');
        done();
      }).write(jsonFile);
    });
  });

  describe('options', () => {
    it('should correctly determine domain with the default option', (done) => {
      const determineLocale = spy(__RewireAPI__.__GetDependency__('defDetermineLocale'));
      __RewireAPI__.__Rewire__('defDetermineLocale', determineLocale);

      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: Buffer.from(''),
      });

      // Create a prefixer plugin stream
      const converter = i18next();

      // wait for the file to come back out
      converter.once('data', (file) => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.equal(true);
        expect(determineLocale).to.be.calledOnce();
        expect(determineLocale).to.have.returned('test');

        done();
      }).write(poFile);

      __RewireAPI__.__ResetDependency__('defDetermineLocale');
    });

    it('should use option keyasareference', (done) => {
      // create the fake file
      const poFile = new File({
        path: 'test/messages.po',
        contents: Buffer.from(testFile),
      });

      // Create a prefixer plugin stream
      const converter = i18next({
        determineLocale: () => 'en',
        keyasareference: true,
      });

      // wait for the file to come back out
      converter.once('data', (file) => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.be.true();
        expect(basename(file.path)).to.equal('messages.json');

        // buffer the contents to make sure it got prepended to
        expect(file.contents.toString()).to.equal('{\n    "lib/error.c:116": "bar"\n}');
        done();
      }).write(poFile);
    });
  });

  describe('named exports', () => {
    it('should correctly determine domain with exported determineLocale', () => {
      expect(defDetermineLocale('foo/bar')).to.equal('foo');
    });
  });
});
