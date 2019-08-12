# deploymentScript
🛠 Scripting files managing the deployment of projects. Container Javascript scripts for testing, running, building, releasing apps, etc.
 - Scripts in this repository are JS modules exposing only a **programmatic API**. 
 - [**scriptManager**](https://github.com/AppScriptIO/scriptManager) tool is used to call them from the commandline, in which it accepts JS code as commanline arguments, loads the JS modules, and evaluate the JS code argument on the loaded module. 
- The target projects must install this library (`deploymentScript`) and also the `scriptManager` module in order to execute the scripts.


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

___

### 🔑 License: [MIT](/.github/LICENSE)
