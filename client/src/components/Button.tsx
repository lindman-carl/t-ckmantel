type Props = {
  onClick: () => void;
  label: string;
  alternative?: boolean;
};

const Button = ({ onClick, label, alternative = false }: Props) => {
  const color = alternative
    ? "bg-white text-slate-800 outline outline-2 outline-offset-[-4px] outline-slate-800"
    : "bg-slate-800 text-white";
  return (
    <button
      onClick={onClick}
      className={`flex h-12 min-h-[3rem] min-w-[12rem] max-w-[16rem] items-center justify-center rounded-md px-8 font-bold tracking-wider shadow-lg transition-transform active:scale-95 ${color}`}
    >
      {label}
    </button>
  );
};

export default Button;
