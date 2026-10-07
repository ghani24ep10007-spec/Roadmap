import React, { useState } from 'react';
import { SemesterData, GradeLetter } from '../types';
import { GRADE_POINTS } from '../data/defaultCurriculum';
import {
  TrendingUp,
  Award,
  Target,
  BarChart2,
  CheckCircle,
  Clock,
  Calculator,
  Compass,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess } from '../utils/audio';

interface GradeDashboardProps {
  semesters: SemesterData[];
  targetIPK: number;
  onUpdateTargetIPK: (ipk: number) => void;
}

export const GradeDashboard: React.FC<GradeDashboardProps> = ({
  semesters,
  targetIPK,
  onUpdateTargetIPK,
}) => {
  const [simTarget, setSimTarget] = useState<number>(targetIPK);

  // Compute all courses
  const allCourses = semesters.flatMap((s) => s.courses);
  const completedCourses = allCourses.filter((c) => c.status === 'SELESAI');
  const inProgressCourses = allCourses.filter((c) => c.status === 'SEDANG_DITEMPUH');
  const futureCourses = allCourses.filter((c) => c.status === 'BELUM_DIAMBIL');

  const totalSksCurriculum = allCourses.reduce((acc, c) => acc + c.sks, 0); // e.g. 144 SKS
  const completedSks = completedCourses.reduce((acc, c) => acc + c.sks, 0);
  const inProgressSks = inProgressCourses.reduce((acc, c) => acc + c.sks, 0);
  const remainingSks = totalSksCurriculum - completedSks - inProgressSks;

  // Real IPK (from completed courses)
  const totalGradedPoints = completedCourses.reduce((acc, c) => {
    const pt = GRADE_POINTS[c.grade || 'A'] || 0;
    return acc + pt * c.sks;
  }, 0);
  const currentIPK = completedSks > 0 ? totalGradedPoints / completedSks : 0;

  // Projected IPK (assuming inProgress gets their target grades)
  const inProgressPoints = inProgressCourses.reduce((acc, c) => {
    const pt = GRADE_POINTS[c.targetGrade || 'A'] || 4.0;
    return acc + pt * c.sks;
  }, 0);
  const projectedSks = completedSks + inProgressSks;
  const projectedIPK =
    projectedSks > 0 ? (totalGradedPoints + inProgressPoints) / projectedSks : 0;

  // IPS per semester data
  const semesterIpsList = semesters.map((sem) => {
    const semCompleted = sem.courses.filter((c) => c.status === 'SELESAI');
    const semSks = semCompleted.reduce((acc, c) => acc + c.sks, 0);
    const pts = semCompleted.reduce((acc, c) => acc + (GRADE_POINTS[c.grade || 'A'] || 0) * c.sks, 0);
    const ips = semSks > 0 ? pts / semSks : 0;
    return {
      semester: sem.semesterNumber,
      ips,
      sks: semSks,
      isCurrent: sem.isCurrent,
    };
  });

  // Grade Letter Distribution Count
  const gradeDistribution: Record<GradeLetter, number> = {
    'A': 0,
    'A-': 0,
    'B+': 0,
    'B': 0,
    'B-': 0,
    'C+': 0,
    'C': 0,
    'D': 0,
    'E': 0,
    '-': 0,
  };

  completedCourses.forEach((c) => {
    const g = c.grade || 'A';
    gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
  });

  // Predikat Kelulusan Estimator
  const getPredikat = (ipkVal: number) => {
    const hasLowGrade = completedCourses.some((c) => c.grade === 'C' || c.grade === 'D' || c.grade === 'E');
    if (ipkVal >= 3.51 && !hasLowGrade) return { label: 'CUMLAUDE (DENGAN PUJIAN)', color: 'text-[#00ff9d]' };
    if (ipkVal >= 3.0) return { label: 'SANGAT MEMUASKAN', color: 'text-[#00e5ff]' };
    if (ipkVal >= 2.76) return { label: 'MEMUASKAN', color: 'text-amber-400' };
    return { label: 'CUKUP', color: 'text-slate-400' };
  };

  const predikat = getPredikat(currentIPK);

  // Target Calculator Simulation:
  // Required average IPS in remaining SKS to reach simTarget
  // Formula: (simTarget * totalSksCurriculum - totalGradedPoints - inProgressPoints) / remainingSks
  const remainingNeededPoints = simTarget * totalSksCurriculum - totalGradedPoints - inProgressPoints;
  const neededIpsRemaining = remainingSks > 0 ? remainingNeededPoints / remainingSks : 0;

  return (
    <div className="space-y-6">
      {/* Top IPK & SKS Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: IPK Kumulatif */}
        <div className="bg-[#090d16] border border-[#00ff9d]/40 rounded-lg p-5 cyber-box-green relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>IPK KUMULATIF SAAT INI</span>
            <TrendingUp className="w-4 h-4 text-[#00ff9d]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-cyber font-bold text-white cyber-glow-green">
              {currentIPK.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 text-xs font-mono flex items-center space-x-1">
            <span className="text-slate-400">Predikat:</span>
            <span className={`font-bold ${predikat.color}`}>{predikat.label}</span>
          </div>
        </div>

        {/* Metric 2: Proyeksi IPK Semester 5 */}
        <div className="bg-[#090d16] border border-[#00e5ff]/40 rounded-lg p-5 cyber-box-cyan">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PROYEKSI IPK (PASCA SEM 5)</span>
            <Target className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-cyber font-bold text-white cyber-glow-cyan">
              {projectedIPK.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 4.00</span>
          </div>
          <p className="mt-2 text-xs font-mono text-slate-400">
            Jika target nilai 20 SKS Semester 5 tercapai
          </p>
        </div>

        {/* Metric 3: Total SKS Lulus */}
        <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CAPAIAN SKS LULUS</span>
            <CheckCircle className="w-4 h-4 text-[#00ff9d]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-cyber font-bold text-white">
              {completedSks}
            </span>
            <span className="text-xs font-mono text-slate-400">/ {totalSksCurriculum} SKS</span>
          </div>
          <div className="mt-3 w-full bg-black rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="bg-[#00ff9d] h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedSks / totalSksCurriculum) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] font-mono text-slate-400 text-right">
            {((completedSks / totalSksCurriculum) * 100).toFixed(1)}% Menuju Wisuda
          </p>
        </div>

        {/* Metric 4: Sisa SKS */}
        <div className="bg-[#090d16] border border-amber-500/30 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SKS BERJALAN & SISA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-cyber font-bold text-amber-400">
              {inProgressSks}
            </span>
            <span className="text-xs font-mono text-slate-400">SKS (Sem 5 Aktif)</span>
          </div>
          <p className="mt-2 text-xs font-mono text-slate-300">
            Sisa Semester 6-8: <strong className="text-white">{remainingSks} SKS</strong>
          </p>
        </div>
      </div>

      {/* Semester by Semester Trend & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IPS Progression Chart */}
        <div className="lg:col-span-2 bg-[#090d16] border border-white/15 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-[#00ff9d]" />
              <span>TREND INDEKS PRESTASI SEMESTER (IPS 1 - 8)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Skala 0.00 - 4.00</span>
          </div>

          <div className="mt-6 grid grid-cols-8 gap-2 sm:gap-4 items-end h-52 pt-6 pb-2 px-2 border-b border-white/10">
            {semesterIpsList.map((item) => {
              const heightPercent = item.ips > 0 ? (item.ips / 4.0) * 100 : 8;
              const hasData = item.ips > 0;

              return (
                <div key={item.semester} className="flex flex-col items-center h-full justify-end group">
                  {/* Floating tooltip */}
                  <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-white">
                    {hasData ? item.ips.toFixed(2) : item.isCurrent ? 'ACTIVE' : '-'}
                  </span>

                  {/* Bar */}
                  <div className="w-full bg-black/60 rounded-t relative flex items-end justify-center h-40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full sm:w-8 rounded-t transition-all duration-500 ${
                        item.isCurrent
                          ? 'bg-[#00e5ff] cyber-box-cyan animate-pulse'
                          : hasData
                          ? 'bg-[#00ff9d] hover:brightness-125'
                          : 'bg-white/10 border-t border-dashed border-white/30'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] sm:text-xs font-mono mt-2 font-bold ${
                    item.isCurrent ? 'text-[#00e5ff]' : 'text-slate-400'
                  }`}>
                    SEM {item.semester}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#00ff9d]" />
                <span>Semester Lulus</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#00e5ff]" />
                <span>Semester 5 Aktif</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-white/15" />
                <span>Akan Datang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
          <h3 className="text-sm font-cyber font-bold text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>DISTRIBUSI NILAI LULUS</span>
          </h3>

          <div className="mt-4 space-y-2.5">
            {[
              { grade: 'A', label: 'Nilai A (4.00)', count: gradeDistribution['A'], color: 'bg-[#00ff9d]' },
              { grade: 'A-', label: 'Nilai A- (3.70)', count: gradeDistribution['A-'], color: 'bg-emerald-400' },
              { grade: 'B+', label: 'Nilai B+ (3.30)', count: gradeDistribution['B+'], color: 'bg-[#00e5ff]' },
              { grade: 'B', label: 'Nilai B (3.00)', count: gradeDistribution['B'], color: 'bg-cyan-400' },
              { grade: 'B-', label: 'Nilai B- (2.70)', count: gradeDistribution['B-'], color: 'bg-blue-400' },
              { grade: 'C+', label: 'Nilai C+ (2.30)', count: gradeDistribution['C+'], color: 'bg-amber-400' },
              { grade: 'C', label: 'Nilai C (2.00)', count: gradeDistribution['C'], color: 'bg-orange-400' },
            ].map((row) => (
              <div key={row.grade} className="text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>{row.label}</span>
                  <span className="font-bold text-white">{row.count} MK</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${row.color} h-full rounded-full`}
                    style={{
                      width: `${completedCourses.length > 0 ? (row.count / completedCourses.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target IPK Simulator & Graduation Road to Cumlaude */}
      <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-5 cyber-box-green">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00ff9d]">
              <Calculator className="w-4 h-4" />
              <span>SIMULATOR TARGET CAPAIAN IPK KELULUSAN</span>
            </div>
            <h3 className="text-lg font-cyber font-bold text-white mt-1">
              Kalkulator Strategi Sisa Semester 6 - 8
            </h3>
            <p className="text-xs font-mono text-slate-300 mt-1 max-w-2xl">
              Uji skenario target IPK kelulusan Anda untuk menghitung rata-rata IPS minimal yang harus dicapai pada sisa {remainingSks} SKS yang belum ditempuh.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-black/60 p-3 rounded border border-white/10">
            <span className="text-xs font-mono text-slate-400">Target IPK Anda:</span>
            <input
              type="number"
              step="0.05"
              min="2.00"
              max="4.00"
              value={simTarget}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSimTarget(val);
                onUpdateTargetIPK(val);
              }}
              className="w-20 bg-black text-[#00ff9d] border border-[#00ff9d]/60 rounded px-2.5 py-1 text-base font-cyber font-bold focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="bg-black/50 p-3 rounded border border-white/5">
            <span className="text-[11px] font-mono text-slate-400">Rata-rata IPS Dibutuhkan di Sem 6-8:</span>
            <div className="text-2xl font-cyber font-bold text-white mt-1">
              {neededIpsRemaining <= 4.0 ? (
                <span className={neededIpsRemaining <= 3.5 ? 'text-[#00ff9d]' : 'text-amber-400'}>
                  {neededIpsRemaining > 0 ? neededIpsRemaining.toFixed(2) : 'Tercapai'}
                </span>
              ) : (
                <span className="text-red-400">Melebihi 4.00</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              {neededIpsRemaining <= 4.0
                ? 'Target sangat realistis dengan mempertahankan performa belajar.'
                : 'Target melebihi batas maksimal matematis.'}
            </p>
          </div>

          <div className="bg-black/50 p-3 rounded border border-white/5">
            <span className="text-[11px] font-mono text-slate-400">Status Kelulusan Target:</span>
            <div className="text-lg font-cyber font-bold text-[#00e5ff] mt-1">
              {getPredikat(simTarget).label}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              {simTarget >= 3.51 ? 'Memenuhi syarat Cumlaude Universitas' : 'Lulus dengan kualifikasi profesional'}
            </p>
          </div>

          <div className="bg-black/50 p-3 rounded border border-white/5">
            <span className="text-[11px] font-mono text-slate-400">Strategi Taktis Semester 5+:</span>
            <p className="text-xs font-mono text-slate-200 mt-1">
              Fokus maksimalkan mata kuliah <strong>SI501 (Cyber Security)</strong> dan <strong>SI503 (Tata Kelola IT)</strong> untuk mengamankan grade A di semester 5!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
