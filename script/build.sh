transpileTest=${1:-transpileTest}
echo "\033[1;32m transpileTest flag: $transpileTest \033[0m"
copyCli=${2:-copyCli}
echo "\033[1;32m copyCli flag: $copyCli \033[0m"

rm -r ./distribution
# entrypoint
# programmaticAPI
mkdir -p ./distribution/entrypoint/programmaticAPI/ && echo "module.exports = require('../../source/script.js')" \
>> ./distribution/entrypoint/programmaticAPI/index.js
# cli
if [ "$copyCli" = true ] ; then
  mkdir -p ./distribution/entrypoint/cli && echo "#\!/usr/bin/env node\nmodule.exports = require('../../source/scriptManager/clientInterface/commandLine.js')" \
  >> ./distribution/entrypoint/cli/index.js
fi

# source
yarn run babel --out-dir ./distribution/source "./source" --config-file "./configuration/babel.config.js" --copy-files
# test - for debugging purposes with
if [ "$transpileTest" = true ] ; then
    yarn run babel --out-dir ./distribution/test "./test" --config-file "./configuration/babel.config.js" --copy-files
fi

# package.json
yarn run babel --out-dir ./distribution/ "./package.json" --config-file "./configuration/babel.config.js" --copy-files
# copy yarn lockfile
cp ./yarn.lock ./distribution/
