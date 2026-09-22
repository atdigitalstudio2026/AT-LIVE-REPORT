import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  X, 
  Check, 
  ArrowRight, 
  Clock, 
  Sparkles,
  CalendarRange,
  RotateCcw
} from 'lucide-react';

export type DatePreset = 
  | 'today' 
  | 'yesterday' 
  | '7d' 
  | '30d' 
  | 'this-month' 
  | 'last-month' 
  | 'custom' 
  | 'all';

interface DateRangePickerProps {
  preset: DatePreset;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  onPresetChange: (preset: DatePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
  totalSessionsCount?: number;
  minAvailableDate?: string;
  maxAvailableDate?: string;
}

const PRESET_OPTIONS: { id: DatePreset; label: string; sublabel: string }[] = [
  { id: 'today', label: 'Hari Ini', sublabel: 'Data siaran hari ini' },
  { id: 'yesterday', label: 'Kemarin', sublabel: 'Siaran 1 hari lalu' },
  { id: '7d', label: '7 Hari Terakhir', sublabel: 'Tren 1 minggu ke belakang' },
  { id: '30d', label: '30 Hari Terakhir', sublabel: '1 bulan operasional' },
  { id: 'this-month', label: 'Bulan Ini', sublabel: 'Dari tgl 1 s/d hari ini' },
  { id: 'last-month', label: 'Bulan Lalu', sublabel: 'Satu bulan penuh sebelumnya' },
  { id: 'custom', label: 'Kustom Tanggal', sublabel: 'Tentukan rentang spesifik' },
  { id: 'all', label: 'Semua Data', sublabel: 'Seluruh riwayat siaran' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onCustomRangeChange,
  totalSessionsCount,
  minAvailableDate,
  maxAvailableDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync temp dates when props change
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format date helper: "22 Sep 2026"
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) return dateStr;
      const date = new Date(year, month - 1, day);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${months[date.getMonth()]} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Calculate day difference
  const calculateDaysDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    try {
      const d1 = new Date(start).getTime();
      const d2 = new Date(end).getTime();
      const diffTime = Math.abs(d2 - d1);
      return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 0;
    }
  };

  const daysCount = calculateDaysDiff(startDate, endDate);

  // Quick helper to apply relative custom dates
  const handleQuickCustomPreset = (days: number) => {
    const now = new Date();
    const endStr = now.toISOString().split('T')[0];
    const past = new Date(now);
    past.setDate(past.getDate() - (days - 1));
    const startStr = past.toISOString().split('T')[0];

    setTempStart(startStr);
    setTempEnd(endStr);
    onCustomRangeChange(startStr, endStr);
    onPresetChange('custom');
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) return;
    let actualStart = tempStart;
    let actualEnd = tempEnd;

    // Swap if start is after end
    if (actualStart > actualEnd) {
      const temp = actualStart;
      actualStart = actualEnd;
      actualEnd = temp;
      setTempStart(actualStart);
      setTempEnd(actualEnd);
    }

    onCustomRangeChange(actualStart, actualEnd);
    onPresetChange('custom');
    setIsOpen(false);
  };

  // Human-readable active label for the trigger button
  const getTriggerLabel = () => {
    if (preset === 'today') return 'Hari Ini';
    if (preset === 'yesterday') return 'Kemarin';
    if (preset === '7d') return '7 Hari Terakhir';
    if (preset === '30d') return '30 Hari Terakhir';
    if (preset === 'this-month') return 'Bulan Ini';
    if (preset === 'last-month') return 'Bulan Lalu';
    if (preset === 'all') return 'Semua Data Riwayat';
    return `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)}`;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Main Trigger Pill / Button */}
      <button
        id="btn-global-date-range-picker"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer select-none ${
          preset === 'custom'
            ? 'bg-orange-50/90 border-[#ee4d2d] text-[#ee4d2d]'
            : isOpen
            ? 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-orange-500/20'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
        }`}
        title="Klik untuk memilih rentang tanggal kustom"
      >
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
          preset === 'custom' ? 'bg-[#ee4d2d] text-white' : 'bg-orange-100 text-[#ee4d2d]'
        }`}>
          <CalendarIcon className="w-3.5 h-3.5" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-900 font-extrabold tracking-tight">
              {getTriggerLabel()}
            </span>
            {preset === 'custom' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#ee4d2d] text-white">
                {daysCount} Hari
              </span>
            )}
          </div>
          
          {preset !== 'all' && (
            <span className="text-[10px] text-slate-400 font-medium block">
              {formatDateDisplay(startDate)} s/d {formatDateDisplay(endDate)}
              {totalSessionsCount !== undefined && ` • ${totalSessionsCount} sesi`}
            </span>
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {/* Dropdown Modal Popover */}
      {isOpen && (
        <div 
          id="popover-date-range-picker"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[340px] sm:w-[580px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ee4d2d] flex items-center justify-center font-bold">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Pilih Rentang Tanggal Analisis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Filter semua grafik, GMV, CVR, dan performa host streamer
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mt-4">
            {/* Left Column: Preset List (5 cols) */}
            <div className="sm:col-span-5 space-y-1 sm:border-r sm:border-slate-100 sm:pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                Preset Cepat
              </span>

              {PRESET_OPTIONS.map(opt => {
                const isSelected = preset === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onPresetChange(opt.id);
                      if (opt.id !== 'custom') {
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-[#ee4d2d] border border-orange-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div>
                      <span>{opt.label}</span>
                      <span className="text-[10px] font-normal text-slate-400 block">
                        {opt.sublabel}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#ee4d2d]" />}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Custom Date Range Form (7 cols) */}
            <div className="sm:col-span-7 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Kustom Rentang Tanggal
              </span>

              {/* Start Date & End Date Inputs */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Dari Tanggal (Mulai):
                  </label>
                  <input
                    id="input-custom-start-date"
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Sampai Tanggal (Selesai):
                  </label>
                  <input
                    id="input-custom-end-date"
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Quick Range Shortcut Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Shortcut Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset(3)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    3 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset(7)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset(14)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    14 Hari (2 Mgg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset(30)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    30 Hari
                  </button>
                </div>
              </div>

              {/* Duration feedback */}
              <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Durasi Analisis:</span>
                <strong className="text-[#ee4d2d]">
                  {calculateDaysDiff(tempStart, tempEnd)} Hari
                </strong>
              </div>

              {/* Apply Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-apply-custom-date"
                  type="button"
                  onClick={handleApplyCustom}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan Rentang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const now = new Date().toISOString().split('T')[0];
                    setTempStart(now);
                    setTempEnd(now);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reset ke Hari Ini"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Footer with database coverage info */}
          {(minAvailableDate || maxAvailableDate) && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                Cakupan Database Sesi: <strong>{formatDateDisplay(minAvailableDate || '')}</strong> s/d <strong>{formatDateDisplay(maxAvailableDate || '')}</strong>
              </span>
              <span className="italic">Shopee Live Analytics</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
