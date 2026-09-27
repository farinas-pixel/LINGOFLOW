/**
 * LingoFlow Language Solar System
 * Real Three.js renderer with pointer/touch camera controls.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RotateCcw, Search, ZoomIn, ZoomOut, ArrowRight, Wifi, WifiOff, ShieldCheck, Activity } from 'lucide-react';
import { SUPPORTED_LANGUAGES, WORLD_LANGUAGE_UNIVERSE, LanguagePlanetData, searchLanguages, getLanguageByCode } from '../../config/languages.data';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface LanguageSolarSystemProps {
  sourceLanguageCode: string;
  targetLanguageCode: string;
  onSelectSource: (code: string) => void;
  onSelectTarget: (code: string) => void;
  onSwapLanguages?: () => void;
  isTranslating?: boolean;
  className?: string;
  onNavigateToCockpit?: () => void;
  onOpenSemanticMirror?: () => void;
  semanticFidelityScore?: number;
  semanticIntegrityStatus?: 'preserved' | 'nuance_change' | 'meaning_changed' | null;
  meaningLockActive?: boolean;
  lockedTermsCount?: number;
}

type PlanetObject = THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> & { userData: { language: LanguagePlanetData; radius: number; angle: number; isSupported: boolean } };

const ORBIT_RADII = Array.from({ length: 10 }, (_, index) => 150 + index * 48);
const CAMERA_DEFAULT = { x: 0.58, y: 0.24, distance: 760 };

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(255,255,255,.8)');
  g.addColorStop(0.45, 'rgba(255,255,255,.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function LanguageSolarSystem({
  sourceLanguageCode,
  targetLanguageCode,
  onSelectSource,
  onSelectTarget,
  isTranslating = false,
  className,
  onNavigateToCockpit,
  onOpenSemanticMirror,
  semanticFidelityScore = 100,
  semanticIntegrityStatus = 'preserved',
  meaningLockActive = true,
  lockedTermsCount = 0,
}: LanguageSolarSystemProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const planetsRef = useRef<PlanetObject[]>([]);
  const orbitGroupRef = useRef<THREE.Group | null>(null);
  const cameraState = useRef({ ...CAMERA_DEFAULT, dragging: false, lastX: 0, lastY: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'POPULAR' | 'OFFLINE'>('ALL');
  const [hoveredLanguage, setHoveredLanguage] = useState<LanguagePlanetData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<LanguagePlanetData | null>(null);
  const [showSemanticHUD, setShowSemanticHUD] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [metrics, setMetrics] = useState({ fps: 60, frameTimeMs: 16.7, droppedFrames: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const stateRef = useRef({ sourceLanguageCode, targetLanguageCode, isTranslating, matching: new Set<string>() });

  const matchingCodeSet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const universe = activeFilter === 'ALL'
      ? WORLD_LANGUAGE_UNIVERSE
      : searchLanguages('', activeFilter);
    return new Set(universe.filter((language) => !q || language.name.toLowerCase().includes(q) || language.nativeName.toLowerCase().includes(q) || language.code.toLowerCase().includes(q) || language.family.toLowerCase().includes(q)).map((l) => l.code));
  }, [searchQuery, activeFilter]);
  stateRef.current = { sourceLanguageCode, targetLanguageCode, isTranslating, matching: matchingCodeSet };

  const sourceLang = getLanguageByCode(sourceLanguageCode);
  const targetLang = getLanguageByCode(targetLanguageCode);

  const applyCamera = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const s = cameraState.current;
    const d = s.distance;
    camera.position.set(Math.sin(s.y) * Math.cos(s.x) * d, Math.sin(s.x) * d, Math.cos(s.y) * Math.cos(s.x) * d);
    camera.lookAt(0, 0, 0);
  }, []);

  const resetCamera = useCallback(() => {
    cameraState.current = { ...CAMERA_DEFAULT, dragging: false, lastX: 0, lastY: 0 };
    applyCamera();
  }, [applyCamera]);

  const zoom = useCallback((delta: number) => {
    const s = cameraState.current;
    s.distance = THREE.MathUtils.clamp(s.distance + delta, 360, 1350);
    applyCamera();
  }, [applyCamera]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050816');
    scene.fog = new THREE.FogExp2('#050816', 0.0008);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 3200);
    camera.position.set(0, 250, 700);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = 'absolute inset-0 w-full h-full block';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Language Solar System');
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), mobile ? 0.75 : 1.0, 0.7, 0.82);
    const output = new OutputPass();
    composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(output);

    scene.add(new THREE.AmbientLight(0x7788aa, 1.15));
    const key = new THREE.PointLight(0xffffff, 1600, 1600, 2);
    key.position.set(0, 130, 170); scene.add(key);
    const rim = new THREE.PointLight(0x5b5fef, 900, 1100, 2); rim.position.set(-300, 180, -250); scene.add(rim);

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const r = 850 + Math.random() * 1250;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 900;
      starPositions[i * 3] = Math.cos(a) * r;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xbfd7ff, size: 1.5, transparent: true, opacity: 0.72, sizeAttenuation: true }));
    scene.add(stars);

    const core = new THREE.Mesh(new THREE.SphereGeometry(48, 48, 48), new THREE.MeshStandardMaterial({ color: 0x5b5fef, emissive: 0x3036d6, emissiveIntensity: 2.4, metalness: 0.25, roughness: 0.25 }));
    scene.add(core);
    const glowTexture = makeGlowTexture();
    if (glowTexture) {
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x6670ff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(180, 180, 1); scene.add(glow);
    }

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup); orbitGroupRef.current = orbitGroup;
    ORBIT_RADII.forEach((radius, idx) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(96).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: idx % 2 ? 0x334155 : 0x4652a4, transparent: true, opacity: 0.38 }));
      orbitGroup.add(line);
    });

    const planets: PlanetObject[] = [];
    WORLD_LANGUAGE_UNIVERSE.forEach((lang) => {
      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);
      const geometry = new THREE.SphereGeometry(lang.size * (isSupported ? 1.35 : 1), isSupported ? 20 : 10, isSupported ? 20 : 10);
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(lang.color), emissive: new THREE.Color(lang.color), emissiveIntensity: 0.32, roughness: 0.58, metalness: 0.18 });
      const planet = new THREE.Mesh(geometry, material) as PlanetObject;
      planet.userData.language = lang;
      planet.userData.isSupported = isSupported;
      const radius = ORBIT_RADII[Math.max(0, Math.min(ORBIT_RADII.length - 1, lang.orbitIndex - 1))];
      planet.userData.radius = radius;
      planet.userData.angle = lang.initialAngle;
      planet.position.set(Math.cos(lang.initialAngle) * radius, (lang.orbitIndex - 2.5) * 8, Math.sin(lang.initialAngle) * radius);
      orbitGroup.add(planet); planets.push(planet);
    });
    planetsRef.current = planets;

    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer; composerRef.current = composer;
    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height, false); composer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize(); applyCamera();

    let raf = 0; let last = performance.now(); let frameCounter = 0; let fpsStamp = last; let dropped = 0;
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (dt > 0.025) dropped++;
      const st = stateRef.current;
      planets.forEach((planet) => {
        const lang = planet.userData.language;
        planet.userData.angle += lang.speed * dt * 1000;
        const radius = planet.userData.radius as number;
        const angle = planet.userData.angle as number;
        planet.position.x = Math.cos(angle) * radius;
        planet.position.z = Math.sin(angle) * radius;
        const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode;
        const matches = st.matching.size === 0 || st.matching.has(lang.code);
        const supported = Boolean(planet.userData.isSupported);
        planet.material.emissiveIntensity = active ? 1.7 : supported ? (matches ? 0.5 : 0.08) : (matches ? 0.18 : 0.025);
        planet.material.opacity = matches ? (supported ? 1 : 0.72) : 0.12;
        planet.material.transparent = !matches;
        const pulse = active ? 1 + Math.sin(now * 0.006) * 0.12 : 1;
        planet.scale.setScalar(pulse);
      });
      core.rotation.y += dt * 0.15;
      stars.rotation.y += dt * 0.004;
      orbitGroup.rotation.y += dt * 0.012;
      composer.render(dt);
      frameCounter++;
      if (now - fpsStamp > 800) {
        const fps = frameCounter * 1000 / (now - fpsStamp);
        setMetrics({ fps: Math.round(fps), frameTimeMs: Number((1000 / Math.max(1, fps)).toFixed(1)), droppedFrames: dropped });
        frameCounter = 0; dropped = 0; fpsStamp = now;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onPointerDown = (e: PointerEvent) => { cameraState.current.dragging = true; cameraState.current.lastX = e.clientX; cameraState.current.lastY = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); };
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);
      const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined;
      setHoveredLanguage(hit?.userData.language ?? null);
      if (!cameraState.current.dragging) return;
      const dx = e.clientX - cameraState.current.lastX, dy = e.clientY - cameraState.current.lastY;
      cameraState.current.y -= dx * 0.004; cameraState.current.x = THREE.MathUtils.clamp(cameraState.current.x + dy * 0.004, -1.15, 1.15);
      cameraState.current.lastX = e.clientX; cameraState.current.lastY = e.clientY; applyCamera();
    };
    const onPointerUp = (e: PointerEvent) => { cameraState.current.dragging = false; try { renderer.domElement.releasePointerCapture(e.pointerId); } catch {} };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoom(e.deltaY * 0.45); };
    const onClick = () => { raycaster.current.setFromCamera(pointer.current, camera); const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined; if (hit) setSelectedPlanet(hit.userData.language); };
    renderer.domElement.addEventListener('pointerdown', onPointerDown); renderer.domElement.addEventListener('pointermove', onPointerMove); renderer.domElement.addEventListener('pointerup', onPointerUp); renderer.domElement.addEventListener('pointercancel', onPointerUp); renderer.domElement.addEventListener('wheel', onWheel, { passive: false }); renderer.domElement.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf); observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown); renderer.domElement.removeEventListener('pointermove', onPointerMove); renderer.domElement.removeEventListener('pointerup', onPointerUp); renderer.domElement.removeEventListener('pointercancel', onPointerUp); renderer.domElement.removeEventListener('wheel', onWheel); renderer.domElement.removeEventListener('click', onClick);
      planets.forEach((p) => { p.geometry.dispose(); p.material.dispose(); });
      scene.traverse((obj) => { const mesh = obj as THREE.Mesh; if (mesh.geometry && mesh !== core) mesh.geometry.dispose?.(); if (mesh.material && mesh !== core) { const m = mesh.material as THREE.Material; m.dispose?.(); } });
      composer.dispose(); renderer.dispose(); renderer.domElement.remove();
      sceneRef.current = null; cameraRef.current = null; rendererRef.current = null; composerRef.current = null;
    };
  }, [applyCamera, zoom]);

  return (
    <div className={cn('relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#050816] overflow-hidden shadow-2xl select-none', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#7c83ff] shadow-[0_0_18px_#7c83ff] animate-pulse" /><h2 className="text-sm font-bold tracking-tight text-white">Language Solar System</h2><span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#5B5FEF]/20 text-[#aab0ff]">WORLD LANGUAGE UNIVERSE</span></div>
          <p className="text-xs text-slate-400 mt-0.5">Explore the ISO 639-1 world language universe. Supported languages glow brighter.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search world languages..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/10 bg-black/30 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#7c83ff] w-36 sm:w-44" /></div>
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.06] border border-white/10">{(['ALL','POPULAR','OFFLINE'] as const).map((f) => <button key={f} type="button" onClick={() => setActiveFilter(f)} className={cn('px-2 py-1 text-[11px] rounded-md cursor-pointer', activeFilter === f ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white')}>{f}</button>)}</div>
        </div>
      </div>

      <div ref={mountRef} className="relative w-full h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,rgba(91,95,239,.12),transparent_38%)]" />
        <div className="absolute top-4 left-4 p-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-lg max-w-xs pointer-events-auto">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1.5 flex items-center justify-between"><span>Active Translation Vector</span>{isTranslating && <span className="text-emerald-400 font-mono animate-pulse">TRANSLATING...</span>}</div>
          <div className="flex items-center gap-2 text-xs"><span className="font-bold text-[#aab0ff]">{sourceLang?.name}</span><ArrowRight className="w-3.5 h-3.5 text-slate-600" /><span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-500">CORE</span><ArrowRight className="w-3.5 h-3.5 text-slate-600" /><span className="font-bold text-cyan-300">{targetLang?.name}</span></div>
        </div>

        {showSemanticHUD && <div className="absolute top-4 right-4 p-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-lg text-xs pointer-events-auto max-w-[210px]"><div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[10px] uppercase font-bold text-slate-500 tracking-wider"><span className="flex items-center gap-1 text-[#aab0ff]"><ShieldCheck className="w-3.5 h-3.5" /> Semantic HUD</span><button type="button" onClick={() => setShowSemanticHUD(false)} className="text-slate-500 hover:text-white">✕</button></div><div className="pt-1.5 space-y-1 text-[11px] text-slate-300"><div className="flex justify-between"><span>Meaning Lock</span><span className={cn('font-mono', meaningLockActive ? 'text-emerald-400' : 'text-slate-500')}>{meaningLockActive ? `ACTIVE (${lockedTermsCount})` : 'STANDBY'}</span></div><div className="flex justify-between"><span>Fidelity</span><span className={cn('font-mono font-bold', semanticIntegrityStatus === 'preserved' ? 'text-emerald-400' : 'text-amber-400')}>{semanticFidelityScore}%</span></div></div>{onOpenSemanticMirror && <button type="button" onClick={onOpenSemanticMirror} className="mt-2 w-full py-1 text-[10px] font-semibold rounded bg-[#5B5FEF]/20 text-[#aab0ff] hover:bg-[#5B5FEF]/30">Inspect Mirror ↗</button>}</div>}

        {!isMobile && hoveredLanguage && !selectedPlanet && <div className="absolute top-24 right-4 p-3 rounded-xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-xl text-xs min-w-[190px] pointer-events-none"><div className="flex justify-between"><span className="font-bold text-white">{hoveredLanguage.name}</span><span className="font-mono text-[10px] text-slate-500">{hoveredLanguage.code.toUpperCase()}</span></div><div className="text-slate-400 text-[11px] mt-0.5">{hoveredLanguage.nativeName} · {hoveredLanguage.script}</div><div className="text-[10px] text-slate-500 mt-1">Family: {hoveredLanguage.family}</div><div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[10px]"><span className="flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" /> Cloud</span><span className={cn('flex items-center gap-1', hoveredLanguage.offlineSupported ? 'text-cyan-400' : 'text-slate-500')}><WifiOff className="w-3 h-3" /> {hoveredLanguage.offlineSupported ? 'Offline Ready' : 'Cloud Only'}</span></div></div>}

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto"><button type="button" onClick={() => setShowDiagnostics(v => !v)} className="p-1.5 text-slate-400 hover:text-white rounded-lg" title="Performance diagnostics"><Activity className="w-4 h-4 text-[#7c83ff]" /></button><button type="button" onClick={() => zoom(-100)} className="p-1.5 text-slate-400 hover:text-white rounded-lg" title="Zoom in"><ZoomIn className="w-4 h-4" /></button><button type="button" onClick={() => zoom(100)} className="p-1.5 text-slate-400 hover:text-white rounded-lg" title="Zoom out"><ZoomOut className="w-4 h-4" /></button><button type="button" onClick={resetCamera} className="p-1.5 text-slate-400 hover:text-white rounded-lg" title="Reset perspective"><RotateCcw className="w-4 h-4" /></button></div>
        {showDiagnostics && <div className="absolute bottom-16 right-4 p-2.5 rounded-xl bg-black/80 text-white font-mono text-[10px] space-y-1 shadow-lg border border-white/10 pointer-events-auto"><div className="font-bold text-cyan-400">REAL-TIME PERFORMANCE</div><div>FPS: <span className="text-emerald-400 font-bold">{metrics.fps}</span></div><div>Frame Time: <span className="text-emerald-400 font-bold">{metrics.frameTimeMs} ms</span></div><div>Dropped: <span className={metrics.droppedFrames > 0 ? 'text-amber-400' : 'text-slate-500'}>{metrics.droppedFrames}</span></div></div>}
        {onNavigateToCockpit && <div className="absolute bottom-4 left-4 pointer-events-auto"><Button variant="primary" size="sm" onClick={onNavigateToCockpit} className="shadow-md text-xs py-1.5 px-3">Open Cockpit <ArrowRight className="w-3.5 h-3.5" /></Button></div>}
      </div>

      {selectedPlanet && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedPlanet(null)}><div className="w-full max-w-sm rounded-2xl p-5 border border-white/10 bg-[#0b1020] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-white/10 pb-3"><div><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedPlanet.color }} /><h3 className="font-bold text-base text-white">{selectedPlanet.name}</h3><span className="text-xs font-mono text-slate-500">({selectedPlanet.code.toUpperCase()})</span></div><p className="text-xs text-slate-400 mt-0.5">{selectedPlanet.nativeName} · {selectedPlanet.script}</p></div><button type="button" onClick={() => setSelectedPlanet(null)} className="text-slate-500 hover:text-white">✕</button></div><div className="space-y-2 text-xs text-slate-400"><div className="flex justify-between py-1 border-b border-white/10"><span>Linguistic Family</span><span className="font-semibold text-white">{selectedPlanet.family}</span></div><div className="flex justify-between py-1 border-b border-white/10"><span>Cloud AI</span><span className={selectedPlanet.cloudSupported ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{selectedPlanet.cloudSupported ? 'Supported' : 'Explore only'}</span></div><div className="flex justify-between py-1"><span>Offline</span><span className={selectedPlanet.offlineSupported ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>{selectedPlanet.offlineSupported ? 'Supported' : 'Not enabled'}</span></div>{selectedPlanet.limitations && <p className="pt-2 text-[10px] leading-relaxed text-amber-300/80">{selectedPlanet.limitations}</p>}</div><div className="grid grid-cols-2 gap-3 pt-2"><Button disabled={!selectedPlanet.textSupported} variant={sourceLanguageCode === selectedPlanet.code ? 'primary' : 'outline'} size="sm" onClick={() => { onSelectSource(selectedPlanet.code); setSelectedPlanet(null); }}>Set as Source</Button><Button disabled={!selectedPlanet.textSupported} variant={targetLanguageCode === selectedPlanet.code ? 'primary' : 'secondary'} size="sm" onClick={() => { onSelectTarget(selectedPlanet.code); setSelectedPlanet(null); }}>Set as Target</Button></div></div></div>}
    </div>
  );
}
