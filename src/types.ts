export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'timed' | 'words';

export interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}

export interface GameState {
  isActive: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  typedText: string;
  targetText: string;
  difficulty: Difficulty;
  mode: GameMode;
  timeLimit: number; // in seconds
}
