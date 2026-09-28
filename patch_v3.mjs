import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,v)=>fs.writeFileSync(path.join(root,f),v);
const replace=(f,a,b)=>{const s=read(f);if(!s.includes(a))throw new Error('V5 anchor missing: '+f);write(f,s.replace(a,b));};
const home='src/features/home/HomeView.tsx';
replace(home,"import React from 'react';","import React, { lazy, Suspense } from 'react';");
replace(home,"import { LanguageSolarSystem } from '../../components/solar/LanguageSolarSystem';\n","import { FeatureErrorBoundary } from '../../components/feedback/FeatureErrorBoundary';\n");
replace(home,"interface HomeViewProps {","const LanguageSolarSystem = lazy(() => import('../../components/solar/LanguageSolarSystem').then((module) => ({ default: module.LanguageSolarSystem })).catch((error) => ({ default: () => <div className=\"rounded-2xl border border-amber-300/20 bg-[#050816] p-6 text-xs text-slate-400\">Language Solar System could not initialize on this device.</div> })));\n\ninterface HomeViewProps {");
const oldSolar="        <LanguageSolarSystem\n          sourceLanguageCode={sourceLanguage}\n          targetLanguageCode={targetLanguage}\n          onSelectSource={onSelectSource}\n          onSelectTarget={onSelectTarget}\n          onSwapLanguages={onSwapLanguages}\n          onNavigateToCockpit={() => onNavigate('translator')}\n          onOpenSemanticMirror={() => onNavigate('semantic')}\n          semanticFidelityScore={semanticFidelityScore}\n          semanticIntegrityStatus={semanticIntegrityStatus}\n          meaningLockActive={meaningLockActive}\n          lockedTermsCount={lockedTermsCount}\n        />";
const newSolar="        <FeatureErrorBoundary title=\"Language Solar System is temporarily unavailable\" description=\"The translation workspace stays available even if WebGL or the 3D module cannot initialize on this device.\"><Suspense fallback={<div className=\"flex h-[420px] sm:h-[480px] items-center justify-center rounded-2xl border border-slate-800 bg-[#050816] text-xs text-slate-400\">Loading Language Solar System…</div>}><LanguageSolarSystem sourceLanguageCode={sourceLanguage} targetLanguageCode={targetLanguage} onSelectSource={onSelectSource} onSelectTarget={onSelectTarget} onSwapLanguages={onSwapLanguages} onNavigateToCockpit={() => onNavigate('translator')} onOpenSemanticMirror={() => onNavigate('semantic')} semanticFidelityScore={semanticFidelityScore} semanticIntegrityStatus={semanticIntegrityStatus} meaningLockActive={meaningLockActive} lockedTermsCount={lockedTermsCount} /></Suspense></FeatureErrorBoundary>";
replace(home,oldSolar,newSolar);
write('src/components/feedback/FeatureErrorBoundary.tsx',"import React from 'react';\nimport { AlertTriangle, RotateCcw } from 'lucide-react';\nimport { Button } from '../ui/Button';\ninterface Props { children: React.ReactNode; title?: string; description?: string; className?: string }\ninterface State { hasError: boolean; errorMessage: string }\nexport class FeatureErrorBoundary extends React.Component<Props,State>{\n  state:State={hasError:false,errorMessage:''};\n  static getDerivedStateFromError(error:unknown):State{return {hasError:true,errorMessage:error instanceof Error?error.message:'Unexpected runtime error'}}\n  componentDidCatch(error:unknown){console.error('LingoFlow runtime recovery:',error)}\n  render(){if(!this.state.hasError)return this.props.children;return <div className={this.props.className||'rounded-2xl border border-amber-300/20 bg-slate-950 p-6 text-slate-100'} role=\"alert\"><div className=\"flex items-start gap-3\"><AlertTriangle className=\"h-5 w-5 text-amber-300\"/><div><h2 className=\"text-sm font-semibold\">{this.props.title||'Module recovered from a runtime error'}</h2><p className=\"mt-1 text-xs text-slate-400\">{this.props.description||'The rest of LingoFlow remains available.'}</p><p className=\"mt-2 break-words font-mono text-[10px] text-slate-500\">{this.state.errorMessage}</p><Button type=\"button\" variant=\"outline\" size=\"sm\" className=\"mt-4\" onClick={()=>this.setState({hasError:false,errorMessage:''})}><RotateCcw className=\"h-3.5 w-3.5\"/> Retry module</Button></div></div></div>}}\n");
replace('src/App.tsx',"import { SplashScreen } from './components/feedback/SplashScreen';","import { SplashScreen } from './components/feedback/SplashScreen';\nimport { FeatureErrorBoundary } from './components/feedback/FeatureErrorBoundary';");
replace('src/App.tsx',"import { serviceRegistry } from './services/core/ServiceRegistry';\n",'');
replace('src/App.tsx',"  useEffect(() => {\n    // Quick system initialization (IndexedDB and Service Registry)\n    const initWorkspace = async () => {\n      try {\n        await serviceRegistry.initializeAll();\n      } catch (err) {\n        console.error('LingoFlow initialization error:', err);\n      }\n    };\n    initWorkspace();\n  }, []);","  useEffect(() => { import('./services/core/ServiceRegistry').then(({serviceRegistry}) => serviceRegistry.initializeAll()).catch((err) => console.error('LingoFlow background initialization error:', err)); }, []);");
replace('src/App.tsx',"export default function App() {\n  return (\n    <ThemeProvider>\n      <WorkspaceRoot />\n    </ThemeProvider>\n  );\n}","export default function App() { return (<FeatureErrorBoundary title=\"LingoFlow recovered from a workspace error\" description=\"An unexpected runtime exception was contained instead of turning the application into a blank page.\" className=\"min-h-screen bg-[#080B14] p-8 text-slate-100\"><ThemeProvider><WorkspaceRoot /></ThemeProvider></FeatureErrorBoundary>); }");
write('src/main.tsx',"import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\nconst rootElement=document.getElementById('root');\nif(!rootElement){document.body.innerHTML='<main style=\"padding:32px;font-family:system-ui\">LingoFlow could not find its application root.</main>';}else{createRoot(rootElement).render(<App/>);}\n");
const pkg=JSON.parse(read('package.json'));pkg.dependencies.react='19.3.0';pkg.dependencies['react-dom']='19.3.0';pkg.overrides={...(pkg.overrides||{}),react:'19.3.0','react-dom':'19.3.0'};write('package.json',JSON.stringify(pkg,null,2)+'\n');
replace('vite.config.ts',"import path from 'path';","import path from 'node:path';");
replace('vite.config.ts',"        workbox: {\n          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],","        workbox: {\n          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],\n          cleanupOutdatedCaches: true,\n          cacheId: 'lingoflow-production-v5',");
replace('vite.config.ts',"    resolve: {\n      alias: {","    resolve: {\n      dedupe: ['react', 'react-dom'],\n      alias: {");
replace('vite.config.ts',"path.resolve(__dirname, '.')","path.resolve(import.meta.dirname, '.')");
replace('vite.config.ts',"        devOptions: {\n          enabled: true,\n          type: 'module',\n        },","        devOptions: { enabled: false, type: 'module' },");
replace('server.ts',"  } else {\n    app.use(express.static(path.resolve(__dirname, 'dist')));\n    app.get('*', (req, res) => {\n      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));\n    });\n  }","  } else { const distRoot=path.resolve(__dirname,'dist'); app.use((req,res,next)=>{if(req.path==='/'||req.path==='/index.html'||req.path==='/sw.js'||req.path==='/registerSW.js')res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');next();}); app.use(express.static(distRoot,{immutable:true,maxAge:'1y'})); app.get('*',(req,res)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.sendFile(path.join(distRoot,'index.html'));}); }");
for(const f of ['src/features/workspace/ArchitectureExplorer.tsx','src/features/workspace/ServiceRegistryView.tsx','src/features/workspace/WorkspaceOverview.tsx']){const p=path.join(root,f);if(fs.existsSync(p))fs.unlinkSync(p);}
for(const f of ['package-lock.json','npm-shrinkwrap.json']){const p=path.join(root,f);if(fs.existsSync(p))fs.unlinkSync(p);}
const solar=read('src/components/solar/LanguageSolarSystem.tsx');if(!solar.includes("from 'three'")||!solar.includes('requestAnimationFrame(animate)')||!solar.includes('ORBIT_RADII'))throw new Error('V5 QA: canonical Solar System source incomplete');
const finalVite=read('vite.config.ts');if(finalVite.includes('__dirname')||!finalVite.includes("dedupe: ['react', 'react-dom']"))throw new Error('V5 QA: Vite hardening incomplete');
replace('src/App.tsx',"import { ArchitectureExplorer } from './features/workspace/ArchitectureExplorer';\n",'');
replace('src/App.tsx',"import { ServiceRegistryView } from './features/workspace/ServiceRegistryView';\n",'');
replace('src/App.tsx',"        {activeView === 'architecture' && <ArchitectureExplorer />}\n",'');
replace('src/App.tsx',"        {activeView === 'services' && <ServiceRegistryView />}\n",'');
replace('src/types/navigation.ts'," | 'architecture'",'');
replace('src/types/navigation.ts'," | 'services'",'');

const visualSolar = read('src/components/solar/LanguageSolarSystem.tsx');
let solarV6 = visualSolar;
const visualReplace = (a,b) => { if (!solarV6.includes(a)) throw new Error('V6 visual anchor missing'); solarV6 = solarV6.replace(a,b); return solarV6; };
solarV6 = visualReplace("const ORBIT_RADII = Array.from({ length: 10 }, (_, index) => 150 + index * 48);\nconst CAMERA_DEFAULT = { x: 0.58, y: 0.24, distance: 760 };", "const ORBIT_RADII = [145, 205, 270, 340, 415, 495];\nconst CAMERA_DEFAULT = { x: 0.86, y: 0.46, distance: 700 };");
solarV6 = solarV6.replace("function makeGlowTexture() {", "function makeLanguageLabelTexture(language: LanguagePlanetData) {\n  const canvas = document.createElement('canvas'); canvas.width = 420; canvas.height = 120;\n  const ctx = canvas.getContext('2d'); if (!ctx) return null;\n  ctx.clearRect(0, 0, 420, 120);\n  ctx.font = '700 30px Inter, system-ui, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.fillText(language.name, 12, 38);\n  ctx.font = '500 22px Inter, system-ui, sans-serif'; ctx.fillStyle = '#aab0ff'; ctx.fillText(language.nativeName, 12, 70);\n  ctx.font = '600 14px ui-monospace, monospace'; ctx.fillStyle = '#64748b'; ctx.fillText(language.code.toUpperCase() + '  ·  ' + language.script, 12, 96);\n  return new THREE.CanvasTexture(canvas);\n}\n\nfunction makeGlowTexture() {");
solarV6 = visualReplace("const core = new THREE.Mesh(new THREE.SphereGeometry(48, 48, 48), new THREE.MeshStandardMaterial({ color: 0x5b5fef, emissive: 0x3036d6, emissiveIntensity: 2.4, metalness: 0.25, roughness: 0.25 }));\n    scene.add(core);", "const coreGroup = new THREE.Group(); scene.add(coreGroup);\n    const core = new THREE.Mesh(new THREE.SphereGeometry(54, 48, 48), new THREE.MeshStandardMaterial({ color: 0x5b5fef, emissive: 0x3036d6, emissiveIntensity: 3.0, metalness: 0.3, roughness: 0.2 }));\n    coreGroup.add(core);\n    [78, 98, 120].forEach((radius, index) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, index === 2 ? 1.4 : 2.1, 8, 128), new THREE.MeshBasicMaterial({ color: index === 0 ? 0x22d3ee : index === 1 ? 0x7c83ff : 0xa855f7, transparent: true, opacity: 0.72 })); ring.rotation.x = Math.PI / 2.2 + index * 0.18; ring.rotation.z = index * 0.22; coreGroup.add(ring); });\n    const coreTexture = makeLanguageLabelTexture({ code: 'lf', name: 'LingoFlow', nativeName: 'LANGUAGE CORE', script: 'AI', family: 'Translation', orbitRadius: 0, orbitIndex: 1, color: '#7c83ff', size: 1, speed: 0, initialAngle: 0, cloudSupported: true, offlineSupported: true, textSupported: true, speechSynthesisSupported: false, speechRecognitionSupported: false, ocrSupported: false, documentSupported: false, popular: true, bcp47: 'en', flagGlyph: 'LF' });\n    if (coreTexture) { const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: coreTexture, transparent: true, depthWrite: false })); label.position.set(0, 92, 0); label.scale.set(230, 66, 1); coreGroup.add(label); }");
solarV6 = solarV6.replace("orbitGroup.add(line);", "line.rotation.x = 0.16 + idx * 0.08; line.rotation.z = (idx % 2 ? 1 : -1) * 0.05 * idx; orbitGroup.add(line);");
solarV6 = solarV6.replace("scene.add(orbitGroup); orbitGroupRef.current = orbitGroup;", "scene.add(orbitGroup); orbitGroup.rotation.x = -0.42; orbitGroup.rotation.z = 0.04; orbitGroupRef.current = orbitGroup;");
solarV6 = visualReplace("orbitGroup.add(planet); planets.push(planet);", "const planetRing = new THREE.Mesh(new THREE.TorusGeometry(lang.size * (isSupported ? 2.0 : 1.55), Math.max(0.8, lang.size * 0.07), 6, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(lang.color), transparent: true, opacity: isSupported ? 0.55 : 0.22 }));\n      planetRing.rotation.x = Math.PI / 2.5; planet.add(planetRing);\n      const labelTexture = makeLanguageLabelTexture(lang);\n      if (labelTexture) { const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false })); label.position.set(0, lang.size + 28, 0); label.scale.set(118, 34, 1); planet.add(label); }\n      orbitGroup.add(planet); planets.push(planet);");
solarV6 = visualReplace("core.rotation.y += dt * 0.15;\n      stars.rotation.y += dt * 0.004;", "coreGroup.rotation.y += dt * 0.12;\n      stars.rotation.y += dt * 0.004;");
solarV6 = solarV6.replace("const [selectedPlanet, setSelectedPlanet] = useState<LanguagePlanetData | null>(null);", "const [selectedPlanet, setSelectedPlanet] = useState<LanguagePlanetData | null>(() => getLanguageByCode(targetLanguageCode) ?? null);");
solarV6 = solarV6.replace("<div ref={mountRef} className=\"relative w-full h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing touch-none\">", "<div className=\"px-5 pt-5 sm:px-7\"><div className=\"text-[10px] uppercase tracking-[.3em] text-[#8e98ff]\">EXPLORE · DISCOVER · TRANSLATE</div><h1 className=\"mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-white\">Language <span className=\"bg-gradient-to-r from-[#7c83ff] via-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent\">Universe</span></h1><p className=\"mt-1 text-xs sm:text-sm text-slate-400\">A 3D interactive journey through the world's languages</p></div><div ref={mountRef} className=\"relative w-full h-[560px] sm:h-[650px] cursor-grab active:cursor-grabbing touch-none\">");
solarV6 = solarV6.replace("      <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b", "      <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b");

// V6.1 WebGL safety + deterministic visual fallback
if (!solarV6.includes('LingoFlow WebGL fallback')) {
  const effectAnchor = 'useEffect(() => {';
  if (!solarV6.includes(effectAnchor)) throw new Error('V6.1 QA: Solar useEffect anchor missing');
  solarV6 = solarV6.replace(effectAnchor, `useEffect(() => {
    if (!mountRef.current) return;
    const probeCanvas = document.createElement('canvas');
    const webgl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!webgl) {
      mountRef.current.innerHTML = '<div class="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-800 bg-[#050816] p-8 text-center"><div><div class="text-sm font-semibold text-white">LingoFlow WebGL fallback</div><div class="mt-2 max-w-md text-xs leading-5 text-slate-400">3D graphics are unavailable on this device or browser. The language workspace remains usable; try enabling hardware acceleration or opening LingoFlow in a modern browser.</div></div></div>';
      return;
    }`);
}
if (!solarV6.includes('const coreGroup')) throw new Error('V6.1 QA: coreGroup missing');
if (!solarV6.includes('coreGroup.rotation.y')) throw new Error('V6.1 QA: core animation missing');
if (!solarV6.includes('makeLanguageLabelTexture')) throw new Error('V6.1 QA: language labels missing');
write('src/components/solar/LanguageSolarSystem.tsx', solarV6);
console.log('LingoFlow V6 Language Universe visual patch applied');

const uiPayload = ['1','2','3','4'].map((n) => read('source_ui_payload.' + n)).join('');
const uiFiles = JSON.parse(zlib.gunzipSync(Buffer.from(uiPayload, 'base64')).toString('utf8'));
for (const [file, value] of Object.entries(uiFiles)) write(file, value);

write('src/components/feedback/FeatureErrorBoundary.tsx', `import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
interface Props { children: React.ReactNode; title?: string; description?: string; className?: string }
interface State { hasError: boolean; errorMessage: string }
export class FeatureErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };
  static getDerivedStateFromError(error: unknown): State { return { hasError: true, errorMessage: error instanceof Error ? error.message : 'Unexpected runtime error' }; }
  componentDidCatch(error: unknown) { console.error('LingoFlow runtime recovery:', error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className={this.props.className || 'rounded-2xl border border-amber-300/20 bg-slate-950 p-6 text-slate-100'} role="alert"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-amber-300"/><div><h2 className="text-sm font-semibold">{this.props.title || 'Module recovered from a runtime error'}</h2><p className="mt-1 text-xs text-slate-400">{this.props.description || 'The rest of LingoFlow remains available.'}</p><p className="mt-2 break-words font-mono text-[10px] text-slate-500">{this.state.errorMessage}</p><Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => this.setState({hasError:false,errorMessage:''})}><RotateCcw className="h-3.5 w-3.5"/> Retry module</Button></div></div></div>;
  }
}
`);

for (const file of ['package-lock.json', 'npm-shrinkwrap.json']) {
  const target = path.join(root, file);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

const pkg = JSON.parse(read('package.json'));
if (pkg.dependencies?.react !== '19.3.0' || pkg.dependencies?.['react-dom'] !== '19.3.0') throw new Error('Production QA failed: React singleton not pinned');
const solarFinal = read('src/components/solar/LanguageSolarSystem.tsx');
const appFinal = read('src/App.tsx');
if (!solarFinal.includes('ORBIT_RADII') || !solarFinal.includes('EffectComposer') || !solarFinal.includes('UnrealBloomPass') || !solarFinal.includes('makeLanguageLabelTexture')) throw new Error('Production QA failed: Language Universe architecture incomplete');
if (!solarFinal.includes('pointerdown') || !solarFinal.includes('wheel')) throw new Error('Production QA failed: 3D interaction layer incomplete');
if (!appFinal.includes("activeView==='languages'") || !appFinal.includes("activeView==='translator'") || !appFinal.includes("activeView==='conversation'") || !appFinal.includes("activeView==='library'")) throw new Error('Production QA failed: five-screen routing incomplete');
console.log('LingoFlow deterministic source + cinematic five-screen UI payload applied.');
process.exit(0);
console.log('LingoFlow V5 safe production patch applied');process.exit(0);
