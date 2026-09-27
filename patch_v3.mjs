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
once(labelPath, "  const catalogPointsRef = useRef<THREE.Points | null>(null);", "  const catalogPointsRef = useRef<THREE.Points | null>(null);\n  const languageLabelsRef = useRef<CSS2DObject[]>([]);");
once(labelPath, "    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Language Solar System');\n    mount.appendChild(renderer.domElement);", "    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Language Solar System');\n    renderer.domElement.style.touchAction = 'none';\n    mount.appendChild(renderer.domElement);\n\n    const labelRenderer = new CSS2DRenderer();\n    labelRenderer.setSize(1, 1);\n    labelRenderer.domElement.className = 'absolute inset-0 pointer-events-none overflow-hidden';\n    labelRenderer.domElement.setAttribute('aria-hidden', 'true');\n    mount.appendChild(labelRenderer.domElement);");
once(labelPath, "    const orbitGroup = new THREE.Group();", "    const orbitGroup = new THREE.Group();\n    labelRendererRef.current = labelRenderer;");
once(labelPath, "    planetsRef.current = planets;\n\n    if (catalogEntries.length) {", "    planetsRef.current = planets;\n\n    const makeLabel = (lang: LanguagePlanetData) => { const el = document.createElement('div'); el.className = 'lingoflow-language-label'; el.textContent = lang.name; el.style.setProperty('--label-color', lang.color); const label = new CSS2DObject(el); label.position.set(0, lang.size * 1.9, 0); label.userData.language = lang; return label; };\n    planets.forEach((planet) => { const label = makeLabel(planet.userData.language); planet.add(label); languageLabelsRef.current.push(label); });\n\n    if (catalogEntries.length) {");
once(labelPath, "      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) {", "      languageLabelsRef.current.forEach((label) => { const lang = label.userData.language as LanguagePlanetData; const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode; const matches = st.matching.size === 0 || st.matching.has(lang.code); const distance = camera.position.distanceTo(label.getWorldPosition(new THREE.Vector3())); const visible = active || (matches && distance < (mobile ? 720 : 860)); label.element.style.opacity = visible ? '1' : '0'; label.element.classList.toggle('is-active', active); });\n      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) {");
once(labelPath, "      composer.render(dt);", "      composer.render(dt);\n      labelRenderer.render(scene, camera);");
once(labelPath, "      renderer.setSize(width, height, false); composer.setSize(width, height);", "      renderer.setSize(width, height, false); composer.setSize(width, height); labelRenderer.setSize(width, height);");
once(labelPath, "      composer.dispose(); renderer.dispose(); renderer.domElement.remove();", "      composer.dispose(); renderer.dispose(); labelRenderer.domElement.remove(); renderer.domElement.remove(); languageLabelsRef.current = []; labelRendererRef.current = null;");
once(labelPath, "className=\"relative w-full h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\"", "className=\"relative w-full h-[460px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\"");
once(labelPath, "Explore the world language catalog. Supported LingoFlow languages glow brighter.", "Drag to rotate · pinch/scroll to zoom · tap a language");
once('src/index.css', '/* LingoFlow Solar System labels */', '/* LingoFlow Solar System labels */');
const cssPath = 'src/index.css'; const css = read(cssPath); if (!css.includes('.lingoflow-language-label{')) write(cssPath, css + "\n.lingoflow-language-label{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;font-weight:700;letter-spacing:.01em;color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 1px 8px rgba(0,0,0,.98),0 0 12px var(--label-color);transform:translate(-50%,-100%);transition:opacity .18s ease}.lingoflow-language-label::before{content:'';display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:999px;background:var(--label-color);box-shadow:0 0 9px var(--label-color);vertical-align:1px}.lingoflow-language-label.is-active{font-weight:900;text-shadow:0 1px 10px #000,0 0 18px var(--label-color)}@media(max-width:767px){.lingoflow-language-label{font-size:9px}.lingoflow-language-label::before{width:4px;height:4px;margin-right:4px}}\n");
console.log('LingoFlow v3 patch applied');


// Full world-language labeling: every catalog point gets a lightweight 3D HTML label.
// The point field remains GPU-efficient while names stay visible and selectable.
const fullLabelPath = 'src/components/solar/LanguageSolarSystem.tsx';
const fullLabelSource = read(fullLabelPath);
if (!fullLabelSource.includes('catalogLabelAnchorsRef')) {
  let s = fullLabelSource;
  s = s.replace(
    "  const languageLabelsRef = useRef<CSS2DObject[]>([]);",
    "  const languageLabelsRef = useRef<CSS2DObject[]>([]);\n  const catalogLabelAnchorsRef = useRef<THREE.Object3D[]>([]);\n  const catalogLanguageLabelsRef = useRef<CSS2DObject[]>([]);"
  );
  s = s.replace(
    "      points.userData.languages = catalogEntries;\n      orbitGroup.add(points);\n      catalogPointsRef.current = points;",
    "      points.userData.languages = catalogEntries;\n      orbitGroup.add(points);\n      catalogPointsRef.current = points;\n\n      // Every world-catalog point gets a real label attached to its 3D position.\n      catalogEntries.forEach((lang, index) => {\n        const anchor = new THREE.Object3D();\n        anchor.position.set(pointPositions[index * 3], pointPositions[index * 3 + 1], pointPositions[index * 3 + 2]);\n        const el = document.createElement('div');\n        el.className = 'lingoflow-language-label lingoflow-catalog-label';\n        el.textContent = lang.name;\n        el.style.setProperty('--label-color', lang.color);\n        const label = new CSS2DObject(el);\n        label.position.set(0, 5, 0);\n        label.userData.language = lang;\n        anchor.add(label);\n        orbitGroup.add(anchor);\n        catalogLabelAnchorsRef.current.push(anchor);\n        catalogLanguageLabelsRef.current.push(label);\n      });"
  );
  s = s.replace(
    "      languageLabelsRef.current.forEach((label) => { const lang = label.userData.language as LanguagePlanetData; const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode; const matches = st.matching.size === 0 || st.matching.has(lang.code); const distance = camera.position.distanceTo(label.getWorldPosition(new THREE.Vector3())); const visible = active || (matches && distance < (mobile ? 720 : 860)); label.element.style.opacity = visible ? '1' : '0'; label.element.classList.toggle('is-active', active); });",
    "      languageLabelsRef.current.forEach((label) => { const lang = label.userData.language as LanguagePlanetData; const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode; const matches = st.matching.size === 0 || st.matching.has(lang.code); label.element.style.opacity = active ? '1' : matches ? (mobile ? '0.76' : '0.84') : '0.16'; label.element.classList.toggle('is-active', active); });\n      catalogLanguageLabelsRef.current.forEach((label) => { const lang = label.userData.language as LanguagePlanetData; const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode; const matches = st.matching.size === 0 || st.matching.has(lang.code); label.element.style.opacity = active ? '1' : matches ? (mobile ? '0.62' : '0.72') : '0.10'; label.element.classList.toggle('is-active', active); });"
  );
  s = s.replace(
    "      catalogPointsRef.current = null;\n      sceneRef.current = null;",
    "      catalogPointsRef.current = null;\n      catalogLabelAnchorsRef.current = [];\n      catalogLanguageLabelsRef.current = [];\n      sceneRef.current = null;"
  );
  s = s.replace(
    ".lingoflow-language-label{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;",
    ".lingoflow-language-label{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;"
  );
  if (!s.includes('.lingoflow-catalog-label')) {
    s = s.replace(
      ".lingoflow-language-label.is-active{font-weight:900;",
      ".lingoflow-catalog-label{font-size:8px;font-weight:650;letter-spacing:.005em}.lingoflow-catalog-label::before{width:4px;height:4px;margin-right:4px}.lingoflow-language-label.is-active{font-weight:900;"
    );
  }
  write(fullLabelPath, s);
}
console.log('LingoFlow full world-language labels patch applied');


// Stability guard: keep the world catalog GPU-light. Do not create thousands of DOM/CSS2D nodes.
// World languages remain represented by 3D points; labels are rendered for the focused/interactive subset.
const stableSolar = 'src/components/solar/LanguageSolarSystem.tsx';
let stableSource = read(stableSolar);
stableSource = stableSource.replace(/\n\s*\/\/ Every world-catalog point gets a real label attached to its 3D position\.\n\s*catalogEntries\.forEach\(\(lang, index\) => \{[\s\S]*?catalogLanguageLabelsRef\.current\.push\(label\);\n\s*\}\);/m, '');
stableSource = stableSource.replace(/\n\s*catalogLanguageLabelsRef\.current\.forEach\(\(label\) => \{[\s\S]*?label\.element\.classList\.toggle\('is-active', active\); \}\);/m, '');
stableSource = stableSource.replace(/\n\s*catalogLabelAnchorsRef\.current\.forEach\(\(anchor\) => anchor\.removeFromParent\(\)\);/m, '');
stableSource = stableSource.replace(/\n\s*catalogLabelAnchorsRef\.current = \[\];\n\s*catalogLanguageLabelsRef\.current = \[\];/m, '');
write(stableSolar, stableSource);
console.log('LingoFlow catalog label stability patch applied');



// Production-safe world language name renderer.
// Uses ONE canvas overlay for the entire catalog instead of thousands of DOM/CSS2D nodes.
const canvasSolar = 'src/components/solar/LanguageSolarSystem.tsx';
let canvasSource = read(canvasSolar);

if (!canvasSource.includes('lingoflow-world-label-canvas')) {
  canvasSource = canvasSource.replace(
    "  const languageLabelsRef = useRef<CSS2DObject[]>([]);",
    "  const languageLabelsRef = useRef<CSS2DObject[]>([]);\n  const worldLabelCanvasRef = useRef<HTMLCanvasElement | null>(null);"
  );

  canvasSource = canvasSource.replace(
    "    labelRenderer.domElement.setAttribute('aria-hidden', 'true');\n    mount.appendChild(labelRenderer.domElement);",
    "    labelRenderer.domElement.setAttribute('aria-hidden', 'true');\n    mount.appendChild(labelRenderer.domElement);\n\n    const worldLabelCanvas = document.createElement('canvas');\n    worldLabelCanvas.className = 'absolute inset-0 pointer-events-none';\n    worldLabelCanvas.id = 'lingoflow-world-label-canvas';\n    worldLabelCanvas.setAttribute('aria-hidden', 'true');\n    mount.appendChild(worldLabelCanvas);\n    worldLabelCanvasRef.current = worldLabelCanvas;\n    const worldLabelContext = worldLabelCanvas.getContext('2d', { alpha: true });"
  );

  canvasSource = canvasSource.replace(
    "    labelRendererRef.current = labelRenderer;",
    "    labelRendererRef.current = labelRenderer;\n\n    let lastWorldLabelPaint = 0;\n    const paintWorldLanguageLabels = (now = performance.now()) => {\n      if (!worldLabelContext || !catalogPointsRef.current) return;\n      if (now - lastWorldLabelPaint < (mobile ? 180 : 120)) return;\n      lastWorldLabelPaint = now;\n      const rect = mount.getBoundingClientRect();\n      const dpr = Math.min(window.devicePixelRatio || 1, 2);\n      const width = Math.max(1, Math.floor(rect.width));\n      const height = Math.max(1, Math.floor(rect.height));\n      if (worldLabelCanvas.width !== Math.floor(width * dpr) || worldLabelCanvas.height !== Math.floor(height * dpr)) {\n        worldLabelCanvas.width = Math.floor(width * dpr);\n        worldLabelCanvas.height = Math.floor(height * dpr);\n        worldLabelCanvas.style.width = width + 'px';\n        worldLabelCanvas.style.height = height + 'px';\n      }\n      worldLabelContext.setTransform(dpr, 0, 0, dpr, 0, 0);\n      worldLabelContext.clearRect(0, 0, width, height);\n      const points = catalogPointsRef.current;\n      const positions = points.geometry.getAttribute('position');\n      const languages = points.userData.languages || [];\n      const projected = new THREE.Vector3();\n      const cameraForward = new THREE.Vector3();\n      camera.getWorldDirection(cameraForward);\n      worldLabelContext.textAlign = 'center';\n      worldLabelContext.textBaseline = 'middle';\n      worldLabelContext.font = mobile ? '600 7px Inter, system-ui, sans-serif' : '600 8px Inter, system-ui, sans-serif';\n      for (let i = 0; i < languages.length; i += 1) {\n        projected.fromBufferAttribute(positions, i).applyMatrix4(points.matrixWorld).project(camera);\n        if (projected.z < -1 || projected.z > 1 || projected.x < -1.08 || projected.x > 1.08 || projected.y < -1.08 || projected.y > 1.08) continue;\n        const x = (projected.x * 0.5 + 0.5) * width;\n        const y = (-projected.y * 0.5 + 0.5) * height;\n        const lang = languages[i];\n        const active = lang.code === st.sourceLanguageCode || lang.code === st.targetLanguageCode;\n        const matches = st.matching.size === 0 || st.matching.has(lang.code);\n        const alpha = active ? 1 : matches ? 0.72 : 0.18;\n        worldLabelContext.globalAlpha = alpha;\n        worldLabelContext.fillStyle = lang.color || '#cbd5e1';\n        worldLabelContext.shadowBlur = active ? 10 : 5;\n        worldLabelContext.shadowColor = lang.color || '#7dd3fc';\n        worldLabelContext.fillText(lang.name, x, y - 6);\n      }\n      worldLabelContext.globalAlpha = 1;\n      worldLabelContext.shadowBlur = 0;\n    };"
  );

  canvasSource = canvasSource.replace(
    "      composer.render(dt);\n      labelRenderer.render(scene, camera);",
    "      composer.render(dt);\n      labelRenderer.render(scene, camera);\n      paintWorldLanguageLabels();"
  );

  canvasSource = canvasSource.replace(
    "      composer.dispose(); renderer.dispose(); labelRenderer.domElement.remove(); renderer.domElement.remove();",
    "      composer.dispose(); renderer.dispose(); labelRenderer.domElement.remove(); worldLabelCanvas.remove(); worldLabelCanvasRef.current = null; renderer.domElement.remove();"
  );

  canvasSource = canvasSource.replace(
    "className=\"relative w-full h-[460px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\"",
    "className=\"relative w-full h-[460px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\""
  );

  write(canvasSolar, canvasSource);
}
console.log('LingoFlow production canvas world-language labels patch applied');


// Final cinematic language-orb upgrade.
// World catalog languages are rendered as GPU-efficient instanced 3D orbs,
// while the single canvas label layer keeps every name readable without DOM overload.
const orbSolar = 'src/components/solar/LanguageSolarSystem.tsx';
let orbSource = read(orbSolar);

if (!orbSource.includes('LingoFlow instanced world language orbs')) {
  orbSource = orbSource.replace(
    "  const catalogPointsRef = useRef(null);",
    "  const catalogPointsRef = useRef(null);\n  const worldOrbPositionsRef = useRef<number[]>([]);"
  );

  const pointsBlock = /    if \(catalogEntries\.length\) \{\n      const pointGeometry = new THREE\.BufferGeometry\(\);\n      pointGeometry\.setAttribute\('position', new THREE\.Float32BufferAttribute\(pointPositions, 3\)\);\n      pointGeometry\.setAttribute\('color', new THREE\.Float32BufferAttribute\(pointColors, 3\)\);\n      const points = new THREE\.Points\(pointGeometry, new THREE\.PointsMaterial\(\{ size: mobile \? 3\.4 : 4\.5, vertexColors: true, transparent: true, opacity: 0\.72, sizeAttenuation: true \}\)\);\n      points\.userData\.languages = catalogEntries;\n      orbitGroup\.add\(points\);\n      catalogPointsRef\.current = points;\n    \}/m;

  const orbBlock = `    if (catalogEntries.length) {
      const orbGeometry = new THREE.SphereGeometry(2.35, mobile ? 6 : 8, mobile ? 6 : 8);
      const orbMaterial = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0.18,
        roughness: 0.5,
        metalness: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
      });
      const orbs = new THREE.InstancedMesh(orbGeometry, orbMaterial, catalogEntries.length);
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      for (let i = 0; i < catalogEntries.length; i += 1) {
        dummy.position.set(pointPositions[i * 3], pointPositions[i * 3 + 1], pointPositions[i * 3 + 2]);
        const scale = catalogEntries[i].size ? Math.max(0.72, Math.min(1.35, catalogEntries[i].size / 3.8)) : 1;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        orbs.setMatrixAt(i, dummy.matrix);
        color.set(catalogEntries[i].color || '#7dd3fc');
        orbs.setColorAt(i, color);
      }
      orbs.instanceMatrix.needsUpdate = true;
      if (orbs.instanceColor) orbs.instanceColor.needsUpdate = true;
      orbs.userData.languages = catalogEntries;
      orbs.userData.positions = pointPositions;
      orbitGroup.add(orbs);
      catalogPointsRef.current = orbs;
      worldOrbPositionsRef.current = pointPositions;
    }`;
  if (!pointsBlock.test(orbSource)) throw new Error('World catalog point block not found for orb upgrade');
  orbSource = orbSource.replace(pointsBlock, orbBlock);

  orbSource = orbSource.replace(
    "const catalogLanguage = pointHit && typeof pointHit.index === 'number' ? catalogPointsRef.current?.userData.languages?.[pointHit.index] : undefined;",
    "const hitIndex = pointHit?.instanceId ?? pointHit?.index;\n      const catalogLanguage = pointHit && typeof hitIndex === 'number' ? catalogPointsRef.current?.userData.languages?.[hitIndex] : undefined;"
  );
  orbSource = orbSource.replace(
    "if (pointHit && typeof pointHit.index === 'number') { const language = catalogPointsRef.current.userData.languages?.[pointHit.index];",
    "const hitIndex = pointHit?.instanceId ?? pointHit?.index; if (pointHit && typeof hitIndex === 'number') { const language = catalogPointsRef.current.userData.languages?.[hitIndex];"
  );
  orbSource = orbSource.replace(
    "const positions = points.geometry.getAttribute('position');\n      const languages = points.userData.languages || [];",
    "const worldPositions = points.userData.positions || [];\n      const languages = points.userData.languages || [];"
  );
  orbSource = orbSource.replace(
    "projected.fromBufferAttribute(positions, i).applyMatrix4(points.matrixWorld).project(camera);",
    "projected.set(worldPositions[i * 3] || 0, worldPositions[i * 3 + 1] || 0, worldPositions[i * 3 + 2] || 0).applyMatrix4(points.matrixWorld).project(camera);"
  );
  orbSource = orbSource.replace(
    "worldLabelContext.font = mobile ? '600 7px Inter, system-ui, sans-serif' : '600 8px Inter, system-ui, sans-serif';",
    "worldLabelContext.font = mobile ? '700 8px Inter, system-ui, sans-serif' : '700 9px Inter, system-ui, sans-serif';"
  );
  orbSource = orbSource.replace(
    "worldLabelContext.fillText(lang.name, x, y - 6);",
    "worldLabelContext.fillText(lang.name, x, y - (mobile ? 8 : 10));"
  );
  orbSource = orbSource.replace(
    "const alpha = active ? 1 : matches ? 0.72 : 0.18;",
    "const alpha = active ? 1 : matches ? 0.82 : 0.22;"
  );
  orbSource = orbSource.replace(
    "worldLabelContext.shadowBlur = active ? 10 : 5;",
    "worldLabelContext.shadowBlur = active ? 14 : 7;"
  );
  orbSource = orbSource.replace(
    "      catalogPointsRef.current = null;",
    "      catalogPointsRef.current = null;\n      worldOrbPositionsRef.current = [];"
  );
  orbSource += "\n/* LingoFlow instanced world language orbs */\n";
  write(orbSolar, orbSource);
}
console.log('LingoFlow instanced world language orbs patch applied');


// Production App shell: isolated feature failures + lazy feature loading for a faster first paint.
const productionApp = 'src/App.tsx';
write(productionApp, "import React, { Component, Suspense, type ErrorInfo, type ReactNode, lazy, useEffect, useState } from 'react';\nimport { WorkspaceViewId } from './types/navigation';\nimport { ThemeProvider } from './hooks/useTheme';\nimport { AppShell } from './components/layout/AppShell';\nimport { SplashScreen } from './components/feedback/SplashScreen';\n\nconst HomeView = lazy(() => import('./features/home/HomeView').then(m => ({ default: m.HomeView })));\nconst TranslationCockpit = lazy(() => import('./features/translator/TranslationCockpit').then(m => ({ default: m.TranslationCockpit })));\nconst WebSearchView = lazy(() => import('./features/search/WebSearchView').then(m => ({ default: m.WebSearchView })));\nconst SemanticMirrorView = lazy(() => import('./features/semantic/SemanticMirrorView').then(m => ({ default: m.SemanticMirrorView })));\nconst ConversationMode = lazy(() => import('./features/conversation/ConversationMode').then(m => ({ default: m.ConversationMode })));\nconst MediaTranslationView = lazy(() => import('./features/media/MediaTranslationView').then(m => ({ default: m.MediaTranslationView })));\nconst HistoryAndFavoritesView = lazy(() => import('./features/history/HistoryAndFavoritesView').then(m => ({ default: m.HistoryAndFavoritesView })));\nconst LanguageExplorerView = lazy(() => import('./features/languages/LanguageExplorerView').then(m => ({ default: m.LanguageExplorerView })));\nconst TranslationVaultView = lazy(() => import('./features/vault/TranslationVaultView').then(m => ({ default: m.TranslationVaultView })));\nconst EnhancedSettingsView = lazy(() => import('./features/settings/EnhancedSettingsView').then(m => ({ default: m.EnhancedSettingsView })));\nconst serviceRegistryPromise = import('./services/core/ServiceRegistry').then(m => m.serviceRegistry);\n\nclass ViewErrorBoundary extends Component<{ viewName: string; children: ReactNode }, { hasError: boolean; message: string }> {\n  state = { hasError: false, message: '' };\n  static getDerivedStateFromError(error: Error) { return { hasError: true, message: error?.message || 'Unexpected workspace error.' }; }\n  componentDidCatch(error: Error, info: ErrorInfo) { console.error(`LingoFlow ${this.props.viewName} error:`, error, info); }\n  retry = () => this.setState({ hasError: false, message: '' });\n  render() {\n    if (!this.state.hasError) return this.props.children;\n    return <section className=\"min-h-[60vh] flex items-center justify-center p-6\"><div className=\"w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-xl\"><div className=\"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300\">!</div><h2 className=\"text-xl font-semibold text-white\">This workspace view needs a retry</h2><p className=\"mt-2 text-sm text-slate-400\">The rest of LingoFlow is protected. This view failed without taking down the workspace.</p>{this.state.message && <p className=\"mt-3 break-words rounded-xl bg-black/30 p-3 text-left text-xs text-slate-500\">{this.state.message}</p>}<button type=\"button\" onClick={this.retry} className=\"mt-5 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15\">Retry view</button></div></section>;\n  }\n}\n\nfunction ViewLoading() {\n  return <section className=\"min-h-[60vh] flex items-center justify-center p-6\"><div className=\"flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm text-slate-300 backdrop-blur-xl\"><span className=\"h-2 w-2 animate-pulse rounded-full bg-cyan-300\" />Loading workspace…</div></section>;\n}\n\nfunction WorkspaceRoot() {\n  const [isReady, setIsReady] = useState(false);\n  const [activeView, setActiveView] = useState<WorkspaceViewId>('home');\n  const [sourceLanguage, setSourceLanguage] = useState('en');\n  const [targetLanguage, setTargetLanguage] = useState('es');\n  const [semanticPayload, setSemanticPayload] = useState<{ sourceText: string; translatedText: string } | null>(null);\n  const [semanticFidelityScore, setSemanticFidelityScore] = useState<number | null>(null);\n  const [semanticIntegrityStatus, setSemanticIntegrityStatus] = useState<'preserved' | 'nuance_change' | 'meaning_changed' | null>(null);\n  const [meaningLockActive, setMeaningLockActive] = useState(false);\n  const [lockedTermsCount, setLockedTermsCount] = useState(0);\n\n  useEffect(() => {\n    let mounted = true;\n    void serviceRegistryPromise.then(({ initializeAll }) => initializeAll()).catch(error => console.error('LingoFlow initialization error:', error)).finally(() => { if (mounted) setIsReady(true); });\n    return () => { mounted = false; };\n  }, []);\n\n  const handleSwapLanguages = () => { const current = sourceLanguage; setSourceLanguage(targetLanguage); setTargetLanguage(current); };\n  const handleOpenSemanticMirror = (source: string, translated: string) => { setSemanticPayload({ sourceText: source, translatedText: translated }); setActiveView('semantic'); };\n  const handleSelectFromHistory = (source: string, target: string, sLang: string, tLang: string) => { setSourceLanguage(sLang); setTargetLanguage(tLang); setSemanticPayload({ sourceText: source, translatedText: target }); setActiveView('translator'); };\n\n  const renderView = () => {\n    switch (activeView) {\n      case 'home': return <HomeView sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSelectSource={setSourceLanguage} onSelectTarget={setTargetLanguage} onSwapLanguages={handleSwapLanguages} onNavigate={setActiveView} semanticFidelityScore={semanticFidelityScore} semanticIntegrityStatus={semanticIntegrityStatus} meaningLockActive={meaningLockActive} lockedTermsCount={lockedTermsCount} />;\n      case 'search': return <WebSearchView />;\n      case 'translator': return <TranslationCockpit sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSourceChange={setSourceLanguage} onTargetChange={setTargetLanguage} onSwap={handleSwapLanguages} onOpenSemanticMirror={handleOpenSemanticMirror} />;\n      case 'semantic': return <SemanticMirrorView sourceText={semanticPayload?.sourceText || ''} translatedText={semanticPayload?.translatedText || ''} sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onApplyRevision={(revised) => setSemanticPayload(current => current ? { ...current, translatedText: revised } : current)} onUpdateIntegrity={(score, status, count) => { setSemanticFidelityScore(score); setSemanticIntegrityStatus(status); setLockedTermsCount(count); setMeaningLockActive(count > 0); }} />;\n      case 'conversation': return <ConversationMode />;\n      case 'media': return <MediaTranslationView />;\n      case 'history': return <HistoryAndFavoritesView onSelectForCockpit={handleSelectFromHistory} />;\n      case 'languages': return <LanguageExplorerView />;\n      case 'vault': return <TranslationVaultView />;\n      case 'settings': return <EnhancedSettingsView />;\n      default: return <HomeView sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} onSelectSource={setSourceLanguage} onSelectTarget={setTargetLanguage} onSwap={handleSwapLanguages} onNavigate={setActiveView} semanticFidelityScore={semanticFidelityScore} semanticIntegrityStatus={semanticIntegrityStatus} meaningLockActive={meaningLockActive} lockedTermsCount={lockedTermsCount} />;\n    }\n  };\n\n  return <>\n    {!isReady && <SplashScreen onComplete={() => setIsReady(true)} minDurationMs={320} />}\n    <AppShell activeView={activeView} onSelectView={setActiveView}>\n      <ViewErrorBoundary viewName={activeView}><Suspense fallback={<ViewLoading />}>{renderView()}</Suspense></ViewErrorBoundary>\n    </AppShell>\n  </>;\n}\n\nexport default function App() { return <ThemeProvider><WorkspaceRoot /></ThemeProvider>; }\n");
console.log('LingoFlow production App shell applied');
