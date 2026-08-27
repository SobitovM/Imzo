import { Order, OrderStatus, ProductItem } from '../types';
import { 
  PRODUCTS_DICT, 
  COLORS_DICT, 
  SHOWROOMS_DICT,
  STAGE_NAMES, 
  BITRIX_FIELDS, 
  formatBitrixDate 
} from './bitrixConfig';

const BITRIX_WEBHOOK_KEY = 'bitrix_webhook_url';
const BITRIX_AUTO_SYNC_KEY = 'bitrix_auto_sync_enabled';

export const DEFAULT_BITRIX_WEBHOOK = 'https://bitrix.imzo.uz/rest/244/lhfi8leh3yqxl3sc/';

export const getBitrixWebhookUrl = (): string => {
  return localStorage.getItem(BITRIX_WEBHOOK_KEY) || DEFAULT_BITRIX_WEBHOOK;
};

export const setBitrixWebhookUrl = (url: string) => {
  const clean = (url || '').trim().replace(/\/+$/, '') + '/';
  localStorage.setItem(BITRIX_WEBHOOK_KEY, clean);
  window.dispatchEvent(new Event('bitrix_config_updated'));
};

export const getBitrixAutoSync = (): boolean => {
  return localStorage.getItem(BITRIX_AUTO_SYNC_KEY) === 'true';
};

export const setBitrixAutoSync = (enabled: boolean) => {
  localStorage.setItem(BITRIX_AUTO_SYNC_KEY, enabled ? 'true' : 'false');
};

// Map STAGE_ID to internal OrderStatus
export const mapBitrixStageToStatus = (stageId: string): OrderStatus => {
  const s = (stageId || '').toUpperCase();
  if (s.includes('WON') || s.includes('READY') || s.includes('B2NTSZ') || s.includes('Q8F0S3') || s.includes(':1') || s.includes('Q4UARA') || s.includes('ZRA1WC') || s.includes(':6') || s.includes('G7GQBV') || s.includes('IC6QYV')) {
    return 'okk_otdi';
  }
  if (s.includes('1UTXNE') || s.includes('H9797W') || s.includes(':6') || s.includes('EE5QBV') || s.includes('QOH2K1') || s.includes(':11') || s.includes(':2') || s.includes('I6QM65') || s.includes('KACHESTVA')) {
    return 'kontrol_kachestva';
  }
  if (s.includes('EVAKIV') || s.includes('FDPYQG') || s.includes('MNKRA5') || s.includes('BAEGUV') || s.includes('O89JRS') || s.includes(':4') || s.includes('8QXI94') || s.includes('O5ZBMD')) {
    return 'ishlab_chiqarishda';
  }
  if (s.includes('FY5BYD') || s.includes('2F6AME') || s.includes('79W77Q') || s.includes('4PW13O') || s.includes('2LPK18') || s.includes('NNKT3Z') || s.includes('GMYK9L') || s.includes('D0TXXE')) {
    return 'fabrikada';
  }
  return 'yangi';
};

// Resolve Showroom Name from deal fields or IDs
export const resolveShowroomName = (deal: Record<string, any>): string => {
  const s = BITRIX_FIELDS.SHOWROOMS;
  
  const getDictOrVal = (rawVal: any) => {
    if (!rawVal) return null;
    const id = Array.isArray(rawVal) ? rawVal[0] : rawVal;
    return SHOWROOMS_DICT[id] || String(rawVal);
  };

  if (deal[s.FERGANA]) return `Farg'ona (${getDictOrVal(deal[s.FERGANA])})`;
  if (deal[s.ANDIJAN]) return `Andijon (${getDictOrVal(deal[s.ANDIJAN])})`;
  if (deal[s.SAMARKAND]) return `Samarqand (${getDictOrVal(deal[s.SAMARKAND])})`;
  if (deal[s.NAMANGAN]) return `Namangan (${getDictOrVal(deal[s.NAMANGAN])})`;
  if (deal[s.NUKUS]) return `Nukus Zavod (${getDictOrVal(deal[s.NUKUS])})`;
  if (deal[s.BUKHARA]) return `Buxoro (${getDictOrVal(deal[s.BUKHARA])})`;
  if (deal[s.SURKHANDARYA]) return `Surxondaryo (${getDictOrVal(deal[s.SURKHANDARYA])})`;
  if (deal[s.KHOREZM]) return `Xorazm (${getDictOrVal(deal[s.KHOREZM])})`;
  if (deal[s.TOSHKENT]) return `${getDictOrVal(deal[s.TOSHKENT])}`;
  return "Bosh Showroom (Toshkent)";
};

// Convert Bitrix Deal object to Application Order Object
export const convertBitrixDealToOrder = (deal: Record<string, any>, contact?: Record<string, any>): Order => {
  const dealId = String(deal.ID || '');
  const invoiceNumber = deal[BITRIX_FIELDS.ORDER_INVOICE_ID] || deal.TITLE || `SCH-2026-${dealId}`;
  const stageId = deal.STAGE_ID || 'C27:NEW';
  const stageHumanName = STAGE_NAMES[stageId] || stageId;
  const status = mapBitrixStageToStatus(stageId);
  const isReady = status === 'okk_otdi' || stageId.includes('WON');

  // Parse Products
  let rawProductIds = deal[BITRIX_FIELDS.PRODUCT_SERIES];
  if (!Array.isArray(rawProductIds)) {
    rawProductIds = rawProductIds ? [rawProductIds] : [];
  }
  let rawColorIds = deal[BITRIX_FIELDS.COLOR];
  if (!Array.isArray(rawColorIds)) {
    rawColorIds = rawColorIds ? [rawColorIds] : [];
  }

  const areaSqM = parseFloat(deal[BITRIX_FIELDS.AREA_SQM]) || 0;
  const productNames = rawProductIds.map((id: any) => PRODUCTS_DICT[id] || `Model #${id}`);
  const colorNames = rawColorIds.map((id: any) => COLORS_DICT[id] || `Rang #${id}`);

  const mainProductName = productNames.length > 0 ? productNames.join(', ') : (deal.TITLE || "Alyumin Rom Konstruksiyasi");
  const mainColorName = colorNames.length > 0 ? colorNames.join(', ') : "Standart (7016 Mat / Oq)";

  const productsList: ProductItem[] = [
    {
      id: `p-${dealId}-1`,
      name: mainProductName,
      category: 'Alyumin va PVX Konstruktsiya',
      model: productNames[0] || 'Termo Seriya',
      color: mainColorName,
      areaSqM: areaSqM > 0 ? areaSqM : 12.5,
      dimensions: 'Standart loyiha o\'lchamlari',
      quantity: 1,
      unitPrice: parseFloat(deal.OPPORTUNITY) || 15000000,
      totalPrice: parseFloat(deal.OPPORTUNITY) || 15000000,
    }
  ];

  // Dates
  const factorySentDate = formatBitrixDate(deal[BITRIX_FIELDS.FACTORY_DATE]);
  const estimatedReadyDate = formatBitrixDate(deal[BITRIX_FIELDS.ESTIMATED_READY_DATE]);
  const readyDate = deal[BITRIX_FIELDS.ORDER_READY_DATE] 
    ? formatBitrixDate(deal[BITRIX_FIELDS.ORDER_READY_DATE])
    : (isReady ? (estimatedReadyDate !== '-' ? estimatedReadyDate : 'Bugun') : undefined);

  // Client info
  const clientName = contact?.NAME 
    ? `${contact.LAST_NAME || ''} ${contact.NAME} ${contact.SECOND_NAME || ''}`.trim()
    : (deal.TITLE || `Mijoz (Deal #${dealId})`);
    
  const clientPhone = contact?.PHONE && contact.PHONE[0]?.VALUE 
    ? contact.PHONE[0].VALUE 
    : "+998 90 123 45 67";

  const specialCode = String(deal[BITRIX_FIELDS.SPECIAL_CODE] || dealId.slice(-4) || '8841');
  const login = `SCH${dealId.slice(-4) || '8841'}`;
  const pin = specialCode;
  const token = `tok_${login.toLowerCase()}_${dealId}`;

  const showroom = resolveShowroomName(deal);
  const managerName = deal[BITRIX_FIELDS.RESPONSIBLE_MANAGER] || "Komil Rahimov";
  const okkInspector = deal[BITRIX_FIELDS.OKK_MANAGER] || "Alisher Rustamov (Bosh OKK)";

  return {
    id: `bx_${dealId}`,
    invoiceNumber: String(invoiceNumber),
    clientFullName: clientName,
    clientPhone: clientPhone,
    clientAddress: showroom,
    showroomName: showroom,
    showroomId: 'bx_sh',
    salesManagerName: managerName,
    salesManagerPhone: '+998 90 777 88 99',
    orderDate: formatBitrixDate(deal.DATE_CREATE) || '2026-08-01',
    factorySentDate: factorySentDate !== '-' ? factorySentDate : '2026-08-05',
    productionStartDate: deal[BITRIX_FIELDS.READY_TO_PROD_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.READY_TO_PROD_DATE]) : '2026-08-10',
    okkInspectionDate: isReady ? '2026-08-20' : undefined,
    readyDate: readyDate,
    status: status,
    products: productsList,
    totalAmount: parseFloat(deal.OPPORTUNITY) || 18500000,
    paidAmount: parseFloat(deal.OPPORTUNITY) || 18500000,
    credentials: {
      login: login,
      pinCode: pin,
      directToken: token,
    },
    warranty: {
      certificateNumber: `KT-2026-${dealId.slice(-4) || '8841'}`,
      invoiceNumber: String(invoiceNumber),
      orderDate: formatBitrixDate(deal.DATE_CREATE) || '2026-08-01',
      readyDate: readyDate || 'Tasdiqlangan',
      warrantyPeriodMonths: 60,
      okkManagerName: okkInspector,
      okkManagerTitle: "Sifat nazorati (OKK) Bosh mutaxassisi",
      qualityScore: 99.8,
      sealStampUrl: "",
      signatureUrl: "",
      qrCodeValue: `https://kabinet.fabrika.uz/?token=${token}`,
      terms: [
        "Alyumin profil va lak-bo'yoq qatlamiga 60 oy to'liq kafolat beriladi.",
        "Muntazam profilaktika va servis xizmati bepul amalga oshiriladi.",
        "Mexanik shikastlanish va noto'g'ri foydalanish kafolatga kirmaydi."
      ]
    },
    smsSent: isReady,
    smsSentAt: isReady ? 'Bugun' : undefined,
    lastSmsText: `Hurmatli ${clientName.split(' ')[0]}! Sizning ${invoiceNumber} buyurtmangiz tayyor bo'ldi. Kabinet: https://kabinet.fabrika.uz/?token=${token} Login: ${login} Parol: ${pin}`,
    notes: `Bitrix24 Deal ID: ${dealId} | Bosqich: ${stageHumanName}`
  };
};

// Call Bitrix24 REST API (using backend proxy or direct fallback)
export const callBitrixMethod = async (method: string, params: Record<string, any> = {}): Promise<any> => {
  const webhookUrl = getBitrixWebhookUrl();
  if (!webhookUrl) {
    throw new Error("Bitrix24 Webhook URL kiritilmagan.");
  }

  // 1. Try server-side proxy first (handles CORS and timeouts)
  let proxyErrorMessage = '';
  try {
    const proxyRes = await fetch('/api/bitrix-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl,
        method,
        params,
      }),
    });

    const data = await proxyRes.json().catch(() => null);

    if (proxyRes.ok && data && !data.error) {
      return data.result;
    }

    if (data && data.error_description) {
      proxyErrorMessage = data.error_description;
    }
  } catch (proxyErr: any) {
    console.warn("Proxy call notice:", proxyErr.message);
  }

  // 2. Direct fetch fallback (if client is in same local network as Bitrix24)
  try {
    const url = `${webhookUrl.trim().replace(/\/+$/, '')}/${method}.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Bitrix24 API xatosi (${response.status}): ${errText}`);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(`Bitrix24: ${json.error_description || json.error}`);
    }

    return json.result;
  } catch (directErr: any) {
    if (proxyErrorMessage) {
      throw new Error(proxyErrorMessage);
    }
    
    if (directErr.name === 'AbortError') {
      throw new Error(`Bitrix24 (${webhookUrl}) serveriga ulanish vaqti tugadi (5s).`);
    }

    throw new Error(
      directErr.message?.includes('Failed to fetch') || directErr.name === 'TypeError'
        ? `Bitrix24 serveriga (${webhookUrl}) to'g'ridan-to'g'ri ulanib bo'lmadi. Server korporativ ichki tarmoqda bo'lishi mumkin.`
        : (directErr.message || "Bitrix24 ulanish xatosi")
    );
  }
};

// Fetch deal by Special Code (UF_CRM_1745308434)
export const fetchBitrixDealBySpecialCode = async (specialCode: string): Promise<Order | null> => {
  try {
    const authResult = await fetchBitrixCustomerOrdersByCredentials('', specialCode);
    return authResult?.mainOrder || null;
  } catch (err) {
    console.error("fetchBitrixDealBySpecialCode error:", err);
    throw err;
  }
};

// Authenticate customer by Phone Number (Login) & Special PIN Code directly with Bitrix24 and load all client deals
export const fetchBitrixCustomerOrdersByCredentials = async (
  phoneInput: string,
  pinInput: string
): Promise<{ mainOrder: Order; allOrders: Order[] } | null> => {
  const cleanPin = pinInput.trim();
  const cleanPhone = phoneInput.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');

  const selectFields = [
    "ID", "TITLE", "STAGE_ID", "DATE_CREATE", "OPPORTUNITY",
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

  let matchedDeals: any[] = [];

  // 1. Search deals by Special PIN Code in Bitrix24 (UF_CRM_1745308434)
  if (cleanPin) {
    const res = await callBitrixMethod('crm.deal.list', {
      filter: {
        [`=${BITRIX_FIELDS.SPECIAL_CODE}`]: cleanPin
      },
      select: selectFields
    });
    if (Array.isArray(res) && res.length > 0) {
      matchedDeals = res;
    }
  }

  // 2. If not found by PIN directly and Phone is provided, search contact by phone in Bitrix24
  if (matchedDeals.length === 0 && phoneDigits.length >= 7) {
    try {
      const contacts = await callBitrixMethod('crm.contact.list', {
        filter: {
          "PHONE": phoneDigits.length === 9 ? `+998${phoneDigits}` : phoneDigits
        },
        select: ["ID", "NAME", "LAST_NAME", "PHONE"]
      });
      if (Array.isArray(contacts) && contacts.length > 0) {
        const contactId = contacts[0].ID;
        const deals = await callBitrixMethod('crm.deal.list', {
          filter: {
            "=CONTACT_ID": contactId
          },
          select: selectFields
        });
        if (Array.isArray(deals) && deals.length > 0) {
          matchedDeals = deals.filter(d => (d[BITRIX_FIELDS.SPECIAL_CODE] || '').toString().trim() === cleanPin);
          if (matchedDeals.length === 0 && !cleanPin) {
            matchedDeals = deals;
          }
        }
      }
    } catch (e) {
      console.warn("Contact lookup by phone notice:", e);
    }
  }

  if (matchedDeals.length === 0) {
    return null;
  }

  // 3. Fetch Contact details (Name, Phone number)
  const firstDeal = matchedDeals[0];
  let contactData: any = undefined;
  if (firstDeal.CONTACT_ID) {
    try {
      contactData = await callBitrixMethod('crm.contact.get', { id: firstDeal.CONTACT_ID });
    } catch {
      // ignore contact fetch fail
    }
  }

  // 4. Validate phone number if entered by customer
  if (phoneDigits.length >= 7) {
    const contactPhones: string[] = contactData?.PHONE?.map((p: any) => (p.VALUE || '').replace(/\D/g, '')) || [];
    const inv = (firstDeal[BITRIX_FIELDS.ORDER_INVOICE_ID] || '').toString().trim().toUpperCase();
    const dealTitle = (firstDeal.TITLE || '').toString().trim();

    const last7Digits = phoneDigits.slice(-7);
    const last9Digits = phoneDigits.slice(-9);

    const matchesPhone = contactPhones.some(cp => 
      cp.endsWith(last7Digits) || 
      cp.endsWith(last9Digits) || 
      phoneDigits.endsWith(cp.slice(-7)) ||
      cp === phoneDigits
    );

    const matchesInvoiceOrTitle = cleanPhone && (inv === cleanPhone.toUpperCase() || dealTitle.toLowerCase().includes(cleanPhone.toLowerCase()));

    const dealPin = (firstDeal[BITRIX_FIELDS.SPECIAL_CODE] || '').toString().trim();
    const matchesPin = dealPin === cleanPin;

    if (!matchesPhone && !matchesInvoiceOrTitle && !matchesPin) {
      return null;
    }
  }

  // 5. Query all other deals belonging to this client (Multi-Deal feature)
  let allClientDeals: any[] = [...matchedDeals];
  if (firstDeal.CONTACT_ID) {
    try {
      const allContactDeals = await callBitrixMethod('crm.deal.list', {
        filter: {
          "=CONTACT_ID": firstDeal.CONTACT_ID
        },
        select: selectFields
      });
      if (Array.isArray(allContactDeals) && allContactDeals.length > 0) {
        const existingIds = new Set(allClientDeals.map(d => d.ID));
        for (const cd of allContactDeals) {
          if (!existingIds.has(cd.ID)) {
            allClientDeals.push(cd);
            existingIds.add(cd.ID);
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch extra contact deals:", e);
    }
  }

  const convertedOrders = allClientDeals.map(deal => convertBitrixDealToOrder(deal, contactData));
  const mainOrder = convertedOrders[0];

  return {
    mainOrder,
    allOrders: convertedOrders
  };
};

// Fetch real deals list
export const fetchBitrixRecentDeals = async (limit: number = 20): Promise<Order[]> => {
  try {
    const result = await callBitrixMethod('crm.deal.list', {
      order: { DATE_CREATE: "DESC" },
      select: [
        "ID", "TITLE", "STAGE_ID", "DATE_CREATE", "OPPORTUNITY",
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
      ]
    });

    if (Array.isArray(result)) {
      return result.slice(0, limit).map((deal: any) => convertBitrixDealToOrder(deal));
    }
    return [];
  } catch (err) {
    console.error("fetchBitrixRecentDeals error:", err);
    throw err;
  }
};

// Parse raw Bitrix24 JSON response directly
export const parseRawBitrixJsonData = (rawInput: string | object): Order[] => {
  let data: any = rawInput;
  if (typeof rawInput === 'string') {
    data = JSON.parse(rawInput);
  }

  let dealsArray: any[] = [];
  if (Array.isArray(data)) {
    dealsArray = data;
  } else if (data && Array.isArray(data.result)) {
    dealsArray = data.result;
  } else if (data && data.result && typeof data.result === 'object') {
    dealsArray = Object.values(data.result);
  } else if (data && typeof data === 'object' && data.ID) {
    dealsArray = [data];
  }

  return dealsArray.map((deal: any) => convertBitrixDealToOrder(deal));
};
