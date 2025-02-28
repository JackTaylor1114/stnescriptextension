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
    assert.equal(result.isFunction, false);
    assert.equal(result.returnType, undefined);
    done();
  })

  test('02: CheckIfDocumentContainsFunction2', function (done)
  {
    let result = functions.CheckIfDocumentContainsFunction("qestion", "Function qestion(orion is, the best) As lie");
    assert.equal(result.isFunction, true);
    assert.equal(result.returnType, "lie");
    done();
  })
});