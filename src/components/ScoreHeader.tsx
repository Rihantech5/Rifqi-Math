import React from 'react';
import { Volume2, VolumeX, Settings, BookOpen, RotateCcw, Bot, Swords, UserCheck } from 'lucide-react';
import { GameMode, TeamStats } from '../types/game';

interface ScoreHeaderProps {
  redStats: TeamStats;
  blueStats: TeamStats;
  currentRound: number;
  totalQuestions: number;
  activeTopic: string;
  activeGrade?: string;
  activeSubject?: string;
  gameMode: GameMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenQuestionBank: () => void;
  onResetMatch: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  redStats,
  blueStats,
  currentRound,
  totalQuestions,
  activeTopic,
  activeGrade = 'Semua',
  activeSubject = 'Semua',
  gameMode,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenQuestionBank,
  onResetMatch,
}) => {
  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'pvp_buzzer':
        return { label: 'Duel Cepat (PVP)', icon: Swords, color: 'text-rose-600 bg-rose-50 border-rose-200' };
      case 'vs_ai':
        return { label: 'Pemain vs Bot AI', icon: Bot, color: 'text-violet-600 bg-violet-50 border-violet-200' };
      case 'turn_based':
        return { label: 'Bergantian (Turn-Based)', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
  };

  const modeInfo = getModeLabel(gameMode);
  const ModeIcon = modeInfo.icon;

  return (
    <header className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-500 flex items-center justify-center shadow-xs text-white font-extrabold text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Tarik Tambang Edukasi
            </h1>
            <p className="text-xs text-slate-500">Literasi &amp; Numerasi SMP Interaktif</p>
          </div>
        </div>

        {/* Center round, subject, grade & mode info */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${modeInfo.color}`}>
            <ModeIcon className="w-3.5 h-3.5" />
            <span>{modeInfo.label}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>Ronde {currentRound} / {Math.max(1, totalQuestions)}</span>
            {activeSubject !== 'Semua' && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className={activeSubject === 'Literasi' ? 'text-amber-700 font-bold' : 'text-blue-700 font-bold'}>
                  {activeSubject}
                </span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="text-emerald-700 font-bold">{activeGrade === 'Semua' ? 'Semua Kls' : activeGrade}</span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="text-indigo-600 font-bold">{activeTopic}</span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
            title={soundEnabled ? 'Matikan Suara (Mute)' : 'Nyalakan Suara (Unmute)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onResetMatch}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Mulai Ulang Pertandingan (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuestionBank}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Kelola Bank Soal"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Pengaturan Permainan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard: Red Team vs Blue Team */}
      <div className="grid grid-cols-2 gap-4 pt-3">
        {/* Red Team Card */}
        <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-red-950">Tim Merah</span>
                <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm">
                  Kiri
                </span>
              </div>
              <div className="text-xs text-red-700/80 font-medium">
                Benar: {redStats.correctAnswers} / {redStats.totalAttempts} ({redStats.totalAttempts > 0 ? Math.round((redStats.correctAnswers / redStats.totalAttempts) * 100) : 0}%)
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-red-700">{redStats.score}</span>
            <span className="block text-[10px] uppercase font-bold text-red-500">Poin Tarikan</span>
          </div>
        </div>

        {/* Blue Team Card */}
        <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3 flex items-center justify-between">
          <div className="text-left">
            <span className="text-2xl font-black text-blue-700">{blueStats.score}</span>
            <span className="block text-[10px] uppercase font-bold text-blue-500">Poin Tarikan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm">
                  Kanan
                </span>
                <span className="text-sm font-bold text-blue-950">
                  {gameMode === 'vs_ai' ? 'Bot AI (Biru)' : 'Tim Biru'}
                </span>
              </div>
              <div className="text-xs text-blue-700/80 font-medium">
                Benar: {blueStats.correctAnswers} / {blueStats.totalAttempts} ({blueStats.totalAttempts > 0 ? Math.round((blueStats.correctAnswers / blueStats.totalAttempts) * 100) : 0}%)
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              B
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
