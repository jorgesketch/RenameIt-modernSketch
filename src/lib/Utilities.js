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
  if (onlyArtboards) {
    const frames = []
    const seen = {}
    const collect = (frame) => {
      if (!frame) return
      const key = layerKey(frame)
      if (seen[key]) return
      seen[key] = true
      frames.push(frame)
    }

    contextData.forEach((el) => {
      // Resolve the Frame scope for this selection: the element itself when it
      // is a Frame, otherwise the nearest enclosing Frame walking up the tree.
      let scope = el
      while (scope && !isArtboard(scope)) {
        scope = scope.parentGroup()
      }
      if (!scope) return

      // Collect the scope Frame and every Frame/Graphic/Stack nested inside it,
      // at any depth, so nested Frames within the selection are all renamed.
      collect(scope)
      collectNestedArtboards(scope, collect)
    })
    contextData = frames
  }

  const data = {
    doc: context.document,
    pageName: String(context.document.currentPage().name()),
    selectionCount: Array.isArray(contextData)
      ? contextData.length
      : contextData.count(),
    selection: [],
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

  // Positional Sequence
  data.selection = getPositionalSequence(data.selection)

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

  return data
}
