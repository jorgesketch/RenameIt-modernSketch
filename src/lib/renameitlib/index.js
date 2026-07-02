/**
 * Local, open-source replacement for `@rodi01/renameitlib`.
 *
 * The original package was private (GitHub Packages) and is a relocated copy of
 * this plugin's own previously-open rename logic. Vendoring it here keeps the
 * fork self-contained and buildable with only public dependencies.
 */

export { default as Rename } from './Rename'
export { default as FindReplace } from './FindReplace'
