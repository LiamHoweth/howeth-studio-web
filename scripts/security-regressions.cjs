'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { installedTargets, verifyPatches, sha256 } = require('./security-patches.cjs');

function runRegressions(root, unpatched = false) {
  const targets = installedTargets(root);
  if (unpatched) {
    for (const target of targets) {
      for (const file of target.patch.files) {
        assert.equal(sha256(fs.readFileSync(path.join(target.directory, file.name))), file.original);
      }
    }
  } else {
    verifyPatches(root);
  }
  let checks = 0;
  for (const target of targets) {
    const requirePackage = createRequire(path.join(target.directory, 'package.json'));
    if (target.patch.name === 'braces') {
      const braces = requirePackage(target.directory);
      const pattern = '{'.repeat(4500) + 'x' + '}'.repeat(4500);
      const nested = '{'.repeat(32) + 'x' + '}'.repeat(32);
      assert.deepEqual(braces.expand('src/{core,app}/{a,b}.ts'), ['src/core/a.ts', 'src/core/b.ts', 'src/app/a.ts', 'src/app/b.ts']);
      assert.equal(braces.compile('src/{core,app}/{a,b}.ts'), 'src/(core|app)/(a|b).ts');
      assert.deepEqual(braces.expand('{1..3}'), ['1', '2', '3']);
      assert.deepEqual(braces.expand(nested), [nested]);
      assert.equal(braces.stringify(braces.parse(nested)), nested);
      assert.equal(braces.stringify(braces.parse('\\{literal\\}')), '{literal}');
      checks += 6;
      const boundary = '{'.repeat(128) + 'x' + '}'.repeat(128);
      assert.equal(braces.stringify(braces.parse(boundary)), boundary);
      assert.deepEqual(braces.expand(boundary), [boundary]);
      checks += 2;
      for (const method of ['compile', 'expand']) {
        assert.throws(() => braces[method](pattern), error => unpatched
          ? error instanceof RangeError && /call stack/.test(error.message)
          : error instanceof SyntaxError && error.message === 'braces nesting depth exceeds 128', `${method} bounds nested patterns under MAX_LENGTH`);
        checks++;
      }
      if (!unpatched) {
        const beyondBoundary = '{'.repeat(129) + 'x' + '}'.repeat(129);
        for (const method of ['parse', 'compile', 'expand', 'stringify']) {
          assert.throws(() => braces[method](beyondBoundary),
            { name: 'SyntaxError', message: 'braces nesting depth exceeds 128' });
          assert.throws(() => braces[method]('('.repeat(4500) + 'x' + ')'.repeat(4500)),
            { name: 'SyntaxError', message: 'braces nesting depth exceeds 128' });
          assert.throws(() => braces[method](pattern, { maxDepth: Infinity, maxLength: Infinity }),
            { name: 'SyntaxError', message: 'braces nesting depth exceeds 128' });
          checks += 3;
        }
        for (const method of ['compile', 'expand', 'stringify']) {
          // These public functions accept ASTs directly; neither a deep AST nor
          // a cycle may escape the parser's protection.
          let ast = { type: 'root', nodes: [] };
          for (let i = 0; i < 4500; i++) ast = { type: 'root', nodes: [ast] };
          assert.throws(() => braces[method](ast),
            { name: 'SyntaxError', message: 'braces nesting depth exceeds 128' });
          const cycle = { type: 'root', nodes: [] };
          cycle.nodes.push(cycle);
          assert.throws(() => braces[method](cycle),
            { name: 'SyntaxError', message: 'braces nesting depth exceeds 128' });
          checks += 2;
        }
      }
    }
  }
  return { checks, dependencyCopies: targets.length, mode: unpatched ? 'original-vulnerability-confirmed' : 'mitigations-verified' };
}

module.exports = { runRegressions };
if (require.main === module) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--expect-unpatched'), 'Usage: security-regressions.cjs [--expect-unpatched]');
  console.log(JSON.stringify(runRegressions(path.resolve(__dirname, '..'), args[0] === '--expect-unpatched')));
}
