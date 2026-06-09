import { Player } from './player.model';

export interface PlayerStats {
  playerId: string;

  playerName: string;

  playerPhoto: string;

  matches: number;

  innings: number;

  runs: number;

  ballsDelivered: number;

  wickets: number;

  ballsFaced: number;

  fours: number;

  sixes: number;

  runsConceded: number;

  dismissalType: 'caught' | 'bowled' | 'offside' | null;

  dismissedBy: string;

  caughtBy?: Player | null;

  hatTricks: number;

  fifty: number;

  hundred: number;

  maiden: number;

  fifer: number;

  hasScoredFifty: boolean;

  hasScoredHundred: boolean;
}
