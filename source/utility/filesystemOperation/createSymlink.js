const filesystem = require('fs')
const path = require('path')

export function createSymlink(symlinkTarget) {
  for (const target of symlinkTarget) {
    try {
      let destinationStat = filesystem.existsSync(target.destination) && filesystem.lstatSync(target.destination)
      
      filesystem.mkdirSync(path.dirname(target.destination), { recursive: true }) // make directory recursive
      
      if (destinationStat) {
        if (destinationStat.isSymbolicLink()) filesystem.unlinkSync(target.destination)
        // delete existing symlink or file
        else if (destinationStat.isFile()) {
          let originalPath = `${target.destination}.original`
          if (filesystem.existsSync(originalPath)) filesystem.unlinkSync(target.destination)
          filesystem.renameSync(target.destination, originalPath)
        }
      }
      filesystem.symlinkSync(target.source, target.destination) // create symlink
      console.log(`✔ Symlink created: ${target.source} --> ${target.destination}`)
    } catch (error) {
      console.log(`❌ Symlink failed: ${target.source} --> ${target.destination}`)
      console.log(error)
    }
  }
}
