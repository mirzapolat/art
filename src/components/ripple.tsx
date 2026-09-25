import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { wave } from "@/lib/stage";

/** How long one ripple stays on screen, in seconds (see the envelope below). */
const WAVE_SECONDS = 2.3;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// A single ring travels outward from the centre of the screen (where the
// card sits), bending the scene behind it, then fades out.
const fragmentShader = /* glsl */ `
  uniform sampler2D tScene;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  void main() {
    vec2 d = vUv - 0.5;
    d.x *= uAspect;
    float dist = length(d);

    float band = dist - uTime * 0.75;
    float envelope = exp(-band * band * 22.0)
      * smoothstep(0.0, 0.25, uTime)
      * (1.0 - smoothstep(1.0, 2.2, uTime));
    float ripple = sin(band * 34.0) * envelope;

    vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
    dir.x /= uAspect;
    vec4 color = texture2D(tScene, vUv + dir * ripple * 0.022);

    // Faint light/dark banding so the wave also reads over empty paper.
    float shade = ripple * 0.06;
    color.rgb = mix(color.rgb, shade > 0.0 ? vec3(1.0) : vec3(0.0), abs(shade));
    gl_FragColor = color;
    #include <colorspace_fragment>
  }
`;

/**
 * Takes over rendering (priority 1). Between ripples the scene is drawn
 * straight to the screen; only while a ripple is on screen is it drawn into
 * an offscreen target and composited through the distortion shader.
 */
export default function Ripple() {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const pass = useRef<{
    target: THREE.WebGLRenderTarget;
    scene: THREE.Scene;
    camera: THREE.Camera;
    material: THREE.ShaderMaterial;
  } | null>(null);

  useEffect(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const material = new THREE.ShaderMaterial({
      uniforms: { tScene: { value: target.texture }, uTime: { value: 0 }, uAspect: { value: 1 } },
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(quad);
    pass.current = { target, scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), material };
    return () => {
      pass.current = null;
      target.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    pass.current?.target.setSize(Math.round(size.width * dpr), Math.round(size.height * dpr));
  }, [size, dpr]);

  useFrame(({ gl, scene, camera, size }) => {
    const p = pass.current;
    const t = performance.now() / 1000 - wave.start;
    if (!p || t > WAVE_SECONDS) {
      gl.render(scene, camera);
      return;
    }
    p.material.uniforms.uTime.value = t;
    p.material.uniforms.uAspect.value = size.width / size.height;
    gl.setRenderTarget(p.target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.render(p.scene, p.camera);
  }, 1);

  return null;
}
