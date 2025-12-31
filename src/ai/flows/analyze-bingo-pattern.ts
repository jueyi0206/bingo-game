'use server';

/**
 * @fileOverview An AI agent to analyze Bingo patterns on a given board.
 *
 * - analyzeBingoPattern - A function that analyzes a Bingo board for potential patterns.
 * - AnalyzeBingoPatternInput - The input type for the analyzeBingoPattern function.
 * - AnalyzeBingoPatternOutput - The return type for the analyzeBingoPattern function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBingoPatternInputSchema = z.array(
  z.array(
    z.number().int().min(1).max(75).describe('A number on the Bingo board')
  ).length(5).describe('A row in the Bingo board')
).length(5).describe('A 5x5 Bingo board');

export type AnalyzeBingoPatternInput = z.infer<typeof AnalyzeBingoPatternInputSchema>;

const AnalyzeBingoPatternOutputSchema = z.object({
  patternAnalysis: z
    .string()
    .describe(
      'An analysis of potential Bingo patterns on the board, highlighting strategic numbers to mark.'
    ),
});

export type AnalyzeBingoPatternOutput = z.infer<typeof AnalyzeBingoPatternOutputSchema>;

export async function analyzeBingoPattern(
  input: AnalyzeBingoPatternInput
): Promise<AnalyzeBingoPatternOutput> {
  return analyzeBingoPatternFlow(input);
}

const analyzeBingoPatternPrompt = ai.definePrompt({
  name: 'analyzeBingoPatternPrompt',
  input: {schema: AnalyzeBingoPatternInputSchema},
  output: {schema: AnalyzeBingoPatternOutputSchema},
  prompt: `You are an expert Bingo pattern analyst. Analyze the given Bingo board and identify potential winning patterns (rows, columns, diagonals). Provide strategic advice on which numbers to prioritize marking to increase the chances of getting a Bingo.

Bingo Board:
{{#each this}}
  {{#each this}}
    {{this}} 
  {{/each}}
\n
{{/each}}`,
});

const analyzeBingoPatternFlow = ai.defineFlow(
  {
    name: 'analyzeBingoPatternFlow',
    inputSchema: AnalyzeBingoPatternInputSchema,
    outputSchema: AnalyzeBingoPatternOutputSchema,
  },
  async input => {
    const {output} = await analyzeBingoPatternPrompt(input);
    return output!;
  }
);
