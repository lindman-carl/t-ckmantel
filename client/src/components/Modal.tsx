import Button from "./Button";

type Props = {
  message: string[] | null;
  onClose: () => void;
};

const Modal = ({ message, onClose }: Props) => {
  // stop body scroll when drawer is open
  // document.body.style.overflow = open ? "hidden" : "unset";

  if (message === null) return null;

  return (
    <div className="fixed top-0 z-50 flex h-screen w-screen flex-col justify-center bg-black bg-opacity-20 shadow-2xl backdrop-blur-sm">
      <div className="relative mx-auto flex w-80 flex-col items-center justify-between rounded-md bg-white py-8 px-4 text-sky-900 backdrop-blur-sm md:w-96">
        <h2 className="mt-2 mb-2 text-center text-2xl font-bold">
          {message[0]}
        </h2>
        <div className="mb-4 flex w-full flex-col items-center justify-center text-center text-lg font-semibold">
          {message.slice(1).map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>

        <Button onClick={onClose} label={"Ok"} />
      </div>
    </div>
  );
};

export default Modal;
