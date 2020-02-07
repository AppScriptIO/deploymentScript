"use strict";var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.dockerCli = dockerCli;exports.dockerComposeCli = dockerComposeCli;var _child_process = require("child_process");
var _os = _interopRequireDefault(require("os"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));



var jsYaml = _interopRequireWildcard(require("js-yaml"));

const developmentCodeFolder = _path.default.join(_os.default.homedir(), 'code'),
yarnLinkFolrder = _path.default.join(_os.default.homedir(), '.config');

async function dockerCli({ api, scriptCommand = '/bin/bash' } = {}) {
  const applicationPath = _path.default.join(api.project.configuration.rootPath, 'entrypoint/cli'),
  rootPath = api.project.configuration.rootPath,
  containerProjectPath = rootPath;

  let executableCommand = [
  'docker',
  `run`,




  '--init',
  '--sig-proxy',
  `--interactive --tty`,
  `--rm`,
  `--workdir ${containerProjectPath}`,

  `--volume ${rootPath}:${containerProjectPath}`,

  `--volume ${developmentCodeFolder}:${developmentCodeFolder}`,
  `--volume ${yarnLinkFolrder}:${yarnLinkFolrder}`,
  `--volume /var/run/docker.sock:/var/run/docker.sock`,



  `--network=${'external'}`,
  `--network-alias ${'application'}`,



  `-p 443:443 -p 8080:8080 -p 8081:8081 -p 8082:8082 -p 8083:8083 -p 8084:8084 -p 8085:8085`,
  `-p 9229:9229`,
  `-p 9090:9090 -p 9901:9901 -p 9902:9902`,




  `${'node:current'}`,
  scriptCommand];


  console.log('container command' + ': \n', scriptCommand);
  console.log(`• docker command: "${executableCommand.join(' ')}"`);

  let option = {
    cwd: rootPath,
    detached: false,
    shell: true,
    stdio: [0, 1, 2],

    env: Object.assign({}, process.env, {}) };



  const [command, ...commandArgument] = executableCommand;
  (0, _child_process.spawnSync)(command, commandArgument, option);
}

async function dockerComposeCli({ api, scriptCommand = '/bin/bash' } = {}) {
  const targetProjectConf = api.project.configuration.configuration,
  rootPath = api.project.configuration.rootPath,
  targetTemporaryFolder = _path.default.join(rootPath, 'temporary'),
  containerProjectPath = rootPath;

  let portList = [
  ...targetProjectConf.apiGateway.service.map(item => item.port).filter(item => item),

  ...[

  9229,

  9090,
  9901,
  9902]];


  let object = {
    version: '3.7',
    networks: {
      internal: {
        driver: 'bridge' },

      external: { external: true } },

    services: {
      application: {
        image: 'node:current',


        ports: portList.map(port => {
          return {
            target: port,
            published: port };


        }),

        volumes: [
        `${rootPath}:${containerProjectPath}`,

        `${developmentCodeFolder}:${developmentCodeFolder}`,
        `${yarnLinkFolrder}:${yarnLinkFolrder}`,
        `/var/run/docker.sock:/var/run/docker.sock`],


        networks: {
          external: {
            aliases: ['application'] } },



        working_dir: rootPath,


        command: scriptCommand,






        tty: true,
        stdin_open: true } } };




  let yamlConfig = jsYaml.dump(object, { lineWidth: Infinity, noCompatMode: true }),
  yamlFile = _path.default.join(targetTemporaryFolder, 'dockerCompose.yaml');
  _fs.default.writeFileSync(yamlFile, yamlConfig);

  let executableCommand = [
  [


  `docker-compose --file ${yamlFile} --project-name application --log-level INFO`,






  `run --rm --service-ports --use-aliases application`].
  join(' ')];


  let option = {
    cwd: rootPath,
    detached: false,
    shell: true,
    stdio: [0, 1, 2],

    env: Object.assign({}, process.env, {}) };



  console.log('container command' + ': \n', scriptCommand);
  console.log(`• docker command: "${executableCommand.join(' ')}"`);
  const [command, ...commandArgument] = executableCommand;
  (0, _child_process.spawnSync)(command, commandArgument, option);


}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvY29udGFpbmVyL3J1bi5qcyJdLCJuYW1lcyI6WyJkZXZlbG9wbWVudENvZGVGb2xkZXIiLCJwYXRoIiwiam9pbiIsIm9wZXJhdGluZ1N5c3RlbSIsImhvbWVkaXIiLCJ5YXJuTGlua0ZvbHJkZXIiLCJkb2NrZXJDbGkiLCJhcGkiLCJzY3JpcHRDb21tYW5kIiwiYXBwbGljYXRpb25QYXRoIiwicHJvamVjdCIsImNvbmZpZ3VyYXRpb24iLCJyb290UGF0aCIsImNvbnRhaW5lclByb2plY3RQYXRoIiwiZXhlY3V0YWJsZUNvbW1hbmQiLCJjb25zb2xlIiwibG9nIiwib3B0aW9uIiwiY3dkIiwiZGV0YWNoZWQiLCJzaGVsbCIsInN0ZGlvIiwiZW52IiwiT2JqZWN0IiwiYXNzaWduIiwicHJvY2VzcyIsImNvbW1hbmQiLCJjb21tYW5kQXJndW1lbnQiLCJkb2NrZXJDb21wb3NlQ2xpIiwidGFyZ2V0UHJvamVjdENvbmYiLCJ0YXJnZXRUZW1wb3JhcnlGb2xkZXIiLCJwb3J0TGlzdCIsImFwaUdhdGV3YXkiLCJzZXJ2aWNlIiwibWFwIiwiaXRlbSIsInBvcnQiLCJmaWx0ZXIiLCJvYmplY3QiLCJ2ZXJzaW9uIiwibmV0d29ya3MiLCJpbnRlcm5hbCIsImRyaXZlciIsImV4dGVybmFsIiwic2VydmljZXMiLCJhcHBsaWNhdGlvbiIsImltYWdlIiwicG9ydHMiLCJ0YXJnZXQiLCJwdWJsaXNoZWQiLCJ2b2x1bWVzIiwiYWxpYXNlcyIsIndvcmtpbmdfZGlyIiwidHR5Iiwic3RkaW5fb3BlbiIsInlhbWxDb25maWciLCJqc1lhbWwiLCJkdW1wIiwibGluZVdpZHRoIiwiSW5maW5pdHkiLCJub0NvbXBhdE1vZGUiLCJ5YW1sRmlsZSIsImZpbGVzeXN0ZW0iLCJ3cml0ZUZpbGVTeW5jIl0sIm1hcHBpbmdzIjoiaVVBQUE7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTs7QUFFQSxNQUFNQSxxQkFBcUIsR0FBR0MsY0FBS0Ms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QkMsWUFBWSxFQUFFLElBQXJDLEVBQXBCLENBQWpCO0FBQ0VDLEVBQUFBLFFBQVEsR0FBRzVELGNBQUtDLElBQUwsQ0FBVTRCLHFCQUFWLEVBQWlDLG9CQUFqQyxDQURiO0FBRUFnQyxjQUFXQyxhQUFYLENBQXlCRixRQUF6QixFQUFtQ04sVUFBbkM7O0FBRUEsTUFBSXpDLGlCQUFpQixHQUFHO0FBQ3RCOzs7QUFHRywyQkFBd0IrQyxRQUFTLDhDQUhwQzs7Ozs7OztBQVVHLHNEQVZIO0FBV0UzRCxFQUFBQSxJQVhGLENBV08sR0FYUCxDQURzQixDQUF4Qjs7O0FBZUEsTUFBSWUsTUFBTSxHQUFHO0FBQ1hDLElBQUFBLEdBQUcsRUFBRU4sUUFETTtBQUVYTyxJQUFBQSxRQUFRLEVBQUUsS0FGQztBQUdYQyxJQUFBQSxLQUFLLEVBQUUsSUFISTtBQUlYQyxJQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FKSTs7QUFNWEMsSUFBQUEsR0FBRyxFQUFFQyxNQUFNLENBQUNDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCQyxPQUFPLENBQUNILEdBQTFCLEVBQStCLEVBQS9CLENBTk0sRUFBYjs7OztBQVVBUCxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBc0IsTUFBbEMsRUFBMENSLGFBQTFDO0FBQ0FPLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFhLHNCQUFxQkYsaUJBQWlCLENBQUNaLElBQWxCLENBQXVCLEdBQXZCLENBQTRCLEdBQTlEO0FBQ0EsUUFBTSxDQUFDd0IsT0FBRCxFQUFVLEdBQUdDLGVBQWIsSUFBZ0NiLGlCQUF0QztBQUNBLGdDQUFVWSxPQUFWLEVBQW1CQyxlQUFuQixFQUFvQ1YsTUFBcEM7OztBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMsIHNwYXduLCBzcGF3blN5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IG9wZXJhdGluZ1N5c3RlbSBmcm9tICdvcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZmlsZXN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0J1xuaW1wb3J0IHJlc29sdmUgZnJvbSAncmVzb2x2ZScgLy8gdXNlICdyZXNvbHZlJyBtb2R1bGUgdG8gYWxsb3cgcGFzc2luZyAncHJlc2VydmUgc3ltbGlua3MnIG9wdGlvbiB0aGF0IGlzIG5vdCBzdXBwb3J0ZWQgYnkgcmVxdWlyZS5yZXNvbHZlIG1vZHVsZS5cbmltcG9ydCAqIGFzIGRvY2tlcm9kZSBmcm9tICdkb2NrZXJvZGUnXG5pbXBvcnQgKiBhcyBqc1lhbWwgZnJvbSAnanMteWFtbCdcbi8vIHdoaWxlIGRldmVsb3BpbmcsIGFsbG93IGRlcGVuZGVuY3kgc3ltbGlua3MgdG8gd29yayBpbiBjb250YWluZXJzLlxuY29uc3QgZGV2ZWxvcG1lbnRDb2RlRm9sZGVyID0gcGF0aC5qb2luKG9wZXJhdGluZ1N5c3RlbS5ob21lZGlyKCksICdjb2RlJyksXG4gIHlhcm5MaW5rRm9scmRlciA9IHBhdGguam9pbihvcGVyYXRpbmdTeXN0ZW0uaG9tZWRpcigpLCAnLmNvbmZpZycpXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb2NrZXJDbGkoeyBhcGkgLyogc3VwcGxpZWQgYnkgc2NyaXB0TWFuYWdlciAqLywgc2NyaXB0Q29tbWFuZCA9ICcvYmluL2Jhc2gnIH0gPSB7fSkge1xuICBjb25zdCBhcHBsaWNhdGlvblBhdGggPSBwYXRoLmpvaW4oYXBpLnByb2plY3QuY29uZmlndXJhdGlvbi5yb290UGF0aCwgJ2VudHJ5cG9pbnQvY2xpJyksXG4gICAgcm9vdFBhdGggPSBhcGkucHJvamVjdC5jb25maWd1cmF0aW9uLnJvb3RQYXRoLFxuICAgIGNvbnRhaW5lclByb2plY3RQYXRoID0gcm9vdFBhdGhcblxuICBsZXQgZXhlY3V0YWJsZUNvbW1hbmQgPSBbXG4gICAgJ2RvY2tlcicsXG4gICAgYHJ1bmAsXG5cbiAgICAvLyBgLS1uYW1lICR7J3Byb2plY3QnfWAsXG5cbiAgICAvLyAtLWV4cGVyaW1lbnRhbC1tb2R1bGVzIC0taW5wdXQtdHlwZT1jb21tb25qXG4gICAgJy0taW5pdCcsIC8vIEZpeGVzIHNpZ25hbCBoYW5kbGVycyAmIHJlYXBpbmcgKHByb2Nlc3Mgb2YgZWxpbWluYXRpbmcgem9tYmllIHByb2Nlc3NlcykuICBodHRwczovL2dpdGh1Yi5jb20va3JhbGxpbi90aW5pIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2NrZXIvY2xpL3B1bGwvMTg0MVxuICAgICctLXNpZy1wcm94eScsIC8vIHBhc3Mgc2lnbmFsc1xuICAgIGAtLWludGVyYWN0aXZlIC0tdHR5YCwgLy8gYWxsb2NhdGUgYSB0ZXJtaW5hbCAtIHRoaXMgYWxsb3dzIGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBjb250YWluZXIgcHJvY2Vzcy4gdHR5ID0gVW5peC9MaW51eCB0ZXJtaW5hbCBhY2Nlc3MgaGFuZGxpbmcgdXNpbmcgbW9kZW0gYmFzZWQgY29ubmVjdGlvbiAoYWxsb3dzIGlucHV0IGZyb20gdGVybWluYWwpLCBpdGVyYWN0aXZlID0gYWNjZXB0cyBpbnB1dCBmcm9tIGhvc3QuXG4gICAgYC0tcm1gLCAvLyBhdXRvbWF0aWNhbGx5IHJlbW92ZSBhZnRlciBjb250YWluZXIgZXhpc3RzLlxuICAgIGAtLXdvcmtkaXIgJHtjb250YWluZXJQcm9qZWN0UGF0aH1gLFxuXG4gICAgYC0tdm9sdW1lICR7cm9vdFBhdGh9OiR7Y29udGFpbmVyUHJvamVjdFBhdGh9YCxcbiAgICAvLyBsb2NhbCBkZXZlbG9wbWVudCByZWxhdGVkIHBhdGhzXG4gICAgYC0tdm9sdW1lICR7ZGV2ZWxvcG1lbnRDb2RlRm9sZGVyfToke2RldmVsb3BtZW50Q29kZUZvbGRlcn1gLFxuICAgIGAtLXZvbHVtZSAke3lhcm5MaW5rRm9scmRlcn06JHt5YXJuTGlua0ZvbHJkZXJ9YCxcbiAgICBgLS12b2x1bWUgL3Zhci9ydW4vZG9ja2VyLnNvY2s6L3Zhci9ydW4vZG9ja2VyLnNvY2tgLFxuICAgIC8vIGAtLXZvbHVtZSAke29wZXJhdGluZ1N5c3RlbS5ob21lZGlyKCl9Ly5zc2g6L3Byb2plY3QvLnNzaGAsXG5cbiAgICAvLyBjb250YWluZXIgbmFtZSBpcyByZWdpc3RlcmVkIGJ5IERvY2tlciBhdXRvbWF0aWNhbGx5IGZvciBub24gZGVmYXVsdCBuZXR3b3JrcyBhcyBob3N0bmFtZXMgaW4gb3RoZXIgY29udGFpbmVycyAoZGVmYXVsdCBicmlkZ2UgbmV0d29yayB3aWxsIG5vdCB1c2UgaG9zdG5hbWUgRE5TKSwgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBtZW1ncmFwaCBjb250YWluZXIgdGhyb3VnaCBpdCdzIG5hbWUuIChkZWZhdWx0IG5ldHdvcmsgZG9lc24ndCBzdXBwb3J0IGFsaWFzZXMpXG4gICAgYC0tbmV0d29yaz0keydleHRlcm5hbCd9YCxcbiAgICBgLS1uZXR3b3JrLWFsaWFzICR7J2FwcGxpY2F0aW9uJ31gLCAvLyBtYWtlIGNvbnRhaW5lciBkaXNjb3ZlcmFibGUgYnkgYW5vdGhlciBob3N0bmFtZSBpbiBhZGRpdGlvbiB0byB0aGUgY29udGFpbmVyIG5hbWUgZm9yIHNwZWNpZmljIG5ldHdvcmsuXG4gICAgLy8gYC0tYWRkLWhvc3QgbWVtZ3JhcGg6MTcyLjE3LjAuM2AsXG5cbiAgICAvLyBgLVBgLCAvLyBQdWJsaXNoIGFsbCBleHBvc2VkIHBvcnRzIHRvIHRoZSBob3N0IGludGVyZmFjZXNcbiAgICBgLXAgNDQzOjQ0MyAtcCA4MDgwOjgwODAgLXAgODA4MTo4MDgxIC1wIDgwODI6ODA4MiAtcCA4MDgzOjgwODMgLXAgODA4NDo4MDg0IC1wIDgwODU6ODA4NWAsIC8vc2VydmljZXMgcG9ydHNcbiAgICBgLXAgOTIyOTo5MjI5YCwgLy8gTm9kZWpzJ3MgcmVtb3RlIGRlYnVnZ2VyXG4gICAgYC1wIDkwOTA6OTA5MCAtcCA5OTAxOjk5MDEgLXAgOTkwMjo5OTAyYCwgLy8gQnJvd3NlcnN5bmMgbGl2ZXJlbG9hZFxuXG4gICAgLyogICdteXVzZXJpbmRvY2tlci9kZXBsb3ltZW50LWVudmlyb25tZW50OmxhdGVzdCdcbiAgICAgICAgJ215dXNlcmluZG9ja2VyL2RlcGxveW1lbnQtZW52aXJvbm1lbnQ6c2ltcGxlX05vZGVEb2NrZXJDb21wb3NlJ1xuICAgICAgICB0aGlzIGNvbnRhaW5lciBzaG91bGQgaGF2ZSBkb2NrZXIgY2xpZW50ICYgZG9ja2VyLWNvbXBvc2UgaW5zdGFsbGVkIGluLiovXG4gICAgYCR7J25vZGU6Y3VycmVudCd9YCwgLy8gbm9kZWpzIDEyIHRvIHN1cHBvcnQgbm9kZWdpdFxuICAgIHNjcmlwdENvbW1hbmQsXG4gIF1cblxuICBjb25zb2xlLmxvZygnY29udGFpbmVyIGNvbW1hbmQnICsgJzogXFxuJywgc2NyaXB0Q29tbWFuZClcbiAgY29uc29sZS5sb2coYOKAoiBkb2NrZXIgY29tbWFuZDogXCIke2V4ZWN1dGFibGVDb21tYW5kLmpvaW4oJyAnKX1cImApXG5cbiAgbGV0IG9wdGlvbiA9IHtcbiAgICBjd2Q6IHJvb3RQYXRoLFxuICAgIGRldGFjaGVkOiBmYWxzZSxcbiAgICBzaGVsbDogdHJ1ZSxcbiAgICBzdGRpbzogWzAsIDEsIDJdLFxuICAgIC8vIElNUE9SVEFOVDogZ2xvYmFsIGVudmlyb25tZW50IHNob3VsZCBiZSBwYXNzZWQgdG8gYWxsb3cgZm9yIGRvY2tlciBjb21tYW5kcyB0byB3b3JrIGluc2lkZSBub2RlanMgcHJvY2VzcywgYXMgdGhlIFdTTCB1c2VzIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIGNvbm5lY3QgdG8gdGhlIFdpbmRvd3MgRG9ja2VyIGVuZ2luZSBzb2NrZXQuXG4gICAgZW52OiBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudiwge1xuICAgICAgLy8gREVQTE9ZTUVOVDogJ2RldmVsb3BtZW50JyxcbiAgICB9KSxcbiAgfVxuICBjb25zdCBbY29tbWFuZCwgLi4uY29tbWFuZEFyZ3VtZW50XSA9IGV4ZWN1dGFibGVDb21tYW5kXG4gIHNwYXduU3luYyhjb21tYW5kLCBjb21tYW5kQXJndW1lbnQsIG9wdGlvbilcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvY2tlckNvbXBvc2VDbGkoeyBhcGkgLyogc3VwcGxpZWQgYnkgc2NyaXB0TWFuYWdlciAqLywgc2NyaXB0Q29tbWFuZCA9ICcvYmluL2Jhc2gnIH0gPSB7fSkge1xuICBjb25zdCB0YXJnZXRQcm9qZWN0Q29uZiA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbixcbiAgICByb290UGF0aCA9IGFwaS5wcm9qZWN0LmNvbmZpZ3VyYXRpb24ucm9vdFBhdGgsXG4gICAgdGFyZ2V0VGVtcG9yYXJ5Rm9sZGVyID0gcGF0aC5qb2luKHJvb3RQYXRoLCAndGVtcG9yYXJ5JyksXG4gICAgY29udGFpbmVyUHJvamVjdFBhdGggPSByb290UGF0aFxuXG4gIGxldCBwb3J0TGlzdCA9IFtcbiAgICAuLi50YXJnZXRQcm9qZWN0Q29uZi5hcGlHYXRld2F5LnNlcnZpY2UubWFwKGl0ZW0gPT4gaXRlbS5wb3J0KS5maWx0ZXIoaXRlbSA9PiBpdGVtKSxcbiAgICAvLyBBZGRpdGlvbmFsIGRldmVsb3BtZW50IHBvcnRzXG4gICAgLi4uW1xuICAgICAgLy8gTm9kZWpzJ3MgcmVtb3RlIGRlYnVnZ2VyXG4gICAgICA5MjI5LFxuICAgICAgLy8gQnJvd3NlcnN5bmMgbGl2ZXJlbG9hZFxuICAgICAgOTA5MCxcbiAgICAgIDk5MDEsXG4gICAgICA5OTAyLFxuICAgIF0sXG4gIF1cbiAgbGV0IG9iamVjdCA9IHtcbiAgICB2ZXJzaW9uOiAnMy43JyxcbiAgICBuZXR3b3Jrczoge1xuICAgICAgaW50ZXJuYWw6IHtcbiAgICAgICAgZHJpdmVyOiAnYnJpZGdlJywgLy8gbmV0d29yayBkaXJ2ZXI6ICBicmlkZ2UgZm9yIHRoZSBzYW1lIGhvc3QsIHdoaWxlIG92ZXJsYXkgaXMgZm9yIHN3YXJtIGhvc3RzLlxuICAgICAgfSxcbiAgICAgIGV4dGVybmFsOiB7IGV4dGVybmFsOiB0cnVlIH0sXG4gICAgfSxcbiAgICBzZXJ2aWNlczoge1xuICAgICAgYXBwbGljYXRpb246IHtcbiAgICAgICAgaW1hZ2U6ICdub2RlOmN1cnJlbnQnLFxuXG4gICAgICAgIC8vIHRvIGNoYW5nZSBwb3J0IGludGVyZmFjZSAoaXApIHVzZSBcIjEyNy4wLjAuMTo4MDo4MFwiXG4gICAgICAgIHBvcnRzOiBwb3J0TGlzdC5tYXAocG9ydCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRhcmdldDogcG9ydCxcbiAgICAgICAgICAgIHB1Ymxpc2hlZDogcG9ydCxcbiAgICAgICAgICAgIC8vIG1vZGU6ICdob3N0JyxcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuXG4gICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICBgJHtyb290UGF0aH06JHtjb250YWluZXJQcm9qZWN0UGF0aH1gLFxuICAgICAgICAgIC8vIGxvY2FsIGRldmVsb3BtZW50IHJlbGF0ZWQgcGF0aHNcbiAgICAgICAgICBgJHtkZXZlbG9wbWVudENvZGVGb2xkZXJ9OiR7ZGV2ZWxvcG1lbnRDb2RlRm9sZGVyfWAsXG4gICAgICAgICAgYCR7eWFybkxpbmtGb2xyZGVyfToke3lhcm5MaW5rRm9scmRlcn1gLFxuICAgICAgICAgIGAvdmFyL3J1bi9kb2NrZXIuc29jazovdmFyL3J1bi9kb2NrZXIuc29ja2AsXG4gICAgICAgIF0sXG5cbiAgICAgICAgbmV0d29ya3M6IHtcbiAgICAgICAgICBleHRlcm5hbDoge1xuICAgICAgICAgICAgYWxpYXNlczogWydhcHBsaWNhdGlvbiddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG5cbiAgICAgICAgd29ya2luZ19kaXI6IHJvb3RQYXRoLFxuICAgICAgICAvLyBJTVBPUlRBTlQ6IGlmIGV4ZWN1dGVkIHdpdGggY29tbWFuZCBgL2Jpbi9zaCAtYyAnJ2AsIGFzIGRlZmF1bHQgZG9ja2VyIGRvZXMsIHRoZSBpbnRlcnJ1cHQgc2lnbmFscyB3aWxsIG5vdCBiZSBwYXNzZWQgdG8gdGhlIHJ1bm5pbmcgcHJvY2VzcyBhbmQgdGh1cyB3aWxsIG5vdCBhYm9ydCB0aGUgY29udGFpbmVycy4gVGhlcmVmb3JlIC9iaW4vYmFzaCAtYyBzaG91bGQgYmUgdXNlZCwgb3IgRU5UUllQT0lOVCBpbnN0ZWFkIG9mIENPTU1BTkQgd2lsbCB1c2UgYmFzaCBieSBkZWZhdWx0LlxuICAgICAgICAvLyBJTVBPUlRBTlQ6IG5vZGUgLS1ldmFsIGRvZXNuJ3QgcGFzcyBzaWduYWxzIGNvcnJlY3RseSBpbiBkb2NrZXIgY29tbWFuZCwgYnV0IHdyYXBwaW5nIGl0IHRocm91Z2ggbnBtIHNjcmlwdHMgKHlhcm4gcnVuIDxzY3JpcHQgbmFtZT4pIGFkZHMgZnVuY3Rpb25hbGl0eS5cbiAgICAgICAgY29tbWFuZDogc2NyaXB0Q29tbWFuZCxcbiAgICAgICAgLy8gZW50cnlwb2ludDpcbiAgICAgICAgLy8gICAvLyBbJ25vZGUnLCBgLS1ldmFsYCwgYHJlcXVpcmUocHJvY2Vzcy5jd2QoKSkuYXBwbGljYXRpb24oe30se21lbWdyYXBoOntob3N0OidtZW1ncmFwaCd9fSlgXSB8fCBbJ3lhcm4nLCAncnVuJywgJ3J1bi1jb25maWd1cmVkRm9yQ29udGFpbmVyJ10gfHxcbiAgICAgICAgLy8gICBgJHtzY3JpcHRDb21tYW5kfWAuc3BsaXQoJyAnKS5maWx0ZXIoaXRlbSA9PiBpdGVtLmxlbmd0aCAvKlJlbW92ZSBlbXB0eSB2YWx1ZXMqLyksIC8vIGAvYmluL2Jhc2ggLWMgXCJscyAtYWxcImBcblxuICAgICAgICAvLyBodHRwczovL2RvY3MuZG9ja2VyLmNvbS9jb21wb3NlL2NvbXBvc2UtZmlsZS8jZG9tYWlubmFtZS1ob3N0bmFtZS1pcGMtbWFjX2FkZHJlc3MtcHJpdmlsZWdlZC1yZWFkX29ubHktc2htX3NpemUtc3RkaW5fb3Blbi10dHktdXNlci13b3JraW5nX2RpclxuICAgICAgICAvLyB3b3JrcyBvbmx5IHdpdGggZG9ja2VyLWNvbXBvc2UgcnVuIGJ1dCBkb2Vzbid0IHdvcmsgZm9yIHNvbWUgcmVhc29uIHdpdGggZG9ja2VyLWNvbXBvc2UgdXAgKHN0dWNrIG9uICdhdHRhY2hpbmcgPHNlcnZpY2VOYW1lPi4uJylcbiAgICAgICAgdHR5OiB0cnVlLFxuICAgICAgICBzdGRpbl9vcGVuOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9XG5cbiAgbGV0IHlhbWxDb25maWcgPSBqc1lhbWwuZHVtcChvYmplY3QsIHsgbGluZVdpZHRoOiBJbmZpbml0eSwgbm9Db21wYXRNb2RlOiB0cnVlIH0pLFxuICAgIHlhbWxGaWxlID0gcGF0aC5qb2luKHRhcmdldFRlbXBvcmFyeUZvbGRlciwgJ2RvY2tlckNvbXBvc2UueWFtbCcpXG4gIGZpbGVzeXN0ZW0ud3JpdGVGaWxlU3luYyh5YW1sRmlsZSwgeWFtbENvbmZpZylcblxuICBsZXQgZXhlY3V0YWJsZUNvbW1hbmQgPSBbXG4gICAgW1xuICAgICAgLy8gY29tcG9zZSBvcHRpb25zIGh0dHBzOi8vZG9jcy5kb2NrZXIuY29tL2NvbXBvc2UvY29tcG9zZS1maWxlLyNlbnRyeXBvaW50XG4gICAgICAvLyBjb21wb3NlIGNvbW1hbmQgb3B0aW9ucyBodHRwczovL2RvY3MuZG9ja2VyLmNvbS9jb21wb3NlL3JlZmVyZW5jZS9vdmVydmlldy9cbiAgICAgIGBkb2NrZXItY29tcG9zZSAtLWZpbGUgJHt5YW1sRmlsZX0gLS1wcm9qZWN0LW5hbWUgYXBwbGljYXRpb24gLS1sb2ctbGV2ZWwgSU5GT2AsXG5cbiAgICAgIC8vIGB1cCAtLWRldGFjaCAtLW5vLWJ1aWxkIC0tZm9yY2UtcmVjcmVhdGUgLS1hYm9ydC1vbi1jb250YWluZXItZXhpdGBcbiAgICAgIC8vIGBidWlsZCAtLW5vLWNhY2hlICR7c2VydmljZU5hbWV9YFxuICAgICAgLy8gYHB1bGwgY29udGFpbmVyRGVwbG95bWVudE1hbmFnZW1lbnRgIC8vIHB1bGwgcHJldmlvdXNseSBidWlsdCBpbWFnZVxuXG4gICAgICAvLyAtLXNlcnZpY2UtcG9ydHMgaXMgcmVxdWlyZWQgd2hlbiB1c2luZyBydW4gY29tbWFuZCwgaXQgYWxsb3dzIG1hcHBpbmcgb2YgcG9ydHMgdG8gaG9zdCBhcyBzZXQgaW4geW1sIGZpbGUuXG4gICAgICBgcnVuIC0tcm0gLS1zZXJ2aWNlLXBvcnRzIC0tdXNlLWFsaWFzZXMgYXBwbGljYXRpb25gLCAvLyBhbGxvd3MgYXR0YWNoaW5nIHRvIHRoZSBjb250YWluZXJcbiAgICBdLmpvaW4oJyAnKSxcbiAgXVxuXG4gIGxldCBvcHRpb24gPSB7XG4gICAgY3dkOiByb290UGF0aCxcbiAgICBkZXRhY2hlZDogZmFsc2UsXG4gICAgc2hlbGw6IHRydWUsXG4gICAgc3RkaW86IFswLCAxLCAyXSxcbiAgICAvLyBJTVBPUlRBTlQ6IGdsb2JhbCBlbnZpcm9ubWVudCBzaG91bGQgYmUgcGFzc2VkIHRvIGFsbG93IGZvciBkb2NrZXIgY29tbWFuZHMgdG8gd29yayBpbnNpZGUgbm9kZWpzIHByb2Nlc3MsIGFzIHRoZSBXU0wgdXNlcyBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBjb25uZWN0IHRvIHRoZSBXaW5kb3dzIERvY2tlciBlbmdpbmUgc29ja2V0LlxuICAgIGVudjogT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHtcbiAgICAgIC8vIERFUExPWU1FTlQ6ICdkZXZlbG9wbWVudCcsXG4gICAgfSksXG4gIH1cbiAgY29uc29sZS5sb2coJ2NvbnRhaW5lciBjb21tYW5kJyArICc6IFxcbicsIHNjcmlwdENvbW1hbmQpXG4gIGNvbnNvbGUubG9nKGDigKIgZG9ja2VyIGNvbW1hbmQ6IFwiJHtleGVjdXRhYmxlQ29tbWFuZC5qb2luKCcgJyl9XCJgKVxuICBjb25zdCBbY29tbWFuZCwgLi4uY29tbWFuZEFyZ3VtZW50XSA9IGV4ZWN1dGFibGVDb21tYW5kXG4gIHNwYXduU3luYyhjb21tYW5kLCBjb21tYW5kQXJndW1lbnQsIG9wdGlvbilcblxuICAvLyBbJ2RvY2tlci1jb21wb3NlJywgYC1mICR7eW1sRmlsZX1gLCBgLS1wcm9qZWN0LW5hbWUgJHtwcm9qZWN0TmFtZX1gLCBgZG93bmBdIC8vIHN0b3AgYW5kIHJlbW92ZSBjb250YWluZXJzIHJlbGF0ZWQgdG8gcHJvamVjdCBuYW1lLlxufVxuIl19