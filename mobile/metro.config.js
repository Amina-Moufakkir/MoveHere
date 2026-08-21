/**
 * Spike Metro config.
 *
 * The shared MoveHere source lives at the repository root, outside this
 * project, so Metro has to be told to watch it. That is the only deviation
 * from the default config — deliberately, so that if bundling succeeds we know
 * exactly what sharing the domain costs in configuration.
 *
 * No resolver customisation. If Metro needs help with the repository's
 * explicit .ts import specifiers, this spike must fail rather than paper over
 * it: that answer is the point of the exercise.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [repoRoot];

module.exports = config;
