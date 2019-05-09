"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureFile = ensureFile;

var _fs = _interopRequireDefault(require("fs"));

/** Ensure Files
 * @param {Array<string> || String} file
 */
function ensureFile(file) {
  if (!Array.isArray(file)) file = [file];
  let missingFile = file.reduce(function (accumulator, filePath) {
    var fileFound = false;

    try {
      fileFound = _fs.default.statSync(filePath).isFile();
    } catch (e) {
      /* ignore */
    }

    if (!fileFound) accumulator.push(filePath);
    return accumulator;
  }, []);
  if (missingFile.length > 0) return new Error('Missing Required Files\n' + missingFile.join('\n'));else return missingFile;
}