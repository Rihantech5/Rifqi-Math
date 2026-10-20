import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, BookOpen, CheckCircle, BarChart2 } from 'lucide-react';
import { Team, TeamStats } from '../types/game';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  winner: Team | 'draw';
  redStats: TeamStats;
  blueStats: TeamStats;
  currentDistance: number;
  activeTopic: string;
  totalQuestionsAnswered: number;
  onRematch: () => void;
  onOpenQuestionBank: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  redStats,
  blueStats,
  currentDistance,
  activeTopic,
  totalQuestionsAnswered,
  onRematch,
  onOpenQuestionBank,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playFanfare();

      // Confetti burst from both sides
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const colors = winner === 'red' ? ['#ef4444', '#dc2626', '#fca5a5'] : winner === 'blue' ? ['#3b82f6', '#2563eb', '#93c5fd'] : ['#f59e0b', '#10b981', '#6366f1'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  const isRedWinner = winner === 'red';
  const isBlueWinner = winner === 'blue';
  const isDraw = winner === 'draw';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy Icon */}
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
            isRedWinner
              ? 'bg-gradient-to-tr from-red-500 to-rose-600 text-white shadow-red-200'
              : isBlueWinner
              ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-blue-200'
              : 'bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-amber-200'
          }`}
        >
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Pertandingan Selesai!
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {isRedWinner && '🏆 KEMENANGAN TIM MERAH!'}
            {isBlueWinner && '🏆 KEMENANGAN TIM BIRU!'}
            {isDraw && '🤝 PERTANDINGAN SEIMBANG!'}
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span>Topik: <strong>{activeTopic}</strong></span>
            <span>•</span>
            <span>Total Soal: <strong>{totalQuestionsAnswered}</strong></span>
          </div>
        </div>

        {/* Tug Distance Achievement */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-around">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Pergeseran Tali</span>
            <span className="text-lg font-black text-slate-800">
              {Math.abs(currentDistance).toFixed(1)} Meter
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Skor Tarikan</span>
            <span className="text-lg font-black text-slate-800">
              <span className="text-red-600">{redStats.score}</span> : <span className="text-blue-600">{blueStats.score}</span>
            </span>
          </div>
        </div>

        {/* Accuracy Comparison */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Red Stats */}
          <div className="bg-red-50/60 border border-red-200/70 rounded-2xl p-3 text-left">
            <span className="text-xs font-bold text-red-700 block">Tim Merah</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Akurasi Jawaban:</span>
              <span className="text-sm font-extrabold text-red-800">
                {redStats.totalAttempts > 0 ? Math.round((redStats.correctAnswers / redStats.totalAttempts) * 100) : 0}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {redStats.correctAnswers} benar dari {redStats.totalAttempts} percobaan
            </span>
          </div>

          {/* Blue Stats */}
          <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3 text-left">
            <span className="text-xs font-bold text-blue-700 block">Tim Biru</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Akurasi Jawaban:</span>
              <span className="text-sm font-extrabold text-blue-800">
                {blueStats.totalAttempts > 0 ? Math.round((blueStats.correctAnswers / blueStats.totalAttempts) * 100) : 0}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {blueStats.correctAnswers} benar dari {blueStats.totalAttempts} percobaan
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRematch}
            className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:shadow-indigo-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tanding Ulang (Rematch)</span>
          </button>

          <button
            onClick={onOpenQuestionBank}
            className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank &amp; Generator Soal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
