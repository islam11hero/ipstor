"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function NetworkGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 64;
    for (let i = 0; i < count; i += 1) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 1.55 + Math.random() * 0.08;
      points.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return points;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00025) * 0.08;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshBasicMaterial
          color="#34d399"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      {nodes.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ))}
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#34d399" />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#22d3ee" />
    </group>
  );
}

type ProxyNetworkGlobeProps = {
  className?: string;
};

export function ProxyNetworkGlobe({ className }: ProxyNetworkGlobeProps) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <NetworkGlobe />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
