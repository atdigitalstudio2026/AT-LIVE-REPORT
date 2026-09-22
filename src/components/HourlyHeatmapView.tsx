import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Sparkles, 
  Info,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LiveSession, Shift, Streamer } from '../types';

interface HourlyHeatmapViewProps {
  sessions: LiveSession[];
  shifts?: Shift[];
  streamers?: Streamer[];
}

type MetricMode = 'viewers' | 'revenue' | 'orders';

const DAYS = [
  { key: 1, label: 'Senin', short: 'Sen' },
  { key: 2, label: 'Selasa', short: 'Sel' },
  { key: 3, label: 'Rabu', short: 'Rab' },
  { key: 4, label: 'Kamis', short: 'Kam' },
  { key: 5, label: 'Jumat', short: 'Jum' },
  { key: 6, label: 'Sabtu', short: 'Sab' },
  { key: 0, label: 'Minggu', short: 'Min' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const HourlyHeatmapView: React.FC<HourlyHeatmapViewProps> = ({
  sessions,
  shifts = [],
  streamers = [],
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('viewers');
  const [selectedCell, setSelectedCell] = useState<{ day: number; hour: number } | null>(null);

  // Compute 24h x 7d Matrix and 24h summary
  const { matrix, hourlySummary, maxVal, topPeakHours, bestDay } = useMemo(() => {
    // 7 days (0..6) x 24 hours (0..23)
    const grid: Record<string, { viewers: number; revenue: number; orders: number; sessionsCount: number }> = {};
    const hourAgg: Record<number, { viewers: number; revenue: number; orders: number; sessionsCount: number }> = {};
    const dayAgg: Record<number, { viewers: number; revenue: number; orders: number }> = {};

    for (let d = 0; d < 7; d++) {
      dayAgg[d] = { viewers: 0, revenue: 0, orders: 0 };
      for (let h = 0; h < 24; h++) {
        grid[`${d}-${h}`] = { viewers: 0, revenue: 0, orders: 0, sessionsCount: 0 };
        if (!hourAgg[h]) {
          hourAgg[h] = { viewers: 0, revenue: 0, orders: 0, sessionsCount: 0 };
        }
      }
    }

    sessions.forEach(s => {
      // Parse business date day of week
      const dateObj = new Date(s.businessDate);
      const dayOfWeek = isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();

      // Parse start & end hours
      let startH = parseInt((s.startTime || '00:00').split(':')[0], 10);
      let endH = parseInt((s.endTime || '00:00').split(':')[0], 10);
      if (isNaN(startH)) startH = 0;
      if (isNaN(endH)) endH = (startH + Math.ceil(s.durationHours || 4)) % 24;

      // Calculate hours range
      const hoursSpan: number[] = [];
      if (endH >= startH) {
        for (let h = startH; h <= endH; h++) {
          hoursSpan.push(h % 24);
        }
      } else {
        // Crosses midnight (e.g. 22:00 to 02:00)
        for (let h = startH; h < 24; h++) hoursSpan.push(h);
        for (let h = 0; h <= endH; h++) hoursSpan.push(h);
      }

      const spanCount = Math.max(1, hoursSpan.length);
      const portionViewers = Math.round((s.viewers || s.totalViews || 0) / spanCount);
      const portionRevenue = Math.round((s.revenue || 0) / spanCount);
      const portionOrders = Math.round((s.orders || 0) / spanCount);

      hoursSpan.forEach(h => {
        const key = `${dayOfWeek}-${h}`;
        if (grid[key]) {
          grid[key].viewers += portionViewers;
          grid[key].revenue += portionRevenue;
          grid[key].orders += portionOrders;
          grid[key].sessionsCount += 1;
        }

        if (hourAgg[h]) {
          hourAgg[h].viewers += portionViewers;
          hourAgg[h].revenue += portionRevenue;
          hourAgg[h].orders += portionOrders;
          hourAgg[h].sessionsCount += 1;
        }

        if (dayAgg[dayOfWeek]) {
          dayAgg[dayOfWeek].viewers += portionViewers;
          dayAgg[dayOfWeek].revenue += portionRevenue;
          dayAgg[dayOfWeek].orders += portionOrders;
        }
      });
    });

    // Find max value in grid for intensity calculation
    let max = 1;
    Object.values(grid).forEach(c => {
      const val = metricMode === 'viewers' ? c.viewers : metricMode === 'revenue' ? c.revenue : c.orders;
      if (val > max) max = val;
    });

    // Top peak hours
    const sortedHours = Object.entries(hourAgg)
      .map(([h, data]) => ({ hour: parseInt(h, 10), ...data }))
      .sort((a, b) => {
        const valA = metricMode === 'viewers' ? a.viewers : metricMode === 'revenue' ? a.revenue : a.orders;
        const valB = metricMode === 'viewers' ? b.viewers : metricMode === 'revenue' ? b.revenue : b.orders;
        return valB - valA;
      });

    // Best day
    const sortedDays = Object.entries(dayAgg)
      .map(([d, data]) => ({ day: parseInt(d, 10), ...data }))
      .sort((a, b) => {
        const valA = metricMode === 'viewers' ? a.viewers : metricMode === 'revenue' ? a.revenue : a.orders;
        const valB = metricMode === 'viewers' ? b.viewers : metricMode === 'revenue' ? b.revenue : b.orders;
        return valB - valA;
      });

    const topDayObj = sortedDays[0];
    const bestDayLabel = DAYS.find(d => d.key === topDayObj?.day)?.label || 'Jumat';

    return {
      matrix: grid,
      hourlySummary: hourAgg,
      maxVal: max,
      topPeakHours: sortedHours.slice(0, 4),
      bestDay: bestDayLabel,
    };
  }, [sessions, metricMode]);

  // Color intensity calculator for heatmap cells
  const getIntensityClass = (value: number) => {
    if (value <= 0) return 'bg-slate-50 border-slate-100 text-slate-400';
    const ratio = value / maxVal;
    if (ratio < 0.15) return 'bg-orange-50 border-orange-100 text-orange-700';
    if (ratio < 0.35) return 'bg-orange-100 border-orange-200 text-orange-800 font-semibold';
    if (ratio < 0.6) return 'bg-orange-300 border-orange-400 text-orange-950 font-bold';
    if (ratio < 0.85) return 'bg-[#ee4d2d]/80 border-[#ee4d2d] text-white font-bold';
    return 'bg-[#ee4d2d] border-[#d83f21] text-white font-extrabold ring-2 ring-orange-400/40 shadow-xs';
  };

  const getMetricFormatted = (cell: { viewers: number; revenue: number; orders: number }) => {
    if (metricMode === 'viewers') {
      return cell.viewers >= 1000 ? `${(cell.viewers / 1000).toFixed(1)}k` : cell.viewers.toString();
    }
    if (metricMode === 'revenue') {
      return cell.revenue >= 1000000 
        ? `${(cell.revenue / 1000000).toFixed(1)}jt` 
        : cell.revenue >= 1000 
        ? `${(cell.revenue / 1000).toFixed(0)}rb` 
        : cell.revenue.toString();
    }
    return `${cell.orders}`;
  };

  const selectedCellData = selectedCell ? matrix[`${selectedCell.day}-${selectedCell.hour}`] : null;
  const selectedDayLabel = selectedCell ? DAYS.find(d => d.key === selectedCell.day)?.label : '';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      
      {/* Header and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-[#ee4d2d]">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Heatmap Intensitas Traffic & Jam Tayang (Peak Hours)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Shift Scheduling
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi kepadatan traffic 24 jam per hari untuk menyusun jadwal host terbaik di jam puncak penonton.
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMetricMode('viewers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'viewers'
                ? 'bg-white text-[#ee4d2d] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Penonton (Viewers)</span>
          </button>

          <button
            onClick={() => setMetricMode('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'revenue'
                ? 'bg-white text-[#ee4d2d] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Omset (GMV)</span>
          </button>

          <button
            onClick={() => setMetricMode('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'orders'
                ? 'bg-white text-[#ee4d2d] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan (Orders)</span>
          </button>
        </div>
      </div>

      {/* Actionable Scheduling Recommendations for Managers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#ee4d2d] text-white shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block">
              Golden Prime Time
            </span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              {topPeakHours[0] ? `${String(topPeakHours[0].hour).padStart(2, '0')}:00 - ${String((topPeakHours[0].hour + 1) % 24).padStart(2, '0')}:00` : '19:00 - 22:00'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Puncak traffic tertinggi. Jadwalkan host ber-CVR terbaik & voucher toko ekstra.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Hari Performa Terbaik
            </span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              Hari {bestDay}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Konversi dan volume checkout tertinggi dalam siklus mingguan.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Rekomendasi Roster Host
            </span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              Shift Malam (18:00 - 24:00)
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Fokuskan 60% anggaran iklan koin dan durasi live pada rentang waktu ini.
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Matrix (Days of Week vs 24 Hours) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Matriks Intensitas Jam Tayang (24 Jam x 7 Hari)
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Rendah</span>
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
            <span className="w-3 h-3 rounded bg-orange-100 border border-orange-200 inline-block" />
            <span className="w-3 h-3 rounded bg-orange-300 border border-orange-400 inline-block" />
            <span className="w-3 h-3 rounded bg-[#ee4d2d] border-[#ee4d2d] inline-block" />
            <span>Puncak (Peak)</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2 border border-slate-200 rounded-xl bg-slate-50/50 p-3">
          <div className="min-w-[760px]">
            
            {/* Hour Headers (00 to 23) */}
            <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 mb-1.5 text-[10px] font-bold text-slate-400 text-center">
              <div className="text-left pl-1">Hari</div>
              {HOURS.map(h => (
                <div key={h} className={topPeakHours.some(p => p.hour === h) ? 'text-[#ee4d2d] font-black' : ''}>
                  {String(h).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Matrix Rows by Day */}
            {DAYS.map(day => (
              <div key={day.key} className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 mb-1 items-center">
                <div className="text-xs font-bold text-slate-700 pl-1">
                  {day.short}
                </div>
                {HOURS.map(h => {
                  const cell = matrix[`${day.key}-${h}`] || { viewers: 0, revenue: 0, orders: 0, sessionsCount: 0 };
                  const metricVal = metricMode === 'viewers' ? cell.viewers : metricMode === 'revenue' ? cell.revenue : cell.orders;
                  const isSelected = selectedCell?.day === day.key && selectedCell?.hour === h;

                  return (
                    <button
                      key={h}
                      onClick={() => setSelectedCell({ day: day.key, hour: h })}
                      className={`h-7 rounded flex items-center justify-center text-[9px] border transition-all cursor-pointer relative ${getIntensityClass(metricVal)} ${
                        isSelected ? 'ring-2 ring-slate-900 scale-105 z-10' : 'hover:scale-105'
                      }`}
                      title={`${day.label} Jam ${String(h).padStart(2, '0')}:00\nPenonton: ${cell.viewers.toLocaleString('id-ID')}\nOmset: Rp ${cell.revenue.toLocaleString('id-ID')}\nPesanan: ${cell.orders}\nSesi: ${cell.sessionsCount}`}
                    >
                      {metricVal > 0 ? getMetricFormatted(cell) : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Hour Details & Quick Insights Card */}
      {selectedCell && selectedCellData && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ee4d2d] animate-ping" />
              <span className="font-extrabold text-amber-400 text-sm">
                Detail Slot: {selectedDayLabel}, Pukul {String(selectedCell.hour).padStart(2, '0')}:00 - {String((selectedCell.hour + 1) % 24).padStart(2, '0')}:00
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {selectedCellData.sessionsCount > 0 
                ? `Terdata ${selectedCellData.sessionsCount} sesi live streaming aktif pada jam ini.`
                : 'Belum ada jadwal live streaming yang aktif pada slot jam ini.'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Est. Penonton</span>
              <span className="font-extrabold text-white text-sm">
                {selectedCellData.viewers.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Est. Omset</span>
              <span className="font-extrabold text-[#ee4d2d] text-sm">
                Rp {selectedCellData.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Est. Pesanan</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {selectedCellData.orders} orders
              </span>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 text-[11px] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Hourly 24h Summary Bar Strip */}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span>Distribusi Traffic Agregat 24 Jam</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Berdasarkan seluruh histori sesi aktif
          </span>
        </h3>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
          {HOURS.map(h => {
            const hStat = hourlySummary[h] || { viewers: 0, revenue: 0, orders: 0 };
            const isTop = topPeakHours.some(p => p.hour === h);
            const val = metricMode === 'viewers' ? hStat.viewers : metricMode === 'revenue' ? hStat.revenue : hStat.orders;
            const heightPercent = maxVal > 0 ? Math.min(100, Math.max(12, Math.round((val / (maxVal * 2.5)) * 100))) : 12;

            return (
              <div key={h} className="flex flex-col items-center gap-1 group">
                <div className="w-full h-14 bg-slate-100 rounded flex items-end p-0.5 overflow-hidden">
                  <div 
                    className={`w-full rounded-sm transition-all ${
                      isTop ? 'bg-[#ee4d2d]' : 'bg-orange-300 group-hover:bg-orange-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`Pukul ${String(h).padStart(2, '0')}:00\nPenonton: ${hStat.viewers}\nOmset: Rp ${hStat.revenue.toLocaleString('id-ID')}`}
                  />
                </div>
                <span className={`text-[9px] ${isTop ? 'font-black text-[#ee4d2d]' : 'text-slate-400'}`}>
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
