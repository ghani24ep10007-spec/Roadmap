import React, { useState } from 'react';
import { CareerPath } from '../types';
import { CAREER_PATHS } from '../data/careerData';
import {
  Shield,
  Cpu,
  BarChart3,
  Radio,
  Database,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Bot,
  Search,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess } from '../utils/audio';

interface CareerAdvisorProps {
  currentSemester: number;
  targetIPK: number;
}

const iconMap: Record<string, any> = {
  Shield,
  Cpu,
  BarChart3,
  Radio,
  Database,
};

export const CareerAdvisor: React.FC<CareerAdvisorProps> = ({
  currentSemester,
  targetIPK,
}) => {
  const [selectedCareerId, setSelectedCareerId] = useState<string>('cyber-security');
  const [masteredSkills, setMasteredSkills] = useState<Record<string, boolean>>({
    'OWASP Top 10 Web Exploitation': true,
    'Linux Hardening & Kali Linux Tools': true,
    'React / Next.js & TypeScript Modern': true,
    'Advanced SQL Query & Stored Procedures': true,
  });

  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<{ title: string; uri: string }[]>([]);

  const selectedCareer =
    CAREER_PATHS.find((c) => c.id === selectedCareerId) || CAREER_PATHS[0];

  // Calculate readiness score
  const totalCareerSkills = selectedCareer.coreSkills.length;
  const masteredCount = selectedCareer.coreSkills.filter(
    (s) => masteredSkills[s.name]
  ).length;
  const readinessPercent = Math.round((masteredCount / totalCareerSkills) * 100);

  const toggleSkill = (skillName: string) => {
    playCyberClick();
    setMasteredSkills((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  };

  const handleAskAI = async (customPrompt?: string) => {
    playCyberClick();
    setAiLoading(true);
    setAiResponse(null);
    setAiSources([]);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || aiPrompt,
          currentSemester,
          targetCareer: selectedCareer.title,
          targetIPK,
          completedCourses: ['SI101', 'SI202', 'SI301', 'SI401', 'SI501'],
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
        if (data.sources) setAiSources(data.sources);
        playCyberSuccess();
      } else {
        setAiResponse('Gagal menerima respons intelijen.');
      }
    } catch (err) {
      setAiResponse(
        `[OFFLINE MATRIX RESPONSE]
Target: ${selectedCareer.title}
1. Skill Prioritas: Perdalam ${selectedCareer.coreSkills[0].name} dan ${selectedCareer.coreSkills[1].name}.
2. Sertifikasi Unggulan: ${selectedCareer.certifications.slice(0, 2).join(', ')}.
3. Saran Skripsi: ${selectedCareer.thesisTopics[0]}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#090d16] border border-[#00ff9d]/30 rounded-lg p-5 cyber-box-green">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#00ff9d]">
          <Zap className="w-4 h-4" />
          <span>CYBER CAREER MATRIX // SKILL GAP & AI ADVISOR</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-cyber font-bold text-white mt-1">
          Rekomendasi Skill & Karier Impian Sistem Informasi
        </h1>
        <p className="text-sm font-mono text-slate-300 mt-1 max-w-3xl">
          Petakan keahlian Anda saat ini di Semester 5, temukan gap kompetensi, dan dapatkan bimbingan taktis berbasis AI intelligence dengan integrasi Google Search grounding.
        </p>
      </div>

      {/* Career Track Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {CAREER_PATHS.map((career) => {
          const Icon = iconMap[career.icon] || Shield;
          const isSelected = selectedCareerId === career.id;

          return (
            <button
              key={career.id}
              onClick={() => {
                playCyberClick();
                setSelectedCareerId(career.id);
              }}
              className={`p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#00ff9d]/15 border-[#00ff9d] cyber-box-green ring-1 ring-[#00ff9d]'
                  : 'bg-[#090d16] border-white/10 hover:border-white/30 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d]'
                        : 'bg-black border-white/20 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      career.difficulty === 'EXPERT'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : career.difficulty === 'HARD'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {career.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-3 leading-snug">
                  {career.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  {career.roleIndo}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#00ff9d]">
                {career.salaryRange}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Career Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Checklist & Readiness */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Overview & Readiness Score */}
          <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#00e5ff] uppercase">
                  Profil Karier Sasaran
                </span>
                <h2 className="text-xl font-cyber font-bold text-white mt-1">
                  {selectedCareer.title}
                </h2>
                <p className="text-xs font-mono text-slate-300 mt-2">
                  {selectedCareer.description}
                </p>
              </div>

              {/* Readiness Circular / Box Score */}
              <div className="shrink-0 bg-black p-4 rounded-lg border border-[#00ff9d]/40 text-center cyber-box-green">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Kesiapan Karier
                </span>
                <div className="text-3xl font-cyber font-bold text-[#00ff9d] mt-1">
                  {readinessPercent}%
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {masteredCount} dari {totalCareerSkills} Skill
                </span>
              </div>
            </div>

            {/* Interactive Skill Audit Checklist */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                <span>CHECKLIST SKILL INTI (KLIK UNTUK AUDIT GAP):</span>
                <span className="text-[11px] text-[#00ff9d]">
                  {readinessPercent >= 70 ? '✓ SIAP MAGANG' : 'PERLU UPGRADE'}
                </span>
              </h4>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCareer.coreSkills.map((skill) => {
                  const isMastered = !!masteredSkills[skill.name];
                  return (
                    <button
                      key={skill.name}
                      onClick={() => toggleSkill(skill.name)}
                      className={`flex items-start space-x-2.5 p-3 rounded text-left text-xs font-mono border transition-all ${
                        isMastered
                          ? 'bg-[#00ff9d]/10 border-[#00ff9d]/50 text-white'
                          : 'bg-black/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <CheckCircle
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isMastered ? 'text-[#00ff9d]' : 'text-slate-600'
                        }`}
                      />
                      <div>
                        <span className={isMastered ? 'font-semibold text-white' : ''}>
                          {skill.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Kategori: {skill.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Certifications & Elective Courses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
              <h4 className="text-xs font-cyber font-bold text-amber-400 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>SERTIFIKASI INDUSTRI BERGENGSI</span>
              </h4>
              <ul className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                {selectedCareer.certifications.map((cert, idx) => (
                  <li
                    key={idx}
                    className="flex items-center space-x-2 bg-black/60 px-3 py-2 rounded border border-white/5"
                  >
                    <span className="text-[#00ff9d]">#</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
              <h4 className="text-xs font-cyber font-bold text-[#00e5ff] flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>MK PILIHAN REKOMENDASI DI SEMESTER 6-7</span>
              </h4>
              <ul className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                {selectedCareer.recommendedElectives.map((elec, idx) => (
                  <li
                    key={idx}
                    className="flex items-center space-x-2 bg-black/60 px-3 py-2 rounded border border-white/5"
                  >
                    <span className="text-[#00e5ff]">➔</span>
                    <span>{elec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topik Skripsi SI Relevan */}
          <div className="bg-[#090d16] border border-white/15 rounded-lg p-5">
            <h4 className="text-xs font-cyber font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#00ff9d]" />
              <span>IDE TOPIK SKRIPSI / TUGAS AKHIR SISTEM INFORMASI</span>
            </h4>
            <div className="mt-3 space-y-2">
              {selectedCareer.thesisTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-black/60 border border-white/10 text-xs font-mono text-slate-200"
                >
                  <span className="text-[#00ff9d] font-bold mr-2">Opsi #{idx + 1}:</span>
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Cyber Advisor (Gemini Intelligence + Search Grounding) */}
        <div className="bg-[#090d16] border border-[#00ff9d]/40 rounded-lg p-5 cyber-box-green flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-[#00ff9d] animate-pulse" />
              <h3 className="text-sm font-cyber font-bold text-white">
                GEMINI AI CAREER ADVISOR
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Konsultasikan roadmap belajar, strategi magang MBKM, dan persiapan portofolio dengan kecerdasan Gemini & Google Search Grounding.
            </p>

            {/* Quick Action Prompt Chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                `Rencana belajar 30 hari untuk ${selectedCareer.title}`,
                `Bagaimana cara tembus magang ${selectedCareer.title} dari Semester 5?`,
                `Rekomendasi judul Skripsi SI bertema ${selectedCareer.title}`,
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(chip);
                    handleAskAI(chip);
                  }}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-black border border-white/15 text-slate-300 hover:border-[#00ff9d] hover:text-[#00ff9d] transition-colors text-left"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Tanyakan hal spesifik: misalnya strategi belajar pentesting, audit COBIT, dll..."
                rows={3}
                className="w-full bg-black border border-white/20 rounded p-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00ff9d]"
              />
              <button
                disabled={aiLoading}
                onClick={() => handleAskAI()}
                className="mt-2 w-full flex items-center justify-center space-x-2 py-2 rounded bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-black text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>MENGANALISIS MATRIX INTELIJEN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>KONSULTASIKAN KE AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Response Output Box */}
            {aiResponse && (
              <div className="mt-4 p-4 rounded bg-black border border-[#00ff9d]/50 max-h-80 overflow-y-auto text-xs font-mono text-slate-200 space-y-2 whitespace-pre-wrap">
                <div className="text-[10px] text-[#00ff9d] border-b border-[#00ff9d]/30 pb-1 font-bold">
                  // HASIL AUDIT MATRIX CYBER ADVISOR
                </div>
                <div>{aiResponse}</div>

                {/* Grounding Sources */}
                {aiSources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Sumber Web Terverifikasi (Google Search):
                    </span>
                    <div className="mt-1 space-y-1">
                      {aiSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-[10px] text-[#00e5ff] hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
