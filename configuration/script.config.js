const path = require('path')
const resolvedModule = {
  get deploymentScript() { // the path to this current repository rather than a dependency of previous version.
    return path.join(__dirname, '../')
  },
}

module.exports = {
  script: [
    {
      type: 'directory',
      path: path.join(resolvedModule.deploymentScript, 'script'),
    },
  ],
}
