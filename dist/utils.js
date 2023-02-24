export const log = (from, message) => {
    const fromPad = `[${from}]`.padEnd(12, " ");
    console.log(`${fromPad}${message}`);
};
export const wordPairsEng = [
    ["aardvark", "ant"],
    ["communist", "capitalist"],
];
export const wordPairs = [
    ["myrslok", "myra"],
    ["katt", "hund"],
    ["kommunist", "kapitalist"],
    ["fidel castro", "donald trump"],
    ["kalle anka", "musse pigg"],
    ["carpe diem", "yolo"],
    ["kaffe", "cola-zero"],
    ["kroatien", "serbien"],
    ["sverige", "danmark"],
    ["glögg", "julmust"],
    ["guld", "silver"],
    ["snus", "cigg"],
    ["tyskland", "österrike"],
    ["armbågar", "knän"],
];
export const getRandomWords = () => {
    // get random word pair
    const randomIndex = Math.floor(Math.random() * wordPairs.length);
    const randomWordPair = wordPairs[randomIndex];
    // randomize word order
    const randomWordOrder = Math.random() < 0.5 ? 0 : 1;
    const common = randomWordPair[randomWordOrder];
    const undercover = randomWordPair[1 - randomWordOrder];
    return {
        common,
        undercover,
    };
};
export const shuffleArray = (array) => {
    // Fisher-Yates shuffle
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
};
export const generateChordMatrix = (votes) => {
    // creates a matrix of votes
    // for use with d3-chord
    // [
    //   [0, 1, 0, 0],
    //   [1, 0, 0, 0],
    //   [0, 0, 0, 1],
    //   [0, 0, 1, 0],
    // ]
    // where the rows and columns are ordered by playerId
    // and the value at [i][j] is the number of votes from playerId i to playerId j
    const matrix = [];
    const voteCountsPerPlayer = {};
    // Count votes
    votes.forEach((vote) => {
        // Count votes by each player
        Object.keys(vote).forEach((playerId) => {
            const voteForId = vote[playerId];
            if (!voteCountsPerPlayer[playerId]) {
                voteCountsPerPlayer[playerId] = {};
            }
            if (!voteCountsPerPlayer[playerId][voteForId]) {
                voteCountsPerPlayer[playerId][voteForId] = 0;
            }
            voteCountsPerPlayer[playerId][voteForId]++;
        });
    });
    console.log(voteCountsPerPlayer);
    // Create matrix
    const playerIds = Object.keys(voteCountsPerPlayer);
    playerIds.forEach((playerId) => {
        const voteCounts = voteCountsPerPlayer[playerId];
        const row = [];
        playerIds.forEach((otherPlayerId) => {
            const voteCount = voteCounts[otherPlayerId] || 0;
            row.push(voteCount);
        });
        matrix.push(row);
    });
    console.log(matrix);
    return matrix;
};
export const generateChordData = (votes) => {
    const data = [];
    const voteCountsPerPlayer = {};
    // Count votes
    votes.forEach((voteObject) => {
        // Count votes by each player
        Object.keys(voteObject).forEach((playerId) => {
            const voteForId = voteObject[playerId];
            if (!voteCountsPerPlayer[playerId]) {
                voteCountsPerPlayer[playerId] = {};
            }
            if (!voteCountsPerPlayer[playerId][voteForId]) {
                voteCountsPerPlayer[playerId][voteForId] = 0;
            }
            voteCountsPerPlayer[playerId][voteForId]++;
        });
    });
    console.log(voteCountsPerPlayer);
    // Create data
    Object.entries(voteCountsPerPlayer).forEach(([playerId, voteCounts]) => {
        Object.entries(voteCounts).forEach(([voteForId, voteCount]) => {
            data.push({
                source: playerId,
                target: voteForId,
                value: voteCount,
            });
        });
    });
    console.log(data);
    return data;
};
//# sourceMappingURL=utils.js.map