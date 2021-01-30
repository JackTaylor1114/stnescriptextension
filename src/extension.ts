'use strict';

import { cpuUsage } from 'process';
//Benötige Module importieren
import * as vscode from 'vscode';
let beautify_js = require('js-beautify');
import * as data from './stne.json';

//Globale Variablen
let typesOfStne: Array<Type> = [];

//Aktivierungsfunktion für VSC-Erweiterungen
export function activate() {

    //Formatter für STNE-Script
    vscode.languages.registerDocumentFormattingEditProvider('stnescript-lang', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {

            //Inhalt des   Dokumentes holen
            let documentText = document.getText();

            //Gesamte Dokumentenrange ermitteln
            let documentStart: vscode.Position = document.lineAt(0).range.start;
            let documentEnd: vscode.Position = document.lineAt(document.lineCount - 1).range.end;
            let documentFullRange: vscode.Range = new vscode.Range(documentStart, documentEnd);

            //Text formatieren
            let documentFormatted = beautify_js(documentText, { indent_size: 4, space_in_empty_paren: true });

            //Nachbearbeitung wegen Unterschieden JavaScript und STNE
            documentFormatted = documentFormatted.replace("< >", "<>");

            //Ergebnis schreiben
            return [vscode.TextEdit.replace(documentFullRange, documentFormatted)];
        }
    });

    //Über alle Typen im Objektexplorer iterieren
    for (let type of data.types) {

        /** 

        //Alle Methodennamen für den Typ ablegen
        let methods: Array<Method> = [];
        for (let method of type.methods)
            methods.push(new Method(method.name, method.type));

        //Alle Property-Namem für den Typ ablegen
        let properties: Array<Property> = [];
        for (let property of type.properties)
            properties.push(new Property(property.name, property.type));*/

        let members: Array<Member> = [];
        for (let member of type.members)
            members.push(new Member(member.name, member.membertype, member.type, member.static));
        typesOfStne.push(new Type(type.name, members));
    }

    //Vorschlag-Provider für STNE Script
    vscode.languages.registerCompletionItemProvider('stnescript-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            let docText = document.getText();
            let wordsOfLine = linePrefix.split(' ');
            let lastWord = wordsOfLine[wordsOfLine.length - 1];
            lastWord = lastWord.slice(0, -1);
            return CompletitionItemsForVariables(docText, lastWord);
        }
    },
        '.'
    );
}

function CompletitionItemsForVariables(searchtext: string, searchterm: string): Array<vscode.CompletionItem> {
    const regex = new RegExp("Var\\s(" + searchterm + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");
    let match = searchtext.match(regex);
    if (match == null || match == undefined)
        return undefined;
    let typeName = match[3];
    if (typeName == null || typeName == undefined)
        return undefined;
    let stneType = typesOfStne.find(t => t.name == typeName);
    if (stneType == null || stneType == undefined)
        return undefined;
    let results: Array<vscode.CompletionItem> = [];
    for (let m of stneType.members) {
        let item: vscode.CompletionItem;
        if (m.membertype == "Property" || m.membertype == "Field") {
            item = new vscode.CompletionItem(m.name, vscode.CompletionItemKind.Property);
            item.detail = "type: " + m.type;
        }
        else {
            item = new vscode.CompletionItem(m.name, vscode.CompletionItemKind.Method);
            item.detail = "returns: " + m.type;
        }
        if (m.statisch)
            item.detail = item.detail + " (static)";
        results.push(item)
    }
    return results;
}

class Type {
    constructor(public name: string, public members: Array<Member>) { }
}

class Member {
    constructor(public name: string, public membertype: string, public type: string, public statisch: boolean) { }
}