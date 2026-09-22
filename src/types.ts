/**
 * AT - Live Reports: Types & Interfaces
 * Sistem Monitoring, Analytics & Performance Management Tim Live Streamer Shopee
 */

export type UserRole = 'ADMIN' | 'STREAMER';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  streamerId?: string;
  photoURL?: string;
}

export interface Streamer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar: string;
  joinDate: string;
  notes?: string;
  totalRevenue?: number;
  totalOrders?: number;
  totalHours?: number;
  averageCvr?: number;
}

export interface Shift {
  id: string;
  name: string;
  code: string; // e.g., 'SHIFT 1', 'SHIFT 2', 'SHIFT 3', 'SHIFT EXTRA'
  startTime: string; // '06:00'
  endTime: string; // '12:00'
  durationHours: number;
  isOvernight?: boolean;
}

export interface Schedule {
  id: string;
  date: string; // 'YYYY-MM-DD'
  streamerId: string;
  streamerName: string;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Missed';
  hasReport: boolean;
  reportId?: string;
  notes?: string;
  createdAt?: string;
}

export interface ProductSoldItem {
  id?: string;
  sku: string;
  productName: string;
  category?: string;
  quantity: number;
  price: number;
  revenue: number;
}

export interface LiveSession {
  id: string;
  streamerId: string;
  streamerName: string;
  businessDate: string; // 'YYYY-MM-DD'
  shiftId: string;
  shiftName: string;
  startTime: string; // '06:00'
  endTime: string; // '12:00'
  durationMinutes: number;
  durationHours: number;

  // Shopee Wawasan Livestream Official Fields
  orderStatus?: 'Pesanan Dibuat' | 'Pesanan Dibayar' | 'Pesanan Selesai'; // Status Pesanan
  revenue: number; // Penjualan (Rp)
  activeViewers?: number; // Penonton Aktif
  comments: number; // Komentar
  addToCart?: number; // Tambah ke Keranjang
  
  // Rincian Baris 1 Wawasan Livestream
  totalViews?: number; // Dilihat (Total Views/Impresi tayangan)
  viewers: number; // Backwards compatible alias for Dilihat / Total Tayangan
  avgWatchDuration?: string; // Durasi Rata-Rata Menonton (Format HH:MM:SS, cth: 00:00:35)
  commentRate?: number; // Persentase Komentar (%)
  rpm?: number; // Penjualan per mil (Rp) - Revenue per 1,000 views
  orders: number; // Pesanan
  averageOrderValue: number; // Nilai Penjualan per Pesanan (Rp)

  // Rincian Baris 2 Wawasan Livestream
  uniqueViewers: number; // Penonton (Unique Viewers)
  peakViewers: number; // Penonton Tertinggi
  averageViewers?: number; // Rata-rata Penonton (Concurrent)
  clickRate?: number; // Persentase Klik (%)
  conversionRate: number; // Pesanan per Klik (%)
  buyers?: number; // Pembeli (Unique Buyers)
  productsSold: number; // Produk Terjual (Pcs)
  
  // Engagement Tambahan
  likes: number;
  shares: number;
  newFollowers: number;
  totalFollowers?: number;
  
  // Funnel & Conversion Tambahan
  productImpressions: number; // Tayangan produk di live
  productClicks: number; // Klik keranjang produk
  checkout: number; // Klik checkout
  
  // Diskon, Iklan, & Pengembalian
  voucherUsed: number; // Jumlah voucher toko terpakai
  cancelledOrders: number; // Pesanan dibatalkan
  refundOrders: number; // Pengembalian
  refundAmount: number; // Nominal pengembalian Rp
  affiliateOrders: number;
  affiliateRevenue: number;
  adsSpend: number; // Biaya Iklan Shopee Live Rp
  
  // Efficiency
  revenuePerHour: number; // Omset / Jam
  ordersPerHour: number; // Pesanan / Jam
  viewersPerHour: number; // Penonton / Jam
  revenuePerViewer: number; // Omset / Penonton
  
  // Products breakdown
  products?: ProductSoldItem[];
  
  // Insights & Notes
  notes?: string;
  
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface KPITarget {
  id: string;
  title: string;
  type: 'individual' | 'team';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metric: 'revenue' | 'orders' | 'viewers' | 'hours';
  targetValue: number;
  currentValue?: number;
  streamerId?: string;
  streamerName?: string;
  year: number;
  month?: number;
  startDate: string;
  endDate: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'shift' | 'reminder' | 'report' | 'target' | 'admin' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  scheduleId?: string;
  streamerId?: string;
  streamerName?: string;
  shiftName?: string;
  date?: string;
  priority?: 'high' | 'normal' | 'low';
  needsReport?: boolean;
}

export interface ProductCatalog {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock?: number;
  status: 'active' | 'inactive';
}
