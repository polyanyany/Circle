const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: {
        'web3': './src/main.js',
        'signs': './src/signs.js',
        'permit': './src/permit.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/js'),
    },
    optimization: {
        moduleIds: 'size',
        chunkIds: 'size',
        concatenateModules: true,
        mangleWasmImports: true,
    },
};