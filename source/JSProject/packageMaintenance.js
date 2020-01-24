const { installModuleMultiple } = require('@dependency/handleModuleSystem')
const fs = require('fs')
const path = require('path')

// TODO: implement finding repositories & automatic fixing and installation of node_modules of multiple packages.
const installPathArray = []
// fs.readdir(path.join(__dirname, '../Dependency'), function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {
//         // Do whatever you want to do with the file
//         installPathArray.push(path.resolve(path.join(path.join(__dirname, '../Dependency'), file)));
//     });
// });
// fs.readdir(path.join(__dirname, '../DeploymentTool'), function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {
//         // Do whatever you want to do with the file
//         installPathArray.push(path.resolve(path.join(path.join(__dirname, '../DeploymentTool'), file)));
//     });
// });
// fs.readdir(path.join(__dirname, '../Service'), function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {
//         // Do whatever you want to do with the file
//         installPathArray.push(path.resolve(path.join(path.join(__dirname, '../Service'), file)));
//     });

// });

// setTimeout(() => {
//       console.log(installPathArray)

// }, 3000);
installModuleMultiple({ installPathArray })
