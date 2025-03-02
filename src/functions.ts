
import { Type, Member, Param, MemberFunction } from './definitions';
import * as data from './resources/objectexplorer.json'
import * as vscode from 'vscode';

export let AvailableTypes: Array<Type> = [];

/**
 * Read types from JSON file and store them
 */
export function LoadAvailableTypes(): void
{
  AvailableTypes = [];
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
    AvailableTypes.push(new Type(type.name, members));
  }
}

/**
 * Get the member access typed in a line of the document
 * @param line the line of code from the document
 * @returns the member access split into individual parts as an array
 */
export function GetMemberAccessFromLineOfCode(line: string): Array<string>
{
  // Get the member access in the current line (e.g. "someObjekt.someFunction().")
  // [a-zA-Z_$][a-zA-Z0-9_$]* 
  //    -> match an identifier (variable name or function name)
  // (\.[a-zA-Z_$][a-zA-Z0-9_$]*|\([^()]*\))* 
  //    -> match zero or more occurrences of either:
  //    * a dot followed by a valid identifier OR 
  //    * a function call with parameters
  // \([^()]*\) 
  //    -> match parameters in function calls
  // \. -> matches the final dot that triggers the member access
  // Limitations: nested function calls as parameters will not be detected properly
  let match = line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*|\([^()]*\))*\.)/);
  if (!match) return undefined;

  //Return the individual parts of the member access
  return match[0].split('.');
}

/**
 * Check if a function is present in the document and get its return type
 * @param token the name of the function
 * @param documentContent the text content of the script file
 * @returns a flag if the function is present and the functions return type if possible
 */
export function CheckIfDocumentContainsFunction(token: string, documentText: string): { isFunction: boolean; returnType?: string }
{
  const functionDefinitionRegex = /Function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)(?:\s+As\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?/g;
  let match: RegExpExecArray;
  while ((match = functionDefinitionRegex.exec(documentText)) !== null)
  {
    const functionName = match[1];
    if (functionName === token)
    {
      const returnType = match[2];
      return { isFunction: true, returnType };
    }
  }
  return { isFunction: false };
}

/**
 * Check if a variable definition is present in the scope and get its type
 * @param token the name of the variable
 * @param scopeText the text content of the current scope
 * @returns a flag if the variable definition is present and its type if possible
 */
export function CheckIfScopeContainsVariable(token: string, scopeText: string): { isVariable: boolean; type?: string }
{
  let match = scopeText.match("Var\\s(" + token + ")\\sAs\\s([Nn]ew\\s)?([a-zA-Z]*)");

  if (match == undefined || match == null) return { isVariable: false }; //No match found
  let name = match[3];
  if (name == undefined || name == null) return { isVariable: false }; //Variable name does not match
  return { isVariable: true, type: name };
}

/**
 * Check if a parameter is present in the scope and get its type
 * @param token the name of the variable
 * @param scopeText the text content of the current scope
 * @returns a flag if the parameter is present and its type if possible
 */
export function CheckIfScopeContainsParameter(token: string, scopeText: string): { isParameter: boolean; type?: string }
{
  //TODO
  return { isParameter: false };
}


/**
 * Get all known types as completion items
 * @returns an array of completion items
 */
export function GetAllTypesAsCompletionItems(): Array<vscode.CompletionItem>
{
  let items: Array<vscode.CompletionItem> = [];
  for (let type of AvailableTypes) items.push(new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class))
  return items;
}

/**
 * Get all known members of a type as completion suggestions
 * @param type the type of which completion suggestions are needed
 * @returns an array of completion items
 */
export function GetCompletionItemsForType(type: Type): Array<vscode.CompletionItem>
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