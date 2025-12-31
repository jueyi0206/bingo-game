'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { WandSparkles } from 'lucide-react';

interface AiAnalysisProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoading: boolean;
  analysis: string | null;
}

export default function AiAnalysis({
  isOpen,
  onOpenChange,
  isLoading,
  analysis,
}: AiAnalysisProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <WandSparkles className="text-primary" />
            AI Pattern Analysis
          </SheetTitle>
          <SheetDescription>
            Let our AI expert analyze your board for strategic advantages.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] mt-4 pr-4">
          {isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert py-4 whitespace-pre-wrap font-body">
              {analysis}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
