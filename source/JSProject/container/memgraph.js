"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.runDockerContainer = runDockerContainer;exports.clearGraphData = clearGraphData;
var _isPortReachable = _interopRequireDefault(require("is-port-reachable"));const childProcess = require('child_process');
const boltProtocolDriver = require('neo4j-driver').v1;
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] };



function runDockerContainer({
  localDNSHostname = 'memgraph' } =
{}) {
  try {

    childProcess.execSync(
    `docker network create --driver bridge external`,
    childProcessOption);

  } catch (error) {
    console.log(`• Seems like the network already exists.`);

  }



  let command = [

  `docker create --name memgraph-shared --network external --network-alias ${localDNSHostname} --publish 7687:7687 --restart always memgraph `,
  'docker network connect bridge memgraph-shared',
  `docker start memgraph-shared`].
  join(' && \\\n');

  console.log(`• Running container: memgraph on port 7687`);
  console.log(`$ ${command}`);

  try {
    childProcess.execSync(command, childProcessOption);
  } catch (error) {
    console.log(error);
    console.log(`• Seems like the container is already running from a previous session, ignore previous error.`);
  }
}

async function clearGraphData({ memgraph = {}, connectionDriver } = {}) {
  console.log('• Cleared graph database.');
  let shouldCloseDriver = !connectionDriver ? true : false;
  const url = { protocol: 'bolt', hostname: memgraph.host || 'localhost', port: memgraph.port || 7687 };
  if (!(await (0, _isPortReachable.default)(url.port, { host: url.hostname }))) {
    console.groupCollapsed('• Run prerequisite containers:');
    runDockerContainer();
    console.groupEnd();
  }

  const authentication = { username: 'neo4j', password: 'test' };
  connectionDriver || (connectionDriver = boltProtocolDriver.driver(`${url.protocol}://${url.hostname}:${url.port}`, boltProtocolDriver.auth.basic(authentication.username, authentication.password)));

  let session = await connectionDriver.session();

  let result = await session.run(`match (n) detach delete n`);
  session.close();

  if (shouldCloseDriver) connectionDriver.close();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvY29udGFpbmVyL21lbWdyYXBoLmpzIl0sIm5hbWVzIjpbImNoaWxkUHJvY2VzcyIsInJlcXVpcmUiLCJib2x0UHJvdG9jb2xEcml2ZXIiLCJ2MSIsImNoaWxkUHJvY2Vzc09wdGlvbiIsImN3ZCIsIl9fZGlybmFtZSIsInNoZWxsIiwic3RkaW8iLCJydW5Eb2NrZXJDb250YWluZXIiLCJsb2NhbEROU0hvc3RuYW1lIiwiZXhlY1N5bmMiLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJjb21tYW5kIiwiam9pbiIsImNsZWFyR3JhcGhEYXRhIiwibWVtZ3JhcGgiLCJjb25uZWN0aW9uRHJpdmVyIiwic2hvdWxkQ2xvc2VEcml2ZXIiLCJ1cmwiLCJwcm90b2NvbCIsImhvc3RuYW1lIiwiaG9zdCIsInBvcnQiLCJncm91cENvbGxhcHNlZCIsImdyb3VwRW5kIiwiYXV0aGVudGljYXRpb24iLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiZHJpdmVyIiwiYXV0aCIsImJhc2ljIiwic2Vzc2lvbiIsInJlc3VsdCIsInJ1biIsImNsb3NlIl0sIm1hcHBpbmdzIjoiO0FBQ0EsNEVBREEsTUFBTUEsWUFBWSxHQUFHQyxPQUFPLENBQUMsZUFBRCxDQUE1QjtBQUVBLE1BQU1DLGtCQUFrQixHQUFHRCxPQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCRSxFQUFuRDtBQUNBLE1BQU1DLGtCQUFrQixHQUFHLEVBQUVDLEdBQUcsRUFBRUMsU0FBUCxFQUFrQkMsS0FBSyxFQUFFLElBQXpCLEVBQStCQyxLQUFLLEVBQUUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBdEMsRUFBM0I7Ozs7QUFJTyxTQUFTQyxrQkFBVCxDQUE0QjtBQUNqQ0MsRUFBQUEsZ0JBQWdCLEdBQUcsVUFEYztBQUUvQixFQUZHLEVBRUM7QUFDTixNQUFJOztBQUVGVixJQUFBQSxZQUFZLENBQUNXLFFBQWI7QUFDRyxvREFESDtBQUVFUCxJQUFBQSxrQkFGRjs7QUFJRCxHQU5ELENBTUUsT0FBT1EsS0FBUCxFQUFjO0FBQ2RDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFhLDBDQUFiOztBQUVEOzs7O0FBSUQsTUFBSUMsT0FBTyxHQUFHOztBQUVYLDZFQUEwRUwsZ0JBQWlCLGlEQUZoRjtBQUdaLGlEQUhZO0FBSVgsZ0NBSlc7QUFLWk0sRUFBQUEsSUFMWSxDQUtQLFVBTE8sQ0FBZDs7QUFPQUgsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsNENBQWI7QUFDQUQsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsS0FBSUMsT0FBUSxFQUF6Qjs7QUFFQSxNQUFJO0FBQ0ZmLElBQUFBLFlBQVksQ0FBQ1csUUFBYixDQUFzQkksT0FBdEIsRUFBK0JYLGtCQUEvQjtBQUNELEdBRkQsQ0FFRSxPQUFPUSxLQUFQLEVBQWM7QUFDZEMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLEtBQVo7QUFDQUMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsK0ZBQWI7QUFDRDtBQUNGOztBQUVNLGVBQWVHLGNBQWYsQ0FBOEIsRUFBRUMsUUFBUSxHQUFHLEVBQWIsRUFBaUJDLGdCQUFqQixLQUFzQyxFQUFwRSxFQUF3RTtBQUM3RU4sRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVo7QUFDQSxNQUFJTSxpQkFBaUIsR0FBRyxDQUFDRCxnQkFBRCxHQUFvQixJQUFwQixHQUEyQixLQUFuRDtBQUNBLFFBQU1FLEdBQUcsR0FBRyxFQUFFQyxRQUFRLEVBQUUsTUFBWixFQUFvQkMsUUFBUSxFQUFFTCxRQUFRLENBQUNNLElBQVQsSUFBaUIsV0FBL0MsRUFBNERDLElBQUksRUFBRVAsUUFBUSxDQUFDTyxJQUFULElBQWlCLElBQW5GLEVBQVo7QUFDQSxNQUFJLEVBQUUsTUFBTSw4QkFBZ0JKLEdBQUcsQ0FBQ0ksSUFBcEIsRUFBMEIsRUFBRUQsSUFBSSxFQUFFSCxHQUFHLENBQUNFLFFBQVosRUFBMUIsQ0FBUixDQUFKLEVBQWdFO0FBQzlEVixJQUFBQSxPQUFPLENBQUNhLGNBQVIsQ0FBdUIsZ0NBQXZCO0FBQ0FqQixJQUFBQSxrQkFBa0I7QUFDbEJJLElBQUFBLE9BQU8sQ0FBQ2MsUUFBUjtBQUNEOztBQUVELFFBQU1DLGNBQWMsR0FBRyxFQUFFQyxRQUFRLEVBQUUsT0FBWixFQUFxQkMsUUFBUSxFQUFFLE1BQS9CLEVBQXZCO0FBQ0FYLEVBQUFBLGdCQUFnQixLQUFoQkEsZ0JBQWdCLEdBQUtqQixrQkFBa0IsQ0FBQzZCLE1BQW5CLENBQTJCLEdBQUVWLEdBQUcsQ0FBQ0MsUUFBUyxNQUFLRCxHQUFHLENBQUNFLFFBQVMsSUFBR0YsR0FBRyxDQUFDSSxJQUFLLEVBQXhFLEVBQTJFdkIsa0JBQWtCLENBQUM4QixJQUFuQixDQUF3QkMsS0FBeEIsQ0FBOEJMLGNBQWMsQ0FBQ0MsUUFBN0MsRUFBdURELGNBQWMsQ0FBQ0UsUUFBdEUsQ0FBM0UsQ0FBTCxDQUFoQjs7QUFFQSxNQUFJSSxPQUFPLEdBQUcsTUFBTWYsZ0JBQWdCLENBQUNlLE9BQWpCLEVBQXBCOztBQUVBLE1BQUlDLE1BQU0sR0FBRyxNQUFNRCxPQUFPLENBQUNFLEdBQVIsQ0FBYSwyQkFBYixDQUFuQjtBQUNBRixFQUFBQSxPQUFPLENBQUNHLEtBQVI7O0FBRUEsTUFBSWpCLGlCQUFKLEVBQXVCRCxnQkFBZ0IsQ0FBQ2tCLEtBQWpCO0FBQ3hCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY2hpbGRQcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpXG5pbXBvcnQgaXNQb3J0UmVhY2hhYmxlIGZyb20gJ2lzLXBvcnQtcmVhY2hhYmxlJ1xuY29uc3QgYm9sdFByb3RvY29sRHJpdmVyID0gcmVxdWlyZSgnbmVvNGotZHJpdmVyJykudjFcbmNvbnN0IGNoaWxkUHJvY2Vzc09wdGlvbiA9IHsgY3dkOiBfX2Rpcm5hbWUsIHNoZWxsOiB0cnVlLCBzdGRpbzogWzAsIDEsIDJdIH1cblxuLy8gVm9sdW1lcyBmb3IgbWVtZ3JhcGggY29udGFpbmVyOlxuLy8gYC12IG1nX2xpYjovdmFyL2xpYi9tZW1ncmFwaCAtdiBtZ19sb2c6L3Zhci9sb2cvbWVtZ3JhcGggLXYgbWdfZXRjOi9ldGMvbWVtZ3JhcGhgXG5leHBvcnQgZnVuY3Rpb24gcnVuRG9ja2VyQ29udGFpbmVyKHtcbiAgbG9jYWxETlNIb3N0bmFtZSA9ICdtZW1ncmFwaCcgLyoqIG5hbWUgaW4gd2hpY2ggb3RoZXIgY29udGFpbmVycyBjYW4gYWNjZXNzIHRoZSBjb250YWluZXIgdGhyb3VnaCBpbiBhIGN1c3RvbSBuZXR3b3JrIChhcyBkZWZhdWx0IGRvZXNuJ3Qgc3VwcG9ydCBhY2Nlc3NpbmcgdXNpbmcgaG9zdG5hbWUpICovLFxufSA9IHt9KSB7XG4gIHRyeSB7XG4gICAgLy8gY3JlYXRlIG5ldHdvcmtcbiAgICBjaGlsZFByb2Nlc3MuZXhlY1N5bmMoXG4gICAgICBgZG9ja2VyIG5ldHdvcmsgY3JlYXRlIC0tZHJpdmVyIGJyaWRnZSBleHRlcm5hbGAsIC8vIHVzZSBhIGN1c3RvbSBuZXR3b3JrIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgYnJpZGdlXG4gICAgICBjaGlsZFByb2Nlc3NPcHRpb24sXG4gICAgKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGDigKIgU2VlbXMgbGlrZSB0aGUgbmV0d29yayBhbHJlYWR5IGV4aXN0cy5gKVxuICAgIC8vIGNvbnNvbGUubG9nKGVycm9yKSAvLyBsb2cgZXJyb3IgYW5kIGNvbnRpbnVlLiBVc3VhbGx5IG5ldHdvcmsgYWxyZWFkeSBleGlzdHMuXG4gIH1cblxuICAvLyB3aGVuIHVzaW5nIG5ldHdvcmsgYWxpYXMgdGhlIGNvbnRhaW5lciBob3N0bmFtZSBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGhvc3RzIG1hbnVhbGx5IGZvciBlYWNoIGNvbnRhaW5lciBpbiB0aGUgbmV0d29ya1xuICAvLyBOT1RFOiAgYC0tbmV0d29yay1hbGlhc2Agd29ya3Mgb25seSB3aGVuIC0tbmV0d29yayBvcHRpb24gaXMgcHJvdmlkZWQsIGFuZCBkb2Vzbid0IHdvcmsgZm9yIGRlZmF1bHQgYnJpZGdlIG5ldHdvcmsuIEFkZGl0aW9uYWxseSB0aGUgYWxpYXMgaXMgbmV0d29yayBib3VuZCwgaS5lLiBzcGVjaWZpY2FsbHkgdG8gYSBzaW5nbGUgbmV0d29yay5cbiAgbGV0IGNvbW1hbmQgPSBbXG4gICAgLy8gIUlNUE9SVEFOVDogW1NlZW1zIHRvIGNhdXNlIGlzc3VlcyB3aXRoIGRvY2tlciBXU0wyXSAtLXJlc3RhcnQgYWx3YXlzXG4gICAgYGRvY2tlciBjcmVhdGUgLS1uYW1lIG1lbWdyYXBoLXNoYXJlZCAtLW5ldHdvcmsgZXh0ZXJuYWwgLS1uZXR3b3JrLWFsaWFzICR7bG9jYWxETlNIb3N0bmFtZX0gLS1wdWJsaXNoIDc2ODc6NzY4NyAtLXJlc3RhcnQgYWx3YXlzIG1lbWdyYXBoIGAsXG4gICAgJ2RvY2tlciBuZXR3b3JrIGNvbm5lY3QgYnJpZGdlIG1lbWdyYXBoLXNoYXJlZCcsIC8vIGNvbm5lY3QgdG8gZGVmYXVsdCBicmlkZ2UgbmV0d29yay5cbiAgICBgZG9ja2VyIHN0YXJ0IG1lbWdyYXBoLXNoYXJlZGAsXG4gIF0uam9pbignICYmIFxcXFxcXG4nKVxuXG4gIGNvbnNvbGUubG9nKGDigKIgUnVubmluZyBjb250YWluZXI6IG1lbWdyYXBoIG9uIHBvcnQgNzY4N2ApXG4gIGNvbnNvbGUubG9nKGAkICR7Y29tbWFuZH1gKVxuXG4gIHRyeSB7XG4gICAgY2hpbGRQcm9jZXNzLmV4ZWNTeW5jKGNvbW1hbmQsIGNoaWxkUHJvY2Vzc09wdGlvbilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICBjb25zb2xlLmxvZyhg4oCiIFNlZW1zIGxpa2UgdGhlIGNvbnRhaW5lciBpcyBhbHJlYWR5IHJ1bm5pbmcgZnJvbSBhIHByZXZpb3VzIHNlc3Npb24sIGlnbm9yZSBwcmV2aW91cyBlcnJvci5gKVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckdyYXBoRGF0YSh7IG1lbWdyYXBoID0ge30sIGNvbm5lY3Rpb25Ecml2ZXIgfSA9IHt9KSB7XG4gIGNvbnNvbGUubG9nKCfigKIgQ2xlYXJlZCBncmFwaCBkYXRhYmFzZS4nKVxuICBsZXQgc2hvdWxkQ2xvc2VEcml2ZXIgPSAhY29ubmVjdGlvbkRyaXZlciA/IHRydWUgOiBmYWxzZVxuICBjb25zdCB1cmwgPSB7IHByb3RvY29sOiAnYm9sdCcsIGhvc3RuYW1lOiBtZW1ncmFwaC5ob3N0IHx8ICdsb2NhbGhvc3QnLCBwb3J0OiBtZW1ncmFwaC5wb3J0IHx8IDc2ODcgfVxuICBpZiAoIShhd2FpdCBpc1BvcnRSZWFjaGFibGUodXJsLnBvcnQsIHsgaG9zdDogdXJsLmhvc3RuYW1lIH0pKSkge1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ+KAoiBSdW4gcHJlcmVxdWlzaXRlIGNvbnRhaW5lcnM6JylcbiAgICBydW5Eb2NrZXJDb250YWluZXIoKVxuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKVxuICB9XG5cbiAgY29uc3QgYXV0aGVudGljYXRpb24gPSB7IHVzZXJuYW1lOiAnbmVvNGonLCBwYXNzd29yZDogJ3Rlc3QnIH1cbiAgY29ubmVjdGlvbkRyaXZlciB8fD0gYm9sdFByb3RvY29sRHJpdmVyLmRyaXZlcihgJHt1cmwucHJvdG9jb2x9Oi8vJHt1cmwuaG9zdG5hbWV9OiR7dXJsLnBvcnR9YCwgYm9sdFByb3RvY29sRHJpdmVyLmF1dGguYmFzaWMoYXV0aGVudGljYXRpb24udXNlcm5hbWUsIGF1dGhlbnRpY2F0aW9uLnBhc3N3b3JkKSlcblxuICBsZXQgc2Vzc2lvbiA9IGF3YWl0IGNvbm5lY3Rpb25Ecml2ZXIuc2Vzc2lvbigpXG4gIC8vIERlbGV0ZSBhbGwgbm9kZXMgaW4gdGhlIGluLW1lbW9yeSBkYXRhYmFzZVxuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5ydW4oYG1hdGNoIChuKSBkZXRhY2ggZGVsZXRlIG5gKVxuICBzZXNzaW9uLmNsb3NlKClcbiAgLy8gY2xvc2UgZHJpdmVyIGNvbm5lY3Rpb24gdG8gYWxsb3cgbm9kZWpzIHByb2Nlc3MgdG8gZXhpdCBjb3JyZWN0bHkuXG4gIGlmIChzaG91bGRDbG9zZURyaXZlcikgY29ubmVjdGlvbkRyaXZlci5jbG9zZSgpXG59XG4iXX0=