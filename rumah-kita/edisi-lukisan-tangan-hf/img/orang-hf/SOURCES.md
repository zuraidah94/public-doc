# img/orang-hf — sumber lukisan

Lukisan watak dalam folder ini dijana dengan Hugging Face: **FLUX.2-klein-4B** (Black Forest Labs, lesen **Apache-2.0**),
melalui Space ZeroGPU percuma `black-forest-labs/FLUX.2-klein-4B` (`tools/hf/paint.py`). Topeng warna dibuat secara
tempatan (`tools/hf/marks.py`: MediaPipe Face Landmarker, Apache-2.0; BiRefNet, MIT; SegFormer B2 clothes dan SAM ViT-B
hanya semasa membina, tiada yang dihantar dalam permainan).

## Renda dan sulaman tudung (`<watak>-trim.webp`, C3, 3 Nov 2026)

- **Lukisan:** tiga lukisan HF di `tools/hf/work/renda-tex/` (3 panggilan Space, gaya diambil daripada lukisan hero Nurul):
  `lace.png` (jalur renda putih berkelok besar), `vine.png` (sulaman bunga merah jambu kecil pada sulur hijau),
  `sprig.png` (contoh 18 tangkai bunga sulaman). Prompt dan benih ada dalam `tools/hf/renda.py` (`PAINT`).
- **Cara:** `tools/hf/renda.py` memotong lukisan itu daripada latar coklat gelap (kunci warna latar sahaja, renda putih
  kekal), lalu meletakkannya di sepanjang bingkai muka dan hujung tudung setiap bingkai lembaran tudung, di atas piksel
  tudung sahaja (tudung = topeng rambut lembaran + garis SAM; tidak pernah di atas kulit). Satu imej per lembaran: renda
  di kiri, sulaman di kanan, susun atur sama dengan atlas watak.
- **Warna:** piksel kelabu ikut warna renda/sulaman pilihan pemain (`ap.hjTrim`); daun hijau dan putik kuning kekal.
- **4 Nov 2026 (semua 14 lembaran tudung dibakar semula, tanpa panggilan Space baharu):** jalur nipis dan tompok topeng
  yang bukan tudung dibuang (lengan Adik, belakang baju Nenek); tiada renda di sepanjang potongan lurus topeng; lembaran
  yang kebanyakan hujungnya terpotong lurus (Kavitha, Adik perempuan, Nadia baju kerja) hanya dapat hiasan di bingkai
  muka; renda lebih cerah. `adikf-tudung-casual`, `nadia-tudung-work` dan `nadia-tudung-trad` dibakar tanpa SAM
  (topeng rambut sahaja).
- **4 Nov 2026, pemilik ("nipiskan renda Nadia"):** renda di sepanjang labuh tudung Nadia (`nadia-tudung-casual`,
  `nadia-tudung-trad`) kini 55% lebar renda bingkai muka dan 85% kelegapan (`HEM_LACE` dalam `tools/hf/renda.py`);
  renda bingkai muka dan sulaman tidak berubah. `nadia-tudung-work` tiada renda labuh, jadi sama. Semakan:
  `laporan/img/2026-11-04-tudung-renda-nadia.webp`.
- **4 Nov 2026, satu fail (had 511 fail halaman):** keempat belas `<watak>-trim.webp` kini dipek dalam satu lembaran,
  `tudung-trim.webp` (`tools/hf/trimpek.py`): bagi setiap bingkai dan gaya, hanya kepingan yang ada renda atau sulaman,
  piksel disalin tanpa diubah (tanpa rugi). Jadual kepingan ada dalam `index.json` (`trim.r`). Selepas `renda.py`
  membakar semula satu lembaran, jalankan `python3 tools/hf/trimpek.py` untuk mengepeknya semula.

## Duduk di lantai & berkelah (9 Nov 2026, rk-berkelah-duduk)

- **`lantai.webp`, `lantai-mask.webp`, `lantai.json`:** satu bingkai duduk di lantai (bersimpuh, bersila, satu lutut naik,
  kanak-kanak bersila) bagi 32 helaian `*-casual`, dilukis oleh `tools/hf/lantai.py` dengan FLUX.2-klein-4B (Apache-2.0)
  di Space ZeroGPU percuma: imej 1 = bingkai duduk helaian itu sendiri (arah 1), imej 2 = hero helaian itu; pose ditulis
  dengan perkataan sahaja (tiada foto orang sebenar). Dipotong BiRefNet (MIT), saiz ikut kepala/muka bingkai duduk helaian;
  topeng R kulit, G rambut/tudung, B baju (255 atas / 128 bawah) dengan peraturan warna `marks.py` + pengurai SegFormer
  (hanya semasa membina). Permainan mencerminkan bingkai untuk sisi lain.
- **`kelah.webp`** (satu fail, kotak dalam `lantai.json` "props"): tikar mengkuang dan hidangan berkelah (bakul rotan,
  mangkuk tingkat, nasi lemak, kuih, pisang, rambutan, termos), imej 1 = gaya lukisan sahaja; dan (pemilik 9 Nov, "Lukis
  pemandangan berkelah") dua pemandangan berkelah 520×360: padang kampung (pokok kelapa, rumah kampung, bukit) dan kolam
  pancing (jeti kayu), imej 1 = `img/wau/latar.webp` untuk gaya sahaja. `lantai.py props`, FLUX.2-klein-4B di Space
  ZeroGPU percuma; tiada orang dalam lukisan.

## Muka tajam untuk Ubah rupa (`muka.json`, `muka/<helaian>.webp`, 22 Nov 2026, hf123)

- **Apa:** muka dekat (🙂 Wajah / 👁️ Mata / 👄 Bibir) dan kepala-bahu (💇 Rambut & tudung) bagi 20 helaian `*-casual`,
  dilukis semula 1024 px oleh `tools/hf/mukahd.py` dengan FLUX.2-klein-4B (Apache-2.0) di Space ZeroGPU percuma: imej 1 =
  kepala helaian itu sendiri (bingkai 0, berdiri, menghadap) dibesarkan; tiada foto orang sebenar. 80 panggilan Space
  (2 benih × 2 jenis × 20 helaian; benih terpilih dalam laporan hf123).
- **Cara:** diselaraskan dengan titik muka (MediaPipe Face Landmarker, Apache-2.0) ke lukisan asal, warna setiap kelas
  (kulit, rambut/tudung, baju) dikembalikan ke warna lukisan badan; potongan latar ikut warna; topeng R kulit, G rambut/tudung,
  B baju (255 atas / 128 bawah) daripada topeng helaian dibesarkan + warna lukisan baharu + `tools/hf/muka.py` (isi muka);
  mata dan gigi dikecualikan. Satu fail setiap helaian: baris atas muka dekat, baris bawah kepala-bahu (gambar | topeng).
- **hf124 (kumpulan kedua, 22 Nov 2026):** 12 helaian lagi dengan cara yang sama — gaya rambut Nadia `nadia-casual-long`,
  `-ponytail`, `-bob`, `-highbun`, `-braid`, `-pixie`, `-twintail`, `-curtain`, `-princess`, dan pakaian Nadia `nadia-work`,
  `nadia-trad`, `nadia-raya`. 60 panggilan Space (2 benih × 2 jenis; `nadia-casual-curly`, `makcik-casual`, `nenek-casual`
  dilukis tetapi tidak dimasukkan: had saiz artifak). Dikod webp q42, kualiti alfa 40 (`mukahd.py --q 42 --aq 40`, lalai).
