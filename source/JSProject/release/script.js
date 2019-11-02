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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcmVsZWFzZS9zY3JpcHQuanMiXSwibmFtZXMiOlsiZ2V0RGlyZWN0b3J5Iiwic291cmNlIiwiZmlsZXN5c3RlbSIsInJlYWRkaXJTeW5jIiwid2l0aEZpbGVUeXBlcyIsImZpbHRlciIsImRpcmVudCIsImlzRGlyZWN0b3J5IiwiZ2V0QWxsRGlyZW50IiwiZmlsdGVyQXN5bmMiLCJhcnIiLCJjYWxsYmFjayIsImZhaWwiLCJTeW1ib2wiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiaXRlbSIsImkiLCJsb29rdXBDb25maWdGaWxlIiwidGFyZ2V0UHJvamVjdFJvb3QiLCJjb25maWdOYW1lIiwiY29uZmlnUG9zc2libGVQYXRoIiwicGF0aCIsImpvaW4iLCJjb25maWdQYXRoQXJyYXkiLCJjb25maWdQYXRoIiwiZXhpc3RzU3luYyIsImxlbmd0aCIsImNyZWF0ZUdpdGh1YkJyYW5jaGVkUmVsZWFzZSIsImFwaSIsInRlbXBvcmFyeUJyYW5jaE5hbWUiLCJicmFjaFRvUG9pbnRUbyIsImNvbW1pdFRvUG9pbnRUbyIsInRhZ05hbWUiLCJidWlsZENhbGxiYWNrIiwidGFnZ2VyIiwidGFyZ2V0UHJvamVjdCIsInByb2plY3QiLCJ0YXJnZXRQcm9qZWN0Q29uZmlnIiwiY29uZmlndXJhdGlvbiIsInJvb3RQYXRoIiwidGFyZ2V0UHJvamVjdEdpdFVybCIsImJ1aWxkIiwicmVwb3NpdG9yeVVSTCIsImdpdEV4Y2x1ZGVQYXRoIiwiZ2l0SWdub3JlUGF0aCIsInVubGlua1N5bmMiLCJwcm92aXNpb24iLCJjb3B5IiwiY29weUZpbGUiLCJkZXN0aW5hdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJyZXBvc2l0b3J5IiwiZ2l0IiwiUmVwb3NpdG9yeSIsIm9wZW4iLCJCcmFuY2giLCJsb29rdXAiLCJ0YWdnZXJTaWduYXR1cmUiLCJTaWduYXR1cmUiLCJub3ciLCJuYW1lIiwiZW1haWwiLCJkZWZhdWx0IiwiZ2V0TGF0ZXN0Q29tbWl0IiwiZ2V0UmVmZXJlbmNlQ29tbWl0IiwiQ29tbWl0IiwiYnJhbmNoUmVmZXJlbmNlTGlzdCIsImdldFJlZmVyZW5jZXMiLCJ0aGVuIiwicmVmZXJlbmNlTGlzdCIsInJlZmVyZW5jZSIsInR5cGUiLCJSZWZlcmVuY2UiLCJUWVBFIiwiRElSRUNUIiwiZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0Iiwic29tZSIsImJyYW5jaCIsInRvU3RyaW5nIiwiaW5jbHVkZXMiLCJ0ZW1wb3JhcnlCcmFuY2giLCJjcmVhdGUiLCJjYXRjaCIsImVycm9yIiwic2hhIiwic3RhdHVzZUxpc3QiLCJnZXRTdGF0dXMiLCJTdGFzaCIsInNhdmUiLCJGTEFHUyIsIklOQ0xVREVfVU5UUkFDS0VEIiwiY2hlY2tvdXRCcmFuY2giLCJSZXNldCIsInJlc2V0IiwiSEFSRCIsIm51bWJlciIsIkVycm9yIiwiZGlyZW50TGlzdCIsImlnbm9yZWREaXJlY3RvcnlMaXN0IiwiSWdub3JlIiwicGF0aElzSWdub3JlZCIsIkJvb2xlYW4iLCJkaXJlbnRUb0RlbGV0ZSIsImRlbGV0ZUFic29sdXRlUGF0aExpc3QiLCJhYnNvbHV0ZVBhdGgiLCJmaWxlc3lzdGVtRXh0cmEiLCJyZW1vdmVTeW5jIiwiY29weVN5bmMiLCJkaXJlY3RvcnkiLCJkaXN0cmlidXRpb24iLCJpbmRleCIsInJlZnJlc2hJbmRleCIsInRyZWVPYmplY3QiLCJhZGRBbGwiLCJ3cml0ZSIsIndyaXRlVHJlZSIsInBhcmVudENvbW1pdCIsImdldEhlYWRDb21taXQiLCJjcmVhdGVDb21taXQiLCJvaWQiLCJsYXRlc3RUZW1wb3JhcnlCcmFuY2hDb21taXQiLCJUYWciLCJwb3AiLCJyZWJhc2luZ0V4YW1wbGUiLCJmcm9tQnJhbmNoIiwidG9CcmFuY2giLCJyZWJhc2VCcmFuY2hlcyIsInJlYmFzZSIsInJlc29sdmUiLCJyZWJhc2VNZXRhZGF0YSIsImRlbGV0ZVRlbXBvcmFyeUJyYW5jaCIsImlzQ2hlY2tlZE91dCIsImRlbGV0ZSJdLCJtYXBwaW5ncyI6InlU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LE9BQVIsRUFBUDtBQUNELEdBUkk7QUFTTEMsRUFBQUEsY0FBYyxJQUFJO0FBQ2hCaEYsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVo7QUFDQSxXQUFPdkMsT0FBTyxDQUFDcUgsT0FBUixFQUFQO0FBQ0QsR0FaSSxDQUFQOztBQWNEOztBQUVELGVBQWVFLHFCQUFmLENBQXFDLEVBQUUvRSxVQUFGLEVBQWM2QixlQUFkLEVBQXJDLEVBQXNFOztBQUVwRSxNQUFJO0FBQ0YsUUFBSTVCLGlCQUFJRyxNQUFKLENBQVc0RSxZQUFYLENBQXdCbkQsZUFBeEIsQ0FBSixFQUE4QyxNQUFNLElBQUlnQixLQUFKLENBQVcsc0NBQXFDLE1BQU1oQixlQUFlLENBQUNwQixJQUFoQixFQUF1QixHQUE3RSxDQUFOOztBQUU5Q29CLElBQUFBLGVBQWUsR0FBRyxNQUFNNUIsaUJBQUlHLE1BQUosQ0FBV0MsTUFBWCxDQUFrQkwsVUFBbEIsRUFBOEJ2QixtQkFBOUIsRUFBbUQsQ0FBbkQsQ0FBeEI7QUFDQSxRQUFJdUQsS0FBSyxHQUFHL0IsaUJBQUlHLE1BQUosQ0FBVzZFLE1BQVgsQ0FBa0JwRCxlQUFsQixDQUFaO0FBQ0EsUUFBSUcsS0FBSixFQUFXLE1BQU0sSUFBSWEsS0FBSixDQUFXLHVDQUFzQ2IsS0FBTSxvREFBdkQsQ0FBTjtBQUNYbEMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsK0JBQThCLE1BQU04QixlQUFlLENBQUNwQixJQUFoQixFQUF1QixHQUF4RTtBQUNELEdBUEQsQ0FPRSxPQUFPdUIsS0FBUCxFQUFjO0FBQ2QsVUFBTUEsS0FBTjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlsZXN5c3RlbSBmcm9tICdmcydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXHJcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcclxuaW1wb3J0IGZpbGVzeXN0ZW1FeHRyYSBmcm9tICdmcy1leHRyYSdcclxuaW1wb3J0IHsgZGVmYXVsdCBhcyBnaXQsIENvbW1pdCwgUmVwb3NpdG9yeSwgUmVmZXJlbmNlLCBCcmFuY2gsIFNpZ25hdHVyZSwgUmVzZXQsIFN0YXNoIH0gZnJvbSAnbm9kZWdpdCdcclxuaW1wb3J0ICogYXMgcHJvdmlzaW9uIGZyb20gJ0BkZXBlbmRlbmN5L2RlcGxveW1lbnRQcm92aXNpb25pbmcnXHJcbmNvbnN0IGdldERpcmVjdG9yeSA9IHNvdXJjZSA9PiBmaWxlc3lzdGVtLnJlYWRkaXJTeW5jKHNvdXJjZSwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pLmZpbHRlcihkaXJlbnQgPT4gZGlyZW50LmlzRGlyZWN0b3J5KCkpXHJcbmNvbnN0IGdldEFsbERpcmVudCA9IHNvdXJjZSA9PiBmaWxlc3lzdGVtLnJlYWRkaXJTeW5jKHNvdXJjZSwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pXHJcbi8qKiBGaWx0ZXIgYXJyYXkgd2l0aCBhc3luYyBmdW5jdGlvblxyXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMzM1NTUyOC9maWx0ZXJpbmctYW4tYXJyYXktd2l0aC1hLWZ1bmN0aW9uLXRoYXQtcmV0dXJucy1hLXByb21pc2VcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGZpbHRlckFzeW5jKGFyciwgY2FsbGJhY2spIHtcclxuICBjb25zdCBmYWlsID0gU3ltYm9sKClcclxuICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKGFyci5tYXAoYXN5bmMgaXRlbSA9PiAoKGF3YWl0IGNhbGxiYWNrKGl0ZW0pKSA/IGl0ZW0gOiBmYWlsKSkpKS5maWx0ZXIoaSA9PiBpICE9PSBmYWlsKVxyXG59XHJcblxyXG5mdW5jdGlvbiBsb29rdXBDb25maWdGaWxlKHsgdGFyZ2V0UHJvamVjdFJvb3QsIGNvbmZpZ05hbWUgfSkge1xyXG4gIGxldCBjb25maWdQb3NzaWJsZVBhdGggPSBbcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lKSwgcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCAnY29uZmlndXJhdGlvbicsIGNvbmZpZ05hbWUpXVxyXG4gIC8vIGZpbmQgZXhpc3RpbmcgY29uZmlnIGZpbGVcclxuICBsZXQgY29uZmlnUGF0aEFycmF5ID0gY29uZmlnUG9zc2libGVQYXRoLmZpbHRlcihjb25maWdQYXRoID0+IGZpbGVzeXN0ZW0uZXhpc3RzU3luYyhjb25maWdQYXRoKSlcclxuICBhc3NlcnQoY29uZmlnUGF0aEFycmF5Lmxlbmd0aCA+IDAsIGDigKIgJHtjb25maWdOYW1lfSBsb29rdXAgZmFpbGVkLCBmaWxlIG5vdCBmb3VuZCBpbiB0aGUgY29uZmlndXJhdGlvbiBwb3NzaWJsZSBwYXRocyAtICR7Y29uZmlnUG9zc2libGVQYXRofS5gKVxyXG4gIHJldHVybiBjb25maWdQYXRoQXJyYXlbMF1cclxufVxyXG5cclxuLy8/IFRPRE86IFJlbGVhc2VzIGNvdWxkIGJlIGNyZWF0ZWQgZm9yIHNvdXJjZSBjb2RlIGluIGFkZGl0aW9uIHRvIGRpc3RyaWJ1dGlvbiBjb2RlIHJlbGVhc2UuXHJcblxyXG4vKipcclxuICog4peLIFB1c2ggbmV3IHZlcnNpb24gdG8gZ2l0aHViIHRhZ3MuXHJcbiAqIOKXiyBDcmVhdGUgYSBuZXcgcmVsZWFzZSBmcm9tIHRoZSBwdXNoZWQgdGFnLlxyXG4gKiBSZWxlYXNlIGEgbmV3IHRhZyBpbiBHaXRodWI6XHJcbiAqICAwLiBzdGFzaCBjaGFuZ2VzIHRlbXBvcmFyaWx5XHJcbiAqICAxLiBDcmVhdGUgYSB0ZW1wb3JhcnkgYnJhbmNoIG9yIHVzZSBhbiBleGlzdGluZyBicmFuY2ggYW5kIGNoZWNrb3V0IHRvIGl0LlxyXG4gKiAgMi4gUmViYXNlIG9yIFJlc2V0aW5nIG9udG8gbWFzdGVyIChpbiBjYXNlIHRoZSB0ZW1wb3JhcnkgYnJhbmNoIGV4aXN0cykgLSBzaW1pbGFyIHRvIG92ZXJyaWRpbmcgYnJhbmNoIGhpc3Rvcnkgd2l0aCB0aGUgbWFzdGVyIGJyYW5jaC5cclxuICogIDMuIEJ1aWxkIGNvZGUgYW5kIGNvbW1pdCB3aXRoIGEgZGlzdHJpYnV0aW9uIG1lc3NhZ2UuXHJcbiAqICA0LiBDcmVhdGUgYSByZWxlYXNlL3RhZy5cclxuICogIDUuIGNsZWFudXAgYnJhbmNoZXMuXHJcbiAqICA2LiBnaXQgY2hlY2tvdXQgbWFzdGVyXHJcbiAqICA3LiBwb3AgbGFzdCBzdGFzaCBmaWxlc1xyXG4gKlxyXG4gKiAgQHNpZUVmZmVjdCAtIGNyZWF0ZXMgYSB0YWcgYW5kIGRlbGV0ZXMgdGVtcG9yYXJ5IGJyYW5jaC5cclxuICpcclxuICogU2ltcGxlIGV4YW1wbGUgZXF1aXZhbGVudCBzaGVsbCBzY3JpcHQ6XHJcbiAqIGBgYGdpdCBjaGVja291dCBkaXN0cmlidXRpb24gJiYgZ2l0IHJlYmFzZSAtLW9udG8gbWFzdGVyIGRpc3RyaWJ1dGlvbiAmJiBlY2hvIFwiVGVzdCBQYWdlXCIgPiBuZXcuanMgJiYgZ2l0IGFkZCAtQSAmJiBnaXQgY29tbWl0IC1hIC1tICdidWlsZCcgJiYgZ2l0IHRhZyB2NTsgZ2l0IGNoZWNrb3V0IG1hc3RlcmBgYFxyXG4gKlxyXG4gKiBgbm9kZWdpdGAgZG9jdW1lbnRhdGlvbjogaHR0cHM6Ly93d3cubm9kZWdpdC5vcmcvYXBpXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlR2l0aHViQnJhbmNoZWRSZWxlYXNlKHtcclxuICAvLyAnYnJhbmNoZWQgcmVsZWFzZScgaW4gdGhlIHNlbnNlIG9mIGEgdGFnIHRoYXQgcG9pbnRzIHRvIGFuIGFkZGl0aW9uYWwgYnVpbGQgY29tbWl0IG90aGVyIHRoYW4gdGhlIG1hc3RlciBjb21taXQgZm9yIGV4YW1wbGUuXHJcbiAgYXBpLFxyXG4gIHRlbXBvcmFyeUJyYW5jaE5hbWUgPSAnZGlzdHJpYnV0aW9uJywgLy8gYnJhbmNoIHVzZWQgdG8gYnVpbGQgc291cmNlIGNvZGUgYW5kIGNyZWF0ZSBhIGRpc3RyaWJ1dGlvbiB0YWcgZnJvbVxyXG4gIGJyYWNoVG9Qb2ludFRvID0gJ21hc3RlcicsIC8vIGRlZmF1bHQgYnJhbmNoIGZvciBsYXRlc3QgY29tbWl0LlxyXG4gIGNvbW1pdFRvUG9pbnRUbyA9IG51bGwsIC8vIHVucmVsYXRlZCBjb21taXQgdG8gcG9pbnQgdG8gd2hpbGUgY3JlYXRpbmcgdGVtcG9yYXJ5IGJyYW5jaFxyXG4gIHRhZ05hbWUsXHJcbiAgYnVpbGRDYWxsYmFjaywgLy8gYnVpbGQgYXN5bmMgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBidWlsZGluZyBzb3VyY2UgY29kZSBhbmQgcHJlcGFyaW5nIHRoZSBwYWNrYWdlIGZvciBkaXN0cmlidXRpb24uXHJcbiAgdGFnZ2VyLFxyXG59OiB7XHJcbiAgdGFnZ2VyOiB7IG5hbWU6ICcnLCBlbWFpbDogJycgfSxcclxufSkge1xyXG4gIGNvbnN0IHRhcmdldFByb2plY3QgPSBhcGkucHJvamVjdCxcclxuICAgIHRhcmdldFByb2plY3RDb25maWcgPSB0YXJnZXRQcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbixcclxuICAgIHRhcmdldFByb2plY3RSb290ID0gdGFyZ2V0UHJvamVjdC5jb25maWd1cmF0aW9uLnJvb3RQYXRoLFxyXG4gICAgdGFyZ2V0UHJvamVjdEdpdFVybCA9IHRhcmdldFByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uPy5idWlsZC5yZXBvc2l0b3J5VVJMXHJcblxyXG4gIC8qKiBNYWtlIGRpc3RyaWJ1dGlvbiBmb2xkZXIgYXMgcm9vdCBkaXJlY3RvcnkgaW4gdGhlIGJyYW5jaCAqL1xyXG4gIC8vIGRlbGV0aW5nIC5naXRpZ25vcmUgd2lsbCBtYWtlIGl0IGZhc3RlciwgYnkgcHJldmVudGluZyBub2RlX21vZHVsZXMgZnJvbSBiZWluZyBwcm9jZXNzZWQgYnkgdG9vbHMgd2hpbGUgZGVsZXRpbmcgZmlsZXMuXHJcbiAgbGV0IGdpdEV4Y2x1ZGVQYXRoID0gcGF0aC5qb2luKHRhcmdldFByb2plY3RSb290LCAnLi8uZ2l0L2luZm8vZXhjbHVkZScpLFxyXG4gICAgZ2l0SWdub3JlUGF0aCA9IGxvb2t1cENvbmZpZ0ZpbGUoeyB0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZTogJy5naXRpZ25vcmUnIH0pXHJcbiAgaWYgKGZpbGVzeXN0ZW0uZXhpc3RzU3luYyhnaXRFeGNsdWRlUGF0aCkpIGZpbGVzeXN0ZW0udW5saW5rU3luYyhnaXRFeGNsdWRlUGF0aCkgLy8gcmVtb3ZlIGZpbGVcclxuICBwcm92aXNpb24uY29weS5jb3B5RmlsZShbeyBzb3VyY2U6IGdpdElnbm9yZVBhdGgsIGRlc3RpbmF0aW9uOiBnaXRFeGNsdWRlUGF0aCB9XSkgLy8gY29weSAuZ2l0aWdub3JlIHRvIGAuZ2l0YCBmb2xkZXJcclxuXHJcbiAgLy8gcmVhZCBnaXQgcmVwb3NpdG9yeVxyXG4gIGNvbnNvbGUubG9nKGDigKIgT3Blbm5pbmcgcmVwb3NpdG9yeTogJHt0YXJnZXRQcm9qZWN0Um9vdH1gKVxyXG4gIGNvbnN0IHJlcG9zaXRvcnkgPSBhd2FpdCBnaXQuUmVwb3NpdG9yeS5vcGVuKHRhcmdldFByb2plY3RSb290KVxyXG4gIGJyYWNoVG9Qb2ludFRvID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgYnJhY2hUb1BvaW50VG8sIDEpIC8vIGNvbnZlcnQgdG8gYnJhbmNoIHJlZmVyZW5jZVxyXG5cclxuICAvLyBsb2FkIHRhZ2dlclNpZ25hdHVyZSBzaWduYXR1cmVcclxuICBsZXQgdGFnZ2VyU2lnbmF0dXJlID0gdGFnZ2VyID8gZ2l0LlNpZ25hdHVyZS5ub3codGFnZ2VyLm5hbWUsIHRhZ2dlci5lbWFpbCkgOiBhd2FpdCBnaXQuU2lnbmF0dXJlLmRlZmF1bHQocmVwb3NpdG9yeSlcclxuICBhc3NlcnQodGFnZ2VyU2lnbmF0dXJlLCBg4p2MIEdpdGh1YiB1c2VybmFtZSBzaG91bGQgYmUgcGFzc2VkIG9yIGZvdW5kIGluIHRoZSBnaXQgbG9jYWwvc3lzdGVtIGNvbmZpZ3MuYClcclxuXHJcbiAgLy8gZ2V0IGxhdGVzdCBjb21taXQgZnJvbSBicmFuY2hcclxuICBsZXQgZ2V0TGF0ZXN0Q29tbWl0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRSZWZlcmVuY2VDb21taXQoYnJhY2hUb1BvaW50VG8pXHJcbiAgY29uc29sZS5sb2coYOKAoiBHZXR0aW5nIGxhdGVzdCBjb21taXQ6ICR7Z2V0TGF0ZXN0Q29tbWl0fWApXHJcbiAgLy8gc2V0IGNvbW1pdCByZWZlcmVuY2VcclxuICBpZiAoY29tbWl0VG9Qb2ludFRvKSB7XHJcbiAgICBjb21taXRUb1BvaW50VG8gPSBhd2FpdCBnaXQuQ29tbWl0Lmxvb2t1cChyZXBvc2l0b3J5LCBjb21taXRUb1BvaW50VG8pIC8vIGdldCBjb21taXQgZnJvbSBzdXBwbGllZCBjb21taXQgaWQgcGFyYW1ldGVyXHJcbiAgfSBlbHNlIGNvbW1pdFRvUG9pbnRUbyA9IGdldExhdGVzdENvbW1pdFxyXG5cclxuICAvLyBnZXQgYWxsIGJyYW5jaGVzIHJlbW90ZSBhbmQgbG9jYWxcclxuICBsZXQgYnJhbmNoUmVmZXJlbmNlTGlzdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0UmVmZXJlbmNlcygpLnRoZW4ocmVmZXJlbmNlTGlzdCA9PiByZWZlcmVuY2VMaXN0LmZpbHRlcihyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnR5cGUoKSA9PSBnaXQuUmVmZXJlbmNlLlRZUEUuRElSRUNUKSlcclxuXHJcbiAgLy8gY2hlY2sgaWYgYHRlbXBvcmFyeUJyYW5jaE5hbWVgIGJyYW5jaCwgdGhhdCBpcyB1c2VkLCBleGlzdHMuXHJcbiAgY29uc29sZS5sb2coYOKAoiBDaGVja2luZy9DcmVhdGluZyB0ZW1wb3JhcnkgYnJhbmNoOiAke3RlbXBvcmFyeUJyYW5jaE5hbWV9YClcclxuICBsZXQgZG9lc1RlbXBvcmFyeUJyYW5jaEV4aXN0ID0gYnJhbmNoUmVmZXJlbmNlTGlzdC5zb21lKGJyYW5jaCA9PiBicmFuY2gudG9TdHJpbmcoKS5pbmNsdWRlcyh0ZW1wb3JhcnlCcmFuY2hOYW1lKSlcclxuICBsZXQgdGVtcG9yYXJ5QnJhbmNoIC8vIEJyYW5jaCByZWZlcmVuY2VcclxuICBpZiAoIWRvZXNUZW1wb3JhcnlCcmFuY2hFeGlzdCkge1xyXG4gICAgLy8gY3JlYXRlIHRlbXBvcmFyeSBicmFuY2hcclxuICAgIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2guY3JlYXRlKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIGNvbW1pdFRvUG9pbnRUbywgMSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbiAgICBjb25zb2xlLmxvZyhg4oCiIENyZWF0ZWQgdGVtcG9yYXJ5IGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9IGZyb20gY29tbWl0ICR7Y29tbWl0VG9Qb2ludFRvLnNoYSgpfWApXHJcbiAgfSBlbHNlIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2gubG9va3VwKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIDEpXHJcblxyXG4gIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSB1bnRyYWNrZWQgb3Igc3RhZ2VkIGZpbGVzXHJcbiAgbGV0IHN0YXR1c2VMaXN0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRTdGF0dXMoKVxyXG4gIGlmIChzdGF0dXNlTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAvLyBzdGFzaCBjaGFuZ2VzIHRoYXQgYXJlIHN0aWxsIG5vdCBjb21taXR0ZWRcclxuICAgIGNvbnNvbGUubG9nKGDigKIgQ2hlY2tvdXQgc3Rhc2ggb2YgY2hhbmdlcyB1bnJlbGF0ZWQgdG8gcmVsZWFzZS5gKVxyXG4gICAgYXdhaXQgZ2l0LlN0YXNoLnNhdmUocmVwb3NpdG9yeSwgdGFnZ2VyU2lnbmF0dXJlLCAnY2hlY2tvdXQgc3Rhc2ggYmVmb3JlIHJlbGVhc2UnLCBnaXQuU3Rhc2guRkxBR1MuSU5DTFVERV9VTlRSQUNLRUQpXHJcbiAgfVxyXG5cclxuICAvLyBjaGVja291dCB0ZW1wb3JhcnlcclxuICBhd2FpdCByZXBvc2l0b3J5LmNoZWNrb3V0QnJhbmNoKGF3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCkpLnRoZW4oYXN5bmMgKCkgPT4gY29uc29sZS5sb2coYENoZWNrZWQgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX1gKSlcclxuXHJcbiAgLyoqIHJlc2V0IHRlbXBvcmFyeSBicmFuY2ggdG8gdGhlIGNvbW1pdCB0byBwb2ludCB0byAodGFyZ2V0Q29tbWl0KVxyXG4gICAqIE5PVEU6IEFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSByZWJhc2luZyB3aGVyZSBjdXJyZW50IGNvbW1pdHMgYXJlIHNhdmVkIC0gY2hlY2sgIGByZWJhc2luZ0V4YW1wbGUoKWAgZnVuY3Rpb25cclxuICAgKi9cclxuICBhd2FpdCBnaXQuUmVzZXQucmVzZXQocmVwb3NpdG9yeSwgY29tbWl0VG9Qb2ludFRvLCBnaXQuUmVzZXQuVFlQRS5IQVJEKVxyXG4gICAgLnRoZW4obnVtYmVyID0+IHtcclxuICAgICAgaWYgKG51bWJlcikgdGhyb3cgbmV3IEVycm9yKGDigKIgQ291bGQgbm90IHJlc2V0IHJlcG9zaXRvcnkgJHtyZXBvc2l0b3J5fSB0byBjb21taXQgJHtjb21taXRUb1BvaW50VG99YClcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcilcclxuXHJcbiAgLy8gcnVuIGJ1aWxkXHJcbiAgaWYgKGJ1aWxkQ2FsbGJhY2spIHtcclxuICAgIGNvbnNvbGUubG9nKGDigKIgQnVpbGRpbmcgcHJvamVjdC4uLmApXHJcbiAgICBhd2FpdCBidWlsZENhbGxiYWNrKClcclxuICAgICAgLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Byb2plY3QgYnVpbHQgc3VjY2Vzc2Z1bGx5ICEnKSlcclxuICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKVxyXG4gIH1cclxuXHJcbiAgLy8gZ2V0IHRvcCBkaXJlY3RvcmllcyB0aGF0IGFyZSBpZ25vcmVkXHJcbiAgbGV0IGRpcmVudExpc3QgPSBnZXRBbGxEaXJlbnQodGFyZ2V0UHJvamVjdFJvb3QpIC8vIGdldCBhbGwgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIG9uIHRvcCBsZXZlbFxyXG5cclxuICAvLyBUT0RPOiBEZWFsIHdpdGggc3ViZGlyZWN0b3J5IG5vZGVfbW9kdWxlcyBhbmQgaWdub3JlZCBmaWxlcy4gVGhlIGlzc3VlcyBpcyB0aGF0IHRoZSB3aG9sZSB0b3BsZXZlbCBkaXJlY3RvcnkgaXMgcmVtb3ZlZC5cclxuICAvLyAvLyBnZXQgYWxsIDJuZCBsZXZlbCBkaXJlY3RvcmllcyAtIHRoaXMgYWxsb3dzIGZvciB3b3Jrc3BhY2VzIHRvIGtlZXAgbm9kZV9tb2R1bGVzIGZvbGRlciBpbiBhIHN1YmRpcmVjdG9yeS5cclxuICAvLyBmb3IgKGxldCB0b3BsZXZlbERpcmVudCBvZiBkaXJlbnRMaXN0KSB7XHJcbiAgLy8gICBsZXQgc3ViRGlyZW50TGlzdCA9XHJcbiAgLy8gfVxyXG5cclxuICAvLyBjaGVjayBpZiBwYXRoIGlzIGlnbm9yZWRcclxuICBsZXQgaWdub3JlZERpcmVjdG9yeUxpc3QgPSBhd2FpdCBmaWx0ZXJBc3luYyhkaXJlbnRMaXN0LCBhc3luYyBkaXJlbnQgPT4gKGF3YWl0IGdpdC5JZ25vcmUucGF0aElzSWdub3JlZChyZXBvc2l0b3J5LCBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsIGRpcmVudC5uYW1lKSkpIHw+IEJvb2xlYW4pXHJcbiAgLy8gaWdub3JlZERpcmVjdG9yeUxpc3QgPSBpZ25vcmVkRGlyZWN0b3J5TGlzdC5tYXAoZGlyZW50ID0+IHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgZGlyZW50Lm5hbWUpKSAvLyBnZXQgYWJzb2x1dGUgcGF0aHNcclxuICAvLyBnZXQgZGlyZW50IGxpc3QgdG8gZGVsZXRlXHJcbiAgbGV0IGRpcmVudFRvRGVsZXRlID0gZGlyZW50TGlzdC5maWx0ZXIoZGlyZW50ID0+ICFpZ25vcmVkRGlyZWN0b3J5TGlzdC5pbmNsdWRlcyhkaXJlbnQpKSAvLyByZW1vdmUgaWdub3JlZCBkaXJlbnRzIGZyb20gZGVsZXRlIGxpc3RcclxuICAvKiogRGVsZXRlIGRpcmVudCBsaXN0IHRoYXQgaW5jbHVkZXMgZGlyZWN0b3JpZXMgYW5kIGZpbGVzICovXHJcbiAgbGV0IGRlbGV0ZUFic29sdXRlUGF0aExpc3QgPSBkaXJlbnRUb0RlbGV0ZS5tYXAoZGlyZW50ID0+IHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgZGlyZW50Lm5hbWUpKVxyXG4gIGZvciAobGV0IGFic29sdXRlUGF0aCBvZiBkZWxldGVBYnNvbHV0ZVBhdGhMaXN0KSB7XHJcbiAgICBmaWxlc3lzdGVtRXh0cmEucmVtb3ZlU3luYyhhYnNvbHV0ZVBhdGgpXHJcbiAgfVxyXG4gIC8vIGNvcHkgZGlzdHJpYnV0aW9uIGNvbnRlbnRzIHRvIHJvb3QgcHJvamVjdCBsZXZlbFxyXG4gIGZpbGVzeXN0ZW1FeHRyYS5jb3B5U3luYyh0YXJnZXRQcm9qZWN0Q29uZmlnLmRpcmVjdG9yeS5kaXN0cmlidXRpb24sIHRhcmdldFByb2plY3RSb290KVxyXG5cclxuICAvLyBDcmVhdGUgY29tbWl0IG9mIGFsbCBmaWxlcy5cclxuICBsZXQgaW5kZXggPSBhd2FpdCByZXBvc2l0b3J5LnJlZnJlc2hJbmRleCgpIC8vIGludmFsaWRhdGVzIGFuZCBncmFicyBuZXcgaW5kZXggZnJvbSByZXBvc2l0b3J5LlxyXG4gIGxldCB0cmVlT2JqZWN0ID0gYXdhaXQgaW5kZXhcclxuICAgIC5hZGRBbGwoWycqKiddKVxyXG4gICAgLnRoZW4oKCkgPT4gaW5kZXgud3JpdGUoKSlcclxuICAgIC50aGVuKCgpID0+IGluZGV4LndyaXRlVHJlZSgpKSAvLyBhZGQgZmlsZXMgYW5kIGNyZWF0ZSBhIHRyZWUgb2JqZWN0LlxyXG4gIGxldCBwYXJlbnRDb21taXQgPSBhd2FpdCByZXBvc2l0b3J5LmdldEhlYWRDb21taXQoKSAvLyBnZXQgbGF0ZXN0IGNvbW1pdFxyXG4gIGF3YWl0IHJlcG9zaXRvcnlcclxuICAgIC5jcmVhdGVDb21taXQoXHJcbiAgICAgICdIRUFEJyAvKiB1cGRhdGUgdGhlIEhFQUQgcmVmZXJlbmNlIC0gc28gdGhhdCB0aGUgSEVBRCB3aWxsIHBvaW50IHRvIHRoZSBsYXRlc3QgZ2l0ICovIHx8IG51bGwgLyogZG8gbm90IHVwZGF0ZSByZWYgKi8sXHJcbiAgICAgIHRhZ2dlclNpZ25hdHVyZSxcclxuICAgICAgdGFnZ2VyU2lnbmF0dXJlLFxyXG4gICAgICBg8J+Pl++4jyBCdWlsZCBkaXN0cmlidXRpb24gY29kZS5gLFxyXG4gICAgICB0cmVlT2JqZWN0LFxyXG4gICAgICBbcGFyZW50Q29tbWl0XSxcclxuICAgIClcclxuICAgIC50aGVuKG9pZCA9PiBjb25zb2xlLmxvZyhg4oCiIENvbW1pdCBjcmVhdGVkICR7b2lkfSBmb3IgZGlzdHJpYnV0aW9uIGNvZGVgKSlcclxuXHJcbiAgLy8gdGFnIGFuZCBjcmVhdGUgYSByZWxlYXNlLlxyXG4gIGxldCBsYXRlc3RUZW1wb3JhcnlCcmFuY2hDb21taXQgPSBhd2FpdCByZXBvc2l0b3J5LmdldEhlYWRDb21taXQoKSAvLyBnZXQgbGF0ZXN0IGNvbW1pdFxyXG4gIGF3YWl0IGdpdC5UYWcuY3JlYXRlKHJlcG9zaXRvcnksIHRhZ05hbWUsIGxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCwgdGFnZ2VyU2lnbmF0dXJlLCBgUmVsZWFzZSBvZiBkaXN0cmlidXRpb24gY29kZSBvbmx5LmAsIDApLnRoZW4ob2lkID0+IGNvbnNvbGUubG9nKGDigKIgVGFnIGNyZWF0ZWQgJHtvaWR9YCkpXHJcblxyXG4gIC8vIG1ha2Ugc3VyZSB0aGUgYnJhbmNoIGlzIGNoZWNrZWRvdXQuXHJcbiAgYXdhaXQgcmVwb3NpdG9yeS5jaGVja291dEJyYW5jaChicmFjaFRvUG9pbnRUbykudGhlbihhc3luYyAoKSA9PiBjb25zb2xlLmxvZyhgQ2hlY2tlZCBicmFuY2ggJHthd2FpdCBicmFjaFRvUG9pbnRUby5uYW1lKCl9YCkpIC8vIGNoZWNrb3V0IGZvcm1lciBicmFuY2ggKHVzdWFsbHkgbWFzdGVyIGJyYW5jaClcclxuXHJcbiAgLy8gYXBwbHkgdGVtcG9yYXJseSBzdGFzaGVkIGZpbGVzXHJcbiAgaWYgKHN0YXR1c2VMaXN0Lmxlbmd0aCA+IDApIGF3YWl0IGdpdC5TdGFzaC5wb3AocmVwb3NpdG9yeSwgMCAvKiogbGFzdCBzdGFjaGVkIHBvc2l0aW9uICovKVxyXG59XHJcblxyXG4vKiogcmViYXNlIGludG8gbWFzdGVyIGJyYW5jaCB0byBmb2xsb3cgdGhlIGxhdGVzdCBtYXN0ZXIgY29tbWl0LiBUT0RPOiB0aGlzIGlzIGFuIGV4YW1wbGUgLSBmaXggYXN5bmMgb3BlcmF0aW9uLlxyXG4gKiAgVGhpcyBpcyBhbiBvcHRpb24gZm9yIHJlYmFzaW5nIGEgdGVtcG9yYXJ5IGJyYW5jaCB0byB0aGUgbGF0ZXN0IGNvbW1pdCAob3IgYSBuZXdlciBjb21taXQpLiBBbm90aGVyIG9wdGlvbiBpcyB0byB1c2UgYHJlc2V0YCB0byBhIGRpZmZlcmVudCBjb21taXQuXHJcbiAqL1xyXG5mdW5jdGlvbiByZWJhc2luZ0V4YW1wbGUoeyByZXBvc2l0b3J5LCBicmFuY2gsIGZyb21CcmFuY2gsIHRvQnJhbmNoIH0pIHtcclxuICByZXR1cm4gcmVwb3NpdG9yeS5yZWJhc2VCcmFuY2hlcyhcclxuICAgIGJyYW5jaC5uYW1lKCksIC8vIGJyYW5jaCBjb21taXRzIHRvIG1vdmVcclxuICAgIGZyb21CcmFuY2gubmFtZSgpLCAvLyB0aWxsIGNvbW1pdHMgdGhhdCBhcmUgaW50ZXJzZWN0ZWQgd2l0aCB0aGlzIGJyYW5jaCAob2xkIGJyYW5jaClcclxuICAgIHRvQnJhbmNoLm5hbWUoKSwgLy8gb250byB0aGUgbmV3IGJyYW5jaC5cclxuICAgIGdpdC5TaWduYXR1cmUubm93KCdtZW93JywgJ3Rlc3RAZXhhbXBsZS5jb20nKSxcclxuICAgIHJlYmFzZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdPbmUgb3BlcmF0aW9uJylcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICB9LFxyXG4gICAgcmViYXNlTWV0YWRhdGEgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQgcmViYXNlJylcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICB9LFxyXG4gIClcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGVtcG9yYXJ5QnJhbmNoKHsgcmVwb3NpdG9yeSwgdGVtcG9yYXJ5QnJhbmNoIH0pIHtcclxuICAvLyBkZWxldGUgdGVtcG9yYXJ5IGJyYW5jaFxyXG4gIHRyeSB7XHJcbiAgICBpZiAoZ2l0LkJyYW5jaC5pc0NoZWNrZWRPdXQodGVtcG9yYXJ5QnJhbmNoKSkgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZGVsZXRlIGEgY2hlY2tlZCBvdXQgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0uYClcclxuICAgIC8vIEJ5IHJlYXNzaWduaW5nIHRoZSB2YXJpYWJsZSBhbmQgbG9va2luZyB1cCB0aGUgYnJhbmNoIHRoZSBnYXJiYWdlIGNvbGxlY3RvciB3aWxsIGtpY2sgaW4uIFRoZSByZWZlcmVuY2UgZm9yIHRoZSBicmFuY2ggaW4gbGliZ2l0MiBzaG91bGRuJ3QgYmUgaW4gbWVtb3J5IGFzIG1lbnRpb25lZCBpbiBodHRwczovL2dpdGh1Yi5jb20vbGliZ2l0Mi9saWJnaXQyL2Jsb2IvODU5ZDkyMjkyZTAwOGE0ZDA0ZDY4ZmI2ZGMyMGExZGZhNjhlNDg3NC9pbmNsdWRlL2dpdDIvcmVmcy5oI0wzODUtTDM5OFxyXG4gICAgdGVtcG9yYXJ5QnJhbmNoID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgdGVtcG9yYXJ5QnJhbmNoTmFtZSwgMSkgLy8gcmVmZXJlc2ggdmFsdWUgb2YgdGVtcG9yYXJ5QnJhbmNoIC0gZm9yIHNvbWUgcmVhc29uIHVzaW5nIHRoZSBzYW1lIHJlZmVyZW5jZSBwcmV2ZW50cyBkZWxldGlvbiBvZiBicmFuY2guXHJcbiAgICBsZXQgZXJyb3IgPSBnaXQuQnJhbmNoLmRlbGV0ZSh0ZW1wb3JhcnlCcmFuY2gpXHJcbiAgICBpZiAoZXJyb3IpIHRocm93IG5ldyBFcnJvcihgQ29kZSB0aHJvd24gYnkgJ2xpYmdpdDInIGJpbmRpbmdzID0gJHtlcnJvcn1cXG4gXFx0Q2hlY2sgaHR0cHM6Ly93d3cubm9kZWdpdC5vcmcvYXBpL2Vycm9yLyNDT0RFYClcclxuICAgIGNvbnNvbGUubG9nKGDigKIgRGVsZXRlZCB0ZW1wb2FyYXJ5IGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9LmApXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IGVycm9yXHJcbiAgfVxyXG59XHJcbiJdfQ==