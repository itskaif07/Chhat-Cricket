export interface Stats {

  // GENERAL

  matches: number;
  innings: number;
  notOuts: number;

  
  // BATTING

  runs: number;
  highestScore: number;
  ballsFaced: number;
  battingAverage: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;


  // BOWLING

  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  bowlingAverage: number;
  economy: number;
  maidens: number;
  bestFigures: string;

}