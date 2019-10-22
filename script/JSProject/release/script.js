"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.createGithubBranchedRelease = createGithubBranchedRelease;var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _assert = _interopRequireDefault(require("assert"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _nodegit = _interopRequireDefault(require("nodegit"));
var _deploymentProvisioning = require("@dependency/deploymentProvisioning");
const getDirectory = source => _fs.default.readdirSync(source, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
const getAllDirent = source => _fs.default.readdirSync(source, { withFileTypes: true });



async function filterAsync(arr, callback) {
  const fail = Symbol();
  return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail);
}

function lookupConfigFile({ targetProjectRoot, configName }) {
  let configPossiblePath = [_path.default.join(targetProjectRoot, configName), _path.default.join(targetProjectRoot, 'configuration', configName)];

  let configPathArray = configPossiblePath.filter(configPath => _fs.default.existsSync(configPath));
  (0, _assert.default)(configPathArray.length > 0, `• ${configName} lookup failed, file not found in the configuration possible paths - ${configPossiblePath}.`);
  return configPathArray[0];
}























async function createGithubBranchedRelease({

  api,
  temporaryBranchName = 'distribution',
  brachToPointTo = 'master',
  commitToPointTo = null,
  tagName,
  buildCallback,
  tagger })


{var _targetProject$config;
  const targetProject = api.project,
  targetProjectConfig = targetProject.configuration.configuration,
  targetProjectRoot = targetProject.configuration.rootPath,
  targetProjectGitUrl = (_targetProject$config = targetProject.configuration.configuration) === null || _targetProject$config === void 0 ? void 0 : _targetProject$config.build.repositoryURL;


  const repository = await _nodegit.default.Repository.open(targetProjectRoot);
  brachToPointTo = await _nodegit.default.Branch.lookup(repository, brachToPointTo, 1);


  let taggerSignature = tagger ? _nodegit.default.Signature.now(tagger.name, tagger.email) : await _nodegit.default.Signature.default(repository);
  (0, _assert.default)(taggerSignature, `❌ Github username should be passed or found in the git local/system configs.`);


  let getLatestCommit = await repository.getReferenceCommit(brachToPointTo);

  if (commitToPointTo) {
    commitToPointTo = await _nodegit.default.Commit.lookup(repository, commitToPointTo);
  } else commitToPointTo = getLatestCommit;


  let branchReferenceList = await repository.getReferences().then(referenceList => referenceList.filter(reference => reference.type() == _nodegit.default.Reference.TYPE.DIRECT));


  let doesTemporaryBranchExist = branchReferenceList.some(branch => branch.toString().includes(temporaryBranchName));
  let temporaryBranch;
  if (!doesTemporaryBranchExist) {

    temporaryBranch = await _nodegit.default.Branch.create(repository, temporaryBranchName, commitToPointTo, 1).catch(error => console.error(error));
    console.log(`• Created temporary branch ${await temporaryBranch.name()} from commit ${commitToPointTo.sha()}`);
  } else temporaryBranch = await _nodegit.default.Branch.lookup(repository, temporaryBranchName, 1);


  let statuseList = await repository.getStatus();
  if (statuseList.length > 0)

    await _nodegit.default.Stash.save(repository, taggerSignature, 'checkout stash before release', _nodegit.default.Stash.FLAGS.INCLUDE_UNTRACKED);


  await repository.checkoutBranch((await temporaryBranch.name())).then(async () => console.log(`Checked branch ${await temporaryBranch.name()}`));




  await _nodegit.default.Reset.reset(repository, commitToPointTo, _nodegit.default.Reset.TYPE.HARD).
  then(number => {
    if (number) throw new Error(`• Could not reset repository ${repository} to commit ${commitToPointTo}`);
  }).
  catch(error => console.error);


  if (buildCallback)
  await buildCallback().
  then(() => console.log('Project built successfully !')).
  catch(error => console.error(error));



  let gitExcludePath = _path.default.join(targetProjectRoot, './.git/info/exclude'),
  gitIgnorePath = lookupConfigFile({ targetProjectRoot, configName: '.gitignore' });
  if (_fs.default.existsSync(gitExcludePath)) _fs.default.unlinkSync(gitExcludePath);
  _deploymentProvisioning.copyFile.copyFile([{ source: gitIgnorePath, destination: gitExcludePath }]);


  let direntList = getAllDirent(targetProjectRoot);








  let ignoredDirectoryList = await filterAsync(direntList, async dirent => {var _ref;return _ref = await _nodegit.default.Ignore.pathIsIgnored(repository, _path.default.join(targetProjectRoot, dirent.name)), Boolean(_ref);});


  let direntToDelete = direntList.filter(dirent => !ignoredDirectoryList.includes(dirent));

  let deleteAbsolutePathList = direntToDelete.map(dirent => _path.default.join(targetProjectRoot, dirent.name));
  for (let absolutePath of deleteAbsolutePathList) {
    _fsExtra.default.removeSync(absolutePath);
  }

  _fsExtra.default.copySync(targetProjectConfig.directory.distribution, targetProjectRoot);


  let index = await repository.refreshIndex();
  let treeObject = await index.
  addAll(['**']).
  then(() => index.write()).
  then(() => index.writeTree());
  let parentCommit = await repository.getHeadCommit();
  await repository.
  createCommit(
  'HEAD' || null,
  taggerSignature,
  taggerSignature,
  `🏗️ Build distribution code.`,
  treeObject,
  [parentCommit]).

  then(oid => console.log(`• Commit created ${oid} for distribution code`));


  let latestTemporaryBranchCommit = await repository.getHeadCommit();
  await _nodegit.default.Tag.create(repository, tagName, latestTemporaryBranchCommit, taggerSignature, `Release of distribution code only.`, 0).then(oid => console.log(`• Tag created ${oid}`));


  await repository.checkoutBranch(brachToPointTo).then(async () => console.log(`Checked branch ${await brachToPointTo.name()}`));


  if (statuseList.length > 0) await _nodegit.default.Stash.pop(repository, 0);
}




function rebasingExample({ repository, branch, fromBranch, toBranch }) {
  return repository.rebaseBranches(
  branch.name(),
  fromBranch.name(),
  toBranch.name(),
  _nodegit.default.Signature.now('meow', 'test@example.com'),
  rebase => {
    console.log('One operation');
    return Promise.resolve();
  },
  rebaseMetadata => {
    console.log('Finished rebase');
    return Promise.resolve();
  });

}

async function deleteTemporaryBranch({ repository, temporaryBranch }) {

  try {
    if (_nodegit.default.Branch.isCheckedOut(temporaryBranch)) throw new Error(`Cannot delete a checked out branch ${await temporaryBranch.name()}.`);

    temporaryBranch = await _nodegit.default.Branch.lookup(repository, temporaryBranchName, 1);
    let error = _nodegit.default.Branch.delete(temporaryBranch);
    if (error) throw new Error(`Code thrown by 'libgit2' bindings = ${error}\n \tCheck https://www.nodegit.org/api/error/#CODE`);
    console.log(`• Deleted tempoarary branch ${await temporaryBranch.name()}.`);
  } catch (error) {
    throw error;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvcmVsZWFzZS9zY3JpcHQuanMiXSwibmFtZXMiOlsiZ2V0RGlyZWN0b3J5Iiwic291cmNlIiwiZmlsZXN5c3RlbSIsInJlYWRkaXJTeW5jIiwid2l0aEZpbGVUeXBlcyIsImZpbHRlciIsImRpcmVudCIsImlzRGlyZWN0b3J5IiwiZ2V0QWxsRGlyZW50IiwiZmlsdGVyQXN5bmMiLCJhcnIiLCJjYWxsYmFjayIsImZhaWwiLCJTeW1ib2wiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiaXRlbSIsImkiLCJsb29rdXBDb25maWdGaWxlIiwidGFyZ2V0UHJvamVjdFJvb3QiLCJjb25maWdOYW1lIiwiY29uZmlnUG9zc2libGVQYXRoIiwicGF0aCIsImpvaW4iLCJjb25maWdQYXRoQXJyYXkiLCJjb25maWdQYXRoIiwiZXhpc3RzU3luYyIsImxlbmd0aCIsImNyZWF0ZUdpdGh1YkJyYW5jaGVkUmVsZWFzZSIsImFwaSIsInRlbXBvcmFyeUJyYW5jaE5hbWUiLCJicmFjaFRvUG9pbnRUbyIsImNvbW1pdFRvUG9pbnRUbyIsInRhZ05hbWUiLCJidWlsZENhbGxiYWNrIiwidGFnZ2VyIiwidGFyZ2V0UHJvamVjdCIsInByb2plY3QiLCJ0YXJnZXRQcm9qZWN0Q29uZmlnIiwiY29uZmlndXJhdGlvbiIsInJvb3RQYXRoIiwidGFyZ2V0UHJvamVjdEdpdFVybCIsImJ1aWxkIiwicmVwb3NpdG9yeVVSTCIsInJlcG9zaXRvcnkiLCJnaXQiLCJSZXBvc2l0b3J5Iiwib3BlbiIsIkJyYW5jaCIsImxvb2t1cCIsInRhZ2dlclNpZ25hdHVyZSIsIlNpZ25hdHVyZSIsIm5vdyIsIm5hbWUiLCJlbWFpbCIsImRlZmF1bHQiLCJnZXRMYXRlc3RDb21taXQiLCJnZXRSZWZlcmVuY2VDb21taXQiLCJDb21taXQiLCJicmFuY2hSZWZlcmVuY2VMaXN0IiwiZ2V0UmVmZXJlbmNlcyIsInRoZW4iLCJyZWZlcmVuY2VMaXN0IiwicmVmZXJlbmNlIiwidHlwZSIsIlJlZmVyZW5jZSIsIlRZUEUiLCJESVJFQ1QiLCJkb2VzVGVtcG9yYXJ5QnJhbmNoRXhpc3QiLCJzb21lIiwiYnJhbmNoIiwidG9TdHJpbmciLCJpbmNsdWRlcyIsInRlbXBvcmFyeUJyYW5jaCIsImNyZWF0ZSIsImNhdGNoIiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwic2hhIiwic3RhdHVzZUxpc3QiLCJnZXRTdGF0dXMiLCJTdGFzaCIsInNhdmUiLCJGTEFHUyIsIklOQ0xVREVfVU5UUkFDS0VEIiwiY2hlY2tvdXRCcmFuY2giLCJSZXNldCIsInJlc2V0IiwiSEFSRCIsIm51bWJlciIsIkVycm9yIiwiZ2l0RXhjbHVkZVBhdGgiLCJnaXRJZ25vcmVQYXRoIiwidW5saW5rU3luYyIsImNvcHlGaWxlIiwiZGVzdGluYXRpb24iLCJkaXJlbnRMaXN0IiwiaWdub3JlZERpcmVjdG9yeUxpc3QiLCJJZ25vcmUiLCJwYXRoSXNJZ25vcmVkIiwiQm9vbGVhbiIsImRpcmVudFRvRGVsZXRlIiwiZGVsZXRlQWJzb2x1dGVQYXRoTGlzdCIsImFic29sdXRlUGF0aCIsImZpbGVzeXN0ZW1FeHRyYSIsInJlbW92ZVN5bmMiLCJjb3B5U3luYyIsImRpcmVjdG9yeSIsImRpc3RyaWJ1dGlvbiIsImluZGV4IiwicmVmcmVzaEluZGV4IiwidHJlZU9iamVjdCIsImFkZEFsbCIsIndyaXRlIiwid3JpdGVUcmVlIiwicGFyZW50Q29tbWl0IiwiZ2V0SGVhZENvbW1pdCIsImNyZWF0ZUNvbW1pdCIsIm9pZCIsImxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCIsIlRhZyIsInBvcCIsInJlYmFzaW5nRXhhbXBsZSIsImZyb21CcmFuY2giLCJ0b0JyYW5jaCIsInJlYmFzZUJyYW5jaGVzIiwicmViYXNlIiwicmVzb2x2ZSIsInJlYmFzZU1ldGFkYXRhIiwiZGVsZXRlVGVtcG9yYXJ5QnJhbmNoIiwiaXNDaGVja2VkT3V0IiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoia09BQUE7QUFDQTtBQUNBOztBQUVB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QUE3RSxDQUFOOztBQUU5Q29CLElBQUFBLGVBQWUsR0FBRyxNQUFNNUIsaUJBQUlHLE1BQUosQ0FBV0MsTUFBWCxDQUFrQkwsVUFBbEIsRUFBOEJkLG1CQUE5QixFQUFtRCxDQUFuRCxDQUF4QjtBQUNBLFFBQUk4QyxLQUFLLEdBQUcvQixpQkFBSUcsTUFBSixDQUFXb0YsTUFBWCxDQUFrQjNELGVBQWxCLENBQVo7QUFDQSxRQUFJRyxLQUFKLEVBQVcsTUFBTSxJQUFJZSxLQUFKLENBQVcsdUNBQXNDZixLQUFNLG9EQUF2RCxDQUFOO0FBQ1hDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFhLCtCQUE4QixNQUFNTCxlQUFlLENBQUNwQixJQUFoQixFQUF1QixHQUF4RTtBQUNELEdBUEQsQ0FPRSxPQUFPdUIsS0FBUCxFQUFjO0FBQ2QsVUFBTUEsS0FBTjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlsZXN5c3RlbSBmcm9tICdmcydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXHJcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcclxuaW1wb3J0IGZpbGVzeXN0ZW1FeHRyYSBmcm9tICdmcy1leHRyYSdcclxuaW1wb3J0IHsgZGVmYXVsdCBhcyBnaXQsIENvbW1pdCwgUmVwb3NpdG9yeSwgUmVmZXJlbmNlLCBCcmFuY2gsIFNpZ25hdHVyZSwgUmVzZXQsIFN0YXNoIH0gZnJvbSAnbm9kZWdpdCdcclxuaW1wb3J0IHsgY29weUZpbGUgfSBmcm9tICdAZGVwZW5kZW5jeS9kZXBsb3ltZW50UHJvdmlzaW9uaW5nJ1xyXG5jb25zdCBnZXREaXJlY3RvcnkgPSBzb3VyY2UgPT4gZmlsZXN5c3RlbS5yZWFkZGlyU3luYyhzb3VyY2UsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KS5maWx0ZXIoZGlyZW50ID0+IGRpcmVudC5pc0RpcmVjdG9yeSgpKVxyXG5jb25zdCBnZXRBbGxEaXJlbnQgPSBzb3VyY2UgPT4gZmlsZXN5c3RlbS5yZWFkZGlyU3luYyhzb3VyY2UsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KVxyXG4vKiogRmlsdGVyIGFycmF5IHdpdGggYXN5bmMgZnVuY3Rpb25cclxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzMzNTU1MjgvZmlsdGVyaW5nLWFuLWFycmF5LXdpdGgtYS1mdW5jdGlvbi10aGF0LXJldHVybnMtYS1wcm9taXNlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmaWx0ZXJBc3luYyhhcnIsIGNhbGxiYWNrKSB7XHJcbiAgY29uc3QgZmFpbCA9IFN5bWJvbCgpXHJcbiAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChhcnIubWFwKGFzeW5jIGl0ZW0gPT4gKChhd2FpdCBjYWxsYmFjayhpdGVtKSkgPyBpdGVtIDogZmFpbCkpKSkuZmlsdGVyKGkgPT4gaSAhPT0gZmFpbClcclxufVxyXG5cclxuZnVuY3Rpb24gbG9va3VwQ29uZmlnRmlsZSh7IHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lIH0pIHtcclxuICBsZXQgY29uZmlnUG9zc2libGVQYXRoID0gW3BhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZSksIHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgJ2NvbmZpZ3VyYXRpb24nLCBjb25maWdOYW1lKV1cclxuICAvLyBmaW5kIGV4aXN0aW5nIGNvbmZpZyBmaWxlXHJcbiAgbGV0IGNvbmZpZ1BhdGhBcnJheSA9IGNvbmZpZ1Bvc3NpYmxlUGF0aC5maWx0ZXIoY29uZmlnUGF0aCA9PiBmaWxlc3lzdGVtLmV4aXN0c1N5bmMoY29uZmlnUGF0aCkpXHJcbiAgYXNzZXJ0KGNvbmZpZ1BhdGhBcnJheS5sZW5ndGggPiAwLCBg4oCiICR7Y29uZmlnTmFtZX0gbG9va3VwIGZhaWxlZCwgZmlsZSBub3QgZm91bmQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gcG9zc2libGUgcGF0aHMgLSAke2NvbmZpZ1Bvc3NpYmxlUGF0aH0uYClcclxuICByZXR1cm4gY29uZmlnUGF0aEFycmF5WzBdXHJcbn1cclxuXHJcbi8vPyBUT0RPOiBSZWxlYXNlcyBjb3VsZCBiZSBjcmVhdGVkIGZvciBzb3VyY2UgY29kZSBpbiBhZGRpdGlvbiB0byBkaXN0cmlidXRpb24gY29kZSByZWxlYXNlLlxyXG5cclxuLyoqXHJcbiAqIOKXiyBQdXNoIG5ldyB2ZXJzaW9uIHRvIGdpdGh1YiB0YWdzLlxyXG4gKiDil4sgQ3JlYXRlIGEgbmV3IHJlbGVhc2UgZnJvbSB0aGUgcHVzaGVkIHRhZy5cclxuICogUmVsZWFzZSBhIG5ldyB0YWcgaW4gR2l0aHViOlxyXG4gKiAgMC4gc3Rhc2ggY2hhbmdlcyB0ZW1wb3JhcmlseVxyXG4gKiAgMS4gQ3JlYXRlIGEgdGVtcG9yYXJ5IGJyYW5jaCBvciB1c2UgYW4gZXhpc3RpbmcgYnJhbmNoIGFuZCBjaGVja291dCB0byBpdC5cclxuICogIDIuIFJlYmFzZSBvciBSZXNldGluZyBvbnRvIG1hc3RlciAoaW4gY2FzZSB0aGUgdGVtcG9yYXJ5IGJyYW5jaCBleGlzdHMpIC0gc2ltaWxhciB0byBvdmVycmlkaW5nIGJyYW5jaCBoaXN0b3J5IHdpdGggdGhlIG1hc3RlciBicmFuY2guXHJcbiAqICAzLiBCdWlsZCBjb2RlIGFuZCBjb21taXQgd2l0aCBhIGRpc3RyaWJ1dGlvbiBtZXNzYWdlLlxyXG4gKiAgNC4gQ3JlYXRlIGEgcmVsZWFzZS90YWcuXHJcbiAqICA1LiBjbGVhbnVwIGJyYW5jaGVzLlxyXG4gKiAgNi4gZ2l0IGNoZWNrb3V0IG1hc3RlclxyXG4gKiAgNy4gcG9wIGxhc3Qgc3Rhc2ggZmlsZXNcclxuICpcclxuICogIEBzaWVFZmZlY3QgLSBjcmVhdGVzIGEgdGFnIGFuZCBkZWxldGVzIHRlbXBvcmFyeSBicmFuY2guXHJcbiAqXHJcbiAqIFNpbXBsZSBleGFtcGxlIGVxdWl2YWxlbnQgc2hlbGwgc2NyaXB0OlxyXG4gKiBgYGBnaXQgY2hlY2tvdXQgZGlzdHJpYnV0aW9uICYmIGdpdCByZWJhc2UgLS1vbnRvIG1hc3RlciBkaXN0cmlidXRpb24gJiYgZWNobyBcIlRlc3QgUGFnZVwiID4gbmV3LmpzICYmIGdpdCBhZGQgLUEgJiYgZ2l0IGNvbW1pdCAtYSAtbSAnYnVpbGQnICYmIGdpdCB0YWcgdjU7IGdpdCBjaGVja291dCBtYXN0ZXJgYGBcclxuICpcclxuICogYG5vZGVnaXRgIGRvY3VtZW50YXRpb246IGh0dHBzOi8vd3d3Lm5vZGVnaXQub3JnL2FwaVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUdpdGh1YkJyYW5jaGVkUmVsZWFzZSh7XHJcbiAgLy8gJ2JyYW5jaGVkIHJlbGVhc2UnIGluIHRoZSBzZW5zZSBvZiBhIHRhZyB0aGF0IHBvaW50cyB0byBhbiBhZGRpdGlvbmFsIGJ1aWxkIGNvbW1pdCBvdGhlciB0aGFuIHRoZSBtYXN0ZXIgY29tbWl0IGZvciBleGFtcGxlLlxyXG4gIGFwaSxcclxuICB0ZW1wb3JhcnlCcmFuY2hOYW1lID0gJ2Rpc3RyaWJ1dGlvbicsIC8vIGJyYW5jaCB1c2VkIHRvIGJ1aWxkIHNvdXJjZSBjb2RlIGFuZCBjcmVhdGUgYSBkaXN0cmlidXRpb24gdGFnIGZyb21cclxuICBicmFjaFRvUG9pbnRUbyA9ICdtYXN0ZXInLCAvLyBkZWZhdWx0IGJyYW5jaCBmb3IgbGF0ZXN0IGNvbW1pdC5cclxuICBjb21taXRUb1BvaW50VG8gPSBudWxsLCAvLyB1bnJlbGF0ZWQgY29tbWl0IHRvIHBvaW50IHRvIHdoaWxlIGNyZWF0aW5nIHRlbXBvcmFyeSBicmFuY2hcclxuICB0YWdOYW1lLFxyXG4gIGJ1aWxkQ2FsbGJhY2ssIC8vIGJ1aWxkIGFzeW5jIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgYnVpbGRpbmcgc291cmNlIGNvZGUgYW5kIHByZXBhcmluZyB0aGUgcGFja2FnZSBmb3IgZGlzdHJpYnV0aW9uLlxyXG4gIHRhZ2dlcixcclxufToge1xyXG4gIHRhZ2dlcjogeyBuYW1lOiAnJywgZW1haWw6ICcnIH0sXHJcbn0pIHtcclxuICBjb25zdCB0YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3QsXHJcbiAgICB0YXJnZXRQcm9qZWN0Q29uZmlnID0gdGFyZ2V0UHJvamVjdC5jb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb24sXHJcbiAgICB0YXJnZXRQcm9qZWN0Um9vdCA9IHRhcmdldFByb2plY3QuY29uZmlndXJhdGlvbi5yb290UGF0aCxcclxuICAgIHRhcmdldFByb2plY3RHaXRVcmwgPSB0YXJnZXRQcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbj8uYnVpbGQucmVwb3NpdG9yeVVSTFxyXG5cclxuICAvLyByZWFkIGdpdCByZXBvc2l0b3J5XHJcbiAgY29uc3QgcmVwb3NpdG9yeSA9IGF3YWl0IGdpdC5SZXBvc2l0b3J5Lm9wZW4odGFyZ2V0UHJvamVjdFJvb3QpXHJcbiAgYnJhY2hUb1BvaW50VG8gPSBhd2FpdCBnaXQuQnJhbmNoLmxvb2t1cChyZXBvc2l0b3J5LCBicmFjaFRvUG9pbnRUbywgMSkgLy8gY29udmVydCB0byBicmFuY2ggcmVmZXJlbmNlXHJcblxyXG4gIC8vIGxvYWQgdGFnZ2VyU2lnbmF0dXJlIHNpZ25hdHVyZVxyXG4gIGxldCB0YWdnZXJTaWduYXR1cmUgPSB0YWdnZXIgPyBnaXQuU2lnbmF0dXJlLm5vdyh0YWdnZXIubmFtZSwgdGFnZ2VyLmVtYWlsKSA6IGF3YWl0IGdpdC5TaWduYXR1cmUuZGVmYXVsdChyZXBvc2l0b3J5KVxyXG4gIGFzc2VydCh0YWdnZXJTaWduYXR1cmUsIGDinYwgR2l0aHViIHVzZXJuYW1lIHNob3VsZCBiZSBwYXNzZWQgb3IgZm91bmQgaW4gdGhlIGdpdCBsb2NhbC9zeXN0ZW0gY29uZmlncy5gKVxyXG5cclxuICAvLyBnZXQgbGF0ZXN0IGNvbW1pdCBmcm9tIGJyYW5jaFxyXG4gIGxldCBnZXRMYXRlc3RDb21taXQgPSBhd2FpdCByZXBvc2l0b3J5LmdldFJlZmVyZW5jZUNvbW1pdChicmFjaFRvUG9pbnRUbylcclxuICAvLyBzZXQgY29tbWl0IHJlZmVyZW5jZVxyXG4gIGlmIChjb21taXRUb1BvaW50VG8pIHtcclxuICAgIGNvbW1pdFRvUG9pbnRUbyA9IGF3YWl0IGdpdC5Db21taXQubG9va3VwKHJlcG9zaXRvcnksIGNvbW1pdFRvUG9pbnRUbykgLy8gZ2V0IGNvbW1pdCBmcm9tIHN1cHBsaWVkIGNvbW1pdCBpZCBwYXJhbWV0ZXJcclxuICB9IGVsc2UgY29tbWl0VG9Qb2ludFRvID0gZ2V0TGF0ZXN0Q29tbWl0XHJcblxyXG4gIC8vIGdldCBhbGwgYnJhbmNoZXMgcmVtb3RlIGFuZCBsb2NhbFxyXG4gIGxldCBicmFuY2hSZWZlcmVuY2VMaXN0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRSZWZlcmVuY2VzKCkudGhlbihyZWZlcmVuY2VMaXN0ID0+IHJlZmVyZW5jZUxpc3QuZmlsdGVyKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UudHlwZSgpID09IGdpdC5SZWZlcmVuY2UuVFlQRS5ESVJFQ1QpKVxyXG5cclxuICAvLyBjaGVjayBpZiBgdGVtcG9yYXJ5QnJhbmNoTmFtZWAgYnJhbmNoLCB0aGF0IGlzIHVzZWQsIGV4aXN0cy5cclxuICBsZXQgZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0ID0gYnJhbmNoUmVmZXJlbmNlTGlzdC5zb21lKGJyYW5jaCA9PiBicmFuY2gudG9TdHJpbmcoKS5pbmNsdWRlcyh0ZW1wb3JhcnlCcmFuY2hOYW1lKSlcclxuICBsZXQgdGVtcG9yYXJ5QnJhbmNoIC8vIEJyYW5jaCByZWZlcmVuY2VcclxuICBpZiAoIWRvZXNUZW1wb3JhcnlCcmFuY2hFeGlzdCkge1xyXG4gICAgLy8gY3JlYXRlIHRlbXBvcmFyeSBicmFuY2hcclxuICAgIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2guY3JlYXRlKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIGNvbW1pdFRvUG9pbnRUbywgMSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbiAgICBjb25zb2xlLmxvZyhg4oCiIENyZWF0ZWQgdGVtcG9yYXJ5IGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9IGZyb20gY29tbWl0ICR7Y29tbWl0VG9Qb2ludFRvLnNoYSgpfWApXHJcbiAgfSBlbHNlIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2gubG9va3VwKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIDEpXHJcblxyXG4gIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSB1bnRyYWNrZWQgb3Igc3RhZ2VkIGZpbGVzXHJcbiAgbGV0IHN0YXR1c2VMaXN0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRTdGF0dXMoKVxyXG4gIGlmIChzdGF0dXNlTGlzdC5sZW5ndGggPiAwKVxyXG4gICAgLy8gc3Rhc2ggY2hhbmdlcyB0aGF0IGFyZSBzdGlsbCBub3QgY29tbWl0dGVkXHJcbiAgICBhd2FpdCBnaXQuU3Rhc2guc2F2ZShyZXBvc2l0b3J5LCB0YWdnZXJTaWduYXR1cmUsICdjaGVja291dCBzdGFzaCBiZWZvcmUgcmVsZWFzZScsIGdpdC5TdGFzaC5GTEFHUy5JTkNMVURFX1VOVFJBQ0tFRClcclxuXHJcbiAgLy8gY2hlY2tvdXQgdGVtcG9yYXJ5XHJcbiAgYXdhaXQgcmVwb3NpdG9yeS5jaGVja291dEJyYW5jaChhd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpKS50aGVuKGFzeW5jICgpID0+IGNvbnNvbGUubG9nKGBDaGVja2VkIGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9YCkpXHJcblxyXG4gIC8qKiByZXNldCB0ZW1wb3JhcnkgYnJhbmNoIHRvIHRoZSBjb21taXQgdG8gcG9pbnQgdG8gKHRhcmdldENvbW1pdClcclxuICAgKiBOT1RFOiBBbm90aGVyIG9wdGlvbiBpcyB0byB1c2UgcmViYXNpbmcgd2hlcmUgY3VycmVudCBjb21taXRzIGFyZSBzYXZlZCAtIGNoZWNrICBgcmViYXNpbmdFeGFtcGxlKClgIGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgYXdhaXQgZ2l0LlJlc2V0LnJlc2V0KHJlcG9zaXRvcnksIGNvbW1pdFRvUG9pbnRUbywgZ2l0LlJlc2V0LlRZUEUuSEFSRClcclxuICAgIC50aGVuKG51bWJlciA9PiB7XHJcbiAgICAgIGlmIChudW1iZXIpIHRocm93IG5ldyBFcnJvcihg4oCiIENvdWxkIG5vdCByZXNldCByZXBvc2l0b3J5ICR7cmVwb3NpdG9yeX0gdG8gY29tbWl0ICR7Y29tbWl0VG9Qb2ludFRvfWApXHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IpXHJcblxyXG4gIC8vIHJ1biBidWlsZFxyXG4gIGlmIChidWlsZENhbGxiYWNrKVxyXG4gICAgYXdhaXQgYnVpbGRDYWxsYmFjaygpXHJcbiAgICAgIC50aGVuKCgpID0+IGNvbnNvbGUubG9nKCdQcm9qZWN0IGJ1aWx0IHN1Y2Nlc3NmdWxseSAhJykpXHJcbiAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSlcclxuXHJcbiAgLyoqIE1ha2UgZGlzdHJpYnV0aW9uIGZvbGRlciBhcyByb290IGRpcmVjdG9yeSBpbiB0aGUgYnJhbmNoICovXHJcbiAgLy8gZGVsZXRpbmcgLmdpdGlnbm9yZSB3aWxsIG1ha2UgaXQgZmFzdGVyLCBieSBwcmV2ZW50aW5nIG5vZGVfbW9kdWxlcyBmcm9tIGJlaW5nIHByb2Nlc3NlZCBieSB0b29scyB3aGlsZSBkZWxldGluZyBmaWxlcy5cclxuICBsZXQgZ2l0RXhjbHVkZVBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICcuLy5naXQvaW5mby9leGNsdWRlJyksXHJcbiAgICBnaXRJZ25vcmVQYXRoID0gbG9va3VwQ29uZmlnRmlsZSh7IHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lOiAnLmdpdGlnbm9yZScgfSlcclxuICBpZiAoZmlsZXN5c3RlbS5leGlzdHNTeW5jKGdpdEV4Y2x1ZGVQYXRoKSkgZmlsZXN5c3RlbS51bmxpbmtTeW5jKGdpdEV4Y2x1ZGVQYXRoKSAvLyByZW1vdmUgZmlsZVxyXG4gIGNvcHlGaWxlLmNvcHlGaWxlKFt7IHNvdXJjZTogZ2l0SWdub3JlUGF0aCwgZGVzdGluYXRpb246IGdpdEV4Y2x1ZGVQYXRoIH1dKSAvLyBjb3B5IC5naXRpZ25vcmUgdG8gYC5naXRgIGZvbGRlclxyXG5cclxuICAvLyBnZXQgdG9wIGRpcmVjdG9yaWVzIHRoYXQgYXJlIGlnbm9yZWRcclxuICBsZXQgZGlyZW50TGlzdCA9IGdldEFsbERpcmVudCh0YXJnZXRQcm9qZWN0Um9vdCkgLy8gZ2V0IGFsbCBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgb24gdG9wIGxldmVsXHJcblxyXG4gIC8vIFRPRE86IERlYWwgd2l0aCBzdWJkaXJlY3Rvcnkgbm9kZV9tb2R1bGVzIGFuZCBpZ25vcmVkIGZpbGVzLiBUaGUgaXNzdWVzIGlzIHRoYXQgdGhlIHdob2xlIHRvcGxldmVsIGRpcmVjdG9yeSBpcyByZW1vdmVkLlxyXG4gIC8vIC8vIGdldCBhbGwgMm5kIGxldmVsIGRpcmVjdG9yaWVzIC0gdGhpcyBhbGxvd3MgZm9yIHdvcmtzcGFjZXMgdG8ga2VlcCBub2RlX21vZHVsZXMgZm9sZGVyIGluIGEgc3ViZGlyZWN0b3J5LlxyXG4gIC8vIGZvciAobGV0IHRvcGxldmVsRGlyZW50IG9mIGRpcmVudExpc3QpIHtcclxuICAvLyAgIGxldCBzdWJEaXJlbnRMaXN0ID1cclxuICAvLyB9XHJcblxyXG4gIC8vIGNoZWNrIGlmIHBhdGggaXMgaWdub3JlZFxyXG4gIGxldCBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGF3YWl0IGZpbHRlckFzeW5jKGRpcmVudExpc3QsIGFzeW5jIGRpcmVudCA9PiAoYXdhaXQgZ2l0Lklnbm9yZS5wYXRoSXNJZ25vcmVkKHJlcG9zaXRvcnksIHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgZGlyZW50Lm5hbWUpKSkgfD4gQm9vbGVhbilcclxuICAvLyBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGlnbm9yZWREaXJlY3RvcnlMaXN0Lm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpIC8vIGdldCBhYnNvbHV0ZSBwYXRoc1xyXG4gIC8vIGdldCBkaXJlbnQgbGlzdCB0byBkZWxldGVcclxuICBsZXQgZGlyZW50VG9EZWxldGUgPSBkaXJlbnRMaXN0LmZpbHRlcihkaXJlbnQgPT4gIWlnbm9yZWREaXJlY3RvcnlMaXN0LmluY2x1ZGVzKGRpcmVudCkpIC8vIHJlbW92ZSBpZ25vcmVkIGRpcmVudHMgZnJvbSBkZWxldGUgbGlzdFxyXG4gIC8qKiBEZWxldGUgZGlyZW50IGxpc3QgdGhhdCBpbmNsdWRlcyBkaXJlY3RvcmllcyBhbmQgZmlsZXMgKi9cclxuICBsZXQgZGVsZXRlQWJzb2x1dGVQYXRoTGlzdCA9IGRpcmVudFRvRGVsZXRlLm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpXHJcbiAgZm9yIChsZXQgYWJzb2x1dGVQYXRoIG9mIGRlbGV0ZUFic29sdXRlUGF0aExpc3QpIHtcclxuICAgIGZpbGVzeXN0ZW1FeHRyYS5yZW1vdmVTeW5jKGFic29sdXRlUGF0aClcclxuICB9XHJcbiAgLy8gY29weSBkaXN0cmlidXRpb24gY29udGVudHMgdG8gcm9vdCBwcm9qZWN0IGxldmVsXHJcbiAgZmlsZXN5c3RlbUV4dHJhLmNvcHlTeW5jKHRhcmdldFByb2plY3RDb25maWcuZGlyZWN0b3J5LmRpc3RyaWJ1dGlvbiwgdGFyZ2V0UHJvamVjdFJvb3QpXHJcblxyXG4gIC8vIENyZWF0ZSBjb21taXQgb2YgYWxsIGZpbGVzLlxyXG4gIGxldCBpbmRleCA9IGF3YWl0IHJlcG9zaXRvcnkucmVmcmVzaEluZGV4KCkgLy8gaW52YWxpZGF0ZXMgYW5kIGdyYWJzIG5ldyBpbmRleCBmcm9tIHJlcG9zaXRvcnkuXHJcbiAgbGV0IHRyZWVPYmplY3QgPSBhd2FpdCBpbmRleFxyXG4gICAgLmFkZEFsbChbJyoqJ10pXHJcbiAgICAudGhlbigoKSA9PiBpbmRleC53cml0ZSgpKVxyXG4gICAgLnRoZW4oKCkgPT4gaW5kZXgud3JpdGVUcmVlKCkpIC8vIGFkZCBmaWxlcyBhbmQgY3JlYXRlIGEgdHJlZSBvYmplY3QuXHJcbiAgbGV0IHBhcmVudENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgcmVwb3NpdG9yeVxyXG4gICAgLmNyZWF0ZUNvbW1pdChcclxuICAgICAgJ0hFQUQnIC8qIHVwZGF0ZSB0aGUgSEVBRCByZWZlcmVuY2UgLSBzbyB0aGF0IHRoZSBIRUFEIHdpbGwgcG9pbnQgdG8gdGhlIGxhdGVzdCBnaXQgKi8gfHwgbnVsbCAvKiBkbyBub3QgdXBkYXRlIHJlZiAqLyxcclxuICAgICAgdGFnZ2VyU2lnbmF0dXJlLFxyXG4gICAgICB0YWdnZXJTaWduYXR1cmUsXHJcbiAgICAgIGDwn4+X77iPIEJ1aWxkIGRpc3RyaWJ1dGlvbiBjb2RlLmAsXHJcbiAgICAgIHRyZWVPYmplY3QsXHJcbiAgICAgIFtwYXJlbnRDb21taXRdLFxyXG4gICAgKVxyXG4gICAgLnRoZW4ob2lkID0+IGNvbnNvbGUubG9nKGDigKIgQ29tbWl0IGNyZWF0ZWQgJHtvaWR9IGZvciBkaXN0cmlidXRpb24gY29kZWApKVxyXG5cclxuICAvLyB0YWcgYW5kIGNyZWF0ZSBhIHJlbGVhc2UuXHJcbiAgbGV0IGxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgZ2l0LlRhZy5jcmVhdGUocmVwb3NpdG9yeSwgdGFnTmFtZSwgbGF0ZXN0VGVtcG9yYXJ5QnJhbmNoQ29tbWl0LCB0YWdnZXJTaWduYXR1cmUsIGBSZWxlYXNlIG9mIGRpc3RyaWJ1dGlvbiBjb2RlIG9ubHkuYCwgMCkudGhlbihvaWQgPT4gY29uc29sZS5sb2coYOKAoiBUYWcgY3JlYXRlZCAke29pZH1gKSlcclxuXHJcbiAgLy8gbWFrZSBzdXJlIHRoZSBicmFuY2ggaXMgY2hlY2tlZG91dC5cclxuICBhd2FpdCByZXBvc2l0b3J5LmNoZWNrb3V0QnJhbmNoKGJyYWNoVG9Qb2ludFRvKS50aGVuKGFzeW5jICgpID0+IGNvbnNvbGUubG9nKGBDaGVja2VkIGJyYW5jaCAke2F3YWl0IGJyYWNoVG9Qb2ludFRvLm5hbWUoKX1gKSkgLy8gY2hlY2tvdXQgZm9ybWVyIGJyYW5jaCAodXN1YWxseSBtYXN0ZXIgYnJhbmNoKVxyXG5cclxuICAvLyBhcHBseSB0ZW1wb3Jhcmx5IHN0YXNoZWQgZmlsZXNcclxuICBpZiAoc3RhdHVzZUxpc3QubGVuZ3RoID4gMCkgYXdhaXQgZ2l0LlN0YXNoLnBvcChyZXBvc2l0b3J5LCAwIC8qKiBsYXN0IHN0YWNoZWQgcG9zaXRpb24gKi8pXHJcbn1cclxuXHJcbi8qKiByZWJhc2UgaW50byBtYXN0ZXIgYnJhbmNoIHRvIGZvbGxvdyB0aGUgbGF0ZXN0IG1hc3RlciBjb21taXQuIFRPRE86IHRoaXMgaXMgYW4gZXhhbXBsZSAtIGZpeCBhc3luYyBvcGVyYXRpb24uXHJcbiAqICBUaGlzIGlzIGFuIG9wdGlvbiBmb3IgcmViYXNpbmcgYSB0ZW1wb3JhcnkgYnJhbmNoIHRvIHRoZSBsYXRlc3QgY29tbWl0IChvciBhIG5ld2VyIGNvbW1pdCkuIEFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSBgcmVzZXRgIHRvIGEgZGlmZmVyZW50IGNvbW1pdC5cclxuICovXHJcbmZ1bmN0aW9uIHJlYmFzaW5nRXhhbXBsZSh7IHJlcG9zaXRvcnksIGJyYW5jaCwgZnJvbUJyYW5jaCwgdG9CcmFuY2ggfSkge1xyXG4gIHJldHVybiByZXBvc2l0b3J5LnJlYmFzZUJyYW5jaGVzKFxyXG4gICAgYnJhbmNoLm5hbWUoKSwgLy8gYnJhbmNoIGNvbW1pdHMgdG8gbW92ZVxyXG4gICAgZnJvbUJyYW5jaC5uYW1lKCksIC8vIHRpbGwgY29tbWl0cyB0aGF0IGFyZSBpbnRlcnNlY3RlZCB3aXRoIHRoaXMgYnJhbmNoIChvbGQgYnJhbmNoKVxyXG4gICAgdG9CcmFuY2gubmFtZSgpLCAvLyBvbnRvIHRoZSBuZXcgYnJhbmNoLlxyXG4gICAgZ2l0LlNpZ25hdHVyZS5ub3coJ21lb3cnLCAndGVzdEBleGFtcGxlLmNvbScpLFxyXG4gICAgcmViYXNlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ09uZSBvcGVyYXRpb24nKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgICByZWJhc2VNZXRhZGF0YSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCByZWJhc2UnKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgKVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUZW1wb3JhcnlCcmFuY2goeyByZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2ggfSkge1xyXG4gIC8vIGRlbGV0ZSB0ZW1wb3JhcnkgYnJhbmNoXHJcbiAgdHJ5IHtcclxuICAgIGlmIChnaXQuQnJhbmNoLmlzQ2hlY2tlZE91dCh0ZW1wb3JhcnlCcmFuY2gpKSB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBkZWxldGUgYSBjaGVja2VkIG91dCBicmFuY2ggJHthd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpfS5gKVxyXG4gICAgLy8gQnkgcmVhc3NpZ25pbmcgdGhlIHZhcmlhYmxlIGFuZCBsb29raW5nIHVwIHRoZSBicmFuY2ggdGhlIGdhcmJhZ2UgY29sbGVjdG9yIHdpbGwga2ljayBpbi4gVGhlIHJlZmVyZW5jZSBmb3IgdGhlIGJyYW5jaCBpbiBsaWJnaXQyIHNob3VsZG4ndCBiZSBpbiBtZW1vcnkgYXMgbWVudGlvbmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9saWJnaXQyL2xpYmdpdDIvYmxvYi84NTlkOTIyOTJlMDA4YTRkMDRkNjhmYjZkYzIwYTFkZmE2OGU0ODc0L2luY2x1ZGUvZ2l0Mi9yZWZzLmgjTDM4NS1MMzk4XHJcbiAgICB0ZW1wb3JhcnlCcmFuY2ggPSBhd2FpdCBnaXQuQnJhbmNoLmxvb2t1cChyZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2hOYW1lLCAxKSAvLyByZWZlcmVzaCB2YWx1ZSBvZiB0ZW1wb3JhcnlCcmFuY2ggLSBmb3Igc29tZSByZWFzb24gdXNpbmcgdGhlIHNhbWUgcmVmZXJlbmNlIHByZXZlbnRzIGRlbGV0aW9uIG9mIGJyYW5jaC5cclxuICAgIGxldCBlcnJvciA9IGdpdC5CcmFuY2guZGVsZXRlKHRlbXBvcmFyeUJyYW5jaClcclxuICAgIGlmIChlcnJvcikgdGhyb3cgbmV3IEVycm9yKGBDb2RlIHRocm93biBieSAnbGliZ2l0MicgYmluZGluZ3MgPSAke2Vycm9yfVxcbiBcXHRDaGVjayBodHRwczovL3d3dy5ub2RlZ2l0Lm9yZy9hcGkvZXJyb3IvI0NPREVgKVxyXG4gICAgY29uc29sZS5sb2coYOKAoiBEZWxldGVkIHRlbXBvYXJhcnkgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0uYClcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgZXJyb3JcclxuICB9XHJcbn1cclxuIl19