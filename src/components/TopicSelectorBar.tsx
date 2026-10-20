import React from 'react';
import { Sparkles, BookOpen, Layers } from 'lucide-react';
import { Question } from '../types/game';

interface TopicSelectorBarProps {
  questions: Question[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onOpenQuestionBank: () => void;
  onOpenAIGenerator: () => void;
}

export const TopicSelectorBar: React.FC<TopicSelectorBarProps> = ({
  questions,
  selectedTopic,
  onSelectTopic,
  onOpenQuestionBank,
  onOpenAIGenerator,
}) => {
  // Aggregate topic counts dynamically
  const topicCounts: Record<string, number> = {
    Semua: questions.length,
  };

  questions.forEach((q) => {
    // Count specific topic
    if (q.topic) {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }
    // Also track primary subject category
    if (q.subject && q.subject !== q.topic) {
      topicCounts[q.subject] = (topicCounts[q.subject] || 0) + 1;
    }
  });

  // Extract distinct topics sorted nicely
  const availableTopics = ['Semua', ...Array.from(new Set(questions.map((q) => q.topic))).filter(Boolean)];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Topics list scrollable */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Topik:</span>
        </div>

        {availableTopics.map((topic) => {
          const isSelected = selectedTopic === topic;
          const count = topicCounts[topic] || 0;

          return (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span>{topic}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick shortcuts for Teacher / Question Manager */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <button
          onClick={onOpenAIGenerator}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 text-xs font-semibold border border-indigo-200/80 transition-all cursor-pointer shadow-xs"
          title="Buat soal otomatis dengan Gemini AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>AI Generator</span>
        </button>

        <button
          onClick={onOpenQuestionBank}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
          title="Buka Bank Soal & Kelola Pertanyaan"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
          <span>Bank Soal ({questions.length})</span>
        </button>
      </div>
    </div>
  );
};
