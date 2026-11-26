# Gosip Melur di Spa Ratu Cantik

Nota untuk Claude bagi Rumah Kita Edisi Lukisan Tangan HF. Empat dialog di bawah sedia untuk dimasukkan ke dalam permainan.

Draf PR #11 sudah ada menu **Gosip dengan Melur · Percuma**, pilihan **Cerita panas**, **Cerita baik** dan **Cerita buruk**, serta pintasan ke katalog **Drama Kampung** dan **Drama Sendiri**. Mulakan daripada cabang `codex/spa-ratu-cantik-gosip`. Dalam `rumah-kita/edisi-lukisan-tangan-hf/game.js`, cari `const gossip` dan `gossipMenu` dalam bahagian Spa Ratu Cantik. [Draf PR #11](https://github.com/zuraidah94/public-doc/pull/11)

## Dialog

### Drama Kampung → Cerita panas

Berkait dengan *Emas Pusaka Tok Penghulu Hilang*.

> Eh, pasal emas Tok Penghulu tu… semalam dekat warung, semua orang kata tak tahu apa-apa. Tapi bila Mak Jah tanya siapa pegang kunci, sudu pun tiba-tiba tak berbunyi. Saya sambung makan je. Telinga saya yang sambung kerja.

### Drama Kampung → Gosip santai

Berkait dengan *Piala Wau Bulan Kampung*.

> Atuk Deraman ajar budak-budak buat wau. Seronok tengok. Yang paling beria tu Pak Ali. Katanya datang nak hantar gam je, sekali dia yang paling lama pilih warna ekor.

### Drama Sendiri → Cerita panas

Berkait dengan *Tari Bertopeng di Istana*.

> Dekat tari bertopeng tu, tetamu topeng perak ajak awak menari. Kawan saya kata dia nampak orang yang sama tunggu dekat taman bulan lepas lagu habis. Tunggu siapa? Haa, yang tu dia suruh saya jangan tanya.

### Selebriti → Gosip santai

> Dua pelakon Studio Harmoni datang pakai jaket sama. Peminat dah sibuk teka mereka bercinta. Saya cuma nak tahu kedai mana jual jaket tu. Cantiklah.

## Cadangan pemasangan

- Gantikan dialog `hot` bagi `dramakg` dan `drama` dengan dua **Cerita panas** di atas. Label yang pemain nampak ialah **Cerita panas**.
- Tambah pilihan **Gosip santai** untuk `dramakg` dan `selebriti`. Paparkan pilihan itu apabila topik yang dipilih mempunyai dialog santai.
- Gunakan paparan dialog sedia ada. Menu sudah menambah nama Melur dan tanda petik, jadi masukkan isi dialog sahaja.
- Kekalkan pintasan katalog drama untuk kedua-dua topik drama. Dialog santai selebriti tidak memerlukan pintasan.

## Semakan dalam permainan

1. Buka **Peta Dunia → Bandar Harmoni → Salun Ratu Cantik → Rawatan Spa Ratu Cantik → Gosip dengan Melur**.
2. Cuba keempat-empat dialog pada skrin telefon. Pastikan teks panjang boleh dibaca dan bertukar apabila pemain memilih topik lain.
3. Cuba dengan baki RM0. Pastikan gosip masih percuma dan kedua-dua pintasan membuka katalog yang betul.

## Ciri tambahan dalam draf PR

1. **Gosip ikut episod.** Melur beri pembayang sebelum pemain mengikuti cerita. Untuk Drama Kampung, dia semak episod, pilihan terakhir dan tindakan seperti belajar buat wau dengan Atuk Deraman. Untuk Drama Sendiri, dia semak rekod tamat cerita bagi Sim yang sedang mengunjungi spa.
2. **Buka cerita yang disebut.** Butang menunjukkan tajuk drama dan terus memfokuskan kad cerita itu dalam katalog. Pemain masih tentukan bila hendak memulakan cerita.
3. **Reaksi pemain.** Selepas membaca gosip, pemain boleh pilih **Eh, serius?**, **Kesian dia** atau **Kita simpan sini je**. Melur memberi balasan ringkas dan reaksi dikosongkan apabila topik atau cerita bertukar.

Ketiga-tiga ciri sudah ada dalam kod draf PR. Empat dialog cadangan di bahagian atas masih disimpan untuk dimasukkan oleh Claude. Semasa memasukkannya, pautkan dialog santai tentang wau kepada kad *Piala Wau Bulan Kampung* dan semak bahawa pembayang, dialog susulan serta reaksi masih muncul pada keadaan yang betul.

## Cerita panas bertema skandal dalam draf PR

Menu **Cerita panas** kini ada lima dialog baharu.

- **Bandar Harmoni** — berita peniaga kahwin lagi terbongkar dalam grup keluarga.
- **Kampung Harmoni** — pasangan kahwin lari pulang membawa sijil nikah.
- **Golongan diraja** — pertunangan rahsia bercanggah dengan rancangan keluarga.
- **Selebriti** — pelakon ada anak sebelum bernikah dan orang mula meneka siapa bapanya. Melur mengulas gosip orang dewasa sambil menjaga maruah anak itu.
- **Drama Kampung** — gosip bunga ros Rizal membawa pemain terus ke kad *Rizal: Buaya Darat*. Dialog emas Tok Penghulu dalam bahagian serahan di atas boleh digunakan sebagai cerita tambahan dengan pintasan ke kadnya sendiri.

Jika Claude menambah giliran cerita, simpan tajuk atau ID drama bersama setiap dialog supaya pintasan dan gosip susulan menggunakan cerita yang sedang dipaparkan.
