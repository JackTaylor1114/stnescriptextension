
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({ files: 'build/test/**/*.test.js' });
