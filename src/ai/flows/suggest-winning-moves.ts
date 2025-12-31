'use server';

/**
 * @fileOverview Provides suggestions on which numbers to prioritize marking on a Bingo board.
 *
 * - suggestWinningMoves - A function that suggests numbers to prioritize.
 * - SuggestWinningMovesInput - The input type for the suggestWinningMoves function.
 * - SuggestWinningMovesOutput - The return type for the suggestWinningMoves function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWinningMovesInputSchema = z.object({
  board: z
    .array(z.array(z.number()))
    .describe('The current state of the Bingo board.'),
  calledNumbers: z.array(z.number()).describe('The numbers that have been called.'),
  numbersToCall: z.array(z.number()).describe('Numbers that can be called in the future turns.'),
});
export type SuggestWinningMovesInput = z.infer<typeof SuggestWinningMovesInputSchema>;

const SuggestWinningMovesOutputSchema = z.object({
  suggestedNumbers: z
    .array(z.number())
    .describe(
      'A list of numbers to prioritize marking, based on the current board state and called numbers.'
    ),
  reasoning: z.string().describe('Explanation of why the numbers are suggested.'),
});
export type SuggestWinningMovesOutput = z.infer<typeof SuggestWinningMovesOutputSchema>;

export async function suggestWinningMoves(
  input: SuggestWinningMovesInput
): Promise<SuggestWinningMovesOutput> {
  return suggestWinningMovesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWinningMovesPrompt',
  input: {schema: SuggestWinningMovesInputSchema},
  output: {schema: SuggestWinningMovesOutputSchema},
  prompt: `You are an expert Bingo strategist. Given the current state of the Bingo board and the numbers that have been called, you will suggest which numbers to prioritize marking to increase the chances of winning.

Current Bingo Board:
{{#each board}}
  {{this}}
{{/each}}

Called Numbers: {{calledNumbers}}
Numbers to Call: {{numbersToCall}}

Based on this information, which numbers should the player prioritize marking? Explain your reasoning.

Output in JSON format:
`,
});

const suggestWinningMovesFlow = ai.defineFlow(
  {
    name: 'suggestWinningMovesFlow',
    inputSchema: SuggestWinningMovesInputSchema,
    outputSchema: SuggestWinningMovesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
