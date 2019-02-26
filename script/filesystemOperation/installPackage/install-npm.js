

import childProcess from 'child_process'
import assert from 'assert'
import { sync as binaryExist } from 'command-exists'

export function installNpm({ npmPath, flag = ['--production=true',/*'--pure-lockfile'*/] }) {
	assert(binaryExist('npm'), '• "npm" binary should be installed in the environment.')
	try {
		childProcess.spawnSync('npm',
			['install', ...flag], 
			{ cwd: npmPath, shell: true, stdio:[0,1,2] }
		)
	} catch (error) {
		console.log('• ERROR - childprocess error.')
		console.log(error)
		process.exit(1)
	}
}