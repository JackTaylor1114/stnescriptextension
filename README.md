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

You get the option to insert code snippets such as `ForEach` or variable declarations when you type certain keywords: 
![Syntax Highlighting](https://raw.githubusercontent.com/JackTaylor1114/stnescriptextension/refs/heads/master/img/snippets.png)

## Installation

* Option 1: 
  * Open Visual Studio Code, search for `STNE Script Support` and choose `Install`
* Option2:
  * Visit the <a href="https://marketplace.visualstudio.com/items?itemName=STNE.stnescript-support">Visual Studio Marketplace</a> and install the extension

## Usage

To use the extension, open a workspace in Visual Studio Code and create a text file with a `.stne` extension.\
Visual Studio Code will automatically detect `STNE Script` as the programming language in this file. 

ℹ️ You can configure your `brace style` and `indentation size` under **`File » Preferences » STNE Script Support`**

## Build

To build the extension yourself, you need Visual Studio Code and Node.js on your machine.\
Use the following commands to download the code and build the project:
```
git clone https://github.com/JackTaylor1114/stnescriptextension.git
npm install
```

Test the extension by running the `Launch` script in Visual Studio Code.\
The default launch configuration will `npm build` the project before launch.