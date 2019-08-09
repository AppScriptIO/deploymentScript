const path = require('path')
const resolvedModule = {
  get deploymentScript() {
    return path.join(__dirname, '../')
  },
}

module.exports = {
  script: [
    {
      type: 'directory',
      path: `${resolvedModule.deploymentScript}/script`,
    },
  ],
}
