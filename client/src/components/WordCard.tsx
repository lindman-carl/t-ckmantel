import EyeHideSvg from "../assets/eye-hide.svg";
import EyeShowSvg from "../assets/eye-show.svg";
import LogoWebp from "../assets/logo.webp";

type Props = {
  word: string;
};

const WordCard = ({ word }: Props) => {
  return (
    <div className="flip h-48 w-80 cursor-pointer text-sky-900">
      <div className="flip-content h-full w-full">
        <div className="flip-front grid h-full w-full select-none grid-cols-3 grid-rows-3 rounded-md bg-white shadow-xl">
          <div className="pointer-events-none col-span-1 col-start-3 row-start-1 flex items-start justify-end pr-4 pt-4">
            <img src={EyeHideSvg} alt="eye hide" width="32px" height="32px" />
          </div>
          <div className="col-span-3 col-start-1 row-start-2 flex items-center justify-center text-4xl font-bold drop-shadow-sm">
            <img src={LogoWebp} alt="logo" width="100px" height="100px" />
          </div>
          <div className="col-span-3 col-start-1 row-start-3 flex items-center justify-center text-sm font-light">
            <p>Press to view your word</p>
          </div>
        </div>
        <div className="flip-back grid h-full w-full select-none grid-cols-3 grid-rows-3 rounded-md bg-white shadow-xl">
          <div className="pointer-events-none col-span-1 col-start-3 row-start-1 flex items-start justify-end pr-4 pt-4">
            <img src={EyeShowSvg} alt="eye hide" width="32px" height="32px" />
          </div>
          <p className="col-span-3 col-start-1 row-start-2 flex items-center justify-center text-3xl font-bold">
            {word === "" ? (
              <div className="text-xl">wait for game to start</div>
            ) : (
              word
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
