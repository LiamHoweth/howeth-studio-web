'use strict';

// Temporary, source-verified mitigations. Do not change package versions to hide
// advisories. Replace these with reviewed upstream releases when available.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const patches = [
  {
    "name": "braces",
    "version": "3.0.3",
    "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
    "advisory": "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
    "files": [
      {
        "name": "lib/parse.js",
        "original": "e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310",
        "patched": "0ce7f2b80121113eec380ed54b7fc412d6061b1537defe075f5861a454e24e27",
        "replacements": [
          {
            "before": "      stack.push(block);",
            "after": "      stack.push(block);\n      // Bound braces AND parentheses before any recursive walker.\n      if (stack.length > 129) {\n        throw new SyntaxError('braces nesting depth exceeds 128');\n      }",
            "occurrences": 2
          }
        ]
      },
      {
        "name": "lib/compile.js",
        "original": "dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f",
        "patched": "7fa86b9b1580087e5921b9e045b3dc30443abef4781e1f4ee613aa88974cfe61",
        "replacements": [
          {
            "before": "  const walk = (node, parent = {}) => {",
            "after": "  const walk = (node, parent = {}, securityDepth = 0) => {\n    // Include the root and terminal node in the traversal budget.\n    if (securityDepth > 129) {\n      throw new SyntaxError('braces nesting depth exceeds 128');\n    }"
          },
          {
            "before": "walk(child, node)",
            "after": "walk(child, node, securityDepth + 1)"
          }
        ]
      },
      {
        "name": "lib/expand.js",
        "original": "41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7",
        "patched": "06da9a8b486b89e089638c758e8c487851c18390bcac86ea69e29ccd1eb15d68",
        "replacements": [
          {
            "before": "  const walk = (node, parent = {}) => {",
            "after": "  const walk = (node, parent = {}, securityDepth = 0) => {\n    // Direct AST callers must not bypass the parser depth limit.\n    if (securityDepth > 129) {\n      throw new SyntaxError('braces nesting depth exceeds 128');\n    }"
          },
          {
            "before": "walk(child, node)",
            "after": "walk(child, node, securityDepth + 1)"
          }
        ]
      },
      {
        "name": "lib/stringify.js",
        "original": "379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a",
        "patched": "4acca16f5f788d736bb4e526062985e945d6ad83617403d02e590038b5df79d6",
        "replacements": [
          {
            "before": "  const stringify = (node, parent = {}) => {",
            "after": "  const stringify = (node, parent = {}, securityDepth = 0) => {\n    if (securityDepth > 129) {\n      throw new SyntaxError('braces nesting depth exceeds 128');\n    }"
          },
          {
            "before": "stringify(child)",
            "after": "stringify(child, undefined, securityDepth + 1)"
          }
        ]
      }
    ]
  }
];

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function patchedSource(file, source) {
  assert.equal(sha256(source), file.original, `Unexpected original source: ${file.name}`);
  let result = source;
  for (const replacement of file.replacements) {
    const chunks = result.split(replacement.before);
    assert.equal(chunks.length - 1, replacement.occurrences || 1, `Patch context changed: ${file.name}`);
    result = chunks.join(replacement.after);
  }
  assert.equal(sha256(result), file.patched, `Patch output changed: ${file.name}`);
  return result;
}

function installedTargets(root) {
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.ok(lock.packages && lock.lockfileVersion >= 2, 'A package-lock v2+ is required');
  const physicallyInstalled = new Map(patches.map(patch => [patch.name, []]));
  const visitPackage = directory => {
    const scope = path.basename(path.dirname(directory));
    const name = scope.startsWith('@') ? `${scope}/${path.basename(directory)}` : path.basename(directory);
    if (physicallyInstalled.has(name)) physicallyInstalled.get(name).push(path.relative(root, directory).split(path.sep).join('/'));
    if (!fs.lstatSync(directory).isSymbolicLink()) scanModules(path.join(directory, 'node_modules'));
  };
  const scanModules = directory => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || (!entry.isDirectory() && !entry.isSymbolicLink())) continue;
      const filename = path.join(directory, entry.name);
      if (entry.name.startsWith('@')) {
        for (const scoped of fs.readdirSync(filename, { withFileTypes: true })) {
          if (scoped.isDirectory() || scoped.isSymbolicLink()) visitPackage(path.join(filename, scoped.name));
        }
      } else {
        visitPackage(filename);
      }
    }
  };
  scanModules(path.join(root, 'node_modules'));
  const targets = [];
  for (const patch of patches) {
    const copies = Object.entries(lock.packages)
      .filter(([node]) => node.endsWith(`node_modules/${patch.name}`));
    assert.ok(copies.length > 0 || patch.required === false, `Missing locked dependency: ${patch.name}`);
    assert.deepEqual(physicallyInstalled.get(patch.name).sort(), copies.map(([node]) => node).sort(), `Installed/locked copies differ: ${patch.name}`);
    for (const [node, locked] of copies) {
      const directory = path.resolve(root, node);
      assert.ok(directory.startsWith(`${path.resolve(root, 'node_modules')}${path.sep}`), 'Unsafe lock path');
      assert.ok(fs.realpathSync(directory).startsWith(`${fs.realpathSync(path.join(root, 'node_modules'))}${path.sep}`), 'Dependency must be inside node_modules');
      assert.equal(locked.version, patch.version, `Review new version: ${node}`);
      assert.equal(locked.integrity, patch.integrity, `Review new package integrity: ${node}`);
      const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
      assert.equal(installed.name, patch.name, `Unexpected package: ${node}`);
      assert.equal(installed.version, patch.version, `Unexpected installed version: ${node}`);
      targets.push({ patch, node, directory });
    }
  }
  return targets;
}

function verifyPatches(root, apply = false) {
  const targets = installedTargets(root);
  const changes = [];
  // Validate ALL sources before making changes. Never partially patch an
  // unexpected tree, and never accept a marker comment as proof of a patch.
  for (const target of targets) {
    for (const file of target.patch.files) {
      const filename = path.join(target.directory, file.name);
      const source = fs.readFileSync(filename, 'utf8');
      const actual = sha256(source);
      if (actual === file.patched) continue;
      assert.ok(apply, `Security patch missing or modified: ${target.node}/${file.name}`);
      changes.push({ filename, source: patchedSource(file, source) });
    }
  }
  for (const change of changes) fs.writeFileSync(change.filename, change.source);
  return targets.map(({ patch, node }) => ({ node, version: patch.version, advisory: patch.advisory }));
}

module.exports = { patches, sha256, patchedSource, installedTargets, verifyPatches };

if (require.main === module) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--apply'), 'Usage: security-patches.cjs [--apply]');
  const root = path.resolve(__dirname, '..');
  const result = verifyPatches(root, args[0] === '--apply');
  console.log(`Verified ${result.length} locally mitigated dependency copies; upstream versions retained.`);
}
