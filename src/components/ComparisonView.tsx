import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Trophy, 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  Eye, 
  Percent, 
  Users, 
  Calendar, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { LiveSession, Streamer, Shift } from '../types';

interface ComparisonViewProps {
  sessions: LiveSession[];
  streamers: Streamer[];
  shifts: Shift[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  sessions,
  streamers,
  shifts,
}) => {
  const [compareMode, setCompareMode] = useState<'streamers' | 'shifts'>('streamers');

  // Selected streamers to compare (default first two)
  const [selectedStreamerIds, setSelectedStreamerIds] = useState<string[]>([
    streamers[0]?.id || '',
    streamers[1]?.id || '',
  ].filter(Boolean));

  // Toggle streamer selection
  const handleToggleStreamer = (id: string) => {
    if (selectedStreamerIds.includes(id)) {
      if (selectedStreamerIds.length > 1) {
        setSelectedStreamerIds(selectedStreamerIds.filter(sId => sId !== id));
      }
    } else {
      if (selectedStreamerIds.length < 4) {
        setSelectedStreamerIds([...selectedStreamerIds, id]);
      }
    }
  };

  // Compute stats for selected streamers
  const streamerStats = selectedStreamerIds.map(sId => {
    const streamer = streamers.find(s => s.id === sId);
    const sSessions = sessions.filter(sess => sess.streamerId === sId);
    const totalRev = sSessions.reduce((acc, s) => acc + (s.revenue || 0), 0);
    const totalOrders = sSessions.reduce((acc, s) => acc + (s.orders || 0), 0);
    const totalHours = sSessions.reduce((acc, s) => acc + (s.durationHours || 0), 0);
    const totalClicks = sSessions.reduce((acc, s) => acc + (s.productClicks || 0), 0);
    const totalViews = sSessions.reduce((acc, s) => acc + (s.totalViews || s.viewers || 0), 0);
    const totalLikes = sSessions.reduce((acc, s) => acc + (s.likes || 0), 0);

    const revPerHour = totalHours > 0 ? Math.round(totalRev / totalHours) : 0;
    const ordersPerHour = totalHours > 0 ? Number((totalOrders / totalHours).toFixed(1)) : 0;
    const avgCvr = totalClicks > 0 ? Number(((totalOrders / totalClicks) * 100).toFixed(1)) : 0;
    const avgAov = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;
    const avgRpm = totalViews > 0 ? Math.round((totalRev / totalViews) * 1000) : 0;

    return {
      streamer,
      sessionsCount: sSessions.length,
      totalRev,
      totalOrders,
      totalHours: Number(totalHours.toFixed(1)),
      revPerHour,
      ordersPerHour,
      avgCvr,
      avgAov,
      avgRpm,
      totalLikes,
      totalViews,
    };
  }).filter(item => item.streamer);

  // Compute stats for shifts
  const shiftStats = shifts.map(shift => {
    const shSessions = sessions.filter(s => s.shiftId === shift.id);
    const totalRev = shSessions.reduce((acc, s) => acc + (s.revenue || 0), 0);
    const totalOrders = shSessions.reduce((acc, s) => acc + (s.orders || 0), 0);
    const totalHours = shSessions.reduce((acc, s) => acc + (s.durationHours || 0), 0);
    const totalClicks = shSessions.reduce((acc, s) => acc + (s.productClicks || 0), 0);
    const totalViews = shSessions.reduce((acc, s) => acc + (s.totalViews || s.viewers || 0), 0);

    const revPerHour = totalHours > 0 ? Math.round(totalRev / totalHours) : 0;
    const avgCvr = totalClicks > 0 ? Number(((totalOrders / totalClicks) * 100).toFixed(1)) : 0;
    const avgAov = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;
    const avgRpm = totalViews > 0 ? Math.round((totalRev / totalViews) * 1000) : 0;

    return {
      shift,
      sessionsCount: shSessions.length,
      totalRev,
      totalOrders,
      totalHours: Number(totalHours.toFixed(1)),
      revPerHour,
      avgCvr,
      avgAov,
      avgRpm,
      totalViews,
    };
  });

  // Find maximum values for relative bars
  const maxStreamerRev = Math.max(...streamerStats.map(s => s.totalRev), 1);
  const maxStreamerRevPerHour = Math.max(...streamerStats.map(s => s.revPerHour), 1);
  const maxStreamerCvr = Math.max(...streamerStats.map(s => s.avgCvr), 1);
  const maxStreamerRpm = Math.max(...streamerStats.map(s => s.avgRpm), 1);

  const maxShiftRev = Math.max(...shiftStats.map(s => s.totalRev), 1);
  const maxShiftRevPerHour = Math.max(...shiftStats.map(s => s.revPerHour), 1);
  const maxShiftCvr = Math.max(...shiftStats.map(s => s.avgCvr), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Komparasi Kinerja Host & Shift
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
              Benchmark Head-to-Head
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bandingkan metrik konversi, omset per jam, efisiensi RPM, dan temukan shift terbaik untuk toko Anda.
          </p>
        </div>

        {/* Comparison Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setCompareMode('streamers')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              compareMode === 'streamers'
                ? 'bg-[#ee4d2d] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Antar Host</span>
          </button>
          <button
            onClick={() => setCompareMode('shifts')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              compareMode === 'shifts'
                ? 'bg-[#ee4d2d] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Antar Shift</span>
          </button>
        </div>
      </div>

      {/* MODE 1: STREAMER COMPARISON */}
      {compareMode === 'streamers' && (
        <div className="space-y-6">
          {/* Host Selector Pills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Pilih Host untuk Dibandingkan (Maksimal 4):
            </span>
            <div className="flex flex-wrap gap-2">
              {streamers.map(s => {
                const isSelected = selectedStreamerIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleToggleStreamer(s.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ee4d2d] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <img src={s.avatar} alt={s.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{s.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {streamerStats.map(item => {
              const isTopRev = item.totalRev === maxStreamerRev;
              const isTopCvr = item.avgCvr === maxStreamerCvr;
              const isTopRpm = item.avgRpm === maxStreamerRpm;

              return (
                <div 
                  key={item.streamer?.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
                >
                  {isTopRev && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-amber-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                      <Trophy className="w-3 h-3 text-amber-950" />
                      <span>Omset Teratas</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.streamer?.avatar} 
                        alt={item.streamer?.name} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-100"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{item.streamer?.name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {item.sessionsCount} Sesi Live • {item.totalHours} Jam Siaran
                        </p>
                      </div>
                    </div>

                    {/* Metric Bars */}
                    <div className="mt-5 space-y-3.5 text-xs">
                      {/* GMV Total */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-500 font-semibold">Total Omset (GMV)</span>
                          <span className="font-extrabold text-slate-900">
                            Rp {item.totalRev.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#ee4d2d] rounded-full transition-all duration-500"
                            style={{ width: `${(item.totalRev / maxStreamerRev) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Omset / Jam */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-500 font-semibold">Omset / Jam Siaran</span>
                          <span className="font-bold text-slate-800">
                            Rp {item.revPerHour.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${(item.revPerHour / maxStreamerRevPerHour) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Conversion Rate */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-500 font-semibold">Conversion Rate (CVR)</span>
                          <span className={`font-extrabold ${isTopCvr ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {item.avgCvr}% {isTopCvr && '🏆'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(item.avgCvr / maxStreamerCvr) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Penjualan per mil (RPM) */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-500 font-semibold">RPM (Revenue per 1k views)</span>
                          <span className="font-bold text-indigo-600">
                            Rp {item.avgRpm.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${(item.avgRpm / maxStreamerRpm) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* AOV */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Nilai/Pesanan</span>
                          <span className="font-bold text-slate-800">Rp {item.avgAov.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Pesanan/Jam</span>
                          <span className="font-bold text-slate-800">{item.ordersPerHour} orders</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    "{item.streamer?.notes || 'Host berdedikasi tinggi'}"
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Scheduling Recommendation */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-50 border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ee4d2d] to-[#ff6433] text-white flex items-center justify-center shrink-0 shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Rekomendasi Penugasan Shift Strategis</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ee4d2d] text-white">Data Performa</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Berdasarkan analisa konversi dan retensi: <strong>Cindy Claudia</strong> memiliki CVR tertinggi ({maxStreamerCvr}%) sehingga sangat direkomendasikan ditempatkan pada <strong>Shift 3 (Malam/Prime Time 18:00 - 24:00)</strong> saat traffic keranjang kuning toko sedang memuncak. Untuk <strong>Nadia Safitri</strong>, stabil di jam siang dengan volume GMV konsisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: SHIFTS COMPARISON */}
      {compareMode === 'shifts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shiftStats.map(item => {
              const isTopRev = item.totalRev === maxShiftRev;
              const isTopCvr = item.avgCvr === maxShiftCvr;

              return (
                <div 
                  key={item.shift.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ee4d2d] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                        {item.shift.code}
                      </span>
                      {isTopRev && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          ⭐ Terlaris
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mt-2">
                      {item.shift.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {item.shift.startTime} - {item.shift.endTime} ({item.shift.durationHours} Jam)
                    </p>

                    {/* Stats List */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Total Omset Shift</span>
                        <span className="text-base font-extrabold text-slate-900">
                          Rp {item.totalRev.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Omset / Jam</span>
                          <span className="font-bold text-slate-800">
                            Rp {item.revPerHour.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Konversi (CVR)</span>
                          <span className="font-extrabold text-emerald-600">
                            {item.avgCvr}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                        <span className="text-slate-400">Total Sesi Terlaksana:</span>
                        <span className="font-bold text-slate-800">{item.sessionsCount} Sesi</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                    Akumulasi performa seluruh host di slot waktu ini.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
