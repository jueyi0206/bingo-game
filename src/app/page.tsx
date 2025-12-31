'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BingoBoard,
  Board,
  checkForBingo,
  generateRandomBoard,
} from '@/components/bingo-board';
import { GameControls } from '@/components/game-controls';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type GamePhase = 'setup' | 'playing' | 'gameOver';

export default function Home() {
  const [playerBoard, setPlayerBoard] = useState<Board>(
    Array(5).fill(Array(5).fill({ number: 0, marked: false }))
  );
  const [aiBoard, setAiBoard] = useState<Board>([]);
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set());
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [winner, setWinner] = useState<'Player' | 'AI' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [nextSetupNumber, setNextSetupNumber] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const emptyBoard = Array(5).fill(0).map(() => Array(5).fill({ number: 0, marked: false }));
    setPlayerBoard(emptyBoard);
    setAiBoard(generateRandomBoard());
    setCalledNumbers(new Set());
    setGamePhase('setup');
    setWinner(null);
    setIsPlayerTurn(true);
    setNextSetupNumber(1);
  }, []);
  
  const handleSetupCellClick = (rowIndex: number, colIndex: number) => {
    if (nextSetupNumber > 25) return;

    const newBoard = playerBoard.map(row => [...row]);
    
    // If the cell is already filled, do nothing.
    if (newBoard[rowIndex][colIndex].number !== 0) {
      return;
    }

    newBoard[rowIndex][colIndex] = { number: nextSetupNumber, marked: false };
    setPlayerBoard(newBoard);
    setNextSetupNumber(prev => prev + 1);
  };

  const startGame = () => {
    if (nextSetupNumber <= 25) {
      toast({
        variant: "destructive",
        title: "棋盤尚未完成",
        description: "請點擊所有方格以填入 1 到 25 的數字。",
      });
      return;
    }
    setGamePhase('playing');
  };

  const handlePlayerMove = (number: number | 'FREE') => {
    if (gamePhase !== 'playing' || !isPlayerTurn || typeof number !== 'number' || calledNumbers.has(number)) {
      return;
    }

    const newCalledNumbers = new Set(calledNumbers).add(number);
    setCalledNumbers(newCalledNumbers);
    updateBoards(newCalledNumbers);

    const playerWins = checkForBingo(updateBoardMarks(playerBoard, newCalledNumbers));
    if (playerWins) {
      setWinner('Player');
      setGamePhase('gameOver');
      return;
    }
    
    setIsPlayerTurn(false);
  };

  const updateBoardMarks = (board: Board, currentCalled: Set<number>): Board => {
    return board.map(row => 
      row.map(cell => 
        cell.number !== 'FREE' && currentCalled.has(cell.number) 
          ? { ...cell, marked: true } 
          : cell
      )
    );
  };
  
  const updateBoards = (currentCalled: Set<number>) => {
    setPlayerBoard(prev => updateBoardMarks(prev, currentCalled));
    setAiBoard(prev => updateBoardMarks(prev, currentCalled));
  }
  
  useEffect(() => {
    if (gamePhase === 'playing' && !isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        aiMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gamePhase, winner]);

  const aiMove = () => {
    const availableNumbers = [];
    for (let i = 1; i <= 25; i++) {
      if (!calledNumbers.has(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const chosenNumber = availableNumbers[randomIndex];
    
    const newCalledNumbers = new Set(calledNumbers).add(chosenNumber);
    setCalledNumbers(newCalledNumbers);
    updateBoards(newCalledNumbers);
    
    const aiWins = checkForBingo(updateBoardMarks(aiBoard, newCalledNumbers));
    const playerWins = checkForBingo(updateBoardMarks(playerBoard, newCalledNumbers));

    if (aiWins) {
      setWinner('AI');
      setGamePhase('gameOver');
    } else if (playerWins) {
      setWinner('Player');
      setGamePhase('gameOver');
    } else {
      setIsPlayerTurn(true);
    }
  };
  
  const renderSetupBoard = () => {
    return (
      <div className="grid grid-cols-5 gap-1 md:gap-2 p-1 md:p-2 bg-primary rounded-lg shadow-lg w-full max-w-md aspect-square">
        {playerBoard.flat().map((cell, index) => {
          const rowIndex = Math.floor(index / 5);
          const colIndex = index % 5;
          return (
            <button
              key={index}
              onClick={() => handleSetupCellClick(rowIndex, colIndex)}
              className={cn(
                'flex items-center justify-center aspect-square rounded-md transition-colors duration-200',
                'text-lg md:text-2xl lg:text-3xl font-bold',
                cell.number === 0 ? 'bg-card/50 hover:bg-primary/20' : 'bg-card text-card-foreground'
              )}
            >
              {cell.number !== 0 ? cell.number : ''}
            </button>
          )
        })}
      </div>
    );
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-background text-foreground">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isClient && <Confetti active={winner === 'Player'} config={{ spread: 90, elementCount: 200 }} />}
      </div>

      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tight">
          AI 賓果對戰
        </h1>
        <p className="text-muted-foreground mt-2">
          {gamePhase === 'setup' && (nextSetupNumber <= 25 ? `請點擊格子填入數字 ${nextSetupNumber}`: '棋盤已完成！')}
          {gamePhase === 'playing' && (isPlayerTurn ? '換你出牌！' : 'AI 思考中...')}
          {gamePhase === 'gameOver' && (winner ? `恭喜 ${winner} 獲勝！` : '遊戲結束！')}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-6xl">
        {/* Player Board */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">你的棋盤</h2>
          {gamePhase === 'setup' ? (
            renderSetupBoard()
          ) : (
            <BingoBoard board={playerBoard} onCellClick={handlePlayerMove} disabled={!isPlayerTurn} />
          )}
        </div>

        {/* AI Board */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-accent">AI 的棋盤</h2>
          <BingoBoard board={aiBoard} disabled={true} />
        </div>
      </div>

      <GameControls
        gamePhase={gamePhase}
        onStartGame={startGame}
        onNewGame={startNewGame}
      />

      <AlertDialog open={gamePhase === 'gameOver'} onOpenChange={(open) => !open && startNewGame()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl text-center font-bold text-primary font-headline">
              {winner === 'Player' ? 'BINGO! 你贏了！' : 'AI 獲勝！'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
             {winner === 'Player' ? '恭喜你！要再來一局嗎？' : '再接再厲！'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={startNewGame} className="w-full">
              玩新的一局
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
