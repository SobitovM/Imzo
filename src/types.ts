export type OrderStatus = 
  | 'yangi' 
  | 'fabrikada' 
  | 'ishlab_chiqarishda' 
  | 'kontrol_kachestva' 
  | 'okk_otdi' 
  | 'yetkazib_berishda' 
  | 'topshirildi';

export interface ProductItem {
  id: string;
  name: string;
  category: string; // e.g. 'MDF Eshik', 'Alyumin Rom', 'Oshxona Mebeli', 'Laminat'
  model: string;
  color: string; // e.g. 'Oq Emal / Oltin Patina', 'Antratsit Mat'
  areaSqM: number; // kv.m
  dimensions: string; // e.g. '2100x800x120 mm'
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface WarrantyDetails {
  certificateNumber: string;
  invoiceNumber: string; // Schet raqam
  orderDate: string; // Buyurtma sanasi
  readyDate: string; // Tayyor bo'lgan sana
  warrantyPeriodMonths: number; // e.g. 60 oy (5 yil)
  okkManagerName: string; // Sifat nazorati menejeri
  okkManagerTitle: string;
  qualityScore: number; // 99.8%
  sealStampUrl: string;
  signatureUrl: string;
  qrCodeValue: string;
  terms: string[];
}

export type TicketStatus = 'yangi' | 'jarayonda' | 'usta_biriktirildi' | 'hal_qilindi' | 'bekor_qilindi';

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
  assignedSpecialist?: string;
  resolvedAt?: string;
  resolvedByManager?: string;
  resolutionNotes?: string;
  clientRating?: number; // 1 to 5
  clientFeedback?: string;
  ratedAt?: string;
}

export interface ClientCredentials {
  login: string;
  pinCode: string;
  directToken: string;
}

export interface Order {
  id: string;
  invoiceNumber: string; // e.g. "SCH-2026-8841"
  clientFullName: string;
  clientPhone: string;
  clientAddress: string;
  showroomName: string;
  showroomId: string;
  salesManagerName: string;
  salesManagerPhone: string;
  
  orderDate: string; // Buyurtma berilgan sana
  factorySentDate: string; // Fabrikaga berilgan sana
  productionStartDate: string; // Ishlab chiqarishga kirgan sana
  okkInspectionDate?: string; // OKK ga kirgan sana
  readyDate?: string; // Tayyor bo'lgan sana (OKK dan o'tgan)
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
