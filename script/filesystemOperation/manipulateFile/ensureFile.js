

import filesystem from 'fs'

/** Ensure Files
 * @param {Array<string> || String} file
 */
export function ensureFile(file) {
  if(!Array.isArray(file)) file = [file]

  let missingFile = file.reduce(function(accumulator, filePath) {
    var fileFound = false
    try {
      fileFound = filesystem.statSync(filePath).isFile()
    } catch (e) { /* ignore */ }

    if(!fileFound) accumulator.push(filePath)
    return accumulator;
  }, []);

  if (missingFile.length > 0) 
    return new Error('Missing Required Files\n' + missingFile.join('\n'))
  else 
    return missingFile
}