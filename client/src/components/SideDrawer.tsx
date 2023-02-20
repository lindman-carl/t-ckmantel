import { useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import Button from "./Button";

// svgs
import EyeHideSvg from "../assets/eye-hide.svg";
import EyeShowSvg from "../assets/eye-show.svg";

type Props = {
  open: boolean;
  onClose: () => void;
};

type RadioProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

const RadioButton = ({ label, checked, onChange }: RadioProps) => {
  return (
    <div className="flex h-10 cursor-pointer items-center gap-x-2 rounded-md bg-white px-4 font-medium text-sky-900 shadow">
      <input
        type="radio"
        name="game-mode"
        id={label}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={label} className="grow cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

type WordInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const WordInput = ({ placeholder, value, onChange }: WordInputProps) => {
  const [hide, setHide] = useState(false);
  return (
    <div className="flex w-full rounded-md bg-white shadow-inner">
      <input
        type={hide ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-l-md py-2 pl-4 text-sky-900 outline-none"
      />
      <div>
        <button onClick={() => setHide(!hide)} className="ml-2 mt-2 ">
          {hide ? (
            <img src={EyeShowSvg} alt="show" width="24px" />
          ) : (
            <img src={EyeHideSvg} alt="hide" width="24px" />
          )}
        </button>
      </div>
    </div>
  );
};

const SideDrawer = ({ open, onClose }: Props) => {
  const [firstWord, setFirstWord] = useState("");
  const [secondWord, setSecondWord] = useState("");

  return (
    <Drawer open={open} direction="left" onClose={onClose} size={300}>
      <div className="flex h-full flex-col items-center justify-start gap-y-4 bg-slate-700 bg-black-scales text-white">
        <h2 className="py-4 text-center text-2xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
          Settings
        </h2>

        <div className="w-full px-4">
          <div className="flex w-full flex-col rounded-md bg-slate-800 p-4 shadow-inner">
            <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-slate-900 decoration-2 underline-offset-2 drop-shadow">
              Game mode
            </h3>
            <div className="flex flex-col gap-y-2">
              <RadioButton
                label="Random words"
                checked={true}
                onChange={() => {}}
              />
              <RadioButton
                label="Custom words"
                checked={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
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
        <p className="text-sm font-light">Changes will take effect next game</p>
        <Button label="Save settings" onClick={() => {}} alternative />
      </div>
    </Drawer>
  );
};

export default SideDrawer;
