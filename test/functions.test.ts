import * as functions from '../src/functions';
import assert from 'assert';

//Define Test Case
suite('Unit Tests for functions.ts', () => 
{
  test('01: CheckIfDocumentContainsFunction (empty input)', function (done)
  {
    let document = "";
    let token = "";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, false);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('02: CheckIfDocumentContainsFunction (existing function)', function (done)
  {
    let document = "Function test() { doSomething(); }";
    let token = "test";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, true);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('03: CheckIfDocumentContainsFunction (non-existing function)', function (done)
  {
    let document = "Function test() { doSomething(); }";
    let token = "notExisting";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, false);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('02: CheckIfDocumentContainsFunction (existing function with return type)', function (done)
  {
    let document = "Function test() As Integer { doSomething(); }";
    let token = "test";
    let result = functions.CheckIfDocumentContainsFunction(token, document);
    assert.equal(result.isFunction, true);
    assert.equal(result.returnType, "Integer");
    done();
  })
});