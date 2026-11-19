# img/juara — sumber lukisan (Juara Dapur, bahagian 54)

Lukisan tangan untuk **Juara Dapur** (`laporan/spec-juara-dapur.md` §8). Juri kekal dengan potret watak painted yang sedia ada. Setiap gambar diguna selepas dimuat; kalau gagal, emoji/CSS kekal.

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` melalui `gradio_client` (`/infer`, mod "Distilled (4 steps)",
  guidance 1.0, benih tetap), dilukis oleh ejen seni pada **3 Nov 2026**;
- **Gaya:** setiap prompt diakhiri dengan: *"A single object centred and fully visible, isolated on a plain pure white background, no cast shadow, no border. Hand-painted gouache and watercolour storybook illustration, soft visible brush texture, gentle warm light from the upper left, cosy children's picture-book style. Absolutely no text, no letters, no words, no labels, no logos."* (latar dewan: tanpa ayat potongan);
- **Suntingan:** baris bertanda *(sunting: X)* ialah suntingan imej FLUX.2 dengan lukisan X sebagai rujukan, supaya bentuk sama;
- **Potongan:** latar putih dibuang dengan kunci putih (isi banjir dari tepi gambar, jadi mangkuk dan pinggan putih kekal) — piala dan
  botol kicap dengan BiRefNet (ONNX, tempatan) — kemudian dipangkas, dikecilkan ke ≤ 240 px dan disimpan sebagai WebP.

| Fail | Isi | Prompt |
|---|---|---|
| `dewan.webp` | latar dewan orang ramai: meja pertandingan dan bunting (704×1024, tanpa potongan) | Interior of a Malaysian village community hall (dewan orang ramai) set up for a friendly Saturday cooking contest: strings of colourful triangle bunting flags across the ceiling, ceiling fans, louvred windows with warm afternoon sunlight, a small wooden stage at the back, and in the foreground a long contest table with a cream tablecloth and a red table skirt, the table top empty. No people. No text, no banners with words, no letters anywhere. Soft gouache storybook background painting, portrait composition with lots of open floor and wall space. |
| `nasilemak.webp` | nasi lemak — cantik | Malaysian nasi lemak on a white plate: a dome of coconut rice, red sambal, fried anchovies and peanuts, sliced cucumber, half a hard-boiled egg, on a piece of banana leaf, seen at a three-quarter view from above, neatly presented. |
| `nasilemak_h.webp` | nasi lemak — hangus | Make this dish look badly overcooked and burnt: the food blackened, charred and dried out with smoky dark patches, a bit messy on the plate; keep the same plate, dish, view and white background. *(sunting: j_nasilemak)* |
| `megoreng.webp` | mee goreng mamak — cantik | Malaysian mee goreng mamak on a white plate: reddish fried yellow noodles with tofu, egg, choy sum greens, a lime half and fried shallots, seen at a three-quarter view from above, neatly presented. |
| `megoreng_h.webp` | mee goreng mamak — hangus | Make this dish look badly overcooked and burnt: the food blackened, charred and dried out with smoky dark patches, a bit messy on the plate; keep the same plate, dish, view and white background. *(sunting: j_megoreng)* |
| `ckt.webp` | char kway teow — cantik | Penang char kway teow on a white plate: a pile of wide flat ribbon-shaped rice noodles stir-fried to a light glossy caramel brown with dark soy, mixed with pink prawns, slices of Chinese sausage, white bean sprouts, green garlic chives and scrambled egg, seen at a three-quarter view from above, neatly presented. |
| `ckt_h.webp` | char kway teow — hangus | Make this dish look badly overcooked and burnt: the food blackened, charred and dried out with smoky dark patches, a bit messy on the plate; keep the same plate, dish, view and white background. *(sunting: j_ckt_v2)* |
| `roticanai.webp` | roti canai + kari — cantik | Malaysian roti canai on a white plate: two flaky golden folded flatbreads with a small bowl of yellow dhal curry and a little sambal, seen at a three-quarter view from above, neatly presented. |
| `roticanai_h.webp` | roti canai + kari — hangus | Make this dish look badly overcooked and burnt: the food blackened, charred and dried out with smoky dark patches, a bit messy on the plate; keep the same plate, dish, view and white background. *(sunting: j_roticanai)* |
| `asampedas.webp` | asam pedas — cantik | Malaysian asam pedas in a shallow white bowl: a piece of mackerel fish in red-orange sour spicy tamarind gravy with okra and tomato wedges, seen at a three-quarter view from above, neatly presented. |
| `asampedas_h.webp` | asam pedas — hangus | Make this dish look badly overcooked and burnt: the food blackened, charred and dried out with smoky dark patches, a bit messy on the plate; keep the same plate, dish, view and white background. *(sunting: j_asampedas)* |
| `beras.webp` | bahan: beras | A small heap of uncooked white rice grains in a little wooden scoop, seen at a three-quarter view from above. |
| `santan.webp` | bahan: santan | Half a brown coconut and a small bowl of white coconut milk, seen at a three-quarter view from above. |
| `ikanbilis.webp` | bahan: ikanbilis | A small pile of dried anchovies (ikan bilis), seen at a three-quarter view from above. |
| `timun.webp` | bahan: timun | A green cucumber with a few round slices, seen at a three-quarter view from above. |
| `bendi.webp` | bahan: bendi | Three fresh green okra pods (lady's fingers), seen at a three-quarter view from above. |
| `udang.webp` | bahan: udang | Three raw grey-pink prawns with shells, seen at a three-quarter view from above. |
| `mi.webp` | bahan: mi | A bundle of fresh yellow egg noodles, seen at a three-quarter view from above. |
| `sawi.webp` | bahan: sawi | A bunch of fresh choy sum greens (sawi) with yellow flowers, seen at a three-quarter view from above. |
| `tauhu.webp` | bahan: tauhu | Three cubes of fried tofu puffs, golden brown, seen at a three-quarter view from above. |
| `kicap.webp` | bahan: kicap | A glass bottle of dark soy sauce with a red cap and a plain blank red label, seen at a three-quarter view from above. |
| `tenggiri.webp` | bahan: tenggiri | A raw spanish mackerel (ikan tenggiri) fish steak slice, seen at a three-quarter view from above. |
| `kueyteow.webp` | bahan: kueyteow | A small round bamboo plate holding a loose tangled heap of fresh wide flat white rice noodles (kway teow), each noodle a broad flat soft glossy ribbon about a finger wide, seen at a three-quarter view from above. |
| `taugeh.webp` | bahan: taugeh | A small heap of fresh white bean sprouts, seen at a three-quarter view from above. |
| `kucai.webp` | bahan: kucai | A bunch of fresh flat green garlic chives, seen at a three-quarter view from above. |
| `tepung.webp` | bahan: tepung | A small bowl full of white wheat flour, seen at a three-quarter view from above. |
| `marjerin.webp` | bahan: marjerin | A small block of yellow margarine on a piece of plain wax paper, seen at a three-quarter view from above. |
| `dhal.webp` | bahan: dhal | A small bowl of dry yellow split lentils (dhal), seen at a three-quarter view from above. |
| `bawang.webp` | bahan: bawang | Two red shallots and one brown onion, seen at a three-quarter view from above. |
| `asam.webp` | bahan: asam | A few dried brown slices of tamarind fruit (asam keping), seen at a three-quarter view from above. |
| `tomato.webp` | bahan: tomato | Two ripe red tomatoes, one cut into wedges, seen at a three-quarter view from above. |
| `kuali.webp` | kuali | An empty black iron wok (kuali) with two small round handles, seen at a three-quarter view from above. |
| `periuk.webp` | periuk | A shiny aluminium cooking pot (periuk) with a lid and two side handles, seen at a three-quarter view. |
| `papan.webp` | papan pemotong | A round thick wooden chopping board (tree-trunk slice) with a kitchen knife resting on it, seen at a three-quarter view from above. |
| `piala.webp` | piala | A shiny gold trophy cup with two handles on a dark wooden base, plain with no engraving. |

Catatan: versi hangus (`*_h`) disunting daripada pinggan cantik masing-masing supaya pinggan dan susunan sama.

## Helaian atlas (rk-ringan, 3 Nov 2026)

Halaman claude.ai hanya boleh memegang 511 fail, jadi 34 gambar kecil di atas kini disusun dalam **satu helaian**,
`juara.webp` (1264×1434). Nama fail dalam jadual kekal sebagai nama sel. `dewan.webp` kekal sebagai fail sendiri
(latar penuh, tanpa potongan, tidak dikod semula).

- **Koordinat:** `index.json` → `atlas.juara.c` (`nama: [x, y, w, h]`, format yang sama dengan `img/oyen/`), dan `ada: ["dewan"]`;
- **Susunan:** setiap sel bermula pada grid 16 px dengan jurang lutsinar sekurang-kurangnya 4 px, jadi tiada blok WebP yang
  bercampur dua gambar (tiada bleeding, tiada tepi putih). Saiz sel = saiz asal gambar (tiada skala semula);
- **Kodekan:** WebP lossy kualiti 95, alfa lossless (alfa sama tepat dengan asal; PSNR warna berbanding asal: min 41.1 dB, purata 44.4 dB);
- **Dalam permainan:** `HF.cutArt` (bahagian 53a) memuat helaian sekali bila Juara Dapur dibuka dan menyalin setiap sel 1:1 ke
  kanvasnya sendiri, jadi paparan sama seperti fail asing dahulu. Kalau helaian gagal dimuat, emoji/CSS kekal;
- **Dibuang:** 34 fail `*.webp` kecil yang lama (semua kecuali `dewan.webp`) — isinya kini dalam `juara.webp`.
