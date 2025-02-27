import * as functions from '../src/functions';
import assert from 'assert';

//Define Test Case
suite('Orion Test Suite', () => 
{
  test('01: CheckIfDocumentContainsFunction1', function (done)
  {
    let document = "";
    let token = "";

    let result = functions.CheckIfDocumentContainsFunction(token, document);
    let expected = { isFunction: false, returnType: undefined }
    assert.equal(result, expected);
  })

  test('02: CheckIfDocumentContainsFunction2', function (done)
  {
    assert.equal(1, 1);
  })
});