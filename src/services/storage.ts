import { Order, ServiceTicket, OrderStatus, ProductItem, ServiceStatus } from '../types.js';
import { INITIAL_ORDERS, INITIAL_SERVICE_TICKETS } from '../data/mockData.js';
import { getBitrixWebhookUrl, callBitrixMethod } from './bitrixService.js';

const ORDERS_KEY = 'imzo_orders_v2';
const TICKETS_KEY = 'imzo_tickets_v2';
const AUTH_KEY = 'imzo_current_session';

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    let orders: Order[] = [];
    
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
      return [];
    }
    
    orders = JSON.parse(raw);

    const allowedStatuses: OrderStatus[] = [
      'okk_otdi',
      'kontrol_kachestva',
      'yetkazib_berishda',
      'topshirildi',
      'ishlab_chiqarishda',
      'yangi'
    ];
    
    orders = orders.filter((ord) => {
      if (!allowedStatuses.includes(ord.status)) {
        return false;
      }
      
      const pin = ord.credentials?.pinCode;
      if (!pin || pin === '0000' || pin === '-' || pin === '5638' || pin.trim().length === 0 || pin === "Bo'sh") {
        return false;
      }
      
      return true;
    });

    orders = orders.map((ord) => ({
      ...ord,
      showroomName: ord.showroomName && ord.showroomName.trim() !== '' && ord.showroomName !== '-' ? ord.showroomName : "Bo'sh",
      salesManagerName: ord.salesManagerName && ord.salesManagerName.trim() !== '' && ord.salesManagerName !== '-' ? ord.salesManagerName : "Bo'sh",
      clientPhone: ord.clientPhone && ord.clientPhone.trim() !== '' && ord.clientPhone !== '-' ? ord.clientPhone : "Bo'sh",
      clientFullName: ord.clientFullName && ord.clientFullName.trim() !== '' ? ord.clientFullName : "Bo'sh",
      clientAddress: ord.clientAddress && ord.clientAddress.trim() !== '' && ord.clientAddress !== '-' ? ord.clientAddress : "Bo'sh",
      salesManagerPhone: ord.salesManagerPhone && ord.salesManagerPhone.trim() !== '' && ord.salesManagerPhone !== '-' ? ord.salesManagerPhone : "Bo'sh",
      products: ord.products.map(p => ({
        ...p,
        model: p.model && p.model.trim() !== '' && p.model !== '-' ? p.model : "Bo'sh",
        color: p.color && p.color.trim() !== '' && p.color !== '-' ? p.color : "Bo'sh",
        dimensions: p.dimensions && p.dimensions.trim() !== '' && p.dimensions !== '-' ? p.dimensions : "Bo'sh",
      })),
      warranty: {
        ...ord.warranty,
        okkManagerName: ord.warranty.okkManagerName && ord.warranty.okkManagerName.trim() !== '' && ord.warranty.okkManagerName !== '-' ? ord.warranty.okkManagerName : "Bo'sh",
      }
    }));

    return orders;
  } catch (e) {
    console.error('Failed to load orders from storage', e);
    return [];
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    const MAX_ORDERS = 200;
    const limitedOrders = orders.slice(0, MAX_ORDERS);
    
    localStorage.setItem(ORDERS_KEY, JSON.stringify(limitedOrders));
    window.dispatchEvent(new Event('orders_updated'));
  } catch (e) {
    console.error('Failed to save orders', e);
    try {
      const MAX_ORDERS_FALLBACK = 100;
      const fallbackOrders = orders.slice(0, MAX_ORDERS_FALLBACK);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(fallbackOrders));
      window.dispatchEvent(new Event('orders_updated'));
    } catch (e2) {
      console.error('Even fallback failed', e2);
    }
  }
};

export const getStoredTickets = (): ServiceTicket[] => {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_SERVICE_TICKETS));
      return INITIAL_SERVICE_TICKETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tickets', e);
    return INITIAL_SERVICE_TICKETS;
  }
};

export const saveStoredTickets = (tickets: ServiceTicket[]) => {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('tickets_updated'));
  } catch (e) {
    console.error('Failed to save tickets', e);
  }
};

export const normalizePhone = (phone: string): string => {
  return (phone || '').replace(/\D/g, '');
};

export const getClientOrders = (identifier: string): Order[] => {
  const orders = getStoredOrders();
  if (!identifier) return [];
  const clean = identifier.trim().toUpperCase();
  const digits = normalizePhone(identifier);

  return orders.filter((o) => {
    const oDigits = normalizePhone(o.clientPhone);
    const matchesLogin = o.credentials.login.toUpperCase() === clean;
    const matchesInvoice = o.invoiceNumber.toUpperCase() === clean;
    const matchesPhone = digits.length >= 7 && (oDigits.endsWith(digits) || digits.endsWith(oDigits));
    const matchesToken = o.credentials.directToken === identifier.trim();
    const matchesName = o.clientFullName.toLowerCase() === identifier.trim().toLowerCase();
    return matchesLogin || matchesInvoice || matchesPhone || matchesToken || matchesName;
  });
};

export const generatePinCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const generateOrderToken = (invoiceNumber: string): string => {
  const cleanInv = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const rand = Math.random().toString(36).substring(2, 7);
  return `tok_${cleanInv}_${rand}`;
};

export const updateOrderStatus = (
  orderId: string, 
  newStatus: OrderStatus, 
  okkInspectorName: string = 'Alisher Rustamov'
): Order | null => {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const currentOrder = orders[index];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const updated: Order = {
    ...currentOrder,
    status: newStatus,
  };

  if (newStatus === 'kontrol_kachestva') {
    updated.okkInspectionDate = dateStr;
  }

  if (newStatus === 'okk_otdi') {
    updated.readyDate = dateStr;
    if (!updated.credentials.pinCode || updated.credentials.pinCode === "Bo'sh") {
      updated.credentials.pinCode = generatePinCode();
    }
    if (!updated.credentials.directToken) {
      updated.credentials.directToken = generateOrderToken(updated.invoiceNumber);
    }
    updated.warranty = {
      ...updated.warranty,
      readyDate: dateStr,
      okkManagerName: okkInspectorName || "Bo'sh",
      certificateNumber: `KT-${dateStr.replace(/-/g, '').slice(0, 6)}-${updated.invoiceNumber.replace(/[^0-9]/g, '') || '01'}`,
    };

    const directLink = `${window.location.origin}/?token=${updated.credentials.directToken}`;
    updated.lastSmsText = `Hurmatli ${updated.clientFullName.split(' ')[0]}! Sizning ${updated.invoiceNumber} buyurtmangiz OKK sifat nazoratidan muvaffaqiyatli o'tdi va tayyor bo'ldi. Kafolat taloni va kabinet havolasi: ${directLink} Login: ${updated.credentials.login} Parol: ${updated.credentials.pinCode}`;
  }

  orders[index] = updated;
  saveStoredOrders(orders);
  return updated;
};

export const markSmsSent = (orderId: string, customText?: string): Order | null => {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  orders[index] = {
    ...orders[index],
    smsSent: true,
    smsSentAt: timeStr,
    lastSmsText: customText || orders[index].lastSmsText,
  };

  saveStoredOrders(orders);
  return orders[index];
};

// ServiceStatus ni TicketStatus ga o'tkazish
export const mapServiceStatusToTicketStatus = (serviceStatus: string): 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi' | 'bekor_qilindi' => {
  const map: Record<string, 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi' | 'bekor_qilindi'> = {
    'yangi': 'yangi',
    'master': 'usta_biriktirildi',
    'jarayonda': 'jarayonda',
    'hal_qilindi': 'hal_qilindi',
    'bekor_qilindi': 'bekor_qilindi',
    'montaj_tugallanmagan': 'jarayonda',
  };
  return map[serviceStatus] || 'yangi';
};

// 🔥 Bitrix24 C1 pipeline ga servis zayavkasini yuborish (TUZATILGAN)
export const sendServiceRequestToBitrix = async (ticket: ServiceTicket): Promise<string | null> => {
  try {
    const webhookUrl = getBitrixWebhookUrl();
    if (!webhookUrl) {
      console.warn('Bitrix24 Webhook URL sozlanmagan');
      return null;
    }

    const allOrders = getStoredOrders();
    const matchedOrder = allOrders.find(
      (o) => o.invoiceNumber.toUpperCase() === ticket.invoiceNumber.toUpperCase()
    );

    const contactName = ticket.clientFullName || matchedOrder?.clientFullName || 'Mijoz';
    const contactPhone = ticket.clientPhone || matchedOrder?.clientPhone || '+998 90 000 00 00';
    const showroomName = matchedOrder?.showroomName || "Ko'rsatilmagan";
    const salesManager = matchedOrder?.salesManagerName || "Ko'rsatilmagan";

    let contactId = null;

    // Telefon raqamni turli formatlarda qidirish
    const cleanPhone = normalizePhone(contactPhone);
    const shortPhone = cleanPhone.slice(-9);
    const plusPhone = `+${cleanPhone}`;
    const spacedPhone = contactPhone;

    console.log('🔍 Contact qidirilmoqda. Formatlar:', { cleanPhone, shortPhone, plusPhone, spacedPhone });

    try {
      const searchFilters = [
        { "PHONE": shortPhone },
        { "PHONE": cleanPhone },
        { "PHONE": plusPhone },
        { "PHONE": spacedPhone }
      ];

      let foundContact = null;
      for (const filter of searchFilters) {
        const searchResult = await callBitrixMethod('crm.contact.list', {
          filter: filter,
          select: ["ID", "NAME", "PHONE"]
        });

        if (Array.isArray(searchResult) && searchResult.length > 0) {
          foundContact = searchResult[0];
          console.log('📞 Contact topildi! Filter:', filter, 'Contact:', foundContact);
          break;
        }
      }

      if (foundContact) {
        contactId = foundContact.ID;
        console.log('✅ Mavjud contact topildi ID:', contactId);
      } else {
        console.warn('⚠️ Telefon bo\'yicha contact topilmadi.');
      }
    } catch (searchErr) {
      console.warn('Contact qidirishda xatolik:', searchErr);
    }

    if (!contactId) {
      try {
        const newContact = await callBitrixMethod('crm.contact.add', {
          fields: {
            NAME: contactName.split(' ')[0] || 'Mijoz',
            LAST_NAME: contactName.split(' ').slice(1).join(' ') || '',
            PHONE: [
              {
                "VALUE": contactPhone,
                "VALUE_TYPE": "WORK"
              }
            ],
            COMMENTS: `Showroom: ${showroomName}\nMenejer: ${salesManager}`
          }
        });
        contactId = newContact?.ID;
        console.log('✅ Yangi contact yaratildi ID:', contactId);
      } catch (createErr) {
        console.error('❌ Contact yaratishda xatolik:', createErr);
        return null;
      }
    }

    if (!contactId) {
      console.error('❌ Contact ID topilmadi');
      return null;
    }

    // 🔥 Deal yaratish
    const result = await callBitrixMethod('crm.deal.add', {
      fields: {
        TITLE: `Servis zayavkasi #${ticket.id} - ${contactName}`,
        TYPE_ID: 'SERVICE',
        CATEGORY_ID: 1,
        STAGE_ID: 'C1:NEW',
        CONTACT_ID: contactId,
        COMMENTS: `
Mijoz: ${contactName}
Telefon: ${contactPhone}
Schet: ${ticket.invoiceNumber}
Showroom: ${showroomName}
Mas'ul menejer: ${salesManager}
Toifa: ${ticket.category}
Muammo: ${ticket.problemDetails}
        `.trim(),
        // 🔥 Servis maydonlari
        UF_CRM_SERVICE_TICKET_ID: ticket.id,
        UF_CRM_SERVICE_INVOICE: ticket.invoiceNumber,
        UF_CRM_SERVICE_CATEGORY: ticket.category,
        UF_CRM_SERVICE_STATUS: 'yangi',
        UF_CRM_SERVICE_SHOWROOM: showroomName,
        // 🔥 YANGI: № счёта maydoniga schet raqam yoziladi
        "UF_CRM_1644304018": ticket.invoiceNumber,  // № счёта
      }
    });

    console.log('✅ Servis zayavkasi Bitrix24 C1 pipeline ga yuborildi:', result);
    
    if (result && result.ID) {
      return result.ID;
    }
    return null;
  } catch (err) {
    console.error('Bitrix24 C1 pipeline ga yuborishda xatolik:', err);
    return null;
  }
};

// Bitrix24 C1 pipeline da servis statusini yangilash
export const updateBitrixServiceStatus = async (ticket: ServiceTicket): Promise<void> => {
  try {
    if (!ticket.bitrixDealId) {
      console.warn('Bitrix24 deal ID yo\'q, status yangilanmadi');
      return;
    }

    const stageMap: Record<string, string> = {
      'yangi': 'C1:NEW',
      'master': 'C1:UC_WV7G2R',
      'jarayonda': 'C1:UC_PIL0QY',
      'hal_qilindi': 'C1:WON',
      'bekor_qilindi': 'C1:LOSE',
      'montaj_tugallanmagan': 'C1:UC_E0X40P',
    };

    const stageId = stageMap[ticket.serviceStatus || 'yangi'] || 'C1:NEW';

    await callBitrixMethod('crm.deal.update', {
      id: ticket.bitrixDealId,
      fields: {
        STAGE_ID: stageId,
        UF_CRM_SERVICE_STATUS: ticket.serviceStatus || 'yangi',
      }
    });

    console.log(`✅ Bitrix24 C1 pipeline status yangilandi: ${ticket.serviceStatus} -> ${stageId}`);

    const tickets = getStoredTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets[index].serviceStatus = ticket.serviceStatus || 'yangi';
      tickets[index].status = mapServiceStatusToTicketStatus(ticket.serviceStatus || 'yangi');
      saveStoredTickets(tickets);
    }

  } catch (err) {
    console.error('Bitrix24 C1 pipeline status yangilashda xatolik:', err);
  }
};

// Servis ticket yaratish
export const createServiceTicket = async (
  order: Order,
  category: string,
  problemDetails: string,
  customInvoiceNumber?: string,
  customPhone?: string,
  photos?: string[]
): Promise<ServiceTicket> => {
  const tickets = getStoredTickets();
  const allOrders = getStoredOrders();
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const finalInvoice = (customInvoiceNumber || order.invoiceNumber).trim();
  const matchedOrder = allOrders.find(
    (o) => o.invoiceNumber.toUpperCase() === finalInvoice.toUpperCase()
  );

  const newTicket: ServiceTicket = {
    id: `srv-${Date.now().toString().slice(-4)}`,
    orderId: matchedOrder ? matchedOrder.id : order.id,
    invoiceNumber: finalInvoice,
    clientFullName: matchedOrder ? matchedOrder.clientFullName : order.clientFullName,
    clientPhone: customPhone || (matchedOrder ? matchedOrder.clientPhone : order.clientPhone),
    category,
    problemDetails,
    photoUrls: photos || [],
    createdAt: timeStr,
    status: 'yangi',
    serviceStatus: 'yangi',
    showroomName: matchedOrder?.showroomName || order.showroomName,
    salesManagerName: matchedOrder?.salesManagerName || order.salesManagerName,
  };

  tickets.unshift(newTicket);
  saveStoredTickets(tickets);
  
  const bitrixDealId = await sendServiceRequestToBitrix(newTicket);
  if (bitrixDealId) {
    const updatedTickets = getStoredTickets();
    const index = updatedTickets.findIndex(t => t.id === newTicket.id);
    if (index !== -1) {
      updatedTickets[index].bitrixDealId = bitrixDealId;
      saveStoredTickets(updatedTickets);
    }
  }
  
  window.dispatchEvent(new Event('tickets_updated'));
  return newTicket;
};

export const updateTicketStatus = (
  ticketId: string,
  status: 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi' | 'bekor_qilindi',
  assignedSpecialist?: string
): ServiceTicket | null => {
  const tickets = getStoredTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const serviceStatusMap: Record<string, ServiceStatus> = {
    'yangi': 'yangi',
    'jarayonda': 'jarayonda',
    'usta_biriktirildi': 'master',
    'hal_qilindi': 'hal_qilindi',
    'bekor_qilindi': 'bekor_qilindi',
  };

  tickets[index] = {
    ...tickets[index],
    status,
    serviceStatus: serviceStatusMap[status] || 'yangi',
    assignedSpecialist: assignedSpecialist || tickets[index].assignedSpecialist,
    ...(status === 'hal_qilindi' && !tickets[index].resolvedAt ? { 
      resolvedAt: timeStr, 
      resolvedByManager: assignedSpecialist || 'Servis Menejeri' 
    } : {})
  };

  saveStoredTickets(tickets);
  
  const updatedTicket = tickets[index];
  if (updatedTicket.bitrixDealId) {
    updateBitrixServiceStatus(updatedTicket);
  }
  
  return tickets[index];
};

export const resolveServiceTicket = (
  ticketId: string,
  resolvedByManager: string,
  resolutionNotes: string,
  assignedSpecialist?: string
): ServiceTicket | null => {
  const tickets = getStoredTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const updated: ServiceTicket = {
    ...tickets[index],
    status: 'hal_qilindi',
    serviceStatus: 'hal_qilindi',
    resolvedAt: timeStr,
    resolvedByManager,
    resolutionNotes,
    assignedSpecialist: assignedSpecialist || tickets[index].assignedSpecialist || resolvedByManager,
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  
  if (updated.bitrixDealId) {
    updateBitrixServiceStatus(updated);
  }
  
  return updated;
};

export const rateServiceTicket = (
  ticketId: string,
  rating: number,
  feedback?: string
): ServiceTicket | null => {
  const tickets = getStoredTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  tickets[index] = {
    ...tickets[index],
    clientRating: rating,
    clientFeedback: feedback || '',
    ratedAt: timeStr,
  };

  saveStoredTickets(tickets);
  return tickets[index];
};

export const createNewOrder = (orderData: Partial<Order>): Order => {
  const orders = getStoredOrders();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const invNum = orderData.invoiceNumber || `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const existingClientOrder = orders.find(
    (o) =>
      (orderData.clientPhone && normalizePhone(o.clientPhone) === normalizePhone(orderData.clientPhone)) ||
      (orderData.clientFullName && o.clientFullName.toLowerCase().trim() === orderData.clientFullName.toLowerCase().trim())
  );

  const login = existingClientOrder ? existingClientOrder.credentials.login : invNum.replace(/[^a-zA-Z0-9]/g, '');
  const pin = existingClientOrder ? existingClientOrder.credentials.pinCode : generatePinCode();
  const directToken = generateOrderToken(invNum);

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    invoiceNumber: invNum,
    clientFullName: orderData.clientFullName || 'Yangi Xaridor',
    clientPhone: orderData.clientPhone || '+998 90 000 00 00',
    clientAddress: orderData.clientAddress || 'Toshkent shahar',
    showroomName: orderData.showroomName || 'Toshkent "Chilonzor-9" Flagship Showroom',
    showroomId: orderData.showroomId || 'sh-1',
    salesManagerName: orderData.salesManagerName || 'Bobur Karimov',
    salesManagerPhone: '+998 90 123-45-67',
    orderDate: dateStr,
    factorySentDate: dateStr,
    productionStartDate: dateStr,
    status: orderData.status || 'ishlab_chiqarishda',
    products: orderData.products || [
      {
        id: `p-${Date.now()}`,
        name: 'MDF Emal Ichki Eshiklar',
        category: 'Eshiklar',
        model: 'Modern Classic-01',
        color: 'Oq Emal',
        areaSqM: 12.0,
        dimensions: '2100x800x120 mm',
        quantity: 4,
        unitPrice: 2800000,
        totalPrice: 11200000,
      }
    ],
    totalAmount: orderData.totalAmount || 11200000,
    paidAmount: orderData.paidAmount || 11200000,
    credentials: {
      login,
      pinCode: pin,
      directToken,
    },
    warranty: {
      certificateNumber: `KT-${dateStr.replace(/-/g, '').slice(0, 6)}-${login.slice(-4)}`,
      invoiceNumber: invNum,
      orderDate: dateStr,
      readyDate: dateStr,
      warrantyPeriodMonths: 60,
      okkManagerName: 'Alisher Rustamov',
      okkManagerTitle: 'Bosh sifat nazorati muhandisi (OKK boshlig\'i)',
      qualityScore: 99.8,
      sealStampUrl: 'stamp_verified',
      signatureUrl: 'sig_alisher',
      qrCodeValue: `VERIFY:${invNum}:ALISHER_RUSTAMOV:OKK_PASS:60_MONTHS`,
      terms: [
        'Ishlab chiqarish nuqsonlari va furnituraga 60 oy (5 yil) to\'liq kafolat taqdim etiladi.',
        'Muntazam bepul profilaktika va servis xizmati kafolatlanadi.',
      ],
    },
    smsSent: false,
    notes: orderData.notes || '',
  };

  orders.unshift(newOrder);
  saveStoredOrders(orders);
  return newOrder;
};

export const resetDemoData = () => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_SERVICE_TICKETS));
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('orders_updated'));
  window.dispatchEvent(new Event('tickets_updated'));
};
// ============================================================
// AUTH SESSION (Login holatini saqlash)
// ============================================================

const AUTH_SESSION_KEY = 'imzo_auth_session';

export interface AuthSession {
  orderId: string;
  login: string;
  pinCode: string;
  timestamp: number;
}

export const saveAuthSession = (session: AuthSession): void => {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
};

export const getAuthSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get auth session', e);
    return null;
  }
};

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
};

// Session muddati (7 kun)
export const isAuthSessionValid = (session: AuthSession): boolean => {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return (now - session.timestamp) < sevenDays;
};
// storage.ts - OXIRIGA QO'SHING

// ============================================================
// SERTIFIKAT RAQAMI GENERATORI
// ============================================================

export const generateCertificateNumber = (): string => {
  const year = new Date().getFullYear();
  
  // LocalStorage dan oxirgi sertifikat raqamini olish
  const lastCertKey = 'imzo_last_cert_number';
  let lastNumber = parseInt(localStorage.getItem(lastCertKey) || '0', 10);
  
  // Keyingi raqam
  lastNumber += 1;
  
  // 7 xonali formatga keltirish (masalan: 0000001)
  const paddedNumber = String(lastNumber).padStart(7, '0');
  
  // Saqlash
  localStorage.setItem(lastCertKey, String(lastNumber));
  
  return `Imzo-${year}-${paddedNumber}`;
};

// Sertifikat raqamini qo'lda o'rnatish (agar kerak bo'lsa)
export const resetCertificateCounter = (startFrom: number = 0): void => {
  localStorage.setItem('imzo_last_cert_number', String(startFrom));
};
