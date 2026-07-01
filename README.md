# About this fork

This is a community continuation of [Rename It for Sketch](https://github.com/rodi01/RenameIt) by [Rodrigo Soares](https://github.com/rodi01), whose original plugin is no longer maintained (its last tested Sketch version was 67.2).

The original plugin's "Rename Artboards" command only worked with **artboards**. Newer versions of Sketch introduced **frames**, which the original detection logic (`MSArtboardGroup`) didn't recognize. This fork restores that command on modern Sketch.

## What's new in 4.6.0

* **Frames compatibility** — artboard/frame detection now uses Sketch's `isCanvasFrame()` API, so the "Rename Selected Frames" command works with frames as well as artboards (`src/lib/RenameHelpers.js`).
* **Nested layer traversal** — layer collection now walks the full tree via `childrenIncludingSelf()`, with a recursive fallback, so layers nested inside frames are found correctly (`src/lib/Utilities.js`).
* **UI updates** — "Artboard" labels renamed to "Frame", taller command windows, and press <kbd>Esc</kbd> to close a window (`src/commandRenameArtboard.js`, `src/commandSettings.js`, `src/lib/TheUI.js`).
* **Window stability** — windows are now torn down with `win.destroy()` instead of `win.close()` to avoid leftover/ghost windows (`src/lib/TheUI.js`).
* **Robust version check** — the Sketch version gate now parses the version number safely with `parseInt` (`src/lib/VersionAlert.js`).

> This fork is maintained by [@jorgesketch](https://github.com/jorgesketch). All original credit belongs to Rodrigo Soares. Distributed under the original MIT License.

# Rename It

Keep your Sketch files always organized, batch rename layers, frames, and artboards.
[Checkout the original website](https://renameit.design/sketch/)

## Rename Selected Layers

<img src="docs/static/img/renameLayersShortcut.png" width="300">

### Multiple Layers

Rename Multiple layers at once command.

![Rename Multiple Layers](/docs/static/img/gifs/batch_rename.gif)

### Sequence

Sequentially rename layers in either ascending or descending order.

![Rename in Sequence](/docs/static/img/gifs/sequence_rename.gif)

* **Keyword %N** - Ascending numbered sequence
* **Keyword %n** - Descending numbered sequence
* **Keyword %A** - Alphabet sequence

##### Pro Tip

* **Keyword %nn** - This will output 01, 02, 03 and so on
* **Keyword "%a** - Lowercase alphabet sequence

### Current Layer Name

The keyword **%\*** will copy the current selected layer(s) name.

![Current Layer Name](/docs/static/img/gifs/current_layer.gif)

### Layer Name Case

You can use the **%\*** with combination of letters to convert the layer name case.

* **Keyword %\*u%** - Convert to **UPPER CASE**
* **Keyword %\*l%** - Convert to **lower case**
* **Keyword %\*t%** - Convert to **Title Case**
* **Keyword %\*uf%** - Convert to **Upper first word**
* **Keyword %\*c%** - Convert to **camelCase** (This will remove the spaces)

### Add Width and Height

Rename layer(s) with the width **%W** and height **%H** of a layer.

![Width and Height](/docs/static/img/gifs/width_height.gif)

###### NOTE: “%” can be escaped with a backslash “\\”

## Find & Replace in Selected Layers

<img src="docs/static/img/findReplaceShortcut.png" width="320">

Replace any word(s) or character(s) from selected layers.

![Find & Replace](/docs/static/img/gifs/find_replace.gif)

## Rename Frames & Artboards

<img src="docs/static/img/renameArtboardShortcut.png" width="350">

Rename selected frames (and artboards) works the same way as rename selected layers. You don't need to select the frame itself — it will automatically find the frame/artboard of the selected layer(s).

![Rename Artboards](/docs/static/img/gifs/artboard_rename.gif)

## Install

#### For Sketch bellow version 51 the latest version of the plugin won't work. [Please download version 3.8.7 here](https://github.com/rodi01/RenameIt/releases/download/v3.8.7/Rename-It.sketchplugin.zip)

### Sketchpacks

[![Sketchpacks](/docs/static/img/sketchpack_btn.png "Install Rename It with Sketchpacks")](https://sketchpacks.com/rodi01/renameit/install)

### Sketch Runner

![Sketch Runner](/docs/static/img/sketch_runner_hq.gif)

### Direct Download

Download the latest frames-compatible build from this fork's [releases page](https://github.com/jorgesketch/RenameIt-modernSketch/releases/latest). To install, unzip and double-click `Rename-It.sketchplugin`.


## More Info

Rename It was originally created and maintained by Rodrigo Soares — [@rodi01](https://twitter.com/rodi01). This fork is maintained by [@jorgesketch](https://github.com/jorgesketch).

[Checkout the original website for more](https://renameit.design/sketch)

MIT License © Rodrigo Soares. Fork modifications © Jorge Medrano.

## Donate
[Buy me a pizza 🍕](https://www.buymeacoffee.com/rodi01) or donate via [PayPal](https://www.paypal.me/rodi01/5).
