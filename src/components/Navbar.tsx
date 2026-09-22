import React, { useState } from 'react';
import { 
  Radio, 
  Bell, 
  PlusCircle, 
  Shield, 
  UserCheck, 
  ChevronDown, 
  Sparkles, 
  AlertCircle,
  Clock,
  LogOut,
  LogIn,
  Database,
  RotateCcw
} from 'lucide-react';
import { UserRole, Streamer, NotificationItem } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  streamers?: Streamer[];
  activeStreamerId?: string;
  onActiveStreamerChange?: (streamerId: string) => void;
  notifications?: NotificationItem[];
  onOpenReportModal: () => void;
  onSelectScheduleReport?: (scheduleId: string) => void;
  onOpenResetModal?: () => void;
  unreadCount?: number;
  pendingReportsCount?: number;
  userEmail?: string;
  onSignIn?: () => void;
  onSignOut?: () => void;
  isSignedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  streamers = [],
  activeStreamerId = '',
  onActiveStreamerChange = () => {},
  notifications = [],
  onOpenReportModal,
  onSelectScheduleReport,
  onOpenResetModal,
  unreadCount = 0,
  pendingReportsCount = 0,
  userEmail,
  onSignIn,
  onSignOut,
  isSignedIn = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const activeStreamer = streamers.find(s => s.id === activeStreamerId) || streamers[0];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ee4d2d] to-[#ff7337] text-white shadow-sm shadow-orange-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  AT <span className="text-[#ee4d2d]">- Live Reports</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#ee4d2d] border border-orange-200">
                  Shopee Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block leading-none">
                Monitoring & Analytics Tim Streamer
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Input Laporan Button */}
            <button
              id="btn-nav-input-laporan"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ee4d2d] hover:bg-[#e03d1c] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-orange-500/25 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Laporan</span>
            </button>

            {/* Reset / Kelola Data Button */}
            {onOpenResetModal && (
              <button
                id="btn-nav-reset-data"
                onClick={onOpenResetModal}
                title="Kelola Data / Reset ke Data Kosong"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden md:inline">Reset Data</span>
              </button>
            )}

            {/* Streamer Switcher (When in Streamer view or for test simulation) */}
            <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <span className="text-xs text-slate-500 px-2 font-medium">Host:</span>
              <select
                id="select-active-streamer"
                value={activeStreamerId}
                onChange={(e) => onActiveStreamerChange(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {streamers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {currentRole === 'ADMIN' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mode Admin</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Host: {activeStreamer?.name?.split(' ')[0] || 'Streamer'}</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pilih Mode Akses</p>
                  </div>
                  <button
                    onClick={() => {
                      onRoleChange('ADMIN');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      currentRole === 'ADMIN' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      Admin (Akses Penuh)
                    </span>
                    {currentRole === 'ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('STREAMER');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      currentRole === 'STREAMER' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Streamer (Host Live)
                    </span>
                    {currentRole === 'STREAMER' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>

                  {onOpenResetModal && (
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onOpenResetModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-orange-500" />
                          Kelola & Reset Data
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ee4d2d] text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#ee4d2d]" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Notifikasi & Pengingat
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold text-[#ee4d2d] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        {unreadCount} Perlu Ditinjau
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Tidak ada notifikasi baru
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                            notif.priority === 'high' ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                            notif.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {notif.priority === 'high' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            {notif.needsReport && onSelectScheduleReport && (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  onOpenReportModal();
                                }}
                                className="mt-2 text-xs font-semibold text-[#ee4d2d] hover:text-[#d33c1d] flex items-center gap-1 cursor-pointer"
                              >
                                <span>Input Laporan Sekarang &rarr;</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Google Sign In */}
            {isSignedIn ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ee4d2d] flex items-center justify-center text-xs font-bold ring-1 ring-orange-200">
                  {userEmail ? userEmail[0].toUpperCase() : 'U'}
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Keluar"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="btn-auth-signin"
                onClick={onSignIn}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Masuk</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
