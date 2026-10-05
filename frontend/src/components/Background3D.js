import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Floating Globe with latitude/longitude lines ---
const FloatingGlobe = () => {
  const globeRef = useRef();

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Solid inner sphere */}
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#667eea"
          emissive="#667eea"
          emissiveIntensity={0.7}
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>
      {/* Wireframe longitude/latitude shell */}
      <mesh>
        <sphereGeometry args={[0.88, 20, 20]} />
        <meshStandardMaterial
          color="#764ba2"
          wireframe
          transparent
          opacity={0.7}
          emissive="#764ba2"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Glow ring equator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.012, 16, 80]} />
        <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={2.0} />
      </mesh>
    </group>
  );
};

// --- Orbiting Shield Token ---
const ShieldToken = ({ orbitRadius, orbitSpeed, orbitPhase, tiltX, tiltZ, color }) => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * orbitSpeed + orbitPhase;
      ref.current.position.x = Math.cos(t) * orbitRadius;
      ref.current.position.z = Math.sin(t) * orbitRadius;
      ref.current.position.y = Math.sin(t * 1.5) * 0.3;
      ref.current.rotation.y = t;
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.18);
    s.lineTo(0.14, 0.12);
    s.lineTo(0.14, -0.02);
    s.quadraticCurveTo(0.14, -0.16, 0, -0.22);
    s.quadraticCurveTo(-0.14, -0.16, -0.14, -0.02);
    s.lineTo(-0.14, 0.12);
    s.lineTo(0, 0.18);
    return s;
  }, []);

  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <mesh ref={ref}>
        <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
};

// --- Pulsing Wave Field (flat ripple underneath the globe) ---
const WaveField = () => {
  const meshRef = useRef();
  const geoRef = useRef();
  const originalPositions = useRef(null);

  useEffect(() => {
    if (geoRef.current) {
      originalPositions.current = geoRef.current.attributes.position.array.slice();
    }
  }, []);

  useFrame((state) => {
    if (geoRef.current && originalPositions.current) {
      const positions = geoRef.current.attributes.position.array;
      const orig = originalPositions.current;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < positions.length; i += 3) {
        const x = orig[i];
        const z = orig[i + 2];
        const dist = Math.sqrt(x * x + z * z);
        positions[i + 1] = Math.sin(dist * 3 - time * 2.5) * 0.08;
      }
      geoRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1.6, 0]} rotation={[0, 0, 0]}>
      <planeGeometry ref={geoRef} args={[6, 6, 40, 40]} />
      <meshStandardMaterial
        color="#667eea"
        emissive="#667eea"
        emissiveIntensity={0.8}
        wireframe
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// --- Floating Data Points (small cubes orbiting randomly) ---
const DataPoints = () => {
  const groupRef = useRef();
  const points = useMemo(() => {
    const list = [];
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.4 + Math.random() * 0.8;
      list.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) - 0.3,
          r * Math.cos(phi)
        ],
        speed: 0.3 + Math.random() * 0.7,
        size: 0.02 + Math.random() * 0.025,
        color: i % 3 === 0 ? '#667eea' : i % 3 === 1 ? '#764ba2' : '#2ecc71'
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- Main Scene: cursor + scroll driven 360° rotation ---
const SceneContent = ({ scrollProgress, mouseRef }) => {
  const mainRef = useRef();

  useFrame(() => {
    if (mainRef.current && mouseRef.current) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cursorRotY = mx * Math.PI;
      const cursorRotX = -my * Math.PI * 0.5;

      const scrollRotY = scrollProgress * Math.PI * 2;
      const scrollRotX = scrollProgress * 0.5;

      const targetY = cursorRotY + scrollRotY;
      const targetX = cursorRotX + scrollRotX;

      mainRef.current.rotation.y = THREE.MathUtils.lerp(mainRef.current.rotation.y, targetY, 0.06);
      mainRef.current.rotation.x = THREE.MathUtils.lerp(mainRef.current.rotation.x, targetX, 0.06);
    }
  });

  return (
    <group ref={mainRef}>
      {/* Lighting */}
      <ambientLight intensity={1.2} />
      <pointLight position={[8, 8, 8]} intensity={3.0} color="#ffffff" />
      <pointLight position={[-6, -4, -6]} intensity={1.5} color="#667eea" />
      <pointLight position={[4, -3, 6]} intensity={1.8} color="#764ba2" />
      <pointLight position={[0, 5, 0]} intensity={1.0} color="#2ecc71" />

      {/* Central Globe */}
      <FloatingGlobe />

      {/* Orbiting Shields */}
      <ShieldToken orbitRadius={1.6} orbitSpeed={0.45} orbitPhase={0} tiltX={0.3} tiltZ={0} color="#667eea" />
      <ShieldToken orbitRadius={1.7} orbitSpeed={0.35} orbitPhase={2.1} tiltX={-0.2} tiltZ={0.4} color="#764ba2" />
      <ShieldToken orbitRadius={1.5} orbitSpeed={0.55} orbitPhase={4.2} tiltX={0.15} tiltZ={-0.3} color="#2ecc71" />

      <WaveField />
      <DataPoints />

      <Sparkles count={90} scale={10} size={2.0} speed={0.35} noise={0.5} color="#667eea" />
      <Sparkles count={70} scale={10} size={1.8} speed={0.3} noise={0.7} color="#764ba2" />
    </group>
  );
};

const Background3D = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0.3, 4.5], fov: 55 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent scrollProgress={scrollProgress} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default Background3D;
