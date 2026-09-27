import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(root, p), v);
const once = (p, a, b) => { const s = read(p); if (!s.includes(a)) throw new Error('Patch anchor missing: ' + p); write(p, s.replace(a, b)); };

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

const animateAnchor = "      core.rotation.y += dt * 0.15;";
once(solarPath, animateAnchor,
  "      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) { const colors = catalogPoints.geometry.getAttribute('color'); const languages = catalogPoints.userData.languages || []; for (let i = 0; i < languages.length; i += 1) { const lang = languages[i]; const matches = st.matching.size === 0 || st.matching.has(lang.code); const base = new THREE.Color(lang.color); const factor = matches ? 0.8 : 0.08; colors.setXYZ(i, base.r * factor, base.g * factor, base.b * factor); } colors.needsUpdate = true; }\n      core.rotation.y += dt * 0.15;"
);

once(solarPath, "      catalogPointsRef.current = null;\n", "      catalogPointsRef.current = null;\n");

console.log('LingoFlow v3 patch applied');