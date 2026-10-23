# Rumah Kita

Rumah Kita is a Malaysian family life-sim that plays in a web browser. All in-game text is in Bahasa Melayu.

This folder collects every version of the game, plus the art tools and design documents, copied from the Claude artifacts where they were built (October 2026).

## Play online

- [Edisi Episod (latest)](https://zuraidah94.github.io/public-doc/rumah-kita/edisi-episod/)
- [Edisi Lukisan Tangan](https://zuraidah94.github.io/public-doc/rumah-kita/edisi-lukisan-tangan/)
- [Original](https://zuraidah94.github.io/public-doc/rumah-kita/asal/)

## Game versions

Open the `index.html` in any folder to play. Newest first.

| Folder | Version | Last updated | Notes |
| --- | --- | --- | --- |
| [`edisi-episod/`](edisi-episod/) | Rumah Kita Edisi Episod | 22 Oct 2026 | Latest full game. Edisi Lukisan Tangan plus episode backdrops (`img/ep/`) and the episode cast sheet. |
| [`edisi-lukisan-tangan/`](edisi-lukisan-tangan/) | Rumah Kita — Edisi Lukisan Tangan | 22 Oct 2026 | Full game with hand-drawn art: houses, scenes, drama cards, families, maps, UI. |
| [`episod/`](episod/) | Rumah Kita Episod | 22 Oct 2026 | Rumah Kita 2.0 prototype (PixiJS) with Nadia's 12 portrait expressions. |
| [`gerbang-1/`](gerbang-1/) | Rumah Kita 2.0 Gerbang 1 | 19 Oct 2026 | First Rumah Kita 2.0 milestone (PixiJS): furniture atlas, floors and Nadia's poses. |
| [`asal/`](asal/) | Rumah Kita (original) | 18 Oct 2026 | The original isometric game, before the hand-drawn art. |

## Tools

| Folder | What it is |
| --- | --- |
| [`alat/papan-gaya/`](alat/papan-gaya/) | Papan Gaya Rumah Kita: the visual style board (reference images by phase). |
| [`alat/pelukis/`](alat/pelukis/) | Pelukis Rumah Kita: the procedural Canvas 2D drawing prototype. |

## Documents

| File | What it is |
| --- | --- |
| [`dokumen/panduan-rumah-kita.md`](dokumen/panduan-rumah-kita.md) | Panduan Rumah Kita: the player guide to every feature. |
| [`dokumen/reka-bentuk-permainan-2d-chibi.md`](dokumen/reka-bentuk-permainan-2d-chibi.md) | Game design document and the prompt for a 2D chibi version. |
| [`dokumen/spesifikasi-teknikal-2.0.md`](dokumen/spesifikasi-teknikal-2.0.md) | Rumah Kita 2.0 technical specification. Its two embedded diagrams did not export and show as placeholders. |

## Playing outside Claude

The games run from any web server, including GitHub Pages (Settings → Pages → deploy from the `main` branch). Opening `index.html` straight from disk may block some images, so a server is the safer choice.

A few features need Claude's artifact runtime and are switched off elsewhere:

- **Cloud save** (☁️ Save to cloud / Load from cloud). Saves still work in the browser's local storage.
- **Downloading generated images** (kad raya, salasilah poster, konvokesyen photo). The game asks you to take a screenshot instead.

`episod/` and `gerbang-1/` load PixiJS from the internet, and `gerbang-1/` and `alat/pelukis/` load Google Fonts, so they need a connection.
