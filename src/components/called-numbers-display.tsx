'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CalledNumbersDisplayProps {
  currentNumber: number | undefined;
  calledNumbers: number[];
}

export function CalledNumbersDisplay({
  currentNumber,
  calledNumbers,
}: CalledNumbersDisplayProps) {
  const getLetterForNumber = (num: number) => {
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    if (num >= 61 && num <= 75) return 'O';
    return '';
  };

  const sortedCalledNumbers = [...calledNumbers].sort((a, b) => b - a);

  return (
    <Card className="bg-card/80 backdrop-blur-sm flex-1 flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Called Numbers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1 min-h-0 p-4 pt-0">
        <div className="flex items-center justify-center bg-primary rounded-lg p-4 shadow-inner">
          <div className="text-center text-primary-foreground">
            <div className="text-sm font-semibold tracking-wider">CURRENT</div>
            <div
              key={currentNumber}
              className={cn(
                "text-7xl font-bold transition-opacity duration-300",
                currentNumber ? "animate-pop-in" : "opacity-0"
              )}
            >
              {currentNumber ? (
                <span>
                  <span className="opacity-70">{getLetterForNumber(currentNumber)}</span>
                  {currentNumber}
                </span>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 -mx-4">
          <div className="px-4">
            {sortedCalledNumbers.length > 0 ? (
              <div className="grid grid-cols-5 gap-2 text-center">
                {sortedCalledNumbers.map((num) => (
                  <div
                    key={num}
                    className="flex flex-col items-center justify-center p-1 rounded-md bg-secondary text-secondary-foreground"
                  >
                    <div className="text-xs opacity-70">{getLetterForNumber(num)}</div>
                    <div className="font-semibold">{num}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground pt-8">
                No numbers called yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
