// Bitrix24 Real Data Mapping and Dictionaries

// 🔥 SHOWROOM TELEFON RAQAMLARI - EKSPORT QILINGAN
export const SHOWROOM_PHONES: Record<string, string> = {
  // Farg'ona
  "№251-Фаргона": "+998 (73) 224-00-02",
  "№251/3 Фаргона": "+998 (73) 224-00-03",
  "№251/4 Риштон": "+998 (73) 224-00-04",
  "№244-Кокон": "+998 (73) 224-00-01",

  // Samarqand
  "245 - Шоу-рум": "+998 (66) 233-00-01",
  "277 - Шоу-рум": "+998 (66) 233-00-02",
  "241 - Шоу-рум": "+998 (66) 233-00-03",
  "309 - Шоу-рум": "+998 (66) 233-00-04",
  "217 - Шоу-рум": "+998 (66) 233-00-05",
  "245/5-Шоу-рум": "+998 (66) 233-00-06",

  // Toshkent
  "353-Sergeli": "+998 (71) 200-88-07",
  "344-Lunacharskiy": "+998 (71) 200-88-13",
  "345- Чилонзор": "+998 (71) 200-88-14",
  "341 - Строй-Центр": "+998 (71) 200-88-08",
  "337 - Текстильный": "+998 (71) 200-88-09",
  "338 - Алгоритм": "+998 (71) 200-88-10",
  "346 - Бешкайрагоч": "+998 (71) 200-88-11",
  "335 - Беруний": "+998 (71) 200-88-12",
  "343 - Рохат": "+998 (71) 200-88-15",
  "340 - Юнусобод Мегапланет": "+998 (71) 200-88-16",
  "339 - Юнусобод": "+998 (71) 200-88-18",

  // Buxoro
  "Шоу рум Франшиза Бухара": "+998 (65) 221-00-01",
  "270-Шоурум Бухара": "+998 (65) 221-00-02",
  "366-Бухоро": "+998 (65) 221-00-03",

  // Andijon
  "Официальный шоу-рум Андижан": "+998 (74) 223-00-01",

  // Namangan
  "№243_Наманган": "+998 (69) 223-00-01",
  "№297_Наманган": "+998 (69) 223-00-02",

  // Default
  "default": "+998 (71) 200-88-00"
};

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

// 3. Bitrix24 Voronkalar & Bosqichlar (STAGE_ID nomlari)
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
  "C2:1", "C2:2", "C2:UC_6R66T3", "C2:5", "C2:6", "C2:UC_ELI1KU", "C2:WON",
  // C8
  "C8:UC_Q4UARA", "C8:UC_KI81ZC", "C8:UC_KCNRMF", "C8:UC_EE5QBV", "C8:WON",
  // C12
  "C12:UC_ZRA1WC", "C12:UC_I2P8V1", "C12:UC_U36QBE", "C12:UC_QOH2K1", "C12:WON",
  // C13
  "C13:6", "C13:7", "C13:10", "C13:11", "C13:WON",
  // C16
  "C16:UC_G7GQBV", "C16:UC_NA1A9O", "C16:UC_H9CTB9", "C16:2", "C16:WON",
  // C22
  "C22:UC_IC6QYV", "C22:UC_H6AOUS", "C22:UC_2JO4UN", "C22:UC_I6QM65", "C22:WON",
  // C24
  "C24:UC_Q8F0S3", "C24:UC_JZPAV2", "C24:UC_0YXSW9", "C24:UC_H9797W", "C24:WON",
  // C27
  "C27:UC_B2NTSZ", "C27:UC_E9E5IW", "C27:UC_6G3PNP", "C27:UC_1UTXNE", "C27:WON",
  // C35
  "C35:UC_8G1TNE", "C35:UC_XXO9DM", "C35:UC_6LACIU", "C35:FINAL_INVOICE", "C35:WON",
]);

// 4. Showroomlar Katalogi
export const SHOWROOMS_DICT: Record<number | string, string> = {
  // ... (Sizning SHOWROOMS_DICT ma'lumotlaringiz)
};

// 5. Bitrix24 Maxsus Maydonlar Kodlari
export const BITRIX_FIELDS = {
  SPECIAL_CODE: "UF_CRM_1745308434",
  ORDER_INVOICE_ID: "UF_CRM_1651306406137",
  RESPONSIBLE_MANAGER: "UF_CRM_1646213205",
  OKK_MANAGER: "UF_CRM_1690286173",
  AREA_SQM: "UF_CRM_1648100319007",
  PRODUCT_SERIES: "UF_CRM_1656483960",
  COLOR: "UF_CRM_1656484012",
  FACTORY_DATE: "UF_CRM_1701497119",
  ESTIMATED_READY_DATE: "UF_CRM_1682695332152",
  READY_TO_PROD_DATE: "UF_CRM_1682761006746",
  ORDER_READY_DATE: "UF_CRM_1678904672694",

  SHOWROOMS: {
    DEFAULT: "UF_CRM_1647931321",
    SERGELI: "UF_CRM_1647931321",
    ANDIJAN: "UF_CRM_1649332403191",
    SAMARKAND: "UF_CRM_1653148491",
    NAMANGAN: "UF_CRM_1655321621579",
    NUKUS: "UF_CRM_1659691369246",
    BUKHARA: "UF_CRM_1671518012095",
    SURKHANDARYA: "UF_CRM_1696845428847",
    FERGANA: "UF_CRM_1713332718568",
    KHOREZM: "UF_CRM_1761029845985"
  }
};

// Sana formatlash yordamchisi
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
