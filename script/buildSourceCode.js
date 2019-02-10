/**
 * TODO: 
 * • implement a build script for packages where: 
 *      ○ Configuration file for build process.
 *      ○ Build the files inside project for npm packages.
 *      ○ Push new version to github tags. 
 *      ○ Create a new release from the pushed tag.
 */

const { build } = require('@dependency/buildTool')

module.exports = function (...args) {
    const {
        api, /* supplied by scriptManager */ 
    } = args[0]
    args[0].targetProject = api.project // adapter for working with target function interface.
    build(...args)
}