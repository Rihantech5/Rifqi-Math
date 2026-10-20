import React from 'react';
import { GraduationCap, CheckCircle2, Filter } from 'lucide-react';
import { GradeLevel, Question } from '../types/game';

interface KelasSelectorBarProps {
  questions: Question[];
  selectedGrade: string; // 'Semua' or 'Kelas 7' | 'Kelas 8' | 'Kelas 9'
  selectedTopic: string;
  onSelectGrade: (grade: string) => void;
}

export const KelasSelectorBar: React.FC<KelasSelectorBarProps> = ({
  questions,
  selectedGrade,
  selectedTopic,
  onSelectGrade,
}) => {
  // Fixed standard SMP grades
  const grades: { id: string; label: string; short: string; desc: string }[] = [
    { id: 'Semua', label: 'Semua Kelas', short: 'Semua', desc: 'Kelas 7, 8 & 9' },
    { id: 'Kelas 7', label: 'Kelas 7 (Fase D)', short: 'Kls 7', desc: 'SMP Awal' },
    { id: 'Kelas 8', label: 'Kelas 8 (Fase D)', short: 'Kls 8', desc: 'SMP Lanjutan' },
    { id: 'Kelas 9', label: 'Kelas 9 (Fase D)', short: 'Kls 9', desc: 'SMP Akhir' },
  ];

  // Calculate question counts per grade
  // Also count how many match both the grade and the currently active topic if filtered
  const gradeCounts: Record<string, { total: number; matchingTopic: number }> = {
    Semua: {
      total: questions.length,
      matchingTopic: selectedTopic === 'Semua' ? questions.length : questions.filter((q) => q.topic === selectedTopic).length,
    },
    'Kelas 7': {
      total: questions.filter((q) => q.grade === 'Kelas 7').length,
      matchingTopic: questions.filter((q) => q.grade === 'Kelas 7' && (selectedTopic === 'Semua' || q.topic === selectedTopic)).length,
    },
    'Kelas 8': {
      total: questions.filter((q) => q.grade === 'Kelas 8').length,
      matchingTopic: questions.filter((q) => q.grade === 'Kelas 8' && (selectedTopic === 'Semua' || q.topic === selectedTopic)).length,
    },
    'Kelas 9': {
      total: questions.filter((q) => q.grade === 'Kelas 9').length,
      matchingTopic: questions.filter((q) => q.grade === 'Kelas 9' && (selectedTopic === 'Semua' || q.topic === selectedTopic)).length,
    },
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Label and Grade Pills */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span>Tingkat Kelas:</span>
        </div>

        {grades.map((g) => {
          const isSelected = selectedGrade === g.id;
          const counts = gradeCounts[g.id] || { total: 0, matchingTopic: 0 };
          const displayCount = selectedTopic === 'Semua' ? counts.total : counts.matchingTopic;

          return (
            <button
              key={g.id}
              onClick={() => onSelectGrade(g.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span>{g.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}
                title={`${counts.total} total soal (${counts.matchingTopic} cocok topik ${selectedTopic})`}
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
          Filter Aktif:{' '}
          <strong className="text-emerald-700 font-semibold">{selectedGrade === 'Semua' ? 'Semua Kelas' : selectedGrade}</strong>
          {selectedTopic !== 'Semua' && (
            <>
              {' '}• Topik: <strong className="text-indigo-600 font-semibold">{selectedTopic}</strong>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
