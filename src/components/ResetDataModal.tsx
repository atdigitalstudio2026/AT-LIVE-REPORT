import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Radio, 
  Users, 
  CalendarDays, 
  Target, 
  Layers,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { LiveSession, Streamer, Schedule, KPITarget } from '../types';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LiveSession[];
  streamers: Streamer[];
  schedules: Schedule[];
  targets: KPITarget[];
  onResetToEmpty: (options: {
    clearSessions: boolean;
    clearSchedules: boolean;
    clearTargets: boolean;
    clearStreamers: boolean;
    clearProducts: boolean;
  }) => Promise<void>;
  onRestoreDemo: () => Promise<void>;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  sessions,
  streamers,
  schedules,
  targets,
  onResetToEmpty,
  onRestoreDemo,
}) => {
  const [resetType, setResetType] = useState<'sessions-only' | 'full-clean' | 'restore-demo'>('sessions-only');
  const [keepStreamers, setKeepStreamers] = useState(true);
  const [keepTargets, setKeepTargets] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (resetType === 'restore-demo') {
        await onRestoreDemo();
        setSuccessMessage('Data sampel / demo berhasil dimuat ulang ke database!');
      } else if (resetType === 'sessions-only') {
        await onResetToEmpty({
          clearSessions: true,
          clearSchedules: true,
          clearTargets: false,
          clearStreamers: false,
          clearProducts: false,
        });
        setSuccessMessage('Semua riwayat laporan siaran live berhasil dikosongkan. Master host dan shift tetap tersimpan.');
      } else if (resetType === 'full-clean') {
        await onResetToEmpty({
          clearSessions: true,
          clearSchedules: true,
          clearTargets: !keepTargets,
          clearStreamers: !keepStreamers,
          clearProducts: true,
        });
        setSuccessMessage('Aplikasi telah direset ke data kosong penuh. Anda siap memulai operasional riil dari nol!');
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kendala saat melakukan reset. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#ee4d2d] flex items-center justify-center ring-1 ring-orange-500/30">
              <Database className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Kelola & Reset Data Aplikasi</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                  Shopee Live
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Konfigurasi aplikasi untuk digunakan dari data kosong atau muat ulang data sampel.
              </p>
            </div>
          </div>
        </div>

        {/* Current Database Statistics Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Status Data Saat Ini</span>
            <span className="text-slate-600 font-semibold">Tersimpan di Cloud Firestore</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Sesi Live</span>
              <span className="text-sm font-extrabold text-slate-800">{sessions.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Jadwal</span>
              <span className="text-sm font-extrabold text-slate-800">{schedules.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Host Streamer</span>
              <span className="text-sm font-extrabold text-slate-800">{streamers.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Target KPI</span>
              <span className="text-sm font-extrabold text-slate-800">{targets.length}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-emerald-950 text-sm">Operasi Berhasil</p>
                <p className="mt-0.5 leading-relaxed">{successMessage}</p>
                <button
                  onClick={onClose}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Tutup & Kembali ke Aplikasi
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">Terjadi Kendala</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {!successMessage && (
            <>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Mode Reset yang Diinginkan:
              </p>

              {/* Mode Selection Cards */}
              <div className="space-y-3">

                {/* Option 1: Sessions Only (Recommended) */}
                <label 
                  onClick={() => setResetType('sessions-only')}
                  className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    resetType === 'sessions-only' 
                      ? 'border-[#ee4d2d] bg-orange-50/40 shadow-xs ring-1 ring-orange-400/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="reset-option" 
                      checked={resetType === 'sessions-only'} 
                      onChange={() => setResetType('sessions-only')}
                      className="mt-1 accent-[#ee4d2d]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Kosongkan Riwayat Sesi Live Saja
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-[#ee4d2d]">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Menghapus semua laporan siaran live agar metrik Omset, Pesanan, CVR, dan Jam Live kembali ke <strong>Rp 0</strong>.
                      </p>
                      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Host & Shift tetap tersimpan
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <RotateCcw className="w-3.5 h-3.5 text-orange-500" /> Siap input sesi riil baru
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Option 2: Full Clean Slate */}
                <label 
                  onClick={() => setResetType('full-clean')}
                  className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    resetType === 'full-clean' 
                      ? 'border-rose-500 bg-rose-50/40 shadow-xs ring-1 ring-rose-400/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="reset-option" 
                      checked={resetType === 'full-clean'} 
                      onChange={() => setResetType('full-clean')}
                      className="mt-1 accent-rose-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Reset Total ke Data Kosong Penuh (Clean Slate)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Semua Kosong
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Mengosongkan sesi live, jadwal tayang, dan riwayat operasional untuk toko baru yang baru mulai dari awal.
                      </p>

                      {resetType === 'full-clean' && (
                        <div className="mt-3 pt-3 border-t border-rose-200/80 space-y-2">
                          <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={keepStreamers} 
                              onChange={(e) => setKeepStreamers(e.target.checked)}
                              className="rounded accent-rose-600"
                            />
                            <span>Pertahankan data Master Streamer/Host ({streamers.length} Host)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={keepTargets} 
                              onChange={(e) => setKeepTargets(e.target.checked)}
                              className="rounded accent-rose-600"
                            />
                            <span>Pertahankan konfigurasi Target KPI</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Option 3: Restore Demo Data */}
                <label 
                  onClick={() => setResetType('restore-demo')}
                  className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    resetType === 'restore-demo' 
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-400/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="reset-option" 
                      checked={resetType === 'restore-demo'} 
                      onChange={() => setResetType('restore-demo')}
                      className="mt-1 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Muat Ulang Data Sampel / Demo Lengkap
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Simulasi & Presentasi
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Mengisi kembali database dengan data simulasi 18 sesi Shopee Live, 5 streamer, jadwal shift, dan analitik lengkap.
                      </p>
                    </div>
                  </div>
                </label>

              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Perhatian:</strong> Data yang dihapus dari Firestore tidak dapat dibatalkan, namun Anda selalu dapat memuat ulang data demo sewaktu-waktu melalui menu ini.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-reset-execute"
                  type="button"
                  onClick={handleExecute}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                    resetType === 'restore-demo'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                      : resetType === 'full-clean'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-[#ee4d2d] hover:bg-[#e03d1c] shadow-orange-500/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Memproses...</span>
                    </>
                  ) : resetType === 'restore-demo' ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Muat Ulang Data Demo</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Konfirmasi & Kosongkan Data</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
