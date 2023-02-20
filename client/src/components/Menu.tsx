import { useState } from "react";
import { z } from "zod";
import { getRandomGameId } from "../utils";
import Button from "./Button";

type MenuProps = {
  onJoinGame: (gameId: string, playerName: string) => void;
  onCreateGame: (gameId: string, hostName: string) => void;
};

const Menu = ({ onJoinGame, onCreateGame }: MenuProps) => {
  const [menuState, setMenuState] = useState<"main" | "join" | "create">(
    "main"
  );

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

  const handleCreateGame = () => {
    const validInput = validateInput();
    if (validInput) {
      onCreateGame(gameId, playerName);
    }
  };

  const handleJoinGame = () => {
    const validInput = validateInput();
    if (validInput) {
      onJoinGame(gameId, playerName);
    }
  };

  if (menuState === "main") {
    return (
      <div className="flex flex-col items-center justify-center gap-y-4">
        <Button
          onClick={() => {
            setMenuState("join");
            setGameId("");
          }}
          label="Join Game"
        />
        <Button onClick={() => setMenuState("create")} label="Create Game" />
      </div>
    );
  }

  return (
    <div className="w-screen px-4 sm:w-96">
      <div className="flex w-full flex-col items-stretch justify-center gap-y-2 rounded-md bg-rose-700 p-4 shadow-inner">
        <h2 className="text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
          {menuState === "join" ? "Join game" : "Host game"}
        </h2>
        <input
          type="text"
          placeholder="game id"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="rounded-md px-4 py-2 text-sky-900 shadow-inner"
        />
        <input
          type="text"
          placeholder="your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="rounded-md px-4 py-2 text-sky-900 shadow-inner"
        />
        {errorMessage && <div className="w-full text-sm">{errorMessage}</div>}
        <div className="mx-auto mt-4">
          {menuState === "join" ? (
            <Button onClick={handleJoinGame} label="Join Game" />
          ) : (
            <Button onClick={handleCreateGame} label="Create Game" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
