import React, { useState, useEffect, useId, useRef } from 'react';
import { 
  X, 
  Save, 
  Clock, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  AlertCircle,
  Eye,
  RotateCcw,
  Zap,
  Camera,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { LiveSession, Streamer, Shift, ProductCatalog, ProductSoldItem } from '../types';
import { ShopeeWawasanCard } from './ShopeeWawasanCard';

interface ReportInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: LiveSession) => Promise<void>;
  streamers: Streamer[];
  shifts: Shift[];
  products: ProductCatalog[];
  initialData?: Partial<LiveSession>;
}

export const ReportInputModal: React.FC<ReportInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  streamers,
  shifts,
  products,
  initialData,
}) => {
  const modalTitleId = useId();

  // Schedule & Streamer
  const [streamerId, setStreamerId] = useState<string>('');
  const [businessDate, setBusinessDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shiftId, setShiftId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('12:00');

  // Exact Shopee Wawasan Livestream Fields
  const [orderStatus, setOrderStatus] = useState<'Pesanan Dibuat' | 'Pesanan Dibayar' | 'Pesanan Selesai'>('Pesanan Dibuat');
  const [revenue, setRevenue] = useState<number>(0);
  const [activeViewers, setActiveViewers] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const [addToCart, setAddToCart] = useState<number>(0);

  // Row 1 Shopee Wawasan
  const [totalViews, setTotalViews] = useState<number>(0); // Dilihat
  const [avgWatchDuration, setAvgWatchDuration] = useState<string>('00:00:35'); // Durasi Rata-Rata Menonton
  const [commentRate, setCommentRate] = useState<number>(0); // Persentase Komentar
  const [rpm, setRpm] = useState<number>(0); // Penjualan per mil (Rp)
  const [orders, setOrders] = useState<number>(0); // Pesanan
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0); // Nilai Penjualan per Pesanan

  // Row 2 Shopee Wawasan
  const [uniqueViewers, setUniqueViewers] = useState<number>(0); // Penonton
  const [peakViewers, setPeakViewers] = useState<number>(0); // Penonton Tertinggi
  const [clickRate, setClickRate] = useState<number>(0); // Persentase Klik
  const [conversionRate, setConversionRate] = useState<number>(0); // Pesanan per Klik (%)
  const [buyers, setBuyers] = useState<number>(0); // Pembeli
  const [productsSold, setProductsSold] = useState<number>(0); // Produk Terjual

  // Additional Engagement & Marketing
  const [likes, setLikes] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [newFollowers, setNewFollowers] = useState<number>(0);
  const [adsSpend, setAdsSpend] = useState<number>(0);
  const [voucherUsed, setVoucherUsed] = useState<number>(0);
  const [cancelledOrders, setCancelledOrders] = useState<number>(0);
  const [refundOrders, setRefundOrders] = useState<number>(0);
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Products breakdown
  const [soldProducts, setSoldProducts] = useState<ProductSoldItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [showShopeePreview, setShowShopeePreview] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // AI OCR Screenshot Scanner States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string>('');
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageForOcr = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar screenshot (JPG, PNG, atau WEBP).');
      return;
    }

    setIsScanning(true);
    setScanSuccessMsg('');
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        setScannedImagePreview(base64Data);

        try {
          const res = await fetch('/api/ai-scan-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type,
            }),
          });

          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            if (d.orderStatus) setOrderStatus(d.orderStatus);
            if (d.revenue !== undefined) setRevenue(Number(d.revenue));
            if (d.activeViewers !== undefined) setActiveViewers(Number(d.activeViewers));
            if (d.comments !== undefined) setComments(Number(d.comments));
            if (d.addToCart !== undefined) setAddToCart(Number(d.addToCart));

            if (d.totalViews !== undefined) setTotalViews(Number(d.totalViews));
            if (d.avgWatchDuration) setAvgWatchDuration(d.avgWatchDuration);
            if (d.commentRate !== undefined) setCommentRate(Number(d.commentRate));
            if (d.rpm !== undefined) setRpm(Number(d.rpm));
            if (d.orders !== undefined) setOrders(Number(d.orders));
            if (d.averageOrderValue !== undefined) setAverageOrderValue(Number(d.averageOrderValue));

            if (d.uniqueViewers !== undefined) setUniqueViewers(Number(d.uniqueViewers));
            if (d.peakViewers !== undefined) setPeakViewers(Number(d.peakViewers));
            if (d.clickRate !== undefined) setClickRate(Number(d.clickRate));
            if (d.conversionRate !== undefined) setConversionRate(Number(d.conversionRate));
            if (d.buyers !== undefined) setBuyers(Number(d.buyers));
            if (d.productsSold !== undefined) setProductsSold(Number(d.productsSold));

            if (d.notes) setNotes(d.notes);

            setScanSuccessMsg(json.isFallback 
              ? '✨ Berhasil memuat metrik Wawasan Livestream dari contoh screenshot!' 
              : '✨ Berhasil mengekstrak 16 metrik Wawasan Livestream dengan Gemini Vision!'
            );
          } else {
            setErrorMsg(json.error || 'Gagal membaca metrik dari screenshot.');
          }
        } catch (netErr: any) {
          setErrorMsg(netErr.message || 'Koneksi ke server AI gagal.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg(err.message || 'Gagal memproses gambar screenshot.');
    }
  };

  // Listen for paste anywhere in the window while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processImageForOcr(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Prepopulate form
  useEffect(() => {
    if (initialData) {
      if (initialData.streamerId) setStreamerId(initialData.streamerId);
      else if (streamers.length > 0) setStreamerId(streamers[0].id);

      if (initialData.businessDate) setBusinessDate(initialData.businessDate);
      if (initialData.shiftId) setShiftId(initialData.shiftId);
      else if (shifts.length > 0) setShiftId(shifts[0].id);

      if (initialData.startTime) setStartTime(initialData.startTime);
      if (initialData.endTime) setEndTime(initialData.endTime);

      setOrderStatus(initialData.orderStatus || 'Pesanan Dibuat');
      setRevenue(initialData.revenue || 0);
      setActiveViewers(initialData.activeViewers || 0);
      setComments(initialData.comments || 0);
      setAddToCart(initialData.addToCart || initialData.productClicks || 0);

      setTotalViews(initialData.totalViews || initialData.viewers || 0);
      setAvgWatchDuration(initialData.avgWatchDuration || '00:00:35');
      setCommentRate(initialData.commentRate || 0);
      setRpm(initialData.rpm || 0);
      setOrders(initialData.orders || 0);
      setAverageOrderValue(initialData.averageOrderValue || 0);

      setUniqueViewers(initialData.uniqueViewers || 0);
      setPeakViewers(initialData.peakViewers || 0);
      setClickRate(initialData.clickRate || 0);
      setConversionRate(initialData.conversionRate || 0);
      setBuyers(initialData.buyers || initialData.orders || 0);
      setProductsSold(initialData.productsSold || 0);

      setLikes(initialData.likes || 0);
      setShares(initialData.shares || 0);
      setNewFollowers(initialData.newFollowers || 0);
      setAdsSpend(initialData.adsSpend || 0);
      setVoucherUsed(initialData.voucherUsed || 0);
      setCancelledOrders(initialData.cancelledOrders || 0);
      setRefundOrders(initialData.refundOrders || 0);
      setRefundAmount(initialData.refundAmount || 0);

      setSoldProducts(initialData.products || []);
      setNotes(initialData.notes || '');
    } else {
      if (streamers.length > 0 && !streamerId) setStreamerId(streamers[0].id);
      if (shifts.length > 0 && !shiftId) {
        setShiftId(shifts[0].id);
        setStartTime(shifts[0].startTime);
        setEndTime(shifts[0].endTime);
      }
    }
  }, [initialData, streamers, shifts]);

  // Handle loading exact screenshot values
  const handleLoadShopeeScreenshotExample = () => {
    setOrderStatus('Pesanan Dibuat');
    setRevenue(1243800);
    setActiveViewers(412);
    setComments(24);
    setAddToCart(72);

    setTotalViews(3061);
    setAvgWatchDuration('00:00:35');
    setCommentRate(0.8);
    setRpm(406338);
    setOrders(11);
    setAverageOrderValue(113073);

    setUniqueViewers(2643);
    setPeakViewers(101);
    setClickRate(3.7);
    setConversionRate(9.7);
    setBuyers(11);
    setProductsSold(23);

    setLikes(12500);
    setShares(45);
    setNewFollowers(68);
    setAdsSpend(80000);
    setVoucherUsed(8);

    if (soldProducts.length === 0) {
      setSoldProducts([
        { sku: 'FASH-GAMIS-02', productName: 'Gamis Rayon Twill Premium Busui', quantity: 12, price: 65000, revenue: 780000 },
        { sku: 'FASH-TEE-03', productName: 'Kaos Polos Heavyweight Cotton Combed', quantity: 11, price: 42163, revenue: 463800 },
      ]);
    }
    setNotes('Data terisi sesuai screenshot Wawasan Livestream Shopee: Rp 1.243.800 (11 pesanan, 23 produk terjual, CVR 9.7%).');
  };

  // Shift change handler
  const handleShiftChange = (sId: string) => {
    setShiftId(sId);
    const selected = shifts.find(s => s.id === sId);
    if (selected) {
      setStartTime(selected.startTime);
      setEndTime(selected.endTime);
    }
  };

  // Duration calculation
  const durationStats = React.useMemo(() => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      let startMinutes = startH * 60 + (startM || 0);
      let endMinutes = endH === 24 ? 24 * 60 : endH * 60 + (endM || 0);

      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }

      const totalMinutes = endMinutes - startMinutes;
      const totalHours = Number((totalMinutes / 60).toFixed(2));
      return { totalMinutes, totalHours };
    } catch {
      return { totalMinutes: 360, totalHours: 6.0 };
    }
  }, [startTime, endTime]);

  // Auto calculate helpers when inputs change
  const handleRevenueChange = (val: number) => {
    setRevenue(val);
    if (orders > 0) setAverageOrderValue(Math.round(val / orders));
    if (totalViews > 0) setRpm(Math.round((val / totalViews) * 1000));
  };

  const handleOrdersChange = (val: number) => {
    setOrders(val);
    if (val > 0 && revenue > 0) setAverageOrderValue(Math.round(revenue / val));
    if (addToCart > 0) setConversionRate(Number(((val / addToCart) * 100).toFixed(1)));
    if (buyers === 0 || buyers < val) setBuyers(val);
    if (productsSold === 0) setProductsSold(val);
  };

  const handleTotalViewsChange = (val: number) => {
    setTotalViews(val);
    if (val > 0 && revenue > 0) setRpm(Math.round((revenue / val) * 1000));
    if (val > 0 && comments > 0) setCommentRate(Number(((comments / val) * 100).toFixed(1)));
    if (val > 0 && addToCart > 0) setClickRate(Number(((addToCart / val) * 100).toFixed(1)));
    if (uniqueViewers === 0) setUniqueViewers(Math.round(val * 0.85));
  };

  const handleAddToCartChange = (val: number) => {
    setAddToCart(val);
    if (totalViews > 0 && val > 0) setClickRate(Number(((val / totalViews) * 100).toFixed(1)));
    if (val > 0 && orders > 0) setConversionRate(Number(((orders / val) * 100).toFixed(1)));
  };

  const handleCommentsChange = (val: number) => {
    setComments(val);
    if (totalViews > 0 && val > 0) setCommentRate(Number(((val / totalViews) * 100).toFixed(1)));
  };

  // Product items handlers
  const handleAddProduct = () => {
    const firstCatalog = products[0];
    setSoldProducts([
      ...soldProducts,
      {
        sku: firstCatalog?.sku || `SKU-${Date.now().toString().slice(-4)}`,
        productName: firstCatalog?.name || 'Produk Baru',
        quantity: 1,
        price: firstCatalog?.price || 50000,
        revenue: firstCatalog?.price || 50000,
      }
    ]);
  };

  const handleUpdateProduct = (index: number, field: keyof ProductSoldItem, value: any) => {
    const updated = [...soldProducts];
    const current = { ...updated[index], [field]: value };

    if (field === 'sku') {
      const match = products.find(p => p.sku === value);
      if (match) {
        current.productName = match.name;
        current.price = match.price;
      }
    }

    if (field === 'quantity' || field === 'price') {
      current.revenue = (Number(current.quantity) || 0) * (Number(current.price) || 0);
    }

    updated[index] = current;
    setSoldProducts(updated);

    const totalQty = updated.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
    const totalRev = updated.reduce((acc, p) => acc + (Number(p.revenue) || 0), 0);
    if (productsSold === 0 || productsSold < totalQty) setProductsSold(totalQty);
    if (revenue === 0 || revenue < totalRev) handleRevenueChange(totalRev);
  };

  const handleRemoveProduct = (index: number) => {
    setSoldProducts(soldProducts.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (autoAnalyze = false) => {
    if (!streamerId) {
      setErrorMsg('Pilih host streamer terlebih dahulu!');
      return;
    }
    if (!businessDate) {
      setErrorMsg('Tentukan tanggal bisnis sesi live!');
      return;
    }
    if (!shiftId) {
      setErrorMsg('Pilih shift pelaksanaan!');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const selectedStreamer = streamers.find(s => s.id === streamerId);
      const selectedShift = shifts.find(s => s.id === shiftId);

      const calculatedRevPerHour = durationStats.totalHours > 0 
        ? Math.round(revenue / durationStats.totalHours) 
        : 0;
      const calculatedOrdersPerHour = durationStats.totalHours > 0 
        ? Number((orders / durationStats.totalHours).toFixed(1)) 
        : 0;

      const payload: LiveSession = {
        id: initialData?.id || `sess-${Date.now()}`,
        streamerId,
        streamerName: selectedStreamer?.name || 'Streamer',
        businessDate,
        shiftId,
        shiftName: selectedShift?.name || 'Shift',
        startTime,
        endTime,
        durationMinutes: durationStats.totalMinutes,
        durationHours: durationStats.totalHours,

        // Shopee Official Wawasan Fields
        orderStatus,
        revenue: Number(revenue) || 0,
        activeViewers: Number(activeViewers) || 0,
        comments: Number(comments) || 0,
        addToCart: Number(addToCart) || 0,

        totalViews: Number(totalViews) || 0,
        viewers: Number(totalViews) || Number(uniqueViewers) || 0,
        avgWatchDuration,
        commentRate: Number(commentRate) || 0,
        rpm: Number(rpm) || 0,
        orders: Number(orders) || 0,
        averageOrderValue: Number(averageOrderValue) || (orders > 0 ? Math.round(revenue / orders) : 0),

        uniqueViewers: Number(uniqueViewers) || 0,
        peakViewers: Number(peakViewers) || 0,
        averageViewers: Number(activeViewers) || Math.round((Number(peakViewers) || 0) * 0.7),
        clickRate: Number(clickRate) || 0,
        conversionRate: Number(conversionRate) || 0,
        buyers: Number(buyers) || orders,
        productsSold: Number(productsSold) || orders,

        // Engagement & Funnel
        likes: Number(likes) || 0,
        shares: Number(shares) || 0,
        newFollowers: Number(newFollowers) || 0,
        productImpressions: Number(totalViews) || 0,
        productClicks: Number(addToCart) || 0,
        checkout: Math.round(orders * 1.2),

        voucherUsed: Number(voucherUsed) || 0,
        cancelledOrders: Number(cancelledOrders) || 0,
        refundOrders: Number(refundOrders) || 0,
        refundAmount: Number(refundAmount) || 0,
        affiliateOrders: 0,
        affiliateRevenue: 0,
        adsSpend: Number(adsSpend) || 0,

        revenuePerHour: calculatedRevPerHour,
        ordersPerHour: calculatedOrdersPerHour,
        viewersPerHour: durationStats.totalHours > 0 ? Math.round((Number(totalViews) || 0) / durationStats.totalHours) : 0,
        revenuePerViewer: (Number(totalViews) || 0) > 0 ? Math.round((Number(revenue) || 0) / (Number(totalViews) || 1)) : 0,

        products: soldProducts,
        notes,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan laporan sesi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Session state for real-time preview
  const currentPreviewSession: Partial<LiveSession> = {
    orderStatus,
    revenue,
    activeViewers,
    comments,
    addToCart,
    totalViews,
    avgWatchDuration,
    commentRate,
    rpm,
    orders,
    averageOrderValue,
    uniqueViewers,
    peakViewers,
    clickRate,
    conversionRate,
    buyers,
    productsSold,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ee4d2d] to-[#ff6433] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id={modalTitleId} className="text-base sm:text-lg font-extrabold leading-tight">
                {initialData?.id ? 'Edit Laporan Wawasan Livestream Shopee' : 'Input Laporan Wawasan Livestream Shopee'}
              </h2>
              <p className="text-xs text-orange-100">
                Disinkronkan dengan metrik dashboard Wawasan Livestream Shopee Live
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadShopeeScreenshotExample}
              title="Isi contoh nilai dari screenshot Shopee"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Contoh Screenshot (Rp 1.243.800)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Action Bar for Mobile */}
          <div className="sm:hidden flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-[11px] font-semibold text-orange-900">Uji Coba Cepat:</span>
            <button
              onClick={handleLoadShopeeScreenshotExample}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ee4d2d] text-white text-xs font-bold"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Isi Data Screenshot</span>
            </button>
          </div>

          {/* AI Screenshot Scanner Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-50 border-2 border-dashed border-orange-300 relative overflow-hidden transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ee4d2d] text-white flex items-center justify-center shrink-0 shadow-xs">
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      📸 AI Screenshot Scanner (Wawasan Livestream)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ee4d2d] text-white tracking-wide uppercase">
                      Gemini Vision
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Unggah screenshot, seret gambar ke sini, atau langsung tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px] font-bold">Ctrl + V</kbd> untuk mengekstrak 16 metrik Shopee otomatis!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processImageForOcr(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff6433] hover:from-[#d83f21] hover:to-[#ee4d2d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menganalisis Gambar...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload / Scan Screenshot</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scan Success Banner */}
            {scanSuccessMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{scanSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanSuccessMsg('')}
                  className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Thumbnail preview if uploaded */}
            {scannedImagePreview && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-white/80 rounded-xl border border-orange-200">
                <img 
                  src={scannedImagePreview} 
                  alt="Thumbnail Screenshot" 
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">Screenshot Shopee Berhasil Dipindai</p>
                  <p className="text-slate-500">Nilai telah diisikan ke formulir di bawah. Silakan verifikasi atau sesuaikan jika perlu.</p>
                </div>
              </div>
            )}
          </div>

          {/* Shopee Real-Time Wawasan Card Preview */}
          <div className="border border-orange-200/90 rounded-2xl p-4 bg-orange-50/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ee4d2d] animate-pulse" />
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Pratinjau Widget Shopee Wawasan Livestream
                </span>
              </div>
              <button
                onClick={() => setShowShopeePreview(!showShopeePreview)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showShopeePreview ? 'Sembunyikan' : 'Tampilkan Widget'}</span>
              </button>
            </div>

            {showShopeePreview && (
              <ShopeeWawasanCard 
                session={currentPreviewSession}
                showStatusSelector={true}
                onStatusChange={setOrderStatus}
              />
            )}
          </div>

          {/* SECTION 1: Informasi Host, Jadwal & Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#ee4d2d]" />
              1. Host Streamer & Jadwal Live
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Host Streamer <span className="text-red-500">*</span>
                </label>
                <select
                  value={streamerId}
                  onChange={(e) => setStreamerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Pilih Streamer</option>
                  {streamers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Bisnis Live <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={businessDate}
                  onChange={(e) => setBusinessDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Shift Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <select
                  value={shiftId}
                  onChange={(e) => handleShiftChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Pilih Shift</option>
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>{sh.name} ({sh.startTime}-{sh.endTime})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Status Pesanan Shopee
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Pesanan Dibuat">Pesanan Dibuat</option>
                  <option value="Pesanan Dibayar">Pesanan Dibayar</option>
                  <option value="Pesanan Selesai">Pesanan Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Jam Mulai
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="bg-orange-50 border border-orange-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-950">Durasi Live:</span>
                  <span className="text-xs font-extrabold text-[#ee4d2d]">
                    {durationStats.totalHours} Jam ({durationStats.totalMinutes} mnt)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Form Metrik Persis Shopee Wawasan Livestream */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-orange-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ee4d2d]" />
                2. Input Metrik Wawasan Livestream Shopee
              </h3>
              <span className="text-[11px] text-slate-500">
                Sesuai tampilan dashboard Shopee Live
              </span>
            </div>

            {/* Banner Utama: Penjualan (Rp) */}
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
              <label className="block text-xs font-extrabold text-[#ee4d2d] mb-1">
                Penjualan (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={revenue || ''}
                  onChange={(e) => handleRevenueChange(Number(e.target.value))}
                  placeholder="1243800"
                  className="w-full bg-white border border-orange-300 rounded-xl pl-9 pr-3 py-2 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Total omset penjualan kotor sesi live (Gross Merchandise Value)
              </span>
            </div>

            {/* Baris Tengah: 3 Kartu (Penonton Aktif, Komentar, Tambah ke Keranjang) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Penonton Aktif
                </label>
                <input
                  type="number"
                  value={activeViewers || ''}
                  onChange={(e) => setActiveViewers(Number(e.target.value))}
                  placeholder="412"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-extrabold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Penonton yang sedang aktif berinteraksi</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Komentar
                </label>
                <input
                  type="number"
                  value={comments || ''}
                  onChange={(e) => handleCommentsChange(Number(e.target.value))}
                  placeholder="24"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-extrabold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Jumlah total chat / komentar masuk</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tambah ke Keranjang
                </label>
                <input
                  type="number"
                  value={addToCart || ''}
                  onChange={(e) => handleAddToCartChange(Number(e.target.value))}
                  placeholder="72"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-extrabold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Klik produk keranjang kuning</span>
              </div>
            </div>

            {/* Rincian Baris 1: Dilihat, Durasi Rata-Rata, Persentase Komentar, Penjualan per mil, Pesanan, Nilai Penjualan per Pesanan */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 block uppercase tracking-wider">
                Rincian Metrik Baris 1
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Dilihat</label>
                  <input
                    type="number"
                    value={totalViews || ''}
                    onChange={(e) => handleTotalViewsChange(Number(e.target.value))}
                    placeholder="3061"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">Total tayangan</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate" title="Durasi Rata-Rata Menonton">
                    Durasi Rata-Rata
                  </label>
                  <input
                    type="text"
                    value={avgWatchDuration}
                    onChange={(e) => setAvgWatchDuration(e.target.value)}
                    placeholder="00:00:35"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">HH:MM:SS</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">% Komentar</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commentRate || ''}
                    onChange={(e) => setCommentRate(Number(e.target.value))}
                    placeholder="0.8"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">% terhadap tayangan</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate" title="Penjualan per mil (RPM)">
                    Penjualan/mil (Rp)
                  </label>
                  <input
                    type="number"
                    value={rpm || ''}
                    onChange={(e) => setRpm(Number(e.target.value))}
                    placeholder="406338"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">RPM per 1.000 views</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Pesanan</label>
                  <input
                    type="number"
                    value={orders || ''}
                    onChange={(e) => handleOrdersChange(Number(e.target.value))}
                    placeholder="11"
                    className="w-full bg-white border border-orange-300 rounded-lg px-2 py-1 text-xs font-extrabold text-orange-600"
                  />
                  <span className="text-[9px] text-slate-400">Total order masuk</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate" title="Nilai Penjualan per Pesanan (AOV)">
                    Nilai/Pesanan (Rp)
                  </label>
                  <input
                    type="number"
                    value={averageOrderValue || ''}
                    onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                    placeholder="113073"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">AOV rata-rata</span>
                </div>
              </div>
            </div>

            {/* Rincian Baris 2: Penonton, Penonton Tertinggi, Persentase Klik, Pesanan per Klik, Pembeli, Produk Terjual */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 block uppercase tracking-wider">
                Rincian Metrik Baris 2
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Penonton</label>
                  <input
                    type="number"
                    value={uniqueViewers || ''}
                    onChange={(e) => setUniqueViewers(Number(e.target.value))}
                    placeholder="2643"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">Penonton unik</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate" title="Penonton Tertinggi (Peak Concurrent Viewers)">
                    Penonton Tertinggi
                  </label>
                  <input
                    type="number"
                    value={peakViewers || ''}
                    onChange={(e) => setPeakViewers(Number(e.target.value))}
                    placeholder="101"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">Peak penonton</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">% Klik</label>
                  <input
                    type="number"
                    step="0.1"
                    value={clickRate || ''}
                    onChange={(e) => setClickRate(Number(e.target.value))}
                    placeholder="3.7"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">CTR keranjang</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 truncate" title="Pesanan per Klik (Conversion Rate %)">
                    Pesanan/Klik (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={conversionRate || ''}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    placeholder="9.7"
                    className="w-full bg-white border border-orange-300 rounded-lg px-2 py-1 text-xs font-extrabold text-[#ee4d2d]"
                  />
                  <span className="text-[9px] text-slate-400">CVR Konversi</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Pembeli</label>
                  <input
                    type="number"
                    value={buyers || ''}
                    onChange={(e) => setBuyers(Number(e.target.value))}
                    placeholder="11"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">User pembeli unik</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Produk Terjual</label>
                  <input
                    type="number"
                    value={productsSold || ''}
                    onChange={(e) => setProductsSold(Number(e.target.value))}
                    placeholder="23"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">Total pcs checkout</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Engagement Tambahan & Biaya Iklan */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              3. Engagement & Iklan Shopee Live
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Likes (Ketuk Layar)
                </label>
                <input
                  type="number"
                  value={likes || ''}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  placeholder="12500"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Shares (Bagikan)
                </label>
                <input
                  type="number"
                  value={shares || ''}
                  onChange={(e) => setShares(Number(e.target.value))}
                  placeholder="45"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Follower Baru
                </label>
                <input
                  type="number"
                  value={newFollowers || ''}
                  onChange={(e) => setNewFollowers(Number(e.target.value))}
                  placeholder="68"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Biaya Iklan Shopee Live (Rp)
                </label>
                <input
                  type="number"
                  value={adsSpend || ''}
                  onChange={(e) => setAdsSpend(Number(e.target.value))}
                  placeholder="80000"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Rincian Produk Terjual (SKU Breakdown) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                4. Rincian Produk Terlaris Sesi Ini
              </h3>
              <button
                type="button"
                onClick={handleAddProduct}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#ee4d2d] text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Produk</span>
              </button>
            </div>

            {soldProducts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Belum ada produk rincian yang ditambahkan. Klik "Tambah Produk" untuk mencatat produk best-seller sesi ini.
              </p>
            ) : (
              <div className="space-y-2">
                {soldProducts.map((prod, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Produk</label>
                      <input
                        type="text"
                        value={prod.productName}
                        onChange={(e) => handleUpdateProduct(idx, 'productName', e.target.value)}
                        placeholder="Nama Produk"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Qty (Pcs)</label>
                      <input
                        type="number"
                        value={prod.quantity}
                        onChange={(e) => handleUpdateProduct(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-center"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Harga Satuan (Rp)</label>
                      <input
                        type="number"
                        value={prod.price}
                        onChange={(e) => handleUpdateProduct(idx, 'price', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Subtotal (Rp)</label>
                      <span className="text-xs font-bold text-slate-800 block pt-1">
                        Rp {(prod.revenue || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: Catatan Evaluasi Host */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              5. Catatan Host / Kejadian Live
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Voucher toko habis pada menit ke-45. Banyak penonton menanyakan restock ukuran L. Koneksi internet stabil."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {orders > 0 && revenue > 0 && (
              <span>
                Total: <strong className="text-slate-900">Rp {revenue.toLocaleString('id-ID')}</strong> ({orders} Pesanan, CVR {conversionRate}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5d2a] hover:from-[#d83f1f] hover:to-[#e84e1c] text-white text-xs font-extrabold shadow-sm shadow-orange-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
