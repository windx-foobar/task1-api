const path = require('node:path');

module.exports = (api) => {
  api.cache(false);

  return {
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: [path.resolve('./')]
        }
      ]
    ],
    ignore: ['node_modules', 'babel.config.js', 'jsconfig.json', 'package.json', 'dist']
  };
};
