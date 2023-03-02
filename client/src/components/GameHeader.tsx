import { Game } from "../types";
import QuestionMarkSvg from "../assets/question-mark.svg";

type Props = {
  game: Game;
  children?: React.ReactNode;
  onClickHowTo: () => void;
};

const GameHeader = ({ game, children, onClickHowTo }: Props) => {
  return (
    <div className="w-screen px-4 sm:w-96">
      <div className="flex w-full flex-col items-center justify-start rounded-md bg-rose-700 py-4 font-semibold text-white shadow-inner">
        <div className="grid w-full grid-cols-5 grid-rows-1">
          <h2 className="col-span-3 col-start-2 text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
            {game.id}
          </h2>
          <button
            className="col-span-1 col-start-5 flex flex-row items-center justify-center drop-shadow"
            onClick={onClickHowTo}
          >
            <img
              src={QuestionMarkSvg}
              alt="game settings"
              width="24px"
              height="24px"
            />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default GameHeader;
