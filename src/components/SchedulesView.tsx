import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  FileEdit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Schedule, Streamer, Shift, UserRole } from '../types';

interface SchedulesViewProps {
  schedules: Schedule[];
  streamers: Streamer[];
  shifts: Shift[];
  currentRole: UserRole;
  onSaveSchedule: (schedule: Schedule) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onFillReportForSchedule: (schedule: Schedule) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  streamers,
  shifts,
  currentRole,
  onSaveSchedule,
  onDeleteSchedule,
  onFillReportForSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form states for new schedule modal
  const [formStreamerId, setFormStreamerId] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(selectedDate);
  const [formShiftId, setFormShiftId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Scheduled' | 'Live' | 'Completed' | 'Missed'>('Scheduled');
  const [formNotes, setFormNotes] = useState<string>('');

  // Date navigation
  const handleDateChange = (offset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Filtered schedules for selected date
  const dateSchedules = schedules
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Missed reports alert count
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingReports = schedules.filter(s => s.date <= todayStr && !s.hasReport);

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormDate(selectedDate);
    setFormStreamerId(streamers[0]?.id || '');
    setFormShiftId(shifts[0]?.id || '');
    setFormStatus('Scheduled');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreamerId || !formShiftId || !formDate) return;

    const streamer = streamers.find(s => s.id === formStreamerId);
    const shift = shifts.find(s => s.id === formShiftId);

    const scheduleData: Schedule = {
      id: editingSchedule?.id || `sch-${Date.now()}`,
      date: formDate,
      streamerId: formStreamerId,
      streamerName: streamer?.name || 'Streamer',
      shiftId: formShiftId,
      shiftName: shift?.name || 'Shift',
      startTime: shift?.startTime || '08:00',
      endTime: shift?.endTime || '14:00',
      status: formStatus,
      hasReport: editingSchedule?.hasReport || false,
      reportId: editingSchedule?.reportId,
      notes: formNotes,
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
    };

    await onSaveSchedule(scheduleData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Jadwal Shift & Roster Live Streaming
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
              Shift Roster
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur dan pantau jadwal host live streaming harian, status on-air, dan kepatuhan pengisian laporan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Shift</span>
        </button>
      </div>

      {/* Warning Box for Missing Reports */}
      {pendingReports.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-900">
                Peringatan: {pendingReports.length} Sesi Live Belum Ada Laporan!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Pastikan seluruh host menyelesaikan formulir laporan setelah jam live berakhir untuk menjaga akurasi GMV harian.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <CalendarDays className="w-4 h-4 text-[#ee4d2d]" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Hari Ini
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-extrabold text-slate-900">{dateSchedules.length} Shift</span> pada tanggal ini
        </div>
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dateSchedules.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada jadwal pada tanggal ini</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol "Tambah Jadwal Shift" untuk menjadwalkan host streamer.</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-3 py-1.5 rounded-xl bg-orange-50 text-[#ee4d2d] text-xs font-bold border border-orange-200 hover:bg-orange-100 cursor-pointer"
            >
              + Jadwalkan Sekarang
            </button>
          </div>
        ) : (
          dateSchedules.map(sch => {
            const streamer = streamers.find(s => s.id === sch.streamerId);
            const isLive = sch.status === 'Live';
            const isCompleted = sch.status === 'Completed';

            return (
              <div 
                key={sch.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs relative flex flex-col justify-between ${
                  isLive ? 'border-[#ee4d2d] ring-2 ring-orange-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-800">
                      {sch.shiftName}
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isLive 
                        ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                      {sch.status}
                    </span>
                  </div>

                  {/* Host Streamer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={streamer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={sch.streamerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                        {sch.streamerName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{sch.startTime} - {sch.endTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Shift Notes if any */}
                  {sch.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 italic">
                      "{sch.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {sch.hasReport ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Laporan Selesai
                    </span>
                  ) : (
                    <button
                      onClick={() => onFillReportForSchedule(sch)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#ee4d2d] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Input Laporan</span>
                    </button>
                  )}

                  {currentRole === 'ADMIN' && (
                    <button
                      title="Hapus Jadwal"
                      onClick={() => onDeleteSchedule(sch.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Jadwalkan Shift Streamer
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih Host Streamer
                </label>
                <select
                  value={formStreamerId}
                  onChange={(e) => setFormStreamerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                >
                  {streamers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Live
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Shift Jam Tayang
                </label>
                <select
                  value={formShiftId}
                  onChange={(e) => setFormShiftId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                >
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} ({sh.startTime} - {sh.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Scheduled">Scheduled (Terjadwal)</option>
                  <option value="Live">Live (Sedang Berlangsung)</option>
                  <option value="Completed">Completed (Selesai)</option>
                  <option value="Missed">Missed (Terlewat)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Catatan untuk Host (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Misal: Fokus jualan produk gamis baru, target voucher 50..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
