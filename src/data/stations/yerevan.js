export const yerevan = {
  name: "Yerevan",
  country: "Armenia",
  defaultConnectorSize: 60,
  auto: true,
  stations: {
    lineOne: {
      color: "#ed1c24",
      barekamutyun: {
        name: "Barekamutyun",
      },
      marshalBaghramyan: {
        name: "Marshal Baghramyan",
      },
      yeritasardakan: {
        name: "Yeritasardakan",
      },
      hanrapetutyanHraparak: {
        name: "Hanrapetutyan Hraparak",
      },
      zoravarAndranik: {
        name: "Zoravar Andranik",
      },
      sasuntsiDavit: {
        name: "Sasuntsi Davit",
      },
      gortsaranain: {
        name: "Gortsaranain",
      },
      shengavit: {
        name: "Shengavit",
      },
      gareginNzhdehiHraparak: {
        name: "Garegin Nzhdeh Hraparak",
      },
      branches: [
        {
          branchedStation: "Shengavit",
          color: "#ed1c24",
          stations: {
            charbakh: {
              name: "Charbakh",
            },
          },
        },
      ],
    },
  },
};
