# Changelog

All notable changes to this fork are documented here. This project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased] - 4.7.0

Nested Frames support (branch `nested-frames`).

### Added
- **Rename nested Frames, Graphics and Stacks.** The "Rename Selected Frames" command now collects every Frame, Graphic and Stack nested within the selection, at any depth — not just the top-level Frame. Selecting a Frame renames it *and* all Frames inside it (`src/lib/Utilities.js`, `src/lib/RenameHelpers.js`).

### Changed
- **Frame detection is now trait-based and depth-independent.** `isArtboard()` previously relied on `isCanvasFrame()`, which by design only matches top-level Frames whose parent is the Page — so nested Frames were invisible to it. Detection now probes the properties that give a group the Frame trait at any depth: `groupBehavior` (Frame/Graphic) and `hasFlexLayout` (Stack), plus Symbol Masters and legacy fallbacks (`src/lib/RenameHelpers.js`).
- **Renamed Frames keep their name.** Frames (including Stacks) regenerate their own name unless it is marked fixed — a Stack re-lays out and renames itself. The rename now sets `nameIsFixed` on Frames so the applied name is preserved (`src/lib/TheUI.js`).
- **"Rename Selected Frames" wording** in the plugin manifest (previously "Artboards"), and the auto-update appcast now resolves to this fork's `main` branch (`src/manifest.json`).

### Fixed (QA round 1)
- **Nested frame numbering order (B2).** Nested frames are now numbered in layer-tree order (outermost first, depth-first) instead of by canvas position — position is ambiguous for nested frames (they can share coordinates), so the positional sequence modes no longer apply when nesting is involved (`src/lib/Utilities.js`, `src/lib/TheUI.js`).
- **Renamed-count toast (B6).** The "N Layers renamed" message now reports the actual number of frames renamed (`src/lib/Utilities.js`, `src/lib/TheUI.js`).
- **Find & Replace on a selection (E1/E5).** The "Selected layers" scope now includes layers nested inside the selection, not just the directly-selected layers (`src/lib/Utilities.js`).

### Added (QA round 1)
- **"Include nested frames" toggle (F2).** The Rename Selected Frames window now has an *Include nested frames* checkbox (**default off** = classic top-level-only behavior). When checked, nested frames/graphics/stacks are renamed too (`resources/views/components/renameLayer/index.jsx`, `src/lib/TheUI.js`).

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
