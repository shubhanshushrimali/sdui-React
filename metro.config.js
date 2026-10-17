const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sduiRoot = path.resolve(projectRoot, 'packages/sdui');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sduiRoot];
config.resolver.extraNodeModules = {
  '@sdui/react': sduiRoot,
};
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = config;
