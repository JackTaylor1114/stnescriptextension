import * as functions from '../src/functions';
import assert from 'assert';

/**********************************************************/
suite('Unit Tests for GetMemberAccessFromLineOfCode', () => 
{
  test('01: empty input', function (done)
  {
    let lineContent = "";
    let result = functions.GetMemberAccessFromLineOfCode(lineContent);
    assert.equal(result, undefined);
    done();
  })

  test('02: member access variant 1', function (done)
  {
    let lineContent = "    myObject.";
    let result = functions.GetMemberAccessFromLineOfCode(lineContent);
    assert.equal(result[0], "myObject");
    done();
  })

  test('03: member access variant 2', function (done)
  {
    let lineContent = "    myObject.myFunction().";
    let result = functions.GetMemberAccessFromLineOfCode(lineContent);
    assert.equal(result[0], "myObject");
    assert.equal(result[1], "myFunction()");
    done();
  })

  test('04: member access variant 3', function (done)
  {
    let lineContent = "if(myObject.myFunction().";
    let result = functions.GetMemberAccessFromLineOfCode(lineContent);
    assert.equal(result[0], "myObject");
    assert.equal(result[1], "myFunction()");
    done();
  })

  test('05: member access variant 4', function (done)
  {
    let lineContent = "For(i = 0 To myObject.myFunction(myParameter).myOtherObject.";
    let result = functions.GetMemberAccessFromLineOfCode(lineContent);
    assert.equal(result[0], "myObject");
    assert.equal(result[1], "myFunction(myParameter)");
    assert.equal(result[2], "myOtherObject");
    done();
  })
});

/**********************************************************/
suite('Unit Tests for CheckIfTokenIsFunction', () => 
{
  test('01: empty input', function (done)
  {
    let token = "";
    let result = functions.CheckIfTokenIsFunction(token);
    assert.equal(result.isFunction, false);
    assert.equal(result.functionName, undefined);
    done();
  })

  test('02: function without parameters', function (done)
  {
    let token = "myFunction()";
    let result = functions.CheckIfTokenIsFunction(token);
    assert.equal(result.isFunction, true);
    assert.equal(result.functionName, "myFunction");
    done();
  })

  test('03: function with parameters', function (done)
  {
    let token = "myFunction(param1 As type1, param2 As type2)";
    let result = functions.CheckIfTokenIsFunction(token);
    assert.equal(result.isFunction, true);
    assert.equal(result.functionName, "myFunction");
    done();
  })
});

/**********************************************************/
suite('Unit Tests for CheckIfDocumentContainsFunction', () => 
{
  test('01: empty input', function (done)
  {
    let document = "";
    let token = "";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, false);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('02: existing function', function (done)
  {
    let document = "Function test() { doSomething(); }";
    let token = "test";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, true);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('03: non-existing function', function (done)
  {
    let document = "Function test() { doSomething(); }";
    let token = "notExisting";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, false);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('04: existing function with return type', function (done)
  {
    let document = "Function test() As Integer { doSomething(); }";
    let token = "test";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, true);
    assert.equal(result.returnType, "Integer");
    done();
  })
});

/**********************************************************/
suite('Unit Tests for CheckIfScopeContainsVariable', () => 
{
  test('01: empty input', function (done)
  {
    let scopeText = "";
    let token = "";
    let result = functions.CheckIfScopeContainsVariable(token, scopeText);
    assert.equal(result.isVariable, false);
    assert.equal(result.type, undefined);
    done();
  })

  test('02: existing variable', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "Var myVariable As SomeClass;" +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myVariable";
    let result = functions.CheckIfScopeContainsVariable(token, scopeText);
    assert.equal(result.isVariable, true);
    assert.equal(result.type, "SomeClass");
    done();
  })

  test('03: existing variable', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "Var myVariable As New SomeClass;" +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myVariable";
    let result = functions.CheckIfScopeContainsVariable(token, scopeText);
    assert.equal(result.isVariable, true);
    assert.equal(result.type, "SomeClass");
    done();
  })

  test('04: existing variable but two times', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "Var myVariable As New SomeClass;" +
      "Var myVariable As New SomeClass;" +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myVariable";
    let result = functions.CheckIfScopeContainsVariable(token, scopeText);
    assert.equal(result.isVariable, true);
    assert.equal(result.type, "SomeClass");
    done();
  })
});

/**********************************************************/
suite('Unit Tests for CheckIfScopeContainsParameter', () => 
{
  test('01: empty input', function (done)
  {
    let scopeText = "";
    let token = "";
    let result = functions.CheckIfScopeContainsParameter(token, scopeText);
    assert.equal(result.isParameter, false);
    done();
  })

  test('02: existing parameter', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "myFunction(myParameter As myType) {} " +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myParameter";
    let result = functions.CheckIfScopeContainsParameter(token, scopeText);
    assert.equal(result.isParameter, true);
    assert.equal(result.type, "myType");
    done();
  })

  test('03: existing parameters', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "myFunction(myParameter1 As myType1, myParameter2 As myType2) {} " +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myParameter2";
    let result = functions.CheckIfScopeContainsParameter(token, scopeText);
    assert.equal(result.isParameter, true);
    assert.equal(result.type, "myType2");
    done();
  })

  test('04: non-existing parameter', function (done)
  {
    let scopeText = "//Comment" +
      "SomeRandomLineOfCode!%&/()=;" +
      "Another!RandomLineOfCode!%&/()=;" +
      "myFunction(myParameter1 As myType1, myParameter2 As myType2) {} " +
      "if(YetAnother!RandomLineOfCode!%&/()=;";
    let token = "myParameter3";
    let result = functions.CheckIfScopeContainsParameter(token, scopeText);
    assert.equal(result.isParameter, false);
    assert.equal(result.type, undefined);
    done();
  })
});

/**********************************************************/
suite('Unit Tests for GetCompletionSuggestionsForType', () => 
{
  test('01: completion suggestion for method', function (done)
  {
    functions.LoadAvailableTypes();
    let result = functions.GetCompletionSuggestionsForType(functions.AvailableTypes[0]);
    assert.equal(result.length, 16);
    assert.equal(result[0].label, "GetEnumerator");
    assert.equal(result[0].detail, "GetEnumerator(): void");
    done();
  })

  test('02: completion suggestion for property', function (done)
  {
    functions.LoadAvailableTypes();
    let result = functions.GetCompletionSuggestionsForType(functions.AvailableTypes[0]);
    assert.equal(result.length, 16);
    assert.equal(result[1].label, "Count");
    assert.equal(result[1].detail, "Count: Integer");
    done();
  })
});