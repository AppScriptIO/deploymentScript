import path from 'path'
const { spawnSync } = require('child_process')

module.exports = {
    setInterval: function ({ interval = 1000 } = {}) {
        // (function endlessProcess() { process.nextTick(endlessProcess) })() // Readable solution but it utilizes all available CPU. https://stackoverflow.com/questions/39082527/how-to-prevent-the-nodejs-event-loop-from-exiting
        console.log(`Executing interval in ${__filename}. NodeJS version: ${JSON.stringify(process.versions)}`)
        setInterval(function(){ console.info("Sleeping..."); }, interval);
    },
    setTimeout: function ({ timeout = 10000 } = {}) {
        setTimeout(() => { console.log('setTimeout command ended. The process will exit now.') }, timeout );
    },
    inContainer({ ymlFile, serviceName, containerPrefix }) {
        let containerCommand = 'sleep 1000000'
        let processCommand = 'docker-compose'
        let processArg = [
            `-f ${ymlFile}`,
            `--project-name ${containerPrefix}`,
            `run --service-ports --use-aliases`,
            `--entrypoint '${containerCommand}'`,
            `${serviceName}`
        ]
        spawnSync(processCommand, processArg, { shell: true, stdio: [0,1,2] })
    }
}