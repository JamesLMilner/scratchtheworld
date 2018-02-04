const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode : "production",
    plugins: [
      new UglifyJsPlugin({
        uglifyOptions: {
            mangle: {
                safari10: true,
              }
        } 
      })
    ]
}