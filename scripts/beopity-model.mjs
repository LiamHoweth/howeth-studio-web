import { ExtrudeGeometry, Mesh, MeshPhysicalMaterial, Path, Shape } from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Smooth reconstruction of the original Beopity mark: tall stem, two open bowls.
export function createBeopityModel() {
  const shape = new Shape();
  shape.moveTo(24, 90);
  shape.lineTo(24, 16);
  shape.bezierCurveTo(24, 3, 42, 3, 42, 16);
  shape.lineTo(42, 36);
  shape.bezierCurveTo(48, 31, 52, 30, 58, 30);
  shape.bezierCurveTo(85, 30, 91, 59, 73, 73);
  shape.bezierCurveTo(93, 86, 81, 112, 56, 112);
  shape.bezierCurveTo(36, 112, 24, 104, 24, 90);
  shape.closePath();
  for (const [y, radius] of [[56, 11.5], [87, 12.5]]) {
    const hole = new Path();
    hole.absellipse(56, y, radius, radius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new ExtrudeGeometry(shape, {
    depth: 5, bevelEnabled: true, bevelSegments: 10,
    steps: 1, bevelSize: 2.7, bevelThickness: 4, curveSegments: 48,
  });
  geometry.scale(0.04, -0.04, 0.04);
  geometry.center();
  // The Y reflection reverses winding; flip every triangle to keep outward normals.
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < position.count; i += 3) {
    const a = [position.getX(i), position.getY(i), position.getZ(i)];
    position.setXYZ(i, position.getX(i + 2), position.getY(i + 2), position.getZ(i + 2));
    position.setXYZ(i + 2, ...a);
    const u = [uv.getX(i), uv.getY(i)];
    uv.setXY(i, uv.getX(i + 2), uv.getY(i + 2));
    uv.setXY(i + 2, ...u);
  }
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  const smoothGeometry = mergeVertices(geometry);
  smoothGeometry.computeVertexNormals();
  geometry.dispose();
  const material = new MeshPhysicalMaterial({
    color: 0xeeeae0, metalness: 0.22, roughness: 0.28,
    clearcoat: 0.45, clearcoatRoughness: 0.22,
  });
  const mesh = new Mesh(smoothGeometry, material);
  mesh.name = 'Beopity sculpted mark';
  return mesh;
}
