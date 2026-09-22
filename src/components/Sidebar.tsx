import React from 'react';
import { 
  BarChart3, 
  FileEdit, 
  CalendarDays, 
  Target, 
  Users, 
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowLeftRight,
  Timer,
  Trophy
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'dashboard' | 'input-report' | 'schedules' | 'targets' | 'streamers' | 'top-performers' | 'products' | 'comparison' | 'voucher-timer';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  pendingReportsCount?: number;
  totalMonthRevenue?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingReportsCount = 0,
  totalMonthRevenue = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard & Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'input-report' as NavTab,
      label: 'Input Laporan Live',
      icon: FileEdit,
      badge: null,
    },
    {
      id: 'voucher-timer' as NavTab,
      label: 'Timer Voucher 3D',
      icon: Timer,
      badge: 'Flash Sale',
      badgeColor: 'bg-orange-50 text-[#ee4d2d] border-orange-200 font-extrabold',
    },
    {
      id: 'schedules' as NavTab,
      label: 'Jadwal & Shift',
      icon: CalendarDays,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} Perlu Laporan` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'targets' as NavTab,
      label: 'Target & KPI',
      icon: Target,
      badge: null,
    },
    {
      id: 'streamers' as NavTab,
      label: currentRole === 'ADMIN' ? 'Data & Tim Streamer' : 'Profil Host',
      icon: Users,
      badge: null,
    },
    {
      id: 'top-performers' as NavTab,
      label: 'Top Performa Host',
      icon: Trophy,
      badge: 'Ranking',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 font-extrabold',
    },
    {
      id: 'comparison' as NavTab,
      label: 'Komparasi Kinerja',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'products' as NavTab,
      label: 'Katalog & Penjualan',
      icon: ShoppingBag,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50/40 text-[#ee4d2d] border-l-4 border-[#ee4d2d] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ee4d2d]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warning Box if there are pending reports */}
      {pendingReportsCount > 0 && (
        <div className="mx-4 my-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Perhatian Laporan</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Ada <span className="font-bold">{pendingReportsCount} sesi live</span> yang telah selesai tetapi belum mengisi laporan!
              </p>
              <button
                onClick={() => onTabChange('schedules')}
                className="mt-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Lihat Jadwal Terlewat &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Performance Snapshot */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Omset Live Bulan Ini</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 text-base font-extrabold tracking-tight text-white">
            Rp {(totalMonthRevenue || 0).toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Shopee Live Tracking Active
          </p>
        </div>
      </div>
    </aside>
  );
};
