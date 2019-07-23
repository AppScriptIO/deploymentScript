# deploymentScript
🛠 Scripting files managing the deployment of projects. Container Javascript scripts for testing, running, building, releasing apps, etc.
 - Scripts in this repository are JS modules exposing only a **programmatic API**. 
 - [**scriptManager**](https://github.com/AppScriptIO/scriptManager) tool is used to call them from the commandline, in which it accepts JS code as commanline arguments, loads the JS modules, and evaluate the JS code argument on the loaded module. 
- The target projects must install this library (`deploymentScript`) and also the `scriptManager` module in order to execute the scripts.
___

### 🔑 License: [MIT](/.github/LICENSE)
