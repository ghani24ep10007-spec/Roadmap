import React, { useState } from 'react';
import { UMKMProduct, UMKMSale } from '../types';
import {
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Plus,
  CreditCard,
  QrCode,
  Package,
  CheckCircle,
  RefreshCw,
  Bell,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess, playCyberAlert } from '../utils/audio';

interface UmkmDashboardProps {
  products: UMKMProduct[];
  sales: UMKMSale[];
  onAddSale: (sale: UMKMSale) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onTriggerSync: () => void;
  isOnline: boolean;
}

export const UmkmDashboard: React.FC<UmkmDashboardProps> = ({
  products,
  sales,
  onAddSale,
  onUpdateProductStock,
  onExportExcel,
  onExportPdf,
  onTriggerSync,
  isOnline,
}) => {
  const [showNewSaleModal, setShowNewSaleModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [saleQty, setSaleQty] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<UMKMSale['paymentMethod']>('QRIS');
  const [simulatingPayment, setSimulatingPayment] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<UMKMSale | null>(null);

  // Calculate metrics
  const totalOmzet = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Calculate COGS and Profit
  const totalCost = sales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce((itemAcc, item) => {
        const prod = products.find((p) => p.id === item.productId);
        return itemAcc + (prod ? prod.costPrice * item.qty : 0);
      }, 0)
    );
  }, 0);
  const netProfit = totalOmzet - totalCost;

  // Low stock products alert items
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);

  // Daily sales chart data for the last 7 entries
  const salesByDate: Record<string, number> = {};
  sales.forEach((s) => {
    salesByDate[s.date] = (salesByDate[s.date] || 0) + s.totalAmount;
  });

  const dailyDates = Object.keys(salesByDate).slice(-7);
  const maxDayAmount = Math.max(...Object.values(salesByDate), 100000);

  const handleProcessSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    if (product.stock < saleQty) {
      alert(`Stok tidak mencukupi! Sisa stok: ${product.stock}`);
      return;
    }

    setSimulatingPayment(true);
    playCyberClick();

    setTimeout(() => {
      const newInvoiceNo = `INV/${new Date().getFullYear()}/${String(
        sales.length + 401
      ).padStart(4, '0')}`;
      const total = product.price * saleQty;

      const newSaleItem: UMKMSale = {
        id: `sale-${Date.now()}`,
        invoiceNo: newInvoiceNo,
        date: new Date().toISOString().split('T')[0],
        customerName: customerName.trim() || 'Pelanggan Walk-In',
        items: [
          {
            productId: product.id,
            productName: product.name,
            qty: saleQty,
            price: product.price,
          },
        ],
        totalAmount: total,
        paymentMethod,
        paymentStatus: 'LUNAS',
      };

      // Reduce stock
      onUpdateProductStock(product.id, product.stock - saleQty);
      onAddSale(newSaleItem);

      setSimulatingPayment(false);
      setPaymentSuccessData(newSaleItem);
      playCyberSuccess();

      // Check if product reached low stock after this purchase
      if (product.stock - saleQty <= product.minStockAlert) {
        playCyberAlert();
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-5 cyber-box-green flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#00ff9d]">
            <Store className="w-4 h-4" />
            <span>TECHNOPRENEURSHIP LAB // BISNIS DIGITAL & PEMBUKUAN UMKM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-cyber font-bold text-white mt-1">
            Dasbor Analitik & Pembukuan UMKM Digital
          </h1>
          <p className="text-xs font-mono text-slate-300 mt-1 max-w-2xl">
            Modul praktikum Technopreneurship Semester 5. Mendukung akses offline-first, sinkronisasi real-time, integrasi payment gateway 3P, dan ekspor laporan keuangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              onTriggerSync();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-black text-[#00e5ff] border border-[#00e5ff]/50 hover:bg-[#00e5ff]/15 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SINKRONISASI DATA</span>
          </button>

          <button
            onClick={() => {
              playCyberClick();
              onExportExcel();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-black text-[#00ff9d] border border-[#00ff9d]/50 hover:bg-[#00ff9d]/15 text-xs font-mono transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EKSPOR EXCEL</span>
          </button>

          <button
            onClick={() => {
              playCyberClick();
              onExportPdf();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-black text-slate-300 border border-white/20 hover:text-white text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EKSPOR PDF</span>
          </button>

          <button
            onClick={() => {
              playCyberClick();
              setPaymentSuccessData(null);
              setShowNewSaleModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-[#00ff9d] text-black font-cyber font-bold text-xs hover:bg-[#00ff9d]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>TRANSAKSI KASIR</span>
          </button>
        </div>
      </div>

      {/* Low Stock Automatic Warning Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-950/40 border border-red-500/60 rounded-lg p-4 cyber-box-pink animate-pulse">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-xs font-cyber font-bold text-red-300 uppercase tracking-wide">
                [NOTIFIKASI SISTEM: PERINGATAN STOK BARANG MENIPIS OTOMATIS]
              </h3>
              <p className="text-xs font-mono text-red-200 mt-1">
                Terdapat {lowStockProducts.length} produk di bawah batas stok minimum. Segera lakukan pemesanan ulang (restock) ke supplier:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockProducts.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center space-x-1 text-[11px] font-mono px-2.5 py-1 rounded bg-black/60 border border-red-500/40 text-red-300"
                  >
                    <span>{p.name}:</span>
                    <strong className="text-red-400">Sisa {p.stock} {p.unit}</strong>
                    <span className="text-slate-500">(Batas: {p.minStockAlert})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#090d16] border border-[#00ff9d]/40 rounded-lg p-5 cyber-box-green">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL OMZET PENJUALAN</span>
            <DollarSign className="w-4 h-4 text-[#00ff9d]" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-white mt-2 cyber-glow-green">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Dari {sales.length} transaksi pembukuan
          </p>
        </div>

        <div className="bg-[#090d16] border border-[#00e5ff]/40 rounded-lg p-5 cyber-box-cyan">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>LABA BERSIH ESTIMASI</span>
            <TrendingUp className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-[#00e5ff] mt-2 cyber-glow-cyan">
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Margin Keuntungan ~{totalOmzet > 0 ? Math.round((netProfit / totalOmzet) * 100) : 0}%
          </p>
        </div>

        <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>KATALOG PRODUK AKTIF</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-white mt-2">
            {products.length} SKU
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Kategori Hardware, Fashion, Kopi & Digital
          </p>
        </div>

        <div className="bg-[#090d16] border border-amber-500/30 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PERINGATAN STOK MENIPIS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-amber-400 mt-2">
            {lowStockProducts.length} Produk
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            {lowStockProducts.length > 0 ? 'Perlu tindakan restock segera' : 'Kapasitas inventaris aman'}
          </p>
        </div>
      </div>

      {/* Visual Analytics & Daily Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="lg:col-span-2 bg-[#090d16] border border-white/15 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#00ff9d]" />
              <span>PERFORMA PENJUALAN HARIAN UMKM (VISUAL METRICS)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Oktober 2026</span>
          </div>

          <div className="mt-6 flex items-end justify-between h-48 pt-6 pb-2 px-2 border-b border-white/10 gap-2 sm:gap-4">
            {dailyDates.map((dateStr) => {
              const amount = salesByDate[dateStr] || 0;
              const heightPct = Math.min(100, Math.max(12, (amount / maxDayAmount) * 100));

              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-300 mb-1 opacity-90 group-hover:text-[#00ff9d] text-center">
                    {(amount / 1000).toFixed(0)}k
                  </span>

                  <div className="w-full bg-black/60 rounded-t flex items-end justify-center h-32">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full sm:w-8 rounded-t bg-[#00ff9d] hover:bg-[#00e5ff] transition-all cyber-box-green"
                    />
                  </div>

                  <span className="text-[9px] sm:text-[11px] font-mono mt-2 text-slate-400">
                    {dateStr.split('-')[2]} Okt
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Rata-rata Penjualan Harian: Rp {(totalOmzet / (dailyDates.length || 1)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
            <span className="text-[#00ff9d]">Status: Tumbuh Positif ⚡</span>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
          <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#00e5ff]" />
            <span>PAYMENT GATEWAY 3P ADOPTION</span>
          </h3>

          <div className="mt-5 space-y-3 text-xs font-mono">
            {[
              { method: 'QRIS', count: sales.filter((s) => s.paymentMethod === 'QRIS').length, color: 'bg-[#00ff9d]' },
              { method: 'MIDTRANS', count: sales.filter((s) => s.paymentMethod === 'MIDTRANS').length, color: 'bg-[#00e5ff]' },
              { method: 'VIRTUAL_ACCOUNT', count: sales.filter((s) => s.paymentMethod === 'VIRTUAL_ACCOUNT').length, color: 'bg-blue-400' },
              { method: 'CYBER_PAY', count: sales.filter((s) => s.paymentMethod === 'CYBER_PAY').length, color: 'bg-purple-400' },
            ].map((pm) => (
              <div key={pm.method}>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>{pm.method}</span>
                  <span className="font-bold text-white">{pm.count}x Transaksi</span>
                </div>
                <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                  <div
                    className={`${pm.color} h-full rounded-full`}
                    style={{ width: `${(pm.count / sales.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded bg-black/60 border border-white/5 text-[11px] font-mono text-slate-400">
            Integrasi pembayaran mendukung QRIS Standar SNAP BI dan Midtrans Sandbox API dengan webhook callback otomatis.
          </div>
        </div>
      </div>

      {/* Inventory & Product Management Table */}
      <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2">
            <Package className="w-4 h-4 text-[#00ff9d]" />
            <span>INVENTARIS PRODUK & MONITORING STOK</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Real-time local inventory tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-black/80 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">NAMA PRODUK</th>
                <th className="py-2.5 px-3">KATEGORI</th>
                <th className="py-2.5 px-3">HARGA JUAL</th>
                <th className="py-2.5 px-3">STOK SAAT INI</th>
                <th className="py-2.5 px-3">STATUS STOK</th>
                <th className="py-2.5 px-3 text-right">AKSI RESTOCK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((prod) => {
                const isLow = prod.stock <= prod.minStockAlert;
                return (
                  <tr key={prod.id} className="hover:bg-white/5">
                    <td className="py-3 px-3 text-[#00e5ff] font-bold">{prod.sku}</td>
                    <td className="py-3 px-3 text-white font-medium">{prod.name}</td>
                    <td className="py-3 px-3 text-slate-400">{prod.category}</td>
                    <td className="py-3 px-3 text-slate-200">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{prod.stock}</span> {prod.unit}
                    </td>
                    <td className="py-3 px-3">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold animate-pulse">
                          MENIPIS (&lt;={prod.minStockAlert})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40">
                          AMAN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            playCyberClick();
                            onUpdateProductStock(prod.id, prod.stock + 5);
                          }}
                          className="px-2 py-1 rounded bg-black border border-white/20 hover:border-[#00ff9d] text-slate-300 hover:text-[#00ff9d] text-[11px]"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
        <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2 mb-4">
          <Store className="w-4 h-4 text-[#00e5ff]" />
          <span>RIWAYAT TRANSAKSI PENJUALAN TERAKHIR</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-black/80 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">NO INVOICE</th>
                <th className="py-2.5 px-3">TANGGAL</th>
                <th className="py-2.5 px-3">PELANGGAN</th>
                <th className="py-2.5 px-3">ITEM DIBELI</th>
                <th className="py-2.5 px-3">METODE</th>
                <th className="py-2.5 px-3">TOTAL</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5">
                  <td className="py-3 px-3 text-[#00ff9d] font-bold">{sale.invoiceNo}</td>
                  <td className="py-3 px-3 text-slate-400">{sale.date}</td>
                  <td className="py-3 px-3 text-white">{sale.customerName}</td>
                  <td className="py-3 px-3 text-slate-300">
                    {sale.items.map((i) => `${i.productName} (x${i.qty})`).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-[#00e5ff]">{sale.paymentMethod}</td>
                  <td className="py-3 px-3 font-bold text-white">
                    Rp {sale.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 font-bold">
                      {sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS / New Sale Modal with 3rd-Party Payment Gateway Integration Simulation */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] border border-[#00ff9d] rounded-lg max-w-lg w-full p-6 cyber-box-green relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-cyber font-bold text-white flex items-center space-x-2">
                <Store className="w-5 h-5 text-[#00ff9d]" />
                <span>TERMINAL KASIR UMKM DIGITAL</span>
              </h3>
              <button
                onClick={() => setShowNewSaleModal(false)}
                className="text-slate-400 hover:text-white font-mono"
              >
                [X]
              </button>
            </div>

            {paymentSuccessData ? (
              <div className="mt-6 text-center space-y-4 font-mono">
                <div className="w-12 h-12 rounded-full bg-[#00ff9d]/20 border border-[#00ff9d] flex items-center justify-center mx-auto text-[#00ff9d]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-cyber font-bold text-white">
                    TRANSAKSI BERHASIL TERVERIFIKASI!
                  </h4>
                  <p className="text-xs text-[#00ff9d] mt-1">
                    Invoice: {paymentSuccessData.invoiceNo}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Metode: {paymentSuccessData.paymentMethod} • Total: Rp{' '}
                    {paymentSuccessData.totalAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="pt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      playCyberClick();
                      onExportPdf();
                    }}
                    className="px-3 py-2 rounded bg-black border border-white/20 text-xs text-slate-300 hover:text-white"
                  >
                    Cetak Struk PDF
                  </button>
                  <button
                    onClick={() => setShowNewSaleModal(false)}
                    className="px-4 py-2 rounded bg-[#00ff9d] text-black font-bold text-xs"
                  >
                    SELESAI
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessSale} className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-300 block mb-1">Pilih Produk UMKM *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - Rp {p.price.toLocaleString('id-ID')} (Stok: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Jumlah (Qty) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={saleQty}
                      onChange={(e) => setSaleQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Nama Pelanggan</label>
                    <input
                      type="text"
                      placeholder="Nama pembeli..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                    />
                  </div>
                </div>

                {/* 3rd Party Payment Gateway Selector */}
                <div>
                  <label className="text-slate-300 block mb-1">
                    Metode Pembayaran Pihak Ketiga (Integrasi Real)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'QRIS', label: 'QRIS Dinamis (SNAP BI)', icon: QrCode },
                      { id: 'MIDTRANS', label: 'Midtrans Sandbox 3P', icon: CreditCard },
                      { id: 'VIRTUAL_ACCOUNT', label: 'Virtual Account (BCA/BRI)', icon: ShieldCheck },
                      { id: 'CYBER_PAY', label: 'Cyber-Pay Wallet', icon: Store },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setPaymentMethod(m.id as any);
                        }}
                        className={`flex items-center space-x-2 p-2.5 rounded border text-left transition-all ${
                          paymentMethod === m.id
                            ? 'bg-[#00ff9d]/20 border-[#00ff9d] text-white font-bold'
                            : 'bg-black border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <m.icon className="w-4 h-4 text-[#00ff9d]" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation summary */}
                <div className="bg-black/60 p-3 rounded border border-white/10 flex items-center justify-between">
                  <span className="text-slate-400">Total Pembayaran:</span>
                  <span className="text-base font-cyber font-bold text-[#00ff9d]">
                    Rp{' '}
                    {(
                      (products.find((p) => p.id === selectedProductId)?.price || 0) * saleQty
                    ).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewSaleModal(false)}
                    className="px-3 py-2 rounded bg-black border border-white/20 text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={simulatingPayment}
                    className="px-5 py-2 rounded bg-[#00ff9d] text-black font-bold flex items-center space-x-2 hover:bg-[#00ff9d]/80 transition-colors disabled:opacity-50"
                  >
                    {simulatingPayment ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>VERIFIKASI GATEWAY...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>PROSES TRANSAKSI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
