'use client';

import { cn } from '@/lib/utils';

export type Cell = {
  number: number | 'FREE';
  marked: boolean;
};

export type Board = Cell[][];

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateRandomBoard = (): Board => {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const shuffledNumbers = shuffle(numbers);
  const board: Board = Array.from({ length: 5 }, () => []);

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      board[i][j] = { number: shuffledNumbers[i * 5 + j], marked: false };
    }
  }
  return board;
};


export const checkForBingo = (board: Board): boolean => {
  if (board.length === 0 || board[0].length === 0) return false;
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
  onCellClick?: (number: number | 'FREE') => void;
  disabled?: boolean;
}

export function BingoBoard({ board, onCellClick, disabled = false }: BingoBoardProps) {
  if (!board.length || !board[0].length || board[0][0].number === 0) {
    return (
      <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary/50 rounded-lg shadow-inner w-full aspect-square">
        {Array.from({ length: 25 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-center aspect-square rounded-md bg-card/50"
          >
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary rounded-lg shadow-lg w-full max-w-md aspect-square">
      {board.flat().map((cell, index) => (
        <button
          key={index}
          onClick={() => onCellClick && cell.number !== 'FREE' && onCellClick(cell.number)}
          disabled={disabled || cell.marked}
          className={cn(
            'flex items-center justify-center aspect-square rounded-md transition-all duration-300 transform',
            'text-lg md:text-2xl lg:text-3xl font-bold',
            cell.marked
              ? 'bg-accent text-accent-foreground scale-105 shadow-inner'
              : 'bg-card text-card-foreground',
            !cell.marked && !disabled && 'hover:bg-primary/20',
            disabled && 'cursor-not-allowed',
            cell.marked && disabled && 'cursor-not-allowed'
          )}
        >
          {cell.number}
        </button>
      ))}
    </div>
  );
}