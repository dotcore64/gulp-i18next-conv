import { builtinModules as builtins } from 'module';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const input = 'src/index.js';
const plugins = [babel({ babelHelpers: 'bundled' })];
const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  ...builtins,
];

export default [{
  input,
  external,
  // sourcemaps help generate coverage reports for the actual sources using istanbul
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
  },
  plugins,
}, {
  input,
  external,
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}];
