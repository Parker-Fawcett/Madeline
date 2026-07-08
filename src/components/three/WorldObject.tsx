"use client";

import { useRef, useState, useMemo, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface WorldObjectProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon: string;
  modelPath?: string;
  modelScale?: number;
  modelTint?: string;
  labelOffset?: number;
  interactive?: boolean;
  inRange?: boolean;
  onClick: () => void;
  hidden?: boolean;
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
  labelOffset = -0.9,
  interactive = true,
  inRange = false,
  onClick,
  hidden = false,
}: WorldObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const highlighted = hovered || inRange;
    if (groupRef.current) {
      groupRef.current.scale.lerp(
        new THREE.Vector3(
          highlighted ? 1.25 : 1,
          highlighted ? 1.25 : 1,
          highlighted ? 1.25 : 1
        ),
        delta * 4
      );
    }
  });

  if (hidden) return null;

  return (
    <group position={position}>
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

      {inRange && (
        <Text
          position={[0, 0.9, 0]}
          fontSize={0.18}
          color="#f5f0e8"
          anchorX="center"
          anchorY="bottom"
        >
          tap to open
        </Text>
      )}

      <Text
        position={[0, labelOffset, 0]}
        fontSize={0.15}
        color={hovered ? "#e4e4e7" : "#71717a"}
        anchorX="center"
        anchorY="top"
        maxWidth={2}
      >
        {label}
      </Text>
    </group>
  );
}
