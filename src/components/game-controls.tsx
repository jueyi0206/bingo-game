'use client';

import { RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GameControlsProps {
  gamePhase: 'setup' | 'playing' | 'gameOver';
  onStartGame: () => void;
  onNewGame: () => void;
}

export function GameControls({
  gamePhase,
  onStartGame,
  onNewGame,
}: GameControlsProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm mt-8 w-full max-w-sm">
      <CardContent className="p-4 flex flex-col gap-3">
        {gamePhase === 'setup' && (
          <Button onClick={onStartGame} size="lg" className="w-full font-bold text-lg">
            <Play className="mr-2" />
            開始遊戲
          </Button>
        )}
        <Button onClick={onNewGame} variant="secondary" className="w-full">
          <RefreshCw className="mr-2" />
          開新的一局
        </Button>
      </CardContent>
    </Card>
  );
}
