import React, { useEffect } from 'react';
import { Sparkles, ZoomIn, CheckCircle2, XCircle, ArrowRight, Bot, Clock } from 'lucide-react';
import { GameMode, Question, Team } from '../types/game';

interface QuestionCardProps {
  question: Question;
  gameMode: GameMode;
  turnTeam: Team; // For turn-based mode
  isRoundActive: boolean;
  selectedRedAnswer: number | null;
  selectedBlueAnswer: number | null;
  redLockedOut: boolean;
  blueLockedOut: boolean;
  aiThinking: boolean;
  onAnswer: (team: Team, optionIndex: number) => void;
  onNextQuestion: () => void;
  onOpenLightbox: (url: string, caption?: string) => void;
  roundResultExplanation: string | null;
  lastRoundWinner: Team | 'draw' | null;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  gameMode,
  turnTeam,
  isRoundActive,
  selectedRedAnswer,
  selectedBlueAnswer,
  redLockedOut,
  blueLockedOut,
  aiThinking,
  onAnswer,
  onNextQuestion,
  onOpenLightbox,
  roundResultExplanation,
  lastRoundWinner,
}) => {
  // Setup keyboard shortcuts for PVP buzzer mode:
  // Red: A(0), S(1), D(2), F(3)
  // Blue: J(0), K(1), L(2), ;(3)
  useEffect(() => {
    if (!isRoundActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or modal
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();

      // Red Team shortcuts
      if (!redLockedOut && selectedRedAnswer === null) {
        if (key === 'a') onAnswer('red', 0);
        else if (key === 's') onAnswer('red', 1);
        else if (key === 'd') onAnswer('red', 2);
        else if (key === 'f') onAnswer('red', 3);
      }

      // Blue Team shortcuts (in PVP mode)
      if (gameMode === 'pvp_buzzer' && !blueLockedOut && selectedBlueAnswer === null) {
        if (key === 'j') onAnswer('blue', 0);
        else if (key === 'k') onAnswer('blue', 1);
        else if (key === 'l') onAnswer('blue', 2);
        else if (key === ';' || key === '/') onAnswer('blue', 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRoundActive, gameMode, redLockedOut, blueLockedOut, selectedRedAnswer, selectedBlueAnswer, onAnswer]);

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
      {/* Question Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {question.subject}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {question.grade}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            {question.topic}
          </span>
        </div>

        {/* Turn banner in Turn-based mode */}
        {gameMode === 'turn_based' && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              turnTeam === 'red'
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${turnTeam === 'red' ? 'bg-red-600' : 'bg-blue-600'}`} />
            <span>Giliran: {turnTeam === 'red' ? 'Tim Merah' : 'Tim Biru'}</span>
          </div>
        )}

        {/* AI Bot thinking indicator */}
        {gameMode === 'vs_ai' && aiThinking && (
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1.5 animate-pulse">
            <Bot className="w-3.5 h-3.5" />
            <span>Bot AI sedang menganalisis soal...</span>
          </div>
        )}
      </div>

      {/* Main Question Text & Optional Illustration */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Question Text */}
        <div className="flex-1">
          <p className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* Question Diagram / Image preview thumbnail */}
        {question.imageUrl && (
          <div className="w-full md:w-56 shrink-0 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex flex-col items-center">
            <div
              className="relative group cursor-pointer w-full overflow-hidden rounded-xl border border-slate-200 bg-white"
              onClick={() => onOpenLightbox(question.imageUrl!, question.imageCaption)}
              title="Klik untuk memperbesar gambar"
            >
              <img
                src={question.imageUrl}
                alt={question.imageCaption || 'Ilustrasi Soal'}
                className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full">
                  <ZoomIn className="w-3.5 h-3.5" /> Zoom
                </span>
              </div>
            </div>
            {question.imageCaption && (
              <span className="mt-1.5 text-[11px] text-center text-slate-500 font-medium line-clamp-2">
                {question.imageCaption}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Answer Area: Responsive dual consoles for PVP or Single console for VS AI / Turn-based */}
      {gameMode === 'pvp_buzzer' ? (
        /* PVP BUZZER DUAL CONSOLE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Tim Merah Console */}
          <div className="bg-red-50/50 border border-red-200/70 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                Pilihan Tim Merah (Tombol: A, S, D, F)
              </span>
              {redLockedOut && (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Salah / Terkunci
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {question.options.map((option, idx) => {
                const isSelected = selectedRedAnswer === idx;
                const isCorrect = idx === question.correctIndex;
                let btnStyle = 'bg-white hover:bg-red-100/60 text-slate-800 border-red-200';

                if (!isRoundActive) {
                  if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-500 text-white border-rose-600 line-through';
                  else btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                } else if (isSelected) {
                  btnStyle = 'bg-red-600 text-white border-red-700 font-bold';
                }

                return (
                  <button
                    key={idx}
                    disabled={!isRoundActive || redLockedOut || selectedRedAnswer !== null}
                    onClick={() => onAnswer('red', idx)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs md:text-sm font-medium transition-all flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs shrink-0">
                      {['A', 'S', 'D', 'F'][idx]}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tim Biru Console */}
          <div className="bg-blue-50/50 border border-blue-200/70 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Pilihan Tim Biru (Tombol: J, K, L, ;)
              </span>
              {blueLockedOut && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Salah / Terkunci
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {question.options.map((option, idx) => {
                const isSelected = selectedBlueAnswer === idx;
                const isCorrect = idx === question.correctIndex;
                let btnStyle = 'bg-white hover:bg-blue-100/60 text-slate-800 border-blue-200';

                if (!isRoundActive) {
                  if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                  else if (isSelected) btnStyle = 'bg-blue-500 text-white border-blue-600 line-through';
                  else btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                } else if (isSelected) {
                  btnStyle = 'bg-blue-600 text-white border-blue-700 font-bold';
                }

                return (
                  <button
                    key={idx}
                    disabled={!isRoundActive || blueLockedOut || selectedBlueAnswer !== null}
                    onClick={() => onAnswer('blue', idx)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs md:text-sm font-medium transition-all flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs shrink-0">
                      {['J', 'K', 'L', ';'][idx]}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VS BOT AI & TURN-BASED CONSOLE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {question.options.map((option, idx) => {
            const isRedSelected = selectedRedAnswer === idx;
            const isBlueSelected = selectedBlueAnswer === idx;
            const isCorrect = idx === question.correctIndex;

            let btnStyle =
              'bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 text-slate-800 border-slate-200';

            if (!isRoundActive) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
              } else if (isRedSelected || isBlueSelected) {
                btnStyle = 'bg-rose-500 text-white border-rose-600 line-through';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
              }
            } else if (isRedSelected) {
              btnStyle = 'bg-red-600 text-white border-red-700 font-bold';
            } else if (isBlueSelected) {
              btnStyle = 'bg-blue-600 text-white border-blue-700 font-bold';
            }

            const activeTargetTeam = gameMode === 'turn_based' ? turnTeam : 'red';
            const isTargetLocked = activeTargetTeam === 'red' ? redLockedOut : blueLockedOut;

            return (
              <button
                key={idx}
                disabled={!isRoundActive || isTargetLocked}
                onClick={() => onAnswer(activeTargetTeam, idx)}
                className={`p-3.5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center gap-3 cursor-pointer shadow-xs disabled:cursor-not-allowed ${btnStyle}`}
              >
                <span className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {optionLetters[idx]}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Round Result & Step-by-Step Explanation Banner */}
      {!isRoundActive && (
        <div className="mt-2 bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-indigo-100 rounded-2xl p-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70">
            <div className="flex items-center gap-2">
              {lastRoundWinner === 'red' ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Tim Merah Berhasil Menarik!
                </div>
              ) : lastRoundWinner === 'blue' ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Tim Biru Berhasil Menarik!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" /> Waktu Habis / Tidak Ada Pemenang Tarikan
                </div>
              )}
              <span className="text-xs text-slate-600 font-medium">
                Jawaban Benar: <strong className="text-slate-900 font-bold">{optionLetters[question.correctIndex]}. {question.options[question.correctIndex]}</strong>
              </span>
            </div>

            <button
              onClick={onNextQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm shadow-md transition-all cursor-pointer hover:shadow-indigo-200"
            >
              <span>Pertanyaan Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation Text */}
          {question.explanation && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pembahasan Langkah Demi Langkah:</span>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-indigo-100/60">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
