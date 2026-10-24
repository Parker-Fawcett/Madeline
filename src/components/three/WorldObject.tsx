"use client";

import { useRef, useState, useMemo, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Float, Text, useGLTF, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { labelOffsetFor } from "@/lib/labels";

// Served locally: without a font, troika fetches font data from a CDN and
// the whole scene suspends (blank screen) until it arrives.
export const LABEL_FONT = "/fonts/Geist-Regular.ttf";
const BASE_SCALE = new THREE.Vector3(1, 1, 1);
const HIGHLIGHT_SCALE = new THREE.Vector3(1.25, 1.25, 1.25);

interface WorldObjectProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon: string;
  modelPath?: string;
  modelScale?: number;
  modelTint?: string;
  interactive?: boolean;
  inRange?: boolean;
  onClick: () => void;
  hidden?: boolean;
  special?: boolean;
}

function MarkerModel({
  modelPath,
  scale = 1,
  tint,
}: {
  modelPath: string;
  scale?: number;
  tint?: string;
}) {
  const { scene } = useGLTF(modelPath, true, true);
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    if (tint) {
      const flatMaterial = new THREE.MeshStandardMaterial({
        color: tint,
        roughness: 0.75,
        metalness: 0.05,
        flatShading: true,
      });
      clone.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material = flatMaterial;
        }
      });
    }
    return clone;
  }, [scene, tint]);
  return <primitive object={cloned} scale={scale} />;
}

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function MarkerShape({ color, icon }: { color: string; icon: string }) {
  return (
    <group>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.75}
          transparent
          opacity={0.95}
        />
      </mesh>
      {icon && (
        <Text
          font={LABEL_FONT}
          position={[0, 0, 0.6]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {icon}
        </Text>
      )}
    </group>
  );
}

export function WorldObject({
  position,
  color,
  label,
  icon,
  modelPath,
  modelScale = 1,
  modelTint,
  interactive = true,
  inRange = false,
  onClick,
  hidden = false,
  special = false,
}: WorldObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(
        hovered || inRange ? HIGHLIGHT_SCALE : BASE_SCALE,
        delta * 4
      );
    }
  });

  if (hidden) return null;

  return (
    <group position={position}>
      {special && (
        <>
          <pointLight color="#ffd27a" intensity={1.4} distance={5} />
          <Sparkles
            count={30}
            scale={2.4}
            size={2.5}
            speed={0.3}
            color="#ffd27a"
          />
        </>
      )}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group
          ref={groupRef}
          onClick={(e) => {
            e.stopPropagation();
            if (interactive) onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          {modelPath ? (
            <ModelErrorBoundary fallback={<MarkerShape color={color} icon={icon} />}>
              <Suspense fallback={<MarkerShape color={color} icon={icon} />}>
                <MarkerModel modelPath={modelPath} scale={modelScale} tint={modelTint} />
              </Suspense>
            </ModelErrorBoundary>
          ) : (
            <MarkerShape color={color} icon={icon} />
          )}
        </group>
      </Float>

      <Billboard position={[0, labelOffsetFor(position[1]), 0]}>
        <Text
          font={LABEL_FONT}
          fontSize={0.15}
          color={hovered ? "#3d3832" : "#5a534b"}
          anchorX="center"
          anchorY="bottom"
          maxWidth={2}
        >
          {label}
        </Text>
        {inRange && (
          <Text
            font={LABEL_FONT}
            position={[0, 0.22, 0]}
            fontSize={0.13}
            color="#6b8f87"
            anchorX="center"
            anchorY="bottom"
          >
            tap to open
          </Text>
        )}
      </Billboard>
    </group>
  );
}
