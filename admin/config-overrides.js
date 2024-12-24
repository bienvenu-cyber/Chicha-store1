const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/pages': path.resolve(__dirname, 'src/pages'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/utils': path.resolve(__dirname, 'src/utils')
  })
);
