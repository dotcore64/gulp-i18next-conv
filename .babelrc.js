const plugins = ['@babel/proposal-throw-expressions'];

module.exports = ({ env }) => env('test')
  ? {
    plugins: [...plugins, 'istanbul', 'rewire'],
  }
  : {
    plugins,
  };
