import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Box3, Raycaster, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createBeopityModel } from './beopity-model.mjs';

test('sculpture keeps both logo openings and a solid stem', () => {
  const mesh = createBeopityModel();
  mesh.updateMatrixWorld();
  const ray = new Raycaster();
  const hits = (x, y) => {
    ray.set(new Vector3(x, y, 5), new Vector3(0, 0, -1));
    return ray.intersectObject(mesh).length;
  };
  // Sample through the front and back, with default front-face culling.
  assert.equal(hits(0.1, 0.15), 0, 'upper opening remains hollow');
  assert.equal(hits(0.1, -1.1), 0, 'lower opening remains hollow');
  assert.ok(hits(-0.8, 0.9) > 0, 'stem is visible from the front');
  const bounds = new Box3().setFromObject(mesh).getSize(new Vector3());
  assert.ok(bounds.y > 4 && bounds.y < 4.7);
  assert.ok(bounds.z > 0.4 && bounds.z < 0.6, 'mark has actual depth');
  assert.ok(mesh.geometry.index, 'shared vertices reduce download size');
  assert.ok([...mesh.geometry.getAttribute('normal').array].every(Number.isFinite));
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('published GLB loads as a self-contained PBR mesh', async () => {
  const buffer = await readFile(new URL('../public/beopity/logo.glb', import.meta.url));
  assert.equal(buffer.readUInt32LE(0), 0x46546c67);
  assert.equal(buffer.readUInt32LE(4), 2);
  assert.equal(buffer.readUInt32LE(8), buffer.length);
  assert.ok(buffer.length < 850_000, 'model stays under its asset budget');
  const gltf = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '');
  let meshes = 0;
  gltf.scene.traverse((object) => {
    if (object.isMesh) {
      meshes++;
      assert.ok(object.geometry.getAttribute('position').count > 500);
      assert.equal(object.material.isMeshPhysicalMaterial, true);
      object.geometry.dispose(); object.material.dispose();
    }
  });
  assert.equal(meshes, 1);
});
