
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState } from './GameManager';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Play } from 'lucide-react';

export default function HelixGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<GameManager | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START');

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new GameManager({
      container: containerRef.current,
      onScoreUpdate: (s) => setScore(s),
      onGameStateChange: (state) => setGameState(state),
    });

    managerRef.current = manager;

    const handleInput = (e: MouseEvent | TouchEvent) => {
        if (gameState !== 'PLAYING') return;
        
        let movementX = 0;
        if (e instanceof MouseEvent) {
            if (e.buttons !== 1) return;
            movementX = e.movementX;
        } else if (e instanceof TouchEvent) {
            // Simplified touch handling - ideally need to track last touch pos
            const touch = e.touches[0];
            // Since movementX isn't directly on touch, we'd normally track prevX
            // For now, let's assume movement is handled by specific listeners
        }
        
        manager.rotateTower(movementX);
    };

    // Advanced drag logic for smooth rotation
    let isDragging = false;
    let lastX = 0;

    const onStart = (x: number) => {
        isDragging = true;
        lastX = x;
    };

    const onMove = (x: number) => {
        if (!isDragging) return;
        const delta = x - lastX;
        manager.rotateTower(delta * 5); // Multiplier for sensitivity
        lastX = x;
    };

    const onEnd = () => {
        isDragging = false;
    };

    const mouseDown = (e: MouseEvent) => onStart(e.clientX);
    const mouseMove = (e: MouseEvent) => onMove(e.clientX);
    const mouseUp = () => onEnd();

    const touchStart = (e: TouchEvent) => onStart(e.touches[0].clientX);
    const touchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const touchEnd = () => onEnd();

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchstart', touchStart);
    window.addEventListener('touchmove', touchMove);
    window.addEventListener('touchend', touchEnd);

    return () => {
      manager.dispose();
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
    };
  }, [gameState]);

  const handleStart = () => {
    if (managerRef.current) {
        managerRef.current.startGame();
    }
  };

  return (
    <div className="game-container">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 ui-overlay flex flex-col items-center justify-between p-8">
        {/* HUD */}
        <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">Score</div>
            <div className="text-6xl font-extrabold text-accent drop-shadow-lg">{score}</div>
        </div>

        {/* Start Screen */}
        {gameState === 'START' && (
          <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
            <h1 className="text-5xl font-extrabold text-primary tracking-tighter">HELIX SMASH</h1>
            <p className="text-muted-foreground text-center max-w-xs">Rotate the tower to guide the ball through the gaps. Avoid the red zones!</p>
            <Button size="lg" onClick={handleStart} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground group shadow-xl hover:scale-105 transition-all">
                <Play className="mr-2 fill-current" /> PLAY NOW
            </Button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-destructive/20 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="bg-destructive/10 p-4 rounded-full">
                <RefreshCcw className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">GAME OVER</h2>
            <div className="text-center">
                <p className="text-muted-foreground">Final Score</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={handleStart} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                TRY AGAIN
            </Button>
          </div>
        )}

        {/* Win Screen */}
        {gameState === 'WON' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-primary/20 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="bg-primary/20 p-4 rounded-full">
                <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">YOU SMASHED IT!</h2>
            <p className="text-muted-foreground">You reached the bottom!</p>
            <div className="text-center">
                <p className="text-muted-foreground">Final Score</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={handleStart} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                PLAY AGAIN
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest pb-4">
            Drag to Rotate Tower
        </div>
      </div>
    </div>
  );
}
