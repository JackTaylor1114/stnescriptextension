'use strict';

//Imports
import * as vscode from 'vscode';
import * as data from './stne.json';

//Definitions
let beautify_js = require('js-beautify');
let types: Array<Type> = [];

/**
 * Main function that is called when the extension is started
 */
export function activate(context: vscode.ExtensionContext) {

    //Load the types from the stne.json file and store them 
    LoadTypesFromJSON();

    //Register DocumentFormattingEditProvider (Formats the whole document)
    vscode.languages.registerDocumentFormattingEditProvider('stnescript-lang', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {

            //Load the whole document text
            let documentText = document.getText();

            // Escape <> operator as beautify-js doesn't understand it properly
            documentText = documentText.replace(/<>/g, "/* beautify preserve:start */<>/* beautify preserve:end */");
            
            let documentStart: vscode.Position = document.lineAt(0).range.start;
            let documentEnd: vscode.Position = document.lineAt(document.lineCount - 1).range.end;
            let documentFullRange: vscode.Range = new vscode.Range(documentStart, documentEnd);

            //Format the document using the JavaScript librarby 
            let documentFormatted = beautify_js(documentText, { indent_size: 4, space_in_empty_paren: true, brace_style: "preserve-inline" });
            
            // Restore escaped <> operator
            documentFormatted = documentFormatted.replace(/[\r\n ]*\s*\/\* beautify preserve:start \*\/<>\/\* beautify preserve:end \*\//g, " <> ");

            //Return the formatted text
            return [vscode.TextEdit.replace(documentFullRange, documentFormatted)];
        }
    });

    //Register CompletitionItemsProvider (Provides suggestions when user types a dot)
    vscode.languages.registerCompletionItemProvider('stnescript-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

            //Get the text written between the dot and and the last space in the line
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            let docText = document.getText();
            let wordsOfLine = linePrefix.split(' ');
            let lastWord = wordsOfLine[wordsOfLine.length - 1];
            lastWord = lastWord.slice(0, -1);

            //Return the completition suggestions
            return GetCompletitionItemsForType(GetTypeForSuspectedVar(docText, lastWord));
        }
    },
        '.'
    );

    //Register CompletitionItemsProvider (Provides suggestions when user types a space)
    vscode.languages.registerCompletionItemProvider('stnescript-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

            //Get the text written between the space and and the last space in the line
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            let wordsOfLine = linePrefix.split(' ');
            let word = wordsOfLine[wordsOfLine.length - 2];

            //Check if the last word was "New" or "As" 
            if (word != "New" && word != "As")
                return undefined;

            //Return the completition suggestions
            return GetTypeCompletitionItems();
        }
    },
        ' '
    );
}

/**
 * Read available types from the stne.json file and store them
 */
function LoadTypesFromJSON() {
    for (let type of data.types) {
        let members: Array<Member> = [];
        for (let member of type.members) {
            let parameters: Array<Param> = [];
            if (!IsNull(member.params)) {
                for (let param of member.params)
                    parameters.push(new Param(param.name, param.type));
            }
            members.push(new Member(member.name, member.membertype, parameters, member.type, member.static));
        }
        types.push(new Type(type.name, members));
    }
}

/**
 * Returns the name of a type for a passed variable name
 */
function GetTypeForSuspectedVar(text: string, term: string): Type {

    //Match the document text to check if the text contains a definition with the variable name
    const regex = new RegExp("Var\\s(" + term + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");
    let match = text.match(regex);

    //Check if a match was found
    if (IsNull(match))
        return undefined;
    let name = match[3];
    if (IsNull(name))
        return undefined;
    let type = types.find(t => t.name == name);
    if (IsNull(type))
        return undefined;

    //Return the type of the variable 
    return type;
}

/**
 * Returns all available types as completition items
 */
function GetTypeCompletitionItems(): Array<vscode.CompletionItem> {

    //Return all known types
    let items: Array<vscode.CompletionItem> = [];
    for (let type of types)
        items.push(new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class))
    return items;
}

/**
 * Returns completition items for a type (methods/properties)
 */
function GetCompletitionItemsForType(type: Type): Array<vscode.CompletionItem> {

    //Go trouth all known members of the type
    let items: Array<vscode.CompletionItem> = [];
    for (let member of type.members) {

        //If the member is an attribute, add the attribute name and type to the results
        let item: vscode.CompletionItem;
        if (member.membertype == "Property" || member.membertype == "Field") {
            item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
            item.detail = member.name + ":" + member.type;
        }
        //If the member is a method, add the method to the results
        else {
            item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Method);
            item.detail = member.name + "(";

            //If the method has any parameters, add them to the item
            if (member.params.length > 0) {
                for (let param of member.params)
                    item.detail = item.detail + param.name + ":" + param.type + ",";
                item.detail = item.detail.slice(0, -1);
            }
            item.detail = item.detail + ")";
        }

        //If the member is static, add "(static) to its description"
        if (member.stat)
            item.detail = item.detail + " (static)";
        items.push(item)
    }

    //Return all completition items
    return items;
}

/**
 * Checks if an object is null or undefined
 */
function IsNull(o: any): boolean {
    if (o == null || o == undefined)
        return true;
    return false;
}

/**
 * Represents a type
 */
class Type {
    constructor(public name: string, public members: Array<Member>) { }
}

/**
 * Represents a type's member
 */
class Member {
    constructor(public name: string, public membertype: string, public params: Array<Param>, public type: string, public stat: boolean) { }
}

/**
 * Represents a parameter of a function
 */
class Param {
    constructor(public name: string, public type: string) { }
}