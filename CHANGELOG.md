# Changelog

All notable changes to this fork are documented here. This project adheres to [Semantic Versioning](https://semver.org).

## [4.8.1] - 2026-07-16

Fixes the plugin failing to open on Sketch 2026.2.1.

### Fixed
- **All plugin windows failed to open on Sketch 2026.2.1** with `ReferenceError: Can't find variable: MSApplicationMetadata`. The `sketch-module-google-analytics` dependency decided at import time between a modern and a legacy metadata API by coercing the Sketch version string to a number. Three-component versions like `2026.2.1` coerce to `NaN`, so the check failed and the module called the long-removed `MSApplicationMetadata` class, crashing every command that loads the UI (Rename Selected Layers, Rename Selected Frames, Find & Replace, Settings).

### Removed
- **Dropped the `sketch-module-google-analytics` dependency** rather than patching it: Google shut down Universal Analytics in 2024, so the `UA-…` hits it sent went nowhere. The webview's `track` event is now a no-op (`src/lib/TheUI.js`, `package.json`).

## [4.8.0] - 2026-07-02

Nested Frames support.

### Added
- **Rename nested Frames, Graphics and Stacks.** A new *Include nested frames* checkbox in the Rename Selected Frames window (default off) collects every Frame, Graphic and Stack nested within the selection, at any depth — so renaming a Frame can rename all Frames inside it too. Nested frames are numbered in layer-tree order (outermost first, depth-first), since canvas position is ambiguous for nesting (`resources/views/components/renameLayer/index.jsx`, `src/lib/Utilities.js`, `src/lib/TheUI.js`).
- **Find & Replace reaches nested layers.** The "Selected layers" scope now includes layers nested inside the selection, not just the directly-selected ones (`src/lib/Utilities.js`).

### Changed
- **Frame detection is now trait-based and depth-independent.** `isArtboard()` previously relied on `isCanvasFrame()`, which by design only matches top-level Frames whose parent is the Page — so nested Frames were invisible to it. Detection now probes the properties that give a group the Frame trait at any depth: `groupBehavior` (Frame/Graphic) and `hasFlexLayout` (Stack), plus Symbol Masters and legacy fallbacks (`src/lib/RenameHelpers.js`).
- **Renamed Frames keep their name.** Frames (including Stacks) regenerate their own name unless it is marked fixed — a Stack re-lays out and renames itself. The rename now sets `nameIsFixed` on Frames so the applied name is preserved (`src/lib/TheUI.js`).
- **"Rename Selected Frames" wording** in the plugin manifest (previously "Artboards"), and the auto-update appcast now resolves to this fork's `main` branch (`src/manifest.json`).
- The "N Layers renamed" toast now reports the **actual** number of frames renamed (`src/lib/TheUI.js`).

### Removed
- **Dropped the private `@rodi01/renameitlib` dependency.** The rename engine is now vendored as open source in `src/lib/renameitlib/` (a faithful port of the plugin's own pre-2019 open `Rename.js`/`FindReplace.js`, wrapped in the class API, using the public `change-case`/`titlecase` packages). The plugin now builds from 100% public/local dependencies — no GitHub Packages login required. Behaviour was verified identical across a 33-case keyword + find/replace battery.

## [4.6.0] - 2026-07-01

First release of the community fork maintained by [@jorgesketch](https://github.com/jorgesketch), based on [rodi01/RenameIt](https://github.com/rodi01/RenameIt) v4.5.4.

### Added
- **Frames compatibility.** Artboard/frame detection now uses Sketch's `isCanvasFrame()` API instead of `MSArtboardGroup`, so the rename command works with frames as well as artboards (`src/lib/RenameHelpers.js`).
- **Nested layer traversal.** Layer collection walks the full tree via `childrenIncludingSelf()`, with a recursive fallback, so layers nested inside frames are found correctly (`src/lib/Utilities.js`).
- Press <kbd>Esc</kbd> to close a plugin window (`src/lib/TheUI.js`).

### Changed
- "Artboard" UI labels renamed to "Frame"; command windows made taller to fit content (`src/commandRenameArtboard.js`, `src/commandSettings.js`).
- Windows are now torn down with `win.destroy()` instead of `win.close()` to prevent ghost/leftover windows (`src/lib/TheUI.js`).
- Sketch version gate now parses the version number safely with `parseInt` (`src/lib/VersionAlert.js`).

---

Versions up to and including 4.5.4 were released by Rodrigo Soares in the [original repository](https://github.com/rodi01/RenameIt/releases).
