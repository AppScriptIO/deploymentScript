import filesystem from 'fs'
import childProcess from 'child_process'
import path from 'path'
import assert from 'assert'
import { sync as binaryExist } from 'command-exists'

export function installJspm({
  jspmPath, // path to the jspm configuration dependencies file.
}) {
  /*
		// switch temporarly to nodejs version that jspm install works on, then rollback.
		childProcess.execSync('n stable; jspm install; n ' + rollbackNodejsVersion, { cwd: jspmPath, shell: true, stdio:[0,1,2] });
	*/
  assert(binaryExist('jspm'), '• "jspm" binary should be installed in the environment.')

  let packageJson = require(path.join(jspmPath, 'package.json'))
  let packageFolder = packageJson.jspm.directories.packages ? path.join(jspmPath, packageJson.jspm.directories.packages) : path.join(jspmPath, 'jspm_packages')

  if (!filesystem.existsSync(packageFolder)) childProcess.execSync('jspm install', { cwd: jspmPath, shell: true, stdio: [0, 1, 2] })
  else console.log('Skipping JSPM pacakges installation, as a package folder already exist.')
}
