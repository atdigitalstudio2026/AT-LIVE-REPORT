import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Users, 
  Percent, 
  TrendingUp, 
  Download, 
  PlusCircle, 
  Calendar, 
  Filter, 
  FileText, 
  Eye, 
  Award,
  ChevronRight,
  Zap,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
  RotateCcw,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  LineChart,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LiveSession, Streamer, Shift, UserRole } from '../types';
import { exportSessionsToExcel, exportSessionsToCsv, exportSingleSessionPdf } from '../lib/exportUtils';
import { ShopeeWawasanCard } from './ShopeeWawasanCard';
import { HourlyHeatmapView } from './HourlyHeatmapView';
import { TopPerformersWidget } from './TopPerformersWidget';
import { DateRangePicker, DatePreset } from './DateRangePicker';

interface DashboardViewProps {
  sessions: LiveSession[];
  streamers: Streamer[];
  shifts: Shift[];
  currentRole: UserRole;
  onOpenReportModal: () => void;
  onViewSessionDetail: (session: LiveSession) => void;
  onOpenResetModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  streamers,
  shifts,
  currentRole,
  onOpenReportModal,
  onViewSessionDetail,
  onOpenResetModal,
}) => {
  // Filters
  const [dateFilter, setDateFilter] = useState<DatePreset>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedStreamerId, setSelectedStreamerId] = useState<string>('all');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [showWawasanCard, setShowWawasanCard] = useState<boolean>(true);

  // Available date bounds in session data
  const { minAvailableDate, maxAvailableDate } = useMemo(() => {
    if (sessions.length === 0) return { minAvailableDate: '', maxAvailableDate: '' };
    const dates = sessions.map(s => s.businessDate).filter(Boolean).sort();
    return {
      minAvailableDate: dates[0] || '',
      maxAvailableDate: dates[dates.length - 1] || '',
    };
  }, [sessions]);

  // Effective Date Range calculated from active preset or custom range
  const effectiveDateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (dateFilter === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (dateFilter === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return { start: yStr, end: yStr };
    }
    if (dateFilter === '7d') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 6);
      return { start: d7.toISOString().split('T')[0], end: todayStr };
    }
    if (dateFilter === '30d') {
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 29);
      return { start: d30.toISOString().split('T')[0], end: todayStr };
    }
    if (dateFilter === 'this-month') {
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      return { start: `${currentYear}-${currentMonth}-01`, end: todayStr };
    }
    if (dateFilter === 'last-month') {
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfLastMonth = new Date(firstOfThisMonth.getTime() - 1);
      const firstOfLastMonth = new Date(lastOfLastMonth.getFullYear(), lastOfLastMonth.getMonth(), 1);
      return {
        start: firstOfLastMonth.toISOString().split('T')[0],
        end: lastOfLastMonth.toISOString().split('T')[0],
      };
    }
    if (dateFilter === 'custom') {
      return {
        start: customStartDate || '1970-01-01',
        end: customEndDate || '2099-12-31',
      };
    }
    // 'all'
    return { start: '1970-01-01', end: '2099-12-31' };
  }, [dateFilter, customStartDate, customEndDate]);

  // Filtered Sessions calculation
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Date filter
      if (dateFilter !== 'all') {
        if (session.businessDate < effectiveDateRange.start || session.businessDate > effectiveDateRange.end) {
          return false;
        }
      }

      // Streamer filter
      if (selectedStreamerId !== 'all' && session.streamerId !== selectedStreamerId) return false;

      // Shift filter
      if (selectedShiftId !== 'all' && session.shiftId !== selectedShiftId) return false;

      return true;
    });
  }, [sessions, dateFilter, effectiveDateRange, selectedStreamerId, selectedShiftId]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalHours = 0;
    let totalViewers = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalAds = 0;
    let totalRefunds = 0;

    filteredSessions.forEach(s => {
      totalRevenue += s.revenue || 0;
      totalOrders += s.orders || 0;
      totalHours += s.durationHours || 0;
      totalViewers += s.viewers || 0;
      totalClicks += s.productClicks || 0;
      totalImpressions += s.productImpressions || 0;
      totalAds += s.adsSpend || 0;
      totalRefunds += s.refundAmount || 0;
    });

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const averageCvr = totalClicks > 0 ? Number(((totalOrders / totalClicks) * 100).toFixed(2)) : 0;
    const revenuePerHour = totalHours > 0 ? Math.round(totalRevenue / totalHours) : 0;
    const roas = totalAds > 0 ? (totalRevenue / totalAds).toFixed(1) : 'N/A';

    return {
      totalRevenue,
      totalOrders,
      totalHours: Number(totalHours.toFixed(1)),
      totalViewers,
      averageOrderValue,
      averageCvr,
      revenuePerHour,
      totalAds,
      totalRefunds,
      roas,
      sessionCount: filteredSessions.length,
    };
  }, [filteredSessions]);

  // Chart 1: Daily Revenue & Orders Trend
  const dailyChartData = useMemo(() => {
    const map = new Map<string, { date: string; omsetJuta: number; revenue: number; orders: number; hours: number }>();

    filteredSessions.forEach(s => {
      const d = s.businessDate;
      const existing = map.get(d) || { date: d, omsetJuta: 0, revenue: 0, orders: 0, hours: 0 };
      existing.revenue += s.revenue || 0;
      existing.omsetJuta = Number(((existing.revenue) / 1000000).toFixed(2));
      existing.orders += s.orders || 0;
      existing.hours += s.durationHours || 0;
      map.set(d, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        displayDate: item.date.substring(5) // MM-DD
      }));
  }, [filteredSessions]);

  // Chart 2: Shift Performance Comparison
  const shiftChartData = useMemo(() => {
    const shiftMap = new Map<string, { name: string; revenue: number; orders: number; sessions: number }>();

    shifts.forEach(sh => {
      shiftMap.set(sh.id, { name: sh.name.split(' ')[0] + ' ' + (sh.name.split(' ')[1] || ''), revenue: 0, orders: 0, sessions: 0 });
    });

    filteredSessions.forEach(s => {
      const existing = shiftMap.get(s.shiftId);
      if (existing) {
        existing.revenue += s.revenue || 0;
        existing.orders += s.orders || 0;
        existing.sessions += 1;
      }
    });

    return Array.from(shiftMap.values()).map(item => ({
      ...item,
      omsetJuta: Number((item.revenue / 1000000).toFixed(2))
    }));
  }, [filteredSessions, shifts]);

  // 30-Day Revenue Trend Line Chart Calculation (detect growth patterns)
  const thirtyDaysTrend = useMemo(() => {
    const now = new Date();
    const days: { dateStr: string; displayDate: string; revenue: number; orders: number; sessionsCount: number }[] = [];
    const dateMap = new Map<string, { revenue: number; orders: number; sessionsCount: number }>();

    // Calculate dates for past 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Filter sessions by selected streamer and shift if specified
    sessions.forEach(s => {
      if (selectedStreamerId !== 'all' && s.streamerId !== selectedStreamerId) return;
      if (selectedShiftId !== 'all' && s.shiftId !== selectedShiftId) return;
      if (s.businessDate >= thirtyDaysAgoStr) {
        const cur = dateMap.get(s.businessDate) || { revenue: 0, orders: 0, sessionsCount: 0 };
        cur.revenue += s.revenue || 0;
        cur.orders += s.orders || 0;
        cur.sessionsCount += 1;
        dateMap.set(s.businessDate, cur);
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const stat = dateMap.get(dateStr) || { revenue: 0, orders: 0, sessionsCount: 0 };

      days.push({
        dateStr,
        displayDate,
        revenue: stat.revenue,
        orders: stat.orders,
        sessionsCount: stat.sessionsCount,
      });
    }

    const firstHalfRevenue = days.slice(0, 15).reduce((acc, d) => acc + d.revenue, 0);
    const secondHalfRevenue = days.slice(15, 30).reduce((acc, d) => acc + d.revenue, 0);
    const growthPercent = firstHalfRevenue > 0 
      ? Number((((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(1))
      : secondHalfRevenue > 0 ? 100 : 0;

    const total30dRev = days.reduce((acc, d) => acc + d.revenue, 0);
    const total30dOrders = days.reduce((acc, d) => acc + d.orders, 0);
    const avgDailyRev = Math.round(total30dRev / 30);
    const peakDay = [...days].sort((a, b) => b.revenue - a.revenue)[0];

    return {
      chartData: days,
      totalRevenue: total30dRev,
      totalOrders: total30dOrders,
      avgDailyRevenue: avgDailyRev,
      growthPercent,
      isGrowing: growthPercent >= 0,
      peakDay,
    };
  }, [sessions, selectedStreamerId, selectedShiftId]);

  // Leaderboard Calculation
  const leaderboard = useMemo(() => {
    const map = new Map<string, {
      streamer: Streamer;
      revenue: number;
      orders: number;
      hours: number;
      sessions: number;
      clicks: number;
    }>();

    streamers.forEach(st => {
      map.set(st.id, { streamer: st, revenue: 0, orders: 0, hours: 0, sessions: 0, clicks: 0 });
    });

    filteredSessions.forEach(s => {
      const existing = map.get(s.streamerId);
      if (existing) {
        existing.revenue += s.revenue || 0;
        existing.orders += s.orders || 0;
        existing.hours += s.durationHours || 0;
        existing.clicks += s.productClicks || 0;
        existing.sessions += 1;
      }
    });

    return Array.from(map.values())
      .filter(item => item.sessions > 0)
      .map(item => ({
        ...item,
        revenuePerHour: item.hours > 0 ? Math.round(item.revenue / item.hours) : 0,
        cvr: item.clicks > 0 ? Number(((item.orders / item.clicks) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSessions, streamers]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Dashboard Performance Shopee Live
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau metrik penjualan, efisiensi host, konversi keranjang kuning, dan ROI live streaming secara real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              onClick={() => {
                const dateSuffix = dateFilter !== 'all' ? `_${effectiveDateRange.start}_sd_${effectiveDateRange.end}` : '_semua_data';
                const filename = `Laporan_Live_Shopee${dateSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
                exportSessionsToCsv(filteredSessions, filename);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Unduh data sesi terfilter dalam format CSV untuk manual reporting"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              id="btn-export-excel"
              onClick={() => exportSessionsToExcel(filteredSessions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Unduh data dalam format Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Excel</span>
            </button>
            {onOpenResetModal && (
              <button
                id="btn-dashboard-reset-data"
                onClick={onOpenResetModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Kelola data, reset ke data kosong, atau muat data sampel"
              >
                <Database className="w-3.5 h-3.5 text-orange-500" />
                <span>Reset Data</span>
              </button>
            )}
            <button
              id="btn-open-report-modal"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Laporan</span>
            </button>
          </div>
        </div>

        {/* Global Filter Bar: Date Range Picker, Host, Shift, and Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Global Date Range Picker & Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Periode:</span>
            </span>

            {/* Global Date Range Picker Component */}
            <DateRangePicker 
              preset={dateFilter}
              startDate={effectiveDateRange.start}
              endDate={effectiveDateRange.end}
              onPresetChange={(newPreset) => setDateFilter(newPreset)}
              onCustomRangeChange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
                setDateFilter('custom');
              }}
              totalSessionsCount={filteredSessions.length}
              minAvailableDate={minAvailableDate}
              maxAvailableDate={maxAvailableDate}
            />

            {/* Quick 1-Click Preset Chips for Fast Access */}
            <div className="flex flex-wrap items-center gap-1 sm:pl-2 sm:border-l sm:border-slate-200">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: 'yesterday', label: 'Kemarin' },
                { id: '7d', label: '7 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'this-month', label: 'Bulan Ini' },
                { id: 'all', label: 'Semua' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDateFilter(tab.id as DatePreset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    dateFilter === tab.id
                      ? 'bg-[#ee4d2d] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Streamer, Shift, & Clear Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 mr-2">Host:</span>
              <select
                id="filter-streamer"
                value={selectedStreamerId}
                onChange={(e) => setSelectedStreamerId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Streamer</option>
                {streamers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 mr-2">Shift:</span>
              <select
                id="filter-shift"
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Shift</option>
                {shifts.map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
            </div>

            {/* Clear / Reset Filter button if any non-default filter is active */}
            {(dateFilter !== '7d' || selectedStreamerId !== 'all' || selectedShiftId !== 'all') && (
              <button
                id="btn-reset-filters"
                onClick={() => {
                  setDateFilter('7d');
                  setSelectedStreamerId('all');
                  setSelectedShiftId('all');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer border border-slate-200/80"
                title="Reset Semua Filter ke Default (7 Hari Terakhir)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Informational Banner for Custom Range or Active Filter */}
        {dateFilter === 'custom' && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200/90 flex flex-wrap items-center justify-between gap-2 text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ee4d2d] animate-pulse" />
              <span>
                Menampilkan analitik rentang tanggal kustom: <strong>{effectiveDateRange.start}</strong> s/d <strong>{effectiveDateRange.end}</strong> • <strong>{filteredSessions.length} sesi live</strong> ditemukan.
              </span>
            </div>
            <button
              onClick={() => setDateFilter('7d')}
              className="text-[11px] font-bold text-[#ee4d2d] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Kembali ke 7 Hari Terakhir</span>
            </button>
          </div>
        )}
      </div>

      {/* Clean Slate Empty State Banner */}
      {sessions.length === 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white border border-orange-200/80 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-[#ee4d2d]">
              <Database className="w-3.5 h-3.5" />
              <span>Aplikasi Dalam Mode Data Bersih (Clean Slate)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Belum Ada Sesi Live yang Tercatat
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aplikasi siap digunakan untuk operasional toko Shopee Live riil Anda dari nol. Klik <strong>Input Laporan</strong> untuk mencatat siaran perdana, atau gunakan <strong>Reset Data</strong> jika ingin memuat kembali data demo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                <span>Opsi Reset / Demo</span>
              </button>
            )}
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-extrabold transition-all shadow-sm shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Laporan Perdana</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Omset (GMV) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Omset (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700 mr-1.5">{stats.sessionCount} Sesi Live</span>
            <span>• Omset/Jam: Rp {(stats.revenuePerHour).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Total Pesanan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pesanan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalOrders.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Order</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>AOV: </span>
            <span className="font-bold text-slate-800 ml-1">Rp {stats.averageOrderValue.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Conversion Rate (CVR) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata CVR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-extrabold text-emerald-600 tracking-tight flex items-baseline gap-1">
            {stats.averageCvr}%
            <span className="text-xs font-normal text-slate-400">klik ke order</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              {stats.averageCvr >= 5 ? 'Status Baik' : 'Optimasi Hook'}
            </span>
          </div>
        </div>

        {/* Total Penonton & Jam */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi & Viewers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalHours} <span className="text-xs font-normal text-slate-400">Jam Live</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>{stats.totalViewers.toLocaleString('id-ID')} Penonton</span>
          </div>
        </div>

      </div>

      {/* Shopee Wawasan Livestream Highlight Card */}
      {filteredSessions.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-orange-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ee4d2d] animate-pulse" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Tampilan Widget Wawasan Livestream Shopee
              </h2>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#ee4d2d]">
                Sesi: {filteredSessions[0].streamerName} ({filteredSessions[0].businessDate} • {filteredSessions[0].shiftName})
              </span>
            </div>

            <button
              onClick={() => setShowWawasanCard(!showWawasanCard)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showWawasanCard ? 'Sembunyikan' : 'Tampilkan Widget'}</span>
            </button>
          </div>

          {showWawasanCard && (
            <ShopeeWawasanCard session={filteredSessions[0]} showStatusSelector={true} />
          )}
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Omset Harian (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Tren Omset (Juta Rp) & Pesanan
              </h2>
              <p className="text-xs text-slate-500">
                Grafik performa live streaming harian Shopee
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-[#ee4d2d]">
              Harian
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {dailyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Belum ada data sesi pada filter ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#ee4d2d" fontSize={11} tickLine={false} unit=" jt" />
                  <YAxis yAxisId="right" orientation="right" stroke="#4f46e5" fontSize={11} tickLine={false} unit=" ord" />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      name === 'omsetJuta' ? `Rp ${(Number(val) * 1000000).toLocaleString('id-ID')}` : `${val} order`,
                      name === 'omsetJuta' ? 'Omset' : 'Pesanan'
                    ]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="omsetJuta" name="Omset (Juta Rp)" fill="#ee4d2d" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Pesanan" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Perbandingan Omset per Shift (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Performa per Shift
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan efisiensi jam tayang
              </p>
            </div>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} unit=" jt" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={80} />
                <Tooltip 
                  formatter={(val: any) => [`Rp ${(Number(val) * 1000000).toLocaleString('id-ID')}`, 'Omset']}
                  contentStyle={{ borderRadius: '12px' }}
                />
                <Bar dataKey="omsetJuta" fill="#f97316" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 30-Day Daily Revenue Trend (Recharts Line Chart for Growth Patterns) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-[#ee4d2d]">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Tren Omset Harian 30 Hari Terakhir (Pola Pertumbuhan)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kurva pergerakan revenue harian Shopee Live selama 30 hari untuk memantau trajectory pertumbuhan tim.
            </p>
          </div>

          {/* Quick Growth Highlights */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total 30 Hari</span>
              <span className="font-extrabold text-slate-900">
                Rp {thirtyDaysTrend.totalRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata-rata / Hari</span>
              <span className="font-extrabold text-slate-700">
                Rp {thirtyDaysTrend.avgDailyRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              thirtyDaysTrend.isGrowing 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {thirtyDaysTrend.isGrowing ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {thirtyDaysTrend.isGrowing ? '+' : ''}{thirtyDaysTrend.growthPercent}% vs 15 Hari Awal
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={thirtyDaysTrend.chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[200px]">
                        <p className="font-extrabold text-amber-400 text-sm border-b border-slate-800 pb-1">
                          {data.displayDate} ({data.dateStr})
                        </p>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Omset GMV:</span>
                          <span className="font-extrabold text-[#ee4d2d]">
                            Rp {Number(data.revenue).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Total Pesanan:</span>
                          <span className="font-bold text-white">{data.orders} pesanan</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                          <span>Sesi Live Mengudara:</span>
                          <span>{data.sessionsCount} Sesi</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Omset Harian (Rp)" 
                stroke="#ee4d2d" 
                strokeWidth={3} 
                dot={{ r: 3.5, fill: '#ee4d2d', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#ee4d2d', stroke: '#fff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Pattern Insights Footer */}
        {thirtyDaysTrend.peakDay && thirtyDaysTrend.peakDay.revenue > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong>Puncak Penjualan Tertinggi:</strong> {thirtyDaysTrend.peakDay.displayDate} sebesar{' '}
                <strong className="text-slate-900 font-extrabold">
                  Rp {thirtyDaysTrend.peakDay.revenue.toLocaleString('id-ID')}
                </strong>{' '}
                ({thirtyDaysTrend.peakDay.orders} pesanan).
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              *Metrik mengagregasi seluruh sesi live per hari pada rentang 30 hari terakhir.
            </span>
          </div>
        )}
      </div>

      {/* Hourly Streaming Performance Intensity Heatmap (Peak Hours for Scheduling) */}
      <HourlyHeatmapView 
        sessions={filteredSessions} 
        shifts={shifts} 
        streamers={streamers} 
      />

      {/* Top Performers Widget (Ranked streamers based on current week revenue or custom range) */}
      <TopPerformersWidget 
        sessions={sessions} 
        streamers={streamers} 
        onSelectStreamer={(id) => setSelectedStreamerId(id)}
        dashboardDateRange={{
          startStr: effectiveDateRange.start,
          endStr: effectiveDateRange.end,
          label: `${effectiveDateRange.start} s/d ${effectiveDateRange.end}`,
          isCustom: dateFilter === 'custom',
        }}
      />

      {/* Leaderboard Streamer & Top Performer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Peringkat & Efisiensi Host Streamer
              </h2>
              <p className="text-xs text-slate-500">
                Leaderboard performa penjualan dan konversi tim streamer
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Diurutkan berdasarkan Omset Terbesar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Streamer</th>
                <th className="pb-3">Total Omset (Rp)</th>
                <th className="pb-3">Pesanan</th>
                <th className="pb-3">Jam Live</th>
                <th className="pb-3">Omset / Jam</th>
                <th className="pb-3">CVR (%)</th>
                <th className="pb-3 text-right pr-2">Rating & Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                let badgeColor = 'bg-slate-100 text-slate-600';
                let rankText = `#${rank}`;
                if (rank === 1) {
                  badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                  rankText = '🥇 #1 Top Host';
                } else if (rank === 2) {
                  badgeColor = 'bg-slate-100 text-slate-800 border border-slate-300';
                  rankText = '🥈 #2 Top Host';
                } else if (rank === 3) {
                  badgeColor = 'bg-orange-100 text-orange-800 border border-orange-300';
                  rankText = '🥉 #3 Top Host';
                }

                return (
                  <tr key={item.streamer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${badgeColor}`}>
                        {rankText}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.streamer.avatar} 
                          alt={item.streamer.name} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" 
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.streamer.name}</p>
                          <p className="text-[10px] text-slate-400">{item.sessions} sesi live</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 text-sm">
                      Rp {item.revenue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {item.orders} pesanan
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {item.hours.toFixed(1)} Jam
                    </td>
                    <td className="py-3.5 font-bold text-[#ee4d2d]">
                      Rp {item.revenuePerHour.toLocaleString('id-ID')}/jam
                    </td>
                    <td className="py-3.5 font-bold text-emerald-600">
                      {item.cvr}%
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
                        {item.cvr >= 6 ? 'Superstars' : 'Performer'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sesi Live Terakhir (Recent Live Reports) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Riwayat Sesi Live Terbaru ({filteredSessions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Daftar laporan sesi Shopee Live dengan detail metrik performa siaran
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Sesi Baru</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Tanggal & Shift</th>
                <th className="pb-3">Streamer</th>
                <th className="pb-3">Penjualan (Rp)</th>
                <th className="pb-3">Pesanan</th>
                <th className="pb-3">Dilihat</th>
                <th className="pb-3">Keranjang</th>
                <th className="pb-3">Pesanan/Klik</th>
                <th className="pb-3">Penjualan/mil</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center">
                        <Database className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-slate-800">Tidak ada sesi siaran yang ditemukan</p>
                        <p className="text-xs text-slate-500">
                          {sessions.length === 0 
                            ? 'Database sesi live masih kosong. Mulai input laporan pertama untuk memantau performa.' 
                            : 'Coba ubah filter rentang tanggal, streamer, atau shift di bagian atas.'}
                        </p>
                      </div>
                      <button
                        onClick={onOpenReportModal}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ee4d2d] text-white text-xs font-bold hover:bg-[#de3d1d] cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Input Laporan Sesi</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map(sess => (
                  <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-2">
                    <p className="font-bold text-slate-900">{sess.businessDate}</p>
                    <p className="text-[10px] text-slate-400">{sess.shiftName}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-800 block">{sess.streamerName}</span>
                    <span className="text-[10px] text-slate-400">{sess.durationHours} Jam</span>
                  </td>
                  <td className="py-3.5 font-extrabold text-slate-900 text-sm">
                    Rp {(sess.revenue || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800 block">{sess.orders} ord</span>
                    <span className="text-[10px] text-slate-400">{sess.buyers || sess.orders} pembeli</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-700 block">{(sess.totalViews || sess.viewers || 0).toLocaleString('id-ID')}</span>
                    <span className="text-[10px] text-slate-400">{(sess.uniqueViewers || 0).toLocaleString('id-ID')} penonton</span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    {(sess.addToCart || sess.productClicks || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 font-bold text-[#ee4d2d]">
                    {String(sess.conversionRate || 0).replace('.', ',')}%
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    Rp {(sess.rpm || (sess.viewers > 0 ? Math.round((sess.revenue / sess.viewers) * 1000) : 0)).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Lihat Detail Sesi"
                        onClick={() => onViewSessionDetail(sess)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Unduh PDF Resmi"
                        onClick={() => exportSingleSessionPdf(sess)}
                        className="p-1.5 rounded-lg text-[#ee4d2d] hover:text-[#d33c1d] hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
