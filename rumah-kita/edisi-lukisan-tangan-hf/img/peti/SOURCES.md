# img/peti — sumber lukisan (Susun Peti, bahagian 51)

Lukisan tangan untuk permainan kecil **Susun Peti**. Ia dijana dengan Hugging Face oleh sesi utama pada 3 Nov 2026:

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU `black-forest-labs/FLUX.2-klein-4B`;
- **Penukaran:** PNG asal ditukar kepada WebP oleh rk-sims. Barang dikecilkan ke ≤ 240 px.

| Fail | Isi |
|---|---|
| `fridge.webp` | peti sejuk terbuka dengan bekas lutsinar (768×1024) |
| `fridge-tutup.webp` | peti sejuk tertutup (lukisan semula yang sepadan dengan model peti terbuka) |
| `it0.webp` | telur dalam dulang |
| `it1.webp` | ayam sekor (berbungkus) |
| `it2.webp` | ikan kembung |
| `it3.webp` | kangkung |
| `it4.webp` | susu kotak |
| `it5.webp` | kicap |
| `it6.webp` | cili merah |
| `it7.webp` | mentega |
| `it8.webp` | udang & bawang |
| `it9.webp` | tempe |
| `it10.webp` | bawang merah & sambal |
| `oyen.webp` | Oyen, kucing oren (potongan) |

## Lukisan semula (3 Nov 2026, ejen seni)

Label botol kicap asal bertulis "SOAY" dan kotak susu asal ada tulisan merepek. Kedua-duanya dilukis semula dengan suntingan imej
FLUX.2-klein-4B (Apache-2.0) di Space ZeroGPU yang sama (`gradio_client`, `/infer`, "Distilled (4 steps)"), dengan lukisan
asal (atas latar putih) sebagai rujukan. Kini label tiada tulisan. Latar dibuang dengan kunci putih (isi banjir dari tepi
gambar), dan saiz dikecilkan ke ≤ 240 px.

| Fail | Prompt |
|---|---|
| `it5.webp` | Repaint this soy sauce bottle so its label is a plain blank red and yellow label with a simple painted chilli-leaf shape and absolutely no letters, no words and no text at all; keep the same bottle, colours, style and white background. Hand-painted gouache and watercolour storybook illustration … no text. |
| `it4.webp` | Repaint this milk carton so it has plain blue and white panels with a simple painted white milk splash and absolutely no letters, no words, no barcode and no text at all; keep the same carton, colours, style and white background. Hand-painted gouache and watercolour storybook illustration … no text. |

