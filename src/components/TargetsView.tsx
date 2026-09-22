import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Calendar
} from 'lucide-react';
import { KPITarget, Streamer, UserRole, LiveSession } from '../types';

interface TargetsViewProps {
  targets: KPITarget[];
  sessions: LiveSession[];
  streamers: Streamer[];
  currentRole: UserRole;
  onSaveTarget: (target: KPITarget) => Promise<void>;
  onDeleteTarget: (id: string) => Promise<void>;
}

export const TargetsView: React.FC<TargetsViewProps> = ({
  targets,
  sessions,
  streamers,
  currentRole,
  onSaveTarget,
  onDeleteTarget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'team' | 'individual'>('team');
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'hours'>('revenue');
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [targetValue, setTargetValue] = useState<number>(100000000);
  const [streamerId, setStreamerId] = useState<string>('');

  const openAddModal = () => {
    setTitle('Target Omset Bulan Ini');
    setType('team');
    setMetric('revenue');
    setPeriod('monthly');
    setTargetValue(300000000);
    setStreamerId(streamers[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const streamer = streamers.find(s => s.id === streamerId);
    const newTarget: KPITarget = {
      id: `tar-${Date.now()}`,
      title,
      type,
      metric,
      period,
      targetValue: Number(targetValue) || 1,
      streamerId: type === 'individual' ? streamerId : undefined,
      streamerName: type === 'individual' ? streamer?.name : undefined,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    };

    await onSaveTarget(newTarget);
    setIsModalOpen(false);
  };

  // Calculate actual progress dynamically from sessions
  const enrichedTargets = targets.map(target => {
    let current = 0;

    sessions.forEach(s => {
      // Check if session applies to target
      if (target.type === 'individual' && target.streamerId && s.streamerId !== target.streamerId) {
        return;
      }

      if (target.metric === 'revenue') current += s.revenue || 0;
      else if (target.metric === 'orders') current += s.orders || 0;
      else if (target.metric === 'hours') current += s.durationHours || 0;
    });

    const percent = Math.min(100, Math.round((current / (target.targetValue || 1)) * 100));
    const gap = Math.max(0, target.targetValue - current);

    return {
      ...target,
      currentValue: current,
      percent,
      gap,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pencapaian Target & KPI Live Streaming
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
              KPI Goals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking target omset (GMV), kuota order, dan jam tayang tim streamer Shopee bulan ini.
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Target Baru</span>
          </button>
        )}
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {enrichedTargets.map(tar => {
          const isRevenue = tar.metric === 'revenue';
          const isHours = tar.metric === 'hours';

          const formatVal = (val: number) => {
            if (isRevenue) return `Rp ${val.toLocaleString('id-ID')}`;
            if (isHours) return `${val} Jam`;
            return `${val.toLocaleString('id-ID')} Pesanan`;
          };

          return (
            <div key={tar.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
                    <Target className="w-3.5 h-3.5" />
                    {tar.type === 'team' ? 'Target Tim' : `Target: ${tar.streamerName}`}
                  </span>

                  <span className="text-xs font-bold text-slate-400 capitalize">
                    {tar.period === 'monthly' ? 'Bulan Ini' : 'Harian'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {tar.title}
                </h3>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Tercapai Saat Ini</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {formatVal(tar.currentValue || 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Target Sasaran</span>
                    <span className="text-sm sm:text-base font-bold text-slate-600">
                      {formatVal(tar.targetValue)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        tar.percent >= 80 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-[#ee4d2d] to-[#ff7337]'
                      }`}
                      style={{ width: `${tar.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5 font-bold">
                    <span className={tar.percent >= 80 ? 'text-emerald-600' : 'text-[#ee4d2d]'}>
                      {tar.percent}% Terpenuhi
                    </span>
                    <span className="text-slate-400">
                      Sisa: {formatVal(tar.gap)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {tar.percent >= 100 ? '🎉 Target Telah Terlampaui!' : 'Menuju target akhir periode'}
                </span>

                {currentRole === 'ADMIN' && (
                  <button
                    onClick={() => onDeleteTarget(tar.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Target Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Buat Sasaran Target Baru
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Target Omset Fashion September"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Jenis Target
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="team">Target Tim (Total)</option>
                    <option value="individual">Per Streamer Individu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Metrik KPI
                  </label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="revenue">Omset (GMV Rp)</option>
                    <option value="orders">Pesanan (Orders)</option>
                    <option value="hours">Durasi Live (Jam)</option>
                  </select>
                </div>
              </div>

              {type === 'individual' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pilih Host Streamer
                  </label>
                  <select
                    value={streamerId}
                    onChange={(e) => setStreamerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  >
                    {streamers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nilai Target Angka
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  placeholder="Contoh: 150000000"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
