/**
 * Rename engine.
 *
 * Vendored, open-source reconstruction of the rename logic that used to live in
 * this plugin's own `src/lib/Rename.js` before it was moved into the private
 * `@rodi01/renameitlib` package (commit "Separated lib files", rodi01/RenameIt).
 * This is a faithful port of that original open code by Rodrigo Soares, wrapped
 * in the `Rename` class API the plugin calls and updated to `change-case` v4's
 * split packages. The keyword set matches the plugin's Keyword buttons:
 *
 *   %*            current layer name
 *   %*u% %*l%     upper / lower case of the layer name
 *   %*t% %*uf%    title case / upper-case first
 *   %*c% %*pc%    camelCase / param-case
 *   %N %n         ascending / descending number sequence (%NN, %nn ... = padded)
 *   %A %a %ar%    alphabet sequence (upper / lower / reversed)
 *   %w %h         layer width / height
 *   %p %o         page name / parent name
 *   %s            symbol name
 *   %ls%          layer style name
 *   %ch%          child layer name (only when `allowChildLayer` is set)
 */

import { upperCase } from 'upper-case'
import { lowerCase } from 'lower-case'
import { upperCaseFirst } from 'upper-case-first'
import { camelCase, paramCase } from 'change-case'
import toTitleCase from 'titlecase'

/**
 * Replace the current-layer-name keywords (`%*` and its case variants).
 * Variants are handled before the bare `%*` so they aren't consumed early.
 */
function currentLayer(newLayerName, layerName) {
  let name = newLayerName.replace(/%\*u%/gi, upperCase(layerName))
  name = name.replace(/%\*l%/gi, lowerCase(layerName))
  name = name.replace(/%\*t%/gi, toTitleCase(layerName))
  name = name.replace(/%\*uf%/gi, upperCaseFirst(layerName))
  name = name.replace(/%\*c%/gi, camelCase(layerName))
  name = name.replace(/%\*pc%/gi, paramCase(layerName))
  name = name.replace(/%\*/g, layerName)
  return name
}

/**
 * Left-pad a number `n` to width `p` with char `c` (default "0").
 */
function paddy(n, p, c) {
  const padChar = typeof c !== 'undefined' ? c : '0'
  const pad = new Array(1 + p).join(padChar)
  return (pad + n).slice(-pad.length)
}

export default class Rename {
  constructor(options = {}) {
    this.allowChildLayer = Boolean(options.allowChildLayer)
  }

  /**
   * Compute the new name for a single layer.
   *
   * @param {{layerName: string, currIdx: number, selectionCount: number,
   *          startsFrom: number, inputName: string, width: number, height: number,
   *          pageName: string, parentName: string, symbolName: string,
   *          layerStyle: string, childLayer: string}} options
   * @return {string} The renamed layer name
   */
  layer(options) {
    let newLayerName = options.inputName

    // Number sequences (%N ascending, %n descending; repeats = zero padding)
    const nInterators = newLayerName.match(/%N+/gi)
    if (nInterators != null) {
      const replaceNumber = (match) => {
        let nnSize = match.length - 1
        const letter = match.charAt(1)
        let num =
          letter === 'N'
            ? options.currIdx
            : options.selectionCount - options.currIdx - 1
        num += options.startsFrom

        // Grow the pad width so numbers past the pad size aren't truncated
        if (num > 999 && (nnSize === 1 || nnSize === 2 || nnSize === 3)) nnSize = 4
        else if (num > 99 && (nnSize === 1 || nnSize === 2)) nnSize = 3
        else if (num > 9 && nnSize === 1) nnSize = 2

        return paddy(num, nnSize)
      }
      newLayerName = newLayerName.replace(/%n+/gi, replaceNumber)
    }

    // Alphabet sequences (%A upper, %a lower, %ar% reversed)
    const aInterators = newLayerName.match(/(?!%ar%)%A/gi)
    const reverseAInterators = newLayerName.match(/%ar%/gi)
    const alphaArr = 'abcdefghijklmnopqrstuvwxyz'.split('')
    const totalAlpha = alphaArr.length

    const replaceAlpha = (match) => {
      const letter = match.charAt(1)
      const current =
        match === '%ar%'
          ? options.selectionCount - options.currIdx - 1
          : options.currIdx
      let alpha = alphaArr[current % totalAlpha]

      if (current >= totalAlpha) {
        const flIdx = Math.floor(current / totalAlpha)
        alpha = `${alphaArr[flIdx - 1]}${alpha}`
      }

      return letter === 'A' ? alpha.toUpperCase() : alpha
    }

    // Reversed alpha must run first so the trailing `%a` replace doesn't eat it
    if (reverseAInterators != null) {
      newLayerName = newLayerName.replace(/%ar%/gi, replaceAlpha)
    }
    if (aInterators != null) {
      newLayerName = newLayerName.replace(/%a/gi, replaceAlpha)
    }

    // Current layer name and its case variants
    newLayerName = currentLayer(newLayerName, options.layerName)

    // Width and height
    newLayerName = newLayerName.replace(/%w/gi, options.width)
    newLayerName = newLayerName.replace(/%h/gi, options.height)

    // Page and parent name
    newLayerName = newLayerName.replace(/%p/gi, options.pageName)
    newLayerName = newLayerName.replace(/%o/gi, options.parentName)

    // Symbol name
    newLayerName = newLayerName.replace(/%s/gi, options.symbolName || '')

    // Layer style name
    newLayerName = newLayerName.replace(/%ls%/gi, options.layerStyle || '')

    // Child layer name (opt-in)
    if (this.allowChildLayer) {
      newLayerName = newLayerName.replace(/%ch%/gi, options.childLayer || '')
    }

    return newLayerName
  }
}
