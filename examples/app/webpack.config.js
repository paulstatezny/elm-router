module.exports = {
  module: {
    loaders: [
      {
        test: /\.elmproj$/,
        loader: 'elm-webpack-project'
      }
    ]
  }
};
