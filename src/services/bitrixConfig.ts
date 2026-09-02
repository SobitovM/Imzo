// Bitrix24 Real Data Mapping and Dictionaries

// 1. Maxsulotlar katalogi (Products dictionary)
export const PRODUCTS_DICT: Record<number | string, string> = {
  1357: "6000 Quattro",
  1358: "6000 Trio",
  1359: "7000 Engelberg",
  1360: "7600 Engelberg",
  1361: "8000 Engelberg",
  1945: "Termo 57",
  4114: "Термо 64",
  1362: "Термо 65",
  1363: "Термо 78",
  4115: "Термо 85",
  1370: "Termo 98",
  1826: "Termo 105",
  2728: "70REHAU",
  2637: "BKO-40",
  2306: "BKH-20",
  1365: "BKH-38",
  1367: "BKH-65",
  1371: "Dip tech",
  1373: "EcoDooR Engelberg",
  1774: "TIARA TWINMAX",
  1375: "Chempion",
  1377: "Москитная сетка",
  1378: "Рольставни",
  1379: "Секционный",
  1380: "Стеклопакет",
  1381: "Slide Master",
  1383: "подоконник",
  2305: "6000 ECO",
  2433: "Фасад",
  3520: "Лапша"
};

// 2. Profil Ranglari (Colors dictionary)
export const COLORS_DICT: Record<number | string, string> = {
  1386: "Белый-9016",
  1388: "Шеффилдский серый дуб",
  1387: "Дуб Мокко",
  1389: "Золотой дуб-8003",
  1390: "Alux anthrazit",
  1391: "Серый SW 306 G",
  1392: "7016 Матовый (Tiger)",
  1393: "Alux graualuminium/белый",
  1394: "Metbrush anthrazit",
  1395: "Metbrush platin",
  1396: "Metbrush quarzgrau",
  1399: "Бело-алюмин 9006",
  1400: "Белый/Дуб Мокко",
  1401: "Белый/Золотой Дуб",
  1402: "Белый/Шеффилдский Бетонный Дуб 3003",
  1403: "Железно-серый 7011",
  1404: "Жемчужно-белый 1013",
  1405: "Коричневый 8017",
  1411: "Шеффилдский Бетонный Дуб 3003",
  1412: "Шеффилдский Высокогорный Дуб 3002",
  1409: "Солодовый дуб (Turner Oak Malt 3001)",
  1470: "Черно матовый"
};

// 3. Bitrix24 Voronkalar & Bosqichlar (STAGE_ID nomlari) - KO'RSATILADIGAN NOMLAR
export const STAGE_NAMES: Record<string, string> = {
  // C2 - Sergeli / Toshkent
  "C2:UC_MNKRA5":          "🛠 Ishlab chiqarishda",
  "C2:1":                  "📦 Buyurtma tayyor",
  "C2:2":                  "🚚 Yetkazilmoqda",
  "C2:UC_6R66T3":          "✅ Yetkazildi",
  "C2:5":                  "🔩 O'rnatish jarayonida",
  "C2:6":                  "🧐 Sifat nazorati tekshiruvida",
  "C2:UC_ELI1KU":          "⚠️ Sifat nazoratidan o'tmadi",
  "C2:WON":                "✅ Muvaffaqiyatli yakunlandi",

  // C8 - Andijon
  "C8:UC_Q4UARA":          "📦 Buyurtma tayyor",
  "C8:UC_KI81ZC":          "🚚 Yetkazilmoqda",
  "C8:UC_KCNRMF":          "🔩 O'rnatish jarayonida",
  "C8:UC_EE5QBV":          "🧐 Sifat nazorati tekshiruvida",
  "C8:WON":                "✅ Muvaffaqiyatli yakunlandi",

  // C12 - Samarqand
  "C12:UC_ZRA1WC":         "📦 Buyurtma tayyor",
  "C12:UC_I2P8V1":         "🚚 Yetkazilmoqda",
  "C12:UC_U36QBE":         "🔩 O'rnatish jarayonida",
  "C12:UC_QOH2K1":         "🧐 Sifat nazorati tekshiruvida",
  "C12:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C13 - Namangan
  "C13:6":                 "📦 Buyurtma tayyor",
  "C13:7":                 "🚚 Yetkazilmoqda",
  "C13:10":                "🔩 O'rnatish jarayonida",
  "C13:11":                "🧐 Sifat nazorati tekshiruvida",
  "C13:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C16 - Nukus
  "C16:UC_G7GQBV":         "📦 Buyurtma tayyor",
  "C16:UC_NA1A9O":         "🚚 Yetkazilmoqda",
  "C16:UC_H9CTB9":         "🔩 O'rnatish jarayonida",
  "C16:2":                 "🧐 Sifat nazorati tekshiruvida",
  "C16:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C22 - Buxoro
  "C22:UC_IC6QYV":         "📦 Buyurtma tayyor",
  "C22:UC_H6AOUS":         "🚚 Yetkazilmoqda",
  "C22:UC_2JO4UN":         "🔩 O'rnatish jarayonida",
  "C22:UC_I6QM65":         "🧐 Sifat nazorati tekshiruvida",
  "C22:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C24 - Surxondaryo
  "C24:UC_Q8F0S3":         "📦 Buyurtma tayyor",
  "C24:UC_JZPAV2":         "🚚 Yetkazilmoqda",
  "C24:UC_0YXSW9":         "🔩 O'rnatish jarayonida",
  "C24:UC_H9797W":         "🧐 Sifat nazorati tekshiruvida",
  "C24:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C27 - Farg'ona
  "C27:UC_B2NTSZ":         "📦 Buyurtma tayyor",
  "C27:UC_E9E5IW":         "🚚 Yetkazilmoqda",
  "C27:UC_6G3PNP":         "🔩 O'rnatish jarayonida",
  "C27:UC_1UTXNE":         "🧐 Sifat nazorati tekshiruvida",
  "C27:WON":               "✅ Muvaffaqiyatli yakunlandi",

  // C35 - Nukus
  "C35:UC_8G1TNE":         "📦 Buyurtma tayyor",
  "C35:UC_XXO9DM":         "🚚 Yetkazilmoqda",
  "C35:UC_6LACIU":         "🔩 O'rnatish jarayonida",
  "C35:FINAL_INVOICE":     "🧐 Sifat nazorati tekshiruvida",
  "C35:WON":               "✅ Muvaffaqiyatli yakunlandi",
};

// 🔥 ALLOWED_BITRIX_STAGES - FAQAT malumot1.txt dagi statuslar
export const ALLOWED_BITRIX_STAGES: Set<string> = new Set([
  // C2
  "C2:1",                  // Buyurtma tayyor
  "C2:2",                  // Yetkazilmoqda
  "C2:UC_6R66T3",          // Yetkazildi
  "C2:5",                  // O'rnatish jarayonida
  "C2:6",                  // Sifat nazorati tekshiruvida
  "C2:UC_ELI1KU",          // Sifat nazoratidan o'tmadi
  "C2:WON",                // Muvaffaqiyatli yakunlandi

  // C8
  "C8:UC_Q4UARA",          // Buyurtma tayyor
  "C8:UC_KI81ZC",          // Yetkazilmoqda
  "C8:UC_KCNRMF",          // O'rnatish jarayonida
  "C8:UC_EE5QBV",          // Sifat nazorati tekshiruvida
  "C8:WON",                // Muvaffaqiyatli yakunlandi

  // C12
  "C12:UC_ZRA1WC",         // Buyurtma tayyor
  "C12:UC_I2P8V1",         // Yetkazilmoqda
  "C12:UC_U36QBE",         // O'rnatish jarayonida
  "C12:UC_QOH2K1",         // Sifat nazorati tekshiruvida
  "C12:WON",               // Muvaffaqiyatli yakunlandi

  // C13
  "C13:6",                 // Buyurtma tayyor
  "C13:7",                 // Yetkazilmoqda
  "C13:10",                // O'rnatish jarayonida
  "C13:11",                // Sifat nazorati tekshiruvida
  "C13:WON",               // Muvaffaqiyatli yakunlandi

  // C16
  "C16:UC_G7GQBV",         // Buyurtma tayyor
  "C16:UC_NA1A9O",         // Yetkazilmoqda
  "C16:UC_H9CTB9",         // O'rnatish jarayonida
  "C16:2",                 // Sifat nazorati tekshiruvida
  "C16:WON",               // Muvaffaqiyatli yakunlandi

  // C22
  "C22:UC_IC6QYV",         // Buyurtma tayyor
  "C22:UC_H6AOUS",         // Yetkazilmoqda
  "C22:UC_2JO4UN",         // O'rnatish jarayonida
  "C22:UC_I6QM65",         // Sifat nazorati tekshiruvida
  "C22:WON",               // Muvaffaqiyatli yakunlandi

  // C24
  "C24:UC_Q8F0S3",         // Buyurtma tayyor
  "C24:UC_JZPAV2",         // Yetkazilmoqda
  "C24:UC_0YXSW9",         // O'rnatish jarayonida
  "C24:UC_H9797W",         // Sifat nazorati tekshiruvida
  "C24:WON",               // Muvaffaqiyatli yakunlandi

  // C27
  "C27:UC_B2NTSZ",         // Buyurtma tayyor
  "C27:UC_E9E5IW",         // Yetkazilmoqda
  "C27:UC_6G3PNP",         // O'rnatish jarayonida
  "C27:UC_1UTXNE",         // Sifat nazorati tekshiruvida
  "C27:WON",               // Muvaffaqiyatli yakunlandi

  // C35
  "C35:UC_8G1TNE",         // Buyurtma tayyor
  "C35:UC_XXO9DM",         // Yetkazilmoqda
  "C35:UC_6LACIU",         // O'rnatish jarayonida
  "C35:FINAL_INVOICE",     // Sifat nazorati tekshiruvida
  "C35:WON",               // Muvaffaqiyatli yakunlandi
]);

// 4. Showroomlar Katalogi (Bitrix24 Showrooms Dictionary)
export const SHOWROOMS_DICT: Record<number | string, string> = {
  // Toshkent & Viloyatlar
  5352: "006-Нурафшон",
  516:  "Tinchlik",
  517:  "Beshyog'och",
  519:  "Jomiy",
  521:  "Qora-qamish",
  522:  "Oq-tepa",
  523:  "Akfa-visitor",
  806:  "Qo'yliq",
  808:  "353-Sergeli",
  830:  "341 - Строй-Центр",
  831:  "337 - Текстильный",
  832:  "338 - Алгоритм",
  834:  "346 - Бешкайрагоч",
  835:  "335 - Беруний",
  836:  "344-Lunacharskiy",
  837:  "345- Чилонзор",
  839:  "343 - Рохат",
  843:  "340 - Юнусобод Мегапланет",
  1232: "351-Ангрен",
  1469: "339 - Юнусобод",
  1758: "5 - Сеул Байналминал",
  1817: "352 - Olmaliq",
  1818: "349 - Chirchiq",
  1951: "360 - Angren",
  1820: "342 - Bekobod",
  1821: "350 - Chirchiq - 2",
  1822: "356 - Chirchiq - 3",
  1949: "709 - Olmaliq",
  1950: "348 - SAMPI",
  1952: "354 - Bodomzor",
  2224: "263-Шахрисабз",
  2227: "263/3 Шахрисабз",
  2235: "263/5 Шахрисабз",
  2272: "256 - Жиззах",
  2308: "363-Охунбобоев",
  2309: "JP (не актив)",
  2320: "274-Сирдарё",
  2349: "Тарговый дом",
  2351: "362-Паркент",
  5342: "E720-Экспорт",
  5343: "E724-Экспорт",
  5344: "E725-Экспорт",
  5345: "E707-Экспорт",
  2625: "365-Ғазалкент",
  3101: "368-Хасанбой",
  3102: "369-Чилонзор",
  3103: "370-Шоурум",
  3129: "263/7 Шахрисабз",
  3130: "263/8 Китоб",
  3131: "263/11 Шахрисабз",
  3132: "263/10 Чироқчи",
  3145: "371-Сирдарё",
  4165: "377-Янги Тошкент",
  5336: "381 - Лабзак",
  5340: "379-Qo'yliq",
  2350: "Вилоят",

  // Andijon
  811:  "Официальный шоу-рум Андижан",
  2545: "Андижон Гость",
  3148: "№714 Қўрғонтепа",
  3149: "№700/7 Асака",
  5338: "№382 Shahrixon",
  812:  "№266",
  813:  "№257",

  // Samarqand
  1202: "245 - Шоу-рум",
  1203: "277 - Шоу-рум",
  1204: "241 - Шоу-рум",
  1205: "309 - Шоу-рум",
  1206: "217 - Шоу-рум",
  5356: "245/5-Шоу-рум",

  // Namangan
  1280: "№243_Наманган",
  1281: "№297_Наманган",
  1308: "№ 243_3 Тошбулоқ",
  1309: "№ 243_4 Бобуршох",
  1310: "№ 243_6 Дўстлик",
  1311: "№ 243_7 Чуст",
  1312: "№ 243_8 Учқўрғон",
  1313: "№ 243_9 Янгиариқ",
  1314: "№ 297_1 Уйчи",
  1953: "243_11 Промзона Хамкор",
  2221: "№ 243_5 POP",
  2967: "№ 243_10 Косонсой",
  4118: "№ 243_13 Гўзал",
  4175: "N380-Отдел",

  // Buxoro & Navoiy
  1759: "Шоу рум Франшиза Бухара",
  1760: "270-Шоурум Бухара",
  2238: "254-Шоурум Навоий",
  2725: "366-Бухоро",
  3150: "710-4 Бухоро",
  3151: "710-3 Хатирчи",
  4116: "372-Новои",
  4117: "254_4-Новои",

  // Surxondaryo & Qashqadaryo
  2570: "262-Денов",
  2571: "262/7 Sho'rchi",
  2602: "262/6 Qumqo'rg'on",
  2603: "262/5 Jarqo'rg'on",
  2606: "262/9 Sariosiyo",
  2605: "303 - Термиз",
  2723: "358 - Термиз",
  2724: "283 - Шахрисабз",
  3485: "249-Карши",
  4156: "Таджикистан",
  4163: "376-Карши",

  // Farg'ona
  2979: "№244-Кокон",
  2981: "№251-Фаргона",
  4172: "№251/3 Фаргона",
  5354: "№251/4 Риштон",

  // Xorazm & Boshqa Bo'limlar
  4185: "N255 Отдел",
  4186: "N259 Отдел",
  4187: "N275 Отдел",
  4188: "N267 Отдел",
  4190: "374-Отдел",
  4191: "375-Отдел",
  4192: "378-Отдел",
  4202: "010 Отдел"
};

// 5. Bitrix24 Maxsus Maydonlar Kodlari (Fields Mapping)
export const BITRIX_FIELDS = {
  SPECIAL_CODE: "UF_CRM_1745308434",            // Maxsus kod / PIN kod
  ORDER_INVOICE_ID: "UF_CRM_1651306406137",     // ID заказа : (Schet raqami)
  RESPONSIBLE_MANAGER: "UF_CRM_1646213205",     // Ответственный менеджер
  OKK_MANAGER: "UF_CRM_1690286173",             // Ответственный отдела контроля качества
  AREA_SQM: "UF_CRM_1648100319007",            // Квадратура м2 :
  PRODUCT_SERIES: "UF_CRM_1656483960",          // Серия профиля : (обновлённая) (ID list)
  COLOR: "UF_CRM_1656484012",                   // Цвет профиля : (обновлённая) (ID list)
  FACTORY_DATE: "UF_CRM_1701497119",            // Фабрикага келган вақт
  ESTIMATED_READY_DATE: "UF_CRM_1678904672694", // Тахминий тайёр бўлиш вақти  UF_CRM_1682695332152
  READY_TO_PROD_DATE: "UF_CRM_1682761006746",   // "Готов к производству" статусига ўтган вақт
  ORDER_READY_DATE: "UF_CRM_1678904672694",     // "Заказ готов" статусига ўтган вақт

  // Showroom fields by regions
  SHOWROOMS: {
    DEFAULT: "UF_CRM_1647931321",          // Шоурум (Toshkent / Sergeli)
    SERGELI: "UF_CRM_1647931321",          // Шоурум :
    ANDIJAN: "UF_CRM_1649332403191",       // Шоу-рум :(андижан)
    SAMARKAND: "UF_CRM_1653148491",        // Шоу-рум : (самарканд)
    NAMANGAN: "UF_CRM_1655321621579",       // Шоу-рум Наманган
    NUKUS: "UF_CRM_1659691369246",          // Шоу-рум  "НУКУС" завод
    BUKHARA: "UF_CRM_1671518012095",        // Шоу-рум Бухара
    SURKHANDARYA: "UF_CRM_1696845428847",   // Шоу-рум Сурхандарё
    FERGANA: "UF_CRM_1713332718568",        // Шоу-рум (Фарғона) :
    KHOREZM: "UF_CRM_1761029845985"         // Шоу-рум Хоразм
  }
};

// Sana formatlash yordamchisi (DD.MM.YYYY)
export const formatBitrixDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr || "-";
  }
};
