rm -r ./distribution
# entrypoint
# programmaticAPI
mkdir -p ./distribution/entrypoint/programmaticAPI/ && echo "module.exports = require('../../source/script.js')" \
>> ./distribution/entrypoint/programmaticAPI/index.js && \
# cli
mkdir -p ./distribution/entrypoint/cli && echo "#\!/usr/bin/env node\nmodule.exports = require('../../source/scriptManager/clientInterface/commandLine.js')" \
>> ./distribution/entrypoint/cli/index.js

# source
yarn run babel --out-dir ./distribution/source "./source" --config-file "./configuration/babel.config.js"
# test 
yarn run babel --out-dir ./distribution/test "./test" --config-file "./configuration/babel.config.js"
# package.json
yarn run babel --out-dir ./distribution/ "./package.json" --config-file "./configuration/babel.config.js" --copy-files
# copy yarn lockfile
cp ./yarn.lock ./distribution/
