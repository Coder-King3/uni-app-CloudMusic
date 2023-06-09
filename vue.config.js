'use strict'
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@pages', resolve('src/pages'))
      .set('@static', resolve('src/static'))
  }
}
