import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

// local imports
import Button from "./Button";
import RadioButton from "./RadioButton";
import WordInput from "./WordInput";

// hooks
import useGameSettingsInput from "../hooks/useGameSettingsInput";

type Props = {
  open: boolean;
  numPlayers: number;
  onClose: () => void;
  onStartGame: (words: [string, string] | null, numUndercover: number) => void;
};

const GameSettingsDrawer = ({
  open,
  numPlayers,
  onClose,
  onStartGame,
}: Props) => {
  // hooks
  const {
    gameMode,
    firstWord,
    secondWord,
    numUndercover,
    numBlanks,
    errorMessage,
    validateInput,
    handlers: {
      onGameModeRandom,
      onGameModeCustom,
      handleChangeFirstWord,
      handleChangeSecondWord,
      handleChangeNumUndercover,
      handleChangeNumBlanks,
    },
  } = useGameSettingsInput(numPlayers);

  // TODO: stop body scroll when drawer is open

  // handlers
  const handleStartGame = () => {
    const inputIsValid = validateInput();
    if (!inputIsValid) return;

    if (gameMode === "random") {
      onStartGame(null, numUndercover);
    } else if (gameMode === "custom") {
      onStartGame([firstWord, secondWord], numUndercover);
    }
  };

  // render
  return (
    <DrawerContainer open={open} onClose={onClose}>
      <Header />
      <GameModeInput
        gameMode={gameMode}
        onGameModeCustom={onGameModeCustom}
        onGameModeRandom={onGameModeRandom}
      />

      {gameMode === "custom" && (
        <CustomWordsInput
          firstWord={firstWord}
          secondWord={secondWord}
          handleChangeFirstWord={handleChangeFirstWord}
          handleChangeSecondWord={handleChangeSecondWord}
        />
      )}

      <NumbersInput
        numUndercover={numUndercover}
        numBlanks={numBlanks}
        handleChangeNumUndercover={handleChangeNumUndercover}
        handleChangeNumBlanks={handleChangeNumBlanks}
      />

      {errorMessage && (
        <span className="px-4 text-center text-sm font-light text-red-600">
          {errorMessage}
        </span>
      )}

      <Button label="Start game" onClick={handleStartGame} alternative />
    </DrawerContainer>
  );
};

// local components
type DrawerContainerProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

function DrawerContainer({ children, open, onClose }: DrawerContainerProps) {
  return (
    <Drawer open={open} direction="left" onClose={onClose} size={300}>
      <div className="flex h-full flex-col items-center justify-start gap-y-4 overflow-y-scroll bg-slate-700 bg-black-scales pb-32 pt-4 text-white shadow-2xl">
        {children}
      </div>
    </Drawer>
  );
}

function Header() {
  return (
    <h2 className="py-4 text-center text-2xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
      Game Settings
    </h2>
  );
}

type GameModeInputProps = {
  gameMode: "random" | "custom";
  onGameModeRandom: () => void;
  onGameModeCustom: () => void;
};

function GameModeInput({
  gameMode,
  onGameModeRandom,
  onGameModeCustom,
}: GameModeInputProps) {
  return (
    <div className="w-full px-4">
      <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
        <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
          Game mode
        </h3>
        <div className="flex flex-col gap-y-2">
          <RadioButton
            label="Random words"
            checked={gameMode === "random"}
            onChange={onGameModeRandom}
          />
          <RadioButton
            label="Custom words"
            checked={gameMode === "custom"}
            onChange={onGameModeCustom}
          />
        </div>
      </div>
    </div>
  );
}

type CustomWordsInputProps = {
  firstWord: string;
  secondWord: string;
  handleChangeFirstWord: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeSecondWord: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function CustomWordsInput({
  firstWord,
  secondWord,
  handleChangeFirstWord,
  handleChangeSecondWord,
}: CustomWordsInputProps) {
  return (
    <div className="w-full px-4">
      <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
        <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
          Custom words
        </h3>
        <div className="flex flex-col gap-y-2">
          <WordInput
            placeholder="first word"
            value={firstWord}
            onChange={handleChangeFirstWord}
          />
          <WordInput
            placeholder="second word"
            value={secondWord}
            onChange={handleChangeSecondWord}
          />
          <span className="mt-1 px-2 text-center text-sm font-light">
            Which word is undercover is randomly chosen
          </span>
        </div>
      </div>
    </div>
  );
}

type NumbersInputProps = {
  numUndercover: number;
  numBlanks: number;
  handleChangeNumUndercover: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeNumBlanks: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function NumbersInput({
  numUndercover,
  numBlanks,
  handleChangeNumUndercover,
  handleChangeNumBlanks,
}: NumbersInputProps) {
  return (
    <div className="w-full px-4">
      <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
        <div className="grid-row-1 grid grid-cols-2 gap-x-2">
          <div className="flex flex-col">
            <label className="text-sm font-semibold">Undercovers</label>
            <input
              type="number"
              min="1"
              max="5"
              value={numUndercover}
              onChange={handleChangeNumUndercover}
              className="rounded-md px-4 py-2 text-sky-900"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold">Blanks</label>
            <input
              type="number"
              min="0"
              max="5"
              value={numBlanks}
              onChange={handleChangeNumBlanks}
              className="rounded-md px-4 py-2 text-sky-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameSettingsDrawer;
