/**
 * Find & Replace engine.
 *
 * Vendored, open-source reconstruction of the plugin's original
 * `src/lib/FindReplace.js` by Rodrigo Soares (later moved into the private
 * `@rodi01/renameitlib` package), wrapped in the `FindReplace` class API the
 * plugin calls.
 */

/**
 * Escape RegExp special characters so `findText` is matched literally.
 */
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
}

export default class FindReplace {
  /**
   * Whether `findText` occurs in the layer name.
   *
   * @param {{layerName: string, findText: string, caseSensitive: boolean}} options
   * @return {boolean}
   */
  match(options) {
    if (options.findText.length <= 0) return false
    let str = options.findText
    let layerName = options.layerName
    if (!options.caseSensitive) {
      str = str.toLowerCase()
      layerName = layerName.toLowerCase()
    }
    return layerName.includes(str)
  }

  /**
   * Replace every occurrence of `findText` with `replaceWith` in the layer name.
   *
   * @param {{layerName: string, findText: string, replaceWith: string, caseSensitive: boolean}} options
   * @return {string} The renamed layer name
   */
  layer(options) {
    const reg = options.caseSensitive
      ? new RegExp(escapeRegExp(options.findText), 'g')
      : new RegExp(escapeRegExp(options.findText), 'gi')
    return options.layerName.replace(reg, options.replaceWith)
  }
}
