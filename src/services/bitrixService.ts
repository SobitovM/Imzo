import { Order, OrderStatus, ProductItem } from '../types';
import { 
  PRODUCTS_DICT, 
  COLORS_DICT, 
  SHOWROOMS_DICT,
  STAGE_NAMES, 
  ALLOWED_BITRIX_STAGES,
  BITRIX_FIELDS, 
  formatBitrixDate 
} from './bitrixConfig';
import { MANAGERS_DICT } from './managersDict';

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

// Check if a deal is eligible
export const isBitrixDealEligible = (deal: Record<string, any>): boolean => {
  if (!deal || typeof deal !== 'object') return false;

  // 1. UF_CRM_1745308434 (Maxsus kod) to'ldirilgan bo'lishi kerak
  const specialCode = deal[BITRIX_FIELDS.SPECIAL_CODE];
  const hasCode = specialCode !== null && 
                  specialCode !== undefined && 
                  String(specialCode).trim().length > 0 && 
                  String(specialCode).trim() !== '0' && 
                  String(specialCode).trim() !== 'false';
  if (!hasCode) {
    console.warn(`Deal ${deal.ID} filtrlandi: SPECIAL_CODE yo'q`);
    return false;
  }

  // 2. STAGE_ID ruxsat etilgan ro'yxatda bo'lishi kerak
  const stageId = String(deal.STAGE_ID || '').trim();
  if (!stageId || !ALLOWED_BITRIX_STAGES.has(stageId)) {
    console.warn(`Deal ${deal.ID} filtrlandi: STAGE_ID "${stageId}" ruxsat etilmagan`);
    return false;
  }

  return true;
};

// Map STAGE_ID to internal OrderStatus
export const mapBitrixStageToStatus = (stageId: string): OrderStatus => {
  const s = (stageId || '').trim();

  // 1. Muvaffaqiyatli / Yakunlangan
  if (s.endsWith(':WON')) {
    return 'topshirildi';
  }

  // 2. Yetkazilmoqda / На расход / Доставка / Доставлено
  if (
    s === 'C2:2' || s === 'C2:UC_6R66T3' ||
    s === 'C8:UC_KI81ZC' ||
    s === 'C12:UC_I2P8V1' ||
    s === 'C13:7' ||
    s === 'C16:UC_NA1A9O' ||
    s === 'C22:UC_H6AOUS' ||
    s === 'C24:UC_JZPAV2' ||
    s === 'C27:UC_E9E5IW' ||
    s === 'C35:UC_XXO9DM'
  ) {
    return 'yetkazib_berishda';
  }

  // 3. Sifat nazorati / Контроль качества / OKK tekshiruvi / Заказ не прошел ОКК
  if (
    s === 'C2:6' || s === 'C2:UC_ELI1KU' ||
    s === 'C8:UC_EE5QBV' ||
    s === 'C12:UC_QOH2K1' ||
    s === 'C13:11' ||
    s === 'C16:2' ||
    s === 'C22:UC_I6QM65' ||
    s === 'C24:UC_H9797W' ||
    s === 'C27:UC_1UTXNE' ||
    s === 'C35:FINAL_INVOICE'
  ) {
    return 'kontrol_kachestva';
  }

  // 4. Ishlab chiqarishda
  if (s === 'C2:UC_MNKRA5') {
    return 'ishlab_chiqarishda';
  }

  // 5. Заказ готов / Размещено в ГП склад / В процессе установки
  if (
    s === 'C2:1' || s === 'C2:5' ||
    s === 'C8:UC_Q4UARA' || s === 'C8:UC_KCNRMF' ||
    s === 'C12:UC_ZRA1WC' || s === 'C12:UC_U36QBE' ||
    s === 'C13:6' || s === 'C13:10' ||
    s === 'C16:UC_G7GQBV' || s === 'C16:UC_H9CTB9' ||
    s === 'C22:UC_IC6QYV' || s === 'C22:UC_2JO4UN' ||
    s === 'C24:UC_Q8F0S3' || s === 'C24:UC_0YXSW9' ||
    s === 'C27:UC_B2NTSZ' || s === 'C27:UC_6G3PNP' ||
    s === 'C35:UC_8G1TNE' || s === 'C35:UC_6LACIU'
  ) {
    return 'okk_otdi';
  }

  return 'yangi';
};

// Resolve Responsible Manager from Bitrix deal fields and MANAGERS_DICT
export const resolveManager = (deal: Record<string, any>): { name: string; phone: string; showroom: string } => {
  const assignedId = String(deal.ASSIGNED_BY_ID || '').trim();
  const customManagerField = deal[BITRIX_FIELDS.RESPONSIBLE_MANAGER];
  const customManagerId = (customManagerField !== null && customManagerField !== undefined) ? String(customManagerField).trim() : '';

  // 1. Try ASSIGNED_BY_ID in MANAGERS_DICT
  if (assignedId && MANAGERS_DICT[assignedId]) {
    return {
      name: MANAGERS_DICT[assignedId].name,
      phone: '-',
      showroom: MANAGERS_DICT[assignedId].showroom || "Bo'sh"
    };
  }

  // 2. Try customManagerId in MANAGERS_DICT
  if (customManagerId && MANAGERS_DICT[customManagerId]) {
    return {
      name: MANAGERS_DICT[customManagerId].name,
      phone: '-',
      showroom: MANAGERS_DICT[customManagerId].showroom || "Bo'sh"
    };
  }

  // 3. If custom field has a non-numeric string (e.g. text full name)
  if (customManagerField && typeof customManagerField === 'string' && isNaN(Number(customManagerField)) && customManagerField.trim().length > 0) {
    return {
      name: customManagerField.trim(),
      phone: '-',
      showroom: "Bo'sh"
    };
  }

  // 4. If assignedId exists but not in dict
  if (assignedId && assignedId !== '0' && assignedId !== '') {
    return {
      name: `Menejer #${assignedId}`,
      phone: '-',
      showroom: "Bo'sh"
    };
  }

  // 5. Not specified
  return {
    name: "Bo'sh",
    phone: '-',
    showroom: "Bo'sh"
  };
};

// Resolve Showroom Name from deal fields or IDs
export const resolveShowroomName = (deal: Record<string, any>, managerShowroom?: string): string => {
  const s = BITRIX_FIELDS.SHOWROOMS;
  
  const getDictOrVal = (rawVal: any) => {
    if (rawVal === undefined || rawVal === null || rawVal === '' || rawVal === 0 || rawVal === '0') return null;
    const id = Array.isArray(rawVal) ? rawVal[0] : rawVal;
    if (id === undefined || id === null || id === '' || id === 0 || id === '0') return null;
    if (SHOWROOMS_DICT[id]) return SHOWROOMS_DICT[id];
    if (typeof id === 'string' && isNaN(Number(id)) && id.trim().length > 0) return id.trim();
    return null;
  };

  const stageId = String(deal.STAGE_ID || '').trim();
  
  // C2 - Sergeli / Toshkent
  if (stageId.startsWith('C2:')) {
    const val = getDictOrVal(deal[s.DEFAULT]);
    if (val) return val;
    if (managerShowroom && managerShowroom !== '263/11') return managerShowroom;
    return "Bo'sh";
  }
  
  // C8 - Andijon
  if (stageId.startsWith('C8:')) {
    const val = getDictOrVal(deal[s.ANDIJAN]);
    if (val) return `Andijon (${val})`;
    return "Bo'sh";
  }
  
  // C12 - Samarqand
  if (stageId.startsWith('C12:')) {
    const val = getDictOrVal(deal[s.SAMARKAND]);
    if (val) return `Samarqand (${val})`;
    return "Bo'sh";
  }
  
  // C13 - Namangan
  if (stageId.startsWith('C13:')) {
    const val = getDictOrVal(deal[s.NAMANGAN]);
    if (val) return `Namangan (${val})`;
    return "Bo'sh";
  }
  
  // C16 - Nukus / Xorazm
  if (stageId.startsWith('C16:')) {
    const val = getDictOrVal(deal[s.NUKUS]) || getDictOrVal(deal[s.KHOREZM]);
    if (val) return `Nukus (${val})`;
    return "Bo'sh";
  }
  
  // C22 - Buxoro
  if (stageId.startsWith('C22:')) {
    const val = getDictOrVal(deal[s.BUKHARA]);
    if (val) return `Buxoro (${val})`;
    return "Bo'sh";
  }
  
  // C24 - Surxondaryo
  if (stageId.startsWith('C24:')) {
    const val = getDictOrVal(deal[s.SURKHANDARYA]);
    if (val) return `Surxondaryo (${val})`;
    return "Bo'sh";
  }
  
  // C27 - Farg'ona
  if (stageId.startsWith('C27:')) {
    const val = getDictOrVal(deal[s.FERGANA]);
    if (val) return `Farg'ona (${val})`;
    return "Bo'sh";
  }
  
  // C35 - Nukus
  if (stageId.startsWith('C35:')) {
    const val = getDictOrVal(deal[s.NUKUS]);
    if (val) return `Nukus Zavod (${val})`;
    return "Bo'sh";
  }

  // Fallback
  const defaultVal = getDictOrVal(deal[s.DEFAULT]);
  if (defaultVal) return defaultVal;
  if (managerShowroom && managerShowroom !== '263/11') return managerShowroom;
  return "Bo'sh";
};

// Resolve Client Phone Number accurately
export const resolveClientPhone = (deal: Record<string, any>, contact?: Record<string, any>): string => {
  if (contact?.PHONE) {
    if (Array.isArray(contact.PHONE) && contact.PHONE.length > 0) {
      const val = contact.PHONE[0]?.VALUE;
      if (val && String(val).trim()) return String(val).trim();
    } else if (typeof contact.PHONE === 'string' && contact.PHONE.trim()) {
      return contact.PHONE.trim();
    }
  }

  if (deal.PHONE) {
    if (Array.isArray(deal.PHONE) && deal.PHONE.length > 0) {
      const val = deal.PHONE[0]?.VALUE;
      if (val && String(val).trim()) return String(val).trim();
    } else if (typeof deal.PHONE === 'string' && deal.PHONE.trim()) {
      return deal.PHONE.trim();
    }
  }

  if (deal.CONTACT_PHONE && typeof deal.CONTACT_PHONE === 'string' && deal.CONTACT_PHONE.trim()) {
    return deal.CONTACT_PHONE.trim();
  }

  return "Bo'sh";
};

// Resolve OKK Inspector from deal
export const resolveOkkInspector = (deal: Record<string, any>): string => {
  const okkRaw = deal[BITRIX_FIELDS.OKK_MANAGER];
  if (!okkRaw || okkRaw === '0' || okkRaw === 0) return "Bo'sh";
  
  const okkId = String(okkRaw).trim();
  if (MANAGERS_DICT[okkId]) {
    return MANAGERS_DICT[okkId].name;
  }
  if (typeof okkRaw === 'string' && isNaN(Number(okkRaw)) && okkRaw.trim().length > 0) {
    return okkRaw.trim();
  }
  return `OKK Muhandis #${okkId}`;
};

// All fields to select from Bitrix crm.deal.list
export const DEAL_SELECT_FIELDS = [
  "ID", "TITLE", "STAGE_ID", "DATE_CREATE", "OPPORTUNITY", "CURRENCY_ID",
  "CONTACT_ID", "ASSIGNED_BY_ID", "CREATED_BY_ID", "MODIFY_BY_ID",
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
  BITRIX_FIELDS.SHOWROOMS.DEFAULT,
  BITRIX_FIELDS.SHOWROOMS.FERGANA,
  BITRIX_FIELDS.SHOWROOMS.ANDIJAN,
  BITRIX_FIELDS.SHOWROOMS.SAMARKAND,
  BITRIX_FIELDS.SHOWROOMS.NAMANGAN,
  BITRIX_FIELDS.SHOWROOMS.NUKUS,
  BITRIX_FIELDS.SHOWROOMS.BUKHARA,
  BITRIX_FIELDS.SHOWROOMS.SURKHANDARYA,
  BITRIX_FIELDS.SHOWROOMS.KHOREZM,
];

// Convert Bitrix Deal object to Application Order Object
export const convertBitrixDealToOrder = (deal: Record<string, any>, contact?: Record<string, any>): Order => {
  const dealId = String(deal.ID || '');
  const invoiceNumber = deal[BITRIX_FIELDS.ORDER_INVOICE_ID] || deal.TITLE || `SCH-${dealId}`;
  const stageId = deal.STAGE_ID || 'C27:NEW';
  const stageHumanName = STAGE_NAMES[stageId] || stageId;
  const status = mapBitrixStageToStatus(stageId);
  const isReady = status === 'okk_otdi' || stageId.includes('WON');

  // Parse Products Series
  let rawProductIds = deal[BITRIX_FIELDS.PRODUCT_SERIES];
  if (!Array.isArray(rawProductIds)) {
    rawProductIds = (rawProductIds !== null && rawProductIds !== undefined && rawProductIds !== '') ? [rawProductIds] : [];
  }
  rawProductIds = rawProductIds.filter((id: any) => id !== null && id !== undefined && id !== '' && id !== '0' && id !== 0);

  // Parse Colors
  let rawColorIds = deal[BITRIX_FIELDS.COLOR];
  if (!Array.isArray(rawColorIds)) {
    rawColorIds = (rawColorIds !== null && rawColorIds !== undefined && rawColorIds !== '') ? [rawColorIds] : [];
  }
  rawColorIds = rawColorIds.filter((id: any) => id !== null && id !== undefined && id !== '' && id !== '0' && id !== 0);

  // Parse Area
  const rawArea = deal[BITRIX_FIELDS.AREA_SQM];
  const areaSqM = (rawArea !== null && rawArea !== undefined && rawArea !== '') ? (parseFloat(rawArea) || 0) : 0;

  const productNames = rawProductIds.map((id: any) => PRODUCTS_DICT[id] || (typeof id === 'string' && isNaN(Number(id)) ? id : `Seriya #${id}`));
  const colorNames = rawColorIds.map((id: any) => COLORS_DICT[id] || (typeof id === 'string' && isNaN(Number(id)) ? id : `Rang #${id}`));

  // Agar bo'sh bo'lsa "Bo'sh" deb yozamiz
  const seriesDisplay = productNames.length > 0 ? productNames.join(', ') : "Bo'sh";
  const colorDisplay = colorNames.length > 0 ? colorNames.join(', ') : "Bo'sh";
  const mainProductName = deal.TITLE || (productNames.length > 0 ? productNames.join(', ') : "Bo'sh");

  const productsList: ProductItem[] = [
    {
      id: `p-${dealId}-1`,
      name: mainProductName,
      category: productNames.length > 0 ? 'Alyumin va PVX Konstruktsiya' : "Bo'sh",
      model: seriesDisplay,
      color: colorDisplay,
      areaSqM: areaSqM,
      dimensions: areaSqM > 0 ? `${areaSqM} kv.m` : "Bo'sh",
      quantity: 1,
      unitPrice: parseFloat(deal.OPPORTUNITY) || 0,
      totalPrice: parseFloat(deal.OPPORTUNITY) || 0,
    }
  ];

  // Dates - bo'sh bo'lsa "Bo'sh"
  const factorySentDate = deal[BITRIX_FIELDS.FACTORY_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.FACTORY_DATE]) : "Bo'sh";
  const estimatedReadyDate = deal[BITRIX_FIELDS.ESTIMATED_READY_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.ESTIMATED_READY_DATE]) : "Bo'sh";
  const readyDate = deal[BITRIX_FIELDS.ORDER_READY_DATE] 
    ? formatBitrixDate(deal[BITRIX_FIELDS.ORDER_READY_DATE])
    : (isReady ? (estimatedReadyDate !== "Bo'sh" ? estimatedReadyDate : 'Tasdiqlangan') : "Bo'sh");

  // Client info - bo'sh bo'lsa "Bo'sh"
  const clientName = contact?.NAME 
    ? `${contact.LAST_NAME || ''} ${contact.NAME} ${contact.SECOND_NAME || ''}`.trim()
    : (deal.TITLE || "Bo'sh");
    
  const clientPhone = resolveClientPhone(deal, contact) || "Bo'sh";
  const manager = resolveManager(deal);
  const showroom = resolveShowroomName(deal, manager.showroom);
  const okkInspector = resolveOkkInspector(deal) || "Bo'sh";

  const rawSpecialCode = deal[BITRIX_FIELDS.SPECIAL_CODE];
  const specialCode = (rawSpecialCode !== null && rawSpecialCode !== undefined && String(rawSpecialCode).trim().length > 0) 
    ? String(rawSpecialCode).trim() 
    : "Bo'sh";
  const login = `SCH${dealId}`;
  const pin = specialCode;
  const token = `tok_${login.toLowerCase()}_${dealId}`;

  return {
    id: `bx_${dealId}`,
    invoiceNumber: String(invoiceNumber),
    clientFullName: clientName || "Bo'sh",
    clientPhone: clientPhone || "Bo'sh",
    clientAddress: showroom || "Bo'sh",
    showroomName: showroom || "Bo'sh",
    showroomId: 'bx_sh',
    salesManagerName: manager.name || "Bo'sh",
    salesManagerPhone: manager.phone || "Bo'sh",
    orderDate: formatBitrixDate(deal.DATE_CREATE) || "Bo'sh",
    factorySentDate: factorySentDate,
    productionStartDate: deal[BITRIX_FIELDS.READY_TO_PROD_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.READY_TO_PROD_DATE]) : "Bo'sh",
    okkInspectionDate: isReady ? (readyDate || 'Tasdiqlangan') : "Bo'sh",
    readyDate: readyDate,
    status: status,
    products: productsList,
    totalAmount: parseFloat(deal.OPPORTUNITY) || 0,
    paidAmount: parseFloat(deal.OPPORTUNITY) || 0,
    credentials: {
      login: login,
      pinCode: pin,
      directToken: token,
    },
    warranty: {
      certificateNumber: `KT-2026-${dealId.slice(-4) || '0000'}`,
      invoiceNumber: String(invoiceNumber),
      orderDate: formatBitrixDate(deal.DATE_CREATE) || "Bo'sh",
      readyDate: readyDate || "Bo'sh",
      warrantyPeriodMonths: 60,
      okkManagerName: okkInspector || "Bo'sh",
      okkManagerTitle: "Sifat nazorati (OKK) Mutaxassisi",
      qualityScore: 99.8,
      sealStampUrl: "",
      signatureUrl: "",
      qrCodeValue: `https://kabinet.fabrika.uz/?token=${token}`,
      terms: [
        "Alyumin profil va lak-bo'yoq qatlamiga 60 oy (5 yil) to'liq kafolat beriladi.",
        "Muntazam profilaktika va servis xizmati kafolat doirasida amalga oshiriladi.",
        "Mexanik shikastlanish va noto'g'ri foydalanish kafolatga kirmaydi."
      ]
    },
    smsSent: isReady,
    smsSentAt: isReady ? 'Bugun' : "Bo'sh",
    lastSmsText: `Hurmatli ${clientName.split(' ')[0]}! Sizning ${invoiceNumber} buyurtmangiz tayyor bo'ldi. Kabinet: https://kabinet.fabrika.uz/?token=${token} Login: ${login} Parol: ${pin}`,
    notes: `Bitrix24 Deal ID: ${dealId} | Bosqich: ${stageHumanName}`
  };
};

// Call Bitrix24 REST API
export const callBitrixMethod = async (method: string, params: Record<string, any> = {}): Promise<any> => {
  const webhookUrl = getBitrixWebhookUrl();
  if (!webhookUrl) {
    throw new Error("Bitrix24 Webhook URL kiritilmagan.");
  }

  // 1. Try server-side proxy first
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

  // 2. Direct fetch fallback
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
        ? `Bitrix24 serveriga (${webhookUrl}) to'g'ridan-to'g'ri ulanib bo'lmadi.`
        : (directErr.message || "Bitrix24 ulanish xatosi")
    );
  }
};

// Fetch deal by Special Code
export const fetchBitrixDealBySpecialCode = async (specialCode: string): Promise<Order | null> => {
  try {
    const authResult = await fetchBitrixCustomerOrdersByCredentials('', specialCode);
    return authResult?.mainOrder || null;
  } catch (err) {
    console.error("fetchBitrixDealBySpecialCode error:", err);
    throw err;
  }
};

// Authenticate customer by Phone Number & Special PIN Code
export const fetchBitrixCustomerOrdersByCredentials = async (
  phoneInput: string,
  pinInput: string
): Promise<{ mainOrder: Order; allOrders: Order[] } | null> => {
  const cleanPin = pinInput.trim();
  const cleanPhone = phoneInput.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');

  let matchedDeals: any[] = [];

  // 1. Search deals by Special PIN Code
  if (cleanPin) {
    const res = await callBitrixMethod('crm.deal.list', {
      filter: {
        [`=${BITRIX_FIELDS.SPECIAL_CODE}`]: cleanPin
      },
      select: DEAL_SELECT_FIELDS
    });
    if (Array.isArray(res) && res.length > 0) {
      matchedDeals = res;
    }
  }

  // 2. If not found by PIN and Phone is provided, search by phone
  if (matchedDeals.length === 0 && phoneDigits.length >= 7) {
    try {
      const contacts = await callBitrixMethod('crm.contact.list', {
        filter: {
          "PHONE": phoneDigits.length === 9 ? `+998${phoneDigits}` : phoneDigits
        },
        select: ["ID", "NAME", "LAST_NAME", "SECOND_NAME", "PHONE"]
      });
      if (Array.isArray(contacts) && contacts.length > 0) {
        const contactId = contacts[0].ID;
        const deals = await callBitrixMethod('crm.deal.list', {
          filter: {
            "=CONTACT_ID": contactId
          },
          select: DEAL_SELECT_FIELDS
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

  // 3. Fetch Contact details
  const firstDeal = matchedDeals[0];
  let contactData: any = undefined;
  if (firstDeal.CONTACT_ID) {
    try {
      contactData = await callBitrixMethod('crm.contact.get', { id: firstDeal.CONTACT_ID });
    } catch {
      // ignore
    }
  }

  // 4. Validate phone number
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

  // 5. Query all other deals belonging to this client
  let allClientDeals: any[] = [...matchedDeals];
  if (firstDeal.CONTACT_ID) {
    try {
      const allContactDeals = await callBitrixMethod('crm.deal.list', {
        filter: {
          "=CONTACT_ID": firstDeal.CONTACT_ID
        },
        select: DEAL_SELECT_FIELDS
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

  // Filter ONLY eligible deals
  const eligibleClientDeals = allClientDeals.filter(isBitrixDealEligible);
  if (eligibleClientDeals.length === 0) {
    return null;
  }

  const convertedOrders = eligibleClientDeals.map(deal => convertBitrixDealToOrder(deal, contactData));
  const mainOrder = convertedOrders[0];

  return {
    mainOrder,
    allOrders: convertedOrders
  };
};

// Fetch real deals list with batch contact hydration
export const fetchBitrixRecentDeals = async (limit: number = 50): Promise<Order[]> => {
  try {
    const result = await callBitrixMethod('crm.deal.list', {
      order: { DATE_CREATE: "DESC" },
      select: DEAL_SELECT_FIELDS
    });

    if (Array.isArray(result) && result.length > 0) {
      const eligibleDeals = result.filter(isBitrixDealEligible);
      const deals = eligibleDeals.slice(0, limit);
      
      if (deals.length === 0) {
        return [];
      }
      
      // Batch fetch contacts
      const contactIds = Array.from(new Set(deals.map((d: any) => d.CONTACT_ID).filter((id: any) => id && id !== '0' && id !== 0)));
      let contactMap: Record<string, any> = {};

      if (contactIds.length > 0) {
        try {
          const contacts = await callBitrixMethod('crm.contact.list', {
            filter: {
              "@ID": contactIds
            },
            select: ["ID", "NAME", "LAST_NAME", "SECOND_NAME", "PHONE", "EMAIL"]
          });
          if (Array.isArray(contacts)) {
            for (const c of contacts) {
              contactMap[String(c.ID)] = c;
            }
          }
        } catch (cErr) {
          console.warn("Batch contacts fetch notice:", cErr);
        }
      }

      return deals.map((deal: any) => {
        const contact = deal.CONTACT_ID ? contactMap[String(deal.CONTACT_ID)] : undefined;
        return convertBitrixDealToOrder(deal, contact);
      });
    }
    return [];
  } catch (err) {
    console.error("fetchBitrixRecentDeals error:", err);
    throw err;
  }
};

// Parse raw Bitrix24 JSON response
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

  const eligibleDeals = dealsArray.filter(isBitrixDealEligible);

  return eligibleDeals.map((deal: any) => convertBitrixDealToOrder(deal));
};
