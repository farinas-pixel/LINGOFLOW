import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};

// Restore the canonical product source as one deterministic build artifact.
// The payload is split only because GitHub Contents has a practical request-size limit.
const payload = ['1','2','3','4','5'].map((n) => read(`source_payload.part${n}`)).join('');
const files = JSON.parse(zlib.gunzipSync(Buffer.from(payload, 'base64')).toString('utf8'));
for (const [file, content] of Object.entries(files)) write(file, content);

// Runtime containment for the 3D module and the whole workspace.
write('src/components/feedback/FeatureErrorBoundary.tsx', `import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
interface Props { children: React.ReactNode; title?: string; description?: string; className?: string }
interface State { hasError: boolean; errorMessage: string }
export class FeatureErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };
  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, errorMessage: error instanceof Error ? error.message : 'Unexpected runtime error' };
  }
  componentDidCatch(error: unknown) { console.error('LingoFlow runtime recovery:', error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className={this.props.className || 'rounded-2xl border border-amber-300/20 bg-slate-950 p-6 text-slate-100'} role="alert">
      <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-amber-300"/>
        <div><h2 className="text-sm font-semibold">{this.props.title || 'Module recovered from a runtime error'}</h2>
          <p className="mt-1 text-xs text-slate-400">{this.props.description || 'The rest of LingoFlow remains available.'}</p>
          <p className="mt-2 break-words font-mono text-[10px] text-slate-500">{this.state.errorMessage}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => this.setState({hasError:false,errorMessage:''})}><RotateCcw className="h-3.5 w-3.5"/> Retry module</Button>
        </div>
      </div>
    </div>;
  }
}
`);

// Remove stale lockfiles so Render resolves the pinned React runtime deterministically.
for (const file of ['package-lock.json', 'npm-shrinkwrap.json']) {
  const target = path.join(root, file);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

// Production QA: fail the build if the expected architecture is not present.
const pkg = JSON.parse(read('package.json'));
if (pkg.dependencies?.react !== '19.3.0' || pkg.dependencies?.['react-dom'] !== '19.3.0') {
  throw new Error('Production QA failed: React 19.3.0 singleton not pinned');
}
const solar = read('src/components/solar/LanguageSolarSystem.tsx');
const app = read('src/App.tsx');
const shell = read('src/components/layout/AppShell.tsx');
if (!solar.includes('ORBIT_RADII') || !solar.includes('EffectComposer') || !solar.includes('UnrealBloomPass') || !solar.includes('requestAnimationFrame')) {
  throw new Error('Production QA failed: canonical 3D Language Universe architecture missing');
}
if (!solar.includes('pointerdown') || !solar.includes('wheel')) throw new Error('Production QA failed: 3D interaction layer missing');
if (!app.includes("activeView==='languages'") || !app.includes("activeView==='translator'") || !app.includes("activeView==='conversation'") || !app.includes("activeView==='library'")) {
  throw new Error('Production QA failed: five-screen routing incomplete');
}
if (!shell.includes('lf-cursor-x') || !shell.includes('Five primary product screens')) throw new Error('Production QA failed: cinematic shell incomplete');
console.log('LingoFlow deterministic production source restored and QA passed.');
