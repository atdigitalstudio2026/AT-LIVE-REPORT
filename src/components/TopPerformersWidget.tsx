import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  Award, 
  Sparkles, 
  ChevronRight,
  UserCheck,
  Calendar,
  Percent
} from 'lucide-react';
import { LiveSession, Streamer } from '../types';

interface TopPerformersWidgetProps {
  sessions: LiveSession[];
  streamers: Streamer[];
  onSelectStreamer?: (streamerId: string) => void;
  dashboardDateRange?: {
    startStr: string;
    endStr: string;
    label: string;
    isCustom: boolean;
  };
}

export const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({
  sessions,
  streamers,
  onSelectStreamer,
  dashboardDateRange,
}) => {
  const [filterMode, setFilterMode] = useState<'current-week' | 'last-7-days' | 'custom-range'>('current-week');

  // If dashboard has a custom range, we can switch or offer custom-range
  useEffect(() => {
    if (dashboardDateRange?.isCustom) {
      setFilterMode('custom-range');
    }
  }, [dashboardDateRange?.isCustom, dashboardDateRange?.startStr, dashboardDateRange?.endStr]);

  // Compute date ranges
  const dateRange = useMemo(() => {
    const now = new Date();
    
    if (filterMode === 'custom-range' && dashboardDateRange?.isCustom) {
      return {
        startStr: dashboardDateRange.startStr,
        endStr: dashboardDateRange.endStr,
        label: dashboardDateRange.label,
        isCurrentWeek: false,
      };
    }

    if (filterMode === 'current-week') {
      // Monday of current week
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7; // Monday = 0, Tuesday = 1, ... Sunday = 6
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const label = `${monday.getDate()} ${monthNames[monday.getMonth()]} – ${sunday.getDate()} ${monthNames[sunday.getMonth()]} ${sunday.getFullYear()}`;

      return { startStr, endStr, label, isCurrentWeek: true };
    } else {
      // Last 7 days
      const d7Ago = new Date(now);
      d7Ago.setDate(d7Ago.getDate() - 6);
      d7Ago.setHours(0, 0, 0, 0);

      const startStr = d7Ago.toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const label = `${d7Ago.getDate()} ${monthNames[d7Ago.getMonth()]} – ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      return { startStr, endStr, label, isCurrentWeek: false };
    }
  }, [filterMode, dashboardDateRange]);

  // Aggregate streamer stats for the current week / selected window
  const rankedStreamers = useMemo(() => {
    const streamerMap = new Map<string, {
      streamer: Streamer;
      revenue: number;
      orders: number;
      hours: number;
      sessionsCount: number;
      productClicks: number;
      uniqueViewers: number;
      topSingleSessionRevenue: number;
    }>();

    // Initialize all streamers
    streamers.forEach(st => {
      streamerMap.set(st.id, {
        streamer: st,
        revenue: 0,
        orders: 0,
        hours: 0,
        sessionsCount: 0,
        productClicks: 0,
        uniqueViewers: 0,
        topSingleSessionRevenue: 0,
      });
    });

    // Sum matching sessions
    sessions.forEach(s => {
      if (s.businessDate >= dateRange.startStr && s.businessDate <= dateRange.endStr) {
        let entry = streamerMap.get(s.streamerId);
        if (!entry) {
          // If streamer wasn't in list but session exists
          const fallbackStreamer: Streamer = {
            id: s.streamerId,
            name: s.streamerName || 'Streamer',
            email: '',
            phone: '',
            status: 'active',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.streamerName || s.streamerId}`,
            joinDate: s.businessDate,
          };
          entry = {
            streamer: fallbackStreamer,
            revenue: 0,
            orders: 0,
            hours: 0,
            sessionsCount: 0,
            productClicks: 0,
            uniqueViewers: 0,
            topSingleSessionRevenue: 0,
          };
          streamerMap.set(s.streamerId, entry);
        }

        const rev = s.revenue || 0;
        entry.revenue += rev;
        entry.orders += s.orders || 0;
        entry.hours += s.durationHours || 0;
        entry.sessionsCount += 1;
        entry.productClicks += s.productClicks || 0;
        entry.uniqueViewers += s.uniqueViewers || s.viewers || 0;
        if (rev > entry.topSingleSessionRevenue) {
          entry.topSingleSessionRevenue = rev;
        }
      }
    });

    const activeList = Array.from(streamerMap.values())
      .filter(item => item.sessionsCount > 0)
      .map(item => {
        const revPerHour = item.hours > 0 ? Math.round(item.revenue / item.hours) : 0;
        const cvr = item.productClicks > 0 
          ? Number(((item.orders / item.productClicks) * 100).toFixed(1)) 
          : 0;
        return {
          ...item,
          revPerHour,
          cvr,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return activeList;
  }, [sessions, streamers, dateRange]);

  // Overall totals for the week
  const weekTotals = useMemo(() => {
    const totalRevenue = rankedStreamers.reduce((acc, s) => acc + s.revenue, 0);
    const totalOrders = rankedStreamers.reduce((acc, s) => acc + s.orders, 0);
    const totalHours = rankedStreamers.reduce((acc, s) => acc + s.hours, 0);
    const totalSessions = rankedStreamers.reduce((acc, s) => acc + s.sessionsCount, 0);
    const maxStreamerRevenue = rankedStreamers.length > 0 ? rankedStreamers[0].revenue : 0;

    return {
      totalRevenue,
      totalOrders,
      totalHours: Number(totalHours.toFixed(1)),
      totalSessions,
      activeStreamersCount: rankedStreamers.length,
      maxStreamerRevenue,
    };
  }, [rankedStreamers]);

  const champion = rankedStreamers.length > 0 ? rankedStreamers[0] : null;

  return (
    <div id="widget-top-performers" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Top Performers Minggu Ini
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>Revenue Ranking</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Periode: <strong className="text-slate-700">{dateRange.label}</strong></span>
            </p>
          </div>
        </div>

        {/* Filter Toggle (Current Week vs Last 7 Days vs Rentang Kustom) */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto text-xs font-bold">
          {dashboardDateRange?.isCustom && (
            <button
              id="btn-performer-custom-range"
              onClick={() => setFilterMode('custom-range')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'custom-range'
                  ? 'bg-[#ee4d2d] text-white shadow-xs'
                  : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Rentang Kustom</span>
            </button>
          )}
          <button
            id="btn-performer-current-week"
            onClick={() => setFilterMode('current-week')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterMode === 'current-week'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minggu Ini (Sen–Min)
          </button>
          <button
            id="btn-performer-last-7-days"
            onClick={() => setFilterMode('last-7-days')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterMode === 'last-7-days'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari Terakhir
          </button>
        </div>
      </div>

      {/* Week Summary Micro-Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/20 text-xs">
        <div className="p-3.5 sm:px-5">
          <span className="text-[11px] font-medium text-slate-400 block">Total Omset Minggu Ini</span>
          <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            Rp {weekTotals.totalRevenue.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="p-3.5 sm:px-5">
          <span className="text-[11px] font-medium text-slate-400 block">Total Pesanan Live</span>
          <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            {weekTotals.totalOrders.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">order</span>
          </span>
        </div>
        <div className="p-3.5 sm:px-5">
          <span className="text-[11px] font-medium text-slate-400 block">Total Jam Siaran</span>
          <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            {weekTotals.totalHours} <span className="text-xs font-normal text-slate-500">jam ({weekTotals.totalSessions} sesi)</span>
          </span>
        </div>
        <div className="p-3.5 sm:px-5">
          <span className="text-[11px] font-medium text-slate-400 block">Host Aktif Siaran</span>
          <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            {weekTotals.activeStreamersCount} <span className="text-xs font-normal text-slate-500">host</span>
          </span>
        </div>
      </div>

      {/* Content Area */}
      {rankedStreamers.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Sesi Live Terdata Minggu Ini</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Belum ada data penjualan sesi siaran yang diinput untuk rentang tanggal {dateRange.label}. Input data sesi live untuk memunculkan ranking performer.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* #1 SPOTLIGHT HERO CARD */}
          {champion && (
            <div 
              id="champion-spotlight-card"
              className="relative rounded-2xl p-5 sm:p-6 border border-amber-200/80 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ffffff 100%)'
              }}
            >
              {/* Background Decorative Ribbon */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                {/* Left: Streamer Bio & Crown */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={champion.streamer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${champion.streamer.name}`} 
                      alt={champion.streamer.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-amber-400 shadow-md bg-white" 
                    />
                    <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-4 h-4 fill-white" />
                    </div>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-600 text-white shadow-2xs">
                      RANK #1
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200/80 text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-700" />
                        <span>MVP of the Week</span>
                      </span>
                      <span className="text-[11px] text-amber-800 font-semibold">
                        Kontribusi {weekTotals.totalRevenue > 0 ? Math.round((champion.revenue / weekTotals.totalRevenue) * 100) : 0}% Omset Toko
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                      {champion.streamer.name}
                    </h3>

                    <p className="text-xs text-slate-600 mt-0.5">
                      Menghasilkan <strong className="text-amber-900 font-extrabold">{champion.orders} pesanan</strong> dari {champion.sessionsCount} sesi siaran ({champion.hours} jam total).
                    </p>
                  </div>
                </div>

                {/* Right: Key MVP Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-amber-200/80 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Total Omset Minggu Ini</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
                      Rp {champion.revenue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                      Omset/Jam: <strong className="text-slate-700">Rp {champion.revPerHour.toLocaleString('id-ID')}</strong>
                    </span>
                  </div>

                  {onSelectStreamer && (
                    <button
                      onClick={() => onSelectStreamer(champion.streamer.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Profil Host</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RANKED LIST OF ALL STREAMERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
              <span>Host Streamer & Ranking</span>
              <span>Performa Minggu Ini</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {rankedStreamers.map((item, idx) => {
                const rank = idx + 1;
                const isChampion = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;

                // Relative percentage to top streamer
                const relativePercent = weekTotals.maxStreamerRevenue > 0 
                  ? Math.round((item.revenue / weekTotals.maxStreamerRevenue) * 100) 
                  : 0;

                // Contribution to total week revenue
                const sharePercent = weekTotals.totalRevenue > 0 
                  ? ((item.revenue / weekTotals.totalRevenue) * 100).toFixed(1)
                  : '0';

                return (
                  <div 
                    key={item.streamer.id}
                    id={`performer-rank-${rank}`}
                    className={`p-4 transition-colors hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isChampion ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Left: Rank Badge + Avatar + Name + Mini metrics */}
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      {/* Rank Indicator */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {isChampion ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Crown className="w-4 h-4 fill-white" />
                          </div>
                        ) : isSilver ? (
                          <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center border border-slate-400/40 font-extrabold">
                            2
                          </div>
                        ) : isBronze ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-700/80 text-white flex items-center justify-center font-extrabold">
                            3
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                            #{rank}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <img 
                        src={item.streamer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.streamer.name}`} 
                        alt={item.streamer.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0" 
                      />

                      {/* Streamer Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors">
                            {item.streamer.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                            {item.sessionsCount} Sesi
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.hours} jam
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-slate-400" />
                            {item.orders} pesanan
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">
                            CVR {item.cvr}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Revenue, Bar, and Revenue per Hour */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 flex-1 max-w-md">
                      
                      {/* Relative Revenue Bar */}
                      <div className="hidden lg:block flex-1">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Porsi Omset Toko</span>
                          <span className="font-bold text-slate-700">{sharePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isChampion 
                                ? 'bg-amber-500' 
                                : isSilver 
                                ? 'bg-slate-400' 
                                : isBronze 
                                ? 'bg-amber-700' 
                                : 'bg-[#ee4d2d]'
                            }`}
                            style={{ width: `${relativePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Numerical Revenue */}
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-slate-900 block">
                          Rp {item.revenue.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] text-slate-500 block font-medium">
                          Rp {item.revPerHour.toLocaleString('id-ID')} / jam
                        </span>
                      </div>

                      {/* Action */}
                      {onSelectStreamer && (
                        <button
                          onClick={() => onSelectStreamer(item.streamer.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Lihat Detail Streamer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Footnote & Recommendation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Peringkat dihitung murni berdasarkan nominal omset (GMV) yang dicapai streamer pada rentang minggu berjalan.
              </span>
            </span>
            <span className="text-[11px] text-slate-400 shrink-0">
              *Diperbarui real-time saat sesi siaran disimpan
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
