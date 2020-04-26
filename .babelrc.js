module.exports = api => ({
  presets: [
    ['@babel/env', {
      targets: api.env() === 'test' ? { node: 'current' } : { node: '10' },
    }],
  ],
  plugins: api.env() === 'test' ? ['istanbul', 'rewire'] : [],
})
