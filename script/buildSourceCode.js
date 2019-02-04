const { build } = require('@dependency/buildTool')

module.exports = function (...args) {
    const {
        api, /* supplied by scriptManager */ 
    } = args[0]
    args[0].targetProject = api.project // adapter for working with target function interface.
    build(...args)
}