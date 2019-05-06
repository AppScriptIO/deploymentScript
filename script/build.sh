rm -r ./distribution
# entrypoint
mkdir -p ./distribution/entrypoint/programmaticAPI/ && echo "module.exports = require('../../source/entrypoint.js')" \
>> ./distribution/entrypoint/programmaticAPI/index.js && \

# mkdir -p ./distribution/entrypoint/cli/ && echo "module.exports = require('../../source/scriptManager/clientInterface/commandLine.js')" \
# >> ./distribution/entrypoint/cli/index.js

# source
babel --out-dir ./distribution/source "./source" --config-file "./configuration/babel.config.js" && \
# package.json
babel --out-dir ./distribution/ "./package.json" --config-file "./configuration/babel.config.js" --copy-files
