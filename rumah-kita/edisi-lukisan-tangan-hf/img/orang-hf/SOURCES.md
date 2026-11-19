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
