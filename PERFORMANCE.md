# Performance audit — September 27, 2026

## Implemented

- Start GLB and HDR requests from HTML before the JavaScript bundle finishes loading. The models were already preloaded by Scene.jsx, but only once that module ran.
- Keep the existing login visible while the scene loads. Mark readiness after three composer-rendered frames so texture uploads, lighting and shader initialization happen before the desktop reveal. Previously readiness used download progress and updated React state during render; login faded out regardless of readiness.
- Render the scene in the background to warm it up, then use demand rendering behind the login and in hidden browser tabs. Resume continuous rendering on the visible desktop, preserving animated grain and dog movement.
- Cap device pixel ratio at 1.5 rather than Fiber's default maximum of 2. On high-DPI devices this reduces rendered pixel count by 43.75% at the cap.
- Reduce composer multisampling from its installed default of 8 to 2; disable redundant canvas antialiasing. Reduce the key shadow map from 4096 squared to 2048 squared (75% fewer texels for that map). Keep all lights and effects. Reduce texture anisotropy from 16 to 4.
- Make dog smoothing time-based, so movement speed is consistent across refresh rates.
- Serve the same warehouse HDR locally instead of relying on raw.githack.com during startup. Source: https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/empty_warehouse_01_1k.hdr (drei warehouse preset).
- Generate 128px gallery thumbnails: all 11 combined are 27,200 bytes, versus 51,597,198 bytes for originals. Load thumbnails lazily; retain original images for previews, copying and downloads.
- Generate a 4,558-byte favicon and 1,264-byte login avatar, replacing the 1,313,566-byte original in those UI uses. Preserve the original source. Regenerate derivatives with `python scripts/optimize-images.py` (Pillow required).
- Limit Firebase's message query to the last 60 entries on the server; previously the client downloaded the entire message history before slicing it.
- Dispose the procedural scratch texture and let React Three Fiber manage the wall material, avoiding repeated unmanaged material creation. Remove duplicate style keys reported by the build.

## Validation and remaining limits

Production build checked. Local browser checks cover login, rendered desktop, gallery listing and opening an original image. Rendering reductions are configuration/asset measurements, not a measured FPS or slow-network benchmark. Lower multisampling and shadow resolution can slightly soften shadow detail or increase edge aliasing.

The GLBs still total 10,289,196 bytes and include sizeable normal/roughness textures. More aggressive texture compression or mesh changes require visual comparisons; originals are retained unchanged in this pass. The application JS bundle remains large, mainly Three.js, effects and Firebase. Code splitting is a further opportunity for faster initial login display, but cannot eliminate the scene's downloads.

The ticker, market-cap bubble, screensaver and Winamp modules are not mounted by the current App/UI, so their animation loops are not contributors to current desktop lag. The frontend password gate remains a UI-only gate, and the old Robinhood chart URL remains pending the new token URL; these are outside this performance change.
