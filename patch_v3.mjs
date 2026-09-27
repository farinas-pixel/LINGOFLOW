import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, value) => fs.writeFileSync(path.join(root, p), value);
const replace = (p, from, to) => {
  const file = read(p);
  if (!file.includes(from)) throw new Error(`Patch anchor not found in ${p}`);
  write(p, file.replace(from, to));
};

replace('server.ts',
  '// Web Search Endpoint (Gemini Google Search grounding)',
  `// World language catalog (Glottolog 5.3 / ISO 639-3 mapping)
let worldLanguageCatalogCache = null;
let worldLanguageCatalogPromise = null;

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(value); value = ''; }
    else value += char;
  }
  values.push(value);
  return values;
}

async function loadWorldLanguageCatalog() {
  if (worldLanguageCatalogCache) return worldLanguageCatalogCache;
  if (worldLanguageCatalogPromise) return worldLanguageCatalogPromise;
  worldLanguageCatalogPromise = (async () => {
    const response = await fetch('https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv');
    if (!response.ok) throw new Error(`World language catalog request failed: ${response.status}`);
    const csv = await response.text();
    const lines = csv.split(/\\r?\\n/).filter(Boolean);
    const header = parseCsvLine(lines[0]);
    const index = new Map(header.map((name, i) => [name, i]));
    const rows = lines.slice(1).map(parseCsvLine);
    const familyNames = new Map();
    rows.forEach((row) => {
      if (row[index.get('Level') ?? -1] === 'family') {
        const id = row[index.get('ID') ?? -1], name = row[index.get('Name') ?? -1];
        if (id && name) familyNames.set(id, name);
      }
    });
    const entries = rows
      .filter((row) => row[index.get('Level') ?? -1] === 'language' && Boolean(row[index.get('ISO639P3code') ?? -1]))
      .map((row) => ({
        code: row[index.get('ISO639P3code') ?? -1],
        name: row[index.get('Name') ?? -1],
        nativeName: row[index.get('Name') ?? -1],
        script: 'Language catalog',
        family: familyNames.get(row[index.get('Family_ID') ?? -1]) || 'World language',
        level: 'language'
      }));
    worldLanguageCatalogCache = entries;
    return entries;
  })().catch((error) => { worldLanguageCatalogPromise = null; throw error; });
  return worldLanguageCatalogPromise;
}

app.get('/api/languages', async (_req, res) => {
  try {
    const languages = await loadWorldLanguageCatalog();
    res.json({ source: 'Glottolog 5.3', standard: 'ISO 639-3', count: languages?.length ?? 0, languages });
  } catch (error) {
    console.error('World language catalog error:', error);
    res.status(503).json({ error: 'World language catalog is temporarily unavailable.' });
  }
});

// Web Search Endpoint (Gemini Google Search grounding)`
);

replace('src/config/app.config.ts', "label: 'Languages',", "label: 'World Languages',");

replace('src/features/home/HomeView.tsx',
  "import {\n  Sparkles,\n  ArrowRight,\n  HardDrive,\n  MessagesSquare,\n  FileText,\n  ShieldCheck,\n  Layers,\n  Zap,\n  Globe,\n  Lock,\n} from 'lucide-react';",
  "import { Sparkles, ArrowRight } from 'lucide-react';"
);
replace('src/features/home/HomeView.tsx', "import { Card } from '../../components/ui/Card';\n", "");
replace('src/features/home/HomeView.tsx', "import { cn } from '../../utils/cn';\n", "");
replace('src/features/home/HomeView.tsx', "  semanticFidelityScore = 100,\n  semanticIntegrityStatus = 'preserved',\n  meaningLockActive = true,", "  semanticFidelityScore,\n  semanticIntegrityStatus = null,\n  meaningLockActive = false,");
replace('src/features/home/HomeView.tsx',
  "            LingoFlow brings translation, semantic verification, voice, image/document input, offline packs, and cloud storage into one workspace.",
  "            Translate text, understand meaning, speak naturally, work with images and documents, and reuse what you save."
);
const home = read('src/features/home/HomeView.tsx');
const workflowStart = home.indexOf("  const workflowSteps = [");
const workflowEnd = home.indexOf("  return (", workflowStart);
if (workflowStart !== -1 && workflowEnd !== -1) write('src/features/home/HomeView.tsx', home.slice(0, workflowStart) + home.slice(workflowEnd));
const home2 = read('src/features/home/HomeView.tsx');
const marker = "      {/* The 8-Step Product Flow Grid */}";
if (home2.includes(marker)) write('src/features/home/HomeView.tsx', home2.slice(0, home2.indexOf(marker)) + "    </div>\n  );\n}\n");

replace('src/components/layout/Sidebar.tsx',
  "Production-focused TypeScript architecture with explicit service states.",
  "Real translation workspace · local history · connected AI"
);
replace('src/components/layout/Sidebar.tsx', "Storage: Local", "Local workspace");

replace('src/features/languages/LanguageExplorerView.tsx',
  "Ready for zero-latency execution",
  "Available offline when an installed local pack supports it"
);

replace('src/components/solar/LanguageSolarSystem.tsx', "  semanticFidelityScore = 100,\n  semanticIntegrityStatus = 'preserved',\n  meaningLockActive = true,", "  semanticFidelityScore,\n  semanticIntegrityStatus = null,\n  meaningLockActive = false,");
replace('src/components/solar/LanguageSolarSystem.tsx', "  const planetsRef = useRef<PlanetObject[]>([]);", "  const planetsRef = useRef<PlanetObject[]>([]);\n  const catalogPointsRef = useRef(null);");
replace('src/components/solar/LanguageSolarSystem.tsx', "  const raycaster = useRef(new THREE.Raycaster());", "  const raycaster = useRef(new THREE.Raycaster());\n  useEffect(() => { raycaster.current.params.Points = { threshold: 12 }; }, []);");
replace('src/components/solar/LanguageSolarSystem.tsx', "  const [isMobile, setIsMobile] = useState(false);", "  const [isMobile, setIsMobile] = useState(false);\n  const [worldCatalog, setWorldCatalog] = useState(WORLD_LANGUAGE_UNIVERSE);\n  const catalogCount = worldCatalog.length;");
replace('src/components/solar/LanguageSolarSystem.tsx',
  "  const matchingCodeSet = useMemo(() => {\n    const q = searchQuery.trim().toLowerCase();\n    const universe = activeFilter === 'ALL'\n      ? WORLD_LANGUAGE_UNIVERSE\n      : searchLanguages('', activeFilter);\n    return new Set(universe.filter((language) => !q || language.name.toLowerCase().includes(q) || language.nativeName.toLowerCase().includes(q) || language.code.toLowerCase().includes(q) || language.family.toLowerCase().includes(q)).map((l) => l.code));\n  }, [searchQuery, activeFilter]);",
  "  useEffect(() => {\n    let cancelled = false;\n    fetch('/api/languages').then((r) => r.ok ? r.json() : Promise.reject(new Error('catalog unavailable'))).then((payload) => {\n      if (cancelled || !Array.isArray(payload?.languages)) return;\n      const generated = payload.languages.map((language, index) => {\n        const supported = SUPPORTED_LANGUAGES.find((item) => item.code === language.code.slice(0, 2));\n        const orbitIndex = (index % 10) + 1;\n        const palette = ['#6670ff','#22d3ee','#a78bfa','#34d399','#f59e0b','#fb7185','#38bdf8','#c084fc'];\n        return supported ?? { code: language.code, name: language.name, nativeName: language.nativeName || language.name, script: 'Language catalog', family: language.family || 'World language', orbitRadius: 150 + (orbitIndex - 1) * 48, orbitIndex, color: palette[index % palette.length], size: 3.8, speed: 0.00002 + (index % 7) * 0.000003, initialAngle: (index * 2.399963) % (Math.PI * 2), cloudSupported: false, offlineSupported: false, textSupported: false, speechSynthesisSupported: false, speechRecognitionSupported: false, ocrSupported: false, documentSupported: false, limitations: 'Explore-only catalog entry. Translation support is not currently enabled in LingoFlow.', popular: false, bcp47: language.code, flagGlyph: language.code.toUpperCase() };\n      });\n      setWorldCatalog(generated);\n    }).catch(() => undefined);\n    return () => { cancelled = true; };\n  }, []);\n\n  const matchingCodeSet = useMemo(() => {\n    const q = searchQuery.trim().toLowerCase();\n    const universe = activeFilter === 'ALL' ? worldCatalog : activeFilter === 'SUPPORTED' ? SUPPORTED_LANGUAGES : SUPPORTED_LANGUAGES.filter((language) => language.offlineSupported);\n    return new Set(universe.filter((language) => !q || language.name.toLowerCase().includes(q) || language.nativeName.toLowerCase().includes(q) || language.code.toLowerCase().includes(q) || language.family.toLowerCase().includes(q)).map((l) => l.code));\n  }, [searchQuery, activeFilter, worldCatalog]);"
);
replace('src/components/solar/LanguageSolarSystem.tsx', "WORLD_LANGUAGE_UNIVERSE.forEach((lang) => {", "worldCatalog.forEach((lang) => {");
replace('src/components/solar/LanguageSolarSystem.tsx',
  "    const planets: PlanetObject[] = [];\n    worldCatalog.forEach((lang) => {\n      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);\n      const geometry = new THREE.SphereGeometry(lang.size * (isSupported ? 1.35 : 1), isSupported ? 20 : 10, isSupported ? 20 : 10);\n      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(lang.color), emissive: new THREE.Color(lang.color), emissiveIntensity: 0.32, roughness: 0.58, metalness: 0.18 });\n      const planet = new THREE.Mesh(geometry, material);",
  "    const planets = [];\n    const catalogEntries = [];\n    const pointPositions = [];\n    const pointColors = [];\n    worldCatalog.forEach((lang) => {\n      const isSupported = SUPPORTED_LANGUAGES.some((item) => item.code === lang.code);\n      const radius = ORBIT_RADII[Math.max(0, Math.min(ORBIT_RADII.length - 1, lang.orbitIndex - 1))];\n      const x = Math.cos(lang.initialAngle) * radius, y = (lang.orbitIndex - 2.5) * 8, z = Math.sin(lang.initialAngle) * radius;\n      if (!isSupported) { catalogEntries.push(lang); pointPositions.push(x, y, z); const c = new THREE.Color(lang.color); pointColors.push(c.r, c.g, c.b); return; }\n      const geometry = new THREE.SphereGeometry(lang.size * 1.35, 20, 20);\n      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(lang.color), emissive: new THREE.Color(lang.color), emissiveIntensity: 0.32, roughness: 0.58, metalness: 0.18 });\n      const planet = new THREE.Mesh(geometry, material);"
);
replace('src/components/solar/LanguageSolarSystem.tsx',
  "      planet.position.set(Math.cos(lang.initialAngle) * radius, (lang.orbitIndex - 2.5) * 8, Math.sin(lang.initialAngle) * radius);\n      orbitGroup.add(planet); planets.push(planet);\n    });\n    planetsRef.current = planets;",
  "      planet.position.set(x, y, z); orbitGroup.add(planet); planets.push(planet);\n    });\n    planetsRef.current = planets;\n    if (catalogEntries.length) {\n      const pointGeometry = new THREE.BufferGeometry();\n      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));\n      pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));\n      const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: mobile ? 3.4 : 4.5, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true }));\n      points.userData.languages = catalogEntries; orbitGroup.add(points); catalogPointsRef.current = points;\n    }"
);
replace('src/components/solar/LanguageSolarSystem.tsx',
  "      const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined;\n      setHoveredLanguage(hit?.userData.language ?? null);",
  "      const meshHit = raycaster.current.intersectObjects(planets, false)[0]?.object;\n      const pointHit = catalogPointsRef.current ? raycaster.current.intersectObject(catalogPointsRef.current, false)[0] : undefined;\n      const catalogLanguage = pointHit && typeof pointHit.index === 'number' ? catalogPointsRef.current?.userData.languages?.[pointHit.index] : undefined;\n      setHoveredLanguage(meshHit?.userData?.language ?? catalogLanguage ?? null);"
);
replace('src/components/solar/LanguageSolarSystem.tsx',
  "    const onClick = () => { raycaster.current.setFromCamera(pointer.current, camera); const hit = raycaster.current.intersectObjects(planets, false)[0]?.object as PlanetObject | undefined; if (hit) setSelectedPlanet(hit.userData.language); };",
  "    const onClick = () => { raycaster.current.setFromCamera(pointer.current, camera); const hit = raycaster.current.intersectObjects(planets, false)[0]?.object; if (hit?.userData?.language) { setSelectedPlanet(hit.userData.language); return; } if (catalogPointsRef.current) { const pointHit = raycaster.current.intersectObject(catalogPointsRef.current, false)[0]; if (pointHit && typeof pointHit.index === 'number') { const language = catalogPointsRef.current.userData.languages?.[pointHit.index]; if (language) setSelectedPlanet(language); } } };"
);
replace('src/components/solar/LanguageSolarSystem.tsx', "      core.rotation.y += dt * 0.15;", "      const catalogPoints = catalogPointsRef.current;\n      if (catalogPoints) { const colors = catalogPoints.geometry.getAttribute('color'); const languages = catalogPoints.userData.languages || []; for (let i = 0; i < languages.length; i += 1) { const lang = languages[i], matches = st.matching.size === 0 || st.matching.has(lang.code), base = new THREE.Color(lang.color), factor = matches ? 0.8 : 0.08; colors.setXYZ(i, base.r * factor, base.g * factor, base.b * factor); } colors.needsUpdate = true; }\n      core.rotation.y += dt * 0.15;");
replace('src/components/solar/LanguageSolarSystem.tsx', "  }, [applyCamera, zoom]);", "  }, [applyCamera, zoom, worldCatalog]);");
replace('src/components/solar/LanguageSolarSystem.tsx', "(['ALL','POPULAR','OFFLINE'] as const)", "(['ALL','SUPPORTED','OFFLINE'] as const)");
replace('src/components/solar/LanguageSolarSystem.tsx', "Explore the ISO 639-1 world language universe. Supported languages glow brighter.", "Explore the world language catalog. Supported LingoFlow languages glow brighter.");
replace('src/components/solar/LanguageSolarSystem.tsx', "WORLD LANGUAGE UNIVERSE", "WORLD LANGUAGE CATALOG");
replace('src/components/solar/LanguageSolarSystem.tsx', "</span></div>\n          <p className="text-xs", "</span><span className="text-[10px] text-slate-500">{catalogCount.toLocaleString()} languages</span></div>\n          <p className="text-xs");
replace('src/components/solar/LanguageSolarSystem.tsx', "showSemanticHUD && <div", "showSemanticHUD && semanticFidelityScore != null && <div");
replace('src/components/solar/LanguageSolarSystem.tsx', "{semanticFidelityScore}%", "{Math.round(semanticFidelityScore)}%");

replace('src/App.tsx', "import { ArchitectureExplorer } from './features/workspace/ArchitectureExplorer';\n", "");
replace('src/App.tsx', "import { ServiceRegistryView } from './features/workspace/ServiceRegistryView';\n", "");
replace('src/App.tsx', "        {activeView === 'architecture' && <ArchitectureExplorer />}\n", "");
replace('src/App.tsx', "        {activeView === 'services' && <ServiceRegistryView />}\n", "");

for (const file of ['src/features/workspace/ArchitectureExplorer.tsx','src/features/workspace/ServiceRegistryView.tsx']) {
  const target = path.join(root, file);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}
console.log('LingoFlow v3 product cleanup applied');
