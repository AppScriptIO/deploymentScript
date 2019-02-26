

import childProcess from 'child_process'
import assert from 'assert'
import { sync as binaryExist } from 'command-exists'

export function installYarn({ yarnPath }) {
	assert(binaryExist('yarn'), '• "yarn" binary should be installed in the environment.')
	try {
		childProcess.execSync('yarn install -y', { cwd: yarnPath, shell: true, stdio:[0,1,2] })
	} catch (error) {
		console.log('• ERROR - childprocess error.')
		console.log(error)
		process.exit(1)
	}
}