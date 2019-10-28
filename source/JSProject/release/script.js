"use strict";var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.createGithubBranchedRelease = createGithubBranchedRelease;var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _assert = _interopRequireDefault(require("assert"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _nodegit = _interopRequireDefault(require("nodegit"));
var provision = _interopRequireWildcard(require("@dependency/deploymentProvisioning"));
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


  console.log(`• Openning repository: ${targetProjectRoot}`);
  const repository = await _nodegit.default.Repository.open(targetProjectRoot);
  brachToPointTo = await _nodegit.default.Branch.lookup(repository, brachToPointTo, 1);


  let taggerSignature = tagger ? _nodegit.default.Signature.now(tagger.name, tagger.email) : await _nodegit.default.Signature.default(repository);
  (0, _assert.default)(taggerSignature, `❌ Github username should be passed or found in the git local/system configs.`);


  let getLatestCommit = await repository.getReferenceCommit(brachToPointTo);
  console.log(`• Getting latest commit: ${getLatestCommit}`);

  if (commitToPointTo) {
    commitToPointTo = await _nodegit.default.Commit.lookup(repository, commitToPointTo);
  } else commitToPointTo = getLatestCommit;


  let branchReferenceList = await repository.getReferences().then(referenceList => referenceList.filter(reference => reference.type() == _nodegit.default.Reference.TYPE.DIRECT));


  console.log(`• Checking/Creating temporary branch: ${temporaryBranchName}`);
  let doesTemporaryBranchExist = branchReferenceList.some(branch => branch.toString().includes(temporaryBranchName));
  let temporaryBranch;
  if (!doesTemporaryBranchExist) {

    temporaryBranch = await _nodegit.default.Branch.create(repository, temporaryBranchName, commitToPointTo, 1).catch(error => console.error(error));
    console.log(`• Created temporary branch ${await temporaryBranch.name()} from commit ${commitToPointTo.sha()}`);
  } else temporaryBranch = await _nodegit.default.Branch.lookup(repository, temporaryBranchName, 1);


  let statuseList = await repository.getStatus();
  if (statuseList.length > 0) {

    console.log(`• Checkout stash of changes unrelated to release.`);
    await _nodegit.default.Stash.save(repository, taggerSignature, 'checkout stash before release', _nodegit.default.Stash.FLAGS.INCLUDE_UNTRACKED);
  }


  await repository.checkoutBranch((await temporaryBranch.name())).then(async () => console.log(`Checked branch ${await temporaryBranch.name()}`));




  await _nodegit.default.Reset.reset(repository, commitToPointTo, _nodegit.default.Reset.TYPE.HARD).
  then(number => {
    if (number) throw new Error(`• Could not reset repository ${repository} to commit ${commitToPointTo}`);
  }).
  catch(error => console.error);


  if (buildCallback) {
    console.log(`• Building project...`);
    await buildCallback().
    then(() => console.log('Project built successfully !')).
    catch(error => console.error(error));
  }



  let gitExcludePath = _path.default.join(targetProjectRoot, './.git/info/exclude'),
  gitIgnorePath = lookupConfigFile({ targetProjectRoot, configName: '.gitignore' });
  if (_fs.default.existsSync(gitExcludePath)) _fs.default.unlinkSync(gitExcludePath);
  provision.copy.copyFile([{ source: gitIgnorePath, destination: gitExcludePath }]);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcmVsZWFzZS9zY3JpcHQuanMiXSwibmFtZXMiOlsiZ2V0RGlyZWN0b3J5Iiwic291cmNlIiwiZmlsZXN5c3RlbSIsInJlYWRkaXJTeW5jIiwid2l0aEZpbGVUeXBlcyIsImZpbHRlciIsImRpcmVudCIsImlzRGlyZWN0b3J5IiwiZ2V0QWxsRGlyZW50IiwiZmlsdGVyQXN5bmMiLCJhcnIiLCJjYWxsYmFjayIsImZhaWwiLCJTeW1ib2wiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiaXRlbSIsImkiLCJsb29rdXBDb25maWdGaWxlIiwidGFyZ2V0UHJvamVjdFJvb3QiLCJjb25maWdOYW1lIiwiY29uZmlnUG9zc2libGVQYXRoIiwicGF0aCIsImpvaW4iLCJjb25maWdQYXRoQXJyYXkiLCJjb25maWdQYXRoIiwiZXhpc3RzU3luYyIsImxlbmd0aCIsImNyZWF0ZUdpdGh1YkJyYW5jaGVkUmVsZWFzZSIsImFwaSIsInRlbXBvcmFyeUJyYW5jaE5hbWUiLCJicmFjaFRvUG9pbnRUbyIsImNvbW1pdFRvUG9pbnRUbyIsInRhZ05hbWUiLCJidWlsZENhbGxiYWNrIiwidGFnZ2VyIiwidGFyZ2V0UHJvamVjdCIsInByb2plY3QiLCJ0YXJnZXRQcm9qZWN0Q29uZmlnIiwiY29uZmlndXJhdGlvbiIsInJvb3RQYXRoIiwidGFyZ2V0UHJvamVjdEdpdFVybCIsImJ1aWxkIiwicmVwb3NpdG9yeVVSTCIsImNvbnNvbGUiLCJsb2ciLCJyZXBvc2l0b3J5IiwiZ2l0IiwiUmVwb3NpdG9yeSIsIm9wZW4iLCJCcmFuY2giLCJsb29rdXAiLCJ0YWdnZXJTaWduYXR1cmUiLCJTaWduYXR1cmUiLCJub3ciLCJuYW1lIiwiZW1haWwiLCJkZWZhdWx0IiwiZ2V0TGF0ZXN0Q29tbWl0IiwiZ2V0UmVmZXJlbmNlQ29tbWl0IiwiQ29tbWl0IiwiYnJhbmNoUmVmZXJlbmNlTGlzdCIsImdldFJlZmVyZW5jZXMiLCJ0aGVuIiwicmVmZXJlbmNlTGlzdCIsInJlZmVyZW5jZSIsInR5cGUiLCJSZWZlcmVuY2UiLCJUWVBFIiwiRElSRUNUIiwiZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0Iiwic29tZSIsImJyYW5jaCIsInRvU3RyaW5nIiwiaW5jbHVkZXMiLCJ0ZW1wb3JhcnlCcmFuY2giLCJjcmVhdGUiLCJjYXRjaCIsImVycm9yIiwic2hhIiwic3RhdHVzZUxpc3QiLCJnZXRTdGF0dXMiLCJTdGFzaCIsInNhdmUiLCJGTEFHUyIsIklOQ0xVREVfVU5UUkFDS0VEIiwiY2hlY2tvdXRCcmFuY2giLCJSZXNldCIsInJlc2V0IiwiSEFSRCIsIm51bWJlciIsIkVycm9yIiwiZ2l0RXhjbHVkZVBhdGgiLCJnaXRJZ25vcmVQYXRoIiwidW5saW5rU3luYyIsInByb3Zpc2lvbiIsImNvcHkiLCJjb3B5RmlsZSIsImRlc3RpbmF0aW9uIiwiZGlyZW50TGlzdCIsImlnbm9yZWREaXJlY3RvcnlMaXN0IiwiSWdub3JlIiwicGF0aElzSWdub3JlZCIsIkJvb2xlYW4iLCJkaXJlbnRUb0RlbGV0ZSIsImRlbGV0ZUFic29sdXRlUGF0aExpc3QiLCJhYnNvbHV0ZVBhdGgiLCJmaWxlc3lzdGVtRXh0cmEiLCJyZW1vdmVTeW5jIiwiY29weVN5bmMiLCJkaXJlY3RvcnkiLCJkaXN0cmlidXRpb24iLCJpbmRleCIsInJlZnJlc2hJbmRleCIsInRyZWVPYmplY3QiLCJhZGRBbGwiLCJ3cml0ZSIsIndyaXRlVHJlZSIsInBhcmVudENvbW1pdCIsImdldEhlYWRDb21taXQiLCJjcmVhdGVDb21taXQiLCJvaWQiLCJsYXRlc3RUZW1wb3JhcnlCcmFuY2hDb21taXQiLCJUYWciLCJwb3AiLCJyZWJhc2luZ0V4YW1wbGUiLCJmcm9tQnJhbmNoIiwidG9CcmFuY2giLCJyZWJhc2VCcmFuY2hlcyIsInJlYmFzZSIsInJlc29sdmUiLCJyZWJhc2VNZXRhZGF0YSIsImRlbGV0ZVRlbXBvcmFyeUJyYW5jaCIsImlzQ2hlY2tlZE91dCIsImRlbGV0ZSJdLCJtYXBwaW5ncyI6InlU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Q0QsR0FSSTtBQVNMQyxFQUFBQSxjQUFjLElBQUk7QUFDaEJ2RixJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWjtBQUNBLFdBQU9oQyxPQUFPLENBQUNxSCxPQUFSLEVBQVA7QUFDRCxHQVpJLENBQVA7O0FBY0Q7O0FBRUQsZUFBZUUscUJBQWYsQ0FBcUMsRUFBRXRGLFVBQUYsRUFBYzZCLGVBQWQsRUFBckMsRUFBc0U7O0FBRXBFLE1BQUk7QUFDRixRQUFJNUIsaUJBQUlHLE1BQUosQ0FBV21GLFlBQVgsQ0FBd0IxRCxlQUF4QixDQUFKLEVBQThDLE1BQU0sSUFBSWdCLEtBQUosQ0FBVyxzQ0FBcUMsTUFBTWhCLGVBQWUsQ0FBQ3BCLElBQWhCLEVBQXVCLEdBQTdFLENBQU47O0FBRTlDb0IsSUFBQUEsZUFBZSxHQUFHLE1BQU01QixpQkFBSUcsTUFBSixDQUFXQyxNQUFYLENBQWtCTCxVQUFsQixFQUE4QmhCLG1CQUE5QixFQUFtRCxDQUFuRCxDQUF4QjtBQUNBLFFBQUlnRCxLQUFLLEdBQUcvQixpQkFBSUcsTUFBSixDQUFXb0YsTUFBWCxDQUFrQjNELGVBQWxCLENBQVo7QUFDQSxRQUFJRyxLQUFKLEVBQVcsTUFBTSxJQUFJYSxLQUFKLENBQVcsdUNBQXNDYixLQUFNLG9EQUF2RCxDQUFOO0FBQ1hsQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSwrQkFBOEIsTUFBTThCLGVBQWUsQ0FBQ3BCLElBQWhCLEVBQXVCLEdBQXhFO0FBQ0QsR0FQRCxDQU9FLE9BQU91QixLQUFQLEVBQWM7QUFDZCxVQUFNQSxLQUFOO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaWxlc3lzdGVtIGZyb20gJ2ZzJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCdcclxuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5pbXBvcnQgZmlsZXN5c3RlbUV4dHJhIGZyb20gJ2ZzLWV4dHJhJ1xyXG5pbXBvcnQgeyBkZWZhdWx0IGFzIGdpdCwgQ29tbWl0LCBSZXBvc2l0b3J5LCBSZWZlcmVuY2UsIEJyYW5jaCwgU2lnbmF0dXJlLCBSZXNldCwgU3Rhc2ggfSBmcm9tICdub2RlZ2l0J1xyXG5pbXBvcnQgKiBhcyBwcm92aXNpb24gZnJvbSAnQGRlcGVuZGVuY3kvZGVwbG95bWVudFByb3Zpc2lvbmluZydcclxuY29uc3QgZ2V0RGlyZWN0b3J5ID0gc291cmNlID0+IGZpbGVzeXN0ZW0ucmVhZGRpclN5bmMoc291cmNlLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSkuZmlsdGVyKGRpcmVudCA9PiBkaXJlbnQuaXNEaXJlY3RvcnkoKSlcclxuY29uc3QgZ2V0QWxsRGlyZW50ID0gc291cmNlID0+IGZpbGVzeXN0ZW0ucmVhZGRpclN5bmMoc291cmNlLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcclxuLyoqIEZpbHRlciBhcnJheSB3aXRoIGFzeW5jIGZ1bmN0aW9uXHJcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMzMzU1NTI4L2ZpbHRlcmluZy1hbi1hcnJheS13aXRoLWEtZnVuY3Rpb24tdGhhdC1yZXR1cm5zLWEtcHJvbWlzZVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZmlsdGVyQXN5bmMoYXJyLCBjYWxsYmFjaykge1xyXG4gIGNvbnN0IGZhaWwgPSBTeW1ib2woKVxyXG4gIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoYXJyLm1hcChhc3luYyBpdGVtID0+ICgoYXdhaXQgY2FsbGJhY2soaXRlbSkpID8gaXRlbSA6IGZhaWwpKSkpLmZpbHRlcihpID0+IGkgIT09IGZhaWwpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb2t1cENvbmZpZ0ZpbGUoeyB0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZSB9KSB7XHJcbiAgbGV0IGNvbmZpZ1Bvc3NpYmxlUGF0aCA9IFtwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsIGNvbmZpZ05hbWUpLCBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICdjb25maWd1cmF0aW9uJywgY29uZmlnTmFtZSldXHJcbiAgLy8gZmluZCBleGlzdGluZyBjb25maWcgZmlsZVxyXG4gIGxldCBjb25maWdQYXRoQXJyYXkgPSBjb25maWdQb3NzaWJsZVBhdGguZmlsdGVyKGNvbmZpZ1BhdGggPT4gZmlsZXN5c3RlbS5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKVxyXG4gIGFzc2VydChjb25maWdQYXRoQXJyYXkubGVuZ3RoID4gMCwgYOKAoiAke2NvbmZpZ05hbWV9IGxvb2t1cCBmYWlsZWQsIGZpbGUgbm90IGZvdW5kIGluIHRoZSBjb25maWd1cmF0aW9uIHBvc3NpYmxlIHBhdGhzIC0gJHtjb25maWdQb3NzaWJsZVBhdGh9LmApXHJcbiAgcmV0dXJuIGNvbmZpZ1BhdGhBcnJheVswXVxyXG59XHJcblxyXG4vLz8gVE9ETzogUmVsZWFzZXMgY291bGQgYmUgY3JlYXRlZCBmb3Igc291cmNlIGNvZGUgaW4gYWRkaXRpb24gdG8gZGlzdHJpYnV0aW9uIGNvZGUgcmVsZWFzZS5cclxuXHJcbi8qKlxyXG4gKiDil4sgUHVzaCBuZXcgdmVyc2lvbiB0byBnaXRodWIgdGFncy5cclxuICog4peLIENyZWF0ZSBhIG5ldyByZWxlYXNlIGZyb20gdGhlIHB1c2hlZCB0YWcuXHJcbiAqIFJlbGVhc2UgYSBuZXcgdGFnIGluIEdpdGh1YjpcclxuICogIDAuIHN0YXNoIGNoYW5nZXMgdGVtcG9yYXJpbHlcclxuICogIDEuIENyZWF0ZSBhIHRlbXBvcmFyeSBicmFuY2ggb3IgdXNlIGFuIGV4aXN0aW5nIGJyYW5jaCBhbmQgY2hlY2tvdXQgdG8gaXQuXHJcbiAqICAyLiBSZWJhc2Ugb3IgUmVzZXRpbmcgb250byBtYXN0ZXIgKGluIGNhc2UgdGhlIHRlbXBvcmFyeSBicmFuY2ggZXhpc3RzKSAtIHNpbWlsYXIgdG8gb3ZlcnJpZGluZyBicmFuY2ggaGlzdG9yeSB3aXRoIHRoZSBtYXN0ZXIgYnJhbmNoLlxyXG4gKiAgMy4gQnVpbGQgY29kZSBhbmQgY29tbWl0IHdpdGggYSBkaXN0cmlidXRpb24gbWVzc2FnZS5cclxuICogIDQuIENyZWF0ZSBhIHJlbGVhc2UvdGFnLlxyXG4gKiAgNS4gY2xlYW51cCBicmFuY2hlcy5cclxuICogIDYuIGdpdCBjaGVja291dCBtYXN0ZXJcclxuICogIDcuIHBvcCBsYXN0IHN0YXNoIGZpbGVzXHJcbiAqXHJcbiAqICBAc2llRWZmZWN0IC0gY3JlYXRlcyBhIHRhZyBhbmQgZGVsZXRlcyB0ZW1wb3JhcnkgYnJhbmNoLlxyXG4gKlxyXG4gKiBTaW1wbGUgZXhhbXBsZSBlcXVpdmFsZW50IHNoZWxsIHNjcmlwdDpcclxuICogYGBgZ2l0IGNoZWNrb3V0IGRpc3RyaWJ1dGlvbiAmJiBnaXQgcmViYXNlIC0tb250byBtYXN0ZXIgZGlzdHJpYnV0aW9uICYmIGVjaG8gXCJUZXN0IFBhZ2VcIiA+IG5ldy5qcyAmJiBnaXQgYWRkIC1BICYmIGdpdCBjb21taXQgLWEgLW0gJ2J1aWxkJyAmJiBnaXQgdGFnIHY1OyBnaXQgY2hlY2tvdXQgbWFzdGVyYGBgXHJcbiAqXHJcbiAqIGBub2RlZ2l0YCBkb2N1bWVudGF0aW9uOiBodHRwczovL3d3dy5ub2RlZ2l0Lm9yZy9hcGlcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2Uoe1xyXG4gIC8vICdicmFuY2hlZCByZWxlYXNlJyBpbiB0aGUgc2Vuc2Ugb2YgYSB0YWcgdGhhdCBwb2ludHMgdG8gYW4gYWRkaXRpb25hbCBidWlsZCBjb21taXQgb3RoZXIgdGhhbiB0aGUgbWFzdGVyIGNvbW1pdCBmb3IgZXhhbXBsZS5cclxuICBhcGksXHJcbiAgdGVtcG9yYXJ5QnJhbmNoTmFtZSA9ICdkaXN0cmlidXRpb24nLCAvLyBicmFuY2ggdXNlZCB0byBidWlsZCBzb3VyY2UgY29kZSBhbmQgY3JlYXRlIGEgZGlzdHJpYnV0aW9uIHRhZyBmcm9tXHJcbiAgYnJhY2hUb1BvaW50VG8gPSAnbWFzdGVyJywgLy8gZGVmYXVsdCBicmFuY2ggZm9yIGxhdGVzdCBjb21taXQuXHJcbiAgY29tbWl0VG9Qb2ludFRvID0gbnVsbCwgLy8gdW5yZWxhdGVkIGNvbW1pdCB0byBwb2ludCB0byB3aGlsZSBjcmVhdGluZyB0ZW1wb3JhcnkgYnJhbmNoXHJcbiAgdGFnTmFtZSxcclxuICBidWlsZENhbGxiYWNrLCAvLyBidWlsZCBhc3luYyBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIGJ1aWxkaW5nIHNvdXJjZSBjb2RlIGFuZCBwcmVwYXJpbmcgdGhlIHBhY2thZ2UgZm9yIGRpc3RyaWJ1dGlvbi5cclxuICB0YWdnZXIsXHJcbn06IHtcclxuICB0YWdnZXI6IHsgbmFtZTogJycsIGVtYWlsOiAnJyB9LFxyXG59KSB7XHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdCA9IGFwaS5wcm9qZWN0LFxyXG4gICAgdGFyZ2V0UHJvamVjdENvbmZpZyA9IHRhcmdldFByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLFxyXG4gICAgdGFyZ2V0UHJvamVjdFJvb3QgPSB0YXJnZXRQcm9qZWN0LmNvbmZpZ3VyYXRpb24ucm9vdFBhdGgsXHJcbiAgICB0YXJnZXRQcm9qZWN0R2l0VXJsID0gdGFyZ2V0UHJvamVjdC5jb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb24/LmJ1aWxkLnJlcG9zaXRvcnlVUkxcclxuXHJcbiAgLy8gcmVhZCBnaXQgcmVwb3NpdG9yeVxyXG4gIGNvbnNvbGUubG9nKGDigKIgT3Blbm5pbmcgcmVwb3NpdG9yeTogJHt0YXJnZXRQcm9qZWN0Um9vdH1gKVxyXG4gIGNvbnN0IHJlcG9zaXRvcnkgPSBhd2FpdCBnaXQuUmVwb3NpdG9yeS5vcGVuKHRhcmdldFByb2plY3RSb290KVxyXG4gIGJyYWNoVG9Qb2ludFRvID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgYnJhY2hUb1BvaW50VG8sIDEpIC8vIGNvbnZlcnQgdG8gYnJhbmNoIHJlZmVyZW5jZVxyXG5cclxuICAvLyBsb2FkIHRhZ2dlclNpZ25hdHVyZSBzaWduYXR1cmVcclxuICBsZXQgdGFnZ2VyU2lnbmF0dXJlID0gdGFnZ2VyID8gZ2l0LlNpZ25hdHVyZS5ub3codGFnZ2VyLm5hbWUsIHRhZ2dlci5lbWFpbCkgOiBhd2FpdCBnaXQuU2lnbmF0dXJlLmRlZmF1bHQocmVwb3NpdG9yeSlcclxuICBhc3NlcnQodGFnZ2VyU2lnbmF0dXJlLCBg4p2MIEdpdGh1YiB1c2VybmFtZSBzaG91bGQgYmUgcGFzc2VkIG9yIGZvdW5kIGluIHRoZSBnaXQgbG9jYWwvc3lzdGVtIGNvbmZpZ3MuYClcclxuXHJcbiAgLy8gZ2V0IGxhdGVzdCBjb21taXQgZnJvbSBicmFuY2hcclxuICBsZXQgZ2V0TGF0ZXN0Q29tbWl0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRSZWZlcmVuY2VDb21taXQoYnJhY2hUb1BvaW50VG8pXHJcbiAgY29uc29sZS5sb2coYOKAoiBHZXR0aW5nIGxhdGVzdCBjb21taXQ6ICR7Z2V0TGF0ZXN0Q29tbWl0fWApXHJcbiAgLy8gc2V0IGNvbW1pdCByZWZlcmVuY2VcclxuICBpZiAoY29tbWl0VG9Qb2ludFRvKSB7XHJcbiAgICBjb21taXRUb1BvaW50VG8gPSBhd2FpdCBnaXQuQ29tbWl0Lmxvb2t1cChyZXBvc2l0b3J5LCBjb21taXRUb1BvaW50VG8pIC8vIGdldCBjb21taXQgZnJvbSBzdXBwbGllZCBjb21taXQgaWQgcGFyYW1ldGVyXHJcbiAgfSBlbHNlIGNvbW1pdFRvUG9pbnRUbyA9IGdldExhdGVzdENvbW1pdFxyXG5cclxuICAvLyBnZXQgYWxsIGJyYW5jaGVzIHJlbW90ZSBhbmQgbG9jYWxcclxuICBsZXQgYnJhbmNoUmVmZXJlbmNlTGlzdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0UmVmZXJlbmNlcygpLnRoZW4ocmVmZXJlbmNlTGlzdCA9PiByZWZlcmVuY2VMaXN0LmZpbHRlcihyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnR5cGUoKSA9PSBnaXQuUmVmZXJlbmNlLlRZUEUuRElSRUNUKSlcclxuXHJcbiAgLy8gY2hlY2sgaWYgYHRlbXBvcmFyeUJyYW5jaE5hbWVgIGJyYW5jaCwgdGhhdCBpcyB1c2VkLCBleGlzdHMuXHJcbiAgY29uc29sZS5sb2coYOKAoiBDaGVja2luZy9DcmVhdGluZyB0ZW1wb3JhcnkgYnJhbmNoOiAke3RlbXBvcmFyeUJyYW5jaE5hbWV9YClcclxuICBsZXQgZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0ID0gYnJhbmNoUmVmZXJlbmNlTGlzdC5zb21lKGJyYW5jaCA9PiBicmFuY2gudG9TdHJpbmcoKS5pbmNsdWRlcyh0ZW1wb3JhcnlCcmFuY2hOYW1lKSlcclxuICBsZXQgdGVtcG9yYXJ5QnJhbmNoIC8vIEJyYW5jaCByZWZlcmVuY2VcclxuICBpZiAoIWRvZXNUZW1wb3JhcnlCcmFuY2hFeGlzdCkge1xyXG4gICAgLy8gY3JlYXRlIHRlbXBvcmFyeSBicmFuY2hcclxuICAgIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2guY3JlYXRlKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIGNvbW1pdFRvUG9pbnRUbywgMSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbiAgICBjb25zb2xlLmxvZyhg4oCiIENyZWF0ZWQgdGVtcG9yYXJ5IGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9IGZyb20gY29tbWl0ICR7Y29tbWl0VG9Qb2ludFRvLnNoYSgpfWApXHJcbiAgfSBlbHNlIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2gubG9va3VwKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIDEpXHJcblxyXG4gIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSB1bnRyYWNrZWQgb3Igc3RhZ2VkIGZpbGVzXHJcbiAgbGV0IHN0YXR1c2VMaXN0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRTdGF0dXMoKVxyXG4gIGlmIChzdGF0dXNlTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAvLyBzdGFzaCBjaGFuZ2VzIHRoYXQgYXJlIHN0aWxsIG5vdCBjb21taXR0ZWRcclxuICAgIGNvbnNvbGUubG9nKGDigKIgQ2hlY2tvdXQgc3Rhc2ggb2YgY2hhbmdlcyB1bnJlbGF0ZWQgdG8gcmVsZWFzZS5gKVxyXG4gICAgYXdhaXQgZ2l0LlN0YXNoLnNhdmUocmVwb3NpdG9yeSwgdGFnZ2VyU2lnbmF0dXJlLCAnY2hlY2tvdXQgc3Rhc2ggYmVmb3JlIHJlbGVhc2UnLCBnaXQuU3Rhc2guRkxBR1MuSU5DTFVERV9VTlRSQUNLRUQpXHJcbiAgfVxyXG5cclxuICAvLyBjaGVja291dCB0ZW1wb3JhcnlcclxuICBhd2FpdCByZXBvc2l0b3J5LmNoZWNrb3V0QnJhbmNoKGF3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCkpLnRoZW4oYXN5bmMgKCkgPT4gY29uc29sZS5sb2coYENoZWNrZWQgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX1gKSlcclxuXHJcbiAgLyoqIHJlc2V0IHRlbXBvcmFyeSBicmFuY2ggdG8gdGhlIGNvbW1pdCB0byBwb2ludCB0byAodGFyZ2V0Q29tbWl0KVxyXG4gICAqIE5PVEU6IEFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSByZWJhc2luZyB3aGVyZSBjdXJyZW50IGNvbW1pdHMgYXJlIHNhdmVkIC0gY2hlY2sgIGByZWJhc2luZ0V4YW1wbGUoKWAgZnVuY3Rpb25cclxuICAgKi9cclxuICBhd2FpdCBnaXQuUmVzZXQucmVzZXQocmVwb3NpdG9yeSwgY29tbWl0VG9Qb2ludFRvLCBnaXQuUmVzZXQuVFlQRS5IQVJEKVxyXG4gICAgLnRoZW4obnVtYmVyID0+IHtcclxuICAgICAgaWYgKG51bWJlcikgdGhyb3cgbmV3IEVycm9yKGDigKIgQ291bGQgbm90IHJlc2V0IHJlcG9zaXRvcnkgJHtyZXBvc2l0b3J5fSB0byBjb21taXQgJHtjb21taXRUb1BvaW50VG99YClcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcilcclxuXHJcbiAgLy8gcnVuIGJ1aWxkXHJcbiAgaWYgKGJ1aWxkQ2FsbGJhY2spIHtcclxuICAgIGNvbnNvbGUubG9nKGDigKIgQnVpbGRpbmcgcHJvamVjdC4uLmApXHJcbiAgICBhd2FpdCBidWlsZENhbGxiYWNrKClcclxuICAgICAgLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Byb2plY3QgYnVpbHQgc3VjY2Vzc2Z1bGx5ICEnKSlcclxuICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKVxyXG4gIH1cclxuXHJcbiAgLyoqIE1ha2UgZGlzdHJpYnV0aW9uIGZvbGRlciBhcyByb290IGRpcmVjdG9yeSBpbiB0aGUgYnJhbmNoICovXHJcbiAgLy8gZGVsZXRpbmcgLmdpdGlnbm9yZSB3aWxsIG1ha2UgaXQgZmFzdGVyLCBieSBwcmV2ZW50aW5nIG5vZGVfbW9kdWxlcyBmcm9tIGJlaW5nIHByb2Nlc3NlZCBieSB0b29scyB3aGlsZSBkZWxldGluZyBmaWxlcy5cclxuICBsZXQgZ2l0RXhjbHVkZVBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICcuLy5naXQvaW5mby9leGNsdWRlJyksXHJcbiAgICBnaXRJZ25vcmVQYXRoID0gbG9va3VwQ29uZmlnRmlsZSh7IHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lOiAnLmdpdGlnbm9yZScgfSlcclxuICBpZiAoZmlsZXN5c3RlbS5leGlzdHNTeW5jKGdpdEV4Y2x1ZGVQYXRoKSkgZmlsZXN5c3RlbS51bmxpbmtTeW5jKGdpdEV4Y2x1ZGVQYXRoKSAvLyByZW1vdmUgZmlsZVxyXG4gIHByb3Zpc2lvbi5jb3B5LmNvcHlGaWxlKFt7IHNvdXJjZTogZ2l0SWdub3JlUGF0aCwgZGVzdGluYXRpb246IGdpdEV4Y2x1ZGVQYXRoIH1dKSAvLyBjb3B5IC5naXRpZ25vcmUgdG8gYC5naXRgIGZvbGRlclxyXG5cclxuICAvLyBnZXQgdG9wIGRpcmVjdG9yaWVzIHRoYXQgYXJlIGlnbm9yZWRcclxuICBsZXQgZGlyZW50TGlzdCA9IGdldEFsbERpcmVudCh0YXJnZXRQcm9qZWN0Um9vdCkgLy8gZ2V0IGFsbCBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgb24gdG9wIGxldmVsXHJcblxyXG4gIC8vIFRPRE86IERlYWwgd2l0aCBzdWJkaXJlY3Rvcnkgbm9kZV9tb2R1bGVzIGFuZCBpZ25vcmVkIGZpbGVzLiBUaGUgaXNzdWVzIGlzIHRoYXQgdGhlIHdob2xlIHRvcGxldmVsIGRpcmVjdG9yeSBpcyByZW1vdmVkLlxyXG4gIC8vIC8vIGdldCBhbGwgMm5kIGxldmVsIGRpcmVjdG9yaWVzIC0gdGhpcyBhbGxvd3MgZm9yIHdvcmtzcGFjZXMgdG8ga2VlcCBub2RlX21vZHVsZXMgZm9sZGVyIGluIGEgc3ViZGlyZWN0b3J5LlxyXG4gIC8vIGZvciAobGV0IHRvcGxldmVsRGlyZW50IG9mIGRpcmVudExpc3QpIHtcclxuICAvLyAgIGxldCBzdWJEaXJlbnRMaXN0ID1cclxuICAvLyB9XHJcblxyXG4gIC8vIGNoZWNrIGlmIHBhdGggaXMgaWdub3JlZFxyXG4gIGxldCBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGF3YWl0IGZpbHRlckFzeW5jKGRpcmVudExpc3QsIGFzeW5jIGRpcmVudCA9PiAoYXdhaXQgZ2l0Lklnbm9yZS5wYXRoSXNJZ25vcmVkKHJlcG9zaXRvcnksIHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgZGlyZW50Lm5hbWUpKSkgfD4gQm9vbGVhbilcclxuICAvLyBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGlnbm9yZWREaXJlY3RvcnlMaXN0Lm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpIC8vIGdldCBhYnNvbHV0ZSBwYXRoc1xyXG4gIC8vIGdldCBkaXJlbnQgbGlzdCB0byBkZWxldGVcclxuICBsZXQgZGlyZW50VG9EZWxldGUgPSBkaXJlbnRMaXN0LmZpbHRlcihkaXJlbnQgPT4gIWlnbm9yZWREaXJlY3RvcnlMaXN0LmluY2x1ZGVzKGRpcmVudCkpIC8vIHJlbW92ZSBpZ25vcmVkIGRpcmVudHMgZnJvbSBkZWxldGUgbGlzdFxyXG4gIC8qKiBEZWxldGUgZGlyZW50IGxpc3QgdGhhdCBpbmNsdWRlcyBkaXJlY3RvcmllcyBhbmQgZmlsZXMgKi9cclxuICBsZXQgZGVsZXRlQWJzb2x1dGVQYXRoTGlzdCA9IGRpcmVudFRvRGVsZXRlLm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpXHJcbiAgZm9yIChsZXQgYWJzb2x1dGVQYXRoIG9mIGRlbGV0ZUFic29sdXRlUGF0aExpc3QpIHtcclxuICAgIGZpbGVzeXN0ZW1FeHRyYS5yZW1vdmVTeW5jKGFic29sdXRlUGF0aClcclxuICB9XHJcbiAgLy8gY29weSBkaXN0cmlidXRpb24gY29udGVudHMgdG8gcm9vdCBwcm9qZWN0IGxldmVsXHJcbiAgZmlsZXN5c3RlbUV4dHJhLmNvcHlTeW5jKHRhcmdldFByb2plY3RDb25maWcuZGlyZWN0b3J5LmRpc3RyaWJ1dGlvbiwgdGFyZ2V0UHJvamVjdFJvb3QpXHJcblxyXG4gIC8vIENyZWF0ZSBjb21taXQgb2YgYWxsIGZpbGVzLlxyXG4gIGxldCBpbmRleCA9IGF3YWl0IHJlcG9zaXRvcnkucmVmcmVzaEluZGV4KCkgLy8gaW52YWxpZGF0ZXMgYW5kIGdyYWJzIG5ldyBpbmRleCBmcm9tIHJlcG9zaXRvcnkuXHJcbiAgbGV0IHRyZWVPYmplY3QgPSBhd2FpdCBpbmRleFxyXG4gICAgLmFkZEFsbChbJyoqJ10pXHJcbiAgICAudGhlbigoKSA9PiBpbmRleC53cml0ZSgpKVxyXG4gICAgLnRoZW4oKCkgPT4gaW5kZXgud3JpdGVUcmVlKCkpIC8vIGFkZCBmaWxlcyBhbmQgY3JlYXRlIGEgdHJlZSBvYmplY3QuXHJcbiAgbGV0IHBhcmVudENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgcmVwb3NpdG9yeVxyXG4gICAgLmNyZWF0ZUNvbW1pdChcclxuICAgICAgJ0hFQUQnIC8qIHVwZGF0ZSB0aGUgSEVBRCByZWZlcmVuY2UgLSBzbyB0aGF0IHRoZSBIRUFEIHdpbGwgcG9pbnQgdG8gdGhlIGxhdGVzdCBnaXQgKi8gfHwgbnVsbCAvKiBkbyBub3QgdXBkYXRlIHJlZiAqLyxcclxuICAgICAgdGFnZ2VyU2lnbmF0dXJlLFxyXG4gICAgICB0YWdnZXJTaWduYXR1cmUsXHJcbiAgICAgIGDwn4+X77iPIEJ1aWxkIGRpc3RyaWJ1dGlvbiBjb2RlLmAsXHJcbiAgICAgIHRyZWVPYmplY3QsXHJcbiAgICAgIFtwYXJlbnRDb21taXRdLFxyXG4gICAgKVxyXG4gICAgLnRoZW4ob2lkID0+IGNvbnNvbGUubG9nKGDigKIgQ29tbWl0IGNyZWF0ZWQgJHtvaWR9IGZvciBkaXN0cmlidXRpb24gY29kZWApKVxyXG5cclxuICAvLyB0YWcgYW5kIGNyZWF0ZSBhIHJlbGVhc2UuXHJcbiAgbGV0IGxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgZ2l0LlRhZy5jcmVhdGUocmVwb3NpdG9yeSwgdGFnTmFtZSwgbGF0ZXN0VGVtcG9yYXJ5QnJhbmNoQ29tbWl0LCB0YWdnZXJTaWduYXR1cmUsIGBSZWxlYXNlIG9mIGRpc3RyaWJ1dGlvbiBjb2RlIG9ubHkuYCwgMCkudGhlbihvaWQgPT4gY29uc29sZS5sb2coYOKAoiBUYWcgY3JlYXRlZCAke29pZH1gKSlcclxuXHJcbiAgLy8gbWFrZSBzdXJlIHRoZSBicmFuY2ggaXMgY2hlY2tlZG91dC5cclxuICBhd2FpdCByZXBvc2l0b3J5LmNoZWNrb3V0QnJhbmNoKGJyYWNoVG9Qb2ludFRvKS50aGVuKGFzeW5jICgpID0+IGNvbnNvbGUubG9nKGBDaGVja2VkIGJyYW5jaCAke2F3YWl0IGJyYWNoVG9Qb2ludFRvLm5hbWUoKX1gKSkgLy8gY2hlY2tvdXQgZm9ybWVyIGJyYW5jaCAodXN1YWxseSBtYXN0ZXIgYnJhbmNoKVxyXG5cclxuICAvLyBhcHBseSB0ZW1wb3Jhcmx5IHN0YXNoZWQgZmlsZXNcclxuICBpZiAoc3RhdHVzZUxpc3QubGVuZ3RoID4gMCkgYXdhaXQgZ2l0LlN0YXNoLnBvcChyZXBvc2l0b3J5LCAwIC8qKiBsYXN0IHN0YWNoZWQgcG9zaXRpb24gKi8pXHJcbn1cclxuXHJcbi8qKiByZWJhc2UgaW50byBtYXN0ZXIgYnJhbmNoIHRvIGZvbGxvdyB0aGUgbGF0ZXN0IG1hc3RlciBjb21taXQuIFRPRE86IHRoaXMgaXMgYW4gZXhhbXBsZSAtIGZpeCBhc3luYyBvcGVyYXRpb24uXHJcbiAqICBUaGlzIGlzIGFuIG9wdGlvbiBmb3IgcmViYXNpbmcgYSB0ZW1wb3JhcnkgYnJhbmNoIHRvIHRoZSBsYXRlc3QgY29tbWl0IChvciBhIG5ld2VyIGNvbW1pdCkuIEFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSBgcmVzZXRgIHRvIGEgZGlmZmVyZW50IGNvbW1pdC5cclxuICovXHJcbmZ1bmN0aW9uIHJlYmFzaW5nRXhhbXBsZSh7IHJlcG9zaXRvcnksIGJyYW5jaCwgZnJvbUJyYW5jaCwgdG9CcmFuY2ggfSkge1xyXG4gIHJldHVybiByZXBvc2l0b3J5LnJlYmFzZUJyYW5jaGVzKFxyXG4gICAgYnJhbmNoLm5hbWUoKSwgLy8gYnJhbmNoIGNvbW1pdHMgdG8gbW92ZVxyXG4gICAgZnJvbUJyYW5jaC5uYW1lKCksIC8vIHRpbGwgY29tbWl0cyB0aGF0IGFyZSBpbnRlcnNlY3RlZCB3aXRoIHRoaXMgYnJhbmNoIChvbGQgYnJhbmNoKVxyXG4gICAgdG9CcmFuY2gubmFtZSgpLCAvLyBvbnRvIHRoZSBuZXcgYnJhbmNoLlxyXG4gICAgZ2l0LlNpZ25hdHVyZS5ub3coJ21lb3cnLCAndGVzdEBleGFtcGxlLmNvbScpLFxyXG4gICAgcmViYXNlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ09uZSBvcGVyYXRpb24nKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgICByZWJhc2VNZXRhZGF0YSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCByZWJhc2UnKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgKVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUZW1wb3JhcnlCcmFuY2goeyByZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2ggfSkge1xyXG4gIC8vIGRlbGV0ZSB0ZW1wb3JhcnkgYnJhbmNoXHJcbiAgdHJ5IHtcclxuICAgIGlmIChnaXQuQnJhbmNoLmlzQ2hlY2tlZE91dCh0ZW1wb3JhcnlCcmFuY2gpKSB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBkZWxldGUgYSBjaGVja2VkIG91dCBicmFuY2ggJHthd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpfS5gKVxyXG4gICAgLy8gQnkgcmVhc3NpZ25pbmcgdGhlIHZhcmlhYmxlIGFuZCBsb29raW5nIHVwIHRoZSBicmFuY2ggdGhlIGdhcmJhZ2UgY29sbGVjdG9yIHdpbGwga2ljayBpbi4gVGhlIHJlZmVyZW5jZSBmb3IgdGhlIGJyYW5jaCBpbiBsaWJnaXQyIHNob3VsZG4ndCBiZSBpbiBtZW1vcnkgYXMgbWVudGlvbmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9saWJnaXQyL2xpYmdpdDIvYmxvYi84NTlkOTIyOTJlMDA4YTRkMDRkNjhmYjZkYzIwYTFkZmE2OGU0ODc0L2luY2x1ZGUvZ2l0Mi9yZWZzLmgjTDM4NS1MMzk4XHJcbiAgICB0ZW1wb3JhcnlCcmFuY2ggPSBhd2FpdCBnaXQuQnJhbmNoLmxvb2t1cChyZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2hOYW1lLCAxKSAvLyByZWZlcmVzaCB2YWx1ZSBvZiB0ZW1wb3JhcnlCcmFuY2ggLSBmb3Igc29tZSByZWFzb24gdXNpbmcgdGhlIHNhbWUgcmVmZXJlbmNlIHByZXZlbnRzIGRlbGV0aW9uIG9mIGJyYW5jaC5cclxuICAgIGxldCBlcnJvciA9IGdpdC5CcmFuY2guZGVsZXRlKHRlbXBvcmFyeUJyYW5jaClcclxuICAgIGlmIChlcnJvcikgdGhyb3cgbmV3IEVycm9yKGBDb2RlIHRocm93biBieSAnbGliZ2l0MicgYmluZGluZ3MgPSAke2Vycm9yfVxcbiBcXHRDaGVjayBodHRwczovL3d3dy5ub2RlZ2l0Lm9yZy9hcGkvZXJyb3IvI0NPREVgKVxyXG4gICAgY29uc29sZS5sb2coYOKAoiBEZWxldGVkIHRlbXBvYXJhcnkgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0uYClcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgZXJyb3JcclxuICB9XHJcbn1cclxuIl19