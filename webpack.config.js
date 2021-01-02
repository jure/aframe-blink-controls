const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: {
    'dist/aframe-blink-controls': './src/index.js',
    'dist/aframe-blink-controls.min': './src/index.js',
    'docs/dist/aframe-blink-controls': './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname)
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/i
      })
    ]
  },
  devtool: 'source-map',
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    https: true,
    contentBase: path.join(__dirname, 'docs')
  }
}
