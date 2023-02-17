import Button from "./Button";

type Props = {
  heading: string;
  message: string;
  onClose: () => void;
};

const Modal = ({ heading, message, onClose }: Props) => {
  return (
    <div className="absolute top-0 z-50 flex h-screen w-screen flex-col justify-center bg-black bg-opacity-20 shadow-2xl backdrop-blur-sm">
      <div className="relative mx-auto flex w-80 flex-col items-center justify-between rounded-md bg-white py-8 text-sky-900 backdrop-blur-sm md:w-96">
        <h2 className="mt-2 mb-4 text-2xl font-bold">{heading}</h2>
        <div className="mb-4 flex w-full items-center justify-center text-center text-lg font-semibold">
          {message}
        </div>

        <Button onClick={onClose} label={"Ok"} />
      </div>
    </div>
  );
};

export default Modal;
