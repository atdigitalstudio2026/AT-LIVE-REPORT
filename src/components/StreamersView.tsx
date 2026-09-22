import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Clock, 
  Trash2, 
  Edit3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Calendar,
  Award
} from 'lucide-react';
import { Streamer, LiveSession, UserRole } from '../types';

interface StreamersViewProps {
  streamers: Streamer[];
  sessions: LiveSession[];
  currentRole: UserRole;
  onSaveStreamer: (streamer: Streamer) => Promise<void>;
  onDeleteStreamer: (id: string) => Promise<void>;
}

export const StreamersView: React.FC<StreamersViewProps> = ({
  streamers,
  sessions,
  currentRole,
  onSaveStreamer,
  onDeleteStreamer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  const openAddModal = (streamer?: Streamer) => {
    if (streamer) {
      setEditingStreamer(streamer);
      setName(streamer.name);
      setEmail(streamer.email);
      setPhone(streamer.phone);
      setAvatar(streamer.avatar);
      setStatus(streamer.status);
      setNotes(streamer.notes || '');
    } else {
      setEditingStreamer(null);
      setName('');
      setEmail('');
      setPhone('');
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
      setStatus('active');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Streamer = {
      id: editingStreamer?.id || `str-${Date.now()}`,
      name,
      email,
      phone,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status,
      joinDate: editingStreamer?.joinDate || new Date().toISOString().split('T')[0],
      notes,
    };

    await onSaveStreamer(payload);
    setIsModalOpen(false);
  };

  // Compute live sales performance per streamer from sessions
  const streamersWithStats = streamers.map(s => {
    const streamerSessions = sessions.filter(sess => sess.streamerId === s.id);
    const totalRev = streamerSessions.reduce((acc, sess) => acc + (sess.revenue || 0), 0);
    const totalOrd = streamerSessions.reduce((acc, sess) => acc + (sess.orders || 0), 0);
    const totalHrs = streamerSessions.reduce((acc, sess) => acc + (sess.durationHours || 0), 0);
    const totalClicks = streamerSessions.reduce((acc, sess) => acc + (sess.productClicks || 0), 0);
    const avgCvr = totalClicks > 0 ? Number(((totalOrd / totalClicks) * 100).toFixed(1)) : 0;
    const revPerHour = totalHrs > 0 ? Math.round(totalRev / totalHrs) : 0;
    const avgAov = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;

    return {
      ...s,
      calculatedRevenue: totalRev,
      calculatedOrders: totalOrd,
      calculatedHours: Number(totalHrs.toFixed(1)),
      calculatedCvr: avgCvr,
      revPerHour,
      avgAov,
      sessionCount: streamerSessions.length,
    };
  });

  // Overall Tim Aggregations
  const totalTeamRevenue = streamersWithStats.reduce((acc, s) => acc + s.calculatedRevenue, 0);
  const totalTeamOrders = streamersWithStats.reduce((acc, s) => acc + s.calculatedOrders, 0);
  const totalTeamHours = streamersWithStats.reduce((acc, s) => acc + s.calculatedHours, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Tim Host Streamer Shopee
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
              {streamers.length} Host Terdaftar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data profil host, monitoring kontribusi penjualan GMV, total jam siaran, dan efisiensi konversi penjualan.
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ee4d2d] hover:bg-[#de3d1d] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Host Baru</span>
          </button>
        )}
      </div>

      {/* High-level Team Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Kontribusi GMV Tim
          </span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            Rp {totalTeamRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dari seluruh sesi live yang terdata</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Pesanan Tercipta
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalTeamOrders.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500 font-semibold">Pesanan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Checkout terkonfirmasi keranjang kuning</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Jam Siaran Mengudara
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalTeamHours.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-semibold">Jam Siaran</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi jam live seluruh host</p>
        </div>
      </div>

      {/* Streamers Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {streamersWithStats.map(st => (
          <div key={st.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{st.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      st.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {st.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {st.status === 'active' ? 'Aktif Mengudara' : 'Non-aktif'}
                    </span>
                  </div>
                </div>

                {currentRole === 'ADMIN' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAddModal(st)}
                      title="Edit Data Streamer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStreamer(st.id)}
                      title="Hapus Streamer"
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-3.5 space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{st.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{st.phone}</span>
                </p>
              </div>

              {/* Performance Analytics Grid */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Omset GMV</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    Rp {(st.calculatedRevenue || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Pesanan</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {st.calculatedOrders} pesanan
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Jam Mengudara</span>
                  <span className="font-bold text-slate-700">
                    {st.calculatedHours} Jam ({st.sessionCount} Sesi)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Rata-rata CVR</span>
                  <span className="font-extrabold text-emerald-600">
                    {st.calculatedCvr}%
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Omset / Jam</span>
                  <span className="font-bold text-amber-700">
                    Rp {st.revPerHour.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Rata-rata AOV</span>
                  <span className="font-bold text-indigo-700">
                    Rp {st.avgAov.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Bio notes */}
              {st.notes && (
                <p className="text-[11px] text-slate-500 italic mt-3 line-clamp-2">
                  "{st.notes}"
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Bergabung: {st.joinDate}</span>
              <span className="text-[#ee4d2d] font-bold">Shopee Live Host</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Streamer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              {editingStreamer ? 'Edit Data Streamer' : 'Tambah Host Streamer Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Lengkap Host
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Cindy Claudia"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cindy@shopeelive.id"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Status Host
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="active">Aktif (Active)</option>
                    <option value="inactive">Non-aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  URL Foto / Avatar
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Kategori Spesialisasi & Catatan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Spesialisasi Skincare & Beauty. Sangat komunikatif..."
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
                  Simpan Streamer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
