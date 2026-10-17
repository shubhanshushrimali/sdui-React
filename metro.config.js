const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sduiRoot = path.resolve(projectRoot, 'packages/sdui');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...new Set([...(config.watchFolders ?? []), projectRoot, sduiRoot])];

module.exports = config;
