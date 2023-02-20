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

export default RadioButton;
