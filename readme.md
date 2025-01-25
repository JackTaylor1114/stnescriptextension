# STNE Script Extension

This extension provides syntax highlighting, formatting and basic autocomplete for STNE scripts in VS Code

## Build

Requires VS Code and Node.js to be installed on your machine\
Use the following commands to download and build the project:
```
git clone https://github.com/JackTaylor1114/stnescriptextension.git
npm install
npm build
```

Test the extension by running the `Launch` script in VS Code\
The default launch configuration will automatically build the project.

## Functions

The following functions are available for text files with `.stne` extension:

* Special icon 
* Syntax highlighting
* Auto Formatting (default: `ALT + SHIFT + F`)
* Basic autocomplete

## Configuration

Users can edit the following settings via VS Code preferences menu:

* Indent Size (2 or 4 spaces)
* Brace Style (opening braces on new lines or inline)