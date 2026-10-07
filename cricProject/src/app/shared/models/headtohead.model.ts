import { Player } from "./player.model";

export interface HeadToHeadSelection{
    batsman: Player | null,
    bowler: Player | null
}

export interface HeadToHeadStats {
    innings: number;

    // Batsman
    balls: number;
    runs: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    battingAverage: number;

    // Bowler
    runsConceded: number;
    wickets: number;
    economy: number;
    bowlingStrikeRate: number;
    bowlingAverage: number;

    dismissalTypes: {
        bowled: number;
        caught: number;
        offside: number;
    };
}