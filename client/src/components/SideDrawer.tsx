import { useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import Button from "./Button";
import RadioButton from "./RadioButton";
import WordInput from "./WordInput";

import { z } from "zod";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaveSettings: (gameMode: string, word1: string, word2: string) => void;
};

type GameModeSettingsProps = {
  gameMode: "random" | "custom";
  setGameMode: (value: "random" | "custom") => void;
};

const GameModeSettingsComponent = ({
  gameMode,
  setGameMode,
}: GameModeSettingsProps) => (
  <div className="w-full px-4">
    <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
      <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
        Game mode
      </h3>
      <div className="flex flex-col gap-y-2">
        <RadioButton
          label="Random words"
          checked={gameMode === "random"}
          onChange={() => setGameMode("random")}
        />
        <RadioButton
          label="Custom words"
          checked={gameMode === "custom"}
          onChange={() => setGameMode("custom")}
        />
      </div>
    </div>
  </div>
);

type WordsSettingsComponentProps = {
  firstWord: string;
  secondWord: string;
  setFirstWord: (value: string) => void;
  setSecondWord: (value: string) => void;
};

const WordsSettingsComponent = ({
  firstWord,
  secondWord,
  setFirstWord,
  setSecondWord,
}: WordsSettingsComponentProps) => (
  <div className="w-full px-4">
    <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
      <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
        Custom words
      </h3>
      <div className="flex flex-col gap-y-2">
        <WordInput
          placeholder="word 1"
          value={firstWord}
          onChange={setFirstWord}
        />
        <WordInput
          placeholder="word 2"
          value={secondWord}
          onChange={setSecondWord}
        />
      </div>
    </div>
  </div>
);

const SideDrawer = ({ open, onClose, onSaveSettings }: Props) => {
  const [gameMode, setGameMode] = useState<"random" | "custom">("random");
  const [firstWord, setFirstWord] = useState("");
  const [secondWord, setSecondWord] = useState("");
  const [numUndercover, setNumUndercover] = useState(1);
  const [numBlanks, setNumBlanks] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // stop body scroll when drawer is open
  // document.body.style.overflow = open ? "hidden" : "unset";

  const handleSaveSettings = () => {
    if (gameMode === "custom") {
      // validate words with zod
      const wordSchema = z
        .string()
        .min(1, { message: "Both words must contain at least 1 character" })
        .max(30, { message: "Both words must contain at most 30 characters" });
      try {
        wordSchema.parse(firstWord);
        wordSchema.parse(secondWord);
        onSaveSettings(gameMode, firstWord, secondWord);
        setErrorMessage(null);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrorMessage(error.issues[0].message);
        }
      }
    }
  };

  return (
    <Drawer open={open} direction="left" onClose={onClose} size={300}>
      <div className="flex h-full flex-col items-center justify-start gap-y-4 overflow-y-scroll bg-slate-700 bg-black-scales py-4 text-white shadow-2xl">
        <h2 className="py-4 text-center text-2xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
          Settings
        </h2>
        <GameModeSettingsComponent
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
        {gameMode === "custom" && (
          <WordsSettingsComponent
            firstWord={firstWord}
            secondWord={secondWord}
            setFirstWord={setFirstWord}
            setSecondWord={setSecondWord}
          />
        )}
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
                  onChange={(e) => setNumUndercover(parseInt(e.target.value))}
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
                  onChange={(e) => setNumBlanks(parseInt(e.target.value))}
                  className="rounded-md px-4 py-2 text-sky-900"
                />
              </div>
            </div>
          </div>
        </div>
        <span className="text-sm font-light">
          Changes will take effect next game
        </span>
        {errorMessage && (
          <span className="px-4 text-center text-sm font-light text-red-600">
            {errorMessage}
          </span>
        )}
        <Button
          label="Save settings"
          onClick={handleSaveSettings}
          alternative
        />
      </div>
    </Drawer>
  );
};

export default SideDrawer;
