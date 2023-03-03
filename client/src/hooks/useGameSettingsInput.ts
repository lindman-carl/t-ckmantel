import { useMemo, useState } from "react";
import { z } from "zod";

const useGameSettingsInput = (numPlayers: number) => {
  const [gameMode, setGameMode] = useState<"random" | "custom">("random");
  const [firstWord, setFirstWord] = useState("");
  const [secondWord, setSecondWord] = useState("");
  const [numUndercover, setNumUndercover] = useState(1);
  const [numBlanks, setNumBlanks] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateInput = (): boolean => {
    // validates input with zod
    // sets error message if there is an error
    // returns true if there are no errors
    // returns false if there are errors

    // calculate max number of undercovers
    let maxUndercover = 1;
    if (numPlayers % 2 === 0) {
      maxUndercover = numPlayers / 2 - 1;
    } else {
      maxUndercover = (numPlayers - 1) / 2;
    }

    // schemas
    const numUndercoverSchema = z
      .number()
      .int({ message: "Number of undercover: must be an integer" })
      .min(1, { message: "Number of undercover: min 1" })
      .max(maxUndercover, {
        message: `Number of undercover: max ${maxUndercover}`,
      });
    const wordSchema = z
      .string()
      .min(1, { message: "Both words must contain at least 1 character" })
      .max(30, { message: "Both words must contain at most 30 characters" });

    // validate input
    try {
      if (gameMode === "custom") {
        wordSchema.parse(firstWord);
        wordSchema.parse(secondWord);
        numUndercoverSchema.parse(numUndercover);
      } else if (gameMode === "random") {
        numUndercoverSchema.parse(numUndercover);
      }

      // no errors === success
      setErrorMessage(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // only show first error message
        // i don't think it looks good to show multiple error messages at once
        setErrorMessage(error.issues[0].message);
      }
      return false;
    }
  };

  const handlers = useMemo(
    () => ({
      onGameModeRandom: () => setGameMode("random"),
      onGameModeCustom: () => setGameMode("custom"),
      handleChangeFirstWord: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFirstWord(e.target.value),
      handleChangeSecondWord: (e: React.ChangeEvent<HTMLInputElement>) =>
        setSecondWord(e.target.value),
      handleChangeNumUndercover: (e: React.ChangeEvent<HTMLInputElement>) =>
        setNumUndercover(parseInt(e.target.value)),
      handleChangeNumBlanks: (e: React.ChangeEvent<HTMLInputElement>) =>
        setNumBlanks(parseInt(e.target.value)),
    }),
    []
  );
  return {
    gameMode,
    firstWord,
    secondWord,
    numUndercover,
    numBlanks,
    errorMessage,
    validateInput,
    handlers,
  };
};

export default useGameSettingsInput;
