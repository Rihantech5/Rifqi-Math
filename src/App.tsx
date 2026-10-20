/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, GameSettings, Question, Team, TeamStats } from './types/game';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';
import { sound } from './utils/audio';
import { TugOfWarCanvas } from './components/TugOfWarCanvas';
import { ScoreHeader } from './components/ScoreHeader';
import { TopicSelectorBar } from './components/TopicSelectorBar';
import { QuestionCard } from './components/QuestionCard';
import { SettingsModal } from './components/SettingsModal';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { VictoryModal } from './components/VictoryModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { KelasSelectorBar } from './components/KelasSelectorBar';
import { JenisSoalSelectorBar } from './components/JenisSoalSelectorBar';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'pvp_buzzer',
  questionDuration: 20,
  targetDistance: 3.0,
  pullForcePerCorrect: 1.0,
  botDifficulty: 'medium',
  soundEnabled: true,
  activeTopic: 'Semua',
  activeGrade: 'Semua',
  activeSubject: 'Semua',
};

export default function App() {
  // Load initial questions from localStorage or default
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('tug_of_war_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_QUESTIONS;
  });

  // Load initial settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('tug_of_war_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Sync sound controller with settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save questions and settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tug_of_war_questions', JSON.stringify(questions));
    } catch {
      // Ignore storage quota
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem('tug_of_war_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Filter questions based on activeSubject, activeGrade, and activeTopic
  const filteredQuestions = React.useMemo(() => {
    let list = questions;
    if (settings.activeSubject && settings.activeSubject !== 'Semua') {
      const subjectMatches = list.filter((q) => q.subject === settings.activeSubject);
      if (subjectMatches.length > 0) {
        list = subjectMatches;
      }
    }
    if (settings.activeGrade && settings.activeGrade !== 'Semua') {
      const gradeMatches = list.filter((q) => q.grade === settings.activeGrade);
      if (gradeMatches.length > 0) {
        list = gradeMatches;
      }
    }
    if (settings.activeTopic && settings.activeTopic !== 'Semua') {
      const topicMatches = list.filter((q) => q.topic === settings.activeTopic);
      if (topicMatches.length > 0) {
        list = topicMatches;
      }
    }
    return list.length > 0 ? list : questions;
  }, [questions, settings.activeSubject, settings.activeGrade, settings.activeTopic]);

  // Round & Question Index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion: Question =
    filteredQuestions[currentQuestionIndex % filteredQuestions.length] || DEFAULT_QUESTIONS[0];

  // Tug Game Simulation State
  const [currentDistance, setCurrentDistance] = useState<number>(0); // negative = Red pulling, positive = Blue pulling
  const [pullingTeam, setPullingTeam] = useState<Team | null>(null);
  const [pullIntensity, setPullIntensity] = useState<number>(0);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);

  // Teams Stats
  const [redStats, setRedStats] = useState<TeamStats>({
    score: 0,
    pullDistance: 0,
    correctAnswers: 0,
    totalAttempts: 0,
  });

  const [blueStats, setBlueStats] = useState<TeamStats>({
    score: 0,
    pullDistance: 0,
    correctAnswers: 0,
    totalAttempts: 0,
  });

  // Question Round State
  const [isRoundActive, setIsRoundActive] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.questionDuration);
  const [selectedRedAnswer, setSelectedRedAnswer] = useState<number | null>(null);
  const [selectedBlueAnswer, setSelectedBlueAnswer] = useState<number | null>(null);
  const [redLockedOut, setRedLockedOut] = useState<boolean>(false);
  const [blueLockedOut, setBlueLockedOut] = useState<boolean>(false);
  const [turnTeam, setTurnTeam] = useState<Team>('red'); // for turn_based mode
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<Team | 'draw' | null>(null);
  const [matchWinner, setMatchWinner] = useState<Team | 'draw' | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ url: string; caption?: string } | null>(null);

  const timerIntervalRef = useRef<number | null>(null);
  const aiTimeoutRef = useRef<number | null>(null);

  // Reset round timer & states
  const startNewRound = useCallback(() => {
    setIsRoundActive(true);
    setTimeRemaining(settings.questionDuration);
    setSelectedRedAnswer(null);
    setSelectedBlueAnswer(null);
    setRedLockedOut(false);
    setBlueLockedOut(false);
    setPullingTeam(null);
    setPullIntensity(0);
    setShakeIntensity(0);
    setRoundWinner(null);

    sound.playWhistle();
  }, [settings.questionDuration]);

  // Handle changing subject (Literasi / Numerasi)
  const handleSelectSubject = (subject: string) => {
    setSettings((prev) => ({ ...prev, activeSubject: subject }));
    setCurrentQuestionIndex(0);
    startNewRound();
  };

  // Handle changing topics
  const handleSelectTopic = (topic: string) => {
    setSettings((prev) => ({ ...prev, activeTopic: topic }));
    setCurrentQuestionIndex(0);
    startNewRound();
  };

  // Handle changing grades
  const handleSelectGrade = (grade: string) => {
    setSettings((prev) => ({ ...prev, activeGrade: grade }));
    setCurrentQuestionIndex(0);
    startNewRound();
  };

  // Check victory condition
  useEffect(() => {
    const target = settings.targetDistance;
    if (currentDistance <= -target) {
      setMatchWinner('red');
      setIsRoundActive(false);
      setIsVictoryModalOpen(true);
    } else if (currentDistance >= target) {
      setMatchWinner('blue');
      setIsRoundActive(false);
      setIsVictoryModalOpen(true);
    }
  }, [currentDistance, settings.targetDistance]);

  // Round countdown timer tick
  useEffect(() => {
    if (!isRoundActive || isVictoryModalOpen) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const tickIntervalMs = 100;
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - tickIntervalMs / 1000);

        // Tick sound when time is critical
        if (next <= 5.0 && Math.floor(prev) !== Math.floor(next) && next > 0) {
          sound.playCountdownTick(true);
        }

        // Time up!
        if (next <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleTimeUp();
          return 0;
        }
        return next;
      });
    }, tickIntervalMs);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRoundActive, isVictoryModalOpen]);

  // Handle Time Up
  const handleTimeUp = () => {
    setIsRoundActive(false);
    setRoundWinner('draw');
    sound.playIncorrectBuzzer();
  };

  // Bot AI logic for "vs_ai" mode
  useEffect(() => {
    if (settings.mode !== 'vs_ai' || !isRoundActive || blueLockedOut) return;

    setAiThinking(true);

    // Adaptive AI thinking delay scaled proportionally with question duration
    const baseDelay = Math.max(3500, Math.min(settings.questionDuration * 180, 20000));
    const thinkingDelay = Math.random() * (baseDelay * 0.4) + baseDelay;

    aiTimeoutRef.current = window.setTimeout(() => {
      if (!isRoundActive) return;
      setAiThinking(false);

      // Determine AI accuracy based on difficulty
      const accuracyMap = {
        easy: 0.5,
        medium: 0.75,
        hard: 0.9,
      };
      const accuracy = accuracyMap[settings.botDifficulty] || 0.75;
      const isCorrect = Math.random() < accuracy;

      let chosenIndex = currentQuestion.correctIndex;
      if (!isCorrect) {
        // Pick an incorrect option
        const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQuestion.correctIndex);
        chosenIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }

      handleAnswer('blue', chosenIndex);
    }, thinkingDelay);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [isRoundActive, settings.mode, currentQuestionIndex, blueLockedOut, settings.botDifficulty]);

  // Handle user or bot answering
  const handleAnswer = (team: Team, optionIndex: number) => {
    if (!isRoundActive) return;

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (team === 'red') {
      setSelectedRedAnswer(optionIndex);
      setRedStats((prev) => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      }));
    } else {
      setSelectedBlueAnswer(optionIndex);
      setBlueStats((prev) => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      }));
    }

    if (isCorrect) {
      // CORRECT ANSWER!
      sound.playCorrectChime();
      sound.playRopeTension();
      sound.playPullWhoosh();

      const pullDelta = settings.pullForcePerCorrect;
      const shift = team === 'red' ? -pullDelta : pullDelta;

      setCurrentDistance((prev) => prev + shift);
      setPullingTeam(team);
      setPullIntensity(1.0);
      setShakeIntensity(0.7);
      setRoundWinner(team);
      setIsRoundActive(false);

      if (team === 'red') {
        setRedStats((prev) => ({ ...prev, score: prev.score + 1, pullDistance: prev.pullDistance + pullDelta }));
      } else {
        setBlueStats((prev) => ({ ...prev, score: prev.score + 1, pullDistance: prev.pullDistance + pullDelta }));
      }
    } else {
      // WRONG ANSWER!
      sound.playIncorrectBuzzer();

      if (team === 'red') {
        setRedLockedOut(true);
      } else {
        setBlueLockedOut(true);
      }

      // Check if both teams are locked out or mode is turn-based
      if (settings.mode === 'turn_based') {
        // Switch turn or end round
        setIsRoundActive(false);
        setRoundWinner('draw');
      } else if (
        (team === 'red' && (blueLockedOut || settings.mode === 'vs_ai')) ||
        (team === 'blue' && redLockedOut)
      ) {
        setIsRoundActive(false);
        setRoundWinner('draw');
      }
    }
  };

  // Next Question trigger
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
    if (settings.mode === 'turn_based') {
      setTurnTeam((prev) => (prev === 'red' ? 'blue' : 'red'));
    }
    startNewRound();
  };

  // Reset entire match
  const handleResetMatch = () => {
    setCurrentDistance(0);
    setRedStats({ score: 0, pullDistance: 0, correctAnswers: 0, totalAttempts: 0 });
    setBlueStats({ score: 0, pullDistance: 0, correctAnswers: 0, totalAttempts: 0 });
    setMatchWinner(null);
    setIsVictoryModalOpen(false);
    setCurrentQuestionIndex(0);
    startNewRound();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-3 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-4">
        {/* 1. Header with Scores, Round & Quick Controls */}
        <ScoreHeader
          redStats={redStats}
          blueStats={blueStats}
          currentRound={currentQuestionIndex + 1}
          totalQuestions={filteredQuestions.length}
          activeTopic={settings.activeTopic}
          activeGrade={settings.activeGrade}
          activeSubject={settings.activeSubject}
          gameMode={settings.mode}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
          onResetMatch={handleResetMatch}
        />

        {/* 2. Bilah Pilihan Jenis Soal (JenisSoalSelectorBar) */}
        <JenisSoalSelectorBar
          questions={questions}
          selectedSubject={settings.activeSubject || 'Semua'}
          selectedGrade={settings.activeGrade || 'Semua'}
          selectedTopic={settings.activeTopic || 'Semua'}
          onSelectSubject={handleSelectSubject}
        />

        {/* 3. Bilah Pilihan Kelas Interaktif (KelasSelectorBar) */}
        <KelasSelectorBar
          questions={questions}
          selectedGrade={settings.activeGrade || 'Semua'}
          selectedTopic={settings.activeTopic}
          onSelectGrade={handleSelectGrade}
        />

        {/* 4. Interactive Topic Selector Bar */}
        <TopicSelectorBar
          questions={questions}
          selectedTopic={settings.activeTopic}
          onSelectTopic={handleSelectTopic}
          onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
          onOpenAIGenerator={() => setIsQuestionBankOpen(true)}
        />

        {/* 3. Main Canvas Tug of War Arena with Circular Countdown Timer */}
        <TugOfWarCanvas
          currentDistance={currentDistance}
          targetDistance={settings.targetDistance}
          pullingTeam={pullingTeam}
          pullIntensity={pullIntensity}
          shakeIntensity={shakeIntensity}
          timeRemaining={timeRemaining}
          totalTime={settings.questionDuration}
          isRoundActive={isRoundActive}
          gameStatus={isVictoryModalOpen ? 'game_over' : isRoundActive ? 'playing' : 'round_end'}
          winner={matchWinner}
        />

        {/* 4. Question & Split Answer Card */}
        <QuestionCard
          question={currentQuestion}
          gameMode={settings.mode}
          turnTeam={turnTeam}
          isRoundActive={isRoundActive}
          selectedRedAnswer={selectedRedAnswer}
          selectedBlueAnswer={selectedBlueAnswer}
          redLockedOut={redLockedOut}
          blueLockedOut={blueLockedOut}
          aiThinking={aiThinking}
          onAnswer={handleAnswer}
          onNextQuestion={handleNextQuestion}
          onOpenLightbox={(url, caption) => setLightboxData({ url, caption })}
          roundResultExplanation={currentQuestion.explanation}
          lastRoundWinner={roundWinner}
        />

        {/* Footer info */}
        <footer className="text-center py-2 text-xs text-slate-400">
          <span>Game Tarik Tambang Literasi &amp; Numerasi SMP • AI Generator Gemini &amp; HTML5 Canvas</span>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        questions={questions}
        onUpdateSettings={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Question Bank & AI Generator Modal */}
      <QuestionManagerModal
        isOpen={isQuestionBankOpen}
        questions={questions}
        activeTopic={settings.activeTopic}
        onUpdateQuestions={setQuestions}
        onPlayTopic={(topic) => handleSelectTopic(topic)}
        onClose={() => setIsQuestionBankOpen(false)}
        onOpenLightbox={(url, caption) => setLightboxData({ url, caption })}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        winner={matchWinner || 'draw'}
        redStats={redStats}
        blueStats={blueStats}
        currentDistance={currentDistance}
        activeTopic={settings.activeTopic}
        totalQuestionsAnswered={redStats.totalAttempts + blueStats.totalAttempts}
        onRematch={handleResetMatch}
        onOpenQuestionBank={() => {
          setIsVictoryModalOpen(false);
          setIsQuestionBankOpen(true);
        }}
      />

      {/* Image Zoom Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxData !== null}
        imageUrl={lightboxData?.url || null}
        caption={lightboxData?.caption}
        onClose={() => setLightboxData(null)}
      />
    </div>
  );
}
