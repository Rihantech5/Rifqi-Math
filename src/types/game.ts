export type Subject = 'Literasi' | 'Numerasi';

export type GradeLevel = 'Kelas 7' | 'Kelas 8' | 'Kelas 9';

export type GameMode = 'pvp_buzzer' | 'vs_ai' | 'turn_based';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type Team = 'red' | 'blue';

export interface Question {
  id: string;
  topic: string;
  subject: Subject;
  grade: GradeLevel;
  questionText: string;
  options: string[]; // 4 options: [A, B, C, D]
  correctIndex: number; // 0, 1, 2, or 3
  explanation: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface TeamStats {
  score: number; // number of points / pulls won
  pullDistance: number; // distance shifted in meters
  correctAnswers: number;
  totalAttempts: number;
}

export interface GameSettings {
  mode: GameMode;
  questionDuration: number; // seconds per question, e.g. 20
  targetDistance: number; // victory distance threshold, e.g. 3.0 meters
  pullForcePerCorrect: number; // meters gained per correct answer, e.g. 1.0m
  botDifficulty: BotDifficulty;
  soundEnabled: boolean;
  activeTopic: string; // 'Semua' or specific topic
  activeGrade: string; // 'Semua' or 'Kelas 7' | 'Kelas 8' | 'Kelas 9'
  activeSubject: string; // 'Semua' or 'Literasi' | 'Numerasi'
}

export interface RoundResult {
  winner: Team | 'draw';
  redAnswered: boolean;
  blueAnswered: boolean;
  explanation: string;
  pullDelta: number;
}
