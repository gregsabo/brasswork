module.exports = {
  entry: './src/app.js',
  output: {
    path: require("path").resolve('./bin'),
    publicPath: '/bin/',
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      }
    ]
  }
};