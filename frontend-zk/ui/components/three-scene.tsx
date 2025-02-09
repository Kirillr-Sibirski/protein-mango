"use client";
import { useEffect, useRef } from "react";
import * as THREE from 'three';

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    // Initialize scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });

    camera.position.z = 2;
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Add objects
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff7e33,
      wireframe: true
    });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xff7e33, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      shape.rotation.x += 0.002;
      shape.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    // Event handlers
    const handleResize = () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      camera.position.z = 2 - window.scrollY * 0.002;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}