# img/karipap — sumber lukisan (Karipap Pusing, bahagian 53)

Lukisan tangan untuk permainan kecil **Karipap Pusing** (`laporan/spec-karipap.md` §7). Setiap gambar diguna selepas dimuat; kalau gagal, lukisan kod (CSS) kekal.

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` melalui `gradio_client` (`/infer`, mod "Distilled (4 steps)",
  guidance 1.0, benih tetap), dilukis oleh ejen seni pada **3 Nov 2026**;
- **Gaya:** setiap prompt diakhiri dengan: *"A single object centred and fully visible, isolated on a plain pure white background, no cast shadow, no border. Hand-painted gouache and watercolour storybook illustration, soft visible brush texture, gentle warm light from the upper left, cosy children's picture-book style. Absolutely no text, no letters, no words, no labels, no logos."* (latar dewan: tanpa ayat potongan);
- **Suntingan:** baris bertanda *(sunting: X)* ialah suntingan imej FLUX.2 dengan lukisan X sebagai rujukan, supaya bentuk sama;
- **Potongan:** latar putih dibuang dengan kunci putih (isi banjir dari tepi gambar, jadi mangkuk dan pinggan putih kekal) — piala dan
  botol kicap dengan BiRefNet (ONNX, tempatan) — kemudian dipangkas, dikecilkan ke ≤ 240 px dan disimpan sebagai WebP.

| Fail | Isi | Prompt |
|---|---|---|
| `doh.webp` | kulit doh bulat | A round flat circle of raw rolled-out pastry dough for curry puffs, pale cream colour with a light dusting of flour, seen from directly above. |
| `mentah.webp` | karipap mentah (separuh bulan, kelim pintal) | One raw uncooked Malaysian curry puff (karipap) lying flat, seen from directly above. Its outline is an exact half circle like a half moon: a long perfectly straight flat edge along the bottom and a round semicircular dome edge on top, with a neat hand-twisted rope-like crimped pleat (kelim pintal) running along the curved top edge. Plump, pale cream raw pastry. |
| `emas.webp` | karipap keemasan (Rangup) | Make this curry puff deep-fried to a perfect crisp golden-orange colour with a slightly blistered flaky surface; keep exactly the same shape, pleats, view and white background. *(sunting: k_mentah)* |
| `perang.webp` | karipap perang (Garing) | Make this curry puff over-fried to a deep dark brown colour, still edible; keep exactly the same shape, pleats, view and white background. *(sunting: k_mentah)* |
| `hangus.webp` | karipap hangus | Make this curry puff completely burnt all over from frying too long: evenly very dark charred black-brown pastry everywhere with a slightly smoky dull surface; keep exactly the same shape, pleats, view and white background. *(sunting: k_mentah)* |
| `kari.webp` | mangkuk inti kari kentang | A small white enamel bowl with a blue rim, filled with Malaysian curry puff filling: soft yellow curried potato cubes with curry leaves, seen at a three-quarter view from above. |
| `daging.webp` | mangkuk inti daging cincang | Replace the filling in this bowl with crumbly finely minced cooked beef filling: small loose brown mince crumbs with diced onion and a few green peas, no meatballs; keep the same bowl, view and white background. *(sunting: k_kari)* |
| `sardin.webp` | mangkuk inti sardin | Replace the filling in this bowl with canned sardine filling: flaked broken pieces of sardine fish mashed in thick red tomato sauce with thinly sliced red onion; keep the same bowl, view and white background. *(sunting: k_kari)* |
| `telur.webp` | mangkuk inti kentang telur | Replace the filling in this bowl with mashed potato mixed with chopped hard-boiled egg (white and yellow pieces) and a little curry; keep the same bowl, view and white background. *(sunting: k_kari)* |
| `kuali.webp` | kuali berminyak atas dapur gas | A deep round-bottomed black iron Chinese wok (kuali) with two small metal loop handles on opposite sides and no long handle, filled with shimmering hot golden cooking oil with small bubbles, sitting on a small single-burner portable gas stove with a blue flame underneath, seen at a three-quarter view from above. |
| `dulang.webp` | dulang aluminium | An empty rectangular silver aluminium baking tray with low rounded edges, seen from directly above, landscape orientation. |
| `bekas.webp` | bekas plastik terbuka | An empty open clear transparent plastic food container (rectangular takeaway box), seen at a three-quarter view from above, no lid. |
| `tutup.webp` | bekas plastik bertutup | A closed rectangular plastic food container with a teal-green snap-on lid, seen at a three-quarter view from above, golden curry puffs faintly visible through the translucent sides. |

Saiz: prop besar (`kuali`, `dulang`, `bekas`, `tutup`) dipaparkan pada 300–430 px CSS, jadi disimpan sehingga 480 px (bekas dan tutup pada saiz asal potongan, 402 dan 431 px); yang lain ≤ 240 px.

Catatan: `emas`, `perang` dan `hangus` disunting daripada `mentah` supaya bentuk sama; `daging`, `sardin` dan `telur` disunting daripada mangkuk `kari`.

## Helaian atlas (rk-ringan, 3 Nov 2026)

Halaman claude.ai hanya boleh memegang 511 fail, jadi 13 gambar di atas kini disusun dalam **satu helaian**,
`karipap.webp` (1152×1018). Nama fail dalam jadual kekal sebagai nama sel.

- **Koordinat:** `index.json` → `atlas.karipap.c` (`nama: [x, y, w, h]`, format yang sama dengan `img/oyen/`);
- **Susunan:** setiap sel bermula pada grid 16 px dengan jurang lutsinar sekurang-kurangnya 4 px, jadi tiada blok WebP yang
  bercampur dua gambar (tiada bleeding, tiada tepi putih). Saiz sel = saiz asal gambar (prop besar kekal 402–480 px);
- **Kodekan:** WebP lossy kualiti 95, alfa lossless (alfa sama tepat dengan asal; PSNR warna berbanding asal: min 41.6 dB, purata 44.8 dB);
- **Dalam permainan:** `HF.cutArt` (bahagian 53a) memuat helaian sekali bila Karipap Pusing dibuka dan menyalin setiap sel 1:1
  ke kanvasnya sendiri, jadi paparan sama seperti fail asing dahulu. Kalau helaian gagal dimuat, lukisan kod (CSS) kekal;
- **Dibuang:** 13 fail `*.webp` yang lama — isinya kini dalam `karipap.webp`.
