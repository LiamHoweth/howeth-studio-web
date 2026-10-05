'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { patches, installedTargets, verifyPatches, sha256 } = require('./security-patches.cjs');
const { reviewed, validateReport } = require('./security-audit.cjs');

function testGate(root) {
  const targets = verifyPatches(root);
  const applicable = reviewed.filter(advisory => targets.some(target => target.advisory === advisory.url));
  const report = { auditReportVersion: 2, vulnerabilities: {}, metadata: { vulnerabilities: { total: applicable.length } } };
  for (const advisory of applicable) {
    report.vulnerabilities[advisory.name] = {
      name: advisory.name, severity: 'high', via: [structuredClone(advisory)],
      nodes: targets.filter(target => target.advisory === advisory.url).map(target => target.node),
    };
  }
  validateReport(report, targets);
  let checks = 1;
  const rejected = (mutate, pattern) => {
    const candidate = structuredClone(report);
    mutate(candidate);
    assert.throws(() => validateReport(candidate, targets), pattern);
    checks++;
  };
  rejected(value => { value.vulnerabilities.braces.via[0].url = 'https://github.com/advisories/GHSA-unreviewed'; }, /Unmitigated advisory/);
  rejected(value => { value.vulnerabilities.braces.via[0].severity = 'critical'; }, /Advisory changed/);
  rejected(value => { value.vulnerabilities.braces.via[0].range = '<=99.0.0'; }, /Advisory changed/);
  rejected(value => { value.vulnerabilities.braces.nodes.push('node_modules/new-parent/node_modules/braces'); }, /Not every audited copy/);
  rejected(value => { value.vulnerabilities.braces.via.push('missing-package'); }, /Unresolved vulnerability chain/);
  rejected(value => { value.vulnerabilities.braces.via = ['braces']; }, /No verified advisory root/);
  rejected(value => { value.metadata.vulnerabilities.total = 0; }, /counts do not match/);
  rejected(value => { value.error = { code: 'ENOAUDIT' }; }, /npm audit returned an error/);
  rejected(value => { value.vulnerabilities.braces.severity = 'critical'; }, /Severity changed/);
  const cyclic = structuredClone(report);
  cyclic.vulnerabilities.parent = { name: 'parent', severity: 'high', via: ['other'], nodes: ['node_modules/parent'] };
  cyclic.vulnerabilities.other = { name: 'other', severity: 'high', via: ['parent', 'braces'], nodes: ['node_modules/other'] };
  cyclic.metadata.vulnerabilities.total += 2;
  validateReport(cyclic, targets);
  checks++;

  const directory = path.join(root, '.build', 'security');
  fs.mkdirSync(directory, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(directory, 'gate-test-'));
  try {
    // Only controlled scratch copies are changed; installed tooling remains
    // intact for concurrent native compilation and other project work.
    const lock = { lockfileVersion: 3, packages: {} };
    for (const target of installedTargets(root)) {
      lock.packages[target.node] = { version: target.patch.version, integrity: target.patch.integrity };
      fs.mkdirSync(path.join(scratch, target.node), { recursive: true });
      fs.copyFileSync(path.join(target.directory, 'package.json'), path.join(scratch, target.node, 'package.json'));
      for (const file of target.patch.files) {
        const filename = path.join(scratch, target.node, file.name);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.copyFileSync(path.join(target.directory, file.name), filename);
      }
    }
    const lockFile = path.join(scratch, 'package-lock.json');
    fs.writeFileSync(lockFile, JSON.stringify(lock));
    verifyPatches(scratch);
    checks++;
    const brace = patches.find(patch => patch.name === 'braces');
    const file = brace.files[0];
    const braceNode = targets.find(target => target.advisory === brace.advisory).node;
    const filename = path.join(scratch, braceNode, file.name);
    const patched = fs.readFileSync(filename, 'utf8');
    let original = patched;
    for (const replacement of [...file.replacements].reverse()) original = original.split(replacement.after).join(replacement.before);
    assert.equal(sha256(original), file.original);
    fs.writeFileSync(filename, original);
    assert.throws(() => verifyPatches(scratch), /Security patch missing or modified/);
    const compileFilename = path.join(scratch, braceNode, brace.files[1].name);
    const compileSource = fs.readFileSync(compileFilename, 'utf8');
    fs.writeFileSync(compileFilename, compileSource + '\n// unexpected source edit\n');
    assert.throws(() => verifyPatches(scratch, true), /Unexpected original source/);
    assert.equal(fs.readFileSync(filename, 'utf8'), original, 'Unknown source prevents partial patch writes');
    fs.writeFileSync(compileFilename, compileSource);
    checks += 2;
    verifyPatches(scratch, true);
    assert.equal(fs.readFileSync(filename, 'utf8'), patched);
    verifyPatches(scratch, true); // Applying twice must be idempotent.
    checks += 4;
    fs.writeFileSync(filename, patched + '\n// unexpected source edit\n');
    assert.throws(() => verifyPatches(scratch), /Security patch missing or modified/);
    assert.throws(() => verifyPatches(scratch, true), /Unexpected original source/);
    checks += 2;
    fs.writeFileSync(filename, patched);
    lock.packages[braceNode].version = '3.0.4';
    fs.writeFileSync(lockFile, JSON.stringify(lock));
    assert.throws(() => verifyPatches(scratch, true), /Review new version/);
    checks++;
    lock.packages[braceNode].version = brace.version;
    lock.packages[braceNode].integrity = 'sha512-unreviewed-package';
    fs.writeFileSync(lockFile, JSON.stringify(lock));
    assert.throws(() => verifyPatches(scratch, true), /Review new package integrity/);
    checks++;
    lock.packages[braceNode].integrity = brace.integrity;
    fs.writeFileSync(lockFile, JSON.stringify(lock));
    const unexpected = path.join(scratch, 'node_modules', 'unexpected-parent', 'node_modules', 'braces');
    fs.mkdirSync(unexpected, { recursive: true });
    assert.throws(() => verifyPatches(scratch), /Installed\/locked copies differ/);
    fs.rmSync(path.join(scratch, 'node_modules', 'unexpected-parent'), { recursive: true });
    checks++;
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
  return { securityGateChecks: checks };
}

module.exports = { testGate };
if (require.main === module) console.log(JSON.stringify(testGate(path.resolve(__dirname, '..'))));
