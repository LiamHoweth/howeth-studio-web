'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { verifyPatches } = require('./security-patches.cjs');
const { runRegressions } = require('./security-regressions.cjs');

// Snapshot the complete reviewed root advisory, including range/severity. A
// changed advisory requires another review; a GHSA identifier is not a waiver.
const reviewed = [
  {
    "source": 1240992,
    "name": "braces",
    "dependency": "braces",
    "title": "braces vulnerable to stack-exhaustion denial of service through deeply nested patterns",
    "url": "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
    "severity": "high",
    "cwe": [
      "CWE-674"
    ],
    "cvss": {
      "score": 7.5,
      "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
    },
    "range": "<=3.0.3"
  }
];

function validateReport(report, mitigationTargets) {
  assert.equal(report.auditReportVersion, 2, 'Unexpected npm audit schema');
  assert.ok(!report.error, 'npm audit returned an error');
  const vulnerabilities = report.vulnerabilities;
  assert.ok(vulnerabilities && typeof vulnerabilities === 'object' && !Array.isArray(vulnerabilities), 'npm audit findings are missing');
  const names = Object.keys(vulnerabilities);
  assert.equal(report.metadata?.vulnerabilities?.total, names.length, 'npm audit counts do not match its findings');
  const allowed = new Map(reviewed.map(advisory => [advisory.url, advisory]));
  const roots = new Map();
  for (const [name, finding] of Object.entries(vulnerabilities)) {
    assert.equal(finding.name, name, 'Unexpected npm audit finding name');
    assert.ok(Array.isArray(finding.via) && finding.via.length > 0, `Missing vulnerability chain: ${name}`);
    assert.ok(Array.isArray(finding.nodes) && finding.nodes.length > 0, `Missing vulnerable install paths: ${name}`);
    for (const advisory of finding.via) {
      if (typeof advisory === 'string') {
        assert.ok(Object.hasOwn(vulnerabilities, advisory), `Unresolved vulnerability chain: ${name} -> ${advisory}`);
        continue;
      }
      assert.ok(advisory && typeof advisory === 'object', `Malformed advisory: ${name}`);
      const expected = allowed.get(advisory.url);
      assert.ok(expected, `Unmitigated advisory: ${advisory.url || name}`);
      assert.deepEqual(advisory, expected, `Advisory changed; re-review mitigation: ${advisory.url}`);
      assert.equal(name, expected.dependency, 'Root advisory attached to an unexpected package');
      const copies = mitigationTargets.filter(target => target.advisory === advisory.url);
      assert.ok(copies.length > 0, `No verified patch for ${advisory.url}`);
      assert.deepEqual([...finding.nodes].sort(), copies.map(target => target.node).sort(), `Not every audited copy is mitigated: ${name}`);
      if (!roots.has(name)) roots.set(name, new Set());
      roots.get(name).add(advisory.url);
    }
  }
  const reachableRoots = start => {
    const pending = [start];
    const seen = new Set();
    const urls = new Set();
    while (pending.length > 0) {
      const current = pending.pop();
      if (seen.has(current)) continue;
      seen.add(current);
      for (const url of roots.get(current) || []) urls.add(url);
      for (const via of vulnerabilities[current].via) {
        if (typeof via === 'string') pending.push(via);
      }
    }
    return urls;
  };
  for (const name of names) {
    const urls = reachableRoots(name);
    assert.ok(urls.size > 0, `No verified advisory root for ${name}`);
    // Every current root is high; a different inherited severity also requires
    // review, even if npm's graph still points at an existing GHSA.
    assert.equal(vulnerabilities[name].severity, 'high', `Severity changed: ${name}`);
  }
  return { upstreamFindingCount: names.length, locallyMitigatedAdvisories: [...new Set([...roots.values()].flatMap(set => [...set]))].sort() };
}

function captureAudit(root) {
  const directory = path.join(root, '.build', 'security');
  fs.mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(directory, `npm-audit-${stamp}-${process.pid}.json`);
  const result = spawnSync('npm', ['audit', '--json'], {
    cwd: root, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
  });
  // Retain the actual report and exit status, including npm's unresolved
  // findings. Never edit its vulnerabilities or metadata to claim audit zero.
  fs.writeFileSync(filename, result.stdout || '');
  fs.writeFileSync(`${filename}.status.json`, JSON.stringify({
    npmExitCode: result.status,
    signal: result.signal,
    commandError: result.error?.code || null,
  }, null, 2) + '\n');
  if (result.stderr) fs.writeFileSync(`${filename}.stderr.txt`, result.stderr);
  assert.ok(!result.error && [0, 1].includes(result.status), `npm audit failed; inspect ${filename}`);
  let report;
  try { report = JSON.parse(result.stdout); } catch { throw new Error(`Invalid npm audit JSON; inspect ${filename}`); }
  return { report, filename, npmExitCode: result.status };
}

function runAudit(root, savedReport) {
  const targets = verifyPatches(root);
  const regression = runRegressions(root);
  const captured = savedReport
    ? { report: JSON.parse(fs.readFileSync(savedReport, 'utf8')), filename: savedReport, npmExitCode: null }
    : captureAudit(root);
  const summary = { ...validateReport(captured.report, targets), ...regression, rawAuditReport: captured.filename, npmAuditExitCode: captured.npmExitCode };
  return summary;
}

module.exports = { reviewed, validateReport, captureAudit, runAudit };
if (require.main === module) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--report'), 'Usage: security-audit.cjs [--report captured-npm-audit.json]');
  console.log(JSON.stringify(runAudit(path.resolve(__dirname, '..'), args[1] ? path.resolve(args[1]) : undefined), null, 2));
}
