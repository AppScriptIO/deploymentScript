const { runTest } = require('@dependency/javascriptTestRunner')

module.exports = function(...args) {
  const { api /* supplied by scriptManager */ } = args[0]
  args[0].targetProject = api.project // adapter for working with target function interface.
  runTest(...args)
}
