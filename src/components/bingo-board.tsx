'use client';

import { cn } from '@/lib/utils';

export type Cell = {
  number: number | 'FREE';
  marked: boolean;
};

export type Board = Cell[][];

const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateBingoBoard = (): Board => {
  const board: Board = Array.from({ length: 5 }, () => []);
  const columns = ['B', 'I', 'N', 'G', 'O'];

  columns.forEach((col, colIndex) => {
    const { min, max } = BINGO_RANGES[col as keyof typeof BINGO_RANGES];
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const shuffledNumbers = shuffle(numbers);

    for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
      if (colIndex === 2 && rowIndex === 2) {
        board[rowIndex][colIndex] = { number: 'FREE', marked: true };
      } else {
        board[rowIndex][colIndex] = { number: shuffledNumbers.pop(), marked: false };
      }
    }
  });

  return board;
};

export const checkForBingo = (board: Board): boolean => {
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (board[i].every((cell) => cell.marked)) return true;
  }
  // Check columns
  for (let i = 0; i < 5; i++) {
    if (board.every((row) => row[i].marked)) return true;
  }
  // Check diagonals
  if (board.every((row, i) => row[i].marked)) return true;
  if (board.every((row, i) => row[4 - i].marked)) return true;

  return false;
};

interface BingoBoardProps {
  board: Board;
  currentNumber: number | undefined;
}

export function BingoBoard({ board, currentNumber }: BingoBoardProps) {
  if (!board.length) {
    return null;
  }
  return (
    <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary rounded-lg shadow-lg w-full aspect-square">
      {board.flat().map((cell, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center justify-center aspect-square rounded-md transition-all duration-300 transform',
            'text-lg md:text-2xl lg:text-3xl font-bold',
            cell.marked
              ? 'bg-accent text-accent-foreground scale-105 shadow-inner'
              : 'bg-card text-card-foreground',
            cell.number === currentNumber && 'animate-pop-in'
          )}
        >
          {cell.number === 'FREE' ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 2L9.75 8.5H2.5L7.5 13.5L5.25 20L12 15.5L18.75 20L16.5 13.5L21.5 8.5H14.25L12 2Z"/></svg>
          ) : (
            cell.number
          )}
        </div>
      ))}
    </div>
  );
}
