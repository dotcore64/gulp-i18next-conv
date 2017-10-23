const env = process.env.NODE_ENV || 'production';

module.exports = {
  presets: [['env', { targets: { node: 4 }, debug: true }]],
  plugins: ['transform-object-rest-spread'].concat(
    env === 'test' ? ['istanbul'] : [],
  ),
}
