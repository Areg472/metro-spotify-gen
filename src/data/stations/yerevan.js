export const yerevan = {
  name: "Yerevan",
  country: "Armenia",
  defaultConnectorSize: 100,
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
};
