# Rumah Kita — Dokumen Reka Bentuk Permainan & Prompt Versi 2D Chibi

Oct 16, 2026 · @Zuraidah Zainudin

## 1. Ringkasan permainan

Rumah Kita ialah sim kehidupan Malaysia berbentuk isometrik dalam satu fail HTML/JS, kini pada versi v338. Pemain mengurus beberapa isi rumah merentas tiga taman perumahan, istana, kampung dan tempat awam, sementara dunia NPC terus hidup sendiri.

| Perkara | Nilai semasa |
| --- | --- |
| Platform | Satu halaman HTML + `game.js`, kanvas isometrik, berjalan dalam pelayar |
| Bahasa dalam permainan | Bahasa Melayu (dialog, UI, Warta, jurnal) |
| Populasi | Had POPCAP 100 / 150 / 200 boleh dipilih; stabil sekitar 143–151 pada 150 |
| Kawasan | Taman Harmoni Jaya, Taman Seri Harmoni, Taman ke-3 (dirancang pemain), Istana, kampung, bandar, kubur, stesen minyak |
| Masa | Jam permainan berdetik; hari, minggu, bulan, tahun dengan peristiwa berjadual |
| Kestabilan | Lawatan 500 hari: 0 ralat; soak12 lulus untuk semua versi terkini |
| Liputan aktiviti | 143 daripada 265 aktiviti (ERR) dicapai secara automatik; 29 bergantung pada keadaan (kereta, bisnes, banjir dan lain-lain) |

Teras permainan: kehidupan harian (kerja, sekolah, makan, tidur, kereta), hubungan dan perkahwinan, keluarga diraja dengan politik istana, kerajaan tempatan (YB, PM, pilihan raya, bajet), dunia ghaib (bunian, hantu kubur) dan tokoh lagenda Melayu yang mempunyai kesaktian.

## 2. Peraturan reka bentuk tetap

Peraturan ini terpakai pada setiap versi dan mesti dibawa ke versi 2D.

| Peraturan | Maksud dalam permainan |
| --- | --- |
| Tiada percintaan sejenis | Perkahwinan, dating dan jodoh NPC hanya lelaki–perempuan |
| Tiada percintaan remaja/kanak-kanak | Semua ciri romantik hanya untuk dewasa |
| Nama asli sahaja | Semua watak, jenama dan syarikat rekaan sendiri (contoh: Harmoni Petroleum); tempat sebenar dibenarkan |
| Jangan tiru The Sims | Tiada plumbob, Simlish, mekanik atau UI salinan; identiti Malaysia sendiri |
| Label tidak bersesak | Nama/label tidak bertindih; SIGNHIDE tidak dipasang semula |
| Unit metrik | Liter, km, kg, °C; mata wang RM |
| Uji sebelum terbit | Ujian sasaran + soak (tiada ralat) sebelum setiap terbitan |
| Lagenda bukan kerabat | Puteri Hang Li Po, Puteri Gunung Ledang, Puteri Santubong dan lain-lain bukan keluarga diraja; tinggal di Teratak sendiri, boleh berkahwin dengan kerabat sebagai menantu |
| Gelaran lagenda kekal | Lagenda yang berkahwin dengan Raja kekal nama penuh, didahului “Che Puan” atau “Tuanku Permaisuri” |
| Satu Permaisuri | Setiap Raja berkahwin ada tepat seorang Tuanku Permaisuri; isteri lain Che Puan |
| Tiada anak yatim terbiar | Bayi/kanak-kanak sentiasa bersama ibu bapa hidup atau saudara |

## 3. Senarai ciri mengikut sistem

Sebelas sistem utama; setiap baris ialah ciri yang sudah ada dalam v338.

| Sistem | Ciri |
| --- | --- |
| Kehidupan harian | Keperluan sim, jadual kerja/sekolah, aktiviti harian (265 jenis), panel “Aktiviti hari ini”, pembaikan pintu tersekat (reachFix + teleport ke pintu) |
| Isi rumah & taman | Taman Harmoni Jaya, Taman Seri Harmoni, Taman ke-3 dengan pelan nama + 6 jenis rumah dan kemudahan ikut jenis; nama rumah ikut penghuni; Pulih Penghuni; Jurnal setiap rumah |
| Populasi | POPCAP 100/150/200, sebab kematian, kematian semula jadi, pindah keluar seisi rumah bila melebihi had, perlindungan ibu bapa terakhir (tiada yatim), yatimSync ke saudara, Banci |
| Hubungan | Jodoh NPC, perkahwinan, kehamilan, kelahiran, cerai; semakan sedarah; Warta (pergi, kahwin, lahir, hamil, cerai, kerja, diraja, kampung) |
| Kenderaan | Kereta: minyak, servis, cuci automatik pada 8/13/18; motor (kapcai 4.2 L, vespa 8 L); lesen B2 berperingkat KPP01 → JPJ → CDL; saman RM300 tanpa lesen |
| Stesen minyak | Harmoni Petroleum: 3 pulau pam, papan harga (RON95 BUDI95 1.99, RON95 2.65, RON97 3.25, diesel 3.07, EV 1.30) berubah setiap Rabu; Harmoni Mart 24 jam (12 barang), ATM, tandas/surau, LPG, cuci kereta, pam angin; atendan NPC; 10 insiden (fon terbakar, statik, salah diesel, lari tak bayar, rompak dan lain-lain); kerja di stesen |
| Diraja | Raja + Permaisuri sebumbung di istana, Che Puan bergilir, aktiviti Permaisuri, istiadat Permaisuri, Tengku Puan Mahkota/Tengku Puan; personaliti Raja (adil, naif, zalim, kasanova…), makzul, waris berlawanan, rampasan kuasa, pembesar, salasilah, album istana |
| Kerajaan | YB dengan aduan mingguan (skor YB), kelulusan pembangunan (Lulus / Lulus bersyarat RM800 / Tangguh), Perdana Menteri + pesaing, pilihan raya tahunan, bajet tahunan |
| Ghaib & kubur | Bunian dengan kuasa dan umur panjang; kubur realistik (kepuk marmar/granit/simen, nisan lelaki/perempuan, kemboja, sudut bukan Islam); hantu malam (pocong, pontianak, penanggal, toyol, bola api, hantu raya); tahlil, gotong-royong kubur, paranormal |
| Lagenda | 22 tokoh lagenda dengan kisah; Teratak sendiri; menantu diraja; kad emas (lagenda) dan perak (keturunan ✨); kesaktian ikut tahap (lagenda 3, anak 2, cucu 1), tenaga sakti, Restu; risiko salah guna (sumpahan tamak, kantoi, selendang hilang, letih rohani); MUSIBAH (banjir, wabak, kemarau, ribut) dengan kuasa gabungan; Ujian Kebangkitan; ruangan Warta Lagenda bulanan |
| Telefon, TV & ekonomi | Aplikasi drama di telefon, wajah TV, Butik Harmoni, perks, simpanan awan/muat turun, perlindungan simpanan, worldPreset, kod cheat, panduan dalam permainan |

## 4. Kronologi keperluan

Keperluan yang ditetapkan, terkini di atas. Versi sebelum v310 diringkaskan sebagai satu baris.

| Versi | Keperluan |
| --- | --- |
| v338 | Risiko salah guna kesaktian, MUSIBAH dengan kuasa gabungan, Ujian Kebangkitan |
| v337 | Lagenda ada kuasa magis seperti bunian; ruangan Warta Lagenda |
| v336 | Kad perak keturunan lagenda, popup kisah lagenda, bahagian lagenda dalam album istana |
| v335 | Kad emas untuk lagenda dalam salasilah |
| v332–v334 | Lagenda bukan kerabat dan tidak tinggal di istana; boleh jadi menantu diraja; Raja boleh kahwin lagenda, nama kekal dengan Che Puan / Permaisuri di depan |
| v331 | Betulkan bayi tanpa ibu bapa; pindah keluar seisi rumah |
| v330 | Istiadat Permaisuri, Tengku Puan Mahkota, lesen motor B2 |
| v329 | Setiap Raja berkahwin ada satu Permaisuri, lain-lain Che Puan |
| v328 | Motosikal: isi minyak, insiden, lorong pam |
| v327 | Stesen minyak realistik dengan atendan, kedai dan insiden (dikaji dahulu) |
| v326 | Penjagaan kereta automatik; Taman ke-3 |
| v325 | Jurnal rumah, kelulusan pembangunan oleh YB, pembaikan pintu, panel aktiviti |
| v324 | Betulkan permainan beku dan lonjakan populasi |
| v323 | Kubur realistik, hantu, aduan YB, butang POPCAP |
| v310–v322 | Aplikasi drama telefon dan wajah TV; kuasa bunian, Butik Harmoni, perks; Pulih Penghuni, perlindungan simpanan, worldPreset, simpanan awan; Banci dan jodoh NPC; Taman Harmoni Jaya; Raja dan Permaisuri satu istana, giliran Che Puan; personaliti Raja, makzul, waris berlawanan; rampasan kuasa, pembesar, salasilah; Taman Seri Harmoni, PM dan pesaing; POPCAP 150, sebab kematian, bajet dan pilihan raya tahunan, umur panjang bunian |
| Arahan berterusan | Jalankan permainan 500 hari ke semua tempat dan aktiviti, betulkan ralat, cadangkan penambahbaikan |

## 5. Spesifikasi teknikal

Kod v338 dibina sebagai tampalan berlapis atas satu sumber induk, disambung melalui daftar cangkuk.

| Komponen | Butiran |
| --- | --- |
| Sumber | `rk-src.html` induk; setiap versi = satu fail tampalan `pNNN.js` disisip sebelum penanda `v93: nama` |
| Binaan | `build.py` menghasilkan `game.js`; semak sintaks dengan `node --check` |
| Corak bungkus | `{const f=fn;fn=function(){...}}` untuk fungsi deklarasi; fungsi `const` diubah terus dalam sumber |
| Cangkuk | `HOURX` (setiap jam), `RETX` (balik rumah), `SELFX` (menu diri sim) |
| Jadual data | `ERR` (aktiviti), `PLACES`, `OUTV`/`OUTX` (adegan luar), `CHEATS`, `GUIDE` |
| UI | `openChoice`, `openSheet2`, `wartaAdd`, `toast`, `diary` |
| Keadaan | Objek `S` tunggal (contoh `S.fuelP`, `S.jur`, `S.legRoyal`, `S.t3plan`) disimpan ke storan + awan |
| Ujian | `soak12.py` (ERRS kosong), lawatan panjang `tour3.py` / `tour5.py` tanpa Debugger CDP (elak kehabisan memori) |
| Terbitan | Artifact `game.js` sebagai fail sokongan halaman |

## 6. Prompt replikasi 2D chibi

Salin keseluruhan blok di bawah ke model AI atau beri kepada pasukan seni dan kod. Prompt ditulis dalam bahasa Inggeris supaya tepat untuk alat penjana kod. Teks dalam permainan pula kekal Bahasa Melayu.

```text
ROLE: You are a senior game developer and 2D artist. Build "Rumah Kita 2D", a faithful 2D remake of the Malaysian life-sim "Rumah Kita" (currently isometric, v338). Keep every system and rule below exactly; only the presentation changes to 2D chibi.

=== PLATFORM ===
- Single HTML page + one JS file (game.js), HTML5 Canvas 2D, runs offline in a browser, desktop + phone (touch) at 360 px width and up.
- All in-game text in Bahasa Melayu. Currency RM. Metric units only (litre, km, kg, °C).
- One global state object S, saved to localStorage plus downloadable/cloud save file; save protection and "Pulih Penghuni" (restore residents) tool.
- Code organised as modules with hook registries: HOURX (every game hour), RETX (on arriving home), SELFX (sim self-menu items), data tables ERR (activities), PLACES, OUTX (outdoor scenes), CHEATS, GUIDE.

=== ART DIRECTION: 2D CHIBI ===
- Camera: 2D side-view rooms (cutaway house, one floor per screen) and 3/4 top-down for town maps. No isometric projection.
- Characters: chibi proportion 1:2.5 (head ≈ 40% of height), big round eyes with 2 highlights, small mouth, rosy cheeks, thick 2–3 px dark-brown outline (not black), cel shading with 1 shadow tone.
- Malaysian diversity: Malay, Chinese, Indian, Bumiputera Sabah/Sarawak skin tones and features; outfits baju kurung, baju Melayu + samping, songkok, tudung (several styles), cheongsam, saree/kurta, school uniform (white/blue), office wear, petrol attendant uniform, royal regalia (tengkolok, gold songket).
- Life stages drawn distinctly: bayi, kanak-kanak, remaja, dewasa, warga emas (grey hair, cane optional).
- Palette: warm pastel daytime, desaturated blue night with lamp glow. Rounded shapes everywhere, soft drop shadows, no photorealism.
- Buildings: terrace house, semi-D, bungalow, kampung wooden house on stilts, flats, istana with golden domes, Harmoni Petroleum station, surau, kedai runcit, cemetery. All original designs, no real brand logos.
- Ghosts (pocong, pontianak, penanggal, toyol, bola api, hantu raya) in chibi style: spooky but cute, readable silhouettes, only at night.
- Legends wear signature looks (e.g. Puteri Hang Li Po in Ming-style robe, Puteri Gunung Ledang with mountain mist aura); gold sparkle for legend, silver sparkle for descendants.
- UI: rounded cards, emoji-style icons, labels never overlap (auto-offset or hide by priority, but do not add a SIGNHIDE toggle).
- Do NOT copy The Sims: no plumbob, no gibberish language, no Sims-like UI or needs bars styling. Create an original Malaysian identity.

=== CONTENT RULES (MANDATORY) ===
1. No same-sex romance, dating or marriage.
2. No romance involving teens or children; romance only between adults.
3. All characters, companies and brands are original names. Real places (Melaka, Kuching, Gunung Ledang) are allowed.
4. Every married King has exactly ONE Tuanku Permaisuri; other wives are Che Puan.
5. Legend figures are NOT royal family, never live in the istana, never appear in the royal salasilah as blood royals.
6. A child or baby must never be left without a living guardian: protect the last co-resident parent from population culling; otherwise move the child to kin.

=== WORLD ===
- Areas: Taman Harmoni Jaya, Taman Seri Harmoni, a 3rd estate the player plans (name input, 6 house types, amenities by type, requires development approval), Istana, kampung, town, school, office, surau, cemetery, petrol station.
- Game clock with hours/days/weeks/months/years; scheduled events (weekly Wednesday fuel price change, Thursday 15:00 royal–legend matchmaking, annual budget and election).
- Population cap selectable 100/150/200 (button cycles). Over cap: whole NPC households migrate out; natural deaths with stated reasons.
- Banci (census) screen.

=== HOUSEHOLDS & DAILY LIFE ===
- Player switches between households; each home has a Jurnal (news filtered to that home's residents, matching longest names first, including the dead).
- House names stay in sync with residents when renamed.
- Sims: needs, jobs, school, meals, sleep, ~265 activities (ERR) across places; "Aktiviti hari ini" panel.
- Pathing safety: if a sim cannot reach a door because of furniture, auto-fix path, else teleport to the door.

=== RELATIONSHIPS & NEWS ===
- NPC matchmaking, dating, marriage, pregnancy, birth, divorce; block marriages between blood relatives.
- Warta news feed with categories: pergi, kahwin, lahir, hamil, cerai, kerja, diraja, kampung, plus a monthly Warta Lagenda column every 4th week.
- Phone with apps (drama app, Butik Harmoni shop, perks), TV with character faces.

=== VEHICLES ===
- Cars: fuel %, trip count, dirt. Auto-care at 08:00/13:00/18:00: refuel if fuel <25%, service if trips ≥20, wash if dirty. Background households refuel at 20:00.
- Motorcycles: kapcai 4.2 L tank, vespa 8 L; refuel in ringgit amounts; auto-refuel <20%; random incidents.
- B2 licence ladder: 0 none → 1 KPP01 class (RM150) → 2 JPJ test (RM350) → 3 CDL after 2 years. Riding without licence risks RM300 saman.

=== PETROL STATION "HARMONI PETROLEUM" ===
- Canopy, 3 pump islands + motorcycle lane, price pylon from S.fuelP: RON95 BUDI95 RM1.99, RON95 RM2.65, RON97 RM3.25, diesel RM3.07, EV RM1.30/kWh; prices change every Wednesday.
- Harmoni Mart 24 jam (12 items), ATM, tandas/surau, LPG cage, car wash, air pump, tanker lorry, NPC cars.
- Attendants Abang Faizal, Kak Rina, Bang Mus may help refuel; tip option. Cost = litres × price.
- 10 incidents: phone use fire, static spark, nozzle fault, wrong diesel, drive-off without paying, motorcycle issue, tank overflow, push-start, robbery, flat tyre.
- Job: work at the station.

=== ROYALTY ===
- Raja and Permaisuri live together in one istana; Che Puan rotation; Permaisuri activities and coronation ceremony (istiadat).
- Heir wives titled Tengku Puan Mahkota / Tengku Puan.
- King personalities: adil, naif, zalim, kasanova and more; makzul (deposition), opposite-trait heirs, coup, pembesar (nobles), salasilah tree view, istana photo album.
- Royal events temporarily hold residents at the istana; they return home at 18:00.

=== GOVERNMENT ===
- YB (state rep) receives weekly ADUAN complaints; resolving them raises S.ybScore, which affects the annual election.
- Development approval: building or a new estate needs approval when population ≥ cap−12 or the player funds it. If the YB is in the player's family, the player chooses Lulus / Lulus bersyarat (RM800) / Tangguh; an NPC YB approves 70%.
- Perdana Menteri and a rival, annual budget, annual election.

=== SUPERNATURAL ===
- Bunian: hidden people with powers and long lifespan.
- Cemetery: kepuk types marmar/granit/hijau/simen, rounded nisan for men, flat for women, fresh graves of red earth, non-Muslim corner, kemboja trees, beringin, wakaf, water tong, lamps, signboard.
- Activities: lepak kubur, paranormal hunt, gotong-royong kubur, tahlil arwah after a death.

=== LEGENDS (22 figures) ===
- Each has a story card (popup). They live in their own "Teratak <name>".
- May marry royals as menantu (own Kediaman, not the istana). If a King marries a legend, her full legend name is kept with prefix "Che Puan" or "Tuanku Permaisuri"; Mahkota → "Tengku Puan Mahkota <name>"; Raja Muda → "Tengku Puan <name>".
- Family tree: gold card for legends, silver card with ✨ for descendants; "Lagenda dalam Istana" section in the istana album. Traits inherit.
- Kesaktian: tier legend 3, child 2, grandchild 1; sakti energy; unique power per legend + Restu; self-menu "✨ Kesaktian".
- Misuse risks: >2 uses a week → Sumpahan Tamak (money loss + 3-day lock), exposure, lost selendang, letih rohani.
- MUSIBAH events (banjir, wabak, kemarau, ribut) solvable with combined powers.
- Ujian Kebangkitan: 3 trials that awaken a descendant to tier 3. NPC legend power use reported in Warta.

=== QA ===
- Automated soak: run 500 game days visiting every place, every activity, every household; zero console errors, no frozen clock, stable population, zero orphans, exactly one Permaisuri per married King.
- Deliver: index.html + game.js + sprite sheets (PNG, 2x for retina) + a short README in Bahasa Melayu.
```
