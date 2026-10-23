# Spesifikasi Teknikal Rumah Kita 2.0

Oct 19, 2026 · @Zuraidah Zainudin

Rumah Kita 2.0 mengekalkan enjin simulasi v394 (`game.js`) tanpa sebarang perubahan, dan membina semula seluruh lapisan paparan menggunakan PixiJS 8 berasaskan 359 rujukan dalam Papan Gaya Rumah Kita (HD). Format simpanan kekal serasi 100%.

## Seni bina & enjin

&#91;embedded content: seni bina 2.0 · 4 lapisan\]

UI dan pemapar hanya membaca keadaan `S` dan memanggil fungsi tindakan yang sama seperti v394, jadi logik permainan dan simpanan tidak disentuh.

| Pilihan pemapar | Kelebihan | Kekurangan | Keputusan |
| --- | --- | --- | --- |
| PixiJS 8 (WebGL) | Batch sprite atlas, penapis cahaya dan cuaca, 60 fps pada telefon pertengahan | Satu perpustakaan tambahan perlu dimuat | **Dipilih** |
| Canvas 2D "Pelukis Rumah Kita" v0.1 | Sudah wujud, tiada kebergantungan | Lukisan prosedural; perlahan dengan ratusan sprite berlukis | Kekal sebagai prototaip rujukan |
| Phaser 3 | Enjin permainan lengkap | Fizik dan adegan bertindih dengan gelung `game.js` | Tidak dipilih |

## Struktur folder aset

Semua kerja 2.0 tinggal dalam satu folder `Rumah Kita 2.0` di sebelah papan gaya, dengan aset disusun ikut fasa dan jenis supaya pemapar boleh memuat satu kumpulan pada satu masa.

```
Game Rumah Kita/
├─ Papan Gaya Rumah Kita (HD).html     rujukan visual rasmi, disusun ikut fasa
├─ Ref Pic HD/                          359 imej rujukan 3360×1888 JPG
├─ Aset 2.0/                            aset lutsinar yang dipotong dari helaian HD
│  ├─ 01_Objek-dan-Perabot/<helaian>/<helaian>_01.png …
│  ├─ 02_Kostum-dan-CAC/
│  ├─ 03_Watak/
│  ├─ 04_UI/
│  └─ 05_Pose/
└─ Rumah Kita 2.0/                      kod permainan
   ├─ index.html                        cangkerang PWA
   ├─ sim/game.js                       enjin v394, tidak diubah
   ├─ render/                           pemapar PixiJS (diorama, watak, babak, peta)
   ├─ ui/                               kit UI buku cerita (HTML + CSS)
   ├─ aset/
   │  ├─ atlas/                         atlas WebP @2x yang dijana (jangan sunting tangan)
   │  ├─ latar/                         latar babak berlapis (langit, jauh, tengah, dekat)
   │  ├─ potret/                        bahagian CAC berlapis untuk potret 512 px
   │  └─ bunyi/
   └─ alat/                             skrip potong, atlas dan semakan saiz
```

**Peraturan nama fail:** `kategori_nama-item_arah@2x.webp`, huruf kecil, sempang antara perkataan, tanpa ruang. Contoh: `perabot_peti-ais_SE@2x.webp`, `watak_nadia_jalan-03@2x.webp`, `ui_tag-kayu_ditekan@2x.webp`. Arah perabot ialah `SE`, `SW`, `NE` dan `NW` (4 arah, §4A.3).

## Saiz sprite & resolusi

Skrin rujukan ialah telefon potret 390 × 844 pt; semua aset dieksport pada @2x, dan 1 petak logik = 48 pt (96 px). Lukisan induk disimpan lebih besar supaya boleh dieksport semula pada @3x tanpa melukis semula.

| Jenis aset | Saiz paparan (pt) | Eksport @2x (px) | Saiz induk (px) | Format | Sumber rujukan |
| --- | --- | --- | --- | --- | --- |
| Watak dewasa, badan penuh (1 : 6½) | tinggi 160 | tinggi 320 | tinggi 1024 | WebP alfa, atlas | Watak, Pose 1–4 |
| Watak kanak-kanak / bayi | tinggi 110 / 60 | tinggi 220 / 120 | tinggi 1024 | WebP alfa, atlas | 5 peringkat umur |
| Potret bust (12 ekspresi) | 128 × 128 | 256 × 256 | 512 × 512 | WebP alfa, berlapis | CAC 1 & 2, Tahap solek |
| Perabot 1 petak (4 arah) | 48–96 | 96–192 | sisi panjang 1024 | WebP alfa, atlas | Perabot, Item 11 |
| Perabot besar (2–3 petak) | 96–144 | 192–288 | sisi panjang 1024 | WebP alfa, atlas | Perabot Banglo, Set bilik |
| Kerangka diorama bilik | 390 × 300 | 780 × 600 | 2048 × 1576 | WebP | Dalaman tema, Diorama |
| Luaran rumah (3 keadaan) | 390 × 260 | 780 × 520 | 3360 × 1888 | WebP | Luaran rumah, Keadaan |
| Latar babak, setiap lapisan | 844 × 390 (anjak) | 2048 × 1152 | 3360 × 1888 | WebP q80 | 56 babak luar |
| Peta dunia & sub-peta | 390 × 844 (zum) | 2048 × 2048 | 3360 × 1888 | WebP, jubin 512 | Peta, Sub-peta |
| Kad drama | 358 × 201 | 1280 × 720 | 3360 × 1888 | WebP q80 | Kad drama |
| Cut-in detik hidup | skrin penuh | 1280 × 720 | 3360 × 1888 | WebP | Cut-in |
| Ikon aplikasi telefon | 60 × 60 | 120 × 120 | 512 × 512 | WebP alfa, atlas | Ikon Apl Set 1–4 |
| Lencana emosi, gelembung topik | 32 × 32 | 64 × 64 | 256 × 256 | WebP alfa, atlas | Overlay, Ikon emosi |
| Bingkai UI 9-slice (kertas, kayu) | berubah | 256 × 256 | 512 × 512 | WebP alfa | Kit UI, Panel keperluan |

Atlas tidak melebihi 2048 × 2048 px supaya selamat pada GPU telefon lama, dengan jarak 2 px antara sprite untuk elak garis tepi.

## Saluran aset

Setiap aset melalui lima langkah tetap, dan langkah 1–3 sudah siap: 615 aset lutsinar daripada 61 helaian objek, kostum, watak, UI dan pose (lihat Indeks Aset 2.0.html).

1. **Rujukan Canva** (1680 × 944) disimpan dalam folder `Ref Pic`.
2. **HD** dengan FSRCNN ×2 dan penajaman ringan, kemudian dinamakan ikut tajuk kad, lalu disimpan dalam `Ref Pic HD` (3360 × 1888 JPG).
3. **Potong** helaian berlatar kertas menjadi PNG lutsinar, satu fail bagi setiap objek atau watak, dalam `Aset 2.0`. Watak yang bertindih dikekalkan sebagai satu kumpulan dan ditanda untuk dipisah secara manual.
4. **Kemas dan lukis semula**: artis membersihkan tepi, melukis 4 arah perabot dan bingkai animasi watak dengan gaya yang sama, berpandukan imej utama.
5. **Atlas**: skrip `alat/atlas` mengecilkan setiap aset ke saiz @2x dalam jadual di atas, mengumpulnya ke atlas WebP 2048 px dan menulis fail JSON koordinat untuk PixiJS.

Aset potongan dalam langkah 3 ialah **rujukan pengeluaran**, bukan aset akhir: ia sesuai untuk prototaip dan ujian susun atur, tetapi perabot perlu 4 arah dan watak perlu kerangka animasi sebelum dikeluarkan.

## Bajet prestasi & muat turun

Sasaran prestasi sama dengan v394, jadi 2.0 hanya boleh dikeluarkan jika ia lulus ujian penerimaan §12 pada telefon pertengahan.

| Ukuran | Sasaran |
| --- | --- |
| Kadar bingkai, mod 🐇 Lancar | ≥ 30 fps |
| Kadar bingkai, mod 💎 Tajam | ≈ 60 fps |
| Lukis semula ketika kad terbuka | ≈ 3 kali sesaat |
| Paparan pertama (4G) | < 3 s |
| Muat turun pertama | ≤ 16 MB |
| Atlas yang dimuat serentak | ≤ 6 × 2048 px (≈ 96 MB memori GPU) |
| Butang dan kawasan sentuh | ≥ 44 pt |
| Kontras teks | WCAG AA |

Aset Fasa 1 dimuat semasa permulaan; latar babak, potret dan kad drama dimuat secara malas (*lazy*) dan disimpan dalam cache pelayar.

## Fasa pembangunan

&#91;embedded content: pelan fasa 2.0 · 4 fasa, 4 gerbang\]

Tempoh bulan ialah cadangan awal. Papan Gaya Rumah Kita (HD) kini disusun ikut empat fasa yang sama, jadi setiap fasa boleh dibuka terus untuk melihat rujukan yang perlu disiapkan dahulu.

## Soalan terbuka

- [ ] Adakah 2.0 kekal sebagai PWA dalam pelayar, atau dibungkus juga sebagai aplikasi Android/iOS?
- [ ] Siapa yang melukis semula 4 arah perabot dan kerangka animasi: artis luar, atau dijana dan dikemas sendiri?
- [ ] Tiga kad masih tiada fail HD (Putera Raja Mahkota Alam, Surat Tanpa Nama di Pintu, Anak Nak Sambung Belajar Jauh): perlu dimuat turun ke `Ref Pic`.
- [ ] Adakah simpanan v394 perlu dibuka terus dalam 2.0, atau melalui skrin import sekali sahaja?
