const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/js/main.js',
    components: './src/js/components.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/js'),
  },
};