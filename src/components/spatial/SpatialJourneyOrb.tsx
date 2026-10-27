'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { Sparkles, Eye, Compass } from 'lucide-react';

interface SpatialJourneyOrbProps {
  routePerspective?: string;
  isEvaluating?: boolean;
  className?: string;
}

export const SpatialJourneyOrb: React.FC<SpatialJourneyOrbProps> = ({
  routePerspective = 'Balanced Journey',
  isEvaluating = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!mountRef.current || prefersReducedMotion) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 180;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // 2. Renderer with soft anti-aliasing
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. 3D Elements: Bordeaux Atelier Celestial Journey Ring & Waypoints
    const group = new THREE.Group();
    scene.add(group);

    // Outer Celestial Ring (Gilded Champagne Gold)
    const ringGeometry = new THREE.TorusGeometry(1.4, 0.02, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4a359,
      transparent: true,
      opacity: 0.65,
      wireframe: false,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // Inner Luminous Horizon Ring (Rose Gold)
    const innerRingGeo = new THREE.TorusGeometry(1.0, 0.015, 16, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xc8415f,
      transparent: true,
      opacity: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 4;
    group.add(innerRing);

    // Parametric 3D Route Curve (Curving through space like an elevation path)
    const curvePoints = [
      new THREE.Vector3(-1.2, -0.4, 0.2),
      new THREE.Vector3(-0.6, 0.5, 0.4),
      new THREE.Vector3(0.1, -0.2, 0.6),
      new THREE.Vector3(0.7, 0.4, 0.1),
      new THREE.Vector3(1.2, 0.1, -0.3),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.04, 12, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xc8415f,
      transparent: true,
      opacity: 0.95,
    });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(routeTube);

    // Waypoint Spheres (Origin A, Checkpoint, Destination B)
    const waypointGeo = new THREE.SphereGeometry(0.08, 16, 16);
    
    // Origin A (Bordeaux Noir)
    const originMat = new THREE.MeshBasicMaterial({ color: 0x240d1e });
    const originMesh = new THREE.Mesh(waypointGeo, originMat);
    originMesh.position.copy(curvePoints[0]);
    group.add(originMesh);

    // Waypoint (Champagne Gold)
    const midMat = new THREE.MeshBasicMaterial({ color: 0xd4a359 });
    const midMesh = new THREE.Mesh(waypointGeo, midMat);
    midMesh.position.copy(curvePoints[2]);
    group.add(midMesh);

    // Destination B (Rose Coral)
    const destMat = new THREE.MeshBasicMaterial({ color: 0xc8415f });
    const destMesh = new THREE.Mesh(waypointGeo, destMat);
    destMesh.position.copy(curvePoints[4]);
    group.add(destMesh);

    // Floating Starlight Particles (Streetlight Atmosphere)
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3;
      positions[i + 1] = (Math.random() - 0.5) * 2;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4a359,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Pointer Interactivity (gentle tilt parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.8;
      targetRotationX = y * 0.6;
    };

    container.addEventListener('mousemove', handlePointerMove);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Continuous gentle orbit
      group.rotation.y += isEvaluating ? 0.025 : 0.005;

      // Mouse damping
      group.rotation.y += (targetRotationY - group.rotation.y * 0.1) * 0.05;
      group.rotation.x += (targetRotationX - group.rotation.x * 0.1) * 0.05;

      // Subtle pulse on particles
      particles.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, isEvaluating]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-canvas via-white to-surface-raised border border-border p-3 ${className}`}>
      {/* Editorial Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-gold animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-bordeaux font-editorial">
            Spatial Journey Horizon
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-champagne-tint text-champagne-dark border border-champagne/30 font-medium">
            WebGL 3D
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-text-muted hover:text-bordeaux hover:bg-canvas transition-colors"
            title="Toggle focus"
            aria-label="Toggle focus"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount or Accessible 2D Fallback */}
      <div
        ref={mountRef}
        className={`w-full transition-all duration-300 relative ${
          isExpanded ? 'h-48' : 'h-28'
        } flex items-center justify-center cursor-grab active:cursor-grabbing`}
      >
        {(!webGLSupported || prefersReducedMotion) && (
          <div className="text-center p-4">
            <Compass className="w-8 h-8 text-rose-gold mx-auto mb-1 stroke-[1.5]" />
            <p className="text-xs font-serif text-bordeaux">Spatial Journey Horizon</p>
            <p className="text-[11px] text-text-muted">3D rendered static preview</p>
          </div>
        )}
      </div>

      {/* Caption & Metadata */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-champagne" />
          {routePerspective}
        </span>
        <span className="text-[10px] text-text-muted">Interactive spatial preview</span>
      </div>
    </div>
  );
};
