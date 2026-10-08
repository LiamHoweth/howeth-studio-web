import { mkdir, writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createBeopityModel } from './beopity-model.mjs';

// The exporter uses the browser FileReader API for binary Blob output.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => { this.result = result; this.onloadend?.(); });
  }
};
const model = createBeopityModel();
const binary = await new GLTFExporter().parseAsync(model, { binary: true });
await mkdir(new URL('../public/beopity/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/beopity/logo.glb', import.meta.url), Buffer.from(binary));
model.geometry.dispose();
model.material.dispose();
console.log(`Beopity logo.glb: ${binary.byteLength} bytes`);
