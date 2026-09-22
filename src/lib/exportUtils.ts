import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LiveSession } from '../types';

export function exportSessionsToExcel(sessions: LiveSession[], filename = 'Laporan_Live_Streamer_Shopee.xlsx') {
  const data = sessions.map((s, index) => ({
    'No': index + 1,
    'Tanggal': s.businessDate,
    'Shift': s.shiftName,
    'Streamer': s.streamerName,
    'Waktu': `${s.startTime} - ${s.endTime}`,
    'Durasi (Jam)': s.durationHours,
    'Omset (Rp)': s.revenue,
    'Pesanan (Orders)': s.orders,
    'Produk Terjual': s.productsSold,
    'AOV (Rp)': Math.round(s.averageOrderValue || 0),
    'Total Penonton': s.viewers,
    'Penonton Puncak (Peak)': s.peakViewers,
    'Rata-rata Penonton': s.averageViewers,
    'Klik Keranjang': s.productClicks,
    'Conversion Rate (%)': s.conversionRate,
    'Likes': s.likes,
    'Komentar': s.comments,
    'Followers Baru': s.newFollowers,
    'Voucher Digunakan': s.voucherUsed,
    'Pesanan Dibatalkan': s.cancelledOrders,
    'Pengembalian': s.refundOrders,
    'Biaya Iklan (Ads)': s.adsSpend,
    'Omset / Jam (Rp)': Math.round(s.revenuePerHour || 0),
    'Catatan': s.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Column width auto-tuning
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 20 }, // Shift
    { wch: 18 }, // Streamer
    { wch: 15 }, // Waktu
    { wch: 12 }, // Durasi
    { wch: 15 }, // Omset
    { wch: 15 }, // Pesanan
    { wch: 15 }, // Produk Terjual
    { wch: 14 }, // AOV
    { wch: 14 }, // Penonton
    { wch: 14 }, // Peak
    { wch: 14 }, // Avg Penonton
    { wch: 14 }, // Klik Produk
    { wch: 15 }, // CVR
    { wch: 12 }, // Likes
    { wch: 12 }, // Komentar
    { wch: 14 }, // Followers
    { wch: 15 }, // Voucher
    { wch: 15 }, // Batal
    { wch: 14 }, // Refund
    { wch: 15 }, // Ads
    { wch: 16 }, // Omset/Jam
    { wch: 30 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Live Shopee');
  XLSX.writeFile(workbook, filename);
}

export function exportSessionsToCsv(sessions: LiveSession[], filename = 'Laporan_Live_Streamer_Shopee.csv') {
  const headers = [
    'No',
    'Tanggal',
    'Shift',
    'Streamer',
    'Waktu',
    'Durasi (Jam)',
    'Omset (Rp)',
    'Pesanan (Orders)',
    'Produk Terjual',
    'AOV (Rp)',
    'Total Penonton',
    'Penonton Puncak (Peak)',
    'Rata-rata Penonton',
    'Klik Keranjang',
    'Conversion Rate (%)',
    'Likes',
    'Komentar',
    'Followers Baru',
    'Voucher Digunakan',
    'Pesanan Dibatalkan',
    'Pengembalian',
    'Biaya Iklan (Ads)',
    'Omset / Jam (Rp)',
    'Status Pesanan Shopee',
    'Catatan'
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = sessions.map((s, index) => [
    index + 1,
    s.businessDate,
    s.shiftName,
    s.streamerName,
    `${s.startTime} - ${s.endTime}`,
    s.durationHours,
    s.revenue,
    s.orders,
    s.productsSold,
    Math.round(s.averageOrderValue || 0),
    s.viewers,
    s.peakViewers,
    s.averageViewers,
    s.productClicks,
    s.conversionRate,
    s.likes,
    s.comments,
    s.newFollowers,
    s.voucherUsed,
    s.cancelledOrders,
    s.refundOrders,
    s.adsSpend,
    Math.round(s.revenuePerHour || 0),
    s.orderStatus || 'Pesanan Dibuat',
    s.notes || '-'
  ].map(escapeCsv).join(','));

  // Prepend UTF-8 BOM so Excel opens accented & special chars cleanly
  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSingleSessionPdf(session: LiveSession) {
  const doc = new jsPDF();

  // Primary Header
  doc.setFillColor(238, 77, 45); // Shopee Orange
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AT - LIVE REPORTS (SHOPEE LIVE)', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Session Report • ID: ${session.id}`, 14, 23);

  // Document Details Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI SESI', 14, 42);

  const infoData = [
    ['Nama Streamer', session.streamerName, 'Shift', session.shiftName],
    ['Tanggal Bisnis', session.businessDate, 'Waktu Live', `${session.startTime} - ${session.endTime} (${session.durationHours} Jam)`],
    ['Omset (GMV)', `Rp ${(session.revenue || 0).toLocaleString('id-ID')}`, 'Total Pesanan', `${session.orders} Pesanan`],
    ['Produk Terjual', `${session.productsSold} pcs`, 'Nilai Pesanan Rata-rata (AOV)', `Rp ${Math.round(session.averageOrderValue || 0).toLocaleString('id-ID')}`],
    ['Total Penonton', `${(session.viewers || 0).toLocaleString('id-ID')}`, 'Penonton Puncak (Peak)', `${(session.peakViewers || 0).toLocaleString('id-ID')}`],
    ['Klik Keranjang', `${(session.productClicks || 0).toLocaleString('id-ID')}`, 'Conversion Rate (CVR)', `${session.conversionRate}%`],
    ['Omset / Jam', `Rp ${Math.round(session.revenuePerHour || 0).toLocaleString('id-ID')}`, 'Biaya Iklan (Ads)', `Rp ${(session.adsSpend || 0).toLocaleString('id-ID')}`],
    ['Pembatalan', `${session.cancelledOrders} pesanan`, 'Pengembalian (Refund)', `${session.refundOrders} pesanan (Rp ${(session.refundAmount || 0).toLocaleString('id-ID')})`],
  ];

  autoTable(doc, {
    startY: 46,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    body: infoData,
    margin: { left: 14, right: 14 }
  });

  // Table of Products Sold
  let currentY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN PRODUK TERJUAL DALAM LIVE', 14, currentY);

  const productRows = (session.products && session.products.length > 0)
    ? session.products.map((p, idx) => [
        idx + 1,
        p.sku,
        p.productName,
        p.quantity,
        `Rp ${(p.price || 0).toLocaleString('id-ID')}`,
        `Rp ${(p.revenue || 0).toLocaleString('id-ID')}`
      ])
    : [[1, '-', 'Semua produk keranjang kuning', session.productsSold, '-', `Rp ${(session.revenue || 0).toLocaleString('id-ID')}`]];

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    head: [['No', 'SKU', 'Nama Produk', 'Qty Terjual', 'Harga Satuan', 'Subtotal Omset']],
    body: productRows,
    headStyles: { fillColor: [238, 77, 45], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });

  // Catatan & Insight Section
  currentY = (doc as any).lastAutoTable.finalY + 10;
  if (currentY < 240) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan Host / Evaluasi:', 14, currentY);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(session.notes || 'Tidak ada kendala teknis. Sesi berjalan optimal.', 180);
    doc.text(splitNotes, 14, currentY + 6);
  }

  // Footer signature
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dicetak secara otomatis oleh AT - Live Reports pada ${new Date().toLocaleString('id-ID')}`, 14, 285);

  const filename = `Laporan_Live_${session.streamerName.replace(/\s+/g, '_')}_${session.businessDate}.pdf`;
  doc.save(filename);
}

/**
 * Generate formatted text recap ready to paste into WhatsApp / Telegram
 */
export function generateWhatsAppSessionRecap(session: LiveSession): string {
  const productsText = (session.products && session.products.length > 0)
    ? session.products.map(p => `  • ${p.productName}: ${p.quantity} pcs (Rp ${(p.revenue || 0).toLocaleString('id-ID')})`).join('\n')
    : `  • Total ${session.productsSold || session.orders} produk terjual`;

  return `📊 *LAPORAN WAWASAN LIVE SHOPEE*
━━━━━━━━━━━━━━━━━━━━
👤 *Host*: ${session.streamerName}
📅 *Tanggal*: ${session.businessDate}
⏰ *Shift*: ${session.shiftName} (${session.startTime} - ${session.endTime} • ${session.durationHours} Jam)
📌 *Status*: ${session.orderStatus || 'Pesanan Dibuat'}

💰 *METRIK PENJUALAN*
• *Penjualan (GMV)*: Rp ${(session.revenue || 0).toLocaleString('id-ID')}
• *Total Pesanan*: ${session.orders || 0} orders
• *Produk Terjual*: ${session.productsSold || 0} pcs
• *AOV (Nilai/Pesanan)*: Rp ${(session.averageOrderValue || 0).toLocaleString('id-ID')}
• *RPM (Penjualan/mil)*: Rp ${(session.rpm || 0).toLocaleString('id-ID')}
• *Omset/Jam*: Rp ${(session.revenuePerHour || 0).toLocaleString('id-ID')}

👥 *TRAFFIC & ENGAGEMENT*
• *Dilihat (Views)*: ${(session.totalViews || session.viewers || 0).toLocaleString('id-ID')}
• *Penonton Unik*: ${(session.uniqueViewers || 0).toLocaleString('id-ID')}
• *Penonton Tertinggi (Peak)*: ${session.peakViewers || 0}
• *Penonton Aktif*: ${session.activeViewers || 0}
• *Komentar*: ${(session.comments || 0).toLocaleString('id-ID')} (${session.commentRate || 0}%)
• *Tambah ke Keranjang*: ${(session.addToCart || session.productClicks || 0).toLocaleString('id-ID')} (${session.clickRate || 0}% CTR)
• *Konversi (Pesanan/Klik)*: ${session.conversionRate || 0}%
• *Likes*: ${(session.likes || 0).toLocaleString('id-ID')}

🛍️ *PRODUK TERLARIS*:
${productsText}

📝 *CATATAN HOST*:
${session.notes || 'Sesi berjalan kondusif, sinyal stabil.'}
━━━━━━━━━━━━━━━━━━━━
_Generated automatically via AT - Live Reports_`;
}

export function generateWhatsAppTeamRecap(sessions: LiveSession[], title = 'REKAP KINERJA TIM LIVE SHOPEE'): string {
  const totalRev = sessions.reduce((acc, s) => acc + (s.revenue || 0), 0);
  const totalOrd = sessions.reduce((acc, s) => acc + (s.orders || 0), 0);
  const totalHrs = sessions.reduce((acc, s) => acc + (s.durationHours || 0), 0);
  const totalViews = sessions.reduce((acc, s) => acc + (s.totalViews || s.viewers || 0), 0);

  // Group by streamer
  const streamerMap = new Map<string, { name: string; rev: number; ord: number; hrs: number }>();
  sessions.forEach(s => {
    const existing = streamerMap.get(s.streamerId) || { name: s.streamerName, rev: 0, ord: 0, hrs: 0 };
    existing.rev += s.revenue || 0;
    existing.ord += s.orders || 0;
    existing.hrs += s.durationHours || 0;
    streamerMap.set(s.streamerId, existing);
  });

  const streamersList = Array.from(streamerMap.values())
    .sort((a, b) => b.rev - a.rev)
    .map((st, i) => `${i + 1}. *${st.name}*: Rp ${st.rev.toLocaleString('id-ID')} (${st.ord} ord • ${st.hrs.toFixed(1)} jam)`)
    .join('\n');

  return `📢 *${title.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
📅 Total Sesi: ${sessions.length} Sesi (${totalHrs.toFixed(1)} Jam Siaran)
💰 *Total Omset*: Rp ${totalRev.toLocaleString('id-ID')}
📦 *Total Pesanan*: ${totalOrd.toLocaleString('id-ID')} orders
👥 *Total Tayangan*: ${totalViews.toLocaleString('id-ID')} views
⚡ *Rata-rata Omset/Jam*: Rp ${totalHrs > 0 ? Math.round(totalRev / totalHrs).toLocaleString('id-ID') : 0}

🏆 *KLASEMEN HOST TERBAIK*:
${streamersList || 'Belum ada data'}
━━━━━━━━━━━━━━━━━━━━
_Tetap semangat & terus optimasi konversi keranjang kuning! 🔥_`;
}

