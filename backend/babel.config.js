export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '18.0.0'
      },
      modules: 'auto'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true
    }],
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@config': './src/config',
        '@routes': './src/routes',
        '@services': './src/services'
      }
    }]
  ]
};
