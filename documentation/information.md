# deploymentScript
🛠 Scripting files managing the deployment of projects. Container Javascript scripts for testing, running, building, releasing apps, etc.
 - Scripts in this repository are JS modules exposing only a **programmatic API**. 
 - [**scriptManager**](https://github.com/AppScriptIO/scriptManager) tool is used to call them from the commandline, in which it accepts JS code as commanline arguments, loads the JS modules, and evaluate the JS code argument on the loaded module. 
- The target projects must install this library (`deploymentScript`) and also the `scriptManager` module in order to execute the scripts.

# Note about workspaces: 
`yarn workspaces` commands take into consideration the root node_modules of the repository, where if same packeges are found with different versions, a node_modules folder is created inside the workspace folder with the different package version.

# Publishing circular dependencies: 
- circular dependencies are dependencies that depend on each other for the JS Build and release scripts. 
  - could be of the same repository (depending on itself). Depending on a previous version of itself.
  - could be of differnt repositories. e.g. buildTool & deploymentScript - are both dependent on each other.
- Circular dependencies can share a "cross-dependency" that should be updated in order for the code to work. e.g. transpilation. 

The manual way to deal with such cases is to:
- use symlinks of each other in node_modules, and circular symlinks.
- copy the current non release version into node_modules temporarly for creating the build. 
- Upgrading and re-upgrading the dependencies once each released, one by one.
- build the packages with a shell scripts equivalent. or build with js module tool and release with shell.

Note: To deal with circular dependencies that refuse to install because of previous version code bug, this package uses it's own code to build itself, rather than using a previous version of itself, that may contain bugs which will complicate the next release creation.

# Docker container: 
- When running inside container, docker client communicates with MobeyLinuxVM on Windows host machine, and the volume paths will be related or referencing to the hyper-v MobyLinuxVM vm. In it here is a folder /host_mount/c that corresponds to the Widnows host filesystem drive. 
    In case of Docker for Windows, the path is a Windows path. While the path sent from a running container, should be refering to the hyper-v MobyLinuxVM (inside created by Docker for Windows are /host_mnt/c, with symlinks /c & /C).
- when using `localhost` chrome shows the files in folders, while using `0.0.0.0` files appear as separated. `0.0.0.0` allows access from any port (could be useful in containers as external connections not always referred to localhost it seems.)
- IMPORTATNT: In WSL1, the symlinks work between Windows & WSL1, but do not work on native Linux (e.g. containers). And the opposite is true.
      WSL2 (not released yet - insiders build) seems that it will make symlinks work between WSL2 and native linux (containers), as it uses a light native linux vm. While Windows symlinks won't work with WSL2. 
- DNS proxy for local development allowing access to containers using hostname: https://stackoverflow.com/questions/37242217/access-docker-container-from-host-using-containers-name
  `Containers on the default bridge network can only access each other by IP addresses, unless you use the --link option, which is considered legacy. On a user-defined bridge network, containers can resolve each other by name or alias.`
__

### 🔑 License: [MIT](/.github/LICENSE)
