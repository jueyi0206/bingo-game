'use client';

import { RefreshCw, WandSparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GameControlsProps {
  onNewGame: () => void;
  onCallNumber: () => void;
  onAiAnalysis: () => void;
  isBingo: boolean;
  canCallNumber: boolean;
}

export function GameControls({
  onNewGame,
  onCallNumber,
  onAiAnalysis,
  isBingo,
  canCallNumber,
}: GameControlsProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 flex flex-col gap-3">
        <Button
          onClick={onCallNumber}
          disabled={isBingo || !canCallNumber}
          size="lg"
          className="w-full font-bold text-lg"
        >
          <Play className="mr-2" />
          {isBingo ? 'Game Over' : (canCallNumber ? 'Call Number' : 'All numbers called!')}
        </Button>
        <div className="flex gap-3">
          <Button onClick={onNewGame} variant="secondary" className="w-full">
            <RefreshCw className="mr-2" />
            New Game
          </Button>
          <Button onClick={onAiAnalysis} variant="secondary" className="w-full">
            <WandSparkles className="mr-2" />
            AI Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
