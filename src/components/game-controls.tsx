'use client';

import { RefreshCw, Play, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GameControlsProps {
  gamePhase: 'setup' | 'playing' | 'gameOver';
  onStartGame: () => void;
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function GameControls({
  gamePhase,
  onStartGame,
  onNewGame,
  onUndo,
  canUndo,
}: GameControlsProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm mt-8 w-full max-w-sm">
      <CardContent className="p-4 flex flex-col gap-3">
        {gamePhase === 'setup' && (
          <div className='flex gap-2'>
             <Button onClick={onUndo} variant="secondary" className="w-1/3" disabled={!canUndo}>
              <Undo2 className="mr-2" />
              退回
            </Button>
            <Button onClick={onStartGame} size="lg" className="w-2/3 font-bold text-lg">
              <Play className="mr-2" />
              開始遊戲
            </Button>
          </div>
        )}
        <Button onClick={onNewGame} variant="secondary" className="w-full">
          <RefreshCw className="mr-2" />
          開新的一局
        </Button>
      </CardContent>
    </Card>
  );
}
