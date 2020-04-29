module.exports = ({ env }) => env('test')
  ? {
    plugins: ['istanbul', 'rewire'],
  }
  : {
    presets: [['@babel/env', { targets: { node: '10' } }]],
  };
