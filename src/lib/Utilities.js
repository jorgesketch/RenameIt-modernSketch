/*
 * @Author: Rodrigo Soares
 * @Date: 2018-01-03 17:48:48
 * @Last Modified by: Rodrigo Soares
 * @Last Modified time: 2020-04-27 00:00:47
 */

import {
  getPositionalSequence,
  isArtboard,
  layerKey,
  collectNestedArtboards,
  isSymbolInstance,
  getSymbolName,
  hasLayerStyle,
  getLayerStyle,
  hasChildLayer,
  getChildLayer,
  getSequenceType,
} from './RenameHelpers'

/**
 * The Layer Object builder
 *
 * @param {Object} layer
 * @param {Integer} idx
 * @returns {Object}
 */
function layerObject(layer, idx) {
  const parentName =
    layer.parentGroup() == null ? '' : layer.parentGroup().name()

  const obj = {
    layer,
    name: String(layer.name()),
    frame: layer.frame(),
    idx,
    width: Math.floor(layer.frame().width()),
    height: Math.floor(layer.frame().height()),
    parentName: String(parentName),
    symbolName: getSymbolName(layer),
    layerStyle: getLayerStyle(layer),
    childLayer: getChildLayer(layer),
    x: layer.frame().x(),
    y: layer.frame().y(),
  }

  obj.maxX = obj.x + obj.width
  obj.maxY = obj.y + obj.height

  return obj
}

/**
 * Parse common data
 * @param  {Object} context Sketch context
 * @return {Object}         Parsed Data
 */
export function parseData(context, onlyArtboards = false) {
  let contextData = context.selection
  let nestedFrames = null

  if (onlyArtboards) {
    // Flat set: the nearest enclosing Frame for each selected element (deduped).
    // This is the classic behaviour used when "Include nested frames" is off.
    const scopeFrames = []
    const scopeSeen = {}
    const addScope = (frame) => {
      if (!frame) return
      const key = layerKey(frame)
      if (scopeSeen[key]) return
      scopeSeen[key] = true
      scopeFrames.push(frame)
    }

    // Nested set: each scope Frame followed by every Frame/Graphic/Stack nested
    // within it, in hierarchy (depth-first) order — so numbering follows the
    // layer tree, not canvas position (which is ambiguous for nested Frames).
    const allFrames = []
    const allSeen = {}
    const addAll = (frame) => {
      if (!frame) return
      const key = layerKey(frame)
      if (allSeen[key]) return
      allSeen[key] = true
      allFrames.push(frame)
    }

    contextData.forEach((el) => {
      // Resolve the Frame scope for this selection: the element itself when it
      // is a Frame, otherwise the nearest enclosing Frame walking up the tree.
      let scope = el
      while (scope && !isArtboard(scope)) {
        scope = scope.parentGroup()
      }
      if (!scope) return

      addScope(scope)
      addAll(scope)
      collectNestedArtboards(scope, addAll)
    })

    contextData = scopeFrames
    nestedFrames = allFrames
  }

  const data = {
    doc: context.document,
    pageName: String(context.document.currentPage().name()),
    selectionCount: Array.isArray(contextData)
      ? contextData.length
      : contextData.count(),
    selection: [],
    isFrames: Boolean(onlyArtboards),
  }

  let hasSymbol = false
  let lStyle = false
  let childLayer = false

  contextData.forEach((layer, i) => {
    data.selection[i] = layerObject(layer, i)

    if (!hasSymbol) hasSymbol = isSymbolInstance(layer)
    if (!lStyle) lStyle = hasLayerStyle(layer)
    if (!childLayer) childLayer = hasChildLayer(layer)
  })

  data.hasSymbol = hasSymbol
  data.hasLayerStyle = lStyle
  data.hasChildLayer = childLayer
  data.sequenceType = getSequenceType()

  // Positional Sequence (meaningful for flat, side-by-side Frames/layers).
  data.selection = getPositionalSequence(data.selection)
  // Keep the count in sync with the set actually renamed.
  data.selectionCount = data.selection.length

  // Hierarchy-ordered set including nested Frames, for the "Include nested
  // frames" option. Numbered by tree order (idx), NOT by position.
  if (nestedFrames) {
    data.selectionNested = nestedFrames.map((layer, i) => layerObject(layer, i))
    data.selectionNestedCount = data.selectionNested.length
    data.hasNested = data.selectionNested.length > data.selection.length
  } else {
    data.selectionNested = []
    data.selectionNestedCount = 0
    data.hasNested = false
  }

  return data
}

function getAllDescendants(layer) {
  const result = [layer]
  const sublayers = layer.containedLayers()
  for (let i = 0; i < sublayers.count(); i++) {
    getAllDescendants(sublayers[i]).forEach(l => result.push(l))
  }
  return result
}

export function findReplaceDataParser(context) {
  const data = parseData(context)
  const page = data.doc.currentPage()

  // Page-wide set (for the "Current page" scope).
  let layers
  try {
    layers = page.childrenIncludingSelf(true)
  } catch (e) {
    layers = getAllDescendants(page)
  }
  data.allLayers = []

  layers.forEach((layer, i) => {
    data.allLayers[i] = layerObject(layer, i)
  })

  // Selection set INCLUDING descendants (for the "Selected layers" scope), so
  // Find & Replace reaches layers nested inside selected Frames/groups.
  const selWithDescendants = []
  const seen = {}
  context.selection.forEach((el) => {
    getAllDescendants(el).forEach((layer) => {
      const key = layerKey(layer)
      if (seen[key]) return
      seen[key] = true
      selWithDescendants.push(layer)
    })
  })
  data.selection = selWithDescendants.map((layer, i) => layerObject(layer, i))
  data.selectionCount = data.selection.length

  return data
}
