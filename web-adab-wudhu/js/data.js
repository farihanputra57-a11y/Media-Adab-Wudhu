window.WUDHU_DATA = {
  uasYoutubeUrl: "https://www.youtube.com/results?search_query=Ustadz+Abdul+Somad+Official+BACA+BUKU+FIQH+WUDHU+TEORI+DAN+PRAKTEK",
  masterVoiceFile: "assets/audio/narasi_lengkap.mp3",

  // Keamanan Rekap Uji Kemampuan
  teacherPin: "2026",
  // Tempelkan URL Web App dari Google Apps Script di bawah ini agar hasil siswa otomatis masuk ke Google Sheets Anda:
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbxU4LdTu0i0abqhiCVbkeqSB_ORqcd13a23AmiIPqtTnhrH7J7LzzCafxKdr-GvCudx/exec",

  // Exact timestamp slices [startSec, endSec] from assets/audio/narasi_lengkap.mp3
  segmentAudioRanges: {
    1: [0.0, 42.2],
    2: [42.2, 71.0],
    3: [71.0, 112.8],
    4: [112.8, 148.8],
    5: [148.8, 191.8],
    6: [191.8, 231.8],
    7: [231.8, 262.0],
    8: [262.0, 299.0]
  },

  substepAudioRanges: {
    "1a": [0.0, 16.8],
    "1b": [16.8, 29.8],
    "1c": [29.8, 42.2],
    "2a": [42.2, 56.0],
    "2b": [56.0, 71.0],
    "3a": [71.0, 91.2],
    "3b": [91.2, 101.0],
    "3c": [101.0, 112.8],
    "4a": [112.8, 127.8],
    "4b": [127.8, 138.0],
    "4c": [138.0, 148.8],
    "5a": [148.8, 166.5],
    "5b": [166.5, 182.0],
    "5c": [182.0, 191.8],
    "6a": [191.8, 207.8],
    "6b": [207.8, 216.6],
    "6c": [216.6, 231.8],
    "7a": [231.8, 249.0],
    "7b": [249.0, 262.0],
    "8a": [262.0, 273.8],
    "8b": [273.8, 299.0]
  },

  // Panduan Khusus Wudhu Perempuan (Mazhab Syafi'i) untuk setiap segmen 1-8
  femaleSegmentGuides: {
    1: {
      title: "Wudhu Perempuan: Niat, Kuku & Perhiasan",
      points: [
        "Pastikan kuku bersih dari kuteks atau cat kuku yang kedap air (penghalang sampainya air ke kuku).",
        "Lepas atau longgarkan cincin, gelang, dan karet rambut di pergelangan tangan agar air merata.",
        "Gunakan tempat wudhu khusus perempuan yang tertutup agar aurat tetap terjaga dengan nyaman."
      ],
      audioTip: "Catatan khusus untuk siswi perempuan: sebelum mulai berwudhu, pastikan tidak ada cat kuku atau kuteks yang menghalangi air, serta lepas gelang atau karet rambut yang ketat di pergelangan tangan."
    },
    2: {
      title: "Wudhu Perempuan: Berkumur & Hidung",
      points: [
        "Tata cara berkumur dan membersihkan hidung sama persis antara laki-laki dan perempuan.",
        "Jika memakai lipstik atau pelembap bibir yang sangat tebal dan tahan air (waterproof), bersihkan dulu agar air wudhu menyentuh kulit bibir."
      ],
      audioTip: "Untuk berkumur dan membersihkan hidung, caranya sama persis. Pastikan tidak ada pelembap atau kosmetik tebal yang tahan air di area bibir sebelum membasuh wajah."
    },
    3: {
      title: "Wudhu Perempuan: Wajah, Ciput & Kosmetik",
      points: [
        "Longgarkan sedikit tepi jilbab atau ciput di dahi dan pipi agar garis tumbuh rambut dahi serta pangkal telinga kanan–kiri ikut terbasuh air.",
        "Bersihkan kosmetik atau tabir surya yang bersifat waterproof (anti air) sebelum wudhu agar air sampai ke pori-pori kulit wajah.",
        "Pastikan bagian bawah dagu di balik tepi jilbab ikut dibasuh merata."
      ],
      audioTip: "Perhatian penting saat membasuh wajah bagi perempuan berhijab: geser atau longgarkan sedikit tepi ciput di dahi dan samping pipi, agar batas wajib mulai dari garis tumbuh rambut dahi, bawah dagu, hingga pangkal kedua telinga benar-benar terkena air."
    },
    4: {
      title: "Wudhu Perempuan: Lengan Baju & Menjaga Aurat",
      points: [
        "Gulung lengan baju muslimah atau gamis hingga di atas tulang siku saat berada di tempat wudhu khusus perempuan yang tertutup.",
        "Lepas jam tangan, gelang, atau ikat rambut di pergelangan agar seluruh kulit hingga melewati siku basah sempurna.",
        "Pastikan bagian belakang siku tidak tertahan lipatan lengan baju."
      ],
      audioTip: "Saat membasuh kedua tangan hingga siku, siswi perempuan hendaknya berwudhu di area khusus putri yang tertutup, menggulung lengan baju hingga di atas siku, dan melepas gelang atau jam tangan ketat."
    },
    5: {
      title: "Wudhu Perempuan: Mengusap Kepala di Balik Jilbab (PENTING!)",
      points: [
        "Hukum Mazhab Syafi'i: TIDAK SAH jika hanya mengusap bagian luar kain jilbab — air wajib menyentuh sebagian rambut atau kulit kepala asli.",
        "Cara praktis tanpa melepas seluruh jilbab: masukkan tangan yang basah ke balik tepi jilbab/ciput di bagian dahi, lalu usap sebagian rambut atau kulit di dalam batas kepala.",
        "Untuk rambut panjang: yang diusap wajib bagian rambut yang masih berada di batas kepala (bukan ujung rambut yang menjuntai di bawah bahu).",
        "Lanjutkan memasukkan jari telunjuk & ibu jari di balik tepi jilbab untuk mengusap lekuk dalam dan belakang daun telinga."
      ],
      audioTip: "Ini adalah aturan paling penting bagi perempuan berhijab dalam Mazhab Syafi'i. Mengusap kepala tidak sah jika hanya mengusap kain jilbab bagian luarnya saja. Caranya, masukkan tangan yang basah ke balik tepi jilbab atau ciput di bagian dahi, lalu usapkan langsung ke sebagian rambut atau kulit di batas kepala, bukan pada ujung rambut yang menjuntai. Setelah itu, usap juga kedua telinga dari balik tepi jilbab."
    },
    6: {
      title: "Wudhu Perempuan: Lepas Kaus Kaki & Jaga Ujung Rok",
      points: [
        "Dalam Mazhab Syafi'i, kaus kaki kain biasa wajib dilepas saat wudhu (tidak cukup diusap dari luar); kulit kaki harus dibasuh langsung hingga melewati mata kaki.",
        "Angkat sedikit ujung rok atau gamis agar tidak basah terkena cipratan air di lantai tempat wudhu.",
        "Pastikan sela-sela jari kaki dan bagian tumit belakang benar-benar basah."
      ],
      audioTip: "Saat membasuh kaki, siswi perempuan wajib melepas kaus kaki terlebih dahulu karena kaus kaki kain biasa tidak cukup hanya diusap. Angkat sedikit ujung rok atau gamis agar tidak basah, lalu basuh kaki hingga melewati kedua mata kaki dan tumit."
    },
    7: {
      title: "Wudhu Perempuan: Tertib & Merapikan Hijab",
      points: [
        "Urutan rukun wudhu perempuan sama persis dengan laki-laki (Tertib: Niat + Wajah → Tangan hingga Siku → Usap Sebagian Kepala → Kaki hingga Mata Kaki).",
        "Tutup keran hingga rapat, lalu rapikan kembali ciput, jilbab, lengan baju, dan kenakan kaus kaki dengan tenang di area yang kering."
      ],
      audioTip: "Urutan rukun wudhu perempuan sama persis dan wajib tertib. Setelah menutup keran hingga rapat, rapikan kembali jilbab, lengan baju, dan kaus kaki dengan tenang di area yang kering."
    },
    8: {
      title: "Wudhu Perempuan: Doa Setelah Wudhu",
      points: [
        "Pastikan jilbab dan busana muslimah sudah rapi menutup aurat sempurna sebelum keluar dari area wudhu putri.",
        "Berdiri menghadap kiblat di tempat yang kering dan bersih, angkat kedua tangan, lalu baca doa setelah wudhu dengan khusyuk."
      ],
      audioTip: "Pastikan jilbab dan busana muslimah telah rapi kembali, lalu berdirilah menghadap kiblat di tempat kering dan bersih untuk membaca doa setelah wudhu dengan penuh kekhusyukan."
    }
  },

  segments: [
    {
      id: 1,
      shortTitle: "Niat & Telapak",
      title: "Niat, Basmalah & Membasuh Telapak Tangan",
      emoji: "🤲",
      law: "Sunnah & Pembuka Adab",
      isRukun: false,
      summary: "Memulai wudhu dengan kesadaran hati (niat), membaca basmalah, dan membersihkan kedua telapak tangan hingga pergelangan.",
      zoomArea: null,
      waterTip: "💧 Adab Air: Buka keran secukupnya (aliran kecil-sedang), jangan langsung dibuka penuh agar tidak memercik dan tidak boros (israf).",
      adab: [
        "Menghadirkan niat ikhlas karena Allah SWT (bukan sekadar rutinitas).",
        "Membaca Bismillahirrahmanirrahim dengan tenang sebelum membuka keran.",
        "Membasuh telapak, punggung tangan, dan menyela jari sebanyak 3 kali."
      ],
      doa: {
        label: "Bacaan Basmalah & Niat Wudhu (Dilafalkan dalam Hati saat Membasuh Wajah)",
        arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ — نَوَيْتُ الْوُضُوْءَ لِرَفْعِ الْحَدَثِ الْاَصْغَرِ فَرْضًا لِلّٰهِ تَعَالٰى",
        latin: "Bismillahirrahmanirrahim. Nawaitul wudhu'a liraf'il hadatsil ashghari fardhan lillahi ta'ala.",
        meaning: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Aku berniat wudhu untuk menghilangkan hadas kecil fardu karena Allah Ta'ala."
      },
      substeps: [
        {
          code: "1a",
          title: "Menghadirkan Niat & Basmalah",
          desc: "Berdiri tenang di depan tempat wudhu, menghadap kiblat bila memungkinkan, lalu membaca Basmalah sebelum menyentuh air.",
          narration: "Assalamualaikum anak-anak saleh dan salehah. Sebelum kita membuka keran air, mari berdiri dengan tenang. Hadirkan niat yang ikhlas di dalam hati karena Allah Subhanahu wa Ta'ala, lalu ucapkan dengan lembut: Bismillahirrahmanirrahim.",
          faucet: "closed",
          pose: "niat"
        },
        {
          code: "1b",
          title: "Membasuh Telapak & Punggung Tangan",
          desc: "Buka keran aliran kecil, basuh kedua telapak dan punggung tangan kanan serta kiri hingga pergelangan tangan dengan lembut (3×).",
          narration: "Sekarang, buka keran dengan aliran air yang kecil saja agar hemat. Basuh kedua telapak tangan dan punggung tangan hingga pergelangan. Lakukan sebanyak tiga kali dengan gerakan lembut dan tenang.",
          faucet: "small",
          pose: "palms"
        },
        {
          code: "1c",
          title: "Menyela-nyela Jari Tangan",
          desc: "Tautkan jari tangan kanan dan kiri untuk membersihkan sela-sela jari secara merata agar tidak ada kotoran yang menghalangi air.",
          narration: "Jangan lupa menyela-nyela jari tangan ya. Tautkan jari tangan kanan dan kiri, lalu gerakkan naik turun secara perlahan agar sela-sela jari bersih sempurna sebelum kita membasuh wajah.",
          faucet: "small",
          pose: "fingers"
        }
      ]
    },
    {
      id: 2,
      shortTitle: "Kumur & Hidung",
      title: "Berkumur & Istinsyaq (Membersihkan Hidung)",
      emoji: "💦",
      law: "Sunnah Mu'akkadah",
      isRukun: false,
      summary: "Membersihkan rongga mulut dengan berkumur dan membersihkan rongga hidung dengan menghirup lalu mengeluarkannya.",
      zoomArea: null,
      waterTip: "💧 Adab Air: Ambil air dengan telapak tangan kanan secukupnya; tidak perlu menengadahkan mulut langsung ke keran yang deras.",
      adab: [
        "Berkumur dengan memutar air di dalam mulut lalu mengeluarkannya dengan sopan.",
        "Menghirup air ke hidung (istinsyaq) perlahan lalu mengembuskannya dengan tangan kiri (istintsar).",
        "Lakukan masing-masing 3 kali dengan tempo tenang (tidak terburu-buru)."
      ],
      doa: null,
      substeps: [
        {
          code: "2a",
          title: "Berkumur (Madhmadhah) 3×",
          desc: "Ambil air menggunakan telapak tangan kanan, masukkan ke mulut, gerakkan air ke seluruh rongga mulut, lalu keluarkan ke saluran pembuangan.",
          narration: "Langkah kedua adalah berkumur. Ambil air secukupnya dengan telapak tangan kanan, putar air di dalam rongga mulut untuk membersihkannya, lalu keluarkan dengan sopan ke saluran air. Lakukan tiga kali ya.",
          faucet: "small",
          pose: "mouth"
        },
        {
          code: "2b",
          title: "Istinsyaq & Istintsar (Hidung) 3×",
          desc: "Ambil air dengan tangan kanan, hirup perlahan ke ujung hidung, lalu keluarkan dengan bantuan jari tangan kiri secara lembut.",
          narration: "Selanjutnya adalah membersihkan hidung atau istinsyaq. Ambil sedikit air dengan tangan kanan, hirup perlahan ke ujung hidung, lalu keluarkan dengan bantuan tangan kiri secara lembut. Ulangi sebanyak tiga kali.",
          faucet: "small",
          pose: "nose"
        }
      ]
    },
    {
      id: 3,
      shortTitle: "Basuh Wajah",
      title: "Membasuh Wajah (Rukun + Niat)",
      emoji: "😊",
      law: "RUKUN WAJIB",
      isRukun: true,
      summary: "Membasuh seluruh area wajah sesuai batas Mazhab Syafi'i sambil menghadirkan niat wudhu di dalam hati pada basuhan pertama.",
      zoomArea: "wajah",
      waterTip: "💧 Adab Air: Tampung air dengan kedua telapak tangan, usapkan merata dari dahi ke dagu tanpa menepukkan air keras ke wajah.",
      adab: [
        "Batas vertikal (atas–bawah): tempat tumbuh rambut kepala hingga ujung dagu bagian bawah.",
        "Batas horizontal (kiri–kanan): dari pangkal telinga kanan hingga pangkal telinga kiri.",
        "Sertakan niat wudhu di dalam hati tepat saat air pertama menyentuh kulit wajah."
      ],
      doa: null,
      substeps: [
        {
          code: "3a",
          title: "Batas Atas ke Bawah (Dahi hingga Dagu)",
          desc: "Basuh merata mulai dari batas tumbuh rambut di dahi sampai bawah dagu. Pastikan bagian bawah dagu ikut terbasuh air.",
          narration: "Sekarang kita masuk ke rukun wajib yang pertama, yaitu membasuh wajah disertai niat wudhu di dalam hati. Perhatikan batas wajib Mazhab Syafi'i dari atas ke bawah: mulai dari garis tumbuh rambut di dahi sampai ke bawah ujung dagu. Usapkan air dengan lembut, jangan ditepuk keras.",
          faucet: "small",
          pose: "face_v"
        },
        {
          code: "3b",
          title: "Batas Samping (Telinga ke Telinga)",
          desc: "Ratakan air ke pipi kanan dan kiri hingga menyentuh area antara jambang dan pangkal kedua daun telinga.",
          narration: "Perhatikan juga batas wajah dari samping kanan ke kiri. Air harus rata membasahi pipi hingga mencapai pangkal telinga kanan dan pangkal telinga kiri. Jadi jangan hanya membasuh bagian tengah wajah saja ya.",
          faucet: "small",
          pose: "face_h"
        },
        {
          code: "3c",
          title: "Meratakan Sudut Mata, Hidung & Bibir",
          desc: "Pastikan sudut dalam mata, lipatan cuping hidung, dan permukaan luar bibir basah sempurna tanpa terlewat (3× tenang).",
          narration: "Pastikan sudut dalam mata, lipatan cuping hidung, dan bagian bibir ikut terkena air dengan sempurna. Lakukan basuhan wajah sebanyak tiga kali dengan tenang dan tuma'ninah.",
          faucet: "small",
          pose: "face_detail"
        }
      ]
    },
    {
      id: 4,
      shortTitle: "Tangan & Siku",
      title: "Membasuh Kedua Tangan hingga Siku",
      emoji: "💪",
      law: "RUKUN WAJIB",
      isRukun: true,
      summary: "Membasuh tangan kanan lalu tangan kiri mulai dari ujung jari sampai melewati tulang siku secara merata.",
      zoomArea: "tangan",
      waterTip: "💧 Adab Air: Gulung lengan baju di atas siku sebelum berwudhu agar air mengalir rapi dari ujung jari hingga siku tanpa membasahi baju.",
      adab: [
        "Dahulukan tangan kanan (3×), kemudian tangan kiri (3×).",
        "Batas wajib Mazhab Syafi'i: seluruh ujung jari, telapak, lengan bawah, hingga MELEWATI sedikit batas siku.",
        "Perhatikan bagian belakang siku dan sela jari yang sering terlewat saat terburu-buru."
      ],
      doa: null,
      substeps: [
        {
          code: "4a",
          title: "Tangan Kanan: Ujung Jari hingga Siku",
          desc: "Alirkan air dari ujung jari tangan kanan, gosok perlahan lengan bawah hingga melewati tulang siku kanan (3×).",
          narration: "Rukun berikutnya adalah membasuh kedua tangan hingga siku. Dahulukan tangan kanan. Alirkan air mulai dari ujung jari, gosok perlahan lengan bawah, hingga melewati sedikit tulang siku kanan. Lakukan tiga kali dengan rata.",
          faucet: "small",
          pose: "arm_r"
        },
        {
          code: "4b",
          title: "Tangan Kiri: Ujung Jari hingga Siku",
          desc: "Lakukan gerakan yang sama pada tangan kiri: dari ujung jari hingga melewati siku kiri secara tenang dan rata (3×).",
          narration: "Setelah tangan kanan selesai tiga kali, lanjutkan dengan tangan kiri. Basuh dari ujung jari hingga melewati sedikit tulang siku kiri. Pastikan jam tangan atau gelang yang ketat sudah dilepas agar air sampai ke kulit.",
          faucet: "small",
          pose: "arm_l"
        },
        {
          code: "4c",
          title: "Cek Bagian Belakang Siku & Sela Jari",
          desc: "Pastikan kulit lipatan belakang siku, pergelangan, dan sela jari benar-benar terkena air (lepas jam/gelang yang ketat).",
          narration: "Hati-hati ya anak-anak, bagian belakang siku adalah area yang paling sering terlewat kering saat kita terburu-buru. Gosok memutar bagian belakang siku agar seluruh kulitnya benar-benar basah.",
          faucet: "small",
          pose: "arm_elbow"
        }
      ]
    },
    {
      id: 5,
      shortTitle: "Kepala & Telinga",
      title: "Mengusap Sebagian Kepala & Telinga",
      emoji: "🧕",
      law: "RUKUN & ADAB HEMAT AIR",
      isRukun: true,
      summary: "Mengecilkan/menutup keran terlebih dahulu, lalu mengusap sebagian kepala (rukun) dan dilanjutkan mengusap telinga (sunnah).",
      zoomArea: "kepala",
      waterTip: "💧 Adab Hemat Air (Anti-Israf): KECILKAN atau TUTUP keran saat mengusap kepala dan telinga! Membasahi tangan cukup sekali usap tanpa membiarkan air terbuang.",
      adab: [
        "Rukun Mazhab Syafi'i: mengusap sebagian kulit kepala atau rambut yang berada di dalam batas kepala.",
        "Sunnah utama: mengusap dari dahi ke belakang kepala lalu kembali ke depan (bagi yang tidak terhalang).",
        "Lanjutkan mengusap daun telinga bagian dalam dengan jari telunjuk dan bagian belakang dengan ibu jari."
      ],
      doa: null,
      substeps: [
        {
          code: "5a",
          title: "Tutup / Kecilkan Keran (Adab Hemat Air)",
          desc: "Basahi kedua telapak tangan, lalu matikan atau kecilkan keran agar air tidak mengucur sia-sia saat mengusap kepala dan telinga.",
          narration: "Nah, ini adab yang sangat penting! Sebelum mengusap kepala dan telinga, basahi kedua tangan lalu tutup atau kecilkan keran terlebih dahulu. Rasulullah Shallallahu alaihi wasallam melarang kita boros air atau israf, meskipun berada di tepi sungai yang mengalir.",
          faucet: "closed",
          pose: "tap_off"
        },
        {
          code: "5b",
          title: "Mengusap Sebagian Kepala (Rukun)",
          desc: "Usapkan telapak tangan basah pada bagian depan kepala (batas rambut) ke arah belakang dengan tenang (3×).",
          narration: "Sekarang usapkan tangan yang basah pada sebagian kepala. Dalam Mazhab Syafi'i, mengusap sebagian rambut atau kulit di batas kepala sudah memenuhi rukun. Sunnah yang paling utama adalah mengusap dari dahi ke belakang kepala lalu kembali ke depan.",
          faucet: "closed",
          pose: "head"
        },
        {
          code: "5c",
          title: "Mengusap Daun & Lubang Telinga (Sunnah)",
          desc: "Gunakan jari telunjuk untuk mengusap lekuk dalam telinga dan ibu jari untuk mengusap bagian belakang daun telinga secara bersamaan.",
          narration: "Lanjutkan dengan sunnah mengusap kedua telinga secara bersamaan. Masukkan jari telunjuk untuk mengusap lekuk bagian dalam telinga, dan gunakan ibu jari untuk mengusap bagian belakang daun telinga dengan lembut.",
          faucet: "closed",
          pose: "ears"
        }
      ]
    },
    {
      id: 6,
      shortTitle: "Basuh Kaki",
      title: "Membasuh Kedua Kaki hingga Mata Kaki",
      emoji: "🦶",
      law: "RUKUN WAJIB",
      isRukun: true,
      summary: "Membasuh kaki kanan lalu kaki kiri sampai melewati kedua mata kaki, termasuk menyela jari kaki dan memastikan tumit basah.",
      zoomArea: "kaki",
      waterTip: "💧 Adab Air: Buka keran kembali dengan aliran kecil, posisikan kaki dekat saluran air agar tidak memerciki pakaian teman di sebelah.",
      adab: [
        "Dahulukan kaki kanan (3×), lalu kaki kiri (3×).",
        "Batas wajib Mazhab Syafi'i: seluruh telapak, jari kaki, tumit, hingga MELEWATI tonjolan mata kaki kanan dan kiri.",
        "Sunnah menyela jari-jari kaki dengan jari kelingking tangan kiri."
      ],
      doa: null,
      substeps: [
        {
          code: "6a",
          title: "Kaki Kanan hingga Melewati Mata Kaki",
          desc: "Alirkan air pada kaki kanan sambil menggosok punggung kaki, pergelangan, hingga sedikit di atas tonjolan mata kaki (3×).",
          narration: "Buka kembali keran dengan aliran kecil. Rukun berikutnya adalah membasuh kedua kaki hingga mata kaki. Dahulukan kaki kanan, gosok merata dari jari kaki, telapak, hingga melewati tonjolan mata kaki sebanyak tiga kali.",
          faucet: "small",
          pose: "foot_r"
        },
        {
          code: "6b",
          title: "Kaki Kiri hingga Melewati Mata Kaki",
          desc: "Basuh kaki kiri secara merata mulai dari jari kaki hingga melewati kedua mata kaki dengan tenang (3×).",
          narration: "Setelah kaki kanan sempurna, lanjutkan membasuh kaki kiri dengan cara yang sama. Pastikan air mengalir lembut dan tidak memerciki baju teman di sebelah kita ya.",
          faucet: "small",
          pose: "foot_l"
        },
        {
          code: "6c",
          title: "Menyela Jari Kaki & Memeriksa Tumit",
          desc: "Sela-sela jari kaki dibersihkan dengan jari kelingking dan pastikan bagian belakang tumit tidak ada yang kering.",
          narration: "Ingat dua bagian kaki yang sering terlewat: sela-sela jari kaki dan tumit bagian belakang. Bersihkan sela jari kaki menggunakan jari kelingking, dan pastikan tumit belakang benar-benar basah agar wudhu kita sah sempurna.",
          faucet: "small",
          pose: "foot_heel"
        }
      ]
    },
    {
      id: 7,
      shortTitle: "Tertib & Tenang",
      title: "Tertib & Thuma'ninah (Ketenangan)",
      emoji: "🌿",
      law: "RUKUN & ADAB BATIN",
      isRukun: true,
      summary: "Menjaga urutan rukun wudhu tidak terbalik, menutup keran hingga rapat, dan menjaga ketenangan hati (thuma'ninah).",
      zoomArea: null,
      waterTip: "💧 Adab Air: Pastikan keran sudah diputar tertutup rapat sebelum meninggalkan tempat wudhu. Tidak ada tetesan air yang terbuang.",
      adab: [
        "Tertib adalah rukun wudhu: Niat + Wajah → Tangan hingga Siku → Usap Kepala → Kaki hingga Mata Kaki.",
        "Thuma'ninah: setiap gerakan dilakukan tenang, tidak tergesa-gesa, dan tidak sambil bercanda.",
        "Rasulullah SAW melarang berlebihan memakai air (israf) meski berada di tepi sungai yang mengalir (HR. Ibn Majah No. 425)."
      ],
      doa: null,
      substeps: [
        {
          code: "7a",
          title: "Menjaga Urutan Rukun (Tertib)",
          desc: "Urutan wajib tidak boleh dibolak-balik: Wajah (dengan niat) → Tangan hingga Siku → Sebagian Kepala → Kaki hingga Mata Kaki.",
          narration: "Rukun terakhir dalam Mazhab Syafi'i adalah tertib, artinya semua rukun dilakukan secara berurutan tanpa dibolak-balik. Mulai dari niat dan wajah, lalu tangan hingga siku, mengusap sebagian kepala, dan terakhir membasuh kaki hingga mata kaki.",
          faucet: "closed",
          pose: "tertib"
        },
        {
          code: "7b",
          title: "Menutup Keran Rapat & Menjaga Ketenangan",
          desc: "Putar keran hingga benar-benar tertutup rapat, rapikan pakaian dengan tenang, dan jaga kekhusyukan menuju salat.",
          narration: "Setelah selesai, putar keran hingga benar-benar tertutup rapat agar tidak ada air yang menetes sia-sia. Jaga sikap tenang atau tuma'ninah, jangan berlari atau bercanda saat menuju tempat salat.",
          faucet: "closed",
          pose: "calm"
        }
      ]
    },
    {
      id: 8,
      shortTitle: "Doa Wudhu",
      title: "Doa Setelah Wudhu",
      emoji: "✨",
      law: "Sunnah & Adab Penutup",
      isRukun: false,
      summary: "Menghadap kiblat, mengangkat kedua tangan dengan penuh adab, dan membaca doa setelah wudhu.",
      zoomArea: null,
      waterTip: "💧 Adab Penutup: Berdoa di tempat yang bersih dan kering (bukan di dalam kamar mandi), menghadap kiblat dengan hati khusyuk.",
      adab: [
        "Menghadap kiblat dan mengangkat kedua telapak tangan setinggi dada.",
        "Membaca syahadat dan doa mohon dijadikan golongan orang yang bertaubat dan menyucikan diri.",
        "Menjaga wudhu dan segera menuju saf salat dengan tenang."
      ],
      doa: {
        label: "Doa Setelah Wudhu (HR. Muslim & Tirmidzi)",
        arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ. اَللّٰهُمَّ اجْعَلْنِيْ مِنَ التَّوَّابِيْنَ وَاجْعَلْنِيْ مِنَ الْمُتَطَهِّرِيْنَ",
        latin: "Asyhadu alla ilaha illallahu wahdahu la syarika lah, wa asyhadu anna Muhammadan 'abduhu wa rasuluh. Allahummaj'alni minat-tawwabina waj'alni minal-mutathahhirin.",
        meaning: "Aku bersaksi tiada Tuhan selain Allah Yang Maha Esa tiada sekutu bagi-Nya, dan aku bersaksi bahwa Nabi Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk orang-orang yang bertaubat dan jadikanlah aku termasuk orang-orang yang menyucikan diri."
      },
      substeps: [
        {
          code: "8a",
          title: "Menghadap Kiblat & Mengangkat Tangan",
          desc: "Berdiri dengan rapi di luar area basah, menghadap kiblat, dan menengadahkan kedua telapak tangan dengan sikap rendah hati.",
          narration: "Sebagai adab penutup wudhu, berdirilah dengan rapi di tempat yang kering dan bersih, menghadap arah kiblat, lalu angkat kedua telapak tangan setinggi dada dengan penuh rasa syukur.",
          faucet: "closed",
          pose: "doa_hands"
        },
        {
          code: "8b",
          title: "Membaca Doa Setelah Wudhu dengan Khusyuk",
          desc: "Ucapkan doa syahadat dan permohonan menjadi hamba yang bertaubat serta suci lahir dan batin.",
          narration: "Mari kita baca doa setelah wudhu bersama-sama: Asyhadu alla ilaha illallahu wahdahu la syarika lah, wa asyhadu anna Muhammadan abduhu wa rasuluh. Allahummaj'alni minat-tawwabina waj'alni minal-mutathahhirin. Alhamdulillah, wudhu kita telah sempurna dengan adab yang mulia.",
          faucet: "closed",
          pose: "doa_read"
        }
      ]
    }
  ],

  kinestheticAreas: {
    wajah: {
      title: "Batas Wajib Wajah (Mazhab Syafi'i)",
      caption: "Temukan urutan batas wajib wajah dari paling atas, ke paling bawah, lalu samping kanan hingga samping kiri.",
      points: [
        { id: "w1", x: 180, y: 66, label: "1", prompt: "Cari titik AWAL (paling atas) batas wajib wajah!", title: "Urutan 1 — Batas Atas (Tumbuh Rambut Dahi)", desc: "Tepat! Membasuh wajah dimulai dari batas atas tempat tumbuhnya rambut kepala di dahi." },
        { id: "w2", x: 180, y: 205, label: "2", prompt: "Sekarang cari titik batas PALING BAWAH pada wajah!", title: "Urutan 2 — Batas Bawah (Ujung Dagu)", desc: "Benar! Alirkan air turun hingga bagian bawah ujung dagu terbasuh merata." },
        { id: "w3", x: 108, y: 136, label: "3", prompt: "Lanjut! Cari titik batas SAMPING KANAN wajah!", title: "Urutan 3 — Batas Kanan (Pangkal Telinga Kanan)", desc: "Bagus! Ratakan air sampai kulit di depan pangkal telinga kanan." },
        { id: "w4", x: 252, y: 136, label: "4", prompt: "Terakhir, cari titik batas SAMPING KIRI wajah!", title: "Urutan 4 — Batas Kiri (Pangkal Telinga Kiri)", desc: "Sempurna! Meratakan hingga pangkal telinga kiri menyempurnakan batas wajib wajah." }
      ]
    },
    tangan: {
      title: "Batas Wajib Tangan hingga Siku",
      caption: "Temukan urutan membasuh tangan mulai dari ujung paling depan hingga melewati batas akhir di lengan.",
      points: [
        { id: "t1", x: 75, y: 145, label: "1", prompt: "Dari bagian mana aliran air tangan DIMULAI? Sentuh titik awalnya!", title: "Urutan 1 — Ujung Jari & Kuku", desc: "Benar! Membasuh tangan dimulai dari ujung jari, kuku, dan sela-sela jari." },
        { id: "t2", x: 165, y: 145, label: "2", prompt: "Setelah ujung jari, ke bagian tengah mana air dialirkan?", title: "Urutan 2 — Pergelangan & Lengan Bawah", desc: "Tepat! Alirkan air ke pergelangan dan lengan bawah (lepas jam/gelang ketat)." },
        { id: "t3", x: 268, y: 145, label: "3", prompt: "Terakhir, sentuh batas AKHIR wajib membasuh tangan!", title: "Urutan 3 — Melewati Tulang Siku", desc: "Sempurna! Dalam Mazhab Syafi'i, basuhan wajib melewati sedikit (2–3 cm) tulang siku." }
      ]
    },
    kepala: {
      title: "Batas Usap Sebagian Kepala & Telinga",
      caption: "Temukan urutan mengusap kepala mulai dari titik rukun di depan, arah usapan ke belakang, lalu sunnah lanjutannya.",
      points: [
        { id: "k1", x: 180, y: 74, label: "1", prompt: "Sentuh titik AWAL (rukun) tempat tangan basah mulai mengusap kepala!", title: "Urutan 1 — Ubun-ubun / Rambut Depan (Rukun)", desc: "Benar! Usapan dimulai dari bagian depan batas rambut kepala (untuk putri: di balik tepi jilbab)." },
        { id: "k2", x: 180, y: 126, label: "2", prompt: "Ke arah mana sunnah usapan kepala dilanjutkan?", title: "Urutan 2 — Arah Usapan ke Belakang (Sunnah)", desc: "Tepat! Sunnah mengusap dari dahi ke arah belakang kepala lalu kembali ke depan." },
        { id: "k3", x: 270, y: 142, label: "3", prompt: "Terakhir, bagian sunnah mana yang diusap setelah kepala?", title: "Urutan 3 — Daun & Lubang Telinga (Sunnah Lanjutan)", desc: "Sempurna! Dilanjutkan mengusap lekuk dalam dan belakang daun telinga dengan tenang." }
      ]
    },
    kaki: {
      title: "Batas Wajib Kaki hingga Mata Kaki",
      caption: "Temukan urutan membasuh kaki mulai dari bagian paling depan, ke bagian belakang yang sering terlewat, hingga batas paling atas.",
      points: [
        { id: "f1", x: 92, y: 192, label: "1", prompt: "Sentuh bagian AWAL kaki yang mulai dibasuh dan disela-sela!", title: "Urutan 1 — Jari-Jari & Sela Kaki", desc: "Benar! Mulai dari jari-jari kaki dan bersihkan sela-selanya dengan jari kelingking." },
        { id: "f2", x: 215, y: 196, label: "2", prompt: "Sekarang cari titik bagian BELAKANG kaki yang sering terlewat kering!", title: "Urutan 2 — Bagian Belakang Tumit", desc: "Tepat! Tumit belakang paling sering kering saat terburu-buru, pastikan basah rata." },
        { id: "f3", x: 205, y: 112, label: "3", prompt: "Terakhir, sentuh batas PALING ATAS yang wajib terkena air pada kaki!", title: "Urutan 3 — Melewati Mata Kaki", desc: "Sempurna! Air wajib membasuh kedua tonjolan mata kaki hingga sedikit di atasnya." }
      ]
    }
  },

  tempoExercises: [
    {
      title: "1. Membasuh Telapak & Sela Jari (3×)",
      waterBadge: "💧 Keran: Aliran Kecil (Hemat Air)",
      isTapClosed: false,
      prep: "Berdiri tenang, baca Basmalah, lalu gosok telapak, punggung tangan, dan tautkan sela jari mengikuti 3 hitungan.",
      steps: [
        "Hitungan 1: Gosok lembut kedua telapak & punggung tangan hingga pergelangan.",
        "Hitungan 2: Tautkan jari kanan & kiri, bersihkan sela-sela jari secara merata.",
        "Hitungan 3: Ulangi basuhan telapak & sela jari dengan tenang tanpa tergesa."
      ],
      hold: "Tahan sejenak — rasakan ketenangan (thuma'ninah)",
      done: "Alhamdulillah! Telapak & sela jari sudah dibasuh 3× dengan tenang."
    },
    {
      title: "2. Berkumur & Istinsyaq Hidung (3×)",
      waterBadge: "💧 Keran: Aliran Kecil (Ambil dengan Tangan Kanan)",
      isTapClosed: false,
      prep: "Tadahkan telapak tangan kanan untuk mengambil air secukupnya (jangan menengadahkan mulut langsung ke keran).",
      steps: [
        "Hitungan 1: Ambil air dengan tangan kanan, putar di rongga mulut lalu keluarkan sopan.",
        "Hitungan 2: Hirup sedikit air ke ujung hidung (istinsyaq), lalu keluarkan dengan tangan kiri.",
        "Hitungan 3: Ulangi kumur dan bersihkan hidung dengan tempo lembut dan tidak tergesa."
      ],
      hold: "Keluarkan air dengan sopan & tenang",
      done: "Bagus! Berkumur & istinsyaq telah dilakukan 3× dengan tertib."
    },
    {
      title: "3. Membasuh Wajah: Dahi–Dagu & Telinga–Telinga (3×)",
      waterBadge: "💧 Keran: Aliran Kecil (Tampung di Dua Telapak)",
      isTapClosed: false,
      prep: "Tampung air di kedua telapak tangan, hadirkan niat wudhu di hati, lalu usapkan lembut (jangan ditepuk keras).",
      steps: [
        "Hitungan 1: Sertakan niat di hati! Usap dari batas rambut dahi turun hingga bawah dagu.",
        "Hitungan 2: Ratakan air ke pipi kanan & kiri hingga pangkal kedua telinga.",
        "Hitungan 3: Pastikan sudut mata, cuping hidung & bibir ikut basah merata (putri: longgarkan sedikit tepi ciput)."
      ],
      hold: "Usap lembut & rata — tidak menepuk wajah",
      done: "Masya Allah! Seluruh batas wajib wajah telah terbasuh 3× dengan tenang."
    },
    {
      title: "4. Membasuh Tangan Kanan hingga Melewati Siku (3×)",
      waterBadge: "💧 Keran: Aliran Kecil (Lengan Baju Digulung di Atas Siku)",
      isTapClosed: false,
      prep: "Pastikan lengan baju kanan digulung di atas siku & jam/gelang ketat sudah dilepas. Mulai dari ujung jari kanan.",
      steps: [
        "Hitungan 1: Alirkan air dari ujung jari kanan, gosok perlahan hingga melewati tulang siku kanan.",
        "Hitungan 2: Gosok memutar bagian belakang siku kanan agar tidak ada kulit yang kering.",
        "Hitungan 3: Ulangi aliran dari ujung jari hingga 2–3 cm di atas siku kanan dengan tenang."
      ],
      hold: "Cek lipatan belakang siku kanan sudah basah",
      done: "Hebat! Tangan kanan hingga melewati siku sudah terbasuh 3× sempurna."
    },
    {
      title: "5. Membasuh Tangan Kiri hingga Melewati Siku (3×)",
      waterBadge: "💧 Keran: Aliran Kecil (Lengan Baju Digulung di Atas Siku)",
      isTapClosed: false,
      prep: "Lanjutkan dengan tangan kiri. Pastikan lengan baju kiri tergulung rapi di atas siku, mulai dari ujung jari kiri.",
      steps: [
        "Hitungan 1: Alirkan air dari ujung jari kiri menuju pergelangan hingga melewati siku kiri.",
        "Hitungan 2: Gosok merata bagian belakang siku kiri dan sela-sela jari kiri.",
        "Hitungan 3: Sempurnakan basuhan ketiga dari ujung jari hingga di atas siku kiri dengan tenang."
      ],
      hold: "Cek lipatan belakang siku kiri sudah basah",
      done: "Alhamdulillah! Kedua tangan hingga melewati siku telah selesai dengan rapi."
    },
    {
      title: "6. Mengusap Sebagian Kepala & Telinga (Keran Ditutup)",
      waterBadge: "🚫 Keran: TUTUP / KECILKAN DAHULU (Adab Hemat Air!)",
      isTapClosed: true,
      prep: "Basahi kedua telapak tangan lalu TUTUP keran terlebih dahulu! Untuk putri: masukkan tangan basah di balik tepi jilbab.",
      steps: [
        "Hitungan 1: Pastikan keran tertutup! Usapkan tangan basah ke sebagian rambut/kulit di batas depan kepala.",
        "Hitungan 2: Sunnah: lanjutkan usapan lembut ke belakang kepala lalu kembali ke depan.",
        "Hitungan 3: Masukkan telunjuk ke lekuk dalam telinga & ibu jari di belakang daun telinga secara bersamaan."
      ],
      hold: "Keran tetap tertutup — bebas pemborosan air (anti-israf)",
      done: "Luar biasa! Usap kepala & telinga selesai dengan adab hemat air."
    },
    {
      title: "7. Membasuh Kaki Kanan hingga Mata Kaki & Tumit (3×)",
      waterBadge: "💧 Keran: Buka Kembali Aliran Kecil (Lepas Kaus Kaki)",
      isTapClosed: false,
      prep: "Buka keran aliran kecil, lepas kaus kaki, dan posisikan kaki kanan dekat saluran agar tidak memerciki teman.",
      steps: [
        "Hitungan 1: Basuh punggung kaki kanan, jari kaki, hingga melewati kedua tonjolan mata kaki kanan.",
        "Hitungan 2: Sela-sela jari kaki kanan dibersihkan memakai jari kelingking tangan kiri.",
        "Hitungan 3: Periksa & gosok bagian belakang tumit kaki kanan agar tidak ada yang kering."
      ],
      hold: "Pastikan mata kaki & tumit kanan basah merata",
      done: "Bagus sekali! Kaki kanan hingga melewati mata kaki & tumit sudah sempurna."
    },
    {
      title: "8. Membasuh Kaki Kiri hingga Mata Kaki & Tumit (3×)",
      waterBadge: "💧 Keran: Aliran Kecil → Lalu Tutup Rapat di Akhir",
      isTapClosed: false,
      prep: "Lanjutkan kaki kiri dengan cara yang sama, jaga agar tidak memercik, lalu bersiap menutup keran hingga rapat.",
      steps: [
        "Hitungan 1: Basuh merata jari kaki kiri, telapak, hingga melewati kedua mata kaki kiri.",
        "Hitungan 2: Bersihkan sela-sela jari kaki kiri dengan jari kelingking dan gosok tumit belakang.",
        "Hitungan 3: Sempurnakan basuhan ketiga, lalu putar keran hingga tertutup rapat tanpa menetes."
      ],
      hold: "Tutup keran rapat & tenangkan hati menuju doa",
      done: "Masya Allah! Seluruh rangkaian gerak wudhu 3× tenang telah tuntas!"
    }
  ],

  quiz: [
    {
      id: "q1",
      question: "1. Menurut Mazhab Syafi'i, dari mana sampai ke mana batas wajib membasuh wajah saat berwudhu?",
      options: [
        "Hanya bagian pipi, hidung, dan mata saja",
        "Dari batas tumbuh rambut di dahi sampai bawah dagu, serta dari telinga kanan ke telinga kiri",
        "Dari alis mata sampai mulut saja",
        "Cukup memercikkan air ke bagian tengah wajah"
      ],
      correct: 1,
      explain: "Benar! Batas wajib wajah secara vertikal adalah tempat tumbuh rambut di dahi hingga bawah dagu, dan secara horizontal dari pangkal telinga kanan ke telinga kiri."
    },
    {
      id: "q2",
      question: "2. Saat membasuh kedua tangan, sampai di manakah batas wajib yang harus terkena air?",
      options: [
        "Cukup sampai pergelangan tangan",
        "Sampai pertengahan lengan bawah",
        "Dari ujung jari hingga melewati sedikit tulang siku",
        "Dari pergelangan tangan saja tanpa menyela jari"
      ],
      correct: 2,
      explain: "Tepat! Kedua tangan wajib dibasuh dari ujung jari hingga menyertakan (melewati sedikit) tulang siku kanan dan kiri."
    },
    {
      id: "q3",
      question: "3. Apa bentuk adab hemat air (menghindari israf) yang tepat saat hendak mengusap kepala dan telinga?",
      options: [
        "Membiarkan keran terbuka deras agar cepat selesai",
        "Mengecilkan atau menutup keran terlebih dahulu setelah membasahi tangan",
        "Menyiram seluruh kepala langsung di bawah keran penuh",
        "Memercikkan air ke lantai sekitar tempat wudhu"
      ],
      correct: 1,
      explain: "Bagus sekali! Mengecilkan atau menutup keran saat mengusap kepala dan telinga mencegah air terbuang sia-sia (israf)."
    },
    {
      id: "q4",
      question: "4. Bagian kaki manakah yang sering terlewat jika siswa berwudhu terlalu terburu-buru?",
      options: [
        "Bagian tumit belakang, sela-sela jari kaki, dan tonjolan mata kaki",
        "Hanya bagian lutut",
        "Bagian betis atas",
        "Tidak ada bagian kaki yang wajib dibasuh"
      ],
      correct: 0,
      explain: "Benar! Tumit belakang, sela jari kaki, dan kedua mata kaki wajib dipastikan basah seluruhnya agar wudhu sah."
    },
    {
      id: "q5",
      question: "5. Apa makna sikap thuma'ninah dalam adab berwudhu?",
      options: [
        "Berwudhu secepat mungkin sambil bercanda dengan teman",
        "Berwudhu dengan tenang, tertib, tidak tergesa-gesa, dan penuh kekhusyukan",
        "Mengulang setiap gerakan sebanyak 10 kali",
        "Membasuh kaki terlebih dahulu sebelum membasuh wajah"
      ],
      correct: 1,
      explain: "Tepat sekali! Thuma'ninah berarti melakukan setiap gerakan wudhu secara tenang, tertib, dan khusyuk sehingga semua batas wajib terbasuh sempurna."
    },
    {
      id: "q6",
      question: "6. Menurut Mazhab Syafi'i, kapankah niat wudhu wajib dihadirkan di dalam hati?",
      options: [
        "Setelah selesai membasuh kedua kaki",
        "Tepat saat air pertama kali menyentuh kulit wajah",
        "Ketika sedang berkumur saja",
        "Setelah membaca doa penutup wudhu"
      ],
      correct: 1,
      explain: "Benar! Dalam Mazhab Syafi'i, niat wudhu wajib dihadirkan di dalam hati tepat pada saat basuhan pertama mengenai bagian wajah."
    },
    {
      id: "q7",
      question: "7. Bagaimana cara mengusap sebagian kepala yang sah bagi perempuan berhijab menurut Mazhab Syafi'i?",
      options: [
        "Cukup mengusap bagian luar kain jilbab saja",
        "Mengusap ujung rambut panjang yang menjuntai di bawah bahu",
        "Memasukkan tangan basah di balik tepi jilbab/ciput hingga menyentuh sebagian rambut atau kulit di batas kepala",
        "Tidak perlu mengusap kepala jika sedang memakai jilbab"
      ],
      correct: 2,
      explain: "Tepat sekali! Air wajib menyentuh sebagian rambut atau kulit yang masih berada di dalam batas kepala (tidak sah jika hanya mengusap luar kain jilbab)."
    },
    {
      id: "q8",
      question: "8. Apa yang wajib dilakukan jika hendak membasuh kaki sementara masih memakai kaus kaki kain biasa?",
      options: [
        "Cukup mengusap bagian luar kaus kaki dengan tangan basah",
        "Melepas kaus kaki terlebih dahulu agar kulit kaki terbasuh langsung hingga melewati mata kaki",
        "Menyiram air di atas kaus kaki tanpa melepasnya",
        "Cukup membasuh ujung jari kaki saja"
      ],
      correct: 1,
      explain: "Benar! Dalam Mazhab Syafi'i, kaus kaki kain biasa wajib dilepas sehingga air langsung membasuh kulit kaki, sela jari, tumit, hingga melewati kedua mata kaki."
    },
    {
      id: "q9",
      question: "9. Manakah urutan rukun wudhu (Tertib) yang benar dan tidak boleh dibolak-balik?",
      options: [
        "Wajah (dengan niat) → Tangan hingga Siku → Usap Sebagian Kepala → Kaki hingga Mata Kaki",
        "Tangan hingga Siku → Wajah → Kaki → Kepala",
        "Usap Kepala → Wajah → Kaki → Tangan hingga Siku",
        "Kaki → Tangan → Wajah → Kepala"
      ],
      correct: 0,
      explain: "Bagus! Urutan rukun wudhu (Tertib) wajib berurutan: Niat + Wajah → Tangan hingga Siku → Usap Sebagian Kepala → Kaki hingga Mata Kaki."
    },
    {
      id: "q10",
      question: "10. Bagaimana adab yang benar setelah selesai membasuh kedua kaki pada akhir wudhu?",
      options: [
        "Langsung berlari meninggalkan keran yang masih menetes",
        "Menutup keran hingga rapat, lalu berdiri menghadap kiblat di tempat bersih dan membaca doa setelah wudhu",
        "Membaca doa di dalam kamar mandi dengan suara keras",
        "Membiarkan lengan baju dan jilbab tetap berantakan"
      ],
      correct: 1,
      explain: "Masya Allah, tepat! Menutup keran hingga rapat, merapikan pakaian, lalu berdoa menghadap kiblat di tempat bersih adalah penyempurna adab wudhu."
    }
  ]
};
