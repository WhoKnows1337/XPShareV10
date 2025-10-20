'use client';

/**
 * Connection Network - Main 3D Visualization Component
 * Visualizes connections between experiences in 3D space
 */

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Text,
  Billboard,
  Line,
  Html,
  PerspectiveCamera,
  Environment,
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Types
interface ExperienceNode {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
  type: string;
  intensity: number;
  themes: string[];
  connectionCount: number;
  color: string;
  embedding?: number[];
}

interface ConnectionEdge {
  from: string;
  to: string;
  similarity: number;
}

interface Cluster {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface GalaxyProps {
  experiences: ExperienceNode[];
  connections: ConnectionEdge[];
  clusters?: Cluster[];
  onNodeClick?: (node: ExperienceNode) => void;
  onNodeHover?: (node: ExperienceNode | null) => void;
}

// Experience colors by type
const experienceColors: Record<string, string> = {
  dream: '#9B59B6',
  nde: '#E74C3C',
  meditation: '#3498DB',
  psychedelic: '#F39C12',
  synchronicity: '#2ECC71',
  astral: '#8E44AD',
  lucid: '#16A085',
  vision: '#F1C40F',
  ufo: '#95A5A6',
  telepathy: '#E67E22',
  precognition: '#9C88FF',
  general: '#ECF0F1',
};

/**
 * Individual Experience Node Component
 */
function ExperienceNodeMesh({ 
  node, 
  onClick, 
  onHover,
  isSelected,
  isRelated 
}: { 
  node: ExperienceNode;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
  isSelected: boolean;
  isRelated: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);

  // Calculate node size based on connections and intensity
  const nodeSize = useMemo(() => {
    const baseSize = 0.5;
    const connectionBonus = Math.min(node.connectionCount * 0.05, 1);
    const intensityBonus = (node.intensity / 10) * 0.3;
    return baseSize + connectionBonus + intensityBonus;
  }, [node]);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + node.position[0]) * 0.002;
      
      // Pulse effect for selected node
      if (isSelected) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(nodeSize * scale * pulse);
      } else {
        meshRef.current.scale.setScalar(nodeSize * scale);
      }

      // Rotate slowly
      meshRef.current.rotation.y += 0.001;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    setScale(1.2);
    onHover(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setScale(1);
    onHover(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.5 : (isRelated ? 0.3 : 0.1)}
          metalness={0.3}
          roughness={0.4}
          clearcoat={1}
          clearcoatRoughness={0}
          opacity={isRelated ? 1 : (hovered ? 1 : 0.9)}
          transparent
        />
      </mesh>

      {/* Glow effect */}
      {(hovered || isSelected) && (
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[nodeSize * 1.2, 16, 16]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Label */}
      {(hovered || isSelected) && (
        <Billboard>
          <Text
            position={[0, nodeSize + 1, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="black"
          >
            {node.title}
          </Text>
        </Billboard>
      )}

      {/* HTML overlay for detailed info */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-900/90 text-white p-2 rounded-lg text-xs max-w-xs pointer-events-none">
            <div className="font-bold">{node.title}</div>
            <div className="text-gray-300 mt-1">{node.type}</div>
            <div className="text-gray-400 mt-1">
              {node.connectionCount} connections
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Connection Line Component
 */
function ConnectionLine({ 
  from, 
  to, 
  strength 
}: { 
  from: [number, number, number];
  to: [number, number, number];
  strength: number;
}) {
  const points = useMemo(() => {
    // Create a slight curve for organic feel
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 2,
      (from[1] + to[1]) / 2 + (Math.random() - 0.5) * 2,
      (from[2] + to[2]) / 2 + (Math.random() - 0.5) * 2,
    ];
    return [from, mid, to];
  }, [from, to]);

  return (
    <Line
      points={points}
      color="white"
      lineWidth={strength * 2}
      opacity={0.2 + strength * 0.3}
      transparent
      fog={false}
    />
  );
}

/**
 * Cluster Visualization Component
 */
function ClusterMesh({ cluster }: { cluster: Cluster }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={meshRef} position={cluster.position}>
      <icosahedronGeometry args={[cluster.size * 10, 1]} />
      <meshPhysicalMaterial
        color={cluster.color}
        transparent
        opacity={0.1}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Camera Controller Component
 */
function CameraController({ target }: { target?: [number, number, number] }) {
  const { camera } = useThree();

  useEffect(() => {
    if (target) {
      // Smooth camera transition to target
      const targetPosition = new THREE.Vector3(...target);
      targetPosition.z += 10;
      
      // Animate camera position
      const startPosition = camera.position.clone();
      let progress = 0;
      
      const animate = () => {
        progress += 0.02;
        if (progress <= 1) {
          camera.position.lerpVectors(startPosition, targetPosition, progress);
          camera.lookAt(new THREE.Vector3(...target));
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [target, camera]);

  return null;
}

/**
 * Main Connection Network Component
 */
export function NetworkGraph3D({ 
  experiences, 
  connections, 
  clusters = [],
  onNodeClick,
  onNodeHover 
}: GalaxyProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | undefined>();

  // Create node map for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, ExperienceNode>();
    experiences.forEach(node => map.set(node.id, node));
    return map;
  }, [experiences]);

  // Find related nodes
  const relatedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    
    const related = new Set<string>();
    connections.forEach(conn => {
      if (conn.from === selectedNode) related.add(conn.to);
      if (conn.to === selectedNode) related.add(conn.from);
    });
    return related;
  }, [selectedNode, connections]);

  const handleNodeClick = (node: ExperienceNode) => {
    setSelectedNode(node.id);
    setCameraTarget(node.position);
    onNodeClick?.(node);
  };

  const handleNodeHover = (node: ExperienceNode | null) => {
    setHoveredNode(node?.id || null);
    onNodeHover?.(node);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas className="bg-gradient-to-b from-gray-900 to-black">
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 20, 50]} fov={60} />
          <CameraController target={cameraTarget} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />

          {/* Background */}
          <Stars 
            radius={300} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1}
          />

          {/* Clusters */}
          {clusters.map(cluster => (
            <ClusterMesh key={cluster.id} cluster={cluster} />
          ))}

          {/* Connections */}
          {connections.map((conn, idx) => {
            const fromNode = nodeMap.get(conn.from);
            const toNode = nodeMap.get(conn.to);
            
            if (fromNode && toNode) {
              const isHighlighted = 
                selectedNode === conn.from || 
                selectedNode === conn.to;
              
              return isHighlighted ? (
                <ConnectionLine
                  key={idx}
                  from={fromNode.position}
                  to={toNode.position}
                  strength={conn.similarity}
                />
              ) : null;
            }
            return null;
          })}

          {/* Experience Nodes */}
          {experiences.map(node => (
            <ExperienceNodeMesh
              key={node.id}
              node={node}
              onClick={() => handleNodeClick(node)}
              onHover={(hovering) => handleNodeHover(hovering ? node : null)}
              isSelected={selectedNode === node.id}
              isRelated={relatedNodes.has(node.id)}
            />
          ))}

          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            zoomSpeed={0.5}
            panSpeed={0.5}
            rotateSpeed={0.5}
            minDistance={5}
            maxDistance={200}
          />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 text-white">
        <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Connection Network</h3>
          <div className="text-sm space-y-1">
            <div>{experiences.length} Experiences</div>
            <div>{connections.length} Connections</div>
            <div>{clusters.length} Patterns</div>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 text-white">
        <div className="bg-gray-900/80 backdrop-blur p-3 rounded-lg text-xs">
          <div>🖱️ Left Click: Select</div>
          <div>🖱️ Right Drag: Rotate</div>
          <div>⚲ Scroll: Zoom</div>
          <div>🖱️ Middle Drag: Pan</div>
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph3D;