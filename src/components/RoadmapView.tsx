import React, { useState } from 'react';
import {
  SemesterData,
  Course,
  GradeLetter,
} from '../types';
import { GRADE_POINTS } from '../data/defaultCurriculum';
import {
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  BookOpen,
  Edit3,
  Award,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess } from '../utils/audio';

interface RoadmapViewProps {
  semesters: SemesterData[];
  onUpdateCourseGrade: (courseId: string, grade: GradeLetter) => void;
  onUpdateCourseStatus: (courseId: string, status: Course['status']) => void;
  onExportExcel: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  semesters,
  onUpdateCourseGrade,
  onUpdateCourseStatus,
  onExportExcel,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(5); // Default to Semester 5!
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeCourseDetail, setActiveCourseDetail] = useState<Course | null>(null);

  const currentSem = semesters.find((s) => s.semesterNumber === selectedSemester) || semesters[4];

  // Calculate semester metrics
  const totalSksSem = currentSem.courses.reduce((acc, c) => acc + c.sks, 0);
  const finishedCourses = currentSem.courses.filter((c) => c.status === 'SELESAI');
  const finishedSks = finishedCourses.reduce((acc, c) => acc + c.sks, 0);

  // IPS calculation for this semester
  const totalGradedPoints = finishedCourses.reduce((acc, c) => {
    return acc + (GRADE_POINTS[c.grade || 'A'] || 0) * c.sks;
  }, 0);
  const semIps = finishedSks > 0 ? (totalGradedPoints / finishedSks).toFixed(2) : '-';

  const filteredCourses = currentSem.courses.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Semester Selector */}
      <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-5 cyber-box-green relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00ff9d]">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
              <span>TERMINAL STATUS // ACTIVE RADAR</span>
              {currentSem.isCurrent && (
                <span className="px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/40">
                  SEMESTER AKTIF ANDA
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-cyber font-bold text-white mt-1">
              {currentSem.title}
            </h1>
            <p className="text-sm font-mono text-slate-300 mt-1 max-w-3xl">
              {currentSem.targetDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playCyberClick();
                onExportExcel();
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded bg-black text-[#00ff9d] border border-[#00ff9d]/50 hover:bg-[#00ff9d]/15 text-xs font-mono transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>EKSPOR EXCEL (CSV)</span>
            </button>
          </div>
        </div>

        {/* Milestone Badge */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2 text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{currentSem.milestone}</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span>
              Total Beban: <strong className="text-white">{totalSksSem} SKS</strong>
            </span>
            <span>
              Selesai: <strong className="text-[#00ff9d]">{finishedSks} SKS</strong>
            </span>
            <span>
              IPS Semester: <strong className="text-[#00e5ff]">{semIps}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Semester Matrix Tabs 1 - 8 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {semesters.map((sem) => {
          const isSelected = selectedSemester === sem.semesterNumber;
          const isFinished = sem.courses.every((c) => c.status === 'SELESAI');
          const isCurrent = sem.isCurrent;

          return (
            <button
              key={sem.semesterNumber}
              onClick={() => {
                playCyberClick();
                setSelectedSemester(sem.semesterNumber);
              }}
              className={`p-3 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-[#00ff9d]/15 border-[#00ff9d] cyber-box-green ring-1 ring-[#00ff9d]'
                  : isCurrent
                  ? 'bg-[#00e5ff]/10 border-[#00e5ff]/60 hover:bg-[#00e5ff]/20'
                  : 'bg-black/60 border-white/10 hover:border-white/30 text-slate-400'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2 right-2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00e5ff] text-black font-extrabold uppercase">
                  NOW
                </span>
              )}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`font-bold ${isSelected ? 'text-[#00ff9d]' : 'text-slate-300'}`}>
                  SEM {sem.semesterNumber}
                </span>
                {isFinished ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff9d]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                {sem.courses.reduce((a, c) => a + c.sks, 0)} SKS
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#00ff9d]" />
          <span className="text-xs font-mono text-slate-300 font-bold">
            DAFTAR MATA KULIAH ({filteredCourses.length} MATA KULIAH)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
          {[
            { id: 'ALL', label: 'SEMUA' },
            { id: 'SEDANG_DITEMPUH', label: 'SEDANG DITEMPUH' },
            { id: 'SELESAI', label: 'SUDAH LULUS' },
            { id: 'BELUM_DIAMBIL', label: 'AKAN DATANG' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                playCyberClick();
                setFilterStatus(f.id);
              }}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                filterStatus === f.id
                  ? 'bg-[#00ff9d] text-black font-bold'
                  : 'bg-black text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const isDone = course.status === 'SELESAI';
          const isInProgress = course.status === 'SEDANG_DITEMPUH';

          return (
            <div
              key={course.id}
              className={`rounded-lg border p-4 bg-[#090d16] flex flex-col justify-between transition-all hover:border-opacity-100 ${
                isInProgress
                  ? 'border-[#00e5ff]/70 cyber-box-cyan'
                  : isDone
                  ? 'border-[#00ff9d]/40'
                  : 'border-white/10 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* Header Course Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black border border-white/20 text-[#00e5ff]">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {course.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {course.sks} SKS
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono">
                  {course.description}
                </p>

                {/* Prerequisite Tag */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-2 text-[10px] font-mono text-purple-400">
                    Prasyarat: {course.prerequisites.join(', ')}
                  </div>
                )}
              </div>

              {/* Status & Grade Controls */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                {/* Status selector */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Status:</span>
                  <select
                    value={course.status}
                    onChange={(e) => {
                      playCyberClick();
                      onUpdateCourseStatus(course.id, e.target.value as Course['status']);
                    }}
                    className={`bg-black border rounded px-2 py-1 text-xs font-mono focus:outline-none ${
                      isInProgress
                        ? 'text-[#00e5ff] border-[#00e5ff]/60'
                        : isDone
                        ? 'text-[#00ff9d] border-[#00ff9d]/60'
                        : 'text-slate-400 border-white/20'
                    }`}
                  >
                    <option value="SEDANG_DITEMPUH">⚡ SEDANG DITEMPUH</option>
                    <option value="SELESAI">✓ SUDAH LULUS</option>
                    <option value="BELUM_DIAMBIL">🔒 BELUM DIAMBIL</option>
                  </select>
                </div>

                {/* Grade Selector */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {isDone ? 'Nilai Diperoleh:' : 'Target Nilai:'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={course.grade || course.targetGrade || 'A'}
                      onChange={(e) => {
                        playCyberSuccess();
                        onUpdateCourseGrade(course.id, e.target.value as GradeLetter);
                      }}
                      className="bg-black text-amber-400 border border-amber-500/50 rounded px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="A">A (4.00)</option>
                      <option value="A-">A- (3.70)</option>
                      <option value="B+">B+ (3.30)</option>
                      <option value="B">B (3.00)</option>
                      <option value="B-">B- (2.70)</option>
                      <option value="C+">C+ (2.30)</option>
                      <option value="C">C (2.00)</option>
                      <option value="D">D (1.00)</option>
                      <option value="E">E (0.00)</option>
                    </select>
                  </div>
                </div>

                {/* Details Button */}
                <button
                  onClick={() => {
                    playCyberClick();
                    setActiveCourseDetail(course);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded bg-black hover:bg-white/5 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#00ff9d]" />
                  <span>Silabus & Capaian Kompetensi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      {activeCourseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] border border-[#00ff9d] rounded-lg max-w-xl w-full p-6 cyber-box-green relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-black border border-[#00e5ff] text-[#00e5ff]">
                  {activeCourseDetail.code} • {activeCourseDetail.sks} SKS
                </span>
                <h2 className="text-xl font-cyber font-bold text-white mt-2">
                  {activeCourseDetail.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Kategori: {activeCourseDetail.category} • Semester {activeCourseDetail.semester}
                </p>
              </div>
              <button
                onClick={() => setActiveCourseDetail(null)}
                className="text-slate-400 hover:text-white font-mono p-1"
              >
                [X]
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-mono text-[#00ff9d] uppercase">Deskripsi Mata Kuliah</h4>
                <p className="text-sm font-mono text-slate-300 mt-1 bg-black/50 p-3 rounded border border-white/10">
                  {activeCourseDetail.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-[#00e5ff] uppercase">Target Capaian & Kompetensi</h4>
                <div className="mt-2 space-y-1.5">
                  {activeCourseDetail.competencies.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs font-mono text-slate-200 bg-white/5 px-3 py-2 rounded border border-white/5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00ff9d] shrink-0" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveCourseDetail(null)}
                className="px-4 py-2 rounded bg-[#00ff9d] text-black font-mono font-bold text-xs hover:bg-[#00ff9d]/80 transition-colors"
              >
                TUTUP HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
