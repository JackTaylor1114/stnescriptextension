'use strict';

import * as vscode from 'vscode';
import * as data from './stne.json';

let beautify_js = require('js-beautify');
let types: Array<Type> = [];

export function activate() {

    LoadTypesFromJSON();

    vscode.languages.registerDocumentFormattingEditProvider('stnescript-lang', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            let documentText = document.getText();
            let documentStart: vscode.Position = document.lineAt(0).range.start;
            let documentEnd: vscode.Position = document.lineAt(document.lineCount - 1).range.end;
            let documentFullRange: vscode.Range = new vscode.Range(documentStart, documentEnd);
            let documentFormatted = beautify_js(documentText, { indent_size: 4, space_in_empty_paren: true });
            documentFormatted = documentFormatted.replace("< >", "<>");
            return [vscode.TextEdit.replace(documentFullRange, documentFormatted)];
        }
    });

    vscode.languages.registerCompletionItemProvider('stnescript-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            let docText = document.getText();
            let wordsOfLine = linePrefix.split(' ');
            let lastWord = wordsOfLine[wordsOfLine.length - 1];
            lastWord = lastWord.slice(0, -1);
            return GetCompletitionItemsForType(GetTypeForSuspectedVar(docText, lastWord));
        }
    },
        '.'
    );

    vscode.languages.registerCompletionItemProvider('stnescript-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            let wordsOfLine = linePrefix.split(' ');
            let word = wordsOfLine[wordsOfLine.length - 2];
            if (word == "New" || word == "As")
                return GetTypeCompletitionItems();
            return undefined;
        }
    },
        ' '
    );
}

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

function GetTypeForSuspectedVar(text: string, term: string): Type {
    const regex = new RegExp("Var\\s(" + term + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");
    let match = text.match(regex);
    if (IsNull(match))
        return undefined;
    let name = match[3];
    if (IsNull(name))
        return undefined;
    let type = types.find(t => t.name == name);
    if (IsNull(type))
        return undefined;
    return type;
}

function GetTypeCompletitionItems(): Array<vscode.CompletionItem> {
    let items: Array<vscode.CompletionItem> = [];
    for (let type of types)
        items.push(new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class))
    return items;
}

function GetCompletitionItemsForType(type: Type): Array<vscode.CompletionItem> {
    let items: Array<vscode.CompletionItem> = [];
    for (let member of type.members) {
        let item: vscode.CompletionItem;
        if (member.membertype == "Property" || member.membertype == "Field") {
            item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
            item.detail = member.name + ":" + member.type;
        }
        else {
            item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Method);
            item.detail = member.name + "(";
            if (member.params.length > 0) {
                for (let param of member.params)
                    item.detail = item.detail + param.name + ":" + param.type + ",";
                item.detail = item.detail.slice(0, -1);
            }
            item.detail = item.detail + ")";
        }
        if (member.stat)
            item.detail = item.detail + " (static)";
        items.push(item)
    }
    return items;
}

function IsNull(o: any): boolean {
    if (o == null || o == undefined)
        return true;
    return false;
}

class Type {
    constructor(public name: string, public members: Array<Member>) { }
}

class Member {
    constructor(public name: string, public membertype: string, public params: Array<Param>, public type: string, public stat: boolean) { }
}

class Param {
    constructor(public name: string, public type: string) { }
}