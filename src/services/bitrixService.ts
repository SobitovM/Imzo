import { 
  PRODUCTS_DICT, 
  COLORS_DICT, 
  STAGE_NAMES, 
  SHOWROOMS_DICT, 
  BITRIX_FIELDS, 
  formatBitrixDate 
} from './BITRIXCONFIC';

// Menejerlar va ularning standart showroom bog'liqligi lug'ati
export interface ManagerInfo {
  id: string;
  name: string;
  phone?: string;
  showroom?: string;
}

export const MANAGERS_DICT: Record<string, ManagerInfo> = {
  // SHAHAR CATEGORY (FABRIKA: Toshkent)
  "563": { id: "563", name: "Hayotbek Xayrullayev", showroom: "263/11" },
  "856": { id: "856", name: "Jamshid Isroilov", showroom: "263/3" },
  "857": { id: "857", name: "Sayyora Qahramonova", showroom: "263/3" },
  "858": { id: "858", name: "Fariz Isaev", showroom: "263/3" },
  "860": { id: "860", name: "Husniddin Yusupov", showroom: "263/5" },
  "861": { id: "861", name: "Muhriddin Homidov", showroom: "263/5" },
  "863": { id: "863", name: "Ildor Saidov", showroom: "263/5" },
  "2543": { id: "2543", name: "Abror Norxo'jayev", showroom: "263/5" },
  "3206": { id: "3206", name: "Ruhshonahon Muzaffarova", showroom: "263/7" },
  "368": { id: "368", name: "Комила Хайдарова", showroom: "263/8" },
  "615": { id: "615", name: "Bekzod Ergashev", showroom: "363-Охунбобоев" },
  "995": { id: "995", name: "Jamoliddin Atayev", showroom: "363-Охунбобоев" },
  "1462": { id: "1462", name: "Равшан Карабоев", showroom: "363-Охунбобоев" },
  "1689": { id: "1689", name: "Махкамов Абдулазиз", showroom: "365-Ғазалкент" },
  "1690": { id: "1690", name: "Санжар Тўхтасинов", showroom: "365-Ғазалкент" },
  "374": { id: "374", name: "Mirazim Sodiqov", showroom: "368-Хасанбой" },
  "819": { id: "819", name: "Davron Qosimov", showroom: "368-Хасанбой" },
  "156": { id: "156", name: "Komoliddin Nasriddinov", showroom: "369-Чилонзор" },
  "450": { id: "450", name: "Shaxlo Kurbonbaeva", showroom: "369-Чилонзор" },
  "482": { id: "482", name: "Dilshod Qodirov", showroom: "369-Чилонзор" },
  "510": { id: "510", name: "Feruza Yusupova", showroom: "370-Чорсу" },
  "1208": { id: "1208", name: "eldor shoyiqulov", showroom: "370-Чорсу" },
  "164": { id: "164", name: "Фуркат Бабаев", showroom: "371 - Сирдарё" },
  "191": { id: "191", name: "Chamangul Abdusamatova", showroom: "371 - Сирдарё" },
  "758": { id: "758", name: "Бабаев Фархад", showroom: "371 - Сирдарё" },
  "383": { id: "383", name: "Javohir Ormonbekov", showroom: "379-Qo'yliq" },
  "830": { id: "830", name: "Shohista Do'stmoilova", showroom: "263 Шахрисабз" },
  "845": { id: "845", name: "Зафар Элмуродов", showroom: "263 Шахрисабз" },
  "859": { id: "859", name: "Rustam Xurramov", showroom: "263 Шахрисабз" },
  "524": { id: "524", name: "Nuriddin Latipov", showroom: "335 Беруний" },
  "525": { id: "525", name: "Akbar Nazarov", showroom: "335 Беруний" },
  "526": { id: "526", name: "Botir Ergashev", showroom: "335 Беруний" },
  "527": { id: "527", name: "Sherzod Ikromov", showroom: "337 Текстильный" },
  "605": { id: "605", name: "Sanjar Yakubov", showroom: "337 Текстильный" },
  "607": { id: "607", name: "Bahrom Obidjonov", showroom: "337 Текстильный" },
  "609": { id: "609", name: "Farxod Sobitov", showroom: "337 Текстильный" },
  "646": { id: "646", name: "G'anisher Abdunabiyev", showroom: "337 Текстильный" },
  "2610": { id: "2610", name: "Temur Mansurov", showroom: "337 Текстильный" },
  "490": { id: "490", name: "Muxlisa Maxamadvaliyeva", showroom: "338 Алгоритм" },
  "491": { id: "491", name: "Akmaljon Abduqaxxorov", showroom: "338 Алгоритм" },
  "495": { id: "495", name: "Мадина Муродова", showroom: "338 Алгоритм" },
  "496": { id: "496", name: "Muhammadrasul Valiyev", showroom: "338 Алгоритм" },
  "498": { id: "498", name: "Jambul Tursinboyev", showroom: "338 Алгоритм" },
  "518": { id: "518", name: "Джамбул Турсунбаев", showroom: "338 Алгоритм" },
  "515": { id: "515", name: "Komoliddin Tashev", showroom: "339 ЮНУСОБОД" },
  "516": { id: "516", name: "Nodir Bahromov", showroom: "339 ЮНУСОБОД" },
  "517": { id: "517", name: "Nodir Baxromov", showroom: "339 ЮНУСОБОД" },
  "523": { id: "523", name: "Xojiakbar Mo'minjonov", showroom: "339 ЮНУСОБОД" },
  "2379": { id: "2379", name: "Abdulhamid Mutalov", showroom: "339 ЮНУСОБОД" },
  "2609": { id: "2609", name: "Рамиль Мударисов", showroom: "339 ЮНУСОБОД" },
  "611": { id: "611", name: "Равшан Карабаев", showroom: "340 Мега планет" },
  "612": { id: "612", name: "Рамшиддин Акбаров", showroom: "340 Мега планет" },
  "613": { id: "613", name: "Жавохир Тургунбойев", showroom: "340 Мега планет" },
  "618": { id: "618", name: "Олмас Акбаров", showroom: "340 Мега планет" },
  "2548": { id: "2548", name: "Абдуазим Мусаев", showroom: "340 Мега планет" },
  "597": { id: "597", name: "Махмуд Сафаев", showroom: "341 Строй-центр" },
  "598": { id: "598", name: "ALISHER SV", showroom: "341 Строй-центр" },
  "599": { id: "599", name: "Саидазиз Ахмедов", showroom: "341 Строй-центр" },
  "601": { id: "601", name: "Ислом Акбаров", showroom: "341 Строй-центр" },
  "604": { id: "604", name: "Бадриддин", showroom: "341 Строй-центр" },
  "668": { id: "668", name: "Dilnoza", showroom: "341 Строй-центр" },
  "2547": { id: "2547", name: "Dilshoda", showroom: "341 Строй-центр" },
  "629": { id: "629", name: "Хожиакbar Таджиходжаев", showroom: "343 Рохат" },
  "630": { id: "630", name: "Ulug'bek Abdurakhmanov", showroom: "343 Рохат" },
  "632": { id: "632", name: "Рустам Исматуллаев", showroom: "343 Рохат" },
  "2529": { id: "2529", name: "Boxodir Xalmirzayev", showroom: "343 Рохат" },
  "2608": { id: "2608", name: "Жамоллидин Курбанов", showroom: "343 Рохат" },
  "619": { id: "619", name: "Насириллаев Боходир", showroom: "344 Луначарский" },
  "620": { id: "620", name: "Убайдуллаев Иззатилла", showroom: "344 Луначарский" },
  "735": { id: "735", name: "Latofat Tulayeva", showroom: "344 Луначарский" },
  "2299": { id: "2299", name: "Фазлиддин Хомиджонов", showroom: "344 Луначарский" },
  "2604": { id: "2604", name: "Nig'matjon Xakimov", showroom: "344 Луначарский" },
  "2605": { id: "2605", name: "Дониёр Гуломов", showroom: "344 Луначарский" },
  "2607": { id: "2607", name: "Ахадхон Саидахмедов", showroom: "344 Луначарский" },
  "2416": { id: "2416", name: "Shoxrux G'ulomov", showroom: "344 Луначарский" },
  "623": { id: "623", name: "Olim Tolipov", showroom: "345-отдел" },
  "628": { id: "628", name: "BOTIR TUYAKOV", showroom: "345-отдел" },
  "2667": { id: "2667", name: "Odinaxon Nurmamatova", showroom: "345-отдел" },
  "501": { id: "501", name: "SHoxida Igamberdiyeva", showroom: "346 Бешқайрағоч" },
  "502": { id: "502", name: "XIKMATILLA MINAYEV", showroom: "346 Бешқайрағоч" },
  "503": { id: "503", name: "XAMIDULLA MINAYEV", showroom: "346 Бешқайрағоч" },
  "504": { id: "504", name: "Zabihullo Minayev", showroom: "346 Бешқайрағоч" },
  "665": { id: "665", name: "Бахтиёр Рахматуллин", showroom: "348 Сампи" },
  "777": { id: "777", name: "Aygul Kuzbayeva", showroom: "348 Сампи" },
  "780": { id: "780", name: "Одилхон Жураев", showroom: "348 Сампи" },
  "781": { id: "781", name: "Muhammadjon Mamadjanov", showroom: "348 Сампи" },
  "2469": { id: "2469", name: "Dilshoda Mamadjanova", showroom: "348 Сампи" },
  "2470": { id: "2470", name: "Музаффар Турсунов", showroom: "348 Сампи" },
  "719": { id: "719", name: "Отабек Абдураимов", showroom: "349 Чирчиқ" },
  "720": { id: "720", name: "Dilmurod Abduraimov", showroom: "349 Чирчиқ" },
  "731": { id: "731", name: "Музаффар Тошкенбоев", showroom: "349 Чирчиқ" },
  "712": { id: "712", name: "Сияр Аккиев", showroom: "352 Олмалиқ" },
  "713": { id: "713", name: "Карина Султанова", showroom: "352 Олмалиқ" },
  "715": { id: "715", name: "Вазира Балтаева", showroom: "352 Олмалиқ" },
  "716": { id: "716", name: "Ilhom Ramziddinov", showroom: "352 Олмалиқ" },
  "718": { id: "718", name: "Наталья Баракова", showroom: "352 Олмалиқ" },
  "1523": { id: "1523", name: "Карина Усманова", showroom: "352 Олмалиқ" },
  "1524": { id: "1524", name: "Rayhona Jonuzoqova", showroom: "352 Олмалиқ" },
  "213": { id: "213", name: "Миркомил Адилов", showroom: "353 Sergeli" },
  "214": { id: "214", name: "Робия", showroom: "353 Sergeli" },
  "215": { id: "215", name: "Jasur Rahimov", showroom: "353 Sergeli" },
  "123": { id: "123", name: "Аъзамхўжа Набиходжаев", showroom: "354 Бодомзор" },
  "666": { id: "666", name: "Бобурходжа Мухамедов", showroom: "354 Бодомзор" },
  "617": { id: "617", name: "Athamjon Nishonboyev", showroom: "381 Лабзак" },
  "9613": { id: "9613", name: "Aziz Maqsudov", showroom: "381 Лабzak" },
  "76": { id: "76", name: "Komoliddin Nosirov", showroom: "5 Сеул Байналминал" },
  "663": { id: "663", name: "Махмуд Якубов", showroom: "5 Сеул Байналминал" },
  "664": { id: "664", name: "Юлдуз", showroom: "5 Сеул Байналминал" },
  "1047": { id: "1047", name: "Durdona Bekmuhamedova", showroom: "5 Сеул Байналминал" },
  "1048": { id: "1048", name: "Диёра Шавкатова", showroom: "5 Сеул Байналминал" },
  "23": { id: "23", name: "Акбар Сайдалимов", showroom: "Akfa visitor" },
  "24": { id: "24", name: "Мухаммадвохид Закиров", showroom: "Akfa visitor" },
  "144": { id: "144", name: "Музаффар Норхужаев", showroom: "Akfa visitor" },
  "146": { id: "146", name: "Абдулла Файзиев", showroom: "Akfa visitor" },
  "149": { id: "149", name: "Avazbek Jomurodov", showroom: "Akfa visitor" },
  "152": { id: "152", name: "Аброржон Бурхонов", showroom: "Akfa visitor" },
  "153": { id: "153", name: "Javohir Abdurahmonov", showroom: "Akfa visitor" },
  "787": { id: "787", name: "Дилшоod Камариддинов", showroom: "Akfa visitor" },
  "789": { id: "789", name: "Nodir Djuraev", showroom: "Akfa visitor" },
  "810": { id: "810", name: "Равшан Савбянов", showroom: "Akfa visitor" },
  "950": { id: "950", name: "Миродил Мирхамидов", showroom: "Akfa visitor" },
  "2561": { id: "2561", name: "Бекзод Султонбоев", showroom: "Akfa visitor" },
  "4912": { id: "4912", name: "Islom To'raxanov", showroom: "Akfa visitor" },
  "160": { id: "160", name: "Nurilla Aripov", showroom: "Beshyog'och" },
  "161": { id: "161", name: "Шавкат Мухамедов", showroom: "Beshyog'och" },
  "162": { id: "162", name: "Яхё Жураев", showroom: "Beshyog'och" },
  "163": { id: "163", name: "Отабек Умаров", showroom: "Beshyog'och" },
  "166": { id: "166", name: "Санжар Хамраев", showroom: "Beshyog'och" },
  "169": { id: "169", name: "Iymonoy Yakubova", showroom: "Beshyog'och" },
  "170": { id: "170", name: "Mirqobil Axrorov", showroom: "Beshyog'och" },
  "254": { id: "254", name: "beshyogochshowroom", showroom: "Beshyog'och" },
  "2553": { id: "2553", name: "Рустам Якубов", showroom: "Beshyog'och" },
  "177": { id: "177", name: "Азиз Мирахмедов", showroom: "Jomiy" },
  "178": { id: "178", name: "Жасур Илхомов", showroom: "Jomiy" },
  "179": { id: "179", name: "Абдурахмон Шарипов", showroom: "Jomiy" },
  "180": { id: "180", name: "Аббос Анваров", showroom: "Jomiy" },
  "181": { id: "181", name: "Достон Яхшибоев", showroom: "Jomiy" },
  "182": { id: "182", name: "Хусниддин Тулаганов", showroom: "Jomiy" },
  "184": { id: "184", name: "Нодир Шоахмедов", showroom: "Jomiy" },
  "726": { id: "726", name: "Doniyor Ergashev", showroom: "Jomiy" },
  "2554": { id: "2554", name: "Ихтиёр Примкулов", showroom: "Jomiy" },
  "15": { id: "15", name: "Умид Хасанов", showroom: "Navoi" },
  "18": { id: "18", name: "Насириллохужаев Зиёдиллахужа", showroom: "Navoi" },
  "19": { id: "19", name: "Азиз Максудов", showroom: "Navoi" },
  "20": { id: "20", name: "Рано Камалова", showroom: "Navoi" },
  "21": { id: "21", name: "Диёра Абдурахмонова", showroom: "Navoi" },
  "22": { id: "22", name: "Акмал Зарипов", showroom: "Navoi" },
  "25": { id: "25", name: "Атхам Нишонбоев", showroom: "Navoi" },
  "788": { id: "788", name: "Maftuna Mirabdullayeva", showroom: "Navoi" },
  "2552": { id: "2552", name: "Абдухалил Атхамов", showroom: "Navoi" },
  "134": { id: "134", name: "Рухуллох Убайduллаев", showroom: "Oq-tepa" },
  "135": { id: "135", name: "Shoikrom Usmanov", showroom: "Oq-tepa" },
  "136": { id: "136", name: "oqtepa", showroom: "Oq-tepa" },
  "139": { id: "139", name: "Мухаммадюсуф Бахтиёров", showroom: "Oq-tepa" },
  "167": { id: "167", name: "Мумтоза Ботирова", showroom: "Oq-tepa" },
  "257": { id: "257", name: "Дилфуза Юсупова", showroom: "Oq-tepa" },
  "266": { id: "266", name: "User302", showroom: "Oq-tepa" },
  "538": { id: "538", name: "Мирзохид Мирқобилов", showroom: "Oq-tepa" },
  "2560": { id: "2560", name: "Bekzod Tojiboyev", showroom: "Oq-tepa" },
  "2676": { id: "2676", name: "Surayyo Kadirova", showroom: "Oq-tepa" },
  "198": { id: "198", name: "Дилшод Вахабов", showroom: "Qora-qamish" },
  "201": { id: "201", name: "Abduxamid G'ulomov", showroom: "Qora-qamish" },
  "202": { id: "202", name: "ДИЛНОЗА МАНСУРХАНОВА", showroom: "Qora-qamish" },
  "203": { id: "203", name: "Шерзод Асомов", showroom: "Qora-qamish" },
  "204": { id: "204", name: "Орифжон Гуломов", showroom: "Qora-qamish" },
  "205": { id: "205", name: "Рустам Юлдашев", showroom: "Qora-qamish" },
  "255": { id: "255", name: "manager QORAQAMISH showroom", showroom: "Qora-qamish" },
  "424": { id: "424", name: "Alisher Momindjanov", showroom: "Qora-qamish" },
  "1008": { id: "1008", name: "Rano Fozilova", showroom: "Qora-qamish" },
  "190": { id: "190", name: "Шухрат Юлдашев", showroom: "Qo'yliq" },
  "192": { id: "192", name: "Begzod Egamberdiyev", showroom: "Qo'yliq" },
  "193": { id: "193", name: "Раьно Сафаралиева", showroom: "Qo'yliq" },
  "194": { id: "194", name: "Зулайхо Абдукадирова", showroom: "Qo'yliq" },
  "195": { id: "195", name: "Элдор Анваров", showroom: "Qo'yliq" },
  "197": { id: "197", name: "Бахром Нишонов", showroom: "Qo'yliq" },
  "579": { id: "579", name: "Мирсадикова Шахризода", showroom: "Qo'yliq" },
  "2467": { id: "2467", name: "Nigina Absalomova", showroom: "Qo'yliq" },
  "2555": { id: "2555", name: "Ойбек Раҳимов", showroom: "Qo'yliq" },
  "2556": { id: "2556", name: "Фуркат Алимжанов", showroom: "Qo'yliq" },
  "2557": { id: "2557", name: "Мамур Искандаров", showroom: "Qo'yliq" },
  "2558": { id: "2558", name: "Дилмуrod Ядгаров", showroom: "Qo'yliq" },
  "199": { id: "199", name: "Сардор Нуриллайев", showroom: "Tinchlik" },
  "218": { id: "218", name: "Алишер Исматов", showroom: "Tinchlik" },
  "219": { id: "219", name: "Абдулло Олимов", showroom: "Tinchlik" },
  "223": { id: "223", name: "user", showroom: "Tinchlik" },
  "225": { id: "225", name: "Акмал Мухамеджанов", showroom: "Tinchlik" },
  "226": { id: "226", name: "Комолиддин Насриддинов", showroom: "Tinchlik" },
  "263": { id: "263", name: "Омина Абдурахимова", showroom: "Tinchlik" },
  "580": { id: "580", name: "Odila Jumanazarova", showroom: "Tinchlik" },
  "7003": { id: "7003", name: "Olimxo'ja Agzamxodjayev", showroom: "Tinchlik" },
  "865": { id: "865", name: "Бахтиёр Орипов", showroom: "256 Жиззах" },
  "866": { id: "866", name: "Диёр Хужабеков", showroom: "256 Жиззах" },
  "867": { id: "867", name: "Ирода Бердиева", showroom: "256 Жиззах" },
  "868": { id: "868", name: "Гулнора Бобокулова", showroom: "256 Жиззах" },
  "869": { id: "869", name: "Saboxat Malikova", showroom: "256/4 Зомин" },
  "4102": { id: "4102", name: "Mehroj Odilov", showroom: "256/2 Жиззах" },
  "1018": { id: "1018", name: "Islom Muxammadjonov", showroom: "274 Сирдарё" },

  // VILOYAT CATEGORY (REGIONS)
  "311": { id: "311", name: "Abdurasul Abdurahmonov", showroom: "382-Shahrixon" },
  "326": { id: "326", name: "Nigora Qoraboyeva", showroom: "382-Shahrixon" },
  "792": { id: "792", name: "Jo'rabek Xalimov", showroom: "382-Shahrixon" },
  "444": { id: "444", name: "Мухиддин Пардадинов", showroom: "700/6 Asaka" },
  "328": { id: "328", name: "Yoqubjon Yoqubov", showroom: "714 Qo'rg'ontepa" },
  "728": { id: "728", name: "Azizbek Sayidaliyev", showroom: "714 Qo'rg'ontepa" },
  "769": { id: "769", name: "Qobiljon Tashlanboev", showroom: "714 Qo'rg'ontepa" },
  "322": { id: "322", name: "Ibrohim Obidov", showroom: "Андижон гость" },
  "1442": { id: "1442", name: "Азизбек Битбеков", showroom: "Андижон гость" },
  "278": { id: "278", name: "SARDOR SADIKOV", showroom: "Франчайзинг Showroom official" },
  "280": { id: "280", name: "Фарходбек Мирсаидов", showroom: "Франчайзинг Showroom official" },
  "282": { id: "282", name: "Nigora Qodirova", showroom: "Франчайзинг Showroom official" },
  "283": { id: "283", name: "Aziza Kabirova", showroom: "Франчайзинг Showroom official" },
  "309": { id: "309", name: "Мухаммадсодик Тошпулатов", showroom: "Франчайзинг Showroom official" },
  "636": { id: "636", name: "Azizbek Kuchkarov", showroom: "Франчайзинг Showroom official" },
  "2473": { id: "2473", name: "Alisher Jalolov", showroom: "Франчайзинг Showroom official" },
  "2474": { id: "2474", name: "Islombek Usmonov", showroom: "Франчайзинг Showroom official" },
  "678": { id: "678", name: "Asadbek Shoimov", showroom: "366-Buxoro" },
  "682": { id: "682", name: "Jaloliddin Jahonov", showroom: "366-Buxoro" },
  "685": { id: "685", name: "Shaxzod Pulatov", showroom: "366-Buxoro" },
  "756": { id: "756", name: "Nodir Saidov", showroom: "710/4 Buxoro" },
  "693": { id: "693", name: "Илёс Косимов", showroom: "270 шоу-рум" },
  "695": { id: "695", name: "Мирфайз Илёс угли Тешаев", showroom: "270 шоу-рум" },
  "679": { id: "679", name: "Iskandar Olimov", showroom: "Бухара официальный шоурум" },
  "680": { id: "680", name: "Nodirbek Safarov", showroom: "Бухара официальный шоурум" },
  "681": { id: "681", name: "Nodirbek Safarov", showroom: "Бухара официальный шоурум" },
  "452": { id: "452", name: "Abdumalik Sultonov", showroom: "251 Фаргона" },
  "871": { id: "871", name: "Богдан Устюжин", showroom: "251 Фаргона" },
  "872": { id: "872", name: "Xamidjon Ishkulov", showroom: "251 Фаргона" },
  "873": { id: "873", name: "Xolida Sultonova", showroom: "251 Фаргона" },
  "1595": { id: "1595", name: "To'lqinjon", showroom: "251 Фаргона" },
  "8457": { id: "8457", name: "Farruh Mo'ydinov", showroom: "251/3 Фаргона" },
  "957": { id: "957", name: "Shamsiddin Musayev", showroom: "251/4 Риштон" },
  "437": { id: "437", name: "Дилором Мухиддинова", showroom: "243_11 Промзона Хамкор" },
  "459": { id: "459", name: "Муҳаммадбобур Казакбаев", showroom: "243_11 Промзона Хамкор" },
  "795": { id: "795", name: "Anvarjon Nugmanov", showroom: "243_11 Промзона Хамкор" },
  "431": { id: "431", name: "Содиржон Қаюмов", showroom: "243 Шоу-рум Наманган" },
  "432": { id: "432", name: "Алишер Садиков", showroom: "243 Шоу-рум Наманган" },
  "433": { id: "433", name: "Жалолиддин Абдуллажонов", showroom: "243 Шоу-рум Наманган" },
  "434": { id: "434", name: "Нозим Азимов", showroom: "243 Шоу-рум Наманган" },
  "435": { id: "435", name: "Улуғбек Қаххаров", showroom: "243 Шоу-рум Наманган" },
  "436": { id: "436", name: "Dilorom Muhiddinova", showroom: "243 Шоу-рум Наманган" },
  "438": { id: "438", name: "Аъзамжон Дадаханов", showroom: "243 Шоу-рум Наманган" },
  "460": { id: "460", name: "Хусанбой Мамадалиев", showroom: "243_10 Косонсой Хамкор" },
  "2669": { id: "2669", name: "Осимхон Махмудов", showroom: "243_10 Косонсой Хамкор" },
  "430": { id: "430", name: "Suxrob Abdullayev", showroom: "243_13 Хамкор Гўзал" },
  "2452": { id: "2452", name: "Mirzohid Ismailov", showroom: "243_13 Хамкор Гўзал" },
  "7084": { id: "7084", name: "Azizbek Abdullayev", showroom: "243_13 Хамкор Гўзал" },
  "451": { id: "451", name: "Jasur Hojiakbarov", showroom: "243_3 Хамкор Тошбулоқ" },
  "453": { id: "453", name: "Marina Islomova", showroom: "243_3 Хамкор Тошбулоқ" },
  "455": { id: "455", name: "Абдулатиф Шарипов", showroom: "243_4 Хамкор Бoburshoх" },
  "457": { id: "457", name: "Насибахон Тухтакулова", showroom: "243_4 Хамкор Бoburshoх" },
  "458": { id: "458", name: "Muhammad Lutfullaev", showroom: "243_4 Хамкор Бoburshoх" },
  "796": { id: "796", name: "Ahmadjon Abdurahmonov", showroom: "243_4 Хамкор Бoburshoх" },
  "831": { id: "831", name: "Erkinjon Umarov", showroom: "243_5" },
  "832": { id: "832", name: "Azizjon Olimjonov", showroom: "243_5" },
  "833": { id: "833", name: "Iroda Ahmataliyeva", showroom: "243_5" },
  "456": { id: "456", name: "Мубашшир Садиков", showroom: "243_6 Хамкор Дўстлик" },
  "461": { id: "461", name: "Hakimova Go'zal", showroom: "243_6 Хамкор Дўстлик" },
  "462": { id: "462", name: "Жавохир Гафуржанов", showroom: "243_7 Хамкор Чуст" },
  "463": { id: "463", name: "Эрkinжон Умаров", showroom: "243_7 Хамкор Чуст" },
  "464": { id: "464", name: "Сетора Абдурахимова", showroom: "243_7 Хамкор Чуст" },
  "465": { id: "465", name: "Иброҳим Шерматов", showroom: "243_7 Хамкор Чуст" },
  "466": { id: "466", name: "Камолиддин Боқиев", showroom: "243_8 Хамкор Учқўрғон" },
  "746": { id: "746", name: "Ibrohim Ergashev", showroom: "243_8 Хамкор Учқўрғон" },
  "747": { id: "747", name: "Zarnigor Ergasheva", showroom: "243_8 Хамкор Учқўрғон" },
  "471": { id: "471", name: "Шокирбек Муқимов", showroom: "243_9 Хамкор Янгиариқ" },
  "473": { id: "473", name: "Мирзохид Акбаралиев", showroom: "243_9 Хамкор Янгиариқ" },
  "474": { id: "474", name: "Муаттар Абдукаримова", showroom: "243_9 Хамкор Янгиариқ" },
  "477": { id: "477", name: "Аброр Каримов", showroom: "297 / 1 Хамкор" },
  "478": { id: "478", name: "Хасанбой Муродуллаев", showroom: "297 / 1 Хамкор" },
  "479": { id: "479", name: "Ruxshona Valijanova", showroom: "297 / 1 Хамкор" },
  "439": { id: "439", name: "Давронбек Исмаилов", showroom: "297 Шоу-рум Наманган" },
  "440": { id: "440", name: "Бахтиёр Исмаилов", showroom: "297 Шоу-рум Наманган" },
  "441": { id: "441", name: "Абдулазиз Исмаилов", showroom: "297 Шоу-рум Наманган" },
  "442": { id: "442", name: "Муҳаммадхон Қодиров", showroom: "297 Шоу-рум Наманган" },
  "443": { id: "443", name: "Юлдузхон Джурабаева", showroom: "297 Шоу-рум Наманган" },
  "581": { id: "581", name: "Гулчехра Исмоилова", showroom: "Навоий 254 отдел" },
  "583": { id: "583", name: "Bayram Manzilov", showroom: "Навоий 254 отдел" },
  "584": { id: "584", name: "Moxinur Sayfullayeva", showroom: "Навоий 254 отдел" },
  "585": { id: "585", name: "Dilfuza Ergasheva", showroom: "Навоий 254 отдел" },
  "586": { id: "586", name: "Gulom Yadgarov", showroom: "Навоий 254 отдел" },
  "828": { id: "828", name: "Иван Шафир", showroom: "Навоий 254 отдел" },
  "876": { id: "876", name: "Akmal Ikromov", showroom: "Навоий 254 отдел" },
  "877": { id: "877", name: "Nilufarxon G`afurova", showroom: "Навоий 254 отдел" },
  "878": { id: "878", name: "G'anisher Vohidov", showroom: "Навоий 254 отдел" },
  "879": { id: "879", name: "MAXLIYO MIRZKULOVA", showroom: "Навоий 254 отдел" },
  "898": { id: "898", name: "Feruz Karimov", showroom: "Навоий 254 отдел" },
  "582": { id: "582", name: "Jamol Bobonazarov", showroom: "254_4 отдель" },
  "892": { id: "892", name: "Zebo Nematullayeva", showroom: "254_4 отдель" },
  "293": { id: "293", name: "Kamol Olimov", showroom: "372-Новои" },
  "295": { id: "295", name: "Nizomiddin Turdiev", showroom: "710/3 Xatirchi" },
  "551": { id: "551", name: "Мирвали Азамов", showroom: "010 Шоу-рум Nukus" },
  "552": { id: "552", name: "Зийуар Усенова", showroom: "010 Шоу-рум Nukus" },
  "553": { id: "553", name: "Resepshn", showroom: "010 Шоу-рум Nukus" },
  "554": { id: "554", name: "Саламат Уразшаев", showroom: "010 Шоу-рум Nukus" },
  "578": { id: "578", name: "Baxtigul Jienbaeva", showroom: "010 Шоу-рум Nukus" },
  "1260": { id: "1260", name: "Lobar Matkarimova", showroom: "010 Шоу-рум Nukus" },
  "1639": { id: "1639", name: "Anvar Yo'ldoshev", showroom: "010 Шоу-рум Nukus" },
  "1829": { id: "1829", name: "Зийуар Нажимова", showroom: "010 Шоу-рум Nukus" },
  "467": { id: "467", name: "Gulbaxit Koshkinbaeva", showroom: "380 Шоу-рум Nukus" },
  "850": { id: "850", name: "Mansur Muzaffarov", showroom: "249 Карши" },
  "851": { id: "851", name: "Farruh Buriyev", showroom: "249 Карши" },
  "852": { id: "852", name: "Musoxon Tursunov", showroom: "249 Карши" },
  "854": { id: "854", name: "Murod Xayrullayev", showroom: "249 Карши" },
  "691": { id: "691", name: "Javohir Turdiyev", showroom: "283/2 Карши" },
  "834": { id: "834", name: "Javohir Temirov", showroom: "283/2 Карши" },
  "848": { id: "848", name: "Ruslan Normurodov", showroom: "283/2 Карши" },
  "849": { id: "849", name: "Нурбек Рузиев", showroom: "283/2 Карши" },
  "874": { id: "874", name: "Abdulla Mirzayev", showroom: "244 Кокон" },
  "357": { id: "357", name: "Zafar Meliboyev", showroom: "217 Шоу-рум Cамарканд" },
  "358": { id: "358", name: "Шомуродова Ситора Шомуродова", showroom: "217 Шоу-рум Cамарканд" },
  "370": { id: "370", name: "Сабина Ахтамова", showroom: "241 Шоу-рум Самарканд" },
  "371": { id: "371", name: "Aziza Nortayeva", showroom: "241 Шоу-рум Самарканд" },
  "375": { id: "375", name: "Фаррух Рахманов", showroom: "241 Шоу-рум Самарканд" },
  "341": { id: "341", name: "Nigora Adashbayeva", showroom: "245 Самарканд" },
  "344": { id: "344", name: "245 Ресепшен", showroom: "245 Самарканд" },
  "345": { id: "345", name: "finans showroom245", showroom: "245 Самарканд" },
  "376": { id: "376", name: "Azizbek Toxirov", showroom: "245 Самарканд" },
  "391": { id: "391", name: "Yunusov Munisxon", showroom: "245 Самарканд" },
  "689": { id: "689", name: "Sanjar Karimov", showroom: "245 Самарканд" },
  "661": { id: "661", name: "Shaxriyor Davronov", showroom: "245/5 Самарканд" },
  "725": { id: "725", name: "Sharif Sattorov", showroom: "245/5 Самарканд" },
  "366": { id: "366", name: "Дамир Ахроров", showroom: "277 Шоу-рум Самарканд" },
  "367": { id: "367", name: "Ёкубжон Эгамбердиев", showroom: "277 Шоу-рум Самарканд" },
  "1608": { id: "1608", name: "Anvarjon Najmiddinov", showroom: "277 Шоу-рум Самарканд" },
  "2475": { id: "2475", name: "Назаров Акмал", showroom: "277 Шоу-рум Самарканд" },
  "291": { id: "291", name: "Амирбек Шамсиддинов", showroom: "309 Шоу-рум Самарканд" },
  "846": { id: "846", name: "Ezoza Po'latova", showroom: "283 Шахрисабз" },
  "847": { id: "847", name: "Мухаммад Муртазоев", showroom: "283 Шахрисабз" },
  "875": { id: "875", name: "Diyorbek Ro'ziyev", showroom: "283 Шахрисабз" },
  "2468": { id: "2468", name: "Шерали Ёров", showroom: "283 Шахрисабз" },
  "841": { id: "841", name: "Шавкат Нормуминов", showroom: "262 Денов" },
  "843": { id: "843", name: "Сарвар Абдухоликов", showroom: "262 Денов" },
  "844": { id: "844", name: "Анвар Мирзаев", showroom: "262 Денов" },
  "864": { id: "864", name: "Sevara Xaqnazarova", showroom: "262 Денов" },
  "1320": { id: "1320", name: "Abdunazarova.R", showroom: "262 Денов" },
  "1680": { id: "1680", name: "Yusuf Toshboev", showroom: "262 Денов" },
  "1681": { id: "1681", name: "Абдуназар Жураев", showroom: "262 Денов" },
  "1682": { id: "1682", name: "Шахриёр Хабибуллаев", showroom: "262 Денов" },
  "882": { id: "882", name: "Marjona Xurramova", showroom: "262/5" },
  "1724": { id: "1724", name: "Kamoliddin Quvatov", showroom: "262/5" },
  "1725": { id: "1725", name: "Дилноза Хужаназарова", showroom: "262/5" },
  "881": { id: "881", name: "Akram Xusanov", showroom: "262/5, 358 Термиз" },
  "808": { id: "808", name: "Orif Sattorov", showroom: "262/6" },
  "883": { id: "883", name: "Jasur Xolboyev", showroom: "262/6" },
  "884": { id: "884", name: "Samandar Mamarajabov", showroom: "262/6" },
  "826": { id: "826", name: "Bahrom Nazarov", showroom: "262/7" },
  "880": { id: "880", name: "Saodat Begmatova", showroom: "262/7" },
  "382": { id: "382", name: "Фаррух Исожонов", showroom: "262/9" },
  "697": { id: "697", name: "Шахзод Жабборов", showroom: "262/9" },
  "842": { id: "842", name: "Adham Sattorov", showroom: "262/9" },
  "855": { id: "855", name: "Elyor Uljayev", showroom: "262/9" },
  "1659": { id: "1659", name: "Arslan Mirzayev", showroom: "262/9" },
  "1722": { id: "1722", name: "Одил Джумаев", showroom: "262/9" },
  "1723": { id: "1723", name: "Бахтиёр Ниёзов", showroom: "262/9" },
  "823": { id: "823", name: "Malika Xolmirzaeva", showroom: "303 Термиз" },
  "824": { id: "824", name: "Madina Doniyorova", showroom: "303 Термиз" },
  "825": { id: "825", name: "Dilshoda Fayzieva", showroom: "303 Термиз" },
  "839": { id: "839", name: "Шухрат Нормуминов", showroom: "303 Термиз" },
  "1020": { id: "1020", name: "Shaxzod Normurodov", showroom: "303 Термиз" },
  "1021": { id: "1021", name: "Sheraliyev Doniyor", showroom: "303 Термиз" },
  "1022": { id: "1022", name: "Nuriddin Xasanov", showroom: "303 Термиз" },
  "1726": { id: "1726", name: "Sharofiddin Karimov", showroom: "303 Термиз" },
  "1727": { id: "1727", name: "Bobur Iskandarov", showroom: "303 Термиз" },
  "1728": { id: "1728", name: "Ahmad Shopo'latov", showroom: "303 Термиз" },
  "829": { id: "829", name: "Doʻstmuhammad Xoʻjanazarov", showroom: "358 Термиз" },
  "835": { id: "835", name: "Jahongir Ro'ziyev", showroom: "358 Термиз" },
  "837": { id: "837", name: "Guliruxsor Shaymardonova", showroom: "358 Термиз" },
  "838": { id: "838", name: "Dildora Hayitmurodova", showroom: "358 Термиз" },
  "853": { id: "853", name: "Норбек Намозов", showroom: "358 Термиз" },
  "566": { id: "566", name: "Гулнора Кенжаева", showroom: "267 Шоу-рум Тошбулок" },
  "567": { id: "567", name: "Fotima Ahmedova", showroom: "267 Шоу-рум Тошбулок" },
  "574": { id: "574", name: "Навруз Мадаминов", showroom: "267 Шоу-рум Тошбулок" },
  "576": { id: "576", name: "Жохонгир Худайберганов", showroom: "267 Шоу-рум Тошбулок" },
  "373": { id: "373", name: "Dilnavoz Erkinova", showroom: "374-Отдел Urganch" },
  "429": { id: "429", name: "Maftuna Komiljonova", showroom: "374-Отдел Urganch" },
  "476": { id: "476", name: "Quronboy Otaxonov", showroom: "374-Отдел Urganch" },
  "369": { id: "369", name: "Doston Salayev", showroom: "375-Отдел Urganch" },
  "394": { id: "394", name: "Mohfira Qazaqova", showroom: "375-Отдел Urganch" },
  "575": { id: "575", name: "Maxliyo Sodiqjonova", showroom: "375-Отдел Urganch" },
  "748": { id: "748", name: "Donoxon Abdullayeva", showroom: "375-Отдел Urganch" },
  "536": { id: "536", name: "Mexrinoz G'oyibnazarova", showroom: "378-Отдел Хива" },
  "809": { id: "809", name: "Hilola Qurbonbayeva", showroom: "378-Отдел Хива" },
  "475": { id: "475", name: "Hurmat Sapayev", showroom: "255 Шоу-рум Xorazm" },
  "520": { id: "520", name: "Aziza Sapayeva", showroom: "255 Шоу-рум Xorazm" },
  "555": { id: "555", name: "Зокиржон Ибадуллаев", showroom: "255 Шоу-рум Xorazm" },
  "556": { id: "556", name: "Nafisa Ochilova", showroom: "255 Шоу-рум Xorazm" },
  "558": { id: "558", name: "Дилшод Бабадинов", showroom: "255 Шоу-рум Xorazm" },
  "560": { id: "560", name: "Тимур Рузметов", showroom: "255 Шоу-рум Xorazm" },
  "573": { id: "573", name: "Marjona Sapayeva", showroom: "255 Шоу-рум Xorazm" },
  "696": { id: "696", name: "Baxtiyorov Temur", showroom: "255 Шоу-рум Xorazm" },
  "557": { id: "557", name: "Сарвар Худайназаров", showroom: "255/1 Шоу-рум Xorazm" },
  "384": { id: "384", name: "Jumaniyozov Otabek", showroom: "259 Шоу-рум Xorazm" },
  "561": { id: "561", name: "Мухаммад Абдурахмонов", showroom: "259 Шоу-рум Xorazm" },
  "562": { id: "562", name: "Oybek Yo'ldoshev", showroom: "259 Шоу-рум Xorazm" },
  "653": { id: "653", name: "Nodir Avezov", showroom: "259 Шоу-рум Xorazm" },
  "655": { id: "655", name: "Nodir Avezov", showroom: "259 Шоу-рум Xorazm" },
  "836": { id: "836", name: "Quronboy Sobirov", showroom: "259 Шоу-рум Xorazm" },
  "565": { id: "565", name: "Искандар Саduллаев", showroom: "275 Шоу-рум Xorazm" },
  "568": { id: "568", name: "Юлдузхан Рахимова", showroom: "275 Шоу-рум Xorazm" },
  "569": { id: "569", name: "Якуб Матякубов", showroom: "275 Шоу-рум Xorazm" },
  "570": { id: "570", name: "Бобур Куранбоев", showroom: "275 Шоу-рум Xorazm" },
  "571": { id: "571", name: "Умрбек Рахманов", showroom: "275 Шоу-рум Xorazm" },
  "572": { id: "572", name: "Шокир Абдурахмонов", showroom: "275 Шоу-рум Xorazm" }
};

export interface OrderItem {
  id: string;
  dealId: string;
  clientName: string;
  phone: string;
  showroom: string;
  manager: string;
  productName: string;
  colorName: string;
  areaSqm: number;
  quantity: number;
  stageName: string;
  qualityEngineer: string;
  warrantyPeriod: string;
  factoryDate: string;
  estimatedReadyDate: string;
  status: string;
  smsPin: string;
  smsStatus: string;
  rawStageId?: string;
  dateCreate?: string;
  contactId?: string;
}

export interface FetchOrdersResult {
  success: boolean;
  orders: OrderItem[];
  total: number;
  error?: string;
}

/**
 * Bitrix deal ma'lumotlaridan Showroom nomini va Menejer ismini aniq ajratib olish.
 */
export const resolveShowroomName = (deal: Record<string, any>): string => {
  const s = BITRIX_FIELDS.SHOWROOMS;

  // Showroom ID kelganda lug'atdan nomini qidirish
  const getDictOrVal = (rawVal: any): string | null => {
    if (!rawVal) return null;
    const id = Array.isArray(rawVal) ? rawVal[0] : rawVal;
    
    if (SHOWROOMS_DICT[id]) {
      return SHOWROOMS_DICT[id];
    }
    
    const strVal = String(rawVal).trim();
    if (strVal && strVal !== 'null' && strVal !== 'undefined') {
      return strVal;
    }
    
    return null;
  };

  // 1. Bitrix Custom Fieldlar bo'yicha tekshirish
  const showroomFromField = 
    getDictOrVal(deal[s.SAMARKAND]) ||
    getDictOrVal(deal[s.TOSHKENT]) ||
    getDictOrVal(deal[s.FERGANA]) ||
    getDictOrVal(deal[s.ANDIJAN]) ||
    getDictOrVal(deal[s.NAMANGAN]) ||
    getDictOrVal(deal[s.NUKUS]) ||
    getDictOrVal(deal[s.BUKHARA]) ||
    getDictOrVal(deal[s.SURKHANDARYA]) ||
    getDictOrVal(deal[s.KHOREZM]);

  if (showroomFromField) {
    return showroomFromField;
  }

  // 2. Gar fieldlar bo'sh bo'lsa, menejer ID si orqali aniqlash
  const rawManagerId = deal[BITRIX_FIELDS.RESPONSIBLE_MANAGER] || deal.ASSIGNED_BY_ID || '';
  const managerId = String(rawManagerId).trim();

  if (managerId && MANAGERS_DICT[managerId]?.showroom) {
    return MANAGERS_DICT[managerId].showroom!;
  }

  // 3. Agar hech bir joydan topilmasa
  return "Noma'lum Showroom";
};

/**
 * Bitrix deal ob'ektini frontend uchun tayyor Order ob'ektiga o'tkazish
 */
export const convertBitrixDealToOrder = (deal: Record<string, any>): OrderItem => {
  const rawProduct = deal[BITRIX_FIELDS.PRODUCT_SERIES];
  const productId = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
  const productName = PRODUCTS_DICT[productId] || String(rawProduct || "Standart Protsess");

  const rawColor = deal[BITRIX_FIELDS.COLOR];
  const colorId = Array.isArray(rawColor) ? rawColor[0] : rawColor;
  const colorName = COLORS_DICT[colorId] || String(rawColor || "Standart Rang");

  const stageId = deal.STAGE_ID || "";
  const stageName = STAGE_NAMES[stageId] || "Ishlab chiqarishda";

  // Menejer ID si bo'yicha ismini MANAGERS_DICT lug'atidan izlash
  const rawManagerId = deal[BITRIX_FIELDS.RESPONSIBLE_MANAGER] || deal.ASSIGNED_BY_ID || '';
  const managerId = String(rawManagerId).trim();
  const managerName = MANAGERS_DICT[managerId]?.name || deal.ASSIGNED_BY_NAME || "Menejer belgilanmagan";

  const okkManager = deal[BITRIX_FIELDS.OKK_MANAGER] || "Alisher Rustamov (Bosh OKK)";

  return {
    id: deal.ID || "",
    dealId: deal[BITRIX_FIELDS.ORDER_INVOICE_ID] || deal.ID || "",
    clientName: deal.TITLE || "Mijoz ko'rsatilmagan",
    phone: deal.HAS_PHONE === "Y" ? deal.PHONE : "-",
    showroom: resolveShowroomName(deal),
    manager: managerName,
    productName: productName,
    colorName: colorName,
    areaSqm: Number(deal[BITRIX_FIELDS.AREA_SQM]) || 0,
    quantity: 1,
    stageName: stageName,
    qualityEngineer: okkManager,
    warrantyPeriod: "60 Oy (5 Yil)",
    factoryDate: formatBitrixDate(deal[BITRIX_FIELDS.FACTORY_DATE]),
    estimatedReadyDate: formatBitrixDate(deal[BITRIX_FIELDS.ESTIMATED_READY_DATE]),
    status: "Ishlab chiqarilmoqda",
    smsPin: deal[BITRIX_FIELDS.SPECIAL_CODE] || "-",
    smsStatus: "Kutilmoqda",
    rawStageId: stageId,
    dateCreate: deal.DATE_CREATE || "",
    contactId: deal.CONTACT_ID || ""
  };
};

/**
 * Bitrix24 so'rovlari uchun tanlanadigan maydonlar ro'yxati
 */
export const BITRIX_SELECT_FIELDS = [
  "ID", 
  "TITLE", 
  "STAGE_ID", 
  "DATE_CREATE", 
  "OPPORTUNITY", 
  "ASSIGNED_BY_ID", 
  "ASSIGNED_BY_NAME",
  BITRIX_FIELDS.ORDER_INVOICE_ID,
  BITRIX_FIELDS.PRODUCT_SERIES,
  BITRIX_FIELDS.COLOR,
  BITRIX_FIELDS.AREA_SQM,
  BITRIX_FIELDS.FACTORY_DATE,
  BITRIX_FIELDS.ESTIMATED_READY_DATE,
  BITRIX_FIELDS.READY_TO_PROD_DATE,
  BITRIX_FIELDS.ORDER_READY_DATE,
  BITRIX_FIELDS.RESPONSIBLE_MANAGER,
  BITRIX_FIELDS.OKK_MANAGER,
  BITRIX_FIELDS.SPECIAL_CODE,
  BITRIX_FIELDS.SHOWROOMS.TOSHKENT,
  BITRIX_FIELDS.SHOWROOMS.FERGANA,
  BITRIX_FIELDS.SHOWROOMS.ANDIJAN,
  BITRIX_FIELDS.SHOWROOMS.SAMARKAND,
  BITRIX_FIELDS.SHOWROOMS.NAMANGAN,
  BITRIX_FIELDS.SHOWROOMS.NUKUS,
  BITRIX_FIELDS.SHOWROOMS.BUKHARA,
  BITRIX_FIELDS.SHOWROOMS.SURKHANDARYA,
  BITRIX_FIELDS.SHOWROOMS.KHOREZM,
  "CONTACT_ID"
];

/**
 * REST API yordamida Bitrix24 ga so'rov yuborish uchun universal helper
 */
async function callBitrixMethod(webhookUrl: string, method: string, params: Record<string, any> = {}): Promise<any> {
  const cleanUrl = webhookUrl.replace(/\/$/, "");
  const endpoint = `${cleanUrl}/${method}.json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP xatolik! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Bitrix API xatosi: ${data.error_description || data.error}`);
    }

    return data;
  } catch (err: any) {
    console.error(`callBitrixMethod [${method}] xatosi:`, err);
    throw err;
  }
}

/**
 * So'nggi bitimlarni ro'yxat bo'yicha yuklab olish
 */
export const fetchBitrixRecentDeals = async (webhookUrl: string, limit: number = 50): Promise<OrderItem[]> => {
  try {
    const data = await callBitrixMethod(webhookUrl, "crm.deal.list", {
      order: { "DATE_CREATE": "DESC" },
      select: BITRIX_SELECT_FIELDS,
      start: 0
    });

    if (!data.result || !Array.isArray(data.result)) {
      return [];
    }

    return data.result.slice(0, limit).map((deal: Record<string, any>) => convertBitrixDealToOrder(deal));
  } catch (error) {
    console.error("Bitrix24 so'nggi bitimlarni yuklashda xatolik:", error);
    return [];
  }
};

/**
 * PIN kod (SMS PIN) yoki Schet raqami bo'yicha bitimni qidirish
 */
export const fetchBitrixOrderByPin = async (
  webhookUrl: string, 
  pinCode: string
): Promise<OrderItem | null> => {
  if (!pinCode || !pinCode.trim()) return null;

  try {
    const cleanPin = pinCode.trim();

    // 1. Maxsus kodi (PIN) bo'yicha qidiruv
    let data = await callBitrixMethod(webhookUrl, "crm.deal.list", {
      filter: { [BITRIX_FIELDS.SPECIAL_CODE]: cleanPin },
      select: BITRIX_SELECT_FIELDS
    });

    if (data.result && data.result.length > 0) {
      return convertBitrixDealToOrder(data.result[0]);
    }

    // 2. ID заказа (Schet №) bo'yicha qidiruv
    data = await callBitrixMethod(webhookUrl, "crm.deal.list", {
      filter: { [BITRIX_FIELDS.ORDER_INVOICE_ID]: cleanPin },
      select: BITRIX_SELECT_FIELDS
    });

    if (data.result && data.result.length > 0) {
      return convertBitrixDealToOrder(data.result[0]);
    }

    // 3. Bitrix Deal ID si bo'yicha qidiruv
    if (!isNaN(Number(cleanPin))) {
      data = await callBitrixMethod(webhookUrl, "crm.deal.get", {
        id: cleanPin
      });

      if (data.result) {
        return convertBitrixDealToOrder(data.result);
      }
    }

    return null;
  } catch (error) {
    console.error("PIN kodi bo'yicha qidiruvda xatolik:", error);
    return null;
  }
};

/**
 * Mijozning telefon raqami yoki Logini orqali barcha buyurtmalarini olish
 */
export const fetchBitrixCustomerOrdersByCredentials = async (
  webhookUrl: string,
  loginOrPhone: string
): Promise<FetchOrdersResult> => {
  if (!loginOrPhone || !loginOrPhone.trim()) {
    return { success: false, orders: [], total: 0, error: "Qidiruv parametri kiritilmadi" };
  }

  try {
    const cleanQuery = loginOrPhone.trim();

    // SMS PIN / Schet № orqali izlash
    const singleOrder = await fetchBitrixOrderByPin(webhookUrl, cleanQuery);
    if (singleOrder) {
      return { success: true, orders: [singleOrder], total: 1 };
    }

    // Telefon raqami bo'yicha kontaktlarni izlash
    const cleanPhone = cleanQuery.replace(/\D/g, "");
    let contactIds: string[] = [];

    if (cleanPhone.length >= 7) {
      const contactData = await callBitrixMethod(webhookUrl, "crm.contact.list", {
        filter: { "%PHONE": cleanPhone },
        select: ["ID", "NAME", "LAST_NAME", "PHONE"]
      });

      if (contactData.result && contactData.result.length > 0) {
        contactIds = contactData.result.map((c: any) => c.ID);
      }
    }

    // Kontaktlar bo'yicha bitimlarni izlash
    if (contactIds.length > 0) {
      const dealsData = await callBitrixMethod(webhookUrl, "crm.deal.list", {
        filter: { "=CONTACT_ID": contactIds },
        order: { "DATE_CREATE": "DESC" },
        select: BITRIX_SELECT_FIELDS
      });

      if (dealsData.result && dealsData.result.length > 0) {
        const orders = dealsData.result.map((deal: Record<string, any>) => convertBitrixDealToOrder(deal));
        return { success: true, orders, total: orders.length };
      }
    }

    return { success: true, orders: [], total: 0 };
  } catch (error: any) {
    console.error("Mijoz buyurtmalarini olishda xatolik:", error);
    return { 
      success: false, 
      orders: [], 
      total: 0, 
      error: error.message || "Server bilan bog'lanishda xatolik yuz berdi" 
    };
  }
};

/**
 * Bitim bosqichini (Stage ID) yangilash funksiyasi
 */
export const updateBitrixDealStage = async (
  webhookUrl: string, 
  dealId: string, 
  stageId: string
): Promise<boolean> => {
  try {
    const data = await callBitrixMethod(webhookUrl, "crm.deal.update", {
      id: dealId,
      fields: {
        STAGE_ID: stageId
      }
    });

    return !!data.result;
  } catch (error) {
    console.error(`Bitim [${dealId}] bosqichini yangilashda xatolik:`, error);
    return false;
  }
};

/**
 * Sifat nazoratidan o'tganligini tasdiqlash va SMS yaratish
 */
export const confirmQualityCheckAndSendSms = async (
  webhookUrl: string,
  dealId: string,
  customMessage?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const dealData = await callBitrixMethod(webhookUrl, "crm.deal.get", { id: dealId });
    if (!dealData.result) {
      return { success: false, message: "Bitim topilmadi" };
    }

    const deal = dealData.result;
    const currentStage = deal.STAGE_ID || "";
    
    let newStage = currentStage;
    if (currentStage.includes(":")) {
      const prefix = currentStage.split(":")[0];
      newStage = `${prefix}:WON`;
    } else {
      newStage = "WON";
    }

    const updated = await updateBitrixDealStage(webhookUrl, dealId, newStage);

    if (updated) {
      return { 
        success: true, 
        message: customMessage || "Sifat nazorati muvaffaqiyatli tasdiqlandi hamda SMS SMS-markazga yuborildi." 
      };
    } else {
      return { success: false, message: "Bitim statusini yangilab bo'lmadi" };
    }
  } catch (error: any) {
    console.error("Sifat nazoratini tasdiqlashda xatolik:", error);
    return { success: false, message: error.message || "Tizim xatoligi yuz berdi" };
  }
};
