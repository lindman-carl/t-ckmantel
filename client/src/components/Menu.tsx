import { useCallback, useState } from "react";

// local imports
import useMenuInput from "../hooks/useMenuInput";
import Button from "./Button";

type MenuProps = {
  onJoinGame: (gameId: string, playerName: string) => void;
  onCreateGame: (gameId: string, hostName: string) => void;
  onHowTo: () => void;
};

const Menu = ({ onJoinGame, onCreateGame, onHowTo }: MenuProps) => {
  // state
  const [menuState, setMenuState] = useState<"main" | "join" | "create">(
    "main"
  );

  // hook
  const {
    gameId,
    playerName,
    errorMessage,
    validateInput,
    handlers: { handleGameIdChange, handlePlayerNameChange, resetGameId },
  } = useMenuInput();

  // handlers
  const handleCreateGame = () => {
    const inputIsValid = validateInput();
    if (inputIsValid) {
      onCreateGame(gameId, playerName);
    }
  };

  const handleJoinGame = () => {
    const inputIsValid = validateInput();
    if (inputIsValid) {
      onJoinGame(gameId, playerName);
    }
  };

  const getHeader = useCallback(() => {
    switch (menuState) {
      case "main":
        return "Welcome to the game!";
      case "join":
        return "Join game";
      case "create":
        return "Create game";
    }
  }, [menuState]);

  // render main menu
  // the main menu has two buttons: join game and create game
  if (menuState === "main") {
    return (
      <MenuContainer>
        <MenuHeader text={getHeader()} />
        <Button
          onClick={() => {
            setMenuState("join");
            resetGameId();
          }}
          label="Join game"
        />
        <Button onClick={() => setMenuState("create")} label="Create game" />
        <button onClick={onHowTo}>How to play?</button>
      </MenuContainer>
    );
  }

  // render join/create menu
  // the join/create menu has two inputs: game id and player name
  // and a button to join/create the game
  return (
    <MenuContainer>
      <MenuHeader text={getHeader()} />
      <input
        type="text"
        placeholder="game id"
        value={gameId}
        onChange={handleGameIdChange}
        className="self-stretch rounded-md px-4 py-2 text-sky-900 shadow-inner"
      />
      <input
        type="text"
        placeholder="your name"
        value={playerName}
        onChange={handlePlayerNameChange}
        className="self-stretch rounded-md px-4 py-2 text-sky-900 shadow-inner"
      />

      {errorMessage && <div className="w-full text-sm">{errorMessage}</div>}

      <div className="mx-auto mt-4">
        {menuState === "join" ? (
          <Button onClick={handleJoinGame} label="Join game" />
        ) : (
          <Button onClick={handleCreateGame} label="Create game" />
        )}
      </div>
    </MenuContainer>
  );
};

function MenuContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen px-4 sm:w-96">
      <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded-md bg-rose-700 p-4 py-8 shadow-inner">
        {children}
      </div>
    </div>
  );
}

function MenuHeader({ text }: { text: string }) {
  return (
    <h2 className="text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
      {text}
    </h2>
  );
}

export default Menu;
