import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.getElementById('f77-viewer');
const canvas = document.getElementById('f77-canvas');

if (root && canvas) {
  const status = document.getElementById('f77-viewer-status');
  const autoButton = document.getElementById('f77-auto');
  const resetButton = document.getElementById('f77-reset');
  const trimReadout = document.getElementById('f77-trim-readout');
  const environmentReadout = document.getElementById('f77-environment-readout');
  const environmentButtons = document.querySelectorAll('[data-environment]');
  const idleButton = document.getElementById('f77-idle');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const performanceProfile = window.__uvPerformance || {};
  const lowPower = performanceProfile.lowEnd || window.matchMedia?.('(max-width: 700px), (pointer: coarse)').matches || false;
  const liteMode = performanceProfile.tier === 'lite';
  const renderScale = liteMode ? 0.8 : 1;
  const shadowEnabled = !lowPower && !liteMode;
  const environmentPresets = {
    studio: { label: 'STUDIO LIGHTING', background: 0x090612, fog: 0x08050d, envIntensity: 0.78, key: 4.4, fill: 2.1, rim: 4.6, accent: 0xa855f7 },
    twilight: { label: 'TWILIGHT RUN', background: 0x100713, fog: 0x12081a, envIntensity: 0.58, key: 3.2, fill: 3.8, rim: 7.2, accent: 0xef4b4b },
    track: { label: 'TRACK LIGHTING', background: 0x05080d, fog: 0x05080d, envIntensity: 0.92, key: 5.4, fill: 1.2, rim: 3.8, accent: 0x45a6ff }
  };

  const paintMap = {
    'TURBO RED': '#c0392b',
    'AFTERBURNER YELLOW': '#e8b800',
    'PLASMA RED': '#a93226',
    'STELLAR WHITE': '#d8d8d8',
    'SUPERSONIC SILVER': '#c0c8d0',
    'LIGHTNING BLUE': '#4a90d9',
    'STEALTH GREY': '#7b8b99',
    'ASTEROID GREY': '#5a5a5a',
    'COSMIC BLACK': '#1a1a1a'
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !lowPower && !liteMode,
      powerPreference: lowPower || liteMode ? 'low-power' : 'high-performance'
    });
  } catch (error) {
    root.classList.add('is-unsupported');
    if (status) status.textContent = '3D UNAVAILABLE // IMAGE FALLBACK ACTIVE';
    console.warn('[F77 viewer] WebGL is unavailable; keeping the image fallback.', error);
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.1 : (liteMode ? 1.25 : 1.75)));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = shadowEnabled;
    renderer.shadowMap.type = shadowEnabled ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08050d, 0.055);
    scene.background = new THREE.Color(0x090612);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment(renderer);
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;
    roomEnvironment.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const defaultCamera = new THREE.Vector3(4.8, 2.6, 5.6);
    camera.position.copy(defaultCamera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 3.4;
    controls.maxDistance = 8.5;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 1.4;

    const ambient = new THREE.HemisphereLight(0xd9c4ff, 0x08050d, 1.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
    keyLight.position.set(4, 6, 6);
    keyLight.castShadow = shadowEnabled;
    const shadowMapSize = shadowEnabled ? 1024 : 256;
    keyLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 18;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xa855f7, 2.1, 9, 2);
    fillLight.position.set(-3, 2.2, 3.2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xef4b4b, 4.6, 8, 2);
    rimLight.position.set(2.4, 1.4, -3.4);
    scene.add(rimLight);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 0.08, 64),
      new THREE.MeshStandardMaterial({ color: 0x10091a, metalness: 0.85, roughness: 0.3 })
    );
    platform.position.y = 0.04;
    platform.receiveShadow = shadowEnabled;
    scene.add(platform);

    const platformRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.72 })
    );
    platformRing.rotation.x = Math.PI / 2;
    platformRing.position.y = 0.095;
    scene.add(platformRing);

    const grid = new THREE.GridHelper(8, 24, 0x6e32a5, 0x251536);
    grid.position.y = 0.1;
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    scene.add(grid);

    const bike = new THREE.Group();
    bike.position.y = 0.12;
    scene.add(bike);
    const baseBikeY = bike.position.y;
    let idleMotion = !reducedMotion && !lowPower && !liteMode;
    if (idleButton && lowPower) {
      idleButton.classList.remove('on');
      idleButton.setAttribute('aria-pressed', 'false');
      idleButton.querySelector('.f77-control-state').textContent = 'OFF';
    }

    const paintMaterials = [];
    const glowMaterials = [];
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x0b0b10, metalness: 0.84, roughness: 0.24 });
    const carbonMaterial = new THREE.MeshStandardMaterial({ color: 0x17121d, metalness: 0.62, roughness: 0.38 });
    const silverMaterial = new THREE.MeshStandardMaterial({ color: 0x8990a0, metalness: 0.92, roughness: 0.22 });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x050509, metalness: 0.16, roughness: 0.88 });

    function makePaintMaterial(hex = paintMap['TURBO RED']) {
      const material = new THREE.MeshStandardMaterial({
        color: hex,
        metalness: 0.65,
        roughness: 0.23,
        emissive: new THREE.Color(hex).multiplyScalar(0.08)
      });
      paintMaterials.push(material);
      return material;
    }

    function makeGlowMaterial(hex = 0xa855f7) {
      const material = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.92 });
      glowMaterials.push(material);
      return material;
    }

    const paintMaterial = makePaintMaterial();
    const glowMaterial = makeGlowMaterial();

    function mesh(geometry, material, position, scale, rotation) {
      const item = new THREE.Mesh(geometry, material);
      if (position) item.position.set(...position);
      if (scale) item.scale.set(...scale);
      if (rotation) item.rotation.set(...rotation);
      item.castShadow = true;
      item.receiveShadow = true;
      bike.add(item);
      return item;
    }

    function cylinderBetween(start, end, radius, material, segments = 16) {
      const a = new THREE.Vector3(...start);
      const b = new THREE.Vector3(...end);
      const direction = new THREE.Vector3().subVectors(b, a);
      const item = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material);
      item.position.copy(a).add(b).multiplyScalar(0.5);
      item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      item.castShadow = true;
      item.receiveShadow = true;
      bike.add(item);
      return item;
    }

    function addWheel(x) {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.73, 0);
      wheel.rotation.y = Math.PI / 2;
      bike.add(wheel);

      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.13, 24, 64), tireMaterial);
      wheel.add(tire);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.042, 12, 48), silverMaterial);
      wheel.add(rim);

      const brake = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.39, 0.032, 40),
        new THREE.MeshStandardMaterial({ color: 0x343241, metalness: 0.9, roughness: 0.24 })
      );
      brake.rotation.z = Math.PI / 2;
      brake.position.x = 0.035;
      wheel.add(brake);

      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.38, 8), silverMaterial);
        spoke.position.set(0, Math.sin(angle) * 0.2, Math.cos(angle) * 0.2);
        spoke.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, Math.sin(angle), Math.cos(angle)).normalize()
        );
        wheel.add(spoke);
      }
    }

    addWheel(-1.38);
    addWheel(1.38);

    // Main battery shell and sculpted fairing silhouette.
    mesh(new THREE.BoxGeometry(2.35, 0.48, 0.9), carbonMaterial, [-0.1, 1.08, 0], [1, 1, 1], [0, 0, -0.04]);
    mesh(new THREE.SphereGeometry(1, 32, 20), paintMaterial, [0.18, 1.37, 0], [1.18, 0.48, 0.58], [0, 0, -0.08]);
    mesh(new THREE.SphereGeometry(1, 32, 20), paintMaterial, [1.18, 1.42, 0], [0.82, 0.42, 0.46], [0, 0, -0.18]);
    mesh(new THREE.SphereGeometry(1, 24, 16), paintMaterial, [-1.18, 1.35, 0], [0.82, 0.33, 0.46], [0, 0, 0.14]);
    mesh(new THREE.BoxGeometry(1.05, 0.18, 0.68), darkMaterial, [-0.52, 1.72, 0], [1, 1, 1], [0, 0, -0.05]);
    mesh(new THREE.BoxGeometry(0.88, 0.16, 0.58), carbonMaterial, [-1.13, 1.68, 0], [1, 1, 1], [0, 0, 0.12]);

    // Trellis frame, swingarm, and suspension.
    cylinderBetween([-0.98, 0.86, -0.34], [0.45, 1.42, -0.34], 0.045, silverMaterial);
    cylinderBetween([-0.98, 0.86, 0.34], [0.45, 1.42, 0.34], 0.045, silverMaterial);
    cylinderBetween([-0.98, 0.86, -0.34], [-0.98, 0.86, 0.34], 0.045, silverMaterial);
    cylinderBetween([-1.32, 0.83, 0], [0.35, 0.86, 0], 0.075, carbonMaterial);
    cylinderBetween([0.78, 0.86, -0.17], [1.42, 0.79, -0.17], 0.045, silverMaterial);
    cylinderBetween([0.78, 0.86, 0.17], [1.42, 0.79, 0.17], 0.045, silverMaterial);
    cylinderBetween([1.05, 0.83, -0.2], [1.45, 1.58, -0.2], 0.045, silverMaterial);
    cylinderBetween([1.05, 0.83, 0.2], [1.45, 1.58, 0.2], 0.045, silverMaterial);

    // Cockpit, headlight, and signature energy strip.
    mesh(new THREE.BoxGeometry(0.34, 0.24, 0.55), darkMaterial, [1.37, 1.82, 0], [1, 1, 1], [0, 0, -0.18]);
    mesh(new THREE.SphereGeometry(0.16, 24, 16), makeGlowMaterial(0xd9c4ff), [1.55, 1.72, 0], [1, 0.62, 1.3]);
    mesh(new THREE.BoxGeometry(1.2, 0.028, 0.025), glowMaterial, [0.25, 1.48, 0.52], [1, 1, 1], [0, 0, -0.04]);
    mesh(new THREE.BoxGeometry(0.72, 0.028, 0.025), glowMaterial, [-0.78, 1.48, 0.52], [1, 1, 1], [0, 0, 0.05]);
    cylinderBetween([1.2, 1.88, -0.42], [1.2, 1.88, 0.42], 0.028, darkMaterial);
    cylinderBetween([1.2, 1.9, -0.42], [1.48, 1.9, -0.42], 0.024, silverMaterial);
    cylinderBetween([1.2, 1.9, 0.42], [1.48, 1.9, 0.42], 0.024, silverMaterial);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.9, 64),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.08, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1.25, 0.42, 1);
    shadow.position.set(0, 0.11, 0);
    scene.add(shadow);

    function setEnvironment(name = 'studio') {
      const preset = environmentPresets[name] || environmentPresets.studio;
      scene.background.setHex(preset.background);
      scene.fog.color.setHex(preset.fog);
      ambient.intensity = 1.05 + preset.envIntensity * 0.45;
      keyLight.intensity = preset.key;
      fillLight.intensity = preset.fill;
      rimLight.intensity = preset.rim;
      fillLight.color.setHex(preset.accent);
      rimLight.color.setHex(preset.accent);
      if (environmentReadout) environmentReadout.textContent = preset.label;
      environmentButtons.forEach((button) => {
        const active = button.dataset.environment === name;
        button.classList.toggle('on', active);
        button.setAttribute('aria-pressed', String(active));
      });
      root.dataset.environment = name;
    }

    environmentButtons.forEach((button) => {
      button.addEventListener('click', () => setEnvironment(button.dataset.environment));
    });

    idleButton?.addEventListener('click', () => {
      idleMotion = !idleMotion;
      idleButton.classList.toggle('on', idleMotion);
      idleButton.setAttribute('aria-pressed', String(idleMotion));
      const state = idleButton.querySelector('.f77-control-state');
      if (state) state.textContent = idleMotion ? 'ON' : 'OFF';
    });

    setEnvironment('studio');

    function resize() {
      const width = Math.max(root.clientWidth, 320);
      const height = Math.max(root.clientHeight, 420);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.1 : (liteMode ? 1.25 : 1.75)) * renderScale;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function resetView() {
      camera.position.copy(defaultCamera);
      controls.target.set(0, 1.02, 0);
      controls.update();
    }

    function setPaint(name, fallbackColor) {
      const key = (typeof name === 'string' ? name : '').toUpperCase();
      const safeFallback = typeof fallbackColor === 'string' && /^#[0-9a-f]{6}$/i.test(fallbackColor)
        ? fallbackColor
        : paintMap['TURBO RED'];
      const color = paintMap[key] || safeFallback;
      paintMaterials.forEach((material) => {
        material.color.set(color);
        material.emissive.set(color).multiplyScalar(0.08);
      });
      root.style.setProperty('--viewer-paint', color);
      if (status) status.textContent = `SURFACE ONLINE // ${key || 'TURBO RED'}`;
    }

    function setTrim(trim) {
      if (trimReadout) trimReadout.textContent = trim === 'base' ? 'MACH 2 BASE' : 'MACH 2 RECON';
    }

    window.addEventListener('f77:paint', (event) => {
      setPaint(event.detail?.name, event.detail?.color);
    });

    window.addEventListener('f77:trim', (event) => {
      setTrim(event.detail?.trim);
    });

    const initialSwatch = document.querySelector('.sw-dot.on');
    setPaint(initialSwatch?.dataset.clr, initialSwatch?.style.backgroundColor);
    setTrim(document.querySelector('.trim-btn.on')?.dataset.trim || 'recon');

    autoButton?.addEventListener('click', () => {
      controls.autoRotate = !controls.autoRotate;
      autoButton.classList.toggle('on', controls.autoRotate);
      autoButton.setAttribute('aria-pressed', String(controls.autoRotate));
      const state = autoButton.querySelector('.f77-control-state');
      if (state) state.textContent = controls.autoRotate ? 'ON' : 'OFF';
    });

    resetButton?.addEventListener('click', resetView);
    root.classList.remove('is-unsupported');
    root.classList.add('is-ready');
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const animationClock = new THREE.Clock();
    let isVisible = true;
    let rafId = null;
    let lastRenderTime = 0;

    function requestRender() {
      if (!rafId && isVisible && !document.hidden) rafId = requestAnimationFrame(animate);
    }

    function animate(now = performance.now()) {
      rafId = null;
      if (!isVisible || document.hidden) return;
      if ((lowPower || liteMode) && now - lastRenderTime < 48) {
        requestRender();
        return;
      }
      lastRenderTime = now;
      const elapsed = animationClock.getElapsedTime();
      if (idleMotion) {
        bike.position.y = baseBikeY + Math.sin(elapsed * 1.7) * 0.028;
        platformRing.rotation.z = elapsed * 0.06;
        shadow.material.opacity = 0.075 + Math.sin(elapsed * 1.7) * 0.012;
      } else {
        bike.position.y = baseBikeY;
        shadow.material.opacity = 0.08;
      }
      controls.update();
      renderer.render(scene, camera);
      requestRender();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) requestRender();
      }, { threshold: 0.01 }).observe(root);
    }
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible) requestRender();
    });
    requestRender();
  }
}
