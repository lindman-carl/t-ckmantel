import MedalSvg from "../assets/medal.svg";
import { Player } from "../types";

type Props = {
  players: { [id: string]: Player };
  canKick: boolean;
  canVote: boolean;
  playerId: string;
  hasStarted: boolean;
  handleVote: (voteForId: string) => void;
  handleKick: (playerId: string) => void;
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
  canKick,
  canVote,
  playerId,
  handleVote,
  handleKick,
  hasStarted,
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
      {Object.entries(players).map(([id, player]) => (
        <div
          key={id}
          className={`grid h-10 w-full grid-cols-5 px-4 font-medium ${getDesign(
            player.inGame,
            hasStarted,
            player.hasVoted
          )}`}
        >
          <div className="col-span-2 col-start-1 flex h-full items-center justify-start">
            {player.name}
          </div>
          {player.wins > 0 && (
            <div className="col-span-1 col-start-3 flex h-full items-center justify-end">
              {player.wins > 1 && <span>{player.wins}x</span>}
              <img src={MedalSvg} alt="medal" width="24px" height="24px" />
            </div>
          )}
          {canKick && id !== playerId && (
            <div className="col-span-1 col-start-5 flex h-full items-center justify-end">
              <button onClick={() => handleKick(id)}>Kick</button>
            </div>
          )}
          {player.inGame && canVote && id !== playerId && (
            <div className="col-span-2 col-start-4 flex h-full items-center justify-end">
              <button onClick={() => handleVote(id)}>Vote for</button>
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
