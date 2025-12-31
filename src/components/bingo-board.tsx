'use client';

import { cn } from '@/lib/utils';

export type Cell = {
  number: number | 'FREE';
  marked: boolean;
};

export type Board = Cell[][];

export type BingoLine = {
    type: 'row' | 'col' | 'diag1' | 'diag2';
    index: number;
}

export function findBingoLines(board: Board): BingoLine[] {
    const lines: BingoLine[] = [];
    if (!board || board.length !== 5) return lines;

    // Check rows
    for (let i = 0; i < 5; i++) {
        if (board[i].every(cell => cell.marked)) {
            lines.push({ type: 'row', index: i });
        }
    }
    // Check columns
    for (let i = 0; i < 5; i++) {
        if (board.every(row => row[i].marked)) {
            lines.push({ type: 'col', index: i });
        }
    }
    // Check diagonals
    if (board.every((row, i) => row[i].marked)) {
        lines.push({ type: 'diag1', index: 0 });
    }
    if (board.every((row, i) => row[4 - i].marked)) {
        lines.push({ type: 'diag2', index: 0 });
    }

    return lines;
}

export const checkForBingo = (board: Board): boolean => {
    return findBingoLines(board).length > 0;
};


interface BingoBoardProps {
  board: Board;
  onCellClick?: (rowIndex: number, colIndex: number, number: number | 'FREE') => void;
  disabled?: boolean;
  isSetup?: boolean;
  isConcealed?: boolean;
  bingoLines?: BingoLine[];
}

export function BingoBoard({ board, onCellClick, disabled = false, isSetup = false, isConcealed = false, bingoLines = [] }: BingoBoardProps) {
  const isBoardEmpty = !board.length || !board[0].length || board.flat().every(cell => cell.number === 0);
  
  const displayBoard = isBoardEmpty && isSetup
    ? Array(5).fill(Array(5).fill({ number: 0, marked: false }))
    : board;

  const getLineStyles = (line: BingoLine) => {
    const styles: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        height: '8px',
        borderRadius: '4px',
    };
    const offset = '10%'; 
    const length = '80%'; 

    switch (line.type) {
        case 'row':
            return { ...styles, top: `calc(${line.index * 20}% + 10% - 4px)`, left: offset, width: length };
        case 'col':
            return { ...styles, left: `calc(${line.index * 20}% + 10% - 4px)`, top: offset, height: length, width: '8px' };
        case 'diag1':
            return { ...styles, top: '50%', left: '0', width: '100%', transform: 'translateY(-50%) rotate(45deg)' };
        case 'diag2':
            return { ...styles, top: '50%', left: '0', width: '100%', transform: 'translateY(-50%) rotate(-45deg)' };
        default:
            return {};
    }
  };


  return (
    <div className="relative w-full max-w-md aspect-square">
        <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary rounded-lg shadow-lg w-full h-full">
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
                    isSetup && isBoardEmpty && 'h-full w-full',
                    )}
                >
                    {isSetup ? (cell.number !== 0 ? cell.number : <div className="w-full h-full">&nbsp;</div>) : (showNumber ? cell.number : '?')}
                </button>
                );
            })}
        </div>
         {bingoLines.map((line, i) => (
            <div key={i} style={getLineStyles(line)} />
        ))}
    </div>
  );
}
