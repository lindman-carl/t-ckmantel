import { useState } from "react";
import { getRandomGameId } from "../utils";
import Button from "./Button";

type MenuProps = {
  handleJoinGame: (gameId: string, playerName: string) => void;
  handleCreateGame: (gameId: string, hostName: string) => void;
};

const Menu = ({ handleJoinGame, handleCreateGame }: MenuProps) => {
  const [menuState, setMenuState] = useState<"main" | "join" | "create">(
    "main"
  );

  const [gameId, setGameId] = useState<string>(getRandomGameId());
  const [playerName, setPlayerName] = useState<string>("");

  if (menuState === "join") {
    // Join game
    return (
      <div className="w-screen px-4 sm:w-96">
        <div className="flex w-full flex-col items-stretch justify-center gap-y-2 rounded-md bg-rose-700 p-4 shadow-inner">
          <h2 className="text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
            Join game
          </h2>
          <input
            type="text"
            placeholder="game id"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="rounded px-4 py-2 text-sky-900 shadow-inner"
          />
          <input
            type="text"
            placeholder="your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="rounded px-4 py-2 text-sky-900 shadow-inner"
          />
          <div className="mx-auto mt-4">
            <Button
              onClick={() => handleJoinGame(gameId, playerName)}
              label="Join Game"
            />
          </div>
        </div>
      </div>
    );
  } else if (menuState === "create") {
    // Create game
    return (
      <div className="w-screen px-4 sm:w-96">
        <div className="flex w-full flex-col items-stretch justify-center gap-y-2 rounded-md bg-rose-700 p-4 shadow-inner">
          <h2 className="text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
            Host game
          </h2>
          <input
            type="text"
            placeholder="game id"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="rounded px-4 py-2 text-sky-900 shadow-inner"
          />
          <input
            type="text"
            placeholder="your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="rounded px-4 py-2 text-sky-900 shadow-inner"
          />
          <div className="mx-auto mt-4">
            <Button
              onClick={() => handleCreateGame(gameId, playerName)}
              label="Create Game"
            />
          </div>
        </div>
      </div>
    );
  } else {
    // Main menu
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
};

export default Menu;
