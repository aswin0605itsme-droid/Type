import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, 
  Timer, 
  RotateCcw, 
  BarChart3, 
  Settings2, 
  Trophy,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Difficulty, GameMode, GameStats, GameState } from '@/src/types';
import { TEXT_SAMPLES, TIME_LIMITS } from '@/src/constants';
import { cn } from '@/lib/utils';

export default function TypingGame() {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    isFinished: false,
    startTime: null,
    endTime: null,
    typedText: '',
    targetText: TEXT_SAMPLES.easy[0],
    difficulty: 'easy',
    mode: 'timed',
    timeLimit: 30,
  });

  const [timeLeft, setTimeLeft] = useState(30);
  const [stats, setStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    timeElapsed: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  const initGame = useCallback((difficulty: Difficulty = gameState.difficulty, limit: number = gameState.timeLimit) => {
    const samples = TEXT_SAMPLES[difficulty];
    const randomText = samples[Math.floor(Math.random() * samples.length)];
    
    setGameState(prev => ({
      ...prev,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      typedText: '',
      targetText: randomText,
      difficulty,
      timeLimit: limit,
    }));
    setTimeLeft(limit);
    setStats({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      timeElapsed: 0,
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, [gameState.difficulty, gameState.timeLimit]);

  // Start game
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
    }));
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Finish game
  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(prev => ({
      ...prev,
      isActive: false,
      isFinished: true,
      endTime: Date.now(),
    }));
  }, []);

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.isFinished) return;
    
    const value = e.target.value;
    if (!gameState.isActive && value.length > 0) {
      startGame();
    }

    setGameState(prev => ({
      ...prev,
      typedText: value,
    }));

    // Calculate stats
    const target = gameState.targetText;
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < value.length; i++) {
      if (value[i] === target[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const total = value.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
    
    // WPM calculation: (correct chars / 5) / (minutes elapsed)
    const timeElapsed = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 : 0;
    const minutes = timeElapsed / 60;
    const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;

    setStats({
      wpm,
      accuracy,
      correctChars: correct,
      incorrectChars: incorrect,
      totalChars: total,
      timeElapsed,
    });

    // Check if finished
    if (value.length === target.length) {
      finishGame();
    }
  };

  // Auto-focus input
  useEffect(() => {
    if (!gameState.isFinished) {
      inputRef.current?.focus();
    }
  }, [gameState.isFinished, gameState.targetText]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderChar = (char: string, index: number) => {
    const typedChar = gameState.typedText[index];
    let status = 'pending';
    
    if (typedChar !== undefined) {
      status = typedChar === char ? 'correct' : 'incorrect';
    }

    return (
      <span
        key={index}
        className={cn(
          "transition-colors duration-150",
          status === 'pending' && "text-[#D1D1D1]",
          status === 'correct' && "text-[#2F2F2F]",
          status === 'incorrect' && "text-[#FF6B6B] underline bg-[#FF6B6B]/10",
          index === gameState.typedText.length && gameState.isActive && "relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-1 after:h-[1.2em] after:bg-[#4ECDC4] after:animate-pulse"
        )}
      >
        {char}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFAEC] text-[#2F2F2F] p-6 md:p-12 font-sans selection:bg-[#FFE66D]">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg" />
            <h1 className="text-3xl font-black tracking-tighter text-[#FF6B6B]">TYPEBURST</h1>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <StatPill label="Speed" value={`${stats.wpm} WPM`} />
            <StatPill label="Accuracy" value={`${stats.accuracy}%`} />
            <StatPill 
              label="Time Left" 
              value={`${timeLeft}s`} 
              className="bg-[#4ECDC4] text-white border-[#2F2F2F]"
              labelClassName="text-white/80"
            />
          </div>
        </header>

        {/* Main Game Area */}
        <main className="grid gap-10">
          
          {/* Typing Terminal */}
          <div className="relative">
            <div className="absolute -top-5 left-10 z-10 bg-[#FFE66D] px-5 py-2 rounded-xl font-black border-2 border-[#2F2F2F] text-sm transform -rotate-2 shadow-[4px_4px_0_#2F2F2F] uppercase tracking-wider">
              STAGE: {gameState.difficulty.toUpperCase()} // {gameState.mode.toUpperCase()}
            </div>
            
            <Card className="border-4 border-[#2F2F2F] bg-white rounded-[40px] shadow-[12px_12px_0_#4ECDC4] overflow-hidden min-h-[400px] flex flex-col justify-center">
              <CardContent className="p-12 md:p-20 relative">
                <AnimatePresence mode="wait">
                  {gameState.isFinished ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center text-center space-y-8"
                    >
                      <div className="w-24 h-24 rounded-3xl bg-[#FFE66D] border-4 border-[#2F2F2F] flex items-center justify-center shadow-[6px_6px_0_#2F2F2F]">
                        <Trophy className="w-12 h-12 text-[#2F2F2F]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black mb-3">TRAINING COMPLETE!</h2>
                        <p className="text-lg font-medium text-[#888]">Your neural synchronization metrics are exceptional.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
                        <ResultBox label="WPM" value={stats.wpm} color="#FF6B6B" />
                        <ResultBox label="ACCURACY" value={`${stats.accuracy}%`} color="#4ECDC4" />
                        <ResultBox label="ERRORS" value={stats.incorrectChars} color="#2F2F2F" />
                      </div>

                      <Button 
                        size="lg" 
                        onClick={() => initGame()} 
                        className="h-16 px-10 rounded-2xl bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-black text-xl border-4 border-[#2F2F2F] shadow-[6px_6px_0_#2F2F2F] active:translate-y-1 active:shadow-[2px_2px_0_#2F2F2F] transition-all"
                      >
                        RESTART TRAINER
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      <div className="text-3xl md:text-4xl font-medium leading-relaxed tracking-normal text-justify select-none">
                        {gameState.targetText.split('').map((char, i) => renderChar(char, i))}
                      </div>
                      
                      <input
                        ref={inputRef}
                        type="text"
                        value={gameState.typedText}
                        onChange={handleTyping}
                        className="absolute inset-0 opacity-0 cursor-default"
                        autoFocus
                      />
                      
                      {!gameState.isActive && gameState.typedText.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="bg-[#FFE66D] px-6 py-3 rounded-xl border-2 border-[#2F2F2F] font-black text-sm uppercase shadow-[4px_4px_0_#2F2F2F]"
                          >
                            START TYPING TO BEGIN
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Keyboard Visualizer (Simplified) */}
          <div className="flex flex-col items-center gap-3 opacity-80">
            <div className="flex gap-2">
              {['Q','W','E','R','T','Y','U','I','O','P'].map(k => <Key key={k} char={k} active={gameState.typedText.slice(-1).toUpperCase() === k} />)}
            </div>
            <div className="flex gap-2">
              {['A','S','D','F','G','H','J','K','L'].map(k => <Key key={k} char={k} active={gameState.typedText.slice(-1).toUpperCase() === k} />)}
            </div>
            <div className="flex gap-2">
              {['Z','X','C','V','B','N','M'].map(k => <Key key={k} char={k} active={gameState.typedText.slice(-1).toUpperCase() === k} />)}
            </div>
            <div className="w-[300px] h-12 bg-white border-2 border-[#2F2F2F] rounded-xl shadow-[0_4px_0_#2F2F2F]" />
          </div>

          {/* Settings & Controls */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Difficulty Level
              </h3>
              <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <Button
                    key={d}
                    variant="outline"
                    className={cn(
                      "flex-1 h-12 rounded-xl border-2 border-[#2F2F2F] font-black text-xs uppercase transition-all shadow-[4px_4px_0_#2F2F2F] active:translate-y-1 active:shadow-[1px_1px_0_#2F2F2F]",
                      gameState.difficulty === d ? "bg-[#FFE66D]" : "bg-white"
                    )}
                    onClick={() => initGame(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Time Limit
              </h3>
              <div className="flex gap-3">
                {TIME_LIMITS.map(limit => (
                  <Button
                    key={limit}
                    variant="outline"
                    className={cn(
                      "flex-1 h-12 rounded-xl border-2 border-[#2F2F2F] font-black text-xs uppercase transition-all shadow-[4px_4px_0_#2F2F2F] active:translate-y-1 active:shadow-[1px_1px_0_#2F2F2F]",
                      gameState.timeLimit === limit ? "bg-[#4ECDC4] text-white" : "bg-white"
                    )}
                    onClick={() => initGame(gameState.difficulty, limit)}
                    disabled={gameState.isActive}
                  >
                    {limit}S
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center font-medium text-[#888] text-sm">
            Pro Tip: Keep your <span className="bg-[#FFE66D] px-2 py-0.5 rounded-md text-[#2F2F2F] font-bold">wrists lifted</span> for maximum speed and ergonomic safety.
          </div>

        </main>

        <footer className="text-center pt-10 border-t-2 border-[#2F2F2F]/10">
          <p className="text-xs font-black text-[#888] uppercase tracking-[0.3em]">
            TYPEBURST // ACCURACY & SPEED TRAINER // v2.0.0
          </p>
        </footer>
      </div>
    </div>
  );
}

interface StatPillProps {
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
}

function StatPill({ label, value, className, labelClassName }: StatPillProps) {
  return (
    <div className={cn("bg-white px-8 py-3 rounded-full border-2 border-[#2F2F2F] shadow-[0_4px_0_rgba(0,0,0,0.05)] flex flex-col items-center min-w-[140px]", className)}>
      <span className={cn("text-[10px] uppercase font-black tracking-widest text-[#888]", labelClassName)}>{label}</span>
      <span className="text-2xl font-black">{value}</span>
    </div>
  );
}

interface ResultBoxProps {
  label: string;
  value: string | number;
  color: string;
}

function ResultBox({ label, value, color }: ResultBoxProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border-4 border-[#2F2F2F] shadow-[6px_6px_0_#2F2F2F]">
      <p className="text-[10px] font-black text-[#888] mb-1">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
    </div>
  );
}

interface KeyProps {
  char: string;
  active?: boolean;
  key?: string | number;
}

function Key({ char, active }: KeyProps) {
  return (
    <div className={cn(
      "w-11 h-11 bg-white border-2 border-[#2F2F2F] rounded-xl flex items-center justify-center font-black text-sm shadow-[0_4px_0_#2F2F2F] transition-all",
      active && "bg-[#FFE66D] translate-y-1 shadow-[0_1px_0_#2F2F2F]"
    )}>
      {char}
    </div>
  );
}

