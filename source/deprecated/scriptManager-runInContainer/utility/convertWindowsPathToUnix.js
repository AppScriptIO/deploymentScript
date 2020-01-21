import upath from 'upath'
const windowsDriveLetterRegex = new RegExp('^([a-z]?)([A-Z]?):')

export function convertWindowsPathToUnix({ path }) {
  path = upath.normalize(path) // convert slashes to Unix.
  let driveLetterArray = windowsDriveLetterRegex.exec(path),
    driveLetter = driveLetterArray ? driveLetterArray[0] : false
  path = driveLetter ? path.replace(driveLetter, `/${driveLetter.slice(0, 1)}`) : path // remove ':' from drive letter and add a slash at the beginning.
  return path
}
