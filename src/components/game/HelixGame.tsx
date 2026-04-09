'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState, Difficulty } from './GameManager';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Play, Zap, Shield, Volume2, VolumeX, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HelixGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<GameManager | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!containerRef.current || managerRef.current) return;

    const manager = new GameManager({
      container: containerRef.current,
      onScoreUpdate: (s) => setScore(s),
      onGameStateChange: (state) => setGameState(state),
    });

    managerRef.current = manager;

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    let isDragging = false;
    let lastX = 0;
    const keysPressed = new Set<string>();

    const onStart = (x: number) => {
        isDragging = true;
        lastX = x;
    };

    const onMove = (x: number, e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const delta = x - lastX;
        manager.rotateTower(delta * 2.5); 
        lastX = x;
    };

    const onEnd = () => { isDragging = false; };
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.delete(e.key);

    let rafId: number;
    const updateKeyboard = () => {
      if (gameState === 'PLAYING') {
        const rotationSpeed = 15;
        if (keysPressed.has('ArrowLeft') || keysPressed.has('a') || keysPressed.has('A')) {
          manager.rotateTower(rotationSpeed);
        }
        if (keysPressed.has('ArrowRight') || keysPressed.has('d') || keysPressed.has('D')) {
          manager.rotateTower(-rotationSpeed);
        }
      }
      rafId = requestAnimationFrame(updateKeyboard);
    };
    rafId = requestAnimationFrame(updateKeyboard);

    const mouseDown = (e: MouseEvent) => onStart(e.clientX);
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e);
    const mouseUp = () => onEnd();

    const touchStart = (e: TouchEvent) => onStart(e.touches[0].clientX);
    const touchMove = (e: TouchEvent) => onMove(e.touches[0].clientX, e);
    const touchEnd = () => onEnd();

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove, { passive: false });
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchstart', touchStart, { passive: false });
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, [gameState]);

  const handleStart = (diff: Difficulty = difficulty) => {
    if (managerRef.current) {
        managerRef.current.startGame(diff);
    }
  };

  const toggleMute = () => {
    if (managerRef.current) {
      const muted = managerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div className="game-container touch-none select-none">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 ui-overlay flex flex-col items-center justify-between p-8 pointer-events-none">
        
        {/* HUD */}
        <div className="w-full flex justify-between items-start pointer-events-auto">
            <div className="flex flex-col items-start gap-1">
                <div className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Score</div>
                <div className="text-4xl font-extrabold text-accent drop-shadow-lg">{score}</div>
            </div>
            
            <Button variant="outline" size="icon" onClick={toggleMute} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
        </div>

        {/* Start Screen */}
        {gameState === 'START' && (
          <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500 pointer-events-auto max-w-sm w-full">
            <h1 className="text-4xl font-extrabold text-primary tracking-tighter text-center">HELIX SMASH</h1>
            
            <div className="flex flex-col gap-3 w-full">
                <button 
                    onClick={() => setDifficulty('EASY')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                        difficulty === 'EASY' ? "bg-primary/20 border-primary shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        <div className="text-left">
                            <div className="font-bold">EASY</div>
                            <div className="text-xs opacity-70">Shorter tower, more gaps</div>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => setDifficulty('HARD')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                        difficulty === 'HARD' ? "bg-orange-500/20 border-orange-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                            <div className="font-bold">HARD</div>
                            <div className="text-xs opacity-70">Tall tower, high danger</div>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => setDifficulty('INSANE')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                        difficulty === 'INSANE' ? "bg-red-500/20 border-red-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Skull className="w-6 h-6 text-red-500" />
                        <div className="text-left">
                            <div className="font-bold">INSANE</div>
                            <div className="text-xs opacity-70">50 levels, 1 gap, extreme risk</div>
                        </div>
                    </div>
                </button>
            </div>

            <Button size="lg" onClick={() => handleStart()} className="w-full h-16 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground group shadow-xl hover:scale-105 transition-all">
                <Play className="mr-2 fill-current" /> PLAY
            </Button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-destructive/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="bg-destructive/10 p-4 rounded-full">
                <RefreshCcw className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">GAME OVER</h2>
            <div className="text-center">
                <p className="text-muted-foreground">Final Score</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={() => handleStart()} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                TRY AGAIN
            </Button>
            <Button variant="ghost" onClick={() => setGameState('START')} className="text-muted-foreground">
                BACK TO MENU
            </Button>
          </div>
        )}

        {/* Win Screen */}
        {gameState === 'WON' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="bg-primary/20 p-4 rounded-full">
                <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">YOU SMASHED IT!</h2>
            <p className="text-muted-foreground">Level completed on {difficulty} mode!</p>
            <div className="text-center">
                <p className="text-muted-foreground">Final Score</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={() => handleStart()} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                PLAY AGAIN
            </Button>
            <Button variant="ghost" onClick={() => setGameState('START')} className="text-muted-foreground">
                BACK TO MENU
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest pb-4">
            Drag or use Arrows to Rotate
        </div>
      </div>
    </div>
  );
}
