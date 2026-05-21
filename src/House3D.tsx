import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Text } from '@react-three/drei';
import { FurnitureItem } from './types';

export interface House3DProps {
  furniture: FurnitureItem[];
  playerX: number;
  playerY: number;
  playerSprite: string;
  onCellClick?: (x: number, y: number) => void;
  isEditMode?: boolean;
}

const PlayerAvatar = ({ x, y, sprite }: { x: number; y: number; sprite: string }) => {
  const ref = useRef<any>(null);
  // Simple floating animation
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[x - 50, 0.5, y - 50]}>
      <Sphere ref={ref} args={[0.4, 16, 16]}>
        <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={0.5} wireframe />
      </Sphere>
      <Text position={[0, 1, 0]} fontSize={0.5} color="white" outlineColor="#000" outlineWidth={0.05}>
        {sprite}
      </Text>
    </group>
  );
};

const Furniture3D = ({ item }: { item: FurnitureItem }) => {
  // Simple primitive representations based on category or name
  let MeshComponent = Box;
  let args = [0.8, 0.8, 0.8] as any;
  let color = "#aaaaaa";

  if (item.category === "furniture") {
    MeshComponent = Box;
    args = [1, 0.5, 1];
    color = "#8b5a2b";
  } else if (item.category === "appliances") {
    MeshComponent = Box;
    args = [0.8, 1.2, 0.8];
    color = "#555555";
  } else if (item.category === "nature") {
    MeshComponent = Cylinder as any;
    args = [0.4, 0.4, 1, 16];
    color = "#2ea83a";
  } else {
    color = "#bc22b2";
  }

  const posX = item.x - 50;
  const posY = item.y - 50;
  const rotY = (item.rotation * Math.PI) / 180;

  return (
    <group position={[posX, 0, posY]} rotation={[0, -rotY, 0]}>
      <Text position={[0, 1.5, 0]} fontSize={0.4} color="white" outlineColor="#000" outlineWidth={0.05}>
        {item.emoji}
      </Text>
      <MeshComponent args={args} position={[0, args[1]/2, 0]}>
        <meshStandardMaterial color={color} />
      </MeshComponent>
    </group>
  );
};

export const House3D: React.FC<House3DProps> = ({ furniture, playerX, playerY, playerSprite, onCellClick, isEditMode }) => {
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (onCellClick && isEditMode) {
      const x = Math.round(e.point.x) + 50;
      const y = Math.round(e.point.z) + 50;
      onCellClick(x, y);
    }
  };

  return (
    <div className="w-full h-full relative font-sans" style={{ minHeight: "400px", cursor: isEditMode ? 'crosshair' : 'default' }}>
      <Canvas camera={{ position: [0, 15, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} intensity={1.5} />
        
        {/* The Grid / Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onPointerDown={handlePointerDown}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <gridHelper args={[100, 100, "#64ffda", "#222222"]} position={[0, -0.09, 0]} />

        {/* Player */}
        <PlayerAvatar x={playerX} y={playerY} sprite={playerSprite} />

        {/* Furniture */}
        {furniture.map((item) => (
          <Furniture3D key={item.id} item={item} />
        ))}

        <OrbitControls 
          target={[playerX - 50, 0, playerY - 50]} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={5} 
          maxDistance={40} 
        />
      </Canvas>
    </div>
  );
};
