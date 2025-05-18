import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useTerrainStore } from '../store/terrainStore';
import { useWaterStore } from '../store/waterStore';

// Shader code directly from test_inspiration.html
const waterVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const waterFragmentShader = `
#include <packing>

varying vec2 vUv;
uniform sampler2D tDepth;
uniform sampler2D tDudv;
uniform sampler2D tBlueprint;
uniform vec3 foamColor;
uniform float cameraNear;
uniform float cameraFar;
uniform float threshold;
uniform vec2 resolution;
uniform float time;
uniform float secondaryFoamScale;
uniform float secondaryFoamWidth;
uniform bool debugMode;

float getDepth(const in vec2 screenPosition) {
    return unpackRGBAToDepth(texture2D(tDepth, screenPosition));
}

float getViewZ(const in float depth) {
    return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
}

// Noise function for secondary foam
float noise(vec2 p) {
    vec2 noiseUV = p * secondaryFoamScale + vec2(time * 0.05);
    return texture2D(tDudv, noiseUV).r;
}

void main() {
    // Blueprint texture
    vec2 blueprintUV = vUv * 4.0;
    vec3 baseColor = texture2D(tBlueprint, blueprintUV).rgb;

    // Intersection effect
    vec2 screenUV = gl_FragCoord.xy / resolution;
    float sceneDepth = getDepth(screenUV);
    
    // Debug mode - show depth texture directly
    if (debugMode) {
        gl_FragColor = vec4(vec3(sceneDepth), 1.0);
        return;
    }
    
    // Only show foam if there's actual geometry
    if (sceneDepth < 1.0) {
        float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
        float linearEyeDepth = getViewZ(sceneDepth);
        float diff = fragmentLinearEyeDepth - linearEyeDepth;

        // Primary foam with noise
        vec2 distortion = texture2D(tDudv, vUv * 2.0 - time * 0.05).rg;
        distortion = (distortion * 2.0 - 1.0) * 1.0;
        float primaryFoam = step(0.0, diff) * (1.0 - step(threshold, diff + distortion.x));
        
        // Secondary foam
        float secondaryNoise = noise(vUv);
        float secondaryMask = step(0.0, diff) * (1.0 - step(threshold + secondaryFoamWidth, diff));
        float secondaryFoam = secondaryMask * step(0.7, secondaryNoise);

        // Combine foams
        float foam = max(primaryFoam, secondaryFoam * 0.6);
        gl_FragColor.rgb = mix(baseColor, foamColor, foam);
    } else {
        gl_FragColor.rgb = baseColor;
    }
    gl_FragColor.a = 1.0;
}
`;

// Debug helper to visualize a texture
const DebugTexture: React.FC<{ texture: THREE.Texture, position: [number, number, number] }> = ({ texture, position }) => {
  return (
    <mesh position={position}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
};

const Water: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const { 
    size: terrainSize,
    waterColor
  } = useTerrainStore();
  
  const {
    threshold,
    waterLevel,
    secondaryFoamScale,
    secondaryFoamWidth
  } = useWaterStore();

  // Debug state
  const [debugMode, setDebugMode] = useState(false);
  const [showDepthTexture, setShowDepthTexture] = useState(false);

  // Create render target for depth
  const renderTarget = useMemo(() => {
    const pixelRatio = gl.getPixelRatio();
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio,
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        stencilBuffer: false,
        depthBuffer: true,
      }
    );
    return rt;
  }, [gl]);

  // Create depth material
  const depthMaterial = useMemo(() => {
    const material = new THREE.MeshDepthMaterial();
    material.depthPacking = THREE.RGBADepthPacking;
    material.blending = THREE.NoBlending;
    return material;
  }, []);

  // Load textures
  const [dudvMap, blueprintMap] = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const dudv = textureLoader.load('https://i.imgur.com/hOIsXiZ.png', () => {
      console.log('DUDV map loaded');
    });
    dudv.wrapS = dudv.wrapT = THREE.RepeatWrapping;
    
    const blueprint = textureLoader.load('/assets/blueprint_diffuse.png', () => {
      console.log('Blueprint texture loaded');
    });
    blueprint.wrapS = blueprint.wrapT = THREE.RepeatWrapping;
    
    return [dudv, blueprint];
  }, []);

  // Create water material
  const waterMaterial = useMemo(() => {
    console.log("Creating new Water Material"); // Debug log
    const pixelRatio = gl.getPixelRatio();
    return new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        tDepth: { value: renderTarget.texture },
        tDudv: { value: dudvMap },
        tBlueprint: { value: blueprintMap },
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        resolution: { value: new THREE.Vector2(
          window.innerWidth * pixelRatio,
          window.innerHeight * pixelRatio
        )},
        threshold: { value: threshold },
        foamColor: { value: new THREE.Color(waterColor) },
        time: { value: 0 },
        secondaryFoamScale: { value: secondaryFoamScale },
        secondaryFoamWidth: { value: secondaryFoamWidth },
        debugMode: { value: debugMode }
      },
      transparent: true
    });
  }, [gl, renderTarget, dudvMap, blueprintMap, camera, threshold, waterColor, secondaryFoamScale, secondaryFoamWidth, debugMode]);

  // Add debug keyboard control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        setDebugMode(prev => !prev);
        console.log('Debug mode:', !debugMode);
      }
      if (e.key === 't') {
        setShowDepthTexture(prev => !prev);
        console.log('Show depth texture:', !showDepthTexture);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode, showDepthTexture]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = gl.getPixelRatio();

      renderTarget.setSize(width * pixelRatio, height * pixelRatio);
      if (waterMaterial) {
        waterMaterial.uniforms.resolution.value.set(width * pixelRatio, height * pixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, renderTarget, waterMaterial]);

  // Reference to the water mesh
  const waterRef = useRef<THREE.Mesh>(null);
  
  // Add list of terrain meshes
  const terrainMeshes = useRef<THREE.Object3D[]>([]);
  
  // Find all terrain meshes in the scene
  useEffect(() => {
    // Wait one frame to ensure scene is populated
    const timeout = setTimeout(() => {
      const meshes: THREE.Object3D[] = [];
      scene.traverse((object) => {
        // Find meshes that aren't the water plane
        if (object.type === 'Mesh' && 
            object !== waterRef.current &&
            !(object instanceof THREE.GridHelper)) {
          meshes.push(object);
        }
      });
      terrainMeshes.current = meshes;
      console.log('Found terrain meshes:', meshes.length);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [scene]);

  // Update water on each frame
  useFrame((state) => {
    if (!waterRef.current || !waterMaterial) return;

    // Update dynamic uniforms every frame
    waterMaterial.uniforms.time.value = state.clock.elapsedTime;
    
    // Set camera properties to match test.html
    waterMaterial.uniforms.cameraNear.value = 1.0; 
    waterMaterial.uniforms.cameraFar.value = 3000.0;
    
    // Update uniforms from the store
    waterMaterial.uniforms.threshold.value = threshold;
    waterMaterial.uniforms.secondaryFoamScale.value = secondaryFoamScale;
    waterMaterial.uniforms.secondaryFoamWidth.value = secondaryFoamWidth;
    waterMaterial.uniforms.foamColor.value.set(waterColor);
    waterMaterial.uniforms.debugMode.value = debugMode;

    // Standard depth pass as in test.html
    waterRef.current.visible = false;
    const originalMaterials = new Map<THREE.Object3D, THREE.Material | THREE.Material[]>();
    
    // Save original materials and apply depth material
    if (terrainMeshes.current.length > 0) {
      terrainMeshes.current.forEach(object => {
        if (object instanceof THREE.Mesh) {
          originalMaterials.set(object, object.material);
          object.material = depthMaterial;
        }
      });
    } else {
      // Fallback to the original approach
      scene.overrideMaterial = depthMaterial;
    }
    
    // Render the depth
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    
    // Restore original materials
    if (terrainMeshes.current.length > 0) {
      originalMaterials.forEach((material, object) => {
        if (object instanceof THREE.Mesh) {
          object.material = material;
        }
      });
    } else {
      scene.overrideMaterial = null;
    }
    
    waterRef.current.visible = true;
    gl.setRenderTarget(null);
  });

  return (
    <>
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, waterLevel, 0]}
      >
        <planeGeometry args={[terrainSize * 4, terrainSize * 4]} />
        {waterMaterial && <primitive object={waterMaterial} attach="material" />}
      </mesh>
      
      {/* Debug texture visualization */}
      {showDepthTexture && renderTarget.texture && (
        <DebugTexture 
          texture={renderTarget.texture} 
          position={[0, 100, 0]} 
        />
      )}
    </>
  );
};

export default Water; 