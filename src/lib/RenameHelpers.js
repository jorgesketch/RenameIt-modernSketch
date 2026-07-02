/*
 * @Author: Rodrigo Soares
 * @Date: 2020-04-24 10:42:03
 * @Last Modified by: Rodrigo Soares
 * @Last Modified time: 2020-04-27 00:25:13
 */

import Settings from 'sketch/settings' // eslint-disable-line
const SEQUENCE_KEY = 'sequenceType'

/**
 * Check if a layer is a Frame (this includes Graphics and Stacks, which are
 * Frames under the hood) or a Symbol Master.
 *
 * Note: `isCanvasFrame()` is intentionally NOT used as the primary check — it
 * only returns true for top-level Frames whose parent is the Page, so it misses
 * nested Frames. In Sketch's model a group carries the `.frame` trait when its
 * `groupBehavior` is Frame (1) or Graphic (2), or when it has a Stack (flex)
 * layout applied. Those are the properties we probe here so nested Frames,
 * Graphics and Stacks are all recognised at any depth.
 *
 * @param  {Object}  layer The layer
 * @return {Boolean}
 */
export function isArtboard(layer) {
  // Symbol Masters are Frame-like and renamed by the Frames command.
  try {
    if (layer instanceof MSSymbolMaster) return true
  } catch (error) {} // eslint-disable-line no-empty

  // Shape groups subclass MSLayerGroup but can never be Frames/Graphics.
  try {
    if (layer instanceof MSShapeGroup) return false
  } catch (error) {} // eslint-disable-line no-empty

  // Frames (groupBehavior 1) and Graphics (groupBehavior 2).
  try {
    const behavior = Number(layer.groupBehavior())
    if (behavior === 1 || behavior === 2) return true
  } catch (error) {} // eslint-disable-line no-empty

  // Stacks: a default group with a flex/stack layout gains the Frame trait.
  try {
    if (layer.hasFlexLayout()) return true
  } catch (error) {} // eslint-disable-line no-empty

  // Legacy fallbacks for older Sketch versions (pre-Frames model).
  try {
    if (layer.isCanvasFrame && layer.isCanvasFrame()) return true
  } catch (error) {} // eslint-disable-line no-empty
  try {
    if (typeof MSArtboardGroup !== 'undefined' && layer instanceof MSArtboardGroup)
      return true
  } catch (error) {} // eslint-disable-line no-empty

  return false
}

/**
 * A stable identity key for a layer, used to de-duplicate collected Frames.
 *
 * @param  {Object} layer The layer
 * @return {String}
 */
export function layerKey(layer) {
  try {
    return String(layer.objectID())
  } catch (error) {} // eslint-disable-line no-empty
  return String(layer)
}

/**
 * Recursively collect every nested Frame/Graphic/Stack within `layer` (at any
 * depth) and hand each one to the `collect` callback. `layer` itself is not
 * collected — only its descendants.
 *
 * @param {Object}   layer   The layer to descend into
 * @param {Function} collect Called with each nested Frame found
 */
export function collectNestedArtboards(layer, collect) {
  let children
  try {
    children = layer.layers()
  } catch (error) {
    return
  }
  if (!children) return

  const count = typeof children.count === 'function' ? children.count() : children.length
  for (let i = 0; i < count; i += 1) {
    const child =
      typeof children.objectAtIndex === 'function'
        ? children.objectAtIndex(i)
        : children[i]
    if (isArtboard(child)) collect(child)
    collectNestedArtboards(child, collect)
  }
}

/**
 * Check if has symbol instance
 *
 * @param {Object} layer
 * @returns {Boolean}
 */
export function isSymbolInstance(layer) {
  try {
    return (
      layer instanceof MSSymbolInstance && layer.symbolMaster() !== undefined
    )
  } catch (error) {
    return false
  }
}

/**
 * Get the name of the symbol instance
 *
 * @param {Object} layer
 * @returns {String} Name of the symbol
 */
export function getSymbolName(layer) {
  let name = ''
  if (isSymbolInstance(layer)) {
    try {
      name = String(layer.symbolMaster().name())
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }
  return name
}

/**
 * Check if layer styles is applied
 *
 * @param {Object} layer
 * @returns {Boolean}
 */
export function hasLayerStyle(layer) {
  try {
    return layer.sharedStyle() instanceof MSSharedStyle
  } catch (error) {
    return false
  }
}

export function getLayerStyle(layer) {
  let name = ''

  if (hasLayerStyle(layer)) {
    try {
      name = String(layer.sharedStyle().name())
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return name
}

/**
 * Check if has child layer
 *
 * @param {Object} layer
 * @returns {Boolean}
 */
export function hasChildLayer(layer) {
  try {
    return layer.layers() !== undefined && layer.layers().length > 0
  } catch (error) {
    return false
  }
}

/**
 * Find first layer and return it
 *
 * @param {Object} layer
 * @returns {String}
 */
export function getChildLayer(layer) {
  let name = ''

  if (hasChildLayer(layer)) {
    try {
      const idx = layer.layers().length - 1
      name = String(layer.layers()[idx].name())

      // eslint-disable-next-line no-empty
    } catch (error) {
      console.log('ERROR CHILD LAYER')
    }
  }

  return name
}

/**
 * Get Origin of layers and retunr the minX and minY
 *
 * @param {*} layers
 * @returns
 */
function getOrigin(layers) {
  const minX = layers.reduce(
    (prev, current) => (prev.x < current.x ? prev : current),
    1
  )

  const minY = layers.reduce(
    (prev, current) => (prev.y < current.y ? prev : current),
    1
  )
  return {
    x: minX.x,
    y: minY.y,
  }
}

function sortBy(layers, direction) {
  const origin = getOrigin(layers)
  let starterLayers = []
  const maxPos = direction === 'x' ? 'maxY' : 'maxX'
  const opDirection = direction === 'x' ? 'y' : 'x'

  layers.forEach((ly) => {
    let leftMostLayer = true
    layers.forEach((ly2) => {
      if (ly === ly2) return

      if (ly2[direction] < ly[direction]) {
        if (ly[opDirection] <= ly2[maxPos] && ly2[opDirection] <= ly[maxPos]) {
          leftMostLayer = false
          return
        }
      }
    })

    if (leftMostLayer) {
      starterLayers.push(ly)
    }
  })

  // Sort starting layers
  starterLayers.sort((a, b) => a[opDirection] - b[opDirection])

  // start a list of layers for each row
  let groups = starterLayers.map((ly) => [ly])
  let groupHeights = starterLayers.map((ly) => ly[maxPos] - ly[opDirection])
  starterLayers.forEach((ly, i) => {
    ly.group = i
  })

  // assign all other artboards to a row by
  // computing shortest distance between artboard vertical centers
  layers
    .filter((ly) => !starterLayers.includes(ly))
    .forEach((ly) => {
      starterLayers.forEach((lyStarter) => {
        lyStarter._tmpDistance = Math.abs(
          (lyStarter[opDirection] + lyStarter[maxPos]) / 2 -
            (ly[opDirection] + ly[maxPos]) / 2
        )
      })

      const curStarterLy = starterLayers.reduce((prev, current) =>
        prev._tmpDistance < current._tmpDistance ? prev : current
      )
      groups[curStarterLy.group].push(ly)

      // update row height
      groupHeights[curStarterLy.group] = Math.max(
        groupHeights[curStarterLy.group],
        ly[maxPos] - ly[opDirection]
      )
    })

  // sort each row by x position
  groups.forEach((lyInGroup) => {
    lyInGroup.sort((a, b) => a[direction] - b[direction])
  })

  // finally, arrange everything
  let opPos = origin[opDirection]
  let index = 0
  let arr = []

  groups.forEach((lyInRows, r) => {
    lyInRows.forEach((ly) => {
      if (direction === 'x') {
        ly.xIdx = index
      } else {
        ly.yIdx = index
      }

      index++
      arr.push(ly)
    })
    opPos += groupHeights[r]
  })
  return arr
}

/**
 *  Find the X or Y positions of the layers and add them as object properties
 *
 * @export
 * @param {Object} layers
 * @returns {Object} Layers
 */
export function getPositionalSequence(layers) {
  let lrs = sortBy(layers, 'x')
  lrs = sortBy(layers, 'y')
  return lrs
}

export function getSequenceType() {
  return Settings.settingForKey(SEQUENCE_KEY) || 'layerList'
}

export function setSequenceType(type) {
  Settings.setSettingForKey(SEQUENCE_KEY, type)
}
