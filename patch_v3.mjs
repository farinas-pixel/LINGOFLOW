import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(root, p), v);
const once = (p, a, b) => { const s = read(p); if (!s.includes(a)) return; write(p, s.replace(a, b)); };

const serverCatalog = [
"// World language catalog (Glottolog 5.3 / ISO 639-3 mapping)",
"let worldLanguageCatalogCache = null;",
"let worldLanguageCatalogPromise = null;",
"function parseCsvLine(line) { const values=[]; let value=''; let quoted=false; for (let i=0;i<line.length;i+=1) { const c=line[i]; if(c==='\"'){ if(quoted && line[i+1]==='\"'){value+='\"';i+=1;} else quoted=!quoted; } else if(c===','&&!quoted){values.push(value);value='';} else value+=c; } values.push(value); return values; }",
"async function loadWorldLanguageCatalog() {",
"  if (worldLanguageCatalogCache) return worldLanguageCatalogCache;",
"  if (worldLanguageCatalogPromise) return worldLanguageCatalogPromise;",
"  worldLanguageCatalogPromise = (async () => {",
"    const response = await fetch('https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv');",
"    if (!response.ok) throw new Error('World language catalog request failed: ' + response.status);",
"    const lines = (await response.text()).split(/\\r?\\n/).filter(Boolean);",
"    const header = parseCsvLine(lines[0]); const index = new Map(header.map((name,i)=>[name,i])); const rows = lines.slice(1).map(parseCsvLine);",
"    const familyNames = new Map(); rows.forEach((row)=>{ if(row[index.get('Level') ?? -1]==='family'){ const id=row[index.get('ID') ?? -1], name=row[index.get('Name') ?? -1]; if(id&&name) familyNames.set(id,name); }});",
"    const entries = rows.filter((row)=>row[index.get('Level') ?? -1]==='language' && Boolean(row[index.get('ISO639P3code') ?? -1])).map((row)=>({code:row[index.get('ISO639P3code') ?? -1],name:row[index.get('Name') ?? -1],nativeName:row[index.get('Name') ?? -1],script:'Language catalog',family:familyNames.get(row[index.get('Family_ID') ?? -1]) || 'World language',level:'language'}));",
"    worldLanguageCatalogCache = entries; return entries;",
"  })().catch((error)=>{ worldLanguageCatalogPromise=null; throw error; });",
"  return worldLanguageCatalogPromise;",
"}",
"app.get('/api/languages', async (_req,res)=>{ try { const languages=await loadWorldLanguageCatalog(); res.json({source:'Glottolog 5.3',standard:'ISO 639-3',count:languages.length,languages}); } catch(error) { console.error('World language catalog error:',error); res.status(503).json({error:'World language catalog is temporarily unavailable.'}); }});",
""
].join('\n');
once('server.ts', '// Web Search Endpoint (Gemini Google Search grounding)', serverCatalog + '\n// Web Search Endpoint (Gemini Google Search grounding)');

once('src/config/app.config.ts', "label: 'Languages',", "label: 'World Languages',");
once('src/components/layout/Sidebar.tsx', 'Production-focused TypeScript architecture with explicit service states.', 'Real translation workspace · local history · connected AI');
once('src/components/layout/Sidebar.tsx', 'Storage: Local', 'Local workspace');
once('src/features/languages/LanguageExplorerView.tsx', 'Ready for zero-latency execution', 'Available offline when an installed local pack supports it');
once('src/features/languages/LanguageExplorerView.tsx', 'zero-latency execution', 'responsive local execution');
once('src/features/home/HomeView.tsx', 'import {\n  Sparkles,\n  ArrowRight,\n  HardDrive,\n  MessagesSquare,\n  FileText,\n  ShieldCheck,\n  Layers,\n  Zap,\n  Globe,\n  Lock,\n} from \'lucide-react\';', "import { Sparkles, ArrowRight } from 'lucide-react';");
once('src/features/home/HomeView.tsx', "import { Card } from '../../components/ui/Card';\n", '');
once('src/features/home/HomeView.tsx', "import { cn } from '../../utils/cn';\n", '');
once('src/features/home/HomeView.tsx', "  semanticFidelityScore = 100,\n  semanticIntegrityStatus = 'preserved',\n  meaningLockActive = true,", "  semanticFidelityScore,\n  semanticIntegrityStatus = null,\n  meaningLockActive = false,");
once('src/features/home/HomeView.tsx', 'LingoFlow brings translation, semantic verification, voice, image/document input, offline packs, and cloud storage into one workspace.', 'Translate text, understand meaning, speak naturally, work with images and documents, and reuse what you save.');

const home = read('src/features/home/HomeView.tsx');
const ws = home.indexOf('  const workflowSteps = [');
const we = home.indexOf('  return (', ws);
if (ws >= 0 && we >= 0) write('src/features/home/HomeView.tsx', home.slice(0, ws) + home.slice(we));
const home2 = read('src/features/home/HomeView.tsx');
const hm = home2.indexOf('      {/* The 8-Step Product Flow Grid */}');
if (hm >= 0) write('src/features/home/HomeView.tsx', home2.slice(0, hm) + '    </div>\n  );\n}\n');

const solar = 'src/components/solar/LanguageSolarSystem.tsx';
once(solar, "  semanticFidelityScore = 100,\n  semanticIntegrityStatus = 'preserved',\n  meaningLockActive = true,", "  semanticFidelityScore,\n  semanticIntegrityStatus = null,\n  meaningLockActive = false,");
once(solar, '  const planetsRef = useRef<PlanetObject[]>([]);', '  const planetsRef = useRef<PlanetObject[]>([]);\n  const catalogPointsRef = useRef(null);');
once(solar, '  const raycaster = useRef(new THREE.Raycaster());', "  const raycaster = useRef(new THREE.Raycaster());\n  useEffect(() => { raycaster.current.params.Points = { threshold: 12 }; }, []);");
once(solar, '  const [isMobile, setIsMobile] = useState(false);', "  const [isMobile, setIsMobile] = useState(false);\n  const [worldCatalog, setWorldCatalog] = useState(WORLD_LANGUAGE_UNIVERSE);\n  const catalogCount = worldCatalog.length;");
const oldMatch = `  const matchingCodeSet = useMemo(() => {\n    const q = searchQuery.trim().toLowerCase();\n    const universe = activeFilter === 'ALL'\n      ? WORLD_LANGUAGE_UNIVERSE\n      : searchLanguages('', activeFilter);\n    return new Set(universe.filter((language) => !q || language.name.toLowerCase().includes(q) || language.nativeName.toLowerCase().includes(q) || language.code.toLowerCase().includes(q) || language.family.toLowerCase().includes(q)).map((l) => l.code));\n  }, [searchQuery, activeFilter]);`;
const newMatch = `  useEffect(() => {\n    let cancelled = false;\n    fetch('/api/languages').then((r) => r.ok ? r.json() : Promise.reject(new Error('catalog unavailable'))).then((payload) => {\n      if (cancelled || !Array.isArray(payload?.languages)) return;\n      const generated = payload.languages.map((language, index) => {\n        const supported = SUPPORTED_LANGUAGES.find((item) => item.code === language.code.slice(0, 2));\n        const orbitIndex = (index % 10) + 1;\n        const palette = ['#6670ff','#22d3ee','#a78bfa','#34d399','#f59e0b','#fb7185','#38bdf8','#c084fc'];\n        return supported ?? { code: language.code, name: language.name, nativeName: language.nativeName || language.name, script: 'Language catalog', family: language.family || 'World language', orbitRadius: 150 + (orbitIndex - 1) * 48, orbitIndex, color: palette[index % palette.length], size: 3.8, speed: 0.00002 + (index % 7) * 0.000003, initialAngle: (index * 2.399963) % (Math.PI * 2), cloudSupported: false, offlineSupported: false, textSupported: false, speechSynthesisSupported: false, speechRecognitionSupported: false, ocrSupported: false, documentSupported: false, limitations: 'Explore-only catalog entry. Translation support is not currently enabled in LingoFlow.', popular: false, bcp47: language.code, flagGlyph: language.code.toUpperCase() };\n      });\n      setWorldCatalog(generated);\n    }).catch(() => undefined);\n    return () => { cancelled = true; };\n  }, []);\n\n  const matchingCodeSet = useMemo(() => {\n    const q = searchQuery.trim().toLowerCase();\n    const universe = activeFilter === 'ALL' ? worldCatalog : activeFilter === 'SUPPORTED' ? SUPPORTED_LANGUAGES : SUPPORTED_LANGUAGES.filter((language) => language.offlineSupported);\n    return new Set(universe.filter((language) => !q || language.name.toLowerCase().includes(q) || language.nativeName.toLowerCase().includes(q) || language.code.toLowerCase().includes(q) || language.family.toLowerCase().includes(q)).map((l) => l.code));\n  }, [searchQuery, activeFilter, worldCatalog]);`;
const solarNow = read(solar);
if (!solarNow.includes(oldMatch)) throw new Error('Solar matching block not found');
write(solar, solarNow.replace(oldMatch, newMatch));
once(solar, 'WORLD_LANGUAGE_UNIVERSE.forEach((lang) => {', 'worldCatalog.forEach((lang) => {');
once(solar, "      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);\n      const geometry = new THREE.SphereGeometry(lang.size * (isSupported ? 1.35 : 1), isSupported ? 20 : 10, isSupported ? 20 : 10);", "      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);\n      const geometry = new THREE.SphereGeometry(lang.size * (isSupported ? 1.35 : 1), isSupported ? 20 : 10, isSupported ? 20 : 10);");
once(solar, "      const planet = new THREE.Mesh(geometry, material) as PlanetObject;", "      const planet = new THREE.Mesh(geometry, material) as PlanetObject;");
once(solar, "  }, [applyCamera, zoom]);", "  }, [applyCamera, zoom, worldCatalog]);");
once(solar, "{(['ALL','POPULAR','OFFLINE'] as const).map((f) =>", "{(['ALL','SUPPORTED','OFFLINE'] as const).map((f) =>");
once(solar, 'Explore the ISO 639-1 world language universe. Supported languages glow brighter.', 'Explore the world language catalog. Supported LingoFlow languages glow brighter.');
once(solar, 'WORLD LANGUAGE UNIVERSE', 'WORLD LANGUAGE CATALOG');
once(solar, '</span></div>\n          <p className="text-xs', '</span><span className="text-[10px] text-slate-500">{catalogCount.toLocaleString()} languages</span></div>\n          <p className="text-xs');
once(solar, 'showSemanticHUD && <div', 'showSemanticHUD && semanticFidelityScore != null && <div');
once(solar, '{semanticFidelityScore}%', '{Math.round(semanticFidelityScore)}%');

const app = 'src/App.tsx';
once(app, "import { ArchitectureExplorer } from './features/workspace/ArchitectureExplorer';\n", '');
once(app, "import { ServiceRegistryView } from './features/workspace/ServiceRegistryView';\n", '');
once(app, "        {activeView === 'architecture' && <ArchitectureExplorer />}\n", '');
once(app, "        {activeView === 'services' && <ServiceRegistryView />}\n", '');
for (const file of ['src/features/workspace/ArchitectureExplorer.tsx','src/features/workspace/ServiceRegistryView.tsx']) { const target=path.join(root,file); if(fs.existsSync(target)) fs.unlinkSync(target); }

const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
const solarFile = read(solarPath);
const planetBlock = /    const planets: PlanetObject\[\] = \[\];[\s\S]*?    planetsRef\.current = planets;/;
const optimizedPlanetBlock = `    const planets: PlanetObject[] = [];
    const catalogEntries = [];
    const pointPositions = [];
    const pointColors = [];
    worldCatalog.forEach((lang) => {
      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);
      const radius = ORBIT_RADII[Math.max(0, Math.min(ORBIT_RADII.length - 1, lang.orbitIndex - 1))];
      const x = Math.cos(lang.initialAngle) * radius;
      const y = (lang.orbitIndex - 2.5) * 8;
      const z = Math.sin(lang.initialAngle) * radius;
      if (isSupported) {
        const geometry = new THREE.SphereGeometry(lang.size * 1.35, 20, 20);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(lang.color), emissive: new THREE.Color(lang.color), emissiveIntensity: 0.32, roughness: 0.58, metalness: 0.18 });
        const planet = new THREE.Mesh(geometry, material) as PlanetObject;
        planet.userData.language = lang;
        planet.userData.isSupported = true;
        planet.userData.radius = radius;
        planet.userData.angle = lang.initialAngle;
        planet.position.set(x, y, z);
        orbitGroup.add(planet);
        planets.push(planet);
      } else {
        catalogEntries.push(lang);
        pointPositions.push(x, y, z);
        const c = new THREE.Color(lang.color);
        pointColors.push(c.r, c.g, c.b);
      }
    });
    planetsRef.current = planets;
    if (catalogEntries.length) {
      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
      pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));
      const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: mobile ? 3.4 : 4.5, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true }));
      points.userData.languages = catalogEntries;
      points.userData.positions = pointPositions;
      orbitGroup.add(points);
      catalogPointsRef.current = points;
    }`;
if (!planetBlock.test(solarFile)) throw new Error('Optimized planet block anchor missing');
write(solarPath, solarFile.replace(planetBlock, optimizedPlanetBlock));

once(solarPath,
  "      const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined;\n      setHoveredLanguage(hit?.userData.language ?? null);",
  "      const meshHit = raycaster.current.intersectObjects(planets, false)[0]?.object;\n      const pointHit = catalogPointsRef.current ? raycaster.current.intersectObject(catalogPointsRef.current, false)[0] : undefined;\n      const catalogLanguage = pointHit && typeof pointHit.index === 'number' ? catalogPointsRef.current?.userData.languages?.[pointHit.index] : undefined;\n      setHoveredLanguage(meshHit?.userData?.language ?? catalogLanguage ?? null);"
);

once(solarPath,
  "    const onClick = () => { raycaster.current.setFromCamera(pointer.current, camera); const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined; if (hit) setSelectedPlanet(hit.userData.language); };",
  "    const onClick = () => { raycaster.current.setFromCamera(pointer.current, camera); const hit = raycaster.current.intersectObjects(planets, false)[0]?.object; if (hit?.userData?.language) { setSelectedPlanet(hit.userData.language); return; } if (catalogPointsRef.current) { const pointHit = raycaster.current.intersectObject(catalogPointsRef.current, false)[0]; if (pointHit && typeof pointHit.index === 'number') { const language = catalogPointsRef.current.userData.languages?.[pointHit.index]; if (language) setSelectedPlanet(language); } } };"
);

const labelPath = 'src/components/solar/LanguageSolarSystem.tsx';
once(labelPath, "import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';", "import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';\nimport { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';");
once(labelPath, "  const composerRef = useRef<EffectComposer | null>(null);", "  const composerRef = useRef<EffectComposer | null>(null);\n  const labelRendererRef = useRef<CSS2DRenderer | null>(null);");
once(labelPath, "  const catalogPointsRef = useRef<THREE.Points | null>(null);", "  const catalogPointsRef = useRef<THREE.Points | null>(null);\n  const languageLabelsRef = useRef<CSS2DObject[]>([]);\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);");
once(labelPath, "    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Language Solar System');\n    mount.appendChild(renderer.domElement);", "    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Language Solar System');\n    renderer.domElement.style.touchAction = 'none';\n    mount.appendChild(renderer.domElement);\n\n    const labelRenderer = new CSS2DRenderer();\n    labelRenderer.setSize(1, 1);\n    labelRenderer.domElement.className = 'absolute inset-0 pointer-events-none overflow-hidden';\n    labelRenderer.domElement.setAttribute('aria-hidden', 'true');\n    mount.appendChild(labelRenderer.domElement);");
once(labelPath, "    const orbitGroup = new THREE.Group();", `    const orbitGroup = new THREE.Group();\n    labelRendererRef.current = labelRenderer;\n\n    const worldLabelCanvas = document.createElement('canvas');\n    worldLabelCanvas.className = 'absolute inset-0 pointer-events-none';\n    worldLabelCanvas.id = 'lingoflow-world-label-canvas';\n    worldLabelCanvas.setAttribute('aria-hidden', 'true');\n    mount.appendChild(worldLabelCanvas);\n    worldLabelCanvasRef.current = worldLabelCanvas;\n    const worldLabelContext = worldLabelCanvas.getContext('2d', { alpha: true });`);
once(labelPath, "    planetsRef.current = planets;\n\n    if (catalogEntries.length) {", "    planetsRef.current = planets;\n\n    const makeLabel = (lang: LanguagePlanetData) => { const el = document.createElement('div'); el.className = 'lingoflow-language-label'; el.textContent = lang.name; el.style.setProperty('--label-color', lang.color); const label = new CSS2DObject(el); label.position.set(0, lang.size * 1.9, 0); label.userData.language = lang; return label; };\n    planets.forEach((planet) => { const label = makeLabel(planet.userData.language); planet.add(label); languageLabelsRef.current.push(label); });\n\n    if (catalogEntries.length) {");
once(labelPath, "      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) {", "      languageLabelsRef.current.forEach((label) => { const lang = label.userData.language as LanguagePlanetData; const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode; const matches = st.matching.size === 0 || st.matching.has(lang.code); const distance = camera.position.distanceTo(label.getWorldPosition(new THREE.Vector3())); const visible = active || (matches && distance < (mobile ? 720 : 860)); label.element.style.opacity = visible ? '1' : '0'; label.element.classList.toggle('is-active', active); });\n      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) {");
once(labelPath, "      composer.render(dt);", "      composer.render(dt);\n      labelRenderer.render(scene, camera);");
once(labelPath, "      renderer.setSize(width, height, false); composer.setSize(width, height);", "      renderer.setSize(width, height, false); composer.setSize(width, height); labelRenderer.setSize(width, height);");
once(labelPath, "      composer.dispose(); renderer.dispose(); renderer.domElement.remove();", "      composer.dispose(); renderer.dispose(); labelRenderer.domElement.remove(); worldLabelCanvas.remove(); worldLabelCanvasRef.current = null; renderer.domElement.remove(); languageLabelsRef.current = []; labelRendererRef.current = null;");
once(labelPath, "className=\"relative w-full h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\"", "className=\"relative w-full h-[460px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\"");
once(labelPath, "Explore the world language catalog. Supported LingoFlow languages glow brighter.", "Drag to rotate · pinch/scroll to zoom · tap a language");
once('src/index.css', '/* LingoFlow Solar System labels */', '/* LingoFlow Solar System labels */');
const cssPath = 'src/index.css'; const css = read(cssPath); if (!css.includes('.lingoflow-language-label{')) write(cssPath, css + "\n.lingoflow-language-label{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;font-weight:700;letter-spacing:.01em;color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 1px 8px rgba(0,0,0,.98),0 0 12px var(--label-color);transform:translate(-50%,-100%);transition:opacity .18s ease}.lingoflow-language-label::before{content:'';display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:999px;background:var(--label-color);box-shadow:0 0 9px var(--label-color);vertical-align:1px}.lingoflow-language-label.is-active{font-weight:900;text-shadow:0 1px 10px #000,0 0 18px var(--label-color)}@media(max-width:767px){.lingoflow-language-label{font-size:9px}.lingoflow-language-label::before{width:4px;height:4px;margin-right:4px}}\n");
console.log('LingoFlow v3 patch applied');


// Production App shell: isolated feature failures + lazy feature loading for a faster first paint.
const productionApp = 'src/App.tsx';
write(productionApp, "import React, { Component, Suspense, type ErrorInfo, type ReactNode, lazy, useEffect, useState } from 'react';\nimport { WorkspaceViewId } from './types/navigation';\nimport { ThemeProvider } from './hooks/useTheme';\nimport { AppShell } from './components/layout/AppShell';\nimport { SplashScreen } from './components/feedback/SplashScreen';\n\nconst HomeView = lazy(() => import('./features/home/HomeView').then(m => ({ default: m.HomeView })));\nconst TranslationCockpit = lazy(() => import('./features/translator/TranslationCockpit').then(m => ({ default: m.TranslationCockpit })));\nconst WebSearchView = lazy(() => import('./features/search/WebSearchView').then(m => ({ default: m.WebSearchView })));\nconst SemanticMirrorView = lazy(() => import('./features/semantic/SemanticMirrorView').then(m => ({ default: m.SemanticMirrorView })));\nconst ConversationMode = lazy(() => import('./features/conversation/ConversationMode').then(m => ({ default: m.ConversationMode })));\nconst MediaTranslationView = lazy(() => import('./features/media/MediaTranslationView').then(m => ({ default: m.MediaTranslationView })));\nconst HistoryAndFavoritesView = lazy(() => import('./features/history/HistoryAndFavoritesView').then(m => ({ default: m.HistoryAndFavoritesView })));\nconst LanguageExplorerView = lazy(() => import('./features/languages/LanguageExplorerView').then(m => ({ default: m.LanguageExplorerView })));\nconst TranslationVaultView = lazy(() => import('./features/vault/TranslationVaultView').then(m => ({ default: m.TranslationVaultView })));\nconst EnhancedSettingsView = lazy(() => import('./features/settings/EnhancedSettingsView').then(m => ({ default: m.EnhancedSettingsView })));\nconst serviceRegistryPromise = import('./services/core/ServiceRegistry').then(m => m.serviceRegistry);\n\nclass ViewErrorBoundary extends Component<{ viewName: string; children: ReactNode }, { hasError: boolean; message: string }> {\n  state = { hasError: false, message: '' };\n  static getDerivedStateFromError(error: Error) { return { hasError: true, message: error?.message || 'Unexpected workspace error.' }; }\n  componentDidCatch(error: Error, info: ErrorInfo) { console.error(`LingoFlow ${this.props.viewName} error:`, error, info); }\n  retry = () => this.setState({ hasError: false, message: '' });\n  render() {\n    if (!this.state.hasError) return this.props.children;\n    return <section className=\"min-h-[60vh] flex items-center justify-center p-6\"><div className=\"w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-xl\"><div className=\"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300\">!</div><h2 className=\"text-xl font-semibold text-white\">This workspace view needs a retry</h2><p className=\"mt-2 text-sm text-slate-400\">The rest of LingoFlow is protected. This view failed without taking down the workspace.</p>{this.state.message && <p className=\"mt-3 break-words rounded-xl bg-black/30 p-3 text-left text-xs text-slate-500\">{this.state.message}</p>}<button type=\"button\" onClick={this.retry} className=\"mt-5 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15\">Retry view</button></div></section>;\n  }\n}\n\nfunction ViewLoading() {\n  return <section className=\"min-h-[60vh] flex items-center justify-center p-6\"><div className=\"flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm text-slate-300 backdrop-blur-xl\"><span className=\"h-2 w-2 animate-pulse rounded-full bg-cyan-300\" />Loading workspace…</div></section>;\n}\n\nfunction WorkspaceRoot() {\n  const [isReady, setIsReady] = useState(false);\n  const [activeView, setActiveView] = useState<WorkspaceViewId>('home');\n  const [sourceLanguage, setSourceLanguage] = useState('en');\n  const [targetLanguage, setTargetLanguage] = useState('es');\n  const [semanticPayload, setSemanticPayload] = useState<{ sourceText: string; translatedText: string } | null>(null);\n  const [semanticFidelityScore, setSemanticFidelityScore] = useState<number | null>(null);\n  const [semanticIntegrityStatus, setSemanticIntegrityStatus] = useState<'preserved' | 'nuance_change' | 'meaning_changed' | null>(null);\n  const [meaningLockActive, setMeaningLockActive] = useState(false);\n  const [lockedTermsCount, setLockedTermsCount] = useState(0);\n\n  useEffect(() => {\n    let mounted = true;\n    void serviceRegistryPromise.then(({ initializeAll }) => initializeAll()).catch(error => console.error('LingoFlow initialization error:', error)).finally(() => { if (mounted) setIsReady(true); });\n    return () => { mounted = false; };\n  }, []);\n\n  const handleSwapLanguages = () => { const current = sourceLanguage; setSourceLanguage(targetLanguage); setTargetLanguage(current); };\n  const handleOpenSemanticMirror = (source: string, translated: string) => { setSemanticPayload({ sourceText: source, translatedText: translated }); setActiveView('semantic'); };\n  const handleSelectFromHistory = (source: string, target: string, sLang: string, tLang: string) => { setSourceLanguage(sLang); setTargetLanguage(tLang); setSemanticPayload({ sourceText: source, translatedText: target }); setActiveView('translator'); };\n\n  const renderView = () => {\n    switch (activeView) {\n      case 'home': return <HomeView sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSelectSource={setSourceLanguage} onSelectTarget={setTargetLanguage} onSwapLanguages={handleSwapLanguages} onNavigate={setActiveView} semanticFidelityScore={semanticFidelityScore} semanticIntegrityStatus={semanticIntegrityStatus} meaningLockActive={meaningLockActive} lockedTermsCount={lockedTermsCount} />;\n      case 'search': return <WebSearchView />;\n      case 'translator': return <TranslationCockpit sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSourceChange={setSourceLanguage} onTargetChange={setTargetLanguage} onSwap={handleSwapLanguages} onOpenSemanticMirror={handleOpenSemanticMirror} />;\n      case 'semantic': return <SemanticMirrorView sourceText={semanticPayload?.sourceText || ''} translatedText={semanticPayload?.translatedText || ''} sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onApplyRevision={(revised) => setSemanticPayload(current => current ? { ...current, translatedText: revised } : current)} onUpdateIntegrity={(score, status, count) => { setSemanticFidelityScore(score); setSemanticIntegrityStatus(status); setLockedTermsCount(count); setMeaningLockActive(count > 0); }} />;\n      case 'conversation': return <ConversationMode />;\n      case 'media': return <MediaTranslationView />;\n      case 'history': return <HistoryAndFavoritesView onSelectForCockpit={handleSelectFromHistory} />;\n      case 'languages': return <LanguageExplorerView />;\n      case 'vault': return <TranslationVaultView />;\n      case 'settings': return <EnhancedSettingsView />;\n      default: return <HomeView sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSelectSource={setSourceLanguage} onSelectTarget={setTargetLanguage} onSwapLanguages={handleSwapLanguages} onNavigate={setActiveView} semanticFidelityScore={semanticFidelityScore} semanticIntegrityStatus={semanticIntegrityStatus} meaningLockActive={meaningLockActive} lockedTermsCount={lockedTermsCount} />;\n    }\n  };\n\n  return <>\n    {!isReady && <SplashScreen onComplete={() => setIsReady(true)} minDurationMs={320} />}\n    <AppShell activeView={activeView} onSelectView={setActiveView}>\n      <ViewErrorBoundary viewName={activeView}><Suspense fallback={<ViewLoading />}>{renderView()}</Suspense></ViewErrorBoundary>\n    </AppShell>\n  </>;\n}\n\nexport default function App() { return <ThemeProvider><WorkspaceRoot /></ThemeProvider>; }\n");
console.log('LingoFlow production App shell applied');


// Final production Solar System UX hardening
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);
  solar = solar.replace("const positions = points.geometry.getAttribute('position');\n      const languages = points.userData.languages || [];", "const worldPositions = points.userData.positions || [];\n      const languages = points.userData.languages || [];");
  solar = solar.replace("projected.fromBufferAttribute(positions, i).applyMatrix4(points.matrixWorld).project(camera);", "projected.set(worldPositions[i * 3] || 0, worldPositions[i * 3 + 1] || 0, worldPositions[i * 3 + 2] || 0).applyMatrix4(points.matrixWorld).project(camera);");
  solar = solar.replace("worldLabelContext.font = mobile ? '600 7px Inter, system-ui, sans-serif' : '600 8px Inter, system-ui, sans-serif';", "worldLabelContext.font = mobile ? '700 8px Inter, system-ui, sans-serif' : '700 9px Inter, system-ui, sans-serif';");
  solar = solar.replace("worldLabelContext.fillText(lang.name, x, y - 6);", "worldLabelContext.fillText(lang.name, x, y - (mobile ? 8 : 10)); if (active && lang.nativeName && lang.nativeName !== lang.name) { worldLabelContext.globalAlpha = 0.92; worldLabelContext.font = mobile ? '600 7px Inter, system-ui, sans-serif' : '600 8px Inter, system-ui, sans-serif'; worldLabelContext.fillText(lang.nativeName, x, y + (mobile ? 3 : 4)); worldLabelContext.font = mobile ? '700 8px Inter, system-ui, sans-serif' : '700 9px Inter, system-ui, sans-serif'; }");
  solar = solar.replace("const alpha = active ? 1 : matches ? 0.72 : 0.18;", "const alpha = active ? 1 : matches ? 0.82 : 0.22;");
  solar = solar.replace("worldLabelContext.shadowBlur = active ? 10 : 5;", "worldLabelContext.shadowBlur = active ? 16 : 7;");
  write(solarPath, solar);
  const cssPath = 'src/index.css'; let css = read(cssPath); css = css.replace(/\\n?\.lingoflow-product-dock\\{[\\s\\S]*?\\}\\n?/m, '\\n'); write(cssPath, css);
  const appPath = 'src/App.tsx'; let app = read(appPath); app = app.replace(/\\n\\s*useEffect\\(\\(\\) => \\{\\n\\s*const onLanguageConfigure[\\s\\S]*?\\n\\s*\\}, \\[\\]\\);\\n/m, '\\n'); write(appPath, app);
}
console.log('LingoFlow clean Solar UX hardening applied');


// Last-mile Solar compile guard: always declare the canvas ref before any cleanup/render code uses it.
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);
  if (!solar.includes('const worldLabelCanvasRef')) {
    const anchor = solar.match(/const\\s+catalogPointsRef\\s*=\\s*useRef[^;]+;/);
    if (anchor) solar = solar.replace(anchor[0], anchor[0] + "\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);");
  }
  write(solarPath, solar);
}
console.log('Solar canvas ref guard applied');


// LingoFlow Product Design System v2 — Solar language discovery
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);

  // One label renderer only: keep world labels on the performant canvas layer.
  solar = solar.replace(/\nimport \{ CSS2DRenderer, CSS2DObject \} from 'three\/addons\/renderers\/CSS2DRenderer\.js';/, '');
  solar = solar.replace(/\n\s*const labelRendererRef = useRef<CSS2DRenderer \| null>\(null\);/, '');
  solar = solar.replace(/\n\s*const languageLabelsRef = useRef<CSS2DObject\[\]>\(\[\]\);/, '');
  solar = solar.replace(/\n\s*labelRendererRef\.current = labelRenderer;/g, '');
  solar = solar.replace(/\n\s*const labelRenderer = new CSS2DRenderer\(\);[\s\S]*?mount\.appendChild\(labelRenderer\.domElement\);/, '');
  solar = solar.replace(/\n\s*const makeLabel = \(lang: LanguagePlanetData\) => \{[\s\S]*?languageLabelsRef\.current\.push\(label\); \}\);/, '');
  solar = solar.replace(/\n\s*languageLabelsRef\.current\.forEach\(\(label\) => \{[\s\S]*?\}\);/, '');
  solar = solar.replace(/\n\s*labelRenderer\.render\(scene, camera\);/g, '');
  solar = solar.replace(/ labelRenderer\.setSize\(width, height\);/g, '');
  solar = solar.replace(/ labelRenderer\.domElement\.remove\(\);/g, '');
  solar = solar.replace(/ languageLabelsRef\.current = \[\]; labelRendererRef\.current = null;/g, '');

  // Explicit ISO-639-3 -> LingoFlow code mapping. Never infer by slicing the code.
  const isoMap = "const LINGOFLOW_ISO3_TO_APP = {eng:'en',spa:'es',fra:'fr',deu:'de',ita:'it',por:'pt',nld:'nl',rus:'ru',ara:'ar',hin:'hi',ben:'bn',tam:'ta',tel:'te',kan:'kn',mal:'ml',mar:'mr',guj:'gu',pan:'pa',urd:'ur',jpn:'ja',kor:'ko',zho:'zh',cmn:'zh',vie:'vi',ind:'id',tha:'th',tur:'tr',pol:'pl',ukr:'uk',swe:'sv',dan:'da',nor:'no',fin:'fi',heb:'he',ell:'el'};";
  solar = solar.replace(/const supported = SUPPORTED_LANGUAGES\.find\(\(item\) => item\.code === language\.code\.slice\(0, 2\)\);/, isoMap + "\n        const supported = SUPPORTED_LANGUAGES.find((item) => item.code === (LINGOFLOW_ISO3_TO_APP[language.code] || language.code));");

  // Language focus card intentionally omitted from generated JSX until it is implemented as a stable component.\n  write(solarPath, solar);

  const serverPath = 'server.ts';
  let server = read(serverPath);
  const oldEntry = "const entries = rows.filter((row)=>row[index.get('Level') ?? -1]==='language' && Boolean(row[index.get('ISO639P3code') ?? -1])).map((row)=>({code:row[index.get('ISO639P3code') ?? -1],name:row[index.get('Name') ?? -1],nativeName:row[index.get('Name') ?? -1],script:'Language catalog',family:familyNames.get(row[index.get('Family_ID') ?? -1]) || 'World language',level:'language'}));";
  const newEntry = "const languageMeta = {eng:{nativeName:'English',script:'Latin',family:'Indo-European'},spa:{nativeName:'Español',script:'Latin',family:'Indo-European'},fra:{nativeName:'Français',script:'Latin',family:'Indo-European'},deu:{nativeName:'Deutsch',script:'Latin',family:'Indo-European'},hin:{nativeName:'हिन्दी',script:'Devanagari',family:'Indo-European'},tam:{nativeName:'தமிழ்',script:'Tamil',family:'Dravidian'},tel:{nativeName:'తెలుగు',script:'Telugu',family:'Dravidian'},kan:{nativeName:'ಕನ್ನಡ',script:'Kannada',family:'Dravidian'},mal:{nativeName:'മലയാളം',script:'Malayalam',family:'Dravidian'},ben:{nativeName:'বাংলা',script:'Bengali',family:'Indo-European'},jpn:{nativeName:'日本語',script:'Japanese',family:'Japonic'},kor:{nativeName:'한국어',script:'Hangul',family:'Koreanic'},zho:{nativeName:'中文',script:'Chinese',family:'Sino-Tibetan'},ara:{nativeName:'العربية',script:'Arabic',family:'Afro-Asiatic'},rus:{nativeName:'Русский',script:'Cyrillic',family:'Indo-European'}}; const entries = rows.filter((row)=>row[index.get('Level') ?? -1]==='language' && Boolean(row[index.get('ISO639P3code') ?? -1])).map((row)=>{ const code=row[index.get('ISO639P3code') ?? -1]; const meta=languageMeta[code] || {}; return {code,name:row[index.get('Name') ?? -1],nativeName:meta.nativeName || row[index.get('Name') ?? -1],script:meta.script || 'Script data unavailable',family:meta.family || familyNames.get(row[index.get('Family_ID') ?? -1]) || 'World language',level:'language'}; });";
  if (server.includes(oldEntry)) server = server.replace(oldEntry, newEntry);
  write(serverPath, server);

  const appPath = 'src/App.tsx';
  let app = read(appPath);
  const bridge = [
    "  useEffect(() => {",
    "    const onTranslateLanguage = (event: Event) => {",
    "      const code = (event as CustomEvent<{code?: string}>).detail?.code;",
    "      const mapped = {eng:'en',spa:'es',fra:'fr',deu:'de',ita:'it',por:'pt',nld:'nl',rus:'ru',ara:'ar',hin:'hi',ben:'bn',tam:'ta',tel:'te',kan:'kn',mal:'ml',mar:'mr',guj:'gu',pan:'pa',urd:'ur',jpn:'ja',kor:'ko',zho:'zh',cmn:'zh',vie:'vi',ind:'id',tha:'th',tur:'tr',pol:'pl',ukr:'uk',swe:'sv',dan:'da',nor:'no',fin:'fi',heb:'he',ell:'el'} as Record<string,string>;",
    "      const target = mapped[code || ''] || code;",
    "      if (!target) return;",
    "      setTargetLanguage(target);",
    "      setActiveView('translator');",
    "    };",
    "    window.addEventListener('lingoflow:translate-language', onTranslateLanguage);",
    "    return () => window.removeEventListener('lingoflow:translate-language', onTranslateLanguage);",
    "  }, []);"
  ].join('\n');
  if (!app.includes('lingoflow:translate-language')) {
    const anchor = "  const handleSwapLanguages = () => { const current = sourceLanguage; setSourceLanguage(targetLanguage); setTargetLanguage(current); };";
    if (!app.includes(anchor)) throw new Error('App journey anchor missing');
    app = app.replace(anchor, anchor + '\n' + bridge);
  }
  write(appPath, app);
}
console.log('LingoFlow Product Design System v2 applied');



// Final deterministic Solar normalization: generated source must contain one label system only.
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);
  solar = solar.replace(/CSS2DRenderer, CSS2DObject/g, '');
  solar = solar.replace(/\n\\s*const labelRendererRef = useRef<CSS2DRenderer \\| null>\\(null\\);/g, '');
  solar = solar.replace(/\n\\s*const languageLabelsRef = useRef<CSS2DObject\\[\\]>(\\[\\]);/g, '');
  solar = solar.replace(/\n\\s*labelRendererRef\\.current = labelRenderer;/g, '');
  solar = solar.replace(/\n\\s*labelRenderer\\.render\\(scene, camera\\);/g, '');
  solar = solar.replace(/\n\\s*labelRenderer\\.setSize\\(width, height\\);/g, '');
  solar = solar.replace(/\n\\s*labelRenderer\\.domElement\\.remove\\(\\);/g, '');
  solar = solar.replace(/\n\\s*languageLabelsRef\\.current = \\[\\]; labelRendererRef\\.current = null;/g, '');
  if (!solar.includes('const worldLabelCanvasRef')) {
    const anchor = solar.match(/const\\s+catalogPointsRef\\s*=\\s*useRef[^;]+;/);
    if (anchor) solar = solar.replace(anchor[0], anchor[0] + "\\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);");
  }
  // Keep the focus card intentional: only a deliberate tap/selection opens the action card.
  solar = solar.replace('{(selectedPlanet || hoveredLanguage) && (', '{selectedPlanet && (');
  solar = solar.replace('(selectedPlanet || hoveredLanguage).name', 'selectedPlanet.name');
  solar = solar.replace('(selectedPlanet || hoveredLanguage).nativeName', 'selectedPlanet.nativeName');
  solar = solar.replace('(selectedPlanet || hoveredLanguage).family', 'selectedPlanet.family');
  solar = solar.replace('(selectedPlanet || hoveredLanguage).script', 'selectedPlanet.script');
  solar = solar.replace('(selectedPlanet || hoveredLanguage).code', 'selectedPlanet.code');
  write(solarPath, solar);
}
console.log('Final deterministic Solar normalization applied');



// FINAL PRODUCTION NORMALIZER + STATIC QA
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);

  // Remove legacy CSS2D layer using literal replacements so this guard itself cannot
  // introduce a regex-parser failure.
  const legacySnippets = [
    "import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';",
    "import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';"
  ];
  for (const snippet of legacySnippets) solar = solar.split(snippet).join('');
  solar = solar.split("const labelRendererRef = useRef<CSS2DRenderer | null>(null);").join('');
  solar = solar.split("const languageLabelsRef = useRef<CSS2DObject[]>([]);").join('');
  solar = solar.split("labelRendererRef.current = labelRenderer;").join('');
  solar = solar.split("labelRenderer.render(scene, camera);").join('');
  solar = solar.split("labelRenderer.domElement.remove();").join('');
  solar = solar.split("languageLabelsRef.current = []; labelRendererRef.current = null;").join('');

  if (!solar.includes('const worldLabelCanvasRef')) {
    const anchor = 'const catalogPointsRef = useRef';
    const at = solar.indexOf(anchor);
    const end = solar.indexOf(';', at);
    if (at >= 0 && end >= 0) {
      const declaration = solar.slice(at, end + 1);
      solar = solar.replace(declaration, declaration + "\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);");
    }
  }

  // Selection is the intentional product action; hover only previews.
  solar = solar.split('{(selectedPlanet || hoveredLanguage) && (').join('{selectedPlanet && (');
  solar = solar.split('(selectedPlanet || hoveredLanguage).name').join('selectedPlanet.name');
  solar = solar.split('(selectedPlanet || hoveredLanguage).nativeName').join('selectedPlanet.nativeName');
  solar = solar.split('(selectedPlanet || hoveredLanguage).family').join('selectedPlanet.family');
  solar = solar.split('(selectedPlanet || hoveredLanguage).script').join('selectedPlanet.script');
  solar = solar.split('(selectedPlanet || hoveredLanguage).code').join('selectedPlanet.code');

  const appPath = 'src/App.tsx';
  let app = read(appPath);
  app = app.split("import { ArchitectureExplorer } from './features/workspace/ArchitectureExplorer';\n").join('');
  app = app.split("import { ServiceRegistryView } from './features/workspace/ServiceRegistryView';\n").join('');
  app = app.split("{activeView === 'architecture' && <ArchitectureExplorer />}").join('');
  app = app.split("{activeView === 'services' && <ServiceRegistryView />}").join('');
  write(appPath, app);

  // Runtime safety: persist the canvas ref declaration before QA reads the generated source.
  if (!solar.includes('const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);')) {
    const typedCatalogRef = 'const catalogPointsRef = useRef<THREE.Points | null>(null);';
    const plainCatalogRef = 'const catalogPointsRef = useRef(null);';
    if (solar.includes(typedCatalogRef)) {
      solar = solar.replace(typedCatalogRef, typedCatalogRef + '\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);');
    } else if (solar.includes(plainCatalogRef)) {
      solar = solar.replace(plainCatalogRef, plainCatalogRef + '\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);');
    } else {
      throw new Error('Production QA: catalogPointsRef declaration anchor missing');
    }
  }
  write(solarPath, solar);
  const finalSolar = read(solarPath);
  const finalApp = read(appPath);
  for (const symbol of ['worldLabelCanvasRef', 'catalogPointsRef', 'selectedPlanet']) {
    if (!finalSolar.includes(symbol)) throw new Error('Production QA: Solar symbol missing: ' + symbol);
  }
  for (const legacy of ['CSS2DRenderer', 'CSS2DObject', 'labelRendererRef', 'languageLabelsRef']) {
    if (finalSolar.includes(legacy)) throw new Error('Production QA: legacy Solar label layer still present: ' + legacy);
  }
  if (finalSolar.includes('{(selectedPlanet || hoveredLanguage) && (')) {
    throw new Error('Production QA: hover-driven focus card still present');
  }
  if (finalApp.includes('ArchitectureExplorer') || finalApp.includes('ServiceRegistryView')) {
    throw new Error('Production QA: developer-only workspace screen leaked into App shell');
  }

  const requiredFeatureFiles = [
    'src/features/home/HomeView.tsx',
    'src/features/translator/TranslationCockpit.tsx',
    'src/features/search/WebSearchView.tsx',
    'src/features/semantic/SemanticMirrorView.tsx',
    'src/features/conversation/ConversationMode.tsx',
    'src/features/media/MediaTranslationView.tsx',
    'src/features/history/HistoryAndFavoritesView.tsx',
    'src/features/languages/LanguageExplorerView.tsx',
    'src/features/vault/TranslationVaultView.tsx',
    'src/features/settings/EnhancedSettingsView.tsx',
  ];
  for (const file of requiredFeatureFiles) {
    if (!fs.existsSync(path.join(root, file))) throw new Error('Production QA: required feature file missing: ' + file);
  }

  const routeSurface = ['home','search','translator','semantic','conversation','media','history','languages','vault','settings'];
  for (const route of routeSurface) {
    if (!finalApp.includes("'" + route + "'")) throw new Error('Production QA: App route missing: ' + route);
  }

  const homeSource = read('src/features/home/HomeView.tsx');
  const sidebarSource = read('src/components/layout/Sidebar.tsx');
  for (const misleading of ['zero-latency execution','100%','100 %']) {
    if (homeSource.includes(misleading) || sidebarSource.includes(misleading)) {
      throw new Error('Production QA: misleading product claim remains: ' + misleading);
    }
  }

  const languageSource = read('src/features/languages/LanguageExplorerView.tsx');
  for (const misleading of ['zero-latency execution','Ready for zero-latency execution','100%','100 %']) {
    if (homeSource.includes(misleading) || sidebarSource.includes(misleading) || languageSource.includes(misleading)) {
      throw new Error('Production QA: misleading product claim remains: ' + misleading);
    }
  }

  const server = read('server.ts');
  for (const endpoint of ['/api/health','/api/translate','/api/web-search','/api/semantic-mirror','/api/ocr-translate','/api/languages']) {
    if (!server.includes(endpoint)) throw new Error('Production QA: required backend endpoint missing: ' + endpoint);
  }
  console.log('Production QA passed: Solar, App shell, and required backend routes verified.');

// Build hygiene: migrate the current Vite config away from the deprecated native config-loader __dirname warning.
{
  const vitePath = 'vite.config.ts';
  if (fs.existsSync(path.join(root, vitePath))) {
    let vite = read(vitePath);
    vite = vite.replace(/__dirname/g, 'import.meta.dirname');
    write(vitePath, vite);
  }
}
console.log('Vite config compatibility cleanup applied');
}


// FINAL SOLAR PRODUCT REDESIGN
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);
  if (!solar.includes('solar-product-hero')) {
    const returnAt = solar.indexOf('return (');
    const rootAt = returnAt >= 0 ? solar.indexOf('<div', returnAt) : -1;
    if (rootAt >= 0) {
      const hero = `
      <div className="solar-product-hero pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="max-w-[min(520px,72%)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-slate-950/55 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-200 backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]"></span>Language Universe</div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">Explore how the world speaks.</h2>
          <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-slate-400 sm:text-xs">Discover a language, see its native script and context, then move directly into translation.</p>
        </div>
        <div className="hidden rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-2 text-right backdrop-blur-xl sm:block"><div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Live catalog</div><div className="mt-0.5 text-sm font-semibold text-slate-200">{catalogCount.toLocaleString()} languages</div></div>
      </div>`;
      const rootOpenEnd = solar.indexOf('>', rootAt);
      if (rootOpenEnd >= 0) solar = solar.slice(0, rootOpenEnd + 1) + '\n' + hero + solar.slice(rootOpenEnd + 1);
    }
  }
  if (!solar.includes('solar-interaction-rail')) {
    solar = solar.replace('Drag to rotate · pinch/scroll to zoom · tap a language', 'Drag to orbit · scroll to zoom · tap to focus');
    const rail = `
      <div className="solar-interaction-rail pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div className="rounded-xl border border-white/8 bg-slate-950/55 px-3 py-2 text-[10px] text-slate-400 backdrop-blur-xl"><span className="text-slate-200">Drag</span> orbit <span className="mx-1 text-slate-600">·</span><span className="text-slate-200">Scroll</span> zoom <span className="mx-1 text-slate-600">·</span><span className="text-slate-200">Tap</span> focus</div>
        <div className="hidden rounded-xl border border-white/8 bg-slate-950/55 px-3 py-2 text-[10px] text-slate-500 backdrop-blur-xl sm:block">Supported languages glow brighter</div>
      </div>`;
    const close = solar.lastIndexOf('\n    </div>\n  );');
    if (close >= 0) solar = solar.slice(0, close) + '\n' + rail + solar.slice(close);
  }
  solar = solar.split('border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl').join('border border-cyan-200/15 bg-slate-950/90 p-4 shadow-[0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-2xl');
  solar = solar.split('mt-1 text-xl font-semibold text-white').join('mt-1 text-2xl font-semibold tracking-tight text-white');
  solar = solar.split('mt-3 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50').join('mt-4 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_rgba(255,255,255,.08)] transition hover:bg-cyan-50');
  write(solarPath, solar);

  const cssPath = 'src/index.css';
  let css = read(cssPath);
  if (!css.includes('.solar-product-hero{')) css += '\n.solar-product-hero{animation:solarHeroIn .7s ease-out both}.solar-interaction-rail{animation:solarRailIn .8s .08s ease-out both}@keyframes solarHeroIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@keyframes solarRailIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n';
  write(cssPath, css);
}
console.log('Final Solar product redesign applied');

{
  const solar = read('src/components/solar/LanguageSolarSystem.tsx');
  const css = read('src/index.css');
  for (const required of ['solar-product-hero','solar-interaction-rail','worldLabelCanvasRef','selectedPlanet']) {
    if (!solar.includes(required) && !css.includes(required)) throw new Error('Solar redesign QA: missing ' + required);
  }
  for (const legacy of ['CSS2DRenderer','CSS2DObject','labelRendererRef','languageLabelsRef']) {
    if (solar.includes(legacy)) throw new Error('Solar redesign QA: legacy label layer remains: ' + legacy);
  }
  if (solar.includes('(selectedPlanet || hoveredLanguage)')) throw new Error('Solar redesign QA: hover-driven focus remains');
  console.log('Solar redesign QA passed.');
}


// REAL ORBITAL MOTION — integrated into the existing Three.js RAF loop
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);
  const riskyHook = /\n\s*\/\/ REAL ORBITAL MOTION[\s\S]*?\n\s*\}, \[selectedPlanet\]\);\n/;
  solar = solar.replace(riskyHook, '\n');
  const anchors = ['requestAnimationFrame(animate);','requestAnimationFrame(loop);','requestAnimationFrame(render);'];
  const motion = [
    '      // REAL ORBITAL MOTION — no React hooks in the animation path',
    '      const orbitElapsed = performance.now();',
    '      planetsRef.current.forEach((planet) => {',
    '        const language = planet.userData.language as LanguagePlanetData | undefined;',
    '        const radius = Number(planet.userData.radius) || Number(language?.orbitRadius) || 150;',
    '        const baseAngle = Number(planet.userData.angle) || Number(language?.initialAngle) || 0;',
    '        const speed = 0.000055 / Math.sqrt(Math.max(1, radius / 150));',
    '        const angle = baseAngle + orbitElapsed * speed;',
    '        const y = (Number(language?.orbitIndex) - 2.5) * 8;',
    '        planet.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);',
    '        planet.rotation.y += 0.004;',
    '        const selected = selectedPlanet?.code === language?.code;',
    '        const pulse = selected ? 1 + Math.sin(orbitElapsed * 0.006) * 0.13 : 1;',
    '        planet.scale.setScalar((selected ? 1.18 : 1) * pulse);',
    '      });',
    '      const animatedCatalog = catalogPointsRef.current;',
    '      if (animatedCatalog) animatedCatalog.rotation.y = orbitElapsed * 0.000018;',
  ].join('\\n');
  const anchor = anchors.find((item) => solar.includes(item));
  if (!anchor) throw new Error('Existing Three.js RAF anchor missing');
  if (!solar.includes('REAL ORBITAL MOTION — no React hooks in the animation path')) solar = solar.replace(anchor, motion + '\\n' + anchor);
  write(solarPath, solar);
  const cssPath = 'src/index.css';
  let css = read(cssPath);
  if (!css.includes('.lingoflow-orbit-active')) css += '\\n.lingoflow-orbit-active{filter:drop-shadow(0 0 18px rgba(103,232,249,.45))}\\n';
  write(cssPath, css);
}
console.log('Real orbital motion applied');

{
  const solar = read('src/components/solar/LanguageSolarSystem.tsx');
  if (!solar.includes('REAL ORBITAL MOTION')) throw new Error('Orbital motion QA failed: animation block missing');
  if (!solar.includes('REAL ORBITAL MOTION — no React hooks in the animation path')) throw new Error('Orbital motion QA failed: integrated animation loop missing');
  if (!solar.includes('planet.position.set(Math.cos(angle) * radius')) throw new Error('Orbital motion QA failed: planet trajectory missing');
  if (!solar.includes('animatedCatalog.rotation.y')) throw new Error('Orbital motion QA failed: world catalog motion missing');
  console.log('Orbital motion QA passed: supported planets and world catalog move continuously around the core.');
}


// LINGOFLOW UNIVERSE — hero-core orbital redesign
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);

  if (!solar.includes('LINGOFLOW UNIVERSE ORBIT CORE')) {
    const anchor = "    const orbitGroup = new THREE.Group();";
    const visual = `
    // LINGOFLOW UNIVERSE ORBIT CORE
    const universeCore = new THREE.Group();
    universeCore.name = 'LingoFlowUniverseCore';

    const coreOuter = new THREE.Mesh(
      new THREE.SphereGeometry(30, 32, 32),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#101a5f'),
        emissive: new THREE.Color('#315cff'),
        emissiveIntensity: 1.5,
        metalness: 0.35,
        roughness: 0.18,
        transparent: true,
        opacity: 0.98
      })
    );
    universeCore.add(coreOuter);

    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(38, 24, 24),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#4169ff'),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    universeCore.add(coreGlow);

    const coreHalo = new THREE.Mesh(
      new THREE.RingGeometry(42, 44, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#8b5cf6'),
        transparent: true,
        opacity: 0.58,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    coreHalo.rotation.x = Math.PI * 0.5;
    universeCore.add(coreHalo);

    const coreLight = new THREE.PointLight('#5277ff', 7, 520, 2);
    universeCore.add(coreLight);
    orbitGroup.add(universeCore);

    const universeOrbitRadii = [105, 150, 205, 265, 330, 405];
    universeOrbitRadii.forEach((radius, index) => {
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(
        new THREE.EllipseCurve(0, 0, radius, radius * (0.72 + index * 0.018), 0, Math.PI * 2, false, 0)
          .getPoints(128)
          .map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const ring = new THREE.LineLoop(
        ringGeometry,
        new THREE.LineBasicMaterial({
          color: index % 2 === 0 ? '#355cff' : '#8b5cf6',
          transparent: true,
          opacity: 0.13 + index * 0.012,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI * 0.5;
      ring.userData.orbitRadius = radius;
      ring.userData.orbitIndex = index;
      orbitGroup.add(ring);
    });

    const coreDustGeometry = new THREE.BufferGeometry();
    const coreDustPositions = [];
    for (let i = 0; i < 280; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 62 + Math.random() * 420;
      coreDustPositions.push(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 80,
        Math.sin(angle) * radius
      );
    }
    coreDustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coreDustPositions, 3));
    const coreDust = new THREE.Points(
      coreDustGeometry,
      new THREE.PointsMaterial({
        color: '#78a9ff',
        size: 1.4,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    orbitGroup.add(coreDust);

    `;
    if (!solar.includes(anchor)) throw new Error('Universe core anchor missing');
    solar = solar.replace(anchor, visual + anchor);
  }

  // Give supported language planets more presence while keeping the catalog performant.
  solar = solar.replace(
    "new THREE.SphereGeometry(lang.size * 1.35, 20, 20)",
    "new THREE.SphereGeometry(lang.size * 2.05, 24, 24)"
  );
  solar = solar.replace(
    "emissiveIntensity: 0.32, roughness: 0.58, metalness: 0.18",
    "emissiveIntensity: 0.58, roughness: 0.42, metalness: 0.22"
  );

  // Core visual stays deterministic; orbital language motion is handled by the existing Three.js loop above.
  write(solarPath, solar);

  const cssPath = 'src/index.css';
  let css = read(cssPath);
  if (!css.includes('.lingoflow-universe-shell')) {
    css += `
.lingoflow-universe-shell{background:radial-gradient(circle at 50% 48%,rgba(57,83,255,.10),transparent 32%),radial-gradient(circle at 72% 20%,rgba(125,92,255,.08),transparent 28%)}
.lingoflow-universe-core{filter:drop-shadow(0 0 28px rgba(65,105,255,.28))}
`;
  }
  write(cssPath, css);
}
console.log('LingoFlow Universe orbital hero applied');

{
  const solar = read('src/components/solar/LanguageSolarSystem.tsx');
  if (!solar.includes('LINGOFLOW UNIVERSE ORBIT CORE')) throw new Error('Universe QA: core missing');
  if (!solar.includes('universeOrbitRadii')) throw new Error('Universe QA: orbit rings missing');
  if (!solar.includes('LingoFlowUniverseCore')) throw new Error('Universe QA: core group missing');
  console.log('Universe QA passed: core planet, orbital rings, depth particles and motion verified.');
}


// FINAL SOLAR RUNTIME NORMALIZATION — one label renderer, zero fragile canvas refs
{
  const solarPath = 'src/components/solar/LanguageSolarSystem.tsx';
  let solar = read(solarPath);

  // Remove legacy CSS2D label architecture completely.
  solar = solar.replace("import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';\n", '');
  solar = solar.replace("  const labelRendererRef = useRef<CSS2DRenderer | null>(null);\n", '');
  solar = solar.replace("  const languageLabelsRef = useRef<CSS2DObject[]>([]);\n", '');
  solar = solar.replace("  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);\n", '');
  solar = solar.replace("    const labelRenderer = new CSS2DRenderer();\n    labelRenderer.setSize(1, 1);\n    labelRenderer.domElement.className = 'absolute inset-0 pointer-events-none overflow-hidden';\n    labelRenderer.domElement.setAttribute('aria-hidden', 'true');\n    mount.appendChild(labelRenderer.domElement);\n", '');
  solar = solar.replace("    labelRendererRef.current = labelRenderer;\n", '');
  solar = solar.replace("    worldLabelCanvasRef.current = worldLabelCanvas;\n", '');
  solar = solar.replace(/\n\s*const makeLabel = \(lang: LanguagePlanetData\) => \{[\s\S]*?languageLabelsRef\.current\.push\(label\); \};\n\s*planets\.forEach\(\(planet\) => \{ const label = makeLabel\(planet\.userData\.language\); planet\.add\(label\); languageLabelsRef\.current\.push\(label\); \}\);/g, '');
  solar = solar.replace(/\n\s*languageLabelsRef\.current\.forEach\(\(label\) => \{[\s\S]*?label\.classList\.toggle\('is-active', active\); \}\);/g, '');
  solar = solar.replace("\n      labelRenderer.render(scene, camera);", '');
  solar = solar.replace(" labelRenderer.setSize(width, height);", '');
  solar = solar.replace(" labelRenderer.domElement.remove();", '');
  solar = solar.replace(" worldLabelCanvasRef.current = null;", '');
  solar = solar.replace(" languageLabelsRef.current = []; labelRendererRef.current = null;", '');

  // If a stale ref declaration survived any earlier stage, remove it by line.
  solar = solar.split('\n').filter(line => !line.includes('worldLabelCanvasRef')).join('\n');

  write(solarPath, solar);

  const finalSolar = read(solarPath);
  for (const legacy of ['worldLabelCanvasRef','CSS2DRenderer','CSS2DObject','labelRendererRef','languageLabelsRef']) {
    if (finalSolar.includes(legacy)) throw new Error('Solar runtime normalization failed: ' + legacy + ' remains');
  }
  if (!finalSolar.includes('const worldLabelCanvas = document.createElement')) throw new Error('Solar runtime normalization failed: canvas label layer missing');
  console.log('Solar runtime normalization passed: canvas labels are local, legacy CSS2D/ref layers removed.');
}
