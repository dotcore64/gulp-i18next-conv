const plugins = ['@babel/proposal-throw-expressions'];

module.exports = ({ env }) => env('test')
  ? {
    plugins: [...plugins, 'istanbul', 'rewire'],
  }
  : {
    presets: [['@babel/env', { targets: { node: '10' } }]],
    plugins,
  };
