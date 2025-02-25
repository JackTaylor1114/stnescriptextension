# STNE Script Support for Visual Studio Code

The extension provides various aids for creating and editing <a href="https:\\game.stne.net">STNE</a> scripts.

## Table of Contents  
1. [Features](#features)  
2. [Installation](#installation)
3. [Usage](#usage)
4. [Build](#build)

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

## Installation

* Option A: 
  * Open Visual Studio Code and go to view `Extensions`
  * Search for `STNE Script Support` and choose `Install`
* Option B:
  * Visit the <a href="https://marketplace.visualstudio.com/items?itemName=STNE.stnescript-support">Visual Studio Marketplace</a> page of the extension 
  * Choose `Install` and then `Open Visual Studio Code`

## Usage

To use the extension, open a workspace in Visual Studio Code and create a text file with a `.stne` extension.\
Visual Studio Code will automatically detect `STNE Script` as the programming language in this file. 

ℹ️ You can configure `brace style` and `indentation size` in **`File » Preferences » STNE Script Support`**

## Build

To build the extension yourself, you need `Visual Studio Code` and `Node.js` installed on your machine.\
Use the following commands to download the code and install dependencies:
```
git clone https://github.com/JackTaylor1114/stnescriptextension.git
npm install
```

Test the extension by running the `Launch` script in Visual Studio Code.\
The default launch configuration will `npm build` the project before launch.

## Tests

```
npm install --save-dev @vscode/test-cli @vscode/test-electron
npm run build
npm run test
```
