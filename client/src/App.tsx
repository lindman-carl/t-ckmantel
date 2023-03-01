import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Button from "./components/Button";
import GameHeader from "./components/GameHeader";
import Logo from "./components/Logo";
import Menu from "./components/Menu";
import Modal from "./components/Modal";
import PlayerList from "./components/PlayerList";
import GameDrawer from "./components/GameDrawer";
import SignatureFooter from "./components/SignatureFooter";
import Spinner from "./components/Spinner";
import WordCard from "./components/WordCard";
import { ClientToServerEvents, Game, ServerToClientEvents } from "./types";
import { getClientId } from "./utils";
import { drawChart } from "./chart";
import GameInfo from "./components/GameInfo";
import GameStats from "./components/GameStats";

const CLIENT_ID = getClientId();

const SERVER_URI =
  process.env.NODE_ENV === "production"
    ? "https://tackmantel.lindman.dev"
    : "http://localhost:3000";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SERVER_URI,
  {
    query: {
      clientId: CLIENT_ID,
    },
  }
);

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  const [game, setGame] = useState<Game | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [playerWord, setPlayerWord] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [currentGameInfoPage, setCurrentGameInfoPage] = useState<
    "players" | "stats"
  >("players");

  useEffect(() => {
    console.log("client id", CLIENT_ID);
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("game-reconnect-player", (game) => {
      console.log("reconnecting player");
      setHasJoinedGame(true);
      setGame(game);

      // set host status
      if (game.players[CLIENT_ID].isHost) {
        setIsHost(true);
      }

      // set player word
      if (game.gameStarted) {
        if (game.players[CLIENT_ID].isUndercover) {
          setPlayerWord(game.words.undercover);
        } else {
          setPlayerWord(game.words.common);
        }
      }

      // set vote status
      // get latest votes
      if (game.votes[0].hasOwnProperty(CLIENT_ID)) {
        setHasVoted(true);
      } else {
        setHasVoted(false);
      }
    });

    socket.on("game-update", (game) => {
      console.log("updating game", game);
      setGame(game);

      if (game.gameStarted) {
        if (game.players[CLIENT_ID].isUndercover) {
          setPlayerWord(game.words.undercover);
        } else {
          setPlayerWord(game.words.common);
        }
      }
    });

    socket.on("game-round-new", () => {
      setHasVoted(false);
    });

    socket.on("game-kick", (playerId) => {
      if (!game) return;
      if (playerId !== CLIENT_ID) return;
      setHasJoinedGame(false);
      setHasVoted(false);
      setGame(null);
      setIsHost(false);
      setPlayerWord("");
      alert("You have been kicked from the game");
      setTimeout(() => {
        socket.emit("room-leave", game.id);
      }, 2000);
    });

    return () => {
      // clean up socket all listeners
      socket.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // re draw chord chart on updated chord data
    if (!game) return;
    console.log("yolo");
    drawChart(game);
  }, [game?.chordData, currentGameInfoPage]);

  useEffect(() => {
    if (game && game.message !== null) {
      setShowModal(true);
    }
  }, [game?.message]);

  // event handlers
  const handleCreateGame = (gameId: string, hostName: string) => {
    socket.emit("game-create", gameId, CLIENT_ID, hostName, (success) => {
      console.log("create game success", success);
      if (!success) {
        alert("Game id already exists");
        return;
      }

      setHasJoinedGame(true);
      setIsHost(true);
    });
  };

  const handleJoinGame = (gameId: string, playerName: string) => {
    socket.emit("game-join", gameId, CLIENT_ID, playerName, (success) => {
      if (!success) {
        alert("Game id does not exist");
        return;
      }
      setHasJoinedGame(true);
    });
  };

  const handleStartGame = (
    words: [string, string] | null,
    numUndercover: number
  ) => {
    if (!isHost) {
      console.log("only the host can start the game");
      return;
    }

    if (!game) {
      console.log("no game object");
      return;
    }

    socket.emit("game-start", CLIENT_ID, game.id, words, numUndercover);
    setDrawerIsOpen(false);
  };

  const handleVote = (voteForId: string) => {
    if (!hasVoted && game) {
      socket.emit("game-vote", game.id, CLIENT_ID, voteForId);
      setHasVoted(true);
    }
  };

  const handleKickPlayer = (playerId: string) => {
    if (!isHost) {
      console.log("only the host can kick players");
      return;
    }

    if (game) {
      socket.emit("game-kick", game.id, playerId, CLIENT_ID);
    }
  };

  return (
    <>
      <div className="flex h-full min-h-screen w-screen flex-col items-center justify-start text-lg text-white">
        <Logo />
        {isConnected ? (
          hasJoinedGame && game ? (
            <div className="flex flex-col items-center gap-y-4">
              <GameHeader
                game={game}
                isHost={isHost}
                onClickSettings={() => console.log("todo: implement settings")}
              >
                {isHost && (
                  <div className="mt-2">
                    {game.gameStarted ? (
                      game.gameOver ? (
                        <Button
                          onClick={() => setDrawerIsOpen(true)}
                          label={"Play again"}
                        />
                      ) : (
                        <div>The game has started</div>
                      )
                    ) : (
                      <Button
                        onClick={() => setDrawerIsOpen(true)}
                        label={"Play"}
                      />
                    )}
                  </div>
                )}
              </GameHeader>
              <WordCard word={playerWord} />
              <GameInfo
                setPage={setCurrentGameInfoPage}
                currentPage={currentGameInfoPage}
              >
                {currentGameInfoPage === "players" && (
                  <PlayerList
                    players={game.players}
                    canKick={isHost && !game.gameStarted}
                    canVote={
                      game.gameStarted &&
                      !hasVoted &&
                      !game.gameOver &&
                      game.players[CLIENT_ID].inGame
                    }
                    playerId={CLIENT_ID}
                    hasStarted={game.gameStarted}
                    handleVote={handleVote}
                    handleKick={handleKickPlayer}
                  />
                )}
                {currentGameInfoPage === "stats" && <GameStats />}
              </GameInfo>
            </div>
          ) : (
            <Menu onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
          )
        ) : (
          <Spinner />
        )}
        <SignatureFooter />
      </div>
      {showModal && (
        <Modal
          heading={game?.gameOver ? "Game Over" : "Round Over"}
          message={game?.message ? game.message : "lol on you"}
          onClose={() => setShowModal(false)}
        />
      )}
      <GameDrawer
        open={drawerIsOpen}
        numPlayers={Object.keys(game?.players || {}).length}
        onClose={() => setDrawerIsOpen(false)}
        onStartGame={handleStartGame}
      />
    </>
  );
};

export default App;
