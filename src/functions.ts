
import { Type, Member, Param, MemberFunction } from './definitions';
import * as data from './resources/objectexplorer.json'
import * as vscode from 'vscode';

/**
 * Functions 
 */
export class Logic
{
  static Types: Array<Type> = [];

  /**
   * Read types from JSON file and store them
   */
  public static LoadAvailableTypes(): void
  {
    for (let type of data.types)
    {
      let members: Array<Member> = [];
      for (let member of type.members)
      {
        let parameters: Array<Param> = [];
        if (!(member.params == undefined || member.params == null))
        {
          for (let param of member.params) parameters.push(new Param(param.name, param.type));
        }
        members.push(new Member(member.name, <MemberFunction>member.membertype, parameters, member.type, member.static));
      }
      this.Types.push(new Type(type.name, members));
    }
  }

  /**
   * Get the type of a variable if it is defined in the document
   * @param documentText the text content of the script file
   * @param term the name of the possible variale
   * @returns the type of the variable or undefined
   */
  public static GetTypeForSuspectedVar(documentText: string, term: string): Type
  {
    //Match the regex to check if the document text contains a variable definition with the term
    const regex = new RegExp("Var\\s(" + term + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");
    let match = documentText.match(regex);

    if (match == undefined || match == null) return undefined; //No match found
    let name = match[3];
    if (name == undefined || name == null) return undefined; //Variable name does not match
    let type = this.Types.find(t => t.name == name);
    if (type == undefined || type == null) return undefined; //Type is unknown
    return type;
  }

  /**
   * Get all known types as completion suggestions
   * @returns an array of completion items for VS Code
   */
  public static GetTypeCompletitionItems(): Array<vscode.CompletionItem>
  {
    let items: Array<vscode.CompletionItem> = [];
    for (let type of this.Types) items.push(new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class))
    return items;
  }

  /**
   * Get all known members of a type as completion suggestions
   * @param type the type of which the completion suggestions are needed
   * @returns an array of completion items for VS Code
   */
  public static GetCompletitionItemsForType(type: Type): Array<vscode.CompletionItem>
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
}