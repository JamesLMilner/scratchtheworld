const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode : "production",

    plugins: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
            mangle: {
                safari10: true,
            },
            output: {
                safari10: false,
            },
        } 
      })
    ]
}