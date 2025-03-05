import * as functions from '../src/functions';
import assert from 'assert';

/**********************************************************/
suite('Unit Tests for LoadAvailableTypes', () => 
{
  test('01: TODO', async function (done)
  {
    let jsonPath = "";
    await functions.LoadAvailableTypes('', 'build/test/resources/objectexplorer.json');
    assert.equal(functions.AvailableTypes[0].name, "MyClassA");
    done();
  })
});

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

  test('02: existing function with return type', function (done)
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

  test('03: existing variable but two times', function (done)
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