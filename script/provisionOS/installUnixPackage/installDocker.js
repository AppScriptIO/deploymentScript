"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.install = install;const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] };
const { sync: binaryExist } = require('command-exists');

function install() {
  if (binaryExist('docker')) console.log('✔ docker is installed.');else

  childProcess.execSync(
  `
  sudo apt-get update -y && sudo apt-get upgrade -y \\
  sudo apt-get install -y \\
  apt-transport-https \\
  ca-certificates \\
  curl \\
  gnupg2 \\
  software-properties-common && \\
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add - && \\
  sudo add-apt-repository \\
  "deb [arch=amd64] https://download.docker.com/linux/debian \\
  $(lsb_release -cs) \\
  stable nightly" && \\
  sudo apt-get update -y && \\
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io && \\
  export DOCKER_HOST=tcp://127.0.0.1:2375
`,
  childProcessOption);

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC9wcm92aXNpb25PUy9pbnN0YWxsVW5peFBhY2thZ2UvaW5zdGFsbERvY2tlci5qcyJdLCJuYW1lcyI6WyJjaGlsZFByb2Nlc3NPcHRpb24iLCJjd2QiLCJfX2Rpcm5hbWUiLCJzaGVsbCIsInN0ZGlvIiwic3luYyIsImJpbmFyeUV4aXN0IiwicmVxdWlyZSIsImluc3RhbGwiLCJjb25zb2xlIiwibG9nIiwiY2hpbGRQcm9jZXNzIiwiZXhlY1N5bmMiXSwibWFwcGluZ3MiOiJxR0FBQSxNQUFNQSxrQkFBa0IsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLFNBQVAsRUFBa0JDLEtBQUssRUFBRSxJQUF6QixFQUErQkMsS0FBSyxFQUFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQXRDLEVBQTNCO0FBQ0EsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLFdBQVIsS0FBd0JDLE9BQU8sQ0FBQyxnQkFBRCxDQUFyQzs7QUFFTyxTQUFTQyxPQUFULEdBQW1CO0FBQ3hCLE1BQUlGLFdBQVcsQ0FBQyxRQUFELENBQWYsRUFBMkJHLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHdCQUFaLEVBQTNCOztBQUVFQyxFQUFBQSxZQUFZLENBQUNDLFFBQWI7QUFDRzs7Ozs7Ozs7Ozs7Ozs7OztDQURIO0FBa0JFWixFQUFBQSxrQkFsQkY7O0FBb0JIIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY2hpbGRQcm9jZXNzT3B0aW9uID0geyBjd2Q6IF9fZGlybmFtZSwgc2hlbGw6IHRydWUsIHN0ZGlvOiBbMCwgMSwgMl0gfVxuY29uc3QgeyBzeW5jOiBiaW5hcnlFeGlzdCB9ID0gcmVxdWlyZSgnY29tbWFuZC1leGlzdHMnKVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgaWYgKGJpbmFyeUV4aXN0KCdkb2NrZXInKSkgY29uc29sZS5sb2coJ+KclCBkb2NrZXIgaXMgaW5zdGFsbGVkLicpXG4gIGVsc2VcbiAgICBjaGlsZFByb2Nlc3MuZXhlY1N5bmMoXG4gICAgICBgXG4gIHN1ZG8gYXB0LWdldCB1cGRhdGUgLXkgJiYgc3VkbyBhcHQtZ2V0IHVwZ3JhZGUgLXkgXFxcXFxuICBzdWRvIGFwdC1nZXQgaW5zdGFsbCAteSBcXFxcXG4gIGFwdC10cmFuc3BvcnQtaHR0cHMgXFxcXFxuICBjYS1jZXJ0aWZpY2F0ZXMgXFxcXFxuICBjdXJsIFxcXFxcbiAgZ251cGcyIFxcXFxcbiAgc29mdHdhcmUtcHJvcGVydGllcy1jb21tb24gJiYgXFxcXFxuICBjdXJsIC1mc1NMIGh0dHBzOi8vZG93bmxvYWQuZG9ja2VyLmNvbS9saW51eC9kZWJpYW4vZ3BnIHwgc3VkbyBhcHQta2V5IGFkZCAtICYmIFxcXFxcbiAgc3VkbyBhZGQtYXB0LXJlcG9zaXRvcnkgXFxcXFxuICBcImRlYiBbYXJjaD1hbWQ2NF0gaHR0cHM6Ly9kb3dubG9hZC5kb2NrZXIuY29tL2xpbnV4L2RlYmlhbiBcXFxcXG4gICQobHNiX3JlbGVhc2UgLWNzKSBcXFxcXG4gIHN0YWJsZSBuaWdodGx5XCIgJiYgXFxcXFxuICBzdWRvIGFwdC1nZXQgdXBkYXRlIC15ICYmIFxcXFxcbiAgc3VkbyBhcHQtZ2V0IGluc3RhbGwgLXkgZG9ja2VyLWNlIGRvY2tlci1jZS1jbGkgY29udGFpbmVyZC5pbyAmJiBcXFxcXG4gIGV4cG9ydCBET0NLRVJfSE9TVD10Y3A6Ly8xMjcuMC4wLjE6MjM3NVxuYCxcbiAgICAgIGNoaWxkUHJvY2Vzc09wdGlvbixcbiAgICApXG59XG4iXX0=