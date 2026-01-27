import type { RoundResult } from "$lib/game/types";

export function createRoundResult(
  impostorExpelled: boolean | null,
  expellers: Set<string>,
  roundsSurvived: number | null,
  impostorGuessedWord: boolean | null
): RoundResult {
  return {
    impostorExpelled: impostorExpelled ?? false,
    expellers: Array.from(expellers),
    roundsSurvived: roundsSurvived ?? 0,
    impostorGuessedWord: impostorGuessedWord ?? false
  };
}
