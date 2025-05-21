import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DebugGizmoProps {
  size?: number;
  position?: [number, number, number];
  showLabels?: boolean;
}

const DebugGizmo: React.FC<DebugGizmoProps> = ({ 
  size = 1, 
  position = [0, 0, 0],
  showLabels = true 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Colors for each axis
  const colors = {
    x: new THREE.Color(0xff0000), // Red for X
    y: new THREE.Color(0x00ff00), // Green for Y
    z: new THREE.Color(0x0000ff), // Blue for Z
  };

  // Update gizmo orientation to match camera but keep it upright
  useFrame(({ camera }) => {
    if (groupRef.current) {
      // Get camera's forward direction
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      
      // Project forward vector onto XZ plane
      forward.y = 0;
      forward.normalize();
      
      // Calculate rotation to align with camera's forward direction
      const angle = Math.atan2(forward.x, forward.z);
      
      // Apply rotation around Y axis only
      groupRef.current.rotation.y = angle;
      
      // Update position to stay in front of camera
      const cameraPosition = camera.position.clone();
      const direction = forward.clone().multiplyScalar(20); // 20 units in front
      groupRef.current.position.copy(cameraPosition.add(direction));
      groupRef.current.position.y = 5; // Keep it at a fixed height
    }
  });

  return (
    <group ref={groupRef}>
      {/* X axis (red) */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, size, 8]} />
        <meshBasicMaterial color={colors.x} />
      </mesh>
      {showLabels && (
        <Text
          position={[size * 0.6, 0, 0]}
          fontSize={0.4}
          color={colors.x}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          X
        </Text>
      )}

      {/* Y axis (green) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, size, 8]} />
        <meshBasicMaterial color={colors.y} />
      </mesh>
      {showLabels && (
        <Text
          position={[0, size * 0.6, 0]}
          fontSize={0.4}
          color={colors.y}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          Y
        </Text>
      )}

      {/* Z axis (blue) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, size, 8]} />
        <meshBasicMaterial color={colors.z} />
      </mesh>
      {showLabels && (
        <Text
          position={[0, 0, size * 0.6]}
          fontSize={0.4}
          color={colors.z}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          Z
        </Text>
      )}

      {/* North indicator */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshBasicMaterial color={0xffff00} />
      </mesh>
      {showLabels && (
        <Text
          position={[0, size * 0.8, 0]}
          fontSize={0.4}
          color={0xffff00}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          N
        </Text>
      )}
    </group>
  );
};

export default DebugGizmo; 