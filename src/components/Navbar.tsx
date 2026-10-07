import React from 'react';
import {
  Terminal,
  Activity,
  Award,
  CheckSquare,
  Briefcase,
  Store,
  Volume2,
  VolumeX,
  Tv,
  CloudLightning,
  Download,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  scanlinesEnabled: boolean;
  toggleScanlines: () => void;
  onOpenDeployModal: () => void;
  onExportPdf: () => void;
  uncompletedTasksCount: number;
  lowStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  soundEnabled,
  toggleSound,
  scanlinesEnabled,
  toggleScanlines,
  onOpenDeployModal,
  onExportPdf,
  uncompletedTasksCount,
  lowStockCount,
}) => {
  const tabs = [
    { id: 'roadmap', label: 'ROADMAP S1-S8', icon: Terminal, badge: 'SMTR 5 AKTIF' },
    { id: 'grades', label: 'DASBOR NILAI & IPK', icon: Activity },
    { id: 'career', label: 'KARIER & SKILL AI', icon: Briefcase },
    { id: 'tasks', label: 'PENGINGAT TUGAS', icon: CheckSquare, count: uncompletedTasksCount },
    { id: 'umkm', label: 'UMKM & BISNIS LAB', icon: Store, count: lowStockCount, countAlert: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 border-b border-[#00ff9d]/30 backdrop-blur-md">
      {/* Top Cyber HUD Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded bg-black border border-[#00ff9d] cyber-box-green">
              <Terminal className="w-5 h-5 text-[#00ff9d] animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00ff9d] animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cyber font-bold text-lg tracking-wider text-white cyber-glow-green">
                  CYBER<span className="text-[#00ff9d]">//</span>ROADMAP
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/40">
                  SI_S1:SMTR_05
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Academic & Career Matrix Sistem Informasi • Hacker HUD
              </p>
            </div>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Online / Offline Sync Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono border ${
                isOnline
                  ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/40'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
              }`}
              title={isOnline ? 'Online: Data tersinkronisasi otomatis' : 'Offline: Berjalan di memori lokal'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">SYNC // CLOUD ONLINE</span>
                  <span className="md:hidden">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline">OFFLINE // LOCAL MATRIX</span>
                  <span className="md:hidden">OFFLINE</span>
                </>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                toggleSound();
              }}
              title={soundEnabled ? 'Matikan Suara Cyber Synthesizer' : 'Nyalakan Suara Cyber Synthesizer'}
              className={`p-2 rounded border transition-colors ${
                soundEnabled
                  ? 'bg-[#00ff9d]/15 text-[#00ff9d] border-[#00ff9d]/50 hover:bg-[#00ff9d]/25'
                  : 'bg-black text-slate-500 border-white/10 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Scanlines CRT Toggle */}
            <button
              onClick={() => {
                playCyberClick();
                toggleScanlines();
              }}
              title="Toggle CRT Scanlines Effect"
              className={`p-2 rounded border transition-colors hidden sm:flex ${
                scanlinesEnabled
                  ? 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/50'
                  : 'bg-black text-slate-500 border-white/10'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Export PDF Button */}
            <button
              onClick={() => {
                playCyberClick();
                onExportPdf();
              }}
              title="Cetak atau Ekspor Halaman ke PDF"
              className="p-2 rounded bg-black text-slate-300 border border-white/15 hover:border-[#00ff9d] hover:text-[#00ff9d] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Deploy CI/CD Cloudflare Button */}
            <button
              onClick={() => {
                playCyberClick();
                onOpenDeployModal();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/60 hover:bg-[#ff007f]/30 cyber-box-pink transition-all"
            >
              <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">CI/CD CLOUDFLARE</span>
              <span className="sm:hidden">DEPLOY</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playCyberClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#00ff9d]/20 text-[#00ff9d] border-b-2 border-[#00ff9d] cyber-glow-green font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ff9d]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00ff9d] text-black font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      tab.countAlert ? 'bg-red-500 text-white animate-pulse' : 'bg-[#00e5ff] text-black'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
