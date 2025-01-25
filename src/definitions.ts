/**
 * Representation of a type in STNE
 */
export class Type
{
  /**
   * Constructor
   * @param name the name of the type 
   * @param members collection of members
   */
  constructor(public name: string, public members: Array<Member>) { }
}

/**
 * Representation of a member of a type (attribute or method)
 */
export class Member
{
  /**
   * Constructor
   * @param name the name of the member
   * @param memberFunction the function of the member (method/attribute)
   * @param params collection of parameters (methods only)
   * @param type the name of the type of the member
   * @param isStatic flag if the member is static
   */
  constructor(public name: string, public memberFunction: MemberFunction, public params: Array<Param>, public type: string, public isStatic: boolean) { }
}

/**
 * Representation a parameter of a method
 */
export class Param
{
  /**
   * Constructor
   * @param name the name of the parameter
   * @param type the type of the parameter
   */
  constructor(public name: string, public type: string) { }
}

/**
 * Representation of the function of a member
 */
export enum MemberFunction
{
  None = 0,
  Constructor = "Constructor",
  Property = "Property",
  Method = "Method",
  Field = "Field"
}