module.exports = function() {
  /**
   * Check that preserve symlink is enabled.
   * Node process must be run with `preseve symlink` option (flag or env variable), by Node's default it is off. https://nodejs.org/api/cli.html#cli_node_preserve_symlinks_1
   * As this module relies on node_modules being resolved from the symlink location in case the module is symlinks from outside of the application root path (for development purposes).
   * This implementation checks only for environment variable (not flag).
   */
  const preserveSymlinkOption = 'NODE_PRESERVE_SYMLINKS'
  if (!process.env[preserveSymlinkOption]) throw new Error("Node's preserve symlink option must be turned on (NODE_PRESERVE_SYMLINKS)")

  return require('./script.js')
}
