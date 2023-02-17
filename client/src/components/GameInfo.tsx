import { Game } from "../types";

type Props = {
  game: Game;
};

const GameInfo = ({ game }: Props) => {
  return (
    <div className="flex w-96 flex-col items-center justify-start rounded-md bg-rose-700 py-4 font-semibold text-white shadow-inner">
      <h2 className="text-center text-2xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
        {game.id}
      </h2>
      <div>Round: {game.round}</div>
      <div>
        Votes: {game.currentVoteCount}/{game.expectedVotes}
      </div>
    </div>
  );
};

export default GameInfo;
