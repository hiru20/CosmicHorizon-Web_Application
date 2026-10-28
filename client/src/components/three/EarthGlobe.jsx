import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const DAY_TEXTURE = '/textures/earth-blue-marble.jpg';
const NIGHT_TEXTURE = '/textures/earth-night-lights.jpg';
const ISS_ALTITUDE = 0.1; // exaggerated orbit radius above the unit sphere so the point reads
const ISS_INCLINATION = THREE.MathUtils.degToRad(51.6);
const SIGNAL = 0xff5a1f;

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
};

// Matches three.js SphereGeometry UV layout for an equirectangular texture
const latLngToVector3 = (lat, lng, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

/** Static image shown when WebGL is unavailable */
const GlobeFallback = ({ className, colorful }) => (
  <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
    <img
      src={colorful ? DAY_TEXTURE : NIGHT_TEXTURE}
      alt=""
      className="w-[78%] aspect-square rounded-full object-cover object-[35%_50%] opacity-90 [mask-image:radial-gradient(circle,black_68%,transparent_70%)]"
    />
  </div>
);

/**
 * Matte, dark Three.js Earth with city lights on the night side.
 * - `issPosition` ({ latitude, longitude }): pins the ISS point at real coordinates (Tracker view)
 * - without `issPosition`: the ISS point travels a 51.6° inclined hairline orbit (Home hero)
 * - `trajectory`: [lat, lng] pairs drawn as a fading signal-orange trail
 * Drag to rotate. Rendering pauses off-screen; every GL resource is disposed on unmount.
 */
const EarthGlobe = ({
  issPosition = null,
  trajectory = [],
  tone = 'matte', // 'matte' (dark, night-side city lights) | 'color' (sunlit, full colour, blue atmosphere)
  className = '',
  label = 'Interactive 3D Earth showing the International Space Station',
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [supported] = useState(hasWebGL);
  const followIss = !!issPosition;
  const colorful = tone === 'color';

  useEffect(() => {
    if (!supported || !mountRef.current) return undefined;
    const mount = mountRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.25, 3.9);

    const disposables = [];
    const track = (obj) => {
      disposables.push(obj);
      return obj;
    };

    const globe = new THREE.Group();
    globe.rotation.z = THREE.MathUtils.degToRad(-23.4);
    scene.add(globe);

    const loader = new THREE.TextureLoader();
    const dayMap = track(loader.load(DAY_TEXTURE));
    const nightMap = track(loader.load(NIGHT_TEXTURE));
    [dayMap, nightMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    });

    // Matte: sun from behind-left, so the visible face sits in night and shows city lights.
    // Colour: sun from front-left, so the visible face is sunlit with a night edge on the right.
    const sunDir = colorful
      ? new THREE.Vector3(-0.65, 0.3, 0.7).normalize()
      : new THREE.Vector3(-1, 0.25, -0.55).normalize();

    const earthMaterial = track(
      new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: dayMap },
          nightMap: { value: nightMap },
          sunDir: { value: sunDir },
          colorful: { value: colorful ? 1.0 : 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vUv = uv;
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vViewDir = normalize(cameraPosition - worldPos.xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }`,
        fragmentShader: `
          uniform sampler2D dayMap;
          uniform sampler2D nightMap;
          uniform vec3 sunDir;
          uniform float colorful;
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vec3 n = normalize(vNormalW);
            float d = dot(n, sunDir);
            float rim = pow(1.0 - max(dot(n, vViewDir), 0.0), 4.0);

            vec3 day = texture2D(dayMap, vUv).rgb;
            vec3 lights = texture2D(nightMap, vUv).rgb;
            float li = pow(dot(lights, vec3(0.333)), 1.6);
            vec3 color;

            if (colorful > 0.5) {
              // Full colour: lit oceans and continents, a little extra saturation
              float g = dot(day, vec3(0.299, 0.587, 0.114));
              vec3 vivid = mix(vec3(g), day, 1.25);
              vec3 lit = vivid * (0.18 + 1.15 * max(d, 0.0));
              // Specular glint on the oceans (dark, blue-dominant texels)
              float ocean = 1.0 - smoothstep(0.0, 0.05, day.r - day.b * 0.6);
              vec3 halfV = normalize(sunDir + vViewDir);
              lit += vec3(0.6, 0.75, 1.0) * pow(max(dot(n, halfV), 0.0), 40.0) * ocean * 0.5;
              vec3 night = vec3(1.0, 0.72, 0.45) * li * 1.6 + vec3(0.01, 0.015, 0.03);
              color = mix(night, lit, smoothstep(-0.2, 0.25, d));
              // Blue atmospheric scattering at the limb, brighter on the day side
              color += vec3(0.3, 0.6, 1.0) * rim * (0.35 + 0.65 * smoothstep(-0.3, 0.5, d));
            } else {
              float g = dot(day, vec3(0.299, 0.587, 0.114));
              vec3 matte = mix(vec3(g), day, 0.25) * (0.08 + 0.5 * max(d, 0.0));
              vec3 night = vec3(1.0, 0.62, 0.38) * li * 1.35 + vec3(0.006, 0.008, 0.012);
              color = mix(night, matte, smoothstep(-0.12, 0.3, d));
              // hairline limb: a faint cold rim, not a glow
              color += vec3(0.55, 0.6, 0.66) * rim * 0.12;
            }
            gl_FragColor = vec4(color, 1.0);
            #include <colorspace_fragment>
          }`,
      })
    );
    const earthGeometry = track(new THREE.SphereGeometry(1, 96, 96));
    globe.add(new THREE.Mesh(earthGeometry, earthMaterial));

    // Colour mode: soft blue atmosphere shell just outside the surface
    if (colorful) {
      const atmosphereGeometry = track(new THREE.SphereGeometry(1.08, 64, 64));
      const atmosphereMaterial = track(
        new THREE.ShaderMaterial({
          uniforms: { sunDir: { value: sunDir } },
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexShader: `
            varying vec3 vNormalW;
            varying vec3 vNormalV;
            void main() {
              vNormalW = normalize(mat3(modelMatrix) * normal);
              vNormalV = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: `
            uniform vec3 sunDir;
            varying vec3 vNormalW;
            varying vec3 vNormalV;
            void main() {
              float intensity = pow(0.62 - dot(vNormalV, vec3(0.0, 0.0, 1.0)), 3.0);
              float sunSide = 0.35 + 0.65 * smoothstep(-0.4, 0.6, dot(normalize(vNormalW), sunDir));
              gl_FragColor = vec4(0.32, 0.62, 1.0, 1.0) * intensity * sunSide;
            }`,
        })
      );
      scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
    }

    // ISS point: small signal-orange square-ish dot with a faint ring
    const marker = new THREE.Group();
    const coreGeometry = track(new THREE.SphereGeometry(0.014, 12, 12));
    const coreMaterial = track(new THREE.MeshBasicMaterial({ color: SIGNAL }));
    marker.add(new THREE.Mesh(coreGeometry, coreMaterial));
    const pingGeometry = track(new THREE.RingGeometry(0.03, 0.034, 40));
    const pingMaterial = track(new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
    const ping = new THREE.Mesh(pingGeometry, pingMaterial);
    marker.add(ping);

    // Home hero: hairline inclined orbit
    const orbitPivot = new THREE.Group();
    orbitPivot.rotation.x = ISS_INCLINATION;
    let orbitLine = null;
    if (!followIss) {
      const pts = [];
      for (let i = 0; i <= 256; i += 1) {
        const a = (i / 256) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * (1 + ISS_ALTITUDE), 0, Math.sin(a) * (1 + ISS_ALTITUDE)));
      }
      const orbitGeometry = track(new THREE.BufferGeometry().setFromPoints(pts));
      const orbitMaterial = track(new THREE.LineBasicMaterial({ color: 0xededed, transparent: true, opacity: 0.22 }));
      orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      orbitPivot.add(orbitLine);
      orbitPivot.add(marker);
      scene.add(orbitPivot);
    } else {
      globe.add(marker);
    }

    // Real trajectory trail (Tracker 3D): vertex colours fade older points to black
    const trailGeometry = track(new THREE.BufferGeometry());
    const trailMaterial = track(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 }));
    globe.add(new THREE.Line(trailGeometry, trailMaterial));

    sceneRef.current = { marker, trailGeometry };

    // Drag to rotate
    const drag = { active: false, x: 0, y: 0, vx: 0 };
    const onPointerDown = (e) => {
      drag.active = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onPointerMove = (e) => {
      if (!drag.active) return;
      drag.vx = (e.clientX - drag.x) * 0.005;
      globe.rotation.y += drag.vx;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + (e.clientY - drag.y) * 0.004, -0.6, 0.6);
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onPointerUp = () => {
      drag.active = false;
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let visible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(mount);

    const clock = new THREE.Clock();
    let frameId = 0;
    const animateFrame = () => {
      frameId = requestAnimationFrame(animateFrame);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!reduceMotion) {
        if (!drag.active) {
          drag.vx *= 0.92;
          globe.rotation.y += drag.vx + dt * 0.035;
        }
        if (orbitLine) {
          const angle = t * 0.22;
          marker.position.set(Math.cos(angle) * (1 + ISS_ALTITUDE), 0, Math.sin(angle) * (1 + ISS_ALTITUDE));
        }
        const p = (t % 2) / 2;
        ping.scale.setScalar(1 + p * 1.6);
        pingMaterial.opacity = 0.6 * (1 - p);
      } else if (orbitLine) {
        marker.position.set(0, 0, 1 + ISS_ALTITUDE);
      }
      ping.lookAt(camera.position);

      renderer.render(scene, camera);
    };
    animateFrame();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, [supported, followIss, colorful]);

  // Update ISS point and trail from real telemetry without rebuilding the scene
  useEffect(() => {
    const s = sceneRef.current;
    if (!s || !issPosition || typeof issPosition.latitude !== 'number') return;
    s.marker.position.copy(latLngToVector3(issPosition.latitude, issPosition.longitude, 1 + ISS_ALTITUDE));

    const points = (trajectory || []).filter((p) => Array.isArray(p) && p.length === 2);
    if (points.length > 1) {
      const positions = new Float32Array(points.length * 3);
      const colors = new Float32Array(points.length * 3);
      points.forEach(([lat, lng], i) => {
        const v = latLngToVector3(lat, lng, 1 + ISS_ALTITUDE);
        positions.set([v.x, v.y, v.z], i * 3);
        const fade = Math.pow((i + 1) / points.length, 1.5);
        colors.set([1.0 * fade, 0.353 * fade, 0.122 * fade], i * 3);
      });
      s.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      s.trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      s.trailGeometry.computeBoundingSphere();
    }
  }, [issPosition, trajectory]);

  if (!supported) return <GlobeFallback className={className} colorful={colorful} />;

  return <div ref={mountRef} className={`relative cursor-grab active:cursor-grabbing ${className}`} role="img" aria-label={label} />;
};

export default EarthGlobe;
