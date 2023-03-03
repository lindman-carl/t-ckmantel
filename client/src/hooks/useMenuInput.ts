import { useMemo, useState } from "react";
import { z } from "zod";

// local imports
import { getRandomGameId } from "../utils";

const useMenuInput = () => {
  // useMenuInput hook
  // handles input state and validation for the main menu
  // handles gameId and playerName

  const [gameId, setGameId] = useState<string>(getRandomGameId());
  const [playerName, setPlayerName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateInput = (): boolean => {
    // validate string with zod
    const gameIdSchema = z
      .string()
      .min(4, { message: "Game id: min 4 characters long" })
      .max(20, { message: "Game id: max 20 charactes long" });
    const playerNameSchema = z
      .string()
      .min(1, { message: "Player name: min 1 character" })
      .max(12, { message: "Player name: max 12 characters" });
    try {
      gameIdSchema.parse(gameId);
      playerNameSchema.parse(playerName);

      // if no error, clear error message
      // and return true
      setErrorMessage(null);

      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        // if error, set error message
        setErrorMessage(err.issues[0].message);
      }
      return false;
    }
  };

  const handlers = useMemo(
    () => ({
      handleGameIdChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameId(e.target.value),
      handlePlayerNameChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerName(e.target.value),
      resetGameId: () => setGameId(""),
    }),
    []
  );
  return {
    gameId,
    playerName,
    errorMessage,
    validateInput,
    handlers,
  };
};

export default useMenuInput;
