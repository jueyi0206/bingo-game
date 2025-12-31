'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BingoBoard,
  Board,
  generateBingoBoard,
  checkForBingo,
} from '@/components/bingo-board';
import { GameControls } from '@/components/game-controls';
import { CalledNumbersDisplay } from '@/components/called-numbers-display';
import AiAnalysis from '@/components/ai-analysis';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { analyzeBingoPattern } from '@/ai/flows/analyze-bingo-pattern';
import Confetti from 'react-dom-confetti';

const BINGO_NUMBERS = Array.from({ length: 75 }, (_, i) => i + 1);

export default function Home() {
  const [board, setBoard] = useState<Board>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>(BINGO_NUMBERS);
  const [isBingo, setIsBingo] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const newBoard = generateBingoBoard();
    setBoard(newBoard);
    setCalledNumbers([]);
    setAvailableNumbers(BINGO_NUMBERS);
    setIsBingo(false);
    setAiAnalysis(null);
  }, []);

  const callNumber = useCallback(() => {
    if (availableNumbers.length === 0 || isBingo) return;

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];

    const newAvailableNumbers = availableNumbers.filter((n) => n !== newNumber);
    setAvailableNumbers(newAvailableNumbers);

    const newCalledNumbers = [...calledNumbers, newNumber];
    setCalledNumbers(newCalledNumbers);

    const newBoard = board.map((row) =>
      row.map((cell) => {
        if (cell.number === newNumber) {
          return { ...cell, marked: true };
        }
        return cell;
      })
    );

    setBoard(newBoard);

    if (checkForBingo(newBoard)) {
      setIsBingo(true);
    }
  }, [availableNumbers, calledNumbers, board, isBingo]);

  const handleAiAnalysis = useCallback(async () => {
    setIsAiSheetOpen(true);
    if (aiAnalysis) return;

    setIsAiLoading(true);
    try {
      const boardNumbers = board.map((row) =>
        row.map((cell) => (cell.number === 'FREE' ? 0 : cell.number))
      ) as number[][]; // We handle the 'FREE' case but need to cast for the AI function
      const result = await analyzeBingoPattern(boardNumbers);
      setAiAnalysis(result.patternAnalysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiAnalysis('Sorry, the AI analysis could not be completed at this time.');
    } finally {
      setIsAiLoading(false);
    }
  }, [board, aiAnalysis]);

  const currentNumber = useMemo(() => calledNumbers[calledNumbers.length - 1], [calledNumbers]);
  const bingoLetters = ['B', 'I', 'N', 'G', 'O'];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isClient && <Confetti active={isBingo} config={{ spread: 90, elementCount: 200 }} />}
      </div>
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left column: Game Info */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <header className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tight">
              Bingo Blitz
            </h1>
            <p className="text-muted-foreground mt-1">Mark your card and shout BINGO!</p>
          </header>
          <GameControls
            onNewGame={startNewGame}
            onCallNumber={callNumber}
            onAiAnalysis={handleAiAnalysis}
            isBingo={isBingo}
            canCallNumber={availableNumbers.length > 0}
          />
          <CalledNumbersDisplay
            currentNumber={currentNumber}
            calledNumbers={calledNumbers}
          />
        </div>

        {/* Right column: Bingo Board */}
        <div className="w-full lg:w-3/4 flex justify-center items-center">
          <div className="w-full max-w-2xl aspect-square flex flex-col items-center">
            <div className="grid grid-cols-5 w-full">
              {bingoLetters.map((letter) => (
                <div key={letter} className="flex items-center justify-center text-3xl md:text-5xl font-bold text-primary font-headline">
                  {letter}
                </div>
              ))}
            </div>
            <BingoBoard board={board} currentNumber={currentNumber} />
          </div>
        </div>
      </div>

      <AiAnalysis
        isOpen={isAiSheetOpen}
        onOpenChange={setIsAiSheetOpen}
        isLoading={isAiLoading}
        analysis={aiAnalysis}
      />

      <AlertDialog open={isBingo} onOpenChange={(open) => !open && startNewGame()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl text-center font-bold text-primary font-headline">
              BINGO!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Congratulations, you've won!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={startNewGame} className="w-full">
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
