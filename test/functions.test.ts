import * as functions from '../src/functions';
import assert from 'assert';

//Define Test Case
describe('Unit Tests', function ()
{
  it('01: CheckIfDocumentContainsFunction1', function (done)
  {
    let document = "";
    let token = "";

    let result = functions.CheckIfDocumentContainsFunction(token, document);
    let expected = { isFunction: false, returnType: undefined }
    assert.equal(result, expected);
    done();
  })

  it('02: CheckIfDocumentContainsFunction2', function (done)
  {
    assert.equal(1, 1);
    done();
  })
});