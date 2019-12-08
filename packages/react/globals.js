const corePackage = require(".");

for (const moduleName of Object.keys(corePackage)) {
  global[moduleName] = corePackage[moduleName];
}
