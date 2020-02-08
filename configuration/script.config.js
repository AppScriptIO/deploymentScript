const path = require('path')

module.exports = {
  script: [
    {
      type: 'directory',
      path: path.join(__dirname, '../node_modules'),
    },
  ],
}
