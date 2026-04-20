// Build trigger refresh - 3D SkinCellBlob component
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";

function Blob({ mouse, down, segments = 192 }: { mouse: React.MutableRefObject<{ x: number; y: number; vx: number; vy: number }>; down: React.MutableRefObject<boolean>; segments?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Strong cursor tracking — rotation follows mouse aggressively
    const targetRotX = mouse.current.y * 1.2;
    const targetRotY = mouse.current.x * 1.6;
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.12;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.12;

    // Subtle parallax position shift toward cursor (reduced to prevent clipping)
    const targetPosX = mouse.current.x * 0.25;
    const targetPosY = mouse.current.y * 0.18 + Math.sin(t * 0.8) * 0.04;
    groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.06;
    groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.06;

    // Scale pulse on click + breathing (reduced to fit container)
    const breath = 1 + Math.sin(t * 1.2) * 0.015;
    const targetScale = (down.current ? 1.06 : 1) * breath;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    if (matRef.current) {
      // Distortion reacts to cursor velocity (shake-when-moving effect done right)
      const vel = Math.min(
        Math.sqrt(mouse.current.vx ** 2 + mouse.current.vy ** 2) * 6,
        0.5
      );
      const baseDistort = 0.35 + Math.sin(t * 0.9) * 0.06;
      matRef.current.distort += (baseDistort + vel - matRef.current.distort) * 0.15;
      matRef.current.speed = 1.4 + vel * 4;

      // Hue shift based on cursor X
      const hue = 0.5 + mouse.current.x * 0.1;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      matRef.current.color.lerp(color, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere ref={meshRef} args={[1.4, segments, segments]}>
        <MeshDistortMaterial
          ref={matRef}
          color={"#00e5ff"}
          attach="material"
          distort={0.4}
          speed={1.6}
          roughness={0.08}
          metalness={0.9}
          envMapIntensity={1.6}
          iridescence={1}
          iridescenceIOR={1.6}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </Sphere>
    </group>
  );
}

function Particles({ mouse, count = 600 }: { mouse: React.MutableRefObject<{ x: number; y: number; vx: number; vy: number }>; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.05 + mouse.current.x * 0.4;
    ref.current.rotation.x = mouse.current.y * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#7af0ff" transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

export function SkinCellBlob() {
  const mouse = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const down = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [enabled, setEnabled] = useState(true);

  // Only fully disable for very weak devices (≤2GB RAM) — keep 3D on normal phones
  useEffect(() => {
    const dm = (navigator as any).deviceMemory;
    const cores = (navigator as any).hardwareConcurrency || 4;
    if ((dm && dm <= 2) || cores <= 2) setEnabled(false);
  }, []);

  // Pointer + touch listener — works on mouse, touch, and pen
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let rafId = 0;
    let pendingX: number | null = null;
    let pendingY: number | null = null;

    const flush = () => {
      rafId = 0;
      if (pendingX === null || pendingY === null) return;
      mouse.current.vx = pendingX - lastX;
      mouse.current.vy = pendingY - lastY;
      mouse.current.x = pendingX;
      mouse.current.y = pendingY;
      lastX = pendingX;
      lastY = pendingY;
      pendingX = pendingY = null;
    };

    const updateFromPoint = (clientX: number, clientY: number) => {
      pendingX = (clientX / window.innerWidth) * 2 - 1;
      pendingY = -((clientY / window.innerHeight) * 2 - 1);
      if (!rafId) rafId = requestAnimationFrame(flush);
    };

    const handlePointerMove = (e: PointerEvent) => updateFromPoint(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) updateFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleDown = (e: PointerEvent | TouchEvent) => {
      down.current = true;
      if ("touches" in e && e.touches.length > 0) {
        updateFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      } else if ("clientX" in e) {
        updateFromPoint(e.clientX, e.clientY);
      }
    };
    const handleUp = () => (down.current = false);

    const decay = setInterval(() => {
      mouse.current.vx *= 0.85;
      mouse.current.vy *= 0.85;
    }, 32);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("pointerdown", handleDown as EventListener, { passive: true });
    window.addEventListener("touchstart", handleDown as EventListener, { passive: true });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerdown", handleDown as EventListener);
      window.removeEventListener("touchstart", handleDown as EventListener);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("touchend", handleUp);
      clearInterval(decay);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full rounded-full bg-gradient-to-br from-cyan/30 via-violet/20 to-bio/30 blur-2xl animate-pulse"
        aria-hidden
      />
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={isMobile ? [1, 1.25] : [1, 2]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
          stencil: false,
          depth: true,
        }}
        frameloop="always"
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 3, 5]} intensity={1.3} color="#00ffa3" />
        <directionalLight position={[-3, -2, 2]} intensity={1.1} color="#00e5ff" />
        {!isMobile && <pointLight position={[0, 0, 3]} intensity={0.9} color="#a78bfa" />}
        <Blob mouse={mouse} down={down} segments={isMobile ? 48 : 192} />
        {!isMobile && <Particles mouse={mouse} count={600} />}
        {!isMobile && <Environment preset="night" />}
      </Canvas>
    </div>
  );
}
