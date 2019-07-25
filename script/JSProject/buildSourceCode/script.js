"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.build = adapter;exports.createGithubBranchedRelease = createGithubBranchedRelease;

var _nodegit = _interopRequireDefault(require("nodegit"));
var _buildTool = require("@dependency/buildTool");











function adapter(...args) {
  const { api } = args[0];
  args[0].targetProject = api.project;
  (0, _buildTool.build)(...args).catch(console.error);
}

















async function createGithubBranchedRelease({

  api,
  temporaryBranchName = 'distribution',
  brachToPointTo = 'master',
  commitToPointTo = null,
  tagName,
  buildCallback = _buildTool.build })
{
  const targetProject = api.project,
  targetProjectRoot = targetProject.configuration.rootPath,
  targetProjectGitUrl = 'https://github.com/AppScriptIO/scriptManager';

  const repository = await _nodegit.default.Repository.open(targetProjectRoot),
  tagger = _nodegit.default.Signature.now('meow', 'test@example.com');
  brachToPointTo = await _nodegit.default.Branch.lookup(repository, brachToPointTo, 1);

  commitToPointTo = Boolean(commitToPointTo) ?
  await _nodegit.default.Commit.lookup(repository, commitToPointTo) :
  await repository.getReferenceCommit(brachToPointTo);

  let branchReferenceList = await repository.getReferences(_nodegit.default.Reference.TYPE.OID);


  let doesTemporaryBranchExist = branchReferenceList.some(branch => branch.toString().includes(temporaryBranchName));
  let temporaryBranch;
  if (!doesTemporaryBranchExist) {

    temporaryBranch = await _nodegit.default.Branch.create(repository, temporaryBranchName, commitToPointTo, 1).catch(error => console.error(error));
    console.log(`• Created   temporary branch ${await temporaryBranch.name()} from commit ${commitToPointTo.sha()}`);
  } else {
    temporaryBranch = await _nodegit.default.Branch.lookup(repository, temporaryBranchName, 1);
  }

  await repository.checkoutBranch((await temporaryBranch.name()));




  await _nodegit.default.Reset.reset(repository, commitToPointTo, _nodegit.default.Reset.TYPE.HARD).
  then(number => {
    if (number) throw new Error(`• Could not reset repository ${repository} to commit ${commitToPointTo}`);
  }).
  catch(error => console.error);


  await buildCallback({ targetProjectRoot }).then(() => console.log('Project built successfully !'));


  let index = await repository.refreshIndex();
  let treeObject = await index.
  addAll(['**']).
  then(() => index.write()).
  then(() => index.writeTree());
  let parentCommit = await repository.getHeadCommit();
  await repository.
  createCommit('HEAD' || null, tagger, tagger, `🏗️ Build distribution code.`, treeObject, [
  parentCommit]).

  then(oid => {
    console.log(`• Commit created ${oid} for distribution code`);
  });


  let latestTemporaryBranchCommit = await repository.getHeadCommit();
  await _nodegit.default.Tag.create(repository, tagName, latestTemporaryBranchCommit, tagger, `Release of distribution code only.`, 0).then(oid => console.log(`• Tag created ${oid}`));

  await repository.checkoutBranch(brachToPointTo);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvYnVpbGRTb3VyY2VDb2RlL3NjcmlwdC5qcyJdLCJuYW1lcyI6WyJhZGFwdGVyIiwiYXJncyIsImFwaSIsInRhcmdldFByb2plY3QiLCJwcm9qZWN0IiwiY2F0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJjcmVhdGVHaXRodWJCcmFuY2hlZFJlbGVhc2UiLCJ0ZW1wb3JhcnlCcmFuY2hOYW1lIiwiYnJhY2hUb1BvaW50VG8iLCJjb21taXRUb1BvaW50VG8iLCJ0YWdOYW1lIiwiYnVpbGRDYWxsYmFjayIsImJ1aWxkIiwidGFyZ2V0UHJvamVjdFJvb3QiLCJjb25maWd1cmF0aW9uIiwicm9vdFBhdGgiLCJ0YXJnZXRQcm9qZWN0R2l0VXJsIiwicmVwb3NpdG9yeSIsImdpdCIsIlJlcG9zaXRvcnkiLCJvcGVuIiwidGFnZ2VyIiwiU2lnbmF0dXJlIiwibm93IiwiQnJhbmNoIiwibG9va3VwIiwiQm9vbGVhbiIsIkNvbW1pdCIsImdldFJlZmVyZW5jZUNvbW1pdCIsImJyYW5jaFJlZmVyZW5jZUxpc3QiLCJnZXRSZWZlcmVuY2VzIiwiUmVmZXJlbmNlIiwiVFlQRSIsIk9JRCIsImRvZXNUZW1wb3JhcnlCcmFuY2hFeGlzdCIsInNvbWUiLCJicmFuY2giLCJ0b1N0cmluZyIsImluY2x1ZGVzIiwidGVtcG9yYXJ5QnJhbmNoIiwiY3JlYXRlIiwibG9nIiwibmFtZSIsInNoYSIsImNoZWNrb3V0QnJhbmNoIiwiUmVzZXQiLCJyZXNldCIsIkhBUkQiLCJ0aGVuIiwibnVtYmVyIiwiRXJyb3IiLCJpbmRleCIsInJlZnJlc2hJbmRleCIsInRyZWVPYmplY3QiLCJhZGRBbGwiLCJ3cml0ZSIsIndyaXRlVHJlZSIsInBhcmVudENvbW1pdCIsImdldEhlYWRDb21taXQiLCJjcmVhdGVDb21taXQiLCJvaWQiLCJsYXRlc3RUZW1wb3JhcnlCcmFuY2hDb21taXQiLCJUYWciLCJpc0NoZWNrZWRPdXQiLCJkZWxldGUiLCJyZWJhc2luZ0V4YW1wbGUiLCJmcm9tQnJhbmNoIiwidG9CcmFuY2giLCJyZWJhc2VCcmFuY2hlcyIsInJlYmFzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmViYXNlTWV0YWRhdGEiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FBWUEsU0FBU0EsT0FBVCxDQUFpQixHQUFHQyxJQUFwQixFQUEwQjtBQUN4QixRQUFNLEVBQUVDLEdBQUYsS0FBMENELElBQUksQ0FBQyxDQUFELENBQXBEO0FBQ0FBLEVBQUFBLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUUUsYUFBUixHQUF3QkQsR0FBRyxDQUFDRSxPQUE1QjtBQUNBLHdCQUFNLEdBQUdILElBQVQsRUFBZUksS0FBZixDQUFxQkMsT0FBTyxDQUFDQyxLQUE3QjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQsZUFBZUMsMkJBQWYsQ0FBMkM7O0FBRXpDTixFQUFBQSxHQUZ5QztBQUd6Q08sRUFBQUEsbUJBQW1CLEdBQUcsY0FIbUI7QUFJekNDLEVBQUFBLGNBQWMsR0FBRyxRQUp3QjtBQUt6Q0MsRUFBQUEsZUFBZSxHQUFHLElBTHVCO0FBTXpDQyxFQUFBQSxPQU55QztBQU96Q0MsRUFBQUEsYUFBYSxHQUFHQyxnQkFQeUIsRUFBM0M7QUFRRztBQUNELFFBQU1YLGFBQWEsR0FBR0QsR0FBRyxDQUFDRSxPQUExQjtBQUNFVyxFQUFBQSxpQkFBaUIsR0FBR1osYUFBYSxDQUFDYSxhQUFkLENBQTRCQyxRQURsRDtBQUVFQyxFQUFBQSxtQkFBbUIsR0FBRyw4Q0FGeEI7O0FBSUEsUUFBTUMsVUFBVSxHQUFHLE1BQU1DLGlCQUFJQyxVQUFKLENBQWVDLElBQWYsQ0FBb0JQLGlCQUFwQixDQUF6QjtBQUNFUSxFQUFBQSxNQUFNLEdBQUdILGlCQUFJSSxTQUFKLENBQWNDLEdBQWQsQ0FBa0IsTUFBbEIsRUFBMEIsa0JBQTFCLENBRFg7QUFFQWYsRUFBQUEsY0FBYyxHQUFHLE1BQU1VLGlCQUFJTSxNQUFKLENBQVdDLE1BQVgsQ0FBa0JSLFVBQWxC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Y21CLE1BQWQsRUFBc0I4QixVQUF0QixFQUFrQ0MsUUFBbEMsRUFBekIsRUFBdUU7QUFDckUsU0FBT2xELFVBQVUsQ0FBQ21ELGNBQVg7QUFDTGhDLEVBQUFBLE1BQU0sQ0FBQ00sSUFBUCxFQURLO0FBRUx3QixFQUFBQSxVQUFVLENBQUN4QixJQUFYLEVBRks7QUFHTHlCLEVBQUFBLFFBQVEsQ0FBQ3pCLElBQVQsRUFISztBQUlMeEIsbUJBQUlJLFNBQUosQ0FBY0MsR0FBZCxDQUFrQixNQUFsQixFQUEwQixrQkFBMUIsQ0FKSztBQUtMOEMsRUFBQUEsTUFBTSxJQUFJO0FBQ1JqRSxJQUFBQSxPQUFPLENBQUNxQyxHQUFSLENBQVksZUFBWjtBQUNBLFdBQU82QixPQUFPLENBQUNDLE9BQVIsRUFBUDtBQUNELEdBUkk7QUFTTEMsRUFBQUEsY0FBYyxJQUFJO0FBQ2hCcEUsSUFBQUEsT0FBTyxDQUFDcUMsR0FBUixDQUFZLGlCQUFaO0FBQ0EsV0FBTzZCLE9BQU8sQ0FBQ0MsT0FBUixFQUFQO0FBQ0QsR0FaSSxDQUFQOztBQWNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpbGVzeXN0ZW0gZnJvbSAnZnMnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGRlZmF1bHQgYXMgZ2l0LCBDb21taXQsIFJlcG9zaXRvcnksIFJlZmVyZW5jZSwgQnJhbmNoLCBTaWduYXR1cmUsIFJlc2V0IH0gZnJvbSAnbm9kZWdpdCdcclxuaW1wb3J0IHsgYnVpbGQgfSBmcm9tICdAZGVwZW5kZW5jeS9idWlsZFRvb2wnXHJcblxyXG4vKipcclxuICogVE9ETzpcclxuICog4oCiIGltcGxlbWVudCBhIGJ1aWxkIHNjcmlwdCBmb3IgcGFja2FnZXMgd2hlcmU6XHJcbiAqICAgICAg4peLIENvbmZpZ3VyYXRpb24gZmlsZSBmb3IgYnVpbGQgcHJvY2Vzcy5cclxuICogICAgICDil4sgQnVpbGQgdGhlIGZpbGVzIGluc2lkZSBwcm9qZWN0IGZvciBucG0gcGFja2FnZXMuXHJcbiAqICAgICAg4peLIFB1c2ggbmV3IHZlcnNpb24gdG8gZ2l0aHViIHRhZ3MuXHJcbiAqICAgICAg4peLIENyZWF0ZSBhIG5ldyByZWxlYXNlIGZyb20gdGhlIHB1c2hlZCB0YWcuXHJcbiAqXHJcbiAqIFJlbGVhc2VzIGNvdWxkIGJlIGNyZWF0ZWQgZm9yIHNvdXJjZSBjb2RlIGFuZCBmb3IgZGlzdHJpYnV0aW9uIGNvZGUuXHJcbiAqL1xyXG5mdW5jdGlvbiBhZGFwdGVyKC4uLmFyZ3MpIHtcclxuICBjb25zdCB7IGFwaSAvKiBzdXBwbGllZCBieSBzY3JpcHRNYW5hZ2VyICovIH0gPSBhcmdzWzBdXHJcbiAgYXJnc1swXS50YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3QgLy8gYWRhcHRlciBmb3Igd29ya2luZyB3aXRoIHRhcmdldCBmdW5jdGlvbiBpbnRlcmZhY2UuXHJcbiAgYnVpbGQoLi4uYXJncykuY2F0Y2goY29uc29sZS5lcnJvcilcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbGVhc2UgYSBuZXcgdGFnIGluIEdpdGh1YjpcclxuICogIDEuIENyZWF0ZSBhIHRlbXBvcmFyeSBicmFuY2ggb3IgdXNlIGFuIGV4aXN0aW5nIGJyYW5jaCBhbmQgY2hlY2tvdXQgdG8gaXQuXHJcbiAqICAyLiBSZWJhc2Ugb250byBtYXN0ZXIgKGluIGNhc2UgdGhlIHRlbXBvcmFyeSBicmFuY2ggZXhpc3RzKSAtIHNpbWlsYXIgdG8gb3ZlcnJpZGluZyBicmFuY2ggaGlzdG9yeSB3aXRoIHRoZSBtYXN0ZXIgYnJhbmNoLlxyXG4gKiAgMy4gQnVpbGQgY29kZSBhbmQgY29tbWl0IHdpdGggYSBkaXN0cmlidXRpb24gbWVzc2FnZS5cclxuICogIDQuIENyZWF0ZSBhIHJlbGVhc2UvdGFnLlxyXG4gKiAgNS4gY2xlYW51cCBicmFuY2hlcy5cclxuICogIDYuIGdpdCBjaGVja291dCBtYXN0ZXJcclxuICpcclxuICogIEBzaWVFZmZlY3QgLSBjcmVhdGVzIGEgdGFnIGFuZCBkZWxldGVzIHRlbXBvcmFyeSBicmFuY2guXHJcbiAqXHJcbiAqIFNpbXBsZSBleGFtcGxlIGVxdWl2YWxlbnQgc2hlbGwgc2NyaXB0OlxyXG4gKiBgYGBnaXQgY2hlY2tvdXQgZGlzdHJpYnV0aW9uICYmIGdpdCByZWJhc2UgLS1vbnRvIG1hc3RlciBkaXN0cmlidXRpb24gJiYgZWNobyBcIlRlc3QgUGFnZVwiID4gbmV3LmpzICYmIGdpdCBhZGQgLUEgJiYgZ2l0IGNvbW1pdCAtYSAtbSAnYnVpbGQnICYmIGdpdCB0YWcgdjU7IGdpdCBjaGVja291dCBtYXN0ZXJgYGBcclxuICpcclxuICogYG5vZGVnaXRgIGRvY3VtZW50YXRpb246IGh0dHBzOi8vd3d3Lm5vZGVnaXQub3JnL2FwaVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlR2l0aHViQnJhbmNoZWRSZWxlYXNlKHtcclxuICAvLyAnYnJhbmNoZWQgcmVsZWFzZScgaW4gdGhlIHNlbnNlIG9mIGEgdGFnIHRoYXQgcG9pbnRzIHRvIGFuIGFkZGl0aW9uYWwgYnVpbGQgY29tbWl0IG90aGVyIHRoYW4gdGhlIG1hc3RlciBjb21taXQgZm9yIGV4YW1wbGUuXHJcbiAgYXBpLFxyXG4gIHRlbXBvcmFyeUJyYW5jaE5hbWUgPSAnZGlzdHJpYnV0aW9uJywgLy8gYnJhbmNoIHVzZWQgdG8gYnVpbGQgc291cmNlIGNvZGUgYW5kIGNyZWF0ZSBhIGRpc3RyaWJ1dGlvbiB0YWcgZnJvbVxyXG4gIGJyYWNoVG9Qb2ludFRvID0gJ21hc3RlcicsIC8vIGRlZmF1bHQgYnJhbmNoIGZvciBsYXRlc3QgY29tbWl0LlxyXG4gIGNvbW1pdFRvUG9pbnRUbyA9IG51bGwsIC8vIHVucmVsYXRlZCBjb21taXQgdG8gcG9pbnQgdG9cclxuICB0YWdOYW1lLFxyXG4gIGJ1aWxkQ2FsbGJhY2sgPSBidWlsZCwgLy8gYnVpbGQgYXN5bmMgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBidWlsZGluZyBzb3VyY2UgY29kZSBhbmQgcHJlcGFyaW5nIHRoZSBwYWNrYWdlIGZvciBkaXN0cmlidXRpb24uXHJcbn0pIHtcclxuICBjb25zdCB0YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3QsXHJcbiAgICB0YXJnZXRQcm9qZWN0Um9vdCA9IHRhcmdldFByb2plY3QuY29uZmlndXJhdGlvbi5yb290UGF0aCxcclxuICAgIHRhcmdldFByb2plY3RHaXRVcmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL0FwcFNjcmlwdElPL3NjcmlwdE1hbmFnZXInXHJcblxyXG4gIGNvbnN0IHJlcG9zaXRvcnkgPSBhd2FpdCBnaXQuUmVwb3NpdG9yeS5vcGVuKHRhcmdldFByb2plY3RSb290KSxcclxuICAgIHRhZ2dlciA9IGdpdC5TaWduYXR1cmUubm93KCdtZW93JywgJ3Rlc3RAZXhhbXBsZS5jb20nKVxyXG4gIGJyYWNoVG9Qb2ludFRvID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgYnJhY2hUb1BvaW50VG8sIDEpIC8vIGNvbnZlcnQgdG8gYnJhbmNoIHJlZmVyZW5jZVxyXG4gIC8vIHNldCBjb21taXQgcmVmZXJlbmNlXHJcbiAgY29tbWl0VG9Qb2ludFRvID0gQm9vbGVhbihjb21taXRUb1BvaW50VG8pXHJcbiAgICA/IGF3YWl0IGdpdC5Db21taXQubG9va3VwKHJlcG9zaXRvcnksIGNvbW1pdFRvUG9pbnRUbykgLy8gZ2V0IGNvbW1pdCBmcm9tIHN1cHBsaWVkIGNvbW1pdCBpZCBwYXJhbWV0ZXJcclxuICAgIDogYXdhaXQgcmVwb3NpdG9yeS5nZXRSZWZlcmVuY2VDb21taXQoYnJhY2hUb1BvaW50VG8pIC8vIGdldCBsYXRlc3QgY29tbWl0IGZyb20gYnJhbmNoXHJcbiAgLy8gZ2V0IGFsbCBicmFuY2hlcyByZW1vdGUgYW5kIGxvY2FsXHJcbiAgbGV0IGJyYW5jaFJlZmVyZW5jZUxpc3QgPSBhd2FpdCByZXBvc2l0b3J5LmdldFJlZmVyZW5jZXMoZ2l0LlJlZmVyZW5jZS5UWVBFLk9JRClcclxuXHJcbiAgLy8gY2hlY2sgaWYgYHRlbXBvcmFyeUJyYW5jaE5hbWVgIGJyYW5jaCwgdGhhdCBpcyB1c2VkLCBleGlzdHMuXHJcbiAgbGV0IGRvZXNUZW1wb3JhcnlCcmFuY2hFeGlzdCA9IGJyYW5jaFJlZmVyZW5jZUxpc3Quc29tZShicmFuY2ggPT4gYnJhbmNoLnRvU3RyaW5nKCkuaW5jbHVkZXModGVtcG9yYXJ5QnJhbmNoTmFtZSkpXHJcbiAgbGV0IHRlbXBvcmFyeUJyYW5jaCAvLyBCcmFuY2ggcmVmZXJlbmNlXHJcbiAgaWYgKCFkb2VzVGVtcG9yYXJ5QnJhbmNoRXhpc3QpIHtcclxuICAgIC8vIGNyZWF0ZSBicmFuY2hcclxuICAgIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2guY3JlYXRlKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIGNvbW1pdFRvUG9pbnRUbywgMSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbiAgICBjb25zb2xlLmxvZyhg4oCiIENyZWF0ZWQgICB0ZW1wb3JhcnkgYnJhbmNoICR7YXdhaXQgdGVtcG9yYXJ5QnJhbmNoLm5hbWUoKX0gZnJvbSBjb21taXQgJHtjb21taXRUb1BvaW50VG8uc2hhKCl9YClcclxuICB9IGVsc2Uge1xyXG4gICAgdGVtcG9yYXJ5QnJhbmNoID0gYXdhaXQgZ2l0LkJyYW5jaC5sb29rdXAocmVwb3NpdG9yeSwgdGVtcG9yYXJ5QnJhbmNoTmFtZSwgMSlcclxuICB9XHJcbiAgLy8gY2hlY2tvdXQgdGVtcG9yYXJ5XHJcbiAgYXdhaXQgcmVwb3NpdG9yeS5jaGVja291dEJyYW5jaChhd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpKVxyXG5cclxuICAvKiogcmVzZXQgdGVtcG9yYXJ5IGJyYW5jaCB0byB0aGUgY29tbWl0IHRvIHBvaW50IHRvICh0YXJnZXRDb21taXQpXHJcbiAgICogQW5vdGhlciBvcHRpb24gaXMgdG8gdXNlIHJlYmFzaW5nIHdoZXJlIGN1cnJlbnQgY29tbWl0cyBhcmUgc2F2ZWQgLy8gcmViYXNpbmdFeGFtcGxlKClcclxuICAgKi9cclxuICBhd2FpdCBnaXQuUmVzZXQucmVzZXQocmVwb3NpdG9yeSwgY29tbWl0VG9Qb2ludFRvLCBnaXQuUmVzZXQuVFlQRS5IQVJEKVxyXG4gICAgLnRoZW4obnVtYmVyID0+IHtcclxuICAgICAgaWYgKG51bWJlcikgdGhyb3cgbmV3IEVycm9yKGDigKIgQ291bGQgbm90IHJlc2V0IHJlcG9zaXRvcnkgJHtyZXBvc2l0b3J5fSB0byBjb21taXQgJHtjb21taXRUb1BvaW50VG99YClcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5lcnJvcilcclxuXHJcbiAgLy8gcnVuIGJ1aWxkXHJcbiAgYXdhaXQgYnVpbGRDYWxsYmFjayh7IHRhcmdldFByb2plY3RSb290IH0pLnRoZW4oKCkgPT4gY29uc29sZS5sb2coJ1Byb2plY3QgYnVpbHQgc3VjY2Vzc2Z1bGx5ICEnKSlcclxuXHJcbiAgLy8gQ3JlYXRlIGNvbW1pdCBvZiBhbGwgZmlsZXMuXHJcbiAgbGV0IGluZGV4ID0gYXdhaXQgcmVwb3NpdG9yeS5yZWZyZXNoSW5kZXgoKSAvLyBpbnZhbGlkYXRlcyBhbmQgZ3JhYnMgbmV3IGluZGV4IGZyb20gcmVwb3NpdG9yeS5cclxuICBsZXQgdHJlZU9iamVjdCA9IGF3YWl0IGluZGV4XHJcbiAgICAuYWRkQWxsKFsnKionXSlcclxuICAgIC50aGVuKCgpID0+IGluZGV4LndyaXRlKCkpXHJcbiAgICAudGhlbigoKSA9PiBpbmRleC53cml0ZVRyZWUoKSkgLy8gYWRkIGZpbGVzIGFuZCBjcmVhdGUgYSB0cmVlIG9iamVjdC5cclxuICBsZXQgcGFyZW50Q29tbWl0ID0gYXdhaXQgcmVwb3NpdG9yeS5nZXRIZWFkQ29tbWl0KCkgLy8gZ2V0IGxhdGVzdCBjb21taXRcclxuICBhd2FpdCByZXBvc2l0b3J5XHJcbiAgICAuY3JlYXRlQ29tbWl0KCdIRUFEJyAvKiB1cGRhdGUgdGhlIEhFQUQgcmVmZXJlbmNlIC0gc28gdGhhdCB0aGUgSEVBRCB3aWxsIHBvaW50IHRvIHRoZSBsYXRlc3QgZ2l0ICovIHx8IG51bGwgLyogZG8gbm90IHVwZGF0ZSByZWYgKi8sIHRhZ2dlciwgdGFnZ2VyLCBg8J+Pl++4jyBCdWlsZCBkaXN0cmlidXRpb24gY29kZS5gLCB0cmVlT2JqZWN0LCBbXHJcbiAgICAgIHBhcmVudENvbW1pdCxcclxuICAgIF0pXHJcbiAgICAudGhlbihvaWQgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhg4oCiIENvbW1pdCBjcmVhdGVkICR7b2lkfSBmb3IgZGlzdHJpYnV0aW9uIGNvZGVgKVxyXG4gICAgfSlcclxuXHJcbiAgLy8gdGFnIGFuZCBjcmVhdGUgYSByZWxlYXNlLlxyXG4gIGxldCBsYXRlc3RUZW1wb3JhcnlCcmFuY2hDb21taXQgPSBhd2FpdCByZXBvc2l0b3J5LmdldEhlYWRDb21taXQoKSAvLyBnZXQgbGF0ZXN0IGNvbW1pdFxyXG4gIGF3YWl0IGdpdC5UYWcuY3JlYXRlKHJlcG9zaXRvcnksIHRhZ05hbWUsIGxhdGVzdFRlbXBvcmFyeUJyYW5jaENvbW1pdCwgdGFnZ2VyLCBgUmVsZWFzZSBvZiBkaXN0cmlidXRpb24gY29kZSBvbmx5LmAsIDApLnRoZW4ob2lkID0+IGNvbnNvbGUubG9nKGDigKIgVGFnIGNyZWF0ZWQgJHtvaWR9YCkpXHJcblxyXG4gIGF3YWl0IHJlcG9zaXRvcnkuY2hlY2tvdXRCcmFuY2goYnJhY2hUb1BvaW50VG8pIC8vIG1ha2Ugc3VyZSB0aGUgYnJhbmNoIGlzIGNoZWNrZWRvdXQuXHJcbiAgLy8gZGVsZXRlIHRlbXBvcmFyeSBicmFuY2hcclxuICB0cnkge1xyXG4gICAgaWYgKGdpdC5CcmFuY2guaXNDaGVja2VkT3V0KHRlbXBvcmFyeUJyYW5jaCkpIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGRlbGV0ZSBhIGNoZWNrZWQgb3V0IGJyYW5jaCAke2F3YWl0IHRlbXBvcmFyeUJyYW5jaC5uYW1lKCl9LmApXHJcbiAgICAvLyBCeSByZWFzc2lnbmluZyB0aGUgdmFyaWFibGUgYW5kIGxvb2tpbmcgdXAgdGhlIGJyYW5jaCB0aGUgZ2FyYmFnZSBjb2xsZWN0b3Igd2lsbCBraWNrIGluLiBUaGUgcmVmZXJlbmNlIGZvciB0aGUgYnJhbmNoIGluIGxpYmdpdDIgc2hvdWxkbid0IGJlIGluIG1lbW9yeSBhcyBtZW50aW9uZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL2xpYmdpdDIvbGliZ2l0Mi9ibG9iLzg1OWQ5MjI5MmUwMDhhNGQwNGQ2OGZiNmRjMjBhMWRmYTY4ZTQ4NzQvaW5jbHVkZS9naXQyL3JlZnMuaCNMMzg1LUwzOThcclxuICAgIHRlbXBvcmFyeUJyYW5jaCA9IGF3YWl0IGdpdC5CcmFuY2gubG9va3VwKHJlcG9zaXRvcnksIHRlbXBvcmFyeUJyYW5jaE5hbWUsIDEpIC8vIHJlZmVyZXNoIHZhbHVlIG9mIHRlbXBvcmFyeUJyYW5jaCAtIGZvciBzb21lIHJlYXNvbiB1c2luZyB0aGUgc2FtZSByZWZlcmVuY2UgcHJldmVudHMgZGVsZXRpb24gb2YgYnJhbmNoLlxyXG4gICAgbGV0IGVycm9yID0gZ2l0LkJyYW5jaC5kZWxldGUodGVtcG9yYXJ5QnJhbmNoKVxyXG4gICAgaWYgKGVycm9yKSB0aHJvdyBuZXcgRXJyb3IoYENvZGUgdGhyb3duIGJ5ICdsaWJnaXQyJyBiaW5kaW5ncyA9ICR7ZXJyb3J9XFxuIFxcdENoZWNrIGh0dHBzOi8vd3d3Lm5vZGVnaXQub3JnL2FwaS9lcnJvci8jQ09ERWApXHJcbiAgICBjb25zb2xlLmxvZyhg4oCiIERlbGV0ZWQgdGVtcG9hcmFyeSBicmFuY2ggJHthd2FpdCB0ZW1wb3JhcnlCcmFuY2gubmFtZSgpfS5gKVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB0aHJvdyBlcnJvclxyXG4gIH1cclxufVxyXG5cclxuLy8gcmViYXNlIGludG8gbWFzdGVyIGJyYW5jaCB0byBmb2xsb3cgdGhlIGxhdGVzdCBtYXN0ZXIgY29tbWl0LiBUT0RPOiB0aGlzIGlzIGFuIGV4YW1wbGUgLSBmaXggYXN5bmMgb3BlcmF0aW9uLlxyXG5mdW5jdGlvbiByZWJhc2luZ0V4YW1wbGUoeyByZXBvc2l0b3J5LCBicmFuY2gsIGZyb21CcmFuY2gsIHRvQnJhbmNoIH0pIHtcclxuICByZXR1cm4gcmVwb3NpdG9yeS5yZWJhc2VCcmFuY2hlcyhcclxuICAgIGJyYW5jaC5uYW1lKCksIC8vIGJyYW5jaCBjb21taXRzIHRvIG1vdmVcclxuICAgIGZyb21CcmFuY2gubmFtZSgpLCAvLyB0aWxsIGNvbW1pdHMgdGhhdCBhcmUgaW50ZXJzZWN0ZWQgd2l0aCB0aGlzIGJyYW5jaCAob2xkIGJyYW5jaClcclxuICAgIHRvQnJhbmNoLm5hbWUoKSwgLy8gb250byB0aGUgbmV3IGJyYW5jaC5cclxuICAgIGdpdC5TaWduYXR1cmUubm93KCdtZW93JywgJ3Rlc3RAZXhhbXBsZS5jb20nKSxcclxuICAgIHJlYmFzZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdPbmUgb3BlcmF0aW9uJylcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICB9LFxyXG4gICAgcmViYXNlTWV0YWRhdGEgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQgcmViYXNlJylcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICB9LFxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IHsgYWRhcHRlciBhcyBidWlsZCwgY3JlYXRlR2l0aHViQnJhbmNoZWRSZWxlYXNlIH1cclxuIl19