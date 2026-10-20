import React from 'react';
import { X, Settings, Sliders, Volume2, Bot, Trophy, Timer } from 'lucide-react';
import { BotDifficulty, GameMode, GameSettings, Question } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  questions: Question[];
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  questions,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  // Available unique topics
  const topics = ['Semua', ...Array.from(new Set(questions.map((q) => q.topic))).filter(Boolean)];

  const handleModeChange = (mode: GameMode) => {
    onUpdateSettings({ ...settings, mode });
  };

  const handleTopicChange = (activeTopic: string) => {
    onUpdateSettings({ ...settings, activeTopic });
  };

  const handleDurationChange = (questionDuration: number) => {
    onUpdateSettings({ ...settings, questionDuration });
  };

  const handleTargetDistanceChange = (targetDistance: number) => {
    onUpdateSettings({ ...settings, targetDistance });
  };

  const handleBotDifficultyChange = (botDifficulty: BotDifficulty) => {
    onUpdateSettings({ ...settings, botDifficulty });
  };

  const handleSoundToggle = (soundEnabled: boolean) => {
    onUpdateSettings({ ...settings, soundEnabled });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengaturan Permainan</h2>
              <p className="text-xs text-slate-500">Konfigurasi mode pertandingan &amp; aturan tarik tambang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Mode Permainan */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Mode Pertandingan:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pvp_buzzer' as GameMode, title: 'Duel Cepat', desc: '1 Perangkat (Buzzer)' },
              { id: 'vs_ai' as GameMode, title: 'Lawan Bot AI', desc: 'Latihan Mandiri' },
              { id: 'turn_based' as GameMode, title: 'Bergantian', desc: 'Proyektor Kelas' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  settings.mode === m.id
                    ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-slate-800">{m.title}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Filter Jenis Soal / Mapel */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700">Filter Jenis Mapel:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Semua', label: 'Semua Mapel', color: 'bg-violet-50 border-violet-600 text-violet-800' },
              { id: 'Literasi', label: 'Literasi', color: 'bg-amber-50 border-amber-600 text-amber-800' },
              { id: 'Numerasi', label: 'Numerasi', color: 'bg-blue-50 border-blue-600 text-blue-800' },
            ].map((s) => {
              const count = s.id === 'Semua' ? questions.length : questions.filter((q) => q.subject === s.id).length;
              const isSelected = (settings.activeSubject || 'Semua') === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, activeSubject: s.id })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? `${s.color} font-bold ring-1 ring-black/10`
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block text-xs font-semibold">{s.label}</span>
                  <span className="block text-[10px] opacity-75">({count} soal)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter Tingkat Kelas */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700">Filter Tingkat Kelas SMP:</label>
          <div className="grid grid-cols-4 gap-2">
            {['Semua', 'Kelas 7', 'Kelas 8', 'Kelas 9'].map((g) => {
              const count = g === 'Semua' ? questions.length : questions.filter((q) => q.grade === g).length;
              const isSelected = (settings.activeGrade || 'Semua') === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, activeGrade: g })}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block text-xs font-semibold">{g === 'Semua' ? 'Semua Kls' : g}</span>
                  <span className="block text-[10px] opacity-75">({count} soal)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Filter Topik Soal */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700">Filter Topik Pertandingan:</label>
          <select
            value={settings.activeTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs md:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {topics.map((t) => {
              const count = t === 'Semua' ? questions.length : questions.filter((q) => q.topic === t).length;
              return (
                <option key={t} value={t}>
                  {t} ({count} Soal Tersedia)
                </option>
              );
            })}
          </select>
        </div>

        {/* 5. Durasi Timer Waktu Soal (Urgency Timer) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-500" />
              <span>Waktu Menjawab Per Soal:</span>
            </span>
            <span className="text-indigo-600 font-extrabold">
              {settings.questionDuration} Detik {settings.questionDuration >= 60 ? `(${settings.questionDuration / 60} Menit)` : ''}
            </span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 15, 20, 30, 45, 60, 90, 120, 150, 180].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleDurationChange(sec)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  settings.questionDuration === sec
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{sec}s</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400">
            Waktu lebih panjang (90s - 180s / 1.5 - 3 menit) ideal untuk soal HOTS dan penalaran matematika kompleks.
          </span>
        </div>

        {/* 4. Target Jarak Kemenangan */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-500" />
              <span>Garis Batas Kemenangan (Offset Tali):</span>
            </span>
            <span className="text-emerald-700 font-extrabold">{settings.targetDistance} Meter</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 2.0, label: 'Cepat (2 Meter)' },
              { val: 3.0, label: 'Standar (3 Meter)' },
              { val: 5.0, label: 'Sengit (5 Meter)' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => handleTargetDistanceChange(d.val)}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.targetDistance === d.val
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Tingkat Kesulitan Bot AI (jika mode vs AI) */}
        {settings.mode === 'vs_ai' && (
          <div className="flex flex-col gap-2 bg-violet-50/70 border border-violet-200/80 rounded-2xl p-3.5">
            <label className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-violet-600" />
              <span>Tingkat Kecerdasan Bot AI:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy' as BotDifficulty, label: 'Mudah', acc: '50% Akurasi' },
                { id: 'medium' as BotDifficulty, label: 'Sedang', acc: '75% Akurasi' },
                { id: 'hard' as BotDifficulty, label: 'Jagoan', acc: '90% Akurasi' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBotDifficultyChange(b.id)}
                  className={`p-2.5 rounded-xl text-xs border text-center transition-all cursor-pointer ${
                    settings.botDifficulty === b.id
                      ? 'bg-violet-600 text-white font-bold border-violet-700 shadow-xs'
                      : 'bg-white hover:bg-violet-100/50 text-slate-700 border-violet-200'
                  }`}
                >
                  <span className="block font-bold">{b.label}</span>
                  <span className="block text-[10px] opacity-80">{b.acc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. Audio Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Efek Suara Web Audio</span>
              <span className="text-[11px] text-slate-500 block">Peluit wasit, chime benar, buzzer, dan decitan tali</span>
            </div>
          </div>
          <button
            onClick={() => handleSoundToggle(!settings.soundEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              settings.soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl cursor-pointer shadow-md transition-all"
          >
            Simpan &amp; Lanjutkan Pertandingan
          </button>
        </div>
      </div>
    </div>
  );
};
