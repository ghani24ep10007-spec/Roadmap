import React, { useState, useEffect } from 'react';
import {
  SemesterData,
  Course,
  GradeLetter,
  TaskItem,
  UMKMProduct,
  UMKMSale,
} from './types';
import {
  getStoredCurriculum,
  saveStoredCurriculum,
  getStoredTasks,
  saveStoredTasks,
  getStoredUmkmProducts,
  saveStoredUmkmProducts,
  getStoredUmkmSales,
  saveStoredUmkmSales,
  getStoredTargetIPK,
  saveStoredTargetIPK,
  syncDataToServer,
} from './utils/storage';
import { toggleAudio, isAudioEnabled, playCyberSuccess, playCyberClick } from './utils/audio';
import { exportAcademicExcel, exportUmkmExcel, printToPdf } from './utils/export';
import { Navbar } from './components/Navbar';
import { RoadmapView } from './components/RoadmapView';
import { GradeDashboard } from './components/GradeDashboard';
import { CareerAdvisor } from './components/CareerAdvisor';
import { TaskManager } from './components/TaskManager';
import { UmkmDashboard } from './components/UmkmDashboard';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import {
  Terminal,
  Activity,
  Briefcase,
  CheckSquare,
  Store,
  Wifi,
  WifiOff,
  Radio,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [semesters, setSemesters] = useState<SemesterData[]>(getStoredCurriculum);
  const [tasks, setTasks] = useState<TaskItem[]>(getStoredTasks);
  const [products, setProducts] = useState<UMKMProduct[]>(getStoredUmkmProducts);
  const [sales, setSales] = useState<UMKMSale[]>(getStoredUmkmSales);
  const [targetIPK, setTargetIPK] = useState<number>(getStoredTargetIPK);

  const [activeTab, setActiveTab] = useState<string>('roadmap');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [soundActive, setSoundActive] = useState<boolean>(isAudioEnabled);
  const [scanlinesActive, setScanlinesActive] = useState<boolean>(true);
  const [deployModalOpen, setDeployModalOpen] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Monitor Network Online/Offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi Internet Terhubung! Memulai Sinkronisasi Otomatis...', 'info');
      handleSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi Terputus. Sistem Berjalan Offline (Penyimpanan Lokal Aktif)', 'warn');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 4000);
  };

  // Synchronize data to Cloud Matrix
  const handleSync = async () => {
    const res = await syncDataToServer({
      coursesCount: semesters.flatMap((s) => s.courses).length,
      tasksCount: tasks.length,
      productsCount: products.length,
      salesCount: sales.length,
    });
    if (res.success) {
      showToast('Data Berhasil Disinkronkan ke Cloud Matrix!', 'success');
      playCyberSuccess();
    } else {
      showToast('Tersimpan di Memori Lokal (Offline Mode Ready)', 'info');
    }
  };

  // Course Updates
  const handleUpdateCourseGrade = (courseId: string, grade: GradeLetter) => {
    setSemesters((prev) => {
      const updated = prev.map((sem) => ({
        ...sem,
        courses: sem.courses.map((c) =>
          c.id === courseId ? { ...c, grade, targetGrade: grade } : c
        ),
      }));
      saveStoredCurriculum(updated);
      return updated;
    });
  };

  const handleUpdateCourseStatus = (courseId: string, status: Course['status']) => {
    setSemesters((prev) => {
      const updated = prev.map((sem) => ({
        ...sem,
        courses: sem.courses.map((c) =>
          c.id === courseId ? { ...c, status } : c
        ),
      }));
      saveStoredCurriculum(updated);
      return updated;
    });
  };

  // Task Operations
  const handleAddTask = (newTaskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveStoredTasks(updated);
      return updated;
    });
    showToast(`Misi "${newTask.title.slice(0, 25)}..." Ditambahkan`, 'success');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      saveStoredTasks(updated);
      return updated;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveStoredTasks(updated);
      return updated;
    });
    showToast('Tugas Dihapus dari Log', 'info');
  };

  // UMKM Operations
  const handleAddSale = (newSale: UMKMSale) => {
    setSales((prev) => {
      const updated = [...prev, newSale];
      saveStoredUmkmSales(updated);
      return updated;
    });
    showToast(`Transaksi ${newSale.invoiceNo} Tercatat di Pembukuan!`, 'success');
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
      );
      saveStoredUmkmProducts(updated);
      return updated;
    });
    showToast('Stok Produk Berhasil Diperbarui', 'info');
  };

  const handleUpdateTargetIPK = (ipk: number) => {
    setTargetIPK(ipk);
    saveStoredTargetIPK(ipk);
  };

  const handleExportAcademicExcel = () => {
    const allCourses = semesters.flatMap((s) => s.courses);
    const completed = allCourses.filter((c) => c.status === 'SELESAI');
    const totalSks = completed.reduce((acc, c) => acc + c.sks, 0);
    exportAcademicExcel(semesters, 3.82, totalSks);
    showToast('Transkrip Excel (CSV) Berhasil Diunduh!', 'success');
  };

  const handleExportUmkmExcel = () => {
    exportUmkmExcel(products, sales);
    showToast('Laporan Pembukuan UMKM (CSV) Berhasil Diunduh!', 'success');
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;
  const uncompletedTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div
      className={`min-h-screen bg-[#05080f] text-slate-100 flex flex-col ${
        scanlinesActive ? 'cyber-scanlines' : ''
      }`}
    >
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none opacity-40 z-0" />

      {/* Sync / Notification Toast */}
      {syncToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-lg border text-xs font-mono font-bold shadow-2xl flex items-center space-x-2 backdrop-blur-md ${
              syncToast.type === 'warn'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500'
                : syncToast.type === 'info'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]'
                : 'bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{syncToast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        soundEnabled={soundActive}
        toggleSound={() => setSoundActive(toggleAudio())}
        scanlinesEnabled={scanlinesActive}
        toggleScanlines={() => setScanlinesActive((prev) => !prev)}
        onOpenDeployModal={() => setDeployModalOpen(true)}
        onExportPdf={() => printToPdf()}
        uncompletedTasksCount={uncompletedTasksCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeTab === 'roadmap' && (
          <RoadmapView
            semesters={semesters}
            onUpdateCourseGrade={handleUpdateCourseGrade}
            onUpdateCourseStatus={handleUpdateCourseStatus}
            onExportExcel={handleExportAcademicExcel}
          />
        )}

        {activeTab === 'grades' && (
          <GradeDashboard
            semesters={semesters}
            targetIPK={targetIPK}
            onUpdateTargetIPK={handleUpdateTargetIPK}
          />
        )}

        {activeTab === 'career' && (
          <CareerAdvisor
            currentSemester={5}
            targetIPK={targetIPK}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'umkm' && (
          <UmkmDashboard
            products={products}
            sales={sales}
            onAddSale={handleAddSale}
            onUpdateProductStock={handleUpdateProductStock}
            onExportExcel={handleExportUmkmExcel}
            onExportPdf={() => printToPdf()}
            onTriggerSync={handleSync}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Bottom Floating Navigation for Quick Mobile Tapping */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090d16]/95 border-t border-[#00ff9d]/30 backdrop-blur-md px-2 py-1.5 flex justify-around text-[10px] font-mono">
        {[
          { id: 'roadmap', label: 'ROADMAP', icon: Terminal },
          { id: 'grades', label: 'NILAI', icon: Activity },
          { id: 'career', label: 'KARIER', icon: Briefcase },
          { id: 'tasks', label: 'TUGAS', icon: CheckSquare, badge: uncompletedTasksCount },
          { id: 'umkm', label: 'UMKM', icon: Store, alert: lowStockCount > 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playCyberClick();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center py-1 px-2 rounded relative ${
                isActive
                  ? 'text-[#00ff9d] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#00e5ff]" />
              )}
              {tab.alert && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Cyber HUD */}
      <footer className="relative z-10 border-t border-white/10 bg-[#090d16]/80 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-[#00ff9d] animate-pulse" />
            <span>CYBER//ROADMAP SISTEM INFORMASI (SEMESTER 1 - 8) • ACTIVE AT SEMESTER 5</span>
          </div>
          <div>
            Standar UMKM Ringan &amp; Responsif • Offline PWA Ready • Cloudflare Pages CI/CD
          </div>
        </div>
      </footer>

      {/* Cloudflare Pages & GitHub CI/CD Generator Modal */}
      <CloudflareDeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
      />
    </div>
  );
}
