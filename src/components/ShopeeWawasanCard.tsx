import React, { useState } from 'react';
import { Info, ShoppingBag } from 'lucide-react';
import { LiveSession } from '../types';

interface ShopeeWawasanCardProps {
  session: Partial<LiveSession>;
  className?: string;
  showStatusSelector?: boolean;
  onStatusChange?: (status: 'Pesanan Dibuat' | 'Pesanan Dibayar' | 'Pesanan Selesai') => void;
}

export const ShopeeWawasanCard: React.FC<ShopeeWawasanCardProps> = ({
  session,
  className = '',
  showStatusSelector = true,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<'Pesanan Dibuat' | 'Pesanan Dibayar' | 'Pesanan Selesai'>(
    session.orderStatus || 'Pesanan Dibuat'
  );

  const handleStatusSelect = (newStatus: 'Pesanan Dibuat' | 'Pesanan Dibayar' | 'Pesanan Selesai') => {
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);
  };

  // Safe metric resolution with fallback to calculated values
  const revenue = session.revenue || 0;
  const activeViewers = session.activeViewers || Math.round((session.peakViewers || 100) * 0.7);
  const comments = session.comments || 0;
  const addToCart = session.addToCart || session.productClicks || 0;

  // Row 1
  const totalViews = session.totalViews || session.viewers || 0;
  const avgWatchDuration = session.avgWatchDuration || '00:00:35';
  const commentRate = session.commentRate !== undefined 
    ? session.commentRate 
    : (totalViews > 0 ? Number(((comments / totalViews) * 100).toFixed(1)) : 0);
  const rpm = session.rpm || (totalViews > 0 ? Math.round((revenue / totalViews) * 1000) : 0);
  const orders = session.orders || 0;
  const aov = session.averageOrderValue || (orders > 0 ? Math.round(revenue / orders) : 0);

  // Row 2
  const uniqueViewers = session.uniqueViewers || Math.round(totalViews * 0.85);
  const peakViewers = session.peakViewers || 0;
  const clickRate = session.clickRate !== undefined 
    ? session.clickRate 
    : (totalViews > 0 ? Number(((addToCart / totalViews) * 100).toFixed(1)) : 0);
  const conversionRate = session.conversionRate !== undefined 
    ? session.conversionRate 
    : (addToCart > 0 ? Number(((orders / addToCart) * 100).toFixed(1)) : 0);
  const buyers = session.buyers || orders;
  const productsSold = session.productsSold || orders;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Shopee Wawasan Livestream Header Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
          <span>Wawasan Livestream</span>
        </h3>

        {showStatusSelector && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Pesanan</span>
            <select
              value={status}
              onChange={(e) => handleStatusSelect(e.target.value as any)}
              className="bg-white border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-orange-500 focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="Pesanan Dibuat">Pesanan Dibuat</option>
              <option value="Pesanan Dibayar">Pesanan Dibayar</option>
              <option value="Pesanan Selesai">Pesanan Selesai</option>
            </select>
          </div>
        )}
      </div>

      {/* Shopee Official Orange Wawasan Livestream Container */}
      <div className="bg-[#f04f26] text-white rounded-2xl p-5 sm:p-6 shadow-md select-none">
        
        {/* Main Banner Metric: Penjualan (Rp) */}
        <div className="text-center mb-5">
          <div className="text-xs font-semibold text-white/90 mb-1 flex items-center justify-center gap-1">
            <span>Penjualan (Rp)</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>{revenue.toLocaleString('id-ID')}</span>
            <span title="Total nilai kotor transaksi pesanan livestream">
              <Info className="w-4 h-4 text-white/80 shrink-0 cursor-help" />
            </span>
          </div>
        </div>

        {/* 3 Middle Sub-Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
          <div className="bg-white/12 hover:bg-white/16 transition-colors rounded-xl p-3 sm:p-4 text-center backdrop-blur-xs">
            <span className="text-[11px] sm:text-xs text-white/85 font-medium block truncate">
              Penonton Aktif
            </span>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              {activeViewers.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-white/12 hover:bg-white/16 transition-colors rounded-xl p-3 sm:p-4 text-center backdrop-blur-xs">
            <span className="text-[11px] sm:text-xs text-white/85 font-medium block truncate">
              Komentar
            </span>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              {comments.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-white/12 hover:bg-white/16 transition-colors rounded-xl p-3 sm:p-4 text-center backdrop-blur-xs">
            <span className="text-[11px] sm:text-xs text-white/85 font-medium block truncate">
              Tambah ke Keranjang
            </span>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              {addToCart.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Bottom Detailed Metrics 2 Rows (6 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-2 pt-2 border-t border-white/20 text-center">
          
          {/* Col 1: Dilihat & Penonton */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Dilihat</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {totalViews.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Penonton</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {uniqueViewers.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Col 2: Durasi Rata-Rata Menonton & Penonton Tertinggi */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight truncate" title="Durasi Rata-Rata Menonton">
                Durasi Rata-Rata Menon...
              </span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block font-mono">
                {avgWatchDuration}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Penonton Tertinggi</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {peakViewers.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Col 3: Persentase Komentar & Persentase Klik */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Persentase Komentar</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {String(commentRate).replace('.', ',')}%
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Persentase Klik</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {String(clickRate).replace('.', ',')}%
              </span>
            </div>
          </div>

          {/* Col 4: Penjualan per mil (Rp) & Pesanan per Klik */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Penjualan per mil (Rp)</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {rpm.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Pesanan per Klik</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {String(conversionRate).replace('.', ',')}%
              </span>
            </div>
          </div>

          {/* Col 5: Pesanan & Pembeli */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Pesanan</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {orders.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Pembeli</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {buyers.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Col 6: Nilai Penjualan per Pesanan & Produk Terjual */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight truncate" title="Nilai Penjualan per Pesanan">
                Nilai Penjualan per Pesa...
              </span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {aov.toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-white/80 block leading-tight">Produk Terjual</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {productsSold.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
