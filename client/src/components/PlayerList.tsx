import { Player } from "../types";

type Props = {
  players: { [id: string]: Player };
  canVote: boolean;
  playerId: string;
  hasStarted: boolean;
  handleVote: (voteForId: string) => void;
};

const getDesign = (inGame: boolean, hasStarted: boolean, hasVoted: boolean) => {
  let base = "";
  if (!inGame && hasStarted) {
    base = "bg-rose-800 shadow-inner rounded-md text-rose-900 bg-opacity-50 ";
  } else {
    base = "bg-white shadow rounded-md text-sky-900";
  }

  let voteBorder = "";
  if (hasVoted && inGame) {
    voteBorder = "outline-green-600 outline outline-2 outline-offset-[-4px]";
  }

  return [base, voteBorder].join(" ");
};

const PlayerList = ({
  players,
  canVote,
  playerId,
  handleVote,
  hasStarted,
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
      <div className="grid h-8 w-full grid-cols-8 rounded-md bg-rose-800 px-4 font-medium text-white shadow-inner">
        <div className="col-span-4 col-start-1 flex h-full items-center justify-start">
          Player
        </div>
        <div className="col-span-2 col-start-7 flex h-full items-center justify-end">
          Score
        </div>
      </div>
      {Object.entries(players).map(([id, player]) => (
        <div
          key={id}
          className={`grid h-10 w-full grid-cols-8 grid-rows-1 px-4 font-medium ${getDesign(
            player.inGame,
            hasStarted,
            player.hasVoted
          )}`}
        >
          <div className="col-span-4 col-start-1 row-start-1 flex h-full items-center justify-start">
            {player.name}
          </div>
          <div className="col-span-1 col-start-8 row-start-1 flex h-full items-center justify-end">
            {player.score}
          </div>
          {player.inGame && canVote && id !== playerId && (
            <div className="col-span-3 col-start-5 row-start-1 flex h-full items-center justify-center">
              <button
                onClick={() => handleVote(id)}
                className="py-0.1 rounded-lg border-2 border-rose-800 bg-rose-700 bg-checkered-pattern px-4 text-white shadow transition-all active:scale-95 active:bg-rose-800 active:bg-none active:text-rose-900 active:shadow-inner"
              >
                Vote
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;

/* <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
          Players
        </h3> */
