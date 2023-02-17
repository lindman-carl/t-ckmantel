type Props = {
  onClick: () => void;
  label: string;
};

const Button = ({ onClick, label }: Props) => {
  return (
    <button
      onClick={onClick}
      className="flex h-12 w-64 items-center justify-center rounded-md bg-slate-800 font-bold tracking-wider text-white shadow-lg transition-transform active:scale-95"
    >
      {label}
    </button>
  );
};

export default Button;
