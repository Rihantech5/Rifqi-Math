import React from 'react';
import { BookOpenText, Calculator, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Question } from '../types/game';

interface JenisSoalSelectorBarProps {
  questions: Question[];
  selectedSubject: string; // 'Semua' or 'Literasi' | 'Numerasi'
  selectedGrade: string;
  selectedTopic: string;
  onSelectSubject: (subject: string) => void;
}

export const JenisSoalSelectorBar: React.FC<JenisSoalSelectorBarProps> = ({
  questions,
  selectedSubject,
  selectedGrade,
  selectedTopic,
  onSelectSubject,
}) => {
  // Available question types
  const types = [
    {
      id: 'Semua',
      label: 'Semua Jenis',
      sublabel: 'Literasi & Numerasi',
      icon: Sparkles,
      activeColor: 'bg-violet-600 text-white ring-2 ring-violet-500/30',
      badgeColor: 'bg-white/25 text-white',
    },
    {
      id: 'Literasi',
      label: 'Literasi',
      sublabel: 'Bahasa & Pemahaman Teks',
      icon: BookOpenText,
      activeColor: 'bg-amber-600 text-white ring-2 ring-amber-500/30',
      badgeColor: 'bg-white/25 text-white',
    },
    {
      id: 'Numerasi',
      label: 'Numerasi',
      sublabel: 'Matematika & Logika Angka',
      icon: Calculator,
      activeColor: 'bg-blue-600 text-white ring-2 ring-blue-500/30',
      badgeColor: 'bg-white/25 text-white',
    },
  ];

  // Dynamic live count calculations
  const counts: Record<string, { total: number; filtered: number }> = {
    Semua: {
      total: questions.length,
      filtered: questions.filter(
        (q) =>
          (selectedGrade === 'Semua' || q.grade === selectedGrade) &&
          (selectedTopic === 'Semua' || q.topic === selectedTopic)
      ).length,
    },
    Literasi: {
      total: questions.filter((q) => q.subject === 'Literasi').length,
      filtered: questions.filter(
        (q) =>
          q.subject === 'Literasi' &&
          (selectedGrade === 'Semua' || q.grade === selectedGrade) &&
          (selectedTopic === 'Semua' || q.topic === selectedTopic)
      ).length,
    },
    Numerasi: {
      total: questions.filter((q) => q.subject === 'Numerasi').length,
      filtered: questions.filter(
        (q) =>
          q.subject === 'Numerasi' &&
          (selectedGrade === 'Semua' || q.grade === selectedGrade) &&
          (selectedTopic === 'Semua' || q.topic === selectedTopic)
      ).length,
    },
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Label and Subject Type Pills */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
            <BookOpenText className="w-3.5 h-3.5" />
          </div>
          <span>Jenis Mapel:</span>
        </div>

        {types.map((t) => {
          const isSelected = selectedSubject === t.id;
          const TypeIcon = t.icon;
          const currentCounts = counts[t.id] || { total: 0, filtered: 0 };
          const displayCount =
            selectedGrade === 'Semua' && selectedTopic === 'Semua'
              ? currentCounts.total
              : currentCounts.filtered;

          return (
            <button
              key={t.id}
              onClick={() => onSelectSubject(t.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? `${t.activeColor} shadow-xs font-semibold`
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-transparent'
              }`}
            >
              <TypeIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                  isSelected ? t.badgeColor : 'bg-slate-200 text-slate-700'
                }`}
                title={`${currentCounts.total} total soal ${t.label} (${currentCounts.filtered} cocok filter aktif)`}
              >
                {displayCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter status indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 self-end sm:self-center">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px]">
          Fokus:{' '}
          <strong
            className={`font-semibold ${
              selectedSubject === 'Literasi'
                ? 'text-amber-700'
                : selectedSubject === 'Numerasi'
                ? 'text-blue-700'
                : 'text-violet-700'
            }`}
          >
            {selectedSubject === 'Semua' ? 'Literasi & Numerasi' : selectedSubject}
          </strong>
        </span>
      </div>
    </div>
  );
};
