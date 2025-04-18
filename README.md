# STNE Script Support for Visual Studio Code

The extension provides various aids for creating and editing <a href="https:\\game.stne.net">STNE</a> scripts.

## Table of Contents  
1. [Features](#features)  
2. [Installation](#installation)
3. [Usage](#usage)
4. [Build](#build)
5. [Tests](#tests)

## Features

#### Code Formatting

You can auto format your scripts using the `Format Document` action in VS Code.\
Default keybinding: `ALT + SHIFT + F`

#### Syntax Highlighting

Your STNE scripts will feature complete syntax highlighting, coveringkeywords, comments and all other elements: 
![Syntax Highlighting](https://raw.githubusercontent.com/JackTaylor1114/stnescriptextension/refs/heads/master/img/syntaxhighlight.png)

#### Completion Suggestions

The extension provides completion suggestions when you code:
![Completion Suggestions](https://raw.githubusercontent.com/JackTaylor1114/stnescriptextension/refs/heads/master/img/suggestions.png)

#### Code Snippets

You can insert code snippets such as `ForEach` or variable declarations when you type certain keywords: 
![Syntax Highlighting](https://raw.githubusercontent.com/JackTaylor1114/stnescriptextension/refs/heads/master/img/snippets.png)

#### File Icon

Files with `.stne` extension will have a special file icon in the explorer:\
![File Icon](https://raw.githubusercontent.com/JackTaylor1114/stnescriptextension/refs/heads/master/img/fileicon.png)

## Installation

* Option A: 
  * Open Visual Studio Code and go to view `Extensions`
  * Search for `STNE Script Support` and choose `Install`
* Option B:
  * Visit the <a href="https://marketplace.visualstudio.com/items?itemName=STNE.stnescript-support">Visual Studio Marketplace</a> page of the extension 
  * Choose `Install` and then `Open Visual Studio Code`

## Usage

To use the extension, open a workspace in VS Code and create a text file with an `.stne` extension.\
VS Code will automatically detect `STNE Script` as the programming language in this file. 

ℹ️ You can configure `brace style` and `indentation size` in **`File » Preferences » STNE Script Support`**

## Build

To build the extension yourself, you need `Visual Studio Code` and `Node.js` installed on your machine.\
Use the following commands to download the code and install dependencies:
```
git clone https://github.com/JackTaylor1114/stnescriptextension.git
npm install
```

There are two possible ways to build the extension: 

* `npm run build`
  * This script will use `tsc` to compile the TypeScript code into JavaScript
  * Output will be genereated in `/build`
  * Non-minimized JavaScript versions of source and test files will be created
  * Unit tests will run with this build, but it cannot be launched from VS Code

* `npm run compile-webpack`
  * This script will use `webpack` to compile a single JavaScript asset
  * Output will be generated in `/dist` (ignoring all test files)  
  * This version will be used when the extension is launched for debugging
  * The production version is compiled with `npm run package`

To debug the extension, use the `Start` launch configuration in VS Code.\
The default configuration will `compile-webpack` the project before launch.

The release artifact is created with `vsce package`.

## Tests

To run unit tests for the project, use the command `npm run test`.\
Test results will be printed in the Terminal.

You can also run the `Run Tests` launch configuration.\
This allows you to debug the test files in `/build/test`.\
Output from this test run will be printed in the Debug Console.