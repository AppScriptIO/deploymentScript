"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installYarn = installYarn;

var _child_process = _interopRequireDefault(require("child_process"));

var _assert = _interopRequireDefault(require("assert"));

var _commandExists = require("command-exists");

function installYarn({
  yarnPath
}) {
  (0, _assert.default)((0, _commandExists.sync)('yarn'), '• "yarn" binary should be installed in the environment.');

  try {
    _child_process.default.execSync('yarn install -y', {
      cwd: yarnPath,
      shell: true,
      stdio: [0, 1, 2]
    });
  } catch (error) {
    console.log('• ERROR - childprocess error.');
    console.log(error);
    process.exit(1);
  }
}