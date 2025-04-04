import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void>
{
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) =>
  {
    glob('**/**.test.js', { cwd: testsRoot })
      .then(files =>
      {
        //Get test files
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
        try
        {
          //Run tests in test files
          mocha.run(failures =>
          {
            if (failures > 0)
            {
              e(new Error(`${failures} tests failed.`));
            } else
            {
              c();
            }
          });
        }
        catch (err)
        {
          e(err);
        }
      })
      .catch(err =>
      {
        return e(err);
      });
  });
}