import { SemesterData, UMKMProduct, UMKMSale } from '../types';
import { GRADE_POINTS } from '../data/defaultCurriculum';

/**
 * Downloads a string as a CSV file compatible with Microsoft Excel and Google Sheets
 * Uses UTF-8 BOM (\uFEFF) so Excel properly renders Indonesian characters and formatting.
 */
function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Academic Transkrip / Roadmap to Excel (CSV)
 */
export function exportAcademicExcel(semesters: SemesterData[], ipk: number, totalSks: number) {
  let csv = 'LAPORAN AKADEMIK & ROADMAP SISTEM INFORMASI (SEMESTER 1-8)\n';
  csv += `Tanggal Ekspor,${new Date().toLocaleDateString('id-ID')}\n`;
  csv += `Status Saat Ini,Semester 5 (Active)\n`;
  csv += `IPK Kumulatif,${ipk.toFixed(2)}\n`;
  csv += `Total SKS Diperoleh,${totalSks} SKS\n\n`;

  csv += 'Semester,Kode MK,Nama Mata Kuliah,SKS,Status,Nilai,Bobot,Kategori\n';

  semesters.forEach((sem) => {
    sem.courses.forEach((c) => {
      const grade = c.grade || (c.status === 'SEDANG_DITEMPUH' ? (c.targetGrade ? `${c.targetGrade} (Target)` : '-') : '-');
      const weight = c.grade ? GRADE_POINTS[c.grade] || 0 : 0;
      csv += `"${sem.semesterNumber}","${c.code}","${c.name.replace(/"/g, '""')}","${c.sks}","${c.status}","${grade}","${weight}","${c.category}"\n`;
    });
  });

  downloadCsv(`Transkrip_Roadmap_SI_Semester1-8_${Date.now()}.csv`, csv);
}

/**
 * Exports UMKM Sales and Inventory Bookkeeping to Excel (CSV)
 */
export function exportUmkmExcel(products: UMKMProduct[], sales: UMKMSale[]) {
  let csv = 'LAPORAN PEMBUKUAN & ANALITIK PENJUALAN UMKM DIGITAL (LAB SEMESTER 5)\n';
  csv += `Tanggal Laporan,${new Date().toLocaleDateString('id-ID')}\n`;
  csv += `Total Transaksi,${sales.length}\n`;
  const totalOmzet = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  csv += `Total Pendapatan (Omzet),Rp ${totalOmzet.toLocaleString('id-ID')}\n\n`;

  csv += '=== INVENTARIS PRODUK & STATUS STOK ===\n';
  csv += 'SKU,Nama Produk,Kategori,Harga Jual (Rp),Harga Pokok (Rp),Stok Saat Ini,Batas Peringatan,Status Stok\n';
  products.forEach((p) => {
    const isLow = p.stock <= p.minStockAlert;
    csv += `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.price}","${p.costPrice}","${p.stock}","${p.minStockAlert}","${isLow ? 'MENIPIS (PERLU RESTOCK)' : 'AMAN'}"\n`;
  });

  csv += '\n=== RIWAYAT TRANSAKSI PENJUALAN HARIAN ===\n';
  csv += 'No Invoice,Tanggal,Nama Pelanggan,Item Dibeli,Metode Pembayaran,Total Bayar (Rp),Status Transaksi\n';
  sales.forEach((s) => {
    const itemSummary = s.items.map((i) => `${i.productName} (x${i.qty})`).join('; ');
    csv += `"${s.invoiceNo}","${s.date}","${s.customerName.replace(/"/g, '""')}","${itemSummary}","${s.paymentMethod}","${s.totalAmount}","${s.paymentStatus}"\n`;
  });

  downloadCsv(`Laporan_Pembukuan_UMKM_${Date.now()}.csv`, csv);
}

/**
 * Triggers clean browser print dialog which exports directly to PDF
 */
export function printToPdf() {
  window.print();
}
