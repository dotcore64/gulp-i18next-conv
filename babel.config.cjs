module.exports = ({ env }) => ({
  plugins: env('test')
    ? ['rewire']
    : ['@babel/proposal-throw-expressions'],
  only: env('test') ? ['dist/*.js'] : ['src/*.js'],
});
