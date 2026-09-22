import React, { useMemo } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  DollarSign
} from 'lucide-react';
import { ProductCatalog, LiveSession } from '../types';

interface ProductsViewProps {
  products: ProductCatalog[];
  sessions: LiveSession[];
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  sessions,
}) => {
  // Aggregate sales for each product from sessions
  const productsWithSales = useMemo(() => {
    const salesMap = new Map<string, { totalSold: number; totalRevenue: number; liveCount: number }>();

    sessions.forEach(sess => {
      sess.products?.forEach(p => {
        const existing = salesMap.get(p.sku) || { totalSold: 0, totalRevenue: 0, liveCount: 0 };
        existing.totalSold += p.quantity || 0;
        existing.totalRevenue += p.revenue || 0;
        existing.liveCount += 1;
        salesMap.set(p.sku, existing);
      });
    });

    return products.map(prod => {
      const stats = salesMap.get(prod.sku) || { totalSold: 0, totalRevenue: 0, liveCount: 0 };
      return {
        ...prod,
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
        liveCount: stats.liveCount,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [products, sessions]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Katalog Produk & Kontribusi Penjualan Live
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ee4d2d] border border-orange-200">
              Keranjang Kuning
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar SKU produk Shopee beserta total omset yang dihasilkan dari sesi live streaming.
          </p>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">No</th>
                <th className="pb-3">SKU & Nama Produk</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Harga Normal</th>
                <th className="pb-3">Pcs Terjual di Live</th>
                <th className="pb-3">Total Omset Live</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {productsWithSales.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5">
                    <p className="font-extrabold text-slate-900 text-sm leading-tight">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-slate-800">
                    Rp {p.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 font-bold text-indigo-600">
                    {p.totalSold > 0 ? `${p.totalSold} pcs` : '-'}
                  </td>
                  <td className="py-3.5 font-extrabold text-slate-900 text-sm">
                    {p.totalRevenue > 0 ? `Rp ${p.totalRevenue.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Aktif di Keranjang
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
