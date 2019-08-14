"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.installJspm = installJspm;var _fs = _interopRequireDefault(require("fs"));
var _assert = _interopRequireDefault(require("assert"));
var _child_process = _interopRequireDefault(require("child_process"));
var _path = _interopRequireDefault(require("path"));
var _commandExists = require("command-exists");

function installJspm({
  jspmPath })
{var _packageJson$jspm, _packageJson$jspm$dir;




  (0, _assert.default)((0, _commandExists.sync)('jspm'), '• "jspm" binary should be installed in the environment.');
  (0, _assert.default)(_fs.default.existsSync(jspmPath), `• Directory path for package installation doesn't exist - "${jspmPath}".`);

  let packageJson = require(_path.default.join(jspmPath, 'package.json'));
  let packageFolder = ((_packageJson$jspm = packageJson.jspm) === null || _packageJson$jspm === void 0 ? void 0 : (_packageJson$jspm$dir = _packageJson$jspm.directories) === null || _packageJson$jspm$dir === void 0 ? void 0 : _packageJson$jspm$dir.packages) ? _path.default.join(jspmPath, packageJson.jspm.directories.packages) : _path.default.join(jspmPath, 'jspm_packages');

  if (!_fs.default.existsSync(packageFolder)) _child_process.default.execSync('jspm install', { cwd: jspmPath, shell: true, stdio: [0, 1, 2] });else
  console.log('Skipping JSPM pacakges installation, as a package folder already exist.');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC9wcm92aXNpb25PUy9pbnN0YWxsRVNNb2R1bGUvaW5zdGFsbC1qc3BtLmpzIl0sIm5hbWVzIjpbImluc3RhbGxKc3BtIiwianNwbVBhdGgiLCJmaWxlc3lzdGVtIiwiZXhpc3RzU3luYyIsInBhY2thZ2VKc29uIiwicmVxdWlyZSIsInBhdGgiLCJqb2luIiwicGFja2FnZUZvbGRlciIsImpzcG0iLCJkaXJlY3RvcmllcyIsInBhY2thZ2VzIiwiY2hpbGRQcm9jZXNzIiwiZXhlY1N5bmMiLCJjd2QiLCJzaGVsbCIsInN0ZGlvIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6ImtNQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU8sU0FBU0EsV0FBVCxDQUFxQjtBQUMxQkMsRUFBQUEsUUFEMEIsRUFBckI7QUFFSjs7Ozs7QUFLRCx1QkFBTyx5QkFBWSxNQUFaLENBQVAsRUFBNEIseURBQTVCO0FBQ0EsdUJBQU9DLFlBQVdDLFVBQVgsQ0FBc0JGLFFBQXRCLENBQVAsRUFBeUMsOERBQTZEQSxRQUFTLElBQS9HOztBQUVBLE1BQUlHLFdBQVcsR0FBR0MsT0FBTyxDQUFDQyxjQUFLQyxJQUFMLENBQVVOLFFBQVYsRUFBb0IsY0FBcEIsQ0FBRCxDQUF6QjtBQUNBLE1BQUlPLGFBQWEsR0FBRyxzQkFBQUosV0FBVyxDQUFDSyxJQUFaLGlHQUFrQkMsV0FBbEIsZ0ZBQStCQyxRQUEvQixJQUEwQ0wsY0FBS0MsSUFBTCxDQUFVTixRQUFWLEVBQW9CRyxXQUFXLENBQUNLLElBQVosQ0FBaUJDLFdBQWpCLENBQTZCQyxRQUFqRCxDQUExQyxHQUF1R0wsY0FBS0MsSUFBTCxDQUFVTixRQUFWLEVBQW9CLGVBQXBCLENBQTNIOztBQUVBLE1BQUksQ0FBQ0MsWUFBV0MsVUFBWCxDQUFzQkssYUFBdEIsQ0FBTCxFQUEyQ0ksdUJBQWFDLFFBQWIsQ0FBc0IsY0FBdEIsRUFBc0MsRUFBRUMsR0FBRyxFQUFFYixRQUFQLEVBQWlCYyxLQUFLLEVBQUUsSUFBeEIsRUFBOEJDLEtBQUssRUFBRSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFyQyxFQUF0QyxFQUEzQztBQUNLQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx5RUFBWjtBQUNOIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpbGVzeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCdcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBzeW5jIGFzIGJpbmFyeUV4aXN0IH0gZnJvbSAnY29tbWFuZC1leGlzdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsSnNwbSh7XG4gIGpzcG1QYXRoLCAvLyBwYXRoIHRvIHRoZSBqc3BtIGNvbmZpZ3VyYXRpb24gZGVwZW5kZW5jaWVzIGZpbGUuXG59KSB7XG4gIC8qXG5cdFx0Ly8gc3dpdGNoIHRlbXBvcmFybHkgdG8gbm9kZWpzIHZlcnNpb24gdGhhdCBqc3BtIGluc3RhbGwgd29ya3Mgb24sIHRoZW4gcm9sbGJhY2suXG5cdFx0Y2hpbGRQcm9jZXNzLmV4ZWNTeW5jKCduIHN0YWJsZTsganNwbSBpbnN0YWxsOyBuICcgKyByb2xsYmFja05vZGVqc1ZlcnNpb24sIHsgY3dkOiBqc3BtUGF0aCwgc2hlbGw6IHRydWUsIHN0ZGlvOlswLDEsMl0gfSk7XG5cdCovXG4gIGFzc2VydChiaW5hcnlFeGlzdCgnanNwbScpLCAn4oCiIFwianNwbVwiIGJpbmFyeSBzaG91bGQgYmUgaW5zdGFsbGVkIGluIHRoZSBlbnZpcm9ubWVudC4nKVxuICBhc3NlcnQoZmlsZXN5c3RlbS5leGlzdHNTeW5jKGpzcG1QYXRoKSwgYOKAoiBEaXJlY3RvcnkgcGF0aCBmb3IgcGFja2FnZSBpbnN0YWxsYXRpb24gZG9lc24ndCBleGlzdCAtIFwiJHtqc3BtUGF0aH1cIi5gKVxuXG4gIGxldCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUocGF0aC5qb2luKGpzcG1QYXRoLCAncGFja2FnZS5qc29uJykpXG4gIGxldCBwYWNrYWdlRm9sZGVyID0gcGFja2FnZUpzb24uanNwbT8uZGlyZWN0b3JpZXM/LnBhY2thZ2VzID8gcGF0aC5qb2luKGpzcG1QYXRoLCBwYWNrYWdlSnNvbi5qc3BtLmRpcmVjdG9yaWVzLnBhY2thZ2VzKSA6IHBhdGguam9pbihqc3BtUGF0aCwgJ2pzcG1fcGFja2FnZXMnKVxuXG4gIGlmICghZmlsZXN5c3RlbS5leGlzdHNTeW5jKHBhY2thZ2VGb2xkZXIpKSBjaGlsZFByb2Nlc3MuZXhlY1N5bmMoJ2pzcG0gaW5zdGFsbCcsIHsgY3dkOiBqc3BtUGF0aCwgc2hlbGw6IHRydWUsIHN0ZGlvOiBbMCwgMSwgMl0gfSlcbiAgZWxzZSBjb25zb2xlLmxvZygnU2tpcHBpbmcgSlNQTSBwYWNha2dlcyBpbnN0YWxsYXRpb24sIGFzIGEgcGFja2FnZSBmb2xkZXIgYWxyZWFkeSBleGlzdC4nKVxufVxuIl19