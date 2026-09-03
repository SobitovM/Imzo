// bitrixService.ts - import qismiga qo'shing
import { SHOWROOM_PHONES } from './bitrixConfig';

// 🔥 Showroom telefon raqamini olish funksiyasi
export const getShowroomPhone = (showroomName: string): string => {
  if (!showroomName || showroomName === "Bo'sh") {
    return SHOWROOM_PHONES['default'] || "+998 (71) 200-88-00";
  }
  
  if (SHOWROOM_PHONES[showroomName]) {
    return SHOWROOM_PHONES[showroomName];
  }
  
  for (const [key, phone] of Object.entries(SHOWROOM_PHONES)) {
    if (showroomName.includes(key) || key.includes(showroomName)) {
      return phone;
    }
  }
  
  return SHOWROOM_PHONES['default'] || "+998 (71) 200-88-00";
};

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
    console.warn(`Deal ${deal.ID} filtrlandi: SPECIAL_CODE yo'q (${specialCode})`);
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

// bitrixService.ts - mapBitrixStageToStatus TO'LIQ FUNKSIYA

export const mapBitrixStageToStatus = (stageId: string): OrderStatus => {
  const s = (stageId || '').trim();

  // 🔥 C1 Pipeline (Servis) uchun statuslar - BIRINCHI TEKSHIRILADI
  if (s === 'C1:NEW') {
    return 'servis_yangi';
  }
  if (s === 'C1:UC_WV7G2R') {
    return 'servis_master';
  }
  if (s === 'C1:PREPARATION' || s === 'C1:UC_PIL0QY') {
    return 'servis_jarayonda';
  }
  if (s === 'C1:WON') {
    return 'servis_hal_qilindi';
  }
  if (s === 'C1:LOSE') {
    return 'servis_bekor_qilindi';
  }
  if (s === 'C1:UC_E0X40P') {
    return 'servis_montaj_tugallanmagan';
  }

  // 1. Muvaffaqiyatli yakunlandi
  if (s.endsWith(':WON')) {
    return 'topshirildi';
  }

  // 2. Yetkazilmoqda / Yetkazildi
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

  // 3. Sifat nazorati tekshiruvida / Sifat nazoratidan o'tmadi
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

  // 4. Buyurtma tayyor / O'rnatish jarayonida
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

  // 5. Ishlab chiqarishda
  if (s === 'C2:UC_MNKRA5' || s === 'C27:UC_EVAKIV') {
    return 'ishlab_chiqarishda';
  }

  // 6. Boshqa statuslar
  return 'yangi';
};

export const resolveManager = (deal: Record<string, any>): { name: string; phone: string; showroom: string } => {
  const assignedId = String(deal.ASSIGNED_BY_ID || '').trim();
  const customManagerField = deal[BITRIX_FIELDS.RESPONSIBLE_MANAGER];
  const customManagerId = (customManagerField !== null && customManagerField !== undefined) ? String(customManagerField).trim() : '';

  if (assignedId && MANAGERS_DICT[assignedId]) {
    return {
      name: MANAGERS_DICT[assignedId].name,
      phone: '-',
      showroom: MANAGERS_DICT[assignedId].showroom || "Bo'sh"
    };
  }

  if (customManagerId && MANAGERS_DICT[customManagerId]) {
    return {
      name: MANAGERS_DICT[customManagerId].name,
      phone: '-',
      showroom: MANAGERS_DICT[customManagerId].showroom || "Bo'sh"
    };
  }

  if (customManagerField && typeof customManagerField === 'string' && isNaN(Number(customManagerField)) && customManagerField.trim().length > 0) {
    return {
      name: customManagerField.trim(),
      phone: '-',
      showroom: "Bo'sh"
    };
  }

  if (assignedId && assignedId !== '0' && assignedId !== '') {
    return {
      name: `Menejer #${assignedId}`,
      phone: '-',
      showroom: "Bo'sh"
    };
  }

  return {
    name: "Bo'sh",
    phone: '-',
    showroom: "Bo'sh"
  };
};

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
  
  if (stageId.startsWith('C2:')) {
    const val = getDictOrVal(deal[s.DEFAULT]);
    if (val) return val;
    if (managerShowroom && managerShowroom !== '263/11') return managerShowroom;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C8:')) {
    const val = getDictOrVal(deal[s.ANDIJAN]);
    if (val) return `Andijon (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C12:')) {
    const val = getDictOrVal(deal[s.SAMARKAND]);
    if (val) return `Samarqand (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C13:')) {
    const val = getDictOrVal(deal[s.NAMANGAN]);
    if (val) return `Namangan (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C16:')) {
    const val = getDictOrVal(deal[s.NUKUS]) || getDictOrVal(deal[s.KHOREZM]);
    if (val) return `Nukus (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C22:')) {
    const val = getDictOrVal(deal[s.BUKHARA]);
    if (val) return `Buxoro (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C24:')) {
    const val = getDictOrVal(deal[s.SURKHANDARYA]);
    if (val) return `Surxondaryo (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C27:')) {
    const val = getDictOrVal(deal[s.FERGANA]);
    if (val) return `Farg'ona (${val})`;
    return "Bo'sh";
  }
  
  if (stageId.startsWith('C35:')) {
    const val = getDictOrVal(deal[s.NUKUS]);
    if (val) return `Nukus Zavod (${val})`;
    return "Bo'sh";
  }

  const defaultVal = getDictOrVal(deal[s.DEFAULT]);
  if (defaultVal) return defaultVal;
  if (managerShowroom && managerShowroom !== '263/11') return managerShowroom;
  return "Bo'sh";
};

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

export const convertBitrixDealToOrder = (deal: Record<string, any>, contact?: Record<string, any>): Order => {
  const dealId = String(deal.ID || '');
  const invoiceNumber = deal[BITRIX_FIELDS.ORDER_INVOICE_ID] || deal.TITLE || `SCH-${dealId}`;
  const stageId = deal.STAGE_ID || 'C27:NEW';
  const stageHumanName = STAGE_NAMES[stageId] || stageId;
  const status = mapBitrixStageToStatus(stageId);
  const isReady = status === 'okk_otdi' || stageId.includes('WON');

  let rawProductIds = deal[BITRIX_FIELDS.PRODUCT_SERIES];
  if (!Array.isArray(rawProductIds)) {
    rawProductIds = (rawProductIds !== null && rawProductIds !== undefined && rawProductIds !== '') ? [rawProductIds] : [];
  }
  rawProductIds = rawProductIds.filter((id: any) => id !== null && id !== undefined && id !== '' && id !== '0' && id !== 0);

  let rawColorIds = deal[BITRIX_FIELDS.COLOR];
  if (!Array.isArray(rawColorIds)) {
    rawColorIds = (rawColorIds !== null && rawColorIds !== undefined && rawColorIds !== '') ? [rawColorIds] : [];
  }
  rawColorIds = rawColorIds.filter((id: any) => id !== null && id !== undefined && id !== '' && id !== '0' && id !== 0);

  const rawArea = deal[BITRIX_FIELDS.AREA_SQM];
  const areaSqM = (rawArea !== null && rawArea !== undefined && rawArea !== '') ? (parseFloat(rawArea) || 0) : 0;

  const productNames = rawProductIds.map((id: any) => PRODUCTS_DICT[id] || (typeof id === 'string' && isNaN(Number(id)) ? id : `Seriya #${id}`));
  const colorNames = rawColorIds.map((id: any) => COLORS_DICT[id] || (typeof id === 'string' && isNaN(Number(id)) ? id : `Rang #${id}`));

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

  // 🔥 DATES - TUZATILGAN QISM
  const factorySentDate = deal[BITRIX_FIELDS.FACTORY_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.FACTORY_DATE]) : "Bo'sh";
  const estimatedReadyDate = deal[BITRIX_FIELDS.ESTIMATED_READY_DATE] ? formatBitrixDate(deal[BITRIX_FIELDS.ESTIMATED_READY_DATE]) : "Bo'sh";
  
  // 🔥 FAQAT UF_CRM_1678904672694 dan olamiz - "Заказ готов" статусига ўтган вақт
  const orderReadyDateRaw = deal[BITRIX_FIELDS.ORDER_READY_DATE]; // UF_CRM_1678904672694
  let readyDate = "Bo'sh";

  if (orderReadyDateRaw) {
    readyDate = formatBitrixDate(orderReadyDateRaw);
  } else if (isReady) {
    readyDate = 'Tasdiqlangan';
  }

  // Debug uchun
  console.log(`Deal ${dealId} readyDate:`, {
    orderReadyDateRaw,
    readyDate,
    isReady
  });

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
    : Math.floor(1000 + Math.random() * 9000).toString();
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
      qualityScore: 100,
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

export const callBitrixMethod = async (method: string, params: Record<string, any> = {}): Promise<any> => {
  const webhookUrl = getBitrixWebhookUrl();
  if (!webhookUrl) {
    throw new Error("Bitrix24 Webhook URL kiritilmagan.");
  }

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

export const fetchBitrixDealBySpecialCode = async (specialCode: string): Promise<Order | null> => {
  try {
    const authResult = await fetchBitrixCustomerOrdersByCredentials('', specialCode);
    return authResult?.mainOrder || null;
  } catch (err) {
    console.error("fetchBitrixDealBySpecialCode error:", err);
    throw err;
  }
};

export const fetchBitrixCustomerOrdersByCredentials = async (
  phoneInput: string,
  pinInput: string
): Promise<{ mainOrder: Order; allOrders: Order[] } | null> => {
  const cleanPin = pinInput.trim();
  const cleanPhone = phoneInput.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');

  const selectFields = [
    "ID", "TITLE", "STAGE_ID", "DATE_CREATE", "OPPORTUNITY", "CURRENCY_ID",
    "CONTACT_ID", "ASSIGNED_BY_ID", "CREATED_BY_ID", "MODIFY_BY_ID",
    "UF_CRM_1745308434", "UF_CRM_1651306406137", "UF_CRM_1656483960",
    "UF_CRM_1656484012", "UF_CRM_1648100319007", "UF_CRM_1701497119",
    "UF_CRM_1682695332152", "UF_CRM_1682761006746", "UF_CRM_1678904672694",
    "UF_CRM_1646213205", "UF_CRM_1690286173", "UF_CRM_1647931321",
    "UF_CRM_1713332718568", "UF_CRM_1649332403191", "UF_CRM_1653148491",
    "UF_CRM_1655321621579", "UF_CRM_1659691369246", "UF_CRM_1671518012095",
    "UF_CRM_1696845428847", "UF_CRM_1761029845985"
  ];

  let matchedDeals: any[] = [];

  if (cleanPin) {
    const res = await callBitrixMethod('crm.deal.list', {
      filter: {
        [`=${BITRIX_FIELDS.SPECIAL_CODE}`]: cleanPin
      },
      select: selectFields,
      limit: 50,
    });
    if (Array.isArray(res) && res.length > 0) {
      matchedDeals = res;
    }
  }

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
          select: selectFields,
          limit: 50,
        });
        if (Array.isArray(deals) && deals.length > 0) {
          if (cleanPin) {
            matchedDeals = deals.filter(d => (d[BITRIX_FIELDS.SPECIAL_CODE] || '').toString().trim() === cleanPin);
          } else {
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

  if (phoneDigits.length >= 7) {
    const firstDeal = matchedDeals[0];
    let contactData: any = undefined;
    if (firstDeal.CONTACT_ID) {
      try {
        contactData = await callBitrixMethod('crm.contact.get', { id: firstDeal.CONTACT_ID });
      } catch {
        // ignore
      }
    }

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

  const eligibleDeals = matchedDeals.filter(isBitrixDealEligible);
  if (eligibleDeals.length === 0) {
    return null;
  }

  let contactData: any = undefined;
  if (eligibleDeals[0].CONTACT_ID) {
    try {
      contactData = await callBitrixMethod('crm.contact.get', { id: eligibleDeals[0].CONTACT_ID });
    } catch {
      // ignore
    }
  }

  const convertedOrders = eligibleDeals.map(deal => convertBitrixDealToOrder(deal, contactData));
  const mainOrder = convertedOrders[0];

  return {
    mainOrder,
    allOrders: convertedOrders
  };
};

// 🔥 ASOSIY FUNKSIYA: fetchBitrixRecentDeals - SPECIAL_CODE va STAGE_ID filtrlanadi
export const fetchBitrixRecentDeals = async (limit: number = 10): Promise<Order[]> => {
  try {
    console.log('🔄 Bitrix24 dan ma\'lumot olinmoqda...');
    
    const startDate = '2026-01-01T00:00:00+05:00';
    
    const selectFields = [
      "ID", "TITLE", "STAGE_ID", "DATE_CREATE", "OPPORTUNITY", "CURRENCY_ID",
      "CONTACT_ID", "ASSIGNED_BY_ID", "CREATED_BY_ID", "MODIFY_BY_ID",
      "UF_CRM_1745308434", "UF_CRM_1651306406137", "UF_CRM_1656483960",
      "UF_CRM_1656484012", "UF_CRM_1648100319007", "UF_CRM_1701497119",
      "UF_CRM_1682695332152", "UF_CRM_1682761006746", "UF_CRM_1678904672694",
      "UF_CRM_1646213205", "UF_CRM_1690286173", "UF_CRM_1647931321",
      "UF_CRM_1713332718568", "UF_CRM_1649332403191", "UF_CRM_1653148491",
      "UF_CRM_1655321621579", "UF_CRM_1659691369246", "UF_CRM_1671518012095",
      "UF_CRM_1696845428847", "UF_CRM_1761029845985"
    ];

    // 🔥 1. Barcha deal'larni olamiz (2026-yildan boshlab)
    const result = await callBitrixMethod('crm.deal.list', {
      order: { DATE_CREATE: "DESC" },
      filter: {
        ">=DATE_CREATE": startDate,
      },
      select: selectFields,
      limit: 50,
      start: 0,
    });

    if (!Array.isArray(result) || result.length === 0) {
      console.log('⚠️ Hech qanday deal topilmadi');
      return [];
    }

    console.log(`📋 ${result.length} ta deal yuklandi (2026-yildan boshlab)`);

    // 🔥 2. SPECIAL_CODE bor va STAGE_ID ruxsat etilganlarni filtrlaymiz
    const eligibleDeals = result.filter(deal => {
      // SPECIAL_CODE tekshiruvi - UF_CRM_1745308434 maydoni to'ldirilgan bo'lishi kerak
      const specialCode = deal.UF_CRM_1745308434;
      const hasCode = specialCode !== null && 
                      specialCode !== undefined && 
                      String(specialCode).trim().length > 0 && 
                      String(specialCode).trim() !== '0' && 
                      String(specialCode).trim() !== 'false';
      
      if (!hasCode) {
        console.warn(`Deal ${deal.ID} filtrlandi: SPECIAL_CODE yo'q (${specialCode})`);
        return false;
      }

      // STAGE_ID tekshiruvi - malumot1.txt dagi statuslar
      const stageId = String(deal.STAGE_ID || '').trim();
      if (!stageId || !ALLOWED_BITRIX_STAGES.has(stageId)) {
        console.warn(`Deal ${deal.ID} filtrlandi: STAGE_ID "${stageId}" ruxsat etilmagan`);
        return false;
      }

      return true;
    });

    console.log(`🎯 ${eligibleDeals.length} ta deal SPECIAL_CODE va ruxsat etilgan statusga ega`);

    if (eligibleDeals.length === 0) {
      console.log('⚠️ Hech qanday mos deal topilmadi');
      return [];
    }

    // 🔥 3. FAQAT 10 TA OLAMIZ
    const limitedDeals = eligibleDeals.slice(0, 10);

    // Contact ma'lumotlarini olish
    const contactIds = Array.from(new Set(limitedDeals.map((d: any) => d.CONTACT_ID).filter((id: any) => id && id !== '0' && id !== 0)));
    let contactMap: Record<string, any> = {};

    if (contactIds.length > 0) {
      try {
        console.log(`📞 ${contactIds.length} ta contact ma'lumoti olinmoqda...`);
        const contacts = await callBitrixMethod('crm.contact.list', {
          filter: {
            "@ID": contactIds
          },
          select: ["ID", "NAME", "LAST_NAME", "SECOND_NAME", "PHONE", "EMAIL"],
          limit: 50,
        });
        if (Array.isArray(contacts)) {
          for (const c of contacts) {
            contactMap[String(c.ID)] = c;
          }
        }
        console.log(`✅ ${Object.keys(contactMap).length} ta contact yuklandi`);
      } catch (cErr) {
        console.warn("Batch contacts fetch notice:", cErr);
      }
    }

    const orders = limitedDeals.map((deal: any) => {
      const contact = deal.CONTACT_ID ? contactMap[String(deal.CONTACT_ID)] : undefined;
      return convertBitrixDealToOrder(deal, contact);
    });

    console.log(`🎉 ${orders.length} ta order yaratildi`);
    return orders;
  } catch (err) {
    console.error("fetchBitrixRecentDeals error:", err);
    throw err;
  }
};

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
// 🔥 Sertifikat raqamini yaratish (Imzo-2026-000001 formatida)
export const generateCertificateNumber = (dealId: string, orderDate?: string): string => {
  let year = new Date().getFullYear().toString();
  if (orderDate) {
    const date = new Date(orderDate);
    if (!isNaN(date.getTime())) {
      year = date.getFullYear().toString();
    }
  }
  const num = String(dealId).slice(-6).padStart(6, '0');
  return `Imzo-${year}-${num}`;
};

// 🔥 Sertifikat raqamidan yil va raqamni ajratib olish
export const parseCertificateNumber = (certNumber: string): { year: string; number: string; full: string } => {
  const parts = certNumber.split('-');
  if (parts.length === 3) {
    return {
      year: parts[1] || new Date().getFullYear().toString(),
      number: parts[2] || '000001',
      full: certNumber
    };
  }
  return {
    year: new Date().getFullYear().toString(),
    number: '000001',
    full: certNumber
  };
};
