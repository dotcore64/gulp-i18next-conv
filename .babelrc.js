module.exports = ({ env }) => ({
  plugins: env('test')
    ? ['istanbul', 'rewire']
    : ['@babel/proposal-throw-expressions'],
});
