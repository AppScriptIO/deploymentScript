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



  let gitExcludePath = _path.default.join(targetProjectRoot, './.git/info/exclude'),
  gitIgnorePath = lookupConfigFile({ targetProjectRoot, configName: '.gitignore' });
  if (_fs.default.existsSync(gitExcludePath)) _fs.default.unlinkSync(gitExcludePath);
  provision.copy.copyFile([{ source: gitIgnorePath, destination: gitExcludePath }]);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcmVsZWFzZS9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXREaXJlY3RvcnkiLCJzb3VyY2UiLCJmaWxlc3lzdGVtIiwicmVhZGRpclN5bmMiLCJ3aXRoRmlsZVR5cGVzIiwiZmlsdGVyIiwiZGlyZW50IiwiaXNEaXJlY3RvcnkiLCJnZXRBbGxEaXJlbnQiLCJmaWx0ZXJBc3luYyIsImFyciIsImNhbGxiYWNrIiwiZmFpbCIsIlN5bWJvbCIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJpdGVtIiwiaSIsImxvb2t1cENvbmZpZ0ZpbGUiLCJ0YXJnZXRQcm9qZWN0Um9vdCIsImNvbmZpZ05hbWUiLCJjb25maWdQb3NzaWJsZVBhdGgiLCJwYXRoIiwiam9pbiIsImNvbmZpZ1BhdGhBcnJheSIsImNvbmZpZ1BhdGgiLCJleGlzdHNTeW5jIiwibGVuZ3RoIiwiY3JlYXRlR2l0aHViQnJhbmNoZWRSZWxlYXNlIiwiYXBpIiwidGVtcG9yYXJ5QnJhbmNoTmFtZSIsImJyYWNoVG9Qb2ludFRvIiwiY29tbWl0VG9Qb2ludFRvIiwidGFnTmFtZSIsImJ1aWxkQ2FsbGJhY2siLCJ0YWdnZXIiLCJ0YXJnZXRQcm9qZWN0IiwicHJvamVjdCIsInRhcmdldFByb2plY3RDb25maWciLCJjb25maWd1cmF0aW9uIiwicm9vdFBhdGgiLCJ0YXJnZXRQcm9qZWN0R2l0VXJsIiwiYnVpbGQiLCJyZXBvc2l0b3J5VVJMIiwiZ2l0RXhjbHVkZVBhdGgiLCJnaXRJZ25vcmVQYXRoIiwidW5saW5rU3luYyIsInByb3Zpc2lvbiIsImNvcHkiLCJjb3B5RmlsZSIsImRlc3RpbmF0aW9uIiwiY29uc29sZSIsImxvZyIsInJlcG9zaXRvcnkiLCJnaXQiLCJSZXBvc2l0b3J5Iiwib3BlbiIsIkJyYW5jaCIsImxvb2t1cCIsInRhZ2dlclNpZ25hdHVyZSIsIlNpZ25hdHVyZSIsIm5vdyIsIm5hbWUiLCJlbWFpbCIsImRlZmF1bHQiLCJnZXRMYXRlc3RDb21taXQiLCJnZXRSZWZlcmVuY2VDb21taXQiLCJDb21taXQiLCJicmFuY2hSZWZlcmVuY2VMaXN0IiwiZ2V0UmVmZXJlbmNlcyIsInRoZW4iLCJyZWZlcmVuY2VMaXN0IiwicmVmZXJlbmNlIiwidHlwZSIsIlJlZmVyZW5jZSIsIlRZUEUiLCJESVJFQ1QiLCJkb2VzVGVtcG9yYXJ5QnJhbmNoRXhpc3QiLCJzb21lIiwiYnJhbmNoIiwidG9TdHJpbmciLCJpbmNsdWRlcyIsInRlbXBvcmFyeUJyYW5jaCIsImNyZWF0ZSIsImNhdGNoIiwiZXJyb3IiLCJzaGEiLCJzdGF0dXNlTGlzdCIsImdldFN0YXR1cyIsIlN0YXNoIiwic2F2ZSIsIkZMQUdTIiwiSU5DTFVERV9VTlRSQUNLRUQiLCJjaGVja291dEJyYW5jaCIsIlJlc2V0IiwicmVzZXQiLCJIQVJEIiwibnVtYmVyIiwiRXJyb3IiLCJkaXJlbnRMaXN0IiwiaWdub3JlZERpcmVjdG9yeUxpc3QiLCJJZ25vcmUiLCJwYXRoSXNJZ25vcmVkIiwiQm9vbGVhbiIsImRpcmVudFRvRGVsZXRlIiwiZGVsZXRlQWJzb2x1dGVQYXRoTGlzdCIsImFic29sdXRlUGF0aCIsImZpbGVzeXN0ZW1FeHRyYSIsInJlbW92ZVN5bmMiLCJjb3B5U3luYyIsImRpcmVjdG9yeSIsImRpc3RyaWJ1dGlvbiIsImluZGV4IiwicmVmcmVzaEluZGV4IiwidHJlZU9iamVjdCIsImFkZEFsbCIsIndyaXRlIiwid3JpdGVUcmVlIiwicGFyZW50Q29tbWl0IiwiZ2V0SGVhZENvbW1pdCIsImNyZWF0ZUNvbW1pdCIsIm9pZCIsImxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCIsIlRhZyIsInBvcCIsInJlYmFzaW5nRXhhbXBsZSIsImZyb21CcmFuY2giLCJ0b0JyYW5jaCIsInJlYmFzZUJyYW5jaGVzIiwicmViYXNlIiwicmVzb2x2ZSIsInJlYmFzZU1ldGFkYXRhIiwiZGVsZXRlVGVtcG9yYXJ5QnJhbmNoIiwiaXNDaGVja2VkT3V0IiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoieVRB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T0FBUixFQUFQO0FBQ0QsR0FSSTtBQVNMQyxFQUFBQSxjQUFjLElBQUk7QUFDaEJoRixJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWjtBQUNBLFdBQU92QyxPQUFPLENBQUNxSCxPQUFSLEVBQVA7QUFDRCxHQVpJLENBQVA7O0FBY0Q7O0FBRUQsZUFBZUUscUJBQWYsQ0FBcUMsRUFBRS9FLFVBQUYsRUFBYzZCLGVBQWQsRUFBckMsRUFBc0U7O0FBRXBFLE1BQUk7QUFDRixRQUFJNUIsaUJBQUlHLE1BQUosQ0FBVzRFLFlBQVgsQ0FBd0JuRCxlQUF4QixDQUFKLEVBQThDLE1BQU0sSUFBSWdCLEtBQUosQ0FBVyxzQ0FBcUMsTUFBTWhCLGVBQWUsQ0FBQ3BCLElBQWhCLEVBQXVCLEdBQTdFLENBQU47O0FBRTlDb0IsSUFBQUEsZUFBZSxHQUFHLE1BQU01QixpQkFBSUcsTUFBSixDQUFXQyxNQUFYLENBQWtCTCxVQUFsQixFQUE4QnZCLG1CQUE5QixFQUFtRCxDQUFuRCxDQUF4QjtBQUNBLFFBQUl1RCxLQUFLLEdBQUcvQixpQkFBSUcsTUFBSixDQUFXNkUsTUFBWCxDQUFrQnBELGVBQWxCLENBQVo7QUFDQSxRQUFJRyxLQUFKLEVBQVcsTUFBTSxJQUFJYSxLQUFKLENBQVcsdUNBQXNDYixLQUFNLG9EQUF2RCxDQUFOO0FBQ1hsQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSwrQkFBOEIsTUFBTThCLGVBQWUsQ0FBQ3BCLElBQWhCLEVBQXVCLEdBQXhFO0FBQ0QsR0FQRCxDQU9FLE9BQU91QixLQUFQLEVBQWM7QUFDZCxVQUFNQSxLQUFOO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaWxlc3lzdGVtIGZyb20gJ2ZzJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCdcclxuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5pbXBvcnQgZmlsZXN5c3RlbUV4dHJhIGZyb20gJ2ZzLWV4dHJhJ1xyXG5pbXBvcnQgeyBkZWZhdWx0IGFzIGdpdCwgQ29tbWl0LCBSZXBvc2l0b3J5LCBSZWZlcmVuY2UsIEJyYW5jaCwgU2lnbmF0dXJlLCBSZXNldCwgU3Rhc2ggfSBmcm9tICdub2RlZ2l0J1xyXG5pbXBvcnQgKiBhcyBwcm92aXNpb24gZnJvbSAnQGRlcGVuZGVuY3kvZGVwbG95bWVudFByb3Zpc2lvbmluZydcclxuY29uc3QgZ2V0RGlyZWN0b3J5ID0gc291cmNlID0+IGZpbGVzeXN0ZW0ucmVhZGRpclN5bmMoc291cmNlLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSkuZmlsdGVyKGRpcmVudCA9PiBkaXJlbnQuaXNEaXJlY3RvcnkoKSlcclxuY29uc3QgZ2V0QWxsRGlyZW50ID0gc291cmNlID0+IGZpbGVzeXN0ZW0ucmVhZGRpclN5bmMoc291cmNlLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcclxuLyoqIEZpbHRlciBhcnJheSB3aXRoIGFzeW5jIGZ1bmN0aW9uXHJcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMzMzU1NTI4L2ZpbHRlcmluZy1hbi1hcnJheS13aXRoLWEtZnVuY3Rpb24tdGhhdC1yZXR1cm5zLWEtcHJvbWlzZVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZmlsdGVyQXN5bmMoYXJyLCBjYWxsYmFjaykge1xyXG4gIGNvbnN0IGZhaWwgPSBTeW1ib2woKVxyXG4gIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoYXJyLm1hcChhc3luYyBpdGVtID0+ICgoYXdhaXQgY2FsbGJhY2soaXRlbSkpID8gaXRlbSA6IGZhaWwpKSkpLmZpbHRlcihpID0+IGkgIT09IGZhaWwpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb2t1cENvbmZpZ0ZpbGUoeyB0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZSB9KSB7XHJcbiAgbGV0IGNvbmZpZ1Bvc3NpYmxlUGF0aCA9IFtwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsIGNvbmZpZ05hbWUpLCBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICdjb25maWd1cmF0aW9uJywgY29uZmlnTmFtZSldXHJcbiAgLy8gZmluZCBleGlzdGluZyBjb25maWcgZmlsZVxyXG4gIGxldCBjb25maWdQYXRoQXJyYXkgPSBjb25maWdQb3NzaWJsZVBhdGguZmlsdGVyKGNvbmZpZ1BhdGggPT4gZmlsZXN5c3RlbS5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKVxyXG4gIGFzc2VydChjb25maWdQYXRoQXJyYXkubGVuZ3RoID4gMCwgYOKAoiAke2NvbmZpZ05hbWV9IGxvb2t1cCBmYWlsZWQsIGZpbGUgbm90IGZvdW5kIGluIHRoZSBjb25maWd1cmF0aW9uIHBvc3NpYmxlIHBhdGhzIC0gJHtjb25maWdQb3NzaWJsZVBhdGh9LmApXHJcbiAgcmV0dXJuIGNvbmZpZ1BhdGhBcnJheVswXVxyXG59XHJcblxyXG4vLz8gVE9ETzogUmVsZWFzZXMgY291bGQgYmUgY3JlYXRlZCBmb3Igc291cmNlIGNvZGUgaW4gYWRkaXRpb24gdG8gZGlzdHJpYnV0aW9uIGNvZGUgcmVsZWFzZS5cclxuXHJcbi8qKlxyXG4gKiDil4sgUHVzaCBuZXcgdmVyc2lvbiB0byBnaXRodWIgdGFncy5cclxuICog4peLIENyZWF0ZSBhIG5ldyByZWxlYXNlIGZyb20gdGhlIHB1c2hlZCB0YWcuXHJcbiAqIFJlbGVhc2UgYSBuZXcgdGFnIGluIEdpdGh1YjpcclxuICogIDAuIHN0YXNoIGNoYW5nZXMgdGVtcG9yYXJpbHlcclxuICogIDEuIENyZWF0ZSBhIHRlbXBvcmFyeSBicmFuY2ggb3IgdXNlIGFuIGV4aXN0aW5nIGJyYW5jaCBhbmQgY2hlY2tvdXQgdG8gaXQuXHJcbiAqICAyLiBSZWJhc2Ugb3IgUmVzZXRpbmcgb250byBtYXN0ZXIgKGluIGNhc2UgdGhlIHRlbXBvcmFyeSBicmFuY2ggZXhpc3RzKSAtIHNpbWlsYXIgdG8gb3ZlcnJpZGluZyBicmFuY2ggaGlzdG9yeSB3aXRoIHRoZSBtYXN0ZXIgYnJhbmNoLlxyXG4gKiAgMy4gQnVpbGQgY29kZSBhbmQgY29tbWl0IHdpdGggYSBkaXN0cmlidXRpb24gbWVzc2FnZS5cclxuICogIDQuIENyZWF0ZSBhIHJlbGVhc2UvdGFnLlxyXG4gKiAgNS4gY2xlYW51cCBicmFuY2hlcy5cclxuICogIDYuIGdpdCBjaGVja291dCBtYXN0ZXJcclxuICogIDcuIHBvcCBsYXN0IHN0YXNoIGZpbGVzXHJcbiAqXHJcbiAqICBAc2llRWZmZWN0IC0gY3JlYXRlcyBhIHRhZyBhbmQgZGVsZXRlcyB0ZW1wb3JhcnkgYnJhbmNoLlxyXG4gKlxyXG4gKiBTaW1wbGUgZXhhbXBsZSBlcXVpdmFsZW50IHNoZWxsIHNjcmlwdDpcclxuICogYGBgZ2l0IGNoZWNrb3V0IGRpc3RyaWJ1dGlvbiAmJiBnaXQgcmViYXNlIC0tb250byBtYXN0ZXIgZGlzdHJpYnV0aW9uICYmIGVjaG8gXCJUZXN0IFBhZ2VcIiA+IG5ldy5qcyAmJiBnaXQgYWRkIC1BICYmIGdpdCBjb21taXQgLWEgLW0gJ2J1aWxkJyAmJiBnaXQgdGFnIHY1OyBnaXQgY2hlY2tvdXQgbWFzdGVyYGBgXHJcbiAqXHJcbiAqIGBub2RlZ2l0YCBkb2N1bWVudGF0aW9uOiBodHRwczovL3d3dy5ub2RlZ2l0Lm9yZy9hcGlcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2Uoe1xyXG4gIC8vICdicmFuY2hlZCByZWxlYXNlJyBpbiB0aGUgc2Vuc2Ugb2YgYSB0YWcgdGhhdCBwb2ludHMgdG8gYW4gYWRkaXRpb25hbCBidWlsZCBjb21taXQgb3RoZXIgdGhhbiB0aGUgbWFzdGVyIGNvbW1pdCBmb3IgZXhhbXBsZS5cclxuICBhcGksXHJcbiAgdGVtcG9yYXJ5QnJhbmNoTmFtZSA9ICdkaXN0cmlidXRpb24nLCAvLyBicmFuY2ggdXNlZCB0byBidWlsZCBzb3VyY2UgY29kZSBhbmQgY3JlYXRlIGEgZGlzdHJpYnV0aW9uIHRhZyBmcm9tXHJcbiAgYnJhY2hUb1BvaW50VG8gPSAnbWFzdGVyJywgLy8gZGVmYXVsdCBicmFuY2ggZm9yIGxhdGVzdCBjb21taXQuXHJcbiAgY29tbWl0VG9Qb2ludFRvID0gbnVsbCwgLy8gdW5yZWxhdGVkIGNvbW1pdCB0byBwb2ludCB0byB3aGlsZSBjcmVhdGluZyB0ZW1wb3JhcnkgYnJhbmNoXHJcbiAgdGFnTmFtZSxcclxuICBidWlsZENhbGxiYWNrLCAvLyBidWlsZCBhc3luYyBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIGJ1aWxkaW5nIHNvdXJjZSBjb2RlIGFuZCBwcmVwYXJpbmcgdGhlIHBhY2thZ2UgZm9yIGRpc3RyaWJ1dGlvbi5cclxuICB0YWdnZXIsXHJcbn06IHtcclxuICB0YWdnZXI6IHsgbmFtZTogJycsIGVtYWlsOiAnJyB9LFxyXG59KSB7XHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdCA9IGFwaS5wcm9qZWN0LFxyXG4gICAgdGFyZ2V0UHJvamVjdENvbmZpZyA9IHRhcmdldFByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLFxyXG4gICAgdGFyZ2V0UHJvamVjdFJvb3QgPSB0YXJnZXRQcm9qZWN0LmNvbmZpZ3VyYXRpb24ucm9vdFBhdGgsXHJcbiAgICB0YXJnZXRQcm9qZWN0R2l0VXJsID0gdGFyZ2V0UHJvamVjdC5jb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb24/LmJ1aWxkLnJlcG9zaXRvcnlVUkxcclxuXHJcbiAgLyoqIE1ha2UgZGlzdHJpYnV0aW9uIGZvbGRlciBhcyByb290IGRpcmVjdG9yeSBpbiB0aGUgYnJhbmNoICovXHJcbiAgLy8gZGVsZXRpbmcgLmdpdGlnbm9yZSB3aWxsIG1ha2UgaXQgZmFzdGVyLCBieSBwcmV2ZW50aW5nIG5vZGVfbW9kdWxlcyBmcm9tIGJlaW5nIHByb2Nlc3NlZCBieSB0b29scyB3aGlsZSBkZWxldGluZyBmaWxlcy5cclxuICBsZXQgZ2l0RXhjbHVkZVBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICcuLy5naXQvaW5mby9leGNsdWRlJyksXHJcbiAgICBnaXRJZ25vcmVQYXRoID0gbG9va3VwQ29uZmlnRmlsZSh7IHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lOiAnLmdpdGlnbm9yZScgfSlcclxuICBpZiAoZmlsZXN5c3RlbS5leGlzdHNTeW5jKGdpdEV4Y2x1ZGVQYXRoKSkgZmlsZXN5c3RlbS51bmxpbmtTeW5jKGdpdEV4Y2x1ZGVQYXRoKSAvLyByZW1vdmUgZmlsZVxyXG4gIHByb3Zpc2lvbi5jb3B5LmNvcHlGaWxlKFt7IHNvdXJjZTogZ2l0SWdub3JlUGF0aCwgZGVzdGluYXRpb246IGdpdEV4Y2x1ZGVQYXRoIH1dKSAvLyBjb3B5IC5naXRpZ25vcmUgdG8gYC5naXRgIGZvbGRlclxyXG5cclxuICAvLyByZWFkIGdpdCByZXBvc2l0b3J5XHJcbiAgY29uc29sZS5sb2coYOKAoiBPcGVubmluZyByZXBvc2l0b3J5OiAke3RhcmdldFByb2plY3RSb290fWApXHJcbiAgY29uc3QgcmVwb3NpdG9yeSA9IGF3YWl0IGdpdC5SZXBvc2l0b3J5Lm9wZW4odGFyZ2V0UHJvamVjdFJvb3QpXHJcbiAgYnJhY2hUb1BvaW50VG8gPSBhd2FpdCBnaXQuQnJhbmNoLmxvb2t1cChyZXBvc2l0b3J5LCBicmFjaFRvUG9pbnRUbywgMSkgLy8gY29udmVydCB0byBicmFuY2ggcmVmZXJlbmNlXHJcblxyXG4gIC8vIGxvYWQgdGFnZ2VyU2lnbmF0dXJlIHNpZ25hdHVyZVxyXG4gIGxldCB0YWdnZXJTaWduYXR1cmUgPSB0YWdnZXIgPyBnaXQuU2lnbmF0dXJlLm5vdyh0YWdnZXIubmFtZSwgdGFnZ2VyLmVtYWlsKSA6IGF3YWl0IGdpdC5TaWduYXR1cmUuZGVmYXVsdChyZXBvc2l0b3J5KVxyXG4gIGFzc2VydCh0YWdnZXJTaWduYXR1cmUsIGDinYwgR2l0aHViIHVzZXJuYW1lIHNob3VsZCBiZSBwYXNzZWQgb3IgZm91bmQgaW4gdGhlIGdpdCBsb2NhbC9zeXN0ZW0gY29uZmlncy5gKVxyXG5cclxuICAvLyBnZXQgbGF0ZXN0IGNvbW1pdCBmcm9tIGJyYW5jaFxyXG4gIGxldCBnZXRMYXRlc3RDb21taXQgPSBhd2FpdCByZXBvc2l0b3J5LmdldFJlZmVyZW5jZUNvbW1pdChicmFjaFRvUG9pbnRUbylcclxuICBjb25zb2xlLmxvZyhg4oCiIEdldHRpbmcgbGF0ZXN0IGNvbW1pdDogJHtnZXRMYXRlc3RDb21taXR9YClcclxuICAvLyBzZXQgY29tbWl0IHJlZmVyZW5jZVxyXG4gIGlmIChjb21taXRUb1BvaW50VG8pIHtcclxuICAgIGNvbW1pdFRvUG9pbnRUbyA9IGF3YWl0IGdpdC5Db21taXQubG9va3VwKHJlcG9zaXRvcnksIGNvbW1pdFRvUG9pbnRUbykgLy8gZ2V0IGNvbW1pdCBmcm9tIHN1cHBsaWVkIGNvbW1pdCBpZCBwYXJhbWV0ZXJcclxuICB9IGVsc2UgY29tbWl0VG9Qb2ludFRvID0gZ2V0TGF0ZXN0Q29tbWl0XHJcblxyXG4gIC8vIGdldCBhbGwgYnJhbmNoZXMgcmVtb3RlIGFuZCBsb2NhbFxyXG4gIGxldCBicmFuY2hSZWZlcmVuY2VMaXN0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRSZWZlcmVuY2VzKCkudGhlbihyZWZlcmVuY2VMaXN0ID0+IHJlZmVyZW5jZUxpc3QuZmlsdGVyKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UudHlwZSgpID09IGdpdC5SZWZlcmVuY2UuVFlQRS5ESVJFQ1QpKVxyXG5cclxuICAvLyBjaGVjayBpZiBgdGVtcG9yYXJ5QnJhbmNoTmFtZWAgYnJhbmNoLCB0aGF0IGlzIHVzZWQsIGV4aXN0cy5cclxuICBjb25zb2xlLmxvZyhg4oCiIENoZWNraW5nL0NyZWF0aW5nIHRlbXBvcmFyeSBicmFuY2g6ICR7dGVtcG9yYXJ5QnJhbmNoTmFtZX1gKVxyXG4gIGxldCBkb2VzVGVtcG9yYXJ5QnJhbmNoRXhpc3QgPSBicmFuY2hSZWZlcmVuY2VMaXN0LnNvbWUoYnJhbmNoID0+IGJyYW5jaC50b1N0cmluZygpLmluY2x1ZGVzKHRlbXBvcmFyeUJyYW5jaE5hbWUpKVxyXG4gIGxldCB0ZW1wb3JhcnlCcmFuY2ggLy8gQnJhbmNoIHJlZmVyZW5jZVxyXG4gIGlmICghZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0KSB7XHJcbiAgICAvLyBjcmVhdGUgdGVtcG9yYXJ5IGJyYW5jaFxyXG4gICAgdGVtcG9yYXJ5QnJhbmNoID0gYXdhaXQgZ2l0LkJyYW5jaC5jcmVhdGUocmVwb3NpdG9yeSwgdGVtcG9yYXJ5QnJhbmNoTmFtZSwgY29tbWl0VG9Qb2ludFRvLCAxKS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSlcclxuICAgIGNvbnNvbGUubG9nKGDigKIgQ3JlYXRlZCB0ZW1wb3JhcnkgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0gZnJvbSBjb21taXQgJHtjb21taXRUb1BvaW50VG8uc2hhKCl9YClcclxuICB9IGVsc2UgdGVtcG9yYXJ5QnJhbmNoID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgdGVtcG9yYXJ5QnJhbmNoTmFtZSwgMSlcclxuXHJcbiAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIHVudHJhY2tlZCBvciBzdGFnZWQgZmlsZXNcclxuICBsZXQgc3RhdHVzZUxpc3QgPSBhd2FpdCByZXBvc2l0b3J5LmdldFN0YXR1cygpXHJcbiAgaWYgKHN0YXR1c2VMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgIC8vIHN0YXNoIGNoYW5nZXMgdGhhdCBhcmUgc3RpbGwgbm90IGNvbW1pdHRlZFxyXG4gICAgY29uc29sZS5sb2coYOKAoiBDaGVja291dCBzdGFzaCBvZiBjaGFuZ2VzIHVucmVsYXRlZCB0byByZWxlYXNlLmApXHJcbiAgICBhd2FpdCBnaXQuU3Rhc2guc2F2ZShyZXBvc2l0b3J5LCB0YWdnZXJTaWduYXR1cmUsICdjaGVja291dCBzdGFzaCBiZWZvcmUgcmVsZWFzZScsIGdpdC5TdGFzaC5GTEFHUy5JTkNMVURFX1VOVFJBQ0tFRClcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrb3V0IHRlbXBvcmFyeVxyXG4gIGF3YWl0IHJlcG9zaXRvcnkuY2hlY2tvdXRCcmFuY2goYXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKSkudGhlbihhc3luYyAoKSA9PiBjb25zb2xlLmxvZyhgQ2hlY2tlZCBicmFuY2ggJHthd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpfWApKVxyXG5cclxuICAvKiogcmVzZXQgdGVtcG9yYXJ5IGJyYW5jaCB0byB0aGUgY29tbWl0IHRvIHBvaW50IHRvICh0YXJnZXRDb21taXQpXHJcbiAgICogTk9URTogQW5vdGhlciBvcHRpb24gaXMgdG8gdXNlIHJlYmFzaW5nIHdoZXJlIGN1cnJlbnQgY29tbWl0cyBhcmUgc2F2ZWQgLSBjaGVjayAgYHJlYmFzaW5nRXhhbXBsZSgpYCBmdW5jdGlvblxyXG4gICAqL1xyXG4gIGF3YWl0IGdpdC5SZXNldC5yZXNldChyZXBvc2l0b3J5LCBjb21taXRUb1BvaW50VG8sIGdpdC5SZXNldC5UWVBFLkhBUkQpXHJcbiAgICAudGhlbihudW1iZXIgPT4ge1xyXG4gICAgICBpZiAobnVtYmVyKSB0aHJvdyBuZXcgRXJyb3IoYOKAoiBDb3VsZCBub3QgcmVzZXQgcmVwb3NpdG9yeSAke3JlcG9zaXRvcnl9IHRvIGNvbW1pdCAke2NvbW1pdFRvUG9pbnRUb31gKVxyXG4gICAgfSlcclxuICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKVxyXG5cclxuICAvLyBydW4gYnVpbGRcclxuICBpZiAoYnVpbGRDYWxsYmFjaykge1xyXG4gICAgY29uc29sZS5sb2coYOKAoiBCdWlsZGluZyBwcm9qZWN0Li4uYClcclxuICAgIGF3YWl0IGJ1aWxkQ2FsbGJhY2soKVxyXG4gICAgICAudGhlbigoKSA9PiBjb25zb2xlLmxvZygnUHJvamVjdCBidWlsdCBzdWNjZXNzZnVsbHkgIScpKVxyXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbiAgfVxyXG5cclxuICAvLyBnZXQgdG9wIGRpcmVjdG9yaWVzIHRoYXQgYXJlIGlnbm9yZWRcclxuICBsZXQgZGlyZW50TGlzdCA9IGdldEFsbERpcmVudCh0YXJnZXRQcm9qZWN0Um9vdCkgLy8gZ2V0IGFsbCBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgb24gdG9wIGxldmVsXHJcblxyXG4gIC8vIFRPRE86IERlYWwgd2l0aCBzdWJkaXJlY3Rvcnkgbm9kZV9tb2R1bGVzIGFuZCBpZ25vcmVkIGZpbGVzLiBUaGUgaXNzdWVzIGlzIHRoYXQgdGhlIHdob2xlIHRvcGxldmVsIGRpcmVjdG9yeSBpcyByZW1vdmVkLlxyXG4gIC8vIC8vIGdldCBhbGwgMm5kIGxldmVsIGRpcmVjdG9yaWVzIC0gdGhpcyBhbGxvd3MgZm9yIHdvcmtzcGFjZXMgdG8ga2VlcCBub2RlX21vZHVsZXMgZm9sZGVyIGluIGEgc3ViZGlyZWN0b3J5LlxyXG4gIC8vIGZvciAobGV0IHRvcGxldmVsRGlyZW50IG9mIGRpcmVudExpc3QpIHtcclxuICAvLyAgIGxldCBzdWJEaXJlbnRMaXN0ID1cclxuICAvLyB9XHJcblxyXG4gIC8vIGNoZWNrIGlmIHBhdGggaXMgaWdub3JlZFxyXG4gIGxldCBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGF3YWl0IGZpbHRlckFzeW5jKGRpcmVudExpc3QsIGFzeW5jIGRpcmVudCA9PiAoYXdhaXQgZ2l0Lklnbm9yZS5wYXRoSXNJZ25vcmVkKHJlcG9zaXRvcnksIHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgZGlyZW50Lm5hbWUpKSkgfD4gQm9vbGVhbilcclxuICAvLyBpZ25vcmVkRGlyZWN0b3J5TGlzdCA9IGlnbm9yZWREaXJlY3RvcnlMaXN0Lm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpIC8vIGdldCBhYnNvbHV0ZSBwYXRoc1xyXG4gIC8vIGdldCBkaXJlbnQgbGlzdCB0byBkZWxldGVcclxuICBsZXQgZGlyZW50VG9EZWxldGUgPSBkaXJlbnRMaXN0LmZpbHRlcihkaXJlbnQgPT4gIWlnbm9yZWREaXJlY3RvcnlMaXN0LmluY2x1ZGVzKGRpcmVudCkpIC8vIHJlbW92ZSBpZ25vcmVkIGRpcmVudHMgZnJvbSBkZWxldGUgbGlzdFxyXG4gIC8qKiBEZWxldGUgZGlyZW50IGxpc3QgdGhhdCBpbmNsdWRlcyBkaXJlY3RvcmllcyBhbmQgZmlsZXMgKi9cclxuICBsZXQgZGVsZXRlQWJzb2x1dGVQYXRoTGlzdCA9IGRpcmVudFRvRGVsZXRlLm1hcChkaXJlbnQgPT4gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBkaXJlbnQubmFtZSkpXHJcbiAgZm9yIChsZXQgYWJzb2x1dGVQYXRoIG9mIGRlbGV0ZUFic29sdXRlUGF0aExpc3QpIHtcclxuICAgIGZpbGVzeXN0ZW1FeHRyYS5yZW1vdmVTeW5jKGFic29sdXRlUGF0aClcclxuICB9XHJcbiAgLy8gY29weSBkaXN0cmlidXRpb24gY29udGVudHMgdG8gcm9vdCBwcm9qZWN0IGxldmVsXHJcbiAgZmlsZXN5c3RlbUV4dHJhLmNvcHlTeW5jKHRhcmdldFByb2plY3RDb25maWcuZGlyZWN0b3J5LmRpc3RyaWJ1dGlvbiwgdGFyZ2V0UHJvamVjdFJvb3QpXHJcblxyXG4gIC8vIENyZWF0ZSBjb21taXQgb2YgYWxsIGZpbGVzLlxyXG4gIGxldCBpbmRleCA9IGF3YWl0IHJlcG9zaXRvcnkucmVmcmVzaEluZGV4KCkgLy8gaW52YWxpZGF0ZXMgYW5kIGdyYWJzIG5ldyBpbmRleCBmcm9tIHJlcG9zaXRvcnkuXHJcbiAgbGV0IHRyZWVPYmplY3QgPSBhd2FpdCBpbmRleFxyXG4gICAgLmFkZEFsbChbJyoqJ10pXHJcbiAgICAudGhlbigoKSA9PiBpbmRleC53cml0ZSgpKVxyXG4gICAgLnRoZW4oKCkgPT4gaW5kZXgud3JpdGVUcmVlKCkpIC8vIGFkZCBmaWxlcyBhbmQgY3JlYXRlIGEgdHJlZSBvYmplY3QuXHJcbiAgbGV0IHBhcmVudENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgcmVwb3NpdG9yeVxyXG4gICAgLmNyZWF0ZUNvbW1pdChcclxuICAgICAgJ0hFQUQnIC8qIHVwZGF0ZSB0aGUgSEVBRCByZWZlcmVuY2UgLSBzbyB0aGF0IHRoZSBIRUFEIHdpbGwgcG9pbnQgdG8gdGhlIGxhdGVzdCBnaXQgKi8gfHwgbnVsbCAvKiBkbyBub3QgdXBkYXRlIHJlZiAqLyxcclxuICAgICAgdGFnZ2VyU2lnbmF0dXJlLFxyXG4gICAgICB0YWdnZXJTaWduYXR1cmUsXHJcbiAgICAgIGDwn4+X77iPIEJ1aWxkIGRpc3RyaWJ1dGlvbiBjb2RlLmAsXHJcbiAgICAgIHRyZWVPYmplY3QsXHJcbiAgICAgIFtwYXJlbnRDb21taXRdLFxyXG4gICAgKVxyXG4gICAgLnRoZW4ob2lkID0+IGNvbnNvbGUubG9nKGDigKIgQ29tbWl0IGNyZWF0ZWQgJHtvaWR9IGZvciBkaXN0cmlidXRpb24gY29kZWApKVxyXG5cclxuICAvLyB0YWcgYW5kIGNyZWF0ZSBhIHJlbGVhc2UuXHJcbiAgbGV0IGxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgZ2l0LlRhZy5jcmVhdGUocmVwb3NpdG9yeSwgdGFnTmFtZSwgbGF0ZXN0VGVtcG9yYXJ5QnJhbmNoQ29tbWl0LCB0YWdnZXJTaWduYXR1cmUsIGBSZWxlYXNlIG9mIGRpc3RyaWJ1dGlvbiBjb2RlIG9ubHkuYCwgMCkudGhlbihvaWQgPT4gY29uc29sZS5sb2coYOKAoiBUYWcgY3JlYXRlZCAke29pZH1gKSlcclxuXHJcbiAgLy8gbWFrZSBzdXJlIHRoZSBicmFuY2ggaXMgY2hlY2tlZG91dC5cclxuICBhd2FpdCByZXBvc2l0b3J5LmNoZWNrb3V0QnJhbmNoKGJyYWNoVG9Qb2ludFRvKS50aGVuKGFzeW5jICgpID0+IGNvbnNvbGUubG9nKGBDaGVja2VkIGJyYW5jaCAke2F3YWl0IGJyYWNoVG9Qb2ludFRvLm5hbWUoKX1gKSkgLy8gY2hlY2tvdXQgZm9ybWVyIGJyYW5jaCAodXN1YWxseSBtYXN0ZXIgYnJhbmNoKVxyXG5cclxuICAvLyBhcHBseSB0ZW1wb3Jhcmx5IHN0YXNoZWQgZmlsZXNcclxuICBpZiAoc3RhdHVzZUxpc3QubGVuZ3RoID4gMCkgYXdhaXQgZ2l0LlN0YXNoLnBvcChyZXBvc2l0b3J5LCAwIC8qKiBsYXN0IHN0YWNoZWQgcG9zaXRpb24gKi8pXHJcbn1cclxuXHJcbi8qKiByZWJhc2UgaW50byBtYXN0ZXIgYnJhbmNoIHRvIGZvbGxvdyB0aGUgbGF0ZXN0IG1hc3RlciBjb21taXQuIFRPRE86IHRoaXMgaXMgYW4gZXhhbXBsZSAtIGZpeCBhc3luYyBvcGVyYXRpb24uXHJcbiAqICBUaGlzIGlzIGFuIG9wdGlvbiBmb3IgcmViYXNpbmcgYSB0ZW1wb3JhcnkgYnJhbmNoIHRvIHRoZSBsYXRlc3QgY29tbWl0IChvciBhIG5ld2VyIGNvbW1pdCkuIEFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSBgcmVzZXRgIHRvIGEgZGlmZmVyZW50IGNvbW1pdC5cclxuICovXHJcbmZ1bmN0aW9uIHJlYmFzaW5nRXhhbXBsZSh7IHJlcG9zaXRvcnksIGJyYW5jaCwgZnJvbUJyYW5jaCwgdG9CcmFuY2ggfSkge1xyXG4gIHJldHVybiByZXBvc2l0b3J5LnJlYmFzZUJyYW5jaGVzKFxyXG4gICAgYnJhbmNoLm5hbWUoKSwgLy8gYnJhbmNoIGNvbW1pdHMgdG8gbW92ZVxyXG4gICAgZnJvbUJyYW5jaC5uYW1lKCksIC8vIHRpbGwgY29tbWl0cyB0aGF0IGFyZSBpbnRlcnNlY3RlZCB3aXRoIHRoaXMgYnJhbmNoIChvbGQgYnJhbmNoKVxyXG4gICAgdG9CcmFuY2gubmFtZSgpLCAvLyBvbnRvIHRoZSBuZXcgYnJhbmNoLlxyXG4gICAgZ2l0LlNpZ25hdHVyZS5ub3coJ21lb3cnLCAndGVzdEBleGFtcGxlLmNvbScpLFxyXG4gICAgcmViYXNlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ09uZSBvcGVyYXRpb24nKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgICByZWJhc2VNZXRhZGF0YSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCByZWJhc2UnKVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIH0sXHJcbiAgKVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUZW1wb3JhcnlCcmFuY2goeyByZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2ggfSkge1xyXG4gIC8vIGRlbGV0ZSB0ZW1wb3JhcnkgYnJhbmNoXHJcbiAgdHJ5IHtcclxuICAgIGlmIChnaXQuQnJhbmNoLmlzQ2hlY2tlZE91dCh0ZW1wb3JhcnlCcmFuY2gpKSB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBkZWxldGUgYSBjaGVja2VkIG91dCBicmFuY2ggJHthd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpfS5gKVxyXG4gICAgLy8gQnkgcmVhc3NpZ25pbmcgdGhlIHZhcmlhYmxlIGFuZCBsb29raW5nIHVwIHRoZSBicmFuY2ggdGhlIGdhcmJhZ2UgY29sbGVjdG9yIHdpbGwga2ljayBpbi4gVGhlIHJlZmVyZW5jZSBmb3IgdGhlIGJyYW5jaCBpbiBsaWJnaXQyIHNob3VsZG4ndCBiZSBpbiBtZW1vcnkgYXMgbWVudGlvbmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9saWJnaXQyL2xpYmdpdDIvYmxvYi84NTlkOTIyOTJlMDA4YTRkMDRkNjhmYjZkYzIwYTFkZmE2OGU0ODc0L2luY2x1ZGUvZ2l0Mi9yZWZzLmgjTDM4NS1MMzk4XHJcbiAgICB0ZW1wb3JhcnlCcmFuY2ggPSBhd2FpdCBnaXQuQnJhbmNoLmxvb2t1cChyZXBvc2l0b3J5LCB0ZW1wb3JhcnlCcmFuY2hOYW1lLCAxKSAvLyByZWZlcmVzaCB2YWx1ZSBvZiB0ZW1wb3JhcnlCcmFuY2ggLSBmb3Igc29tZSByZWFzb24gdXNpbmcgdGhlIHNhbWUgcmVmZXJlbmNlIHByZXZlbnRzIGRlbGV0aW9uIG9mIGJyYW5jaC5cclxuICAgIGxldCBlcnJvciA9IGdpdC5CcmFuY2guZGVsZXRlKHRlbXBvcmFyeUJyYW5jaClcclxuICAgIGlmIChlcnJvcikgdGhyb3cgbmV3IEVycm9yKGBDb2RlIHRocm93biBieSAnbGliZ2l0MicgYmluZGluZ3MgPSAke2Vycm9yfVxcbiBcXHRDaGVjayBodHRwczovL3d3dy5ub2RlZ2l0Lm9yZy9hcGkvZXJyb3IvI0NPREVgKVxyXG4gICAgY29uc29sZS5sb2coYOKAoiBEZWxldGVkIHRlbXBvYXJhcnkgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0uYClcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgdGhyb3cgZXJyb3JcclxuICB9XHJcbn1cclxuIl19