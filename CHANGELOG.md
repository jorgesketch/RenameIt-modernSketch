# Changelog

All notable changes to this fork are documented here. This project adheres to [Semantic Versioning](https://semver.org).

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
