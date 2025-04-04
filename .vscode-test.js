
import { defineConfig } from '@vscode/test-cli';
export default defineConfig([
  {
    label: 'unitTests',
    files: 'build/test/**/*.test.js',
    workspaceFolder: './',
    mocha: {
      ui: 'tdd',
      timeout: 5000
    }
  }
]);