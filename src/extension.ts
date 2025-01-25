'use strict';

//Imports
import * as vscode from 'vscode';
import * as data from './resources/objectexplorer.json'
import { Type, Member, Param, MemberFunction } from './definitions';

//Definitions
let beautify_js = require('js-beautify');
let types: Array<Type> = [];

/**
 * Main function that is called when the extension is started
 */
export function activate(context: vscode.ExtensionContext)
{
  //Read all available types in STNE from JSON
  LoadTypesFromJSON();

  //Register Provider for Document Formatting
  vscode.languages.registerDocumentFormattingEditProvider('stnescript-lang', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[]
    {
      //Load the whole document text
      let documentText = document.getText();

      // Escape <> operator as beautify-js doesn't understand it properly
      documentText = documentText.replace(/<>/g, "/* beautify preserve:start */<>/* beautify preserve:end */");

      let documentStart: vscode.Position = document.lineAt(0).range.start;
      let documentEnd: vscode.Position = document.lineAt(document.lineCount - 1).range.end;
      let documentFullRange: vscode.Range = new vscode.Range(documentStart, documentEnd);

      //Get formatting options from the user preferences
      const config = vscode.workspace.getConfiguration('scriptSupportSTNE');
      let indentSize = parseInt(config.get<string>('indentSize') || "2", 10);
      let braceStyle = config.get<string>('braceStyle') || "expand";

      //Format the document using the JavaScript librarby 
      let documentFormatted = beautify_js(documentText, { indent_size: indentSize, space_in_empty_paren: true, brace_style: braceStyle });

      // Restore escaped <> operator
      documentFormatted = documentFormatted.replace(/[\r\n ]*\s*\/\* beautify preserve:start \*\/<>\/\* beautify preserve:end \*\//g, " <> ");

      //Return the formatted text
      return [vscode.TextEdit.replace(documentFullRange, documentFormatted)];
    }
  });

  //Register provider for completion suggestions after '.'
  vscode.languages.registerCompletionItemProvider('stnescript-lang', {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position)
    {
      //Get the text written between the dot and and the last space in the line
      const linePrefix = document.lineAt(position).text.substr(0, position.character);
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
      return GetCompletitionItemsForType(GetTypeForSuspectedVar(docText, currentLastWord));
    }
  },
    '.'
  );

  //Register provider for completion suggestions after ' '
  vscode.languages.registerCompletionItemProvider('stnescript-lang', {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position)
    {
      //Get the text written between the space and and the last space in the line
      const linePrefix = document.lineAt(position).text.substr(0, position.character);
      let wordsOfLine = linePrefix.split(' ');
      let word = wordsOfLine[wordsOfLine.length - 2];

      //Check if the last word was "New" or "As" 
      if (word != "New" && word != "As") return undefined;

      //Return the completition suggestions
      return GetTypeCompletitionItems();
    }
  },
    ' '
  );
}

/**
 * Read types from JSON file and store them
 */
function LoadTypesFromJSON()
{
  for (let type of data.types)
  {
    let members: Array<Member> = [];
    for (let member of type.members)
    {
      let parameters: Array<Param> = [];
      if (!IsNullOrUndefined(member.params))
      {
        for (let param of member.params) parameters.push(new Param(param.name, param.type));
      }
      members.push(new Member(member.name, <MemberFunction>member.membertype, parameters, member.type, member.static));
    }
    types.push(new Type(type.name, members));
  }
}

/**
 * Get the type of a variable if it is defined in the document
 * @param documentText the text content of the script file
 * @param term the name of the possible variale
 * @returns the type of the variable or undefined
 */
function GetTypeForSuspectedVar(documentText: string, term: string): Type
{
  //Match the regex to check if the document text contains a variable definition with the term
  const regex = new RegExp("Var\\s(" + term + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");
  let match = documentText.match(regex);

  if (IsNullOrUndefined(match)) return undefined; //No match found
  let name = match[3];
  if (IsNullOrUndefined(name)) return undefined; //Variable name does not match
  let type = types.find(t => t.name == name);
  if (IsNullOrUndefined(type)) return undefined; //Type is unknown
  return type;
}

/**
 * Get all known types as completion suggestions
 * @returns an array of completion items for VS Code
 */
function GetTypeCompletitionItems(): Array<vscode.CompletionItem>
{
  let items: Array<vscode.CompletionItem> = [];
  for (let type of types) items.push(new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class))
  return items;
}

/**
 * Get all known members of a type as completion suggestions
 * @param type the type of which the completion suggestions are needed
 * @returns an array of completion items for VS Code
 */
function GetCompletitionItemsForType(type: Type): Array<vscode.CompletionItem>
{
  //Go trough all known members of the type
  let items: Array<vscode.CompletionItem> = [];
  for (let member of type.members)
  {
    let item: vscode.CompletionItem;
    switch (member.memberFunction)
    {
      //The member is an attribute, add the attribute name and its type to the results
      case MemberFunction.Property:
      case MemberFunction.Field:
        item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
        item.detail = member.name + ":" + member.type;
        break;

      //The member is a method, add the name, parameters and type to the results
      case MemberFunction.Method:
      case MemberFunction.Constructor:
        item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Method);
        item.detail = member.name + "(";

        //If the method has any parameters, add them to the item
        if (member.params.length > 0)
        {
          for (let param of member.params) item.detail = item.detail + param.name + ":" + param.type + ",";
          item.detail = item.detail.slice(0, -1);
        }
        item.detail = item.detail + ")";
        break;

      default:
        continue;
    }

    //If the member is static, add "(static)" to its description
    if (member.isStatic) item.detail = item.detail + " (static)";

    items.push(item)
  }

  return items;
}

/**
 * Check if an object is null or undefined
 * @param o the object to check
 * @returns wether passed object is null or undefined
 */
function IsNullOrUndefined(object: any): boolean
{
  if (object == null || object == undefined) return true;
  return false;
}