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
  if (!board || board.length !== 5 || board[0].length !== 5) return false;
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
  onCellClick?: (rowIndex: number, colIndex: number, number: number | 'FREE') => void;
  disabled?: boolean;
  isSetup?: boolean;
  isConcealed?: boolean;
}

export function BingoBoard({ board, onCellClick, disabled = false, isSetup = false, isConcealed = false }: BingoBoardProps) {
  const isBoardEmpty = !board.length || !board[0].length || board.flat().every(cell => cell.number === 0);
  
  const displayBoard = isBoardEmpty && isSetup
    ? Array(5).fill(Array(5).fill({ number: 0, marked: false }))
    : board;


  return (
    <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary rounded-lg shadow-lg w-full max-w-md aspect-square">
      {displayBoard.flat().map((cell, index) => {
        const rowIndex = Math.floor(index / 5);
        const colIndex = index % 5;
        const showNumber = !isConcealed || cell.marked;

        return (
          <button
            key={index}
            onClick={() => onCellClick && cell.number !== 'FREE' && onCellClick(rowIndex, colIndex, cell.number)}
            disabled={disabled || cell.marked || (isSetup && cell.number !== 0)}
            className={cn(
              'flex items-center justify-center aspect-square rounded-md transition-all duration-300 transform',
              'text-lg md:text-2xl lg:text-3xl font-bold',
              cell.marked
                ? 'bg-accent text-accent-foreground scale-105 shadow-inner'
                : 'bg-card text-card-foreground',
              isSetup && cell.number === 0 && 'bg-card/50 hover:bg-primary/20',
              !isSetup && !cell.marked && !disabled && 'hover:bg-primary/20 hover:scale-105',
              disabled && !cell.marked && 'cursor-not-allowed',
              isSetup && isBoardEmpty && 'h-full', // Ensure empty cells take up space
            )}
          >
            {isSetup ? (cell.number !== 0 ? cell.number : <>&nbsp;</>) : (showNumber ? cell.number : '?')}
          </button>
        );
      })}
    </div>
  );
}
