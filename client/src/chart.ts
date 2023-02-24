import * as d3 from "d3";
import { Game } from "./types";

export const generateChordMatrix = (votes: { [id: string]: string }[]) => {
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

  const matrix: number[][] = [];
  const voteCountsPerPlayer: { [id: string]: { [voteForId: string]: number } } =
    {};

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
    const row: number[] = [];
    playerIds.forEach((otherPlayerId) => {
      const voteCount = voteCounts[otherPlayerId] || 0;
      row.push(voteCount);
    });
    matrix.push(row);
  });

  console.log(matrix);
  return matrix;
};

export const generateChordData = (votes: { [id: string]: string }[]) => {
  const data: { source: string; target: string; value: number }[] = [];
  const voteCountsPerPlayer: { [id: string]: { [voteForId: string]: number } } =
    {};

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

export const drawChart = (game: Game) => {
  if (!game) return;
  if (!game.chordData) return;

  const height = 300;
  const width = 300;
  const innerRadius = Math.min(width, height) * 0.5 - 40;
  const outerRadius = innerRadius + 10;
  const colors = [
    "#440154ff",
    "#31668dff",
    "#37b578ff",
    "#ae017eff",
    "#7f3b08ff",
    "#b35806ff",
    "#f1a340ff",
    "#8073acff",
    "#542788ff",
    "#dd3497ff",
    "#7a0177ff",
    "#49006aff",
    "#f768a1ff",
    "#7f3b08ff",
  ];

  // get player ids from chord data
  const playerIds = Array.from(
    new Set(game.chordData.flatMap((d) => [d.source, d.target]))
  );
  // get player names from player ids
  const playerNames = playerIds.map((id) => game.players[id].name);

  // create matrix
  const index = new Map(playerIds.map((name, i) => [name, i]));
  const matrix = Array.from(index, () => new Array(playerIds.length).fill(0));
  for (const { source, target, value } of game.chordData) {
    if (source === undefined && target === undefined && value === undefined)
      continue;
    const i = index.get(source);
    const j = index.get(target);
    if (i === undefined || j === undefined) continue;
    matrix[i][j] += value;
  }

  // ribbon
  const ribbon = d3
    .ribbonArrow()
    .headRadius(45)
    .radius(innerRadius)
    .padAngle(0);

  // arc
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  // chord chart
  const chord = d3
    .chordDirected()
    .padAngle(10 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)(matrix);

  // clear old chart
  d3.select("#my_dataviz").selectAll("svg").remove();

  // create new chart
  const svg = d3
    .select("#chord_chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // draw arcs
  svg
    .datum(chord)
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .append("g")
    .selectAll("g")
    .data(function (d) {
      return d.groups;
    })
    .join("g")
    .append("path")
    .style("fill", (_, i) => colors[i])
    .style("stroke", (_, i) => colors[i])
    .attr("id", function (d) {
      return "group" + d.index;
    })
    // @ts-ignore
    .attr("d", arc);

  // draw text
  svg
    .selectAll("g")
    .append("text")
    .attr("x", 10)
    .attr("dy", -15)
    .append("textPath")
    .attr("xlink:href", (_, i) => "#group" + i)
    .text((_, i) => playerNames[i])
    .style("fill", (_, i) => colors[i]);

  // draw ribbons
  svg
    .datum(chord)
    .append("g")
    .selectAll("path")
    .data((d) => d)
    .join("path")
    // @ts-ignore
    .attr("d", ribbon)
    .style("fill", (d) => colors[d.source.index])
    .style("opacity", 0.8)
    .style("mix-blend-mode", "normal");
};
