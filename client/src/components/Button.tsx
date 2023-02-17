type Props = {
  onClick: () => void;
  label: string;
};

const Button = ({ onClick, label }: Props) => {
  return (
    <button
      onClick={onClick}
      className="flex h-12 min-w-[12rem] max-w-[16rem] items-center justify-center rounded-md bg-slate-800 px-8 font-bold tracking-wider text-white shadow-lg transition-transform active:scale-95"
    >
      {label}
    </button>
  );
};

export default Button;
