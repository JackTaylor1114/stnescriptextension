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
      //Get the text written between the dot and and the last space in the line
      let linePrefix = document.lineAt(position).text.substr(0, position.character);
      let docText = document.getText();

      //Split the current line by different chars and check for the shortest last word
      let splitters = [' ', '(', '{', '.'];
      let currentLastWord = "";
      for (let splitter of splitters)
      {
        let wordsOfLine = linePrefix.split(splitter);
        if (wordsOfLine.length > 0)
        {
          //If the splitter is '.', use the second last word because '.' was just typed
          let lastWord = "";
          if (splitter == '.' && wordsOfLine.length > 1)
          {
            lastWord = wordsOfLine[wordsOfLine.length - 2];
          }
          else
          {
            lastWord = wordsOfLine[wordsOfLine.length - 1];
          }

          //Remove the '.' from the end of the word and check if a shorter last word was found
          if (splitter != '.')
          {
            lastWord = lastWord.slice(0, -1);
          }
          if (lastWord.length < currentLastWord.length || currentLastWord == "")
          {
            currentLastWord = lastWord;
          }
        }
      }

      //Return the completition suggestions
      return functions.GetCompletitionItemsForType(functions.GetTypeForSuspectedVar(docText, currentLastWord));
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
      return functions.GetTypeCompletitionItems();
    }
  }, ' ');
}