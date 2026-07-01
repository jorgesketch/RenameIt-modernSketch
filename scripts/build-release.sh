#!/usr/bin/env bash
#
# build-release.sh — package the plugin into dist/Rename-It.sketchplugin.zip
#
# Usage:
#   ./scripts/build-release.sh            # zip the current bundle as-is
#   ./scripts/build-release.sh --build    # recompile src via skpm first, then zip
#
# The zip is named to match the appcast enclosure + release-asset convention,
# so it can be uploaded straight to a GitHub release:
#   gh release create vX.Y.Z dist/Rename-It.sketchplugin.zip
#
set -euo pipefail

# Resolve repo root regardless of where the script is invoked from.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BUNDLE="Rename-It.sketchplugin"
DIST_DIR="dist"
ZIP="$DIST_DIR/Rename-It.sketchplugin.zip"

VERSION="$(node -p "require('./package.json').version")"

# Optionally recompile src/ into the bundle before packaging.
if [[ "${1:-}" == "--build" ]]; then
  if [[ ! -d node_modules ]]; then
    echo "→ installing dependencies (npm install)…"
    npm install
  fi
  echo "→ compiling with skpm (npm run build)…"
  npm run build
fi

if [[ ! -d "$BUNDLE" ]]; then
  echo "✗ $BUNDLE not found. Run with --build to compile it first." >&2
  exit 1
fi

# Sanity check: bundle version should match package.json.
MANIFEST="$BUNDLE/Contents/Sketch/manifest.json"
BUNDLE_VERSION="$(node -p "require('./$MANIFEST').version")"
if [[ "$BUNDLE_VERSION" != "$VERSION" ]]; then
  echo "⚠ version mismatch: package.json=$VERSION but $MANIFEST=$BUNDLE_VERSION" >&2
  echo "  (bump the manifest, or run with --build to regenerate it)" >&2
fi

echo "→ packaging $BUNDLE (v$BUNDLE_VERSION)…"
mkdir -p "$DIST_DIR"
rm -f "$ZIP"
# ditto preserves the bundle structure & resource forks; --keepParent keeps the
# .sketchplugin directory at the root of the archive so it unzips ready to install.
ditto -c -k --sequesterRsrc --keepParent "$BUNDLE" "$ZIP"

echo ""
echo "✓ built $ZIP"
ls -lh "$ZIP" | awk '{print "  size: "$5}'
echo ""
echo "Next:"
echo "  gh release create v$VERSION \"$ZIP\" --title \"Rename It $VERSION\" --notes-file CHANGELOG.md"
echo "  # or attach to an existing release:"
echo "  gh release upload v$VERSION \"$ZIP\" --clobber"
