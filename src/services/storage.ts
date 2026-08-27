import { Order, ServiceTicket, OrderStatus, ProductItem } from '../types';
import { INITIAL_ORDERS, INITIAL_SERVICE_TICKETS } from '../data/mockData';

const ORDERS_KEY = 'imzo_orders_v2';
const TICKETS_KEY = 'imzo_tickets_v2';
const AUTH_KEY = 'imzo_current_session';

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    let orders: Order[];
    if (!raw) {
      // Clear legacy storage if present
      try {
        localStorage.removeItem('fabrika_orders_v1');
      } catch (_) {}
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      orders = INITIAL_ORDERS;
    } else {
      orders = JSON.parse(raw);
    }

    // Force migration of all orders to 60 months warranty
    let modified = false;
    orders = orders.map((ord) => {
      if (ord.warranty && (ord.warranty.warrantyPeriodMonths === 36 || !ord.warranty.warrantyPeriodMonths)) {
        modified = true;
        return {
          ...ord,
          warranty: {
            ...ord.warranty,
            warrantyPeriodMonths: 60,
            terms: ord.warranty.terms.map(t => t.replace(/36\s*oy/gi, '60 oy (5 yil)')),
            qrCodeValue: (ord.warranty.qrCodeValue || '').replace('36_MONTHS', '60_MONTHS')
          }
        };
      }
      return ord;
    });

    if (modified) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    return orders;
  } catch (e) {
    console.error('Failed to load orders from storage', e);
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('orders_updated'));
  } catch (e) {
    console.error('Failed to save orders', e);
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

// Phone normalizer
export const normalizePhone = (phone: string): string => {
  return (phone || '').replace(/\D/g, '');
};

// Get all orders for a client based on phone, login, token or client name
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

// Generate random pin code
export const generatePinCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate unique order token
export const generateOrderToken = (invoiceNumber: string): string => {
  const cleanInv = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const rand = Math.random().toString(36).substring(2, 7);
  return `tok_${cleanInv}_${rand}`;
};

// Change Order Status (e.g. by OKK manager or Bitrix)
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
    // Generate credentials if not present or refreshed
    if (!updated.credentials.pinCode) {
      updated.credentials.pinCode = generatePinCode();
    }
    if (!updated.credentials.directToken) {
      updated.credentials.directToken = generateOrderToken(updated.invoiceNumber);
    }
    // Update warranty details
    updated.warranty = {
      ...updated.warranty,
      readyDate: dateStr,
      okkManagerName: okkInspectorName,
      certificateNumber: `KT-${dateStr.replace(/-/g, '').slice(0, 6)}-${updated.invoiceNumber.replace(/[^0-9]/g, '') || '01'}`,
    };

    const directLink = `${window.location.origin}/?token=${updated.credentials.directToken}`;
    updated.lastSmsText = `Hurmatli ${updated.clientFullName.split(' ')[0]}! Sizning ${updated.invoiceNumber} buyurtmangiz OKK sifat nazoratidan muvaffaqiyatli o'tdi va tayyor bo'ldi. Kafolat taloni va kabinet havolasi: ${directLink} Login: ${updated.credentials.login} Parol: ${updated.credentials.pinCode}`;
  }

  orders[index] = updated;
  saveStoredOrders(orders);
  return updated;
};

// Send SMS Simulation
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

// Add new service ticket from client
export const createServiceTicket = (
  order: Order,
  category: string,
  problemDetails: string,
  customInvoiceNumber?: string,
  customPhone?: string,
  photos?: string[]
): ServiceTicket => {
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
  };

  tickets.unshift(newTicket);
  saveStoredTickets(tickets);
  return newTicket;
};

// Update ticket status in Bitrix CRM funnel
export const updateTicketStatus = (
  ticketId: string,
  status: 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi',
  assignedSpecialist?: string
): ServiceTicket | null => {
  const tickets = getStoredTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  tickets[index] = {
    ...tickets[index],
    status,
    assignedSpecialist: assignedSpecialist || tickets[index].assignedSpecialist,
    ...(status === 'hal_qilindi' && !tickets[index].resolvedAt ? { resolvedAt: timeStr, resolvedByManager: assignedSpecialist || 'Servis Menejeri' } : {})
  };

  saveStoredTickets(tickets);
  return tickets[index];
};

// Resolve Service Ticket
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
    resolvedAt: timeStr,
    resolvedByManager,
    resolutionNotes,
    assignedSpecialist: assignedSpecialist || tickets[index].assignedSpecialist || resolvedByManager,
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  return updated;
};

// Rate Service Ticket
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

// Add New Order (from Manager / Bitrix Simulator)
export const createNewOrder = (orderData: Partial<Order>): Order => {
  const orders = getStoredOrders();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const invNum = orderData.invoiceNumber || `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Check if client already exists by phone or name to ensure ONE SINGLE LOGIN and ONE PIN
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

// Reset to factory defaults if user wants to test freshly
export const resetDemoData = () => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_SERVICE_TICKETS));
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('orders_updated'));
  window.dispatchEvent(new Event('tickets_updated'));
};
