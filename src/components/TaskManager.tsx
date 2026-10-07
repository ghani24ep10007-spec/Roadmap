import React, { useState } from 'react';
import { TaskItem } from '../types';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess, playCyberAlert } from '../utils/audio';

interface TaskManagerProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('SI501');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('HIGH');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('Tugas');
  const [newNotes, setNewNotes] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      courseCode: newCourseCode,
      deadline: newDeadline,
      priority: newPriority,
      category: newCategory,
      completed: false,
      notes: newNotes.trim(),
    });

    playCyberSuccess();
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const calculateDaysLeft = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-5 cyber-box-green flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#00ff9d]">
            <Clock className="w-4 h-4" />
            <span>ACADEMIC MISSION LOG // PENGINGAT TUGAS SEMESTER 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-cyber font-bold text-white mt-1">
            Pengingat Tugas & Deadline Akademik
          </h1>
          <p className="text-xs font-mono text-slate-300 mt-1">
            Pantau misi praktikum, tugas analisis, proyek web, dan milestone skripsi agar tetap optimal dan tepat waktu.
          </p>
        </div>

        <button
          onClick={() => {
            playCyberClick();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded bg-[#00ff9d] text-black font-cyber font-bold text-xs hover:bg-[#00ff9d]/80 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>TAMBAH TUGAS BARU</span>
        </button>
      </div>

      {/* Progress HUD Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#090d16] border border-white/10 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400">TOTAL MISI TUGAS</span>
          <div className="text-2xl font-cyber font-bold text-white mt-1">
            {tasks.length}
          </div>
        </div>

        <div className="bg-[#090d16] border border-amber-500/30 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400">TUGAS AKTIF / TENGGAT</span>
          <div className="text-2xl font-cyber font-bold text-amber-400 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400">TUGAS TUNTAS</span>
          <div className="text-2xl font-cyber font-bold text-[#00ff9d] mt-1">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['ALL', 'Tugas', 'Praktikum', 'Proyek', 'Skripsi', 'UMKM'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playCyberClick();
                setCategoryFilter(cat);
              }}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#00e5ff] text-black font-bold'
                  : 'bg-black text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'SEMUA KATEGORI' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500">Prioritas:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => (
            <button
              key={prio}
              onClick={() => {
                playCyberClick();
                setPriorityFilter(prio);
              }}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                priorityFilter === prio
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-[#090d16] rounded-lg border border-dashed border-white/15 text-slate-500 text-xs font-mono">
            Tidak ada tugas dalam filter ini. Misi akademik Anda terkendali!
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysLeft = calculateDaysLeft(task.deadline);
            const isLate = daysLeft < 0 && !task.completed;
            const isUrgent = daysLeft >= 0 && daysLeft <= 2 && !task.completed;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border bg-[#090d16] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.completed
                    ? 'border-white/10 opacity-60 bg-black/40'
                    : isUrgent
                    ? 'border-red-500/60 cyber-box-pink'
                    : 'border-white/15 hover:border-white/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => {
                      if (!task.completed) {
                        playCyberSuccess();
                      } else {
                        playCyberClick();
                      }
                      onToggleTask(task.id);
                    }}
                    className="mt-1 text-slate-400 hover:text-[#00ff9d] transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00ff9d]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {task.courseCode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black border border-white/20 text-[#00e5ff] font-bold">
                          {task.courseCode}
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {task.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          task.priority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold mt-1.5 ${
                        task.completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls: Deadline countdown & Delete */}
                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">TENGGAT WAKTU:</span>
                    <span
                      className={`font-bold ${
                        task.completed
                          ? 'text-slate-500'
                          : isLate
                          ? 'text-red-400 animate-pulse'
                          : isUrgent
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {task.deadline} (
                      {task.completed
                        ? 'Selesai'
                        : isLate
                        ? `Terlambat ${Math.abs(daysLeft)} hari`
                        : daysLeft === 0
                        ? 'Hari Ini!'
                        : `${daysLeft} hari lagi`}
                      )
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playCyberAlert();
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] border border-[#00ff9d] rounded-lg max-w-md w-full p-6 cyber-box-green relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-cyber font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#00ff9d]" />
                <span>TAMBAH TUGAS AKADEMIK</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Judul / Misi Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktikum Kali Linux Eksploitasi..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Kode MK</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                  >
                    <option value="Tugas">Tugas</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Kuis">Kuis</option>
                    <option value="Proyek">Proyek</option>
                    <option value="Skripsi">Skripsi</option>
                    <option value="UMKM">UMKM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Tingkat Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                  >
                    <option value="CRITICAL">CRITICAL (Mendesak)</option>
                    <option value="HIGH">HIGH (Tinggi)</option>
                    <option value="MEDIUM">MEDIUM (Sedang)</option>
                    <option value="LOW">LOW (Santai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pengumpulan link repo, format PDF, dll..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#00ff9d]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded bg-black border border-white/20 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00ff9d] text-black font-bold hover:bg-[#00ff9d]/80 transition-colors"
                >
                  SIMPAN KE MATRIX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
