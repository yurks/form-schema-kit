module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
  },
  rules: {
    'no-var': 'off',
    'no-mixed-operators': 'off',
    camelcase: 'off'
  }
}
