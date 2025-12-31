'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BingoBoard,
  Board,
  checkForBingo,
  findBingoLines,
  BingoLine,
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { playSound } from '@/lib/sounds';

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
  const [playerBingoLines, setPlayerBingoLines] = useState<BingoLine[]>([]);
  const [aiBingoLines, setAiBingoLines] = useState<BingoLine[]>([]);

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
    setPlayerBingoLines([]);
    setAiBingoLines([]);
  }, []);

  const handleSetupCellClick = (rowIndex: number, colIndex: number) => {
    if (nextSetupNumber > 25) return;

    const newBoard = playerBoard.map(row => [...row]);
    
    if (newBoard[rowIndex][colIndex].number !== 0) {
      return;
    }

    newBoard[rowIndex][colIndex] = { number: nextSetupNumber, marked: false };
    setPlayerBoard(newBoard);
    setNextSetupNumber(prev => prev + 1);
  };
  
  const handleUndoSetup = () => {
    if (nextSetupNumber <= 1) return;
  
    const numberToUndo = nextSetupNumber - 1;
    let found = false;
    const newBoard = playerBoard.map(row => row.map(cell => {
      if (cell.number === numberToUndo) {
        found = true;
        return { number: 0, marked: false };
      }
      return cell;
    }));
  
    if (found) {
      setPlayerBoard(newBoard);
      setNextSetupNumber(prev => prev - 1);
    }
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

  const updateGameStatus = (playerB: Board, aiB: Board) => {
    const playerLines = findBingoLines(playerB);
    const aiLines = findBingoLines(aiB);

    if (playerLines.length > playerBingoLines.length) {
      playSound('bell');
    }
    if (aiLines.length > aiBingoLines.length) {
       playSound('bell');
    }

    setPlayerBingoLines(playerLines);
    setAiBingoLines(aiLines);
    
    if (playerLines.length >= 3) {
      setWinner('Player');
      setGamePhase('gameOver');
      playSound('victory');
      return true;
    }
    if (aiLines.length >= 3) {
      setWinner('AI');
      setGamePhase('gameOver');
      playSound('defeat');
      return true;
    }
    return false;
  };

  const handlePlayerMove = (rowIndex: number, colIndex: number) => {
     if (gamePhase !== 'playing' || !isPlayerTurn) return;

    const number = playerBoard[rowIndex][colIndex].number;

    if (typeof number !== 'number' || calledNumbers.has(number)) {
      return;
    }

    const newCalledNumbers = new Set(calledNumbers).add(number);
    setCalledNumbers(newCalledNumbers);

    const updatedPlayerBoard = updateBoardMarks(playerBoard, newCalledNumbers);
    const updatedAiBoard = updateBoardMarks(aiBoard, newCalledNumbers);
    setPlayerBoard(updatedPlayerBoard);
    setAiBoard(updatedAiBoard);

    if (!updateGameStatus(updatedPlayerBoard, updatedAiBoard)) {
       setIsPlayerTurn(false);
    }
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

    // Simple AI: pick a random available number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const chosenNumber = availableNumbers[randomIndex];
    
    const newCalledNumbers = new Set(calledNumbers).add(chosenNumber);
    setCalledNumbers(newCalledNumbers);
    
    const updatedPlayerBoard = updateBoardMarks(playerBoard, newCalledNumbers);
    const updatedAiBoard = updateBoardMarks(aiBoard, newCalledNumbers);
    setPlayerBoard(updatedPlayerBoard);
    setAiBoard(updatedAiBoard);

    if (!updateGameStatus(updatedPlayerBoard, updatedAiBoard)) {
        setIsPlayerTurn(true);
    }
  };

  const generateRandomBoard = (): Board => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray(numbers);
    const board: Board = Array.from({ length: 5 }, () => []);
  
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        board[i][j] = { number: shuffledNumbers[i * 5 + j], marked: false };
      }
    }
    return board;
  };

  const shuffleArray = (array: any[]) => {
    // Make a copy to avoid modifying the original array
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-background text-foreground">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isClient && <Confetti active={winner === 'Player'} config={{ spread: 90, elementCount: 200 }} />}
      </div>

      <header className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tight">
          AI 賓果對戰
        </h1>
        <p className="text-muted-foreground mt-2">
          {gamePhase === 'setup' && (nextSetupNumber <= 25 ? `請點擊格子填入數字 ${nextSetupNumber}`: '棋盤已完成！')}
          {gamePhase === 'playing' && (isPlayerTurn ? '換你出牌！' : 'AI 思考中...')}
          {gamePhase === 'gameOver' && (winner ? `恭喜 ${winner} 獲勝！` : '遊戲結束！')}
        </p>
      </header>
      
      <Card className="my-4 max-w-4xl w-full bg-card/50">
        <CardHeader>
            <CardTitle className="text-lg text-center">遊戲規則</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pt-0">
          <ol className="list-decimal list-inside space-y-1">
            <li>在「你的棋盤」上點擊格子，依序填入 1 到 25 的數字。可按「退回」復原。</li>
            <li>填滿後，點擊「開始遊戲」。</li>
            <li>輪流點擊棋盤上任一未標記的數字。雙方棋盤上的該數字會被標記。</li>
            <li>每當標記的數字連成一條線（橫、豎或斜線）時，會出現提示。</li>
            <li>最先在自己的棋盤上連成 **3** 條線者獲勝！</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-6xl">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">你的棋盤 ({playerBingoLines.length} / 3)</h2>
          <BingoBoard 
            board={playerBoard}
            onCellClick={gamePhase === 'setup' ? handleSetupCellClick : handlePlayerMove}
            disabled={gamePhase === 'playing' && !isPlayerTurn}
            isSetup={gamePhase === 'setup'}
            bingoLines={playerBingoLines}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-accent">AI 的棋盤 ({aiBingoLines.length} / 3)</h2>
          <BingoBoard 
             board={aiBoard} 
             disabled={true} 
             isConcealed={gamePhase !== 'gameOver'} 
             bingoLines={aiBingoLines}
           />
        </div>
      </div>

      <GameControls
        gamePhase={gamePhase}
        onStartGame={startGame}
        onNewGame={startNewGame}
        onUndo={handleUndoSetup}
        canUndo={nextSetupNumber > 1}
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
