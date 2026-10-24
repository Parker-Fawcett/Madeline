"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scatter } from "@/lib/scatter";
import { GROUND_Y } from "@/lib/labels";
import { PLAYER_START, type CollisionTarget } from "./PlayerRig";
import { MARKERS } from "./markers";

export const SKY_HORIZON = "#f5e0c3";
const SKY_TOP = "#e9b7a0";
const TREE_TRUNK = "#7a5a44";
const TREE_LEAVES = "#56786f";
const FLOWER_COLORS = ["#e8a0a8", "#f3d27a", "#f5f0e8", "#b89ad0"];
const TREE_RADIUS = 0.45;

const MARKER_CLEARANCE = MARKERS.map((m) => ({
  x: m.position[0],
  z: m.position[2],
  radius: 1.4,
}));

const TREES = scatter({
  seed: 7,
  count: 34,
  minRadius: 8.6,
  maxRadius: 11.8,
  spacing: 1.3,
  // keep the spawn point and the camera behind it clear
  avoid: [{ x: PLAYER_START.x, z: PLAYER_START.z + 1.5, radius: 2.8 }],
});

const FLOWERS = scatter({
  seed: 11,
  count: 140,
  minRadius: 1.2,
  maxRadius: 11.5,
  spacing: 0.35,
  avoid: MARKER_CLEARANCE,
});

export const TREE_OBSTACLES: CollisionTarget[] = TREES.map((t, i) => ({
  id: `tree-${i}`,
  x: t.x,
  z: t.z,
  radius: TREE_RADIUS,
}));

// Deterministic 0..1 per index, for size/rotation variety.
function variety(i: number): number {
  return (i * 0.618034) % 1;
}

function useInstanceMatrices(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  points: { x: number; z: number }[],
  place: (i: number, obj: THREE.Object3D) => void
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const obj = new THREE.Object3D();
    points.forEach((p, i) => {
      obj.position.set(p.x, GROUND_Y, p.z);
      obj.rotation.set(0, variety(i) * Math.PI * 2, 0);
      obj.scale.setScalar(1);
      place(i, obj);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [ref, points, place]);
}

function placeTrunk(i: number, obj: THREE.Object3D) {
  const s = 0.8 + variety(i) * 0.5;
  obj.position.y += 0.3 * s;
  obj.scale.setScalar(s);
}

function placeLeaves(i: number, obj: THREE.Object3D) {
  const s = 0.8 + variety(i) * 0.5;
  obj.position.y += 1.05 * s;
  obj.scale.setScalar(s);
}

function Trees() {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  useInstanceMatrices(trunks, TREES, placeTrunk);
  useInstanceMatrices(leaves, TREES, placeLeaves);

  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, TREES.length]}>
        <cylinderGeometry args={[0.07, 0.1, 0.6, 5]} />
        <meshStandardMaterial color={TREE_TRUNK} roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, TREES.length]}>
        <coneGeometry args={[0.45, 1.2, 6]} />
        <meshStandardMaterial color={TREE_LEAVES} roughness={0.85} flatShading />
      </instancedMesh>
    </>
  );
}

function placeFlower(i: number, obj: THREE.Object3D) {
  obj.position.y += 0.06;
  obj.scale.setScalar(0.7 + variety(i) * 0.6);
}

function Flowers() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useInstanceMatrices(ref, FLOWERS, placeFlower);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new THREE.Color();
    FLOWERS.forEach((_, i) => {
      mesh.setColorAt(i, color.set(FLOWER_COLORS[i % FLOWER_COLORS.length]));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, FLOWERS.length]}>
      <icosahedronGeometry args={[0.06, 0]} />
      <meshStandardMaterial roughness={0.7} flatShading />
    </instancedMesh>
  );
}

function Sky() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(40, 16, 12);
    const pos = geo.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const horizon = new THREE.Color(SKY_HORIZON);
    const top = new THREE.Color(SKY_TOP);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 40, 0, 1);
      c.copy(horizon).lerp(top, t).toArray(colors, i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

export function Scenery() {
  return (
    <>
      <Sky />
      <Trees />
      <Flowers />
    </>
  );
}
