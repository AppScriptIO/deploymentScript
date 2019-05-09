"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installJspm = installJspm;

var _fs = _interopRequireDefault(require("fs"));

var _child_process = _interopRequireDefault(require("child_process"));

var _path = _interopRequireDefault(require("path"));

var _assert = _interopRequireDefault(require("assert"));

var _commandExists = require("command-exists");

function installJspm({
  jspmPath // path to the jspm configuration dependencies file.

}) {
  /*
  	// switch temporarly to nodejs version that jspm install works on, then rollback.
  	childProcess.execSync('n stable; jspm install; n ' + rollbackNodejsVersion, { cwd: jspmPath, shell: true, stdio:[0,1,2] });
  */
  (0, _assert.default)((0, _commandExists.sync)('jspm'), '• "jspm" binary should be installed in the environment.');

  let packageJson = require(_path.default.join(jspmPath, 'package.json'));

  let packageFolder = packageJson.jspm.directories.packages ? _path.default.join(jspmPath, packageJson.jspm.directories.packages) : _path.default.join(jspmPath, 'jspm_packages');
  if (!_fs.default.existsSync(packageFolder)) _child_process.default.execSync('jspm install', {
    cwd: jspmPath,
    shell: true,
    stdio: [0, 1, 2]
  });else console.log('Skipping JSPM pacakges installation, as a package folder already exist.');
}