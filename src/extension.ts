'use strict';

//Imports
import * as vscode from 'vscode';
import * as functions from './functions';

const SCRIPT_LANGUAGE = 'stnescript-lang';
const CONFIG_NAMESPACE = 'scriptSupportSTNE';
let beautify_js = require('js-beautify');

/**
 * Main entry point for the extension
 */
export function activate(context: vscode.ExtensionContext)
{
  //Read the available types that will be used for completion suggestions
  functions.LoadAvailableTypes();

  //Register provider for Document Formatting
  vscode.languages.registerDocumentFormattingEditProvider(SCRIPT_LANGUAGE, {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[]
    {
      //Load the whole document text
      let documentText: string = document.getText();

      // Escape the '<>' operator because beautify-js does not understand it properly
      documentText = documentText.replace(/<>/g, "/* beautify preserve:start */<>/* beautify preserve:end */");

      let documentStart: vscode.Position = document.lineAt(0).range.start;
      let documentEnd: vscode.Position = document.lineAt(document.lineCount - 1).range.end;
      let documentFullRange: vscode.Range = new vscode.Range(documentStart, documentEnd);

      //Get the formatting options from the user preferences
      const config = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
      let indentSize = parseInt(config.get<string>('indentSize') || "2", 10);
      let braceStyle = config.get<string>('braceStyle') || "expand";

      //Format the document using the JavaScript librarby 
      let documentFormatted = beautify_js(documentText, { indent_size: indentSize, space_in_empty_paren: true, brace_style: braceStyle });

      //Restore the escaped '<>' operator
      documentFormatted = documentFormatted.replace(/[\r\n ]*\s*\/\* beautify preserve:start \*\/<>\/\* beautify preserve:end \*\//g, " <> ");

      //Return the formatted text
      return [vscode.TextEdit.replace(documentFullRange, documentFormatted)];
    }
  });

  //Register provider for completion suggestions after '.'
  vscode.languages.registerCompletionItemProvider(SCRIPT_LANGUAGE, {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position)
    {
      //Get the content of the current line up to the current position
      let documentContent = document.getText();
      let lineContent = document.lineAt(position).text.substring(0, position.character);
      if (lineContent.slice(-1) != '.') return undefined;

      // Get the member access in the current line
      // [a-zA-Z_$][a-zA-Z0-9_$]* -> match an identifier (variable name or function name)
      // (\.[a-zA-Z_$][a-zA-Z0-9_$]*|\([^()]*\))* -> match zero or more occurrences of either:
      // a dot followed by a valid identifier OR a function call with parameters
      // \([^()]*\) -> match parameters in function calls
      // \. -> matches the final dot that triggers the member access
      // Limitations: nested function calls as parameters will not be detected properly
      let match = lineContent.match(/([a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*|\([^()]*\))*\.)/);
      if (!match) return undefined;

      //The member access needs to be resolved from start to finish (left to right)
      let parts: string[] = match[0].split('.');

      //Check the first part of the member access (root) 
      let root = parts[0];

      //Check if the root is a function call - if not, we assume it is a variable
      let functionMatch = root.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)$/);
      if (functionMatch)
      {
        //Find the function in the document by its name and get the return type
        let check = functions.CheckIfDocumentContainsFunction(functionMatch[0].substring(0, functionMatch[0].indexOf('(')), documentContent);
        if (check.isFunction && check.returnType !== null)
        {

        }
        else
        {
          return undefined;
        }
      }
      else
      {
        //TODO: find variable type (only in current scope)
      }






      return undefined;
      //Return the completition suggestions
      //return functions.GetCompletionItemsForType(functions.GetTypeForSuspectedVar(documentContent, currentLastWord));
    }
  }, '.');

  //Register provider for completion suggestions after ' '
  vscode.languages.registerCompletionItemProvider(SCRIPT_LANGUAGE, {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position)
    {
      //Get the text written between the space and and the last space in the line
      const linePrefix = document.lineAt(position).text.substr(0, position.character);
      let wordsOfLine = linePrefix.split(' ');
      let word = wordsOfLine[wordsOfLine.length - 2];

      //Check if the last word was "New" or "As" 
      if (word != "New" && word != "As") return undefined;

      //Return the completition suggestions
      return functions.GetAllTypesAsCompletionItems();
    }
  }, ' ');
}