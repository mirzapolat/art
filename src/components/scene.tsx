"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "@/lib/stage";
import { palette, type Accent } from "@/lib/palette";
import Ripple from "@/components/ripple";

type SceneProps = { step: number; accent: Accent; calm: boolean };

/**
 * A slow Bauhaus still-life: primary-coloured solids drifting at different
 * depths. The camera leans toward the pointer (parallax) and every shape
 * turns a quarter as the card flips, so the whole room reacts to the deck.
 */
export default function Scene(props: SceneProps) {
  return (
    <Canvas
      className="!fixed inset-0"
      // Capped: above 1.5× the extra pixels cost far more GPU than they add.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 12], fov: 32 }}
      // Flat (no tone mapping) keeps the paper and the primaries exact, and
      // lets the ripple pass composite the scene without a colour shift.
      flat
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[palette.paper]} />
      <fog attach="fog" args={[palette.paper, 18, 42]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 9, 8]} intensity={1.5} />
      <directionalLight position={[-8, -4, 4]} intensity={0.5} color={palette.sun} />
      <Rig {...props} />
      {!props.calm && <Ripple />}
    </Canvas>
  );
}

function Rig({ step, accent, calm }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  // On narrow screens pull the shapes inward, shrink them, and spread them
  // vertically so they frame the card instead of burying it.
  const fit = THREE.MathUtils.clamp(viewport.width / 13, 0.42, 1);
  const size = Math.pow(fit, 0.75);
  const tall = 1 + (1 - fit) * 0.9;

  useFrame((state, dt) => {
    const cam = state.camera;
    const k = calm ? 0.25 : 1;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, pointer.x * 1.4 * k, 2.2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, pointer.y * 0.9 * k, 2.2, dt);
    cam.lookAt(0, 0, 0);
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.08 * k, 2, dt);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.05 * k, 2, dt);
    }
  });

  const s = (x: number) => x * fit;
  const t = (y: number) => y * tall;

  return (
    <group ref={group}>
      <AccentDisc scale={size} accent={accent} position={[s(2.6), t(0.9), -7]} />

      {/* thin construction lines */}
      <Rod position={[0, -0.4, -5]} rotation={[0, 0, 0.42]} length={26} />
      <Rod position={[s(-1.5), t(0), -4]} rotation={[0, 0, Math.PI / 2]} length={20} />

      <Turning scale={size} step={step} speed={0.5} position={[s(-4.6), t(1.9), -2.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.16, 64]} />
          <meshStandardMaterial color={palette.signal} roughness={0.55} />
        </mesh>
      </Turning>

      <Turning scale={size} step={step} speed={-0.7} position={[s(4.4), t(-1.9), -1.8]}>
        <mesh rotation={[0.5, 0.6, 0]}>
          <boxGeometry args={[1.15, 1.15, 1.15]} />
          <meshStandardMaterial color={palette.cobalt} roughness={0.5} />
        </mesh>
      </Turning>

      <Turning scale={size} step={step} speed={0.9} position={[s(4.9), t(2.5), -4]}>
        <mesh rotation={[Math.PI / 2, 0, 0.3]}>
          <cylinderGeometry args={[1.05, 1.05, 0.35, 3]} />
          <meshStandardMaterial color={palette.sun} roughness={0.5} />
        </mesh>
      </Turning>

      <Turning scale={size} step={step} speed={-0.5} position={[s(-5.3), t(-0.9), -1.2]}>
        <mesh rotation={[0, 0, 0.2]}>
          <torusGeometry args={[0.85, 0.09, 24, 64, Math.PI]} />
          <meshStandardMaterial color={palette.ink} roughness={0.6} />
        </mesh>
      </Turning>

      <Turning scale={size} step={step} speed={0.3} position={[s(-1.2), t(3.4), -6]}>
        <mesh>
          <sphereGeometry args={[0.32, 24, 16]} />
          <meshStandardMaterial color={palette.ink} roughness={0.4} />
        </mesh>
      </Turning>

      <Turning scale={size} step={step} speed={-0.4} position={[s(1.4), t(-3.3), -3.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.1, 48]} />
          <meshStandardMaterial color={palette.signal} roughness={0.55} />
        </mesh>
      </Turning>

      <mesh position={[0, 0, -9]} scale={size}>
        <torusGeometry args={[4.6, 0.018, 6, 128]} />
        <meshBasicMaterial color={palette.ink} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/** Floats gently and eases a quarter turn further each time the card flips. */
function Turning({
  step,
  speed,
  position,
  scale,
  children,
}: {
  step: number;
  speed: number;
  position: [number, number, number];
  scale: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  // Each shape bobs on its own phase so the group never moves in unison.
  const phase = position[0] * 1.7 + position[1];
  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 1.1 + phase;
    g.position.y = Math.sin(t) * 0.14;
    g.rotation.x = Math.sin(t * 0.7) * 0.08;
    g.rotation.y += dt * 0.08 * speed;
    const target = step * (Math.PI / 2) * Math.sign(speed);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, target, 1.6, dt);
  });
  return (
    <group position={position} scale={scale}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

function Rod({
  length,
  ...props
}: { length: number } & Pick<React.ComponentProps<"group">, "position" | "rotation">) {
  return (
    <group {...props}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, length, 6]} />
        <meshBasicMaterial color={palette.ink} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

/** Large flat disc behind the card that eases to the current slide's accent. */
function AccentDisc({
  accent,
  position,
  scale,
}: {
  accent: Accent;
  position: [number, number, number];
  scale: number;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    if (!material.current) return;
    target.set(palette[accent]);
    material.current.color.lerp(target, 1 - Math.exp(-2.5 * dt));
  });
  return (
    <mesh position={position} scale={scale}>
      <circleGeometry args={[3.2, 96]} />
      <meshStandardMaterial ref={material} color={palette.signal} roughness={0.9} />
    </mesh>
  );
}
