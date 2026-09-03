export type OrderStatus = 
  | 'yangi' 
  | 'fabrikada' 
  | 'ishlab_chiqarishda' 
  | 'kontrol_kachestva' 
  | 'okk_otdi' 
  | 'yetkazib_berishda' 
  | 'topshirildi'
  // 🔥 Servis statuslari
  | 'servis_yangi'
  | 'servis_master'
  | 'servis_jarayonda'
  | 'servis_hal_qilindi'
  | 'servis_bekor_qilindi'
  | 'servis_montaj_tugallanmagan';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  model: string;
  color: string;
  areaSqM: number;
  dimensions: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface WarrantyDetails {
  certificateNumber: string;
  invoiceNumber: string;
  orderDate: string;
  readyDate: string;
  warrantyPeriodMonths: number;
  okkManagerName: string;
  okkManagerTitle: string;
  qualityScore: number;
  sealStampUrl: string;
  signatureUrl: string;
  qrCodeValue: string;
  terms: string[];
}

export type TicketStatus = 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi' | 'bekor_qilindi';

// 🔥 Servis statuslari (C1 pipeline ga mos)
export type ServiceStatus = 'yangi' | 'master' | 'jarayonda' | 'hal_qilindi' | 'bekor_qilindi' | 'montaj_tugallanmagan';

export interface ServiceTicket {
  id: string;
  orderId: string;
  invoiceNumber: string;
  clientFullName: string;
  clientPhone: string;
  category: string;
  problemDetails: string;
  photoUrls?: string[];
  createdAt: string;
  status: TicketStatus;
  // 🔥 Servis statusi (C1 pipeline ga mos)
  serviceStatus?: ServiceStatus;
  assignedSpecialist?: string;
  resolvedAt?: string;
  resolvedByManager?: string;
  resolutionNotes?: string;
  clientRating?: number;
  clientFeedback?: string;
  ratedAt?: string;
  // 🔥 Bitrix24 C1 deal ID
  bitrixDealId?: string;
}

export interface ClientCredentials {
  login: string;
  pinCode: string;
  directToken: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  clientFullName: string;
  clientPhone: string;
  clientAddress: string;
  showroomName: string;
  showroomId: string;
  salesManagerName: string;
  salesManagerPhone: string;
  orderDate: string;
  factorySentDate: string;
  productionStartDate: string;
  okkInspectionDate?: string;
  readyDate?: string;
  deliveredDate?: string;
  status: OrderStatus;
  products: ProductItem[];
  totalAmount: number;
  paidAmount: number;
  credentials: ClientCredentials;
  warranty: WarrantyDetails;
  smsSent: boolean;
  smsSentAt?: string;
  lastSmsText?: string;
  notes?: string;
}

export interface Showroom {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface ManagerUser {
  id: string;
  name: string;
  role: 'sales_manager' | 'okk_inspector' | 'service_lead' | 'admin';
  phone: string;
  department: string;
}

