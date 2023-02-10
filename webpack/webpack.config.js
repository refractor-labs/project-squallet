const path = require('path')
const webpack = require('webpack')

module.exports = {
  //this should be the entry point of your lit app
  entry: './src/actions-source/multisig.js',
  mode: 'production',
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'lit-action-bundle.js',
    clean: true
  },
  //libraries that we do not want bundled because they are globally available in the lit action
  externals: {
    //key is the node_module name, value is the name of the global variable
    ethers: 'ethers'
  }
}
