const path = require('path');

module.exports = {
  devtool: 'source-map',
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    https: true,
    contentBase: path.join(__dirname, 'docs'),
    publicPath: '/assets/',
  },
};