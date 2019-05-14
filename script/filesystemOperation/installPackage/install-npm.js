"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.installNpm = installNpm;

var _child_process = _interopRequireDefault(require("child_process"));
var _assert = _interopRequireDefault(require("assert"));
var _commandExists = require("command-exists");

function installNpm({ npmPath, flag = ['--production=true'] }) {
  (0, _assert.default)((0, _commandExists.sync)('npm'), '• "npm" binary should be installed in the environment.');
  try {
    _child_process.default.spawnSync('npm',
    ['install', ...flag],
    { cwd: npmPath, shell: true, stdio: [0, 1, 2] });

  } catch (error) {
    console.log('• ERROR - childprocess error.');
    console.log(error);
    process.exit(1);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC9maWxlc3lzdGVtT3BlcmF0aW9uL2luc3RhbGxQYWNrYWdlL2luc3RhbGwtbnBtLmpzIl0sIm5hbWVzIjpbImluc3RhbGxOcG0iLCJucG1QYXRoIiwiZmxhZyIsImNoaWxkUHJvY2VzcyIsInNwYXduU3luYyIsImN3ZCIsInNoZWxsIiwic3RkaW8iLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJwcm9jZXNzIiwiZXhpdCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7O0FBRU8sU0FBU0EsVUFBVCxDQUFvQixFQUFFQyxPQUFGLEVBQVdDLElBQUksR0FBRyxDQUFDLG1CQUFELENBQWxCLEVBQXBCLEVBQXFGO0FBQzNGLHVCQUFPLHlCQUFZLEtBQVosQ0FBUCxFQUEyQix3REFBM0I7QUFDQSxNQUFJO0FBQ0hDLDJCQUFhQyxTQUFiLENBQXVCLEtBQXZCO0FBQ0MsS0FBQyxTQUFELEVBQVksR0FBR0YsSUFBZixDQUREO0FBRUMsTUFBRUcsR0FBRyxFQUFFSixPQUFQLEVBQWdCSyxLQUFLLEVBQUUsSUFBdkIsRUFBNkJDLEtBQUssRUFBQyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFuQyxFQUZEOztBQUlBLEdBTEQsQ0FLRSxPQUFPQyxLQUFQLEVBQWM7QUFDZkMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksK0JBQVo7QUFDQUQsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLEtBQVo7QUFDQUcsSUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsQ0FBYjtBQUNBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXG5pbXBvcnQgeyBzeW5jIGFzIGJpbmFyeUV4aXN0IH0gZnJvbSAnY29tbWFuZC1leGlzdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsTnBtKHsgbnBtUGF0aCwgZmxhZyA9IFsnLS1wcm9kdWN0aW9uPXRydWUnLC8qJy0tcHVyZS1sb2NrZmlsZScqL10gfSkge1xuXHRhc3NlcnQoYmluYXJ5RXhpc3QoJ25wbScpLCAn4oCiIFwibnBtXCIgYmluYXJ5IHNob3VsZCBiZSBpbnN0YWxsZWQgaW4gdGhlIGVudmlyb25tZW50LicpXG5cdHRyeSB7XG5cdFx0Y2hpbGRQcm9jZXNzLnNwYXduU3luYygnbnBtJyxcblx0XHRcdFsnaW5zdGFsbCcsIC4uLmZsYWddLCBcblx0XHRcdHsgY3dkOiBucG1QYXRoLCBzaGVsbDogdHJ1ZSwgc3RkaW86WzAsMSwyXSB9XG5cdFx0KVxuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGNvbnNvbGUubG9nKCfigKIgRVJST1IgLSBjaGlsZHByb2Nlc3MgZXJyb3IuJylcblx0XHRjb25zb2xlLmxvZyhlcnJvcilcblx0XHRwcm9jZXNzLmV4aXQoMSlcblx0fVxufSJdfQ==