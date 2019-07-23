const nodejsLiveReload = require('@dependency/nodejsLiveReload')

module.exports = function(...args) {
  const { api /* supplied by scriptManager */ } = args[0]

  const watchFileList_clientSide = [
    // TODO: there is an issue when specifying multiple paths, for some reason it doesn't watch all files when separately configured, while watching all files without distinction is possible. Maybe an issue with glob strings
    // not working when separated.
    // '/project/application/source/clientSide/**/*.css',
    // '/project/application/source/clientSide/**/*.html',
    // '/project/application/source/clientSide/**/*.js',

    // the following works.
    '/project/application/source/clientSide/**/*',
    '!/project/application/source/clientSide/**/node_modules/**/*',
    '!/project/application/source/clientSide/**/component.package/**/*',
    '!/project/application/source/clientSide/**/js.package.yarn/**/*',
  ] // equals to '!/project/application/source/{node_modules,node_modules/**/*}'
  const watchFileList_serverSide = [
    '/project/application/source/serverSide/**/*.js',
    // '/project/application/source/serverSide/**/*.css',
    // '/project/application/source/serverSide/**/*.html',
    // '/project/application/source/serverSide/node_modules/appscript{/**/*.js,!/node_modules/**/*}',
    '!/project/application/source/serverSide/node_modules{,/**/*,!/appscript/**/*}',
    // '!/project/application/source/serverSide/node_modules/appscript/node_modules{,/**/*}',
  ] // equals to '!/app/{node_modules,node_modules/**/*}'

  nodejsLiveReload.runWebappServer()
}
