'use strict';

//Imports
import * as vscode from 'vscode';
import * as functions from './functions';
import { Type } from './definitions';

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

      //Get the member access typed in the current line
      let parts: string[] = functions.GetMemberAccessFromLineOfCode(lineContent);
      if (parts == undefined || parts.length < 1) return undefined;

      //The member access needs to be resolved from start to finish (left to right)
      //Check the first part of the member access (root) 
      //There are 3 possibilities: the root could be a function call, a variable or a parameter
      let rootType: Type = null;
      let root = parts[0];
      let functionMatch = root.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)$/)

      //Root is a function call
      if (functionMatch)
      {
        //Find the function in the document by its name and get the return type
        let functionCheck = functions.CheckIfDocumentContainsFunction(functionMatch[0].substring(0, functionMatch[0].indexOf('(')), documentContent);
        if (functionCheck.isFunction && functionCheck.returnType !== undefined)
        {
          rootType = functions.AvailableTypes.find(t => t.name == functionCheck.returnType);
        }
        else
        {
          return undefined;
        }
      }
      else
      {
        //If root is not a function, it could be a variable or parameter
        //We cant distinguish between them just by the name or syntax
        //Therefore we just have to "try" and find the reference somwhere in the document 

        //TODO: Actually check only the current scope instead of the whole document content
        let variableCheck = functions.CheckIfScopeContainsVariable(root, documentContent);
        if (variableCheck.isVariable && variableCheck.type !== undefined)
        {
          rootType = functions.AvailableTypes.find(t => t.name == variableCheck.type);
        }
        else
        {
          //TODO: Actually check only the current scope instead of the whole document content
          let parameterCheck = functions.CheckIfScopeContainsParameter(root, documentContent);
          if (parameterCheck.isParameter && parameterCheck.type !== undefined) 
          {
            rootType = functions.AvailableTypes.find(t => t.name == parameterCheck.type);
          }
          else
          {
            return undefined;
          }
        }
      }

      if (rootType == null || rootType == undefined) return undefined;

      //TODO: Jetzt ist der Typ des 1. MemberAccess in der Kette bekannt
      //Nun mit einer Schleife von links nach rechts auflösen

      return undefined;
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