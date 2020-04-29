module.exports = ({ env }) => env('test')
  ? { plugins: ['istanbul', 'rewire'] }
  : { plugins: ['@babel/proposal-throw-expressions'] };
