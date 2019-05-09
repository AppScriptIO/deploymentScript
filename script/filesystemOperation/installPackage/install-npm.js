"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installNpm = installNpm;

var _child_process = _interopRequireDefault(require("child_process"));

var _assert = _interopRequireDefault(require("assert"));

var _commandExists = require("command-exists");

function installNpm({
  npmPath,
  flag = ['--production=true']
}) {
  (0, _assert.default)((0, _commandExists.sync)('npm'), '• "npm" binary should be installed in the environment.');

  try {
    _child_process.default.spawnSync('npm', ['install', ...flag], {
      cwd: npmPath,
      shell: true,
      stdio: [0, 1, 2]
    });
  } catch (error) {
    console.log('• ERROR - childprocess error.');
    console.log(error);
    process.exit(1);
  }
}