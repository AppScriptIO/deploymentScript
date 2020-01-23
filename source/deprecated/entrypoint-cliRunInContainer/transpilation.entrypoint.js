#!/usr/bin/env node 

/* Entrypoint chain */
// • Transpilation (babelJSCompiler)
require('@deployment/javascriptTranspilation')({ babelConfigurationFile: 'serverRuntime.BabelConfig.js' })

// • Run
module.exports = require('./')