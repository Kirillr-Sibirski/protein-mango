"use client";
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    // Initialize scene
    const scene = new THREE.Scene();
    
    // Adjust camera FOV and position for right-side placement
    const camera = new THREE.PerspectiveCamera(10, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    // Adjust camera position
    camera.position.z = 1;
    camera.position.x = -0.2; // Move camera slightly left to shift view right
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff,  6.0);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xffffff, 5.0);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 10.5);
    pointLight2.position.set(-10, -10, 5);
    scene.add(pointLight2);

    // Load 3D model
    const loader = new GLTFLoader();
    let mango: THREE.Group;

    loader.load(
      '/models/mango.glb',
      (gltf) => {
        mango = gltf.scene;
        mango.scale.set(1.3, 1.3, 1.3);
        
        // Position the mango on the right side
        mango.position.x = -0.15; // Move mango to the right
        // mango.position.y = 0.1; // Slightly adjust vertical position if needed
        
        // Make materials lighter if they exist
        mango.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.transparent = true;
                  mat.opacity = 0.8;
                });
              } else {
                child.material.transparent = true;
                child.material.opacity = 0.8;
              }
            }
          }
        });

        scene.add(mango);

        // Animation
        const animate = () => {
          requestAnimationFrame(animate);
          if (mango) {
            mango.rotation.y += 0.01;
          }
          renderer.render(scene, camera);
        };
        animate();
      },
      (progress) => {
        console.log('Loading model...', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Event handlers
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Initial resize call
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}