import SpinnerSvg from "../assets/spinner.svg";

const Spinner = () => {
  return (
    <div className="my-auto flex flex-col items-center justify-center gap-y-2 pb-12 font-semibold text-white">
      <div>Establishing connection...</div>
      <img src={SpinnerSvg} alt="spinner" />
    </div>
  );
};

export default Spinner;
