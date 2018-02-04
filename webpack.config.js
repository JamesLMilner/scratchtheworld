const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require("path");

module.exports = {
    entry: "./src/entry.js",
    mode: "none",
    output: {
        // options related to how webpack emits results
    
        path: path.resolve(__dirname, "dist"), // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)
    
        filename: "main.js", // string
    },
    plugins: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
            ecma: 6,
            safari10: true,
            // mangle: {
            //     safari10: true,
            // }, 
            // output: {
            //     safari10: true,
            // }
        },
       
      })
    ]
}