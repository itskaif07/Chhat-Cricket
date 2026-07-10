import { Injectable } from '@angular/core';
import { Player } from '../../shared/models/player.model';

@Injectable({
  providedIn: 'root',
})
export class MatchSetupService {
  teamA: Player[] = [];
  teamB: Player[] = [];
  teamACaptain: Player | null = null;
  teamBCaptain: Player | null = null;
  tossWinner: 'A' | 'B' | '' = '';
  firstBattingTeam: 'A' | 'B' | '' = '';
  firstBowlingTeam: 'A' | 'B' | '' = '';

  selectedPlayers: Player[] = [];

  setMatchTossWinner(team: 'A' | 'B' | '') {
    this.tossWinner = team;
  }

  setFirstBattingTeam(team: 'A' | 'B' | '') {
    this.firstBattingTeam = team;
  }

  setFirstBowlingTeam(team: 'A' | 'B' | '') {
    this.firstBowlingTeam = team;
  }

  setTeams(teamA: Player[], teamB: Player[]) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.teamACaptain = teamA[0] || null;
    this.teamBCaptain = teamB[0] || null;

    this.selectedPlayers = [...teamA, ...teamB];
  }

  restoreTeams(
    teamA: Player[],
    teamB: Player[],
    teamACaptain: Player | null,
    teamBCaptain: Player | null,
  ) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.teamACaptain = teamACaptain || teamA[0] || null;
    this.teamBCaptain = teamBCaptain || teamB[0] || null;
    this.tossWinner = '';
    this.firstBattingTeam = '';
    this.firstBowlingTeam = '';

    this.selectedPlayers = [...teamA, ...teamB];
  }

  updateTeams(teamA: Player[], teamB: Player[]) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.selectedPlayers = [...teamA, ...teamB];
  }


  getTeamA() {
    return this.teamA;
  }

  getTeamB() {
    return this.teamB;
  }

  getTeamACaptain() {
    return this.teamACaptain;
  }

  getTeamBCaptain() {
    return this.teamBCaptain;
  }

  getSelectedPlayers() {
    return this.selectedPlayers;
  }
}
