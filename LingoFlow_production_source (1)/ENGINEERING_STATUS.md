# LingoFlow — Engineering Status

## Product rule
LingoFlow must never display fabricated translation, OCR, semantic scores, sync state, analytics, API health, or offline capability.

## Current verified source-level capabilities
- React + TypeScript workspace
- Gemini server-side translation endpoint
- Gemini 3.8 Flash production model target
- IndexedDB translation/history/offline-pack persistence
- Browser speech recognition and speech synthesis where supported
- Google Drive service integration
- Image/document translation surface
- Conversation mode
- Language Solar System interaction
- Semantic Mirror API integration
- Real Google Search grounding endpoint and Web Search view

## Important implementation truth
The current Language Solar System is a custom Canvas/WebGL-like projection implemented with Canvas 2D math, not Three.js. It provides interactive depth/projection but is not a Three.js scene. A future Three.js migration should preserve the existing language data model and interaction contracts rather than rewriting the product.

## Production hardening completed in this revision
1. Removed the hard-coded Semantic Mirror fallback score of 88. If the real semantic API is unavailable, no integrity score is invented.
2. Removed the demo semantic source/translation automatically injected by App.tsx.
3. Removed copy that implied six offline packs were always installed. Offline translation now remains explicitly dependent on a compatible installed pack.
4. Added `/api/web-search` using Gemini Google Search grounding.
5. Added a Web Search workspace view with source links and the search queries returned by grounding.
6. Updated product copy to distinguish available capabilities from guaranteed runtime availability.

## Next engineering gates
1. Install dependencies and run TypeScript + production build.
2. Run browser-level smoke tests for every navigation route.
3. Verify Gemini translation with a real API key.
4. Verify Google Search grounding and source extraction.
5. Verify OCR on real images.
6. Verify Drive OAuth/save/read/delete flows.
7. Verify offline pack installation, translation quality boundaries, and uninstall.
8. Replace the Canvas Solar System with a real Three.js scene only after the functional contract is locked.
9. Add reduced-motion, keyboard navigation, screen-reader labels, and touch-specific interaction tests.
10. Package/deploy only after all gates pass.

## Design direction
Use depth, translucency, adaptive navigation, spatial relationships, and purposeful motion. Do not copy another product wholesale. Apple’s current design guidance emphasizes hierarchy, content-first layouts, adaptive materials, and purposeful motion rather than decoration. See:
- https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
- https://developer.apple.com/videos/play/wwdc2025/356/

