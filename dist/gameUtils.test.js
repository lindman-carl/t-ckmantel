import { countPlayersInGame } from "./gameUtils.js";
import { gameAddPlayer, gameCreate, games, gameStart, gameVote, } from "./game.js";
describe("gameCountPlayersInGame", () => {
    beforeEach(() => {
        // clear games
        games.clear();
    });
    it("should return the correct number of players from a players object", () => {
        const defaultPlayer = {
            name: "name",
            inGame: true,
            isUndercover: false,
            wins: 0,
            score: 0,
            hasVoted: false,
        };
        // create a players object
        const players = {
            player1Id: {
                ...defaultPlayer,
                name: "player1Name",
            },
            player2Id: {
                ...defaultPlayer,
                name: "player2Name",
            },
            player3Id: {
                ...defaultPlayer,
                name: "player3Name",
            },
            player4Id: {
                ...defaultPlayer,
                name: "player4Name",
                inGame: false,
            },
        };
        // count the number of players in the players object
        const playersInGame = countPlayersInGame(players);
        // expect the number of players in the players object to be 3
        expect(playersInGame).toBe(3);
    });
    it("should return the correct number of players from a game object", () => {
        // create a game with 5 players
        gameCreate("gameId", "hostId", "hostName");
        gameAddPlayer("gameId", "player1Id", "player1Name");
        gameAddPlayer("gameId", "player2Id", "player2Name");
        gameAddPlayer("gameId", "player3Id", "player3Name");
        gameAddPlayer("gameId", "player4Id", "player4Name");
        // start the game
        const game = gameStart("hostId", "gameId", null, 1);
        if (game === null) {
            fail("failed to start game");
        }
        // count the number of players in the game
        const playersInGame = countPlayersInGame(game.players);
        // expect the number of players in the game to be 5
        expect(playersInGame).toBe(5);
        // eliminate a player
        gameVote("gameId", "hostId", "player4Id");
        gameVote("gameId", "player1Id", "player4Id");
        gameVote("gameId", "player2Id", "player4Id");
        gameVote("gameId", "player3Id", "player4Id");
        gameVote("gameId", "player4Id", "player1Id");
        // get the game
        const game2 = games.get("gameId");
        if (game2 === undefined) {
            fail("failed to get game");
        }
        // count the number of players in the game
        const playersInGame2 = countPlayersInGame(game2.players);
        // expect the number of players in the game to be 4
        expect(playersInGame2).toBe(4);
    });
});
//# sourceMappingURL=gameUtils.test.js.map