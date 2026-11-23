# img/diorama — sumber lukisan (diorama permainan tradisional, bahagian §115–§117, §123–§125)

`anak.webp`: tiga budak kampung yang dilukis tangan untuk **Main Gasing** dan **Sepak Raga Bulatan** (pemilik 15 Nov: "boleh guna
hugging face untuk betulkan orang ke?"). Amin (baju Melayu biru, sampin merah, kopiah putih), Xiao Hui (samfu merah jambu, tocang
reben merah) dan Deepa (blaus oren, pavadai magenta, tocang melur). Pose: berdiri, lilit, lepas, sorak (gasing, Amin sahaja); sedia,
kaki, lutut, kepala, sorak (sepak raga, setiap budak). 18 gambar, satu helaian WebP 1024 × 409 (≈146 KB).

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` melalui `gradio_client` (`/infer`, mod "Distilled (4 steps)",
  guidance 1.0, benih tetap), 15 Nov 2026, dengan `/tmp/rk-paint-lock` hanya semasa setiap panggilan. Laluan berbayar tidak digunakan;
- **Panduan:** setiap pose dilukis dahulu sebagai patung kapsul berwarna dalam kamera diorama (sama dengan `HFDiorama.person`),
  dari skrip `tools/hf/diorama_anak.py`; pose pertama setiap budak (hero) dilukis dari panduan + budak lelaki lukisan permainan
  (`img/orang-hf/adikm-casual.webp`, gaya sahaja), pose lain dari panduan + hero (muka dan baju kekal);
- **Potongan:** BiRefNet (ONNX, tempatan) membuang latar; dipangkas, dikecilkan (hero 200 px tinggi) dan dipek oleh
  `diorama_anak.py pack`, yang menulis jadual bingkai ke `tools/rk-hf-layer.js` (`/*ANAK:diorama*/ ... /*END:anak*/`).
- **Prompt:** dalam `tools/hf/diorama_anak.py` (`KIDS`, `POSES`, `STYLE`, `prompt()`); benih: Amin 4101, Xiao Hui 4211, Deepa 4321
  (+13 setiap pose; berdiri Amin +1, kaki/lutut Deepa +5, kepala Deepa +2).

`sidai.webp`: dua orang dewasa yang dilukis tangan untuk diorama **Sidai Kain — angkat kain sebelum hujan** (bahagian §117; pemilik
16 Nov: "diorama sidai baju as daily task", kemudian: orang dilukis di Hugging Face). Mak (tudung krim, baju kurung kuning, dari
`img/orang-hf/nurul-tudung-casual.webp`) dan Ayah (t-shirt biru gelap, kain pelekat hijau berpetak, selipar, dari
`img/orang-hf/hafiz-casual.webp`). Pose: pegang (kain basah), sidai (angkat kain tinggi untuk disidai), bakul (bawa bakul rotan),
dongak (pandang langit), lari (bergegas dengan sepelukan kain). 10 gambar, satu helaian WebP.

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` melalui `gradio_client` (`/infer`, mod "Distilled (4 steps)",
  guidance 1.0, benih tetap), 16 Nov 2026, dengan `/tmp/rk-paint-lock` hanya semasa setiap panggilan. Laluan berbayar tidak digunakan;
- **Panduan:** setiap pose dilukis dahulu sebagai patung kapsul berwarna dalam kamera diorama, dari skrip `tools/hf/diorama_sidai.py`;
  setiap pose dilukis dari panduan + bingkai Sim lukisan permainan itu sendiri (muka, pakaian dan gaya kekal);
- **Potongan:** BiRefNet (ONNX, tempatan, dengan `/tmp/rk-cut-lock`) membuang latar; dipangkas, dikecilkan (pegang 230 px tinggi) dan
  dipek oleh `diorama_sidai.py pack`, yang menulis jadual bingkai ke `tools/rk-hf-layer.js` (`/*SIDAI:diorama*/ ... /*END:sidai*/`).
- **Prompt:** dalam `tools/hf/diorama_sidai.py` (`FOLK`, `POSES`, `STYLE`, `prompt()`); benih: Mak 5101, Ayah 5201 (+13 setiap pose;
  sidai, dongak +7; lari Mak +21, lari Ayah +33).
- **Adegan** (ampaian, kain, bakul, besen, langit, hujan) dilukis dalam kod mengikut "Rooftop Laundry" Pixel Plays (MIT,
  Copyright (c) 2026 Amir Mushich); muzik permainan itu tidak digunakan.

`tradisi.webp`: budak kampung yang dilukis tangan untuk tiga diorama permainan tradisional (bahagian §123 **Congkak**, §124 **Batu
Seremban**, §125 **Galah Panjang**; pemilik 16 Nov: "congkak, batu seremban, galah panjang"). Budak yang sama dengan `anak.webp`,
kini duduk bersila di atas tikar: Amin dan Xiao Hui (congkak: bersila, tabur, gembira), Deepa (batu seremban: bersila, lambung,
kutip), dan seorang budak baharu, Siti (tudung putih, baju kurung hijau muda; penjaga galah panjang: sedia, sorak). Galah panjang
juga menggunakan semula pose sedia dan sorak Amin, Xiao Hui dan Deepa dari `anak.webp`. 11 gambar, satu helaian WebP.

- **Model:** FLUX.2-klein-4B (Black Forest Labs), lesen **Apache-2.0**;
- **Cara:** Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` melalui `gradio_client` (`/infer`, mod "Distilled (4 steps)",
  guidance 1.0, benih tetap), 16 Nov 2026, dengan `/tmp/rk-paint-lock` hanya semasa setiap panggilan. Laluan berbayar tidak digunakan;
- **Panduan:** setiap pose dilukis dahulu sebagai patung kapsul berwarna dalam kamera diorama (kaki bersilang bila duduk, kain
  labuh sebagai kon), dari skrip `tools/hf/diorama_tradisi.py`; setiap pose dilukis dari panduan + gambar berdiri budak itu sendiri
  dalam `anak.webp` (muka dan baju kekal); pose pertama Siti dari panduan + budak perempuan bertudung lukisan permainan
  (`img/orang-hf/adikhj-casual.webp`, gaya sahaja);
- **Dilukis semula** selepas diperiksa: lambung Deepa dan kedua-dua pose Siti (kain terlukis seperti seluar), bersila Xiao Hui
  (bayang lantai masuk ke potongan);
- **Potongan:** BiRefNet (ONNX, tempatan, dengan `/tmp/rk-cut-lock`) membuang latar; dipangkas, diskala pada skala `anak.webp`
  (budak berdiri 200 px) dan dipek oleh `diorama_tradisi.py pack`, yang menulis jadual bingkai ke `tools/rk-hf-layer.js`
  (`/*TRADISI:diorama*/ ... /*END:tradisi*/`).
- **Prompt:** dalam `tools/hf/diorama_tradisi.py` (`KIDS`, `POSES`, `STYLE`, `prompt()`); benih: Amin 6101, Xiao Hui 6211, Deepa 6321,
  Siti 6431 (+13 setiap pose; lambung Deepa, sedia dan sorak Siti +7, bersila Xiao Hui +11).
- **Adegan** (serambi, tikar mengkuang, papan congkak dan buah, halaman, buah seremban, gelanggang galah panjang) dilukis dalam kod
  pada enjin §115 dalam gaya Pixel Plays (MIT, Copyright (c) 2026 Amir Mushich); tiada fail bunyi atau muzik Pixel Plays digunakan.

`kebun.webp`, `masak.webp`, `kerja.webp`, `bisnes.webp`: Mak dan Ayah yang sama (tudung krim, baju kurung kuning; t-shirt biru gelap,
kain pelekat hijau berpetak) untuk empat diorama harian (pemilik 16 Nov: kebun rumah, masak, kerja, bisnes; bahagian §119–§122).
Pose: **kebun** siram (gembor), petik (bongkok petik cili, bakul kecil), halau (penyapu lidi, "hus!"), bakul (bakul rotan penuh sayur);
**masak** kacau (sudip), masuk (tuang mangkuk bahan), hidang (pinggan nasi goreng); **kerja** (apron putih di kilang sos cili kampung)
berdiri, angkat (karton), periksa (angkat botol sos cili), sorak (ibu jari); **bisnes** berdiri, bungkus (lipat nasi lemak), serah
(hulur beg plastik), terima (ambil not ringgit). Pose sidai.webp (dongak) diguna semula oleh diorama kebun.

- **Model, cara, panduan, potongan:** sama seperti `sidai.webp` di atas, dari skrip `tools/hf/diorama_harian.py` (satu skrip untuk
  empat set; `/*KEBUN:diorama*/`, `/*MASAK:diorama*/`, `/*KERJA:diorama*/`, `/*BISNES:diorama*/` dalam `tools/rk-hf-layer.js`).
  Pose pertama setiap set (siram, kacau, berdiri, berdiri) dipek 230 px tinggi.
- **Prompt:** dalam `tools/hf/diorama_harian.py` (`FOLK`, `SETS`, `STYLE`, `prompt()`); benih asas Mak 6101, Ayah 6201, + set (kebun 0,
  masak 40, kerja 80, bisnes 120) + 13 setiap pose. Dilukis semula selepas semakan mata (`--seed-add`): kebun siram dan halau +500,
  ayah-petik +900; masak mak-kacau +1300, ayah-kacau +500; kerja angkat +900; bisnes ayah-berdiri +900 (lopak air, seluar bukan kain,
  kepala terpotong, kaunter atau kuali bocor ke dalam potongan).
- **Adegan** (batas, tanaman, burung, biawak, dapur kayu, kuali, mangkuk, tali sawat, botol, gerai, payung) dilukis dalam kod pada
  enjin §115 (gaya Pixel Plays, MIT, Copyright (c) 2026 Amir Mushich); tiada muzik daripada repo itu. Pelanggan gerai ialah kanak-kanak
  `anak.webp` di atas dan pasangan Sim dari `bisnes.webp`.
