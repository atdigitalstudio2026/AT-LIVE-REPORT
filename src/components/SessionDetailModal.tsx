import React, { useId, useState } from 'react';
import { 
  X, 
  FileText, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock, 
  TrendingUp, 
  Percent, 
  CheckCircle2,
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';
import { LiveSession } from '../types';
import { exportSingleSessionPdf, generateWhatsAppSessionRecap } from '../lib/exportUtils';
import { ShopeeWawasanCard } from './ShopeeWawasanCard';

interface SessionDetailModalProps {
  session: LiveSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const modalTitleId = useId();
  const [isWaCopied, setIsWaCopied] = useState(false);

  if (!isOpen || !session) return null;

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppSessionRecap(session);
    navigator.clipboard.writeText(text);
    setIsWaCopied(true);
    setTimeout(() => setIsWaCopied(false), 2500);

    // Also offer direct WhatsApp web/app link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id={modalTitleId} className="text-base sm:text-lg font-extrabold leading-tight">
                Detail Laporan Sesi Shopee Live
              </h2>
              <p className="text-xs text-slate-300">
                {session.businessDate} • {session.shiftName} ({session.startTime} - {session.endTime})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
          
          {/* Host & High-level stats banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Host Streamer</span>
              <p className="text-lg font-extrabold text-slate-900">{session.streamerName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Durasi Live: <span className="font-bold text-slate-800">{session.durationHours} Jam ({session.durationMinutes} Menit)</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Omset (GMV)</span>
                <span className="text-base font-extrabold text-[#ee4d2d]">
                  Rp {(session.revenue || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Pesanan</span>
                <span className="text-base font-extrabold text-slate-900">
                  {session.orders} orders
                </span>
              </div>
            </div>
          </div>

          {/* Official Shopee Live Wawasan Livestream Card */}
          <ShopeeWawasanCard session={session} showStatusSelector={true} />

          {/* Grid of Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Rata-rata Order (AOV)</span>
              <span className="font-bold text-slate-900 text-sm">
                Rp {(session.averageOrderValue || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Omset per Jam</span>
              <span className="font-bold text-[#ee4d2d] text-sm">
                Rp {(session.revenuePerHour || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Konversi (CVR)</span>
              <span className="font-bold text-emerald-600 text-sm">
                {session.conversionRate}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Produk Terjual</span>
              <span className="font-bold text-slate-900 text-sm">
                {session.productsSold || session.orders} pcs
              </span>
            </div>
          </div>

          {/* Shopee Live Funnel */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              Funnel Keranjang Kuning & Trafik Shopee
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Total Viewers</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {(session.viewers || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-400 block">Peak: {session.peakViewers || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Impresi Produk</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {(session.productImpressions || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-400 block">Di etalase</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Klik Keranjang</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {(session.productClicks || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-400 block">CTR Clicks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Total Orders</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {session.orders}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold block">CVR {session.conversionRate}%</span>
              </div>
            </div>
          </div>

          {/* Social Engagement & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Interaksi & Komunitas</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span className="font-bold text-slate-900">{(session.likes || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Komentar:</span>
                  <span className="font-bold text-slate-900">{(session.comments || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Share:</span>
                  <span className="font-bold text-slate-900">{(session.shares || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Followers Baru:</span>
                  <span className="font-bold text-indigo-600">+{session.newFollowers || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Biaya, Retur & Pembatalan</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Biaya Iklan Live Ads:</span>
                  <span className="font-bold text-slate-900">Rp {(session.adsSpend || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voucher Toko Terpakai:</span>
                  <span className="font-bold text-slate-900">{session.voucherUsed || 0} voucher</span>
                </div>
                <div className="flex justify-between">
                  <span>Pesanan Dibatalkan:</span>
                  <span className="font-bold text-red-500">{session.cancelledOrders || 0} orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Retur / Pengembalian:</span>
                  <span className="font-bold text-red-500">Rp {(session.refundAmount || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Produk Terlaris if any */}
          {session.products && session.products.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
                Produk Terlaris Sesi Ini
              </h4>
              <div className="divide-y divide-slate-100">
                {session.products.map((p, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">Rp {(p.revenue || 0).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-500">{p.quantity} pcs terjual</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catatan Host */}
          {session.notes && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">Catatan & Kendala:</h4>
              <p className="text-xs text-slate-600 italic">"{session.notes}"</p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleSessionPdf(session)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#ee4d2d]" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isWaCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isWaCopied ? 'Tersalin!' : 'Bagikan ke WA'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
