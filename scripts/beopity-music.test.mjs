import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../lib/ambientTracks.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { AMBIENT_TRACKS } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const directory = new URL('../public/beopity/music/', import.meta.url);
const report = JSON.parse(await readFile(new URL('../docs/beopity-music-render.json', import.meta.url), 'utf8'));

function inspectMp3(buffer) {
  let offset = 0;
  if (buffer.toString('ascii', 0, 3) === 'ID3') {
    const size = ((buffer[6] & 127) << 21) | ((buffer[7] & 127) << 14) |
      ((buffer[8] & 127) << 7) | (buffer[9] & 127);
    offset = 10 + size + ((buffer[5] & 0x10) ? 10 : 0);
  }
  let frames = 0;
  const bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  while (offset + 4 <= buffer.length) {
    const header = buffer.readUInt32BE(offset);
    assert.equal((header >>> 21) & 0x7ff, 0x7ff, 'every frame has the MPEG sync word');
    assert.equal((header >>> 19) & 3, 3, 'MPEG-1');
    assert.equal((header >>> 17) & 3, 1, 'Layer III');
    const bitrate = bitrates[(header >>> 12) & 15];
    const sampleRate = [44100, 48000, 32000][(header >>> 10) & 3];
    assert.equal(bitrate, 128);
    assert.equal(sampleRate, 44100);
    assert.notEqual((header >>> 6) & 3, 3, 'stereo or joint stereo');
    const length = Math.floor(144000 * bitrate / sampleRate) + ((header >>> 9) & 1);
    assert.ok(offset + length <= buffer.length, 'complete final frame');
    offset += length;
    frames++;
  }
  assert.equal(offset, buffer.length, 'no unparsed trailing data');
  assert.ok(frames > 3000, 'a full composition, not a short placeholder');
  return frames * 1152 / 44100;
}

test('catalogue contains exactly ten complete original track entries and local assets', async () => {
  assert.equal(AMBIENT_TRACKS.length, 10);
  assert.equal(new Set(AMBIENT_TRACKS.map((track) => track.id)).size, 10);
  assert.equal(new Set(AMBIENT_TRACKS.map((track) => track.title)).size, 10);
  assert.equal(report.tracks.length, 10);
  assert.deepEqual((await readdir(directory)).filter((name) => name.endsWith('.mp3')).sort(),
    AMBIENT_TRACKS.map((track) => `${track.id}.mp3`).sort());
  for (const track of AMBIENT_TRACKS) {
    assert.match(track.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.equal(track.artist, 'Beopity');
    assert.equal(track.src, `/beopity/music/${track.id}.mp3`);
    assert.ok(track.duration >= 90 && track.duration <= 150);
    assert.match(track.accent, /^#[a-f0-9]{6}$/i);
    const measured = report.tracks.find((entry) => entry.id === track.id);
    for (const key of ['title', 'artist', 'src', 'duration', 'accent']) {
      assert.equal(track[key], measured[key]);
    }
  }
});

test('all ten files are distinct full stereo MP3 compositions with matching evidence', async () => {
  const hashes = new Set();
  let totalBytes = 0;
  for (const track of AMBIENT_TRACKS) {
    const file = await readFile(new URL(`${track.id}.mp3`, directory));
    const hash = createHash('sha256').update(file).digest('hex');
    const measured = report.tracks.find((entry) => entry.id === track.id);
    assert.equal(hash, measured.sha256, track.id);
    assert.equal(file.length, measured.bytes, track.id);
    assert.ok(Math.abs(inspectMp3(file) - track.duration) < 0.08, track.id);
    hashes.add(hash);
    totalBytes += file.length;
  }
  assert.equal(hashes.size, 10);
  assert.equal(new Set(report.tracks.map((track) => track.decodedSha256)).size, 10);
  assert.equal(totalBytes, report.totalBytes);
  assert.ok(totalBytes < 20_000_000, 'entire catalogue stays below 20 MB');
});

test('musical scores differ in tempo, harmony and motifs and decoded levels retain headroom', () => {
  assert.equal(new Set(report.tracks.map((track) => track.bpm)).size, 10);
  assert.ok(new Set(report.tracks.map((track) => track.key)).size >= 8);
  assert.equal(new Set(report.tracks.map((track) => JSON.stringify(track.melodicMotifs))).size, 10);
  assert.equal(new Set(report.tracks.map((track) => JSON.stringify(track.progression))).size, 10);
  for (const track of report.tracks) {
    assert.equal(track.channels, 2);
    assert.equal(track.sampleRate, 44100);
    assert.equal(track.bitrate, 128000);
    assert.ok(track.renderedNotes > 180, track.id);
    assert.ok(track.peakDbfs < -1.4 && track.peakDbfs > -12, track.id);
    assert.ok(track.rmsDbfs > -30 && track.rmsDbfs < -18, track.id);
    assert.ok(track.firstSecondRmsDbfs < track.rmsDbfs - 10, `${track.id} fades in`);
    assert.ok(track.lastSecondRmsDbfs < track.rmsDbfs - 24, `${track.id} fades out`);
  }
});
