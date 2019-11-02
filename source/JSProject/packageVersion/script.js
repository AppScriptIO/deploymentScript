"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.bumpVersion = bumpVersion;exports.checkVersion = adapter;var _path = _interopRequireDefault(require("path"));

var _assert = _interopRequireDefault(require("assert"));
var _os = _interopRequireDefault(require("os"));
var _fs = _interopRequireDefault(require("fs"));
var _jsonfile = _interopRequireDefault(require("jsonfile"));
var _gitUrlParse = _interopRequireDefault(require("git-url-parse"));
var _semver = _interopRequireDefault(require("semver"));
var _lodash = require("lodash");
var _githubGraphql = require("./graphqlQuery/github.graphql.js");
var _createGraphqlClient = require("./utility/createGraphqlClient.js");
var _writeJsonFile = _interopRequireDefault(require("write-json-file"));
var _nestedObjectAssign = _interopRequireDefault(require("nested-object-assign"));
var _parseGitignore = _interopRequireDefault(require("parse-gitignore"));

var _nodegit = _interopRequireDefault(require("nodegit"));const dependencyKeyword = ['dependencies', 'devDependencies', 'peerDependencies'];


function lookupConfigFile({ targetProjectRoot, configName }) {
  let configPossiblePath = [_path.default.join(targetProjectRoot, configName), _path.default.join(targetProjectRoot, 'configuration', configName)];

  let configPathArray = configPossiblePath.filter(configPath => _fs.default.existsSync(configPath));
  (0, _assert.default)(configPathArray.length > 0, `• ${configName} lookup failed, file not found in the configuration possible paths - ${configPossiblePath}.`);
  return configPathArray[0];
}


async function bumpVersion({
  api,
  token,
  tagger })


{
  token || (token = process.env.GITHUB_TOKEN || lookupGithubToken({ sshPath: '/d/.ssh' }));
  (0, _assert.default)(token, `❌ Github access token must be supplied.`);

  const targetProjectConfig = api.project.configuration.configuration,
  targetProjectRoot = targetProjectConfig.directory.root,
  targetPackagePath = _path.default.join(targetProjectRoot, 'package.json');


  const repository = await _nodegit.default.Repository.open(targetProjectRoot);


  let taggerSignature = tagger ? _nodegit.default.Signature.now(tagger.name, tagger.email) : await _nodegit.default.Signature.default(repository);
  (0, _assert.default)(taggerSignature, `❌ Github username should be passed or found in the git local/system configs.`);


  let packageConfig = await _jsonfile.default.readFile(targetPackagePath).catch(error => console.error(error));


  let updatedVersion = _semver.default.inc(packageConfig.version, 'patch');


  console.log(`• Updating pacakge.json file ${targetPackagePath} with bumped version ${packageConfig.version} --> ${updatedVersion}`);
  packageConfig.version = updatedVersion;
  await (0, _writeJsonFile.default)(targetPackagePath, packageConfig);


  let gitIgnorePath = lookupConfigFile({ targetProjectRoot, configName: '.gitignore' });
  let gitIgnorePattern = (0, _parseGitignore.default)(_fs.default.readFileSync(gitIgnorePath)).map(item => _path.default.join('!' + item));


  console.log(`Adding changed files to index...`);
  let index = await repository.refreshIndex();
  let changedFileList = index.entries().map(item => item.path);
  let treeObject = await index.

  addAll([].concat(changedFileList, gitIgnorePattern)).
  then(() => index.write()).
  then(() => index.writeTree());

  let parentCommit = await repository.getHeadCommit();
  await repository.
  createCommit(
  'HEAD' || null,
  taggerSignature,
  taggerSignature,
  `📦 Bump package.json version.`,
  treeObject,
  [parentCommit]).

  then(oid => console.log(`• Commit created ${oid} for package.json version bump`));

  return updatedVersion;
}


function adapter(...args) {
  const { api } = args[0];
  args[0].targetProject = api.project;
  updateGithubPackage(...args).catch(error => console.error(error));
}




async function updateGithubPackage({
  targetProject,
  token,
  prereleaseType = false,
  shouldUpdatePackage = false } =
{}) {
  if (!token) token = process.env.GITHUB_TOKEN || lookupGithubToken();
  (0, _assert.default)(token, `❌ Github access token must be supplied.`);

  const targetProjectRoot = targetProject.configuration.rootPath,
  targetPackagePath = _path.default.join(targetProjectRoot, 'package.json');

  const graphqlClient = (0, _createGraphqlClient.createGraphqlClient)({ token, endpoint: _githubGraphql.githubGraphqlEndpoint });


  let packageConfig = await _jsonfile.default.readFile(targetPackagePath).catch(error => console.error(error));

  let didAnyRepoUpdate = false;


  let modifiedPackageObject = {};
  for (let keyName of dependencyKeyword) {
    if (!packageConfig[keyName]) continue;
    let dependencyList = packageConfig[keyName];


    let githubDependency = filterGithubDependency({ dependencyList });
    for (let [index, repositoryUrl] of Object.entries(githubDependency)) {
      const parsedUrl = (0, _gitUrlParse.default)(repositoryUrl),
      currentUrlVersion = parsedUrl.hash && parsedUrl.hash.replace('semver:', '');
      if (!currentUrlVersion) continue;
      if (!_semver.default.valid(currentUrlVersion) && _semver.default.validRange(currentUrlVersion)) {
        console.log(`Skipping "${repositoryUrl}" with range semver ${currentUrlVersion} `);
        continue;
      }

      let releaseList = await queryReleaseUsingUrl({ graphqlClient, repositoryUrl });
      if (!releaseList.length) continue;

      filterComparableRelease({ releaseList: { reference: releaseList } });

      if (prereleaseType) {

        (0, _lodash.remove)(releaseList, value => {
          let prereleaseComponent = _semver.default.prerelease(value.tag.name);
          return prereleaseComponent && prereleaseComponent.includes(prereleaseType) ? false : true;
        });
      } else {

        (0, _lodash.remove)(releaseList, value => Boolean(_semver.default.prerelease(value.tag.name)));
      }

      let latestRelease = pickLatestRelease({ releaseList });


      let shouldUpdateVerion = false;
      if (currentUrlVersion && latestRelease) {
        console.log(`Comparing package.json version %s with latest release %s:`, currentUrlVersion, latestRelease);
        shouldUpdateVerion = _semver.default.gt(latestRelease, currentUrlVersion);
      }

      if (shouldUpdateVerion) {
        didAnyRepoUpdate = true;
        githubDependency[index] = updateVersion({ parsedUrl, newVersion: latestRelease });
      } else {
        console.log(`• Git URI ${repositoryUrl} is up to date. Current "%s" - latest "%s":`, currentUrlVersion, latestRelease);
      }
    }


    modifiedPackageObject[keyName] = githubDependency;
  }

  if (didAnyRepoUpdate) {

    let mergedPackageObject = (0, _nestedObjectAssign.default)(packageConfig, modifiedPackageObject);
    if (shouldUpdatePackage) {
      await (0, _writeJsonFile.default)(targetPackagePath, mergedPackageObject);
      console.log(`• Package.json file was updated with the latest Git packages.`);
    } else {
      console.log(`• Pacakge object with updated versions:`);
      console.dir(mergedPackageObject);
    }
  } else console.log(`• No repository needs update.`);
}


function lookupGithubToken({ sshPath = _path.default.join(_os.default.homedir(), '.ssh'), tokenFileName = 'github_token' } = {}) {
  const tokenFile = _path.default.join(sshPath, tokenFileName);
  return _fs.default.readFileSync(tokenFile).toString();
}


function filterGithubDependency({ dependencyList }) {
  return (0, _lodash.pickBy)(dependencyList, (value, index) => {
    let parsedUrl = (0, _gitUrlParse.default)(value);
    return parsedUrl.resource == 'github.com';
  });
}


async function queryReleaseUsingUrl({ graphqlClient, repositoryUrl }) {
  let parsedUrl = (0, _gitUrlParse.default)(repositoryUrl),
  currentUrlVersion = parsedUrl.hash;

  let releaseArray = await graphqlClient.
  query({
    query: _githubGraphql.getReleases,
    variables: {
      repoURL: repositoryUrl } }).


  then(response => {
    return response.data.resource.releases.edges.map((value, index) => {
      return value.node;
    });
  }).
  catch(error => {
    throw error;
  });

  return releaseArray;
}

function pickLatestRelease({ releaseList }) {
  releaseList.sort((current, next) => {
    return _semver.default.gt(current.tag.name, next.tag.name) ? -1 : 1;
  });
  return releaseList[0].tag.name;
}


function filterComparableRelease({ releaseList = { reference: [] } }) {

  (0, _lodash.remove)(releaseList.reference, value => Boolean(value.isPrerelease || value.isDraft));

  (0, _lodash.remove)(releaseList.reference, value => !Boolean(_semver.default.valid(value.tag.name)));

  (0, _lodash.remove)(releaseList.reference, value => !Boolean(value.tag));
}

function updateVersion({ parsedUrl, newVersion: latestRelease }) {
  let semverPrefix = parsedUrl.hash.includes('semver:') ? 'semver:' : '';

  return `${_gitUrlParse.default.stringify(parsedUrl)}#${semverPrefix}${latestRelease}`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcGFja2FnZVZlcnNpb24vc2NyaXB0LmpzIl0sIm5hbWVzIjpbImRlcGVuZGVuY3lLZXl3b3JkIiwibG9va3VwQ29uZmlnRmlsZSIsInRhcmdldFByb2plY3RSb290IiwiY29uZmlnTmFtZSIsImNvbmZpZ1Bvc3NpYmxlUGF0aCIsInBhdGgiLCJqb2luIiwiY29uZmlnUGF0aEFycmF5IiwiZmlsdGVyIiwiY29uZmlnUGF0aCIsImZpbGVzeXN0ZW0iLCJleGlzdHNTeW5jIiwibGVuZ3RoIiwiYnVtcFZlcnNpb24iLCJhcGkiLCJ0b2tlbiIsInRhZ2dlciIsInByb2Nlc3MiLCJlbnYiLCJHSVRIVUJfVE9LRU4iLCJsb29rdXBHaXRodWJUb2tlbiIsInNzaFBhdGgiLCJ0YXJnZXRQcm9qZWN0Q29uZmlnIiwicHJvamVjdCIsImNvbmZpZ3VyYXRpb24iLCJkaXJlY3RvcnkiLCJyb290IiwidGFyZ2V0UGFja2FnZVBhdGgiLCJyZXBvc2l0b3J5IiwiZ2l0IiwiUmVwb3NpdG9yeSIsIm9wZW4iLCJ0YWdnZXJTaWduYXR1cmUiLCJTaWduYXR1cmUiLCJub3ciLCJuYW1lIiwiZW1haWwiLCJkZWZhdWx0IiwicGFja2FnZUNvbmZpZyIsIm1vZGlmeUpzb24iLCJyZWFkRmlsZSIsImNhdGNoIiwiZXJyb3IiLCJjb25zb2xlIiwidXBkYXRlZFZlcnNpb24iLCJzZW1hbnRpY1ZlcnNpb25lciIsImluYyIsInZlcnNpb24iLCJsb2ciLCJnaXRJZ25vcmVQYXRoIiwiZ2l0SWdub3JlUGF0dGVybiIsInJlYWRGaWxlU3luYyIsIm1hcCIsIml0ZW0iLCJpbmRleCIsInJlZnJlc2hJbmRleCIsImNoYW5nZWRGaWxlTGlzdCIsImVudHJpZXMiLCJ0cmVlT2JqZWN0IiwiYWRkQWxsIiwiY29uY2F0IiwidGhlbiIsIndyaXRlIiwid3JpdGVUcmVlIiwicGFyZW50Q29tbWl0IiwiZ2V0SGVhZENvbW1pdCIsImNyZWF0ZUNvbW1pdCIsIm9pZCIsImFkYXB0ZXIiLCJhcmdzIiwidGFyZ2V0UHJvamVjdCIsInVwZGF0ZUdpdGh1YlBhY2thZ2UiLCJwcmVyZWxlYXNlVHlwZSIsInNob3VsZFVwZGF0ZVBhY2thZ2UiLCJyb290UGF0aCIsImdyYXBocWxDbGllbnQiLCJlbmRwb2ludCIsImdpdGh1YkdyYXBocWxFbmRwb2ludCIsImRpZEFueVJlcG9VcGRhdGUiLCJtb2RpZmllZFBhY2thZ2VPYmplY3QiLCJrZXlOYW1lIiwiZGVwZW5kZW5jeUxpc3QiLCJnaXRodWJEZXBlbmRlbmN5IiwiZmlsdGVyR2l0aHViRGVwZW5kZW5jeSIsInJlcG9zaXRvcnlVcmwiLCJPYmplY3QiLCJwYXJzZWRVcmwiLCJjdXJyZW50VXJsVmVyc2lvbiIsImhhc2giLCJyZXBsYWNlIiwidmFsaWQiLCJ2YWxpZFJhbmdlIiwicmVsZWFzZUxpc3QiLCJxdWVyeVJlbGVhc2VVc2luZ1VybCIsImZpbHRlckNvbXBhcmFibGVSZWxlYXNlIiwicmVmZXJlbmNlIiwidmFsdWUiLCJwcmVyZWxlYXNlQ29tcG9uZW50IiwicHJlcmVsZWFzZSIsInRhZyIsImluY2x1ZGVzIiwiQm9vbGVhbiIsImxhdGVzdFJlbGVhc2UiLCJwaWNrTGF0ZXN0UmVsZWFzZSIsInNob3VsZFVwZGF0ZVZlcmlvbiIsImd0IiwidXBkYXRlVmVyc2lvbiIsIm5ld1ZlcnNpb24iLCJtZXJnZWRQYWNrYWdlT2JqZWN0IiwiZGlyIiwib3MiLCJob21lZGlyIiwidG9rZW5GaWxlTmFtZSIsInRva2VuRmlsZSIsInRvU3RyaW5nIiwicmVzb3VyY2UiLCJyZWxlYXNlQXJyYXkiLCJxdWVyeSIsImdldFJlbGVhc2VzIiwidmFyaWFibGVzIiwicmVwb1VSTCIsInJlc3BvbnNlIiwiZGF0YSIsInJlbGVhc2VzIiwiZWRnZXMiLCJub2RlIiwic29ydCIsImN1cnJlbnQiLCJuZXh0IiwiaXNQcmVyZWxlYXNlIiwiaXNEcmFmdCIsInNlbXZlclByZWZpeCIsImdpdFVybFBhcnNlciIsInN0cmluZ2lmeSJdLCJtYXBw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T0FBN0IsQ0FBekQ7O0FBRUEsc0JBQWtCdEMsV0FBVyxDQUFDRyxTQUE5QixFQUF5Q0MsS0FBSyxJQUFJLENBQUNLLE9BQU8sQ0FBQ3hELGdCQUFrQjZDLEtBQWxCLENBQXdCTSxLQUFLLENBQUNHLEdBQU4sQ0FBVWhFLElBQWxDLENBQUQsQ0FBMUQ7O0FBRUEsc0JBQWtCeUQsV0FBVyxDQUFDRyxTQUE5QixFQUF5Q0MsS0FBSyxJQUFJLENBQUNLLE9BQU8sQ0FBQ0wsS0FBSyxDQUFDRyxHQUFQLENBQTFEO0FBQ0Q7O0FBRUQsU0FBU08sYUFBVCxDQUF1QixFQUFFcEIsU0FBRixFQUFhcUIsVUFBVSxFQUFFTCxhQUF6QixFQUF2QixFQUFpRTtBQUMvRCxNQUFJNkIsWUFBWSxHQUFHN0MsU0FBUyxDQUFDRSxJQUFWLENBQWVZLFFBQWYsQ0FBd0IsU0FBeEIsSUFBcUMsU0FBckMsR0FBaUQsRUFBcEU7O0FBRUEsU0FBUSxHQUFFZ0MscUJBQWFDLFNBQWIsQ0FBdUIvQyxTQUF2QixDQUFrQyxJQUFHNkMsWUFBYSxHQUFFN0IsYUFBYyxFQUE1RTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcclxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXHJcbmltcG9ydCBvcyBmcm9tICdvcydcclxuaW1wb3J0IGZpbGVzeXN0ZW0gZnJvbSAnZnMnXHJcbmltcG9ydCBtb2RpZnlKc29uIGZyb20gJ2pzb25maWxlJ1xyXG5pbXBvcnQgZ2l0VXJsUGFyc2VyIGZyb20gJ2dpdC11cmwtcGFyc2UnXHJcbmltcG9ydCBzZW1hbnRpY1ZlcnNpb25lciBmcm9tICdzZW12ZXInXHJcbmltcG9ydCB7IHBpY2tCeSwgcmVtb3ZlIGFzIHJlbW92ZU11dGF0ZUFycmF5IH0gZnJvbSAnbG9kYXNoJ1xyXG5pbXBvcnQgeyBnZXRSZWxlYXNlcywgZ2l0aHViR3JhcGhxbEVuZHBvaW50IH0gZnJvbSAnLi9ncmFwaHFsUXVlcnkvZ2l0aHViLmdyYXBocWwuanMnXHJcbmltcG9ydCB7IGNyZWF0ZUdyYXBocWxDbGllbnQgfSBmcm9tICcuL3V0aWxpdHkvY3JlYXRlR3JhcGhxbENsaWVudC5qcydcclxuaW1wb3J0IHdyaXRlSnNvbkZpbGUgZnJvbSAnd3JpdGUtanNvbi1maWxlJ1xyXG5pbXBvcnQgbmVzdGVkT2JqZWN0QXNzaWduIGZyb20gJ25lc3RlZC1vYmplY3QtYXNzaWduJ1xyXG5pbXBvcnQgcGFyc2VHaXRJZ25vcmUgZnJvbSAncGFyc2UtZ2l0aWdub3JlJ1xyXG5jb25zdCBkZXBlbmRlbmN5S2V5d29yZCA9IFsnZGVwZW5kZW5jaWVzJywgJ2RldkRlcGVuZGVuY2llcycsICdwZWVyRGVwZW5kZW5jaWVzJ10gLy8gcGFja2FnZS5qc29uIGRlcGVuZGVuY2llcyBrZXkgdmFsdWVzXHJcbmltcG9ydCB7IGRlZmF1bHQgYXMgZ2l0LCBDb21taXQsIFJlcG9zaXRvcnksIFJlZmVyZW5jZSwgQnJhbmNoLCBTaWduYXR1cmUsIFJlc2V0LCBTdGFzaCB9IGZyb20gJ25vZGVnaXQnXHJcblxyXG4vLyBUT0RPOiBNb3ZlIGxvb2t1cENPbmZpZ0ZpbGUgdG8gY29uZmlndXJhdGlvbk1hbmFnZW1lbnQgcmVwb3NpdG9yeS5cclxuZnVuY3Rpb24gbG9va3VwQ29uZmlnRmlsZSh7IHRhcmdldFByb2plY3RSb290LCBjb25maWdOYW1lIH0pIHtcclxuICBsZXQgY29uZmlnUG9zc2libGVQYXRoID0gW3BhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZSksIHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgJ2NvbmZpZ3VyYXRpb24nLCBjb25maWdOYW1lKV1cclxuICAvLyBmaW5kIGV4aXN0aW5nIGNvbmZpZyBmaWxlXHJcbiAgbGV0IGNvbmZpZ1BhdGhBcnJheSA9IGNvbmZpZ1Bvc3NpYmxlUGF0aC5maWx0ZXIoY29uZmlnUGF0aCA9PiBmaWxlc3lzdGVtLmV4aXN0c1N5bmMoY29uZmlnUGF0aCkpXHJcbiAgYXNzZXJ0KGNvbmZpZ1BhdGhBcnJheS5sZW5ndGggPiAwLCBg4oCiICR7Y29uZmlnTmFtZX0gbG9va3VwIGZhaWxlZCwgZmlsZSBub3QgZm91bmQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gcG9zc2libGUgcGF0aHMgLSAke2NvbmZpZ1Bvc3NpYmxlUGF0aH0uYClcclxuICByZXR1cm4gY29uZmlnUGF0aEFycmF5WzBdXHJcbn1cclxuXHJcbi8qKiBpbmNyZWFzZSBwYWNrYWdlLmpzb24gdmVyc2lvbiB0byBwcmVwYXJlIGZvciBuZXcgcmVsZWFzZSAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVtcFZlcnNpb24oe1xyXG4gIGFwaSxcclxuICB0b2tlbiwgLy8gZ2l0aHViIHRva2VuIGZvciBHcmFwaHFsIEFQSVxyXG4gIHRhZ2dlcixcclxufToge1xyXG4gIHRhZ2dlcjogeyBuYW1lOiAnJywgZW1haWw6ICcnIH0sXHJcbn0pIHtcclxuICB0b2tlbiB8fD0gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IGxvb2t1cEdpdGh1YlRva2VuKHsgc3NoUGF0aDogJy9kLy5zc2gnIH0pXHJcbiAgYXNzZXJ0KHRva2VuLCBg4p2MIEdpdGh1YiBhY2Nlc3MgdG9rZW4gbXVzdCBiZSBzdXBwbGllZC5gKVxyXG5cclxuICBjb25zdCB0YXJnZXRQcm9qZWN0Q29uZmlnID0gYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLFxyXG4gICAgdGFyZ2V0UHJvamVjdFJvb3QgPSB0YXJnZXRQcm9qZWN0Q29uZmlnLmRpcmVjdG9yeS5yb290LFxyXG4gICAgdGFyZ2V0UGFja2FnZVBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UHJvamVjdFJvb3QsICdwYWNrYWdlLmpzb24nKVxyXG5cclxuICAvLyBjb21taXQgY2hhbmdlc1xyXG4gIGNvbnN0IHJlcG9zaXRvcnkgPSBhd2FpdCBnaXQuUmVwb3NpdG9yeS5vcGVuKHRhcmdldFByb2plY3RSb290KVxyXG5cclxuICAvLyBsb2FkIHRhZ2dlclNpZ25hdHVyZSBzaWduYXR1cmVcclxuICBsZXQgdGFnZ2VyU2lnbmF0dXJlID0gdGFnZ2VyID8gZ2l0LlNpZ25hdHVyZS5ub3codGFnZ2VyLm5hbWUsIHRhZ2dlci5lbWFpbCkgOiBhd2FpdCBnaXQuU2lnbmF0dXJlLmRlZmF1bHQocmVwb3NpdG9yeSlcclxuICBhc3NlcnQodGFnZ2VyU2lnbmF0dXJlLCBg4p2MIEdpdGh1YiB1c2VybmFtZSBzaG91bGQgYmUgcGFzc2VkIG9yIGZvdW5kIGluIHRoZSBnaXQgbG9jYWwvc3lzdGVtIGNvbmZpZ3MuYClcclxuXHJcbiAgLy8gcmVhZCBwYWNrYWdlLmpzb24gZmlsZVxyXG4gIGxldCBwYWNrYWdlQ29uZmlnID0gYXdhaXQgbW9kaWZ5SnNvbi5yZWFkRmlsZSh0YXJnZXRQYWNrYWdlUGF0aCkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcblxyXG4gIC8vIGJ1bXAgdmVyc2lvblxyXG4gIGxldCB1cGRhdGVkVmVyc2lvbiA9IHNlbWFudGljVmVyc2lvbmVyLmluYyhwYWNrYWdlQ29uZmlnLnZlcnNpb24sICdwYXRjaCcpIC8vIGluY3JlbWVudCB2ZXJzaW9uIGJ5IHJlbGVhc2UgdHlwZSAtIHJlbGVhc2UgdHlwZSAobWFqb3IsIHByZW1ham9yLCBtaW5vciwgcHJlbWlub3IsIHBhdGNoLCBwcmVwYXRjaCwgb3IgcHJlcmVsZWFzZSkuXHJcblxyXG4gIC8vIHVwZGF0ZSBwYWNha2dlLmpzb25cclxuICBjb25zb2xlLmxvZyhg4oCiIFVwZGF0aW5nIHBhY2FrZ2UuanNvbiBmaWxlICR7dGFyZ2V0UGFja2FnZVBhdGh9IHdpdGggYnVtcGVkIHZlcnNpb24gJHtwYWNrYWdlQ29uZmlnLnZlcnNpb259IC0tPiAke3VwZGF0ZWRWZXJzaW9ufWApXHJcbiAgcGFja2FnZUNvbmZpZy52ZXJzaW9uID0gdXBkYXRlZFZlcnNpb25cclxuICBhd2FpdCB3cml0ZUpzb25GaWxlKHRhcmdldFBhY2thZ2VQYXRoLCBwYWNrYWdlQ29uZmlnKVxyXG5cclxuICAvLyBnZXQgZ2l0SWdub3JlIGZpbGUgcGF0dGVybnNcclxuICBsZXQgZ2l0SWdub3JlUGF0aCA9IGxvb2t1cENvbmZpZ0ZpbGUoeyB0YXJnZXRQcm9qZWN0Um9vdCwgY29uZmlnTmFtZTogJy5naXRpZ25vcmUnIH0pXHJcbiAgbGV0IGdpdElnbm9yZVBhdHRlcm4gPSBwYXJzZUdpdElnbm9yZShmaWxlc3lzdGVtLnJlYWRGaWxlU3luYyhnaXRJZ25vcmVQYXRoKSkubWFwKGl0ZW0gPT4gcGF0aC5qb2luKCchJyArIGl0ZW0pKVxyXG5cclxuICAvLyBDcmVhdGUgY29tbWl0IG9mIGFsbCBmaWxlcy5cclxuICBjb25zb2xlLmxvZyhgQWRkaW5nIGNoYW5nZWQgZmlsZXMgdG8gaW5kZXguLi5gKVxyXG4gIGxldCBpbmRleCA9IGF3YWl0IHJlcG9zaXRvcnkucmVmcmVzaEluZGV4KCkgLy8gaW52YWxpZGF0ZXMgYW5kIGdyYWJzIG5ldyBpbmRleCBmcm9tIHJlcG9zaXRvcnkuXHJcbiAgbGV0IGNoYW5nZWRGaWxlTGlzdCA9IGluZGV4LmVudHJpZXMoKS5tYXAoaXRlbSA9PiBpdGVtLnBhdGgpIC8vIGdldCBsaXN0IG9mIGFsbCBjaGFuZ2VzIG9mIGZpbGVzLlxyXG4gIGxldCB0cmVlT2JqZWN0ID0gYXdhaXQgaW5kZXhcclxuICAgIC8vIE5vdGU6IGBhZGRBbGwoWycqKicsIC4uLmdpdElnbm9yZVBhdHRlcm5dKWAgZm9yIHNvbWUgcmVhc29uIHN0b3BwZWQgd29ya2luZywgdGhlcmUgZm9yIGV4YWN0IGZpbGUgY2hhbmdlcyBsaXN0IGlzIHVzZWQgaW5zdGVhZCBvZiBhIGZpbGUgcGF0aCBwYXR0ZXJuLlxyXG4gICAgLmFkZEFsbChbXS5jb25jYXQoY2hhbmdlZEZpbGVMaXN0LCBnaXRJZ25vcmVQYXR0ZXJuKSlcclxuICAgIC50aGVuKCgpID0+IGluZGV4LndyaXRlKCkpXHJcbiAgICAudGhlbigoKSA9PiBpbmRleC53cml0ZVRyZWUoKSkgLy8gYWRkIGZpbGVzIGFuZCBjcmVhdGUgYSB0cmVlIG9iamVjdC5cclxuXHJcbiAgbGV0IHBhcmVudENvbW1pdCA9IGF3YWl0IHJlcG9zaXRvcnkuZ2V0SGVhZENvbW1pdCgpIC8vIGdldCBsYXRlc3QgY29tbWl0XHJcbiAgYXdhaXQgcmVwb3NpdG9yeVxyXG4gICAgLmNyZWF0ZUNvbW1pdChcclxuICAgICAgJ0hFQUQnIC8qIHVwZGF0ZSB0aGUgSEVBRCByZWZlcmVuY2UgLSBzbyB0aGF0IHRoZSBIRUFEIHdpbGwgcG9pbnQgdG8gdGhlIGxhdGVzdCBnaXQgKi8gfHwgbnVsbCAvKiBkbyBub3QgdXBkYXRlIHJlZiAqLyxcclxuICAgICAgdGFnZ2VyU2lnbmF0dXJlLFxyXG4gICAgICB0YWdnZXJTaWduYXR1cmUsXHJcbiAgICAgIGDwn5OmIEJ1bXAgcGFja2FnZS5qc29uIHZlcnNpb24uYCxcclxuICAgICAgdHJlZU9iamVjdCxcclxuICAgICAgW3BhcmVudENvbW1pdF0sXHJcbiAgICApXHJcbiAgICAudGhlbihvaWQgPT4gY29uc29sZS5sb2coYOKAoiBDb21taXQgY3JlYXRlZCAke29pZH0gZm9yIHBhY2thZ2UuanNvbiB2ZXJzaW9uIGJ1bXBgKSlcclxuXHJcbiAgcmV0dXJuIHVwZGF0ZWRWZXJzaW9uXHJcbn1cclxuXHJcbi8vIGFkYXB0ZXIgdG8gdGhlIHNjcmlwdE1hbmFnZXIgYXBpLlxyXG5mdW5jdGlvbiBhZGFwdGVyKC4uLmFyZ3MpIHtcclxuICBjb25zdCB7IGFwaSAvKiBzdXBwbGllZCBieSBzY3JpcHRNYW5hZ2VyICovIH0gPSBhcmdzWzBdXHJcbiAgYXJnc1swXS50YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3QgLy8gYWRhcHRlciBmb3Igd29ya2luZyB3aXRoIHRhcmdldCBmdW5jdGlvbiBpbnRlcmZhY2UuXHJcbiAgdXBkYXRlR2l0aHViUGFja2FnZSguLi5hcmdzKS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSlcclxufVxyXG5leHBvcnQgeyBhZGFwdGVyIGFzIGNoZWNrVmVyc2lvbiB9XHJcbi8qKlxyXG4gKiBVcGRhdGUgZ2l0aHViIGRlcGVuZGVuY2llcyBpbiBwYWNrYWdlLmpzb24gZmlsZXMsIHVzaW5nIHRoZSBnaXRodWIgYXBpIHRoYXQgY2hlY2tzIGZvciB0aGUgbGF0ZXN0IGdpdGh1YiByZWxlYXNlIGFuZCBjb21wYXJlcyBpdCB0byBsb2NhbCBzZW12ZXIgdmVyc2lvbi5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUdpdGh1YlBhY2thZ2Uoe1xyXG4gIHRhcmdldFByb2plY3QsIC8vIHRhcmdldCBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpbnN0YW5jZS5cclxuICB0b2tlbiwgLy8gZ2l0aHViIHRva2VuIGZvciBHcmFwaHFsIEFQSVxyXG4gIHByZXJlbGVhc2VUeXBlID0gZmFsc2UsIC8vIGV4YW1wbGUgcHJlcmVsZWFzZVR5cGU9J2Rpc3RyaWJ1dGlvbicgbWF0Y2hlcyBhbGwgeC54LngtPC4uLj5kaXN0cmlidXRpb248Li4uPlxyXG4gIHNob3VsZFVwZGF0ZVBhY2thZ2UgPSBmYWxzZSxcclxufSA9IHt9KSB7XHJcbiAgaWYgKCF0b2tlbikgdG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgbG9va3VwR2l0aHViVG9rZW4oKVxyXG4gIGFzc2VydCh0b2tlbiwgYOKdjCBHaXRodWIgYWNjZXNzIHRva2VuIG11c3QgYmUgc3VwcGxpZWQuYClcclxuXHJcbiAgY29uc3QgdGFyZ2V0UHJvamVjdFJvb3QgPSB0YXJnZXRQcm9qZWN0LmNvbmZpZ3VyYXRpb24ucm9vdFBhdGgsXHJcbiAgICB0YXJnZXRQYWNrYWdlUGF0aCA9IHBhdGguam9pbih0YXJnZXRQcm9qZWN0Um9vdCwgJ3BhY2thZ2UuanNvbicpXHJcblxyXG4gIGNvbnN0IGdyYXBocWxDbGllbnQgPSBjcmVhdGVHcmFwaHFsQ2xpZW50KHsgdG9rZW4sIGVuZHBvaW50OiBnaXRodWJHcmFwaHFsRW5kcG9pbnQgfSlcclxuXHJcbiAgLy8gcmVhZCBwYWNrYWdlLmpzb24gZmlsZVxyXG4gIGxldCBwYWNrYWdlQ29uZmlnID0gYXdhaXQgbW9kaWZ5SnNvbi5yZWFkRmlsZSh0YXJnZXRQYWNrYWdlUGF0aCkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcblxyXG4gIGxldCBkaWRBbnlSZXBvVXBkYXRlID0gZmFsc2VcclxuXHJcbiAgLy8gbG9vcCBkZXBlbmRlbmNpZXNcclxuICBsZXQgbW9kaWZpZWRQYWNrYWdlT2JqZWN0ID0ge31cclxuICBmb3IgKGxldCBrZXlOYW1lIG9mIGRlcGVuZGVuY3lLZXl3b3JkKSB7XHJcbiAgICBpZiAoIXBhY2thZ2VDb25maWdba2V5TmFtZV0pIGNvbnRpbnVlXHJcbiAgICBsZXQgZGVwZW5kZW5jeUxpc3QgPSBwYWNrYWdlQ29uZmlnW2tleU5hbWVdXHJcblxyXG4gICAgLy8gZmlsdGVyIGRlcGVuZGVuY2llcyB0aGF0IGFyZSBmcm9tIGdpdGh1YiBvbmx5XHJcbiAgICBsZXQgZ2l0aHViRGVwZW5kZW5jeSA9IGZpbHRlckdpdGh1YkRlcGVuZGVuY3koeyBkZXBlbmRlbmN5TGlzdCB9KVxyXG4gICAgZm9yIChsZXQgW2luZGV4LCByZXBvc2l0b3J5VXJsXSBvZiBPYmplY3QuZW50cmllcyhnaXRodWJEZXBlbmRlbmN5KSkge1xyXG4gICAgICBjb25zdCBwYXJzZWRVcmwgPSBnaXRVcmxQYXJzZXIocmVwb3NpdG9yeVVybCksXHJcbiAgICAgICAgY3VycmVudFVybFZlcnNpb24gPSBwYXJzZWRVcmwuaGFzaCAmJiBwYXJzZWRVcmwuaGFzaC5yZXBsYWNlKCdzZW12ZXI6JywgJycpIC8vIFNwZWNpZmljIHVzZSBjYXNlIC0gcmVtb3ZlIFwic2VtdmVyOlwiIGZyb20gaGFzaC4gVGhpcyBpcyB1c2VkIHRvIHN1cHBvcnQgZ2l0aHViIHNlbXZlciB2ZXJzaW9ucyBpbiBucG0uXHJcbiAgICAgIGlmICghY3VycmVudFVybFZlcnNpb24pIGNvbnRpbnVlIC8vIHNraXAgdXJscyB3aXRob3V0IHNwZWNpZmljIHZlcnNpb25cclxuICAgICAgaWYgKCFzZW1hbnRpY1ZlcnNpb25lci52YWxpZChjdXJyZW50VXJsVmVyc2lvbikgJiYgc2VtYW50aWNWZXJzaW9uZXIudmFsaWRSYW5nZShjdXJyZW50VXJsVmVyc2lvbikpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgU2tpcHBpbmcgXCIke3JlcG9zaXRvcnlVcmx9XCIgd2l0aCByYW5nZSBzZW12ZXIgJHtjdXJyZW50VXJsVmVyc2lvbn0gYClcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9IC8vIHNraXAgcmFuZ2VzXHJcblxyXG4gICAgICBsZXQgcmVsZWFzZUxpc3QgPSBhd2FpdCBxdWVyeVJlbGVhc2VVc2luZ1VybCh7IGdyYXBocWxDbGllbnQsIHJlcG9zaXRvcnlVcmwgfSlcclxuICAgICAgaWYgKCFyZWxlYXNlTGlzdC5sZW5ndGgpIGNvbnRpbnVlIC8vIHNraXBcclxuICAgICAgLy8gZmlsdGVyIGNvbXBlcmFibGUgJiBzZW12ZXIgdmVyc2lvbmVkIHRhZ3Mgb25seVxyXG4gICAgICBmaWx0ZXJDb21wYXJhYmxlUmVsZWFzZSh7IHJlbGVhc2VMaXN0OiB7IHJlZmVyZW5jZTogcmVsZWFzZUxpc3QgfSB9KVxyXG4gICAgICAvLyBmaWx0ZXIgdGFncyB3aXRoIHByZXJlbGVhc2UgKGluY2x1ZGUgb3IgZXhjbHVkZSlcclxuICAgICAgaWYgKHByZXJlbGVhc2VUeXBlKSB7XHJcbiAgICAgICAgLy8ga2VlcCBvbmx5IHRhZ3MgdGhhdCBpbmNsdWRlIGEgc3BlY2lmaWMgcHJlcmVsZWFzZSB0eXBlLlxyXG4gICAgICAgIHJlbW92ZU11dGF0ZUFycmF5KHJlbGVhc2VMaXN0LCB2YWx1ZSA9PiB7XHJcbiAgICAgICAgICBsZXQgcHJlcmVsZWFzZUNvbXBvbmVudCA9IHNlbWFudGljVmVyc2lvbmVyLnByZXJlbGVhc2UodmFsdWUudGFnLm5hbWUpXHJcbiAgICAgICAgICByZXR1cm4gcHJlcmVsZWFzZUNvbXBvbmVudCAmJiBwcmVyZWxlYXNlQ29tcG9uZW50LmluY2x1ZGVzKHByZXJlbGVhc2VUeXBlKSA/IGZhbHNlIDogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gZmlsdGVyIHZlcnNpb25zIHRoYXQgaW5jbHVkZXMgcHJlcmVsZWFzZSB0eXBlICh4LngueC08cHJlcmVsZWFzZVR5cD4pXHJcbiAgICAgICAgcmVtb3ZlTXV0YXRlQXJyYXkocmVsZWFzZUxpc3QsIHZhbHVlID0+IEJvb2xlYW4oc2VtYW50aWNWZXJzaW9uZXIucHJlcmVsZWFzZSh2YWx1ZS50YWcubmFtZSkpKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgbGF0ZXN0UmVsZWFzZSA9IHBpY2tMYXRlc3RSZWxlYXNlKHsgcmVsZWFzZUxpc3QgfSlcclxuXHJcbiAgICAgIC8vIGNvbXBhcmUgc2VtdmVyIHZlcnNpb25zXHJcbiAgICAgIGxldCBzaG91bGRVcGRhdGVWZXJpb24gPSBmYWxzZVxyXG4gICAgICBpZiAoY3VycmVudFVybFZlcnNpb24gJiYgbGF0ZXN0UmVsZWFzZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBDb21wYXJpbmcgcGFja2FnZS5qc29uIHZlcnNpb24gJXMgd2l0aCBsYXRlc3QgcmVsZWFzZSAlczpgLCBjdXJyZW50VXJsVmVyc2lvbiwgbGF0ZXN0UmVsZWFzZSlcclxuICAgICAgICBzaG91bGRVcGRhdGVWZXJpb24gPSBzZW1hbnRpY1ZlcnNpb25lci5ndChsYXRlc3RSZWxlYXNlLCBjdXJyZW50VXJsVmVyc2lvbilcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNob3VsZFVwZGF0ZVZlcmlvbikge1xyXG4gICAgICAgIGRpZEFueVJlcG9VcGRhdGUgPSB0cnVlXHJcbiAgICAgICAgZ2l0aHViRGVwZW5kZW5jeVtpbmRleF0gPSB1cGRhdGVWZXJzaW9uKHsgcGFyc2VkVXJsLCBuZXdWZXJzaW9uOiBsYXRlc3RSZWxlYXNlIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYOKAoiBHaXQgVVJJICR7cmVwb3NpdG9yeVVybH0gaXMgdXAgdG8gZGF0ZS4gQ3VycmVudCBcIiVzXCIgLSBsYXRlc3QgXCIlc1wiOmAsIGN1cnJlbnRVcmxWZXJzaW9uLCBsYXRlc3RSZWxlYXNlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgbmV3IGxpc3Qgd2l0aCB1cGRhdGVkIHZlcnNpb25zXHJcbiAgICBtb2RpZmllZFBhY2thZ2VPYmplY3Rba2V5TmFtZV0gPSBnaXRodWJEZXBlbmRlbmN5XHJcbiAgfVxyXG5cclxuICBpZiAoZGlkQW55UmVwb1VwZGF0ZSkge1xyXG4gICAgLy8gdXBkYXRlIHBhY2FrZ2UuanNvblxyXG4gICAgbGV0IG1lcmdlZFBhY2thZ2VPYmplY3QgPSBuZXN0ZWRPYmplY3RBc3NpZ24ocGFja2FnZUNvbmZpZywgbW9kaWZpZWRQYWNrYWdlT2JqZWN0KVxyXG4gICAgaWYgKHNob3VsZFVwZGF0ZVBhY2thZ2UpIHtcclxuICAgICAgYXdhaXQgd3JpdGVKc29uRmlsZSh0YXJnZXRQYWNrYWdlUGF0aCwgbWVyZ2VkUGFja2FnZU9iamVjdClcclxuICAgICAgY29uc29sZS5sb2coYOKAoiBQYWNrYWdlLmpzb24gZmlsZSB3YXMgdXBkYXRlZCB3aXRoIHRoZSBsYXRlc3QgR2l0IHBhY2thZ2VzLmApXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIFBhY2FrZ2Ugb2JqZWN0IHdpdGggdXBkYXRlZCB2ZXJzaW9uczpgKVxyXG4gICAgICBjb25zb2xlLmRpcihtZXJnZWRQYWNrYWdlT2JqZWN0KVxyXG4gICAgfVxyXG4gIH0gZWxzZSBjb25zb2xlLmxvZyhg4oCiIE5vIHJlcG9zaXRvcnkgbmVlZHMgdXBkYXRlLmApXHJcbn1cclxuXHJcbi8vIFJlYWQgZ2l0aHViIHRva2VuIGZyb20gT1MgdXNlcidzIGZvbGRlci5cclxuZnVuY3Rpb24gbG9va3VwR2l0aHViVG9rZW4oeyBzc2hQYXRoID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5zc2gnKSwgdG9rZW5GaWxlTmFtZSA9ICdnaXRodWJfdG9rZW4nIH0gPSB7fSkge1xyXG4gIGNvbnN0IHRva2VuRmlsZSA9IHBhdGguam9pbihzc2hQYXRoLCB0b2tlbkZpbGVOYW1lKVxyXG4gIHJldHVybiBmaWxlc3lzdGVtLnJlYWRGaWxlU3luYyh0b2tlbkZpbGUpLnRvU3RyaW5nKClcclxufVxyXG5cclxuLy8gcGljayBvbmx5IGdpdGh1YiB1cmkgZGVwZW5kZW5jaWVzXHJcbmZ1bmN0aW9uIGZpbHRlckdpdGh1YkRlcGVuZGVuY3koeyBkZXBlbmRlbmN5TGlzdCB9KSB7XHJcbiAgcmV0dXJuIHBpY2tCeShkZXBlbmRlbmN5TGlzdCwgKHZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgbGV0IHBhcnNlZFVybCA9IGdpdFVybFBhcnNlcih2YWx1ZSlcclxuICAgIHJldHVybiBwYXJzZWRVcmwucmVzb3VyY2UgPT0gJ2dpdGh1Yi5jb20nXHJcbiAgfSlcclxufVxyXG5cclxuLy8gZ2V0IHRoZSByZWxlYXNlcyBvbiBnaXRodWJcclxuYXN5bmMgZnVuY3Rpb24gcXVlcnlSZWxlYXNlVXNpbmdVcmwoeyBncmFwaHFsQ2xpZW50LCByZXBvc2l0b3J5VXJsIH0pIHtcclxuICBsZXQgcGFyc2VkVXJsID0gZ2l0VXJsUGFyc2VyKHJlcG9zaXRvcnlVcmwpLFxyXG4gICAgY3VycmVudFVybFZlcnNpb24gPSBwYXJzZWRVcmwuaGFzaFxyXG5cclxuICBsZXQgcmVsZWFzZUFycmF5ID0gYXdhaXQgZ3JhcGhxbENsaWVudFxyXG4gICAgLnF1ZXJ5KHtcclxuICAgICAgcXVlcnk6IGdldFJlbGVhc2VzLFxyXG4gICAgICB2YXJpYWJsZXM6IHtcclxuICAgICAgICByZXBvVVJMOiByZXBvc2l0b3J5VXJsLFxyXG4gICAgICB9LFxyXG4gICAgfSlcclxuICAgIC50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzb3VyY2UucmVsZWFzZXMuZWRnZXMubWFwKCh2YWx1ZSwgaW5kZXgpID0+IHtcclxuICAgICAgICByZXR1cm4gdmFsdWUubm9kZVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICAgIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgIHRocm93IGVycm9yXHJcbiAgICB9KVxyXG5cclxuICByZXR1cm4gcmVsZWFzZUFycmF5XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBpY2tMYXRlc3RSZWxlYXNlKHsgcmVsZWFzZUxpc3QgfSkge1xyXG4gIHJlbGVhc2VMaXN0LnNvcnQoKGN1cnJlbnQsIG5leHQpID0+IHtcclxuICAgIHJldHVybiBzZW1hbnRpY1ZlcnNpb25lci5ndChjdXJyZW50LnRhZy5uYW1lLCBuZXh0LnRhZy5uYW1lKSA/IC0xIC8qU29ydCBvbiBsb3dlciBpbmRleCovIDogMVxyXG4gIH0pXHJcbiAgcmV0dXJuIHJlbGVhc2VMaXN0WzBdLnRhZy5uYW1lIC8vIHBpY2sgZ3JlYXRlciByZWxlYXNlXHJcbn1cclxuXHJcbi8vIGZpbHRlciBhcnJheSB2YXJpYWJsZSBwYXNzZWQgYXMgcmVmZXJlbmNlLlxyXG5mdW5jdGlvbiBmaWx0ZXJDb21wYXJhYmxlUmVsZWFzZSh7IHJlbGVhc2VMaXN0ID0geyByZWZlcmVuY2U6IFtdIH0gfSkge1xyXG4gIC8vIGZpbHRlciBkcmFmdHMgYW5kIHByZS1yZWxlYXNlc1xyXG4gIHJlbW92ZU11dGF0ZUFycmF5KHJlbGVhc2VMaXN0LnJlZmVyZW5jZSwgdmFsdWUgPT4gQm9vbGVhbih2YWx1ZS5pc1ByZXJlbGVhc2UgfHwgdmFsdWUuaXNEcmFmdCkpXHJcbiAgLy8gZmlsdGVyIG5vbi1zZW12ZXIgdmVyc2lvbmVkIHRhZ3NcclxuICByZW1vdmVNdXRhdGVBcnJheShyZWxlYXNlTGlzdC5yZWZlcmVuY2UsIHZhbHVlID0+ICFCb29sZWFuKHNlbWFudGljVmVyc2lvbmVyLnZhbGlkKHZhbHVlLnRhZy5uYW1lKSkpXHJcbiAgLy8gZmlsdGVyIHJlbGVhc2VzIHdpdGhvdXQgdGFncyAgLSBkcmFmdCByZWxlYXNlcyBkbyBub3QgaGF2ZSB0YWdzLCByZW1vdmUgYW55IHJlbGVhc2UgdGhhdCBkb2Vzbid0IGhhdmUgYSB0YWcgZm9yIGFueSBvdGhlciByZWFzb24gYWxzby5cclxuICByZW1vdmVNdXRhdGVBcnJheShyZWxlYXNlTGlzdC5yZWZlcmVuY2UsIHZhbHVlID0+ICFCb29sZWFuKHZhbHVlLnRhZykpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVZlcnNpb24oeyBwYXJzZWRVcmwsIG5ld1ZlcnNpb246IGxhdGVzdFJlbGVhc2UgfSkge1xyXG4gIGxldCBzZW12ZXJQcmVmaXggPSBwYXJzZWRVcmwuaGFzaC5pbmNsdWRlcygnc2VtdmVyOicpID8gJ3NlbXZlcjonIDogJycgLy8gY2hlY2sgaWYgYHNlbXZlcjpgIGZvciBnaXQgdXJsIHdhcyBwcmVzZW50XHJcbiAgLy8gcGFyc2VkVXJsLmhhc2ggPSBsYXRlc3RSZWxlYXNlIC8vIEltcG9ydGFudDogZ2l0VXJsUGFyc2VyLnN0cmluZ2lmeSBkb2Vzbid0IHRha2UgY2FyZSBvZiBoYXNoZXMgZm9yIHNvbWUgcmVhc29uLlxyXG4gIHJldHVybiBgJHtnaXRVcmxQYXJzZXIuc3RyaW5naWZ5KHBhcnNlZFVybCl9IyR7c2VtdmVyUHJlZml4fSR7bGF0ZXN0UmVsZWFzZX1gXHJcbn1cclxuIl19