const env = process.env.NODE_ENV || 'production';
const targets = env === 'test' ? { node: 'current' } : { node: '4' };

module.exports = {
  presets: [['env', { targets }]],
  plugins: [
    'transform-object-rest-spread',
    ...env === 'test' ? ['istanbul'] : [],
  ],
}
