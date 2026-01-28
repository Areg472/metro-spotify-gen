const stations = {
  yerevan: {
    name: "Yerevan",
    country: "Armenia",
    stations: {
      barekamutyun: {
        name: "Barekamutyun",
        name_hy: "Բարեկամություն",
        connector: { color: "red", right: true, station: true, x: 0, y: 0 },
      },
      marshal_baghramyan: {
        name: "Marshal Baghramyan",
        name_hy: "Մարշալ Բաղրամյան",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 100,
          y: 0,
        },
      },
      yeritasardakan: {
        name: "Yeritasardakan",
        name_hy: "Երիտասարդական",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 200,
          y: 0,
        },
      },
      republic_square: {
        name: "Republic Square",
        name_hy: "Հանրապետության հրապարակ",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 300,
          y: 0,
        },
      },
      zoravar_andranik: {
        name: "Zoravar Andranik",
        name_hy: "Զորավար Անդրանիկ",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 400,
          y: 0,
        },
      },
      sasuntsi_davit: {
        name: "Sasuntsi Davit",
        name_hy: "Սասունցի Դավիթ",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 500,
          y: 0,
        },
      },
      gortsaranain: {
        name: "Gortsaranain",
        name_hy: "Գործարանային",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          x: 600,
          y: 0,
        },
      },
      shengavit: {
        name: "Shengavit",
        name_hy: "Շենգավիթ",
        connector: {
          color: "red",
          horizontal: true,
          station: true,
          diagonalSE: true,
          x: 700,
          y: 0,
        },
      },
      garegin_nzhdeh: {
        name: "Garegin Nzhdeh",
        name_hy: "Գարեգին Նժդեհ",
        connector: { color: "red", left: true, station: true, x: 900, y: 0 },
      },
      charbakh: {
        name: "Charbakh",
        name_hy: "Չարբախ",
        connector: {
          color: "blue",
          left: true,
          station: true,
          x: 900,
          y: 100,
        },
      },
    },
    extraConnectors: [
      { color: "red", horizontal: true, x: 800, y: 0 },
      { color: "blue", right: true, diagonalNW: true, x: 800, y: 100 },
    ],
  },
  tbilisi: {
    name: "Tbilisi",
    country: "Georgia",
    stations: {
      akhmeteli_theatre: {
        name: "Akhmeteli Theatre",
        name_ka: "ახმეტელის თეატრი",
      },
      sarajishvili: { name: "Sarajishvili", name_ka: "სარაჯიშვილი" },
      guramishvili: { name: "Guramishvili", name_ka: "გურამიშვილი" },
      ghrmaghele: { name: "Ghrmaghele", name_ka: "ღრმაღელე" },
      didube: { name: "Didube", name_ka: "დიდუბე" },
      gotsiridze: { name: "Gotsiridze", name_ka: "გოცირიძე" },
      nadzaladevi: { name: "Nadzaladevi", name_ka: "ნაძალადევი" },
      station_square_1: {
        name: "Station Square I",
        name_ka: "სადგურის მოედანი I",
      },
      marjanishvili: { name: "Marjanishvili", name_ka: "მარჯანიშვილი" },
      rustaveli: { name: "Rustaveli", name_ka: "რუსთაველი" },
      freedom_square: {
        name: "Freedom Square",
        name_ka: "თავისუფლების მოედანი",
      },
      avlabari: { name: "Avlabari", name_ka: "ავლაბარი" },
      aragveli: { name: "300 Aragveli", name_ka: "300 არაგველი" },
      isani: { name: "Isani", name_ka: "ისანი" },
      samgori: { name: "Samgori", name_ka: "სამგორი" },
      varketili: { name: "Varketili", name_ka: "ვარკეთილი" },
      station_square_2: {
        name: "Station Square II",
        name_ka: "სადგურის მოედანი II",
      },
      technical_university: {
        name: "Technical University",
        name_ka: "ტექნიკური უნივერსიტეტი",
      },
      medical_university: {
        name: "Medical University",
        name_ka: "სამედიცინო უნივერსიტეტი",
      },
      delisi: { name: "Delisi", name_ka: "დელისი" },
      vazha_pshavela: { name: "Vazha-Pshavela", name_ka: "ვაჟა-ფშაველა" },
      state_university: {
        name: "State University",
        name_ka: "უნივერსიტეტი",
      },
    },
  },
};

export default stations;
